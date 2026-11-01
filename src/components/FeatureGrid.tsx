import React from 'react'
import type { TranslationSchema } from '../locales/types'
import { MousePointerClick, RefreshCw, Radio, DownloadCloud, Database, Sparkles } from 'lucide-react'

interface FeatureGridProps {
  t: TranslationSchema
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ t }) => {
  const iconMap: Record<string, React.ReactNode> = {
    ads_click: <MousePointerClick className="w-6 h-6" />,
    auto_mode: <RefreshCw className="w-6 h-6" />,
    stream: <Radio className="w-6 h-6" />,
    file_download: <DownloadCloud className="w-6 h-6" />,
    database: <Database className="w-6 h-6" />,
  }

  const colorStyles: Record<string, { border: string; bg: string; text: string; glow: string; badge: string }> = {
    indigo: {
      border: 'hover:border-primary/50',
      bg: 'bg-primary/10',
      text: 'text-primary',
      glow: 'group-hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]',
      badge: 'bg-primary/15 text-primary border-primary/30',
    },
    cyan: {
      border: 'hover:border-secondary/50',
      bg: 'bg-secondary/10',
      text: 'text-secondary',
      glow: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]',
      badge: 'bg-secondary/15 text-secondary border-secondary/30',
    },
    amber: {
      border: 'hover:border-tertiary/50',
      bg: 'bg-tertiary/10',
      text: 'text-tertiary',
      glow: 'group-hover:shadow-[0_0_25px_rgba(255,183,131,0.2)]',
      badge: 'bg-tertiary/15 text-tertiary border-tertiary/30',
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    violet: {
      border: 'hover:border-purple-500/50',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]',
      badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    },
  }

  return (
    <section id="features" className="py-20 px-4 sm:px-8 max-w-[1440px] mx-auto scroll-mt-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-code-label text-xs uppercase font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.features.pillBadge}</span>
        </div>
        <h2 className="font-display-lg text-2xl sm:text-4xl font-bold text-on-surface">
          {t.features.title}
        </h2>
        <p className="font-body-base text-sm sm:text-base text-on-surface-variant leading-relaxed">
          {t.features.description}
        </p>
      </div>

      {/* Grid: 2 columns on top, 3 columns on bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {t.features.cards.map((card, idx) => {
          const style = colorStyles[card.accentColor] || colorStyles.indigo
          const isLarge = idx < 2

          return (
            <div
              key={idx}
              className={`group p-6 sm:p-8 rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${
                style.border
              } ${style.glow} ${isLarge ? 'md:col-span-1 lg:col-span-1' : ''}`}
            >
              <div>
                {/* Card Top: Icon & Tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`p-3 rounded-xl border border-outline-variant/20 ${style.bg} ${style.text}`}>
                    {iconMap[card.icon] || <Sparkles className="w-6 h-6" />}
                  </div>
                  <span className={`text-[10px] font-code-label font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${style.badge}`}>
                    {card.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-headline-md text-lg sm:text-xl font-bold text-on-surface group-hover:text-secondary transition-colors mb-3">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="font-body-base text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Bottom Badge */}
              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs font-code-label">
                <span className="text-on-surface-variant">Architecture Feature</span>
                <span className={`font-semibold ${style.text}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

