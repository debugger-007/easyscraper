import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { MediaSourceResolver } from '../MediaSourceResolver.ts';
import { ExtensionBridgeAdapter } from '../ExtensionBridgeAdapter.ts';

describe('MediaSourceResolver', () => {
  it('resolves local file adapter directly', async () => {
    const fakeFile = new File([new Uint8Array([1, 2, 3, 4])], 'sample.mp4', { type: 'video/mp4' });
    const source = await MediaSourceResolver.resolve({ file: fakeFile });
    assert.equal(source.title, 'sample.mp4');
    assert.equal(source.size, 4);
    assert.equal(source.type, 'local');
    assert.equal(source.mimeType, 'video/mp4');
    const chunk = await source.readChunk(0, 2);
    assert.equal(chunk.byteLength, 2);
    const uint8 = new Uint8Array(chunk);
    assert.deepEqual(Array.from(uint8), [1, 2]);
  });

  it('rejects when no media source option is provided', async () => {
    await assert.rejects(
      async () => {
        await MediaSourceResolver.resolve({});
      },
      {
        message: /No media source provided/i,
      }
    );
  });

  describe('Remote URL resolution', () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('resolves remote URL with Content-Length and Range chunk reading', async () => {
      const videoData = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80]);

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlStr = String(input);
        const headers = (init?.headers as Record<string, string>) || {};

        if (init?.method === 'HEAD') {
          return new Response(null, {
            status: 200,
            headers: {
              'content-length': String(videoData.length),
              'content-type': 'video/mp4',
              'accept-ranges': 'bytes',
            },
          });
        }

        const range = headers['Range'] || headers['range'];
        if (range) {
          const match = range.match(/bytes=(\d+)-(\d*)/);
          if (match) {
            const start = parseInt(match[1], 10);
            const end = match[2] ? parseInt(match[2], 10) + 1 : videoData.length;
            const slice = videoData.slice(start, end);
            return new Response(slice, {
              status: 206,
              headers: {
                'content-range': `bytes ${start}-${end - 1}/${videoData.length}`,
                'content-length': String(slice.length),
                'content-type': 'video/mp4',
              },
            });
          }
        }

        return new Response(videoData, {
          status: 200,
          headers: {
            'content-length': String(videoData.length),
            'content-type': 'video/mp4',
          },
        });
      };

      const source = await MediaSourceResolver.resolve({ url: 'https://example.com/videos/stream.mp4' });
      assert.equal(source.type, 'url');
      assert.equal(source.title, 'stream.mp4');
      assert.equal(source.size, 8);
      assert.equal(source.mimeType, 'video/mp4');

      const chunk = await source.readChunk(2, 5);
      assert.equal(chunk.byteLength, 3);
      assert.deepEqual(Array.from(new Uint8Array(chunk)), [30, 40, 50]);
    });
  });

  describe('Extension Bridge resolution', () => {
    it('resolves session source via ExtensionBridgeAdapter', async () => {
      const mockMeta = {
        sessionId: 'session_123',
        title: 'Vault Capture.mp4',
        size: 1024,
        mimeType: 'video/mp4',
        format: 'mp4',
        duration: 42.5,
      };

      const customAdapter = new ExtensionBridgeAdapter({
        sendMessageFn: async (_id, message: any) => {
          if (message.type === 'GET_CLIP_META') {
            return { success: true, meta: mockMeta, ...mockMeta };
          }
          if (message.type === 'GET_CLIP_CHUNK') {
            const { start, end } = message;
            const len = (end || 1024) - start;
            const buffer = new ArrayBuffer(len);
            new Uint8Array(buffer).fill(7);
            return { success: true, buffer, byteLength: len };
          }
          return { success: false, error: 'Unknown type' };
        },
      });

      const source = await MediaSourceResolver.resolve({
        session: 'session_123',
        extensionId: 'custom-ext-id',
      }, customAdapter);

      assert.equal(source.type, 'extension');
      assert.equal(source.sessionId, 'session_123');
      assert.equal(source.title, 'Vault Capture.mp4');
      assert.equal(source.size, 1024);
      assert.equal(source.duration, 42.5);

      const chunk = await source.readChunk(0, 16);
      assert.equal(chunk.byteLength, 16);
      assert.equal(new Uint8Array(chunk)[0], 7);
    });
  });
  it('handles remote URL server returning HTTP 200 without Range support', async () => {
    const originalFetch = globalThis.fetch;
    const fullBuffer = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    globalThis.fetch = async () => {
      return new Response(fullBuffer, {
        status: 200,
        headers: {
          'content-length': String(fullBuffer.length),
          'content-type': 'video/mp4',
        },
      });
    };

    try {
      const source = await MediaSourceResolver.resolve({ url: 'https://example.com/movie.mp4' });
      assert.equal(source.size, 10);
      const chunk = await source.readChunk(3, 7);
      assert.equal(chunk.byteLength, 4);
      assert.deepEqual(Array.from(new Uint8Array(chunk)), [4, 5, 6, 7]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('ExtensionBridgeAdapter', () => {
  it('detects absent chrome.runtime gracefully', async () => {
    const adapter = new ExtensionBridgeAdapter();
    const isConnected = await adapter.checkConnection();
    assert.equal(isConnected, false);
    assert.equal(adapter.getStatus(), 'disconnected');
  });

  it('connects when chrome.runtime responds to PING', async () => {
    const adapter = new ExtensionBridgeAdapter({
      sendMessageFn: async (_id, message: any) => {
        if (message.type === 'PING') {
          return { success: true, pong: true, version: '1.0.0' };
        }
        return { success: false };
      },
    });

    const isConnected = await adapter.checkConnection();
    assert.equal(isConnected, true);
    assert.equal(adapter.getStatus(), 'connected');
  });

  it('handles getMeta error when session is invalid', async () => {
    const adapter = new ExtensionBridgeAdapter({
      sendMessageFn: async () => {
        return { success: false, error: 'Session not found or expired' };
      },
    });

    await assert.rejects(
      async () => {
        await adapter.getMeta('invalid_session');
      },
      {
        message: /Session not found or expired/,
      }
    );
  });

  it('notifies status listeners when connection status changes', async () => {
    const adapter = new ExtensionBridgeAdapter({
      sendMessageFn: async (_id, message: any) => {
        if (message.type === 'PING') return { success: true, pong: true };
        return { success: false };
      },
    });

    const statuses: string[] = [];
    const unsubscribe = adapter.onStatusChange((s) => statuses.push(s));

    assert.equal(adapter.getStatus(), 'idle');
    await adapter.checkConnection();
    assert.equal(adapter.getStatus(), 'connected');
    assert.deepEqual(statuses, ['probing', 'connected']);

    unsubscribe();
  });

  it('handles ArrayBuffer views or serialized chunks gracefully in readChunk', async () => {
    const adapter = new ExtensionBridgeAdapter({
      sendMessageFn: async (_id, message: any) => {
        if (message.type === 'GET_CLIP_CHUNK') {
          // Return Uint8Array view
          const arr = new Uint8Array([99, 100, 101]);
          return { success: true, buffer: arr };
        }
        return { success: false };
      },
    });

    const chunk = await adapter.readChunk('test-sess', 0, 3);
    assert.equal(chunk.byteLength, 3);
    assert.deepEqual(Array.from(new Uint8Array(chunk)), [99, 100, 101]);
  });

  it('verifies Pro permissions via checkPermission when user has active Pro license', async () => {
    const adapter = new ExtensionBridgeAdapter({
      sendMessageFn: async (_id, message: any) => {
        if (message.type === 'PING') {
          return { success: true, pong: true, isPro: true, plan: 'pro', licenseStatus: 'active' };
        }
        if (message.type === 'CHECK_CLIP_PERMISSION') {
          return { success: true, isPro: true, plan: 'pro', licenseStatus: 'active' };
        }
        return { success: false };
      },
    });

    const perm = await adapter.checkPermission();
    assert.equal(perm.isPro, true);
    assert.equal(perm.plan, 'pro');
    assert.equal(adapter.getIsPro(), true);
  });

  it('identifies free / non-pro user and sets isPro to false', async () => {
    const adapter = new ExtensionBridgeAdapter({
      sendMessageFn: async (_id, message: any) => {
        if (message.type === 'PING') {
          return { success: true, pong: true, isPro: false, plan: 'free', licenseStatus: 'inactive' };
        }
        if (message.type === 'CHECK_CLIP_PERMISSION') {
          return { success: true, isPro: false, plan: 'free', licenseStatus: 'inactive' };
        }
        return { success: false };
      },
    });

    const perm = await adapter.checkPermission();
    assert.equal(perm.isPro, false);
    assert.equal(perm.plan, 'free');
    assert.equal(adapter.getIsPro(), false);
  });

  it('notifies onPermissionChange subscribers when permission status updates', async () => {
    const adapter = new ExtensionBridgeAdapter();
    const observed: (boolean | null)[] = [];
    const unsub = adapter.onPermissionChange((pro) => observed.push(pro));

    adapter.setProStatus(true);
    adapter.setProStatus(false);
    assert.deepEqual(observed, [true, false]);
    unsub();
  });

  it('throws PRO_REQUIRED and updates isPro when extension rejects getMeta for free tier', async () => {
    const adapter = new ExtensionBridgeAdapter({
      sendMessageFn: async (_id, message: any) => {
        if (message.type === 'GET_CLIP_META') {
          return { success: false, error: 'PRO_REQUIRED', isPro: false };
        }
        return { success: false };
      },
    });

    await assert.rejects(
      async () => {
        await adapter.getMeta('sess_123');
      },
      {
        message: 'PRO_REQUIRED',
      }
    );

    assert.equal(adapter.getIsPro(), false);
  });

  it('throws PRO_REQUIRED when createSessionFromVault fails for unauthorized user', async () => {
    const adapter = new ExtensionBridgeAdapter({
      sendMessageFn: async (_id, message: any) => {
        if (message.type === 'CREATE_CLIP_SESSION') {
          return { success: false, error: 'PRO_REQUIRED', isPro: false };
        }
        return { success: false };
      },
    });

    await assert.rejects(
      async () => {
        await adapter.createSessionFromVault('vault_item_1');
      },
      {
        message: 'PRO_REQUIRED',
      }
    );

    assert.equal(adapter.getIsPro(), false);
  });
});
