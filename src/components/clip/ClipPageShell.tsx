import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Globe, ChevronDown, ArrowLeft } from 'lucide-react'
import { PrismLogo } from '../PrismLogo'
import type { SupportedLocale } from '../../i18n/types'
import { useTranslate, normalizeLocale } from '../../i18n'
import { ClipWorkspace } from './ClipWorkspace'

export interface ClipSearchParams {
  session?: string
  url?: string
  extId?: string
  extensionId?: string
}

export function validateClipSearch(search: Record<string, unknown>): ClipSearchParams {
  const extId =
    typeof search.extId === 'string'
      ? search.extId
      : typeof search.extensionId === 'string'
      ? search.extensionId
      : undefined
  return {
    session: typeof search.session === 'string' ? search.session : undefined,
    url: typeof search.url === 'string' ? search.url : undefined,
    extId,
    extensionId: extId,
  }
}

interface ClipPageShellProps {
  initialLocale: SupportedLocale
  search: ClipSearchParams
}

export function ClipPageShell({ initialLocale, search }: ClipPageShellProps) {
  const { t, locale, changeLanguage, supportedLocales } = useTranslate(initialLocale)
  const isEn = locale === 'en'
  const langParam = isEn ? undefined : { lang: 'zh' }
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement | null>(null)
  const backHomeLabel = t.clip.backHome || t.legal.actions.home

  useEffect(() => {
    if (!langMenuOpen) return
    const handlePointerDown = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [langMenuOpen])

  const handleLanguageSwitch = (newLocale: SupportedLocale) => {
    setLangMenuOpen(false)
    changeLanguage(newLocale)
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Studio Header */}
      <header className="sticky top-0 z-40 border-b border-outline-variant/25 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(19,27,46,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
            >
              <PrismLogo size={34} />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2.5">
                <span className="text-base font-bold tracking-tight text-on-surface">
                  Easy Web Scraper
                </span>
                <span className="text-[10px] uppercase font-code-label text-primary font-semibold tracking-wider">
                  OMNICLIP STUDIO
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <div ref={langMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-xs font-code-label text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/25 cursor-pointer"
                aria-expanded={langMenuOpen}
                aria-haspopup="menu"
              >
                <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-medium whitespace-nowrap">
                  {t.nav.languages[locale] || t.nav.languages[normalizeLocale(locale)] || 'English'}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-on-surface-variant opacity-70 shrink-0 transition-transform duration-200 ${
                    langMenuOpen ? 'rotate-180 text-primary opacity-100' : ''
                  }`}
                />
              </button>

              {langMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-36 rounded-xl bg-surface-container-lowest border border-outline-variant/35 shadow-xl py-1 z-50 text-xs font-code-label"
                >
                  {supportedLocales.map((loc) => {
                    const isSelected = normalizeLocale(locale) === normalizeLocale(loc)
                    return (
                      <button
                        key={loc}
                        type="button"
                        role="menuitem"
                        onClick={() => handleLanguageSwitch(loc)}
                        className={`w-full text-left px-3.5 py-2 hover:bg-surface-container-low transition-colors flex items-center justify-between cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'text-primary font-bold bg-primary-fixed/35'
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
              )}
            </div>

            {/* Back to Home */}
            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              aria-label={backHomeLabel}
              title={backHomeLabel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-xs font-medium shadow-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{backHomeLabel}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col">
        <ClipWorkspace
          session={search.session}
          url={search.url}
          extId={search.extId || search.extensionId}
        />
      </main>

      {/* Minimal Botanical Precision Footer */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant/20 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-on-surface-variant text-xs">
          <span>{t.footer.copyright}</span>
          <span className="font-code-label text-[10px] uppercase tracking-wider text-on-surface-variant/80">
            {t.footer.allSystemsLocal}
          </span>
        </div>
      </footer>
    </div>
  )
}
