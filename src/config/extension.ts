/**
 * Browser Extension Distribution & Store Configuration
 *
 * Reads the official Chrome Web Store and Microsoft Edge Add-ons installation URLs
 * from environment variables, with safe fallbacks to the published Easy Web Scraper listings.
 */

export const DEFAULT_CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/easy-web-scraper-%E6%99%BA%E8%83%BD%E7%BD%91%E9%A1%B5%E6%95%B0%E6%8D%AE%E9%87%87%E9%9B%86/hgbfnbcinkkopmgjckiabcofoohabhbn'

export const CHROME_STORE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHROME_STORE_URL) || DEFAULT_CHROME_STORE_URL

export const DEFAULT_EDGE_STORE_URL =
  'https://microsoftedge.microsoft.com/addons/detail/easy-web-scraper/hgbfnbcinkkopmgjckiabcofoohabhbn'

export const EDGE_STORE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EDGE_STORE_URL) || DEFAULT_EDGE_STORE_URL

export const TELEGRAM_CHANNEL_HANDLE = '@easywebscraper'
export const TELEGRAM_CHANNEL_URL = 'https://t.me/easywebscraper'
