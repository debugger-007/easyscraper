import React from 'react'
import type { TranslationSchema } from '../locales/types'
import { PrismLogo } from './PrismLogo'
import { Shield, CloudOff, Cookie } from 'lucide-react'

interface FooterProps {
  t: TranslationSchema
}

export const Footer: React.FC<FooterProps> = ({ t }) => {
  const badgeIcons: Record<string, React.ReactNode> = {
    shield: <Shield className="w-3.5 h-3.5 text-secondary" />,
    cloud_off: <CloudOff className="w-3.5 h-3.5 text-on-surface-variant" />,
    cookie_off: <Cookie className="w-3.5 h-3.5 text-on-surface-variant" />,
  }

  return (
    <footer className="mt-20 border-t border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-xl">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-14 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <PrismLogo size={28} />
              <span className="font-headline-md font-bold text-lg text-on-surface">
                Easy Web Scraper
              </span>
            </div>
            <p className="text-xs sm:text-sm font-body-sm text-on-surface-variant max-w-sm leading-relaxed">
              {t.footer.tagline}
            </p>
            <p className="text-xs font-body-sm text-on-surface-variant/70 max-w-sm">
              {t.footer.privacyNotice}
            </p>
          </div>

          {/* Columns 2-4: Categorized Links */}
          {t.footer.columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="font-code-label text-xs uppercase tracking-wider text-secondary font-bold">
                {col.title}
              </h4>
              <ul className="space-y-2 text-xs font-body-sm text-on-surface-variant">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href={link.href}
                      className="hover:text-on-surface transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 5: Trust & Status Card */}
          <div className="space-y-3">
            <h4 className="font-code-label text-xs uppercase tracking-wider text-tertiary font-bold">
              Trust &amp; Status
            </h4>
            <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline-variant/30 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-code-label text-secondary">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>{t.footer.allSystemsLocal}</span>
              </div>
              <p className="text-[11px] text-on-surface-variant font-body-sm leading-relaxed">
                {t.footer.zeroCookies}
              </p>
              <a
                href="https://chromewebstore.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded bg-primary-container hover:brightness-110 active:scale-95 text-on-primary-container text-xs font-headline-md font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" fill="#ffffff" fillOpacity="0.1" r="10" />
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 12.68 2.07 13.34 2.2 13.98L7.87 4.15C9.07 2.82 10.47 2 12 2Z" fill="#EA4335" />
                  <path d="M12 2C17.52 2 22 6.48 22 12C22 12.68 21.93 13.34 21.8 13.98L12 13.98L8.76 8.37L12 2Z" fill="#4285F4" />
                  <path d="M2.2 13.98C3.12 18.66 7.24 22 12 22C15.86 22 19.23 19.82 20.91 16.63L15.3 16.63L12 12L2.2 13.98Z" fill="#34A853" />
                  <circle cx="12" cy="12" fill="#FBBC05" r="4" />
                </svg>
                <span>{t.footer.installBtn}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance declaration */}
        <div className="pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-code-label text-on-surface-variant">
          <div className="flex items-center gap-2 flex-wrap">
            <span>{t.footer.copyright}</span>
            <span className="hidden md:inline text-outline/40">|</span>
            <span className="hidden md:inline text-outline">{t.footer.builtWith}</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {t.footer.badges.map((b, idx) => (
              <span key={idx} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                {badgeIcons[b.icon] || <Shield className="w-3.5 h-3.5 text-secondary" />}
                <span>{b.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

