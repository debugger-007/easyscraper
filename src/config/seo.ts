import { CHROME_STORE_URL, EDGE_STORE_URL, TELEGRAM_CHANNEL_URL } from './extension'
import { CHANGELOG_FEED } from '../data/changelogData'
import { i18n, normalizeLocale } from '../i18n'
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
  const dict = i18n.getDictionary(normalizeLocale(params.inLanguage))
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: params.name,
    applicationCategory: 'BrowserApplication',
    applicationSubCategory: dict.meta.schema.applicationSubCategory,
    operatingSystem: 'Chrome, Edge, Brave, Chromium',
    softwareVersion: CHANGELOG_FEED.latestVersion,
    url: params.url,
    downloadUrl: CHROME_STORE_URL,
    installUrl: CHROME_STORE_URL,
    image: OG_IMAGE_URL,
    description: params.description,
    inLanguage: params.inLanguage,
    sameAs: [CHROME_STORE_URL, EDGE_STORE_URL, TELEGRAM_CHANNEL_URL],
    featureList: dict.meta.schema.featureList,
    offers: [
      {
        '@type': 'Offer',
        name: dict.pricing.plans.free.name,
        price: '0',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: dict.pricing.plans.monthly.name,
        price: '6.99',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: dict.pricing.plans.yearly.name,
        price: '74.99',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: dict.pricing.plans.lifetime.name,
        price: '39.99',
        priceCurrency: 'USD',
      },
    ],
  }
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Easy Web Scraper',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    sameAs: [CHROME_STORE_URL, EDGE_STORE_URL, TELEGRAM_CHANNEL_URL],
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

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function buildHowToJsonLd(params: {
  name: string
  description: string
  url: string
  inLanguage: string
  steps: Array<{ title: string; description: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    url: params.url,
    inLanguage: params.inLanguage,
    image: OG_IMAGE_URL,
    step: params.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  }
}

export type GuideSlug =
  | 'scrape-website-to-excel'
  | 'download-m3u8-video-chrome'
  | 'scrape-behind-login-chrome'

export function isGuideSlug(slug: string): slug is GuideSlug {
  return Object.prototype.hasOwnProperty.call(i18n.getDictionary('en').guides.items, slug)
}

interface SeoHeadData {
  basePath: string
  title: string
  description: string
  keywords: string
  ogLocale: string
  ogType?: 'website' | 'article'
  jsonLd: object[]
}

export function buildSeoHead(params: SeoHeadData & { locale: SupportedLocale }) {
  const isEn = params.locale === 'en'
  const pageUrl = toAbsoluteUrl(isEn ? params.basePath : `/zh${params.basePath}`)

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
      { property: 'og:type', content: params.ogType ?? 'website' },
      { property: 'og:locale', content: params.ogLocale },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: params.title },
      { name: 'twitter:description', content: params.description },
      { name: 'twitter:image', content: OG_IMAGE_URL },
    ],
    links: buildHreflangLinks(params.basePath, params.locale),
    scripts: params.jsonLd.map((schema) => ({
      type: 'application/ld+json',
      children: JSON.stringify(schema),
    })),
  }
}

export function getGuideSeoData(slug: GuideSlug, locale: SupportedLocale): SeoHeadData {
  const isEn = locale === 'en'
  const dict = i18n.getDictionary(normalizeLocale(locale))
  const guide = dict.guides.items[slug]
  const basePath = `/guides/${slug}`
  const homeUrl = toAbsoluteUrl(isEn ? '/' : '/zh')
  const pageUrl = toAbsoluteUrl(isEn ? basePath : `/zh${basePath}`)

  return {
    basePath,
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.metaKeywords,
    ogLocale: dict.meta.ogLocale,
    ogType: 'article',
    jsonLd: [
      buildHowToJsonLd({
        name: guide.title,
        description: guide.metaDescription,
        url: pageUrl,
        inLanguage: isEn ? 'en' : 'zh-CN',
        steps: guide.steps,
      }),
      buildFaqJsonLd(guide.faqs),
      buildBreadcrumbJsonLd([
        { name: dict.meta.schema.breadcrumbHome, url: homeUrl },
        { name: dict.meta.schema.breadcrumbGuides, url: `${homeUrl}#how-it-works` },
        { name: guide.shortTitle, url: pageUrl },
      ]),
    ],
  }
}

export function getCompareSeoData(locale: SupportedLocale): SeoHeadData {
  const isEn = locale === 'en'
  const dict = i18n.getDictionary(normalizeLocale(locale))
  const homeUrl = toAbsoluteUrl(isEn ? '/' : '/zh')
  const pageUrl = toAbsoluteUrl(isEn ? '/compare' : '/zh/compare')

  return {
    basePath: '/compare',
    title: dict.comparePage.metaTitle,
    description: dict.comparePage.metaDescription,
    keywords: dict.comparePage.metaKeywords,
    ogLocale: dict.meta.ogLocale,
    jsonLd: [
      buildSoftwareAppJsonLd({
        name: dict.meta.siteName,
        description: dict.comparePage.metaDescription,
        url: pageUrl,
        inLanguage: isEn ? 'en' : 'zh-CN',
      }),
      buildFaqJsonLd(dict.comparePage.faq.items),
      buildBreadcrumbJsonLd([
        { name: dict.comparePage.breadcrumb.home, url: homeUrl },
        { name: dict.comparePage.breadcrumb.current, url: pageUrl },
      ]),
    ],
  }
}

export function getFaqSeoData(locale: SupportedLocale): SeoHeadData {
  const isEn = locale === 'en'
  const dict = i18n.getDictionary(normalizeLocale(locale))
  const homeUrl = toAbsoluteUrl(isEn ? '/' : '/zh')
  const pageUrl = toAbsoluteUrl(isEn ? '/faq' : '/zh/faq')

  return {
    basePath: '/faq',
    title: dict.faqPage.metaTitle,
    description: dict.faqPage.metaDescription,
    keywords: dict.faqPage.metaKeywords,
    ogLocale: dict.meta.ogLocale,
    jsonLd: [
      buildFaqJsonLd(dict.faqPage.categories.flatMap((cat) => cat.items)),
      buildBreadcrumbJsonLd([
        { name: dict.faqPage.breadcrumb.home, url: homeUrl },
        { name: dict.faqPage.breadcrumb.current, url: pageUrl },
      ]),
    ],
  }
}

export function buildGuideSeoHead(params: {
  slug: GuideSlug
  locale: SupportedLocale
}) {
  return buildSeoHead({ ...getGuideSeoData(params.slug, params.locale), locale: params.locale })
}

export function buildCompareSeoHead(locale: SupportedLocale) {
  return buildSeoHead({ ...getCompareSeoData(locale), locale })
}

export function buildFaqSeoHead(locale: SupportedLocale) {
  return buildSeoHead({ ...getFaqSeoData(locale), locale })
}

export function buildFeatureSeoHead(params: {
  basePath: string
  locale: SupportedLocale
  title: string
  description: string
  keywords: string
  ogLocale: string
  faqs: Array<{ q: string; a: string }>
  breadcrumbName?: string
}) {
  const isEn = params.locale === 'en'
  const dict = i18n.getDictionary(normalizeLocale(params.locale))
  const homeUrl = toAbsoluteUrl(isEn ? '/' : '/zh')
  const pageUrl = toAbsoluteUrl(isEn ? params.basePath : `/zh${params.basePath}`)

  return buildSeoHead({
    basePath: params.basePath,
    locale: params.locale,
    title: params.title,
    description: params.description,
    keywords: params.keywords,
    ogLocale: params.ogLocale,
    jsonLd: [
      buildSoftwareAppJsonLd({
        name: params.title,
        description: params.description,
        url: pageUrl,
        inLanguage: isEn ? 'en' : 'zh-CN',
      }),
      buildFaqJsonLd(params.faqs),
      buildBreadcrumbJsonLd([
        { name: dict.meta.schema.breadcrumbHome, url: homeUrl },
        { name: dict.meta.schema.breadcrumbFeatures, url: `${homeUrl}#features` },
        { name: params.breadcrumbName || params.title, url: pageUrl },
      ]),
    ],
  })
}
