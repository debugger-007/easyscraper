import { createFileRoute, notFound } from '@tanstack/react-router'
import { GuidePage } from '../../components/GuidePage'
import { buildGuideSeoHead, isGuideSlug } from '../../config/seo'

export const Route = createFileRoute('/guides/$slug')({
  beforeLoad: ({ params }) => {
    if (!isGuideSlug(params.slug)) throw notFound()
  },
  head: ({ params }) =>
    isGuideSlug(params.slug)
      ? buildGuideSeoHead({ slug: params.slug, locale: 'en' })
      : {},
  component: GuideRouteComponent,
})

function GuideRouteComponent() {
  const { slug } = Route.useParams()
  if (!isGuideSlug(slug)) return null
  return <GuidePage slug={slug} currentLocale="en" />
}
