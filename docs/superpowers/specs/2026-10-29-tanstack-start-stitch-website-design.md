# EasyScraper Pro 官网技术架构与设计规范 (TanStack Start)

## 1. 概述与项目背景

本项目旨在基于 [TanStack Start](https://tanstack.com/start) 全栈框架，完美还原并高质量实现 Stitch 项目 **3551841242524823718**（*EasyScraper Pro - All-in-One Web Scraping & Media Sniffer*）的官方网站。

网站具备现代深色毛玻璃（Dark Glassmorphism / Obsidian Glass）极客美学，面向全球开发者与数据分析师展示 Chrome 浏览器扩展的核心优势（纯本地执行、零云端中继、零 Cookie 外泄、可视化智能抓取、媒体流嗅探）。系统内置完善且高度可扩展的国际化（i18n）架构，原生支持中英双语切换，并可零成本横向扩展未来更多语言（如日文、西班牙文等）。

---

## 2. 技术栈与工程规范

* **全栈应用框架**：TanStack Start (React 19 / Nitro / Vite)
* **路由管理**：TanStack Router（文件系统类型安全路由）
* **样式方案**：Tailwind CSS + Tailwind 容器查询与表单插件
* **图标系统**：Lucide React 与 Material Symbols Outlined
* **国际化系统**：强类型 Schema 驱动的自主轻量 i18n 架构（零臃肿依赖、零运行时解析损耗）
* **包管理器**：pnpm (v10+)
* **运行环境**：Node.js v24+

---

## 3. 设计系统规范 (Obsidian Glass Design System)

来源于 Stitch 项目主题配置：

### 3.1 调色盘 (Color Palette)
* **Background / Base Surface**：`#13131b`（深黑灰底色，附带 Indigo/Cyan 径向微光）
* **Surface Containers**：
  * Lowest: `#0d0d15`
  * Low: `#1b1b23`
  * Default: `#1f1f27`
  * High: `#292932`
  * Highest: `#34343d`
* **Primary (Neon Indigo)**：`#6366f1` / `#c0c1ff`（主高亮、焦点环、核心 CTA）
* **Secondary (Cyan)**：`#06b6d4` / `#4cd7f6`（流媒体、实时运行状态、网络指示器）
* **Tertiary (Amber)**：`#ffb783` / `#d97721`（本地优先合规、警告与注意标签）
* **Text Colors**：
  * On-Surface (主文字): `#e4e1ed`
  * On-Surface-Variant (次要文字): `#c7c4d7`
  * Outline / Borders: `rgba(255, 255, 255, 0.08)`，hover 状态 `rgba(255, 255, 255, 0.2)`

### 3.2 字体与排印 (Typography)
* **Display / Headline**：`Geist`, -apple-system, sans-serif
* **Body Text**：`Inter`, system-ui, sans-serif
* **Code / Labels / Metrics**：`JetBrains Mono`, monospace
* **CJK 字符规范**：中文字符统一设置清晰字体回退（PingFang SC, Microsoft YaHei, 微软雅黑），正文使用标准 400 权重保障毛玻璃深色下的可读性。

### 3.3 质感与层级 (Elevation & Depth)
* **毛玻璃材质**：`background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);`
* **边界勾勒**：全玻璃组件标配 `1px solid rgba(255, 255, 255, 0.08)`
* **悬停微光**：hover 时外发光 `box-shadow: 0 0 20px rgba(99, 102, 241, 0.2)`

---

## 4. 国际化 (i18n) 架构设计

### 4.1 核心设计原则
1. **类型安全 (Compile-time Type Safety)**：通过 TypeScript Interface `TranslationSchema` 约束每一个词条分支。新增语言时缺失任何字段即刻报错。
2. **轻量高效 (Zero Overhead)**：不引入冗余第三方重型运行时，编译阶段与打包时按需打入。
3. **横向可扩展 (Seamless Extensibility)**：未来新增语言只需新增 `src/locales/<lang>.ts` 并注册在 `src/locales/index.ts` 即可。

### 4.2 目录与模块
```text
src/
├── locales/
│   ├── types.ts       # 完整 TranslationSchema 接口与支持语言枚举
│   ├── en.ts          # 英文全量词条
│   ├── zh.ts          # 中文全量词条
│   └── index.ts       # getTranslation(lang), supportedLocales, defaultLocale
├── routes/
│   ├── __root.tsx     # 根布局：HTML head, 字体外链, 全局上下文
│   ├── index.tsx      # 默认语言入口 (en)
│   └── $lang.tsx      # 动态语言路由 (zh 及未来扩展语言)
```

### 4.3 词条结构划分
* `meta`: 标题、描述、OpenGraph 社交卡片文本
* `nav`: 导航链接、版本号、Chrome 商店跳转按钮、语言切换文案
* `hero`: 信任徽章、大标题、副标、CTA 按钮、核心数据指标条
* `simulator`: 交互式 IDE 预览窗口各区域文案（网址栏、规则选区、分页状态、数据预览）
* `compliance`: 本地优先架构对比表（维度、本地插件 vs 云端 SaaS）与存储指示器
* `features`: 5 大核心功能（智能选区、视频嗅探、深度分页、多格式导出、自动化配方）
* `sandbox`: 3 个交互式沙盒的演示标题、操作按钮、提示状态与模拟数据
* `footer`: 版权信息、系统合规绿灯、架构声明

---

## 5. 页面组件与交互设计

### 5.1 顶部全局导航 (`Navbar.tsx`)
* **Logo**: 渐变棱镜图形（Kinetic Data Prism），点击平滑回顶部。
* **Links**: 锚点平滑滚动（`#features`, `#compliance`, `#sandbox`, `#export`）。
* **Language Switcher**: 悬浮/下拉菜单，显示当前语言与国旗/标识，点击切换目标语言路由（保留 hash 锚点）。
* **Action CTA**: 显眼的 Chrome 图标与“免费安装扩展”按钮。

### 5.2 Hero 区域与交互式模拟器 (`HeroSection.tsx`)
* **视觉中心**：左侧为极具冲击力的标题、副标与双 CTA 组合；右侧为毛玻璃浏览器模拟窗口（Scraper Studio）。
* **实时模拟器交互**：
  * 商品网格仿真，光标悬浮显示动态虚线选区高亮（Dotted Selector Box）。
  * 选区规则指示条实时高亮与翻页仿真。
  * 底部实时数据流预览（支持表格与 JSON 结构切换展示）。
* **数据指标条 (Metrics Strip)**：50K+ 用户、4.9 星好评、0 云端流量。

### 5.3 架构对比与本地优先矩阵 (`ComplianceMatrix.tsx`)
* 采用对比矩阵呈现“本地扩展 vs 传统云端”，凸显 6 大关键指标：
  1. Cookie 与登录凭证安全
  2. 真实网络出口与代理免被封
  3. 月度 SaaS 订阅费用
  4. 数据隐私与企业合规
  5. 离线/内网运行能力
  6. 导出速度与零等待
* 搭配 IndexedDB 本地存储状态动效计量表。

### 5.4 五大功能卡片 (`FeatureGrid.tsx`)
* 网格响应式布局，毛玻璃卡片搭配不同主题强调色（Indigo、Cyan、Amber、Violet、Emerald）。
* 每个卡片配备专属图标、技术细节徽章与特性描述。

### 5.5 三大交互式测试沙盒 (`InteractiveSandbox.tsx`)
真实响应用户点击体验：
1. **沙盒 1：电商数据实时抓取**
   * 用户点击“立即提取 (Extract Data)”，触发 1.2 秒加载动效与进度条，并在表格中输出抓取的结构化商品数据，支持一键点击“复制 JSON”。
2. **沙盒 2：网络流媒体嗅探器**
   * 模拟视频播放网络流捕获，动态列出嗅探到的 `.m3u8`、`.mp4` 资源，展示比特率与分辨率，支持“模拟下载”。
3. **沙盒 3：CSS/XPath 选择器实时验证器**
   * 输入框内置默认选择器（如 `.product-card .price`），输入变化时动态显示匹配节点数（Matching Nodes）与高亮响应。

### 5.6 页脚 (`Footer.tsx`)
* 完备的导航分栏、隐私白皮书与安全审计徽章、Chrome 官方规范声明。
* “系统状态：100% 本地运行”脉冲绿灯。

---

## 6. 验证与测试策略

1. **构建与类型验证**：`pnpm build` 与 `pnpm test`（或 TypeScript 严格类型检查 `tsc --noEmit`），确保无类型错误。
2. **路由与国际化校验**：
   * 访问 `/` 验证默认英文落地页及所有文案、交互。
   * 访问 `/zh` 验证中文落地页及所有文案、交互。
   * 验证顶部语言切换器在各页面间无缝跳转，路径正确无死链。
3. **交互与响应式校验**：
   * 桌面端（1440px / 1280px）、平板端（768px）和移动端（375px）全断点自适应。
   * 验证沙盒点击事件、模拟抓取流程、选择器输入、JSON 复制等交互功能。

