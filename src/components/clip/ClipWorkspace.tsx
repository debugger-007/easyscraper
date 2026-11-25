import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
  Radio,
  HardDrive,
  Scissors,
  Crown,
  Lock,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ExternalLink,
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
import {
  formatBytes,
  formatTimecode,
  type AspectRatioType,
  checkClipBrowserSupport,
  type ClipBrowserSupport,
} from './clipUtils';

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

  // Browser Native API Support State
  const [browserSupport] = useState<ClipBrowserSupport>(() => checkClipBrowserSupport());
  const [dismissedBrowserWarning, setDismissedBrowserWarning] = useState<boolean>(false);

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
    if (!browserSupport.isChromium) return;
    loadSource(session, url, targetExtId);
  }, [browserSupport.isChromium, session, url, targetExtId, loadSource]);

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
      className={`relative overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-6 sm:p-8 shadow-md ${
        variant === 'banner' ? 'my-2' : 'flex-1 min-h-[440px] flex items-center justify-center'
      }`}
    >
      {/* Decorative ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-tertiary-fixed/45 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto w-full">
        <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed border border-tertiary/20 flex items-center justify-center mb-4 shadow-sm">
          <Crown className="w-7 h-7 text-tertiary" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-code-label bg-tertiary-fixed text-on-tertiary-fixed font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-tertiary" />
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
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface"
            >
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#pricing"
            onClick={handleUpgradeClick}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs tracking-wide shadow-md shadow-primary/20 transition-all cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-xs font-medium text-on-surface transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRecheckingPermission ? 'animate-spin' : ''}`} />
            <span>{isRecheckingPermission ? t.clip.checkingPermission : t.clip.recheckPermission}</span>
          </button>
        </div>

        <p className="text-[11px] font-code-label text-on-surface-variant/80 mt-4">
          {t.clip.activateInExtension}
        </p>
      </div>
    </div>
  );

  const renderNoExtensionNotice = () => (
    <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-6 sm:p-8 text-center max-w-xl mx-auto my-4 shadow-md">
      <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-3">
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
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecheckingPermission ? 'animate-spin' : ''}`} />
          <span>{isRecheckingPermission ? t.clip.checkingPermission : t.clip.connectExtensionBtn}</span>
        </button>
        <a
          href="#pricing"
          onClick={handleUpgradeClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-xs font-medium text-on-surface transition-colors cursor-pointer"
        >
          <Crown className="w-3.5 h-3.5 text-tertiary" />
          <span>{t.clip.upgradeToPro}</span>
        </a>
      </div>
    </div>
  );

  const renderUnsupportedBrowserNotice = () => (
    <div className="relative overflow-hidden rounded-2xl bg-amber-50/90 border border-amber-300/70 p-6 sm:p-7 text-center max-w-2xl mx-auto my-2 shadow-md">
      <div className="relative flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300/70 flex items-center justify-center mb-3 text-amber-700">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-code-label bg-amber-100 text-amber-900 border border-amber-300/60 mb-2">
          {t.clip.unsupportedBrowserTitle}
        </span>

        <h3 className="text-base sm:text-lg font-bold text-on-surface mb-2">
          {t.clip.unsupportedBrowserTitle}
        </h3>

        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mb-3 leading-relaxed">
          {t.clip.unsupportedBrowserDesc}
        </p>

        {browserSupport.missingApis.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-amber-300/60 text-[11px] font-code-label text-amber-900 mb-5">
            <span>{t('clip.unsupportedBrowserReason', { apis: browserSupport.missingApis.join(', ') })}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://www.google.com/chrome/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-sm transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.clip.unsupportedBrowserActionChrome}</span>
          </a>

          <a
            href="https://www.microsoft.com/edge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/35 text-xs font-medium text-on-surface transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
            <span>{t.clip.unsupportedBrowserActionEdge}</span>
          </a>

          <button
            type="button"
            onClick={() => setDismissedBrowserWarning(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <span>{t.clip.unsupportedBrowserContinueAnyway}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDropZone = (compact = false) => (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-2xl space-y-4 transition-all cursor-pointer ${
        compact ? 'p-10 min-h-[380px]' : 'p-12 min-h-[460px]'
      } ${
        isDraggingOver
          ? 'border-primary bg-primary-fixed/20 scale-[1.005]'
          : 'border-outline-variant/50 hover:border-primary/60 bg-surface-container-lowest shadow-sm'
      }`}
    >
      <div className={`${compact ? 'w-14 h-14' : 'w-16 h-16'} rounded-2xl bg-primary-fixed/40 flex items-center justify-center text-primary`}>
        <Upload className={compact ? 'w-7 h-7' : 'w-8 h-8'} />
      </div>
      <div className="space-y-1">
        <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-on-surface`}>
          {isDraggingOver ? t.clip.dragActive : t.clip.dropToImport}
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm">
          {t.clip.supportedFormats}
        </p>
      </div>
      <button
        type="button"
        className={`rounded-lg bg-primary hover:bg-primary-container text-xs font-semibold text-on-primary transition-colors ${
          compact ? 'px-4 py-2 shadow-sm' : 'px-5 py-2.5 shadow-md shadow-primary/20'
        }`}
      >
        {t.clip.selectLocalFile}
      </button>
    </div>
  );

  const renderNonChromiumGate = () => (
    <div className="flex-1 flex items-center justify-center py-8">
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-8 sm:p-10 text-center max-w-xl w-full shadow-md">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary-fixed/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300/70 flex items-center justify-center mb-4 text-amber-700 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-code-label font-medium bg-secondary-container text-on-secondary-container mb-3">
            {t.clip.nonChromiumBadge}
          </span>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            {t.clip.nonChromiumTitle}
          </h2>

          <p className="text-xs sm:text-sm text-on-surface-variant mt-3 max-w-lg leading-relaxed">
            {t.clip.nonChromiumDesc}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.google.com/chrome/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t.clip.nonChromiumDownloadChrome}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-85" />
            </a>
          </div>

          <p className="text-[11px] font-code-label text-on-surface-variant/80 mt-5">
            {t.clip.nonChromiumTip}
          </p>
        </div>
      </div>
    </div>
  );

  if (!browserSupport.isChromium) {
    return renderNonChromiumGate();
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Browser API Unsupported Warning Banner */}
      {!browserSupport.isSupported && !dismissedBrowserWarning && renderUnsupportedBrowserNotice()}

      {/* 1. Studio Top Control Header (Botanical Precision) */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-code-label font-medium bg-secondary-container text-on-secondary-container">
              <Scissors className="w-3 h-3" />
              {t.clip.title}
            </span>

            {mediaSource?.type === 'extension' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-code-label font-medium bg-primary-fixed text-on-primary-fixed">
                <Radio className="w-3 h-3 animate-pulse" />
                {t.clip.extensionReady}
              </span>
            )}

            {mediaSource?.type === 'local' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-code-label font-medium bg-primary-fixed text-on-primary-fixed">
                <HardDrive className="w-3 h-3" />
                {t.clip.readyToEdit}
              </span>
            )}

            {permissionStatus === 'authorized' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-code-label font-medium bg-tertiary-fixed text-on-tertiary-fixed">
                <Crown className="w-3 h-3 text-tertiary" />
                {t.clip.proBadge}
              </span>
            )}

            {permissionStatus === 'unauthorized' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-code-label font-medium bg-error-container text-on-error-container">
                <Lock className="w-3 h-3" />
                {t.clip.proRequiredTitle}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-[32px] leading-tight font-bold tracking-tight text-on-surface mt-0.5 truncate">
            {mediaSource?.title || t.clip.title}
          </h1>

          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            {t.clip.subtitle}
          </p>

          {/* Video Metadata Pills */}
          {mediaSource && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs font-code-label text-on-surface-variant">
              {mediaSource.size > 0 && (
                <span>
                  {t.clip.fileSize}:{' '}
                  <strong className="text-on-surface font-semibold">{formatBytes(mediaSource.size)}</strong>
                </span>
              )}
              {mediaSource.size > 0 && duration > 0 && (
                <span className="text-outline-variant select-none">·</span>
              )}
              {duration > 0 && (
                <span>
                  {t.clip.videoDuration}:{' '}
                  <strong className="text-on-surface font-semibold">{formatTimecode(duration, false)}</strong>
                </span>
              )}
              {videoMeta && (
                <>
                  <span className="text-outline-variant select-none">·</span>
                  <span>
                    {t.clip.resolution}:{' '}
                    <strong className="text-on-surface font-semibold">
                      {videoMeta.width}x{videoMeta.height}
                    </strong>
                  </span>
                </>
              )}
              {mediaSource.mimeType && (
                <>
                  <span className="text-outline-variant select-none">·</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-[10px] font-code-label">
                    {mediaSource.mimeType}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsVaultModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant/25 hover:bg-surface-container-low text-xs font-medium transition-colors cursor-pointer"
            title={t.clip.replaceVideo}
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            <span>{t.clip.replaceVideo}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant/25 hover:bg-surface-container-low text-xs font-medium transition-colors cursor-pointer"
            title={t.clip.importVideo}
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
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
            className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
              permissionStatus === 'unauthorized'
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-sm'
                : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-md shadow-primary/20'
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
      </section>

      {/* Main Workspace Stage */}
      {status === 'connecting' && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm min-h-[460px]">
          <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed/60 text-primary flex items-center justify-center shadow-sm">
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
          {!browserSupport.isSupported ? (
            renderUnsupportedBrowserNotice()
          ) : permissionStatus === 'unauthorized' || errorMessage === 'PRO_REQUIRED' ? (
            renderProPaywall('card')
          ) : permissionStatus === 'no_extension' && session ? (
            renderNoExtensionNotice()
          ) : (
            <div className="p-4 rounded-xl bg-error-container/70 border border-error/25 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1 text-xs">
                <h4 className="font-bold text-on-error-container">{t.clip.sessionError}</h4>
                <p className="text-on-error-container/85">{errorMessage || t.clip.extensionNotFound}</p>
              </div>
            </div>
          )}

          {/* Fallback Drop Zone (shown only when not blocked by paywall) */}
          {permissionStatus !== 'unauthorized' && errorMessage !== 'PRO_REQUIRED' && renderDropZone(true)}
        </div>
      )}

      {status === 'idle' && renderDropZone(false)}

      {status === 'ready' && streamUrl && (
        <div className="flex-1 flex flex-col gap-6">
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
