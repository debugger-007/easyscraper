export type SupportedLocale = 'zh_CN' | 'en' | 'zh';

// 参数插值与默认英文兜底配置
export interface TranslateOptions {
  defaultValue?: string;
  [param: string]: string | number | boolean | undefined;
}

export type TranslateFunction = {
  (keyPath: string, defaultValue?: string): string;
  (keyPath: string, options: TranslateOptions): string;
};

export interface TranslationSchema {
  common?: {
    upgradeProTooltip: string;
    proActiveTooltip: string;
    refreshTooltip: string;
    refresh: string;
    refreshing: string;
    locate: string;
    download: string;
    export: string;
    copy: string;
    copied: string;
    copyTooltip: string;
    clear: string;
    cancel: string;
    cancelEsc: string;
    confirm: string;
    save: string;
    saved: string;
    delete: string;
    play: string;
    pause: string;
    resume: string;
    stop: string;
    logs: string;
    search: string;
    all: string;
    success: string;
    failed: string;
    downloadFailed: string;
    loading: string;
    pending: string;
    running: string;
    completed: string;
    paused: string;
    connected: string;
    connecting: string;
    retry: string;
    exportExcel: string;
    exportCsv: string;
  };
  meta: {
    title: string;
    description: string;
    keywords: string;
    siteName: string;
    ogLocale: string;
  };
  nav: {
    hero: string;
    features: string;
    sandbox: string;
    compliance: string;
    pricing: string;
    faq: string;
    versionBadge: string;
    installCta: string;
    switchLanguage: string;
    brandSubtitle?: string;
    languages: {
      en: string;
      zh: string;
      zh_CN?: string;
      [key: string]: string | undefined;
    };
  };
  hero: {
    pillBadge: string;
    titleLead: string;
    titleHighlight: string;
    titleTail: string;
    description: string;
    ctaInstall: string;
    ctaSandbox: string;
    metrics: Array<{
      value: string;
      label: string;
      sub: string;
    }>;
    simulator: {
      windowTitle: string;
      statusBadge: string;
      urlBar: string;
      streamStats: string;
      streamCount: string;
      tableTab: string;
      jsonTab: string;
      exportXlsx: string;
      exportCsv: string;
      copyJson: string;
      copied: string;
      columns: {
        item: string;
        price: string;
        stock: string;
        selector: string;
      };
      items: Array<{
        title: string;
        price: string;
        stock: string;
        stockType: 'in' | 'low';
        selector: string;
      }>;
    };
  };
  compliance: {
    pillBadge: string;
    title: string;
    description: string;
    tableHeaders: {
      criteria: string;
      legacy: string;
      easyScraper: string;
    };
    rows: Array<{
      icon: string;
      dimension: string;
      legacyText: string;
      easyText: string;
    }>;
    localGauge: {
      title: string;
      status: string;
      metrics: Array<{
        label: string;
        value: string;
        detail: string;
      }>;
    };
  };
  features: {
    pillBadge: string;
    title: string;
    description: string;
    cards: Array<{
      icon: string;
      tag: string;
      title: string;
      description: string;
      badge: string;
      accentColor: 'indigo' | 'cyan' | 'amber' | 'emerald' | 'violet';
    }>;
  };
  sandbox: {
    pillBadge: string;
    title: string;
    description: string;
    demoA: {
      title: string;
      mode: string;
      description: string;
      extractBtn: string;
      extractingBtn: string;
      items: Array<{
        title: string;
        price: string;
        stock: string;
        category: string;
      }>;
      summary: string;
    };
    demoB: {
      title: string;
      mode: string;
      description: string;
      streams: Array<{
        name: string;
        type: string;
        resolution: string;
        size: string;
        bitrate: string;
      }>;
      sniffBtn: string;
      downloadBtn: string;
      downloadingBtn: string;
      downloadSuccess: string;
    };
    demoC: {
      title: string;
      mode: string;
      description: string;
      inputLabel: string;
      defaultSelector: string;
      matchedLabel: string;
      matchedCount: string;
      testSample: string;
    };
  };
  pricing: {
    pillBadge: string;
    title: string;
    description: string;
    guaranteeText: string;
    plans: {
      free: {
        name: string;
        badge: string;
        price: string;
        period: string;
        description: string;
        cta: string;
        highlightNote: string;
        features: string[];
      };
      monthly: {
        name: string;
        badge: string;
        trialBadge: string;
        price: string;
        period: string;
        description: string;
        cta: string;
        highlightNote: string;
        features: string[];
      };
      lifetime: {
        name: string;
        badge: string;
        price: string;
        period: string;
        description: string;
        cta: string;
        highlightNote: string;
        features: string[];
      };
    };
    faqTitle: string;
    faqs: Array<{
      q: string;
      a: string;
    }>;
  };
  footer: {
    tagline: string;
    privacyNotice: string;
    allSystemsLocal: string;
    zeroCookies: string;
    installBtn: string;
    columns: Array<{
      title: string;
      links: Array<{
        label: string;
        href: string;
      }>;
    }>;
    copyright: string;
    builtWith: string;
    badges: Array<{
      icon: string;
      label: string;
    }>;
  };
  legal: {
    tabs: {
      terms: string;
      privacy: string;
      refund: string;
    };
    actions: {
      home: string;
      contactSupport: string;
      githubIssues: string;
    };
    sidebar: {
      tocTitle: string;
      channelsTitle: string;
    };
    banner: {
      questionsTitle: string;
      questionsDesc: string;
    };
    footer: {
      home: string;
      terms: string;
      privacy: string;
      refund: string;
      allRightsReserved: string;
    };
    meta: {
      effectiveAndUpdated: string;
      localSandbox: string;
      verified: string;
    };
  };
  paymentSuccess: {
    metaTitle: string;
    metaDescription: string;
    badge: string;
    title: string;
    subtitle: string;
    licenseKeyTitle: string;
    licenseKeySubtitle: string;
    copyKey: string;
    copiedKey: string;
    noKeyProvided: string;
    orderDetailsTitle: string;
    emailLabel: string;
    paymentIdLabel: string;
    subscriptionIdLabel: string;
    statusLabel: string;
    planTypeLabel: string;
    statusActive: string;
    statusSucceeded: string;
    typeLifetime: string;
    typeMonthly: string;
    activationTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    openExtension: string;
    installExtension: string;
    backHome: string;
    emailNotice: string;
    supportText: string;
    emptyTitle: string;
    emptySubtitle: string;
  };
}

export type LocaleDictionary = TranslationSchema;

// Hybrid translator type supporting both function calls: t('nav.hero') and direct property access: t.nav.hero
export type I18nTranslate = TranslateFunction & LocaleDictionary;

export interface UseTranslationReturn {
  t: I18nTranslate;
  locale: SupportedLocale;
  setLocale: (next: SupportedLocale | string) => void;
  changeLanguage: (next: SupportedLocale | string) => void;
  supportedLocales: readonly SupportedLocale[];
  isSupportedLocale: (locale: string) => locale is SupportedLocale;
}
