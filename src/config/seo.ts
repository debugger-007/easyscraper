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

export function buildFeatureSeoHead(params: {
  basePath: string
  locale: SupportedLocale
  title: string
  description: string
  keywords: string
  ogLocale: string
  faqs: Array<{ q: string; a: string }>
}) {
  const isEn = params.locale === 'en'
  const pageUrl = toAbsoluteUrl(isEn ? params.basePath : `/zh${params.basePath}`)
  const appJsonLd = buildSoftwareAppJsonLd({
    name: params.title,
    description: params.description,
    url: pageUrl,
    inLanguage: isEn ? 'en' : 'zh-CN',
  })
  const faqJsonLd = buildFaqJsonLd(params.faqs)

  return {
    meta: [
      { title: params.title },
      { name: 'description', content: params.description },
      { name: 'keywords', content: params.keywords },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:url', content: pageUrl },
      { property: 'og:title', content: params.title },
      { property: 'og:description', content: params.description },
      { property: 'og:image', content: OG_IMAGE_URL },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: params.ogLocale },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: params.title },
      { name: 'twitter:description', content: params.description },
      { name: 'twitter:image', content: OG_IMAGE_URL },
    ],
    links: buildHreflangLinks(params.basePath, params.locale),
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify(appJsonLd) },
      { type: 'application/ld+json', children: JSON.stringify(faqJsonLd) },
    ],
  }
}
