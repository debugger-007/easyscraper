import React from 'react'
import { Link } from '@tanstack/react-router'
import type { TranslationSchema } from '../locales/types'
import { useTranslate } from '../locales'
import { PrismLogo } from './PrismLogo'
import {
  TELEGRAM_CHANNEL_HANDLE,
  TELEGRAM_CHANNEL_URL,
} from '../config/extension'
import { useDetectedBrowser } from '../utils/browserDetector'
import { BrowserStoreIcon } from './icons/BrowserIcons'
import { ShieldCheck, CloudOff, Cookie, ArrowUpRight } from 'lucide-react'

interface FooterProps {
  t?: TranslationSchema
}

export const Footer: React.FC<FooterProps> = ({ t: propT }) => {
  const { t: hookT } = useTranslate()
  const t = propT || hookT
  const { isEdge, browser, storeUrl } = useDetectedBrowser()
  const installBtnText = isEdge ? t.footer.installBtnEdge : t.footer.installBtn

  const badgeIcons: Record<string, React.ReactNode> = {
    shield: <ShieldCheck className="w-3.5 h-3.5 text-primary" />,
    cloud_off: <CloudOff className="w-3.5 h-3.5 text-secondary" />,
    cookie_off: <Cookie className="w-3.5 h-3.5 text-on-surface-variant" />,
  }

  return (
    <footer className="w-full border-t border-outline-variant/25 bg-surface-container-low md:bg-surface-container-lowest shadow-[0_-1px_8px_rgba(19,27,46,0.02)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-8 md:pb-10 space-y-8 md:space-y-12">
        {/* Top Grid: 2-col links on mobile, 5-col on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Column 1: Brand & Tagline */}
          <div className="col-span-2 space-y-3 md:space-y-4">
            <div className="flex items-center gap-2.5">
              <PrismLogo size={40} />
              <div className="flex items-center gap-2">
                <span className="font-headline-sm font-bold text-base sm:text-lg text-on-surface tracking-tight">
                  Easy Web Scraper
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-code-label text-[10px] font-bold">
                  MV3
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
              {t.footer.tagline}
            </p>
            <p className="hidden sm:block text-xs text-on-surface-variant/80 max-w-sm leading-relaxed">
              {t.footer.privacyNotice}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
              {t.footer.badges.map((b, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest md:bg-surface-container-low border border-outline-variant/25 font-code-label text-[10px] sm:text-[11px] text-on-surface-variant"
                >
                  {badgeIcons[b.icon] || <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
                  <span>{b.label}</span>
                </div>
              ))}
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                title={t.footer.telegramChannel}
                aria-label={`${t.footer.telegramChannel} ${TELEGRAM_CHANNEL_HANDLE}`}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#229ED9]/10 hover:bg-[#229ED9]/15 border border-[#229ED9]/30 hover:border-[#229ED9]/55 font-code-label text-[10px] sm:text-[11px] font-medium text-[#1b86ba] transition-all"
              >
                <svg
                  className="w-3.5 h-3.5 text-[#229ED9] shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <span>{TELEGRAM_CHANNEL_HANDLE}</span>
                <ArrowUpRight className="w-3 h-3 opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Columns 2-3: Categorized Links (side-by-side 2-col on mobile) */}
          {t.footer.columns.map((col, idx) => (
            <div key={idx} className="col-span-1 space-y-2.5 md:space-y-3">
              <h4 className="font-code-label text-[11px] sm:text-xs uppercase tracking-wider text-outline md:text-on-surface font-bold">
                {col.title}
              </h4>
              <ul className="space-y-1.5 md:space-y-2.5 text-xs sm:text-sm text-on-surface-variant">
                {col.links.map((link, lIdx) => {
                  const isInternalRoute = link.href.startsWith('/')
                  return (
                    <li key={lIdx}>
                      {isInternalRoute ? (
                        <Link
                          to={link.href as any}
                          className="inline-block py-0.5 hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="inline-block py-0.5 hover:text-primary transition-colors"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          {/* Column 4: Local Status Card */}
          <div className="col-span-2 lg:col-span-1 space-y-2.5 md:space-y-3">
            <h4 className="font-code-label text-[11px] sm:text-xs uppercase tracking-wider text-outline md:text-on-surface font-bold">
              {t.compliance.pillBadge}
            </h4>
            <div className="p-4 rounded-xl bg-surface-container-lowest md:bg-surface-container-low/80 border border-outline-variant/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-code-label text-primary font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span>{t.footer.allSystemsLocal}</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t.footer.zeroCookies}
              </p>
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[42px] py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-container active:scale-[0.98] text-on-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <BrowserStoreIcon browser={browser} className="w-3.5 h-3.5 shrink-0" />
                <span>{installBtnText}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-5 md:pt-6 border-t border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2 flex-wrap">
            <span>{t.footer.copyright}</span>
            <span className="hidden md:inline text-outline-variant">•</span>
            <span className="hidden md:inline">{t.footer.builtWith}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap font-code-label text-[11px]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest md:bg-surface-container-low text-primary font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
              <span>{t.footer.allSystemsLocal}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
