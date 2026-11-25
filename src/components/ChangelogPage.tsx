import React, { useEffect, useId, useMemo, useState } from 'react'
import {
  Archive,
  ArrowUpRight,
  Bell,
  Bug,
  Check,
  CloudUpload,
  FileCode2,
  History,
  Layers,
  Link2,
  MousePointerClick,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import {
  getChangelogReleases,
  LATEST_RELEASE_VERSION,
  type ChangelogItem,
  type ChangelogRelease,
  type ReleaseCategory,
  type ReleaseItemIcon,
} from '../data/changelogData'
import { CHROME_STORE_URL, TELEGRAM_CHANNEL_URL } from '../config/extension'
import { useTranslate, type SupportedLocale } from '../i18n'

type FilterOption = 'all' | ReleaseCategory

interface ChangelogPageProps {
  currentLocale?: SupportedLocale
  initialVersion?: string
}

const ITEM_ICON_MAP: Record<ReleaseItemIcon, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  'mouse-pointer': MousePointerClick,
  'cloud-upload': CloudUpload,
  'file-code': FileCode2,
  archive: Archive,
  layers: Layers,
  bell: Bell,
  bug: Bug,
  zap: Zap,
}

/**
 * Render description text with inline backtick code spans highlighted safely.
 */
function renderInlineCode(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="font-code-label text-[11px] bg-surface-container px-1.5 py-0.5 rounded text-primary font-medium mx-0.5"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>
  })
}

export const ChangelogPage: React.FC<ChangelogPageProps> = ({
  currentLocale: overrideLocale,
  initialVersion,
}) => {
  const { t, locale } = useTranslate(overrideLocale)
  const releases = useMemo(() => getChangelogReleases(locale), [locale])

  const [activeFilter, setActiveFilter] = useState<FilterOption>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeAnchor, setActiveAnchor] = useState<string>(releases[0]?.anchorId ?? '')
  const searchInputId = useId()

  // Normalize query param ?version=1.2.0 or ?version=v1.2.0 and scroll to matching card
  const highlightedAnchor = useMemo(() => {
    if (!initialVersion) return null
    const normalized = initialVersion.trim().replace(/^v/i, '')
    const matched = releases.find((r) => r.version === normalized)
    return matched?.anchorId ?? null
  }, [initialVersion, releases])

  useEffect(() => {
    if (!highlightedAnchor) return
    setActiveAnchor(highlightedAnchor)
    const el = document.getElementById(highlightedAnchor)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [highlightedAnchor])

  const filteredReleases = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return releases.filter((release) => {
      const matchesCategory = activeFilter === 'all' || release.category === activeFilter
      if (!matchesCategory) return false
      if (!query) return true

      const haystack = [
        release.tag,
        release.version,
        release.date,
        release.headline,
        release.summary,
        release.highlightBadge,
        ...release.sections.features.flatMap((i) => [i.title, i.description, i.tag ?? '']),
        ...release.sections.improvements.flatMap((i) => [i.title, i.description, i.tag ?? '']),
        ...release.sections.fixes.flatMap((i) => [i.title, i.description, i.tag ?? '']),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [releases, activeFilter, searchQuery])

  const filterOptions: Array<{
    id: FilterOption
    label: string
    icon: React.ComponentType<{ className?: string }>
    count?: number
  }> = [
    { id: 'all', label: t.changelog.filterAll, icon: Layers, count: releases.length },
    { id: 'major', label: t.changelog.filterMajor, icon: Sparkles },
    { id: 'minor', label: t.changelog.filterMinor, icon: SlidersHorizontal },
    { id: 'patch', label: t.changelog.filterPatch, icon: Bug },
  ]

  const getCategoryLabel = (category: ReleaseCategory): string => {
    if (category === 'major') return t.changelog.categoryMajor
    if (category === 'minor') return t.changelog.categoryMinor
    return t.changelog.categoryPatch
  }

  const handleCopyAnchor = async (release: ChangelogRelease) => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}${window.location.pathname}#${release.anchorId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(release.anchorId)
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === release.anchorId ? null : prev))
      }, 2000)
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  }

  const handleResetFilters = () => {
    setActiveFilter('all')
    setSearchQuery('')
  }

  const renderSectionGroup = (
    items: ChangelogItem[],
    variant: 'features' | 'improvements' | 'fixes'
  ) => {
    if (items.length === 0) return null

    const config = {
      features: {
        title: t.changelog.sectionFeatures,
        headerPillClass: 'bg-primary-fixed/40 text-on-primary-fixed',
        headerIcon: Sparkles,
        headerIconClass: 'text-primary',
        countBadgeClass: 'bg-primary text-on-primary',
        itemIconBgClass: 'bg-primary-fixed text-primary',
        itemTagClass: 'bg-primary-fixed/45 text-primary',
      },
      improvements: {
        title: t.changelog.sectionImprovements,
        headerPillClass: 'bg-surface-container-high text-on-surface',
        headerIcon: Zap,
        headerIconClass: 'text-secondary',
        countBadgeClass: 'bg-secondary text-on-secondary',
        itemIconBgClass: 'bg-surface-container text-secondary',
        itemTagClass: 'bg-surface-container-high text-on-surface-variant',
      },
      fixes: {
        title: t.changelog.sectionFixes,
        headerPillClass: 'bg-error-container text-on-error-container',
        headerIcon: Bug,
        headerIconClass: 'text-error',
        countBadgeClass: 'bg-error text-on-error',
        itemIconBgClass: 'bg-error-container text-error',
        itemTagClass: 'bg-error-container text-on-error-container',
      },
    }[variant]

    const HeaderIcon = config.headerIcon

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-headline-sm text-xs sm:text-sm font-semibold ${config.headerPillClass}`}
          >
            <HeaderIcon className={`w-4 h-4 shrink-0 ${config.headerIconClass}`} aria-hidden="true" />
            <span>{config.title}</span>
            <span
              className={`px-2 py-0.5 rounded-full font-code-label text-[11px] font-semibold ${config.countBadgeClass}`}
            >
              {t('changelog.itemsCount', { count: items.length })}
            </span>
          </h3>
        </div>

        <ul
          role="list"
          className={`grid grid-cols-1 ${items.length > 1 ? 'md:grid-cols-2' : ''} gap-3`}
        >
          {items.map((item) => {
            const ItemIcon = ITEM_ICON_MAP[item.icon] || Sparkles
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 p-3.5 sm:p-4 bg-surface-container-low/75 hover:bg-surface-container/80 border border-outline-variant/20 rounded-xl transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.itemIconBgClass}`}
                  aria-hidden="true"
                >
                  <ItemIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-headline-sm text-sm text-on-surface font-semibold leading-snug">
                      {item.title}
                    </h4>
                    {item.tag && (
                      <span
                        className={`shrink-0 font-code-label text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${config.itemTagClass}`}
                      >
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <p className="font-body-md text-xs sm:text-[13px] text-on-surface-variant leading-relaxed">
                    {renderInlineCode(item.description)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface antialiased">
      <Navbar currentLocale={locale} t={t} activeRoute="changelog" />

      <main className="flex-1 w-full">
        {/* Top Hero Header Section */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low/45 to-surface py-10 sm:py-14">
          <div className="absolute inset-0 pointer-events-none opacity-45" aria-hidden="true">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[340px] bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-12 right-12 w-64 h-64 bg-secondary-fixed/25 rounded-full blur-2xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Pill Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/35 text-primary font-code-label text-[11px] tracking-wider uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                {t.changelog.pillBadge}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-on-surface-variant font-code-label text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                {t.changelog.mv3Verified}
              </span>
            </div>

            {/* Title & Metric Counter Badges */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8">
              <div className="max-w-3xl space-y-2.5">
                <h1 className="font-display-hero text-3xl sm:text-5xl font-bold text-on-surface tracking-tight leading-tight">
                  {t.changelog.title}
                </h1>
                <p className="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
                  {t.changelog.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/25 shadow-sm text-left min-w-[152px]">
                  <div className="font-code-label text-[10px] text-on-surface-variant uppercase tracking-wider">
                    {t.changelog.metricBuildLabel}
                  </div>
                  <div className="font-headline-sm text-base sm:text-lg text-primary font-semibold flex items-center gap-1.5 mt-0.5">
                    <span>{LATEST_RELEASE_VERSION}</span>
                    <span className="text-secondary font-normal text-xs">
                      {t.changelog.metricBuildStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/25 shadow-sm text-left min-w-[152px]">
                  <div className="font-code-label text-[10px] text-on-surface-variant uppercase tracking-wider">
                    {t.changelog.metricEngineLabel}
                  </div>
                  <div className="font-headline-sm text-base sm:text-lg text-on-surface font-semibold flex items-center gap-1.5 mt-0.5">
                    <span>{t.changelog.metricEngineValue}</span>
                    <Zap className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Controls & Search Bar Toolbar */}
            <div className="w-full bg-surface-container-lowest rounded-2xl p-2.5 sm:p-3 border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div
                role="group"
                aria-label={t.changelog.filtersAriaLabel}
                className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5"
              >
                {filterOptions.map((option) => {
                  const Icon = option.icon
                  const isActive = activeFilter === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveFilter(option.id)}
                      className={`min-h-[38px] px-3.5 py-2 rounded-xl font-headline-sm text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 ${
                        isActive
                          ? 'text-on-primary-container bg-primary-container font-semibold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-medium'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{option.label}</span>
                      {option.count !== undefined && (
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded-full font-code-label ${
                            isActive
                              ? 'bg-surface/20 text-on-primary-container'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {option.count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Search Input & Telegram Channel Link */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <label htmlFor={searchInputId} className="sr-only">
                    {t.changelog.searchLabel}
                  </label>
                  <Search
                    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id={searchInputId}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.changelog.searchPlaceholder}
                    className="w-full min-h-[38px] pl-9 pr-8 py-2 bg-surface-container-low text-on-surface placeholder-outline font-body-md text-xs sm:text-sm rounded-xl border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label={t.changelog.clearSearch}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <a
                  href={TELEGRAM_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 min-h-[38px] px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-body-md text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <Bell className="w-4 h-4 text-secondary shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{t.changelog.telegramUpdates}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-70 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Live Region for Screen Readers when Filtering */}
        <p className="sr-only" aria-live="polite">
          {t('changelog.resultsAnnouncement', { count: filteredReleases.length })}
        </p>

        {/* Main Body: Sticky Sidebar + Timeline Feed */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Sticky Version Index */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-28 bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/25 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-headline-sm text-sm text-on-surface font-semibold flex items-center gap-1.5">
                    <History className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                    <span>{t.changelog.sidebarTitle}</span>
                  </h2>
                  <span className="font-code-label text-[10px] text-outline uppercase tracking-wider">
                    {t('changelog.releasesCount', { count: releases.length })}
                  </span>
                </div>

                <nav aria-label={t.changelog.sidebarNavLabel} className="space-y-1">
                  {releases.map((release) => {
                    const isSelected = activeAnchor === release.anchorId
                    return (
                      <a
                        key={release.anchorId}
                        href={`#${release.anchorId}`}
                        onClick={() => setActiveAnchor(release.anchorId)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                          isSelected
                            ? 'bg-primary-fixed/35 text-primary font-semibold'
                            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-medium'
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isSelected
                                ? 'bg-primary'
                                : 'bg-outline-variant group-hover:bg-primary'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {release.tag}
                            {release.isLatest ? ` (${t.changelog.latestBadge})` : ''}
                          </span>
                        </span>
                        <span
                          className={`font-code-label text-[10px] shrink-0 ${
                            isSelected ? 'text-primary' : 'text-outline'
                          }`}
                        >
                          {release.shortDate}
                        </span>
                      </a>
                    )
                  })}
                </nav>

                {/* Local Sandboxing Mini Card */}
                <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/20 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-code-label text-[10px] font-semibold uppercase text-secondary flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary shrink-0" aria-hidden="true" />
                      {t.changelog.sandboxTitle}
                    </span>
                    <span className="font-code-label text-[10px] text-outline font-semibold">
                      {t.changelog.sandboxStatus}
                    </span>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                    {t.changelog.sandboxDesc}
                  </p>
                </div>
              </div>
            </aside>

            {/* Right Column: Release Timeline Feed */}
            <div className="lg:col-span-9 space-y-8">
              {filteredReleases.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-3xl p-10 border border-outline-variant/30 text-center space-y-3 shadow-sm">
                  <div
                    className="w-12 h-12 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-outline"
                    aria-hidden="true"
                  >
                    <Search className="w-6 h-6" />
                  </div>
                  <h2 className="font-headline-md text-lg font-semibold text-on-surface">
                    {t.changelog.emptyTitle}
                  </h2>
                  <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                    {t.changelog.emptyDesc}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                    >
                      {t.changelog.resetFilters}
                    </button>
                  </div>
                </div>
              ) : (
                filteredReleases.map((release) => {
                  const isHighlighted = highlightedAnchor === release.anchorId
                  const isCopied = copiedId === release.anchorId

                  return (
                    <article
                      key={release.anchorId}
                      id={release.anchorId}
                      className={`relative bg-surface-container-lowest rounded-3xl p-5 sm:p-7 md:p-8 border shadow-sm transition-all scroll-mt-24 ${
                        isHighlighted
                          ? 'border-primary/50 ring-2 ring-primary/15'
                          : 'border-outline-variant/25'
                      }`}
                    >
                      {/* Release Header Meta */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-outline-variant/20">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                          <h2 className="px-3.5 py-1 rounded-full bg-primary-container text-on-primary-container font-code-label text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 shadow-xs">
                            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>{release.tag}</span>
                          </h2>

                          {release.isLatest && (
                            <span className="px-2.5 py-1 rounded-full bg-primary-fixed/50 text-on-primary-fixed font-code-label text-[11px] font-semibold uppercase tracking-wider">
                              {t.changelog.latestBadge}
                            </span>
                          )}

                          <span className="px-2.5 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container font-code-label text-[11px] font-semibold uppercase tracking-wider">
                            {getCategoryLabel(release.category)}
                          </span>

                          <time
                            dateTime={release.date}
                            className="font-code-label text-xs text-on-surface-variant"
                          >
                            {t('changelog.releasedPrefix', { date: release.date })}
                          </time>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyAnchor(release)}
                            aria-label={t('changelog.copyLinkLabel', { version: release.tag })}
                            className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-code-label text-outline hover:text-on-surface hover:bg-surface-container inline-flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-4 h-4 text-primary" aria-hidden="true" />
                                <span className="text-primary font-semibold">
                                  {t.changelog.copiedLink}
                                </span>
                              </>
                            ) : (
                              <Link2 className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Release Summary Banner */}
                      <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary-fixed/25 via-surface-container-low to-secondary-fixed/25 border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-headline-sm text-base sm:text-lg font-semibold text-on-surface">
                            {release.headline}
                          </h3>
                          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                            {release.summary}
                          </p>
                        </div>
                        <div className="shrink-0 inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/25 shadow-xs self-start sm:self-center">
                          <Sparkles className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                          <span className="font-code-label text-xs font-bold text-on-surface whitespace-nowrap">
                            {release.highlightBadge}
                          </span>
                        </div>
                      </div>

                      {/* Categorized Feature Breakdown */}
                      <div className="space-y-6">
                        {renderSectionGroup(release.sections.features, 'features')}
                        {renderSectionGroup(release.sections.improvements, 'improvements')}
                        {renderSectionGroup(release.sections.fixes, 'fixes')}
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner Card */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-16 w-full">
          <div className="relative overflow-hidden rounded-3xl bg-inverse-surface text-inverse-on-surface p-6 sm:p-10 shadow-xl">
            <div
              className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/25 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-primary-fixed animate-pulse"
                    aria-hidden="true"
                  />
                  <span className="font-code-label text-xs uppercase tracking-wider text-primary-fixed font-semibold">
                    {t.changelog.ctaBadge}
                  </span>
                </div>
                <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-inverse-on-surface tracking-tight">
                  {t.changelog.ctaTitle}
                </h2>
                <p className="font-body-md text-sm sm:text-base text-surface-variant/85 max-w-xl leading-relaxed">
                  {t.changelog.ctaDesc}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <a
                  href={CHROME_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm font-semibold px-6 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed focus-visible:ring-offset-2 focus-visible:ring-offset-inverse-surface"
                >
                  <span>{t.changelog.ctaPrimary}</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>
                <a
                  href={TELEGRAM_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] bg-white/10 hover:bg-white/15 border border-white/15 text-inverse-on-surface font-body-md text-sm font-medium px-5 py-3 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed focus-visible:ring-offset-2 focus-visible:ring-offset-inverse-surface"
                >
                  <span>{t.changelog.ctaSecondary}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer t={t} />
    </div>
  )
}
