import React from 'react'
import type { TranslationSchema } from '../locales/types'
import { useTranslate } from '../locales'
import {
  Zap,
  MousePointerClick,
  Network,
  Download,
  ScanSearch,
  Sparkles,
  HardDrive,
} from 'lucide-react'

interface HowItWorksSectionProps {
  t?: TranslationSchema
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ t: propT }) => {
  const { t: hookT } = useTranslate()
  const t = propT || hookT
  const hw = t.howItWorks

  const stepIconMap: Record<string, React.ReactNode> = {
    ads_click: <MousePointerClick className="w-6 h-6" />,
    hub: <Network className="w-6 h-6" />,
    file_download: <Download className="w-6 h-6" />,
  }

  const footerIconMap: Record<string, React.ReactNode> = {
    filter_center_focus: <ScanSearch className="w-4 h-4 shrink-0" />,
    auto_awesome: <Sparkles className="w-4 h-4 shrink-0" />,
    save: <HardDrive className="w-4 h-4 shrink-0" />,
  }

  return (
    <section
      id="how-it-works"
      className="w-full py-12 md:py-20 relative border-t border-surface-container-low scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-start text-left md:items-center md:text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-fixed/30 border border-primary/15 shadow-sm mb-2.5 md:mb-3">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary/20" />
            <span className="font-code-label text-[11px] text-primary font-semibold tracking-wider uppercase">
              {hw.pillBadge}
            </span>
          </div>
          <h2 className="font-headline-md md:font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold tracking-tight">
            {hw.title}{' '}
            <span className="text-primary font-semibold text-lg sm:text-xl md:text-2xl tracking-normal block sm:inline mt-1 sm:mt-0">
              {hw.titleAccent}
            </span>
          </h2>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-2xl mt-2 md:mt-3 leading-relaxed">
            {hw.description}
          </p>
        </div>

        {/* 3-Column Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative">
          {hw.steps.map((step, idx) => {
            const isSecondary = step.accent === 'secondary'
            return (
              <div
                key={idx}
                className={`p-5 sm:p-6 md:p-7 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-[0_12px_32px_-6px_rgba(0,105,72,0.1)] transition-all duration-300 relative group flex flex-col justify-between border border-outline-variant/30 ${
                  isSecondary ? 'hover:border-secondary/45' : 'hover:border-primary/45'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 md:mb-5">
                    <div
                      className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isSecondary
                          ? 'bg-secondary-fixed/50 text-secondary group-hover:bg-secondary group-hover:text-on-secondary'
                          : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary'
                      }`}
                    >
                      {stepIconMap[step.icon] || <Zap className="w-6 h-6" />}
                    </div>
                    <span
                      className={`font-code-label text-xs font-bold px-2.5 py-1 rounded-full bg-surface-container-low ${
                        isSecondary ? 'text-secondary' : 'text-primary'
                      }`}
                    >
                      {step.stepLabel}
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-base sm:text-lg text-on-surface font-bold mb-2 leading-snug">
                    {step.title}{' '}
                    <span className="text-xs sm:text-sm font-normal text-on-surface-variant">
                      {step.titleSub}
                    </span>
                  </h3>

                  <p className="font-body-sm md:font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-5">
                    {step.description}
                  </p>
                </div>

                <div
                  className={`pt-3.5 border-t border-surface-container-low flex items-center gap-1.5 font-code-label text-[11px] font-medium ${
                    isSecondary ? 'text-secondary' : 'text-primary'
                  }`}
                >
                  {footerIconMap[step.footerIcon] || <Sparkles className="w-4 h-4 shrink-0" />}
                  <span>{step.footerNote}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
