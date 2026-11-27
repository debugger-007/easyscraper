import React, { useEffect, useRef, useState } from 'react'
import { Languages } from 'lucide-react'
import type { SupportedLocale } from '../i18n/types'
import { useTranslate, normalizeLocale } from '../i18n'

interface LanguageSwitcherProps {
  currentLocale?: SupportedLocale
  onSelect?: (locale: SupportedLocale) => void
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLocale,
  onSelect,
}) => {
  const { t, locale, changeLanguage, supportedLocales } = useTranslate(currentLocale)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const normalizedLocale = normalizeLocale(locale)
  const currentLangLabel =
    t.nav.languages[locale] ||
    t.nav.languages[normalizedLocale] ||
    t.nav.languages.en

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleSelect = (nextLocale: SupportedLocale) => {
    setOpen(false)
    onSelect?.(nextLocale)
    changeLanguage(nextLocale)
  }

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          open
            ? 'bg-primary/10 text-primary'
            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
        }`}
        title={`${t.nav.switchLanguage}: ${currentLangLabel}`}
        aria-label={t.nav.switchLanguage}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Languages className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute right-0 top-full pt-2 z-50">
          <div
            role="menu"
            className="w-36 py-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-[0_12px_32px_-4px_rgba(19,27,46,0.12)]"
          >
            {supportedLocales.map((loc) => {
              const isSelected = normalizedLocale === normalizeLocale(loc)
              return (
                <button
                  key={loc}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(loc)}
                  className={`w-full text-left px-3 py-2.5 text-xs font-code-label flex items-center justify-between hover:bg-surface-container-low transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'text-primary font-bold bg-primary/8'
                      : 'text-on-surface'
                  }`}
                >
                  <span>{t.nav.languages[loc]}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
