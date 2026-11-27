import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PrismLogo } from '../PrismLogo'
import { LanguageSwitcher } from '../LanguageSwitcher'
import type { SupportedLocale } from '../../i18n/types'
import { useTranslate } from '../../i18n'
import { ClipWorkspace } from './ClipWorkspace'

export interface ClipSearchParams {
  session?: string
  url?: string
  extId?: string
  extensionId?: string
}

export function validateClipSearch(search: Record<string, unknown>): ClipSearchParams {
  const extId =
    typeof search.extId === 'string'
      ? search.extId
      : typeof search.extensionId === 'string'
      ? search.extensionId
      : undefined
  return {
    session: typeof search.session === 'string' ? search.session : undefined,
    url: typeof search.url === 'string' ? search.url : undefined,
    extId,
    extensionId: extId,
  }
}

interface ClipPageShellProps {
  initialLocale: SupportedLocale
  search: ClipSearchParams
}

export function ClipPageShell({ initialLocale, search }: ClipPageShellProps) {
  const { t, locale } = useTranslate(initialLocale)
  const isEn = locale === 'en'
  const langParam = isEn ? undefined : { lang: 'zh' }
  const backHomeLabel = t.clip.backHome || t.legal.actions.home

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Studio Header */}
      <header className="sticky top-0 z-40 border-b border-outline-variant/25 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(19,27,46,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
            >
              <PrismLogo size={34} />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2.5">
                <span className="text-base font-bold tracking-tight text-on-surface">
                  Easy Web Scraper
                </span>
                <span className="text-[10px] uppercase font-code-label text-primary font-semibold tracking-wider">
                  OMNICLIP STUDIO
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher currentLocale={initialLocale} />

            {/* Back to Home */}
            <Link
              to={isEn ? '/' : '/$lang'}
              params={langParam}
              aria-label={backHomeLabel}
              title={backHomeLabel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-xs font-medium shadow-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{backHomeLabel}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col">
        <ClipWorkspace
          session={search.session}
          url={search.url}
          extId={search.extId || search.extensionId}
        />
      </main>

      {/* Minimal Botanical Precision Footer */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant/20 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-on-surface-variant text-xs">
          <span>{t.footer.copyright}</span>
          <span className="font-code-label text-[10px] uppercase tracking-wider text-on-surface-variant/80">
            {t.footer.allSystemsLocal}
          </span>
        </div>
      </footer>
    </div>
  )
}
