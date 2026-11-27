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
    howItWorks: string;
    features: string;
    featuresMenu: {
      webDataScraperTitle: string;
      webDataScraperDesc: string;
      videoScraperTitle: string;
      videoScraperDesc: string;
      allFeatures: string;
      sandbox: string;
    };
    sandbox: string;
    compliance: string;
    pricing: string;
    changelog: string;
    faq: string;
    versionBadge: string;
    installCta: string;
    installCtaEdge: string;
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
    ctaInstallEdge: string;
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
      badgeLeft: string;
      badgeRight: string;
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
    architectureLabel: string;
    learnMore: string;
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
    limitedTimeOffer: string;
    flipHintToAnnual: string;
    flipHintToLifetime: string;
    flipBadgeToAnnual: string;
    flipBadgeToLifetime: string;
    plans: {
      free: {
        name: string;
        badge: string;
        price: string;
        period: string;
        description: string;
        cta: string;
        ctaEdge: string;
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
      yearly: {
        name: string;
        badge: string;
        price: string;
        originalPrice: string;
        monthlyRateBadge: string;
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
        originalPrice: string;
        discountBadge: string;
        countdownPrefix: string;
        countdownDaysLeft: string;
        offerEnded: string;
        expiryNote: string;
        tooltipDetail: string;
        period: string;
        description: string;
        cta: string;
        highlightNote: string;
        features: string[];
      };
    };
    faqBadge: string;
    faqTitle: string;
    faqSubtitle: string;
    trustBadges: {
      moneyBack: string;
      instantDelivery: string;
      sslCheckout: string;
    };
    faqs: Array<{
      q: string;
      a: string;
    }>;
    bottomCta: {
      badge: string;
      title: string;
      description: string;
      primaryBtn: string;
      primaryBtnEdge: string;
      secondaryBtn: string;
    };
  };
  footer: {
    tagline: string;
    privacyNotice: string;
    allSystemsLocal: string;
    zeroCookies: string;
    installBtn: string;
    installBtnEdge: string;
    telegramChannel: string;
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
      licenseManagement?: string;
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
    securityWarningTitle: string;
    securityWarningDesc: string;
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
    installExtensionEdge: string;
    backHome: string;
    emailNotice: string;
    supportText: string;
    emptyTitle: string;
    emptySubtitle: string;
  };
  clip: {
    title: string;
    subtitle: string;
    connectingExtension: string;
    extensionReady: string;
    extensionNotFound: string;
    dropToImport: string;
    selectLocalFile: string;
    trim: string;
    crop: string;
    exportVideo: string;
    exporting: string;
    sessionError: string;
    backHome: string;

    // Workspace & Session
    dragActive: string;
    supportedFormats: string;
    replaceVideo: string;
    importVideo: string;
    activeSession: string;
    videoDuration: string;
    fileSize: string;
    resolution: string;
    readyToEdit: string;

    // Media Vault Switch Modal
    vaultModalTitle: string;
    vaultModalSubtitle: string;
    vaultNoVideos: string;
    vaultNoExtension: string;
    vaultLoading: string;
    vaultSwitchVideo: string;
    vaultCurrentVideo: string;
    vaultRefresh: string;
    vaultClose: string;
    vaultSearchPlaceholder: string;
    vaultVideoCount: string;

    // Video Preview & Playback
    play: string;
    pause: string;
    mute: string;
    unmute: string;
    fullscreen: string;
    aspectRatio: string;
    aspectOriginal: string;
    aspect169: string;
    aspect916: string;
    aspect11: string;
    aspect43: string;
    aspectAutoDetected: string;
    aspectVertical: string;
    aspectHorizontal: string;
    aspectNativeMatch: string;
    replay: string;
    forward5s: string;
    rewind5s: string;

    // Timeline & Trimming
    timeline: string;
    setInPoint: string;
    setOutPoint: string;
    resetTrim: string;
    inPoint: string;
    outPoint: string;
    clipDuration: string;
    jumpToIn: string;
    jumpToOut: string;
    extractingFrames: string;
    framesReady: string;
    timelineHoverTip: string;
    zoomLevel: string;
    zoomIn: string;
    zoomOut: string;
    zoomFit: string;

    // Export Modal
    exportModalTitle: string;
    exportModalDesc: string;
    exportMode: string;
    fastCutTitle: string;
    fastCutDesc: string;
    losslessBadge: string;
    smartEncodeTitle: string;
    smartEncodeDesc: string;
    cropBadge: string;
    exportFormat: string;
    exportQuality: string;
    qualityHigh: string;
    qualityMedium: string;
    qualityLow: string;
    exportRange: string;
    exportRangeTrimmed: string;
    exportRangeFull: string;
    startExportBtn: string;
    cancelBtn: string;
    closeBtn: string;
    downloadBtn: string;
    exportSuccess: string;
    exportError: string;
    preparingExport: string;
    processingFrames: string;
    finalizingFile: string;
    exportSecurityNote: string;

    // Pro Permission Verification
    proBadge: string;
    proRequiredTitle: string;
    proRequiredSubtitle: string;
    proFeature1: string;
    proFeature2: string;
    proFeature3: string;
    proFeature4: string;
    upgradeToPro: string;
    recheckPermission: string;
    checkingPermission: string;
    activateInExtension: string;
    noExtensionNotice: string;
    connectExtensionBtn: string;
    permissionDeniedToast: string;
    exportProRequired: string;

    // Browser Compatibility
    unsupportedBrowserTitle: string;
    unsupportedBrowserDesc: string;
    unsupportedBrowserReason: string;
    unsupportedBrowserActionChrome: string;
    unsupportedBrowserActionEdge: string;
    unsupportedBrowserContinueAnyway: string;
    nonChromiumBadge: string;
    nonChromiumTitle: string;
    nonChromiumDesc: string;
    nonChromiumDownloadChrome: string;
    nonChromiumTip: string;
  };
  license: {
    metaTitle: string;
    metaDescription: string;
    badge: string;
    title: string;
    subtitle: string;
    keyLabel: string;
    keyPlaceholder: string;
    instanceIdLabel: string;
    instanceIdPlaceholder: string;
    instanceIdHelp: string;
    checkBtn: string;
    deactivateBtn: string;
    deactivating: string;
    checking: string;
    statusValid: string;
    statusInvalid: string;
    statusExpired: string;
    statusDisabled: string;
    deactivateSuccessTitle: string;
    deactivateSuccessDesc: string;
    errorNotFound: string;
    errorForbidden: string;
    errorGeneric: string;
    errorEmptyFields: string;
    backHome: string;
    faqTitle: string;
    faqHowToFindInstanceTitle: string;
    faqHowToFindInstanceDesc: string;
    faqLimitReachedTitle: string;
    faqLimitReachedDesc: string;
    devicesTitle: string;
    noDevices: string;
    deviceColumnName: string;
    deviceColumnDate: string;
    deviceColumnAction: string;
    fetchDevicesBtn: string;
    fetchingDevices: string;
    deviceCount: string;
    unlimitedDevices: string;
    apiKeyNotConfigured: string;
    manualTogglePrompt: string;
  };
  changelog: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    pillBadge: string;
    mv3Verified: string;
    title: string;
    subtitle: string;
    metricBuildLabel: string;
    metricBuildStatus: string;
    metricEngineLabel: string;
    metricEngineValue: string;
    filtersAriaLabel: string;
    filterAll: string;
    filterMajor: string;
    filterMinor: string;
    filterPatch: string;
    searchLabel: string;
    searchPlaceholder: string;
    clearSearch: string;
    telegramUpdates: string;
    sidebarTitle: string;
    sidebarNavLabel: string;
    releasesCount: string;
    latestBadge: string;
    categoryMajor: string;
    categoryMinor: string;
    categoryPatch: string;
    releasedPrefix: string;
    copyLinkLabel: string;
    copiedLink: string;
    sectionFeatures: string;
    sectionImprovements: string;
    sectionFixes: string;
    itemsCount: string;
    sandboxTitle: string;
    sandboxStatus: string;
    sandboxDesc: string;
    resultsAnnouncement: string;
    emptyTitle: string;
    emptyDesc: string;
    resetFilters: string;
    ctaBadge: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaPrimary: string;
    ctaPrimaryEdge: string;
    ctaSecondary: string;
  };
  howItWorks: {
    pillBadge: string;
    title: string;
    titleAccent: string;
    description: string;
    steps: Array<{
      stepLabel: string;
      title: string;
      titleSub: string;
      description: string;
      footerNote: string;
      icon: 'ads_click' | 'hub' | 'file_download';
      footerIcon: 'filter_center_focus' | 'auto_awesome' | 'save';
      accent: 'primary' | 'secondary';
    }>;
  };
  videoScraperPage: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    breadcrumb: {
      home: string;
      features: string;
      current: string;
      mv3Badge: string;
    };
    hero: {
      badge: string;
      titleMain: string;
      titleSub: string;
      description: string;
      ctaChrome: string;
      ctaEdge: string;
      ctaDemo: string;
      pills: Array<{
        icon: 'speed' | 'cloud_off' | 'memory' | 'hd';
        label: string;
      }>;
    };
    hud: {
      windowTitle: string;
      statusBadge: string;
      fileName: string;
      streamSpec: string;
      hlsBadge: string;
      opfsLabel: string;
      opfsProgress: string;
      rows: Array<{
        label: string;
        value: string;
        highlight?: 'primary' | 'secondary' | 'mono';
      }>;
      mobileMetric1Label: string;
      mobileMetric1Value: string;
      mobileMetric2Label: string;
      mobileMetric2Value: string;
      exportMp4: string;
      ripAudio: string;
    };
    architecture: {
      badge: string;
      title: string;
      description: string;
      legacy: {
        badge: string;
        subLabel: string;
        title: string;
        steps: Array<{
          strong: string;
          text: string;
        }>;
        summary: string;
      };
      engine: {
        badge: string;
        subLabel: string;
        title: string;
        steps: Array<{
          strong: string;
          text: string;
        }>;
        summary: string;
      };
    };
    protocols: {
      stripTitle: string;
      items: Array<{
        icon: 'playlist_play' | 'view_carousel' | 'data_object' | 'video_file' | 'splitscreen' | 'live_tv';
        name: string;
        desc: string;
        accent: 'primary' | 'secondary' | 'tertiary';
      }>;
    };
    opfs: {
      badge: string;
      title: string;
      description: string;
      benchTitle: string;
      benchSize: string;
      legacyLabel: string;
      legacyValue: string;
      engineLabel: string;
      engineValue: string;
      benchFooter: string;
      pillars: Array<{
        icon: 'enhanced_encryption' | 'memory' | 'sync_alt' | 'folder_special';
        title: string;
        desc: string;
        accent: 'primary' | 'secondary' | 'tertiary';
      }>;
    };
    scenarios: {
      badge: string;
      title: string;
      description: string;
      items: Array<{
        icon: 'school' | 'fiber_smart_record' | 'html' | 'merge';
        tag: string;
        title: string;
        desc: string;
        statLeft: string;
        statRight: string;
        features?: string[];
        accent: 'primary' | 'secondary' | 'tertiary';
        span: 'wide' | 'narrow';
      }>;
    };
    faq: {
      badge: string;
      title: string;
      description: string;
      items: Array<{
        q: string;
        a: string;
      }>;
    };
    ctaBanner: {
      tag: string;
      title: string;
      description: string;
      btnChrome: string;
      btnEdge: string;
      badges: Array<{
        icon: 'verified_user' | 'lock' | 'update';
        label: string;
      }>;
      mobileFootnote: string;
    };
    crossLink: {
      badge: string;
      title: string;
      description: string;
      cta: string;
    };
  };
  webDataScraperPage: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    breadcrumb: {
      home: string;
      features: string;
      current: string;
      mv3Badge: string;
    };
    hero: {
      badge: string;
      titleMain: string;
      titleSub: string;
      description: string;
      ctaChrome: string;
      ctaEdge: string;
      ctaSandbox: string;
      trustBadges: Array<{
        icon: 'verified_user' | 'lock_reset' | 'all_inclusive' | 'credit_card_off';
        label: string;
      }>;
    };
    sandbox: {
      urlBar: string;
      statusBadge: string;
      memoryBadge: string;
      targetLabel: string;
      targetSelector: string;
      siblingMatchBadge: string;
      focusedHudBadge: string;
      paginationText: string;
      paginationSelector: string;
      previewTitle: string;
      previewSpeedBadge: string;
      mappedColumnsLabel: string;
      schemaReadyLabel: string;
      columns: string[];
      tableHeaders: {
        index: string;
        title: string;
        price: string;
        stock: string;
      };
      sampleItems: Array<{
        title: string;
        price: string;
        stock: string;
        stockShort: string;
        ratingLabel: string;
        stars: number;
      }>;
      exportXlsx: string;
      exportCsv: string;
      exportJson: string;
    };
    heuristics: {
      badge: string;
      title: string;
      description: string;
      accuracyBadge: string;
      oldWay: {
        badge: string;
        description: string;
        errorMsg: string;
      };
      newWay: {
        badge: string;
        description: string;
        parentLabel: string;
        depthLabel: string;
        matchedLabel: string;
        fitLabel: string;
        footnote: string;
      };
    };
    pagination: {
      badge: string;
      title: string;
      description: string;
      cards: Array<{
        icon: 'navigate_next' | 'swap_vert' | 'account_tree';
        title: string;
        desc: string;
        metricLabel: string;
        metricValue: string;
        accent: 'primary' | 'secondary' | 'tertiary';
      }>;
    };
    exportEngine: {
      badge: string;
      title: string;
      description: string;
      formats: Array<{
        icon: 'description' | 'table_rows' | 'code' | 'webhook';
        title: string;
        subtitle: string;
        accent: 'primary' | 'secondary' | 'tertiary';
      }>;
      benchmark: {
        title: string;
        highlightTime: string;
        bars: Array<{
          label: string;
          time: string;
          widthPercent: number;
          isPrimary?: boolean;
        }>;
        footnote: string;
      };
    };
    comparison: {
      badge: string;
      title: string;
      description: string;
      headers: {
        dimension: string;
        local: string;
        cloud: string;
      };
      localShortLabel: string;
      cloudShortLabel: string;
      rows: Array<{
        icon: 'lock' | 'toll' | 'shield' | 'rocket_launch';
        dimension: string;
        local: string;
        cloud: string;
      }>;
    };
    faq: {
      badge: string;
      title: string;
      description: string;
      items: Array<{
        q: string;
        a: string;
      }>;
    };
    ctaBanner: {
      tag: string;
      title: string;
      description: string;
      btnChrome: string;
      btnEdge: string;
      footnotes: string[];
    };
    crossLink: {
      badge: string;
      title: string;
      description: string;
      cta: string;
    };
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
