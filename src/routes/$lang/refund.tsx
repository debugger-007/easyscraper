import { createFileRoute } from '@tanstack/react-router'
import { LegalLayout } from '../../components/LegalLayout'
import { refundData } from '../../data/legalContent'
import type { SupportedLocale } from '../../locales/types'
import { isSupportedLocale, defaultLocale } from '../../locales'
import { OG_IMAGE_URL, toAbsoluteUrl, buildHreflangLinks } from '../../config/seo'

export const Route = createFileRoute('/$lang/refund')({
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const doc = refundData[locale]
    const pageUrl = toAbsoluteUrl(locale === 'en' ? '/refund' : '/zh/refund')

    return {
      meta: [
        { title: `${doc.title} | Easy Web Scraper` },
        { name: 'description', content: doc.subtitle },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:url', content: pageUrl },
        { property: 'og:title', content: `${doc.title} | Easy Web Scraper` },
        { property: 'og:description', content: doc.subtitle },
        { property: 'og:image', content: OG_IMAGE_URL },
        { property: 'og:type', content: 'website' },
      ],
      links: buildHreflangLinks('/refund', locale),
    }
  },
  component: LangRefundComponent,
})

function LangRefundComponent() {
  const { lang } = Route.useParams()
  const locale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  const doc = refundData[locale]

  return (
    <LegalLayout
      doc={doc}
      currentLocale={locale}
      activeType="refund"
    />
  )
}
