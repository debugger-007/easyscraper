import type { SupportedLocale } from '../i18n/types'

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

/** Raw item entry stored in src/data/changelog/v*.json */
export interface ChangelogItemRecord {
  id: string
  group: ChangeGroupType
  icon: ReleaseItemIcon
  title: LocalizedText
  description: LocalizedText
  tag?: LocalizedText
  proOnly?: boolean
}

/** Raw per-version JSON file schema in src/data/changelog/v*.json */
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

/** Aggregated bilingual feed exported to dist/data/changelog.json at build time */
export interface ChangelogFeed {
  schemaVersion: 1
  updatedAt: string
  latestVersion: string
  releases: Array<
    ChangelogReleaseFile & {
      tag: string
      anchorId: string
      isLatest: boolean
    }
  >
}

/** Resolved single-locale item for UI rendering */
export interface ChangelogItem {
  id: string
  title: string
  description: string
  tag?: string
  icon: ReleaseItemIcon
  proOnly?: boolean
}

/** Resolved single-locale release for UI rendering */
export interface ChangelogRelease {
  version: string
  tag: string
  anchorId: string
  date: string
  shortDate: string
  category: ReleaseCategory
  isLatest: boolean
  headline: string
  summary: string
  highlightBadge: string
  sections: {
    features: ChangelogItem[]
    improvements: ChangelogItem[]
    fixes: ChangelogItem[]
  }
}

const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function parseSemver(version: string): [number, number, number] {
  const parts = version
    .trim()
    .replace(/^v/i, '')
    .split('.')
    .map((n) => Number.parseInt(n, 10) || 0)
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
}

function compareSemverDesc(a: string, b: string): number {
  const [aMaj, aMin, aPat] = parseSemver(a)
  const [bMaj, bMin, bPat] = parseSemver(b)
  if (bMaj !== aMaj) return bMaj - aMaj
  if (bMin !== aMin) return bMin - aMin
  return bPat - aPat
}

function formatShortDate(isoDate: string, locale: ChangelogLocale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!match) return isoDate
  const month = Number.parseInt(match[2], 10)
  const day = Number.parseInt(match[3], 10)
  if (month < 1 || month > 12 || day < 1 || day > 31) return isoDate
  if (locale === 'zh_CN') {
    return `${month}月${day}日`
  }
  return `${EN_MONTHS[month - 1]} ${String(day).padStart(2, '0')}`
}

function normalizeVersion(version: string): string {
  return version.trim().replace(/^v/i, '')
}

// Statically bundle all per-version JSON files at compile time (works for both client & SSR builds)
const releaseModules = import.meta.glob<ChangelogReleaseFile>('./changelog/v*.json', {
  eager: true,
  import: 'default',
})

const aggregatedReleases = Object.values(releaseModules)
  .filter((release) => release && release.status === 'released')
  .sort((a, b) => compareSemverDesc(a.version, b.version))
  .map((release, index) => {
    const version = normalizeVersion(release.version)
    return {
      ...release,
      version,
      tag: `v${version}`,
      anchorId: `v${version.replace(/\./g, '-')}`,
      isLatest: index === 0,
    }
  })

export const LATEST_RELEASE_VERSION = aggregatedReleases[0]?.tag ?? 'v1.0.0'

export const CHANGELOG_FEED: ChangelogFeed = {
  schemaVersion: 1,
  updatedAt: aggregatedReleases[0]?.date ?? '2026-11-25',
  latestVersion: aggregatedReleases[0]?.version ?? '1.0.0',
  releases: aggregatedReleases,
}

function resolveLocale(locale: SupportedLocale): ChangelogLocale {
  return locale === 'en' ? 'en' : 'zh_CN'
}

export function getChangelogReleases(locale: SupportedLocale): ChangelogRelease[] {
  const lang = resolveLocale(locale)

  return aggregatedReleases.map((release) => {
    const features: ChangelogItem[] = []
    const improvements: ChangelogItem[] = []
    const fixes: ChangelogItem[] = []

    for (const item of release.items) {
      const resolved: ChangelogItem = {
        id: item.id,
        title: item.title[lang],
        description: item.description[lang],
        tag: item.tag?.[lang],
        icon: item.icon,
        proOnly: item.proOnly,
      }

      if (item.group === 'features') {
        features.push(resolved)
      } else if (item.group === 'improvements') {
        improvements.push(resolved)
      } else {
        fixes.push(resolved)
      }
    }

    return {
      version: release.version,
      tag: release.tag,
      anchorId: release.anchorId,
      date: release.date,
      shortDate: formatShortDate(release.date, lang),
      category: release.category,
      isLatest: release.isLatest,
      headline: release.headline[lang],
      summary: release.summary[lang],
      highlightBadge: release.highlightBadge?.[lang] ?? release.tag,
      sections: {
        features,
        improvements,
        fixes,
      },
    }
  })
}
