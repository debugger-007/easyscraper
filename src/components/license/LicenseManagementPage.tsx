import React, { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { PrismLogo } from '../PrismLogo'
import type { SupportedLocale } from '../../locales/types'
import { useTranslate, normalizeLocale } from '../../locales'
import {
  Key,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  Globe,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Shield,
  Trash2,
  Search,
  SlidersHorizontal,
  Calendar,
} from 'lucide-react'
import {
  validateLicense,
  deactivateLicense,
  fetchLicenseDevices,
  type DeviceInfo,
} from '../../services/license/licenseClient'

interface LicenseManagementPageProps {
  initialKey?: string
  initialInstanceId?: string
  currentLocale?: SupportedLocale
}

export const LicenseManagementPage: React.FC<LicenseManagementPageProps> = ({
  initialKey = '',
  initialInstanceId = '',
  currentLocale: overrideLocale,
}) => {
  const { t, locale, changeLanguage, supportedLocales } = useTranslate(overrideLocale)
  const isEn = locale === 'en'
  const langParam = isEn ? undefined : { lang: 'zh' }

  const [licenseKey, setLicenseKey] = useState(initialKey)
  const [instanceId, setInstanceId] = useState(initialInstanceId)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [showManualMode, setShowManualMode] = useState(Boolean(initialInstanceId))

  // Devices querying state
  const [isFetchingDevices, setIsFetchingDevices] = useState(false)
  const [devices, setDevices] = useState<DeviceInfo[] | null>(null)
  const [activationsLimit, setActivationsLimit] = useState<number | null | undefined>(null)
  const [deactivatingDeviceId, setDeactivatingDeviceId] = useState<string | null>(null)

  // Validation / Deactivation state
  const [isChecking, setIsChecking] = useState(false)
  const [isDeactivatingManual, setIsDeactivatingManual] = useState(false)
  const [deactivateSuccess, setDeactivateSuccess] = useState(false)
  const [lastDeactivatedName, setLastDeactivatedName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoNotice, setInfoNotice] = useState<string | null>(null)

  // FAQ Accordion state
  const [faqOpen1, setFaqOpen1] = useState(true)
  const [faqOpen2, setFaqOpen2] = useState(false)

  useEffect(() => {
    if (initialKey) setLicenseKey(initialKey)
    if (initialInstanceId) {
      setInstanceId(initialInstanceId)
      setShowManualMode(true)
    }
  }, [initialKey, initialInstanceId])

  const handleLanguageSwitch = (newLocale: SupportedLocale) => {
    setLangMenuOpen(false)
    changeLanguage(newLocale)
  }

  // 1. Fetch devices via backend API
  const handleFetchDevices = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage(null)
    setInfoNotice(null)
    setDeactivateSuccess(false)

    const key = licenseKey.trim()
    if (!key) {
      setErrorMessage(t.license.errorNotFound)
      return
    }

    setIsFetchingDevices(true)

    try {
      const res = await fetchLicenseDevices(key)

      if (res.code === 'API_KEY_NOT_CONFIGURED') {
        // Fallback to manual mode gracefully
        setInfoNotice(t.license.apiKeyNotConfigured)
        setShowManualMode(true)
        setDevices(null)
        return
      }

      if (!res.valid) {
        if (res.code === 'NOT_FOUND') {
          setErrorMessage(t.license.errorNotFound)
        } else if (res.code === 'DISABLED') {
          setErrorMessage(t.license.statusDisabled)
        } else {
          setErrorMessage(res.error || t.license.statusInvalid)
        }
        setDevices(null)
        return
      }

      setDevices(res.devices)
      setActivationsLimit(res.activationsLimit)
    } catch {
      setErrorMessage(t.license.errorGeneric)
    } finally {
      setIsFetchingDevices(false)
    }
  }

  // 2. Deactivate a specific device from list
  const handleDeactivateDevice = async (device: DeviceInfo) => {
    const key = licenseKey.trim()
    if (!key) return

    setErrorMessage(null)
    setDeactivateSuccess(false)
    setDeactivatingDeviceId(device.id)

    try {
      const res = await deactivateLicense(key, device.id)
      if (res.success) {
        setDeactivateSuccess(true)
        setLastDeactivatedName(device.name)
        // Remove from current list
        setDevices((prev) => (prev ? prev.filter((d) => d.id !== device.id) : []))
      } else {
        if (res.statusCode === 404) {
          setErrorMessage(t.license.errorNotFound)
        } else if (res.statusCode === 403) {
          setErrorMessage(t.license.errorForbidden)
        } else {
          setErrorMessage(t.license.errorGeneric)
        }
      }
    } catch {
      setErrorMessage(t.license.errorGeneric)
    } finally {
      setDeactivatingDeviceId(null)
    }
  }

  // 3. Manual validation
  const handleCheckLicense = async () => {
    setErrorMessage(null)
    setInfoNotice(null)
    setDeactivateSuccess(false)

    if (!licenseKey.trim()) {
      setErrorMessage(t.license.errorNotFound)
      return
    }

    setIsChecking(true)
    try {
      const res = await validateLicense(licenseKey, instanceId)
      if (!res.valid) {
        if (res.statusCode === 404) {
          setErrorMessage(t.license.errorNotFound)
        } else if (res.statusCode === 403) {
          setErrorMessage(t.license.statusDisabled)
        } else {
          setErrorMessage(t.license.statusInvalid)
        }
      } else {
        setInfoNotice(t.license.statusValid)
      }
    } catch {
      setErrorMessage(t.license.errorGeneric)
    } finally {
      setIsChecking(false)
    }
  }

  // 4. Manual deactivation
  const handleManualDeactivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setDeactivateSuccess(false)

    const key = licenseKey.trim()
    const inst = instanceId.trim()

    if (!key || !inst) {
      setErrorMessage(t.license.errorEmptyFields)
      return
    }

    setIsDeactivatingManual(true)
    try {
      const res = await deactivateLicense(key, inst)
      if (res.success) {
        setDeactivateSuccess(true)
        setLastDeactivatedName(inst)
        setInstanceId('')
      } else {
        if (res.statusCode === 404) {
          setErrorMessage(t.license.errorNotFound)
        } else if (res.statusCode === 403) {
          setErrorMessage(t.license.errorForbidden)
        } else {
          setErrorMessage(t.license.errorGeneric)
        }
      }
    } catch {
      setErrorMessage(t.license.errorGeneric)
    } finally {
      setIsDeactivatingManual(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between selection:bg-secondary/30 selection:text-secondary-fixed">
      {/* Background radial atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-secondary/10 rounded-full blur-[140px] opacity-60" />
        <div className="absolute top-1/3 -right-40 w-[450px] h-[350px] bg-primary/5 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-50 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
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

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
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
                  className={`w-3 h-3 text-on-surface-variant opacity-70 shrink-0 transition-transform duration-200 ${
                    langMenuOpen ? 'rotate-180 text-secondary opacity-100' : ''
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
                          className={`w-full text-left px-3.5 py-2 hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'text-secondary font-bold bg-secondary/10'
                              : 'text-on-surface'
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

            {/* Back to Home Link */}
            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-xs font-code-label text-on-surface transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.license.backHome}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center">
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.license.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2.5">
            {t.license.title}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            {t.license.subtitle}
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-low/90 backdrop-blur-xl border border-outline-variant/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Success Banner */}
          {deactivateSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-400">
                  {t.license.deactivateSuccessTitle}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {t.license.deactivateSuccessDesc}
                  {lastDeactivatedName ? ` (${lastDeactivatedName})` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-300 leading-relaxed font-medium">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Info Notice Banner */}
          {infoNotice && (
            <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-3 animate-in fade-in">
              <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="text-xs text-cyan-300 font-medium">
                {infoNotice}
              </div>
            </div>
          )}

          {/* Search Form (Key Only) */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="licenseKey"
                className="block text-xs font-semibold text-on-surface mb-1.5 flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-secondary" />
                <span>{t.license.keyLabel}</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="licenseKey"
                  type="text"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value)
                    setErrorMessage(null)
                    setInfoNotice(null)
                  }}
                  placeholder={t.license.keyPlaceholder}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleFetchDevices()}
                  disabled={isFetchingDevices || !licenseKey.trim()}
                  className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 active:scale-[0.98] text-on-secondary text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-secondary/20"
                >
                  {isFetchingDevices ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="hidden sm:inline">{t.license.fetchingDevices}</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>{t.license.fetchDevicesBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Devices List Table (When devices are fetched) */}
            {devices !== null && (
              <div className="mt-6 pt-5 border-t border-outline-variant/30 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>{t.license.devicesTitle}</span>
                  </h3>
                  <span className="text-xs text-on-surface-variant font-code-label">
                    {activationsLimit
                      ? t.license.deviceCount
                          .replace('{used}', String(devices.length))
                          .replace('{total}', String(activationsLimit))
                      : t.license.unlimitedDevices.replace('{used}', String(devices.length))}
                  </span>
                </div>

                {devices.length === 0 ? (
                  <div className="p-4 rounded-xl bg-surface-container/50 text-center text-xs text-on-surface-variant">
                    {t.license.noDevices}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {devices.map((device) => {
                      const isThisDeactivating = deactivatingDeviceId === device.id
                      const formattedDate = device.createdAt
                        ? new Date(device.createdAt).toLocaleDateString(
                            locale === 'zh_CN' || locale === 'zh' ? 'zh-CN' : 'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )
                        : ''

                      return (
                        <div
                          key={device.id}
                          className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-between gap-3 hover:border-outline-variant/80 transition-colors"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <Laptop className="w-4 h-4 text-secondary shrink-0" />
                              <span className="text-sm font-semibold truncate text-on-surface">
                                {device.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-on-surface-variant/70 font-mono">
                              <span title={device.id}>ID: {device.id}</span>
                              {formattedDate && (
                                <span className="flex items-center gap-1 font-sans">
                                  <Calendar className="w-3 h-3" />
                                  {formattedDate}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeactivateDevice(device)}
                            disabled={isThisDeactivating}
                            className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            {isThisDeactivating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            <span>{t.license.deactivateBtn}</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Toggle for manual input mode */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowManualMode(!showManualMode)}
                className="text-xs text-on-surface-variant/80 hover:text-secondary transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{t.license.manualTogglePrompt}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCheckLicense()}
                disabled={isChecking || !licenseKey.trim()}
                className="text-xs text-secondary/80 hover:text-secondary transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {isChecking ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>{t.license.checkBtn}</span>
              </button>
            </div>

            {/* Manual Deactivation Mode Panel */}
            {showManualMode && (
              <form
                onSubmit={handleManualDeactivate}
                className="mt-4 p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30 space-y-3.5 animate-in fade-in"
              >
                <div>
                  <label
                    htmlFor="instanceId"
                    className="block text-xs font-semibold text-on-surface mb-1 flex items-center gap-1.5"
                  >
                    <Laptop className="w-3.5 h-3.5 text-secondary" />
                    <span>{t.license.instanceIdLabel}</span>
                  </label>
                  <input
                    id="instanceId"
                    type="text"
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    placeholder={t.license.instanceIdPlaceholder}
                    className="w-full bg-surface-container-high border border-outline-variant/50 rounded-xl px-4 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary"
                  />
                  <p className="text-[11px] text-on-surface-variant/70 mt-1 leading-relaxed">
                    {t.license.instanceIdHelp}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isDeactivatingManual || !licenseKey.trim() || !instanceId.trim()}
                  className="w-full py-2 px-3 rounded-lg bg-rose-600/90 hover:bg-rose-600 active:scale-[0.99] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeactivatingManual ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.license.deactivating}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.license.deactivateBtn}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/70 px-1 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.license.faqTitle}</span>
          </h3>

          {/* FAQ Item 1 */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setFaqOpen1(!faqOpen1)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-on-surface hover:bg-surface-container/50 transition-colors cursor-pointer"
            >
              <span>{t.license.faqHowToFindInstanceTitle}</span>
              {faqOpen1 ? (
                <ChevronUp className="w-3.5 h-3.5 text-on-surface-variant" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
              )}
            </button>
            {faqOpen1 && (
              <div className="px-4 pb-3.5 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/20 pt-2.5">
                {t.license.faqHowToFindInstanceDesc}
              </div>
            )}
          </div>

          {/* FAQ Item 2 */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setFaqOpen2(!faqOpen2)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-on-surface hover:bg-surface-container/50 transition-colors cursor-pointer"
            >
              <span>{t.license.faqLimitReachedTitle}</span>
              {faqOpen2 ? (
                <ChevronUp className="w-3.5 h-3.5 text-on-surface-variant" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
              )}
            </button>
            {faqOpen2 && (
              <div className="px-4 pb-3.5 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/20 pt-2.5">
                {t.license.faqLimitReachedDesc}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 border-t border-outline-variant/20 text-center text-xs text-on-surface-variant/60">
        <p>{t.legal.footer.allRightsReserved}</p>
      </footer>
    </div>
  )
}
