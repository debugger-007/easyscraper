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
}

const MAX_THUMBNAIL_CACHE_ENTRIES = 20;
const THUMBNAIL_CACHE = new Map<string, string[]>();

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
 */
export function useVideoThumbnails(
  videoUrl: string | null | undefined,
  duration: number,
  count = 14
): UseVideoThumbnailsResult {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const activeRunIdRef = useRef<number>(0);

  useEffect(() => {
    if (typeof document === 'undefined' || !videoUrl || duration <= 0 || count <= 0) {
      setThumbnails([]);
      setIsLoading(false);
      setProgress(0);
      return;
    }

    const cacheKey = `${videoUrl}::${duration.toFixed(1)}::${count}`;
    const cached = getCachedThumbnails(cacheKey);
    if (cached && cached.length > 0) {
      setThumbnails(cached);
      setIsLoading(false);
      setProgress(1);
      return;
    }

    const runId = ++activeRunIdRef.current;
    setIsLoading(true);
    setProgress(0);

    const times = calculateThumbnailTimes(duration, count);
    if (times.length === 0) {
      setIsLoading(false);
      return;
    }

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
    const collected: string[] = [];

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
                  collected.push(dataUrl);
                  setThumbnails([...collected]);
                  setProgress(collected.length / times.length);
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

        if (!isCleanedUp && activeRunIdRef.current === runId && collected.length > 0) {
          setCachedThumbnails(cacheKey, collected);
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

  return { thumbnails, isLoading, progress };
}
