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
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

