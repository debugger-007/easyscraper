import React, { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PrismLogo } from '../../components/PrismLogo'
import type { SupportedLocale } from '../../locales/types'
import { isSupportedLocale, defaultLocale, getTranslation, useTranslate, normalizeLocale } from '../../locales'
import { Globe, ChevronDown, ArrowLeft } from 'lucide-react'
import { ClipWorkspace } from '../../components/clip/ClipWorkspace'

export interface ClipSearchParams {
  session?: string
  url?: string
}

export const Route = createFileRoute('/$lang/clip')({
  validateSearch: (search: Record<string, unknown>): ClipSearchParams => ({
    session: typeof search.session === 'string' ? search.session : undefined,
    url: typeof search.url === 'string' ? search.url : undefined,
  }),
  head: ({ params }) => {
    const locale: SupportedLocale = isSupportedLocale(params.lang) ? params.lang : defaultLocale
    const t = getTranslation(locale)
    return {
      meta: [
        {
          title: `${t.clip.title} | Easy Web Scraper`,
        },
        {
          name: 'description',
          content: t.clip.subtitle,
        },
        { name: 'robots', content: 'noindex, nofollow' },
        {
          property: 'og:title',
          content: `${t.clip.title} | Easy Web Scraper`,
        },
        { property: 'og:type', content: 'website' },
      ],
      links: [
        { rel: 'canonical', href: `/${locale}/clip` },
        { rel: 'alternate', hrefLang: 'en', href: '/clip' },
        { rel: 'alternate', hrefLang: 'zh-CN', href: '/zh/clip' },
        { rel: 'alternate', hrefLang: 'x-default', href: '/clip' },
      ],
    }
  },
  component: LangClipRouteComponent,
})

function LangClipRouteComponent() {
  const { lang } = Route.useParams()
  const search = Route.useSearch()
  const currentLocale: SupportedLocale = isSupportedLocale(lang) ? lang : defaultLocale
  const { t, locale, changeLanguage, supportedLocales } = useTranslate(currentLocale)
  const isEn = locale === 'en'
  const langParam = isEn ? undefined : { lang: 'zh' }
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const handleLanguageSwitch = (newLocale: SupportedLocale) => {
    setLangMenuOpen(false)
    changeLanguage(newLocale)
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Studio Header */}
      <header className="sticky top-0 z-40 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
            >
              <PrismLogo size={28} />
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-on-surface">
                  Easy Web Scraper
                </span>
                <span className="text-[10px] uppercase font-code-label text-cyan-400 tracking-wider">
                  Omniclip Studio
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-code-label text-on-surface transition-colors border border-outline-variant/30 cursor-pointer"
                aria-expanded={langMenuOpen}
              >
                <Globe className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="font-medium whitespace-nowrap">
                  {t.nav.languages[locale] || t.nav.languages[normalizeLocale(locale)] || 'English'}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-on-surface-variant opacity-70 shrink-0 transition-transform duration-200 ${
                    langMenuOpen ? 'rotate-180 text-secondary opacity-100' : ''
                  }`}
                />
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-36 rounded-xl bg-surface-container border border-outline-variant/40 shadow-xl py-1 z-50 text-xs font-code-label backdrop-blur-xl">
                    {supportedLocales.map((loc) => {
                      const isSelected = normalizeLocale(locale) === normalizeLocale(loc)
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleLanguageSwitch(loc)}
                          className={`w-full text-left px-3.5 py-2 hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'text-secondary font-bold bg-secondary/10'
                              : 'text-on-surface'
                          }`}
                        >
                          <span>{t.nav.languages[loc]}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 shadow-[0_0_6px_rgba(76,215,246,0.8)]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Back to Home */}
            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface transition-colors border border-outline-variant/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.clip.backHome || t.legal.actions.home}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        <ClipWorkspace session={search.session} url={search.url} />
      </main>
    </div>
  )
}
