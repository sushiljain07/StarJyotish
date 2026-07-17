#!/usr/bin/env node
// frontend/scripts/generate-sitemap.js
//
// This app is a client-side-only Vite SPA with no SSG/build-time routing
// pipeline, so "automatic" sitemap generation here means: one array of
// public routes is the single source of truth, and this script (run before
// every `npm run build` — see package.json) regenerates public/sitemap.xml
// from it. Adding a future page means adding one line to PUBLIC_ROUTES,
// not hand-editing XML.
//
// /kundli is deliberately excluded — it only ever renders with data handed
// off via router state from /generate (see Result.jsx's early-return guard
// and its <Seo noindex /> tag), so it has no canonical URL to list here.
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SITE_URL = 'https://starjyotish.com'

const PUBLIC_ROUTES = [
  { path: '/',              changefreq: 'weekly',  priority: '1.0' },
  { path: '/generate',      changefreq: 'monthly', priority: '0.9' },
  { path: '/career-report', changefreq: 'monthly', priority: '0.8' },
  { path: '/pricing',       changefreq: 'monthly', priority: '0.8' },
  { path: '/testimonials',  changefreq: 'weekly',  priority: '0.7' },
  { path: '/blog',          changefreq: 'weekly',  priority: '0.8' },
  { path: '/learn',                changefreq: 'weekly',  priority: '0.8' },
  { path: '/learn/zodiac',         changefreq: 'monthly', priority: '0.8' },
  { path: '/learn/zodiac/aries',   changefreq: 'monthly', priority: '0.8' },
  { path: '/learn/zodiac/taurus',  changefreq: 'monthly', priority: '0.8' },
  { path: '/learn/nakshatras',     changefreq: 'monthly', priority: '0.8' },
  { path: '/learn/planets',        changefreq: 'monthly', priority: '0.8' },
  { path: '/learn/houses',         changefreq: 'monthly', priority: '0.8' },
  { path: '/learn/dashas',         changefreq: 'monthly', priority: '0.8' },
  { path: '/learn/yogas',          changefreq: 'monthly', priority: '0.7' },
  { path: '/learn/doshas',         changefreq: 'monthly', priority: '0.7' },
  // Future zodiac sign pages: /learn/zodiac/gemini, /learn/zodiac/cancer, ...
  // Add each here when its page ships.
  // Blog article slugs are managed dynamically via admin dashboard.
  // Add new article URLs here when published so they get indexed.
  { path: '/about',         changefreq: 'monthly', priority: '0.5' },
  { path: '/faq',           changefreq: 'monthly', priority: '0.6' },
  { path: '/contact',       changefreq: 'yearly',  priority: '0.4' },
  { path: '/disclaimer',    changefreq: 'yearly',  priority: '0.3' },
  { path: '/privacy',       changefreq: 'yearly',  priority: '0.3' },
  { path: '/terms',         changefreq: 'yearly',  priority: '0.3' },
  { path: '/refund-policy', changefreq: 'yearly',  priority: '0.3' },
]

const today = new Date().toISOString().slice(0, 10)

const urlEntries = PUBLIC_ROUTES.map(({ path, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '..', 'public', 'sitemap.xml')
writeFileSync(outPath, xml)
console.log(`✓ sitemap.xml generated with ${PUBLIC_ROUTES.length} URLs → ${outPath}`)
