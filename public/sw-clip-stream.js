/* eslint-disable no-restricted-globals */
/**
 * Service Worker Virtual Stream Endpoint for Easy Scraper Clip Studio
 * Intercepts `/api/virtual-clip/:sessionId` and serves virtual HTTP 206 Partial Content
 * responses with Range requests, communicating with the page via BroadcastChannel / postMessage.
 */

const SW_VERSION = '1.0.2';
const CHANNEL_NAME = 'clip-sw-channel';
const VIRTUAL_CLIP_PREFIX = '/api/virtual-clip/';
const VIRTUAL_POSTER_PREFIX = '/api/virtual-poster/';
const POSTER_CACHE_NAME = 'clip-vault-posters-v1';
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RANGE_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunk cap for open-ended range requests

// Local session metadata cache: sessionId -> { size, mimeType, duration, title }
const sessionCache = new Map();

// Pending requests awaiting response from page: requestId -> { resolve, reject, timer }
const pendingRequests = new Map();

// BroadcastChannel instance
let broadcastChannel = null;
if (typeof BroadcastChannel !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    broadcastChannel.unref?.();
    broadcastChannel.onmessage = (event) => {
      handleIncomingMessage(event.data);
    };
  } catch (err) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[SW-ClipStream] Failed to initialize BroadcastChannel:', err);
    }
  }
}

function closeBroadcastChannel() {
  if (broadcastChannel) {
    try {
      broadcastChannel.close();
    } catch {
      // Ignore
    }
    broadcastChannel = null;
  }
}

// Lifecycle events
if (typeof self !== 'undefined' && 'addEventListener' in self) {
  self.addEventListener('install', (event) => {
    // Activate worker immediately without waiting for existing tabs to close
    if (typeof self.skipWaiting === 'function') {
      event.waitUntil(self.skipWaiting());
    }
  });

  self.addEventListener('activate', (event) => {
    // Immediately take control of all clients under the scope
    if (self.clients && typeof self.clients.claim === 'function') {
      event.waitUntil(self.clients.claim());
    }
  });

  // Listen for direct messages from Window clients (postMessage)
  self.addEventListener('message', (event) => {
    handleIncomingMessage(event.data, (reply) => {
      if (event.source && typeof event.source.postMessage === 'function') {
        event.source.postMessage(reply);
      }
    });
  });

  // Intercept fetch requests
  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. Intercept virtual poster requests matching `/api/virtual-poster/:vaultId`
    if (url.pathname.startsWith(VIRTUAL_POSTER_PREFIX)) {
      const rawId = url.pathname.slice(VIRTUAL_POSTER_PREFIX.length);
      const vaultId = decodeURIComponent(rawId.split('/')[0] || '').trim();

      if (!vaultId) {
        event.respondWith(
          new Response('Missing vaultId in virtual poster URL', {
            status: 400,
            headers: { 'Content-Type': 'text/plain' },
          })
        );
        return;
      }

      event.respondWith(handleVirtualPosterFetch(event.request, vaultId));
      return;
    }

    // 2. Intercept routes matching `/api/virtual-clip/:sessionId`
    if (!url.pathname.startsWith(VIRTUAL_CLIP_PREFIX)) {
      return;
    }

    const rawId = url.pathname.slice(VIRTUAL_CLIP_PREFIX.length);
    const sessionId = decodeURIComponent(rawId.split('/')[0] || '').trim();

    if (!sessionId) {
      event.respondWith(
        new Response('Missing sessionId in virtual clip URL', {
          status: 400,
          headers: { 'Content-Type': 'text/plain' },
        })
      );
      return;
    }

    event.respondWith(handleVirtualClipFetch(event.request, sessionId));
  });
}

/**
 * Handle incoming messages from BroadcastChannel or postMessage
 */
function handleIncomingMessage(data, replyFn) {
  if (!data || typeof data !== 'object') return;

  switch (data.type) {
    case 'REGISTER_SESSION': {
      if (data.sessionId && data.meta) {
        sessionCache.set(data.sessionId, {
          size: Number(data.meta.size) || 0,
          mimeType: data.meta.mimeType || 'video/mp4',
          duration: data.meta.duration,
          title: data.meta.title,
        });
      }
      break;
    }

    case 'UNREGISTER_SESSION': {
      if (data.sessionId) {
        sessionCache.delete(data.sessionId);
      }
      break;
    }

    case 'SW_RESPONSE_META': {
      const pending = pendingRequests.get(data.requestId);
      if (pending) {
        clearTimeout(pending.timer);
        pendingRequests.delete(data.requestId);
        if (data.success && data.meta) {
          sessionCache.set(data.meta.sessionId || pending.sessionId, {
            size: Number(data.meta.size) || 0,
            mimeType: data.meta.mimeType || 'video/mp4',
            duration: data.meta.duration,
            title: data.meta.title,
          });
          pending.resolve(data.meta);
        } else {
          pending.reject(new Error(data.error || 'Failed to fetch session metadata'));
        }
      }
      break;
    }

    case 'SW_RESPONSE_CHUNK': {
      const pending = pendingRequests.get(data.requestId);
      if (pending) {
        clearTimeout(pending.timer);
        pendingRequests.delete(data.requestId);
        if (data.success && data.buffer) {
          pending.resolve(data.buffer);
        } else {
          pending.reject(new Error(data.error || 'Failed to read media chunk'));
        }
      }
      break;
    }

    case 'SW_RESPONSE_POSTER': {
      const pending = pendingRequests.get(data.requestId);
      if (pending) {
        clearTimeout(pending.timer);
        pendingRequests.delete(data.requestId);
        if (data.success && data.buffer) {
          pending.resolve({
            buffer: data.buffer,
            mimeType: data.mimeType || 'image/jpeg',
          });
        } else {
          pending.reject(new Error(data.error || 'Failed to fetch poster'));
        }
      }
      break;
    }
  }
}

/**
 * Dispatches a request to page thread and waits for response with timeout
 */
function requestFromPage(type, payload, timeoutMs) {
  const actualTimeout = timeoutMs || (typeof ClipStreamWorker !== 'undefined' && ClipStreamWorker.timeoutMs) || DEFAULT_TIMEOUT_MS;
  return new Promise((resolve, reject) => {
    const requestId = 'sw_req_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
    const timer = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error(`Timeout waiting for page thread response [${type}] after ${actualTimeout}ms`));
    }, actualTimeout);

    pendingRequests.set(requestId, {
      resolve,
      reject,
      timer,
      sessionId: payload.sessionId,
    });

    const message = {
      type,
      requestId,
      ...payload,
    };

    let dispatched = false;

    // 1. Dispatch via BroadcastChannel
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(message);
        dispatched = true;
      } catch (err) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[SW-ClipStream] BroadcastChannel postMessage error:', err);
        }
      }
    }

    // 2. Dispatch to connected window clients via postMessage as additional path
    if (typeof self !== 'undefined' && self.clients && typeof self.clients.matchAll === 'function') {
      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          for (const client of clients) {
            try {
              client.postMessage(message);
              dispatched = true;
            } catch {
              // Ignore single client error
            }
          }
        })
        .catch(() => {});
    }
  });
}

/**
 * Retrieve session metadata from local cache or request on-demand from page thread
 */
async function getSessionMeta(sessionId) {
  if (sessionCache.has(sessionId)) {
    return sessionCache.get(sessionId);
  }

  const meta = await requestFromPage('SW_REQUEST_META', { sessionId });
  if (meta && typeof meta.size === 'number') {
    return meta;
  }

  throw new Error(`Session ${sessionId} metadata unavailable`);
}

/**
 * Request on-demand byte chunk [start, end) from page thread
 */
async function fetchChunk(sessionId, start, end) {
  const buffer = await requestFromPage('SW_REQUEST_CHUNK', {
    sessionId,
    start,
    end,
  });

  if (buffer instanceof ArrayBuffer) {
    return buffer;
  }

  if (ArrayBuffer.isView(buffer)) {
    const copy = new Uint8Array(buffer.byteLength);
    copy.set(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength));
    return copy.buffer;
  }

  throw new Error('Invalid chunk data format received from page');
}

/**
 * Parses HTTP Range header string into { start, end }
 */
function parseRangeHeader(rangeHeader, totalSize) {
  if (!rangeHeader || typeof rangeHeader !== 'string') {
    return null;
  }

  const matches = rangeHeader.trim().match(/^bytes=(\d*)-(\d*)$/);
  if (!matches) {
    return { error: 'invalid_syntax' };
  }

  const rawStart = matches[1];
  const rawEnd = matches[2];

  if (rawStart === '' && rawEnd === '') {
    return { error: 'empty_range' };
  }

  let start;
  let end;

  if (rawStart === '') {
    // Suffix range: bytes=-500 (last 500 bytes)
    const suffix = parseInt(rawEnd, 10);
    if (isNaN(suffix) || suffix <= 0) {
      return { error: 'invalid_syntax' };
    }
    start = Math.max(0, totalSize - suffix);
    end = Math.max(0, totalSize - 1);
  } else {
    start = parseInt(rawStart, 10);
    if (isNaN(start)) {
      return { error: 'invalid_syntax' };
    }

    if (rawEnd === '') {
      // Open-ended range: bytes=100- -> Cap by MAX_RANGE_CHUNK_SIZE
      end = Math.min(totalSize - 1, start + MAX_RANGE_CHUNK_SIZE - 1);
    } else {
      end = parseInt(rawEnd, 10);
      if (isNaN(end)) {
        return { error: 'invalid_syntax' };
      }
    }
  }

  // Validity check: 416 Range Not Satisfiable
  if (start > end || (totalSize > 0 && start >= totalSize)) {
    return { error: 'unsatisfiable' };
  }

  // Clamp end to total - 1
  if (totalSize > 0 && end >= totalSize) {
    end = totalSize - 1;
  }

  return { start, end };
}

/**
 * Core HTTP Request handler for virtual clip endpoint
 */
async function handleVirtualClipFetch(request, sessionId) {
  // 1. CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Accept-Encoding',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 2. Fetch session metadata
  let meta;
  try {
    meta = await getSessionMeta(sessionId);
  } catch (err) {
    return new Response(
      `Clip session not found or inactive: ${err instanceof Error ? err.message : String(err)}`,
      {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  const total = meta.size;
  const mimeType = meta.mimeType || 'video/mp4';

  const baseHeaders = {
    'Accept-Ranges': 'bytes',
    'Content-Type': mimeType,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Range, Accept-Encoding',
    'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
  };

  // 3. HEAD request
  if (request.method === 'HEAD') {
    return new Response(null, {
      status: 200,
      headers: {
        ...baseHeaders,
        'Content-Length': String(total),
      },
    });
  }

  // 4. Parse Range header
  const rangeHeader = request.headers.get('Range') || request.headers.get('range');

  // Case A: Full GET request without Range header
  if (!rangeHeader) {
    if (total === 0) {
      return new Response(new ArrayBuffer(0), {
        status: 200,
        headers: {
          ...baseHeaders,
          'Content-Length': '0',
        },
      });
    }

    if (total <= MAX_RANGE_CHUNK_SIZE) {
      try {
        const buffer = await fetchChunk(sessionId, 0, total);
        return new Response(buffer, {
          status: 200,
          headers: {
            ...baseHeaders,
            'Content-Length': String(buffer.byteLength),
          },
        });
      } catch (err) {
        return new Response(`Failed to read clip stream: ${err instanceof Error ? err.message : String(err)}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }

    // Stream larger media sequentially
    let offset = 0;
    const stream = new ReadableStream({
      async pull(controller) {
        if (offset >= total) {
          controller.close();
          return;
        }
        const nextEnd = Math.min(total, offset + MAX_RANGE_CHUNK_SIZE);
        try {
          const chunk = await fetchChunk(sessionId, offset, nextEnd);
          controller.enqueue(new Uint8Array(chunk));
          offset = nextEnd;
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        ...baseHeaders,
        'Content-Length': String(total),
      },
    });
  }

  // Case B: Range Request
  const parsedRange = parseRangeHeader(rangeHeader, total);

  if (!parsedRange || parsedRange.error === 'invalid_syntax' || parsedRange.error === 'empty_range') {
    return new Response('Invalid Range header syntax', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  if (parsedRange.error === 'unsatisfiable') {
    return new Response(null, {
      status: 416,
      headers: {
        'Content-Range': `bytes */${total}`,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const { start, end } = parsedRange;
  const sliceEnd = end + 1; // JS slice semantics [start, sliceEnd)

  try {
    const buffer = await fetchChunk(sessionId, start, sliceEnd);
    const actualLength = buffer ? buffer.byteLength : 0;
    if (actualLength === 0) {
      return new Response(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${total}`,
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    const actualEnd = start + actualLength - 1;

    return new Response(buffer, {
      status: 206,
      headers: {
        ...baseHeaders,
        'Content-Range': `bytes ${start}-${actualEnd}/${total}`,
        'Content-Length': String(actualLength),
      },
    });
  } catch (err) {
    return new Response(`Failed to fetch chunk range [${start}-${end}]: ${err instanceof Error ? err.message : String(err)}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

/**
 * Intercepts `/api/virtual-poster/:vaultId` and returns cached or on-demand binary image
 */
async function handleVirtualPosterFetch(request, vaultId) {
  // 1. Check CacheStorage first for instant hit
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(POSTER_CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
    } catch {
      // Ignore cache open error
    }
  }

  // 2. Request poster binary from page thread via BroadcastChannel / postMessage
  try {
    const posterData = await requestFromPage('SW_REQUEST_POSTER', { vaultId }, 6000);
    if (posterData && posterData.buffer && posterData.buffer.byteLength > 0) {
      const mimeType = posterData.mimeType || 'image/jpeg';
      const response = new Response(posterData.buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': String(posterData.buffer.byteLength),
          'Cache-Control': 'public, max-age=604800, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      });

      // Cache for next fast display
      if (typeof caches !== 'undefined') {
        try {
          const cache = await caches.open(POSTER_CACHE_NAME);
          await cache.put(request, response.clone());
        } catch {
          // Ignore cache write error
        }
      }

      return response;
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[SW-ClipStream] Failed to fetch virtual poster for vaultId=${vaultId}:`, err);
    }
  }

  // 3. Fallback: 404 response
  return new Response('Poster Not Found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Export to global / module scope for testing and worker inspection
const ClipStreamWorker = {
  SW_VERSION,
  CHANNEL_NAME,
  VIRTUAL_CLIP_PREFIX,
  VIRTUAL_POSTER_PREFIX,
  POSTER_CACHE_NAME,
  MAX_RANGE_CHUNK_SIZE,
  DEFAULT_TIMEOUT_MS,
  timeoutMs: DEFAULT_TIMEOUT_MS,
  sessionCache,
  pendingRequests,
  parseRangeHeader,
  handleVirtualClipFetch,
  handleVirtualPosterFetch,
  handleIncomingMessage,
  get broadcastChannel() {
    return broadcastChannel;
  },
  closeBroadcastChannel,
};

if (typeof globalThis !== 'undefined') {
  globalThis.ClipStreamWorker = ClipStreamWorker;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClipStreamWorker;
}
