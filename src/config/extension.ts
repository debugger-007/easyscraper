/**
 * Chrome Extension Distribution & Store Configuration
 *
 * Reads the official Chrome Web Store installation URL from `VITE_CHROME_STORE_URL`,
 * with a safe fallback to the published Easy Web Scraper store listing.
 */

export const DEFAULT_CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/easy-web-scraper-%E6%99%BA%E8%83%BD%E7%BD%91%E9%A1%B5%E6%95%B0%E6%8D%AE%E9%87%87%E9%9B%86/hgbfnbcinkkopmgjckiabcofoohabhbn'

export const CHROME_STORE_URL =
  import.meta.env.VITE_CHROME_STORE_URL || DEFAULT_CHROME_STORE_URL

export const TELEGRAM_CHANNEL_HANDLE = '@easywebscraper'
export const TELEGRAM_CHANNEL_URL = 'https://t.me/easywebscraper'
