import type { TranslationSchema } from './types'

export const zh: TranslationSchema = {
  meta: {
    title: 'Easy Web Scraper 简易网页爬虫 - 网页数据与视频嗅探神器 | Chrome 官方扩展',
    description: '点选提取表格与动态列表、自动翻页、毫秒级嗅探加密 HLS/M3U8 视频流并一键导出为 Excel/CSV，原生本地运行，零服务器依赖。'
  },
  nav: {
    hero: '核心特性',
    features: '功能全景',
    sandbox: '实时交互沙盒',
    compliance: '本地优先隐私',
    faq: '常见问题与FAQ',
    versionBadge: 'v2.4.0 • MV3 安全规范 • 稳定版',
    github: '开源源码',
    installCta: '免费安装 Chrome 扩展',
    switchLanguage: '切换语言',
    languages: {
      en: 'English',
      zh: '简体中文'
    }
  },
  hero: {
    pillBadge: '100% 浏览器本地运行 • 零服务器中继',
    titleLead: '可视化网页抓取与流媒体嗅探，',
    titleHighlight: '原生本地运行，',
    titleTail: '极致简便。',
    description: '点选提取表格与复杂动态列表、智能识别下一页自动翻页、毫秒级嗅探加密 HLS/M3U8 视频流并一键导出为 Excel/CSV——全部在您的浏览器原生沙盒内执行，无需编写一行代码。',
    ctaInstall: '免费添加到 Chrome',
    ctaSandbox: '体验在线沙盒',
    metrics: [
      {
        value: '50,000+',
        label: '活跃数据分析师与开发者',
        sub: '全球跨国企业与极客首选'
      },
      {
        value: '4.9 / 5',
        label: 'Chrome 应用商店高分好评',
        sub: '基于 1,200+ 条真实评价'
      },
      {
        value: '0 字节',
        label: '外流云端（零服务器依赖）',
        sub: '绝不上传您的机密会话'
      },
      {
        value: '纯本地',
        label: 'IndexedDB & SheetJS 驱动',
        sub: '毫秒级内存极速解析导出'
      }
    ],
    simulator: {
      windowTitle: '实时标签页检查器 (监控中)',
      statusBadge: '自动翻页嗅探活跃中',
      urlBar: 'https://mall.example.com/collections/hardware-tools',
      streamStats: '32 请求/秒',
      streamCount: '已捕获 2 条流媒体 (.m3u8)',
      tableTab: '结构化字段预览',
      jsonTab: '原生 JSON 载荷',
      exportXlsx: '导出 .xlsx 表格',
      exportCsv: '导出 .csv 文件',
      copyJson: '复制 JSON',
      copied: '已复制！',
      columns: {
        item: '商品名称',
        price: '实时售价',
        stock: '库存状态',
        selector: '生效 CSS 选择器'
      },
      items: [
        {
          title: '高精度智能电动螺丝刀套装 (24合1精工版)',
          price: '¥249.00',
          stock: '现货充足 (48 件)',
          stockType: 'in',
          selector: '.product-card .price'
        },
        {
          title: '高精度激光测距仪 50米专业工程版',
          price: '¥569.00',
          stock: '库存紧张 (仅剩3件)',
          stockType: 'low',
          selector: '.product-card .price'
        },
        {
          title: '无刷无绳大扭矩冲击电钻 20V 工业套装',
          price: '¥899.00',
          stock: '现货充足 (12 件)',
          stockType: 'in',
          selector: '.product-card .price'
        }
      ]
    }
  },
  compliance: {
    pillBadge: '系统架构与隐私合规',
    title: '为什么“本地优先”架构全面颠覆传统云端爬虫？',
    description: '传统云端 SaaS 爬虫往往强制索取您宝贵的登录 Cookie 并集中上传至其中心服务器，存在巨大的泄密风险与封号隐患。Easy Web Scraper 100% 运行在您的 Chrome 本地沙盒内。',
    tableHeaders: {
      criteria: '评测维度 / 核心能力',
      legacy: '传统云端 SaaS 爬虫',
      easyScraper: 'Easy Web Scraper (本地原生引擎)'
    },
    rows: [
      {
        icon: 'key',
        dimension: 'Cookie 与会话凭据安全',
        legacyText: '必须强制上传 Cookie 与会话凭据至第三方云端服务器',
        easyText: '100% 运行于本地浏览器，凭据与 Token 绝不离身'
      },
      {
        icon: 'monitoring',
        dimension: '使用行为与隐私遥测',
        legacyText: '中心集群记录抓取日志、目标 URL 与具体导出数据内容',
        easyText: '零遥测追踪、无用户标识 ID、无任何中心服务器日志'
      },
      {
        icon: 'payments',
        dimension: '价格机制与配额限制',
        legacyText: '每月 $49 - $299 高昂订阅费，严格限制月度抓取点数与频次',
        easyText: '完全免费、不限本地抓取频次与数据导出容量'
      },
      {
        icon: 'block',
        dimension: 'IP 封禁与反爬验证码',
        legacyText: '机房云端 IP 极易被反爬虫系统拦截、识别并封锁',
        easyText: '使用您真实的居民级住宅浏览器原生环境与真实请求'
      },
      {
        icon: 'movie',
        dimension: '视频与流媒体嗅探能力',
        legacyText: '不支持，或需采购高昂成本的无头浏览器代理集群',
        easyText: '原生流媒体网络监听器，直接捕获原始 .m3u8 与 .mp4 流'
      }
    ],
    localGauge: {
      title: '本地沙盒安全存储与内存监控',
      status: '受 Chrome 安全隔离机制保护',
      metrics: [
        {
          label: '出站流量外传',
          value: '0 KB',
          detail: '无任何云端回传请求'
        },
        {
          label: '本地 IndexedDB',
          value: '100% 私有',
          detail: '数据仅保存在您本机的隔离存储中'
        },
        {
          label: '导出转换延迟',
          value: '< 40ms',
          detail: 'SheetJS 纯本地内存瞬时生成 XLSX'
        }
      ]
    }
  },
  features: {
    pillBadge: '硬核工程能力',
    title: '为极致效率与严苛工程打造的五大核心能力',
    description: '专为极客、技术人员、增长工程师及数据分析师打造的高吞吐量抓取神器，彻底告别脆弱昂贵的云端爬虫集群。',
    cards: [
      {
        icon: 'ads_click',
        tag: '智能选择器',
        title: '可视化点选智能提取',
        description: '鼠标悬停即刻预览。内置启发式智能推断引擎，自动生成高鲁棒性 CSS 与 XPath 选择器，一键高亮视口内全部匹配的同类兄弟节点。',
        badge: '启发式推断',
        accentColor: 'indigo'
      },
      {
        icon: 'auto_mode',
        tag: '自动翻页',
        title: '智能自动翻页与平滑滚动',
        description: '自动探测“下一页”按钮、无限瀑布流滚动与“加载更多”锚点。支持拟人化随机延时策略，优雅绕过前端频率限制。',
        badge: '无限瀑布流',
        accentColor: 'cyan'
      },
      {
        icon: 'stream',
        tag: '媒体嗅探',
        title: '网络流媒体嗅探与 HLS 提取',
        description: '深度监听网络底层请求，毫秒级捕获底层 .m3u8 播放列表、分片视频流与 MP4/WebM 二进制资源，支持一键合并快速保存。',
        badge: 'HLS / M3U8',
        accentColor: 'amber'
      },
      {
        icon: 'file_download',
        tag: '多样导出',
        title: '多格式秒级导出与 Webhook 实时同步',
        description: '基于 SheetJS 本地编译 Excel (XLSX) 工作簿、纯文本 CSV 或结构化 JSON 数组，更可配置 Webhook 实时直推本地自动化工作流。',
        badge: 'Excel / CSV / JSON',
        accentColor: 'emerald'
      },
      {
        icon: 'database',
        tag: '极致性能',
        title: 'OPFS 零拷贝高速存储引擎',
        description: '深度整合浏览器私有文件系统 (OPFS) 与 IndexedDB，即使面对数十万条超大规模数据抓取任务，也能确保标签页流畅稳定不崩溃。',
        badge: '十万级高并发',
        accentColor: 'violet'
      }
    ]
  },
  sandbox: {
    pillBadge: '在线体验',
    title: '即开即测：免安装 10 秒在线体验沙盒',
    description: '无需登录任何网站，也无需预先安装扩展。点击下方真实可交互沙盒模块，亲身体验智能 DOM 识别、表格解析与网络视频流嗅探过程。',
    demoA: {
      title: '演示 A: 电商商品目录',
      mode: 'DOM 模式',
      description: '仿真数码电商商品网格，自动识别重复卡片模式与价格选择器。',
      extractBtn: '一键提取全部商品',
      extractingBtn: '正在解析 DOM 元素...',
      items: [
        {
          title: '数显恒温电烙铁 60W 专业版',
          price: '¥168.00',
          stock: '现货充足',
          category: '电子工具'
        },
        {
          title: '高精度自动量程数字万用表',
          price: '¥129.50',
          stock: '现货充足',
          category: '仪器仪表'
        },
        {
          title: '可调直流稳压稳流电源 30V 5A',
          price: '¥399.00',
          stock: '库存紧张',
          category: '实验室设备'
        }
      ],
      summary: '18毫秒内完成 3 条数据结构化提取 • 0 字节上传云端'
    },
    demoB: {
      title: '演示 B: 视频流媒体嗅探器',
      mode: '网络模式',
      description: '模拟底层网络监听引擎，侦测正在播放的高清视频分片流与媒体清单文件。',
      streams: [
        {
          name: 'master_playlist_1080p.m3u8',
          type: 'HLS 实时视频流',
          resolution: '1920x1080',
          size: '4.2 MB 分片缓存',
          bitrate: '4500 kbps'
        },
        {
          name: 'promo_reel_trailer_4k.mp4',
          type: '原始 MP4 二进制',
          resolution: '3840x2160',
          size: '84.6 MB',
          bitrate: '12000 kbps'
        }
      ],
      sniffBtn: '模拟触发视频播放',
      downloadBtn: '本地合并下载该媒体',
      downloadingBtn: '正在本地拼接分片...',
      downloadSuccess: '已导出至浏览器下载目录'
    },
    demoC: {
      title: '演示 C: 选择器与 XPath 调试器',
      mode: '开发者模式',
      description: '实时选择器验证输入框。输入 CSS 选择器或 XPath 语句，动态计算匹配节点并提供状态反馈。',
      inputLabel: '目标选择器表达式',
      defaultSelector: '.product-card .price',
      matchedLabel: '当前匹配节点数量',
      matchedCount: '3 个目标元素 (100% 匹配置信度)',
      testSample: '匹配节点范例: <span class="price">¥249.00</span> 匹配于 div.product-card'
    }
  },
  footer: {
    tagline: '专为 Google Chrome 打造的高性能、本地优先网页抓取与流媒体嗅探扩展。',
    privacyNotice: '零 Cookie 泄露 • 零云端中继 • 100% 严格遵循 Google Chrome 应用商店安全与隐私规范。',
    allSystemsLocal: '所有服务 100% 本地运行',
    zeroCookies: '无远程调用，凭据及 Cookie 仅存储在用户本机',
    installBtn: '免费安装扩展',
    columns: [
      {
        title: '核心功能',
        links: [
          { label: '可视化智能抓取', href: '#features' },
          { label: 'HLS / 视频流嗅探', href: '#features' },
          { label: '自动翻页与滚动', href: '#features' },
          { label: 'OPFS 本地极速存储', href: '#features' }
        ]
      },
      {
        title: '技术规格',
        links: [
          { label: 'Manifest V3 架构规范', href: '#compliance' },
          { label: 'SheetJS & JSON 格式说明', href: '#compliance' },
          { label: '本地隐私安全白皮书', href: '#compliance' },
          { label: 'GitHub 开源仓库', href: 'https://github.com' }
        ]
      },
      {
        title: '合规与信任',
        links: [
          { label: '隐私安全承诺', href: '#compliance' },
          { label: '服务使用条款', href: '#compliance' },
          { label: '独立安全审计报告', href: '#compliance' }
        ]
      }
    ],
    copyright: '© 2026 Easy Web Scraper. 保留所有权利。',
    builtWith: '基于 Chromium 原生安全 API 构建',
    badges: [
      { icon: 'shield', label: 'Manifest V3 规范' },
      { icon: 'cloud_off', label: '零远程网络回传' },
      { icon: 'cookie_off', label: '免 Cookie 上传' }
    ]
  }
}
