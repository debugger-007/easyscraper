import { en } from './en'
import { zh } from './zh'
import type { SupportedLocale, TranslationSchema } from './types'

export * from './types'
export { en, zh }

export const supportedLocales: readonly SupportedLocale[] = ['en', 'zh'] as const
export const defaultLocale: SupportedLocale = 'en'

export const translations: Record<SupportedLocale, TranslationSchema> = {
  en,
  zh,
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (supportedLocales as readonly string[]).includes(locale)
}

export function getTranslation(locale?: string): TranslationSchema {
  if (locale && isSupportedLocale(locale)) {
    return translations[locale]
  }
  return translations[defaultLocale]
}

export function getLocale(locale?: string): SupportedLocale {
  if (locale && isSupportedLocale(locale)) {
    return locale
  }
  return defaultLocale
}

