import { createFileRoute } from '@tanstack/react-router'
import { WebDataScraperPage } from '../../components/WebDataScraperPage'
import { en } from '../../i18n/locales/en'
import { buildFeatureSeoHead } from '../../config/seo'

export const Route = createFileRoute('/features/web-data-scraper')({
  head: () =>
    buildFeatureSeoHead({
      basePath: '/features/web-data-scraper',
      locale: 'en',
      title: en.webDataScraperPage.metaTitle,
      description: en.webDataScraperPage.metaDescription,
      keywords: en.webDataScraperPage.metaKeywords,
      ogLocale: en.meta.ogLocale,
      faqs: en.webDataScraperPage.faq.items,
    }),
  component: () => <WebDataScraperPage currentLocale="en" />,
})
