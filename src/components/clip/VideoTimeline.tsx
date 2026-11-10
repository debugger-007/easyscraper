import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import {
  Scissors,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
  Bookmark,
  Loader2,
  Film,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useTranslate } from '../../i18n';
import {
  formatTimecode,
  getAspectRatioValue,
  calculateRulerTicks,
  type AspectRatioType,
} from './clipUtils';
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
  clientXInContainer: number;
  topOffset: number;
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
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeDrag, setActiveDrag] = useState<DragTarget>(null);
  const dragRef = useRef<DragTarget>(null);
  dragRef.current = activeDrag;

  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const prevZoomRef = useRef<number>(zoomLevel);

  const currentTimeRef = useRef<number>(currentTime);
  currentTimeRef.current = currentTime;

  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const validDuration = duration > 0 ? duration : 1;
  const startPercent = Math.max(0, Math.min(100, (startTime / validDuration) * 100));
  const endPercent = Math.max(0, Math.min(100, (endTime / validDuration) * 100));
  const playheadPercent = Math.max(0, Math.min(100, (currentTime / validDuration) * 100));
  const trimmedDuration = Math.max(0, endTime - startTime);

  // 1. 缩略图探测宽高比与实际比例计算
  const [detectedAspect, setDetectedAspect] = useState<number | null>(null);
  const [trackPixelWidth, setTrackPixelWidth] = useState<number>(0);

  // Dynamically observe the exact pixel width of the timeline track
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const updateWidth = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setTrackPixelWidth(Math.round(w));
      }
    };

    updateWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          if (w > 0) {
            setTrackPixelWidth(Math.round(w));
          }
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);

  // Calculate dynamic aspect ratio and responsive frame count
  const effectiveAspect = useMemo(() => {
    if (videoWidth && videoHeight && videoWidth > 0 && videoHeight > 0) {
      return videoWidth / videoHeight;
    }
    if (detectedAspect && detectedAspect > 0) {
      return detectedAspect;
    }
    return getAspectRatioValue(aspectRatio || 'original');
  }, [videoWidth, videoHeight, detectedAspect, aspectRatio]);

  const isVertical = effectiveAspect < 0.95;

  // 基础帧高为 64px（h-16），单帧实际视觉像素宽度为 64 * effectiveAspect
  const singleFrameWidth = Math.max(28, Math.round(64 * effectiveAspect));

  // 实时根据轨道真实物理像素宽度计算需要平铺的帧槽位数（+1 溢出容差保证无任何边缘黑洞缝隙）
  const effectiveTrackWidth = trackPixelWidth > 0 ? trackPixelWidth : 1200;
  const targetDisplayCount = Math.max(8, Math.ceil(effectiveTrackWidth / singleFrameWidth) + 1);

  // 抽帧数量步进为 4 的倍数，避免窗口微调尺寸触发无谓的反复抽帧
  const optimalExtractionCount = useMemo(() => {
    return Math.max(12, Math.min(48, Math.ceil(targetDisplayCount / 4) * 4));
  }, [targetDisplayCount]);

  // Extract video frames for timeline filmstrip (dynamically sized based on video aspect ratio and zoom level)
  const { thumbnails, isLoading: isExtractingFrames, intrinsicAspect } = useVideoThumbnails(
    videoUrl,
    validDuration,
    optimalExtractionCount
  );

  // 确保胶片序列始终 100% 完整平铺整个轨道，消除末端黑边或因抽帧未完成产生的空白
  const displayFrames = useMemo(() => {
    const validThumbnails = thumbnails.filter((t): t is string => Boolean(t));
    if (validThumbnails.length === 0) {
      return [];
    }

    const frames: string[] = [];
    for (let i = 0; i < targetDisplayCount; i++) {
      const thumbIdx = Math.min(
        validThumbnails.length - 1,
        Math.floor((i / targetDisplayCount) * validThumbnails.length)
      );
      frames.push(validThumbnails[thumbIdx]);
    }
    return frames;
  }, [thumbnails, targetDisplayCount]);

  useEffect(() => {
    if (intrinsicAspect && intrinsicAspect > 0) {
      setDetectedAspect(intrinsicAspect);
    }
  }, [intrinsicAspect]);

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

    const containerRect = timelineContainerRef.current?.getBoundingClientRect();
    const scrollRect = scrollContainerRef.current?.getBoundingClientRect();

    const clientXInContainer = containerRect
      ? Math.max(70, Math.min(containerRect.width - 70, e.clientX - containerRect.left))
      : 100;

    const topOffset =
      scrollRect && containerRect
        ? Math.max(50, scrollRect.top - containerRect.top + 22)
        : 72;

    setHoverInfo({
      time,
      percent,
      thumbnailIndex,
      clientXInContainer,
      topOffset,
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
    onPlayPause(false);
    onSeek(startTime);
  };

  const handleJumpToOut = () => {
    onPlayPause(false);
    const safeOut = duration > 0 ? Math.min(endTime, Math.max(startTime, duration - 0.001)) : endTime;
    onSeek(safeOut);
  };

  // Zoom Controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(4.0, Number((prev + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(1.0, Number((prev - 0.5).toFixed(1))));
  };

  const handleZoomFit = () => {
    setZoomLevel(1.0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Wheel zoom with Ctrl / Cmd / Alt (Native non-passive listener to prevent browser zoom)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setZoomLevel((prev) => Math.min(4.0, Number((prev + 0.25).toFixed(2))));
        } else if (e.deltaY > 0) {
          setZoomLevel((prev) => Math.max(1.0, Number((prev - 0.25).toFixed(2))));
        }
      }
    };

    el.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onNativeWheel);
    };
  }, []);

  // Zoom Anchor Preservation: When zoomLevel changes, keep current playhead centered
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || prevZoomRef.current === zoomLevel) return;

    prevZoomRef.current = zoomLevel;

    const focusRatio = Math.max(0, Math.min(1, currentTimeRef.current / validDuration));
    const targetScroll = focusRatio * container.scrollWidth - container.clientWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: 'smooth',
    });
  }, [zoomLevel, validDuration]);

  // Auto-scroll timeline when playhead approaches viewport boundary during playback
  useEffect(() => {
    if (!isPlaying || zoomLevel <= 1.0) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const playheadPx = (currentTime / validDuration) * container.scrollWidth;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;

    if (playheadPx > viewRight - container.clientWidth * 0.15) {
      container.scrollTo({
        left: Math.max(0, playheadPx - container.clientWidth * 0.25),
        behavior: 'smooth',
      });
    } else if (playheadPx < viewLeft) {
      container.scrollTo({
        left: Math.max(0, playheadPx - container.clientWidth * 0.25),
        behavior: 'smooth',
      });
    }
  }, [currentTime, isPlaying, zoomLevel, validDuration]);

  // Generate adaptive ruler marks (memoized to prevent recalculation on every playback tick)
  const rulerMarks = useMemo(
    () => calculateRulerTicks(validDuration, zoomLevel),
    [validDuration, zoomLevel]
  );

  return (
    <div
      ref={timelineContainerRef}
      className="relative z-30 w-full rounded-2xl border border-outline-variant/30 bg-surface-container/60 backdrop-blur-xl p-4 sm:p-5 flex flex-col gap-3 select-none"
    >
      {/* Floating Hover Thumbnail Preview Pill (Rendered in unclipped outer container) */}
      {hoverInfo && !activeDrag && (
        <div
          className="absolute z-50 pointer-events-none -translate-x-1/2 -translate-y-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: `${hoverInfo.topOffset}px`,
            left: `${hoverInfo.clientXInContainer}px`,
          }}
        >
          <div className="rounded-xl overflow-hidden border border-cyan-400/60 shadow-[0_12px_32px_rgba(0,0,0,0.9)] bg-neutral-950/95 p-1.5 flex flex-col items-center gap-1.5 backdrop-blur-md">
            {hoverInfo.thumbnailIndex >= 0 && thumbnails[hoverInfo.thumbnailIndex] ? (
              <div
                style={
                  isVertical
                    ? { height: '124px', aspectRatio: `${effectiveAspect}` }
                    : { width: '136px', aspectRatio: `${effectiveAspect}` }
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
                    ? { height: '124px', aspectRatio: `${effectiveAspect}` }
                    : { width: '136px', aspectRatio: `${effectiveAspect}` }
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

      {/* Top Bar: Trim Action Buttons, Range Capsule & Zoom Controls */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 text-xs font-code-label">
        {/* Left Action Buttons: In/Out/Reset & Extraction Indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center p-0.5 rounded-xl bg-surface-container-high/90 border border-outline-variant/30 shadow-sm">
            <button
              type="button"
              onClick={handleSetInPoint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-container-highest text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer text-xs font-medium"
              title={t.clip.setInPoint}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{t.clip.setInPoint}</span>
            </button>

            <button
              type="button"
              onClick={handleSetOutPoint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-container-highest text-secondary hover:text-cyan-300 transition-colors cursor-pointer text-xs font-medium"
              title={t.clip.setOutPoint}
            >
              <Bookmark className="w-3.5 h-3.5 rotate-180" />
              <span>{t.clip.setOutPoint}</span>
            </button>

            <button
              type="button"
              onClick={handleResetTrim}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-xs"
              title={t.clip.resetTrim}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clip.resetTrim}</span>
            </button>
          </div>

          {/* Frame Extraction Status Pill */}
          {isExtractingFrames && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{t.clip.extractingFrames}</span>
            </div>
          )}
        </div>

        {/* Center / Middle: Integrated Time Range Capsule & Duration Badge */}
        <div className="flex items-center gap-1.5 bg-surface-container-high/90 rounded-xl px-2.5 py-1 border border-outline-variant/30 shadow-sm self-start xl:self-auto overflow-x-auto max-w-full">
          {/* Jump to In */}
          <button
            type="button"
            onClick={handleJumpToIn}
            className="p-1 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-cyan-400 transition-colors cursor-pointer"
            title={t.clip.jumpToIn}
            aria-label={t.clip.jumpToIn}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* In Badge */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span className="text-on-surface-variant/70 font-sans">{t.clip.inPoint}:</span>
            <span className="text-cyan-400 font-semibold">{formatTimecode(startTime)}</span>
          </div>

          <span className="text-on-surface-variant/40 px-0.5 select-none font-sans">→</span>

          {/* Out Badge */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span className="text-on-surface-variant/70 font-sans">{t.clip.outPoint}:</span>
            <span className="text-secondary font-semibold">{formatTimecode(endTime)}</span>
          </div>

          {/* Jump to Out */}
          <button
            type="button"
            onClick={handleJumpToOut}
            className="p-1 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
            title={t.clip.jumpToOut}
            aria-label={t.clip.jumpToOut}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>

          {/* Divider */}
          <div className="w-px h-3.5 bg-outline-variant/40 mx-1" />

          {/* Total Trimmed Duration Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-semibold whitespace-nowrap">
            <Scissors className="w-3 h-3" />
            <span className="hidden sm:inline font-sans font-normal text-[11px] text-cyan-300/80">{t.clip.clipDuration}:</span>
            <span className="font-mono">{formatTimecode(trimmedDuration)}</span>
          </div>
        </div>

        {/* Right: Timeline Zoom Controls */}
        <div className="flex items-center gap-1 bg-surface-container-high/90 rounded-xl p-0.5 border border-outline-variant/30 text-xs shadow-sm self-end xl:self-auto shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1.0}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface disabled:opacity-25 disabled:cursor-not-allowed hover:bg-surface-container-highest transition-colors cursor-pointer"
            title={t.clip.zoomOut}
            aria-label={t.clip.zoomOut}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomFit}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition-colors cursor-pointer ${
              zoomLevel === 1.0
                ? 'text-cyan-400 bg-cyan-500/10'
                : 'text-on-surface-variant hover:text-cyan-300 hover:bg-surface-container-highest'
            }`}
            title={t.clip.zoomFit}
            aria-label={t.clip.zoomFit}
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 4.0}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface disabled:opacity-25 disabled:cursor-not-allowed hover:bg-surface-container-highest transition-colors cursor-pointer"
            title={t.clip.zoomIn}
            aria-label={t.clip.zoomIn}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Timeline Scrubber & Trim Ruler with Zoom */}
      <div className="relative pt-1 pb-1">
        {/* Horizontal Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto overflow-y-visible custom-scrollbar pt-6 pb-3 px-3 sm:px-4 select-none"
        >
          {/* Stretched Timeline Track & Ruler Wrapper */}
          <div
            className="relative min-w-full"
            style={{ width: `${zoomLevel * 100}%` }}
          >
            {/* Time Ruler Marks (In flow above track, boundary labels properly aligned) */}
            <div className="relative w-full h-5 pointer-events-none mb-1.5 select-none">
              {rulerMarks.map((mark, i) => {
                const isStart = mark.percent <= 1;
                const isEnd = mark.percent >= 99;

                return (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      isStart ? 'items-start' : isEnd ? 'items-end' : 'items-center'
                    }`}
                    style={{
                      position: 'absolute',
                      left: `${mark.percent}%`,
                      transform: isStart ? 'none' : isEnd ? 'translateX(-100%)' : 'translateX(-50%)',
                    }}
                  >
                    <span
                      className={`text-[10px] font-mono leading-none transition-opacity ${
                        mark.isMajor
                          ? 'text-on-surface-variant/90 font-medium'
                          : 'text-on-surface-variant/40 text-[9px]'
                      }`}
                    >
                      {mark.label}
                    </span>
                    <div
                      className={`w-px mt-1 ${
                        mark.isMajor ? 'h-1.5 bg-outline-variant/70' : 'h-1 bg-outline-variant/30'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Timeline Track Wrapper: Unclipped so handles, rails, and scrubber are never cut off */}
            <div
              ref={trackRef}
              onClick={handleTrackClick}
              onMouseMove={handleTrackMouseMove}
              onMouseLeave={handleTrackMouseLeave}
              className="relative w-full cursor-pointer mt-0"
            >
              {/* Layer B: Base Track Box (overflow-hidden strictly for video thumbnails and dimming mask) */}
              <div className="relative h-16 w-full bg-surface-container-highest/90 rounded-xl border border-outline-variant/40 overflow-hidden shadow-inner">
                {/* Sublayer 1: Video Frames Filmstrip */}
                <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
                  {displayFrames.length > 0 ? (
                    displayFrames.map((thumb, idx) => (
                      <div
                        key={idx}
                        style={{
                          aspectRatio: `${effectiveAspect}`,
                          height: '100%',
                          flex: 'none',
                        }}
                        className="h-full relative border-r border-black/40 overflow-hidden bg-black/60 flex items-center justify-center shrink-0"
                      >
                        <img
                          src={thumb}
                          alt=""
                          onLoad={(e) => {
                            const { naturalWidth, naturalHeight } = e.currentTarget;
                            if (naturalWidth > 0 && naturalHeight > 0 && !detectedAspect) {
                              setDetectedAspect(naturalWidth / naturalHeight);
                            }
                          }}
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
                      {Array.from({ length: targetDisplayCount }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            aspectRatio: `${effectiveAspect}`,
                            height: '100%',
                            flex: 'none',
                          }}
                          className="h-full border-r border-outline-variant/20 bg-surface-container-high/30 animate-pulse flex items-center justify-center shrink-0"
                        >
                          <Film className="w-3.5 h-3.5 text-on-surface-variant/20" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sublayer 2: Dimmed Out-of-bounds Before Start (No borders inside overflow-hidden) */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-black/65 backdrop-blur-[0.5px] pointer-events-none transition-all duration-75"
                  style={{ width: `${startPercent}%` }}
                />

                {/* Sublayer 2: Dimmed Out-of-bounds After End (No borders inside overflow-hidden) */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-black/65 backdrop-blur-[0.5px] pointer-events-none transition-all duration-75"
                  style={{ width: `${100 - endPercent}%` }}
                />
              </div>

              {/* Layer C: Unified Active Trim Selection Box (Rendered outside overflow-hidden) */}
              <div
                className="absolute inset-y-0 pointer-events-none z-20"
                style={{
                  left: `${startPercent}%`,
                  width: `${Math.max(0, endPercent - startPercent)}%`,
                }}
              >
                {/* Top Highlight Rail (Flush with handle top) */}
                <div className="absolute top-0 inset-x-0 h-[3px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                {/* Bottom Highlight Rail (Flush with handle bottom) */}
                <div className="absolute bottom-0 inset-x-0 h-[3px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              </div>

              {/* Layer D: In-Point Draggable Handle (Full-height bracket matching rails) */}
              <div
                className="absolute top-0 bottom-0 z-30 flex items-center justify-center -translate-x-1/2 w-6 cursor-ew-resize group select-none"
                style={{ left: `${startPercent}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setHoverInfo(null);
                  setActiveDrag('start');
                }}
                title={t.clip.setInPoint}
              >
                <div
                  className={`w-3.5 h-full rounded-l-md bg-cyan-400 group-hover:bg-cyan-300 shadow-lg shadow-cyan-500/40 flex flex-col items-center justify-center gap-1 transition-all border-y-[3px] border-l border-cyan-300/60 ${
                    activeDrag === 'start' ? 'ring-2 ring-white/80 scale-105' : ''
                  }`}
                >
                  <div className="w-1.5 h-0.5 bg-neutral-950/80 rounded-full" />
                  <div className="w-1.5 h-0.5 bg-neutral-950/80 rounded-full" />
                  <div className="w-1.5 h-0.5 bg-neutral-950/80 rounded-full" />
                </div>
              </div>

              {/* Layer D: Out-Point Draggable Handle (Full-height bracket matching rails) */}
              <div
                className="absolute top-0 bottom-0 z-30 flex items-center justify-center -translate-x-1/2 w-6 cursor-ew-resize group select-none"
                style={{ left: `${endPercent}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setHoverInfo(null);
                  setActiveDrag('end');
                }}
                title={t.clip.setOutPoint}
              >
                <div
                  className={`w-3.5 h-full rounded-r-md bg-cyan-400 group-hover:bg-cyan-300 shadow-lg shadow-cyan-500/40 flex flex-col items-center justify-center gap-1 transition-all border-y-[3px] border-r border-cyan-300/60 ${
                    activeDrag === 'end' ? 'ring-2 ring-white/80 scale-105' : ''
                  }`}
                >
                  <div className="w-1.5 h-0.5 bg-neutral-950/80 rounded-full" />
                  <div className="w-1.5 h-0.5 bg-neutral-950/80 rounded-full" />
                  <div className="w-1.5 h-0.5 bg-neutral-950/80 rounded-full" />
                </div>
              </div>

              {/* Layer E: Current Playhead Scrubber Line & Head */}
              <div
                className="absolute -top-6 bottom-0 z-40 pointer-events-none -ml-px w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)]"
                style={{ left: `${playheadPercent}%` }}
              >
                {/* Scrubber Head Cursor (Positioned in ruler tick area) */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)] pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setHoverInfo(null);
                    setActiveDrag('scrubber');
                  }}
                />
                {/* Bottom Anchor Dot */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
