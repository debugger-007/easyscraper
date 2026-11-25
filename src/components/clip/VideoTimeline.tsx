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
      className="relative z-30 w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-md p-4 lg:p-6 flex flex-col gap-4 select-none"
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
          <div className="rounded-xl overflow-hidden border border-primary/50 shadow-xl bg-inverse-surface/95 p-1.5 flex flex-col items-center gap-1.5 backdrop-blur-md">
            {hoverInfo.thumbnailIndex >= 0 && thumbnails[hoverInfo.thumbnailIndex] ? (
              <div
                style={
                  isVertical
                    ? { height: '124px', aspectRatio: `${effectiveAspect}` }
                    : { width: '136px', aspectRatio: `${effectiveAspect}` }
                }
                className="overflow-hidden rounded-lg border border-white/15 shadow-sm bg-black flex items-center justify-center"
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
                className="bg-surface-container-high/20 flex items-center justify-center rounded-lg"
              >
                <Film className="w-6 h-6 text-primary-fixed/50" />
              </div>
            )}
            <span className="text-[11px] font-code-label font-semibold text-primary-fixed px-2 py-0.5 rounded bg-primary/35 border border-primary-fixed/30">
              {formatTimecode(hoverInfo.time, false)}
            </span>
          </div>
          {/* Tooltip downward point arrow */}
          <div className="w-2.5 h-2.5 bg-inverse-surface/95 border-r border-b border-primary/50 rotate-45 -mt-1.5 shadow-sm" />
        </div>
      )}

      {/* Top Bar: Trim Action Buttons, Range Capsule & Zoom Controls */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 text-xs">
        {/* Left & Center Group: In/Out/Reset + Time Range Capsule */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center h-9 p-0.5 rounded-lg bg-surface-container-low gap-0.5">
            <button
              type="button"
              onClick={handleSetInPoint}
              className="inline-flex items-center gap-1.5 h-full px-3 rounded-md hover:bg-surface-container-lowest text-primary transition-colors cursor-pointer text-xs font-medium"
              title={t.clip.setInPoint}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{t.clip.setInPoint}</span>
            </button>

            <button
              type="button"
              onClick={handleSetOutPoint}
              className="inline-flex items-center gap-1.5 h-full px-3 rounded-md hover:bg-surface-container-lowest text-on-surface transition-colors cursor-pointer text-xs font-medium"
              title={t.clip.setOutPoint}
            >
              <Bookmark className="w-3.5 h-3.5 rotate-180" />
              <span>{t.clip.setOutPoint}</span>
            </button>

            <button
              type="button"
              onClick={handleResetTrim}
              className="inline-flex items-center gap-1.5 h-full px-2.5 rounded-md hover:bg-surface-container-lowest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-xs"
              title={t.clip.resetTrim}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clip.resetTrim}</span>
            </button>
          </div>

          {/* Integrated Time Range Capsule & Duration Badge */}
          <div className="inline-flex items-center h-9 gap-1.5 bg-surface-container-low rounded-lg px-2.5 overflow-x-auto max-w-full">
            {/* Jump to In */}
            <button
              type="button"
              onClick={handleJumpToIn}
              className="p-1 rounded-md hover:bg-surface-container-lowest text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title={t.clip.jumpToIn}
              aria-label={t.clip.jumpToIn}
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* In Badge */}
            <div className="flex items-center gap-1 text-xs font-code-label">
              <span className="text-on-surface-variant font-sans">{t.clip.inPoint}</span>
              <span className="text-primary font-semibold">{formatTimecode(startTime)}</span>
            </div>

            <span className="text-outline-variant px-0.5 select-none font-sans">→</span>

            {/* Out Badge */}
            <div className="flex items-center gap-1 text-xs font-code-label">
              <span className="text-on-surface-variant font-sans">{t.clip.outPoint}</span>
              <span className="text-on-surface font-semibold">{formatTimecode(endTime)}</span>
            </div>

            {/* Jump to Out */}
            <button
              type="button"
              onClick={handleJumpToOut}
              className="p-1 rounded-md hover:bg-surface-container-lowest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              title={t.clip.jumpToOut}
              aria-label={t.clip.jumpToOut}
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>

            {/* Divider */}
            <div className="w-px h-3.5 bg-outline-variant/60 mx-1" />

            {/* Total Trimmed Duration Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold whitespace-nowrap">
              <Scissors className="w-3 h-3" />
              <span className="hidden sm:inline font-sans font-medium">{t.clip.clipDuration}:</span>
              <span className="font-code-label">{formatTimecode(trimmedDuration)}</span>
            </div>
          </div>

          {/* Frame Extraction Status Pill */}
          {isExtractingFrames && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-code-label">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{t.clip.extractingFrames}</span>
            </div>
          )}
        </div>

        {/* Right: Timeline Zoom Controls */}
        <div className="inline-flex items-center h-9 gap-1 bg-surface-container-low rounded-lg p-0.5 text-xs self-start xl:self-auto shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1.0}
            className="w-8 h-full rounded-md text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container-lowest flex items-center justify-center transition-colors cursor-pointer"
            title={t.clip.zoomOut}
            aria-label={t.clip.zoomOut}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomFit}
            className="px-2.5 h-full inline-flex items-center justify-center rounded-md bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim font-code-label text-xs font-semibold min-w-[52px] transition-colors cursor-pointer"
            title={t.clip.zoomFit}
            aria-label={t.clip.zoomFit}
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 4.0}
            className="w-8 h-full rounded-md text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container-lowest flex items-center justify-center transition-colors cursor-pointer"
            title={t.clip.zoomIn}
            aria-label={t.clip.zoomIn}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Timeline Scrubber & Trim Ruler with Zoom */}
      <div className="relative pt-0.5 pb-0.5">
        {/* Horizontal Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto overflow-y-visible custom-scrollbar pt-5 pb-2 px-2 sm:px-3 select-none"
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
                      className={`font-code-label leading-none transition-opacity ${
                        mark.isMajor
                          ? 'text-[10px] text-on-surface-variant font-medium'
                          : 'text-[9px] text-outline'
                      }`}
                    >
                      {mark.label}
                    </span>
                    <div
                      className={`w-px mt-1 ${
                        mark.isMajor ? 'h-1.5 bg-outline-variant' : 'h-1 bg-outline-variant/50'
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
              <div className="relative h-16 w-full bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden shadow-inner">
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
                        className="h-full relative border-r border-surface-container-lowest/40 overflow-hidden bg-surface-container flex items-center justify-center shrink-0"
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
                          className="w-full h-full object-cover pointer-events-none select-none"
                          loading="eager"
                          draggable={false}
                        />
                      </div>
                    ))
                  ) : (
                    /* Loading Shimmer Skeleton while Frames are Extracting */
                    <div className="w-full h-full flex items-center bg-surface-container-low">
                      {Array.from({ length: targetDisplayCount }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            aspectRatio: `${effectiveAspect}`,
                            height: '100%',
                            flex: 'none',
                          }}
                          className="h-full border-r border-outline-variant/25 bg-surface-container animate-pulse flex items-center justify-center shrink-0"
                        >
                          <Film className="w-3.5 h-3.5 text-outline/40" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sublayer 2: Dimmed Out-of-bounds Before Start */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-inverse-surface/55 backdrop-blur-[0.5px] pointer-events-none transition-all duration-75"
                  style={{ width: `${startPercent}%` }}
                />

                {/* Sublayer 2: Dimmed Out-of-bounds After End */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-inverse-surface/55 backdrop-blur-[0.5px] pointer-events-none transition-all duration-75"
                  style={{ width: `${100 - endPercent}%` }}
                />
              </div>

              {/* Layer C: Unified Active Trim Selection Box (Botanical Viridian #006948) */}
              <div
                className="absolute inset-y-0 pointer-events-none z-20 bg-primary/10"
                style={{
                  left: `${startPercent}%`,
                  width: `${Math.max(0, endPercent - startPercent)}%`,
                }}
              >
                {/* Top Highlight Rail */}
                <div className="absolute top-0 inset-x-0 h-[3px] bg-primary shadow-[0_0_8px_rgba(0,105,72,0.35)]" />
                {/* Bottom Highlight Rail */}
                <div className="absolute bottom-0 inset-x-0 h-[3px] bg-primary shadow-[0_0_8px_rgba(0,105,72,0.35)]" />
              </div>

              {/* Layer D: In-Point Draggable Handle */}
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
                  className={`w-3.5 h-full rounded-l-md bg-primary group-hover:bg-primary-container shadow-sm flex items-center justify-center transition-all ${
                    activeDrag === 'start' ? 'ring-2 ring-primary-fixed scale-105' : ''
                  }`}
                >
                  <span className="w-0.5 h-5 rounded-full bg-on-primary/85" />
                </div>
              </div>

              {/* Layer D: Out-Point Draggable Handle */}
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
                  className={`w-3.5 h-full rounded-r-md bg-primary group-hover:bg-primary-container shadow-sm flex items-center justify-center transition-all ${
                    activeDrag === 'end' ? 'ring-2 ring-primary-fixed scale-105' : ''
                  }`}
                >
                  <span className="w-0.5 h-5 rounded-full bg-on-primary/85" />
                </div>
              </div>

              {/* Layer E: Current Playhead Scrubber Line & Head */}
              <div
                className="absolute -top-5 bottom-0 z-40 pointer-events-none -ml-px w-0.5 bg-primary shadow-[0_0_0_1px_rgba(255,255,255,0.65)]"
                style={{ left: `${playheadPercent}%` }}
              >
                {/* Scrubber Head Cursor */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface-container-lowest shadow-md pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setHoverInfo(null);
                    setActiveDrag('scrubber');
                  }}
                />
                {/* Bottom Anchor Dot */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
