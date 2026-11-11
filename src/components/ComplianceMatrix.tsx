import React from 'react'
import type { TranslationSchema } from '../locales/types'
import { useTranslate } from '../locales'
import { Shield, Key, Activity, CreditCard, Ban, Video, CheckCircle2, XCircle, HardDrive } from 'lucide-react'

interface ComplianceMatrixProps {
  t?: TranslationSchema
}

export const ComplianceMatrix: React.FC<ComplianceMatrixProps> = ({ t: propT }) => {
  const { t: hookT } = useTranslate()
  const t = propT || hookT
  const rowIcons: Record<string, React.ReactNode> = {
    key: <Key className="w-4 h-4 text-tertiary" />,
    monitoring: <Activity className="w-4 h-4 text-primary" />,
    payments: <CreditCard className="w-4 h-4 text-secondary" />,
    block: <Ban className="w-4 h-4 text-error" />,
    movie: <Video className="w-4 h-4 text-cyan-400" />,
  }

  return (
    <section id="compliance" className="py-20 px-4 sm:px-8 max-w-[1440px] mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary/10 border border-tertiary/30 text-tertiary font-code-label text-xs uppercase font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>{t.compliance.pillBadge}</span>
        </div>
        <h2 className="font-display-lg text-2xl sm:text-4xl font-bold text-on-surface">
          {t.compliance.title}
        </h2>
        <p className="font-body-base text-sm sm:text-base text-on-surface-variant leading-relaxed">
          {t.compliance.description}
        </p>
      </div>

      {/* Comparison Matrix Table */}
      <div className="w-full max-w-5xl mx-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 backdrop-blur-xl overflow-hidden shadow-2xl mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/70 text-xs font-code-label">
                <th className="py-4 px-5 text-on-surface font-semibold w-1/3">
                  {t.compliance.tableHeaders.criteria}
                </th>
                <th className="py-4 px-5 text-on-surface-variant font-medium w-1/3">
                  {t.compliance.tableHeaders.legacy}
                </th>
                <th className="py-4 px-5 text-secondary font-bold w-1/3 bg-secondary/5 border-l border-secondary/20">
                  {t.compliance.tableHeaders.easyScraper}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs sm:text-sm font-body-sm">
              {t.compliance.rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-surface-container-high/30 transition-colors"
                >
                  {/* Criteria column */}
                  <td className="py-4 px-5 text-on-surface font-headline-md font-medium">
                    <div className="flex items-center gap-2.5">
                      {rowIcons[row.icon] || <Shield className="w-4 h-4 text-secondary" />}
                      <span>{row.dimension}</span>
                    </div>
                  </td>

                  {/* Legacy cloud scrapers */}
                  <td className="py-4 px-5 text-on-surface-variant font-body-sm">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                      <span>{row.legacyText}</span>
                    </div>
                  </td>

                  {/* Easy Web Scraper (Local) */}
                  <td className="py-4 px-5 text-on-surface font-medium bg-secondary/5 border-l border-secondary/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{row.easyText}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Local Storage & Memory Gauge */}
      <div className="w-full max-w-5xl mx-auto rounded-2xl border border-secondary/30 bg-surface-container-high/40 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_30px_rgba(76,215,246,0.08)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary/15 text-secondary border border-secondary/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {t.compliance.localGauge.title}
              </h3>
              <p className="text-xs font-code-label text-secondary flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                {t.compliance.localGauge.status}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-code-label text-on-surface-variant border border-outline-variant/30">
            Chrome Domain Isolation: Active
          </span>
        </div>

        {/* 3 Metrics Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {t.compliance.localGauge.metrics.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 flex flex-col justify-between hover:border-secondary/30 transition-colors"
            >
              <span className="text-xs font-code-label text-on-surface-variant">
                {item.label}
              </span>
              <div className="py-2">
                <span className="font-code-label text-xl sm:text-2xl font-bold text-secondary">
                  {item.value}
                </span>
              </div>
              <span className="text-[11px] font-body-sm text-on-surface-variant">
                {item.detail}
              </span>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  )
}

