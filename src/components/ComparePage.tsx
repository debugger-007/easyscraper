import React from 'react'
import { Link } from '@tanstack/react-router'
import type { SupportedLocale } from '../i18n/types'
import { useTranslate, normalizeLocale } from '../i18n'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { InstallExtensionButton } from './InstallExtensionButton'
import { PageCtaBanner } from './PageCtaBanner'
import {
  Home,
  CheckCircle2,
  Scale,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react'

const COMPETITOR_KEYS = [
  'instantDataScraper',
  'webScraperIo',
  'octoparse',
  'videoDownloadHelper',
] as const

interface ComparePageProps {
  currentLocale?: SupportedLocale
}

export const ComparePage: React.FC<ComparePageProps> = ({
  currentLocale: overrideLocale,
}) => {
  const { t, locale } = useTranslate(overrideLocale)
  const normalizedLocale = normalizeLocale(locale)
  const isEn = normalizedLocale === 'en'
  const langParam = isEn ? undefined : { lang: 'zh' }
  const page = t.comparePage

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Navbar currentLocale={locale} t={t} activeRoute="compare" />

      <main className="flex-1 w-full">
        {/* Top Breadcrumb Bar */}
        <section className="w-full bg-surface-container-lowest border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 sm:gap-2 font-code-label text-[11px] sm:text-xs text-on-surface-variant"
            >
              <Link
                to={isEn ? '/' : '/$lang'}
                params={langParam}
                className="hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{page.breadcrumb.home}</span>
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold">{page.breadcrumb.current}</span>
            </nav>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-code-label text-[11px] text-on-surface-variant hidden sm:inline">
                {page.quickNavTitle}:
              </span>
              {page.competitorsSection.items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-primary/10 hover:text-primary border border-outline-variant/25 font-code-label text-[11px] text-on-surface-variant transition-colors"
                >
                  {item.shortLabel}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Hero Section (Entity Co-occurrence + BLUF Definition) */}
        <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-surface-container-lowest to-surface">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-code-label text-xs font-semibold">
              <Scale className="w-3.5 h-3.5" />
              <span>{page.hero.pillBadge}</span>
            </div>

            <h1 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.15]">
              {page.hero.titleLead}
              <span className="text-primary">{page.hero.titleHighlight}</span>
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
              {page.hero.definition}
            </p>

            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto text-left pt-2">
              {page.hero.summaryPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25 text-xs sm:text-sm text-on-surface"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <InstallExtensionButton
                chromeLabel={page.hero.ctaInstall}
                edgeLabel={page.hero.ctaInstallEdge}
              />
              <Link
                to={isEn ? '/faq' : '/$lang/faq'}
                params={langParam}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm font-semibold transition-all"
              >
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>{page.hero.ctaFaq}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Side-by-Side Comparison Matrix Table */}
        <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 font-code-label text-xs font-bold uppercase tracking-wider text-primary">
                <Layers className="w-3.5 h-3.5" />
                <span>{page.matrix.badge}</span>
              </div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                {page.matrix.title}
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                {page.matrix.description}
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
              <table className="w-full text-left border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-low/80">
                    <th className="py-4 px-4 text-xs font-code-label uppercase tracking-wider text-on-surface-variant font-bold w-44">
                      {page.matrix.columns.feature}
                    </th>
                    <th className="py-4 px-4 text-sm font-bold text-primary bg-primary/5 border-x border-primary/15">
                      {page.matrix.columns.easyWebScraper}
                    </th>
                    {COMPETITOR_KEYS.map((key) => (
                      <th key={key} className="py-4 px-4 text-xs sm:text-sm font-semibold text-on-surface">
                        {page.matrix.columns[key]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-xs sm:text-sm">
                  {page.matrix.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/40 transition-colors">
                      <th
                        scope="row"
                        className="py-3.5 px-4 font-semibold text-on-surface align-top"
                      >
                        {row.feature}
                      </th>
                      <td className="py-3.5 px-4 font-medium text-on-surface bg-primary/5 border-x border-primary/15 align-top">
                        {row.easyWebScraper}
                      </td>
                      {COMPETITOR_KEYS.map((key) => (
                        <td key={key} className="py-3.5 px-4 text-on-surface-variant align-top">
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Per-Competitor Objective Deep-Dives */}
        <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-surface-container-low/50 border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 font-code-label text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{page.competitorsSection.badge}</span>
              </div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                {page.competitorsSection.title}
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                {page.competitorsSection.description}
              </p>
            </div>

            <div className="space-y-6">
              {page.competitorsSection.items.map((item) => (
                <article
                  key={item.id}
                  id={item.id}
                  className="scroll-mt-24 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-6 md:p-8 shadow-sm space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface">
                      {item.name}
                    </h3>
                    <p className="font-code-label text-xs text-primary font-semibold">
                      {item.tagline}
                    </p>
                    <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed pt-1">
                      {item.verdict}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="font-code-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                      {page.competitorsSection.keyDifferenceLabel}
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {item.keyDifferences.map((diff, idx) => (
                        <li
                          key={idx}
                          className="p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 text-xs sm:text-sm text-on-surface leading-relaxed"
                        >
                          {diff}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="p-4 sm:p-5 rounded-xl bg-surface-container-low/60 border border-outline-variant/25 space-y-2.5">
                      <h4 className="text-sm font-bold text-on-surface">
                        {page.competitorsSection.chooseCompetitorLabel}
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-on-surface-variant">
                        {item.chooseCompetitorWhen.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-outline shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-2.5">
                      <h4 className="text-sm font-bold text-primary">
                        {page.competitorsSection.chooseUsLabel}
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-on-surface">
                        {item.chooseUsWhen.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison FAQ */}
        <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="font-code-label text-xs font-bold uppercase tracking-wider text-primary">
                {page.faq.badge}
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                {page.faq.title}
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant">
                {page.faq.description}
              </p>
            </div>

            <div className="space-y-3">
              {page.faq.items.map((item, idx) => (
                <details
                  key={idx}
                  open
                  className="group rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-5"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-sm sm:text-base text-on-surface">
                    <h3>{item.q}</h3>
                    <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <PageCtaBanner
          badge={page.ctaBanner.badge}
          title={page.ctaBanner.title}
          description={page.ctaBanner.description}
          chromeLabel={page.ctaBanner.btnChrome}
          edgeLabel={page.ctaBanner.btnEdge}
          secondaryAction={
            <Link
              to={isEn ? '/faq' : '/$lang/faq'}
              params={langParam}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-on-primary/10 hover:bg-on-primary/20 border border-on-primary/25 text-on-primary text-sm font-semibold backdrop-blur-sm transition-all"
            >
              <span>{page.ctaBanner.btnFaq}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      </main>

      <Footer t={t} />
    </div>
  )
}
