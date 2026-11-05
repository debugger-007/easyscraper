import { createFileRoute } from '@tanstack/react-router'
import { LegalLayout } from '../../components/LegalLayout'
import { privacyData } from '../../data/legalContent'
import type { SupportedLocale } from '../../locales/types'
import { isSupportedLocale, defaultLocale } from '../../locales'

export const Route = createFileRoute('/$lang/privacy')({
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const doc = privacyData[locale]

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
        { rel: 'canonical', href: `/${locale}/privacy` },
        { rel: 'alternate', hrefLang: 'en', href: '/privacy' },
        { rel: 'alternate', hrefLang: 'zh-CN', href: '/zh/privacy' },
        { rel: 'alternate', hrefLang: 'x-default', href: '/privacy' },
      ],
    }
  },
  component: LangPrivacyComponent,
})

function LangPrivacyComponent() {
  const { lang } = Route.useParams()
  const locale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  const doc = privacyData[locale]

  return (
    <LegalLayout
      doc={doc}
      currentLocale={locale}
      activeType="privacy"
    />
  )
}
