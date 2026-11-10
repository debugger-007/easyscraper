import { describe, it, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { ServiceWorkerBridge } from '../ServiceWorkerBridge.ts';
import { ExtensionBridgeAdapter } from '../ExtensionBridgeAdapter.ts';
import type { ClipMediaSource } from '../types.ts';

import '../../../../public/sw-clip-stream.js';
const swModule = (globalThis as any).ClipStreamWorker;

describe('ServiceWorkerBridge', () => {
  let originalWindow: typeof globalThis.window;
  let originalNavigator: typeof globalThis.navigator;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalNavigator = globalThis.navigator;
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.navigator = originalNavigator;
  });

  it('correctly detects when ServiceWorker is unsupported', () => {
    // In node environment without navigator.serviceWorker
    delete (globalThis as any).window;
    delete (globalThis as any).navigator;

    const bridge = new ServiceWorkerBridge();
    assert.equal(bridge.isSupported(), false);
    assert.equal(bridge.getStatus(), 'idle');
  });

  it('falls back gracefully when Service Worker is unsupported or fails registration', async () => {
    delete (globalThis as any).window;
    delete (globalThis as any).navigator;

    const bridge = new ServiceWorkerBridge();
    const initResult = await bridge.init();
    assert.equal(initResult, false);
    assert.equal(bridge.getStatus(), 'unsupported');

    // 1. Source with existing remote URL
    const remoteSource: ClipMediaSource = {
      type: 'url',
      title: 'sample.mp4',
      size: 1000,
      mimeType: 'video/mp4',
      url: 'https://example.com/video.mp4',
      readChunk: async () => new ArrayBuffer(0),
    };
    const urlResult = await bridge.registerStreamSource(remoteSource);
    assert.equal(urlResult, 'https://example.com/video.mp4');

    // 2. Source with local File fallback
    const fakeFile = new File([new Uint8Array([1, 2, 3])], 'test.mp4', { type: 'video/mp4' });
    const localSource: ClipMediaSource = {
      type: 'local',
      title: 'test.mp4',
      size: 3,
      mimeType: 'video/mp4',
      file: fakeFile,
      readChunk: async () => new ArrayBuffer(0),
    };

    // Mock URL.createObjectURL
    const origCreateObjectURL = globalThis.URL.createObjectURL;
    globalThis.URL.createObjectURL = () => 'blob:http://localhost/fake-uuid';

    try {
      const fileResult = await bridge.registerStreamSource(localSource);
      assert.equal(fileResult, 'blob:http://localhost/fake-uuid');
    } finally {
      globalThis.URL.createObjectURL = origCreateObjectURL;
    }
  });

  it('registers stream source and provides virtual URL when SW is active', async () => {
    const channelName = 'test-sw-channel-' + Math.random().toString(36).slice(2, 8);
    const mockSwChannel = new BroadcastChannel(channelName);
    const testChannel = new BroadcastChannel(channelName);

    // Mock browser window and serviceWorker
    const mockPostMessage = (data: any) => {};
    (globalThis as any).window = {
      location: { origin: 'https://easyscraper.com' },
    };
    (globalThis as any).navigator = {
      serviceWorker: {
        register: async () => ({
          active: true,
          installing: null,
          waiting: null,
          addEventListener: () => {},
        }),
        ready: Promise.resolve({ active: true }),
        controller: {
          postMessage: mockPostMessage,
        },
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    };

    const bridge = new ServiceWorkerBridge({
      channelName,
      customBroadcastChannel: testChannel,
    });

    let swRegisteredPayload: any = null;
    mockSwChannel.onmessage = (event) => {
      if (event.data?.type === 'REGISTER_SESSION') {
        swRegisteredPayload = event.data;
      }
    };

    const dummySource: ClipMediaSource = {
      type: 'extension',
      sessionId: 'session_abc123',
      title: 'my_clip.mp4',
      size: 1048576,
      mimeType: 'video/mp4',
      duration: 12.5,
      readChunk: async (start, end) => new ArrayBuffer(Math.max(0, (end || 1048576) - start)),
    };

    const virtualUrl = await bridge.registerStreamSource(dummySource);
    assert.equal(virtualUrl, '/api/virtual-clip/session_abc123');
    assert.equal(bridge.getStatus(), 'active');
    assert.equal(bridge.getVirtualUrl('session_abc123', true), 'https://easyscraper.com/api/virtual-clip/session_abc123');

    // Check that source was registered and retrievable
    assert.equal(bridge.getSource('session_abc123'), dummySource);

    // Wait a tick for BroadcastChannel message
    await new Promise((r) => setTimeout(r, 20));
    assert.ok(swRegisteredPayload);
    assert.equal(swRegisteredPayload.sessionId, 'session_abc123');
    assert.equal(swRegisteredPayload.meta.size, 1048576);

    bridge.destroy();
    mockSwChannel.close();
  });

  it('handles SW_REQUEST_META and SW_REQUEST_CHUNK via BroadcastChannel', async () => {
    const channelName = 'test-chunk-channel-' + Math.random().toString(36).slice(2, 8);
    const swChannel = new BroadcastChannel(channelName);
    const bridgeChannel = new BroadcastChannel(channelName);

    const bridge = new ServiceWorkerBridge({
      channelName,
      customBroadcastChannel: bridgeChannel,
    });

    const testData = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80]);
    const source: ClipMediaSource = {
      type: 'local',
      sessionId: 'session_test_data',
      title: 'test_video.mp4',
      size: testData.length,
      mimeType: 'video/mp4',
      duration: 5.0,
      readChunk: async (start, end) => {
        const clampedStart = Math.max(0, start);
        const clampedEnd = end !== undefined ? Math.min(testData.length, end) : testData.length;
        const slice = testData.slice(clampedStart, clampedEnd);
        const copy = new Uint8Array(slice.length);
        copy.set(slice);
        return copy.buffer;
      },
    };

    await bridge.registerStreamSource(source);

    // 1. SW requests META
    const metaPromise = new Promise<any>((resolve) => {
      const listener = (event: MessageEvent) => {
        if (event.data?.type === 'SW_RESPONSE_META' && event.data.requestId === 'req_meta_1') {
          swChannel.removeEventListener('message', listener);
          resolve(event.data);
        }
      };
      swChannel.addEventListener('message', listener);
    });

    swChannel.postMessage({
      type: 'SW_REQUEST_META',
      requestId: 'req_meta_1',
      sessionId: 'session_test_data',
    });

    const metaRes = await metaPromise;
    assert.equal(metaRes.success, true);
    assert.equal(metaRes.meta.size, 8);
    assert.equal(metaRes.meta.mimeType, 'video/mp4');

    // 2. SW requests CHUNK [2, 6)
    const chunkPromise = new Promise<any>((resolve) => {
      const listener = (event: MessageEvent) => {
        if (event.data?.type === 'SW_RESPONSE_CHUNK' && event.data.requestId === 'req_chunk_1') {
          swChannel.removeEventListener('message', listener);
          resolve(event.data);
        }
      };
      swChannel.addEventListener('message', listener);
    });

    swChannel.postMessage({
      type: 'SW_REQUEST_CHUNK',
      requestId: 'req_chunk_1',
      sessionId: 'session_test_data',
      start: 2,
      end: 6,
    });

    const chunkRes = await chunkPromise;
    assert.equal(chunkRes.success, true);
    assert.equal(chunkRes.byteLength, 4);
    const receivedBytes = Array.from(new Uint8Array(chunkRes.buffer));
    assert.deepEqual(receivedBytes, [30, 40, 50, 60]);

    // 3. Unregister session
    bridge.unregisterStreamSource('session_test_data');
    assert.equal(bridge.getSource('session_test_data'), undefined);

    bridge.destroy();
    swChannel.close();
  });

  it('delegates to ExtensionBridgeAdapter when session is not in local sources', async () => {
    const channelName = 'test-ext-del-' + Math.random().toString(36).slice(2, 8);
    const swChannel = new BroadcastChannel(channelName);
    const bridgeChannel = new BroadcastChannel(channelName);

    // Mock extension bridge adapter
    const mockBridgeAdapter = new ExtensionBridgeAdapter({
      sendMessageFn: async (_extId, msg: any) => {
        if (msg.type === 'GET_CLIP_META') {
          if (msg.sessionId === 'remote_ext_session') {
            return {
              success: true,
              title: 'remote_stream.mp4',
              size: 100,
              format: 'mp4',
              mimeType: 'video/mp4',
              duration: 10,
            };
          }
          return { success: false, error: 'Session not found' };
        }
        if (msg.type === 'GET_CLIP_CHUNK') {
          return {
            success: true,
            buffer: new Uint8Array([1, 2, 3, 4, 5]).buffer,
            byteLength: 5,
          };
        }
        return { success: false };
      },
    });

    const bridge = new ServiceWorkerBridge({
      channelName,
      customBroadcastChannel: bridgeChannel,
      extensionBridge: mockBridgeAdapter,
    });

    // Request meta for remote extension session
    const metaPromise = new Promise<any>((resolve) => {
      const listener = (event: MessageEvent) => {
        if (event.data?.type === 'SW_RESPONSE_META' && event.data.requestId === 'req_ext_1') {
          swChannel.removeEventListener('message', listener);
          resolve(event.data);
        }
      };
      swChannel.addEventListener('message', listener);
    });

    swChannel.postMessage({
      type: 'SW_REQUEST_META',
      requestId: 'req_ext_1',
      sessionId: 'remote_ext_session',
    });

    const metaRes = await metaPromise;
    assert.equal(metaRes.success, true);
    assert.equal(metaRes.meta.size, 100);
    assert.equal(metaRes.meta.title, 'remote_stream.mp4');

    // Request chunk
    const chunkPromise = new Promise<any>((resolve) => {
      const listener = (event: MessageEvent) => {
        if (event.data?.type === 'SW_RESPONSE_CHUNK' && event.data.requestId === 'req_ext_chunk') {
          swChannel.removeEventListener('message', listener);
          resolve(event.data);
        }
      };
      swChannel.addEventListener('message', listener);
    });

    swChannel.postMessage({
      type: 'SW_REQUEST_CHUNK',
      requestId: 'req_ext_chunk',
      sessionId: 'remote_ext_session',
      start: 0,
      end: 5,
    });

    const chunkRes = await chunkPromise;
    assert.equal(chunkRes.success, true);
    assert.equal(chunkRes.byteLength, 5);

    bridge.destroy();
    swChannel.close();
  });

  it('notifies status listeners on status change', () => {
    const bridge = new ServiceWorkerBridge();
    const statuses: string[] = [];

    const unsubscribe = bridge.onStatusChange((s) => {
      statuses.push(s);
    });

    (bridge as any).setStatus('registering');
    (bridge as any).setStatus('active');
    (bridge as any).setStatus('active'); // duplicate should not re-trigger

    assert.deepEqual(statuses, ['registering', 'active']);

    unsubscribe();
    (bridge as any).setStatus('error');
    assert.deepEqual(statuses, ['registering', 'active']); // No more updates after unsubscribe
  });

  it('handles SW_REQUEST_POSTER via BroadcastChannel and returns virtual poster URL', async () => {
    const channelName = 'test-poster-ch-' + Math.random().toString(36).slice(2, 8);
    const swChannel = new BroadcastChannel(channelName);
    const bridgeChannel = new BroadcastChannel(channelName);

    const mockBridgeAdapter = new ExtensionBridgeAdapter({
      sendMessageFn: async (_extId, msg: any) => {
        if (msg.type === 'PING') {
          return { success: true, pong: true, isPro: true };
        }
        if (msg.type === 'GET_VAULT_POSTER') {
          if (msg.vaultId === 'vault_item_123') {
            return {
              success: true,
              buffer: new Uint8Array([255, 216, 255, 224]).buffer, // JPEG magic bytes
              mimeType: 'image/jpeg',
              byteLength: 4,
            };
          }
          return { success: false, error: 'Poster not found' };
        }
        return { success: false };
      },
    });

    const bridge = new ServiceWorkerBridge({
      channelName,
      customBroadcastChannel: bridgeChannel,
      extensionBridge: mockBridgeAdapter,
    });

    assert.equal(bridge.getVirtualPosterUrl('vault_item_123'), '/api/virtual-poster/vault_item_123');

    const posterPromise = new Promise<any>((resolve) => {
      const listener = (event: MessageEvent) => {
        if (event.data?.type === 'SW_RESPONSE_POSTER' && event.data.requestId === 'req_poster_1') {
          swChannel.removeEventListener('message', listener);
          resolve(event.data);
        }
      };
      swChannel.addEventListener('message', listener);
    });

    swChannel.postMessage({
      type: 'SW_REQUEST_POSTER',
      requestId: 'req_poster_1',
      vaultId: 'vault_item_123',
    });

    const posterRes = await posterPromise;
    assert.equal(posterRes.success, true);
    assert.equal(posterRes.mimeType, 'image/jpeg');
    assert.equal(posterRes.buffer.byteLength, 4);

    bridge.destroy();
    swChannel.close();
  });
});

describe('public/sw-clip-stream.js Virtual Stream Endpoint', () => {
  const { parseRangeHeader, handleVirtualClipFetch, sessionCache, handleIncomingMessage } = swModule;

  describe('Range header parser', () => {
    it('parses standard byte ranges correctly', () => {
      const res1 = parseRangeHeader('bytes=0-100', 1000);
      assert.deepEqual(res1, { start: 0, end: 100 });

      const res2 = parseRangeHeader('bytes=200-500', 1000);
      assert.deepEqual(res2, { start: 200, end: 500 });
    });

    it('parses open-ended byte ranges with MAX_RANGE_CHUNK_SIZE capping', () => {
      // 10MB total
      const total = 10 * 1024 * 1024;
      const res = parseRangeHeader('bytes=0-', total);
      // Max chunk size is 2MB (2097152 bytes), so end is 2097151
      assert.equal(res.start, 0);
      assert.equal(res.end, 2097151);

      // Range near the end
      const nearEnd = parseRangeHeader('bytes=10485000-', total);
      assert.equal(nearEnd.start, 10485000);
      assert.equal(nearEnd.end, total - 1);
    });

    it('parses suffix byte ranges', () => {
      const total = 1000;
      const res = parseRangeHeader('bytes=-300', total);
      assert.deepEqual(res, { start: 700, end: 999 });
    });

    it('identifies invalid or unsatisfiable ranges', () => {
      // Invalid syntax
      assert.equal(parseRangeHeader('invalid-range', 1000)?.error, 'invalid_syntax');
      assert.equal(parseRangeHeader('bytes=-', 1000)?.error, 'empty_range');
      assert.equal(parseRangeHeader('bytes=abc-def', 1000)?.error, 'invalid_syntax');

      // Unsatisfiable (start > end, or start >= total)
      assert.equal(parseRangeHeader('bytes=500-200', 1000)?.error, 'unsatisfiable');
      assert.equal(parseRangeHeader('bytes=1500-2000', 1000)?.error, 'unsatisfiable');
      assert.equal(parseRangeHeader('bytes=1000-', 1000)?.error, 'unsatisfiable');
    });
  });

  describe('handleVirtualClipFetch', () => {
    const testSessionId = 'test_fetch_session_' + Date.now();
    const testVideoBuffer = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    beforeEach(() => {
      sessionCache.set(testSessionId, {
        size: testVideoBuffer.length,
        mimeType: 'video/mp4',
        duration: 1.0,
        title: 'test_clip.mp4',
      });
    });

    afterEach(() => {
      sessionCache.delete(testSessionId);
    });

    it('returns 204 for OPTIONS CORS preflight', async () => {
      const req = new Request(`https://example.com/api/virtual-clip/${testSessionId}`, {
        method: 'OPTIONS',
      });
      const res = await handleVirtualClipFetch(req, testSessionId);
      assert.equal(res.status, 204);
      assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
      assert.ok(res.headers.get('Access-Control-Allow-Methods')?.includes('GET'));
    });

    it('returns 200 for HEAD request with Content-Length and Accept-Ranges', async () => {
      const req = new Request(`https://example.com/api/virtual-clip/${testSessionId}`, {
        method: 'HEAD',
      });
      const res = await handleVirtualClipFetch(req, testSessionId);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('Content-Length'), '10');
      assert.equal(res.headers.get('Content-Type'), 'video/mp4');
      assert.equal(res.headers.get('Accept-Ranges'), 'bytes');
    });

    it('returns 404 for unknown session when page does not respond', async () => {
      const prevTimeout = swModule.timeoutMs;
      swModule.timeoutMs = 100;
      try {
        const req = new Request('https://example.com/api/virtual-clip/unknown_session_id', {
          method: 'GET',
        });
        const res = await handleVirtualClipFetch(req, 'non_existent_session_123');
        assert.equal(res.status, 404);
      } finally {
        swModule.timeoutMs = prevTimeout;
      }
    });

    it('returns 416 for out-of-bounds Range header', async () => {
      const req = new Request(`https://example.com/api/virtual-clip/${testSessionId}`, {
        method: 'GET',
        headers: { Range: 'bytes=50-100' },
      });
      const res = await handleVirtualClipFetch(req, testSessionId);
      assert.equal(res.status, 416);
      assert.equal(res.headers.get('Content-Range'), 'bytes */10');
    });

    it('returns 206 Partial Content when Range chunk is fetched via communication channel', async () => {
      const channel = new BroadcastChannel('clip-sw-channel');
      const testRangeSession = 'range_test_session_' + Date.now();

      // Register session in cache
      sessionCache.set(testRangeSession, {
        size: 10,
        mimeType: 'video/mp4',
        duration: 2.0,
      });

      // Page listener replying to chunk request
      const pageListener = (event: MessageEvent) => {
        if (event.data?.type === 'SW_REQUEST_CHUNK' && event.data.sessionId === testRangeSession) {
          const { requestId, start, end } = event.data;
          const slice = testVideoBuffer.slice(start, end);
          const copy = new Uint8Array(slice.length);
          copy.set(slice);

          channel.postMessage({
            type: 'SW_RESPONSE_CHUNK',
            requestId,
            success: true,
            buffer: copy.buffer,
            byteLength: copy.byteLength,
          });
        }
      };

      channel.addEventListener('message', pageListener);

      try {
        const req = new Request(`https://example.com/api/virtual-clip/${testRangeSession}`, {
          method: 'GET',
          headers: { Range: 'bytes=2-5' },
        });

        const res = await handleVirtualClipFetch(req, testRangeSession);
        assert.equal(res.status, 206);
        assert.equal(res.headers.get('Content-Range'), 'bytes 2-5/10');
        assert.equal(res.headers.get('Content-Length'), '4');
        assert.equal(res.headers.get('Content-Type'), 'video/mp4');
        assert.equal(res.headers.get('Accept-Ranges'), 'bytes');

        const arrayBuffer = await res.arrayBuffer();
        assert.equal(arrayBuffer.byteLength, 4);
        assert.deepEqual(Array.from(new Uint8Array(arrayBuffer)), [3, 4, 5, 6]);
      } finally {
        channel.removeEventListener('message', pageListener);
        channel.close();
        sessionCache.delete(testRangeSession);
      }
    });
  });

  after(() => {
    swModule?.closeBroadcastChannel?.();
    swModule?.broadcastChannel?.close?.();
  });
});
