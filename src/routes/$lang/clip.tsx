import { createFileRoute } from '@tanstack/react-router'
import type { SupportedLocale } from '../../locales/types'
import { isSupportedLocale, defaultLocale, getTranslation } from '../../locales'
import { buildHreflangLinks } from '../../config/seo'
import { ClipPageShell, validateClipSearch } from '../../components/clip/ClipPageShell'

export type { ClipSearchParams } from '../../components/clip/ClipPageShell'

export const Route = createFileRoute('/$lang/clip')({
  validateSearch: validateClipSearch,
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const t = getTranslation(locale)
    return {
      meta: [
        { title: `${t.clip.title} | Easy Web Scraper` },
        { name: 'description', content: t.clip.subtitle },
        { name: 'robots', content: 'noindex, nofollow' },
        { property: 'og:title', content: `${t.clip.title} | Easy Web Scraper` },
        { property: 'og:type', content: 'website' },
      ],
      links: buildHreflangLinks('/clip', locale),
    }
  },
  component: LangClipRouteComponent,
})

function LangClipRouteComponent() {
  const { lang } = Route.useParams()
  const search = Route.useSearch()
  const currentLocale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  return <ClipPageShell initialLocale={currentLocale} search={search} />
}
