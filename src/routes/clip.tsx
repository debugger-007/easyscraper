import { createFileRoute } from '@tanstack/react-router'
import { getTranslation } from '../locales'
import { buildHreflangLinks } from '../config/seo'
import { ClipPageShell, validateClipSearch } from '../components/clip/ClipPageShell'

export type { ClipSearchParams } from '../components/clip/ClipPageShell'

export const Route = createFileRoute('/clip')({
  validateSearch: validateClipSearch,
  head: () => {
    const t = getTranslation('en')
    return {
      meta: [
        { title: `${t.clip.title} | Easy Web Scraper` },
        { name: 'description', content: t.clip.subtitle },
        { name: 'robots', content: 'noindex, nofollow' },
        { property: 'og:title', content: `${t.clip.title} | Easy Web Scraper` },
        { property: 'og:type', content: 'website' },
      ],
      links: buildHreflangLinks('/clip', 'en'),
    }
  },
  component: ClipRouteComponent,
})

function ClipRouteComponent() {
  const search = Route.useSearch()
  return <ClipPageShell initialLocale="en" search={search} />
}
