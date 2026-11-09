/**
 * ExtensionBridgeAdapter
 * Facilitates cross-origin communication between Web Studio and the Easy Web Scraper Chrome Extension.
 * Handles auto-detection, PING verification, metadata queries, and on-demand chunk streaming.
 */

import type {
  BridgeStatus,
  ClipSessionMeta,
  ExtensionChunkResponse,
  ExtensionMetaResponse,
  ExtensionPingResponse,
  ExtensionSendMessageFn,
} from './types.ts';

declare global {
  interface Window {
    __EASY_SCRAPER_EXTENSION_ID__?: string;
    chrome?: {
      runtime?: {
        sendMessage?: (
          extensionIdOrMessage: any,
          messageOrCallback?: any,
          optionsOrCallback?: any,
          callback?: (response: any) => void
        ) => Promise<any> | void;
        lastError?: { message?: string };
      };
    };
  }
}

export interface ExtensionBridgeAdapterOptions {
  extensionId?: string;
  candidateIds?: string[];
  sendMessageFn?: ExtensionSendMessageFn;
  timeoutMs?: number;
}

export class ExtensionBridgeAdapter {
  private status: BridgeStatus = 'idle';
  private extensionId: string | null = null;
  private candidateIds: string[] = [];
  private sendMessageFn?: ExtensionSendMessageFn;
  private timeoutMs: number;
  private listeners = new Set<(status: BridgeStatus) => void>();

  constructor(options?: ExtensionBridgeAdapterOptions) {
    this.timeoutMs = options?.timeoutMs ?? 6000;
    this.sendMessageFn = options?.sendMessageFn;

    if (options?.extensionId) {
      this.extensionId = options.extensionId;
    }

    if (options?.candidateIds) {
      this.candidateIds = [...options.candidateIds];
    }
  }

  /**
   * Current bridge status
   */
  public getStatus(): BridgeStatus {
    return this.status;
  }

  /**
   * Subscribes to status changes
   */
  public onStatusChange(listener: (status: BridgeStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setStatus(status: BridgeStatus) {
    if (this.status !== status) {
      this.status = status;
      this.listeners.forEach((listener) => {
        try {
          listener(status);
        } catch {
          // Ignore listener errors
        }
      });
    }
  }

  /**
   * Set explicit Extension ID
   */
  public setExtensionId(id: string): void {
    this.extensionId = id;
  }

  /**
   * Returns active extension ID if resolved
   */
  public getActiveExtensionId(): string | null {
    return this.extensionId;
  }

  /**
   * Probes for extension availability and verifies connection with PING
   */
  public async checkConnection(): Promise<boolean> {
    if (this.sendMessageFn) {
      try {
        this.setStatus('probing');
        const res = (await this.sendMessageFn(this.extensionId || undefined, {
          type: 'PING',
        })) as ExtensionPingResponse;
        if (res && res.success && res.pong) {
          this.setStatus('connected');
          return true;
        }
      } catch {
        // Mock probe failed
      }
      this.setStatus('disconnected');
      return false;
    }

    if (typeof window === 'undefined' || !window.chrome?.runtime?.sendMessage) {
      this.setStatus('disconnected');
      return false;
    }

    this.setStatus('probing');

    // Build candidate list
    const candidates: (string | undefined)[] = [];
    if (this.extensionId) {
      candidates.push(this.extensionId);
    }
    if (typeof window !== 'undefined' && window.__EASY_SCRAPER_EXTENSION_ID__) {
      candidates.push(window.__EASY_SCRAPER_EXTENSION_ID__);
    }
    // Check vite env if available
    try {
      const viteEnvId = (import.meta as any).env?.VITE_EXTENSION_ID;
      if (viteEnvId && !candidates.includes(viteEnvId)) {
        candidates.push(viteEnvId);
      }
    } catch {
      // Env not available
    }

    for (const c of this.candidateIds) {
      if (!candidates.includes(c)) {
        candidates.push(c);
      }
    }

    // Try each candidate with PING
    for (const cand of candidates) {
      try {
        const res = await this.rawSendMessage<ExtensionPingResponse>(cand, {
          type: 'PING',
        });
        if (res && res.success && res.pong) {
          if (cand) this.extensionId = cand;
          this.setStatus('connected');
          return true;
        }
      } catch {
        // Try next candidate
      }
    }

    // Also attempt sending without extension ID (in case extension is running on same origin or injected)
    if (candidates.length === 0) {
      try {
        const res = await this.rawSendMessage<ExtensionPingResponse>(undefined, {
          type: 'PING',
        });
        if (res && res.success && res.pong) {
          this.setStatus('connected');
          return true;
        }
      } catch {
        // Failed
      }
    }

    this.setStatus('disconnected');
    return false;
  }

  /**
   * Retrieves clip session metadata from extension
   */
  public async getMeta(sessionId: string): Promise<ClipSessionMeta> {
    if (!sessionId) {
      throw new Error('Session ID is required to fetch clip metadata');
    }

    let response: ExtensionMetaResponse;
    try {
      response = await this.dispatchMessage<ExtensionMetaResponse>({
        type: 'GET_CLIP_META',
        sessionId,
      });
    } catch (err) {
      this.setStatus('error');
      throw err instanceof Error ? err : new Error(String(err));
    }

    if (!response || !response.success) {
      const errMsg = response?.error || 'Session not found or expired';
      this.setStatus('error');
      throw new Error(errMsg);
    }

    this.setStatus('connected');

    const meta = response.meta || (response as unknown as ClipSessionMeta);
    return {
      sessionId,
      id: meta.id || sessionId,
      title: meta.title || `session_${sessionId}.mp4`,
      size: typeof meta.size === 'number' ? meta.size : 0,
      sizeFormatted: meta.sizeFormatted,
      format: meta.format || 'mp4',
      mimeType: meta.mimeType || 'video/mp4',
      duration: meta.duration,
      opfsPath: meta.opfsPath,
      createdAt: meta.createdAt,
      expiresAt: meta.expiresAt,
    };
  }

  /**
   * Reads a byte range chunk from the extension
   */
  public async readChunk(sessionId: string, start: number, end?: number): Promise<ArrayBuffer> {
    if (!sessionId) {
      throw new Error('Session ID is required to read clip chunk');
    }

    let response: ExtensionChunkResponse;
    try {
      response = await this.dispatchMessage<ExtensionChunkResponse>({
        type: 'GET_CLIP_CHUNK',
        sessionId,
        start,
        end,
      });
    } catch (err) {
      this.setStatus('error');
      throw err instanceof Error ? err : new Error(String(err));
    }

    if (!response || !response.success) {
      const errMsg = response?.error || 'Failed to read chunk from extension';
      throw new Error(errMsg);
    }

    const rawBuffer = response.buffer || response.data;
    if (!rawBuffer) {
      throw new Error('Empty chunk data returned from extension');
    }

    if (rawBuffer instanceof ArrayBuffer) {
      return rawBuffer;
    }

    if (ArrayBuffer.isView(rawBuffer)) {
      const copy = new Uint8Array(rawBuffer.byteLength);
      copy.set(
        new Uint8Array(rawBuffer.buffer, rawBuffer.byteOffset, rawBuffer.byteLength)
      );
      return copy.buffer;
    }

    // In case serialized as object or array
    if (typeof rawBuffer === 'object') {
      const values = Array.from(rawBuffer as ArrayLike<number>);
      return new Uint8Array(values).buffer;
    }

    throw new Error('Unsupported chunk buffer format received from extension');
  }

  /**
   * Dispatches message via configured sendMessageFn or Chrome runtime
   */
  private async dispatchMessage<T>(message: unknown): Promise<T> {
    if (this.sendMessageFn) {
      return (await this.sendMessageFn(this.extensionId || undefined, message)) as T;
    }

    return await this.rawSendMessage<T>(this.extensionId || undefined, message);
  }

  /**
   * Low-level Chrome runtime message dispatcher with timeout
   */
  private rawSendMessage<T>(targetId: string | undefined, message: unknown): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.chrome?.runtime?.sendMessage) {
        reject(new Error('Chrome extension runtime is not available'));
        return;
      }

      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error(`Extension request timed out after ${this.timeoutMs}ms`));
        }
      }, this.timeoutMs);

      const handleCallback = (res: any) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);

        const lastError = window.chrome?.runtime?.lastError;
        if (lastError) {
          reject(new Error(lastError.message || 'Extension communication failed'));
          return;
        }

        resolve(res as T);
      };

      try {
        let promiseOrVoid: any;
        if (targetId) {
          promiseOrVoid = window.chrome.runtime.sendMessage(
            targetId,
            message,
            handleCallback
          );
        } else {
          promiseOrVoid = (window.chrome.runtime.sendMessage as any)(
            message,
            handleCallback
          );
        }

        // Support Promise-returning sendMessage implementations
        if (promiseOrVoid && typeof promiseOrVoid.then === 'function') {
          promiseOrVoid
            .then((res: any) => {
              if (!settled) {
                settled = true;
                clearTimeout(timer);
                resolve(res as T);
              }
            })
            .catch((err: any) => {
              if (!settled) {
                settled = true;
                clearTimeout(timer);
                reject(err);
              }
            });
        }
      } catch (err) {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(err);
        }
      }
    });
  }
}

export const defaultExtensionBridge = new ExtensionBridgeAdapter();
