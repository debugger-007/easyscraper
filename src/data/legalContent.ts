import type { SupportedLocale } from '../i18n/types'

export interface LegalSection {
  id: string
  title: string
  content: string[]
  subsections?: Array<{
    title: string
    content: string[]
    bulletPoints?: string[]
  }>
  callout?: {
    type: 'info' | 'warning' | 'success'
    title: string
    text: string
  }
}

export interface LegalDocument {
  title: string
  subtitle: string
  lastUpdated: string
  badge: string
  metaContact?: {
    developer: string
    supportEmail: string
    devEmail: string
    githubIssues: string
  }
  tldr: {
    title: string
    items: string[]
  }
  sections: LegalSection[]
}

const baseTermsData: Record<'en' | 'zh', LegalDocument> = {
  en: {
    title: 'Terms of Service & Acceptable Use Policy',
    subtitle: 'Clear terms governing the use of the Easy Web Scraper browser extension and services.',
    lastUpdated: 'November 2, 2026',
    badge: 'Manifest V3 • Local-First Utility',
    metaContact: {
      developer: 'Easy Web Scraper Team',
      supportEmail: 'easyscraper.one@gmail.com',
      devEmail: 'yi444978264@gmail.com',
      githubIssues: 'https://github.com/debugger-007/easyscraper/issues'
    },
    tldr: {
      title: 'Summary of Key Principles',
      items: [
        '100% Local Processing: Data extraction, scraping algorithms, and media sniffing execute solely inside your local browser. No user data or credentials are transferred to our servers.',
        'Tool Neutrality: Easy Web Scraper is a developer utility (like Chrome DevTools or cURL). You retain full ownership and legal responsibility for what you scrape.',
        'Merchant of Record: All payments, invoicing, and tax compliance are securely managed by Dodo Payments.',
        'Responsible Scraping: Respect website terms, robots.txt, and copyright laws. Do not scrape private, sensitive, or DRM-protected streams without authorization.'
      ]
    },
    sections: [
      {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        content: [
          'By installing, enabling, accessing, or using the "Easy Web Scraper" Chrome extension, its website, and associated services (collectively referred to as the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.',
          'If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the legal authority to bind such entity to these Terms. If you do not have such authority, or if you do not agree with any part of these Terms, you must not install or use the Service.'
        ]
      },
      {
        id: 'architecture',
        title: '2. Local-First Architecture & Privacy by Design',
        content: [
          'Easy Web Scraper is engineered strictly on a "local-first" execution paradigm. Unlike conventional SaaS scraping platforms that route target requests through shared cloud proxies and central database nodes:',
          'Our architecture guarantees that we have neither the ability nor the infrastructure to monitor your target URLs, review extracted payloads, or access your session credentials.'
        ],
        subsections: [
          {
            title: 'Technical Implementation Guarantees',
            content: [
              'The following operations are performed entirely within your client machine environment:'
            ],
            bulletPoints: [
              'DOM selection algorithms and heuristic selector generation execute in the isolated extension content-script context.',
              'Data buffering is managed locally in your browser RAM and isolated IndexedDB sandbox.',
              'Excel (XLSX) and CSV conversions are performed locally in-memory via SheetJS without cloud round-trips.',
              'Network sniffing for video streams (.m3u8, .mp4) intercepts browser-level network events directly on your local device.'
            ]
          }
        ],
        callout: {
          type: 'info',
          title: 'Zero Data Ingestion',
          text: 'We never store, relay, or monetize your scraped data. You retain 100% custody of your files at all times.'
        }
      },
      {
        id: 'license',
        title: '3. License Grants & Subscription Tiers',
        content: [
          'Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to install and execute the extension for personal or business workflows according to your tier:'
        ],
        subsections: [
          {
            title: 'Free Community Edition',
            content: [
              'Granted for personal evaluation and non-commercial workflows. Includes visual point-and-click scraping and standard CSV/JSON export with no quota caps on local execution.'
            ]
          },
          {
            title: 'Pro Monthly Subscription ($6.99/mo)',
            content: [
              'Includes advanced automated pagination, infinite scroll automation, HLS/M3U8 media stream sniffing, and native SheetJS XLSX exports. Billed monthly with a 7-day free trial. Cancelable at any time.'
            ]
          },
          {
            title: 'Lifetime Edition ($39.00 one-time)',
            content: [
              'A perpetual, non-exclusive license granted to a single designated user across personal and commercial workstations. Grants lifetime access to all future v2.x and v3.x major upgrades and includes our 30-day money-back guarantee.'
            ]
          }
        ]
      },
      {
        id: 'acceptable-use',
        title: '4. Acceptable Use & Scraping Compliance Policy',
        content: [
          'You acknowledge that automated data scraping is subject to varying regulatory frameworks across jurisdictions (including the Computer Fraud and Abuse Act (CFAA), GDPR, CCPA, and copyright statutes). You expressly agree NOT to use Easy Web Scraper to:'
        ],
        subsections: [
          {
            title: 'Prohibited Activities',
            content: [
              'Engaging in any of the following activities constitutes a material breach of these Terms:'
            ],
            bulletPoints: [
              'Circumventing or bypassing authenticated security gateways, anti-bot captcha challenges, or paywalls without express written consent from the site operator.',
              'Scraping private, non-public data, financial records, passwords, health information, or personally identifiable information (PII) without explicit legal basis.',
              'Configuring aggressive, zero-delay automated loops that cause Denial of Service (DoS) or degrade server operations for third-party websites.',
              'Extracting and redistributing copyrighted text, databases, or audiovisual material in violation of third-party intellectual property rights.',
              'Reselling, sublicensing, or bundling Easy Web Scraper into competing commercial scraping services or botnets.'
            ]
          }
        ],
        callout: {
          type: 'warning',
          title: 'Tool Neutrality & User Indemnification',
          text: 'Easy Web Scraper is a neutral dual-use software utility. You are solely responsible for verifying the legality of your scraping targets and respecting robots.txt directives.'
        }
      },
      {
        id: 'media-sniffing',
        title: '5. Media Stream Sniffing & DMCA Disclaimer',
        content: [
          'Easy Web Scraper includes features that inspect local network traffic to detect unencrypted streaming video fragments (such as HTTP Live Streaming .m3u8 manifests and raw MP4 links).',
          'Notice Regarding Digital Rights Management (DRM): The Service strictly DOES NOT bypass, crack, reverse-engineer, or decrypt hardware or cryptographic DRM systems (such as Google Widevine, Apple FairPlay, or Microsoft PlayReady). Any encrypted media fragments remain unusable without valid licenses.',
          'You agree that any media stream captured using the Service is strictly for legal personal study, accessibility adaptation, or archival purposes where permitted by governing fair-use laws. We do not endorse or tolerate digital copyright piracy.'
        ]
      },
      {
        id: 'payments-billing',
        title: '6. Payments, Merchant of Record & Automatic Renewals',
        content: [
          'Our order processing and billing infrastructure is managed by our Merchant of Record, Dodo Payments (Dodo Payments, Inc.). Dodo Payments is the seller of record and handles all payments, receipts, fraud detection, and sales tax / VAT remittance.',
          'Recurring Subscriptions: If you select the Pro Monthly subscription, your payment method will be charged automatically on each recurring monthly billing date unless canceled before the next renewal.',
          'Free Trial Cancellation: If your Pro Monthly subscription includes a 7-day free trial, you may cancel at any time within the 7-day period through your Dodo Payments order dashboard. Your card will not be charged if canceled before trial conclusion.'
        ],
        callout: {
          type: 'success',
          title: 'Safe & Compliant Checkout',
          text: 'All transactions are encrypted with 256-bit SSL encryption. We never touch, store, or process your credit card numbers directly.'
        }
      },
      {
        id: 'disclaimer-warranties',
        title: '7. Disclaimer of Warranties',
        content: [
          'THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NON-INFRINGEMENT.',
          'WE DO NOT WARRANT THAT THE SERVICE WILL FUNCTION UNINTERRUPTED, SECURELY, OR ERROR-FREE. TARGET WEBSITES REGULARLY UPDATE THEIR DOM STRUCTURES, PROTOCOLS, AND SECURITY SHIELDS, WHICH MAY TEMPORARILY OR PERMANENTLY RENDER SPECIFIC HEURISTIC SELECTORS INEFFECTIVE. WE CANNOT GUARANTEE CONTINUOUS COMPATIBILITY WITH ANY SPECIFIC THIRD-PARTY WEBSITE.'
        ]
      },
      {
        id: 'limitation-liability',
        title: '8. Limitation of Liability',
        content: [
          'TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, IN NO EVENT SHALL EASY WEB SCRAPER, ITS DEVELOPERS, AFFILIATES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES (INCLUDING LOSS OF PROFITS, DATA LOSS, IP ADDRESS BANS, OR TARGET PLATFORM ACCOUNT SUSPENSION) ARISING OUT OF OR IN CONNECTION WITH THE USE OF THE SERVICE.',
          'OUR TOTAL AGGREGATE LIABILITY UNDER THESE TERMS FOR ALL CLAIMS SHALL BE STRICTLY LIMITED TO THE GREATER OF $50 USD OR THE AMOUNT ACTUALLY PAID BY YOU FOR THE SERVICE DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM.'
        ]
      },
      {
        id: 'termination',
        title: '9. License Revocation & Termination',
        content: [
          'We reserve the right to revoke license keys or terminate access to paid features immediately and without prior notice in the event of fraudulent payment chargebacks, unauthorized redistribution of license credentials, or malicious attempts to reverse-engineer our license validation mechanisms.'
        ]
      },
      {
        id: 'governing-law',
        title: '10. Governing Law & Dispute Resolution',
        content: [
          'These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the development team operates, without regard to conflict of law provisions.',
          'Before initiating formal legal action, you agree to attempt in good faith to resolve any disputes informally by contacting our legal and support team at easyscraper.one@gmail.com.'
        ]
      }
    ]
  },
  zh: {
    title: '服务条款与合法使用规范',
    subtitle: '规范 Easy Web Scraper 浏览器扩展及其相关服务使用的法律条款与合规细则。',
    lastUpdated: '2026年11月2日',
    badge: 'Manifest V3 架构 • 本地优先实用工具',
    metaContact: {
      developer: 'Easy Web Scraper Team',
      supportEmail: 'easyscraper.one@gmail.com',
      devEmail: 'yi444978264@gmail.com',
      githubIssues: 'https://github.com/debugger-007/easyscraper/issues'
    },
    tldr: {
      title: '核心原则要点汇总',
      items: [
        '100% 本地运行保护隐私：抓取算法、DOM解析与流媒体嗅探全部在您的本地浏览器进程内运行。无任何数据回传至中心服务器。',
        '技术中立与责任归属：Easy Web Scraper 属于中立性开发者工具（性质同 Chrome DevTools 或 cURL）。用户对自身配置的抓取目标及产出数据承担全部法律责任。',
        'MoR 商户合规结算：所有订单处理、发票生成与全球税费代缴均由官方授权商户 Dodo Payments 安全托管。',
        '负责任抓取承诺：遵守目标网站用户协议、robots.txt 规范与版权法，严禁未经授权抓取个人敏感隐私数据或盗版分发受版权保护的音视频。'
      ]
    },
    sections: [
      {
        id: 'acceptance',
        title: '1. 条款的接受与法律效力',
        content: [
          '当您下载、安装、启用或访问 Easy Web Scraper Chrome 扩展程序、官方网站及相关配套服务（统称“本服务”）时，即表示您已阅读、完全理解并同意受本服务条款的法律约束。',
          '如果您代表公司、企业或其他法律实体使用本服务，您声明并保证您已获得充分授权使该实体接受本条款的约束。如果您不具备前述授权，或者不同意本条款的任何部分，请立即卸载并停止使用本服务。'
        ]
      },
      {
        id: 'architecture',
        title: '2. 本地优先架构与隐私设计原则',
        content: [
          'Easy Web Scraper 严格遵循“客户端本地优先 (Local-First)”的工程架构理念。与传统云端爬虫将用户请求和凭据转发至共享代理服务器和中央数据库不同：',
          '我们的架构从根源上杜绝了窥探可能：我们既没有能力，也没有部署任何用于记录用户目标 URL、抓取数据正文或用户登录凭据的服务器。'
        ],
        subsections: [
          {
            title: '工程机制保障细则',
            content: [
              '以下全部关键运算均在您本机的沙盒环境中即时完成：'
            ],
            bulletPoints: [
              '可视化点选选择器启发式推断在隔离的扩展 Content-Script 进程内执行。',
              '大规模数据提取暂存使用本地浏览器内存及专有 IndexedDB 隔离存储。',
              'Excel (.xlsx) 与 CSV 文件通过 SheetJS 纯本地生成，零网络外传。',
              '视频媒体流嗅探直接通过浏览器原生网络监听接口在客户端即时捕获。'
            ]
          }
        ],
        callout: {
          type: 'info',
          title: '零数据回传承诺',
          text: '我们绝不收集、中继或转售您的抓取结果。数据资产 100% 归属于您本机。'
        }
      },
      {
        id: 'license',
        title: '3. 软件许可授予与版本权限划分',
        content: [
          '在遵守本条款的前提下，我们授予您一项有限、非排他、不可转让且可撤销的软件许可，允许您按照所选版本使用本服务：'
        ],
        subsections: [
          {
            title: 'Free 社区免费版',
            content: [
              '面向个人用户及非商业用途免费开放。包含基础可视化点选提取、CSV/JSON 导出，不设本地执行频次限制。'
            ]
          },
          {
            title: 'Pro 专业月度订阅版 ($6.99/月)',
            content: [
              '包含智能下一页自动翻页、无限瀑布流滚动抓取、HLS/M3U8 视频流解析及 SheetJS 原生 Excel 高性能导出。支持 7 天免费试用，可随时在后台取消续订。'
            ]
          },
          {
            title: 'Lifetime 终身买断版 ($39.00 一次性支付)',
            content: [
              '授予单个被授权人终身有效的商业与个人使用许可。享有未来 v2.x、v3.x 所有大版本特权，终身免续费，并享受 30 天无理由全额退款保障。'
            ]
          }
        ]
      },
      {
        id: 'acceptable-use',
        title: '4. 网页抓取合法使用与合规守则（重要）',
        content: [
          '您知悉并明确，在不同司法管辖区内，网页抓取行为受到诸如网络安全法、反不正当竞争法、个人信息保护法（PIPL/GDPR）及版权法的监管。您在此承诺绝不利用 Easy Web Scraper 从事以下行为：'
        ],
        subsections: [
          {
            title: '明确禁止的行为',
            content: [
              '凡发生以下任一行为均构成对本条款的重大实质违约：'
            ],
            bulletPoints: [
              '未经授权绕过目标网站的身份验证网关、付费阅读墙、防机器人验证码（Captcha）或访问控制列表。',
              '抓取个人高敏感隐私数据（包括身份证件、医疗记录、密码、财务信息或未成年人隐私）。',
              '设置过激的高并发、零延迟循环抓取，造成目标网站服务器过载、拒绝服务（DoS）或中断。',
              '非法抓取并再次商业分发受版权法保护的原创文本、音视频素材或数据库。',
              '倒卖、逆向破解、打包转售授权激活码或将本软件用于构建恶意爬虫代理网络。'
            ]
          }
        ],
        callout: {
          type: 'warning',
          title: '工具中立与免责条款',
          text: 'Easy Web Scraper 是双重用途的中立技术工具。因用户抓取违规目标或违反目标站 robots.txt 协议产生的一切法律纠纷，均由用户自行全权承担。'
        }
      },
      {
        id: 'media-sniffing',
        title: '5. 流媒体嗅探合规与数字版权（DMCA）声明',
        content: [
          'Easy Web Scraper 包含网络流量探测能力，旨在识别未加密的流媒体视频切片分片（例如 HTTP Live Streaming .m3u8 清单或直连 MP4 链接）。',
          '数字版权保护（DRM）特别提示：本扩展绝对不具备、也不包含任何破解或绕过硬件级或商业级加密 DRM 系统（包括 Google Widevine、Apple FairPlay 或 Microsoft PlayReady）的功能。任何加密流在缺乏官方解密授权下均无法播放。',
          '您保证：通过本扩展捕获的流媒体仅用于个人合理学习、离线研究或可访问性研究之目的。严禁利用本扩展从事侵犯数字版权及网络盗版传播行为。'
        ]
      },
      {
        id: 'payments-billing',
        title: '6. 支付结算、商户代理与自动续费机制',
        content: [
          '我们的支付交易与订单处理服务由官方授权的记录商户（Merchant of Record）Dodo Payments (Dodo Payments, Inc.) 承办。Dodo Payments 作为法定销售主体负责交易结算、开具发票、欺诈防御及全球增值税（VAT）代缴。',
          '月度自动续费说明：若您购买 Pro 月度订阅，订阅费用将在每个续订周期起始日通过绑定的支付方式自动扣除，直至您主动取消。',
          '7 天免费试用规则：若月度套餐包含 7 天免费试用，您可在 7 天内随时通过收据邮件或后台自助取消订阅，系统在试用期内绝对不会向您收取月费。'
        ],
        callout: {
          type: 'success',
          title: '银行级加密结算',
          text: '全部交易均经由 256 位 SSL 银行级加密传输。我们从不触碰、也不保存您的信用卡等敏感财务数据。'
        }
      },
      {
        id: 'disclaimer-warranties',
        title: '7. 免责声明（按现状提供）',
        content: [
          '本服务按“现状 (AS IS)”和“可提供性 (AS AVAILABLE)”原则提供，不附带任何明示或默示的保证，包括但不限于对适销性、特定用途适用性或不侵权的默示保证。',
          '我们不保证本扩展的运行不会中断、无差错或完全不受干扰。第三方目标网站的前端 DOM 结构、网络协议或反爬机制可能随时更新，从而可能导致特定规则的选择器暂时失效。我们无法保证软件能无限期兼容所有特定的第三方网页。'
        ]
      },
      {
        id: 'limitation-liability',
        title: '8. 赔偿责任限制与上限',
        content: [
          '在适用法律允许的最大范围内，开发者及其关联方对因使用或无法使用本服务引起的任何间接、偶然、附带、特殊或惩罚性损害（包括因使用本工具导致的目标网站封号、IP 封禁、数据丢失或业务中断）概不承担赔偿责任。',
          '在任何情况下，我们针对您因使用本服务产生的所有索赔所承担的全部累计赔偿金额，均以您在索赔前 12 个月内向我们实际支付的费用总额为最高上限。'
        ]
      },
      {
        id: 'termination',
        title: '9. 许可终止与注销',
        content: [
          '如发生恶意欺诈拒付、未经授权倒卖或转借授权凭据、破解授权验证机制等违规行为，我们有权在不事先通知的情况下注销相关授权码并终止高级功能使用资格。'
        ]
      },
      {
        id: 'governing-law',
        title: '10. 适用法律与争议解决',
        content: [
          '本条款的订立、执行和解释均适用开发者所在地之有效法律。',
          '在提起正式诉讼之前，各方同意首先通过友好协商解决纠纷。如您有任何疑问或争议，请首先发送邮件至 easyscraper.one@gmail.com 与我们沟通。'
        ]
      }
    ]
  }
}

export const termsData: Record<SupportedLocale, LegalDocument> = {
  ...baseTermsData,
  zh_CN: baseTermsData.zh
}

const basePrivacyData: Record<'en' | 'zh', LegalDocument> = {
  en: {
    title: 'Privacy Policy',
    subtitle: 'Transparent privacy practices under our strict Local-First, Zero-Telemetry architecture.',
    lastUpdated: 'November 2, 2026',
    badge: 'Local-First • Zero-Telemetry • Chrome Limited Use Compliant',
    metaContact: {
      developer: 'Easy Web Scraper Team',
      supportEmail: 'easyscraper.one@gmail.com',
      devEmail: 'yi444978264@gmail.com',
      githubIssues: 'https://github.com/debugger-007/easyscraper/issues'
    },
    tldr: {
      title: 'Privacy Commitment Highlights',
      items: [
        '100% Client-Side Operation: All DOM traversal, CSS selector matching, table parsing, stream media sniffing, trans-muxing, and file serialization are executed completely within your local browser environment.',
        'No Central Tracking Servers: We do NOT operate remote tracking, proxy, or data aggregation servers. NO analytics SDKs (Google Analytics, Mixpanel, Firebase) and NO advertising modules.',
        'Data We Do NOT Collect: No Personally Identifiable Information (PII), browsing history, authentication cookies, session tokens, or target page extracted payloads are ever collected.',
        'Google Chrome Limited Use Compliant: Meets all Chrome Web Store Developer Program Policies with complete user-controlled local data erasure.'
      ]
    },
    sections: [
      {
        id: 'overview',
        title: '1. Overview & Core Commitment',
        content: [
          'Welcome to Easy Web Scraper ("we", "our", or "the Extension"). We respect user privacy and are fully committed to protecting your personal data.',
          'Easy Web Scraper is engineered under a strict "Local-First, Zero-Telemetry" architectural paradigm:'
        ],
        subsections: [
          {
            title: 'Foundational Principles',
            content: [],
            bulletPoints: [
              '100% Client-Side Operation: All DOM traversal, CSS selector matching, table parsing, stream media sniffing, trans-muxing, and file serialization are executed completely within your local browser environment.',
              'No Central Tracking Servers: We do NOT operate remote tracking, proxy, or data aggregation servers.',
              'Zero Third-Party Trackers: The Extension contains NO analytics SDKs (e.g., Google Analytics, Mixpanel, Firebase) and NO advertising modules.'
            ]
          }
        ],
        callout: {
          type: 'info',
          title: 'Zero-Telemetry Architecture',
          text: 'We do not collect usage diagnostics, page visit logs, or user session data. What happens in your browser stays in your browser.'
        }
      },
      {
        id: 'data-not-collected',
        title: '2. Data We Do NOT Collect',
        content: [
          'We do NOT collect, sell, transfer, or monitor the following information under any circumstances:'
        ],
        subsections: [
          {
            title: 'Protected Categories',
            content: [],
            bulletPoints: [
              'Personally Identifiable Information (PII): Names, home addresses, phone numbers, email addresses, government IDs, financial accounts, or passwords.',
              'Browsing History & Behavioral Logs: Full browsing logs, search queries, keystrokes, mouse heatmaps, or behavioral telemetry across the web.',
              'Private Web Credentials: Authentication cookies, session tokens, or private browsing data from unauthorized domains.',
              'Target Page Payload: The text, datasets, tables, images, or media streams extracted from webpages are never sent to us or any unauthorized third party.'
            ]
          }
        ]
      },
      {
        id: 'local-data',
        title: '3. Data Processed Locally (Client-Side Only)',
        content: [
          'The Extension temporarily processes and stores the following technical information solely on your local machine:'
        ],
        subsections: [
          {
            title: 'Local Storage Breakdown',
            content: [],
            bulletPoints: [
              'User-Defined Scraping Rules & Presets: Extraction schemas, CSS/XPath rules, and workflow configuration stored in chrome.storage.local.',
              'Extracted Datasets & Media Vault: Tabular rows, scraped URLs, captured image links, and cached media segments (.m3u8, .ts, .mp4) stored in local IndexedDB and the Origin Private File System (OPFS).',
              'Optional External Sync Credentials: If you explicitly choose to configure personal tokens (e.g., GitHub Personal Access Token or custom Webhook URLs), these credentials are stored exclusively in your browser\'s private local storage (chrome.storage.local).'
            ]
          }
        ],
        callout: {
          type: 'success',
          title: 'Private Sandbox Isolation',
          text: 'Local storage is sandboxed by Chrome per extension origin, inaccessible by other websites or extensions.'
        }
      },
      {
        id: 'permissions',
        title: '4. Browser Permissions & Justifications',
        content: [
          'In accordance with the Principle of Least Privilege, every permission requested in manifest.json serves an indispensable functional purpose:'
        ],
        subsections: [
          {
            title: 'Permission Manifest Audit',
            content: [],
            bulletPoints: [
              'storage & unlimitedStorage: Persists user-defined scraping rules, table selectors, and local Media Vault metadata on your device. unlimitedStorage ensures large datasets and video segment caches do not crash due to the default 5MB storage quota.',
              'activeTab & scripting: Injects the visual element picker and highlighter overlay only into the tab you are actively inspecting to select DOM targets and tables interactively.',
              'tabs & webNavigation: Reads the active tab ID and URL to bind the sidepanel workbench with the inspected frame, synchronizes pagination states across Single Page Application (SPA) routing, and cleans up memory when tabs close.',
              'webRequest & declarativeNetRequest: Inspects media stream network requests (onHeadersReceived for .m3u8, .mp4, HLS playlists) on the current page to display them in the Media Vault, and appends necessary Referer/Origin headers to prevent download blocking caused by host hotlink protections.',
              'downloads: Saves user-initiated exports (Excel XLSX, CSV files, and downloaded media files) directly into your local "Downloads" folder.',
              'tabCapture: Captures the audio/video stream of the current tab only when you explicitly click the "Live Screen/Audio Record" button to record content that cannot be downloaded via direct stream URLs.',
              'sidePanel: Renders the visual workspace interface in the browser\'s side panel, allowing side-by-side data preview without obstructing page content.',
              'alarms: Manages periodic background cleanup for abandoned temporary streaming buffers and cache eviction.',
              '<all_urls> (Host Permission): Enables visual scraping and media stream detection across diverse, arbitrary web domains as designated on-demand by the user.'
            ]
          }
        ]
      },
      {
        id: 'third-parties',
        title: '5. Third-Party Integrations & Network Transmission',
        content: [
          'Easy Web Scraper operates locally by default and does not sell or share user data. The following third-party network transmissions occur only under specific user actions:'
        ],
        subsections: [
          {
            title: 'User-Initiated Network Calls',
            content: [],
            bulletPoints: [
              'Pro License Verification (Dodo Payments): If you purchase or activate a Pro subscription, the Extension transmits your license key and an anonymous instance identifier directly to Dodo Payments (api.dodopayments.com) via HTTPS to verify license validity and activation status. No payment credentials or banking information are ever handled or stored by the Extension.',
              'GitHub Image Hosting: Image assets extracted by the user are uploaded directly from your local browser to your own designated GitHub repository via the GitHub REST API using your personal access token.',
              'Custom Webhooks: Extracted JSON payloads are dispatched directly from your browser to your specified Webhook URL.',
              'Zero Intermediary: No data passes through our private infrastructure; all communication is strictly peer-to-peer between your client and your destination service.'
            ]
          }
        ]
      },
      {
        id: 'data-retention',
        title: '6. Data Storage, Retention, and Deletion',
        content: [
          'Storage Locations: All operational data resides strictly in your browser\'s local sandbox (chrome.storage.local, IndexedDB, and OPFS).',
          'Data Erasure Mechanisms:'
        ],
        subsections: [
          {
            title: 'How to Permanently Erase Data',
            content: [],
            bulletPoints: [
              'You can purge all cached data, scraped tables, and media files at any moment by navigating to Extension Settings -> Clear All Data.',
              'Uninstalling the Extension instantly and permanently removes all stored data, schemas, and credentials from your browser.'
            ]
          }
        ]
      },
      {
        id: 'chrome-policy',
        title: '7. Google Chrome Web Store Limited Use Compliance',
        content: [
          'Easy Web Scraper strictly complies with the Chrome Web Store Developer Program Policies, including the Limited Use requirements:'
        ],
        subsections: [
          {
            title: 'Limited Use Commitments',
            content: [],
            bulletPoints: [
              '1. We only use access to user data to provide or improve user-facing features that are prominent in the Extension’s user interface.',
              '2. We do not transfer user data to third parties, except as necessary to provide or improve features upon explicit user instruction, or to comply with applicable law.',
              '3. We do not use or transfer user data for serving advertisements, personalized marketing, or retargeting.',
              '4. We do not use or transfer user data to determine creditworthiness or for lending purposes.',
              '5. No human reads your data unless explicit consent is provided for diagnostic debugging.'
            ]
          }
        ]
      },
      {
        id: 'regulatory-rights',
        title: '8. Regulatory Rights (GDPR & CCPA / CPRA)',
        content: [
          'GDPR (European Economic Area): All data processing occurs locally under your direct consent and supervision. We do not process personal data as a remote Data Controller.',
          'CCPA / CPRA (California Residents): We do not "sell" or "share" consumer personal information as defined by California privacy statutes.',
          'Your Rights: You have the absolute right to inspect, export, or permanently erase all data generated by the Extension at any time through your local browser settings.'
        ]
      },
      {
        id: 'children-privacy',
        title: '9. Children\'s Privacy',
        content: [
          'Easy Web Scraper does not address anyone under the age of 13, nor does it knowingly harvest personal data from children.'
        ]
      },
      {
        id: 'contact',
        title: '10. Contact Us & Support',
        content: [
          'If you have questions, feedback, or require privacy assistance, please reach out through our official channels:',
          '• Developer Email: yi444978264@gmail.com',
          '• Support Email: easyscraper.one@gmail.com',
          '• GitHub Issues: https://github.com/debugger-007/easyscraper/issues'
        ]
      }
    ]
  },
  zh: {
    title: '隐私政策 (Privacy Policy)',
    subtitle: '基于“本地优先、零数据回传”架构的全面隐私保护与数据处理准则。',
    lastUpdated: '2026年11月2日',
    badge: '本地优先 • 零数据回传 • Chrome 网上应用店受限使用政策合规',
    metaContact: {
      developer: 'Easy Web Scraper Team',
      supportEmail: 'easyscraper.one@gmail.com',
      devEmail: 'yi444978264@gmail.com',
      githubIssues: 'https://github.com/debugger-007/easyscraper/issues'
    },
    tldr: {
      title: '核心隐私承诺要点',
      items: [
        '100% 本地客户端运算：所有的网页 DOM 树遍历、元素选取高亮、表格结构智能解析、流媒体嗅探、音视频转码及分片打包合并，均完全在您本机的浏览器沙箱进程内运行。',
        '无中心化追踪服务器与第三方埋点：不设立任何数据回传与归集服务器，代码内严禁引入 Google Analytics、Mixpanel 等第三方分析或广告 SDK。',
        '绝不收集敏感信息与抓取内容：真实姓名、账号密码、Cookie 凭据、浏览记录以及您抓取的网页数据，我们完全无法获取或查看。',
        '全面遵循 Chrome Web Store 政策：严格遵循最小必要权限、单一用途及受限使用政策（Limited Use），提供完整的一键本地数据物理销毁机制。'
      ]
    },
    sections: [
      {
        id: 'overview',
        title: '1. 概述与核心隐私承诺',
        content: [
          '欢迎使用 Easy Web Scraper（智能网页数据采集与视频提取助手）（以下统称“本插件”或“我们”）。我们高度重视用户的个人隐私与数据安全，并致力于为全球用户提供公开、透明、安全的使用体验。',
          'Easy Web Scraper 严格遵循 “本地优先（Local-First）、零追踪（Zero-Telemetry）” 的底层架构设计原则：'
        ],
        subsections: [
          {
            title: '底层架构三原则',
            content: [],
            bulletPoints: [
              '100% 本地客户端运算：所有的网页 DOM 树遍历、元素选取高亮、表格结构智能解析、流媒体嗅探、音视频转码及分片打包合并，均完全在您本机的浏览器沙箱进程内运行。',
              '无中心化追踪服务器：我们不设立、不运营任何用于回传、归集或分析用户浏览轨迹与采集内容的中心化后端服务器。',
              '无第三方埋点与跟踪器：插件代码内严禁且从未引入 Google Analytics、Mixpanel、Firebase 等第三方用户行为分析、埋点统计或广告营销 SDK。'
            ]
          }
        ],
        callout: {
          type: 'info',
          title: '零追踪架构',
          text: '无用户使用诊断、无页面访问日志、无用户会话留痕。您的数据 100% 留存在您本机。'
        }
      },
      {
        id: 'data-not-collected',
        title: '2. 我们绝不收集的信息',
        content: [
          '我们在任何情况下均不会收集、传输、转售、分发或窥探以下任何信息：'
        ],
        subsections: [
          {
            title: '绝不收集的信息范围',
            content: [],
            bulletPoints: [
              '个人身份识别信息（PII）：包括但不限于真实姓名、住址、电话号码、电子邮箱、身份证件号、银行账户、信用卡信息及登录密码。',
              '完整浏览历史与行为轨迹：我们不会记录您日常访问的网页历史、搜索关键词、按键记录、鼠标热力图或页面停留时间。',
              '敏感凭据与会话 Cookie：我们不会截获、读取或上传您在其他网站上的登录凭证、认证 Token 或 Cookie 敏感信息。',
              '抓取内容的所有权保护：您通过本插件提取的任何网页文本、表格结构、图片直链或音视频文件，均属于您个人的私有数据，我们完全无法获取或查看。'
            ]
          }
        ]
      },
      {
        id: 'local-data',
        title: '3. 仅在本地处理的数据（客户端处理）',
        content: [
          '为了实现网页数据提取和流媒体下载的核心功能，本插件仅在您的本地设备中临时存储与处理以下技术数据：'
        ],
        subsections: [
          {
            title: '本地沙箱数据类别',
            content: [],
            bulletPoints: [
              '用户自定义规则与预设：您配置的数据抽取规则模板、字段选择器（CSS Selector / XPath）以及界面布局偏好，均仅持久化保存在本地 chrome.storage.local 中。',
              '本地采集资产与媒体库（Media Vault）：提取出的表格数据、列表记录、图片直链以及嗅探缓存的音视频流分片（.m3u8, .ts, .mp4），仅保存在您本机的浏览器私有存储中（IndexedDB 及 Origin Private File System - OPFS）。',
              '用户自选配置的第三方凭据：若您主动配置了 GitHub 个人访问令牌（PAT）或自定义 Webhook 地址，这些凭据均仅安全保存在本机的 chrome.storage.local 中，仅在您主动触发同步时由本地发起直连，不经由任何第三方中转。'
            ]
          }
        ],
        callout: {
          type: 'success',
          title: '本地沙箱物理隔离',
          text: '所有持久化数据均受 Chrome 底层扩展沙箱隔离保护，任何外部网页或其他扩展均无权跨域读取。'
        }
      },
      {
        id: 'permissions',
        title: '4. 浏览器权限使用说明与正当理由',
        content: [
          '根据 Chrome 网上应用店的“最小权限原则（Minimum Necessary Permissions）”，本插件在 manifest.json 中声明的各项权限均具备唯一、明确且不可替代的业务用途：'
        ],
        subsections: [
          {
            title: 'Manifest 权限审查与合规理由',
            content: [],
            bulletPoints: [
              'storage & unlimitedStorage：用于在用户本地设备保存提取规则模板、字段配置、任务历史记录及本地 Media Vault 离线索引。由于用户导出的表格数据及音视频缓存常超过默认的 5MB 配额限制，必须申请 unlimitedStorage 避免浏览器存储溢出崩溃。',
              'activeTab & scripting：仅在用户主动点击插件图标或唤起侧边栏工作台时，向当前活跃标签页注入可视化的元素选择框与高亮悬停遮罩，实现点击即选的交互式 DOM 提取。',
              'tabs & webNavigation：获取当前标签页的 Tab ID 和标题，用于将侧边栏工作台与目标页面进行双向绑定通信；监控单页应用（SPA）的路由跳转与自动翻页时序，并在标签页关闭时及时销毁内存监听。',
              'webRequest & declarativeNetRequest：用于在网络层侦听媒体流响应头（如 HLS .m3u8 播放列表、MP4 媒体切片），将可下载的媒体资源呈现在 Media Vault 中；在本地合并下载时动态附加页面必需的 Referer/Origin 请求头，以穿透资源服务器的防盗链限制。',
              'downloads：仅在用户明确点击“导出 Excel”、“导出 CSV”或“下载音视频”按钮时，调用浏览器底层下载管理器将生成的文件保存至本机的“下载”目录。',
              'tabCapture：仅在用户明确点击“录制标签页音视频”功能时，捕获当前标签页的实时音画流，用于对无法通过常规网络分片下载的加密直播流或 Canvas 动画进行本地归档。',
              'sidePanel：将插件工作台置于浏览器原生侧边栏中渲染，使用户在保持当前网页完整可见的同时，并排进行字段点选、数据实时预览与任务配置。',
              'alarms：用于后台运行周期性的临时缓冲清理任务，自动淘汰失效的媒体分片缓存，防止磁盘与内存占用膨胀。',
              '<all_urls> (主机权限)：由于本插件属于通用型网页数据提取与流媒体归档工具，用户可能在任何合法且公开的互联网站点上使用提取功能，因此必须在全域范围内按需注入元素提取器与媒体嗅探模块。'
            ]
          }
        ]
      },
      {
        id: 'third-parties',
        title: '5. 第三方服务集成与网络传输说明',
        content: [
          'Easy Web Scraper 默认完全在本地运行，不包含任何内置的用户数据回传或行为分析接口。仅在以下用户明确触发的场景下，会向指定的第三方服务发起必要的网络请求：'
        ],
        subsections: [
          {
            title: '用户主动触发的网络直连场景',
            content: [],
            bulletPoints: [
              'Pro 会员授权校验（Dodo Payments）：当您购买或激活专业版（Pro）时，插件会将您输入的授权密钥（License Key）及随机生成的匿名设备实例 ID，通过 HTTPS 安全直连 Dodo Payments 官方接口（api.dodopayments.com）以验证授权状态。插件本身绝不处理、接触或存储任何信用卡信息或银行支付凭证（全部支付流程均由合规商户 Dodo Payments 安全承载）。',
              'GitHub 图床集成：仅当您主动配置并触发图片转存时，浏览器直接调用 GitHub 官方 API 将图片推送到您自有的仓库中，使用您自己提供的 Token 进行鉴权。',
              '自定义 Webhook 接收端：仅当您配置并点击推送时，浏览器直接向您指定的 Webhook 接口发送结构化 JSON 报文。',
              '零中转保证：所有网络流量均属于您本地客户端与目标服务之间的直接端到端通信，插件开发者无法截获或窥探传输内容。'
            ]
          }
        ]
      },
      {
        id: 'data-retention',
        title: '6. 数据存储、留存与彻底销毁机制',
        content: [
          '存储介质与位置：所有数据完全驻留在您本地的沙箱存储中（包括 chrome.storage.local、IndexedDB 以及浏览器私有文件系统 OPFS）。',
          '用户自主销毁方式：'
        ],
        subsections: [
          {
            title: '永久物理销毁途径',
            content: [],
            bulletPoints: [
              '您可以随时在插件“设置”面板中点击“清空全部本地数据”，一键抹除所有保存的规则、任务日志及媒体文件。',
              '直接在浏览器扩展管理界面中卸载（Uninstall）本插件，浏览器将物理删除本插件所有的本地缓存与持久化数据。'
            ]
          }
        ]
      },
      {
        id: 'chrome-policy',
        title: '7. 遵循 Chrome Web Store 开发者计划与受限使用政策（Limited Use）',
        content: [
          '本插件严格遵守 Google Chrome Web Store 的《开发者计划政策》以及《受限使用政策（Limited Use Policy）》：'
        ],
        subsections: [
          {
            title: '受限使用承诺五条',
            content: [],
            bulletPoints: [
              '1. 单一用途（Single Purpose）：插件的所有数据访问仅用于向用户提供直观的网页数据提取与流媒体嗅探归档核心功能。',
              '2. 禁止数据转让：我们严禁并将永远不会向任何数据经纪商、广告商或信息聚合平台转让或出售用户数据。',
              '3. 禁止广告与画像：插件处理的数据绝不用于展示广告、个性化推荐、信用评估或第三方机构贷款征信。',
              '4. 禁止未经授权的人工查阅：任何人员均无权人工查阅您的提取内容或本地数据，除非您在提交问题反馈时主动向我们发送诊断日志。',
              '5. 严禁执行远程代码：插件遵循 Manifest V3 安全标准，所有脚本、界面及依赖库均在离线打包时经过严格编译并置于扩展包内，严禁且不包含任何动态 eval()、new Function() 或远程 CDN 脚本加载。'
            ]
          }
        ]
      },
      {
        id: 'regulatory-rights',
        title: '8. 国际隐私法规合规（GDPR & CCPA）',
        content: [
          '欧盟通用数据保护条例（GDPR）：鉴于我们不持有中心化服务器且不收集用户个人身份信息，我们不作为数据控制者在远程服务器上处理您的个人数据。所有数据加工均在您的授权控制下于本地沙箱进行。',
          '加利福尼亚州消费者隐私法（CCPA / CPRA）：我们绝不会“出售（Sell）”或“共享（Share）”消费者的任何个人数据或行为记录。',
          '用户法定权利：您依法享有对自己设备中存储数据的完全访问权、随时导出权与彻底擦除权。'
        ]
      },
      {
        id: 'children-privacy',
        title: '9. 未成年人与儿童隐私保护',
        content: [
          '本插件面向通用网络生产力与开发者场景设计，不针对 13 周岁以下（或所在司法管辖区规定的未成年人年龄标准）的儿童，我们不会刻意收集或索取未成年人的任何个人信息。'
        ]
      },
      {
        id: 'contact',
        title: '10. 隐私政策变更与联系支持',
        content: [
          '我们可能会根据法律法规或功能迭代的需要适时修订本政策。任何修改均会在本政策顶部注明最新的生效日期。',
          '如果您对本隐私政策有任何疑问、建议或隐私合规诉求，欢迎通过以下官方渠道与我们联系：',
          '• 开发者支持邮箱：yi444978264@gmail.com',
          '• 官方支持邮箱：easyscraper.one@gmail.com',
          '• GitHub 议题反馈（Issues）：https://github.com/debugger-007/easyscraper/issues'
        ]
      }
    ]
  }
}

export const privacyData: Record<SupportedLocale, LegalDocument> = {
  ...basePrivacyData,
  zh_CN: basePrivacyData.zh
}

const baseRefundData: Record<'en' | 'zh', LegalDocument> = {
  en: {
    title: 'Refund & Cancellation Policy',
    subtitle: 'Transparent, risk-free refund guarantees for Easy Web Scraper purchases.',
    lastUpdated: 'November 2, 2026',
    badge: '30-Day Money-Back Guarantee • Instant Self-Service',
    metaContact: {
      developer: 'Easy Web Scraper Team',
      supportEmail: 'easyscraper.one@gmail.com',
      devEmail: 'yi444978264@gmail.com',
      githubIssues: 'https://github.com/debugger-007/easyscraper/issues'
    },
    tldr: {
      title: 'Quick Policy Highlights',
      items: [
        'Lifetime Edition: 30-Day unconditional money-back guarantee. Full 100% refund upon request.',
        'Pro Monthly Plan: 7-Day free trial included ($0 billed on day 1). Cancel anytime before day 7 without being charged.',
        'Self-Service Portal: Easily cancel renewals or initiate refund requests directly via your Dodo Payments receipt email.',
        'Fast Processing: Refunds are processed within 1 to 3 business days back to your original payment method.'
      ]
    },
    sections: [
      {
        id: 'commitment',
        title: '1. Our Commitment to Your Satisfaction',
        content: [
          'At Easy Web Scraper, we build precision tools for developers, data engineers, and growth professionals. We believe software should earn your trust through performance.',
          'If Easy Web Scraper does not satisfy your workflow expectations or technical requirements, our refund policy gives you complete peace of mind when upgrading to our paid tiers.'
        ]
      },
      {
        id: 'plan-policies',
        title: '2. Plan-Specific Refund Terms',
        content: [
          'Please review the refund rules associated with your purchased tier below:'
        ],
        subsections: [
          {
            title: 'Lifetime Edition ($39.00 One-Time Payment)',
            content: [
              'We offer a 30-Day Money-Back Guarantee for all Lifetime purchases.'
            ],
            bulletPoints: [
              'Eligible Period: Valid for 30 calendar days from the moment of purchase.',
              'No Questions Asked: Whether you encountered an unsupported target site or simply no longer need the tool, you are entitled to a 100% full refund.',
              'License Status: Upon issuance of the refund, your perpetual license key will be automatically deactivated in our system.'
            ]
          },
          {
            title: 'Pro Monthly Subscription ($6.99 / Month)',
            content: [
              'Pro Monthly subscriptions feature a built-in 7-day risk-free trial:'
            ],
            bulletPoints: [
              '7-Day Free Trial ($0 Charged): When signing up for Pro Monthly, your initial payment is $0. You can explore all premium features for 7 full days without paying.',
              'Canceling Before Day 7: Cancel before the trial ends, and your payment method will never be charged.',
              'Monthly Renewals: Once a monthly billing cycle has processed, recurring fees are generally non-refundable. However, if you intended to cancel but missed the deadline by less than 48 hours, contact our support team and we will happily approve a goodwill refund for the latest cycle.'
            ]
          }
        ],
        callout: {
          type: 'success',
          title: '30-Day Risk-Free Guarantee',
          text: 'Lifetime customers have a full 30 days to evaluate the software locally on their own websites.'
        }
      },
      {
        id: 'how-to-refund',
        title: '3. How to Request a Refund',
        content: [
          'Requesting a refund is simple and fast. You can use either of the following two methods:'
        ],
        subsections: [
          {
            title: 'Option A: Self-Service via Dodo Payments (Fastest)',
            content: [
              '1. Open the original receipt email you received from Dodo Payments after purchase.',
              '2. Click on the "Manage Order" or "View Receipt" button.',
              '3. Access your customer portal to cancel future subscription renewals or submit a refund request with one click.'
            ]
          },
          {
            title: 'Option B: Direct Email Support',
            content: [
              'Send an email to easyscraper.one@gmail.com (or yi444978264@gmail.com) with the subject line "Refund Request - [Your Order ID]". Please include:',
              '• The email address entered at checkout',
              '• Your Dodo Payments Payment ID / Order ID (e.g., pay_XXXXXXXXXX)',
              '• (Optional) A brief note about why the tool did not fit your needs, so our engineering team can improve.'
            ]
          }
        ]
      },
      {
        id: 'processing-time',
        title: '4. Processing Times & Fund Returns',
        content: [
          'Once approved, our team submits your refund through Dodo Payments immediately. You will receive an automated refund confirmation email.',
          'Depending on your payment processor and issuing bank, the funds typically appear on your statement within:',
          '• Credit / Debit Cards: 3 to 7 business days',
          '• PayPal: 24 to 48 hours',
          '• Apple Pay / Google Pay: 2 to 5 business days'
        ]
      },
      {
        id: 'non-refundable',
        title: '5. Non-Refundable Scenarios & Anti-Abuse',
        content: [
          'While we maintain an open and fair refund policy, we cannot honor refund requests under the following rare circumstances:'
        ],
        subsections: [
          {
            title: 'Ineligible Scenarios',
            content: [
              'Refunds will not be approved if:'
            ],
            bulletPoints: [
              'The request is submitted more than 30 days after the purchase date for a Lifetime Edition.',
              'The user has initiated a formal chargeback or dispute with their credit card company or PayPal before contacting us (filing a dispute locks funds and transfers jurisdiction to the bank).',
              'The account has repeatedly purchased and requested refunds across multiple disposable email addresses (abuse of the guarantee).',
              'The license key was found to be publicly distributed, cracked, or shared across illegal software distribution forums.'
            ]
          }
        ],
        callout: {
          type: 'warning',
          title: 'Tip: Contact Us Before Disputing',
          text: 'Bank disputes often take 30 to 90 days to settle. Reaching out directly to our support team ensures your refund is resolved within 1 to 3 business days.'
        }
      },
      {
        id: 'contact',
        title: '6. Support & Billing Inquiries',
        content: [
          'Have questions about your billing, upcoming renewals, or switching from Monthly to Lifetime? Our dedicated support team is here to assist:',
          '• Support Email: easyscraper.one@gmail.com',
          '• Developer Email: yi444978264@gmail.com',
          '• GitHub Issues: https://github.com/debugger-007/easyscraper/issues',
          '• Response Time: Usually within 24 hours on business days'
        ]
      }
    ]
  },
  zh: {
    title: '退款保障与取消政策',
    subtitle: '公开、透明、无风险的退款承诺，保障每位 Easy Web Scraper 用户的消费权益。',
    lastUpdated: '2026年11月2日',
    badge: '30天无理由退款保障 • 自助极速办理',
    metaContact: {
      developer: 'Easy Web Scraper Team',
      supportEmail: 'easyscraper.one@gmail.com',
      devEmail: 'yi444978264@gmail.com',
      githubIssues: 'https://github.com/debugger-007/easyscraper/issues'
    },
    tldr: {
      title: '退款政策核心要点',
      items: [
        '终身买断版（Lifetime）：享 30 天无理由全额退款保障，购买 30 天内申请即可 100% 全额原路退还。',
        'Pro 专业月度版：含 7 天免费试用（首日扣费 $0）。试用期内可随时在后台一键取消，绝不产生扣费。',
        '自助账单管理：所有收据邮件均含 Dodo Payments 自助管理入口，随时可一键停止自动续费或申请退款。',
        '快捷处理时效：退款申请通常在 1 至 3 个工作日内核批并原路退回您的支付账户。'
      ]
    },
    sections: [
      {
        id: 'commitment',
        title: '1. 我们的客户满意度承诺',
        content: [
          'Easy Web Scraper 专为追求极致效率的开发者、数据分析师与增长工程师打造。我们坚信优质软件应当靠卓越的技术实力与使用体验赢得认可。',
          '如果您在购买后发现 Easy Web Scraper 无法满足您的特定业务流需求或遇到无法解决的兼容性问题，我们的退款保障将确保您的付费决策毫无后顾之忧。'
        ]
      },
      {
        id: 'plan-policies',
        title: '2. 各套餐退款细则',
        content: [
          '请查阅针对您所购版本的具体退款规则：'
        ],
        subsections: [
          {
            title: 'Lifetime 终身买断版（一次性支付 $39.00）',
            content: [
              '我们为所有购买终身买断版的用户提供 30 天无理由退款保障：'
            ],
            bulletPoints: [
              '保障周期：自实际下单购买之日起 30 个自然日内有效。',
              '无需繁琐问询：不论是因为软件未达到预期，还是目标站点反爬过于严苛，均可无障碍全额退还。',
              '授权状态变更：退款完成到账后，对应的终身激活码将在授权系统中自动失效。'
            ]
          },
          {
            title: 'Pro 专业月度订阅版（$6.99 / 月）',
            content: [
              'Pro 月度订阅版内置无风险免费体验机制：'
            ],
            bulletPoints: [
              '7 天免费试用（今日实付 $0）：首次开通月度版将开启完整功能的 7 天免费试用，扣款金额为 $0。',
              '7 天内随时一键取消：只要在 7 天试用期结束前在后台点击取消续订，系统将绝对不会向您的银行卡发起扣费。',
              '常规月度续费：试用期结束后的常规月度续费一旦扣费成功，原则上不支持退回已生效周期的费用；但如果您疏忽忘记在续费前取消，并在扣款后 48 小时内联系我们，我们将基于友好原则为您特别审批最近一期的退款。'
            ]
          }
        ],
        callout: {
          type: 'success',
          title: '30 天全额退款保障',
          text: '终身版用户拥有整整 30 天的充分时间在您的真实业务场景中深度测试本工具。'
        }
      },
      {
        id: 'how-to-refund',
        title: '3. 如何申请退款',
        content: [
          '退款申请流程非常便捷，您可以通过以下任意一种途径发起：'
        ],
        subsections: [
          {
            title: '方式一：通过 Dodo Payments 邮件自助办理（最快）',
            content: [
              '1. 打开您下单后收到的 Dodo Payments 官方电子收据邮件。',
              '2. 点击邮件正文中的 “Manage Order”（管理订单）或 “View Receipt” 按钮。',
              '3. 在订单控制台中，您可以一键停止后续月度订阅，或点击申请退款。'
            ]
          },
          {
            title: '方式二：联系官方客服邮箱',
            content: [
              '发送邮件至 easyscraper.one@gmail.com (或 yi444978264@gmail.com)，邮件主题注明“申请退款 - [您的订单号]”，并提供：',
              '• 下单时填写的付款邮箱地址',
              '• Dodo Payments 支付单号（如 pay_XXXXXXXXXX 或 sub_XXXXXXXXXX）',
              '• （选填）简要告知未满足您需求的原因，以帮助我们的工程师持续改进产品。'
            ]
          }
        ]
      },
      {
        id: 'processing-time',
        title: '4. 退款到账时效与资金路径',
        content: [
          '退款申请审核通过后，退款操作将立即通过 Dodo Payments 支付网络下发，您会收到自动退款通知邮件。',
          '退款资金将原路返回至您当时支付所用的卡片或账户，具体入账时间取决于您的银行或支付发卡机构：',
          '• 信用卡 / 借记卡：通常需要 3 至 7 个工作日',
          '• PayPal 余额：通常在 24 至 48 小时内到账',
          '• Apple Pay / Google Pay：通常需要 2 至 5 个工作日'
        ]
      },
      {
        id: 'non-refundable',
        title: '5. 不予受理退款的情形及防滥用原则',
        content: [
          '为了维护健康的开发者生态与绝大多数诚信用户的权益，在以下极少数情况下我们无法支持退款：'
        ],
        subsections: [
          {
            title: '不适用退款的情形',
            content: [
              '发生以下情况时退款申请将被拒绝：'
            ],
            bulletPoints: [
              '终身买断版下单购买已超过 30 个自然日。',
              '在联系我们之前已单方面向信用卡发卡行或 PayPal 发起银行拒付/争议处理（发起争议会冻结账单并移交银行裁决，无法直接原路退款）。',
              '同一用户使用多个虚假或一次性临时邮箱反复购买并连续恶意退款（滥用退款机制）。',
              '授权凭证被检测到公开发布在破解论坛、倒卖网站或被恶意公开分享。'
            ]
          }
        ],
        callout: {
          type: 'warning',
          title: '重要建议：请优先联系官方客服',
          text: '银行争议（Chargeback）通常需要 30 到 90 天且产生额外手续费；直接联系官方客服通常在 1 到 3 个工作日内即可极速原路返还。'
        }
      },
      {
        id: 'contact',
        title: '6. 账单咨询与支持通道',
        content: [
          '如果您对订单金额、自动续费设置或从月度升级为终身买断有任何疑问，请随时联系我们的支持团队：',
          '• 官方客服邮箱：easyscraper.one@gmail.com',
          '• 开发者支持邮箱：yi444978264@gmail.com',
          '• GitHub 议题反馈：https://github.com/debugger-007/easyscraper/issues',
          '• 回复时效：工作日通常在 24 小时内回复'
        ]
      }
    ]
  }
}

export const refundData: Record<SupportedLocale, LegalDocument> = {
  ...baseRefundData,
  zh_CN: baseRefundData.zh
}

