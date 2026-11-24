import { createFileRoute, redirect } from '@tanstack/react-router'
import { LandingPage } from '../components/LandingPage'
import { en } from '../locales/en'
import {
  OG_IMAGE_URL,
  toAbsoluteUrl,
  buildHreflangLinks,
  buildSoftwareAppJsonLd,
  buildFaqJsonLd,
} from '../config/seo'

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
  head: () => {
    const pageUrl = toAbsoluteUrl('/')
    const appJsonLd = buildSoftwareAppJsonLd({
      name: en.meta.siteName,
      description: en.meta.description,
      url: pageUrl,
      inLanguage: 'en',
    })
    const faqJsonLd = buildFaqJsonLd(en.pricing.faqs)

    return {
      meta: [
        { title: en.meta.title },
        { name: 'description', content: en.meta.description },
        { name: 'keywords', content: en.meta.keywords },
        { property: 'og:url', content: pageUrl },
        { property: 'og:title', content: en.meta.title },
        { property: 'og:description', content: en.meta.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: OG_IMAGE_URL },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: en.meta.ogLocale },
        { property: 'og:site_name', content: en.meta.siteName },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: en.meta.title },
        { name: 'twitter:description', content: en.meta.description },
        { name: 'twitter:image', content: OG_IMAGE_URL },
      ],
      links: buildHreflangLinks('/', 'en'),
      scripts: [
        { type: 'application/ld+json', children: JSON.stringify(appJsonLd) },
        { type: 'application/ld+json', children: JSON.stringify(faqJsonLd) },
      ],
    }
  },
  component: IndexRouteComponent,
})

function IndexRouteComponent() {
  return <LandingPage locale="en" />
}
