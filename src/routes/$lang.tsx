import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '../components/LandingPage'
import { isSupportedLocale, defaultLocale } from '../locales'

export const Route = createFileRoute('/$lang')({
  component: LangRouteComponent,
})

function LangRouteComponent() {
  const { lang } = Route.useParams()
  const resolvedLocale = isSupportedLocale(lang) ? lang : defaultLocale

  return <LandingPage locale={resolvedLocale} />
}
