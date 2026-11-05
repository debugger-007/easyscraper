import { createFileRoute } from '@tanstack/react-router'
import { PaymentSuccessPage, type PaymentSuccessInfo } from '../components/PaymentSuccessPage'
import type { SupportedLocale } from '../locales/types'
import { isSupportedLocale, defaultLocale, getTranslation } from '../locales'

interface PaymentSuccessSearchParams {
  subscription_id?: string
  payment_id?: string
  status?: string
  license_key?: string
  email?: string
  lang?: string
  [key: string]: unknown
}

export const Route = createFileRoute('/payment/success')({
  validateSearch: (search: Record<string, unknown>): PaymentSuccessSearchParams => ({
    ...search,
    subscription_id: typeof search.subscription_id === 'string' ? search.subscription_id : undefined,
    payment_id: typeof search.payment_id === 'string' ? search.payment_id : undefined,
    status: typeof search.status === 'string' ? search.status : undefined,
    license_key: typeof search.license_key === 'string' ? search.license_key : undefined,
    email: typeof search.email === 'string' ? search.email : undefined,
    lang: typeof search.lang === 'string' ? search.lang : undefined,
  }),
  head: () => {
    const t = getTranslation('en')
    return {
      meta: [
        {
          title: `${t.paymentSuccess.metaTitle} | Easy Web Scraper`,
        },
        {
          name: 'description',
          content: t.paymentSuccess.metaDescription,
        },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      links: [
        { rel: 'canonical', href: '/payment/success' },
        { rel: 'alternate', hrefLang: 'en', href: '/payment/success' },
        { rel: 'alternate', hrefLang: 'zh-CN', href: '/zh/payment/success' },
        { rel: 'alternate', hrefLang: 'x-default', href: '/payment/success' },
      ],
    }
  },
  component: PaymentSuccessRouteComponent,
})

function PaymentSuccessRouteComponent() {
  const search = Route.useSearch()
  const locale: SupportedLocale =
    search.lang && isSupportedLocale(search.lang) ? search.lang : defaultLocale

  const info: PaymentSuccessInfo = {
    subscription_id: search.subscription_id,
    payment_id: search.payment_id,
    status: search.status,
    license_key: search.license_key,
    email: search.email,
  }

  return <PaymentSuccessPage info={info} currentLocale={locale} />
}

