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

- 每次代码变更必须运行 `npx tsc --noEmit` 保证 **0 报错**。
- 每次代码变更必须运行 `pnpm build` 保证打包顺利通过。
