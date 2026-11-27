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
  Download,
  Music,
  Film,
  Zap,
  CloudOff,
  Cpu,
  MonitorPlay,
  ShieldAlert,
  AlertTriangle,
  BadgeCheck,
  Lock,
  ListVideo,
  Layers,
  Braces,
  FileVideo,
  SplitSquareVertical,
  Radio,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  FolderLock,
  GraduationCap,
  Disc,
  Code2,
  GitMerge,
  CheckCircle2,
  XCircle,
  Sparkles,
  PlayCircle,
} from 'lucide-react'

interface VideoScraperPageProps {
  currentLocale?: SupportedLocale
}

const ACCENT = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
} as const

export const VideoScraperPage: React.FC<VideoScraperPageProps> = ({
  currentLocale: overrideLocale,
}) => {
  const { t, locale } = useTranslate(overrideLocale)
  const normalizedLocale = normalizeLocale(locale)
  const isEn = normalizedLocale === 'en'
  const page = t.videoScraperPage

  const pillIcons = {
    speed: <Zap className="w-4 h-4 text-primary shrink-0" />,
    cloud_off: <CloudOff className="w-4 h-4 text-secondary shrink-0" />,
    memory: <Cpu className="w-4 h-4 text-primary shrink-0" />,
    hd: <MonitorPlay className="w-4 h-4 text-tertiary shrink-0" />,
  }

  const protocolIcons = {
    playlist_play: <ListVideo className="w-6 h-6" />,
    view_carousel: <Layers className="w-6 h-6" />,
    data_object: <Braces className="w-6 h-6" />,
    video_file: <FileVideo className="w-6 h-6" />,
    splitscreen: <SplitSquareVertical className="w-6 h-6" />,
    live_tv: <Radio className="w-6 h-6" />,
  }

  const pillarIcons = {
    enhanced_encryption: <ShieldCheck className="w-6 h-6" />,
    memory: <Cpu className="w-6 h-6" />,
    sync_alt: <RefreshCw className="w-6 h-6" />,
    folder_special: <FolderLock className="w-6 h-6" />,
  }

  const scenarioIcons = {
    school: <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />,
    fiber_smart_record: <Disc className="w-5 h-5 md:w-6 md:h-6" />,
    html: <Code2 className="w-5 h-5 md:w-6 md:h-6" />,
    merge: <GitMerge className="w-5 h-5 md:w-6 md:h-6" />,
  }

  const ctaBadgeIcons = {
    verified_user: <ShieldCheck className="w-4 h-4 shrink-0" />,
    lock: <Lock className="w-4 h-4 shrink-0" />,
    update: <RefreshCw className="w-4 h-4 shrink-0" />,
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Navbar currentLocale={locale} t={t} activeRoute="video-scraper" />

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

        {/* 1. Hero Section */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low/40 to-surface py-10 sm:py-14 lg:py-20">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-secondary-container/30 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Hero Text */}
              <div className="lg:col-span-7 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/25 shadow-sm mb-4 sm:mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="font-code-label text-[10px] sm:text-xs text-primary font-semibold tracking-wide uppercase">
                    {page.hero.badge}
                  </span>
                </div>

                <h1 className="font-display-hero text-3xl sm:text-4xl lg:text-5xl text-on-surface font-bold tracking-tight leading-[1.15] mb-4 sm:mb-6">
                  <span>{page.hero.titleMain}</span>
                  <span className="block text-primary mt-1">{page.hero.titleSub}</span>
                </h1>

                <p className="font-body-md sm:font-body-lg text-sm sm:text-base lg:text-lg text-on-surface-variant mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                  {page.hero.description}
                </p>

                {/* CTAs */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <InstallExtensionButton
                    chromeLabel={page.hero.ctaChrome}
                    edgeLabel={page.hero.ctaEdge}
                  />
                  <a
                    href="#pipeline-demo"
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-full bg-surface-container-lowest text-on-surface border border-outline-variant/45 font-semibold text-sm shadow-sm hover:bg-surface-container-low hover:border-primary/40 transition-all"
                  >
                    <span>{page.hero.ctaDemo}</span>
                    <ArrowUpRight className="w-4 h-4 text-primary shrink-0" />
                  </a>
                </div>

                {/* 4 Feature Pills (2x2 on mobile, 4-col on sm+) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-2xl">
                  {page.hero.pills.map((pill, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-container-lowest border border-outline-variant/25 px-3 py-2.5 rounded-lg shadow-sm flex items-center gap-2 min-w-0"
                    >
                      {pillIcons[pill.icon]}
                      <span className="font-code-label text-[10px] sm:text-[11px] text-on-surface font-semibold truncate">
                        {pill.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive HUD Preview Console */}
              <div className="lg:col-span-5 relative">
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl overflow-hidden">
                  {/* Window Header */}
                  <div className="bg-surface-container px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-error/70 shrink-0" />
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-secondary-fixed-dim shrink-0" />
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary-fixed-dim shrink-0" />
                      <span className="font-code-label text-[10px] sm:text-[11px] text-on-surface-variant font-medium ml-1.5 truncate">
                        {page.hud.windowTitle}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-code-label text-[10px] text-primary font-semibold bg-surface-container-lowest px-2 py-0.5 rounded-full shrink-0 border border-primary/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span>{page.hud.statusBadge}</span>
                    </span>
                  </div>

                  {/* HUD Content */}
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="bg-surface-container-low rounded-xl p-3.5 flex items-center justify-between gap-2 border border-outline-variant/20">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Film className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-headline-sm text-on-surface font-semibold text-sm truncate">
                            {page.hud.fileName}
                          </div>
                          <div className="font-code-label text-[10px] text-on-surface-variant truncate">
                            {page.hud.streamSpec}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-surface-container-lowest text-primary font-code-label text-[10px] rounded font-semibold shadow-sm shrink-0">
                        {page.hud.hlsBadge}
                      </span>
                    </div>

                    {/* Live Buffer Track */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between gap-2 font-code-label text-[10px] sm:text-[11px] text-on-surface-variant">
                        <span className="truncate">{page.hud.opfsLabel}</span>
                        <span className="text-primary font-bold shrink-0">{page.hud.opfsProgress}</span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-primary rounded-full w-full shadow-sm" />
                      </div>
                    </div>

                    {/* Mobile 2-col Metrics Grid (< sm) */}
                    <div className="grid grid-cols-2 gap-2.5 sm:hidden">
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                        <span className="font-code-label text-[10px] text-on-surface-variant block">
                          {page.hud.mobileMetric1Label}
                        </span>
                        <span className="font-code-label text-xs text-primary font-bold">
                          {page.hud.mobileMetric1Value}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                        <span className="font-code-label text-[10px] text-on-surface-variant block">
                          {page.hud.mobileMetric2Label}
                        </span>
                        <span className="font-code-label text-xs text-secondary font-bold">
                          {page.hud.mobileMetric2Value}
                        </span>
                      </div>
                    </div>

                    {/* Desktop Stream Parameters Table (sm+) */}
                    <div className="hidden sm:block bg-surface-container-low/50 rounded-xl p-3 space-y-2 font-code-label text-[11px] border border-outline-variant/20">
                      {page.hud.rows.map((row, idx) => (
                        <div key={idx} className="flex justify-between items-center gap-2 py-0.5">
                          <span className="text-on-surface-variant shrink-0">{row.label}</span>
                          <span
                            className={`text-right truncate ${
                              row.highlight === 'primary'
                                ? 'text-primary font-bold'
                                : row.highlight === 'secondary'
                                  ? 'text-secondary font-semibold'
                                  : 'text-on-surface font-semibold'
                            }`}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Direct Actions inside card */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <a
                        href={CHROME_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-code-label text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4 shrink-0" />
                        <span className="truncate">{page.hud.exportMp4}</span>
                      </a>
                      <a
                        href={CHROME_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-code-label text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Music className="w-4 h-4 text-secondary shrink-0" />
                        <span className="truncate">{page.hud.ripAudio}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Architecture Comparison & Protocols (Under The Hood) */}
        <section id="pipeline-demo" className="w-full py-14 sm:py-20 bg-surface-container-low scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left md:text-center max-w-3xl md:mx-auto mb-10 sm:mb-14">
              <span className="inline-block font-code-label text-xs text-primary font-semibold tracking-wider uppercase bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-outline-variant/20">
                {page.architecture.badge}
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold tracking-tight mt-3 mb-3">
                {page.architecture.title}
              </h2>
              <p className="font-body-md sm:font-body-lg text-sm sm:text-base text-on-surface-variant">
                {page.architecture.description}
              </p>
            </div>

            {/* Comparative Pipeline Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-14">
              {/* Legacy Flawed Pipeline */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-error/20 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                    <span className="px-3 py-1 bg-error-container text-on-error-container font-code-label text-[11px] font-semibold rounded-full inline-flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{page.architecture.legacy.badge}</span>
                    </span>
                    <span className="font-code-label text-[11px] text-error font-medium">
                      {page.architecture.legacy.subLabel}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-xl sm:text-2xl text-on-surface font-bold mb-4">
                    {page.architecture.legacy.title}
                  </h3>
                  <div className="space-y-4 font-body-md text-sm text-on-surface-variant">
                    {page.architecture.legacy.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                          <XCircle className="w-3.5 h-3.5" />
                        </div>
                        <p className="leading-relaxed">
                          <strong className="text-on-surface font-semibold">{step.strong}</strong>{' '}
                          {step.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 bg-error-container/30 border border-error/15 rounded-xl p-4 flex items-start sm:items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-error shrink-0" />
                  <p className="font-code-label text-[11px] sm:text-xs text-on-surface-variant leading-snug">
                    {page.architecture.legacy.summary}
                  </p>
                </div>
              </div>

              {/* Easy Web Scraper Next-Gen Pipeline */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-md border border-primary/25 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                    <span className="px-3 py-1 bg-surface-container text-primary font-code-label text-[11px] font-semibold rounded-full inline-flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                      <span>{page.architecture.engine.badge}</span>
                    </span>
                    <span className="font-code-label text-[11px] text-primary font-bold">
                      {page.architecture.engine.subLabel}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-xl sm:text-2xl text-on-surface font-bold mb-4">
                    {page.architecture.engine.title}
                  </h3>
                  <div className="space-y-4 font-body-md text-sm text-on-surface-variant">
                    {page.architecture.engine.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="leading-relaxed">
                          <strong className="text-on-surface font-semibold">{step.strong}</strong>{' '}
                          {step.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 mt-6 sm:mt-8 bg-surface-container-high border border-primary/20 rounded-xl p-4 flex items-start sm:items-center gap-3">
                  <Lock className="w-6 h-6 text-primary shrink-0" />
                  <p className="font-code-label text-[11px] sm:text-xs text-on-surface font-medium leading-snug">
                    {page.architecture.engine.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Universal Protocol Compatibility Strip */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/25">
              <div className="font-code-label text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-6 text-center">
                {page.protocols.stripTitle}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {page.protocols.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-container-low p-4 rounded-xl text-center flex flex-col items-center border border-outline-variant/15 hover:border-primary/35 transition-colors"
                  >
                    <div className={`mb-2 ${ACCENT[item.accent]}`}>
                      {protocolIcons[item.icon]}
                    </div>
                    <div className="font-headline-sm text-on-surface text-sm font-bold">
                      {item.name}
                    </div>
                    <div className="font-code-label text-[10px] text-on-surface-variant mt-1 leading-snug">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. OPFS Zero-Copy & High Performance Storage Section */}
        <section className="w-full py-14 sm:py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12 mb-12 sm:mb-16">
              <div className="lg:w-1/2">
                <span className="inline-block font-code-label text-xs text-primary font-semibold tracking-wider uppercase bg-surface-container px-3 py-1 rounded-full shadow-sm">
                  {page.opfs.badge}
                </span>
                <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold tracking-tight mt-3 mb-4">
                  {page.opfs.title}
                </h2>
                <p className="font-body-md sm:font-body-lg text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  {page.opfs.description}
                </p>
              </div>

              {/* Performance Benchmark Bar Chart */}
              <div className="w-full lg:w-5/12 bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-md border border-outline-variant/30">
                <div className="font-code-label text-xs text-on-surface font-bold mb-4 flex items-center justify-between gap-2">
                  <span>{page.opfs.benchTitle}</span>
                  <span className="text-primary shrink-0">{page.opfs.benchSize}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between font-code-label text-[11px] mb-1.5 text-on-surface-variant gap-2">
                      <span>{page.opfs.legacyLabel}</span>
                      <span className="text-error font-semibold shrink-0">{page.opfs.legacyValue}</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-error rounded-full w-[88%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-code-label text-[11px] mb-1.5 text-on-surface gap-2">
                      <span className="font-semibold text-primary">{page.opfs.engineLabel}</span>
                      <span className="text-primary font-bold shrink-0">{page.opfs.engineValue}</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-[4%]" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-surface-container-low rounded-lg p-3 text-xs text-on-surface-variant flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary shrink-0" />
                  <span>{page.opfs.benchFooter}</span>
                </div>
              </div>
            </div>

            {/* 4 Pillars Grid (2x2 on mobile, 4-col on lg) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {page.opfs.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/25 shadow-sm hover:shadow-md hover:border-primary/35 transition-all"
                >
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface-container flex items-center justify-center mb-4 ${ACCENT[pillar.accent]}`}
                  >
                    {pillarIcons[pillar.icon]}
                  </div>
                  <h3 className="font-headline-sm text-base sm:text-lg text-on-surface font-bold mb-2">
                    {pillar.title}
                  </h3>
                  <p className="font-body-sm sm:font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. High-Frequency Real-World Use Cases (Bento Grid) */}
        <section className="w-full py-14 sm:py-20 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left md:text-center max-w-3xl md:mx-auto mb-10 sm:mb-14">
              <span className="inline-block font-code-label text-xs text-primary font-semibold tracking-wider uppercase bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-outline-variant/20">
                {page.scenarios.badge}
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold tracking-tight mt-3 mb-3">
                {page.scenarios.title}
              </h2>
              <p className="font-body-md sm:font-body-lg text-sm sm:text-base text-on-surface-variant">
                {page.scenarios.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
              {page.scenarios.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`${
                    item.span === 'wide' ? 'md:col-span-12 lg:col-span-7' : 'md:col-span-12 lg:col-span-5'
                  } bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/25 shadow-sm flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3.5">
                      <span className={ACCENT[item.accent]}>{scenarioIcons[item.icon]}</span>
                      <span
                        className={`font-code-label text-[11px] font-bold uppercase tracking-wider ${ACCENT[item.accent]}`}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-lg sm:text-xl md:text-2xl text-on-surface font-bold mb-2.5">
                      {item.title}
                    </h3>
                    <p className="font-body-sm sm:font-body-md text-xs sm:text-sm text-on-surface-variant mb-5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="bg-surface-container-low rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
                    {item.features && item.features.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-3">
                        {item.features.map((feat, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-center gap-1.5 font-code-label text-[11px] text-on-surface font-medium"
                          >
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="font-code-label text-[11px] text-on-surface font-semibold">
                        {item.statLeft}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 bg-surface-container-lowest rounded font-code-label text-[11px] font-bold shadow-sm ${ACCENT[item.accent]}`}
                    >
                      {item.statRight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Dedicated FAQ Accordion */}
        <section className="w-full py-14 sm:py-20 bg-surface">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left md:text-center mb-8 sm:mb-12">
              <span className="inline-block font-code-label text-xs text-primary font-semibold tracking-wider uppercase bg-surface-container px-3 py-1 rounded-full shadow-sm">
                {page.faq.badge}
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold tracking-tight mt-3 mb-3">
                {page.faq.title}
              </h2>
              <p className="font-body-md sm:font-body-lg text-sm sm:text-base text-on-surface-variant">
                {page.faq.description}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {page.faq.items.map((item, idx) => (
                <details
                  key={idx}
                  name="video-scraper-faq"
                  open={idx === 0}
                  className="group bg-surface-container-lowest rounded-xl border border-outline-variant/25 shadow-sm overflow-hidden transition-all"
                >
                  <summary className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-4 font-headline-sm text-sm sm:text-base text-on-surface font-semibold hover:text-primary transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <ChevronDown className="w-5 h-5 text-primary shrink-0 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 font-body-sm sm:font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Cross-Navigation Recommendation Banner */}
        <section className="w-full py-10 sm:py-14 bg-surface-container-low border-t border-outline-variant/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary/40 transition-colors">
              <div className="space-y-2 max-w-2xl">
                <span className="inline-block px-3 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary font-code-label text-[11px] font-semibold uppercase tracking-wider">
                  {page.crossLink.badge}
                </span>
                <h3 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
                  {page.crossLink.title}
                </h3>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {page.crossLink.description}
                </p>
              </div>
              <Link
                to={isEn ? '/features/web-data-scraper' : '/$lang/features/web-data-scraper'}
                params={isEn ? undefined : { lang: 'zh' }}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-semibold text-xs sm:text-sm shadow-sm transition-all group cursor-pointer"
              >
                <span>{page.crossLink.cta}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 7. Final High-Impact Conversion Banner */}
        <section className="w-full py-12 sm:py-16 bg-gradient-to-br from-primary via-primary-container to-secondary text-on-primary relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-on-primary/10 flex items-center justify-center mx-auto mb-4 sm:hidden">
              <PlayCircle className="w-7 h-7 text-on-primary" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-on-primary/10 text-on-primary font-code-label text-[11px] backdrop-blur-md mb-5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{page.ctaBanner.tag}</span>
            </span>

            <h2 className="font-display-hero text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-on-primary">
              {page.ctaBanner.title}
            </h2>

            <p className="font-body-md sm:font-body-lg text-sm sm:text-base lg:text-lg text-on-primary/90 max-w-2xl mx-auto mb-7 sm:mb-8">
              {page.ctaBanner.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
              <InstallExtensionButton
                variant="inverted"
                chromeLabel={page.ctaBanner.btnChrome}
                edgeLabel={page.ctaBanner.btnEdge}
              />
            </div>

            <div className="hidden sm:flex flex-wrap items-center justify-center gap-6 text-on-primary/85 font-code-label text-xs">
              {page.ctaBanner.badges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  {ctaBadgeIcons[badge.icon]}
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
            <p className="sm:hidden font-code-label text-[11px] text-primary-fixed">
              {page.ctaBanner.mobileFootnote}
            </p>
          </div>
        </section>
      </main>

      <Footer t={t} />
    </div>
  )
}
