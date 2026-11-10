/* global process */
// The baseline lives in baselines/ so parity.test.js's ./*.json locale glob does not pick it up.
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanJsx } from './scanJsx'

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'baselines', 'hardcoded-baseline.json')

// Out of scope: admin dashboards, learn pages, *Content.js config (not .jsx), legal body text stays in baseline.
const EXCLUDED = [
  /^pages\/AdminDashboard\.jsx$/,
  /^pages\/AstrologerDashboard\.jsx$/,
  /^pages\/learn\//,
]

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
  .filter(rel => !EXCLUDED.some(re => re.test(rel)))
  .sort()

describe('scanJsx', () => {
  it('flags English text, string children and user-facing attributes only', () => {
    expect(scanJsx('const a = <p>Hello world</p>')).toHaveLength(1)
    expect(scanJsx("const a = <p>{t('x')}</p>")).toHaveLength(0)
    expect(scanJsx('const a = <img alt="Chart" />')).toHaveLength(1)
    expect(scanJsx('const a = <p>PDF</p>')).toHaveLength(0)
    expect(scanJsx("const a = <p>{'Hello there'}</p>")).toHaveLength(1)
    expect(scanJsx('const a = <p>{`Hello there`}</p>')).toHaveLength(1)
    expect(scanJsx('const a = <input placeholder="Enter name" className="foo bar" />')).toHaveLength(1)
  })
})

describe('no new hardcoded English in JSX (ratchet)', () => {
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
  const results = new Map(files.map(rel => [rel, scanJsx(fs.readFileSync(path.join(SRC, rel), 'utf8'), rel)]))

  if (process.env.UPDATE_BASELINE) {
    it('writes the baseline', () => {
      const out = {}
      for (const rel of files) if (results.get(rel).length) out[rel] = results.get(rel).length
      const sorted = Object.fromEntries(Object.keys(out).sort().map(k => [k, out[k]]))
      fs.writeFileSync(BASELINE_PATH, JSON.stringify(sorted, null, 2) + '\n')
    })
    return
  }

  it.each(files)('%s', rel => {
    const hits = results.get(rel)
    const allowed = baseline[rel] ?? 0
    const lines = hits.map(h => `  line ${h.line}: ${h.text}`).join('\n')
    expect(hits.length, `${rel}: baseline ${allowed}, found ${hits.length}. Use t('key') instead of hardcoded English.\n${lines}`).toBeLessThanOrEqual(allowed)
  })
})
