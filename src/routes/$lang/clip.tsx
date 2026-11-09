import React, { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PrismLogo } from '../../components/PrismLogo'
import type { SupportedLocale } from '../../locales/types'
import { isSupportedLocale, defaultLocale, getTranslation, useTranslate, normalizeLocale } from '../../locales'
import {
  Scissors,
  Crop,
  Download,
  Video,
  Globe,
  ChevronDown,
  ArrowLeft,
  Upload,
  Radio,
  FileVideo,
} from 'lucide-react'

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

      {/* Main Studio Workspace Scaffold */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Workspace Title & Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-code-label bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Video className="w-3 h-3" />
                {t.clip.title}
              </span>
              {search.session && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-code-label bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  {t.clip.extensionReady}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              {t.clip.title}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
              {t.clip.subtitle}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.clip.trim}</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
            >
              <Crop className="w-3.5 h-3.5 text-secondary" />
              <span>{t.clip.crop}</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 text-xs font-code-label font-medium shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.clip.exportVideo}</span>
            </button>
          </div>
        </div>

        {/* Viewport & Scrubber Container */}
        <div className="flex-1 flex flex-col rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/60 backdrop-blur-xl overflow-hidden min-h-[460px]">
          {/* Video Preview Viewport */}
          <div className="flex-1 relative flex items-center justify-center p-6 bg-black/40">
            {search.session ? (
              <div className="flex flex-col items-center justify-center text-center max-w-md p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                  <FileVideo className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-on-surface">
                    {t.clip.extensionReady}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-code-label break-all">
                    Session: {search.session}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center max-w-md p-8 border-2 border-dashed border-outline-variant/40 rounded-2xl space-y-4 hover:border-cyan-400/50 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-on-surface">
                    {t.clip.dropToImport}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {t.clip.extensionNotFound}
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface border border-outline-variant/40 transition-colors cursor-pointer"
                >
                  {t.clip.selectLocalFile}
                </button>
              </div>
            )}
          </div>

          {/* Timeline & Scrubber Footer Scaffold */}
          <div className="h-24 border-t border-outline-variant/30 bg-surface-container/50 px-4 sm:px-6 py-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-code-label text-on-surface-variant">
              <span>00:00:00.000</span>
              <span className="text-[11px] opacity-70">{t.clip.title}</span>
              <span>00:00:00.000</span>
            </div>
            <div className="h-8 rounded-lg bg-surface-container-highest/60 border border-outline-variant/30 relative flex items-center px-2">
              <div className="w-full h-1.5 rounded-full bg-outline-variant/30 overflow-hidden">
                <div className="w-0 h-full bg-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
