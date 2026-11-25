import { createFileRoute } from '@tanstack/react-router'
import { ChangelogPage } from '../components/ChangelogPage'
import { en } from '../i18n/locales/en'
import { OG_IMAGE_URL, toAbsoluteUrl, buildHreflangLinks } from '../config/seo'

export const Route = createFileRoute('/changelog')({
  validateSearch: (search: Record<string, unknown>): { version?: string; ref?: string } => ({
    version: typeof search.version === 'string' ? search.version : undefined,
    ref: typeof search.ref === 'string' ? search.ref : undefined,
  }),
  head: () => {
    const pageUrl = toAbsoluteUrl('/changelog')
    return {
      meta: [
        { title: en.changelog.metaTitle },
        { name: 'description', content: en.changelog.metaDescription },
        { name: 'keywords', content: en.changelog.metaKeywords },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:url', content: pageUrl },
        { property: 'og:title', content: en.changelog.metaTitle },
        { property: 'og:description', content: en.changelog.metaDescription },
        { property: 'og:image', content: OG_IMAGE_URL },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: en.meta.ogLocale },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: en.changelog.metaTitle },
        { name: 'twitter:description', content: en.changelog.metaDescription },
        { name: 'twitter:image', content: OG_IMAGE_URL },
      ],
      links: buildHreflangLinks('/changelog', 'en'),
    }
  },
  component: ChangelogRouteComponent,
})

function ChangelogRouteComponent() {
  const search = Route.useSearch()
  return <ChangelogPage currentLocale="en" initialVersion={search.version} />
}
