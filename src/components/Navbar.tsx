import React, { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { PrismLogo } from './PrismLogo'
import type { SupportedLocale, TranslationSchema } from '../locales/types'
import { supportedLocales } from '../locales'
import { Globe, Menu, X, ChevronDown } from 'lucide-react'

interface NavbarProps {
  currentLocale: SupportedLocale
  t: TranslationSchema
}

export const Navbar: React.FC<NavbarProps> = ({ currentLocale, t }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLanguageChange = (locale: SupportedLocale) => {
    setLangMenuOpen(false)
    setMobileMenuOpen(false)
    if (locale === 'en') {
      navigate({ to: '/' })
    } else {
      navigate({ to: '/$lang', params: { lang: locale } })
    }
  }

  const navLinks = [
    { label: t.nav.hero, href: '#hero' },
    { label: t.nav.features, href: '#features' },
    { label: t.nav.sandbox, href: '#sandbox' },
    { label: t.nav.compliance, href: '#compliance' },
    { label: t.nav.faq, href: '#faq' },
  ]

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 full-width top-0 sticky z-50 transition-all duration-150">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Version */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={currentLocale === 'en' ? '/' : '/$lang'}
            params={currentLocale === 'en' ? undefined : { lang: currentLocale }}
            className="text-headline-md font-headline-md tracking-tight text-on-surface flex items-center gap-2.5 group"
          >
            <PrismLogo size={32} />
            <span className="font-headline-md text-on-surface tracking-tight font-semibold text-base sm:text-lg">
              {currentLocale === 'zh' ? 'Easy Web Scraper 简易网页爬虫' : 'Easy Web Scraper'}
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-surface-container-high px-2 py-0.5 rounded-full border border-secondary/20 text-secondary font-code-label text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            {t.nav.versionBadge}
          </span>
        </div>

        {/* Centered Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-6 text-body-sm font-body-sm">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className={`transition-colors py-1 ${
                idx === 0
                  ? 'text-secondary font-medium hover:text-secondary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Auxiliary Controls Group */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-xs font-code-label flex items-center gap-1.5 transition-colors"
              title={t.nav.switchLanguage}
            >
              <Globe className="w-3.5 h-3.5 text-secondary" />
              <span>{t.nav.languages[currentLocale]}</span>
              <ChevronDown className="w-3 h-3 text-on-surface-variant opacity-70" />
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 py-1 bg-surface-container border border-outline-variant/40 rounded-xl shadow-xl z-50 backdrop-blur-xl">
                  {supportedLocales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleLanguageChange(loc)}
                      className={`w-full text-left px-3 py-2 text-xs font-code-label flex items-center justify-between hover:bg-surface-container-high transition-colors ${
                        currentLocale === loc ? 'text-secondary font-bold bg-secondary/10' : 'text-on-surface'
                      }`}
                    >
                      <span>{t.nav.languages[loc]}</span>
                      {currentLocale === loc && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* GitHub Star Button */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container/60 hover:bg-surface-container-high border border-outline-variant/30 text-xs font-code-label text-on-surface transition-colors"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>{t.nav.github}</span>
          </a>

          {/* Divider */}
          <div className="hidden sm:block h-5 w-[1px] bg-outline-variant/30" />

          {/* Chrome Web Store CTA Button */}
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded bg-primary-container hover:brightness-110 active:scale-95 text-on-primary-container text-xs font-headline-md font-medium flex items-center gap-2 transition-all shadow-sm shrink-0"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" fill="#ffffff" fillOpacity="0.1" r="10" />
              <path d="M12 2C6.48 2 2 6.48 2 12C2 12.68 2.07 13.34 2.2 13.98L7.87 4.15C9.07 2.82 10.47 2 12 2Z" fill="#EA4335" />
              <path d="M12 2C17.52 2 22 6.48 22 12C22 12.68 21.93 13.34 21.8 13.98L12 13.98L8.76 8.37L12 2Z" fill="#4285F4" />
              <path d="M2.2 13.98C3.12 18.66 7.24 22 12 22C15.86 22 19.23 19.82 20.91 16.63L15.3 16.63L12 12L2.2 13.98Z" fill="#34A853" />
              <circle cx="12" cy="12" fill="#FBBC05" r="4" />
            </svg>
            <span className="hidden md:inline">{t.nav.installCta}</span>
            <span className="md:hidden">Chrome</span>
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-surface-container-high/60 text-on-surface hover:text-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-outline-variant/30 bg-surface/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-high hover:text-secondary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-2">
            <span className="text-[11px] font-code-label text-secondary flex items-center gap-1.5 px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              {t.nav.versionBadge}
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg text-xs font-code-label text-on-surface flex items-center gap-2 hover:bg-surface-container-high"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>{t.nav.github}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
