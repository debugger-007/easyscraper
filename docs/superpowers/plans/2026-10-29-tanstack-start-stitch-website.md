# TanStack Start Stitch 官网实现实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 TanStack Start 框架完整实现 Stitch 项目 3551841242524823718 中的 EasyScraper Pro 官网，支持 Obsidian Glass 暗黑设计系统、类型安全可扩展双语 i18n 系统及全套交互式测试沙盒。

**Architecture:** 采用 TanStack Start 全栈 SSR/SSG 架构，通过 Tailwind CSS 深度定制 Stitch Obsidian Glass 主题。多语言由轻量强类型 i18n 字典驱动，`routes/index.tsx` 服务默认英文，`routes/$lang.tsx` 动态服务中文及未来扩展语言。组件高度模块化（Navbar, Hero, ComplianceMatrix, FeatureGrid, InteractiveSandbox, Footer）。

**Tech Stack:** TanStack Start, TanStack Router, React 19, Vite, Tailwind CSS, Lucide React, pnpm, TypeScript.

## Global Constraints
- Node version: >= 20 (current: v24)
- Package Manager: pnpm
- Design system: Dark Obsidian Glass (`#13131b` background, Neon Indigo `#6366f1` / Cyan `#06b6d4`, backdrop-filter blur)
- i18n: Compile-time type safe via TypeScript `TranslationSchema`, route-based `/` (EN) and `/$lang` (ZH)

---

### Task 1: 初始化 TanStack Start 项目与 Tailwind CSS 基础设施

**Files:**
- Create: `package.json`, `tsconfig.json`, `app.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `src/styles.css`

- [ ] **Step 1: 创建 package.json 并安装 TanStack Start、Tailwind CSS 及依赖**
- [ ] **Step 2: 配置 app.config.ts (Vite / Nitro 配置) 与 tsconfig.json**
- [ ] **Step 3: 配置 tailwind.config.ts 注入 Obsidian Glass 颜色、圆角与字体规范**
- [ ] **Step 4: 创建 src/styles.css 引入 Tailwind 指令与 Google Fonts (Geist, Inter, JetBrains Mono)**
- [ ] **Step 5: 验证配置能够通过 TypeScript 编译检查**

---

### Task 2: 实现类型安全的 i18n 国际化引擎

**Files:**
- Create: `src/locales/types.ts`
- Create: `src/locales/en.ts`
- Create: `src/locales/zh.ts`
- Create: `src/locales/index.ts`

- [ ] **Step 1: 编写 src/locales/types.ts 定义 TranslationSchema 强类型接口**
- [ ] **Step 2: 编写 src/locales/en.ts 录入完整的英文官网数据字典**
- [ ] **Step 3: 编写 src/locales/zh.ts 录入对应的中文官网数据字典**
- [ ] **Step 4: 编写 src/locales/index.ts 导出 getTranslation、supportedLocales 及类型安全解析函数**
- [ ] **Step 5: 编写测试脚本验证 en.ts 与 zh.ts 键名 100% 对齐无缺失**

---

### Task 3: 根路由布局与基础设计组件搭建

**Files:**
- Create: `src/routes/__root.tsx`
- Create: `src/components/PrismLogo.tsx`

- [ ] **Step 1: 创建 src/components/PrismLogo.tsx 实现 Stitch 项目标志性的 Kinetic Data Prism 渐变几何 Logo**
- [ ] **Step 2: 编写 src/routes/__root.tsx 包含 HTML head 注入、字体链接、暗黑模式基底与全局背景环境光**
- [ ] **Step 3: 运行并验证根布局渲染**

---

### Task 4: 实现全局顶部导航栏组件 (Navbar)

**Files:**
- Create: `src/components/Navbar.tsx`

- [ ] **Step 1: 编写 Navbar 组件，集成 Kinetic Prism Logo、版本徽章 (`v2.4.0 • Manifest V3`)**
- [ ] **Step 2: 实现锚点链接（功能、合规矩阵、沙盒测试、文档导出）**
- [ ] **Step 3: 实现 Language Switcher（中英文切换下拉/切换按钮，支持扩展未来语言）**
- [ ] **Step 4: 集成 Chrome Web Store 安装按钮与 GitHub 链接**
- [ ] **Step 5: 验证移动端与桌面端的响应式收折**

---

### Task 5: 实现 Hero 区域与交互式抓取模拟器 (HeroSection)

**Files:**
- Create: `src/components/HeroSection.tsx`

- [ ] **Step 1: 编写 Hero 标题区、合规小药丸徽标、双行动 CTA**
- [ ] **Step 2: 编写核心数据指标条 (50K+ 用户、4.9 评分、0 字节外传)**
- [ ] **Step 3: 实现 Scraper Studio 模拟器视窗（浏览器地址栏、点选虚线选框、翻页指示）**
- [ ] **Step 4: 实现模拟器内部数据预览切换（实时数据流 vs 结构化 JSON 视图）**
- [ ] **Step 5: 验证 Hero 组件在双语模式下的展示与交互**

---

### Task 6: 实现架构合规矩阵与本地仪表盘 (ComplianceMatrix)

**Files:**
- Create: `src/components/ComplianceMatrix.tsx`

- [ ] **Step 1: 编写对比矩阵表格（本地扩展 vs 云端 SaaS 爬虫，涵盖 Cookie、代理、隐私等 6 大维度）**
- [ ] **Step 2: 编写本地存储状态仪表盘与 IndexedDB 动效指示器**
- [ ] **Step 3: 验证毛玻璃阴影与表格边框样式**

---

### Task 7: 实现五大核心抓取功能卡片 (FeatureGrid)

**Files:**
- Create: `src/components/FeatureGrid.tsx`

- [ ] **Step 1: 编写 5 大核心功能卡片网格布局**
- [ ] **Step 2: 分别注入 Visual Smart Scraper、Media Sniffer、Pagination、Export、Automation 的技术徽章与详尽说明**
- [ ] **Step 3: 验证 hover 微光与响应式网格**

---

### Task 8: 实现三大交互式测试沙盒 (InteractiveSandbox)

**Files:**
- Create: `src/components/InteractiveSandbox.tsx`

- [ ] **Step 1: 编写沙盒整体外壳与 3 模块切换/并排展示区**
- [ ] **Step 2: 实现模块 A：电商数据实时抓取（点击提取数据、模拟进度、查看结构化结果、复制 JSON）**
- [ ] **Step 3: 实现模块 B：媒体流嗅探器（模拟检测 .m3u8 / .mp4 视频流、分辨率与模拟下载）**
- [ ] **Step 4: 实现模块 C：选择器实时调试器（输入选择器动态计算匹配节点并提供状态反馈）**
- [ ] **Step 5: 验证所有交互事件与状态管理流畅运行**

---

### Task 9: 实现页脚与合规信任状态组件 (Footer)

**Files:**
- Create: `src/components/Footer.tsx`

- [ ] **Step 1: 编写 Footer 多列链接区（产品特性、安全合规白皮书、开发者资源）**
- [ ] **Step 2: 编写本地安全运行脉动指示灯 (`All systems 100% local`) 与 Manifest V3 徽标**
- [ ] **Step 3: 编写 Chrome 官方市场版权与声明**

---

### Task 10: 路由装配、多语言端到端验证与构建打包

**Files:**
- Create: `src/routes/index.tsx`
- Create: `src/routes/$lang.tsx`
- Create: `src/components/LandingPage.tsx`

- [ ] **Step 1: 创建统一的落地页容器 `LandingPage.tsx`，接收当前 locale 并组装全部 Section**
- [ ] **Step 2: 编写 `routes/index.tsx` 提供英文版落地页**
- [ ] **Step 3: 编写 `routes/$lang.tsx` 动态服务指定语言并提供无效语言回退**
- [ ] **Step 4: 执行 `pnpm build` 测试生产环境全量编译打包**
- [ ] **Step 5: 启动本地服务并通过浏览器/自动化工具校验英文版与中文版无瑕疵呈现**
