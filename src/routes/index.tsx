import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '../components/LandingPage'
import { en } from '../locales/en'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: en.meta.title },
      { name: 'description', content: en.meta.description },
      {
        name: 'keywords',
        content: 'web scraping, chrome extension, media sniffer, hls video extractor, sheetjs, opfs, manifest v3',
      },
      { property: 'og:title', content: en.meta.title },
      { property: 'og:description', content: en.meta.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:site_name', content: 'Easy Web Scraper' },
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
