import React from 'react'
import { renderToString } from 'react-dom/server'
import {
  RouterProvider,
  createMemoryHistory,
  createRouter as createTanStackRouter,
} from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { en } from './i18n/locales/en'
import { zh_CN } from './i18n/locales/zh_CN'
import { termsData, privacyData, refundData } from './data/legalContent'
import { CHANGELOG_FEED } from './data/changelogData'
import {
  OG_IMAGE_URL,
  toAbsoluteUrl,
  buildHreflangLinks,
  buildSoftwareAppJsonLd,
  buildOrganizationJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  isGuideSlug,
  getGuideSeoData,
  getCompareSeoData,
  getFaqSeoData,
} from './config/seo'
import type { SupportedLocale } from './i18n/types'

export interface PrerenderRouteResult {
  route: string
  lang: string
  title: string
  description: string
  keywords?: string
  ogUrl: string
  ogLocale: string
  ogType?: 'website' | 'article'
  siteName: string
  ogImage: string
  links: Array<{ rel: string; href: string; hrefLang?: string }>
  jsonLd: object[]
  appHtml: string
}

function getSeoMetadata(route: string): Omit<PrerenderRouteResult, 'appHtml'> {
  const isZh = route === '/zh' || route.startsWith('/zh/')
  const locale: SupportedLocale = isZh ? 'zh_CN' : 'en'
  const dict = isZh ? zh_CN : en
  const lang = isZh ? 'zh-CN' : 'en'
  const basePath = isZh ? route.replace(/^\/zh/, '') || '/' : route
  const ogUrl = toAbsoluteUrl(route)
  const base = {
    route,
    lang,
    ogUrl,
    ogLocale: dict.meta.ogLocale,
    siteName: dict.meta.siteName,
    ogImage: OG_IMAGE_URL,
    links: buildHreflangLinks(basePath, locale),
  }

  if (basePath === '/') {
    return {
      ...base,
      title: dict.meta.title,
      description: dict.meta.description,
      keywords: dict.meta.keywords,
      jsonLd: [
        buildSoftwareAppJsonLd({
          name: dict.meta.siteName,
          description: dict.meta.description,
          url: ogUrl,
          inLanguage: lang,
        }),
        buildOrganizationJsonLd(),
        buildFaqJsonLd(dict.pricing.faqs),
      ],
    }
  }

  const featurePages = {
    '/features/video-scraper': {
      page: dict.videoScraperPage,
      breadcrumb: dict.meta.schema.breadcrumbVideoScraper,
    },
    '/features/web-data-scraper': {
      page: dict.webDataScraperPage,
      breadcrumb: dict.meta.schema.breadcrumbWebDataScraper,
    },
  } as const
  const featureItem = featurePages[basePath as keyof typeof featurePages]
  if (featureItem) {
    const featurePage = featureItem.page
    const homeUrl = toAbsoluteUrl(isZh ? '/zh' : '/')
    return {
      ...base,
      title: featurePage.metaTitle,
      description: featurePage.metaDescription,
      keywords: featurePage.metaKeywords,
      jsonLd: [
        buildSoftwareAppJsonLd({
          name: featurePage.metaTitle,
          description: featurePage.metaDescription,
          url: ogUrl,
          inLanguage: lang,
        }),
        buildFaqJsonLd(featurePage.faq.items),
        buildBreadcrumbJsonLd([
          { name: dict.meta.schema.breadcrumbHome, url: homeUrl },
          { name: dict.meta.schema.breadcrumbFeatures, url: `${homeUrl}#features` },
          { name: featureItem.breadcrumb, url: ogUrl },
        ]),
      ],
    }
  }

  if (basePath.startsWith('/guides/')) {
    const slug = basePath.replace('/guides/', '')
    if (isGuideSlug(slug)) {
      const seo = getGuideSeoData(slug, locale)
      return { ...base, title: seo.title, description: seo.description, keywords: seo.keywords, ogType: seo.ogType, jsonLd: seo.jsonLd }
    }
  }

  if (basePath === '/compare') {
    const seo = getCompareSeoData(locale)
    return { ...base, title: seo.title, description: seo.description, keywords: seo.keywords, jsonLd: seo.jsonLd }
  }

  if (basePath === '/faq') {
    const seo = getFaqSeoData(locale)
    return { ...base, title: seo.title, description: seo.description, keywords: seo.keywords, jsonLd: seo.jsonLd }
  }

  if (basePath === '/changelog') {
    return {
      ...base,
      title: dict.changelog.metaTitle,
      description: dict.changelog.metaDescription,
      keywords: dict.changelog.metaKeywords,
      jsonLd: [],
    }
  }

  const legalMap = {
    '/terms': termsData[locale],
    '/privacy': privacyData[locale],
    '/refund': refundData[locale],
  } as const

  const doc = legalMap[basePath as keyof typeof legalMap]
  return {
    ...base,
    title: doc ? `${doc.title} | Easy Web Scraper` : dict.meta.title,
    description: doc ? doc.subtitle : dict.meta.description,
    jsonLd: [],
  }
}

export function getChangelogFeed() {
  return CHANGELOG_FEED
}

export function getGuideSlugs() {
  return Object.keys(en.guides.items)
}

export async function prerenderRoute(route: string): Promise<PrerenderRouteResult> {
  const history = createMemoryHistory({
    initialEntries: [route],
  })

  const router = createTanStackRouter({
    routeTree,
    history,
    scrollRestoration: false,
  })

  await router.load()

  const appHtml = renderToString(
    React.createElement(RouterProvider, { router })
  )

  return {
    ...getSeoMetadata(route),
    appHtml,
  }
}
