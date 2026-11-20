import React, { useState } from 'react'
import type { TranslationSchema } from '../locales/types'
import { useTranslate } from '../locales'
import { ShoppingBag, Radio, Code2, Play, Download, Check, FlaskConical, Loader2, Copy } from 'lucide-react'

interface InteractiveSandboxProps {
  t?: TranslationSchema
}

export const InteractiveSandbox: React.FC<InteractiveSandboxProps> = ({ t: propT }) => {
  const { t: hookT } = useTranslate()
  const t = propT || hookT

  // Mobile active tab state (lg+ displays all 3 cards simultaneously)
  const [mobileTab, setMobileTab] = useState<'a' | 'b' | 'c'>('a')

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

  const getMatchCount = (sel: string) => {
    const s = sel.trim()
    if (!s) return '0'
    if (s.includes('price')) return t.sandbox.demoC.matchedCount
    if (s.includes('product') || s.includes('card')) return '3 Containers'
    if (s.includes('title') || s.includes('h2') || s.includes('h3')) return '3 Headers'
    return '1 DOM Node'
  }

  return (
    <section id="sandbox" className="w-full py-12 md:py-20 bg-surface scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-start text-left md:items-center md:text-center mb-5 md:mb-12">
          <div className="inline-flex items-center gap-1.5 md:px-4 md:py-1.5 md:rounded-full md:bg-secondary-fixed/50 md:border md:border-secondary/20 md:shadow-sm mb-1.5 md:mb-3">
            <FlaskConical className="hidden md:inline-block w-3.5 h-3.5 text-secondary" />
            <span className="font-code-label text-[11px] text-primary md:text-on-secondary-fixed font-bold md:font-semibold tracking-wider uppercase">
              {t.sandbox.pillBadge}
            </span>
          </div>
          <h2 className="font-headline-md md:font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold tracking-tight">
            {t.sandbox.title}
          </h2>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-2xl mt-2 md:mt-3 leading-relaxed">
            {t.sandbox.description}
          </p>
        </div>

        {/* Mobile Segmented Tab Switcher (< lg) */}
        <div className="lg:hidden flex items-center gap-1 bg-surface-container p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setMobileTab('a')}
            className={`flex-1 min-h-[40px] px-2 rounded-lg font-code-label text-[11px] transition-all flex items-center justify-center text-center cursor-pointer ${
              mobileTab === 'a'
                ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                : 'text-on-surface-variant font-semibold'
            }`}
          >
            <span className="truncate">{t.sandbox.demoA.mode}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('b')}
            className={`flex-1 min-h-[40px] px-2 rounded-lg font-code-label text-[11px] transition-all flex items-center justify-center text-center cursor-pointer ${
              mobileTab === 'b'
                ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                : 'text-on-surface-variant font-semibold'
            }`}
          >
            <span className="truncate">{t.sandbox.demoB.mode}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('c')}
            className={`flex-1 min-h-[40px] px-2 rounded-lg font-code-label text-[11px] transition-all flex items-center justify-center text-center cursor-pointer ${
              mobileTab === 'c'
                ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                : 'text-on-surface-variant font-semibold'
            }`}
          >
            <span className="truncate">{t.sandbox.demoC.mode}</span>
          </button>
        </div>

        {/* 3 Interactive Cards Grid (Mobile shows active tab, lg+ shows all 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {/* Demo A: E-Commerce Product Catalog */}
          <div
            className={`${
              mobileTab === 'a' ? 'flex' : 'hidden lg:flex'
            } p-4 sm:p-6 rounded-xl md:rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:border-primary/40 transition-all flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span className="font-headline-sm text-sm sm:text-base text-on-surface font-bold sm:font-semibold truncate tracking-tight">
                    {t.sandbox.demoA.title}
                  </span>
                </div>
                <span className="font-code-label text-[10px] px-2 py-0.5 rounded bg-secondary-container sm:bg-primary/10 text-on-secondary-container sm:text-primary font-bold shrink-0">
                  {t.sandbox.demoA.mode}
                </span>
              </div>

              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                {t.sandbox.demoA.description}
              </p>

              <div className="space-y-2 p-2.5 sm:p-3 rounded-xl bg-surface-container-low font-code-label text-xs mb-4">
                {t.sandbox.demoA.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center gap-2 py-1.5 ${
                      idx < t.sandbox.demoA.items.length - 1
                        ? 'border-b border-surface-container'
                        : ''
                    }`}
                  >
                    <span className="text-on-surface font-medium truncate">
                      {item.title}
                    </span>
                    <span className="text-primary font-bold shrink-0">{item.price}</span>
                  </div>
                ))}
              </div>

              {extractedA && (
                <div className="p-3 rounded-xl bg-primary-fixed/40 border border-primary/25 text-xs font-code-label text-on-primary-fixed flex items-center justify-between gap-2 mb-4">
                  <span className="truncate">{t.sandbox.demoA.summary}</span>
                  <button
                    type="button"
                    onClick={handleCopyJsonA}
                    className="flex items-center gap-1 font-bold text-primary hover:underline shrink-0 cursor-pointer"
                  >
                    {copiedA ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedA ? t.hero.simulator.copied : 'JSON'}</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={extractingA}
              onClick={handleExtractA}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container active:scale-[0.99] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
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

          {/* Demo B: Video Stream Network Sniffer */}
          <div
            className={`${
              mobileTab === 'b' ? 'flex' : 'hidden lg:flex'
            } p-4 sm:p-6 rounded-xl md:rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:border-secondary/40 transition-all flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
                  <span className="font-headline-sm text-sm sm:text-base text-on-surface font-bold sm:font-semibold truncate tracking-tight">
                    {t.sandbox.demoB.title}
                  </span>
                </div>
                <span className="font-code-label text-[10px] px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-bold shrink-0">
                  {t.sandbox.demoB.mode}
                </span>
              </div>

              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                {t.sandbox.demoB.description}
              </p>

              <div className="space-y-2 p-2.5 sm:p-3 rounded-xl bg-surface-container-low font-code-label text-xs mb-4">
                {t.sandbox.demoB.streams.map((stream, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center gap-2 py-1.5 ${
                      idx < t.sandbox.demoB.streams.length - 1
                        ? 'border-b border-surface-container'
                        : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-on-surface truncate text-[11px]">
                        {stream.name}
                      </div>
                      <div className="text-[10px] text-on-surface-variant">
                        {stream.type} · {stream.resolution}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-[10px] shrink-0">
                      {stream.size}
                    </span>
                  </div>
                ))}
              </div>

              {downloadSuccessB && (
                <div className="p-3 rounded-xl bg-primary-fixed/40 border border-primary/25 text-xs font-code-label text-on-primary-fixed flex items-center gap-2 mb-4">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>{t.sandbox.demoB.downloadSuccess}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSniffB}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Radio className={`w-3.5 h-3.5 text-secondary ${sniffingB ? 'animate-pulse' : ''}`} />
                <span>{t.sandbox.demoB.sniffBtn}</span>
              </button>
              <button
                type="button"
                disabled={downloadingB}
                onClick={handleDownloadB}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-secondary text-on-secondary hover:bg-primary-container font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {downloadingB ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.sandbox.demoB.downloadingBtn}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.sandbox.demoB.downloadBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Demo C: Selector & XPath Playground */}
          <div
            className={`${
              mobileTab === 'c' ? 'flex' : 'hidden lg:flex'
            } p-4 sm:p-6 rounded-xl md:rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:border-tertiary/40 transition-all flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-tertiary shrink-0" />
                  <span className="font-headline-sm text-sm sm:text-base text-on-surface font-bold sm:font-semibold truncate tracking-tight">
                    {t.sandbox.demoC.title}
                  </span>
                </div>
                <span className="font-code-label text-[10px] px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold shrink-0">
                  {t.sandbox.demoC.mode}
                </span>
              </div>

              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                {t.sandbox.demoC.description}
              </p>

              <div className="space-y-1.5 mb-4">
                <label className="font-code-label text-[10px] text-on-surface-variant uppercase font-semibold block">
                  {t.sandbox.demoC.inputLabel}
                </label>
                <input
                  type="text"
                  value={selectorInput}
                  onChange={(e) => setSelectorInput(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3 rounded-lg bg-surface border border-outline-variant/45 font-code-label text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder=".product-card .price"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low font-code-label text-[11px] space-y-1.5 mb-4">
                <div className="flex justify-between gap-2">
                  <span className="text-on-surface-variant">{t.sandbox.demoC.matchedLabel}:</span>
                  <span className="text-primary font-bold truncate">
                    {getMatchCount(selectorInput)}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant truncate">
                  {t.sandbox.demoC.testSample}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {['.price', 'h2.title', '//a[@href]'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSelectorInput(preset)}
                  className="min-h-[34px] px-3 py-1 rounded-md bg-surface-container hover:bg-surface-container-high font-code-label text-[11px] text-on-surface transition-colors cursor-pointer"
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
