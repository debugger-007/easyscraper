/**
 * ServiceWorkerBridge
 * Client-side manager registering `/sw-clip-stream.js` and serving virtual HTTP 206
 * Range requests for video clips and demuxers via BroadcastChannel and postMessage.
 */

import { ExtensionBridgeAdapter, defaultExtensionBridge } from './ExtensionBridgeAdapter.ts';
import type {
  ClipMediaSource,
  ServiceWorkerBridgeStatus,
  SwIncomingMessage,
  VirtualClipMeta,
} from './types.ts';

export interface ServiceWorkerBridgeOptions {
  swUrl?: string;
  scope?: string;
  channelName?: string;
  timeoutMs?: number;
  extensionBridge?: ExtensionBridgeAdapter;
  customBroadcastChannel?: BroadcastChannel;
}

export class ServiceWorkerBridge {
  private swUrl: string;
  private scope: string;
  private channelName: string;
  private timeoutMs: number;
  private extensionBridge: ExtensionBridgeAdapter;
  private status: ServiceWorkerBridgeStatus = 'idle';
  private registration: ServiceWorkerRegistration | null = null;
  private channel: BroadcastChannel | null = null;
  private sources = new Map<string, ClipMediaSource>();
  private statusListeners = new Set<(status: ServiceWorkerBridgeStatus) => void>();
  private initPromise: Promise<boolean> | null = null;

  constructor(options?: ServiceWorkerBridgeOptions) {
    this.swUrl = options?.swUrl ?? '/sw-clip-stream.js';
    this.scope = options?.scope ?? '/';
    this.channelName = options?.channelName ?? 'clip-sw-channel';
    this.timeoutMs = options?.timeoutMs ?? 8000;
    this.extensionBridge = options?.extensionBridge ?? defaultExtensionBridge;

    if (options?.customBroadcastChannel) {
      this.channel = options.customBroadcastChannel;
      this.channel.onmessage = (event) => this.handleIncomingMessage(event.data);
    }
  }

  /**
   * Whether the environment supports Service Workers and BroadcastChannel
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    return 'serviceWorker' in navigator;
  }

  /**
   * Current bridge status
   */
  public getStatus(): ServiceWorkerBridgeStatus {
    return this.status;
  }

  /**
   * Subscribe to status changes
   */
  public onStatusChange(listener: (status: ServiceWorkerBridgeStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: ServiceWorkerBridgeStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusListeners.forEach((listener) => {
        try {
          listener(status);
        } catch {
          // Ignore listener errors
        }
      });
    }
  }

  /**
   * Initializes Service Worker registration and communication channel
   */
  public async init(): Promise<boolean> {
    if (!this.isSupported()) {
      this.setStatus('unsupported');
      return false;
    }

    if (this.status === 'active' && this.registration) {
      return true;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        this.setStatus('registering');
        this.setupChannel();

        const registration = await navigator.serviceWorker.register(this.swUrl, {
          scope: this.scope,
        });
        this.registration = registration;

        // If worker is activating or installing, wait for ready
        if (registration.installing || registration.waiting) {
          await new Promise<void>((resolve) => {
            const checkActive = () => {
              if (registration.active) {
                resolve();
              }
            };

            registration.addEventListener('updatefound', () => {
              const worker = registration.installing;
              worker?.addEventListener('statechange', () => {
                if (worker.state === 'activated') {
                  resolve();
                }
              });
            });

            setTimeout(checkActive, 200);
            setTimeout(resolve, 800);
          });
        }

        await navigator.serviceWorker.ready;
        this.setStatus('active');
        return true;
      } catch (err) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[ServiceWorkerBridge] Registration failed:', err);
        }
        this.setStatus('error');
        return false;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  /**
   * Establishes BroadcastChannel and worker postMessage listeners
   */
  private setupChannel(): void {
    if (!this.channel && typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => this.handleIncomingMessage(event.data);
      } catch (err) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[ServiceWorkerBridge] BroadcastChannel open error:', err);
        }
      }
    }

    if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', this.handleSwPostMessage);
      navigator.serviceWorker.addEventListener('message', this.handleSwPostMessage);
    }
  }

  private handleSwPostMessage = (event: MessageEvent): void => {
    this.handleIncomingMessage(event.data);
  };

  /**
   * Process chunk and meta requests originating from the Service Worker
   */
  public async handleIncomingMessage(data: unknown): Promise<void> {
    if (!data || typeof data !== 'object') return;
    const msg = data as SwIncomingMessage;

    switch (msg.type) {
      case 'SW_REQUEST_META': {
        const { requestId, sessionId } = msg;
        let source = this.sources.get(sessionId);

        // If not in local sources, check if extension bridge has session
        if (!source && this.extensionBridge) {
          try {
            const extMeta = await this.extensionBridge.getMeta(sessionId);
            if (extMeta && typeof extMeta.size === 'number') {
              source = {
                type: 'extension',
                sessionId,
                title: extMeta.title || `clip_${sessionId}.mp4`,
                size: extMeta.size,
                mimeType: extMeta.mimeType || 'video/mp4',
                duration: extMeta.duration,
                readChunk: (start, end) => this.extensionBridge.readChunk(sessionId, start, end),
              };
              this.sources.set(sessionId, source);
            }
          } catch {
            // Not in extension bridge
          }
        }

        if (!source) {
          // If session is not owned by this instance, do not reply over BroadcastChannel
          // to let other tabs / sources reply.
          return;
        }

        const meta: VirtualClipMeta = {
          sessionId,
          size: source.size,
          mimeType: source.mimeType,
          title: source.title,
          duration: source.duration,
        };

        this.postReply({
          type: 'SW_RESPONSE_META',
          requestId,
          success: true,
          meta,
        });
        break;
      }

      case 'SW_REQUEST_CHUNK': {
        const { requestId, sessionId, start, end } = msg;
        const source = this.sources.get(sessionId);

        if (!source) {
          // Session not handled by this tab, allow other tabs to handle
          return;
        }

        try {
          const raw: unknown = await source.readChunk(start, end);
          let buffer: ArrayBuffer;

          if (raw instanceof ArrayBuffer) {
            buffer = raw;
          } else if (ArrayBuffer.isView(raw)) {
            const copy = new Uint8Array(raw.byteLength);
            copy.set(new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength));
            buffer = copy.buffer;
          } else {
            throw new Error('Unsupported chunk format from readChunk');
          }

          this.postReply({
            type: 'SW_RESPONSE_CHUNK',
            requestId,
            success: true,
            buffer,
            byteLength: buffer.byteLength,
          });
        } catch (err) {
          this.postReply({
            type: 'SW_RESPONSE_CHUNK',
            requestId,
            success: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
        break;
      }
    }
  }

  /**
   * Registers a ClipMediaSource into the stream provider and returns virtual playable URL
   */
  public async registerStreamSource(source: ClipMediaSource): Promise<string> {
    const sessionId =
      source.sessionId ||
      `clip_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    source.sessionId = sessionId;

    this.sources.set(sessionId, source);

    const swReady = await this.init();

    if (swReady) {
      // Sync metadata to Service Worker cache
      this.postToSw({
        type: 'REGISTER_SESSION',
        sessionId,
        meta: {
          sessionId,
          size: source.size,
          mimeType: source.mimeType,
          duration: source.duration,
          title: source.title,
        },
      });

      return this.getVirtualUrl(sessionId);
    }

    // Graceful Fallback if Service Worker is unavailable or failed to register
    if (source.url) {
      return source.url;
    }

    if (source.file && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const blobUrl = URL.createObjectURL(source.file);
      source.url = blobUrl;
      return blobUrl;
    }

    return this.getVirtualUrl(sessionId);
  }

  /**
   * Removes a stream source from the active registry
   */
  public unregisterStreamSource(sessionId: string): void {
    this.sources.delete(sessionId);
    this.postToSw({
      type: 'UNREGISTER_SESSION',
      sessionId,
    });
  }

  /**
   * Returns registered ClipMediaSource by sessionId
   */
  public getSource(sessionId: string): ClipMediaSource | undefined {
    return this.sources.get(sessionId);
  }

  /**
   * Generates the virtual stream endpoint URL for a given sessionId
   */
  public getVirtualUrl(sessionId: string, absolute = false): string {
    const path = `/api/virtual-clip/${encodeURIComponent(sessionId)}`;
    if (absolute && typeof window !== 'undefined' && window.location) {
      return `${window.location.origin}${path}`;
    }
    return path;
  }

  /**
   * Post message back via BroadcastChannel
   */
  private postReply(message: unknown): void {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[ServiceWorkerBridge] postReply error:', err);
        }
      }
    }
  }

  /**
   * Post message to Service Worker via BroadcastChannel and controller
   */
  private postToSw(message: unknown): void {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch {
        // Ignore channel error
      }
    }

    if (
      typeof navigator !== 'undefined' &&
      navigator.serviceWorker &&
      navigator.serviceWorker.controller
    ) {
      try {
        navigator.serviceWorker.controller.postMessage(message);
      } catch {
        // Ignore worker error
      }
    }
  }

  /**
   * Cleans up channel and active resources
   */
  public destroy(): void {
    if (this.channel) {
      try {
        this.channel.close();
      } catch {
        // Ignore
      }
      this.channel = null;
    }

    if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', this.handleSwPostMessage);
    }

    this.sources.clear();
    this.statusListeners.clear();
    this.status = 'idle';
  }
}

export const defaultServiceWorkerBridge = new ServiceWorkerBridge();
