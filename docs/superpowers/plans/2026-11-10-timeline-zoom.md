# Timeline Zoom & Precision Scrubbing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build interactive timeline horizontal zoom (1x to 4x) with precision scrubbing, dynamic ruler graduation, viewport auto-scroll during playback, and zoom-anchored focus in Omniclip Studio.

**Architecture:** Extend `VideoTimeline.tsx` and `clipUtils.ts` with zoom state management (`zoomLevel`: 1.0x to 4.0x) and dynamic tick graduation algorithms. Wrap the timeline track in an overflow-x scroll container whose width expands proportionally (`width: ${zoomLevel * 100}%`), while updating coordinate math `getTimeFromEvent` with `scrollLeft` offsets. Maintain a bounded thumbnail count to prevent canvas memory/decoding bottlenecks, and add a zoom controller widget into the timeline toolbar.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS, Lucide React icons, Node.js Test Runner (`node:test`).

**Spec:** Inline design spec for timeline zoom & precision editing.

## Global Constraints

- **Strict i18n Rules**: Zero hardcoded strings in UI. Schema-first in `src/i18n/types.ts`, and 100% paired entries in `src/i18n/locales/zh_CN.ts` and `src/i18n/locales/en.ts`.
- **Zero Auto-Commit**: Never run `git commit` or `git push` without explicit user command.
- **Type Safety & Build**: Must pass `npx tsc --noEmit` and `pnpm build` with 0 warnings/errors.
- **Test Integrity**: Must pass `node --test src/components/clip/test/clip-utils.test.ts`.

## Review Focus

1. **Zoom anchor drift**: When zooming in at time `t`, the viewport's `scrollLeft` must adjust so that time `t` (cursor or playhead) remains visually centered in the view instead of jumping.
2. **Scrubbing & Trim drag with scroll offset**: When the timeline is scrolled right (`scrollLeft > 0`), dragging the playhead or Trim In/Out handles must accurately compute the target time without jumping by `scrollLeft` pixels.
3. **Floating hover preview boundary**: The hover tooltip pill must translate based on the scrolled track position and not get clipped by `overflow-x: auto`.
4. **Auto-scroll during playback**: When playing at 2x~4x zoom, if the playhead crosses into the rightmost 15% of the viewport, the scroll container smoothly advances to keep the playhead in sight.
5. **Decoupled thumbnail count**: Zooming to 4x must NOT extract 4x more video thumbnails (which triggers browser video decoding stutter and memory bloat); it scales existing sampled filmstrip frames cleanly.

---

### Task 1: Mathematical Utilities for Dynamic Ruler Marks & Zoom Calculation

**Files:**
- Modify: `src/components/clip/clipUtils.ts`
- Test: `src/components/clip/test/clip-utils.test.ts`

**Interfaces:**
- Consumes: `duration: number`, `zoomLevel: number`, `containerWidth?: number`
- Produces:
  ```typescript
  export interface RulerTick {
    time: number;
    percent: number;
    label: string;
    isMajor: boolean;
  }
  export function calculateRulerTicks(duration: number, zoomLevel: number): RulerTick[];
  ```

- [ ] **Step 1: Write the failing tests for `calculateRulerTicks`**

In `src/components/clip/test/clip-utils.test.ts`, add test cases for `calculateRulerTicks`:
```typescript
it('calculates adaptive ruler ticks based on zoom level', () => {
  // At 1x zoom (Fit), ticks are spaced widely (e.g. 8-10 major marks)
  const fitTicks = calculateRulerTicks(60, 1);
  assert.ok(fitTicks.length >= 5 && fitTicks.length <= 15);
  assert.equal(fitTicks[0].time, 0);

  // At 4x zoom, tick density increases proportionally
  const zoomTicks = calculateRulerTicks(60, 4);
  assert.ok(zoomTicks.length > fitTicks.length);
  assert.equal(zoomTicks[0].percent, 0);
  assert.ok(zoomTicks.every(t => t.time >= 0 && t.time <= 60));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/components/clip/test/clip-utils.test.ts`
Expected: FAIL with `calculateRulerTicks is not defined`

- [ ] **Step 3: Implement `calculateRulerTicks` in `src/components/clip/clipUtils.ts`**

Define `RulerTick` interface and implement `calculateRulerTicks(duration: number, zoomLevel: number): RulerTick[]`.
Select the step size from a human-readable interval table `[0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600]` based on `duration / (8 * zoomLevel)`. Format labels with `formatTimecode(time, false)` or `formatTimecode(time, true)` if step < 1s.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/components/clip/test/clip-utils.test.ts`
Expected: PASS 6/6 tests

---

### Task 2: Internationalization Keys for Zoom Controls

**Files:**
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/locales/zh_CN.ts`
- Modify: `src/i18n/locales/en.ts`

**Interfaces:**
- Consumes: `TranslationSchema.clip`
- Produces:
  ```typescript
  zoomLevel: string;
  zoomIn: string;
  zoomOut: string;
  zoomFit: string;
  ```

- [ ] **Step 1: Declare zoom translation keys in `src/i18n/types.ts`**

Add inside `TranslationSchema.clip`:
```typescript
zoomLevel: string;
zoomIn: string;
zoomOut: string;
zoomFit: string;
```

- [ ] **Step 2: Add Chinese translations in `src/i18n/locales/zh_CN.ts`**

Under `clip`:
```typescript
zoomLevel: '缩放比例',
zoomIn: '放大时间轴',
zoomOut: '缩小时间轴',
zoomFit: '适应窗口',
```

- [ ] **Step 3: Add English translations in `src/i18n/locales/en.ts`**

Under `clip`:
```typescript
zoomLevel: 'Timeline Zoom',
zoomIn: 'Zoom In',
zoomOut: 'Zoom Out',
zoomFit: 'Fit to Window',
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 3: Timeline Horizontal Scroll & Zoom Controller Component

**Files:**
- Modify: `src/components/clip/VideoTimeline.tsx`

**Interfaces:**
- Consumes:
  - `zoomLevel`: state (defaults to `1.0`, range `1.0` to `4.0`, step `0.5`)
  - `scrollContainerRef: React.RefObject<HTMLDivElement | null>`
  - `calculateRulerTicks(duration, zoomLevel)`
- Produces:
  - Zoom tool group in top bar: `[ - ] [ 100% ] [ + ] [ Fit ]`
  - Scroll container wrapper `<div ref={scrollContainerRef} className="overflow-x-auto ...">`
  - Dynamic track width: `style={{ width: `${zoomLevel * 100}%`, minWidth: '100%' }}`
  - Updated `getTimeFromEvent` supporting `scrollLeft`:
    ```typescript
    const getTimeFromEvent = useCallback(
      (clientX: number): number => {
        if (!trackRef.current || !scrollContainerRef.current) return 0;
        const rect = trackRef.current.getBoundingClientRect();
        // clientX - rect.left is the offset within the visible track bounds;
        // rect.width is the full stretched width of the track
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const ratio = rect.width > 0 ? x / rect.width : 0;
        return ratio * validDuration;
      },
      [validDuration]
    );
    ```

- [ ] **Step 1: Add Zoom state and Zoom Control buttons in `VideoTimeline.tsx`**

1. Add `const [zoomLevel, setZoomLevel] = useState<number>(1.0);`
2. Add `const scrollContainerRef = useRef<HTMLDivElement | null>(null);`
3. Add zoom helper handlers:
   - `handleZoomIn = () => setZoomLevel(prev => Math.min(4.0, Number((prev + 0.5).toFixed(1))))`
   - `handleZoomOut = () => setZoomLevel(prev => Math.max(1.0, Number((prev - 0.5).toFixed(1))))`
   - `handleZoomFit = () => setZoomLevel(1.0)`
4. Render UI buttons next to In/Out buttons in the top bar with tooltips and zoom percentage pill (`100%`, `150%`, `200%`, `300%`, `400%`).

- [ ] **Step 2: Wrap Main Timeline in Horizontal Scroll Container**

1. Wrap the ruler and scrubber in `<div ref={scrollContainerRef} className="overflow-x-auto overflow-y-visible custom-scrollbar select-none ...">`.
2. Set inner timeline track width to `style={{ width: `${zoomLevel * 100}%`, minWidth: '100%' }}`.
3. Replace hardcoded `rulerMarks` with `calculateRulerTicks(validDuration, zoomLevel)`.

- [ ] **Step 3: Verify TypeScript and Build**

Run: `npx tsc --noEmit && pnpm build`
Expected: 0 errors, build succeeds

---

### Task 4: Viewport Anchoring & Auto-Scroll Follow Behavior

**Files:**
- Modify: `src/components/clip/VideoTimeline.tsx`

**Interfaces:**
- Consumes: `currentTime`, `isPlaying`, `zoomLevel`, `scrollContainerRef`
- Produces:
  - Smooth anchor centering on zoom change
  - Playhead auto-scroll when reaching viewport edge during playback

- [ ] **Step 1: Implement Zoom Anchor Preservation**

When `zoomLevel` changes, retain the current playhead or viewport center position so the user does not get disoriented:
```typescript
const prevZoomRef = useRef(zoomLevel);
useEffect(() => {
  const container = scrollContainerRef.current;
  const track = trackRef.current;
  if (!container || !track || prevZoomRef.current === zoomLevel) return;

  const oldRatio = prevZoomRef.current;
  const newRatio = zoomLevel;
  prevZoomRef.current = zoomLevel;

  // Center around current playhead
  const currentRatio = currentTime / validDuration;
  const newScrollLeft = currentRatio * (container.scrollWidth) - container.clientWidth / 2;
  container.scrollTo({ left: Math.max(0, newScrollLeft), behavior: 'smooth' });
}, [zoomLevel, currentTime, validDuration]);
```

- [ ] **Step 2: Implement Auto-Scroll During Playback**

When `isPlaying` is true and `zoomLevel > 1.0`:
If the playhead moves past 85% of the visible container width, automatically scroll container rightward to keep the playhead visible.

- [ ] **Step 3: Verification of all tests and build**

Run:
1. `node --test src/components/clip/test/clip-utils.test.ts`
2. `npx tsc --noEmit`
3. `pnpm build`

Expected: All tests pass, build succeeds with 0 errors.

