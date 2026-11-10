/**
 * Utility functions for Omniclip Studio
 */

export type AspectRatioType = 'original' | '16:9' | '9:16' | '1:1' | '4:3';

/**
 * Formats seconds into a standard media timecode string: [HH:]MM:SS[.mmm]
 */
export function formatTimecode(seconds: number, includeMs = true): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  const base = `${h > 0 ? `${pad(h)}:` : ''}${pad(m)}:${pad(s)}`;
  return includeMs ? `${base}.${pad(ms, 3)}` : base;
}

/**
 * Formats bytes into human-readable size: KB, MB, GB
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0 || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Calculates aspect ratio numeric value (width / height)
 */
export function getAspectRatioValue(
  ratio: AspectRatioType,
  naturalWidth = 1920,
  naturalHeight = 1080
): number {
  switch (ratio) {
    case '16:9':
      return 16 / 9;
    case '9:16':
      return 9 / 16;
    case '1:1':
      return 1;
    case '4:3':
      return 4 / 3;
    case 'original':
    default:
      return naturalWidth > 0 && naturalHeight > 0 ? naturalWidth / naturalHeight : 16 / 9;
  }
}

export interface DetectedAspectRatio {
  label: string;
  standard: AspectRatioType | null;
  width: number;
  height: number;
  ratio: number;
  isVertical: boolean;
}

/**
 * Automatically detects the aspect ratio from video dimensions
 */
export function detectAspectRatio(width?: number, height?: number): DetectedAspectRatio | null {
  if (!width || !height || width <= 0 || height <= 0) return null;
  const ratio = width / height;
  const isVertical = height > width;

  if (Math.abs(ratio - 16 / 9) <= 0.05) {
    return { label: '16:9', standard: '16:9', width, height, ratio, isVertical: false };
  }
  if (Math.abs(ratio - 9 / 16) <= 0.05) {
    return { label: '9:16', standard: '9:16', width, height, ratio, isVertical: true };
  }
  if (Math.abs(ratio - 1) <= 0.05) {
    return { label: '1:1', standard: '1:1', width, height, ratio, isVertical: false };
  }
  if (Math.abs(ratio - 4 / 3) <= 0.05) {
    return { label: '4:3', standard: '4:3', width, height, ratio, isVertical: false };
  }
  if (Math.abs(ratio - 21 / 9) <= 0.08) {
    return { label: '21:9', standard: null, width, height, ratio, isVertical: false };
  }

  // Fallback to approximate aspect ratio label
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height));
  const simW = Math.round(width) / divisor;
  const simH = Math.round(height) / divisor;

  const label = simW < 50 && simH < 50 ? `${simW}:${simH}` : `${ratio.toFixed(2)}:1`;

  return {
    label,
    standard: null,
    width,
    height,
    ratio,
    isVertical,
  };
}

/**
 * Calculates evenly distributed sample timestamps for timeline thumbnails
 */
export function calculateThumbnailTimes(duration: number, count = 12): number[] {
  if (duration <= 0 || count <= 0) return [];
  const times: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = Math.max(0.05, Math.min(duration - 0.05, ((i + 0.5) / count) * duration));
    times.push(Number(t.toFixed(3)));
  }
  return times;
}

export interface RulerTick {
  time: number;
  percent: number;
  label: string;
  isMajor: boolean;
}

/**
 * Calculates adaptive timeline ruler graduation ticks based on duration and zoom level.
 * Scales dynamically from broad intervals (e.g. 10s at 1x) to precision intervals (e.g. 0.5s or 1s at 4x).
 */
export function calculateRulerTicks(duration: number, zoomLevel = 1): RulerTick[] {
  if (duration <= 0 || zoomLevel <= 0) return [];
  const targetTickCount = Math.max(5, Math.round(8 * zoomLevel));
  const rawStep = duration / targetTickCount;

  const candidateSteps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1800, 3600];
  let step = candidateSteps.find((s) => s >= rawStep);
  if (!step) {
    step = Math.ceil(rawStep / 3600) * 3600;
  }

  const ticks: RulerTick[] = [];
  const count = Math.floor(duration / step);

  for (let i = 0; i <= count; i++) {
    const time = Number((i * step).toFixed(3));
    if (time > duration) break;
    const percent = Math.min(100, Number(((time / duration) * 100).toFixed(4)));
    const isSubSecond = step < 1;
    ticks.push({
      time,
      percent,
      label: formatTimecode(time, isSubSecond),
      isMajor: i % 2 === 0 || count <= 10,
    });
  }

  // Ensure end duration tick if not present and last tick isn't too close (< 6% distance)
  const lastTick = ticks[ticks.length - 1];
  if (lastTick && lastTick.time < duration && (100 - lastTick.percent) >= 6) {
    const isSubSecond = step < 1;
    ticks.push({
      time: duration,
      percent: 100,
      label: formatTimecode(duration, isSubSecond),
      isMajor: true,
    });
  }

  return ticks;
}

