/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Payment environment mode: 'live' or 'test'
   * Defaults to 'live' in production builds, and 'test' in local dev.
   */
  readonly VITE_PAYMENT_MODE?: 'test' | 'live'

  /**
   * Dodo Payments Monthly Pro Plan Checkout URL
   */
  readonly VITE_CHECKOUT_MONTHLY_URL?: string

  /**
   * Dodo Payments Lifetime Deal Plan Checkout URL
   */
  readonly VITE_CHECKOUT_LIFETIME_URL?: string

  /**
   * Official site origin / URL (e.g. https://easyscraper.pages.dev)
   */
  readonly VITE_SITE_URL?: string

  /**
   * Chrome Web Store fixed extension ID
   */
  readonly VITE_EXTENSION_ID?: string

  /**
   * Chrome Web Store extension install URL
   */
  readonly VITE_CHROME_STORE_URL?: string

  /**
   * Microsoft Edge Add-ons extension install URL
   */
  readonly VITE_EDGE_STORE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface HTMLVideoElement {
  captureStream?(): MediaStream
  mozCaptureStream?(): MediaStream
}

interface Window {
  webkitAudioContext?: typeof AudioContext
  __EASY_SCRAPER_EXTENSION_ID__?: string
}
