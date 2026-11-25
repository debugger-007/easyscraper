import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  X,
  Zap,
  Sliders,
  AlertCircle,
  Loader2,
  Film,
  ChevronDown,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { useTranslate } from '../../i18n';
import type { ClipMediaSource } from '../../services/clip/types';
import { formatTimecode, type AspectRatioType } from './clipUtils';

// Cached Web Audio routing graph per HTMLVideoElement to prevent InvalidStateError on repeat exports
const audioRoutingMap = new WeakMap<
  HTMLVideoElement,
  {
    audioCtx: AudioContext;
    source: MediaElementAudioSourceNode;
    dest: MediaStreamAudioDestinationNode;
  }
>();

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaSource?: ClipMediaSource | null;
  videoElement?: HTMLVideoElement | null;
  startTime: number;
  endTime: number;
  duration: number;
  aspectRatio: AspectRatioType;
  isMuted: boolean;
  videoWidth?: number;
  videoHeight?: number;
  isPro?: boolean;
}

type ExportMode = 'fast' | 'reencode';
type ExportFormat = 'mp4' | 'webm';
type ExportQuality = 'high' | 'medium' | 'low';
type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  mediaSource,
  videoElement,
  startTime,
  endTime,
  duration,
  aspectRatio,
  isMuted,
  videoWidth = 1920,
  videoHeight = 1080,
  isPro,
}) => {
  const { t } = useTranslate();

  const [exportMode, setExportMode] = useState<ExportMode>(
    aspectRatio === 'original' ? 'fast' : 'reencode'
  );
  const [format, setFormat] = useState<ExportFormat>('mp4');
  const [quality, setQuality] = useState<ExportQuality>('high');
  const [useTrimmedRange, setUseTrimmedRange] = useState<boolean>(true);

  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportedFilename, setExportedFilename] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<boolean>(false);

  // Sync mode when aspect ratio changes
  useEffect(() => {
    if (aspectRatio !== 'original') {
      setExportMode('reencode');
    }
  }, [aspectRatio]);

  // Reset state when modal is closed/opened
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setProgress(0);
      setErrorMessage(null);
      setDownloadUrl(null);
    } else {
      abortControllerRef.current = true;
    }
  }, [isOpen]);

  // Close modal on Escape key when not actively exporting
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'exporting') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, status]);

  if (!isOpen) return null;

  const exportStartTime = useTrimmedRange ? startTime : 0;
  const exportEndTime = useTrimmedRange ? endTime : duration;
  const totalExportTime = Math.max(0.1, exportEndTime - exportStartTime);

  const handleStartExport = async () => {
    if (!videoElement) {
      setStatus('error');
      setErrorMessage(t.clip.exportError);
      return;
    }

    setStatus('exporting');
    setProgress(5);
    setStatusMessage(t.clip.preparingExport);
    setErrorMessage(null);
    abortControllerRef.current = false;

    try {
      const naturalW = videoWidth || videoElement.videoWidth || 1920;
      const naturalH = videoHeight || videoElement.videoHeight || 1080;

      // Determine dimensions based on aspect ratio
      let targetW = naturalW;
      let targetH = naturalH;

      if (aspectRatio === '16:9') {
        targetW = naturalH * (16 / 9);
      } else if (aspectRatio === '9:16') {
        targetW = naturalH * (9 / 16);
      } else if (aspectRatio === '1:1') {
        targetW = Math.min(naturalW, naturalH);
        targetH = targetW;
      } else if (aspectRatio === '4:3') {
        targetW = naturalH * (4 / 3);
      }

      // Even dimensions required for H.264
      targetW = Math.round(targetW / 2) * 2;
      targetH = Math.round(targetH / 2) * 2;

      // Determine bitrate
      let videoBitsPerSecond = 8_000_000;
      if (quality === 'medium') videoBitsPerSecond = 4_000_000;
      if (quality === 'low') videoBitsPerSecond = 2_000_000;

      // Select mimeType
      let mimeType = 'video/mp4;codecs=avc1';
      if (format === 'webm' || (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported(mimeType))) {
        mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      // Prepare canvas stream for re-encode or direct stream
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context creation failed');
      }

      const stream = canvas.captureStream(30);

      // Audio handling
      if (!isMuted) {
        let audioAdded = false;

        // 1. Try native captureStream audio tracks first (direct, zero Web Audio API complexity)
        try {
          const captureStreamFn =
            videoElement.captureStream || videoElement.mozCaptureStream;
          if (typeof captureStreamFn === 'function') {
            const capturedStream: MediaStream = captureStreamFn.call(videoElement);
            const audioTracks = capturedStream.getAudioTracks();
            if (audioTracks.length > 0) {
              audioTracks.forEach((track) => stream.addTrack(track));
              audioAdded = true;
            }
          }
        } catch {
          // Native captureStream not permitted or unavailable, fallback to Web Audio
        }

        // 2. Web Audio fallback with instance caching (prevents InvalidStateError on repeat exports)
        if (!audioAdded && typeof AudioContext !== 'undefined') {
          try {
            let routing = audioRoutingMap.get(videoElement);
            if (!routing) {
              const AudioContextClass = window.AudioContext || window.webkitAudioContext;
              if (!AudioContextClass) {
                throw new Error('AudioContext not supported');
              }
              const audioCtx = new AudioContextClass();
              const source = audioCtx.createMediaElementSource(videoElement);
              const dest = audioCtx.createMediaStreamDestination();
              source.connect(dest);
              // NOTE: Intentionally do NOT connect to audioCtx.destination so export remains silent!
              routing = { audioCtx, source, dest };
              audioRoutingMap.set(videoElement, routing);
            }

            if (routing.audioCtx.state === 'suspended') {
              routing.audioCtx.resume().catch(() => {});
            }

            routing.dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
          } catch (audioErr) {
            console.warn('[ExportModal] Audio track routing skipped:', audioErr);
          }
        }
      }

      const recordedChunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond,
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      const originalTime = videoElement.currentTime;
      const wasPlaying = !videoElement.paused;
      videoElement.pause();

      await new Promise<void>((resolve, reject) => {
        recorder.onstop = () => resolve();
        recorder.onerror = (e) => reject(e);

        videoElement.currentTime = exportStartTime;

        const onSeeked = async () => {
          videoElement.removeEventListener('seeked', onSeeked);

          try {
            recorder.start(100);
            await videoElement.play();

            const checkProgress = () => {
              if (abortControllerRef.current) {
                recorder.stop();
                videoElement.pause();
                return;
              }

              const elapsed = videoElement.currentTime - exportStartTime;
              const currentProg = Math.min(95, Math.max(10, Math.round((elapsed / totalExportTime) * 90)));
              setProgress(currentProg);
              setStatusMessage(`${t.clip.processingFrames} (${formatTimecode(elapsed, false)} / ${formatTimecode(totalExportTime, false)})`);

              // Render current frame to canvas
              ctx.drawImage(videoElement, 0, 0, targetW, targetH);

              if (videoElement.currentTime >= exportEndTime || videoElement.ended) {
                recorder.stop();
                videoElement.pause();
                videoElement.currentTime = originalTime;
                if (wasPlaying) videoElement.play().catch(() => {});
              } else {
                requestAnimationFrame(checkProgress);
              }
            };

            requestAnimationFrame(checkProgress);
          } catch (err) {
            reject(err);
          }
        };

        videoElement.addEventListener('seeked', onSeeked);
      });

      if (abortControllerRef.current) {
        setStatus('idle');
        return;
      }

      setStatusMessage(t.clip.finalizingFile);
      setProgress(98);

      const blob = new Blob(recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const ext = format === 'mp4' ? 'mp4' : 'webm';
      const cleanTitle = (mediaSource?.title || 'video_clip').replace(/\.[^/.]+$/, '');
      const filename = `${cleanTitle}_clip_${Date.now()}.${ext}`;

      setDownloadUrl(url);
      setExportedFilename(filename);
      setProgress(100);
      setStatus('success');

      // Automatically trigger browser download
      triggerBrowserDownload(url, filename);
    } catch (err: unknown) {
      console.error('Export failed:', err);
      setStatus('error');
      const msg = err instanceof Error ? err.message : t.clip.exportError;
      setErrorMessage(msg || t.clip.exportError);
    }
  };

  const triggerBrowserDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 150);
  };

  const handleManualDownload = () => {
    if (downloadUrl && exportedFilename) {
      triggerBrowserDownload(downloadUrl, exportedFilename);
    }
  };

  const redirectToPricing = (e?: React.MouseEvent) => {
    e?.preventDefault();
    onClose();
    if (typeof window !== 'undefined') {
      window.location.href = window.location.pathname.startsWith('/zh') ? '/zh#pricing' : '/#pricing';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/55 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (status !== 'exporting') onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xl overflow-hidden text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 shadow-sm">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-on-surface tracking-tight">
                {t.clip.exportModalTitle}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {t.clip.exportModalDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/25 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={t.clip.closeBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Pro Restriction Banner */}
          {isPro === false && (
            <div className="p-3.5 rounded-xl bg-tertiary-fixed/60 border border-tertiary/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-on-tertiary-fixed">
                <Crown className="w-4 h-4 shrink-0 text-tertiary" />
                <span className="font-medium">{t.clip.exportProRequired}</span>
              </div>
              <a
                href="#pricing"
                onClick={redirectToPricing}
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-[11px] shrink-0 transition-colors"
              >
                {t.clip.upgradeToPro}
              </a>
            </div>
          )}

          {/* Export Mode Selection - 左右严格等高对齐 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface font-code-label uppercase tracking-wider block">
              {t.clip.exportMode}
            </label>
            <div className="grid grid-cols-2 gap-3.5">
              {/* Fast Cut Option */}
              <button
                type="button"
                onClick={() => setExportMode('fast')}
                disabled={aspectRatio !== 'original'}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full min-h-[104px] cursor-pointer ${
                  exportMode === 'fast'
                    ? 'border-primary bg-primary-fixed/25 shadow-sm ring-1 ring-primary/30'
                    : 'border-outline-variant/30 bg-surface-container-low/50 hover:bg-surface-container-low'
                } ${aspectRatio !== 'original' ? 'opacity-45 cursor-not-allowed' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Zap className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold">
                        {t.clip.fastCutTitle}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-code-label bg-primary-fixed text-on-primary-fixed font-medium shrink-0">
                      {t.clip.losslessBadge}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                    {t.clip.fastCutDesc}
                  </p>
                </div>
              </button>

              {/* Smart Re-encode Option */}
              <button
                type="button"
                onClick={() => setExportMode('reencode')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full min-h-[104px] cursor-pointer ${
                  exportMode === 'reencode'
                    ? 'border-secondary bg-secondary-container/35 shadow-sm ring-1 ring-secondary/30'
                    : 'border-outline-variant/30 bg-surface-container-low/50 hover:bg-surface-container-low'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 text-secondary">
                      <Sliders className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold">
                        {t.clip.smartEncodeTitle}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-code-label bg-secondary-container text-on-secondary-container font-medium shrink-0">
                      {t.clip.cropBadge}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                    {t.clip.smartEncodeDesc}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Export Settings Grid - 高度与对齐严格对标 h-10 */}
          <div className="grid grid-cols-2 gap-4 items-start">
            {/* Format Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold font-code-label text-on-surface-variant block">
                {t.clip.exportFormat}
              </label>
              <div className="h-10 flex rounded-lg bg-surface-container-low p-1 border border-outline-variant/25 items-center">
                <button
                  type="button"
                  onClick={() => setFormat('mp4')}
                  className={`flex-1 h-full flex items-center justify-center text-xs font-code-label font-medium rounded-md transition-all cursor-pointer ${
                    format === 'mp4'
                      ? 'bg-primary-fixed text-on-primary-fixed font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  MP4
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('webm')}
                  className={`flex-1 h-full flex items-center justify-center text-xs font-code-label font-medium rounded-md transition-all cursor-pointer ${
                    format === 'webm'
                      ? 'bg-primary-fixed text-on-primary-fixed font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  WebM
                </button>
              </div>
            </div>

            {/* Quality Selection - 高度完全对齐 h-10 并定制右侧箭头 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold font-code-label text-on-surface-variant block">
                {t.clip.exportQuality}
              </label>
              <div className="relative h-10 w-full">
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as ExportQuality)}
                  className="h-10 w-full appearance-none pl-3.5 pr-8 rounded-lg bg-surface-container-low border border-outline-variant/25 text-xs font-medium text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="high">{t.clip.qualityHigh}</option>
                  <option value="medium">{t.clip.qualityMedium}</option>
                  <option value="low">{t.clip.qualityLow}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Export Range - 均分等宽对齐 h-10 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold font-code-label text-on-surface-variant block">
              {t.clip.exportRange}
            </label>
            <div className="h-10 grid grid-cols-2 gap-1 rounded-lg bg-surface-container-low p-1 border border-outline-variant/25">
              <button
                type="button"
                onClick={() => setUseTrimmedRange(true)}
                className={`h-full flex items-center justify-center gap-1.5 px-3 text-xs font-medium rounded-md transition-all cursor-pointer truncate ${
                  useTrimmedRange
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{t.clip.exportRangeTrimmed}</span>
                <span className="font-code-label text-[11px] opacity-85">({formatTimecode(totalExportTime, false)})</span>
              </button>
              <button
                type="button"
                onClick={() => setUseTrimmedRange(false)}
                className={`h-full flex items-center justify-center gap-1.5 px-3 text-xs font-medium rounded-md transition-all cursor-pointer truncate ${
                  !useTrimmedRange
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{t.clip.exportRangeFull}</span>
                <span className="font-code-label text-[11px] opacity-85">({formatTimecode(duration, false)})</span>
              </button>
            </div>
          </div>

          {/* Active Progress Display */}
          {status === 'exporting' && (
            <div className="p-4 rounded-xl bg-primary-fixed/25 border border-primary/25 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-code-label">
                <span className="flex items-center gap-2 text-primary font-medium">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span className="truncate">{statusMessage}</span>
                </span>
                <span className="font-code-label text-primary font-bold shrink-0">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-200 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Export Success Card - 彻底解决超长文件名内容溢出问题 */}
          {status === 'success' && (
            <div className="p-4 rounded-xl bg-primary-fixed/35 border border-primary/30 flex items-center justify-between gap-4 overflow-hidden animate-in fade-in duration-150">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-on-primary-fixed tracking-tight">
                    {t.clip.exportSuccess}
                  </h4>
                  <p
                    className="text-xs text-on-surface-variant font-code-label truncate mt-0.5"
                    title={exportedFilename}
                  >
                    {exportedFilename}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualDownload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shrink-0 cursor-pointer shadow-md shadow-primary/20 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{t.clip.downloadBtn}</span>
              </button>
            </div>
          )}

          {/* Export Error Card */}
          {status === 'error' && (
            <div className="p-4 rounded-xl bg-error-container/70 border border-error/25 flex items-center gap-3 text-on-error-container text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-error" />
              <span className="font-medium">{errorMessage || t.clip.exportError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{t.clip.exportSecurityNote}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/30 transition-colors cursor-pointer font-medium"
            >
              {status === 'success' ? t.clip.closeBtn : t.clip.cancelBtn}
            </button>

            {status !== 'success' && (
              <button
                type="button"
                onClick={isPro === false ? redirectToPricing : handleStartExport}
                disabled={status === 'exporting'}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPro === false ? (
                  <>
                    <Crown className="w-3.5 h-3.5" />
                    <span>{t.clip.upgradeToPro}</span>
                  </>
                ) : status === 'exporting' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.clip.exporting}</span>
                  </>
                ) : (
                  <>
                    <Film className="w-3.5 h-3.5" />
                    <span>{t.clip.startExportBtn}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
