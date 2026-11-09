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
} from 'lucide-react';
import { useTranslate } from '../../i18n';
import { MediaSourceResolver } from '../../services/clip/MediaSourceResolver';
import { defaultServiceWorkerBridge } from '../../services/clip/ServiceWorkerBridge';
import type { ClipMediaSource } from '../../services/clip/types';
import { VideoPreview, type VideoMetadata } from './VideoPreview';
import { VideoTimeline } from './VideoTimeline';
import { ExportModal } from './ExportModal';
import { formatBytes, formatTimecode, type AspectRatioType } from './clipUtils';

export interface ClipWorkspaceProps {
  session?: string;
  url?: string;
}

type WorkspaceStatus = 'idle' | 'connecting' | 'ready' | 'error';

export const ClipWorkspace: React.FC<ClipWorkspaceProps> = ({ session, url }) => {
  const { t } = useTranslate();

  const [status, setStatus] = useState<WorkspaceStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaSource, setMediaSource] = useState<ClipMediaSource | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Initialize and load session or URL
  const loadSource = useCallback(
    async (targetSession?: string, targetUrl?: string) => {
      if (!targetSession && !targetUrl) {
        setStatus('idle');
        return;
      }

      setStatus('connecting');
      setErrorMessage(null);

      try {
        let source: ClipMediaSource;
        if (targetSession) {
          source = await MediaSourceResolver.resolve({ session: targetSession });
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
        setErrorMessage(
          targetSession ? t.clip.sessionError : (err instanceof Error ? err.message : t.clip.sessionError)
        );
      }
    },
    [t.clip.sessionError]
  );

  useEffect(() => {
    loadSource(session, url);
  }, [session, url, loadSource]);

  // Handle local file selection
  const handleFileImport = async (file: File) => {
    setStatus('connecting');
    setErrorMessage(null);

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
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
            title={t.clip.replaceVideo}
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.clip.replaceVideo}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            disabled={status !== 'ready' || !streamUrl}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 text-xs font-code-label font-medium shadow-md shadow-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.clip.exportVideo}</span>
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
              <p className="text-xs text-on-surface-variant font-code-label">
                {session ? `Session: ${session}` : url}
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex-1 flex flex-col gap-6">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1 text-xs">
              <h4 className="font-bold text-rose-300">{errorMessage || t.clip.sessionError}</h4>
              <p className="text-on-surface-variant">{t.clip.extensionNotFound}</p>
            </div>
          </div>

          {/* Fallback Drop Zone */}
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
          <VideoTimeline
            currentTime={currentTime}
            duration={duration}
            startTime={startTime}
            endTime={endTime}
            isPlaying={isPlaying}
            onSeek={handleSeek}
            onTrimChange={handleTrimChange}
            onPlayPause={setIsPlaying}
          />
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
      />
    </div>
  );
};
