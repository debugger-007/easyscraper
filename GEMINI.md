# Easy Web Scraper Website - 工程规范与开发准则

> 本项目对标并同步核心插件项目（`/Users/mac/Desktop/learn/extension`）的设计范式与工程标准。

---

## 国际化与文案处理约束（多语言 i18n 规范与完整对齐）

本项目严格执行 **Schema-First**、**Path-Prefix**、**双模态访问** 与 **本地优先** 的 i18n 架构。

### 1. 核心原则与红线约束

- **零散文本硬编码归零**：
  - 凡是面向用户的 UI 文案（包括但不限于按钮文本、导航链接、状态标识、操作反馈、Toast 提示、Modal 弹窗内容、下拉选项、卡片特性、表格表头、数据指标、价格标签、FAQ 问答、合规文档标题与操作等），**严禁直接在组件或业务代码中硬编码字面量字符串**。
  - **React 组件层**：统一调用 `useTranslation()`（或别名 `useTranslate()`）获取 `t` 及上下文信息。
  - **非组件层 / 工具函数 / 状态模型**：通过全局单例 `i18n.t` 进行安全调用。

- **中英双语强制同步维护（全链路完整对齐与类型约束）**：
  - **Schema-First 强类型约束**：凡是新增、修改或重构文案词条，**必须先在 `src/i18n/types.ts` 中的 `TranslationSchema` 进行强类型声明**。
  - **100% 对齐原则**：必须同时在中文字典（`src/i18n/locales/zh_CN.ts`）与英文字典（`src/i18n/locales/en.ts`）中进行严格对齐与补全，严禁单侧维护导致另一侧回退缺失或类型报错。
  - **模块化层级规范**：字典键名（Key）必须按功能模块与业务域划分（`common`、`meta`、`nav`、`hero`、`compliance`、`features`、`sandbox`、`pricing`、`footer`、`legal` 等），层次结构清晰、语义明确。

- **严禁使用语言二元分支**：
  - 禁止在业务代码或组件模板中使用二元分支判断语言：
    - ❌ `const title = locale === 'zh' ? '服务条款' : 'Terms of Service'`
    - ❌ `<div>{locale === 'zh' ? '免费添加到 Chrome' : 'Add to Chrome - Free'}</div>`
  - 必须统一由 `t` 提供：
    - ✅ `<div>{t.hero.ctaInstall}</div>`
    - ✅ `<span>{t.legal.tabs.terms}</span>`

---

### 2. 双模态调用范式 (Dual-Mode Translation Access)

本项目通过 `I18nTranslate` 代理对象，原生支持两种等价且类型安全的调用模式：

- **属性访问模式（推荐用于结构化、带层级的 UI 页面）**：
  - 具备完整的 IDE 自动补全与类型保护：
  ```tsx
  import { useTranslate } from '~/i18n'

  export const HeroSection: React.FC = () => {
    const { t } = useTranslate()
    return (
      <div>
        <h1>{t.hero.titleLead}</h1>
        <p>{t.hero.description}</p>
      </div>
    )
  }
  ```

- **函数调用模式（推荐用于通用词条、动态参数插值与工具层）**：
  - 兼容插件端 `t(keyPath, options)` 签名：
  ```tsx
  import { i18n, useTranslation } from '~/i18n'

  // 无变量调用，带英文默认兜底
  const label = t('common.download', 'Download')

  // 动态参数插值调用
  const welcome = t('common.welcomeUser', {
    name: 'Alex',
    defaultValue: 'Welcome back, {name}!'
  })

  // 非 React 组件环境调用
  const exportBtnText = i18n.t('common.exportExcel', 'Export Excel')
  ```

---

### 3. 参数插值与动态拼接规范

1. **规范占位符插值**：
   - 动态文案必须使用 `{variable}` 占位符定义，并通过 `t(key, { variable: value })` 传入。
   - 示例：`"已捕获 {count} 条流媒体"` -> `t('hero.streamDetected', { count: 3 })`
2. **严禁字符串拼接**：
   - **严禁使用 `+` 或 ES6 模板字符串拼接多语言词条**，防止因语种语序差异导致语病：
   - ❌ `t('common.download') + ' ' + count + ' ' + t('common.items')`
   - ✅ `t('common.downloadItems', { count })`

---

### 4. URL 路由与语言切换标准 (Path-Prefix Routing)

本项目使用 TanStack Router 配合 Path-Prefix 规范进行国际化路由管理：

1. **路由路径映射**：
   - 英文默认根路径（无前缀）：`/`、`/terms`、`/privacy`、`/refund`
   - 中文路径（统一 `/zh` 前缀）：`/zh`、`/zh/terms`、`/zh/privacy`、`/zh/refund`
2. **严禁使用查询参数切换语言**：
   - 严禁使用 `?lang=zh`、`?locale=en` 等作为正式页面的主要路由方案。
   - 语言切换必须使用 `changeLanguage(targetLocale)`，自动保持当前子路径（Sub-path）无刷新平滑跳转，并在 `localStorage` 中同步保存 `easy_scraper_user_locale`。
3. **页面内部 `<Link>` 跳转规范**：
   - 必须使用 TanStack Router 的 `<Link>` 组件，并配置路由参数：
   ```tsx
   const isEn = locale === 'en'
   const langParam = isEn ? undefined : { lang: 'zh' }

   <Link
     to={isEn ? '/privacy' : '/$lang/privacy'}
     params={langParam}
   >
     {t.legal.tabs.privacy}
   </Link>
   ```

---

### 5. 新增语言标准流程 (Adding a New Language)

1. **扩充类型声明**：在 `src/i18n/types.ts` 中，为 `SupportedLocale` 追加新语言代码，并在 `TranslationSchema.nav.languages` 中补充显示名称。
2. **创建字典文件**：新建 `src/i18n/locales/<locale>.ts`，实现完整的 `TranslationSchema`，并在 `src/i18n/index.ts` 中注册。
3. **扩充合规文档**：在 `src/data/legalContent.ts` 中为 `termsData`、`privacyData` 和 `refundData` 补全新语言文档。
4. **验证门禁**：通过 `npx tsc --noEmit` 和 `pnpm build`。

---

### 6. 代码提交与质量门禁

- **严禁自动提交代码**：未获得用户明确指令前，严禁自动执行 `git commit` 或 `git push` 等任何 Git 提交与推送操作，所有代码变更交由用户自行审查和提交。
- 每次代码变更必须运行 `npx tsc --noEmit` 保证 **0 报错**。
- 每次代码变更必须运行 `pnpm build` 保证打包顺利通过。

---

## 插件数据交互与流媒体架构约束（OPFS 与 SW 虚拟接口规范）

本项目涉及与核心 Chrome 扩展程序（Extension）及私有源文件系统（OPFS）进行跨域大文件与流式数据交互。

### 1. 核心架构原则：优先采用 SW 虚拟接口

- **OPFS 业务架构红线**：
  - 凡是涉及插件端 OPFS（Origin Private File System）存储的大文件读取、流式媒体播放、切片剪辑、缩略图提取或数据导出等业务，**必须优先按 Service Worker 虚拟接口（SW Virtual Interface）的架构进行设计与实现**。
  - **严禁整包载入内存**：严禁尝试一次性将插件 OPFS 中的全量大文件（动辄数百 MB 至数 GB）通过 Base64 或全量 Blob 消息透传至网页主线程，避免触发跨端反序列化卡死及页面内存溢出（OOM）。

### 2. SW 虚拟接口标准架构设计

1. **虚拟 HTTP 协议层（Virtual HTTP Endpoint via SW Interception）**：
   - 由 Service Worker（如 `/sw-clip-stream.js`）拦截约定的虚拟 API 路由（例如 `/api/virtual-clip/:sessionId`、`/api/virtual-poster/:id`）。
   - SW 对宿主页面及浏览器原生多媒体标签（`<video>`、`<audio>`）、WebCodecs 解码器和解封装库（如 `mp4box.js`）透明暴露标准 HTTP 资源 URL。
   - 完整支持 **HTTP 206 Partial Content** 及 **Range 请求协议**（`bytes=start-end`），按需精准索取指定切片字节。

2. **跨域桥接与切片中继（Chunk Streaming & Extension Bridge）**：
   - SW 与宿主页面之间通过 `BroadcastChannel`（或 `postMessage`）维持长效、双向异步通信管道。
   - 当 SW 接收到 Range 切片读取请求时，通过管道向页面广播/分发数据读取指令。
   - 宿主页面中的桥接适配层（`ExtensionBridgeAdapter`）负责通过 `chrome.runtime.sendMessage` 向插件 Background Service 发起分块读取（Chunk Query），并将字节流回传给 SW 组装为虚拟 `Response`。

3. **双重抽象与渐进增强**：
   - **数据源层解耦（MediaSourceResolver）**：页面 UI 业务组件仅依赖统一的抽象接口，无感切换插件 OPFS 虚拟源、本地 HTML5 File 文件源或远程 HTTP 网络源。
   - **状态机与降级容错**：必须包含完整的桥接状态探测（`idle` -> `registering` -> `active` / `unsupported` / `error`），在不支持 Service Worker 或 SW 注册失败的环境中提供健壮的错误反馈与降级兜底方案。
