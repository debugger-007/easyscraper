import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { PrismLogo } from './PrismLogo'
import type { LegalDocument } from '../data/legalContent'
import type { SupportedLocale, TranslationSchema } from '../locales/types'
import { useTranslate, normalizeLocale } from '../locales'
import {
  ShieldCheck,
  ArrowLeft,
  Globe,
  Info,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Shield,
  CreditCard,
  Mail,
  ChevronRight,
  ChevronDown,
  ExternalLink
} from 'lucide-react'

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
)

interface LegalLayoutProps {
  doc: LegalDocument
  activeType: 'terms' | 'privacy' | 'refund'
  currentLocale?: SupportedLocale
  t?: TranslationSchema
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  doc,
  activeType,
  currentLocale: overrideLocale,
}) => {
  const { t, locale, changeLanguage, supportedLocales } = useTranslate(overrideLocale)
  const isEn = locale === 'en'
  const langParam = isEn ? undefined : { lang: 'zh' }
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const handleLanguageSwitch = (newLocale: SupportedLocale) => {
    setLangMenuOpen(false)
    changeLanguage(newLocale)
  }

  const calloutStyles = {
    info: {
      bg: 'bg-secondary/10 border-secondary/30 text-secondary',
      icon: <Info className="w-5 h-5 shrink-0 text-secondary mt-0.5" />,
      titleColor: 'text-secondary',
      bodyColor: 'text-on-surface-variant'
    },
    warning: {
      bg: 'bg-tertiary/10 border-tertiary/30 text-tertiary',
      icon: <AlertTriangle className="w-5 h-5 shrink-0 text-tertiary mt-0.5" />,
      titleColor: 'text-tertiary',
      bodyColor: 'text-on-surface-variant'
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />,
      titleColor: 'text-emerald-300',
      bodyColor: 'text-on-surface-variant'
    }
  }

  return (
    <div className="flex flex-col min-h-screen text-on-surface">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-outline-variant/30 bg-surface/85 backdrop-blur-xl">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to={isEn ? '/' : '/$lang'}
            params={langParam}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <PrismLogo size={26} />
            <span className="font-headline-md font-bold text-base sm:text-lg text-on-surface tracking-tight">
              Easy Web Scraper
            </span>
          </Link>

          {/* Policy Navigation Tabs (Desktop) */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-surface-container/70 border border-outline-variant/30 text-xs font-code-label">
            <Link
              to={isEn ? '/terms' : '/$lang/terms'}
              params={langParam}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeType === 'terms'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.legal.tabs.terms}</span>
            </Link>
            <Link
              to={isEn ? '/privacy' : '/$lang/privacy'}
              params={langParam}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeType === 'privacy'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t.legal.tabs.privacy}</span>
            </Link>
            <Link
              to={isEn ? '/refund' : '/$lang/refund'}
              params={langParam}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeType === 'refund'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{t.legal.tabs.refund}</span>
            </Link>
          </div>

          {/* Right actions: Lang switcher & Return home */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-xs font-code-label text-on-surface transition-colors cursor-pointer whitespace-nowrap"
                aria-label={t.nav.switchLanguage}
                title={t.nav.switchLanguage}
              >
                <Globe className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="font-medium whitespace-nowrap">
                  {t.nav.languages[locale] || t.nav.languages[normalizeLocale(locale)] || 'English'}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-on-surface-variant opacity-70 shrink-0 transition-transform duration-200 ${langMenuOpen ? 'rotate-180 text-secondary opacity-100' : ''
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
                          className={`w-full text-left px-3.5 py-2 hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer whitespace-nowrap ${isSelected ? 'text-secondary font-bold bg-secondary/10' : 'text-on-surface'
                            }`}
                        >
                          <span>{t.nav.languages[loc]}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 shadow-[0_0_6px_rgba(76,215,246,0.8)]" />}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Back to Home Button */}
            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface transition-colors border border-outline-variant/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.legal.actions.home}</span>
            </Link>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="sm:hidden flex items-center justify-around border-t border-outline-variant/20 px-2 py-2 bg-surface-container-lowest/50 text-xs font-code-label">
          <Link
            to={isEn ? '/terms' : '/$lang/terms'}
            params={langParam}
            className={`px-2.5 py-1 rounded-md ${activeType === 'terms' ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant'
              }`}
          >
            {t.legal.tabs.terms}
          </Link>
          <Link
            to={isEn ? '/privacy' : '/$lang/privacy'}
            params={langParam}
            className={`px-2.5 py-1 rounded-md ${activeType === 'privacy' ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant'
              }`}
          >
            {t.legal.tabs.privacy}
          </Link>
          <Link
            to={isEn ? '/refund' : '/$lang/refund'}
            params={langParam}
            className={`px-2.5 py-1 rounded-md ${activeType === 'refund' ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant'
              }`}
          >
            {t.legal.tabs.refund}
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Document Hero */}
        <div className="space-y-4 pb-10 border-b border-outline-variant/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-code-label font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{doc.badge}</span>
          </div>

          <h1 className="font-headline-md font-bold text-2xl sm:text-4xl text-on-surface tracking-tight leading-tight">
            {doc.title}
          </h1>

          <p className="font-body-base text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
            {doc.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-code-label text-outline pt-2">
            <span>{t.legal.meta.effectiveAndUpdated} {doc.lastUpdated}</span>
            <span>•</span>
            <span className="text-secondary font-medium">{t.legal.meta.localSandbox}</span>
            <span>•</span>
            <span>{t.legal.meta.verified}</span>
          </div>
        </div>

        {/* TL;DR Highlight Card */}
        <div className="my-10 p-5 sm:p-6 rounded-2xl bg-surface-container/70 border border-primary/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2.5 mb-4">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <h2 className="font-headline-md font-bold text-sm sm:text-base text-on-surface">
              {doc.tldr.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm font-body-sm text-on-surface-variant">
            {doc.tldr.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
                <span className="text-secondary font-code-label font-bold shrink-0 mt-0.5">0{idx + 1}.</span>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body Layout: Sidebar TOC + Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Quick Nav / Table of Contents (Desktop Sticky) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-4 p-5 rounded-2xl bg-surface-container-lowest/60 border border-outline-variant/30">
              <h3 className="font-code-label text-xs uppercase tracking-wider text-secondary font-bold">
                {t.legal.sidebar.tocTitle}
              </h3>
              <nav className="space-y-1">
                {doc.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <span className="line-clamp-1 group-hover:translate-x-0.5 transition-transform">
                      {section.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-outline/50 group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-outline-variant/20 space-y-2.5">
                <div className="text-[11px] font-code-label text-outline uppercase tracking-wider">
                  {t.legal.sidebar.channelsTitle}
                </div>
                <div className="space-y-1.5 text-xs font-code-label">
                  <a
                    href="mailto:easyscraper.one@gmail.com"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>easyscraper.one@gmail.com</span>
                  </a>
                  <a
                    href="mailto:yi444978264@gmail.com"
                    className="flex items-center gap-1.5 text-outline hover:text-on-surface transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>yi444978264@gmail.com</span>
                  </a>
                  <a
                    href="https://github.com/debugger-007/easyscraper/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-outline hover:text-secondary transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub Issues</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Sections */}
          <div className="lg:col-span-8 space-y-12">
            {doc.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 space-y-4 pt-2"
              >
                <h2 className="font-headline-md font-bold text-lg sm:text-xl text-on-surface flex items-center gap-2">
                  <span className="text-secondary/80 font-code-label font-normal text-sm">§</span>
                  <span>{section.title}</span>
                </h2>

                <div className="space-y-3 font-body-sm text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {section.content.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>

                {/* Subsections */}
                {section.subsections && (
                  <div className="space-y-4 pl-3 sm:pl-4 border-l-2 border-outline-variant/30 mt-4">
                    {section.subsections.map((sub, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        {sub.title && (
                          <h4 className="font-headline-md font-semibold text-xs sm:text-sm text-on-surface">
                            {sub.title}
                          </h4>
                        )}
                        {sub.content.map((sp, spIdx) => (
                          <p key={spIdx} className="text-xs sm:text-sm font-body-sm text-on-surface-variant leading-relaxed">
                            {sp}
                          </p>
                        ))}
                        {sub.bulletPoints && (
                          <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm font-body-sm text-on-surface-variant">
                            {sub.bulletPoints.map((bp, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {bp}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Styled Callout */}
                {section.callout && (
                  <div
                    className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${calloutStyles[section.callout.type].bg
                      }`}
                  >
                    {calloutStyles[section.callout.type].icon}
                    <div className="space-y-1 text-xs sm:text-sm font-body-sm">
                      <div
                        className={`font-semibold ${calloutStyles[section.callout.type].titleColor}`}
                      >
                        {section.callout.title}
                      </div>
                      <div className={calloutStyles[section.callout.type].bodyColor}>
                        {section.callout.text}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>

        {/* Bottom Support Banner */}
        <div className="mt-16 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-headline-md font-semibold text-sm text-on-surface">
              {t.legal.banner.questionsTitle}
            </h4>
            <p className="text-xs text-on-surface-variant font-body-sm">
              {t.legal.banner.questionsDesc}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://github.com/debugger-007/easyscraper/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-xs font-code-label flex items-center gap-1.5 transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>{t.legal.actions.githubIssues}</span>
            </a>
            <a
              href="mailto:easyscraper.one@gmail.com"
              className="px-4 py-2 rounded-lg bg-primary-container hover:brightness-110 text-on-primary-container text-xs font-headline-md font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{t.legal.actions.contactSupport}</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 bg-surface-container-lowest/80 py-8">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-code-label text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span>{t.legal.footer.allRightsReserved}</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              className="hover:text-on-surface transition-colors"
            >
              {t.legal.footer.home}
            </Link>
            <span className="text-outline-variant">•</span>
            <Link
              to={isEn ? '/terms' : '/$lang/terms'}
              params={langParam}
              className="hover:text-on-surface transition-colors"
            >
              {t.legal.footer.terms}
            </Link>
            <span className="text-outline-variant">•</span>
            <Link
              to={isEn ? '/privacy' : '/$lang/privacy'}
              params={langParam}
              className="hover:text-on-surface transition-colors"
            >
              {t.legal.footer.privacy}
            </Link>
            <span className="text-outline-variant">•</span>
            <Link
              to={isEn ? '/refund' : '/$lang/refund'}
              params={langParam}
              className="hover:text-on-surface transition-colors"
            >
              {t.legal.footer.refund}
            </Link>
            <span className="text-outline-variant">•</span>
            <Link
              to={isEn ? '/license' : '/$lang/license'}
              params={langParam}
              className="hover:text-on-surface transition-colors"
            >
              {t.legal.footer.licenseManagement || t.license.badge}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
