import React, { useEffect } from 'react'
import type { TranslationSchema } from '../locales/types'
import { Check, Sparkles, ShieldCheck, Zap, Infinity, ArrowRight, Lock, HelpCircle, Gift } from 'lucide-react'

// Lemon Squeezy global types
declare global {
  interface Window {
    createLemonSqueezy?: () => void
    LemonSqueezy?: {
      Url?: {
        Open: (url: string) => void
        Close: () => void
      }
      Setup?: (options: Record<string, unknown>) => void
    }
  }
}

interface PricingSectionProps {
  t: TranslationSchema
}

const LIFETIME_CHECKOUT_URL =
  'https://easyscraper.lemonsqueezy.com/checkout/buy/ec5adf18-e055-483a-84c2-98f69da5adc1?embed=1'
const MONTHLY_CHECKOUT_URL =
  'https://easyscraper.lemonsqueezy.com/checkout/buy/a91952f7-d426-447b-80d3-c29861b94e54?embed=1'
const FREE_INSTALL_URL =
  'https://chromewebstore.google.com/detail/easy-web-scraper/placeholder'

export const PricingSection: React.FC<PricingSectionProps> = ({ t }) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.createLemonSqueezy) {
      window.createLemonSqueezy()
    }
  }, [])

  const handleCheckoutClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    checkoutUrl: string
  ) => {
    if (typeof window !== 'undefined' && window.LemonSqueezy?.Url?.Open) {
      e.preventDefault()
      window.LemonSqueezy.Url.Open(checkoutUrl)
    }
  }

  const { plans, faqs } = t.pricing

  return (
    <section id="pricing" className="py-24 px-4 sm:px-8 max-w-[1440px] mx-auto scroll-mt-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-code-label text-xs uppercase font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>{t.pricing.pillBadge}</span>
        </div>
        <h2 className="font-display-lg text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface">
          {t.pricing.title}
        </h2>
        <p className="text-base sm:text-lg font-body-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          {t.pricing.description}
        </p>
      </div>

      {/* Pricing Cards Grid: Perfectly aligned rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {/* Tier 1: Free Starter */}
        <div className="glass-card rounded-2xl p-7 flex flex-col justify-between border border-outline-variant/30 hover:border-outline-variant/60 transition-all">
          <div className="space-y-5">
            {/* 1. Header Badges: Unified height */}
            <div className="h-8 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface-variant text-xs font-semibold uppercase tracking-wider font-code-label border border-outline-variant/30">
                {plans.free.badge}
              </span>
            </div>

            {/* 2. Title & Description: Unified height */}
            <div>
              <h3 className="text-2xl font-bold text-on-surface flex items-center h-8">
                {plans.free.name}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1.5 h-9 line-clamp-2 leading-relaxed">
                {plans.free.description}
              </p>
            </div>

            {/* 3. Price Area: Unified height */}
            <div className="pt-3 border-t border-outline-variant/20 h-16 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-on-surface">
                {plans.free.price}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                {plans.free.period}
              </span>
            </div>

            {/* 4. Highlight Banner: Unified height */}
            <div className="h-9 flex items-center px-3 rounded-lg bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant text-xs font-medium">
              <span>{plans.free.highlightNote}</span>
            </div>

            {/* 5. Features Checklist */}
            <div className="pt-2 border-t border-outline-variant/20">
              <ul className="space-y-3.5">
                {plans.free.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface-variant">
                    <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6. CTA Button */}
          <div className="pt-6 mt-6 border-t border-outline-variant/15">
            <a
              href={FREE_INSTALL_URL}
              className="w-full h-12 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-sm transition-all border border-outline-variant/40 hover:border-outline"
            >
              <span>{plans.free.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Tier 2: Pro Monthly Subscription */}
        <div className="glass-card rounded-2xl p-7 flex flex-col justify-between border border-primary/40 hover:border-primary/70 transition-all bg-surface-container-low/60 shadow-[0_0_25px_rgba(99,102,241,0.08)]">
          <div className="space-y-5">
            {/* 1. Header Badges: Aligned pills */}
            <div className="h-8 flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-md bg-primary/15 text-primary text-xs font-semibold uppercase tracking-wider font-code-label border border-primary/30">
                {plans.monthly.badge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                <span>{plans.monthly.trialBadge}</span>
              </span>
            </div>

            {/* 2. Title & Description: Unified height */}
            <div>
              <h3 className="text-2xl font-bold text-on-surface flex items-center h-8">
                {plans.monthly.name}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1.5 h-9 line-clamp-2 leading-relaxed">
                {plans.monthly.description}
              </p>
            </div>

            {/* 3. Price Area: Unified height */}
            <div className="pt-3 border-t border-outline-variant/20 h-16 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-on-surface">
                {plans.monthly.price}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                {plans.monthly.period}
              </span>
            </div>

            {/* 4. Highlight Banner: Unified height */}
            <div className="h-9 flex items-center px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span>{plans.monthly.highlightNote}</span>
            </div>

            {/* 5. Features Checklist */}
            <div className="pt-2 border-t border-outline-variant/20">
              <ul className="space-y-3.5">
                {plans.monthly.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className={idx === 0 ? 'font-medium text-emerald-300' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6. CTA Button */}
          <div className="pt-6 mt-6 border-t border-outline-variant/15">
            <a
              href={MONTHLY_CHECKOUT_URL}
              onClick={(e) => handleCheckoutClick(e, MONTHLY_CHECKOUT_URL)}
              className="lemonsqueezy-button w-full h-12 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-primary/20 hover:bg-primary/30 text-white font-semibold text-sm transition-all border border-primary/50 hover:border-primary shadow-[0_0_18px_rgba(99,102,241,0.2)] cursor-pointer"
            >
              <span>{plans.monthly.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Tier 3: Lifetime Deal (Featured) */}
        <div className="relative glass-card rounded-2xl p-7 flex flex-col justify-between border-2 border-primary shadow-[0_0_35px_rgba(192,193,255,0.2)] bg-gradient-to-b from-primary/10 via-surface-container-low to-surface-container-low transition-all">
          {/* Top Floating Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary via-secondary to-primary-container text-on-primary-container text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap z-20">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{plans.lifetime.badge}</span>
          </div>

          <div className="space-y-5">
            {/* 1. Header Badges: Unified height */}
            <div className="h-8 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-primary/15 text-primary text-xs font-semibold uppercase tracking-wider font-code-label border border-primary/30">
                {plans.lifetime.name}
              </span>
              <Infinity className="w-5 h-5 text-secondary" />
            </div>

            {/* 2. Title & Description: Unified height */}
            <div>
              <h3 className="text-2xl font-bold text-on-surface flex items-center h-8">
                {plans.lifetime.name}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1.5 h-9 line-clamp-2 leading-relaxed">
                {plans.lifetime.description}
              </p>
            </div>

            {/* 3. Price Area: Unified height */}
            <div className="pt-3 border-t border-outline-variant/30 h-16 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-white bg-clip-text text-transparent">
                {plans.lifetime.price}
              </span>
              <span className="text-xs text-secondary font-medium">
                {plans.lifetime.period}
              </span>
            </div>

            {/* 4. Highlight Banner: Unified height */}
            <div className="h-9 flex items-center px-3 rounded-lg bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
              <span>✨ {plans.lifetime.highlightNote}</span>
            </div>

            {/* 5. Features Checklist */}
            <div className="pt-2 border-t border-outline-variant/20">
              <ul className="space-y-3.5">
                {plans.lifetime.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface">
                    <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span className={idx === 1 ? 'font-semibold text-white' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6. CTA Button */}
          <div className="pt-6 mt-6 border-t border-outline-variant/15">
            <a
              href={LIFETIME_CHECKOUT_URL}
              onClick={(e) => handleCheckoutClick(e, LIFETIME_CHECKOUT_URL)}
              className="lemonsqueezy-button w-full h-12 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary hover:brightness-110 text-on-primary font-bold text-sm transition-all shadow-[0_0_25px_rgba(76,215,246,0.35)] cursor-pointer"
            >
              <span>{plans.lifetime.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-14 max-w-4xl mx-auto text-center px-4 py-4 rounded-xl glass-panel border border-outline-variant/20 flex flex-wrap items-center justify-center gap-6 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <span>30-Day Money-Back Guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span>Instant License Key Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>256-Bit SSL Encrypted Checkout via Lemon Squeezy</span>
        </div>
      </div>

      {/* FAQ Accordion / Cards */}
      <div className="mt-20 max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-center text-on-surface mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-secondary" />
          <span>{t.pricing.faqTitle}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card p-6 rounded-xl space-y-2 border border-outline-variant/20">
              <h4 className="font-semibold text-sm text-on-surface">{faq.q}</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
