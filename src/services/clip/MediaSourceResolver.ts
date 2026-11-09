/**
 * MediaSourceResolver
 * Resolves video media streams from Local Files, Extension Bridge sessions, or Remote URLs
 * into a unified `ClipMediaSource` contract with on-demand chunk streaming.
 */

import { ExtensionBridgeAdapter, defaultExtensionBridge } from './ExtensionBridgeAdapter.ts';
import type { ClipMediaSource, ResolveMediaOptions } from './types.ts';

export class MediaSourceResolver {
  /**
   * Main entry point to resolve a clip media source
   */
  public static async resolve(
    options: ResolveMediaOptions,
    bridgeAdapter?: ExtensionBridgeAdapter
  ): Promise<ClipMediaSource> {
    if (options.file) {
      return this.resolveFile(options.file);
    }

    if (options.session) {
      return this.resolveSession(options.session, options.extensionId, bridgeAdapter);
    }

    if (options.url) {
      return this.resolveUrl(options.url);
    }

    throw new Error('No media source provided. Must specify file, session, or url.');
  }

  /**
   * Resolves a local user-selected File or Drag-and-Drop Blob
   */
  public static resolveFile(file: File): ClipMediaSource {
    const title = file.name || 'local_video.mp4';
    const size = file.size;
    const mimeType = file.type || this.guessMimeType(title);
    const objectUrl =
      typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;

    return {
      type: 'local',
      title,
      size,
      mimeType,
      file,
      url: objectUrl,
      readChunk: async (start: number, end?: number): Promise<ArrayBuffer> => {
        const clampedStart = Math.max(0, start);
        const clampedEnd = end !== undefined ? Math.max(clampedStart, end) : size;
        const slice = file.slice(clampedStart, clampedEnd);
        return await slice.arrayBuffer();
      },
    };
  }

  /**
   * Resolves a streaming video session originating from the Chrome Extension
   */
  public static async resolveSession(
    sessionId: string,
    extensionId?: string,
    bridgeAdapter?: ExtensionBridgeAdapter
  ): Promise<ClipMediaSource> {
    const adapter = bridgeAdapter || defaultExtensionBridge;

    if (extensionId) {
      adapter.setExtensionId(extensionId);
    }

    const meta = await adapter.getMeta(sessionId);

    return {
      type: 'extension',
      title: meta.title || `session_${sessionId}.mp4`,
      size: meta.size,
      mimeType: meta.mimeType || 'video/mp4',
      duration: meta.duration,
      sessionId,
      readChunk: async (start: number, end?: number): Promise<ArrayBuffer> => {
        return await adapter.readChunk(sessionId, start, end);
      },
    };
  }

  /**
   * Resolves a remote CORS-enabled URL via HTTP Range requests
   */
  public static async resolveUrl(url: string): Promise<ClipMediaSource> {
    const title = this.extractTitleFromUrl(url);

    let size = 0;
    let mimeType = 'video/mp4';

    // 1. Probe headers using HEAD or Range GET
    try {
      const headRes = await fetch(url, { method: 'HEAD' });
      if (headRes.ok) {
        const cl = headRes.headers.get('content-length');
        if (cl) {
          size = parseInt(cl, 10) || 0;
        }
        const ct = headRes.headers.get('content-type');
        if (ct) {
          mimeType = ct.split(';')[0].trim();
        }
      }
    } catch {
      // HEAD may fail due to CORS method limitation, continue with Range probe
    }

    // 2. If size still 0, probe with 1-byte Range request
    if (size === 0) {
      try {
        const probeRes = await fetch(url, {
          headers: { Range: 'bytes=0-0' },
        });

        if (probeRes.ok) {
          const cr = probeRes.headers.get('content-range');
          if (cr) {
            const match = cr.match(/\/(\d+|\*)$/);
            if (match && match[1] !== '*') {
              size = parseInt(match[1], 10) || 0;
            }
          }
          if (size === 0) {
            const cl = probeRes.headers.get('content-length');
            if (cl) size = parseInt(cl, 10) || 0;
          }
          const ct = probeRes.headers.get('content-type');
          if (ct) {
            mimeType = ct.split(';')[0].trim();
          }
        }
      } catch (err) {
        throw new Error(
          `Failed to access remote video at ${url}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    if (!mimeType || mimeType === 'application/octet-stream') {
      mimeType = this.guessMimeType(title);
    }

    return {
      type: 'url',
      title,
      size,
      mimeType,
      url,
      readChunk: async (start: number, end?: number): Promise<ArrayBuffer> => {
        const clampedStart = Math.max(0, start);
        const rangeHeader =
          end !== undefined && end > clampedStart
            ? `bytes=${clampedStart}-${end - 1}`
            : `bytes=${clampedStart}-`;

        const res = await fetch(url, {
          headers: { Range: rangeHeader },
        });

        if (!res.ok) {
          throw new Error(
            `Failed to fetch chunk range [${rangeHeader}] from ${url}: HTTP ${res.status}`
          );
        }

        const buffer = await res.arrayBuffer();

        // If server returned 200 OK instead of 206 Partial Content, slice manually
        if (res.status === 200) {
          const clampedEnd = end !== undefined ? Math.max(clampedStart, end) : buffer.byteLength;
          return buffer.slice(clampedStart, clampedEnd);
        }

        return buffer;
      },
    };
  }

  /**
   * Extracts clean filename from URL
   */
  private static extractTitleFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      const segments = pathname.split('/').filter(Boolean);
      const last = segments.pop();
      if (last && last.includes('.')) {
        return decodeURIComponent(last);
      }
    } catch {
      // Fallback
    }
    return 'remote_video.mp4';
  }

  /**
   * Guess MIME type based on file extension
   */
  private static guessMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'webm':
        return 'video/webm';
      case 'mov':
        return 'video/quicktime';
      case 'mkv':
        return 'video/x-matroska';
      case 'ts':
        return 'video/mp2t';
      case 'm3u8':
        return 'application/x-mpegURL';
      case 'mp4':
      default:
        return 'video/mp4';
    }
  }
}
