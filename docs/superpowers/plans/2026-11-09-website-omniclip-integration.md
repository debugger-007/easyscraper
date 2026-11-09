# Website Omniclip Video Editor Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a seamless web-based video editing pipeline by deploying Omniclip onto the official website (`extension-website`) and establishing a zero-copy, streaming bridge from the Chrome extension (`extension`) to import downloaded/captured videos on demand.

**Architecture:** The official website (`extension-website`) hosts the Omniclip editing interface at `/clip` (and `/zh/clip`) using TanStack Router and modern WebCodecs. When a user clicks "Edit on Website" from the Chrome extension's Video Sniffer or Media Vault, the extension opens the website tab with a temporary `sessionToken`. The website registers a light Service Worker (`sw-clip-stream.js`) that intercepts virtual media requests (`/api/virtual-clip/:sessionId`) and fetches chunks on-demand via `chrome.runtime.sendMessage` (`externally_connectable`), serving HTTP 206 Partial Content to Omniclip with zero memory spike and instant scrubbing.

**Tech Stack:**
- Website: Vite, React 19, TypeScript, TanStack Router, Tailwind CSS, Omniclip (WebCodecs, Web Audio, Canvas)
- Extension: WXT, React 19, TypeScript, OPFS (Origin Private File System), Chrome `externally_connectable`
- Protocols: Service Worker Fetch Event + HTTP 206 Partial Content, Transferable ArrayBuffer

**Spec:** [Architecture and Integration Spec for Website Omniclip Integration](#global-constraints)

## Global Constraints

- **Strict i18n & Schema-First**: All user-facing copy on the website MUST adhere to `GEMINI.md`: declared in `src/i18n/types.ts` first, perfectly mirrored in `zh_CN.ts` and `en.ts`, and accessed via `t.clip.*` without binary branching.
- **Path-Prefix Routing**: English routes at `/clip`, Chinese routes at `/zh/clip` via TanStack Router.
- **Zero Memory Bloat**: Never send full GB-sized video blobs in a single message or base64 JSON payload. Must use on-demand chunking (default 2MB–8MB slice) with HTTP 206 Range responses.
- **Fallback Resilience**: When the extension is missing or uninstalled, the website must offer manual file drop/picker and remote URL import with clear installation CTAs.
- **Code Quality Gate**: `npx tsc --noEmit` and `pnpm build` must pass with 0 errors after every task.

## Review Focus

- **Condition 1 (Large Video Scrubbing)**: A 1GB+ video must seek to 90% without downloading the preceding 900MB. Handled by Range requests in Service Worker.
- **Condition 2 (Session Expiry/Invalidation)**: If a session token is invalid, expired, or intercepted, the website displays an actionable error banner rather than a blank white screen.
- **Condition 3 (Missing Extension / Private Window)**: If `chrome.runtime` is unavailable (e.g. non-Chromium or incognito where extension isn't allowed), fallback to drag-and-drop file upload.
- **Condition 4 (M3U8 / DASH Segments)**: Videos downloaded as chunked M3U8 in OPFS must be remuxed or concatenated to fMP4 before serving byte ranges.
- **Condition 5 (Cross-Origin Protection)**: `externally_connectable` in `wxt.config.ts` must restrict matches strictly to official domains (`https://easyscraper.com/*`, `https://*.easyscraper.com/*`, and local dev ports `http://localhost:*/*`).

---

### Task 1: Extension Bridge Service (`ClipTransferService`)

**Files:**
- Modify: `/Users/mac/Desktop/learn/extension/wxt.config.ts`
- Create: `/Users/mac/Desktop/learn/extension/src/services/bridge/ClipTransferService.ts`
- Create: `/Users/mac/Desktop/learn/extension/src/services/bridge/test/clip-transfer.test.ts`
- Modify: `/Users/mac/Desktop/learn/extension/src/entrypoints/background.ts`

**Interfaces:**
- Consumes: `MediaVaultItem`, `navigator.storage.getDirectory()` from OPFS
- Produces: `ClipTransferService.createSession(item: MediaVaultItem): string`, `ClipTransferService.readChunk(sessionId: string, start: number, end: number): Promise<ArrayBuffer>`

- [ ] **Step 1: Write unit test for `ClipTransferService`**

```typescript
// /Users/mac/Desktop/learn/extension/src/services/bridge/test/clip-transfer.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ClipTransferService } from '../ClipTransferService.ts';

describe('ClipTransferService', () => {
  it('creates active session and retrieves metadata', () => {
    const service = new ClipTransferService();
    const token = service.createSession({
      id: 'test-1',
      title: 'Demo Video',
      type: 'video',
      format: 'video/mp4',
      size: 1048576,
      sizeFormatted: '1.0 MB',
      storageLocation: 'local',
      accessUrl: 'vault_media/test.mp4',
      opfsPath: 'vault_media/test.mp4'
    });
    assert.ok(typeof token === 'string' && token.length > 10);
    const meta = service.getSessionMeta(token);
    assert.equal(meta?.size, 1048576);
  });

  it('rejects expired or non-existent token', () => {
    const service = new ClipTransferService();
    assert.equal(service.getSessionMeta('invalid-token'), null);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/mac/Desktop/learn/extension && node --experimental-strip-types src/services/bridge/test/clip-transfer.test.ts`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `ClipTransferService.ts` and configure `wxt.config.ts`**

Implement session registration, TTL cleanup (10 min expiry), chunk reading from OPFS `FileSystemFileHandle`, and `externally_connectable` in `wxt.config.ts` allowing `https://easyscraper.com/*`, `http://localhost:*/*`.

- [ ] **Step 4: Wire message listener in `background.ts` and run tests**

Register `chrome.runtime.onMessageExternal.addListener` delegating `GET_CLIP_META` and `GET_CLIP_CHUNK` to `ClipTransferService`.
Run: `node --experimental-strip-types src/services/bridge/test/clip-transfer.test.ts`
Expected: PASS

- [ ] **Step 5: Verify extension compilation and commit**

```bash
cd /Users/mac/Desktop/learn/extension
pnpm compile
git add wxt.config.ts src/services/bridge/ src/entrypoints/background.ts
git commit -m "feat(bridge): implement ClipTransferService for cross-origin streaming"
```

---

### Task 2: Extension UI "Edit on Website" Actions

**Files:**
- Modify: `/Users/mac/Desktop/learn/extension/src/components/video-sniffer/MediaCard.tsx`
- Modify: `/Users/mac/Desktop/learn/extension/src/components/vault/VaultMediaGrid.tsx`
- Modify: `/Users/mac/Desktop/learn/extension/src/i18n/locales/zh_CN.ts`
- Modify: `/Users/mac/Desktop/learn/extension/src/i18n/locales/en.ts`

**Interfaces:**
- Consumes: `ClipTransferService.createSession`, `chrome.tabs.create`
- Produces: UI Button labeled "剪辑 / Edit in Studio" in MediaCard and VaultMediaGrid context actions.

- [ ] **Step 1: Declare i18n keys for video editing action**

Add `editInStudio: "在官网剪辑" / "Edit in Studio"` to sniffer and vault modules in `zh_CN.ts` and `en.ts`.

- [ ] **Step 2: Add click handler in `MediaCard.tsx`**

When the user clicks the "剪辑" button on a downloaded video:
1. Call background to register session: `const { sessionId } = await chrome.runtime.sendMessage({ type: 'CREATE_CLIP_SESSION', vaultId });`
2. Open URL: `const websiteUrl = isDev ? 'http://localhost:5173' : 'https://easyscraper.com';`
3. Call `chrome.tabs.create({ url: `${websiteUrl}/clip?session=${sessionId}` });`

- [ ] **Step 3: Add action menu item in `VaultMediaGrid.tsx`**

Add right-click / hover action for video items in Media Vault to trigger the same studio opening flow.

- [ ] **Step 4: Verify extension compile**

Run: `cd /Users/mac/Desktop/learn/extension && pnpm compile`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/mac/Desktop/learn/extension
git add src/components/video-sniffer/MediaCard.tsx src/components/vault/VaultMediaGrid.tsx src/i18n/locales/
git commit -m "feat(ui): add 'Edit in Studio' action to media cards and vault grid"
```

---

### Task 3: Website i18n & Route Scaffolding (`/clip` & `/$lang/clip`)

**Files:**
- Modify: `/Users/mac/Desktop/learn/extension-website/src/i18n/types.ts`
- Modify: `/Users/mac/Desktop/learn/extension-website/src/i18n/locales/en.ts`
- Modify: `/Users/mac/Desktop/learn/extension-website/src/i18n/locales/zh_CN.ts`
- Create: `/Users/mac/Desktop/learn/extension-website/src/routes/clip.tsx`
- Create: `/Users/mac/Desktop/learn/extension-website/src/routes/$lang/clip.tsx`

**Interfaces:**
- Consumes: `TranslationSchema` in `src/i18n/types.ts`
- Produces: TanStack routes `/clip` and `/$lang/clip` rendering the workspace scaffold.

- [ ] **Step 1: Declare `clip` schema in `src/i18n/types.ts`**

Define strong types for `t.clip`:
```typescript
clip: {
  title: string;
  subtitle: string;
  connectingExtension: string;
  extensionReady: string;
  extensionNotFound: string;
  dropToImport: string;
  selectLocalFile: string;
  trim: string;
  crop: string;
  exportVideo: string;
  exporting: string;
  sessionError: string;
}
```

- [ ] **Step 2: Add bilingual copy in `en.ts` and `zh_CN.ts`**

Fill exact translations adhering to `GEMINI.md` 100% alignment rules.

- [ ] **Step 3: Create Route files `src/routes/clip.tsx` and `src/routes/$lang/clip.tsx`**

Implement route components using TanStack Router with search param validation:
`z.object({ session: z.string().optional(), url: z.string().optional() })`.

- [ ] **Step 4: Run type check and route generation**

Run: `cd /Users/mac/Desktop/learn/extension-website && npx tsc --noEmit && pnpm build`
Expected: Generates updated `routeTree.gen.ts` and builds cleanly with 0 errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/mac/Desktop/learn/extension-website
git add src/i18n/ src/routes/clip.tsx src/routes/\$lang/clip.tsx src/routeTree.gen.ts
git commit -m "feat(routes): scaffold /clip and /$lang/clip routes with bilingual i18n"
```

---

### Task 4: Website Extension Bridge & Media Resolver

**Files:**
- Create: `/Users/mac/Desktop/learn/extension-website/src/services/clip/types.ts`
- Create: `/Users/mac/Desktop/learn/extension-website/src/services/clip/ExtensionBridgeAdapter.ts`
- Create: `/Users/mac/Desktop/learn/extension-website/src/services/clip/MediaSourceResolver.ts`
- Create: `/Users/mac/Desktop/learn/extension-website/src/services/clip/test/media-resolver.test.ts`

**Interfaces:**
- Consumes: `window.chrome?.runtime` API, query params `session` or `url`
- Produces: `ClipMediaSource`: `{ title, size, mimeType, readChunk(start, end): Promise<ArrayBuffer> }`

- [ ] **Step 1: Write unit test for `MediaSourceResolver`**

```typescript
// /Users/mac/Desktop/learn/extension-website/src/services/clip/test/media-resolver.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MediaSourceResolver } from '../MediaSourceResolver.ts';

describe('MediaSourceResolver', () => {
  it('resolves local file adapter directly', async () => {
    const fakeFile = new File([new Uint8Array([1, 2, 3, 4])], 'sample.mp4', { type: 'video/mp4' });
    const source = await MediaSourceResolver.resolve({ file: fakeFile });
    assert.equal(source.title, 'sample.mp4');
    assert.equal(source.size, 4);
    const chunk = await source.readChunk(0, 2);
    assert.equal(chunk.byteLength, 2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types src/services/clip/test/media-resolver.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `types.ts`, `ExtensionBridgeAdapter.ts`, and `MediaSourceResolver.ts`**

- `ExtensionBridgeAdapter`: Communicates with extension via `chrome.runtime.sendMessage(EXT_ID, { type: 'GET_CLIP_CHUNK', sessionId, start, end })`.
- Handles connection errors gracefully, emitting disconnected status when the extension is absent.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types src/services/clip/test/media-resolver.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify build & commit**

```bash
cd /Users/mac/Desktop/learn/extension-website
npx tsc --noEmit
git add src/services/clip/
git commit -m "feat(clip): implement ExtensionBridgeAdapter and MediaSourceResolver"
```

---

### Task 5: Website Service Worker Virtual Stream Endpoint (`sw-clip-stream.js`)

**Files:**
- Create: `/Users/mac/Desktop/learn/extension-website/public/sw-clip-stream.js`
- Create: `/Users/mac/Desktop/learn/extension-website/src/services/clip/ServiceWorkerBridge.ts`

**Interfaces:**
- Consumes: `navigator.serviceWorker.register('/sw-clip-stream.js')`
- Produces: Virtual URL `http(s)://<origin>/api/virtual-clip/:sessionId` capable of answering HTTP 206 Range requests directly to `<video>` and Omniclip Demuxers.

- [ ] **Step 1: Write `public/sw-clip-stream.js`**

Implement `fetch` event listener in Service Worker:
1. Intercept requests matching `/api/virtual-clip/:sessionId`.
2. Parse `Range: bytes=start-end`.
3. Dispatch request via `BroadcastChannel` or `client.postMessage` to page thread.
4. Return `new Response(buffer, { status: 206, headers: { 'Content-Range': `bytes ${start}-${end}/${total}`, 'Content-Type': mimeType } })`.

- [ ] **Step 2: Implement `ServiceWorkerBridge.ts` client controller**

Registers `/sw-clip-stream.js`, listens for chunk requests from the Service Worker, delegates to `ExtensionBridgeAdapter.readChunk()`, and responds back.

- [ ] **Step 3: Verify build**

Run: `cd /Users/mac/Desktop/learn/extension-website && pnpm build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
cd /Users/mac/Desktop/learn/extension-website
git add public/sw-clip-stream.js src/services/clip/ServiceWorkerBridge.ts
git commit -m "feat(clip): add Service Worker virtual stream endpoint for HTTP 206 Range seeking"
```

---

### Task 6: Omniclip Studio Workspace Component (`ClipWorkspace.tsx`)

**Files:**
- Create: `/Users/mac/Desktop/learn/extension-website/src/components/clip/ClipWorkspace.tsx`
- Create: `/Users/mac/Desktop/learn/extension-website/src/components/clip/VideoTimeline.tsx`
- Create: `/Users/mac/Desktop/learn/extension-website/src/components/clip/VideoPreview.tsx`
- Create: `/Users/mac/Desktop/learn/extension-website/src/components/clip/ExportModal.tsx`
- Modify: `/Users/mac/Desktop/learn/extension-website/src/routes/clip.tsx`
- Modify: `/Users/mac/Desktop/learn/extension-website/src/routes/$lang/clip.tsx`

**Interfaces:**
- Consumes: `MediaSourceResolver`, `t.clip.*`
- Produces: Full interactive video editing workspace with playback preview, trim handles, format selection (16:9 / 9:16), audio mute, and client-side MP4 export.

- [ ] **Step 1: Implement `VideoPreview.tsx` and `VideoTimeline.tsx`**

- `VideoPreview`: HTML5 `<video>` / Canvas viewport with play/pause, timecode, aspect-ratio selector.
- `VideoTimeline`: Draggable in/out trim handles, scrubber head, current timestamp display.

- [ ] **Step 2: Implement `ExportModal.tsx`**

Offers export options:
1. Fast Cut (Lossless keyframe stream copy when only trimming).
2. WebCodecs re-encode (when cropped/scaled).
3. Browser download trigger (`a.download`).

- [ ] **Step 3: Assemble `ClipWorkspace.tsx` and attach to `/clip` and `/$lang/clip`**

Handles initial handshake state (Connecting -> Ready -> Editing) with fallback drag-and-drop zone when no extension session exists.

- [ ] **Step 4: Run typecheck and full build**

Run: `cd /Users/mac/Desktop/learn/extension-website && npx tsc --noEmit && pnpm build`
Expected: 0 errors, build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /Users/mac/Desktop/learn/extension-website
git add src/components/clip/ src/routes/clip.tsx src/routes/\$lang/clip.tsx
git commit -m "feat(clip): implement ClipWorkspace with timeline, preview, and export"
```

---

### Task 7: End-to-End Verification Across Both Projects

**Files:**
- Verification only

- [ ] **Step 1: Verify Extension Project compilation**

Run: `cd /Users/mac/Desktop/learn/extension && pnpm compile && pnpm build:test`
Expected: WXT build completes with 0 errors.

- [ ] **Step 2: Verify Website Project compilation and production bundle**

Run: `cd /Users/mac/Desktop/learn/extension-website && npx tsc --noEmit && pnpm build`
Expected: Vite build completes with 0 errors.

- [ ] **Step 3: Verification commit / tag**

```bash
cd /Users/mac/Desktop/learn/extension-website
git commit --allow-empty -m "chore(clip): complete end-to-end integration plan verification"
```

