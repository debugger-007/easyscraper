import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimecode,
  formatBytes,
  getAspectRatioValue,
  calculateThumbnailTimes,
  detectAspectRatio,
  calculateRulerTicks,
  checkClipBrowserSupport,
  isChromiumBrowser,
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

  it('calculates adaptive ruler ticks based on zoom level', () => {
    // Edge case: invalid duration or zoom
    assert.deepEqual(calculateRulerTicks(0, 1), []);
    assert.deepEqual(calculateRulerTicks(-5, 1), []);
    assert.deepEqual(calculateRulerTicks(60, 0), []);

    // At 1x zoom (Fit), ticks are spaced cleanly
    const fitTicks = calculateRulerTicks(60, 1);
    assert.ok(fitTicks.length >= 5 && fitTicks.length <= 15);
    assert.equal(fitTicks[0].time, 0);
    assert.equal(fitTicks[0].percent, 0);
    assert.equal(fitTicks[0].label, '00:00');
    assert.equal(fitTicks[0].isMajor, true);

    // At 4x zoom, tick density increases proportionally
    const zoomTicks = calculateRulerTicks(60, 4);
    assert.ok(zoomTicks.length > fitTicks.length);
    assert.equal(zoomTicks[0].percent, 0);
    assert.ok(zoomTicks.every((t) => t.time >= 0 && t.time <= 60));

    // Sub-second precision for very short clips at high zoom
    const subSecTicks = calculateRulerTicks(2, 4);
    assert.ok(subSecTicks.length >= 4);
    assert.ok(subSecTicks.some((t) => t.label.includes('.')));
  });

  it('checks browser support for clip APIs accurately in environments', () => {
    // In Node (non-browser or mock), tests graceful fallback
    const res = checkClipBrowserSupport();
    assert.ok(typeof res.isSupported === 'boolean');
    assert.ok(typeof res.isChromium === 'boolean');
    assert.ok(typeof res.hasWebCodecs === 'boolean');
    assert.ok(Array.isArray(res.missingApis));
  });

  it('detects Chromium vs non-Chromium browser engines accurately', () => {
    // Chrome Desktop via Client Hints
    assert.equal(
      isChromiumBrowser({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        brands: [{ brand: 'Chromium' }, { brand: 'Google Chrome' }],
      }),
      true
    );

    // Microsoft Edge Desktop (Chromium)
    assert.equal(
      isChromiumBrowser({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
        brands: [{ brand: 'Chromium' }, { brand: 'Microsoft Edge' }],
      }),
      true
    );

    // Safari Desktop (WebKit -> NOT Chromium)
    assert.equal(
      isChromiumBrowser({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
        hasChromeGlobal: false,
      }),
      false
    );

    // Firefox Desktop (Gecko -> NOT Chromium)
    assert.equal(
      isChromiumBrowser({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0',
        hasChromeGlobal: false,
      }),
      false
    );

    // Chrome on iOS (WebKit wrapper -> NOT Chromium)
    assert.equal(
      isChromiumBrowser({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1',
        hasChromeGlobal: false,
      }),
      false
    );

    // checkClipBrowserSupport marks non-Chromium as unsupported
    const safariSupport = checkClipBrowserSupport({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
      hasChromeGlobal: false,
    });
    assert.equal(safariSupport.isChromium, false);
    assert.equal(safariSupport.isSupported, false);
  });
});
