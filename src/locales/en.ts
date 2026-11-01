import type { TranslationSchema } from './types'

export const en: TranslationSchema = {
  meta: {
    title: 'Easy Web Scraper - Web Data & Video Extractor | Official Chrome Extension',
    description: 'Point, click, and extract structured data or sniff live streaming media directly inside Google Chrome with zero code and 100% local execution.'
  },
  nav: {
    hero: 'Hero',
    features: 'Features',
    sandbox: 'Live Sandbox',
    compliance: 'Local-First Privacy',
    pricing: 'Pricing',
    faq: 'Permissions & FAQ',
    versionBadge: 'v2.4.0 • MV3 Stable',
    installCta: 'Add to Chrome - Free',
    switchLanguage: 'Language',
    languages: {
      en: 'English',
      zh: '简体中文'
    }
  },
  hero: {
    pillBadge: '100% In-Browser Execution • Zero External Relay',
    titleLead: 'Visual Web Scraping & Media Sniffing,',
    titleHighlight: 'Made Local & Effortless.',
    titleTail: '',
    description: 'Point-and-click to extract tables, auto-paginate catalog feeds, sniff encrypted HLS/M3U8 video streams, and export to Excel/CSV—all executed directly in your browser without a single line of code.',
    ctaInstall: 'Add to Chrome - Free',
    ctaSandbox: 'Interactive Sandbox',
    metrics: [
      {
        value: '50,000+',
        label: 'Active Data Analysts',
        sub: 'Global enterprise & indie users'
      },
      {
        value: '4.9 / 5',
        label: 'Chrome Web Store Rating',
        sub: 'Based on 1,200+ verified reviews'
      },
      {
        value: '0 Bytes',
        label: 'Transferred to Cloud',
        sub: 'No third-party server relays'
      },
      {
        value: 'Local-Only',
        label: 'IndexedDB & SheetJS',
        sub: 'Instant in-memory compilation'
      }
    ],
    simulator: {
      windowTitle: 'Live Tab Inspector (Active)',
      statusBadge: 'REC Auto-Pagination Active',
      urlBar: 'https://store.example.com/collections/hardware-tools',
      streamStats: '32 Requests/sec',
      streamCount: '2 Stream URLs (.m3u8)',
      tableTab: 'Detected Schema Preview',
      jsonTab: 'Raw JSON Payload',
      exportXlsx: 'Export .xlsx',
      exportCsv: 'Export .csv',
      copyJson: 'Copy JSON',
      copied: 'Copied!',
      columns: {
        item: 'Product Item',
        price: 'Price',
        stock: 'Inventory Status',
        selector: 'Active CSS Selector'
      },
      items: [
        {
          title: 'High Precision Screwdriver Set (24-in-1)',
          price: '$34.99',
          stock: 'In Stock (48 units)',
          stockType: 'in',
          selector: '.product-card .price'
        },
        {
          title: 'Laser Distance Measure 50M Industrial',
          price: '$79.50',
          stock: 'Low Stock (3 units)',
          stockType: 'low',
          selector: '.product-card .price'
        },
        {
          title: 'Cordless Brushless Impact Drill 20V Kit',
          price: '$129.00',
          stock: 'In Stock (12 units)',
          stockType: 'in',
          selector: '.product-card .price'
        }
      ]
    }
  },
  compliance: {
    pillBadge: 'Architecture & Privacy',
    title: 'Why Local-First Scraping Wins',
    description: 'Traditional cloud scrapers compromise security by demanding your private authentication cookies and routing everything through central clusters. Easy Web Scraper runs entirely inside your Chromium sandbox.',
    tableHeaders: {
      criteria: 'Criteria / Capability',
      legacy: 'Legacy Cloud SaaS Scrapers',
      easyScraper: 'Easy Web Scraper (Local Engine)'
    },
    rows: [
      {
        icon: 'key',
        dimension: 'Cookie & Session Security',
        legacyText: 'Requires uploading session cookies & tokens to 3rd-party servers',
        easyText: '100% on browser; credentials never leave your active tab'
      },
      {
        icon: 'monitoring',
        dimension: 'Telemetry & Activity Tracking',
        legacyText: 'Stores scraping logs, URLs, and target contents in cloud databases',
        easyText: 'Zero telemetry, zero user IDs, zero central server logs'
      },
      {
        icon: 'payments',
        dimension: 'Pricing & Credit Limits',
        legacyText: '$49 - $299 / month with strict credit caps and rate limits',
        easyText: 'Free, unrestricted, unlimited local extractions'
      },
      {
        icon: 'block',
        dimension: 'IP Blocking & Anti-Bot Protection',
        legacyText: 'Cloud datacenter IPs are often instantly flagged or blacklisted',
        easyText: 'Uses your own legitimate residential browser session'
      },
      {
        icon: 'movie',
        dimension: 'Video / HLS Sniffing Capability',
        legacyText: 'Not supported or requires expensive headless browser proxies',
        easyText: 'Native stream listener captures raw .m3u8, .mpd & .mp4 effortlessly'
      }
    ],
    localGauge: {
      title: 'Local Storage & Memory Gauge',
      status: 'Protected by Chrome Sandbox',
      metrics: [
        {
          label: 'Egress Traffic',
          value: '0 KB',
          detail: 'No outbound data transmission'
        },
        {
          label: 'Local IndexedDB',
          value: '100% Private',
          detail: 'Stored inside browser domain isolate'
        },
        {
          label: 'Export Latency',
          value: '< 40ms',
          detail: 'SheetJS in-memory XLSX generation'
        }
      ]
    }
  },
  features: {
    pillBadge: 'Engineering Precision',
    title: 'Five Core Extraction Superpowers',
    description: 'Built for technical power users, growth engineers, and data analysts who need high-throughput extraction without fragile cloud infrastructure.',
    cards: [
      {
        icon: 'ads_click',
        tag: 'SELECTORS',
        title: 'Visual Point-and-Click Extraction',
        description: 'Hover and click any DOM element. Our smart heuristic engine automatically crafts resilient CSS & XPath selectors, highlighting matching sibling elements instantly across the viewport.',
        badge: 'Smart Heuristics',
        accentColor: 'indigo'
      },
      {
        icon: 'auto_mode',
        tag: 'PAGINATION',
        title: 'Intelligent Auto-Pagination & Scroll',
        description: 'Auto-detect "Next Page" buttons, infinite scrolling triggers, and load-more anchors with human-like randomized delays to gracefully navigate pagination.',
        badge: 'Infinite Scroll',
        accentColor: 'cyan'
      },
      {
        icon: 'stream',
        tag: 'MEDIA SNIFFER',
        title: 'Network Media Sniffer & HLS Vault',
        description: 'Sniff underlying m3u8 playlists, encrypted media segments, and direct MP4/WebM binaries straight from the browser network layer with single-click merge & download.',
        badge: 'HLS / M3U8',
        accentColor: 'amber'
      },
      {
        icon: 'file_download',
        tag: 'FORMATS',
        title: 'Multi-Format Export & Webhook Sync',
        description: 'Compile tables into XLSX workbooks, clean CSVs, or structured JSON arrays locally using SheetJS. Send batches directly to local webhooks or automations.',
        badge: 'Excel / CSV / JSON',
        accentColor: 'emerald'
      },
      {
        icon: 'database',
        tag: 'PERFORMANCE',
        title: 'Zero-Copy OPFS Storage Engine',
        description: 'Leverage the Origin Private File System (OPFS) and IndexedDB to process datasets with hundreds of thousands of rows without crashing tab memory.',
        badge: 'High Throughput',
        accentColor: 'violet'
      }
    ]
  },
  sandbox: {
    pillBadge: 'Interactive Demo',
    title: 'Live Testing Ground & Reviewer Sandbox',
    description: 'Test all extension features in 10 seconds without logging into any website. Click the interactive mockups below to observe real-time DOM detection, tabular parsing, and network media capture.',
    demoA: {
      title: 'Demo A: Product Catalog',
      mode: 'DOM MODE',
      description: 'Simulated electronics grid with automatic repeating card and price pattern detection.',
      extractBtn: 'Extract All Products',
      extractingBtn: 'Parsing DOM Elements...',
      items: [
        {
          title: 'Precision Soldering Station 60W',
          price: '$45.00',
          stock: 'In Stock',
          category: 'Electronics'
        },
        {
          title: 'Digital Multimeter Auto-Ranging',
          price: '$28.50',
          stock: 'In Stock',
          category: 'Tools'
        },
        {
          title: 'Benchtop Power Supply 30V 5A',
          price: '$89.99',
          stock: 'Low Stock',
          category: 'Equipment'
        }
      ],
      summary: '3 items extracted in 18ms • 0 bytes uploaded'
    },
    demoB: {
      title: 'Demo B: Media Stream Sniffer',
      mode: 'NETWORK MODE',
      description: 'Simulated network sniffing engine listening to live stream manifests and audio/video segments.',
      streams: [
        {
          name: 'master_playlist_1080p.m3u8',
          type: 'HLS Live Stream',
          resolution: '1920x1080',
          size: '4.2 MB chunked',
          bitrate: '4500 kbps'
        },
        {
          name: 'promo_reel_trailer_4k.mp4',
          type: 'Direct MP4 Binary',
          resolution: '3840x2160',
          size: '84.6 MB',
          bitrate: '12000 kbps'
        }
      ],
      sniffBtn: 'Simulate Video Playback',
      downloadBtn: 'Download Media Asset',
      downloadingBtn: 'Merging Segments Locally...',
      downloadSuccess: 'Exported to Browser Downloads'
    },
    demoC: {
      title: 'Demo C: Selector & XPath Probe',
      mode: 'DEVTOOLS MODE',
      description: 'Live selector test input. Enter a CSS selector or XPath query to evaluate matching nodes in real time.',
      inputLabel: 'Target Selector',
      defaultSelector: '.product-card .price',
      matchedLabel: 'Matching Nodes Found',
      matchedCount: '3 Elements (100% Confidence)',
      testSample: 'Sample node: <span class="price">$34.99</span> matched in div.product-card'
    }
  },
  pricing: {
    pillBadge: 'Simple & Transparent Pricing',
    title: 'Choose the Right Plan for Your Workflow',
    description: 'Get started for free or unlock unlimited automated pagination, high-speed HLS media export, and lifetime updates.',
    guaranteeText: '30-Day Money-Back Guarantee • Instant Activation • 100% Secure Checkout via Lemon Squeezy',
    plans: {
      free: {
        name: 'Starter / Free',
        badge: 'Free Forever',
        price: '$0',
        period: 'free forever',
        description: 'Ideal for occasional data collection and quick DOM extractions.',
        cta: 'Add to Chrome - Free',
        highlightNote: '100% Free • No credit card required',
        features: [
          'Visual point-and-click element picker',
          'Single-page data table extraction',
          'Standard CSV & JSON file exports',
          'Basic video & media stream detection',
          '100% in-browser local privacy sandbox',
          'Unlimited local page extractions',
          'No account registration needed'
        ]
      },
      monthly: {
        name: 'Pro Monthly',
        badge: 'Flexible Monthly',
        trialBadge: '7-Day Free Trial',
        price: '$6.99',
        period: '/ month (after 7-day trial)',
        description: 'Perfect for data analysts and developers needing regular high-volume scraping.',
        cta: 'Start 7-Day Free Trial',
        highlightNote: '7-Day free trial • $0 billed today • Cancel anytime',
        features: [
          'Includes all Starter features',
          'Intelligent multi-page auto-pagination',
          'Infinite scroll & dynamic content loading',
          'Advanced HLS / M3U8 video stream stitcher',
          'High-speed Excel (.xlsx) export via SheetJS',
          'Priority email & ticket technical support',
          'Full access during trial with $0 charged'
        ]
      },
      lifetime: {
        name: 'Lifetime Deal',
        badge: 'Lifetime Access',
        price: '$39.00',
        period: 'one-time payment',
        description: 'One single payment for lifetime access and all future major version updates.',
        cta: 'Get Lifetime Access Now',
        highlightNote: 'Pay once • Lifetime access • All future updates',
        features: [
          'Includes all Pro Monthly capabilities',
          'Lifetime license with ZERO recurring fees',
          'Free upgrades to all future v3.x/v4.x versions',
          'OPFS million-row zero-copy local engine',
          'Exclusive VIP community & direct engineering channel',
          'Commercial multi-device business license',
          'Risk-free 30-day money-back guarantee'
        ]
      }
    },
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        q: 'How does the checkout process work?',
        a: 'We process all payments securely through Lemon Squeezy, our Merchant of Record. You can pay using Credit Cards, Apple Pay, Google Pay, or PayPal. Activation is instant.'
      },
      {
        q: 'Can I switch from Monthly to Lifetime later?',
        a: 'Yes! You can cancel your monthly subscription at any time and upgrade to the Lifetime Deal without losing any data.'
      },
      {
        q: 'Is my payment secure?',
        a: 'Yes, 100%. All transactions are encrypted with 256-bit SSL and processed directly by Lemon Squeezy. We never store or touch your financial credentials.'
      }
    ]
  },
  footer: {
    tagline: 'High-performance, local-first web scraping and media sniffing extension for Google Chrome.',
    privacyNotice: 'Zero cookies leaked. Zero cloud relays. 100% compliant with Google Chrome Web Store policies.',
    allSystemsLocal: 'All systems 100% local',
    zeroCookies: 'Zero cloud relays & cookies stored locally only',
    installBtn: 'Install Free Extension',
    columns: [
      {
        title: 'Core Features',
        links: [
          { label: 'Visual Smart Scraper', href: '#features' },
          { label: 'HLS / Video Sniffer', href: '#features' },
          { label: 'Automated Pagination', href: '#features' },
          { label: 'Pricing & Lifetime Deal', href: '#pricing' }
        ]
      },
      {
        title: 'Technical Specs',
        links: [
          { label: 'Manifest V3 Architecture', href: '#compliance' },
          { label: 'SheetJS & JSON Formats', href: '#compliance' },
          { label: 'Local Storage Whitepaper', href: '#compliance' },
          { label: 'Documentation & Guide', href: '#features' }
        ]
      },
      {
        title: 'Trust & Compliance',
        links: [
          { label: 'Privacy Promise', href: '#compliance' },
          { label: 'Terms of Use', href: '#compliance' },
          { label: 'Security Audit', href: '#compliance' }
        ]
      }
    ],
    copyright: '© 2026 Easy Web Scraper. All rights reserved.',
    builtWith: 'Built with Chromium Native APIs',
    badges: [
      { icon: 'shield', label: 'Manifest V3' },
      { icon: 'cloud_off', label: 'Zero Remote Calls' },
      { icon: 'cookie_off', label: 'Cookie-Free' }
    ]
  }
}

