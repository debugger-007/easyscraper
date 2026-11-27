import React from 'react'
import { Link } from '@tanstack/react-router'
import type { SupportedLocale } from '../i18n/types'
import { useTranslate, normalizeLocale } from '../i18n'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { InstallExtensionButton } from './InstallExtensionButton'
import { CHROME_STORE_URL } from '../config/extension'
import {
  Home,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  Lock,
  Infinity as InfinityIcon,
  CreditCard,
  ScanSearch,
  BookOpen,
  Star,
  RefreshCw,
  Table2,
  Download,
  BadgeCheck,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowUpDown,
  GitBranch,
  FileSpreadsheet,
  TableProperties,
  Code2,
  Webhook,
  Zap,
  Coins,
  Shield,
  Rocket,
  Database,
} from 'lucide-react'

interface WebDataScraperPageProps {
  currentLocale?: SupportedLocale
}

const ACCENT = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
} as const

export const WebDataScraperPage: React.FC<WebDataScraperPageProps> = ({
  currentLocale: overrideLocale,
}) => {
  const { t, locale } = useTranslate(overrideLocale)
  const normalizedLocale = normalizeLocale(locale)
  const isEn = normalizedLocale === 'en'
  const page = t.webDataScraperPage

  const trustIcons = {
    verified_user: <ShieldCheck className="w-4 h-4 text-primary shrink-0" />,
    lock_reset: <Lock className="w-4 h-4 text-primary shrink-0" />,
    all_inclusive: <InfinityIcon className="w-4 h-4 text-primary shrink-0" />,
    credit_card_off: <CreditCard className="w-4 h-4 text-primary shrink-0" />,
  }

  const paginationIcons = {
    navigate_next: <ChevronRight className="w-6 h-6" />,
    swap_vert: <ArrowUpDown className="w-5 h-5" />,
    account_tree: <GitBranch className="w-5 h-5" />,
  }

  const formatIcons = {
    description: <FileSpreadsheet className="w-5 h-5" />,
    table_rows: <TableProperties className="w-5 h-5" />,
    code: <Code2 className="w-5 h-5" />,
    webhook: <Webhook className="w-5 h-5" />,
  }

  const comparisonIcons = {
    lock: <Lock className="w-5 h-5 text-primary shrink-0" />,
    toll: <Coins className="w-5 h-5 text-primary shrink-0" />,
    shield: <Shield className="w-5 h-5 text-primary shrink-0" />,
    rocket_launch: <Rocket className="w-5 h-5 text-primary shrink-0" />,
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Navbar currentLocale={locale} t={t} activeRoute="web-data-scraper" />

      <main className="flex-1 w-full">
        {/* Top Utility Bar: SEO Breadcrumb */}
        <section className="w-full bg-surface-container-lowest border-b border-outline-variant/20 shadow-[0_1px_4px_rgba(19,27,46,0.03)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 sm:gap-2 font-code-label text-[11px] sm:text-xs text-on-surface-variant min-w-0"
            >
              <Link
                to={isEn ? '/' : '/$lang'}
                params={isEn ? undefined : { lang: 'zh' }}
                className="hover:text-primary transition-colors inline-flex items-center gap-1 shrink-0"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{page.breadcrumb.home}</span>
              </Link>
              <span className="text-outline-variant">/</span>
              <Link
                to={isEn ? '/' : '/$lang'}
                params={isEn ? undefined : { lang: 'zh' }}
                hash="features"
                className="hover:text-primary transition-colors shrink-0"
              >
                {page.breadcrumb.features}
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-primary font-semibold inline-flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="truncate">{page.breadcrumb.current}</span>
              </span>
            </nav>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-code-label text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span>{page.breadcrumb.mv3Badge}</span>
            </div>
          </div>
        </section>

        {/* 1. Hero Section + Interactive Visual Inspection Mockup */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12 sm:pb-16 relative z-10">
            <div className="flex flex-col items-start md:items-center text-left md:text-center space-y-4 sm:space-y-5 max-w-4xl md:mx-auto">
              {/* Tag Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container text-primary font-code-label text-[10px] sm:text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span>{page.hero.badge}</span>
              </div>

              {/* H1 Headline */}
              <h1 className="font-display-hero text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface leading-[1.15]">
                <span>{page.hero.titleMain}</span>
                <span className="text-primary block mt-1">{page.hero.titleSub}</span>
              </h1>

              {/* Subtitle */}
              <p className="font-body-md sm:font-body-lg text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                {page.hero.description}
              </p>

              {/* CTA Action Cluster */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                <InstallExtensionButton
                  chromeLabel={page.hero.ctaChrome}
                  edgeLabel={page.hero.ctaEdge}
                />
                <a
                  href="#visual-sandbox"
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-full bg-surface-container-lowest text-on-surface border border-outline-variant/45 font-semibold text-sm shadow-sm hover:bg-surface-container-low hover:border-primary/40 transition-all"
                >
                  <span>{page.hero.ctaSandbox}</span>
                  <ArrowUpRight className="w-4 h-4 text-primary shrink-0" />
                </a>
              </div>

              {/* 4 Trust Badges: 2x2 grid cards on mobile, inline row on md+ */}
              <div className="w-full pt-2 grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-2.5 sm:gap-x-5 sm:gap-y-2">
                {page.hero.trustBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-0 bg-surface-container-lowest sm:bg-transparent rounded-xl sm:rounded-none border border-outline-variant/25 sm:border-0 shadow-sm sm:shadow-none flex items-center gap-2 font-code-label text-[10px] sm:text-xs text-on-surface sm:text-on-surface-variant font-semibold uppercase tracking-wider min-w-0"
                  >
                    {trustIcons[badge.icon]}
                    <span className="truncate">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual: Visual Inspection Mockup */}
            <div
              id="visual-sandbox"
              className="mt-8 sm:mt-12 relative w-full rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xl overflow-hidden scroll-mt-24"
            >
              {/* Mockup Browser Toolbar */}
              <div className="bg-surface-container-high px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-error/70" />
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400/80" />
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary/70" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-code-label text-[11px] truncate">
                    <Lock className="w-3 h-3 shrink-0" />
                    <span className="truncate">{page.sandbox.urlBar}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-code-label text-[10px] sm:text-[11px] shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-semibold inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{page.sandbox.statusBadge}</span>
                  </span>
                  <span className="text-on-surface-variant hidden md:inline">
                    {page.sandbox.memoryBadge}
                  </span>
                </div>
              </div>

              {/* Simulated Webpage DOM + Live SheetJS Console */}
              <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 bg-surface">
                {/* Left: Webpage Product Cards with Selection Highlights */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-code-label text-[11px] text-on-surface-variant min-w-0">
                      <ScanSearch className="w-4 h-4 text-primary shrink-0" />
                      <span>{page.sandbox.targetLabel}</span>
                      <code className="px-1.5 py-0.5 bg-surface-container-high rounded text-on-surface text-[11px] truncate">
                        {page.sandbox.targetSelector}
                      </code>
                    </div>
                    <span className="font-code-label text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-semibold">
                      {page.sandbox.siblingMatchBadge}
                    </span>
                  </div>

                  {/* Product Card Simulation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {page.sandbox.sampleItems.slice(0, 2).map((item, idx) => (
                      <div
                        key={idx}
                        className={`relative p-4 rounded-xl bg-surface-container-lowest shadow-sm border ${
                          idx === 0
                            ? 'border-primary/60 ring-2 ring-primary/15'
                            : 'border-outline-variant/30 opacity-95'
                        }`}
                      >
                        {idx === 0 && (
                          <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded bg-primary text-on-primary font-code-label text-[10px] font-semibold shadow">
                            {page.sandbox.focusedHudBadge}
                          </div>
                        )}
                        <div className="h-24 sm:h-28 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden mb-3 relative">
                          <div className="absolute inset-2 bg-gradient-to-tr from-surface-container-high to-surface-container-lowest rounded flex items-center justify-center">
                            <BookOpen
                              className={`w-8 h-8 ${idx === 0 ? 'text-primary/45' : 'text-secondary/45'}`}
                            />
                          </div>
                          <span className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface font-code-label text-[10px]">
                            {item.stock}
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-sm sm:text-base font-semibold truncate text-on-surface">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2 pt-1">
                          <span className="font-code-label text-sm text-primary font-bold">
                            {item.price}
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: item.stars }).map((_, sIdx) => (
                              <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            ))}
                            <span className="font-code-label text-[10px] text-on-surface-variant ml-1">
                              {item.ratingLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Bar Found */}
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 font-code-label text-[11px]">
                    <div className="flex items-center gap-1.5 text-secondary">
                      <RefreshCw className="w-4 h-4 shrink-0" />
                      <span>{page.sandbox.paginationText}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface">
                      {page.sandbox.paginationSelector}
                    </span>
                  </div>
                </div>

                {/* Right: Extension Live SheetJS Extraction Console */}
                <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-4 sm:p-5 border border-outline-variant/25 flex flex-col justify-between shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Table2 className="w-5 h-5 text-primary" />
                        <span className="font-headline-sm text-base font-bold text-on-surface">
                          {page.sandbox.previewTitle}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-code-label text-[10px] font-semibold">
                        {page.sandbox.previewSpeedBadge}
                      </span>
                    </div>

                    {/* Quick Column Mapping Config */}
                    <div className="space-y-1.5 font-code-label text-[10px] sm:text-[11px]">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>{page.sandbox.mappedColumnsLabel}</span>
                        <span className="text-primary font-semibold">
                          {page.sandbox.schemaReadyLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {page.sandbox.columns.map((col, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded bg-surface-container text-on-surface"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Table Extraction Data Preview */}
                    <div className="overflow-x-auto rounded-lg bg-surface-container-low border border-outline-variant/20">
                      <table className="w-full text-left font-code-label text-[11px]">
                        <thead className="bg-surface-container-high text-on-surface-variant uppercase">
                          <tr>
                            <th className="p-2">{page.sandbox.tableHeaders.index}</th>
                            <th className="p-2">{page.sandbox.tableHeaders.title}</th>
                            <th className="p-2">{page.sandbox.tableHeaders.price}</th>
                            <th className="p-2">{page.sandbox.tableHeaders.stock}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-high text-on-surface">
                          {page.sandbox.sampleItems.map((row, idx) => (
                            <tr key={idx} className="hover:bg-primary-fixed/20 transition-colors">
                              <td className="p-2 text-outline">{idx + 1}</td>
                              <td className="p-2 font-medium truncate max-w-[130px]">{row.title}</td>
                              <td className="p-2 text-primary font-semibold">{row.price}</td>
                              <td className="p-2 text-on-surface-variant">{row.stockShort}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Instant Export Controls */}
                  <div className="mt-4 pt-3 flex items-center gap-2">
                    <a
                      href={CHROME_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-lg bg-primary text-on-primary font-code-label text-xs font-semibold hover:bg-primary-container flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>{page.sandbox.exportXlsx}</span>
                    </a>
                    <a
                      href={CHROME_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3.5 rounded-lg bg-surface-container text-on-surface font-code-label text-xs font-semibold hover:bg-surface-container-high transition-all"
                    >
                      {page.sandbox.exportCsv}
                    </a>
                    <a
                      href={CHROME_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3.5 rounded-lg bg-surface-container text-on-surface font-code-label text-xs font-semibold hover:bg-surface-container-high transition-all"
                    >
                      {page.sandbox.exportJson}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 2. Core Feature 1: Heuristic Visual Click & Automatic Sibling Detection */}
        <section className="w-full bg-surface-container-low py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <span className="font-code-label text-xs text-primary font-semibold uppercase tracking-wider">
                  {page.heuristics.badge}
                </span>
                <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface">
                  {page.heuristics.title}
                </h2>
                <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  {page.heuristics.description}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2 bg-surface-container-lowest border border-outline-variant/25 rounded-xl shadow-sm font-code-label text-xs text-secondary font-semibold shrink-0">
                <BadgeCheck className="w-4 h-4 shrink-0" />
                <span>{page.heuristics.accuracyBadge}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Old Way: XPath Hell */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 border border-error/20 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded bg-error/10 text-error font-code-label text-[11px] font-bold uppercase tracking-wider">
                    {page.heuristics.oldWay.badge}
                  </span>
                  <XCircle className="w-5 h-5 text-error shrink-0" />
                </div>
                <p className="font-body-sm sm:font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {page.heuristics.oldWay.description}
                </p>
                <div className="p-4 rounded-xl bg-surface-container font-code-label text-[11px] space-y-1.5 overflow-x-auto">
                  <div className="line-through text-outline">
                    /html/body/div[2]/main/div/div[3]/article/h3/a
                  </div>
                  <div className="line-through text-outline">
                    div.css-1r98kfl &gt; span.Product_price__2G9e0
                  </div>
                  <div className="text-error font-semibold flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{page.heuristics.oldWay.errorMsg}</span>
                  </div>
                </div>
              </div>

              {/* Easy Web Scraper: Heuristic Sibling Engine */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 border border-primary/25 shadow-md space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded bg-primary-fixed text-on-primary-fixed font-code-label text-[11px] font-bold uppercase tracking-wider">
                    {page.heuristics.newWay.badge}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                </div>
                <p className="font-body-sm sm:font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {page.heuristics.newWay.description}
                </p>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-primary font-code-label text-[11px] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span>{page.heuristics.newWay.parentLabel}</span>
                    <span className="text-secondary font-semibold">{page.heuristics.newWay.depthLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-on-surface font-semibold">
                    <span>{page.heuristics.newWay.matchedLabel}</span>
                    <span className="text-primary">{page.heuristics.newWay.fitLabel}</span>
                  </div>
                  <div className="text-on-surface-variant text-[10px] pt-0.5">
                    {page.heuristics.newWay.footnote}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Core Feature 2: Auto-Pagination & Infinite Scroll Engine */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-8 sm:space-y-12">
          <div className="text-left md:text-center max-w-3xl md:mx-auto space-y-2">
            <span className="font-code-label text-xs text-primary font-semibold uppercase tracking-wider">
              {page.pagination.badge}
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface">
              {page.pagination.title}
            </h2>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant">
              {page.pagination.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {page.pagination.cards.map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/25 shadow-sm flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div
                    className={`w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center ${ACCENT[card.accent]}`}
                  >
                    {paginationIcons[card.icon]}
                  </div>
                  <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
                    {card.title}
                  </h3>
                  <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low font-code-label text-[11px] text-on-surface-variant flex items-center justify-between gap-2">
                  <span>{card.metricLabel}</span>
                  <span className={`font-semibold ${ACCENT[card.accent]}`}>
                    {card.metricValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Core Feature 3: Pure Local SheetJS & Zero-Latency Multi-Format Export */}
        <section className="w-full bg-surface-container-low py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
              <div className="space-y-4 max-w-xl w-full">
                <span className="font-code-label text-xs text-primary font-semibold uppercase tracking-wider">
                  {page.exportEngine.badge}
                </span>
                <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface">
                  {page.exportEngine.title}
                </h2>
                <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  {page.exportEngine.description}
                </p>

                {/* 4 Export Format Pills (2x2) */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {page.exportEngine.formats.map((fmt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25 flex items-center gap-3 shadow-sm min-w-0"
                    >
                      <span className={`shrink-0 ${ACCENT[fmt.accent]}`}>
                        {formatIcons[fmt.icon]}
                      </span>
                      <div className="min-w-0">
                        <span className="font-headline-sm text-xs sm:text-sm font-bold block text-on-surface truncate">
                          {fmt.title}
                        </span>
                        <span className="font-code-label text-[10px] text-on-surface-variant block truncate">
                          {fmt.subtitle}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speed Benchmark Visual Card */}
              <div className="w-full lg:w-[480px] p-6 sm:p-7 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-md space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-code-label text-xs uppercase text-on-surface-variant font-semibold">
                    {page.exportEngine.benchmark.title}
                  </span>
                  <span className="text-primary font-code-label font-bold text-sm shrink-0">
                    {page.exportEngine.benchmark.highlightTime}
                  </span>
                </div>

                <div className="space-y-4">
                  {page.exportEngine.benchmark.bars.map((bar, idx) => (
                    <div key={idx}>
                      <div
                        className={`flex justify-between font-code-label text-[11px] mb-1.5 gap-2 ${
                          bar.isPrimary ? 'text-on-surface font-bold' : 'text-on-surface-variant'
                        }`}
                      >
                        <span className="truncate">{bar.label}</span>
                        <span className={bar.isPrimary ? 'text-primary font-bold shrink-0' : 'shrink-0'}>
                          {bar.time}
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            bar.isPrimary ? 'bg-primary' : 'bg-outline-variant'
                          }`}
                          style={{ width: `${bar.widthPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant font-code-label text-[11px] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary shrink-0" />
                  <span>{page.exportEngine.benchmark.footnote}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Core Feature 4: Local Browser vs Traditional Cloud SaaS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-8 sm:space-y-12">
          <div className="text-left md:text-center max-w-3xl md:mx-auto space-y-2">
            <span className="font-code-label text-xs text-primary font-semibold uppercase tracking-wider">
              {page.comparison.badge}
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface">
              {page.comparison.title}
            </h2>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant">
              {page.comparison.description}
            </p>
          </div>

          {/* Mobile Stacked Comparison Cards (< md) */}
          <div className="flex flex-col gap-3.5 md:hidden">
            {page.comparison.rows.map((row, idx) => (
              <div
                key={idx}
                className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/25 shadow-sm flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-headline-sm text-sm text-on-surface font-bold">
                    {idx + 1}. {row.dimension}
                  </span>
                  {comparisonIcons[row.icon]}
                </div>
                <div className="p-3 rounded-xl bg-primary/8 text-primary font-body-sm text-xs font-medium leading-relaxed">
                  <strong>{page.comparison.localShortLabel}</strong> {row.local}
                </div>
                <div className="p-3 rounded-xl bg-error-container/30 text-on-surface-variant font-body-sm text-xs leading-relaxed">
                  <strong className="text-error">{page.comparison.cloudShortLabel}</strong> {row.cloud}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Comparison Table (md+) */}
          <div className="hidden md:block w-full overflow-x-auto rounded-2xl border border-outline-variant/25 shadow-sm bg-surface-container-lowest">
            <table className="w-full text-left font-body-md text-sm min-w-[720px]">
              <thead>
                <tr className="bg-surface-container-high text-on-surface font-headline-sm">
                  <th className="p-4 lg:p-5 w-1/4">{page.comparison.headers.dimension}</th>
                  <th className="p-4 lg:p-5 w-3/8 text-primary bg-primary/10">
                    {page.comparison.headers.local}
                  </th>
                  <th className="p-4 lg:p-5 w-3/8 text-on-surface-variant">
                    {page.comparison.headers.cloud}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {page.comparison.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-primary-fixed/10 transition-colors">
                    <td className="p-4 lg:p-5 font-semibold text-on-surface">{row.dimension}</td>
                    <td className="p-4 lg:p-5 bg-primary/5 text-primary font-medium">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{row.local}</span>
                      </div>
                    </td>
                    <td className="p-4 lg:p-5 text-on-surface-variant">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                        <span>{row.cloud}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Interactive FAQ Accordion */}
        <section className="w-full bg-surface-container-low py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
            <div className="text-left md:text-center space-y-2">
              <span className="font-code-label text-xs text-primary font-semibold uppercase tracking-wider">
                {page.faq.badge}
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface">
                {page.faq.title}
              </h2>
              <p className="font-body-md text-sm sm:text-base text-on-surface-variant">
                {page.faq.description}
              </p>
            </div>

            <div className="space-y-3">
              {page.faq.items.map((item, idx) => (
                <details
                  key={idx}
                  name="web-data-scraper-faq"
                  open={idx === 0}
                  className="group rounded-2xl bg-surface-container-lowest border border-outline-variant/25 shadow-sm overflow-hidden transition-all"
                >
                  <summary className="w-full p-4 sm:p-6 flex items-center justify-between text-left gap-4 focus:outline-none cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="font-headline-sm text-sm sm:text-base font-semibold text-on-surface">
                      {idx + 1}. {item.q}
                    </span>
                    <ChevronDown className="w-5 h-5 text-primary shrink-0 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 text-on-surface-variant font-body-sm sm:font-body-md text-xs sm:text-sm leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Final High-Converting CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          <div className="relative rounded-2xl bg-gradient-to-br from-primary-container via-primary to-secondary p-6 sm:p-10 md:p-12 text-on-primary shadow-xl overflow-hidden text-center space-y-5">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

            <div className="w-11 h-11 rounded-xl bg-on-primary/15 flex items-center justify-center mx-auto sm:hidden relative z-10">
              <Database className="w-6 h-6 text-on-primary" />
            </div>

            <span className="relative z-10 inline-block px-4 py-1 rounded-full bg-white/20 text-on-primary font-code-label text-[11px] sm:text-xs tracking-wider uppercase backdrop-blur-sm">
              {page.ctaBanner.tag}
            </span>

            <h2 className="relative z-10 font-headline-lg text-2xl sm:text-3xl md:text-4xl font-bold text-on-primary max-w-2xl mx-auto">
              {page.ctaBanner.title}
            </h2>

            <p className="relative z-10 font-body-md sm:font-body-lg text-sm sm:text-base text-on-primary/90 max-w-xl mx-auto">
              {page.ctaBanner.description}
            </p>

            <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <InstallExtensionButton
                variant="inverted"
                chromeLabel={page.ctaBanner.btnChrome}
                edgeLabel={page.ctaBanner.btnEdge}
              />
            </div>

            <div className="relative z-10 pt-2 text-on-primary/85 font-code-label text-[11px] flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              {page.ctaBanner.footnotes.map((note, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span>•</span>}
                  <span>{note}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer t={t} />
    </div>
  )
}
