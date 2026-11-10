import { zh_CN } from './locales/zh_CN';
import { en } from './locales/en';
import type {
  SupportedLocale,
  LocaleDictionary,
  TranslateOptions,
  TranslateFunction,
  I18nTranslate,
  UseTranslationReturn,
} from './types';
import { useState, useEffect } from 'react';
import { useRouter, useRouterState, useNavigate } from '@tanstack/react-router';

export const STORAGE_KEY = 'easy_scraper_user_locale';

export const supportedLocales: readonly SupportedLocale[] = ['zh_CN', 'en'] as const;
export const defaultLocale: SupportedLocale = 'en';

export function normalizeLocale(locale?: string): SupportedLocale {
  if (!locale) return defaultLocale;
  const lower = locale.toLowerCase();
  if (lower === 'zh' || lower === 'zh_cn' || lower === 'zh-cn' || lower.startsWith('zh')) {
    return 'zh_CN';
  }
  if (lower === 'en' || lower.startsWith('en')) {
    return 'en';
  }
  return defaultLocale;
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale === 'zh_CN' || locale === 'en' || locale === 'zh';
}

class I18nManager {
  private static instance: I18nManager;
  private currentLocale: SupportedLocale = 'zh_CN';
  private dictionaries: Record<SupportedLocale, LocaleDictionary> = { zh_CN, en, zh: zh_CN };
  private listeners = new Set<(locale: SupportedLocale) => void>();

  private constructor() {
    this.initLocale();
  }

  public static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  private initLocale() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.setLocale(normalizeLocale(stored), false);
          return;
        }
      }
      const browserLang = (typeof navigator !== 'undefined' ? navigator.language : '').toLowerCase();
      if (browserLang.startsWith('zh')) {
        this.setLocale('zh_CN', false);
      } else {
        this.setLocale('en', false);
      }
    } catch {
      this.currentLocale = 'zh_CN';
    }
  }

  public getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  public getDictionary(locale?: SupportedLocale): LocaleDictionary {
    const loc = locale || this.currentLocale;
    return this.dictionaries[loc] || this.dictionaries.zh_CN;
  }

  public setLocale(locale: SupportedLocale | string, persist = true) {
    const normalized = normalizeLocale(locale);
    this.currentLocale = normalized;
    if (persist && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch {}
    }
    this.listeners.forEach((fn) => {
      try {
        fn(normalized);
      } catch (err) {
        console.error('[I18nManager] listener error:', err);
      }
    });
  }

  public subscribe(fn: (locale: SupportedLocale) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /**
   * 国际化翻译查找函数
   * - 无变量: t('key', defaultValue) (其中 defaultValue 为英文默认文本)
   * - 有变量: t('key', { ...params, defaultValue })
   */
  public t: TranslateFunction = ((keyPath: string, arg2?: string | TranslateOptions): string => {
    let defaultValue: string | undefined;
    let params: Record<string, string | number | boolean | undefined> | undefined;

    if (typeof arg2 === 'string') {
      defaultValue = arg2;
    } else if (typeof arg2 === 'object' && arg2 !== null) {
      const { defaultValue: def, ...rest } = arg2;
      defaultValue = def;
      params = rest;
    }

    const parts = keyPath.split('.');
    const dict = this.dictionaries[this.currentLocale] || this.dictionaries.zh_CN;

    let text: any = dict;
    for (const part of parts) {
      if (text && typeof text === 'object' && part in text) {
        text = text[part];
      } else {
        text = undefined;
        break;
      }
    }

    if (text === undefined || text === null) {
      if (this.currentLocale === 'en') {
        if (defaultValue !== undefined) {
          text = defaultValue;
        } else {
          let zhFallback: any = zh_CN;
          for (const part of parts) {
            if (zhFallback && typeof zhFallback === 'object' && part in zhFallback) {
              zhFallback = zhFallback[part];
            } else {
              zhFallback = undefined;
              break;
            }
          }
          text = zhFallback ?? keyPath;
        }
      } else {
        let zhFallback: any = zh_CN;
        for (const part of parts) {
          if (zhFallback && typeof zhFallback === 'object' && part in zhFallback) {
            zhFallback = zhFallback[part];
          } else {
            zhFallback = undefined;
            break;
          }
        }
        text = zhFallback ?? defaultValue ?? keyPath;
      }
    }

    if (typeof text === 'string' && params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v ?? ''));
      });
    }

    return typeof text === 'string' ? text : String(text ?? keyPath);
  }) as TranslateFunction;
}

export const i18n = I18nManager.getInstance();

export function createTProxy(targetLocale: SupportedLocale): I18nTranslate {
  const dict = i18n.getDictionary(targetLocale);
  const rawT = (keyPath: string, arg2?: string | TranslateOptions): string => {
    let defaultValue: string | undefined;
    let params: Record<string, string | number | boolean | undefined> | undefined;

    if (typeof arg2 === 'string') {
      defaultValue = arg2;
    } else if (typeof arg2 === 'object' && arg2 !== null) {
      const { defaultValue: def, ...rest } = arg2;
      defaultValue = def;
      params = rest;
    }

    const parts = keyPath.split('.');
    let text: any = dict;
    for (const part of parts) {
      if (text && typeof text === 'object' && part in text) {
        text = text[part];
      } else {
        text = undefined;
        break;
      }
    }

    if (text === undefined || text === null) {
      if (targetLocale === 'en') {
        if (defaultValue !== undefined) {
          text = defaultValue;
        } else {
          let zhFallback: any = zh_CN;
          for (const part of parts) {
            if (zhFallback && typeof zhFallback === 'object' && part in zhFallback) {
              zhFallback = zhFallback[part];
            } else {
              zhFallback = undefined;
              break;
            }
          }
          text = zhFallback ?? keyPath;
        }
      } else {
        let zhFallback: any = zh_CN;
        for (const part of parts) {
          if (zhFallback && typeof zhFallback === 'object' && part in zhFallback) {
            zhFallback = zhFallback[part];
          } else {
            zhFallback = undefined;
            break;
          }
        }
        text = zhFallback ?? defaultValue ?? keyPath;
      }
    }

    if (typeof text === 'string' && params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v ?? ''));
      });
    }

    return typeof text === 'string' ? text : String(text ?? keyPath);
  };

  return new Proxy(rawT, {
    apply(_target, _thisArg, argArray) {
      return (rawT as any)(...argArray);
    },
    get(_target, prop, receiver) {
      if (typeof prop === 'string' && prop in dict) {
        return (dict as any)[prop];
      }
      return Reflect.get(_target, prop, receiver);
    },
  }) as I18nTranslate;
}

export function useTranslation(overrideLocale?: SupportedLocale | string): UseTranslationReturn {
  const router = useRouter();
  const routerState = useRouterState();
  const navigate = useNavigate();
  const [, setManagerLocale] = useState<SupportedLocale>(i18n.getLocale());

  useEffect(() => {
    return i18n.subscribe((next) => setManagerLocale(next));
  }, []);

  // Priority: overrideLocale -> route path prefix -> manager's current locale
  let activeLocale: SupportedLocale = i18n.getLocale();

  if (overrideLocale) {
    activeLocale = normalizeLocale(overrideLocale);
  } else if (routerState?.location) {
    const pathname = routerState.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];

    if (firstSegment && (firstSegment === 'zh' || firstSegment === 'zh_CN')) {
      activeLocale = 'zh_CN';
    } else {
      activeLocale = 'en';
    }
  }

  // Synchronize I18nManager locale if route specifies a different locale
  useEffect(() => {
    if (activeLocale !== i18n.getLocale()) {
      i18n.setLocale(activeLocale, false);
    }
  }, [activeLocale]);

  // Route-aware language switcher preserving sub-path and search query parameters
  const changeLanguage = (nextLocale: SupportedLocale | string) => {
    const target = normalizeLocale(nextLocale);
    i18n.setLocale(target, true);

    if (!routerState?.location) return;

    const pathname = routerState.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    const isPrefixed = firstSegment === 'zh' || firstSegment === 'zh_CN';

    const subSegments = isPrefixed ? segments.slice(1) : segments;
    const subPath = subSegments.join('/');

    // Collect and preserve current search parameters (excluding route-level 'lang')
    const { lang: _unusedLang, ...currentSearch } = (routerState.location.search || {}) as Record<string, unknown>;
    const searchEntries = Object.entries(currentSearch).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    );
    const searchString = searchEntries.length > 0
      ? '?' + new URLSearchParams(searchEntries.map(([k, v]) => [k, String(v)])).toString()
      : '';

    const basePath = target === 'en'
      ? (subPath ? `/${subPath}` : '/')
      : (subPath ? `/zh/${subPath}` : '/zh');

    const destWithSearch = `${basePath}${searchString}`;

    try {
      router.history.push(destWithSearch);
    } catch {
      navigate({
        to: basePath as any,
        search: (Object.keys(currentSearch).length > 0 ? currentSearch : undefined) as any,
      });
    }
  };

  const t = createTProxy(activeLocale);

  return {
    t,
    locale: activeLocale,
    setLocale: (next) => changeLanguage(next),
    changeLanguage,
    supportedLocales,
    isSupportedLocale,
  };
}

export const useTranslate = useTranslation;

export * from './types';
export { zh_CN, en };
