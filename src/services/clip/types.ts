/**
 * Types and interfaces for Website Clip Media Sources & Extension Bridge
 */

export type MediaSourceType = 'local' | 'extension' | 'url';

export interface ClipMediaSource {
  type: MediaSourceType;
  title: string;
  size: number;
  mimeType: string;
  duration?: number;
  readChunk(start: number, end?: number): Promise<ArrayBuffer>;
  url?: string;
  sessionId?: string;
  file?: File;
}

export interface ClipSessionMeta {
  sessionId: string;
  id?: string;
  title: string;
  size: number;
  sizeFormatted?: string;
  format: string;
  mimeType: string;
  duration?: number;
  opfsPath?: string;
  createdAt?: number;
  expiresAt?: number;
}

export interface ResolveMediaOptions {
  file?: File;
  session?: string;
  url?: string;
  extensionId?: string;
}

export type BridgeStatus = 'idle' | 'probing' | 'connected' | 'disconnected' | 'error';

export interface ExtensionPingResponse {
  success: boolean;
  pong?: boolean;
  version?: string;
  error?: string;
}

export interface ExtensionMetaResponse {
  success: boolean;
  meta?: ClipSessionMeta;
  title?: string;
  size?: number;
  format?: string;
  mimeType?: string;
  duration?: number;
  error?: string;
}

export interface ExtensionChunkResponse {
  success: boolean;
  buffer?: ArrayBuffer | ArrayLike<number>;
  data?: ArrayBuffer | ArrayLike<number>;
  byteLength?: number;
  error?: string;
}

export type ExtensionSendMessageFn = (
  extensionId: string | undefined,
  message: unknown
) => Promise<unknown>;
