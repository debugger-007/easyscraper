import { createFileRoute, redirect } from '@tanstack/react-router'
import { LandingPage } from '../../components/LandingPage'
import { getTranslation, isSupportedLocale, defaultLocale } from '../../locales'

export const Route = createFileRoute('/$lang/')({
  validateSearch: (search: Record<string, unknown>) => search,
  beforeLoad: ({ params, search }) => {
    if (search.payment_id || search.license_key || search.subscription_id) {
      throw redirect({
        to: '/$lang/payment/success',
        params: { lang: params.lang },
        search: {
          subscription_id: typeof search.subscription_id === 'string' ? search.subscription_id : undefined,
          payment_id: typeof search.payment_id === 'string' ? search.payment_id : undefined,
          status: typeof search.status === 'string' ? search.status : undefined,
          license_key: typeof search.license_key === 'string' ? search.license_key : undefined,
          email: typeof search.email === 'string' ? search.email : undefined,
        },
      })
    }
  },
  head: ({ params }) => {
    const locale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const t = getTranslation(locale)

    return {
      meta: [
        { title: t.meta.title },
        { name: 'description', content: t.meta.description },
        { name: 'keywords', content: t.meta.keywords },
        { property: 'og:title', content: t.meta.title },
        { property: 'og:description', content: t.meta.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: t.meta.ogLocale },
        { property: 'og:site_name', content: t.meta.siteName },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: t.meta.title },
        { name: 'twitter:description', content: t.meta.description },
      ],
      links: [
        { rel: 'canonical', href: `/${params.lang}` },
        { rel: 'alternate', hrefLang: 'en', href: '/' },
        { rel: 'alternate', hrefLang: 'zh-CN', href: '/zh' },
        { rel: 'alternate', hrefLang: 'x-default', href: '/' },
      ],
    }
  },
  component: LangRouteComponent,
})

function LangRouteComponent() {
  const { lang } = Route.useParams()
  const resolvedLocale = isSupportedLocale(lang) ? lang : defaultLocale

  return <LandingPage locale={resolvedLocale} />
}

