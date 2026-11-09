import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Crop,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useTranslate } from '../../i18n';
import { formatTimecode, type AspectRatioType } from './clipUtils';

export interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
}

export interface VideoPreviewProps {
  src?: string;
  currentTime: number;
  duration: number;
  startTime: number;
  endTime: number;
  aspectRatio: AspectRatioType;
  isMuted: boolean;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause: (playing: boolean) => void;
  onToggleMute: () => void;
  onAspectRatioChange: (ratio: AspectRatioType) => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onVideoMetadata?: (meta: VideoMetadata) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  src,
  currentTime,
  duration,
  startTime,
  endTime,
  aspectRatio,
  isMuted,
  isPlaying,
  onTimeUpdate,
  onDurationChange,
  onPlayPause,
  onToggleMute,
  onAspectRatioChange,
  videoRef: externalVideoRef,
  onVideoMetadata,
}) => {
  const { t } = useTranslate();
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const video = externalVideoRef?.current || internalVideoRef.current;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectMenuOpen, setAspectMenuOpen] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState(false);

  // Sync play / pause state
  useEffect(() => {
    if (!video) return;
    if (isPlaying) {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            onPlayPause(false);
          });
        }
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isPlaying, video, onPlayPause]);

  // Sync current time when seeking
  useEffect(() => {
    if (!video) return;
    if (Math.abs(video.currentTime - currentTime) > 0.08) {
      video.currentTime = currentTime;
    }
  }, [currentTime, video]);

  // Sync muted state
  useEffect(() => {
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted, video]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    const dur = el.duration;
    if (!isNaN(dur) && dur > 0) {
      onDurationChange(dur);
      if (onVideoMetadata) {
        onVideoMetadata({
          width: el.videoWidth,
          height: el.videoHeight,
          duration: dur,
        });
      }
    }
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    const now = el.currentTime;

    // Loop trimmed range
    if (endTime > startTime && now >= endTime) {
      el.currentTime = startTime;
      onTimeUpdate(startTime);
      return;
    }

    onTimeUpdate(now);
  };

  const togglePlay = () => {
    const next = !isPlaying;
    onPlayPause(next);
    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 500);
  };

  const handleSeekOffset = (seconds: number) => {
    if (!video) return;
    const target = Math.max(0, Math.min(duration || endTime, video.currentTime + seconds));
    video.currentTime = target;
    onTimeUpdate(target);
  };

  const handleReplay = () => {
    if (!video) return;
    video.currentTime = startTime;
    onTimeUpdate(startTime);
    if (!isPlaying) {
      onPlayPause(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const aspectOptions: Array<{ key: AspectRatioType; label: string }> = [
    { key: 'original', label: t.clip.aspectOriginal },
    { key: '16:9', label: t.clip.aspect169 },
    { key: '9:16', label: t.clip.aspect916 },
    { key: '1:1', label: t.clip.aspect11 },
    { key: '4:3', label: t.clip.aspect43 },
  ];

  // Dynamic container styling based on aspect ratio
  const getAspectContainerClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-[16/9] w-full max-w-4xl max-h-[520px]';
      case '9:16':
        return 'aspect-[9/16] h-full max-h-[520px]';
      case '1:1':
        return 'aspect-square h-full max-h-[520px]';
      case '4:3':
        return 'aspect-[4/3] w-full max-w-3xl max-h-[520px]';
      case 'original':
      default:
        return 'w-full h-full max-w-5xl max-h-[520px]';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full flex flex-col items-center justify-center bg-black/80 rounded-2xl overflow-hidden border border-outline-variant/30 select-none group min-h-[360px]"
    >
      {/* Video Framing Area */}
      <div className="relative flex-1 w-full flex items-center justify-center p-4 overflow-hidden">
        <div
          className={`relative flex items-center justify-center overflow-hidden rounded-xl transition-all duration-300 ${getAspectContainerClass()}`}
        >
          {src ? (
            <video
              ref={(node) => {
                internalVideoRef.current = node;
                if (externalVideoRef) {
                  (externalVideoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
                }
              }}
              src={src}
              className={`w-full h-full cursor-pointer ${
                aspectRatio === 'original' ? 'object-contain' : 'object-cover'
              }`}
              playsInline
              onClick={togglePlay}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleVideoTimeUpdate}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-code-label text-sm">
              {t.clip.title}
            </div>
          )}

          {/* Crop Frame Overlay when non-original aspect ratio */}
          {aspectRatio !== 'original' && (
            <div className="absolute inset-0 pointer-events-none border-2 border-cyan-400/40 rounded-xl shadow-[inset_0_0_24px_rgba(34,211,238,0.15)] flex flex-col justify-between p-2">
              <div className="flex justify-between items-start">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-code-label bg-black/70 text-cyan-400 border border-cyan-500/30">
                  {aspectRatio}
                </span>
              </div>
            </div>
          )}

          {/* Center Play/Pause Flash Animation */}
          {showCenterIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest/90 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-xl animate-scale-in">
                {isPlaying ? <Play className="w-8 h-8 ml-1" /> : <Pause className="w-8 h-8" />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Playback Controls Bar */}
      <div className="w-full px-4 py-3 bg-surface-container/90 backdrop-blur-md border-t border-outline-variant/30 flex items-center justify-between gap-3 text-xs font-code-label text-on-surface z-20">
        {/* Left: Playback & Seek */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center transition-colors cursor-pointer"
            title={isPlaying ? t.clip.pause : t.clip.play}
            aria-label={isPlaying ? t.clip.pause : t.clip.play}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 flex items-center justify-center transition-colors cursor-pointer"
            title={t.clip.replay}
            aria-label={t.clip.replay}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleSeekOffset(-5)}
            className="px-2 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/30 flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
            title={t.clip.rewind5s}
            aria-label={t.clip.rewind5s}
          >
            -5s
          </button>

          <button
            type="button"
            onClick={() => handleSeekOffset(5)}
            className="px-2 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/30 flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
            title={t.clip.forward5s}
            aria-label={t.clip.forward5s}
          >
            +5s
          </button>

          {/* Timecode Readout */}
          <div className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-highest/60 border border-outline-variant/20 text-[11px]">
            <span className="text-cyan-400 font-mono font-medium">
              {formatTimecode(currentTime)}
            </span>
            <span className="text-on-surface-variant/60 font-mono">/</span>
            <span className="text-on-surface-variant font-mono">
              {formatTimecode(duration || endTime)}
            </span>
          </div>
        </div>

        {/* Right: Audio, Aspect Ratio, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Mute / Unmute */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              isMuted
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant/30'
            }`}
            title={isMuted ? t.clip.unmute : t.clip.mute}
            aria-label={isMuted ? t.clip.unmute : t.clip.mute}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Aspect Ratio Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAspectMenuOpen(!aspectMenuOpen)}
              className="h-8 px-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              title={t.clip.aspectRatio}
              aria-label={t.clip.aspectRatio}
              aria-expanded={aspectMenuOpen}
            >
              <Crop className="w-3.5 h-3.5 text-secondary" />
              <span className="font-medium">{aspectRatio}</span>
              <ChevronDown
                className={`w-3 h-3 text-on-surface-variant transition-transform ${
                  aspectMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {aspectMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setAspectMenuOpen(false)}
                />
                <div className="absolute right-0 bottom-full mb-2 w-44 rounded-xl bg-surface-container border border-outline-variant/40 shadow-xl py-1 z-40 backdrop-blur-xl">
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-on-surface-variant/70 border-b border-outline-variant/20 font-semibold">
                    {t.clip.aspectRatio}
                  </div>
                  {aspectOptions.map((opt) => {
                    const isSelected = aspectRatio === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          onAspectRatioChange(opt.key);
                          setAspectMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-surface-container-high transition-colors text-xs cursor-pointer ${
                          isSelected ? 'text-secondary font-semibold bg-secondary/10' : 'text-on-surface'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-secondary" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 flex items-center justify-center transition-colors cursor-pointer"
            title={t.clip.fullscreen}
            aria-label={t.clip.fullscreen}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
