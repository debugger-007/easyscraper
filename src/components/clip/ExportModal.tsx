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
} from 'lucide-react';
import { useTranslate } from '../../i18n';
import type { ClipMediaSource } from '../../services/clip/types';
import { formatTimecode, type AspectRatioType } from './clipUtils';

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

      // Calculate cropping rectangle (center crop)
      const targetAspect = targetW / targetH;
      const srcAspect = naturalW / naturalH;

      let sx = 0;
      let sy = 0;
      let sWidth = naturalW;
      let sHeight = naturalH;

      if (srcAspect > targetAspect) {
        sWidth = naturalH * targetAspect;
        sx = (naturalW - sWidth) / 2;
      } else {
        sHeight = naturalW / targetAspect;
        sy = (naturalH - sHeight) / 2;
      }

      // Capture stream
      const stream = canvas.captureStream(30);

      // Add audio track if available and not muted
      if (!isMuted && typeof (videoElement as any).captureStream === 'function') {
        try {
          const videoStream = (videoElement as any).captureStream();
          const audioTracks = videoStream.getAudioTracks();
          if (audioTracks && audioTracks.length > 0) {
            stream.addTrack(audioTracks[0]);
          }
        } catch {
          // Audio capture may be restricted by CORS
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond,
      });

      const recordedChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      // Seek video to start point
      videoElement.currentTime = exportStartTime;
      await new Promise<void>((resolve) => {
        const handleSeeked = () => {
          videoElement.removeEventListener('seeked', handleSeeked);
          resolve();
        };
        videoElement.addEventListener('seeked', handleSeeked);
      });

      recorder.start(100);
      setStatusMessage(t.clip.processingFrames);

      // Play video to capture frames
      videoElement.muted = isMuted;
      await videoElement.play().catch(() => {});

      await new Promise<void>((resolve, reject) => {
        const renderLoop = () => {
          if (abortControllerRef.current) {
            recorder.stop();
            videoElement.pause();
            reject(new Error('Export cancelled by user'));
            return;
          }

          const current = videoElement.currentTime;

          // Render current video frame to canvas with centered crop
          ctx.drawImage(videoElement, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);

          // Update progress
          const elapsed = Math.max(0, current - exportStartTime);
          const percent = Math.min(95, Math.round(10 + (elapsed / totalExportTime) * 85));
          setProgress(percent);

          // Check if reached end time
          if (current >= exportEndTime || videoElement.ended) {
            videoElement.pause();
            recorder.stop();
            resolve();
            return;
          }

          requestAnimationFrame(renderLoop);
        };

        requestAnimationFrame(renderLoop);
      });

      setStatusMessage(t.clip.finalizingFile);
      setProgress(98);

      // Wait for recorder to flush chunks
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      const actualExt = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const outputBlob = new Blob(recordedChunks, { type: mimeType });
      const outputUrl = URL.createObjectURL(outputBlob);

      const baseName = mediaSource?.title?.replace(/\.[^/.]+$/, '') || 'clip';
      const filename = `${baseName}_cut_${Date.now()}.${actualExt}`;

      setDownloadUrl(outputUrl);
      setExportedFilename(filename);
      setProgress(100);
      setStatus('success');
      setStatusMessage(t.clip.exportSuccess);

      // Trigger automatic browser download
      triggerBrowserDownload(outputUrl, filename);
    } catch (err) {
      if (abortControllerRef.current) {
        setStatus('idle');
      } else {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : t.clip.exportError);
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl overflow-hidden text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface tracking-tight">
                {t.clip.exportModalTitle}
              </h3>
              <p className="text-xs text-on-surface-variant font-code-label">
                {t.clip.exportModalDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
            aria-label={t.clip.closeBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Export Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface font-code-label uppercase tracking-wider">
              {t.clip.exportMode}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Fast Cut Option */}
              <button
                type="button"
                onClick={() => setExportMode('fast')}
                disabled={aspectRatio !== 'original'}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  exportMode === 'fast'
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                    : 'border-outline-variant/30 bg-surface-container-high/40 hover:bg-surface-container-high'
                } ${aspectRatio !== 'original' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-cyan-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold font-code-label">
                    {t.clip.fastCutTitle}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant line-clamp-2">
                  {t.clip.fastCutDesc}
                </p>
              </button>

              {/* Smart Re-encode Option */}
              <button
                type="button"
                onClick={() => setExportMode('reencode')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  exportMode === 'reencode'
                    ? 'border-secondary bg-secondary/10 shadow-md shadow-secondary/10'
                    : 'border-outline-variant/30 bg-surface-container-high/40 hover:bg-surface-container-high'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-secondary">
                  <Sliders className="w-4 h-4" />
                  <span className="text-xs font-bold font-code-label">
                    {t.clip.smartEncodeTitle}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant line-clamp-2">
                  {t.clip.smartEncodeDesc}
                </p>
              </button>
            </div>
          </div>

          {/* Export Settings Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Format Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-code-label text-on-surface-variant">
                {t.clip.exportFormat}
              </label>
              <div className="flex rounded-lg bg-surface-container-high p-1 border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setFormat('mp4')}
                  className={`flex-1 py-1.5 text-xs font-code-label font-medium rounded-md transition-colors cursor-pointer ${
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
                  className={`flex-1 py-1.5 text-xs font-code-label font-medium rounded-md transition-colors cursor-pointer ${
                    format === 'webm'
                      ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  WebM
                </button>
              </div>
            </div>

            {/* Quality Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-code-label text-on-surface-variant">
                {t.clip.exportQuality}
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as ExportQuality)}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs font-code-label text-on-surface focus:outline-none focus:border-cyan-400"
              >
                <option value="high">{t.clip.qualityHigh}</option>
                <option value="medium">{t.clip.qualityMedium}</option>
                <option value="low">{t.clip.qualityLow}</option>
              </select>
            </div>
          </div>

          {/* Export Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-code-label text-on-surface-variant">
              {t.clip.exportRange}
            </label>
            <div className="flex rounded-lg bg-surface-container-high p-1 border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setUseTrimmedRange(true)}
                className={`flex-1 py-1.5 text-xs font-code-label font-medium rounded-md transition-colors cursor-pointer ${
                  useTrimmedRange
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t.clip.exportRangeTrimmed} ({formatTimecode(totalExportTime)})
              </button>
              <button
                type="button"
                onClick={() => setUseTrimmedRange(false)}
                className={`flex-1 py-1.5 text-xs font-code-label font-medium rounded-md transition-colors cursor-pointer ${
                  !useTrimmedRange
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t.clip.exportRangeFull} ({formatTimecode(duration)})
              </button>
            </div>
          </div>

          {/* Active Progress or Status Display */}
          {status === 'exporting' && (
            <div className="p-4 rounded-xl bg-surface-container-highest/60 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-code-label">
                <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {statusMessage}
                </span>
                <span className="font-mono text-cyan-300 font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-secondary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">
                    {t.clip.exportSuccess}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant font-code-label truncate max-w-xs">
                    {exportedFilename}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleManualDownload}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-xs font-code-label hover:bg-emerald-400 transition-colors shrink-0 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {t.clip.downloadBtn}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage || t.clip.exportError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-container-high/40 flex items-center justify-end gap-3 font-code-label text-xs">
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
              onClick={handleStartExport}
              disabled={status === 'exporting'}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 font-medium shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'exporting' ? (
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
  );
};
