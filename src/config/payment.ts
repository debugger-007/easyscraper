/**
 * Payment and Checkout Configuration
 *
 * Designed for Open-Source Security & Environment Isolation:
 * - Real production Live URLs are NEVER hardcoded in the codebase.
 * - Live checkout URLs are injected at build-time via GitHub Actions / environment variables:
 *   - VITE_CHECKOUT_MONTHLY_URL
 *   - VITE_CHECKOUT_LIFETIME_URL
 *   - VITE_PAYMENT_MODE ('test' | 'live')
 * - Local development defaults to Dodo Payments sandbox test links.
 */

export type PaymentMode = 'test' | 'live'

export interface CheckoutUrls {
  monthly: string
  lifetime: string
}

export const DODO_CHECKOUT_CONFIG: Record<PaymentMode, CheckoutUrls> = {
  test: {
    monthly:
      'https://test.checkout.dodopayments.com/buy/pdt_0Nr8dOIRnaz5hwzASF9YS?quantity=1&redirect_url=https://easyscraper.pages.dev/payment/success',
    lifetime:
      'https://test.checkout.dodopayments.com/buy/pdt_0Nr8cSXRWviaMfq4VAT7o?quantity=1&redirect_url=https://easyscraper.pages.dev/payment/success',
  },
  live: {
    // In an open-source repository, live URLs are injected via environment variables.
    monthly: '',
    lifetime: '',
  },
} as const

/**
 * Resolves active payment mode:
 * 1. Explicit VITE_PAYMENT_MODE ('test' or 'live')
 * 2. If not specified, 'live' in production build, 'test' in development
 */
export const getPaymentMode = (): PaymentMode => {
  const envMode = import.meta.env.VITE_PAYMENT_MODE
  if (envMode === 'live' || envMode === 'test') {
    return envMode
  }
  return import.meta.env.PROD ? 'live' : 'test'
}

/**
 * Gets payment checkout configuration with safe fallbacks.
 */
export const getPaymentConfig = () => {
  const mode = getPaymentMode()
  const defaults = DODO_CHECKOUT_CONFIG[mode]

  const monthlyCheckoutUrl =
    import.meta.env.VITE_CHECKOUT_MONTHLY_URL ||
    defaults.monthly ||
    DODO_CHECKOUT_CONFIG.test.monthly

  const lifetimeCheckoutUrl =
    import.meta.env.VITE_CHECKOUT_LIFETIME_URL ||
    defaults.lifetime ||
    DODO_CHECKOUT_CONFIG.test.lifetime

  return {
    mode,
    isLive: mode === 'live',
    isTest: mode === 'test',
    monthlyCheckoutUrl,
    lifetimeCheckoutUrl,
  }
}

export const paymentConfig = getPaymentConfig()
