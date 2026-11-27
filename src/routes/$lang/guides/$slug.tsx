import { createFileRoute, notFound } from '@tanstack/react-router'
import { GuidePage } from '../../../components/GuidePage'
import { isSupportedLocale, defaultLocale, type SupportedLocale } from '../../../i18n'
import { buildGuideSeoHead, isGuideSlug } from '../../../config/seo'

export const Route = createFileRoute('/$lang/guides/$slug')({
  beforeLoad: ({ params }) => {
    if (!isGuideSlug(params.slug)) throw notFound()
  },
  head: ({ params }) => {
    if (!isGuideSlug(params.slug)) return {}
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    return buildGuideSeoHead({ slug: params.slug, locale })
  },
  component: LangGuideRouteComponent,
})

function LangGuideRouteComponent() {
  const { lang, slug } = Route.useParams()
  if (!isGuideSlug(slug)) return null
  const locale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  return <GuidePage slug={slug} currentLocale={locale} />
}
