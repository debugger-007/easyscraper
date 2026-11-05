import { i18n, normalizeLocale } from '../i18n'
import type { TranslationSchema } from '../i18n/types'

export * from '../i18n'
export { zh_CN as zh } from '../i18n/locales/zh_CN'
export { en } from '../i18n/locales/en'

export function getTranslation(locale?: string): TranslationSchema {
  return i18n.getDictionary(locale ? normalizeLocale(locale) : undefined)
}

export function getLocale(locale?: string): string {
  return locale ? normalizeLocale(locale) : i18n.getLocale()
}
