import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build as viteBuild } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const tmpDir = path.join(rootDir, '.prerender-tmp')

const SEO_ROUTES = [
  '/',
  '/zh',
  '/features/video-scraper',
  '/zh/features/video-scraper',
  '/features/web-data-scraper',
  '/zh/features/web-data-scraper',
  '/changelog',
  '/zh/changelog',
  '/terms',
  '/zh/terms',
  '/privacy',
  '/zh/privacy',
  '/refund',
  '/zh/refund',
]

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildSeoHeadBlock(meta) {
  const lines = [
    `  <title>${escapeHtml(meta.title)}</title>`,
    `  <meta name="description" content="${escapeHtml(meta.description)}" />`,
  ]

  if (meta.keywords) {
    lines.push(`  <meta name="keywords" content="${escapeHtml(meta.keywords)}" />`)
  }

  for (const link of meta.links) {
    if (link.hrefLang) {
      lines.push(
        `  <link rel="${escapeHtml(link.rel)}" hreflang="${escapeHtml(link.hrefLang)}" href="${escapeHtml(link.href)}" />`
      )
    } else {
      lines.push(
        `  <link rel="${escapeHtml(link.rel)}" href="${escapeHtml(link.href)}" />`
      )
    }
  }

  lines.push(
    `  <meta property="og:type" content="website" />`,
    `  <meta property="og:url" content="${escapeHtml(meta.ogUrl)}" />`,
    `  <meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `  <meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `  <meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`,
    `  <meta property="og:image:width" content="1200" />`,
    `  <meta property="og:image:height" content="630" />`,
    `  <meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />`,
    `  <meta property="og:locale" content="${escapeHtml(meta.ogLocale)}" />`,
    `  <meta name="twitter:card" content="summary_large_image" />`,
    `  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `  <meta name="twitter:image" content="${escapeHtml(meta.ogImage)}" />`
  )

  for (const schema of meta.jsonLd) {
    const safeJson = JSON.stringify(schema).replace(/</g, '\\u003c')
    lines.push(`  <script type="application/ld+json">${safeJson}</script>`)
  }

  return lines.join('\n')
}

function stripExistingSeoTags(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\s+name="(?:description|keywords|twitter:[^"]+)"[^>]*\/?>\s*/gi, '')
    .replace(/<meta\s+property="og:[^"]+"[^>]*\/?>\s*/gi, '')
    .replace(/<link\s+rel="(?:canonical|alternate)"\s+(?:hreflang="[^"]+"\s+)?href="[^"]+"[^>]*\/?>\s*/gi, '')
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '')
    .replace(/<!--\s*(?:Canonical & Hreflang|Open Graph \/ Facebook|Twitter)\s*-->\s*/gi, '')
}

async function main() {
  const templatePath = path.join(distDir, 'index.html')
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found. Run `vite build` first.')
  }

  const baseTemplate = fs.readFileSync(templatePath, 'utf-8')
  const cleanedTemplate = stripExistingSeoTags(baseTemplate)

  // Build SSR bundle into temporary directory via Vite JS API (CI-safe, no npx needed)
  await viteBuild({
    root: rootDir,
    build: {
      ssr: 'src/prerender-entry.tsx',
      outDir: '.prerender-tmp',
      emptyOutDir: true,
    },
  })

  try {
    const entryFile = path.join(tmpDir, 'prerender-entry.js')
    const { prerenderRoute, getChangelogFeed } = await import(pathToFileURL(entryFile).href)

    // Emit aggregated static changelog feed for external/extension clients
    if (typeof getChangelogFeed === 'function') {
      const feedPath = path.join(distDir, 'data', 'changelog.json')
      fs.mkdirSync(path.dirname(feedPath), { recursive: true })
      fs.writeFileSync(feedPath, JSON.stringify(getChangelogFeed(), null, 2) + '\n', 'utf-8')
      console.log(`[prerender] changelog feed -> ${path.relative(rootDir, feedPath)}`)
    }

    for (const route of SEO_ROUTES) {
      const result = await prerenderRoute(route)
      const seoHead = buildSeoHeadBlock(result)

      let html = cleanedTemplate
        .replace(/<html\s+lang="[^"]*"/i, `<html lang="${result.lang}"`)
        .replace('</head>', `${seoHead}\n</head>`)
        .replace('<div id="root"></div>', `<div id="root">${result.appHtml}</div>`)

      const outputPath =
        route === '/'
          ? path.join(distDir, 'index.html')
          : path.join(distDir, route.replace(/^\//, ''), 'index.html')

      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.writeFileSync(outputPath, html, 'utf-8')
      console.log(`[prerender] ${route} -> ${path.relative(rootDir, outputPath)}`)
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

main().catch((err) => {
  console.error('[prerender] Failed:', err)
  fs.rmSync(tmpDir, { recursive: true, force: true })
  process.exit(1)
})
