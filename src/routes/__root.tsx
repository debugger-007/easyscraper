import { useEffect } from 'react'
import { Outlet, createRootRoute, HeadContent } from '@tanstack/react-router'
import { AmbientGlow } from '../components/AmbientGlow'
import { scrollToSection } from '../utils/scroll'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#13131b' },
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
})

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
      <div className="relative min-h-screen bg-surface text-on-surface antialiased overflow-x-clip selection:bg-primary-container selection:text-on-primary-container">
        <AmbientGlow />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Outlet />
        </div>
      </div>
    </>
  )
}
