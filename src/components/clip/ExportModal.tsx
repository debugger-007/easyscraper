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
  Sparkles,
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
            (videoElement as any).captureStream || (videoElement as any).mozCaptureStream;
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
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    } catch (err: any) {
      console.error('Export failed:', err);
      setStatus('error');
      setErrorMessage(err?.message || t.clip.exportError);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-surface-container/95 border border-outline-variant/40 shadow-2xl overflow-hidden text-on-surface backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-on-surface tracking-tight">
                {t.clip.exportModalTitle}
              </h3>
              <p className="text-xs text-on-surface-variant font-code-label mt-0.5">
                {t.clip.exportModalDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
            aria-label={t.clip.closeBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Pro Restriction Banner */}
          {isPro === false && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <Crown className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{t.clip.exportProRequired}</span>
              </div>
              <a
                href="#pricing"
                onClick={() => {
                  onClose();
                  if (typeof window !== 'undefined') {
                    if (window.location.pathname.startsWith('/zh')) {
                      window.location.href = '/zh#pricing';
                    } else {
                      window.location.href = '/#pricing';
                    }
                  }
                }}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] shrink-0 font-code-label"
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
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-full min-h-[104px] cursor-pointer ${
                  exportMode === 'fast'
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                    : 'border-outline-variant/30 bg-surface-container-high/40 hover:bg-surface-container-high'
                } ${aspectRatio !== 'original' ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <Zap className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold font-code-label">
                        {t.clip.fastCutTitle}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-code-label bg-cyan-500/20 text-cyan-300 shrink-0">
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
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-full min-h-[104px] cursor-pointer ${
                  exportMode === 'reencode'
                    ? 'border-secondary bg-secondary/10 shadow-lg shadow-secondary/10 ring-1 ring-secondary/50'
                    : 'border-outline-variant/30 bg-surface-container-high/40 hover:bg-surface-container-high'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 text-secondary">
                      <Sliders className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold font-code-label">
                        {t.clip.smartEncodeTitle}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-code-label bg-secondary/20 text-secondary shrink-0">
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
              <div className="h-10 flex rounded-xl bg-surface-container-high/80 p-1 border border-outline-variant/30 items-center">
                <button
                  type="button"
                  onClick={() => setFormat('mp4')}
                  className={`flex-1 h-full flex items-center justify-center text-xs font-code-label font-medium rounded-lg transition-all cursor-pointer ${
                    format === 'mp4'
                      ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  MP4
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('webm')}
                  className={`flex-1 h-full flex items-center justify-center text-xs font-code-label font-medium rounded-lg transition-all cursor-pointer ${
                    format === 'webm'
                      ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-sm'
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
                  className="h-10 w-full appearance-none pl-3.5 pr-8 rounded-xl bg-surface-container-high/80 border border-outline-variant/30 text-xs font-code-label text-on-surface focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
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
            <div className="h-10 grid grid-cols-2 gap-1 rounded-xl bg-surface-container-high/80 p-1 border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setUseTrimmedRange(true)}
                className={`h-full flex items-center justify-center gap-1.5 px-3 text-xs font-code-label font-medium rounded-lg transition-all cursor-pointer truncate ${
                  useTrimmedRange
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{t.clip.exportRangeTrimmed}</span>
                <span className="font-mono text-[11px] opacity-80">({formatTimecode(totalExportTime, false)})</span>
              </button>
              <button
                type="button"
                onClick={() => setUseTrimmedRange(false)}
                className={`h-full flex items-center justify-center gap-1.5 px-3 text-xs font-code-label font-medium rounded-lg transition-all cursor-pointer truncate ${
                  !useTrimmedRange
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{t.clip.exportRangeFull}</span>
                <span className="font-mono text-[11px] opacity-80">({formatTimecode(duration, false)})</span>
              </button>
            </div>
          </div>

          {/* Active Progress Display */}
          {status === 'exporting' && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-code-label">
                <span className="flex items-center gap-2 text-cyan-400 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span className="truncate">{statusMessage}</span>
                </span>
                <span className="font-mono text-cyan-300 font-bold shrink-0">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-secondary transition-all duration-200 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Export Success Card - 彻底解决超长文件名内容溢出问题 */}
          {status === 'success' && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 overflow-hidden animate-in fade-in duration-150">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-emerald-300 tracking-tight">
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs font-code-label transition-all shrink-0 cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{t.clip.downloadBtn}</span>
              </button>
            </div>
          )}

          {/* Export Error Card */}
          {status === 'error' && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="font-medium">{errorMessage || t.clip.exportError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-container-high/30 flex items-center justify-between font-code-label text-xs">
          <div className="flex items-center gap-1.5 text-on-surface-variant/80 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400/80" />
            <span>{t.clip.exportSecurityNote}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
            >
              {status === 'success' ? t.clip.closeBtn : t.clip.cancelBtn}
            </button>

            {status !== 'success' && (
              <button
                type="button"
                onClick={
                  isPro === false
                    ? () => {
                        onClose();
                        if (typeof window !== 'undefined') {
                          if (window.location.pathname.startsWith('/zh')) {
                            window.location.href = '/zh#pricing';
                          } else {
                            window.location.href = '/#pricing';
                          }
                        }
                      }
                    : handleStartExport
                }
                disabled={status === 'exporting'}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer font-code-label ${
                  isPro === false
                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-neutral-950 shadow-md shadow-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
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
