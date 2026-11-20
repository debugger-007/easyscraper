import React from 'react'
import type { TranslationSchema } from '../locales/types'
import { useTranslate } from '../locales'
import {
  Shield,
  Key,
  Activity,
  CreditCard,
  Ban,
  Video,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react'

interface ComplianceMatrixProps {
  t?: TranslationSchema
}

export const ComplianceMatrix: React.FC<ComplianceMatrixProps> = ({ t: propT }) => {
  const { t: hookT } = useTranslate()
  const t = propT || hookT

  const rowIcons: Record<string, React.ReactNode> = {
    key: <Key className="w-4 h-4 text-primary" />,
    monitoring: <Activity className="w-4 h-4 text-primary" />,
    payments: <CreditCard className="w-4 h-4 text-primary" />,
    block: <Ban className="w-4 h-4 text-primary" />,
    movie: <Video className="w-4 h-4 text-primary" />,
  }

  return (
    <section id="compliance" className="w-full py-12 md:py-20 bg-surface-container-low/50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-start text-left md:items-center md:text-center mb-6 md:mb-12">
          <div className="inline-flex items-center gap-1.5 md:px-4 md:py-1.5 md:rounded-full md:bg-surface-container-high md:border md:border-outline-variant/25 md:shadow-sm mb-1.5 md:mb-3">
            <Shield className="hidden md:inline-block w-3.5 h-3.5 text-primary" />
            <span className="font-code-label text-[11px] text-primary md:text-on-surface font-bold md:font-semibold tracking-wider uppercase">
              {t.compliance.pillBadge}
            </span>
          </div>
          <h2 className="font-headline-md md:font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold tracking-tight">
            {t.compliance.title}
          </h2>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-2xl mt-2 md:mt-3 leading-relaxed">
            {t.compliance.description}
          </p>
        </div>

        {/* ================= MOBILE 2-COLUMN COMPARISON CARD (< md, zero horizontal scroll) ================= */}
        <div className="md:hidden w-full bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-md overflow-hidden flex flex-col">
          {/* Header Row */}
          <div className="grid grid-cols-2 bg-surface-container-high p-3 font-code-label text-[10px] font-bold gap-2">
            <span className="text-primary uppercase tracking-wider">
              {t.compliance.tableHeaders.easyScraper}
            </span>
            <span className="text-outline uppercase tracking-wider">
              {t.compliance.tableHeaders.legacy}
            </span>
          </div>

          {/* Alternating Comparison Rows */}
          {t.compliance.rows.map((row, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-2 p-3 gap-2.5 ${
                idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'
              }`}
            >
              <div className="flex flex-col gap-1 pr-1">
                <span className="font-code-label text-[11px] text-on-surface font-bold leading-snug">
                  {row.dimension}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">
                  {row.easyText}
                </span>
              </div>
              <div className="flex flex-col gap-1 pl-1 border-l border-outline-variant/20">
                <span className="font-code-label text-[10px] text-error font-semibold flex items-center gap-1">
                  <XCircle className="w-3 h-3 shrink-0" />
                  <span className="truncate">{row.dimension}</span>
                </span>
                <span className="font-body-sm text-[11px] text-outline leading-relaxed">
                  {row.legacyText}
                </span>
              </div>
            </div>
          ))}

          {/* Embedded Local Isolation Footer */}
          <div className="p-3.5 bg-secondary-container text-on-secondary-container flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="font-code-label text-[11px] font-bold text-on-secondary-container">
                {t.compliance.localGauge.title}
              </span>
            </div>
            <p className="text-[11px] text-on-secondary-container/90 leading-relaxed">
              {t.compliance.localGauge.status}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 font-code-label text-[10px] font-semibold">
              <span className="px-2 py-0.5 rounded bg-surface-container-lowest/70 text-primary">
                {t.compliance.localGauge.badgeLeft}
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container-lowest/70 text-secondary">
                {t.compliance.localGauge.badgeRight}
              </span>
            </div>
          </div>
        </div>

        {/* ================= DESKTOP 3-COLUMN TABLE (md+) ================= */}
        <div className="hidden md:block">
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[36%]" />
                  <col className="w-[36%]" />
                </colgroup>
                <thead>
                  <tr className="bg-surface-container/80 font-code-label text-xs uppercase tracking-wider text-on-surface border-b border-surface-container">
                    <th className="py-4 px-6 font-bold text-on-surface">
                      {t.compliance.tableHeaders.criteria}
                    </th>
                    <th className="py-4 px-6 font-bold text-on-surface-variant">
                      {t.compliance.tableHeaders.legacy}
                    </th>
                    <th className="py-4 px-6 font-bold text-primary bg-primary/5">
                      {t.compliance.tableHeaders.easyScraper}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {t.compliance.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-surface-container-low/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-on-surface">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center shrink-0">
                            {rowIcons[row.icon] || <Shield className="w-4 h-4 text-primary" />}
                          </div>
                          <span className="leading-tight">{row.dimension}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-on-surface-variant align-top">
                        <div className="flex items-start gap-2.5">
                          <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{row.legacyText}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-on-surface bg-primary/[0.03] align-top">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium text-on-surface">
                            {row.easyText}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Local Sandboxed Storage & Memory Isolation Banner */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                  {t.compliance.localGauge.title}
                </h3>
                <p className="font-body-sm text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                  {t.compliance.localGauge.status}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-lg bg-surface-container-low font-code-label text-[11px] font-semibold text-primary">
                {t.compliance.localGauge.badgeLeft}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-surface-container-low font-code-label text-[11px] font-semibold text-secondary">
                {t.compliance.localGauge.badgeRight}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
