/* global process */
// Ratchet: gold / faint text usage can only go down. Lower the baseline after each migration batch with
//   UPDATE_TOKEN_BASELINE=1 npm test -- tokenUsage
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(HERE, '..')
const BASELINE_PATH = path.join(HERE, 'baselines', 'token-usage-baseline.json')

const COUNTERS = {
  goldText: /(?<![\w-])(?:hover:|group-hover:|focus:)?text-primary(?:-dark)?(?![\w-])/g,
  faintText: /text-ink-faint(?![\w-])/g,
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
  .sort()

const count = (re, text) => (text.match(re) || []).length
const sources = new Map(files.map(rel => [rel, fs.readFileSync(path.join(SRC, rel), 'utf8')]))
const current = {}
for (const rel of files) {
  const entry = {}
  for (const [name, re] of Object.entries(COUNTERS)) {
    const n = count(re, sources.get(rel))
    if (n > 0) entry[name] = n
  }
  if (Object.keys(entry).length) current[rel] = entry
}

describe('token usage (ratchet)', () => {
  if (process.env.UPDATE_TOKEN_BASELINE) {
    it('writes the baseline', () => {
      fs.writeFileSync(BASELINE_PATH, JSON.stringify(current, null, 2) + '\n')
    })
    return
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))

  it('no file uses more gold/faint text than its baseline', () => {
    const over = []
    for (const rel of files) {
      for (const name of Object.keys(COUNTERS)) {
        const found = current[rel]?.[name] ?? 0
        const allowed = baseline[rel]?.[name] ?? 0
        if (found > allowed) over.push(`${rel}: ${name} baseline ${allowed}, found ${found}`)
      }
    }
    expect(over, 'Use text-primary-ink on light / text-ink-muted for readable text').toEqual([])
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

  // Regex for Task 3: /(?:text|bg|border|from|to)-(?:green|emerald|amber|yellow|red|rose)-\d{2,3}/g
  // Enabled in Task 3, once ad-hoc green/amber/red status colours are migrated to good/caution/bad.
  it.todo('adHocStatus is zero everywhere')
})
