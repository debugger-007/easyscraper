import { createFileRoute, redirect } from '@tanstack/react-router'
import { LandingPage } from '../components/LandingPage'
import { en } from '../locales/en'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => search,
  beforeLoad: ({ search }) => {
    if (search.payment_id || search.license_key || search.subscription_id) {
      throw redirect({
        to: '/payment/success',
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
  head: () => ({
    meta: [
      { title: en.meta.title },
      { name: 'description', content: en.meta.description },
      { name: 'keywords', content: en.meta.keywords },
      { property: 'og:title', content: en.meta.title },
      { property: 'og:description', content: en.meta.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: en.meta.ogLocale },
      { property: 'og:site_name', content: en.meta.siteName },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: en.meta.title },
      { name: 'twitter:description', content: en.meta.description },
    ],
    links: [
      { rel: 'canonical', href: '/' },
      { rel: 'alternate', hrefLang: 'en', href: '/' },
      { rel: 'alternate', hrefLang: 'zh-CN', href: '/zh' },
      { rel: 'alternate', hrefLang: 'x-default', href: '/' },
    ],
  }),
  component: IndexRouteComponent,
})

function IndexRouteComponent() {
  return <LandingPage locale="en" />
}
