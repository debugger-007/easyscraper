import { createFileRoute } from '@tanstack/react-router'
import { LegalLayout } from '../components/LegalLayout'
import { termsData } from '../data/legalContent'
import type { SupportedLocale } from '../locales/types'
import { isSupportedLocale, defaultLocale } from '../locales'

export const Route = createFileRoute('/terms')({
  validateSearch: (search: Record<string, unknown>): { lang?: string } => {
    return {
      lang: typeof search.lang === 'string' ? search.lang : undefined,
    }
  },
  head: () => {
    const doc = termsData.en
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
        { rel: 'canonical', href: '/terms' },
        { rel: 'alternate', hrefLang: 'en', href: '/terms' },
        { rel: 'alternate', hrefLang: 'zh-CN', href: '/zh/terms' },
        { rel: 'alternate', hrefLang: 'x-default', href: '/terms' },
      ],
    }
  },
  component: TermsRouteComponent,
})

function TermsRouteComponent() {
  const search = Route.useSearch()
  const locale: SupportedLocale =
    search.lang && isSupportedLocale(search.lang) ? search.lang : defaultLocale

  const doc = termsData[locale]

  return (
    <LegalLayout
      doc={doc}
      currentLocale={locale}
      activeType="terms"
    />
  )
}
