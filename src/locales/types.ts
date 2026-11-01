export type SupportedLocale = 'en' | 'zh'

export interface TranslationSchema {
  meta: {
    title: string
    description: string
  }
  nav: {
    hero: string
    features: string
    sandbox: string
    compliance: string
    pricing: string
    faq: string
    versionBadge: string
    installCta: string
    switchLanguage: string
    languages: {
      en: string
      zh: string
    }
  }
  hero: {
    pillBadge: string
    titleLead: string
    titleHighlight: string
    titleTail: string
    description: string
    ctaInstall: string
    ctaSandbox: string
    metrics: Array<{
      value: string
      label: string
      sub: string
    }>
    simulator: {
      windowTitle: string
      statusBadge: string
      urlBar: string
      streamStats: string
      streamCount: string
      tableTab: string
      jsonTab: string
      exportXlsx: string
      exportCsv: string
      copyJson: string
      copied: string
      columns: {
        item: string
        price: string
        stock: string
        selector: string
      }
      items: Array<{
        title: string
        price: string
        stock: string
        stockType: 'in' | 'low'
        selector: string
      }>
    }
  }
  compliance: {
    pillBadge: string
    title: string
    description: string
    tableHeaders: {
      criteria: string
      legacy: string
      easyScraper: string
    }
    rows: Array<{
      icon: string
      dimension: string
      legacyText: string
      easyText: string
    }>
    localGauge: {
      title: string
      status: string
      metrics: Array<{
        label: string
        value: string
        detail: string
      }>
    }
  }
  features: {
    pillBadge: string
    title: string
    description: string
    cards: Array<{
      icon: string
      tag: string
      title: string
      description: string
      badge: string
      accentColor: 'indigo' | 'cyan' | 'amber' | 'emerald' | 'violet'
    }>
  }
  sandbox: {
    pillBadge: string
    title: string
    description: string
    demoA: {
      title: string
      mode: string
      description: string
      extractBtn: string
      extractingBtn: string
      items: Array<{
        title: string
        price: string
        stock: string
        category: string
      }>
      summary: string
    }
    demoB: {
      title: string
      mode: string
      description: string
      streams: Array<{
        name: string
        type: string
        resolution: string
        size: string
        bitrate: string
      }>
      sniffBtn: string
      downloadBtn: string
      downloadingBtn: string
      downloadSuccess: string
    }
    demoC: {
      title: string
      mode: string
      description: string
      inputLabel: string
      defaultSelector: string
      matchedLabel: string
      matchedCount: string
      testSample: string
    }
  }
  pricing: {
    pillBadge: string
    title: string
    description: string
    guaranteeText: string
    plans: {
      free: {
        name: string
        badge: string
        price: string
        period: string
        description: string
        cta: string
        highlightNote: string
        features: string[]
      }
      monthly: {
        name: string
        badge: string
        trialBadge: string
        price: string
        period: string
        description: string
        cta: string
        highlightNote: string
        features: string[]
      }
      lifetime: {
        name: string
        badge: string
        price: string
        period: string
        description: string
        cta: string
        highlightNote: string
        features: string[]
      }
    }
    faqTitle: string
    faqs: Array<{
      q: string
      a: string
    }>
  }
  footer: {
    tagline: string
    privacyNotice: string
    allSystemsLocal: string
    zeroCookies: string
    installBtn: string
    columns: Array<{
      title: string
      links: Array<{
        label: string
        href: string
      }>
    }>
    copyright: string
    builtWith: string
    badges: Array<{
      icon: string
      label: string
    }>
  }
}

