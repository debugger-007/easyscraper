import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTimecode, formatBytes, getAspectRatioValue } from '../clipUtils.ts';

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
});
