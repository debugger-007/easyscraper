import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { PrismLogo } from './PrismLogo'
import type { SupportedLocale, TranslationSchema } from '../locales/types'
import { supportedLocales } from '../locales'
import { Globe, Menu, X, ChevronDown } from 'lucide-react'
import { scrollToSection } from '../utils/scroll'

interface NavbarProps {
  currentLocale: SupportedLocale
  t: TranslationSchema
}

export const Navbar: React.FC<NavbarProps> = ({ currentLocale, t }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>('hero')
  const isScrollingByClickRef = useRef(false)
  const navigate = useNavigate()

  const navLinks = [
    { id: 'hero', label: t.nav.hero },
    { id: 'features', label: t.nav.features },
    { id: 'sandbox', label: t.nav.sandbox },
    { id: 'compliance', label: t.nav.compliance },
    { id: 'pricing', label: t.nav.pricing },
    { id: 'faq', label: t.nav.faq },
  ]

  // Initialize active item from URL hash or fallback to 'hero'
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && navLinks.some((l) => l.id === hash)) {
      setActiveId(hash)
    }
  }, [])

  // Scroll spy to highlight active section as user scrolls
  useEffect(() => {
    const sectionIds = ['hero', 'features', 'sandbox', 'compliance', 'pricing', 'faq']
    let rafId: number | null = null

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const headerHeight = 64

      // 1. If at the very top, activate 'hero'
      if (scrollY < 80) {
        setActiveId('hero')
        return
      }

      // 2. If scrolled near the bottom of the page, activate the last section ('faq')
      if (scrollY + windowHeight >= documentHeight - 50) {
        setActiveId('faq')
        return
      }

      // 3. Find the section that occupies the largest visible height in the viewport
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
  }, [])

  const handleNavClick = (targetId: string) => {
    setActiveId(targetId)
    setMobileMenuOpen(false)

    isScrollingByClickRef.current = true
    scrollToSection(targetId, () => {
      setTimeout(() => {
        isScrollingByClickRef.current = false
      }, 50)
    })
  }

  const handleLanguageChange = (locale: SupportedLocale) => {
    setLangMenuOpen(false)
    setMobileMenuOpen(false)
    if (locale === 'en') {
      navigate({ to: '/' })
    } else {
      navigate({ to: '/$lang', params: { lang: locale } })
    }
  }

  return (
    <header className="bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 top-0 sticky z-50">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand & Version */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link
            to={currentLocale === 'en' ? '/' : '/$lang'}
            params={currentLocale === 'en' ? undefined : { lang: currentLocale }}
            onClick={(e) => {
              if (window.location.pathname === '/' || window.location.pathname === `/${currentLocale}`) {
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
            className="text-on-surface flex items-center gap-2.5 group whitespace-nowrap"
          >
            <PrismLogo size={32} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-headline-md text-on-surface tracking-tight font-bold text-base sm:text-lg whitespace-nowrap">
                Easy Web Scraper
              </span>
              {currentLocale === 'zh' && (
                <span className="hidden md:inline-block text-xs font-headline-md text-on-surface-variant/80 font-normal whitespace-nowrap">
                  简易网页爬虫
                </span>
              )}
            </div>
          </Link>
          <span className="hidden 2xl:inline-flex items-center gap-1.5 bg-surface-container-high px-2 py-0.5 rounded-full border border-secondary/20 text-secondary font-code-label text-[11px] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            {t.nav.versionBadge}
          </span>
        </div>

        {/* Centered Navigation Links (visible on xl: 1280px+) */}
        <nav aria-label="Main Navigation" className="hidden xl:flex items-center gap-5 2xl:gap-7 text-xs 2xl:text-sm font-medium whitespace-nowrap">
          {navLinks.map((link) => {
            const isActive = activeId === link.id
            return (
              <button
                type="button"
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors duration-150 py-1 whitespace-nowrap relative cursor-pointer ${
                  isActive
                    ? 'text-secondary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary rounded-full shadow-[0_0_8px_rgba(76,215,246,0.8)]" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Auxiliary Controls Group */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-xs font-code-label flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title={t.nav.switchLanguage}
            >
              <Globe className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span className="font-medium whitespace-nowrap">
                {currentLocale === 'zh' ? '中 / EN' : 'EN / 中'}
              </span>
              <ChevronDown className="w-3 h-3 text-on-surface-variant opacity-70 shrink-0" />
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 py-1 bg-surface-container border border-outline-variant/40 rounded-xl shadow-xl z-50 backdrop-blur-xl">
                  {supportedLocales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleLanguageChange(loc)}
                      className={`w-full text-left px-3 py-2 text-xs font-code-label flex items-center justify-between hover:bg-surface-container-high transition-colors whitespace-nowrap ${
                        currentLocale === loc ? 'text-secondary font-bold bg-secondary/10' : 'text-on-surface'
                      }`}
                    >
                      <span>{t.nav.languages[loc]}</span>
                      {currentLocale === loc && <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Chrome Web Store CTA Button */}
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-primary-container hover:brightness-110 active:scale-95 text-on-primary-container text-xs font-headline-md font-medium flex items-center gap-2 transition-all shadow-sm shrink-0 whitespace-nowrap"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" fill="#ffffff" fillOpacity="0.1" r="10" />
              <path d="M12 2C6.48 2 2 6.48 2 12C2 12.68 2.07 13.34 2.2 13.98L7.87 4.15C9.07 2.82 10.47 2 12 2Z" fill="#EA4335" />
              <path d="M12 2C17.52 2 22 6.48 22 12C22 12.68 21.93 13.34 21.8 13.98L12 13.98L8.76 8.37L12 2Z" fill="#4285F4" />
              <path d="M2.2 13.98C3.12 18.66 7.24 22 12 22C15.86 22 19.23 19.82 20.91 16.63L15.3 16.63L12 12L2.2 13.98Z" fill="#34A853" />
              <circle cx="12" cy="12" fill="#FBBC05" r="4" />
              <circle cx="12" cy="12" fill="#ffffff" r="2.5" />
            </svg>
            <span className="whitespace-nowrap">{t.nav.installCta}</span>
          </a>

          {/* Mobile Menu Hamburger (visible below xl: < 1280px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-lg bg-surface-container-high/60 text-on-surface hover:text-secondary transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-outline-variant/30 bg-surface/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = activeId === link.id
              return (
                <button
                  type="button"
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-between cursor-pointer text-left ${
                    isActive
                      ? 'text-secondary bg-secondary/10 font-bold'
                      : 'text-on-surface hover:bg-surface-container-high hover:text-secondary'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_6px_rgba(76,215,246,0.8)]" />}
                </button>
              )
            })}
          </nav>
          <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-2">
            <span className="text-[11px] font-code-label text-secondary flex items-center gap-1.5 px-3 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              {t.nav.versionBadge}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
