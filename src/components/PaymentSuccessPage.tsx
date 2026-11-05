import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { PrismLogo } from './PrismLogo'
import type { SupportedLocale, TranslationSchema } from '../locales/types'
import { useTranslate, normalizeLocale } from '../locales'
import {
  CheckCircle2,
  Copy,
  Check,
  Globe,
  ChevronDown,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Key,
  Layers,
  CreditCard,
  Hash,
  HelpCircle,
} from 'lucide-react'

export interface PaymentSuccessInfo {
  subscription_id?: string
  payment_id?: string
  status?: string
  license_key?: string
  email?: string
}

interface PaymentSuccessPageProps {
  info: PaymentSuccessInfo
  currentLocale?: SupportedLocale
  t?: TranslationSchema
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({
  info,
  currentLocale: overrideLocale,
}) => {
  const { t, locale, changeLanguage, supportedLocales } = useTranslate(overrideLocale)
  const isEn = locale === 'en'
  const langParam = isEn ? undefined : { lang: 'zh' }

  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedPayId, setCopiedPayId] = useState(false)
  const [copiedSubId, setCopiedSubId] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const handleLanguageSwitch = (newLocale: SupportedLocale) => {
    setLangMenuOpen(false)
    changeLanguage(newLocale)
  }

  const handleCopy = async (
    text: string,
    setCopied: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignored if clipboard access is denied
    }
  }

  const p = t.paymentSuccess
  const hasDetails = Boolean(info.license_key || info.payment_id || info.subscription_id || info.email)
  const isMonthlySubscription = Boolean(info.subscription_id)

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Header bar */}
      <header className="w-full border-b border-outline-variant/30 bg-surface-container-low/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link
            to={isEn ? '/' : '/$lang'}
            params={langParam}
            className="flex items-center gap-2.5 text-on-surface hover:opacity-90 transition-opacity"
          >
            <PrismLogo size={28} />
            <span className="font-headline-md font-bold text-base tracking-tight">
              Easy Web Scraper
            </span>
          </Link>

          {/* Right actions: Language Switcher & Home Button */}
          <div className="flex items-center gap-3">
            {/* Language dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-xs font-code-label text-on-surface transition-colors cursor-pointer whitespace-nowrap"
                aria-label={t.nav.switchLanguage}
                title={t.nav.switchLanguage}
              >
                <Globe className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="font-medium whitespace-nowrap">
                  {t.nav.languages[locale] || t.nav.languages[normalizeLocale(locale)] || 'English'}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-on-surface-variant opacity-70 shrink-0 transition-transform duration-200 ${langMenuOpen ? 'rotate-180 text-secondary opacity-100' : ''
                    }`}
                />
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-36 rounded-xl bg-surface-container border border-outline-variant/40 shadow-xl py-1 z-50 text-xs font-code-label backdrop-blur-xl">
                    {supportedLocales.map((loc) => {
                      const isSelected = normalizeLocale(locale) === normalizeLocale(loc)
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleLanguageSwitch(loc)}
                          className={`w-full text-left px-3.5 py-2 hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer whitespace-nowrap ${isSelected ? 'text-secondary font-bold bg-secondary/10' : 'text-on-surface'
                            }`}
                        >
                          <span>{t.nav.languages[loc]}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 shadow-[0_0_6px_rgba(76,215,246,0.8)]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Back to Home */}
            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-label text-on-surface transition-colors border border-outline-variant/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{p.backHome}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[860px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        {/* Celebration Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold tracking-wider uppercase font-code-label">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{p.badge}</span>
            </div>
            <h1 className="font-display-lg text-2xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
              {p.title}
            </h1>
            <p className="text-sm sm:text-base font-body-base text-on-surface-variant leading-relaxed">
              {p.subtitle}
            </p>
          </div>
        </div>

        {/* License Key Hero Card */}
        <div className="relative glass-card rounded-2xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.12)] bg-gradient-to-b from-emerald-500/10 via-surface-container-low to-surface-container-low">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Key className="w-5 h-5 shrink-0" />
                <h2 className="font-bold text-base sm:text-lg text-on-surface">
                  {p.licenseKeyTitle}
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold font-code-label border border-emerald-500/30">
                Pro
              </span>
            </div>

            {/* License Key Display & Copy Action */}
            {info.license_key ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-surface-container-highest/70 border border-emerald-500/30">
                  <div className="font-mono text-sm sm:text-base font-bold text-emerald-300 tracking-wider break-all select-all select-text">
                    {info.license_key}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(info.license_key || '', setCopiedKey)}
                    className="shrink-0 h-11 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{p.copiedKey}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{p.copyKey}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant/80 font-code-label">
                  {p.licenseKeySubtitle}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary shrink-0" />
                <span>{p.noKeyProvided}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Summary Card */}
        {hasDetails && (
          <div className="glass-card rounded-2xl p-6 sm:p-7 border border-outline-variant/30 space-y-4">
            <div className="flex items-center gap-2 text-on-surface pb-3 border-b border-outline-variant/20">
              <CreditCard className="w-4 h-4 text-secondary" />
              <h3 className="font-bold text-sm sm:text-base">
                {p.orderDetailsTitle}
              </h3>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-code-label">
              {/* Order Status */}
              <div className="space-y-1 p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20">
                <dt className="text-on-surface-variant text-[11px] uppercase tracking-wider">
                  {p.statusLabel}
                </dt>
                <dd className="flex items-center gap-2 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-bold">
                    {p.statusActive}
                  </span>
                </dd>
              </div>

              {/* Plan Type */}
              <div className="space-y-1 p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20">
                <dt className="text-on-surface-variant text-[11px] uppercase tracking-wider">
                  {p.planTypeLabel}
                </dt>
                <dd className="flex items-center gap-2 pt-0.5 text-on-surface font-semibold">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {isMonthlySubscription ? p.typeMonthly : p.typeLifetime}
                  </span>
                </dd>
              </div>

              {/* Billing Email */}
              {info.email && (
                <div className="space-y-1 p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20">
                  <dt className="text-on-surface-variant text-[11px] uppercase tracking-wider">
                    {p.emailLabel}
                  </dt>
                  <dd className="text-on-surface font-medium break-all select-all">
                    {info.email}
                  </dd>
                </div>
              )}

              {/* Payment ID */}
              {info.payment_id && (
                <div className="space-y-1 p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20">
                  <dt className="text-on-surface-variant text-[11px] uppercase tracking-wider">
                    {p.paymentIdLabel}
                  </dt>
                  <dd className="flex items-center justify-between gap-2 text-on-surface font-mono break-all select-all">
                    <span>{info.payment_id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(info.payment_id || '', setCopiedPayId)}
                      className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer shrink-0"
                      title={copiedPayId ? p.copiedKey : p.copyKey}
                    >
                      {copiedPayId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </dd>
                </div>
              )}

              {/* Subscription ID (if applicable) */}
              {info.subscription_id && (
                <div className="space-y-1 p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20 sm:col-span-2">
                  <dt className="text-on-surface-variant text-[11px] uppercase tracking-wider">
                    {p.subscriptionIdLabel}
                  </dt>
                  <dd className="flex items-center justify-between gap-2 text-on-surface font-mono break-all select-all">
                    <span>{info.subscription_id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(info.subscription_id || '', setCopiedSubId)}
                      className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer shrink-0"
                      title={copiedSubId ? p.copiedKey : p.copyKey}
                    >
                      {copiedSubId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* 3-Step Quick Activation Guide */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 border border-outline-variant/30 space-y-6">
          <div className="flex items-center gap-2 text-on-surface">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm sm:text-base">
              {p.activationTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/20 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-on-surface">
                {p.step1Title}
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {p.step1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/20 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-on-surface">
                {p.step2Title}
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {p.step2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/20 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-on-surface">
                {p.step3Title}
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {p.step3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons & Notice */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              <span>{p.installExtension}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all border border-outline-variant/40 hover:border-outline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{p.backHome}</span>
            </Link>
          </div>

          <div className="text-center p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 text-xs text-on-surface-variant flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-secondary shrink-0" />
            <span>{p.emailNotice}</span>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-outline-variant/20 py-8 bg-surface-container-low/50 text-center text-xs text-on-surface-variant font-code-label">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>256-Bit SSL Encrypted Verification • 100% Local Privacy</span>
          </div>
          <div>
            <span>© 2026 Easy Web Scraper. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

