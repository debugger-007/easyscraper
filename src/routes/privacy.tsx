import { createFileRoute } from '@tanstack/react-router'
import { LegalLayout } from '../components/LegalLayout'
import { privacyData } from '../data/legalContent'
import type { SupportedLocale } from '../locales/types'
import { isSupportedLocale, defaultLocale } from '../locales'
import { OG_IMAGE_URL, toAbsoluteUrl, buildHreflangLinks } from '../config/seo'

export const Route = createFileRoute('/privacy')({
  validateSearch: (search: Record<string, unknown>): { lang?: string } => {
    return {
      lang: typeof search.lang === 'string' ? search.lang : undefined,
    }
  },
  head: () => {
    const doc = privacyData.en
    return {
      meta: [
        { title: `${doc.title} | Easy Web Scraper` },
        { name: 'description', content: doc.subtitle },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:url', content: toAbsoluteUrl('/privacy') },
        { property: 'og:title', content: `${doc.title} | Easy Web Scraper` },
        { property: 'og:description', content: doc.subtitle },
        { property: 'og:image', content: OG_IMAGE_URL },
        { property: 'og:type', content: 'website' },
      ],
      links: buildHreflangLinks('/privacy', 'en'),
    }
  },
  component: PrivacyRouteComponent,
})

function PrivacyRouteComponent() {
  const search = Route.useSearch()
  const locale: SupportedLocale =
    search.lang && isSupportedLocale(search.lang) ? search.lang : defaultLocale

  const doc = privacyData[locale]

  return (
    <LegalLayout
      doc={doc}
      currentLocale={locale}
      activeType="privacy"
    />
  )
}
