import { createFileRoute } from '@tanstack/react-router'
import { WebDataScraperPage } from '../../../components/WebDataScraperPage'
import { en } from '../../../i18n/locales/en'
import { zh_CN } from '../../../i18n/locales/zh_CN'
import { isSupportedLocale, defaultLocale, type SupportedLocale } from '../../../i18n'
import { buildFeatureSeoHead } from '../../../config/seo'

export const Route = createFileRoute('/$lang/features/web-data-scraper')({
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const dict = locale === 'en' ? en : zh_CN
    return buildFeatureSeoHead({
      basePath: '/features/web-data-scraper',
      locale,
      title: dict.webDataScraperPage.metaTitle,
      description: dict.webDataScraperPage.metaDescription,
      keywords: dict.webDataScraperPage.metaKeywords,
      ogLocale: dict.meta.ogLocale,
      faqs: dict.webDataScraperPage.faq.items,
    })
  },
  component: LangWebDataScraperRouteComponent,
})

function LangWebDataScraperRouteComponent() {
  const { lang } = Route.useParams()
  const locale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  return <WebDataScraperPage currentLocale={locale} />
}
