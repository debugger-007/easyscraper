import React from 'react'
import type { TranslationSchema } from '../locales/types'
import { useTranslate } from '../locales'
import { MousePointerClick, RefreshCw, Radio, DownloadCloud, Database, Terminal } from 'lucide-react'

interface FeatureGridProps {
  t?: TranslationSchema
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ t: propT }) => {
  const { t: hookT } = useTranslate()
  const t = propT || hookT

  const iconMap: Record<string, React.ReactNode> = {
    ads_click: <MousePointerClick className="w-5 h-5 md:w-6 md:h-6" />,
    auto_mode: <RefreshCw className="w-5 h-5 md:w-6 md:h-6" />,
    stream: <Radio className="w-5 h-5 md:w-6 md:h-6" />,
    file_download: <DownloadCloud className="w-5 h-5 md:w-6 md:h-6" />,
    database: <Database className="w-5 h-5 md:w-6 md:h-6" />,
  }

  const topCards = t.features.cards.slice(0, 3)
  const bottomCards = t.features.cards.slice(3)

  const renderCard = (card: TranslationSchema['features']['cards'][number], idx: number) => (
    <div
      key={idx}
      className="group p-4 sm:p-6 md:p-7 rounded-xl md:rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-[0_12px_32px_-6px_rgba(0,105,72,0.1)] hover:border-primary/40 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-secondary-container text-on-secondary-container md:bg-primary/10 md:text-primary flex items-center justify-center mb-3 md:mb-5 group-hover:bg-primary group-hover:text-on-primary transition-colors">
          {iconMap[card.icon] || <Terminal className="w-5 h-5 md:w-6 md:h-6" />}
        </div>

        {/* Mobile inline title + badge row; desktop stacked */}
        <div className="hidden md:inline-block font-code-label text-[11px] font-semibold uppercase tracking-wider text-primary mb-1.5">
          {card.tag}
        </div>
        <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2.5">
          <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface tracking-tight leading-snug">
            {card.title}
          </h3>
          <span className="md:hidden px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-label text-[10px] font-semibold shrink-0">
            {card.badge}
          </span>
        </div>

        <p className="font-body-sm md:font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {card.description}
        </p>
      </div>

      {/* Desktop footer divider */}
      <div className="hidden md:flex pt-4 mt-6 border-t border-surface-container-low items-center justify-between font-code-label text-[11px]">
        <span className="text-on-surface-variant">{t.features.architectureLabel}</span>
        <span className="text-primary font-semibold">{card.badge}</span>
      </div>
    </div>
  )

  return (
    <section id="features" className="w-full py-12 md:py-20 bg-surface-container-low/50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Left-aligned on mobile, centered on md+) */}
        <div className="flex flex-col items-start text-left md:items-center md:text-center mb-6 md:mb-12">
          <div className="inline-flex items-center gap-1.5 md:px-4 md:py-1.5 md:rounded-full md:bg-surface-container-high md:border md:border-outline-variant/25 md:shadow-sm mb-1.5 md:mb-3">
            <Terminal className="hidden md:inline-block w-3.5 h-3.5 text-primary" />
            <span className="font-code-label text-[11px] text-primary md:text-on-surface font-bold md:font-semibold tracking-wider uppercase">
              {t.features.pillBadge}
            </span>
          </div>
          <h2 className="font-headline-md md:font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold tracking-tight">
            {t.features.title}
          </h2>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-2xl mt-2 md:mt-3 leading-relaxed">
            {t.features.description}
          </p>
        </div>

        {/* Bento Top Row (1-col stack on mobile, 3-col on md+) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 mb-3 md:mb-5">
          {topCards.map((card, idx) => renderCard(card, idx))}
        </div>

        {/* Bento Bottom Row (1-col stack on mobile, 2-col on md+) */}
        {bottomCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
            {bottomCards.map((card, idx) => renderCard(card, idx + 3))}
          </div>
        )}
      </div>
    </section>
  )
}
