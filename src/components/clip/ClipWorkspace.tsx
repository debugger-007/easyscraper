import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  Upload,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileVideo,
  Radio,
  HardDrive,
  Scissors,
  Crown,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useTranslate } from '../../i18n';
import { MediaSourceResolver } from '../../services/clip/MediaSourceResolver';
import { defaultServiceWorkerBridge } from '../../services/clip/ServiceWorkerBridge';
import { defaultExtensionBridge } from '../../services/clip/ExtensionBridgeAdapter';
import type { ClipMediaSource, ProPermissionStatus } from '../../services/clip/types';
import { VideoPreview, type VideoMetadata } from './VideoPreview';
import { VideoTimeline } from './VideoTimeline';
import { ExportModal } from './ExportModal';
import { MediaVaultModal } from './MediaVaultModal';
import { formatBytes, formatTimecode, type AspectRatioType } from './clipUtils';

export interface ClipWorkspaceProps {
  session?: string;
  url?: string;
  extId?: string;
  extensionId?: string;
}

type WorkspaceStatus = 'idle' | 'connecting' | 'ready' | 'error';

export const ClipWorkspace: React.FC<ClipWorkspaceProps> = ({
  session,
  url,
  extId,
  extensionId,
}) => {
  const { t } = useTranslate();
  const targetExtId = extId || extensionId;

  const [status, setStatus] = useState<WorkspaceStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaSource, setMediaSource] = useState<ClipMediaSource | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  // Pro Permission State
  const [permissionStatus, setPermissionStatus] = useState<ProPermissionStatus>('checking');
  const [isPro, setIsPro] = useState<boolean | null>(defaultExtensionBridge.getIsPro());
  const [isRecheckingPermission, setIsRecheckingPermission] = useState<boolean>(false);

  // Playback & Edit State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('original');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoMeta, setVideoMeta] = useState<VideoMetadata | null>(null);

  // Drag and Drop Zone State
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const handleUpgradeClick = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      const isZh = window.location.pathname.startsWith('/zh');
      window.location.href = isZh ? '/zh#pricing' : '/#pricing';
    }
  }, []);

  // Permission verification during communication
  const verifyPermission = useCallback(async () => {
    try {
      if (targetExtId) {
        defaultExtensionBridge.setExtensionId(targetExtId);
      }
      const perm = await defaultExtensionBridge.checkPermission();
      if (perm.isPro) {
        setIsPro(true);
        setPermissionStatus('authorized');
        return true;
      }

      if (defaultExtensionBridge.getStatus() === 'disconnected') {
        setPermissionStatus('no_extension');
        setIsPro(null);
        return false;
      }

      setIsPro(false);
      setPermissionStatus('unauthorized');
      return false;
    } catch {
      if (defaultExtensionBridge.getStatus() === 'disconnected') {
        setPermissionStatus('no_extension');
        setIsPro(null);
      } else {
        setIsPro(false);
        setPermissionStatus('unauthorized');
      }
      return false;
    }
  }, [targetExtId]);

  // Synchronize bridge permission changes
  useEffect(() => {
    const unsub = defaultExtensionBridge.onPermissionChange((pro) => {
      setIsPro(pro);
      if (pro === true) {
        setPermissionStatus('authorized');
      } else if (pro === false) {
        setPermissionStatus('unauthorized');
      }
    });
    return unsub;
  }, []);

  // Initialize and load session or URL
  const loadSource = useCallback(
    async (targetSession?: string, targetUrl?: string, targetExt?: string) => {
      if (!targetSession && !targetUrl) {
        setStatus('idle');
        return;
      }

      setStatus('connecting');
      setErrorMessage(null);

      if (targetExt) {
        defaultExtensionBridge.setExtensionId(targetExt);
      }

      // Check Pro permissions during communication
      await verifyPermission();

      try {
        let source: ClipMediaSource;
        if (targetSession) {
          source = await MediaSourceResolver.resolve({
            session: targetSession,
            extensionId: targetExt,
          });
        } else if (targetUrl) {
          source = await MediaSourceResolver.resolve({ url: targetUrl });
        } else {
          return;
        }

        const playableUrl = await defaultServiceWorkerBridge.registerStreamSource(source);

        setMediaSource(source);
        setStreamUrl(playableUrl);
        setStatus('ready');

        // Initial duration if available in metadata
        if (source.duration && source.duration > 0) {
          setDuration(source.duration);
          setEndTime(source.duration);
        }
      } catch (err) {
        setStatus('error');
        const isProReq =
          err instanceof Error &&
          (err.message === 'PRO_REQUIRED' || err.message.includes('PRO_REQUIRED'));

        if (isProReq) {
          setIsPro(false);
          setPermissionStatus('unauthorized');
          setErrorMessage('PRO_REQUIRED');
        } else {
          setErrorMessage(
            err instanceof Error ? err.message : t.clip.sessionError
          );
        }
      }
    },
    [t.clip.sessionError, verifyPermission]
  );

  useEffect(() => {
    loadSource(session, url, targetExtId);
  }, [session, url, targetExtId, loadSource]);

  // Handle local file selection
  const handleFileImport = async (file: File) => {
    setStatus('connecting');
    setErrorMessage(null);

    // Validate Pro permission during local file import as well
    await verifyPermission();

    try {
      const source = MediaSourceResolver.resolveFile(file);
      const playableUrl = await defaultServiceWorkerBridge.registerStreamSource(source);

      setMediaSource(source);
      setStreamUrl(playableUrl);
      setCurrentTime(0);
      setStartTime(0);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t.clip.sessionError);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
  };

  const handleSelectVaultSession = (newSessionId: string) => {
    setCurrentTime(0);
    setStartTime(0);
    loadSource(newSessionId, undefined, targetExtId);

    // Smoothly update browser URL search params without reload
    if (typeof window !== 'undefined' && window.history?.pushState) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('session', newSessionId);
      currentUrl.searchParams.delete('url');
      window.history.pushState({}, '', currentUrl.toString());
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileImport(file);
    }
  };

  // Video playback callbacks
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    if (endTime === 0 || endTime > newDuration) {
      setEndTime(newDuration);
    }
  };

  const handleTrimChange = (newStart: number, newEnd: number) => {
    setStartTime(newStart);
    setEndTime(newEnd);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
  };

  const handleVideoMetadata = (meta: VideoMetadata) => {
    setVideoMeta(meta);
    if (meta.duration > 0 && duration === 0) {
      setDuration(meta.duration);
      setEndTime(meta.duration);
    }
  };

  const renderProPaywall = (variant: 'card' | 'banner' = 'card') => (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-surface-container-high/90 via-surface-container/90 to-surface-container-lowest border border-amber-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl ${
        variant === 'banner' ? 'my-3' : 'flex-1 min-h-[440px] flex items-center justify-center'
      }`}
    >
      {/* Decorative ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto w-full">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(245,158,11,0.25)]">
          <Crown className="w-7 h-7 text-amber-400" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-code-label bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {t.clip.proBadge}
        </span>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
          {t.clip.proRequiredTitle}
        </h2>

        <p className="text-xs sm:text-sm text-on-surface-variant mt-2 max-w-xl leading-relaxed">
          {t.clip.proRequiredSubtitle}
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full my-6 text-left">
          {[
            t.clip.proFeature1,
            t.clip.proFeature2,
            t.clip.proFeature3,
            t.clip.proFeature4,
          ].map((feat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container/60 border border-outline-variant/20 text-xs text-on-surface font-code-label"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#pricing"
            onClick={handleUpgradeClick}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider font-code-label shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.clip.upgradeToPro}</span>
          </a>

          <button
            type="button"
            onClick={async () => {
              setIsRecheckingPermission(true);
              await verifyPermission();
              setIsRecheckingPermission(false);
            }}
            disabled={isRecheckingPermission}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-code-label text-on-surface transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecheckingPermission ? 'animate-spin' : ''}`} />
            <span>{isRecheckingPermission ? t.clip.checkingPermission : t.clip.recheckPermission}</span>
          </button>
        </div>

        <p className="text-[11px] font-code-label text-on-surface-variant/70 mt-4">
          {t.clip.activateInExtension}
        </p>
      </div>
    </div>
  );

  const renderNoExtensionNotice = () => (
    <div className="relative overflow-hidden rounded-2xl bg-surface-container/70 border border-outline-variant/30 p-6 sm:p-8 text-center max-w-xl mx-auto my-4 shadow-xl">
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
        <Radio className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-on-surface mb-1.5">
        {t.clip.extensionNotFound}
      </h3>
      <p className="text-xs text-on-surface-variant mb-5 leading-relaxed">
        {t.clip.noExtensionNotice}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={async () => {
            setIsRecheckingPermission(true);
            await verifyPermission();
            setIsRecheckingPermission(false);
          }}
          disabled={isRecheckingPermission}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs font-code-label transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecheckingPermission ? 'animate-spin' : ''}`} />
          <span>{isRecheckingPermission ? t.clip.checkingPermission : t.clip.connectExtensionBtn}</span>
        </button>
        <a
          href="#pricing"
          onClick={handleUpgradeClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-code-label text-on-surface transition-colors cursor-pointer"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.clip.upgradeToPro}</span>
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex-1 w-full flex flex-col gap-5">
      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Studio Top Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-outline-variant/20">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-code-label bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Video className="w-3 h-3" />
              {t.clip.title}
            </span>

            {mediaSource?.type === 'extension' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-code-label bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                {t.clip.extensionReady}
              </span>
            )}

            {mediaSource?.type === 'local' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-code-label bg-secondary/10 text-secondary border border-secondary/20">
                <HardDrive className="w-2.5 h-2.5" />
                {t.clip.readyToEdit}
              </span>
            )}

            {permissionStatus === 'authorized' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-code-label bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Crown className="w-2.5 h-2.5 text-amber-400" />
                {t.clip.proBadge}
              </span>
            )}

            {permissionStatus === 'unauthorized' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-code-label bg-rose-500/10 text-rose-300 border border-rose-500/30">
                <Lock className="w-2.5 h-2.5 text-rose-400" />
                {t.clip.proRequiredTitle}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            {mediaSource?.title || t.clip.title}
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 max-w-2xl">
            {t.clip.subtitle}
          </p>

          {/* Video Metadata Pills */}
          {mediaSource && (
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-code-label text-on-surface-variant">
              {mediaSource.size > 0 && (
                <span>
                  {t.clip.fileSize}:{' '}
                  <strong className="text-on-surface">{formatBytes(mediaSource.size)}</strong>
                </span>
              )}
              {duration > 0 && (
                <span>
                  {t.clip.videoDuration}:{' '}
                  <strong className="text-on-surface">{formatTimecode(duration, false)}</strong>
                </span>
              )}
              {videoMeta && (
                <span>
                  {t.clip.resolution}:{' '}
                  <strong className="text-on-surface">
                    {videoMeta.width}x{videoMeta.height}
                  </strong>
                </span>
              )}
              {mediaSource.mimeType && (
                <span className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-[10px]">
                  {mediaSource.mimeType}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsVaultModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
            title={t.clip.replaceVideo}
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.clip.replaceVideo}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
            title={t.clip.importVideo}
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.clip.importVideo}</span>
          </button>

          <button
            type="button"
            onClick={
              permissionStatus === 'unauthorized'
                ? handleUpgradeClick
                : () => setIsExportOpen(true)
            }
            disabled={status !== 'ready' || !streamUrl}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-code-label font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              permissionStatus === 'unauthorized'
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-primary text-on-primary hover:bg-primary/90 shadow-md shadow-primary/20'
            }`}
          >
            {permissionStatus === 'unauthorized' ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>{t.clip.exportVideo} (PRO)</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{t.clip.exportVideo}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Stage */}
      {status === 'connecting' && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/60 min-h-[460px]">
          <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-on-surface">
                {t.clip.connectingExtension}
              </h3>
              {url && (
                <p className="text-xs text-on-surface-variant font-code-label truncate max-w-sm">
                  {url}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex-1 flex flex-col gap-6">
          {permissionStatus === 'unauthorized' || errorMessage === 'PRO_REQUIRED' ? (
            renderProPaywall('card')
          ) : permissionStatus === 'no_extension' && session ? (
            renderNoExtensionNotice()
          ) : (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1 text-xs">
                <h4 className="font-bold text-rose-300">{t.clip.sessionError}</h4>
                <p className="text-on-surface-variant">{errorMessage || t.clip.extensionNotFound}</p>
              </div>
            </div>
          )}

          {/* Fallback Drop Zone (shown only when not blocked by paywall) */}
          {permissionStatus !== 'unauthorized' && errorMessage !== 'PRO_REQUIRED' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-2xl space-y-4 transition-all cursor-pointer min-h-[380px] ${
                isDraggingOver
                  ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                  : 'border-outline-variant/40 hover:border-cyan-400/50 bg-surface-container-lowest/40'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-cyan-400">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-on-surface">
                  {isDraggingOver ? t.clip.dragActive : t.clip.dropToImport}
                </h3>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  {t.clip.supportedFormats}
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface border border-outline-variant/40 transition-colors"
              >
                {t.clip.selectLocalFile}
              </button>
            </div>
          )}
        </div>
      )}

      {status === 'idle' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-2xl space-y-4 transition-all cursor-pointer min-h-[460px] ${
            isDraggingOver
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
              : 'border-outline-variant/40 hover:border-cyan-400/50 bg-surface-container-lowest/40'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <Upload className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-on-surface">
              {isDraggingOver ? t.clip.dragActive : t.clip.dropToImport}
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm">
              {t.clip.supportedFormats}
            </p>
          </div>
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface border border-outline-variant/40 transition-colors shadow-md"
          >
            {t.clip.selectLocalFile}
          </button>
        </div>
      )}

      {status === 'ready' && streamUrl && (
        <div className="flex-1 flex flex-col gap-4">
          {/* Pro Paywall Banner when unauthorized */}
          {permissionStatus === 'unauthorized' && renderProPaywall('banner')}

          {/* Video Preview Monitor */}
          <VideoPreview
            src={streamUrl}
            currentTime={currentTime}
            duration={duration}
            startTime={startTime}
            endTime={endTime}
            aspectRatio={aspectRatio}
            isMuted={isMuted}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onDurationChange={handleDurationChange}
            onPlayPause={setIsPlaying}
            onToggleMute={() => setIsMuted(!isMuted)}
            onAspectRatioChange={setAspectRatio}
            videoRef={videoElementRef}
            onVideoMetadata={handleVideoMetadata}
          />

          {/* Interactive Timeline & Trim Scrubber */}
          <div className="relative z-30 w-full">
            <VideoTimeline
              videoUrl={streamUrl}
              currentTime={currentTime}
              duration={duration}
              startTime={startTime}
              endTime={endTime}
              isPlaying={isPlaying}
              aspectRatio={aspectRatio}
              videoWidth={videoMeta?.width}
              videoHeight={videoMeta?.height}
              onSeek={handleSeek}
              onTrimChange={handleTrimChange}
              onPlayPause={setIsPlaying}
            />
          </div>
        </div>
      )}

      {/* Export Modal Dialogue */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        mediaSource={mediaSource}
        videoElement={videoElementRef.current}
        startTime={startTime}
        endTime={endTime}
        duration={duration}
        aspectRatio={aspectRatio}
        isMuted={isMuted}
        videoWidth={videoMeta?.width}
        videoHeight={videoMeta?.height}
        isPro={permissionStatus === 'authorized'}
      />

      {/* Media Vault Switch Video Modal */}
      <MediaVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onSelectSession={handleSelectVaultSession}
        currentVaultId={mediaSource?.sessionId}
        extensionId={targetExtId}
      />
    </div>
  );
};
