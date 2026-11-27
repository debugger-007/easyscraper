import { useEffect } from 'react'
import { Outlet, createRootRoute, HeadContent, Link, useRouterState } from '@tanstack/react-router'
import { Home, HelpCircle } from 'lucide-react'
import { AmbientGlow } from '../components/AmbientGlow'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { useTranslate } from '../i18n'
import { scrollToSection } from '../utils/scroll'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#faf8ff' },
      { name: 'robots', content: 'index, follow' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'alternate icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function NotFoundComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isZh = pathname === '/zh' || pathname.startsWith('/zh/')
  const { t, locale } = useTranslate(isZh ? 'zh_CN' : 'en')
  const langParam = isZh ? { lang: 'zh' } : undefined

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Navbar currentLocale={locale} t={t} activeRoute="not-found" />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-20">
        <div className="max-w-lg text-center space-y-5">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-code-label text-xs font-semibold">
            {t.notFound.badge}
          </span>
          <h1 className="font-headline-lg text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
            {t.notFound.title}
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            {t.notFound.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to={isZh ? '/$lang' : '/'}
              params={langParam}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold shadow-sm transition-all"
            >
              <Home className="w-4 h-4" />
              <span>{t.notFound.backHome}</span>
            </Link>
            <Link
              to={isZh ? '/$lang/faq' : '/faq'}
              params={langParam}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm font-semibold transition-all"
            >
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>{t.notFound.browseFaq}</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer t={t} />
    </div>
  )
}

function RootComponent() {
  useEffect(() => {
    // Intercept internal anchor clicks to provide zero-delay, 60fps smooth scrolling
    const handleGlobalAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return

      const anchor = (e.target as HTMLElement)?.closest('a')
      if (!anchor) return

      // Let navbar handle its own links to maintain active state locking
      if (anchor.closest('header')) return

      const href = anchor.getAttribute('href')
      if (href && href.startsWith('#') && href.length > 1) {
        const targetId = href.slice(1)
        const targetEl = document.getElementById(targetId)
        if (targetEl || targetId === 'hero') {
          e.preventDefault()
          scrollToSection(targetId)
        }
      }
    }

    document.addEventListener('click', handleGlobalAnchorClick)
    return () => document.removeEventListener('click', handleGlobalAnchorClick)
  }, [])

  return (
    <>
      <HeadContent />
      <div className="relative min-h-screen bg-surface text-on-surface antialiased overflow-x-clip selection:bg-secondary-container selection:text-on-secondary-container">
        <AmbientGlow />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Outlet />
        </div>
      </div>
    </>
  )
}
