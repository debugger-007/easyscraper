import React, { useState } from 'react'
import type { TranslationSchema } from '../locales/types'
import { useTranslate } from '../locales'
import { CHROME_STORE_URL } from '../config/extension'
import {
  Check,
  Copy,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Database,
  HardDrive,
  Zap,
  Lock,
  Crosshair,
  PlayCircle,
  Wrench,
  Ruler,
  Cog,
  Code,
  RefreshCw,
  List,
} from 'lucide-react'

interface HeroSectionProps {
  t?: TranslationSchema
}

export const HeroSection: React.FC<HeroSectionProps> = ({ t: propT }) => {
  const { t: hookT } = useTranslate()
  const t = propT || hookT
  const [activeTab, setActiveTab] = useState<'table' | 'json'>('table')
  const [selectedItemIdx, setSelectedItemIdx] = useState<number>(0)
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(t.hero.simulator.items, null, 2)
    navigator.clipboard.writeText(jsonStr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const metricIcons = [
    <Zap key="1" className="w-4 h-4 sm:w-5 sm:h-5 text-on-secondary-container sm:text-primary shrink-0" />,
    <HardDrive key="2" className="w-4 h-4 sm:w-5 sm:h-5 text-on-secondary-container sm:text-primary shrink-0" />,
    <Database key="3" className="w-4 h-4 sm:w-5 sm:h-5 text-on-secondary-container sm:text-primary shrink-0" />,
    <ShieldCheck key="4" className="w-4 h-4 sm:w-5 sm:h-5 text-on-secondary-container sm:text-primary shrink-0" />,
  ]

  const cardIcons = [
    <Wrench key="1" className="w-6 h-6 md:w-10 md:h-10 text-primary md:text-outline-variant" />,
    <Ruler key="2" className="w-6 h-6 md:w-10 md:h-10 text-primary md:text-outline-variant" />,
    <Cog key="3" className="w-6 h-6 md:w-10 md:h-10 text-primary md:text-outline-variant" />,
  ]

  const selectedItem = t.hero.simulator.items[selectedItemIdx] || t.hero.simulator.items[0]

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden pt-5 sm:pt-14 pb-12 sm:pb-24 scroll-mt-20"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:items-center sm:text-center">
        {/* Top Architecture Monospace Pill */}
        <div className="self-center inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-secondary-container sm:bg-surface-container-low border border-secondary/20 sm:border-outline-variant/35 shadow-sm mb-4 sm:mb-6 max-w-full">
          <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse shrink-0" />
          <span className="font-code-label text-[10px] sm:text-xs text-on-secondary-container sm:text-primary uppercase tracking-wider font-semibold truncate">
            {t.hero.pillBadge}
          </span>
        </div>

        {/* Mobile Secondary Badge */}
        <div className="sm:hidden inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-label text-[10px] font-medium mb-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{t.nav.versionBadge}</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display-hero text-[26px] leading-[1.25] sm:text-5xl lg:text-[52px] font-bold tracking-tight text-on-surface max-w-4xl sm:leading-[1.15] text-left sm:text-center">
          <span>{t.hero.titleLead} </span>
          <span className="bg-gradient-to-r from-primary via-secondary to-primary-container bg-clip-text text-transparent">
            {t.hero.titleHighlight}
          </span>
          {t.hero.titleTail && <span> {t.hero.titleTail}</span>}
        </h1>

        {/* Supporting Body Copy */}
        <p className="font-body-md sm:font-body-lg text-sm sm:text-lg text-on-surface-variant max-w-2xl mt-3 sm:mt-5 mb-6 sm:mb-8 leading-relaxed text-left sm:text-center">
          {t.hero.description}
        </p>

        {/* Primary Action Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto mb-6 sm:mb-10">
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-full bg-primary text-on-primary font-semibold text-sm sm:text-base hover:bg-primary-container shadow-[0_8px_24px_rgba(0,105,72,0.24)] transition-all transform sm:hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" fill="#ffffff" fillOpacity="0.2" r="10" />
              <path d="M12 2C6.48 2 2 6.48 2 12C2 12.68 2.07 13.34 2.2 13.98L7.87 4.15C9.07 2.82 10.47 2 12 2Z" fill="#EA4335" />
              <path d="M12 2C17.52 2 22 6.48 22 12C22 12.68 21.93 13.34 21.8 13.98L12 13.98L8.76 8.37L12 2Z" fill="#4285F4" />
              <path d="M2.2 13.98C3.12 18.66 7.24 22 12 22C15.86 22 19.23 19.82 20.91 16.63L15.3 16.63L12 12L2.2 13.98Z" fill="#34A853" />
              <circle cx="12" cy="12" fill="#FBBC05" r="4" />
              <circle cx="12" cy="12" fill="#ffffff" r="2.2" />
            </svg>
            <span>{t.hero.ctaInstall}</span>
          </a>

          <a
            href="#sandbox"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-full bg-surface-container-lowest text-on-surface border border-outline-variant/45 font-semibold text-sm shadow-sm hover:bg-surface-container-low hover:border-primary/40 active:bg-surface-container transition-all"
          >
            <PlayCircle className="w-4 h-4 text-primary hidden sm:inline-block" />
            <span>{t.hero.ctaSandbox}</span>
            <ArrowRight className="w-4 h-4 text-primary sm:text-on-surface-variant" />
          </a>
        </div>

        {/* Trust Metrics Monospace Ticker (2x2 compact on 360px, 4-col on md+) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-4xl w-full mb-8 sm:mb-12 text-left">
          {t.hero.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/30 shadow-sm flex items-center gap-2 sm:gap-3 hover:border-primary/35 transition-colors"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg bg-secondary-container sm:bg-primary/10 flex items-center justify-center shrink-0">
                {metricIcons[idx % metricIcons.length]}
              </div>
              <div className="min-w-0">
                <div className="font-code-label text-[11px] sm:text-sm font-bold text-on-surface truncate">
                  {m.value}
                </div>
                <div className="font-code-label text-[10px] text-on-surface-variant truncate">
                  {m.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* High-Fidelity App Shell / Inspector HUD Mockup */}
        <div className="w-full max-w-5xl rounded-xl sm:rounded-2xl bg-surface-container-lowest border border-outline-variant/35 shadow-[0_12px_36px_rgba(19,27,46,0.08)] sm:shadow-[0_20px_50px_rgba(19,27,46,0.08)] overflow-hidden text-left">
          {/* Mockup Browser Header Window Bar */}
          <div className="bg-surface-container-high md:bg-surface-container-low px-3 sm:px-4 py-2 sm:py-3 border-b border-outline-variant/25 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-error/80 inline-block" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-secondary sm:bg-secondary-fixed inline-block sm:border sm:border-secondary/20" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary sm:bg-primary-fixed inline-block sm:border sm:border-primary/20" />
            </div>
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full sm:rounded-md bg-surface-container-lowest border border-outline-variant/25 shadow-sm font-code-label text-[10px] sm:text-[11px] text-on-surface-variant truncate max-w-[210px] sm:max-w-md">
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary shrink-0" />
              <span className="truncate">{t.hero.simulator.urlBar}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-code-label text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {t.hero.simulator.windowTitle}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-code-label text-[10px] font-semibold">
                {t.hero.simulator.statusBadge}
              </span>
            </div>
            <div className="w-2 md:hidden" />
          </div>

          {/* ================= MOBILE-OPTIMIZED INSPECTOR VIEW (< md) ================= */}
          <div className="md:hidden">
            {/* Green Active Status Bar */}
            <div className="bg-primary text-on-primary px-3 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span className="font-code-label text-[10px] font-semibold truncate">
                  {t.hero.simulator.statusBadge}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-code-label text-[9px] font-bold shrink-0">
                {t.hero.simulator.streamCount}
              </span>
            </div>

            {/* Target Container + Selected Card + Siblings */}
            <div className="p-3 flex flex-col gap-2.5 bg-surface-container-low">
              <div className="flex items-center justify-between gap-2">
                <span className="font-code-label text-[10px] text-on-surface-variant shrink-0">
                  Target:
                </span>
                <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-code-label text-[10px] font-bold truncate">
                  div.catalog-grid &gt; .product-card
                </span>
              </div>

              {/* Active Selected Card */}
              <div className="p-3 rounded-lg bg-surface-container-lowest shadow-sm border border-primary/30 relative">
                <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded bg-primary text-on-primary font-code-label text-[9px] uppercase font-bold">
                  #{selectedItemIdx + 1} / {t.hero.simulator.items.length}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    {cardIcons[selectedItemIdx % cardIcons.length]}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-headline-sm text-[13px] font-bold text-on-surface truncate">
                      {selectedItem.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-code-label text-[11px] text-primary font-bold">
                        {selectedItem.price}
                      </span>
                      <span
                        className={`font-code-label text-[10px] font-medium truncate ${
                          selectedItem.stockType === 'in' ? 'text-secondary' : 'text-error'
                        }`}
                      >
                        {selectedItem.stock}
                      </span>
                    </div>
                    <span className="font-code-label text-[9px] text-outline truncate mt-0.5">
                      {selectedItem.selector}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sibling Quick Rows */}
              <div className="flex flex-col gap-1">
                {t.hero.simulator.items.map((item, idx) => {
                  if (idx === selectedItemIdx) return null
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedItemIdx(idx)}
                      className="w-full p-2 rounded-lg bg-surface-container-lowest text-[11px] text-on-surface-variant flex justify-between items-center gap-2 text-left active:bg-surface-container transition-colors cursor-pointer"
                    >
                      <span className="truncate">{item.title}</span>
                      <span className="font-code-label font-semibold text-primary shrink-0">
                        {item.price}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mobile Stacked Extraction Buffer */}
            <div className="p-3 flex flex-col gap-2.5 bg-surface-container-lowest">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <List className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span className="font-headline-sm text-xs font-bold text-on-surface truncate">
                    {t.hero.simulator.tableTab}
                  </span>
                </div>
                <span className="font-code-label text-[10px] text-outline shrink-0">
                  {t.hero.simulator.streamStats}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {t.hero.simulator.items.map((row, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedItemIdx(idx)}
                    className={`p-2 rounded-lg flex flex-col gap-1 transition-colors cursor-pointer ${
                      selectedItemIdx === idx
                        ? 'bg-primary-fixed/25 border border-primary/25'
                        : 'bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-on-surface truncate">
                        #0{idx + 1} {row.title}
                      </span>
                      <span className="font-code-label text-[11px] text-primary font-bold shrink-0">
                        {row.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span
                        className={`font-medium ${
                          row.stockType === 'in' ? 'text-secondary' : 'text-error'
                        }`}
                      >
                        {row.stock}
                      </span>
                      <span className="font-code-label text-outline truncate">
                        {row.selector}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile 3-Column Export Action Row */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => alert(`${t.hero.simulator.exportXlsx} (SheetJS in-memory compiled)`)}
                  className="py-2 px-2 rounded-lg bg-surface-container-high text-on-surface font-code-label text-[10px] font-semibold flex items-center justify-center gap-1 active:bg-surface-container cursor-pointer"
                >
                  <FileSpreadsheet className="w-3 h-3 text-primary shrink-0" />
                  <span className="truncate">.xlsx</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`${t.hero.simulator.exportCsv} (Compiled)`)}
                  className="py-2 px-2 rounded-lg bg-surface-container-high text-on-surface font-code-label text-[10px] font-semibold flex items-center justify-center gap-1 active:bg-surface-container cursor-pointer"
                >
                  <FileSpreadsheet className="w-3 h-3 text-secondary shrink-0" />
                  <span className="truncate">.csv</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="py-2 px-2 rounded-lg bg-surface-container-high text-on-surface font-code-label text-[10px] font-semibold flex items-center justify-center gap-1 active:bg-surface-container cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-primary shrink-0" />
                  ) : (
                    <Code className="w-3 h-3 text-primary shrink-0" />
                  )}
                  <span className="truncate">{copied ? t.hero.simulator.copied : 'JSON'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= DESKTOP INSPECTOR VIEW (md+) ================= */}
          <div className="hidden md:block p-6 bg-surface space-y-5">
            {/* Selection Status Bar */}
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/25 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Crosshair className="w-4 h-4" />
                </span>
                <div className="text-xs font-code-label truncate">
                  <span className="text-on-surface-variant uppercase">Target: </span>
                  <span className="text-primary font-bold">
                    div.catalog-grid &gt; .product-card
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-code-label text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-secondary-container text-on-secondary-container font-semibold">
                  {t.hero.simulator.streamStats}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed font-semibold">
                  {t.hero.simulator.streamCount}
                </span>
              </div>
            </div>

            {/* Catalog Card Grid */}
            <div className="grid grid-cols-3 gap-4">
              {t.hero.simulator.items.map((item, idx) => {
                const isSelected = selectedItemIdx === idx
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedItemIdx(idx)}
                    className={`cursor-pointer p-4 rounded-xl bg-surface-container-lowest transition-all relative overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-primary shadow-md'
                        : 'border border-outline-variant/30 shadow-sm hover:border-primary/40'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-primary text-on-primary font-code-label text-[10px] font-bold">
                        #{idx + 1} / {t.hero.simulator.items.length}
                      </div>
                    )}
                    <div className="h-24 rounded-lg bg-surface-container-low mb-3 flex items-center justify-center">
                      {cardIcons[idx % cardIcons.length]}
                    </div>
                    <p className="font-headline-sm text-sm font-semibold text-on-surface truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-code-label text-sm font-bold text-primary">
                        {item.price}
                      </span>
                      <span
                        className={`text-[10px] font-code-label px-2 py-0.5 rounded font-medium ${
                          item.stockType === 'in'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-tertiary-fixed text-on-tertiary-fixed'
                        }`}
                      >
                        {item.stock}
                      </span>
                    </div>
                    <div className="font-code-label text-[10px] text-on-surface-variant mt-2 truncate">
                      <code>{item.selector}</code>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Structured In-Memory Data Table Preview */}
            <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/25 shadow-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-surface-container">
                <div className="bg-surface-container-low rounded-lg p-0.5 flex border border-outline-variant/25 text-xs font-code-label">
                  <button
                    type="button"
                    onClick={() => setActiveTab('table')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'table'
                        ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {t.hero.simulator.tableTab}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('json')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'json'
                        ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {t.hero.simulator.jsonTab}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`${t.hero.simulator.exportXlsx} (SheetJS in-memory compiled)`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-on-primary font-code-label text-[11px] font-semibold shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{t.hero.simulator.exportXlsx}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`${t.hero.simulator.exportCsv} (Compiled)`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container-low text-on-surface font-code-label text-[11px] font-semibold hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-secondary" />
                    <span>{t.hero.simulator.exportCsv}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container-low text-on-surface font-code-label text-[11px] font-semibold hover:bg-surface-container transition-colors cursor-pointer"
                    title={t.hero.simulator.copyJson}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Code className="w-3.5 h-3.5 text-on-surface-variant" />
                    )}
                    <span>{copied ? t.hero.simulator.copied : t.hero.simulator.copyJson}</span>
                  </button>
                </div>
              </div>

              {activeTab === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-on-surface-variant font-code-label text-[11px] uppercase bg-surface-container-low/60">
                        <th className="py-2.5 px-3 rounded-l-md">#</th>
                        <th className="py-2.5 px-3">{t.hero.simulator.columns.item}</th>
                        <th className="py-2.5 px-3">{t.hero.simulator.columns.price}</th>
                        <th className="py-2.5 px-3">{t.hero.simulator.columns.stock}</th>
                        <th className="py-2.5 px-3 rounded-r-md">{t.hero.simulator.columns.selector}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                      {t.hero.simulator.items.map((row, idx) => (
                        <tr
                          key={idx}
                          onClick={() => setSelectedItemIdx(idx)}
                          className={`cursor-pointer hover:bg-primary-fixed/20 transition-colors ${
                            selectedItemIdx === idx ? 'bg-primary-fixed/15' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-code-label text-on-surface-variant">
                            0{idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-on-surface truncate max-w-xs">
                            {row.title}
                          </td>
                          <td className="py-2.5 px-3 font-code-label text-primary font-bold">
                            {row.price}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-code-label text-[10px] font-medium ${
                                row.stockType === 'in'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-tertiary-fixed text-on-tertiary-fixed'
                              }`}
                            >
                              {row.stock}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-code-label text-[11px] text-on-surface-variant truncate">
                            {row.selector}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="relative p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/25 text-[11px] font-code-label text-on-surface overflow-x-auto">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    title={t.hero.simulator.copyJson}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="font-code-label leading-relaxed">
                    {JSON.stringify(t.hero.simulator.items, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
