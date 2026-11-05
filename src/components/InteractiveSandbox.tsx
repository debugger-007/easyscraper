import React, { useState } from 'react'
import type { TranslationSchema } from '../locales/types'
import { useTranslate } from '../locales'
import { ShoppingBag, Radio, Code2, Play, Download, Check, Sparkles, Loader2, Copy } from 'lucide-react'

interface InteractiveSandboxProps {
  t?: TranslationSchema
}

export const InteractiveSandbox: React.FC<InteractiveSandboxProps> = ({ t: propT }) => {
  const { t: hookT } = useTranslate()
  const t = propT || hookT
  // Demo A states
  const [extractingA, setExtractingA] = useState(false)
  const [extractedA, setExtractedA] = useState(false)
  const [copiedA, setCopiedA] = useState(false)

  // Demo B states
  const [sniffingB, setSniffingB] = useState(false)
  const [downloadingB, setDownloadingB] = useState(false)
  const [downloadSuccessB, setDownloadSuccessB] = useState(false)

  // Demo C states
  const [selectorInput, setSelectorInput] = useState(t.sandbox.demoC.defaultSelector)

  // Demo A Handler
  const handleExtractA = () => {
    setExtractingA(true)
    setTimeout(() => {
      setExtractingA(false)
      setExtractedA(true)
    }, 900)
  }

  const handleCopyJsonA = () => {
    navigator.clipboard.writeText(JSON.stringify(t.sandbox.demoA.items, null, 2))
    setCopiedA(true)
    setTimeout(() => setCopiedA(false), 2000)
  }

  // Demo B Handler
  const handleSniffB = () => {
    setSniffingB(true)
    setTimeout(() => {
      setSniffingB(false)
    }, 600)
  }

  const handleDownloadB = () => {
    setDownloadingB(true)
    setTimeout(() => {
      setDownloadingB(false)
      setDownloadSuccessB(true)
      setTimeout(() => setDownloadSuccessB(false), 3000)
    }, 1200)
  }

  // Demo C match calculation
  const getMatchCount = (sel: string) => {
    const s = sel.trim()
    if (!s) return '0 Elements'
    if (s.includes('price')) return '3 Elements (100% Confidence)'
    if (s.includes('product') || s.includes('card')) return '3 Containers Found'
    if (s.includes('title') || s.includes('h3')) return '3 Headers Found'
    return '1 Custom DOM Node Found'
  }

  return (
    <section id="sandbox" className="py-20 px-4 sm:px-8 max-w-[1440px] mx-auto scroll-mt-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-code-label text-xs uppercase font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.sandbox.pillBadge}</span>
        </div>
        <h2 className="font-display-lg text-2xl sm:text-4xl font-bold text-on-surface">
          {t.sandbox.title}
        </h2>
        <p className="font-body-base text-sm sm:text-base text-on-surface-variant leading-relaxed">
          {t.sandbox.description}
        </p>
      </div>

      {/* 3 Interactive Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {/* Card 1: Demo A Product Catalog (DOM Mode) */}
        <div className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 backdrop-blur-xl flex flex-col justify-between hover:border-secondary/40 transition-all shadow-xl">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-secondary/15 text-secondary">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="font-headline-md text-sm font-bold text-on-surface">
                  {t.sandbox.demoA.title}
                </span>
              </div>
              <span className="text-[10px] font-code-label bg-secondary/15 text-secondary px-2 py-0.5 rounded border border-secondary/30 font-semibold">
                {t.sandbox.demoA.mode}
              </span>
            </div>

            <p className="text-xs text-on-surface-variant font-body-sm">
              {t.sandbox.demoA.description}
            </p>

            {/* Simulated Catalog List */}
            <div className="space-y-2">
              {t.sandbox.demoA.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-surface-container/60 border border-outline-variant/20 text-xs flex justify-between items-center hover:border-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-secondary/50 shrink-0" />
                    <span className="text-on-surface font-medium truncate max-w-[150px]">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-code-label font-bold text-secondary">
                      {item.price}
                    </span>
                    <span className="text-[10px] font-code-label px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant/20">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Extracted Success Pill */}
            {extractedA && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-code-label text-emerald-400 flex items-center justify-between animate-fade-in">
                <span>{t.sandbox.demoA.summary}</span>
                <button
                  type="button"
                  onClick={handleCopyJsonA}
                  className="flex items-center gap-1 hover:underline text-[11px]"
                >
                  {copiedA ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedA ? 'Copied' : 'JSON'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              type="button"
              disabled={extractingA}
              onClick={handleExtractA}
              className="w-full py-2.5 px-4 rounded-xl bg-primary-container hover:brightness-110 active:scale-95 text-on-primary-container font-headline-md font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {extractingA ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.sandbox.demoA.extractingBtn}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.sandbox.demoA.extractBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Demo B Media Stream Sniffer (Network Mode) */}
        <div className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 backdrop-blur-xl flex flex-col justify-between hover:border-tertiary/40 transition-all shadow-xl">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-tertiary/15 text-tertiary">
                  <Radio className="w-4 h-4" />
                </div>
                <span className="font-headline-md text-sm font-bold text-on-surface">
                  {t.sandbox.demoB.title}
                </span>
              </div>
              <span className="text-[10px] font-code-label bg-tertiary/15 text-tertiary px-2 py-0.5 rounded border border-tertiary/30 font-semibold">
                {t.sandbox.demoB.mode}
              </span>
            </div>

            <p className="text-xs text-on-surface-variant font-body-sm">
              {t.sandbox.demoB.description}
            </p>

            {/* Sniffed Streams Display */}
            <div className="space-y-2.5">
              {t.sandbox.demoB.streams.map((stream, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-surface-container/60 border border-outline-variant/20 text-xs space-y-1.5 hover:border-tertiary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-code-label font-bold text-on-surface truncate text-[11px]">
                      {stream.name}
                    </span>
                    <span className="text-[10px] font-code-label px-1.5 py-0.2 rounded bg-tertiary/15 text-tertiary border border-tertiary/30">
                      {stream.resolution}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-code-label text-on-surface-variant">
                    <span>{stream.type}</span>
                    <span className="text-secondary">{stream.size}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Download Status Toast */}
            {downloadSuccessB && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-code-label text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{t.sandbox.demoB.downloadSuccess}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 space-y-2">
            <button
              type="button"
              disabled={downloadingB}
              onClick={handleDownloadB}
              className="w-full py-2.5 px-4 rounded-xl bg-tertiary-container hover:brightness-110 active:scale-95 text-on-tertiary-container font-headline-md font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {downloadingB ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.sandbox.demoB.downloadingBtn}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.sandbox.demoB.downloadBtn}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSniffB}
              className="w-full py-2 px-3 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface font-code-label text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Radio className={`w-3.5 h-3.5 ${sniffingB ? 'animate-pulse text-tertiary' : ''}`} />
              <span>{sniffingB ? 'Scanning network...' : t.sandbox.demoB.sniffBtn}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Demo C Selector & XPath Probe (Devtools Mode) */}
        <div className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 backdrop-blur-xl flex flex-col justify-between hover:border-primary/40 transition-all shadow-xl">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/15 text-primary">
                  <Code2 className="w-4 h-4" />
                </div>
                <span className="font-headline-md text-sm font-bold text-on-surface">
                  {t.sandbox.demoC.title}
                </span>
              </div>
              <span className="text-[10px] font-code-label bg-primary/15 text-primary px-2 py-0.5 rounded border border-primary/30 font-semibold">
                {t.sandbox.demoC.mode}
              </span>
            </div>

            <p className="text-xs text-on-surface-variant font-body-sm">
              {t.sandbox.demoC.description}
            </p>

            {/* Interactive Selector Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-code-label text-on-surface-variant block">
                {t.sandbox.demoC.inputLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectorInput}
                  onChange={(e) => setSelectorInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary text-xs font-code-label text-secondary outline-none transition-all"
                  placeholder=".product-card .price"
                />
              </div>
            </div>

            {/* Realtime Matching Status */}
            <div className="p-3.5 rounded-xl bg-surface-container/60 border border-secondary/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-code-label">
                <span className="text-on-surface-variant">{t.sandbox.demoC.matchedLabel}</span>
                <span className="text-secondary font-bold">
                  {getMatchCount(selectorInput)}
                </span>
              </div>
              <div className="p-2 rounded bg-surface-container-lowest/80 text-[10px] font-mono text-on-surface-variant truncate border border-outline-variant/20">
                {t.sandbox.demoC.testSample}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-6">
            <span className="text-[10px] font-code-label text-on-surface-variant block mb-2">
              Quick Test Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['.product-card .price', '.product-card h3', '//div[@class="catalog-grid"]'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSelectorInput(preset)}
                  className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-[10px] font-code-label text-on-surface hover:text-secondary transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

