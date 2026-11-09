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
