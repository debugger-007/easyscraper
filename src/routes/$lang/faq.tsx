import { createFileRoute } from '@tanstack/react-router'
import { FaqPage } from '../../components/FaqPage'
import { isSupportedLocale, defaultLocale, type SupportedLocale } from '../../i18n'
import { buildFaqSeoHead } from '../../config/seo'

export const Route = createFileRoute('/$lang/faq')({
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    return buildFaqSeoHead(locale)
  },
  component: LangFaqRouteComponent,
})

function LangFaqRouteComponent() {
  const { lang } = Route.useParams()
  const locale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  return <FaqPage currentLocale={locale} />
}
