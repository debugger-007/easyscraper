import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimecode,
  formatBytes,
  getAspectRatioValue,
  calculateThumbnailTimes,
  detectAspectRatio,
} from '../clipUtils.ts';

describe('clipUtils', () => {
  it('formats timecodes accurately with and without milliseconds', () => {
    assert.equal(formatTimecode(0), '00:00.000');
    assert.equal(formatTimecode(0, false), '00:00');
    assert.equal(formatTimecode(65.123), '01:05.123');
    assert.equal(formatTimecode(3665.456), '01:01:05.456');
    assert.equal(formatTimecode(3665.456, false), '01:01:05');
  });

  it('formats byte sizes cleanly', () => {
    assert.equal(formatBytes(0), '0 B');
    assert.equal(formatBytes(1024), '1.0 KB');
    assert.equal(formatBytes(1048576 * 2.5), '2.5 MB');
    assert.equal(formatBytes(1073741824 * 1.2), '1.2 GB');
  });

  it('calculates aspect ratios correctly', () => {
    assert.equal(getAspectRatioValue('16:9'), 16 / 9);
    assert.equal(getAspectRatioValue('9:16'), 9 / 16);
    assert.equal(getAspectRatioValue('1:1'), 1);
    assert.equal(getAspectRatioValue('4:3'), 4 / 3);
    assert.equal(getAspectRatioValue('original', 1920, 1080), 1920 / 1080);
    assert.equal(getAspectRatioValue('original', 720, 1280), 720 / 1280);
  });

  it('calculates evenly spaced thumbnail sample times', () => {
    const times = calculateThumbnailTimes(10, 5);
    assert.equal(times.length, 5);
    assert.deepEqual(times, [1, 3, 5, 7, 9]);

    assert.deepEqual(calculateThumbnailTimes(0, 5), []);
    assert.deepEqual(calculateThumbnailTimes(10, 0), []);
  });

  it('detects aspect ratios correctly from video dimensions', () => {
    // 16:9 Landscape
    const r169 = detectAspectRatio(1920, 1080);
    assert.equal(r169?.label, '16:9');
    assert.equal(r169?.standard, '16:9');
    assert.equal(r169?.isVertical, false);

    // 9:16 Portrait (Shorts/TikTok)
    const r916 = detectAspectRatio(1080, 1920);
    assert.equal(r916?.label, '9:16');
    assert.equal(r916?.standard, '9:16');
    assert.equal(r916?.isVertical, true);

    // 1:1 Square
    const r11 = detectAspectRatio(1080, 1080);
    assert.equal(r11?.label, '1:1');
    assert.equal(r11?.standard, '1:1');
    assert.equal(r11?.isVertical, false);

    // 4:3 Classic
    const r43 = detectAspectRatio(1440, 1080);
    assert.equal(r43?.label, '4:3');
    assert.equal(r43?.standard, '4:3');

    // Invalid or missing dimensions
    assert.equal(detectAspectRatio(0, 1080), null);
    assert.equal(detectAspectRatio(undefined, undefined), null);
  });
});
