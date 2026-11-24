import { CHROME_STORE_URL } from './extension'
import type { SupportedLocale } from '../i18n/types'

/**
 * Canonical site origin used for absolute SEO URLs (canonical, hreflang, OG, JSON-LD).
 * When migrating to a custom domain, update `VITE_SITE_URL` or this fallback once.
 */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://easyscraper.pages.dev'
).replace(/\/+$/, '')

export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`

export function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

/**
 * Build absolute canonical & hreflang link descriptors for a bilingual route.
 * @param basePath English path without locale prefix, e.g. '/' or '/privacy'
 * @param locale Active locale ('en' | 'zh' | 'zh_CN')
 */
export function buildHreflangLinks(basePath: string, locale: SupportedLocale) {
  const enPath = basePath === '/' ? '/' : basePath
  const zhPath = basePath === '/' ? '/zh' : `/zh${basePath}`
  const isEn = locale === 'en'

  return [
    { rel: 'canonical', href: toAbsoluteUrl(isEn ? enPath : zhPath) },
    { rel: 'alternate', hrefLang: 'en', href: toAbsoluteUrl(enPath) },
    { rel: 'alternate', hrefLang: 'zh-CN', href: toAbsoluteUrl(zhPath) },
    { rel: 'alternate', hrefLang: 'x-default', href: toAbsoluteUrl(enPath) },
  ]
}

export function buildSoftwareAppJsonLd(params: {
  name: string
  description: string
  url: string
  inLanguage: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: params.name,
    applicationCategory: 'BrowserApplication',
    operatingSystem: 'Chrome, Edge, Brave, Chromium',
    url: params.url,
    downloadUrl: CHROME_STORE_URL,
    installUrl: CHROME_STORE_URL,
    image: OG_IMAGE_URL,
    description: params.description,
    inLanguage: params.inLanguage,
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Community',
        price: '0',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Pro Monthly',
        price: '6.99',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Lifetime License',
        price: '39.99',
        priceCurrency: 'USD',
      },
    ],
  }
}

export function buildFaqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}
