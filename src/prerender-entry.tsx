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
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
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
  const links = buildHreflangLinks(basePath, locale)

  if (basePath === '/') {
    return {
      route,
      lang,
      title: dict.meta.title,
      description: dict.meta.description,
      keywords: dict.meta.keywords,
      ogUrl,
      ogLocale: dict.meta.ogLocale,
      siteName: dict.meta.siteName,
      ogImage: OG_IMAGE_URL,
      links,
      jsonLd: [
        buildSoftwareAppJsonLd({
          name: dict.meta.siteName,
          description: dict.meta.description,
          url: ogUrl,
          inLanguage: lang,
        }),
        buildFaqJsonLd(dict.pricing.faqs),
      ],
    }
  }

  const featurePages = {
    '/features/video-scraper': {
      page: dict.videoScraperPage,
      breadcrumb: isZh ? '流媒体视频嗅探' : 'Video Scraper',
    },
    '/features/web-data-scraper': {
      page: dict.webDataScraperPage,
      breadcrumb: isZh ? '网页数据采集' : 'Web Data Scraper',
    },
  } as const
  const featureItem = featurePages[basePath as keyof typeof featurePages]
  if (featureItem) {
    const featurePage = featureItem.page
    const homeUrl = toAbsoluteUrl(isZh ? '/zh' : '/')
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
      { name: isZh ? '首页' : 'Home', url: homeUrl },
      { name: isZh ? '功能特性' : 'Features', url: `${homeUrl}#features` },
      { name: featureItem.breadcrumb, url: ogUrl },
    ])

    return {
      route,
      lang,
      title: featurePage.metaTitle,
      description: featurePage.metaDescription,
      keywords: featurePage.metaKeywords,
      ogUrl,
      ogLocale: dict.meta.ogLocale,
      siteName: dict.meta.siteName,
      ogImage: OG_IMAGE_URL,
      links,
      jsonLd: [
        buildSoftwareAppJsonLd({
          name: featurePage.metaTitle,
          description: featurePage.metaDescription,
          url: ogUrl,
          inLanguage: lang,
        }),
        buildFaqJsonLd(featurePage.faq.items),
        breadcrumbJsonLd,
      ],
    }
  }

  if (basePath === '/changelog') {
    return {
      route,
      lang,
      title: dict.changelog.metaTitle,
      description: dict.changelog.metaDescription,
      keywords: dict.changelog.metaKeywords,
      ogUrl,
      ogLocale: dict.meta.ogLocale,
      siteName: dict.meta.siteName,
      ogImage: OG_IMAGE_URL,
      links,
      jsonLd: [],
    }
  }

  const legalMap = {
    '/terms': termsData[locale],
    '/privacy': privacyData[locale],
    '/refund': refundData[locale],
  } as const

  const doc = legalMap[basePath as keyof typeof legalMap]
  const title = doc ? `${doc.title} | Easy Web Scraper` : dict.meta.title
  const description = doc ? doc.subtitle : dict.meta.description

  return {
    route,
    lang,
    title,
    description,
    ogUrl,
    ogLocale: dict.meta.ogLocale,
    siteName: dict.meta.siteName,
    ogImage: OG_IMAGE_URL,
    links,
    jsonLd: [],
  }
}

export function getChangelogFeed() {
  return CHANGELOG_FEED
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
