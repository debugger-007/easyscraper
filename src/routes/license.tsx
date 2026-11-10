import { createFileRoute } from '@tanstack/react-router'
import { LicenseManagementPage } from '../components/license/LicenseManagementPage'
import type { SupportedLocale } from '../locales/types'
import { isSupportedLocale, defaultLocale, getTranslation } from '../locales'

interface LicenseSearchParams {
  key?: string
  instance_id?: string
  lang?: string
  [key: string]: unknown
}

export const Route = createFileRoute('/license')({
  validateSearch: (search: Record<string, unknown>): LicenseSearchParams => ({
    ...search,
    key: typeof search.key === 'string' ? search.key : undefined,
    instance_id: typeof search.instance_id === 'string' ? search.instance_id : undefined,
    lang: typeof search.lang === 'string' ? search.lang : undefined,
  }),
  head: () => {
    const t = getTranslation('en')
    return {
      meta: [
        {
          title: `${t.license.metaTitle} | Easy Web Scraper`,
        },
        {
          name: 'description',
          content: t.license.metaDescription,
        },
        { name: 'robots', content: 'noindex, nofollow' },
        {
          property: 'og:title',
          content: `${t.license.metaTitle} | Easy Web Scraper`,
        },
        { property: 'og:type', content: 'website' },
      ],
      links: [
        { rel: 'canonical', href: '/license' },
        { rel: 'alternate', hrefLang: 'en', href: '/license' },
        { rel: 'alternate', hrefLang: 'zh-CN', href: '/zh/license' },
        { rel: 'alternate', hrefLang: 'x-default', href: '/license' },
      ],
    }
  },
  component: LicenseRouteComponent,
})

function LicenseRouteComponent() {
  const search = Route.useSearch()
  const locale: SupportedLocale =
    search.lang && isSupportedLocale(search.lang) ? search.lang : defaultLocale

  return (
    <LicenseManagementPage
      initialKey={search.key}
      initialInstanceId={search.instance_id}
      currentLocale={locale}
    />
  )
}

