import { createFileRoute } from '@tanstack/react-router'
import { LegalLayout } from '../../components/LegalLayout'
import { refundData } from '../../data/legalContent'
import type { SupportedLocale } from '../../locales/types'
import { isSupportedLocale, defaultLocale } from '../../locales'

export const Route = createFileRoute('/$lang/refund')({
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const doc = refundData[locale]

    return {
      meta: [
        {
          title: `${doc.title} | Easy Web Scraper`,
        },
        {
          name: 'description',
          content: doc.subtitle,
        },
        { name: 'robots', content: 'index, follow' },
        {
          property: 'og:title',
          content: `${doc.title} | Easy Web Scraper`,
        },
        { property: 'og:type', content: 'website' },
      ],
      links: [
        { rel: 'canonical', href: `/${locale}/refund` },
        { rel: 'alternate', hrefLang: 'en', href: '/refund' },
        { rel: 'alternate', hrefLang: 'zh-CN', href: '/zh/refund' },
        { rel: 'alternate', hrefLang: 'x-default', href: '/refund' },
      ],
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
