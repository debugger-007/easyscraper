import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  Scissors,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
  Bookmark,
  Loader2,
  Film,
} from 'lucide-react';
import { useTranslate } from '../../i18n';
import { formatTimecode, getAspectRatioValue, type AspectRatioType } from './clipUtils';
import { useVideoThumbnails } from './useVideoThumbnails';

export interface VideoTimelineProps {
  videoUrl?: string | null;
  currentTime: number;
  duration: number;
  startTime: number;
  endTime: number;
  isPlaying: boolean;
  aspectRatio?: AspectRatioType;
  videoWidth?: number;
  videoHeight?: number;
  onSeek: (time: number) => void;
  onTrimChange: (start: number, end: number) => void;
  onPlayPause: (playing: boolean) => void;
}

type DragTarget = 'start' | 'end' | 'scrubber' | null;

interface HoverInfo {
  time: number;
  percent: number;
  thumbnailIndex: number;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  videoUrl,
  currentTime,
  duration,
  startTime,
  endTime,
  isPlaying,
  aspectRatio,
  videoWidth,
  videoHeight,
  onSeek,
  onTrimChange,
  onPlayPause,
}) => {
  const { t } = useTranslate();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeDrag, setActiveDrag] = useState<DragTarget>(null);
  const dragRef = useRef<DragTarget>(null);
  dragRef.current = activeDrag;

  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const validDuration = duration > 0 ? duration : 1;
  const startPercent = Math.max(0, Math.min(100, (startTime / validDuration) * 100));
  const endPercent = Math.max(0, Math.min(100, (endTime / validDuration) * 100));
  const playheadPercent = Math.max(0, Math.min(100, (currentTime / validDuration) * 100));
  const trimmedDuration = Math.max(0, endTime - startTime);

  // Calculate dynamic aspect ratio and responsive frame count
  const videoAspect =
    videoWidth && videoHeight && videoWidth > 0 && videoHeight > 0
      ? videoWidth / videoHeight
      : getAspectRatioValue(aspectRatio || 'original');
  const isVertical = videoAspect < 0.95;

  const optimalFrameCount = Math.max(
    10,
    Math.min(24, Math.round(1100 / Math.max(36, 64 * videoAspect)))
  );

  // Extract video frames for timeline filmstrip (dynamically sized based on video aspect ratio)
  const { thumbnails, isLoading: isExtractingFrames } = useVideoThumbnails(
    videoUrl,
    validDuration,
    optimalFrameCount
  );

  // Time conversion helper
  const getTimeFromEvent = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = rect.width > 0 ? x / rect.width : 0;
      return ratio * validDuration;
    },
    [validDuration]
  );

  // Global mousemove & mouseup listeners for smooth dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const targetTime = getTimeFromEvent(e.clientX);

      if (dragRef.current === 'start') {
        const clampedStart = Math.max(0, Math.min(targetTime, endTime - 0.2));
        onTrimChange(clampedStart, endTime);
        if (currentTime < clampedStart) {
          onSeek(clampedStart);
        }
      } else if (dragRef.current === 'end') {
        const clampedEnd = Math.min(validDuration, Math.max(targetTime, startTime + 0.2));
        onTrimChange(startTime, clampedEnd);
        if (currentTime > clampedEnd) {
          onSeek(clampedEnd);
        }
      } else if (dragRef.current === 'scrubber') {
        const clampedTime = Math.max(0, Math.min(validDuration, targetTime));
        onSeek(clampedTime);
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current) {
        setActiveDrag(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentTime, endTime, getTimeFromEvent, onSeek, onTrimChange, startTime, validDuration]);

  // Track click handler
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeDrag) return;
    const targetTime = getTimeFromEvent(e.clientX);
    onSeek(targetTime);
  };

  // Track hover handler for hovering preview thumbnail
  const handleTrackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeDrag || !trackRef.current) {
      setHoverInfo(null);
      return;
    }
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = rect.width > 0 ? x / rect.width : 0;
    const time = ratio * validDuration;
    const percent = ratio * 100;
    const thumbnailIndex =
      thumbnails.length > 0
        ? Math.min(thumbnails.length - 1, Math.floor(ratio * thumbnails.length))
        : -1;

    setHoverInfo({
      time,
      percent,
      thumbnailIndex,
    });
  };

  const handleTrackMouseLeave = () => {
    setHoverInfo(null);
  };

  // Quick Action Buttons
  const handleSetInPoint = () => {
    const newStart = Math.max(0, Math.min(currentTime, endTime - 0.2));
    onTrimChange(newStart, endTime);
  };

  const handleSetOutPoint = () => {
    const newEnd = Math.min(validDuration, Math.max(currentTime, startTime + 0.2));
    onTrimChange(startTime, newEnd);
  };

  const handleResetTrim = () => {
    onTrimChange(0, validDuration);
  };

  const handleJumpToIn = () => {
    onSeek(startTime);
  };

  const handleJumpToOut = () => {
    onSeek(endTime);
  };

  // Generate 8 evenly spaced ruler marks
  const rulerMarks = Array.from({ length: 9 }).map((_, index) => {
    const ratio = index / 8;
    const time = ratio * validDuration;
    return {
      ratio,
      percent: ratio * 100,
      label: formatTimecode(time, false),
    };
  });

  return (
    <div className="relative z-30 w-full rounded-2xl border border-outline-variant/30 bg-surface-container/60 backdrop-blur-xl p-4 sm:p-5 flex flex-col gap-3 select-none">
      {/* Top Bar: Trim Action Buttons & Duration Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-code-label">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSetInPoint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-cyan-400 border border-outline-variant/30 transition-colors cursor-pointer text-xs"
            title={t.clip.setInPoint}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{t.clip.setInPoint}</span>
          </button>

          <button
            type="button"
            onClick={handleSetOutPoint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-secondary border border-outline-variant/30 transition-colors cursor-pointer text-xs"
            title={t.clip.setOutPoint}
          >
            <Bookmark className="w-3.5 h-3.5 rotate-180" />
            <span>{t.clip.setOutPoint}</span>
          </button>

          <button
            type="button"
            onClick={handleResetTrim}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-colors cursor-pointer text-xs"
            title={t.clip.resetTrim}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clip.resetTrim}</span>
          </button>

          {/* Frame Extraction Status Pill */}
          {isExtractingFrames && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{t.clip.extractingFrames}</span>
            </div>
          )}
        </div>

        {/* Right Badges & Jump navigation */}
        <div className="flex items-center gap-2">
          {/* Jump to In */}
          <button
            type="button"
            onClick={handleJumpToIn}
            className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-cyan-400 transition-colors cursor-pointer"
            title={t.clip.jumpToIn}
            aria-label={t.clip.jumpToIn}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* In Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-highest/60 border border-outline-variant/30 text-[11px]">
            <span className="text-on-surface-variant/70">{t.clip.inPoint}:</span>
            <span className="text-cyan-400 font-mono font-medium">
              {formatTimecode(startTime)}
            </span>
          </div>

          {/* Out Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-highest/60 border border-outline-variant/30 text-[11px]">
            <span className="text-on-surface-variant/70">{t.clip.outPoint}:</span>
            <span className="text-secondary font-mono font-medium">
              {formatTimecode(endTime)}
            </span>
          </div>

          {/* Jump to Out */}
          <button
            type="button"
            onClick={handleJumpToOut}
            className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
            title={t.clip.jumpToOut}
            aria-label={t.clip.jumpToOut}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          {/* Total Trimmed Duration Badge */}
          <div className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Scissors className="w-3.5 h-3.5" />
            <span>{t.clip.clipDuration}:</span>
            <span className="font-mono">{formatTimecode(trimmedDuration)}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Timeline Scrubber & Trim Ruler */}
      <div className="relative pt-6 pb-2">
        {/* Time Ruler Marks */}
        <div className="absolute top-0 inset-x-0 h-5 flex justify-between pointer-events-none px-1">
          {rulerMarks.map((mark, i) => (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ position: 'absolute', left: `${mark.percent}%`, transform: 'translateX(-50%)' }}
            >
              <span className="text-[10px] font-mono text-on-surface-variant/60">
                {mark.label}
              </span>
              <div className="w-px h-1.5 bg-outline-variant/50 mt-0.5" />
            </div>
          ))}
        </div>

        {/* Timeline Track Wrapper: No overflow-hidden so hover pill & scrubber cursor are NEVER clipped! */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          onMouseMove={handleTrackMouseMove}
          onMouseLeave={handleTrackMouseLeave}
          className="relative w-full cursor-pointer mt-1"
        >
          {/* Layer A: Floating Hover Thumbnail Preview Pill (Positioned completely outside overflow-hidden) */}
          {hoverInfo && !activeDrag && (
            <div
              className="absolute -top-3 z-50 pointer-events-none -translate-x-1/2 -translate-y-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-100"
              style={{
                left: `${Math.max(6, Math.min(94, hoverInfo.percent))}%`,
              }}
            >
              <div className="rounded-xl overflow-hidden border border-cyan-400/60 shadow-[0_12px_32px_rgba(0,0,0,0.9)] bg-neutral-950/95 p-1.5 flex flex-col items-center gap-1.5 backdrop-blur-md">
                {hoverInfo.thumbnailIndex >= 0 && thumbnails[hoverInfo.thumbnailIndex] ? (
                  <div
                    style={
                      isVertical
                        ? { height: '124px', aspectRatio: `${videoAspect}` }
                        : { width: '136px', aspectRatio: `${videoAspect}` }
                    }
                    className="overflow-hidden rounded-lg border border-white/15 shadow-md bg-black flex items-center justify-center"
                  >
                    <img
                      src={thumbnails[hoverInfo.thumbnailIndex]}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div
                    style={
                      isVertical
                        ? { height: '124px', aspectRatio: `${videoAspect}` }
                        : { width: '136px', aspectRatio: `${videoAspect}` }
                    }
                    className="bg-surface-container-highest/80 flex items-center justify-center rounded-lg"
                  >
                    <Film className="w-6 h-6 text-cyan-400/40" />
                  </div>
                )}
                <span className="text-[11px] font-mono font-semibold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/20">
                  {formatTimecode(hoverInfo.time, false)}
                </span>
              </div>
              {/* Tooltip downward point arrow */}
              <div className="w-2.5 h-2.5 bg-neutral-950/95 border-r border-b border-cyan-400/60 rotate-45 -mt-1.5 shadow-sm" />
            </div>
          )}

          {/* Layer B: Visual Track Box (has overflow-hidden ONLY for the video frames and dimmed out-of-bounds masks) */}
          <div className="relative h-16 w-full bg-surface-container-highest/90 rounded-xl border border-outline-variant/40 overflow-hidden shadow-inner">
            {/* Sublayer 1: Video Frames Filmstrip */}
            <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
              {thumbnails.length > 0 ? (
                thumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    style={{
                      aspectRatio: `${videoAspect}`,
                      height: '100%',
                      flex: '1 1 0',
                      minWidth: 0,
                    }}
                    className="h-full relative border-r border-black/40 overflow-hidden bg-black/60 flex items-center justify-center"
                  >
                    <img
                      src={thumb}
                      alt=""
                      className="w-full h-full object-cover pointer-events-none select-none opacity-95"
                      loading="eager"
                      draggable={false}
                    />
                    {/* Subtle Film Sprocket Dot */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/30 pointer-events-none shadow-sm" />
                  </div>
                ))
              ) : (
                /* Loading Shimmer Skeleton while Frames are Extracting */
                <div className="w-full h-full flex items-center bg-black/40">
                  {Array.from({ length: optimalFrameCount }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        aspectRatio: `${videoAspect}`,
                        height: '100%',
                        flex: '1 1 0',
                        minWidth: 0,
                      }}
                      className="h-full border-r border-outline-variant/20 bg-surface-container-high/30 animate-pulse flex items-center justify-center"
                    >
                      <Film className="w-3.5 h-3.5 text-on-surface-variant/20" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sublayer 2: Dimmed Out-of-bounds Before Start */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-black/70 backdrop-blur-[1px] pointer-events-none border-r-2 border-cyan-400 z-10 transition-all duration-75"
              style={{ width: `${startPercent}%` }}
            />

            {/* Sublayer 2: Dimmed Out-of-bounds After End */}
            <div
              className="absolute top-0 bottom-0 right-0 bg-black/70 backdrop-blur-[1px] pointer-events-none border-l-2 border-secondary z-10 transition-all duration-75"
              style={{ width: `${100 - endPercent}%` }}
            />

            {/* Sublayer 3: Active Highlight Range (Trimmed Clip) */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none border-y-2 border-cyan-400/90 shadow-[0_0_16px_rgba(34,211,238,0.3)] z-10"
              style={{
                left: `${startPercent}%`,
                width: `${Math.max(0, endPercent - startPercent)}%`,
              }}
            />
          </div>

          {/* Layer C: In-Point Draggable Handle (Full height with grab grip) */}
          <div
            className="absolute top-0 bottom-0 z-20 flex items-center justify-center -ml-2.5 w-5 cursor-ew-resize group"
            style={{ left: `${startPercent}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setHoverInfo(null);
              setActiveDrag('start');
            }}
            title={t.clip.inPoint}
          >
            <div className="w-3 h-12 rounded bg-cyan-400 group-hover:bg-cyan-300 shadow-md shadow-cyan-500/50 flex flex-col items-center justify-center gap-0.5 transition-all group-hover:scale-105">
              <div className="w-1.5 h-0.5 bg-black/70 rounded-full" />
              <div className="w-1.5 h-0.5 bg-black/70 rounded-full" />
              <div className="w-1.5 h-0.5 bg-black/70 rounded-full" />
            </div>
          </div>

          {/* Layer C: Out-Point Draggable Handle (Full height with grab grip) */}
          <div
            className="absolute top-0 bottom-0 z-20 flex items-center justify-center -ml-2.5 w-5 cursor-ew-resize group"
            style={{ left: `${endPercent}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setHoverInfo(null);
              setActiveDrag('end');
            }}
            title={t.clip.outPoint}
          >
            <div className="w-3 h-12 rounded bg-secondary group-hover:bg-cyan-200 shadow-md shadow-secondary/50 flex flex-col items-center justify-center gap-0.5 transition-all group-hover:scale-105">
              <div className="w-1.5 h-0.5 bg-black/70 rounded-full" />
              <div className="w-1.5 h-0.5 bg-black/70 rounded-full" />
              <div className="w-1.5 h-0.5 bg-black/70 rounded-full" />
            </div>
          </div>

          {/* Layer D: Current Playhead Scrubber Line & Head */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none -ml-px w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)]"
            style={{ left: `${playheadPercent}%` }}
          >
            {/* Scrubber Head Cursor (Unclipped, fully round cursor head) */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-cyan-400 shadow-lg pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
              onMouseDown={(e) => {
                e.stopPropagation();
                setHoverInfo(null);
                setActiveDrag('scrubber');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
