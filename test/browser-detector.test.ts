import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isEdgeBrowser, getTargetBrowser } from '../src/utils/browserDetector.ts'

describe('browserDetector', () => {
  it('detects desktop Chromium-based Microsoft Edge via User-Agent', () => {
    const edgeWindows =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'
    assert.equal(isEdgeBrowser({ userAgent: edgeWindows }), true)
    assert.equal(getTargetBrowser({ userAgent: edgeWindows }), 'edge')

    const edgeMac =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.86'
    assert.equal(isEdgeBrowser({ userAgent: edgeMac }), true)
    assert.equal(getTargetBrowser({ userAgent: edgeMac }), 'edge')

    const edgeLinux =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'
    assert.equal(isEdgeBrowser({ userAgent: edgeLinux }), true)
  })

  it('detects mobile and legacy Microsoft Edge variants', () => {
    // Edge on Android (EdgA)
    const edgeAndroid =
      'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 EdgA/120.0.0.0'
    assert.equal(isEdgeBrowser({ userAgent: edgeAndroid }), true)
    assert.equal(getTargetBrowser({ userAgent: edgeAndroid }), 'edge')

    // Edge on iOS (EdgiOS)
    const edgeIos =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 EdgiOS/45.9.1'
    assert.equal(isEdgeBrowser({ userAgent: edgeIos }), true)
    assert.equal(getTargetBrowser({ userAgent: edgeIos }), 'edge')

    // Legacy Edge (EdgeHTML)
    const legacyEdge =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582'
    assert.equal(isEdgeBrowser({ userAgent: legacyEdge }), true)
    assert.equal(getTargetBrowser({ userAgent: legacyEdge }), 'edge')
  })

  it('detects Microsoft Edge via User-Agent Client Hints brands', () => {
    assert.equal(
      isEdgeBrowser({
        brands: [{ brand: 'Chromium' }, { brand: 'Microsoft Edge' }],
      }),
      true
    )
    assert.equal(
      getTargetBrowser({
        brands: [{ brand: 'Chromium' }, { brand: 'Edge' }],
      }),
      'edge'
    )
  })

  it('treats Google Chrome and all other browsers as non-Edge (target chrome)', () => {
    // Standard Google Chrome Desktop
    const chromeMac =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    assert.equal(isEdgeBrowser({ userAgent: chromeMac }), false)
    assert.equal(getTargetBrowser({ userAgent: chromeMac }), 'chrome')

    // Chrome with Client Hints
    assert.equal(
      isEdgeBrowser({
        brands: [{ brand: 'Chromium' }, { brand: 'Google Chrome' }],
      }),
      false
    )
    assert.equal(
      getTargetBrowser({
        brands: [{ brand: 'Chromium' }, { brand: 'Google Chrome' }],
      }),
      'chrome'
    )

    // Safari on macOS
    const safariMac =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15'
    assert.equal(isEdgeBrowser({ userAgent: safariMac }), false)
    assert.equal(getTargetBrowser({ userAgent: safariMac }), 'chrome')

    // Mozilla Firefox
    const firefox =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0'
    assert.equal(isEdgeBrowser({ userAgent: firefox }), false)
    assert.equal(getTargetBrowser({ userAgent: firefox }), 'chrome')

    // Opera Desktop (OPR)
    const opera =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/115.0.0.0'
    assert.equal(isEdgeBrowser({ userAgent: opera }), false)
    assert.equal(getTargetBrowser({ userAgent: opera }), 'chrome')

    // Empty User-Agent / Node SSR environment
    assert.equal(isEdgeBrowser({ userAgent: '' }), false)
    assert.equal(getTargetBrowser({ userAgent: '' }), 'chrome')
    assert.equal(isEdgeBrowser({}), false)
    assert.equal(getTargetBrowser({}), 'chrome')
  })
})
