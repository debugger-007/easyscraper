# Changelog 独立版本 JSON 数据规范

本目录存放 **Easy Web Scraper** 官网更新日志（`/changelog`、`/zh/changelog`）的按版本拆分的静态 JSON 数据源。

官网在构建期通过 `src/data/changelogData.ts` 中的 `import.meta.glob('./changelog/v*.json', { eager: true, import: 'default' })` 自动扫描、聚合与排序，并在 `pnpm build` 阶段：

1. 静态预渲染中英双语 SEO 页面：`dist/changelog/index.html`、`dist/zh/changelog/index.html`
2. 自动生成聚合静态 Feed：`dist/data/changelog.json`（可供扩展端更新弹窗或其他客户端消费）

---

## 1. 文件路径与命名规范

- **存放路径**：`src/data/changelog/v<version>.json`
- **命名要求**：必须以小写 `v` 开头、`.json` 结尾，版本号遵循 SemVer（`MAJOR.MINOR.PATCH`），例如：
  - `src/data/changelog/v1.2.0.json`
  - `src/data/changelog/v1.2.1.json`
  - `src/data/changelog/v1.3.0.json`
- **只增不改原则**：发新版本时只需新增一个 JSON 文件，**无需修改任何历史版本文件**（`isLatest` 会自动推导）。

---

## 2. TypeScript 类型定义

与 `src/data/changelogData.ts` 保持 100% 一致：

```ts
export type ChangelogLocale = 'en' | 'zh_CN'
export type LocalizedText = Record<ChangelogLocale, string>
export type ReleaseCategory = 'major' | 'minor' | 'patch'
export type ReleaseStatus = 'released' | 'draft' | 'yanked'
export type ChangeGroupType = 'features' | 'improvements' | 'fixes'

export type ReleaseItemIcon =
  | 'sparkles'
  | 'mouse-pointer'
  | 'cloud-upload'
  | 'file-code'
  | 'archive'
  | 'layers'
  | 'bell'
  | 'bug'
  | 'zap'

export interface ChangelogItemRecord {
  id: string
  group: ChangeGroupType
  icon: ReleaseItemIcon
  title: LocalizedText
  description: LocalizedText
  tag?: LocalizedText
  proOnly?: boolean
}

export interface ChangelogReleaseFile {
  version: string
  date: string
  status: ReleaseStatus
  category: ReleaseCategory
  headline: LocalizedText
  summary: LocalizedText
  highlightBadge?: LocalizedText
  extensionHighlights?: LocalizedText[]
  items: ChangelogItemRecord[]
}
```

---

## 3. 字段说明

### 3.1 顶层字段（`ChangelogReleaseFile`）

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :---: | :--- |
| `version` | `string` | 是 | 语义化版本号（不含 `v`，如 `"1.3.0"`）；构建期用于 SemVer 倒序排序 |
| `date` | `string` | 是 | 发布日期，严格 `YYYY-MM-DD` 格式（如 `"2026-12-01"`），用于自动格式化侧边栏短日期 |
| `status` | `"released" \| "draft" \| "yanked"` | 是 | 仅 `"released"` 会被官网页面和 `dist/data/changelog.json` 收录；草稿可先写 `"draft"` |
| `category` | `"major" \| "minor" \| "patch"` | 是 | 版本分类，对应顶部筛选器（重大版本 / 功能更新 / 问题修复） |
| `headline` | `{ en: string, zh_CN: string }` | 是 | 版本卡片顶部摘要横幅主标题 |
| `summary` | `{ en: string, zh_CN: string }` | 是 | 版本卡片顶部摘要简介（建议 1~2 句话） |
| `highlightBadge` | `{ en: string, zh_CN: string }` | 否 | 摘要横幅右侧亮点胶囊；不填时自动回退为 `v<version>` |
| `extensionHighlights` | `Array<{ en: string, zh_CN: string }>` | 否 | 供插件端 `UpdateNoticeModal` 展示的精简要点（建议 2~3 条） |
| `items` | `ChangelogItemRecord[]` | 是 | 具体更新条目数组 |

### 3.2 单条更新项（`items[]`）

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :---: | :--- |
| `id` | `string` | 是 | 条目唯一 ID，推荐规则：`v<version>-f1`（新增）/ `v<version>-i1`（优化）/ `v<version>-b1`（修复） |
| `group` | `"features" \| "improvements" \| "fixes"` | 是 | 分组类型：新增功能 / 体验优化 / 问题修复 |
| `icon` | `ReleaseItemIcon` | 是 | 卡片图标标识（见下方白名单；未知值自动回退为 `sparkles`） |
| `title` | `{ en: string, zh_CN: string }` | 是 | 条目标题 |
| `description` | `{ en: string, zh_CN: string }` | 是 | 条目详情说明；支持用反引号包裹行内代码（如 `` `↑` ``、`` `Enter` ``）自动高亮渲染 |
| `tag` | `{ en: string, zh_CN: string }` | 否 | 标题右侧短标签胶囊（建议不超过 12 字符） |
| `proOnly` | `boolean` | 否 | 是否为 Pro 专属能力（默认 `false`） |

### 3.3 `icon` 允许值白名单

| `icon` 值 | 对应场景建议 |
| :--- | :--- |
| `sparkles` | 通用新功能、AI / 智能提取 |
| `mouse-pointer` | 框选、划词、DOM 选择器交互 |
| `cloud-upload` | 图床上传、云同步、Webhook 推送 |
| `file-code` | Markdown / YAML / JSON / 代码导出 |
| `archive` | ZIP 离线打包、批量归档 |
| `layers` | 策略标识、多源/多层级处理 |
| `bell` | 更新提示、通知系统 |
| `bug` | 问题修复、稳定性修复 |
| `zap` | 性能优化、速度提升 |

---

## 4. 构建期自动推导字段（无需写入 JSON）

以下字段由 `src/data/changelogData.ts` 自动计算，插件仓库生成 JSON 时**不需要输出**：

- `tag`：自动拼接为 `v${version}`（如 `"v1.3.0"`）
- `anchorId`：自动转换为 `v1-3-0`（用于 `#v1-3-0` 锚点定位及 `?version=1.3.0` 跳转）
- `isLatest`：按 SemVer 倒序自动将最新已发布版本标记为 `true`
- `shortDate`：根据 `date` 自动本地化为 `Dec 01`（英文）或 `12月1日`（中文）

---

## 5. 完整 JSON 示例

```json
{
  "version": "1.3.0",
  "date": "2026-12-01",
  "status": "released",
  "category": "minor",
  "headline": {
    "en": "Smart Article Extractor, Custom Region Picker & Cloud Image Host",
    "zh_CN": "网页正文智能提取、手动框选正文与一键图片转存云图床"
  },
  "summary": {
    "en": "Upgraded article reading engine with 12 dedicated site adapters, interactive region & text selection extraction, and one-click cloud image hosting.",
    "zh_CN": "全新升级文章阅读与提取引擎，深度精配 12 类主流内容站点，新增手动框选与划词提取、一键图片转存云图床以及 YAML Frontmatter 导出。"
  },
  "highlightBadge": {
    "en": "12 Site Adapters",
    "zh_CN": "12 类主流站点精配"
  },
  "extensionHighlights": [
    {
      "en": "Upgraded article extractor with 12 dedicated site adapters",
      "zh_CN": "网页正文智能提取与 12 类主流站点精配"
    },
    {
      "en": "Manual region picker (↑ / ↓ / Enter) & text selection extraction",
      "zh_CN": "手动框选正文与划词提取（支持 ↑ / ↓ / Enter）"
    }
  ],
  "items": [
    {
      "id": "v1.3.0-f1",
      "group": "features",
      "icon": "sparkles",
      "title": {
        "en": "Upgraded Article Extractor with 12 Dedicated Site Adapters",
        "zh_CN": "网页正文智能提取与 12 类主流站点精配"
      },
      "tag": {
        "en": "12 Sites",
        "zh_CN": "12 类站点"
      },
      "description": {
        "en": "Click any area to pick the region (use `↑` / `↓` and `Enter` to confirm) and export clean Markdown.",
        "zh_CN": "支持在任意网页点击框选正文区域（配合键盘 `↑` / `↓` 与 `Enter` 确认）并导出纯净 Markdown。"
      }
    },
    {
      "id": "v1.3.0-i1",
      "group": "improvements",
      "icon": "archive",
      "title": {
        "en": "Enhanced Article + Images ZIP Export",
        "zh_CN": "图文 ZIP 离线打包升级"
      },
      "tag": {
        "en": "Offline ZIP",
        "zh_CN": "离线阅读"
      },
      "description": {
        "en": "Rewrites Markdown image links to local relative paths for reliable offline reading.",
        "zh_CN": "打包文章与本地插图为 ZIP 时，自动将 Markdown 图片链接重写为本地相对路径。"
      }
    },
    {
      "id": "v1.3.0-b1",
      "group": "fixes",
      "icon": "bug",
      "title": {
        "en": "Fix Nested List Selector Deduplication",
        "zh_CN": "修复嵌套列表选择器去重异常"
      },
      "tag": {
        "en": "Fixed",
        "zh_CN": "已修复"
      },
      "description": {
        "en": "Resolved an edge case where deeply nested list cards produced duplicate rows during auto-pagination.",
        "zh_CN": "修复自动翻页场景下深层嵌套列表卡片偶发重复采集的问题。"
      }
    }
  ]
}
```

---

## 6. 最小必填 JSON 示例

若某次补丁发布不需要可选字段（`highlightBadge`、`extensionHighlights`、`tag`、`proOnly`），最小可用结构如下：

```json
{
  "version": "1.2.1",
  "date": "2026-11-28",
  "status": "released",
  "category": "patch",
  "headline": {
    "en": "Stability & Extraction Fixes",
    "zh_CN": "稳定性与正文提取修复"
  },
  "summary": {
    "en": "Fixed image path rewriting edge cases during ZIP export.",
    "zh_CN": "修复图文 ZIP 导出中的图片路径重写边界问题。"
  },
  "items": [
    {
      "id": "v1.2.1-b1",
      "group": "fixes",
      "icon": "bug",
      "title": {
        "en": "Fix relative image path encoding in ZIP export",
        "zh_CN": "修复 ZIP 导出中相对图片路径编码问题"
      },
      "description": {
        "en": "Properly escapes special characters in downloaded image filenames.",
        "zh_CN": "正确转义本地下载图片文件名中的特殊字符，避免离线预览裂图。"
      }
    }
  ]
}
```

---

## 7. 插件仓库发版对接流程

1. 插件仓库发版脚本（如 `pnpm release:*`）生成符合上述规范的 `v<version>.json`，写入官网仓库 `src/data/changelog/v<version>.json`。
2. （推荐）同步更新 `public/sitemap.xml` 中 `/changelog` 与 `/zh/changelog` 的 `<lastmod>` 为当前发布日期。
3. 在官网仓库执行验证与构建：

```bash
npx tsc --noEmit && pnpm build
```

4. 确认终端输出包含：
   - `[prerender] changelog feed -> dist/data/changelog.json`
   - `[prerender] /changelog -> dist/changelog/index.html`
   - `[prerender] /zh/changelog -> dist/zh/changelog/index.html`
