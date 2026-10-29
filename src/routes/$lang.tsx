import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '../components/LandingPage'
import { getTranslation, isSupportedLocale, defaultLocale } from '../locales'

export const Route = createFileRoute('/$lang')({
  head: ({ params }) => {
    const locale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const t = getTranslation(locale)
    const isZh = locale === 'zh'

    return {
      meta: [
        { title: t.meta.title },
        { name: 'description', content: t.meta.description },
        {
          name: 'keywords',
          content: isZh
            ? '网页爬虫, chrome扩展, 网页数据抓取, 视频嗅探, m3u8下载, 表格导出, Excel导出, 本地运行, 简易网页爬虫'
            : 'web scraping, chrome extension, media sniffer, hls video extractor, sheetjs, opfs, manifest v3',
        },
        { property: 'og:title', content: t.meta.title },
        { property: 'og:description', content: t.meta.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: isZh ? 'zh_CN' : 'en_US' },
        {
          property: 'og:site_name',
          content: isZh ? 'Easy Web Scraper 简易网页爬虫' : 'Easy Web Scraper',
        },
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
