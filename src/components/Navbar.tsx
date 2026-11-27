import React, { useState, useEffect, useRef } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { PrismLogo } from './PrismLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
import type { SupportedLocale, TranslationSchema } from '../locales/types'
import { normalizeLocale } from '../locales'
import {
  Menu,
  X,
  ChevronDown,
  Table2,
  Film,
  Sparkles,
  PlayCircle,
} from 'lucide-react'
import { scrollToSection } from '../utils/scroll'
import { useDetectedBrowser } from '../utils/browserDetector'
import { BrowserStoreIcon } from './icons/BrowserIcons'

interface NavbarProps {
  currentLocale: SupportedLocale
  t: TranslationSchema
  activeRoute?: 'home' | 'changelog' | 'video-scraper' | 'web-data-scraper' | 'compare' | 'faq' | 'guide' | 'not-found'
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocale,
  t,
  activeRoute = 'home',
}) => {
  const router = useRouter()
  const { isEdge, browser, storeUrl } = useDetectedBrowser()
  const installCtaText = isEdge ? t.nav.installCtaEdge : t.nav.installCta
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>(activeRoute === 'home' ? 'hero' : activeRoute)
  const isScrollingByClickRef = useRef(false)
  const isFeaturePage = activeRoute === 'video-scraper' || activeRoute === 'web-data-scraper'
  const isSubPage = activeRoute !== 'home'

  const trailingNavLinks = [
    { id: 'pricing', label: t.nav.pricing },
  ]

  useEffect(() => {
    if (isSubPage) {
      setActiveId(activeRoute)
      return
    }
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      setActiveId(hash)
    }
  }, [isSubPage, activeRoute])

  useEffect(() => {
    if (isSubPage) return
    const sectionIds = ['hero', 'how-it-works', 'features', 'sandbox', 'compliance', 'pricing', 'faq']
    let rafId: number | null = null

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const headerHeight = 80

      if (scrollY < 80) {
        setActiveId('hero')
        return
      }

      if (scrollY + windowHeight >= documentHeight - 50) {
        setActiveId('faq')
        return
      }

      let maxVisibleHeight = 0
      let bestSectionId = sectionIds[0]

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          const visibleTop = Math.max(headerHeight, rect.top)
          const visibleBottom = Math.min(windowHeight, rect.bottom)
          const visibleHeight = Math.max(0, visibleBottom - visibleTop)

          if (visibleHeight > maxVisibleHeight) {
            maxVisibleHeight = visibleHeight
            bestSectionId = id
          }
        }
      }

      if (maxVisibleHeight > 60) {
        setActiveId(bestSectionId)
      }
    }

    const onScroll = () => {
      if (isScrollingByClickRef.current) return
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        handleScroll()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [isSubPage])

  const normalizedLocale = normalizeLocale(currentLocale)
  const isEn = normalizedLocale === 'en'
  const langParam = isEn ? undefined : { lang: 'zh' }

  const pageNavLinks = [
    { route: 'compare' as const, to: (isEn ? '/compare' : '/$lang/compare') as '/compare' | '/$lang/compare', label: t.nav.compare },
    { route: 'faq' as const, to: (isEn ? '/faq' : '/$lang/faq') as '/faq' | '/$lang/faq', label: t.nav.faq },
    { route: 'changelog' as const, to: (isEn ? '/changelog' : '/$lang/changelog') as '/changelog' | '/$lang/changelog', label: t.nav.changelog },
  ]

  const isFeaturesActive =
    isFeaturePage || activeId === 'features' || activeId === 'sandbox' || activeId === 'compliance'

  const handleNavClick = (targetId: string) => {
    setMobileMenuOpen(false)
    setFeaturesMenuOpen(false)
    if (isSubPage) {
      const homeBase = isEn ? '/' : '/zh'
      router.history.push(`${homeBase}#${targetId}`)
      return
    }

    setActiveId(targetId)
    isScrollingByClickRef.current = true
    scrollToSection(targetId, () => {
      setTimeout(() => {
        isScrollingByClickRef.current = false
      }, 50)
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/25 shadow-[0_1px_8px_rgba(19,27,46,0.04)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Desktop Navigation */}
        <div className="flex items-center gap-4 lg:gap-8 min-w-0">
          <Link
            to={isEn ? '/' : '/$lang'}
            params={langParam}
            onClick={(e) => {
              if (
                window.location.pathname === '/' ||
                window.location.pathname === '/zh' ||
                window.location.pathname === `/${currentLocale}`
              ) {
                e.preventDefault()
              }
              setActiveId('hero')
              isScrollingByClickRef.current = true
              scrollToSection('hero', () => {
                setTimeout(() => {
                  isScrollingByClickRef.current = false
                }, 50)
              })
            }}
            className="flex items-center gap-2 sm:gap-2.5 group whitespace-nowrap focus:outline-none min-h-[44px] shrink-0"
          >
            <PrismLogo size={44} />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-base sm:text-lg text-on-surface tracking-tight font-bold leading-tight">
                  Easy Web Scraper
                </span>
                <span className="sm:hidden px-1.5 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container font-code-label text-[9px] font-semibold">
                  MV3
                </span>
              </div>
              <span className="hidden sm:inline-block font-code-label text-[10px] text-primary font-semibold tracking-wider uppercase leading-tight">
                {t.nav.brandSubtitle || t.nav.versionBadge}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (left-to-right strictly matching homepage scroll order) */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1 whitespace-nowrap"
          >
            {/* 1. How It Works */}
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                activeId === 'how-it-works'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-medium'
              }`}
            >
              {t.nav.howItWorks}
            </button>

            {/* 2. Features Dropdown (Hover to open) */}
            <div
              className="relative"
              onMouseEnter={() => setFeaturesMenuOpen(true)}
              onMouseLeave={() => setFeaturesMenuOpen(false)}
            >
              <button
                type="button"
                aria-expanded={featuresMenuOpen}
                onClick={() => handleNavClick('features')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 whitespace-nowrap cursor-pointer inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isFeaturesActive
                    ? 'bg-surface-container-high text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-medium'
                }`}
              >
                <span>{t.nav.features}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-75 transition-transform duration-200 ${
                    featuresMenuOpen ? 'rotate-180 text-primary opacity-100' : ''
                  }`}
                />
              </button>

              {featuresMenuOpen && (
                <div className="absolute left-0 top-full pt-2 z-50">
                  <div className="w-80 p-2 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-[0_16px_40px_-8px_rgba(19,27,46,0.14)] space-y-1">
                    <Link
                      to={isEn ? '/features/web-data-scraper' : '/$lang/features/web-data-scraper'}
                      params={langParam}
                      onClick={() => setFeaturesMenuOpen(false)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        activeRoute === 'web-data-scraper'
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Table2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 whitespace-normal">
                        <div className="text-sm font-semibold leading-snug">
                          {t.nav.featuresMenu.webDataScraperTitle}
                        </div>
                        <div className="text-xs text-on-surface-variant leading-snug mt-0.5">
                          {t.nav.featuresMenu.webDataScraperDesc}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to={isEn ? '/features/video-scraper' : '/$lang/features/video-scraper'}
                      params={langParam}
                      onClick={() => setFeaturesMenuOpen(false)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        activeRoute === 'video-scraper'
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                        <Film className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 whitespace-normal">
                        <div className="text-sm font-semibold leading-snug">
                          {t.nav.featuresMenu.videoScraperTitle}
                        </div>
                        <div className="text-xs text-on-surface-variant leading-snug mt-0.5">
                          {t.nav.featuresMenu.videoScraperDesc}
                        </div>
                      </div>
                    </Link>

                    <div className="my-1 border-t border-outline-variant/25" />

                    <button
                      type="button"
                      onClick={() => handleNavClick('features')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{t.nav.featuresMenu.allFeatures}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('sandbox')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer text-left"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-secondary shrink-0" />
                      <span>{t.nav.featuresMenu.sandbox}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3-4. Pricing & FAQ */}
            {trailingNavLinks.map((link) => {
              const isActive = activeId === link.id
              return (
                <button
                  type="button"
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-surface-container-high text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-medium'
                  }`}
                >
                  {link.label}
                </button>
              )
            })}

            {pageNavLinks.map((item) => {
              const isCurrent = activeRoute === item.route
              return (
                <Link
                  key={item.route}
                  to={item.to}
                  params={langParam}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 whitespace-nowrap ${
                    isCurrent
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-medium'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Language Switcher & Auto-Detected Browser CTA */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <LanguageSwitcher
            currentLocale={currentLocale}
            onSelect={() => setMobileMenuOpen(false)}
          />

          {/* Extension Store CTA Button */}
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary hover:bg-primary-container active:scale-[0.98] rounded-lg text-sm font-semibold transition-all duration-150 shadow-[0_2px_10px_rgba(0,105,72,0.22)] focus:outline-none focus:ring-2 focus:ring-primary/40 shrink-0 whitespace-nowrap"
          >
            <BrowserStoreIcon browser={browser} className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{installCtaText}</span>
          </a>

          {/* Mobile Menu Hamburger (44x44px touch target) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary active:bg-surface-container-high transition-colors shrink-0 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-outline-variant/25 bg-surface-container-lowest/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {/* Dedicated SEO Feature Pages */}
            <div className="px-3.5 pt-1 pb-1 font-code-label text-[10px] uppercase tracking-wider text-outline font-bold">
              {t.nav.features}
            </div>
            <Link
              to={isEn ? '/features/web-data-scraper' : '/$lang/features/web-data-scraper'}
              params={langParam}
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                activeRoute === 'web-data-scraper'
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-on-surface hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Table2 className="w-4 h-4 text-primary shrink-0" />
                <span>{t.nav.featuresMenu.webDataScraperTitle}</span>
              </span>
              {activeRoute === 'web-data-scraper' && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </Link>
            <Link
              to={isEn ? '/features/video-scraper' : '/$lang/features/video-scraper'}
              params={langParam}
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                activeRoute === 'video-scraper'
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-on-surface hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Film className="w-4 h-4 text-secondary shrink-0" />
                <span>{t.nav.featuresMenu.videoScraperTitle}</span>
              </span>
              {activeRoute === 'video-scraper' && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </Link>

            <div className="my-1.5 border-t border-outline-variant/20" />

            {[
              { id: 'how-it-works', label: t.nav.howItWorks },
              { id: 'sandbox', label: t.nav.sandbox },
              { id: 'pricing', label: t.nav.pricing },
            ].map((link) => {
              const isActive = activeId === link.id
              return (
                <button
                  type="button"
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-between cursor-pointer text-left ${
                    isActive
                      ? 'text-primary bg-primary/10 font-semibold'
                      : 'text-on-surface hover:bg-surface-container-low hover:text-primary'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              )
            })}

            {pageNavLinks.map((item) => {
              const isCurrent = activeRoute === item.route
              return (
                <Link
                  key={item.route}
                  to={item.to}
                  params={langParam}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-between ${
                    isCurrent
                      ? 'text-primary bg-primary/10 font-semibold'
                      : 'text-on-surface hover:bg-surface-container-low hover:text-primary'
                  }`}
                >
                  <span>{item.label}</span>
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-primary" />}
                </Link>
              )
            })}
          </nav>

          <div className="pt-3 border-t border-outline-variant/25 flex flex-col gap-2.5">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden w-full min-h-[46px] px-4 rounded-xl bg-primary hover:bg-primary-container active:scale-[0.98] text-on-primary text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <BrowserStoreIcon browser={browser} className="w-4 h-4 shrink-0" />
              <span>{installCtaText}</span>
            </a>
            <span className="text-[11px] font-code-label text-primary flex items-center gap-1.5 px-3 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {t.nav.versionBadge}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
