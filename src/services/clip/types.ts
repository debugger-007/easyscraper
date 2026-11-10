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
  mergedSize?: number;
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

export type ProPermissionStatus = 'checking' | 'authorized' | 'unauthorized' | 'no_extension';

export interface ExtensionPingResponse {
  success: boolean;
  pong?: boolean;
  version?: string;
  isPro?: boolean;
  plan?: string;
  licenseStatus?: string;
  error?: string;
}

export interface ExtensionPermissionResponse {
  success: boolean;
  isPro: boolean;
  plan?: string;
  licenseStatus?: string;
  expiresAt?: number | null;
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
  isPro?: boolean;
  error?: string;
}

export interface ExtensionChunkResponse {
  success: boolean;
  buffer?: ArrayBuffer | ArrayLike<number>;
  data?: ArrayBuffer | ArrayLike<number>;
  base64?: string;
  byteLength?: number;
  error?: string;
}

export interface VaultVideoItem {
  id: string;
  title: string;
  format: string;
  size: number;
  mergedSize?: number;
  sizeFormatted?: string;
  duration?: number;
  resolution?: string;
  poster?: string;
  createdAt?: number;
  isMerged?: boolean;
}

export interface ExtensionVaultVideosResponse {
  success: boolean;
  items?: VaultVideoItem[];
  error?: string;
}

export interface ExtensionVaultPosterResponse {
  success: boolean;
  base64?: string;
  mimeType?: string;
  buffer?: ArrayBuffer;
  byteLength?: number;
  error?: string;
}

export interface SwRequestPosterMessage {
  type: 'SW_REQUEST_POSTER';
  requestId: string;
  vaultId: string;
}

export interface SwResponsePosterMessage {
  type: 'SW_RESPONSE_POSTER';
  requestId: string;
  success: boolean;
  buffer?: ArrayBuffer;
  mimeType?: string;
  byteLength?: number;
  error?: string;
}

export interface ExtensionCreateSessionResponse {
  success: boolean;
  sessionId?: string;
  meta?: ClipSessionMeta;
  error?: string;
}

export type ExtensionSendMessageFn = (
  extensionId: string | undefined,
  message: unknown
) => Promise<unknown>;

export type ServiceWorkerBridgeStatus =
  | 'idle'
  | 'unsupported'
  | 'registering'
  | 'active'
  | 'error';

export interface VirtualClipMeta {
  sessionId: string;
  size: number;
  mimeType: string;
  title?: string;
  duration?: number;
}

export interface SwRequestChunkMessage {
  type: 'SW_REQUEST_CHUNK';
  requestId: string;
  sessionId: string;
  start: number;
  end?: number;
}

export interface SwResponseChunkMessage {
  type: 'SW_RESPONSE_CHUNK';
  requestId: string;
  success: boolean;
  buffer?: ArrayBuffer;
  byteLength?: number;
  error?: string;
}

export interface SwRequestMetaMessage {
  type: 'SW_REQUEST_META';
  requestId: string;
  sessionId: string;
}

export interface SwResponseMetaMessage {
  type: 'SW_RESPONSE_META';
  requestId: string;
  success: boolean;
  meta?: VirtualClipMeta;
  error?: string;
}

export interface SwRegisterSessionMessage {
  type: 'REGISTER_SESSION';
  sessionId: string;
  meta: VirtualClipMeta;
}

export interface SwUnregisterSessionMessage {
  type: 'UNREGISTER_SESSION';
  sessionId: string;
}

export type SwIncomingMessage =
  | SwRequestChunkMessage
  | SwRequestMetaMessage
  | SwRequestPosterMessage
  | SwResponseChunkMessage
  | SwResponseMetaMessage
  | SwResponsePosterMessage
  | SwRegisterSessionMessage
  | SwUnregisterSessionMessage;

