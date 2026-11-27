import React from 'react'
import { Link } from '@tanstack/react-router'
import type { SupportedLocale } from '../i18n/types'
import { useTranslate, normalizeLocale } from '../i18n'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { PageCtaBanner } from './PageCtaBanner'
import { Home, HelpCircle, ChevronDown, ArrowRight, Scale } from 'lucide-react'

interface FaqPageProps {
  currentLocale?: SupportedLocale
}

export const FaqPage: React.FC<FaqPageProps> = ({
  currentLocale: overrideLocale,
}) => {
  const { t, locale } = useTranslate(overrideLocale)
  const normalizedLocale = normalizeLocale(locale)
  const isEn = normalizedLocale === 'en'
  const langParam = isEn ? undefined : { lang: 'zh' }
  const page = t.faqPage

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Navbar currentLocale={locale} t={t} activeRoute="faq" />

      <main className="flex-1 w-full">
        {/* Breadcrumb & Category Quick Jump */}
        <section className="w-full bg-surface-container-lowest border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
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
                <span>{page.breadcrumb.home}</span>
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold">{page.breadcrumb.current}</span>
            </nav>

            <div className="flex items-center gap-2 flex-wrap">
              {page.categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-primary/10 hover:text-primary border border-outline-variant/25 font-code-label text-[11px] text-on-surface-variant transition-colors"
                >
                  {cat.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-surface-container-lowest to-surface">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-code-label text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{page.hero.pillBadge}</span>
            </div>

            <h1 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.15]">
              {page.hero.titleLead}
              <span className="text-primary">{page.hero.titleHighlight}</span>
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
              {page.hero.definition}
            </p>
          </div>
        </section>

        {/* Categorized FAQ Sections */}
        <section className="w-full py-10 md:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {page.categories.map((category) => (
              <div key={category.id} id={category.id} className="scroll-mt-24 space-y-4">
                <div className="space-y-1 border-b border-outline-variant/25 pb-3">
                  <h2 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface">
                    {category.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-on-surface-variant">
                    {category.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {category.items.map((item, idx) => (
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
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <PageCtaBanner
          badge={page.ctaBanner.badge}
          title={page.ctaBanner.title}
          description={page.ctaBanner.description}
          chromeLabel={page.ctaBanner.btnChrome}
          edgeLabel={page.ctaBanner.btnEdge}
          secondaryAction={
            <Link
              to={isEn ? '/compare' : '/$lang/compare'}
              params={langParam}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-on-primary/10 hover:bg-on-primary/20 border border-on-primary/25 text-on-primary text-sm font-semibold backdrop-blur-sm transition-all"
            >
              <Scale className="w-4 h-4 shrink-0" />
              <span>{page.ctaBanner.btnCompare}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      </main>

      <Footer t={t} />
    </div>
  )
}
