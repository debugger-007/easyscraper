import { createFileRoute } from '@tanstack/react-router'
import { ComparePage } from '../../components/ComparePage'
import { isSupportedLocale, defaultLocale, type SupportedLocale } from '../../i18n'
import { buildCompareSeoHead } from '../../config/seo'

export const Route = createFileRoute('/$lang/compare')({
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    return buildCompareSeoHead(locale)
  },
  component: LangCompareRouteComponent,
})

function LangCompareRouteComponent() {
  const { lang } = Route.useParams()
  const locale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  return <ComparePage currentLocale={locale} />
}
