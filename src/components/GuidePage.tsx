import React from 'react'
import { Link } from '@tanstack/react-router'
import type { SupportedLocale } from '../i18n/types'
import type { GuideSlug } from '../config/seo'
import { useTranslate, normalizeLocale } from '../i18n'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { PageCtaBanner } from './PageCtaBanner'
import {
  Home,
  BookOpen,
  CheckCircle2,
  Clock,
  Lightbulb,
  ChevronDown,
  ArrowRight,
  Scale,
} from 'lucide-react'

interface GuidePageProps {
  slug: GuideSlug
  currentLocale?: SupportedLocale
}

export const GuidePage: React.FC<GuidePageProps> = ({
  slug,
  currentLocale: overrideLocale,
}) => {
  const { t, locale } = useTranslate(overrideLocale)
  const normalizedLocale = normalizeLocale(locale)
  const isEn = normalizedLocale === 'en'
  const langParam = isEn ? undefined : { lang: 'zh' }
  const common = t.guides.common
  const guide = t.guides.items[slug]
  const relatedGuides = Object.values(t.guides.items).filter((g) => g.slug !== slug)

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Navbar currentLocale={locale} t={t} activeRoute="guide" />

      <main className="flex-1 w-full">
        {/* Top Breadcrumb Bar */}
        <section className="w-full bg-surface-container-lowest border-b border-outline-variant/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 sm:gap-2 font-code-label text-[11px] sm:text-xs text-on-surface-variant"
            >
              <Link
                to={isEn ? '/' : '/$lang'}
                params={langParam}
                className="hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{common.breadcrumbHome}</span>
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant">{common.breadcrumbGuides}</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold">{guide.shortTitle}</span>
            </nav>

            <div className="flex items-center gap-2 font-code-label text-[11px] text-on-surface-variant">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-low border border-outline-variant/25">
                <Clock className="w-3 h-3 text-primary" />
                <span>{guide.readingTime}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {guide.difficulty}
              </span>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-surface-container-lowest to-surface">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-code-label text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{guide.pillBadge}</span>
            </div>

            <h1 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.15]">
              {guide.title}
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
              {guide.summary}
            </p>

            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {guide.highlights.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25 text-xs sm:text-sm text-on-surface"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Step-by-Step HowTo Section */}
        <section className="w-full py-10 md:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-1.5">
              <span className="font-code-label text-xs font-bold uppercase tracking-wider text-primary">
                {common.stepsBadge}
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                {common.stepsTitle}
              </h2>
            </div>

            <ol className="space-y-5">
              {guide.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-6 sm:p-7 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-code-label text-xs font-bold shrink-0">
                      {common.stepPrefix} {idx + 1}
                    </span>
                    <h3 className="font-headline-lg text-lg sm:text-xl font-bold text-on-surface">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                    {step.description}
                  </p>

                  {step.tip && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs sm:text-sm text-on-surface">
                      <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-primary mr-1.5">
                          {common.proTipLabel}:
                        </span>
                        <span className="text-on-surface-variant leading-relaxed">
                          {step.tip}
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Guide FAQ Section */}
        <section className="w-full py-10 md:py-14 px-4 sm:px-6 lg:px-8 bg-surface-container-low/50 border-y border-outline-variant/20">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-1.5">
              <span className="font-code-label text-xs font-bold uppercase tracking-wider text-primary">
                {common.faqBadge}
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
                {common.faqTitle}
              </h2>
            </div>

            <div className="space-y-3">
              {guide.faqs.map((item, idx) => (
                <details
                  key={idx}
                  open
                  className="group rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-5"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-sm sm:text-base text-on-surface">
                    <h3>{item.q}</h3>
                    <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Related Guides Cross-Links */}
        <section className="w-full py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-5">
            <h2 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface">
              {common.relatedTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedGuides.map((rel) => (
                <Link
                  key={rel.slug}
                  to={isEn ? '/guides/$slug' : '/$lang/guides/$slug'}
                  params={isEn ? { slug: rel.slug } : { lang: 'zh', slug: rel.slug }}
                  className="group p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 shadow-sm transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-code-label text-[11px] font-semibold">
                      {rel.pillBadge}
                    </span>
                    <h3 className="font-headline-lg text-base sm:text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      {rel.shortTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed line-clamp-2">
                      {rel.summary}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary">
                    <span>{common.readGuideCta}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Theme-Gradient CTA Banner */}
        <PageCtaBanner
          badge={common.ctaBadge}
          title={guide.ctaTitle}
          description={guide.ctaDescription}
          chromeLabel={common.ctaChrome}
          edgeLabel={common.ctaEdge}
          secondaryAction={
            <Link
              to={isEn ? '/compare' : '/$lang/compare'}
              params={langParam}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-on-primary/10 hover:bg-on-primary/20 border border-on-primary/25 text-on-primary text-sm font-semibold backdrop-blur-sm transition-all"
            >
              <Scale className="w-4 h-4 shrink-0" />
              <span>{common.ctaCompare}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      </main>

      <Footer t={t} />
    </div>
  )
}
