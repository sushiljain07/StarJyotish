import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Repo-wide colour guards (generalise the per-task scan tests).
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full, out)
    else if (/\.jsx$/.test(e.name) && !/\.test\.jsx$/.test(e.name)) out.push(full)
  }
  return out
}
const files = walk(SRC).map(f => [path.relative(SRC, f).split(path.sep).join('/'), fs.readFileSync(f, 'utf8')])

// Every quoted/backtick string literal in a file; a className string is one of these.
const STRINGS = /'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g

const NIGHT_BG = /(?<![\w-])bg-night(?:-light|-deep)?(?![\w/-])/
const LIGHT_TEXT = /(?<![\w-])(?:text-primary-ink|text-ink-muted|text-ink|text-(?:sage|mauve|vermillion|good|bad|caution))(?![\w-])/

describe('reverse night guard', () => {
  it('no className combines a solid night background with parchment-tuned text', () => {
    const hits = []
    for (const [rel, src] of files) {
      for (const m of src.matchAll(STRINGS)) {
        const s = m[1] ?? m[2] ?? m[3]
        if (NIGHT_BG.test(s) && LIGHT_TEXT.test(s)) hits.push(`${rel}: ${s.trim().slice(0, 120)}`)
      }
    }
    expect(hits, 'Use text-ink-onnight / *-onnight tokens on night surfaces').toEqual([])
  })

  it('the guard regexes catch what they should', () => {
    expect(NIGHT_BG.test('bg-night text-ink-muted')).toBe(true)
    expect(LIGHT_TEXT.test('bg-night text-ink-muted')).toBe(true)
    expect(LIGHT_TEXT.test('bg-night text-ink-onnight')).toBe(false)
    expect(LIGHT_TEXT.test('bg-night text-good-onnight')).toBe(false)
    expect(NIGHT_BG.test('bg-night/80')).toBe(false)
  })
})

describe('inline style colour literals', () => {
  const STYLE = /style=\{\{[^}]*?\b(?:color|background|backgroundColor|borderColor|fill|stroke)\s*:\s*['"`]\s*(?:#|rgba?\()/g
  it('no style={{ color: "#..." }} literals in src', () => {
    const hits = []
    for (const [rel, src] of files) {
      const n = (src.match(STYLE) || []).length
      if (n) hits.push(`${rel}: ${n}`)
    }
    expect(hits, 'Use tokens / chartPalette / withAlpha').toEqual([])
  })
  it('the style regex catches a literal', () => {
    expect("style={{ color: '#fff' }}".match(STYLE)).toHaveLength(1)
    expect("style={{ borderColor: 'rgba(1,2,3,.5)' }}".match(STYLE)).toHaveLength(1)
    expect('style={{ color: chartPalette.text }}'.match(STYLE)).toBeNull()
  })
})
