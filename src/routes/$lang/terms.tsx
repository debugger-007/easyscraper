import { createFileRoute } from '@tanstack/react-router'
import { LegalLayout } from '../../components/LegalLayout'
import { termsData } from '../../data/legalContent'
import type { SupportedLocale } from '../../locales/types'
import { isSupportedLocale, defaultLocale } from '../../locales'

export const Route = createFileRoute('/$lang/terms')({
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const doc = termsData[locale]

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
        { rel: 'canonical', href: `/${locale}/terms` },
        { rel: 'alternate', hrefLang: 'en', href: '/terms' },
        { rel: 'alternate', hrefLang: 'zh-CN', href: '/zh/terms' },
        { rel: 'alternate', hrefLang: 'x-default', href: '/terms' },
      ],
    }
  },
  component: LangTermsComponent,
})

function LangTermsComponent() {
  const { lang } = Route.useParams()
  const locale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  const doc = termsData[locale]

  return (
    <LegalLayout
      doc={doc}
      currentLocale={locale}
      activeType="terms"
    />
  )
}
