import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = resolve(__dirname, '../..')

function walk(dir) {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}
const isTest = p => /\.test\./.test(p)
const pages = walk(join(SRC, 'pages')).filter(p => p.endsWith('.jsx') && !isTest(p))
const layouts = walk(join(SRC, 'components')).filter(p => p.endsWith('Layout.jsx') && !isTest(p))
const files = [...pages, ...layouts].map(p => ({ p, src: readFileSync(p, 'utf8') }))
const rel = p => p.slice(SRC.length + 1)

describe('header/footer rule', () => {
  it('marketing pages pair SiteHeader with Footer', () => {
    const marketing = files.filter(f => f.src.includes('<SiteHeader') && !f.p.endsWith('WorkspaceLayout.jsx'))
    expect(marketing.length).toBeGreaterThan(0)
    for (const f of marketing) {
      expect(f.src, rel(f.p)).toMatch(/<Footer[\s/>]/)
      expect(f.src, rel(f.p)).not.toContain('<CompactFooter')
    }
  })
  it('only WorkspaceLayout renders CompactFooter', () => {
    const offenders = files.filter(f => f.src.includes('<CompactFooter') && !f.p.endsWith('WorkspaceLayout.jsx'))
    expect(offenders.map(f => rel(f.p))).toEqual([])
  })
  it('only one newsletter form per page', () => {
    const offenders = pages.filter(p => readFileSync(p, 'utf8').includes('subscribeNewsletter'))
    expect(offenders.map(rel)).toEqual([])
  })
})
