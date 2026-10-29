import React, { useState } from 'react'
import type { TranslationSchema } from '../locales/types'
import { Sparkles, Terminal, Check, Copy, FileSpreadsheet, ArrowRight, ShieldCheck, Database, HardDrive, Star } from 'lucide-react'

interface HeroSectionProps {
  t: TranslationSchema
}

export const HeroSection: React.FC<HeroSectionProps> = ({ t }) => {
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
    <Database key="1" className="w-5 h-5 text-primary" />,
    <Star key="2" className="w-5 h-5 text-tertiary fill-tertiary" />,
    <ShieldCheck key="3" className="w-5 h-5 text-secondary" />,
    <HardDrive key="4" className="w-5 h-5 text-primary" />,
  ]

  return (
    <section id="hero" className="relative pt-12 pb-20 px-4 sm:px-8 max-w-[1440px] mx-auto overflow-hidden">
      {/* Background Top Halo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        {/* Security Compliance Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/70 border border-secondary/30 backdrop-blur-md shadow-[0_0_15px_rgba(76,215,246,0.15)] animate-pulse-slow">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
          <span className="font-code-label text-xs tracking-wider text-secondary uppercase font-semibold">
            {t.hero.pillBadge}
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display-lg text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface leading-[1.15]">
          <span>{t.hero.titleLead} </span>
          <span className="bg-gradient-to-r from-primary via-secondary to-secondary-container bg-clip-text text-transparent">
            {t.hero.titleHighlight}
          </span>
          {t.hero.titleTail && <span> {t.hero.titleTail}</span>}
        </h1>

        {/* Subtitle / Description */}
        <p className="font-body-base text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          {t.hero.description}
        </p>

        {/* CTA Cluster */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:brightness-110 active:scale-95 text-surface-container-lowest font-headline-md font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(99,102,241,0.35)]"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" fill="#07006c" fillOpacity="0.15" r="10" />
              <path d="M12 2C6.48 2 2 6.48 2 12C2 12.68 2.07 13.34 2.2 13.98L7.87 4.15C9.07 2.82 10.47 2 12 2Z" fill="#EA4335" />
              <path d="M12 2C17.52 2 22 6.48 22 12C22 12.68 21.93 13.34 21.8 13.98L12 13.98L8.76 8.37L12 2Z" fill="#4285F4" />
              <path d="M2.2 13.98C3.12 18.66 7.24 22 12 22C15.86 22 19.23 19.82 20.91 16.63L15.3 16.63L12 12L2.2 13.98Z" fill="#34A853" />
              <circle cx="12" cy="12" fill="#FBBC05" r="4" />
            </svg>
            <span>{t.hero.ctaInstall}</span>
          </a>

          <a
            href="#sandbox"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container/60 hover:bg-surface-container-high border border-outline-variant/40 hover:border-secondary/40 text-on-surface font-headline-md font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Terminal className="w-4 h-4 text-secondary" />
            <span>{t.hero.ctaSandbox}</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full pt-8">
          {t.hero.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/30 backdrop-blur-sm text-left flex flex-col justify-between hover:border-secondary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-code-label text-xl sm:text-2xl font-bold text-on-surface">
                  {m.value}
                </span>
                {metricIcons[idx % metricIcons.length]}
              </div>
              <div>
                <p className="text-xs font-headline-md font-semibold text-secondary">
                  {m.label}
                </p>
                <p className="text-[11px] text-on-surface-variant font-body-sm mt-0.5">
                  {m.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Visual Mockup: Scraper Studio Simulator */}
      <div className="mt-14 w-full max-w-5xl mx-auto">
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Window Header Bar */}
          <div className="px-4 py-3 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between gap-4">
            {/* Window Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-3 h-3 rounded-full bg-error/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-tertiary/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 hidden sm:inline-block font-code-label text-xs text-on-surface-variant">
                {t.hero.simulator.windowTitle}
              </span>
            </div>

            {/* URL Bar */}
            <div className="flex-1 max-w-md mx-auto bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3 py-1 flex items-center gap-2 text-xs font-code-label text-secondary truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
              <span className="truncate">{t.hero.simulator.urlBar}</span>
            </div>

            {/* Status Badge */}
            <div className="shrink-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary/15 text-secondary text-[11px] font-code-label border border-secondary/30">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                {t.hero.simulator.statusBadge}
              </span>
            </div>
          </div>

          {/* Window Body */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Interactive Target Simulation Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-code-label text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Target DOM Container:</span>
                  <code className="text-secondary font-mono">div.catalog-grid</code>
                </span>
                <span className="text-tertiary font-mono">
                  Active Selector: {t.hero.simulator.items[selectedItemIdx]?.selector}
                </span>
              </div>

              {/* Product Card Selector Simulation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {t.hero.simulator.items.map((item, idx) => {
                  const isSelected = selectedItemIdx === idx
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedItemIdx(idx)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative group ${
                        isSelected
                          ? 'border-dashed border-2 border-primary bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'border-outline-variant/30 bg-surface-container/50 hover:border-outline-variant/70'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded bg-primary text-on-primary font-code-label text-[10px] uppercase font-bold tracking-wider">
                          SELECTED (1 of 3)
                        </span>
                      )}
                      <p className="font-headline-md text-xs font-semibold text-on-surface truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-code-label text-sm font-bold text-secondary">
                          {item.price}
                        </span>
                        <span
                          className={`text-[10px] font-code-label px-2 py-0.5 rounded border ${
                            item.stockType === 'in'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-tertiary/10 text-tertiary border-tertiary/30'
                          }`}
                        >
                          {item.stock}
                        </span>
                      </div>
                      <div className="mt-2 text-[10px] font-code-label text-on-surface-variant truncate">
                        <code>{item.selector}</code>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Panel: Stream Stats & Data Preview Tabs */}
            <div className="pt-4 border-t border-outline-variant/30 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Stream Stats Pill */}
                <div className="flex items-center gap-3 text-xs font-code-label">
                  <span className="inline-flex items-center gap-1.5 text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    {t.hero.simulator.streamStats}
                  </span>
                  <span className="text-outline">|</span>
                  <span className="inline-flex items-center gap-1.5 text-tertiary">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    {t.hero.simulator.streamCount}
                  </span>
                </div>

                {/* Tabs & Export Buttons */}
                <div className="flex items-center gap-2">
                  <div className="bg-surface-container rounded-lg p-0.5 flex border border-outline-variant/30 text-xs font-code-label">
                    <button
                      type="button"
                      onClick={() => setActiveTab('table')}
                      className={`px-3 py-1 rounded transition-colors ${
                        activeTab === 'table'
                          ? 'bg-primary-container text-on-primary-container font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {t.hero.simulator.tableTab}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('json')}
                      className={`px-3 py-1 rounded transition-colors ${
                        activeTab === 'json'
                          ? 'bg-primary-container text-on-primary-container font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {t.hero.simulator.jsonTab}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-secondary text-xs flex items-center gap-1.5 transition-colors"
                    title={t.hero.simulator.copyJson}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline font-code-label text-[11px]">
                      {copied ? t.hero.simulator.copied : t.hero.simulator.copyJson}
                    </span>
                  </button>
                </div>
              </div>

              {/* Tab Content Display */}
              {activeTab === 'table' ? (
                <div className="overflow-x-auto rounded-lg border border-outline-variant/20 bg-surface-container-lowest/60">
                  <table className="w-full text-left text-xs font-code-label">
                    <thead className="bg-surface-container/60 border-b border-outline-variant/20 text-on-surface-variant">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">{t.hero.simulator.columns.item}</th>
                        <th className="py-2.5 px-3 font-semibold">{t.hero.simulator.columns.price}</th>
                        <th className="py-2.5 px-3 font-semibold">{t.hero.simulator.columns.stock}</th>
                        <th className="py-2.5 px-3 font-semibold">{t.hero.simulator.columns.selector}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                      {t.hero.simulator.items.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-surface-container/40 transition-colors ${
                            selectedItemIdx === idx ? 'bg-primary/10' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-medium truncate max-w-xs">{row.title}</td>
                          <td className="py-2 px-3 text-secondary font-bold">{row.price}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                row.stockType === 'in'
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : 'text-tertiary bg-tertiary/10'
                              }`}
                            >
                              {row.stock}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-on-surface-variant font-mono text-[11px] truncate">
                            {row.selector}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/20 text-[11px] font-code-label text-secondary overflow-x-auto">
                  <pre className="font-mono">
                    {JSON.stringify(t.hero.simulator.items, null, 2)}
                  </pre>
                </div>
              )}

              {/* Quick Export Actions */}
              <div className="flex items-center justify-end gap-2 pt-1 text-[11px] font-code-label">
                <button
                  type="button"
                  onClick={() => alert(`${t.hero.simulator.exportXlsx} (SheetJS in-memory compiled)`)}
                  className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.hero.simulator.exportXlsx}</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`${t.hero.simulator.exportCsv} (Compiled)`)}
                  className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-secondary" />
                  <span>{t.hero.simulator.exportCsv}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
