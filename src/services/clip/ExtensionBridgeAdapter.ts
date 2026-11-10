/**
 * ExtensionBridgeAdapter
 * Facilitates cross-origin communication between Web Studio and the Easy Web Scraper Chrome Extension.
 * Handles auto-detection, PING verification, metadata queries, and on-demand chunk streaming.
 */

import type {
  BridgeStatus,
  ClipSessionMeta,
  ExtensionChunkResponse,
  ExtensionCreateSessionResponse,
  ExtensionMetaResponse,
  ExtensionPermissionResponse,
  ExtensionPingResponse,
  ExtensionSendMessageFn,
  ExtensionVaultVideosResponse,
  ExtensionVaultPosterResponse,
  VaultVideoItem,
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

/**
 * Safely decodes a Base64 string into an ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const cleanBase64 = (base64.includes(',') ? base64.split(',')[1] : base64).trim();
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export class ExtensionBridgeAdapter {
  private status: BridgeStatus = 'idle';
  private extensionId: string | null = null;
  private candidateIds: string[] = [];
  private sendMessageFn?: ExtensionSendMessageFn;
  private timeoutMs: number;
  private listeners = new Set<(status: BridgeStatus) => void>();
  private isPro: boolean | null = null;
  private permissionListeners = new Set<(isPro: boolean | null) => void>();

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
   * Returns whether user is verified as Pro (null if unverified)
   */
  public getIsPro(): boolean | null {
    return this.isPro;
  }

  /**
   * Subscribes to status changes
   */
  public onStatusChange(listener: (status: BridgeStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribes to Pro permission changes
   */
  public onPermissionChange(listener: (isPro: boolean | null) => void): () => void {
    this.permissionListeners.add(listener);
    return () => this.permissionListeners.delete(listener);
  }

  public setProStatus(isPro: boolean | null): void {
    if (this.isPro !== isPro) {
      this.isPro = isPro;
      this.permissionListeners.forEach((listener) => {
        try {
          listener(isPro);
        } catch {
          // Ignore listener errors
        }
      });
    }
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
    if (typeof localStorage !== 'undefined' && id) {
      try {
        localStorage.setItem('easy_scraper_extension_id', id);
      } catch {
        // Ignore storage errors
      }
    }
  }

  /**
   * Returns active extension ID if resolved
   */
  public getActiveExtensionId(): string | null {
    if (!this.extensionId && typeof window !== 'undefined') {
      if (window.__EASY_SCRAPER_EXTENSION_ID__) {
        this.extensionId = window.__EASY_SCRAPER_EXTENSION_ID__;
      } else if (typeof localStorage !== 'undefined') {
        try {
          const stored = localStorage.getItem('easy_scraper_extension_id');
          if (stored) {
            this.extensionId = stored;
          }
        } catch {
          // Ignore
        }
      }
    }
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
          if (typeof res.isPro === 'boolean') {
            this.setProStatus(res.isPro);
          }
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
    if (this.getActiveExtensionId()) {
      candidates.push(this.extensionId!);
    }
    if (typeof window !== 'undefined' && window.__EASY_SCRAPER_EXTENSION_ID__) {
      candidates.push(window.__EASY_SCRAPER_EXTENSION_ID__);
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('easy_scraper_extension_id');
        if (stored && !candidates.includes(stored)) {
          candidates.push(stored);
        }
      } catch {
        // Ignore
      }
    }
    // Check vite env if available
    try {
      const viteEnvId = import.meta.env?.VITE_EXTENSION_ID;
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
          if (typeof res.isPro === 'boolean') {
            this.setProStatus(res.isPro);
          }
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
          if (typeof res.isPro === 'boolean') {
            this.setProStatus(res.isPro);
          }
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
   * Performs explicit permission verification with extension for Pro access
   */
  public async checkPermission(): Promise<{ isPro: boolean; plan?: string; licenseStatus?: string }> {
    const isConnected = await this.checkConnection().catch(() => false);
    if (!isConnected) {
      this.setProStatus(null);
      return { isPro: false, plan: 'none', licenseStatus: 'disconnected' };
    }

    try {
      const res = await this.dispatchMessage<ExtensionPermissionResponse>({
        type: 'CHECK_CLIP_PERMISSION',
      });
      if (res && res.success && typeof res.isPro === 'boolean') {
        this.setProStatus(res.isPro);
        return {
          isPro: res.isPro,
          plan: res.plan,
          licenseStatus: res.licenseStatus,
        };
      }
    } catch {
      // Fallback to isPro obtained from PING
    }

    const fallbackPro = this.isPro ?? false;
    return { isPro: fallbackPro };
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
      if (response?.error === 'PRO_REQUIRED' || response?.isPro === false) {
        this.setProStatus(false);
        throw new Error('PRO_REQUIRED');
      }
      const errMsg = response?.error || 'Session not found or expired';
      this.setStatus('error');
      throw new Error(errMsg);
    }

    if (typeof response.isPro === 'boolean') {
      this.setProStatus(response.isPro);
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
        format: 'base64',
      });
    } catch (err) {
      this.setStatus('error');
      throw err instanceof Error ? err : new Error(String(err));
    }

    if (!response || !response.success) {
      if (response?.error === 'PRO_REQUIRED') {
        this.setProStatus(false);
        throw new Error('PRO_REQUIRED');
      }
      const errMsg = response?.error || 'Failed to read chunk from extension';
      throw new Error(errMsg);
    }

    // 1. Prefer base64 string (Chrome extension cross-origin IPC serializes ArrayBuffer as an empty object {})
    if (typeof response.base64 === 'string') {
      if (response.base64.length === 0) {
        return new ArrayBuffer(0);
      }
      return base64ToArrayBuffer(response.base64);
    }

    if (response.byteLength === 0) {
      return new ArrayBuffer(0);
    }

    const rawBuffer = response.buffer || response.data;
    if (!rawBuffer) {
      throw new Error('Empty chunk data returned from extension');
    }

    return this.parseChunkBuffer(rawBuffer);
  }

  private parseChunkBuffer(rawBuffer: unknown): ArrayBuffer {
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

    // In case serialized as object or array with numeric elements
    if (typeof rawBuffer === 'object' && rawBuffer !== null) {
      const values = Array.from(rawBuffer as ArrayLike<number>);
      if (values.length > 0) {
        return new Uint8Array(values).buffer;
      }
    }

    throw new Error('Unsupported chunk buffer format received from extension');
  }

  /**
   * Fetches list of video items from Extension Media Vault
   */
  public async listVaultVideos(): Promise<VaultVideoItem[]> {
    const isConnected = await this.checkConnection().catch(() => false);
    if (!isConnected) {
      throw new Error('EXTENSION_DISCONNECTED');
    }

    let response: ExtensionVaultVideosResponse;
    try {
      response = await this.dispatchMessage<ExtensionVaultVideosResponse>({
        type: 'GET_VAULT_VIDEOS',
      });
    } catch (err) {
      this.setStatus('error');
      throw err instanceof Error ? err : new Error(String(err));
    }

    if (!response || !response.success) {
      if (response?.error === 'PRO_REQUIRED') {
        this.setProStatus(false);
        throw new Error('PRO_REQUIRED');
      }
      throw new Error(response?.error || 'Failed to fetch vault videos');
    }

    return response.items || [];
  }

  /**
   * Fetches binary poster data for a single vault item
   */
  public async getVaultPoster(
    vaultId: string
  ): Promise<{ buffer: ArrayBuffer; mimeType: string } | null> {
    if (!vaultId) return null;

    const isConnected = await this.checkConnection().catch(() => false);
    if (!isConnected) return null;

    let response: ExtensionVaultPosterResponse;
    try {
      response = await this.dispatchMessage<ExtensionVaultPosterResponse>({
        type: 'GET_VAULT_POSTER',
        vaultId,
      });
    } catch {
      return null;
    }

    if (!response || !response.success) {
      return null;
    }

    let buffer: ArrayBuffer;
    if (typeof response.base64 === 'string') {
      buffer = base64ToArrayBuffer(response.base64);
    } else if (response.buffer instanceof ArrayBuffer) {
      buffer = response.buffer;
    } else {
      try {
        buffer = this.parseChunkBuffer(response.buffer);
      } catch {
        return null;
      }
    }

    return {
      buffer,
      mimeType: response.mimeType || 'image/jpeg',
    };
  }

  /**
   * Creates a streaming clip session in the Extension for a given Media Vault item
   */
  public async createSessionFromVault(
    vaultId: string
  ): Promise<{ sessionId: string; meta?: ClipSessionMeta }> {
    if (!vaultId) {
      throw new Error('Vault ID is required');
    }

    let response: ExtensionCreateSessionResponse;
    try {
      response = await this.dispatchMessage<ExtensionCreateSessionResponse>({
        type: 'CREATE_CLIP_SESSION',
        vaultId,
      });
    } catch (err) {
      this.setStatus('error');
      throw err instanceof Error ? err : new Error(String(err));
    }

    if (!response || !response.success || !response.sessionId) {
      if (response?.error === 'PRO_REQUIRED') {
        this.setProStatus(false);
        throw new Error('PRO_REQUIRED');
      }
      throw new Error(response?.error || 'Failed to create clip session for vault item');
    }

    return {
      sessionId: response.sessionId,
      meta: response.meta,
    };
  }

  /**
   * Dispatches message via configured sendMessageFn or Chrome runtime
   */
  private async dispatchMessage<T>(message: unknown): Promise<T> {
    if (this.sendMessageFn) {
      return (await this.sendMessageFn(this.extensionId || undefined, message)) as T;
    }

    const activeId = this.getActiveExtensionId();
    if (!activeId && typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
      await this.checkConnection().catch(() => false);
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

      // In browser web pages, Chrome requires an extension ID for external messaging
      if (!targetId && typeof window !== 'undefined' && window.location?.protocol?.startsWith('http')) {
        reject(
          new Error(
            'Extension ID is missing. Please ensure the extension URL includes &extId=<extensionId> or install Easy Web Scraper.'
          )
        );
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
