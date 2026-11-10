import { useState, useEffect, useRef } from 'react';
import { calculateThumbnailTimes } from './clipUtils';

export interface ThumbnailFrame {
  time: number;
  dataUrl: string;
}

export interface UseVideoThumbnailsResult {
  thumbnails: string[];
  isLoading: boolean;
  progress: number; // 0 to 1
  intrinsicAspect?: number;
}

interface CachedFrame {
  time: number;
  dataUrl: string;
}

const MAX_THUMBNAIL_CACHE_ENTRIES = 20;
const THUMBNAIL_CACHE = new Map<string, string[]>();

const MAX_POOL_ENTRIES = 10;
const VIDEO_FRAME_POOLS = new Map<string, CachedFrame[]>();

function getOrCreatePool(videoKey: string): CachedFrame[] {
  let pool = VIDEO_FRAME_POOLS.get(videoKey);
  if (!pool) {
    if (VIDEO_FRAME_POOLS.size >= MAX_POOL_ENTRIES) {
      const oldestKey = VIDEO_FRAME_POOLS.keys().next().value;
      if (oldestKey) VIDEO_FRAME_POOLS.delete(oldestKey);
    }
    pool = [];
    VIDEO_FRAME_POOLS.set(videoKey, pool);
  }
  return pool;
}

function findClosestFrame(pool: CachedFrame[], targetTime: number): CachedFrame | undefined {
  if (!pool || pool.length === 0) return undefined;
  let closest = pool[0];
  let minDiff = Math.abs(pool[0].time - targetTime);
  for (let i = 1; i < pool.length; i++) {
    const diff = Math.abs(pool[i].time - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closest = pool[i];
    }
  }
  return closest;
}

function getCachedThumbnails(key: string): string[] | undefined {
  const cached = THUMBNAIL_CACHE.get(key);
  if (!cached) return undefined;
  // Refresh recency for LRU eviction
  THUMBNAIL_CACHE.delete(key);
  THUMBNAIL_CACHE.set(key, cached);
  return cached;
}

function setCachedThumbnails(key: string, thumbnails: string[]): void {
  if (THUMBNAIL_CACHE.has(key)) {
    THUMBNAIL_CACHE.delete(key);
  } else if (THUMBNAIL_CACHE.size >= MAX_THUMBNAIL_CACHE_ENTRIES) {
    const oldestKey = THUMBNAIL_CACHE.keys().next().value;
    if (oldestKey) {
      THUMBNAIL_CACHE.delete(oldestKey);
    }
  }
  THUMBNAIL_CACHE.set(key, thumbnails);
}

/**
 * Extracts a sequence of high-DPI frame thumbnails evenly distributed across the video timeline.
 * Incorporates an intelligent frame pool so zooming the timeline provides instant, zero-flicker
 * visual continuity while lazily capturing finer keyframe intervals.
 */
export function useVideoThumbnails(
  videoUrl: string | null | undefined,
  duration: number,
  count = 14
): UseVideoThumbnailsResult {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [intrinsicAspect, setIntrinsicAspect] = useState<number | undefined>(undefined);
  const activeRunIdRef = useRef<number>(0);

  useEffect(() => {
    if (typeof document === 'undefined' || !videoUrl || duration <= 0 || count <= 0) {
      setThumbnails([]);
      setIsLoading(false);
      setProgress(0);
      return;
    }

    const videoKey = `${videoUrl}::${duration.toFixed(1)}`;
    const cacheKey = `${videoKey}::${count}`;
    const cached = getCachedThumbnails(cacheKey);
    if (cached && cached.length > 0) {
      setThumbnails(cached);
      setIsLoading(false);
      setProgress(1);
      return;
    }

    const times = calculateThumbnailTimes(duration, count);
    if (times.length === 0) {
      setIsLoading(false);
      return;
    }

    const pool = getOrCreatePool(videoKey);
    const currentFrames: string[] = new Array(times.length);

    // Instant Preview: If we already have captured frames in the pool, interpolate them immediately
    if (pool.length > 0) {
      for (let i = 0; i < times.length; i++) {
        const closest = findClosestFrame(pool, times[i]);
        if (closest) {
          currentFrames[i] = closest.dataUrl;
        }
      }
      if (currentFrames.every(Boolean)) {
        setThumbnails([...currentFrames]);
      }
    }

    const runId = ++activeRunIdRef.current;
    setIsLoading(true);
    setProgress(0);

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const canvas = document.createElement('canvas');
    // High-DPI canvas dimensions: 180px height provides sharp 2x/3x Retina rendering
    const targetHeight = 180;
    let targetWidth = 320;
    canvas.height = targetHeight;
    canvas.width = targetWidth;
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    let isCleanedUp = false;

    const cleanup = () => {
      isCleanedUp = true;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    const runExtraction = async () => {
      try {
        video.src = videoUrl;

        // 1. Wait for video metadata
        await new Promise<void>((resolve, reject) => {
          const onLoaded = () => {
            cleanupMetaListeners();
            resolve();
          };
          const onError = () => {
            cleanupMetaListeners();
            reject(new Error('Failed to load video metadata for thumbnails'));
          };
          const cleanupMetaListeners = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('error', onError);
          };

          if (video.readyState >= 1) {
            resolve();
          } else {
            video.addEventListener('loadedmetadata', onLoaded);
            video.addEventListener('error', onError);
          }
        });

        if (isCleanedUp || activeRunIdRef.current !== runId) return;

        // Calculate aspect ratio with High-DPI target resolution
        const aspect =
          video.videoWidth && video.videoHeight
            ? video.videoWidth / video.videoHeight
            : 16 / 9;
        setIntrinsicAspect(aspect);
        targetWidth = Math.max(40, Math.round(targetHeight * aspect));
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }

        // 2. Sequentially seek and capture high-fidelity frames
        for (let i = 0; i < times.length; i++) {
          if (isCleanedUp || activeRunIdRef.current !== runId) break;

          const targetTime = times[i];
          const closest = findClosestFrame(pool, targetTime);

          // If an existing frame is within 150ms of targetTime, reuse it immediately without seeking
          if (closest && Math.abs(closest.time - targetTime) <= 0.15) {
            currentFrames[i] = closest.dataUrl;
            setThumbnails([...currentFrames]);
            setProgress((i + 1) / times.length);
            continue;
          }

          await new Promise<void>((resolve) => {
            let timeoutTimer: ReturnType<typeof setTimeout>;

            const onSeeked = () => {
              clearTimeout(timeoutTimer);
              video.removeEventListener('seeked', onSeeked);

              if (!isCleanedUp && activeRunIdRef.current === runId && ctx) {
                try {
                  ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
                  // High quality JPEG (0.85) without blocky artifacts
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                  pool.push({ time: targetTime, dataUrl });
                  currentFrames[i] = dataUrl;
                  setThumbnails([...currentFrames]);
                  setProgress((i + 1) / times.length);
                } catch (e) {
                  console.warn('Canvas frame capture warning:', e);
                }
              }
              resolve();
            };

            timeoutTimer = setTimeout(() => {
              video.removeEventListener('seeked', onSeeked);
              resolve();
            }, 1200);

            video.addEventListener('seeked', onSeeked);
            video.currentTime = targetTime;
          });
        }

        if (
          !isCleanedUp &&
          activeRunIdRef.current === runId &&
          currentFrames.filter(Boolean).length === times.length
        ) {
          setCachedThumbnails(cacheKey, currentFrames);
        }
      } catch (err) {
        console.warn('Thumbnail generation warning:', err);
      } finally {
        if (!isCleanedUp && activeRunIdRef.current === runId) {
          setIsLoading(false);
          setProgress(1);
        }
        cleanup();
      }
    };

    runExtraction();

    return () => {
      cleanup();
    };
  }, [videoUrl, duration, count]);

  return { thumbnails, isLoading, progress, intrinsicAspect };
}
