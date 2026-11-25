import { createFileRoute } from '@tanstack/react-router'
import { ChangelogPage } from '../../components/ChangelogPage'
import { en } from '../../i18n/locales/en'
import { zh_CN } from '../../i18n/locales/zh_CN'
import { isSupportedLocale, defaultLocale, type SupportedLocale } from '../../i18n'
import { OG_IMAGE_URL, toAbsoluteUrl, buildHreflangLinks } from '../../config/seo'

export const Route = createFileRoute('/$lang/changelog')({
  validateSearch: (search: Record<string, unknown>): { version?: string; ref?: string } => ({
    version: typeof search.version === 'string' ? search.version : undefined,
    ref: typeof search.ref === 'string' ? search.ref : undefined,
  }),
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const dict = locale === 'en' ? en : zh_CN
    const pageUrl = toAbsoluteUrl(locale === 'en' ? '/changelog' : '/zh/changelog')

    return {
      meta: [
        { title: dict.changelog.metaTitle },
        { name: 'description', content: dict.changelog.metaDescription },
        { name: 'keywords', content: dict.changelog.metaKeywords },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:url', content: pageUrl },
        { property: 'og:title', content: dict.changelog.metaTitle },
        { property: 'og:description', content: dict.changelog.metaDescription },
        { property: 'og:image', content: OG_IMAGE_URL },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: dict.meta.ogLocale },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: dict.changelog.metaTitle },
        { name: 'twitter:description', content: dict.changelog.metaDescription },
        { name: 'twitter:image', content: OG_IMAGE_URL },
      ],
      links: buildHreflangLinks('/changelog', locale),
    }
  },
  component: LangChangelogRouteComponent,
})

function LangChangelogRouteComponent() {
  const { lang } = Route.useParams()
  const search = Route.useSearch()
  const locale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  return <ChangelogPage currentLocale={locale} initialVersion={search.version} />
}
