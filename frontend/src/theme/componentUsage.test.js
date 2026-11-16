/* global process */
// Ratchet: hand-rolled CTA / card / chip recipes, arbitrary text sizes and ad-hoc radius/shadow can
// only go down; use components/ui (Button, Card, Badge). Lower the baseline after each migration with
//   UPDATE_COMPONENT_BASELINE=1 npx vitest run src/theme/componentUsage.test.js
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(HERE, '..')
const BASELINE_PATH = path.join(HERE, 'baselines', 'component-usage-baseline.json')

const COUNTERS = {
  goldCta: /hover:bg-primary-dark/g,
  lightCard: /bg-parchment-card(?=[^"'`]*border-line)|border-line(?=[^"'`]*bg-parchment-card)/g,
  nightCard: /bg-white\/\[0\.0[3-6]\d?\](?=[^"'`]*border-white\/)/g,
  chip: /rounded-full(?=[^"'`]*px-[\d.]+)(?=[^"'`]*text-(?:2xs|3xs|xs)\b)/g,
  arbitraryText: /text-\[\d+(?:\.\d+)?px\]/g,
  roundedXl: /\brounded-(?:xl|2xl)\b/g,
  shadowSml: /\bshadow-(?:sm|md|lg)\b/g,
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full, out)
    else if (/\.jsx$/.test(e.name) && !/\.test\.jsx$/.test(e.name)) out.push(full)
  }
  return out
}

const files = walk(SRC)
  .map(f => path.relative(SRC, f).split(path.sep).join('/'))
  .filter(rel => !rel.startsWith('components/ui/'))
  .sort()

it('finds the source files (guards against a broken walk)', () => expect(files.length).toBeGreaterThan(50))

const count = (re, text) => (text.match(re) || []).length
const current = {}
for (const rel of files) {
  const text = fs.readFileSync(path.join(SRC, rel), 'utf8')
  const entry = {}
  for (const [name, re] of Object.entries(COUNTERS)) {
    const n = count(re, text)
    if (n > 0) entry[name] = n
  }
  if (Object.keys(entry).length) current[rel] = entry
}

describe('component usage (ratchet)', () => {
  if (process.env.UPDATE_COMPONENT_BASELINE) {
    it('writes the baseline', () => {
      fs.writeFileSync(BASELINE_PATH, JSON.stringify(current, null, 2) + '\n')
    })
    return
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))

  it('no file hand-rolls more CTAs, cards, chips or ad-hoc sizes than its baseline', () => {
    const over = []
    for (const rel of files) {
      for (const name of Object.keys(COUNTERS)) {
        const found = current[rel]?.[name] ?? 0
        const allowed = baseline[rel]?.[name] ?? 0
        if (found > allowed) over.push(`${rel}: ${name} baseline ${allowed}, found ${found}`)
      }
    }
    expect(over, 'Use Button / Card / Badge from components/ui and the text scale').toEqual([])
  })

  it('the baseline has no stale entries', () => {
    const stale = []
    for (const [rel, entry] of Object.entries(baseline)) {
      for (const [name, allowed] of Object.entries(entry)) {
        const found = current[rel]?.[name] ?? 0
        if (found !== allowed) stale.push(`${rel}: ${name} baseline ${allowed}, found ${found} (lower the baseline)`)
      }
    }
    expect(stale).toEqual([])
  })
})
