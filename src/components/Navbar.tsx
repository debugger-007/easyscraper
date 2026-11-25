import React, { useState, useEffect, useRef } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { PrismLogo } from './PrismLogo'
import type { SupportedLocale, TranslationSchema } from '../locales/types'
import { supportedLocales, useTranslate, normalizeLocale } from '../locales'
import { Globe, Menu, X, ChevronDown } from 'lucide-react'
import { scrollToSection } from '../utils/scroll'
import { CHROME_STORE_URL } from '../config/extension'

interface NavbarProps {
  currentLocale: SupportedLocale
  t: TranslationSchema
  activeRoute?: 'home' | 'changelog'
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocale,
  t,
  activeRoute = 'home',
}) => {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>(activeRoute === 'changelog' ? 'changelog' : 'hero')
  const isScrollingByClickRef = useRef(false)
  const isChangelogPage = activeRoute === 'changelog'

  const navLinks = [
    { id: 'features', label: t.nav.features },
    { id: 'sandbox', label: t.nav.sandbox },
    { id: 'compliance', label: t.nav.compliance },
    { id: 'pricing', label: t.nav.pricing },
    { id: 'faq', label: t.nav.faq },
  ]

  useEffect(() => {
    if (isChangelogPage) {
      setActiveId('changelog')
      return
    }
    const hash = window.location.hash.replace('#', '')
    if (hash && (hash === 'hero' || navLinks.some((l) => l.id === hash))) {
      setActiveId(hash)
    }
  }, [isChangelogPage])

  useEffect(() => {
    if (isChangelogPage) return
    const sectionIds = ['hero', 'features', 'sandbox', 'compliance', 'pricing', 'faq']
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
  }, [isChangelogPage])

  const { changeLanguage } = useTranslate(currentLocale)
  const normalizedLocale = normalizeLocale(currentLocale)
  const isEn = normalizedLocale === 'en'
  const currentLangLabel =
    t.nav.languages[currentLocale] ||
    t.nav.languages[normalizedLocale] ||
    t.nav.languages.en

  const handleNavClick = (targetId: string) => {
    setMobileMenuOpen(false)
    if (isChangelogPage) {
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

  const handleLanguageChange = (locale: SupportedLocale) => {
    setLangMenuOpen(false)
    setMobileMenuOpen(false)
    changeLanguage(locale)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/25 shadow-[0_1px_8px_rgba(19,27,46,0.04)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Desktop Navigation */}
        <div className="flex items-center gap-4 lg:gap-8 min-w-0">
          <Link
            to={normalizedLocale === 'en' ? '/' : '/$lang'}
            params={normalizedLocale === 'en' ? undefined : { lang: 'zh' }}
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

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center gap-1 whitespace-nowrap"
          >
            {navLinks.map((link) => {
              const isActive = activeId === link.id
              return (
                <button
                  type="button"
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-surface-container-high text-on-surface font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-medium'
                  }`}
                >
                  {link.label}
                </button>
              )
            })}
            <Link
              to={isEn ? '/changelog' : '/$lang/changelog'}
              params={isEn ? undefined : { lang: 'zh' }}
              aria-current={isChangelogPage ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 whitespace-nowrap ${
                isChangelogPage
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-medium'
              }`}
            >
              {t.nav.changelog}
            </Link>
          </nav>
        </div>

        {/* Right: Language Switcher & Chrome CTA */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Language Switcher Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="w-11 h-11 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-lg sm:bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface sm:border sm:border-outline-variant/30 text-xs font-code-label flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
              title={t.nav.switchLanguage}
              aria-label={t.nav.switchLanguage}
            >
              <Globe className="w-5 h-5 sm:w-3.5 sm:h-3.5 text-primary shrink-0" />
              <span className="hidden sm:inline font-medium whitespace-nowrap">
                {currentLangLabel}
              </span>
              <ChevronDown
                className={`hidden sm:inline w-3.5 h-3.5 text-on-surface-variant opacity-75 shrink-0 transition-transform duration-200 ${
                  langMenuOpen ? 'rotate-180 text-primary opacity-100' : ''
                }`}
              />
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 py-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-[0_12px_32px_-4px_rgba(19,27,46,0.12)] z-50">
                  {supportedLocales.map((loc) => {
                    const isSelected = normalizedLocale === normalizeLocale(loc)
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleLanguageChange(loc)}
                        className={`w-full text-left px-3 py-2.5 text-xs font-code-label flex items-center justify-between hover:bg-surface-container-low transition-colors whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? 'text-primary font-bold bg-primary/8'
                            : 'text-on-surface'
                        }`}
                      >
                        <span>{t.nav.languages[loc]}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Chrome Web Store CTA Button */}
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary hover:bg-primary-container active:scale-[0.98] rounded-lg text-sm font-semibold transition-all duration-150 shadow-[0_2px_10px_rgba(0,105,72,0.22)] focus:outline-none focus:ring-2 focus:ring-primary/40 shrink-0 whitespace-nowrap"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" fill="#ffffff" fillOpacity="0.2" r="10" />
              <path d="M12 2C6.48 2 2 6.48 2 12C2 12.68 2.07 13.34 2.2 13.98L7.87 4.15C9.07 2.82 10.47 2 12 2Z" fill="#EA4335" />
              <path d="M12 2C17.52 2 22 6.48 22 12C22 12.68 21.93 13.34 21.8 13.98L12 13.98L8.76 8.37L12 2Z" fill="#4285F4" />
              <path d="M2.2 13.98C3.12 18.66 7.24 22 12 22C15.86 22 19.23 19.82 20.91 16.63L15.3 16.63L12 12L2.2 13.98Z" fill="#34A853" />
              <circle cx="12" cy="12" fill="#FBBC05" r="4" />
              <circle cx="12" cy="12" fill="#ffffff" r="2.5" />
            </svg>
            <span className="whitespace-nowrap">{t.nav.installCta}</span>
          </a>

          {/* Mobile Menu Hamburger (44x44px touch target) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary active:bg-surface-container-high transition-colors shrink-0 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-outline-variant/25 bg-surface-container-lowest/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
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
            <Link
              to={isEn ? '/changelog' : '/$lang/changelog'}
              params={isEn ? undefined : { lang: 'zh' }}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isChangelogPage ? 'page' : undefined}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-between ${
                isChangelogPage
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-on-surface hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <span>{t.nav.changelog}</span>
              {isChangelogPage && <span className="w-2 h-2 rounded-full bg-primary" />}
            </Link>
          </nav>
          <div className="pt-3 border-t border-outline-variant/25 flex flex-col gap-2.5">
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden w-full min-h-[46px] px-4 rounded-xl bg-primary hover:bg-primary-container active:scale-[0.98] text-on-primary text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>{t.nav.installCta}</span>
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
