import { createFileRoute } from '@tanstack/react-router'
import { LegalLayout } from '../../components/LegalLayout'
import { termsData } from '../../data/legalContent'
import type { SupportedLocale } from '../../locales/types'
import { isSupportedLocale, defaultLocale } from '../../locales'
import { OG_IMAGE_URL, toAbsoluteUrl, buildHreflangLinks } from '../../config/seo'

export const Route = createFileRoute('/$lang/terms')({
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const doc = termsData[locale]
    const pageUrl = toAbsoluteUrl(locale === 'en' ? '/terms' : '/zh/terms')

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
      links: buildHreflangLinks('/terms', locale),
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
