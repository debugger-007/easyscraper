import { createFileRoute } from '@tanstack/react-router'
import { VideoScraperPage } from '../../components/VideoScraperPage'
import { en } from '../../i18n/locales/en'
import { buildFeatureSeoHead } from '../../config/seo'

export const Route = createFileRoute('/features/video-scraper')({
  head: () =>
    buildFeatureSeoHead({
      basePath: '/features/video-scraper',
      locale: 'en',
      title: en.videoScraperPage.metaTitle,
      description: en.videoScraperPage.metaDescription,
      keywords: en.videoScraperPage.metaKeywords,
      ogLocale: en.meta.ogLocale,
      faqs: en.videoScraperPage.faq.items,
    }),
  component: () => <VideoScraperPage currentLocale="en" />,
})
