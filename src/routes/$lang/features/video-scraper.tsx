import { createFileRoute } from '@tanstack/react-router'
import { VideoScraperPage } from '../../../components/VideoScraperPage'
import { en } from '../../../i18n/locales/en'
import { zh_CN } from '../../../i18n/locales/zh_CN'
import { isSupportedLocale, defaultLocale, type SupportedLocale } from '../../../i18n'
import { buildFeatureSeoHead } from '../../../config/seo'

export const Route = createFileRoute('/$lang/features/video-scraper')({
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const dict = locale === 'en' ? en : zh_CN
    return buildFeatureSeoHead({
      basePath: '/features/video-scraper',
      locale,
      title: dict.videoScraperPage.metaTitle,
      description: dict.videoScraperPage.metaDescription,
      keywords: dict.videoScraperPage.metaKeywords,
      ogLocale: dict.meta.ogLocale,
      faqs: dict.videoScraperPage.faq.items,
    })
  },
  component: LangVideoScraperRouteComponent,
})

function LangVideoScraperRouteComponent() {
  const { lang } = Route.useParams()
  const locale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  return <VideoScraperPage currentLocale={locale} />
}
