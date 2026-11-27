import React, { useState, useEffect } from 'react'
import type { TranslationSchema } from '../locales/types'
import { useTranslate } from '../locales'
import { paymentConfig } from '../config/payment'
import { useDetectedBrowser } from '../utils/browserDetector'
import {
  Check,
  Star,
  ShieldCheck,
  KeyRound,
  Lock,
  HelpCircle,
  Tag,
  ChevronDown,
  BadgeCheck,
  ArrowRight,
  Zap,
  Timer,
} from 'lucide-react'

interface PricingSectionProps {
  t?: TranslationSchema
}

const LIFETIME_CHECKOUT_URL = paymentConfig.lifetimeCheckoutUrl
const YEARLY_CHECKOUT_URL = paymentConfig.yearlyCheckoutUrl
const MONTHLY_CHECKOUT_URL = paymentConfig.monthlyCheckoutUrl

// 活动到期时间为 2027.02.14 23:59:59 (即 2027-02-15 00:00:00+08:00)，之后下架买断并启用年费计划
const PROMO_DEADLINE_MS = new Date('2027-02-15T00:00:00+08:00').getTime()

export const PricingSection: React.FC<PricingSectionProps> = ({ t: propT }) => {
  const { t: hookT } = useTranslate()
  const t = propT || hookT
  const { isEdge, storeUrl } = useDetectedBrowser()
  const { plans, faqs } = t.pricing
  const freeCtaText = isEdge ? plans.free.ctaEdge : plans.free.cta
  const bottomPrimaryCtaText = isEdge ? t.pricing.bottomCta.primaryBtnEdge : t.pricing.bottomCta.primaryBtn

  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    // 挂载后启动定时器，每分钟校准一次当前时间与倒计时天数
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  const searchPreview =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('preview')
      : null

  const isPreviewYearly = searchPreview === 'yearly'
  const isPreviewLifetime = searchPreview === 'lifetime'

  const remainingMs = PROMO_DEADLINE_MS - now
  // 活动有效性：在倒计时截止前有效；若携带 preview=yearly 则模拟倒计时已结束，若携带 preview=lifetime 则强制保持特惠活动
  const isPromotionActive = isPreviewLifetime || (!isPreviewYearly && remainingMs > 0)
  const daysLeft = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)))

  // 默认展示买断版；倒计时结束（或 preview=yearly）则默认展示年付版
  const [isFlipped, setIsFlipped] = useState(() => {
    if (isPreviewLifetime) return false
    if (isPreviewYearly) return true
    return PROMO_DEADLINE_MS - Date.now() <= 0
  })

  // 当倒计时到达截止时间（活动结束）时，自动翻转至默认展示年付版
  useEffect(() => {
    if (!isPromotionActive) {
      setIsFlipped(true)
    }
  }, [isPromotionActive])

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx((prev) => (prev === idx ? null : idx))
  }

  return (
    <>
      {/* SECTION 5: TRANSPARENT PRICING */}
      <section id="pricing" className="w-full py-12 md:py-20 bg-surface scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-1.5 md:px-4 md:py-1.5 md:rounded-full md:bg-surface-container-high md:border md:border-outline-variant/25 md:shadow-sm mb-1.5 md:mb-3">
              <Tag className="hidden md:inline-block w-3.5 h-3.5 text-primary" />
              <span className="font-code-label text-[11px] text-primary md:text-on-surface font-bold md:font-semibold tracking-wider uppercase">
                {t.pricing.pillBadge}
              </span>
            </div>
            <h2 className="font-headline-md md:font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold tracking-tight">
              {t.pricing.title}
            </h2>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-2xl mt-2 md:mt-3 leading-relaxed">
              {t.pricing.description}
            </p>
          </div>

          {/* 3 Tier Cards (On mobile: Community -> Lifetime -> Monthly for conversion; on lg+: Free | Monthly | Lifetime) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10 items-stretch">
            {/* Tier 1: Community Edition */}
            <div className="order-1 p-5 sm:p-7 rounded-xl md:rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="hidden lg:inline-block px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-code-label text-[11px] font-semibold uppercase mb-4">
                  {plans.free.badge}
                </div>

                {/* Mobile compact header with right-aligned price; desktop stacked */}
                <div className="flex items-start justify-between gap-3 lg:block mb-4 lg:mb-0">
                  <div className="min-w-0">
                    <h3 className="font-headline-sm text-lg lg:text-xl text-on-surface font-bold mb-1">
                      {plans.free.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant lg:mb-5 leading-relaxed lg:min-h-[2.5rem]">
                      {plans.free.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 lg:hidden">
                    <span className="font-headline-lg text-3xl font-bold text-on-surface">
                      {plans.free.price}
                    </span>
                    <span className="font-code-label text-[10px] text-outline">
                      {plans.free.period}
                    </span>
                  </div>
                </div>

                <div className="hidden lg:flex items-baseline gap-1.5 mb-4">
                  <span className="font-headline-lg text-4xl font-bold text-on-surface">
                    {plans.free.price}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {plans.free.period}
                  </span>
                </div>

                <div className="hidden lg:block px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant text-xs font-medium mb-6">
                  {plans.free.highlightNote}
                </div>

                <ul className="space-y-2.5 lg:space-y-3 text-xs sm:text-sm text-on-surface-variant">
                  {plans.free.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 lg:mt-7 w-full min-h-[44px] py-2.5 lg:py-3 px-4 rounded-xl bg-surface-container-high lg:bg-surface-container-low text-on-surface font-semibold text-sm text-center hover:bg-surface-container transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>{freeCtaText}</span>
              </a>
            </div>

            {/* Tier 2: Pro Monthly Subscription */}
            <div className="order-3 lg:order-2 p-5 sm:p-7 rounded-xl md:rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="hidden lg:flex items-center justify-between gap-2 mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-code-label text-[11px] font-semibold uppercase">
                    {plans.monthly.badge}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-code-label text-[10px] font-semibold">
                    {plans.monthly.trialBadge}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 lg:block mb-4 lg:mb-0">
                  <div className="min-w-0">
                    <h3 className="font-headline-sm text-lg lg:text-xl text-on-surface font-bold mb-1">
                      {plans.monthly.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant lg:mb-5 leading-relaxed lg:min-h-[2.5rem]">
                      {plans.monthly.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 lg:hidden">
                    <span className="font-headline-lg text-3xl font-bold text-on-surface">
                      {plans.monthly.price}
                    </span>
                    <span className="font-code-label text-[10px] text-outline">
                      {plans.monthly.trialBadge}
                    </span>
                  </div>
                </div>

                <div className="hidden lg:flex items-baseline gap-1.5 mb-4">
                  <span className="font-headline-lg text-4xl font-bold text-on-surface">
                    {plans.monthly.price}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {plans.monthly.period}
                  </span>
                </div>

                <div className="px-3 py-2 rounded-lg bg-secondary-fixed/35 text-on-secondary-fixed text-xs font-medium mb-4 lg:mb-6">
                  {plans.monthly.highlightNote}
                </div>

                <ul className="space-y-2.5 lg:space-y-3 text-xs sm:text-sm text-on-surface-variant">
                  {plans.monthly.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-2 ${
                        idx === 0 ? 'text-on-surface font-medium' : ''
                      }`}
                    >
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={MONTHLY_CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 lg:mt-7 w-full min-h-[44px] py-2.5 lg:py-3 px-4 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm text-center hover:bg-surface-variant transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{plans.monthly.cta}</span>
              </a>
            </div>

            {/* Tier 3: 3D Flippable Pricing Card (Front: Lifetime Plan / Back: Annual Plan) */}
            <div className="order-2 lg:order-3 perspective-1400 w-full flex flex-col">
              <div
                className={`flip-card-inner relative w-full h-full flex flex-col cursor-pointer select-none group/flipper ${
                  isFlipped ? 'is-flipped' : ''
                }`}
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  if (target.closest('a, button, [data-no-flip]')) {
                    return
                  }
                  setIsFlipped((prev) => !prev)
                }}
              >
                {/* ===================== [Front Face: Lifetime License] ===================== */}
                <div className="flip-card-face w-full h-full p-5 sm:p-7 rounded-xl md:rounded-2xl bg-surface-container-lowest shadow-[0_12px_36px_rgba(0,105,72,0.12)] flex flex-col justify-between ring-2 ring-primary relative">
                  {/* Mobile Top Ribbon with Flip Indicator */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFlipped(true)
                    }}
                    className="lg:hidden bg-primary text-on-primary py-1.5 px-4 -mx-5 -mt-5 mb-4 flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-code-label text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-300 origin-center badge-star-spin" />
                      <span>{plans.lifetime.badge}</span>
                    </span>
                    <span className="font-code-label text-[10px] font-semibold bg-on-primary/20 px-2 py-0.5 rounded">
                      {isPromotionActive
                        ? plans.lifetime.countdownDaysLeft.replace('{days}', String(daysLeft))
                        : plans.lifetime.offerEnded}
                    </span>
                  </div>

                  {/* Desktop Floating Badge (Clickable to Flip) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFlipped(true)
                    }}
                    className="hidden lg:flex absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-primary text-on-primary font-code-label text-[10px] font-bold uppercase tracking-wider shadow-sm items-center gap-1.5 cursor-pointer hover:bg-primary/90 transition-all z-20 group/badge"
                    title={t.pricing.flipHintToAnnual}
                  >
                    <Star className="w-3.5 h-3.5 fill-current text-amber-300 origin-center badge-star-spin" />
                    <span>{plans.lifetime.badge}</span>
                  </div>

                  <div>
                    <div className="hidden lg:flex items-center justify-between gap-2 mb-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-code-label text-[11px] font-semibold uppercase">
                        {plans.lifetime.name}
                      </span>

                      {/* Desktop Right-aligned Countdown Pill with Tooltip */}
                      <div className="relative group/countdown" data-no-flip="true">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 font-code-label text-[10px] font-bold cursor-help transition-colors hover:bg-amber-500/25">
                          <Timer className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                          <span>
                            {isPromotionActive
                              ? plans.lifetime.countdownDaysLeft.replace('{days}', String(daysLeft))
                              : plans.lifetime.offerEnded}
                          </span>
                        </div>

                        {/* Tooltip Popover */}
                        <div className="absolute right-0 top-full mt-2 hidden group-hover/countdown:flex flex-col z-30 w-64 p-3 rounded-xl bg-surface-container-highest text-on-surface shadow-xl border border-outline-variant/30 text-xs pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150">
                          <div className="font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5 shrink-0" />
                            <span>{plans.lifetime.countdownPrefix}</span>
                          </div>
                          <p className="text-on-surface-variant text-[11px] leading-relaxed mb-2">
                            {plans.lifetime.tooltipDetail}
                          </p>
                          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                            <span className="text-on-surface-variant font-medium">
                              <span className="line-through opacity-70 mr-1">{plans.lifetime.originalPrice}</span>
                              <span className="font-bold text-primary">{plans.lifetime.price}</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-error/10 text-error font-bold text-[10px] border border-error/20">
                              {plans.lifetime.discountBadge}
                            </span>
                          </div>
                          {/* Triangle arrow */}
                          <div className="absolute -top-1.5 right-5 w-3 h-3 bg-surface-container-highest border-t border-l border-outline-variant/30 rotate-45" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3 lg:block mb-3 lg:mb-0">
                      <div className="min-w-0">
                        <h3 className="font-headline-sm text-lg lg:text-xl text-on-surface font-bold mb-1">
                          {plans.lifetime.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-on-surface-variant lg:mb-4 leading-relaxed lg:min-h-[2.5rem]">
                          {plans.lifetime.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0 lg:hidden">
                        <span className="line-through text-xs text-on-surface-variant font-medium">
                          {plans.lifetime.originalPrice}
                        </span>
                        <span className="font-headline-lg text-3xl font-bold text-primary">
                          {plans.lifetime.price}
                        </span>
                        <span className="font-code-label text-[10px] text-error font-bold">
                          {plans.lifetime.discountBadge}
                        </span>
                      </div>
                    </div>

                    <div className="hidden lg:flex items-baseline gap-2 mb-4">
                      <span className="line-through text-lg text-on-surface-variant/70 font-normal">
                        {plans.lifetime.originalPrice}
                      </span>
                      <span className="font-headline-lg text-4xl font-extrabold text-primary">
                        {plans.lifetime.price}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-error/10 text-error rounded border border-error/20">
                        {plans.lifetime.discountBadge}
                      </span>
                    </div>

                    <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold mb-4 lg:mb-6">
                      {plans.lifetime.highlightNote}
                    </div>

                    <ul className="space-y-2.5 lg:space-y-3 text-xs sm:text-sm text-on-surface-variant">
                      {plans.lifetime.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className={`flex items-start gap-2 ${
                            idx === 0
                              ? 'text-on-surface font-medium'
                              : idx === 1
                                ? 'text-primary font-semibold'
                                : ''
                          }`}
                        >
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 lg:mt-7">
                    <a
                      href={LIFETIME_CHECKOUT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full min-h-[48px] py-3 lg:py-3.5 px-4 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container active:scale-[0.98] shadow-[0_4px_16px_rgba(0,105,72,0.25)] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{plans.lifetime.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* ===================== [Back Face: Annual Plan] ===================== */}
                <div className="flip-card-face flip-card-back absolute inset-0 w-full h-full p-5 sm:p-7 rounded-xl md:rounded-2xl bg-surface-container-lowest shadow-[0_12px_36px_rgba(0,105,72,0.12)] flex flex-col justify-between ring-2 ring-primary">
                  {/* Mobile Top Ribbon with Flip Indicator */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFlipped(false)
                    }}
                    className="lg:hidden bg-primary text-on-primary py-1.5 px-4 -mx-5 -mt-5 mb-4 flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-code-label text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-300 origin-center badge-star-spin" />
                      <span>{plans.yearly.badge}</span>
                    </span>
                    <span className="font-code-label text-[10px] font-semibold bg-on-primary/20 px-2 py-0.5 rounded">
                      {plans.yearly.monthlyRateBadge}
                    </span>
                  </div>

                  {/* Desktop Floating Badge (Clickable to Flip back) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFlipped(false)
                    }}
                    className="hidden lg:flex absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-primary text-on-primary font-code-label text-[10px] font-bold uppercase tracking-wider shadow-sm items-center gap-1.5 cursor-pointer hover:bg-primary/90 transition-all z-20 group/badge"
                    title={t.pricing.flipHintToLifetime}
                  >
                    <Star className="w-3.5 h-3.5 fill-current text-amber-300 origin-center badge-star-spin" />
                    <span>{plans.yearly.badge}</span>
                  </div>

                  <div>
                    <div className="hidden lg:flex items-center justify-between gap-2 mb-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-code-label text-[11px] font-semibold uppercase">
                        {plans.yearly.badge}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-code-label text-[10px] font-semibold">
                        {plans.yearly.monthlyRateBadge}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3 lg:block mb-3 lg:mb-0">
                      <div className="min-w-0">
                        <h3 className="font-headline-sm text-lg lg:text-xl text-on-surface font-bold mb-1">
                          {plans.yearly.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-on-surface-variant lg:mb-4 leading-relaxed lg:min-h-[2.5rem]">
                          {plans.yearly.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0 lg:hidden">
                        <span className="line-through text-xs text-on-surface-variant font-medium">
                          {plans.yearly.originalPrice}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline-lg text-3xl font-bold text-primary">
                            {plans.yearly.price}
                          </span>
                          <span className="text-[10px] text-primary font-semibold">
                            {plans.yearly.period}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:flex items-baseline gap-2 mb-4">
                      <span className="line-through text-lg text-on-surface-variant/70 font-normal">
                        {plans.yearly.originalPrice}
                      </span>
                      <span className="font-headline-lg text-4xl font-extrabold text-primary">
                        {plans.yearly.price}
                      </span>
                      <span className="text-xs text-primary font-semibold">
                        {plans.yearly.period}
                      </span>
                    </div>

                    <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold mb-4 lg:mb-6">
                      {plans.yearly.highlightNote}
                    </div>

                    <ul className="space-y-2.5 lg:space-y-3 text-xs sm:text-sm text-on-surface-variant">
                      {plans.yearly.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className={`flex items-start gap-2 ${
                            idx === 0
                              ? 'text-on-surface font-medium'
                              : idx === 1
                                ? 'text-primary font-semibold'
                                : ''
                          }`}
                        >
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 lg:mt-7">
                    <a
                      href={YEARLY_CHECKOUT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full min-h-[48px] py-3 lg:py-3.5 px-4 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container active:scale-[0.98] shadow-[0_4px_16px_rgba(0,105,72,0.25)] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{plans.yearly.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges Strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-on-surface-variant font-code-label text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>{t.pricing.trustBadges.moneyBack}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-primary shrink-0" />
              <span>{t.pricing.trustBadges.instantDelivery}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <span>{t.pricing.trustBadges.sslCheckout}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faq" className="w-full py-12 md:py-20 bg-surface-container-low/50 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start text-left md:items-center md:text-center mb-6 md:mb-10">
            <div className="inline-flex items-center gap-1.5 md:px-4 md:py-1.5 md:rounded-full md:bg-surface-container-high md:border md:border-outline-variant/25 md:shadow-sm mb-1.5 md:mb-3">
              <HelpCircle className="hidden md:inline-block w-3.5 h-3.5 text-primary" />
              <span className="font-code-label text-[11px] text-primary md:text-on-surface font-bold md:font-semibold tracking-wider uppercase">
                {t.pricing.faqBadge}
              </span>
            </div>
            <h2 className="font-headline-md md:font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold tracking-tight">
              {t.pricing.faqTitle}
            </h2>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-xl mt-2 leading-relaxed">
              {t.pricing.faqSubtitle}
            </p>
          </div>

          <div className="space-y-2.5 md:space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-surface-container-lowest border border-outline-variant/25 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-container-low/40 transition-colors"
                  >
                    <span className="font-headline-sm text-sm sm:text-base text-on-surface font-bold sm:font-semibold leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-primary shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-surface-container-low font-body-sm sm:font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7: FINAL BOTTOM CTA BANNER */}
      <section className="w-full py-10 md:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-10 md:p-12 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-primary-container to-secondary text-on-primary shadow-[0_20px_48px_-12px_rgba(0,105,72,0.3)] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-on-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-on-primary/15 text-on-primary font-code-label text-[11px] font-semibold mb-3 sm:mb-4">
                <Zap className="w-3.5 h-3.5 sm:hidden" />
                <BadgeCheck className="w-3.5 h-3.5 hidden sm:inline-block" />
                <span>{t.pricing.bottomCta.badge}</span>
              </div>
              <h2 className="font-headline-md sm:font-headline-lg text-2xl sm:text-3xl font-bold tracking-tight text-on-primary leading-tight">
                {t.pricing.bottomCta.title}
              </h2>
              <p className="font-body-md text-sm sm:text-base text-on-primary/90 mt-2.5 leading-relaxed">
                {t.pricing.bottomCta.description}
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full md:w-auto">
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-6 py-3 rounded-xl sm:rounded-full bg-surface-container-lowest text-primary font-bold text-sm text-center shadow-md hover:bg-surface-container-low active:scale-[0.98] transition-all inline-flex items-center justify-center whitespace-nowrap"
              >
                {bottomPrimaryCtaText}
              </a>
              <a
                href="#pricing"
                className="min-h-[44px] px-6 py-3 rounded-xl sm:rounded-full bg-on-primary/15 text-on-primary font-semibold text-sm text-center hover:bg-on-primary/25 transition-all inline-flex items-center justify-center whitespace-nowrap"
              >
                {t.pricing.bottomCta.secondaryBtn}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
