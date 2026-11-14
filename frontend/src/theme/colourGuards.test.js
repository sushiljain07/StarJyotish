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

// A solid night background: no alpha, or an alpha of at least 0.9 (/90-/100, /[0.9x]).
const NIGHT_BG = /(?<![\w-])bg-night(?:-light|-deep)?(?:\/(?:9\d|100|\[0?\.9\d*\]|\[1\]))?(?![\w/.[-])/
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
    expect(NIGHT_BG.test('bg-night/[0.97] text-ink')).toBe(true)
    expect(NIGHT_BG.test('bg-night/90')).toBe(true)
    expect(NIGHT_BG.test('bg-night-deep/95')).toBe(true)
    expect(NIGHT_BG.test('bg-night/[0.85]')).toBe(false)
    expect(NIGHT_BG.test('bg-night/[0.5]')).toBe(false)
  })
})

// Whole files that render on a night surface. Any parchment-tuned text in them
// is a regression unless the line (or the line above) carries a
// `light-surface:` comment naming the parchment panel it sits on.
const NIGHT_FILES = new Set([
  ...files.map(([rel]) => rel).filter(rel => rel.startsWith('components/home/')),
  'pages/WeekAhead.jsx',
  'components/CompactFooter.jsx',
  'components/Footer.jsx',
  'components/NavBar.jsx',
  'components/home/BottomNav.jsx',
  'components/LanguageSwitcher.jsx',
])
const NIGHT_BANNED = [
  [/(?<![\w-])text-(?:sage|mauve|vermillion|good|bad|caution)(?![\w-])/, 'use the -onnight accent'],
  [/(?<![\w-])text-ink-muted(?![\w-])/, 'use text-ink-onnightMuted'],
  [/(?<![\w-])text-primary-ink(?![\w-])/, 'use text-primary-glow'],
]
// Low-alpha cream on readable text (decorative, aria-hidden lines are exempt).
const LOW_ALPHA = /(?<![\w-])text-ink-onnight\/\[?0?\.?[0-6]\d/

function nightFileHits(rel, src) {
  const hits = []
  const lines = src.split('\n')
  lines.forEach((line, i) => {
    if (/light-surface:/.test(line) || /light-surface:/.test(lines[i - 1] ?? '')) return
    for (const [re, why] of NIGHT_BANNED) if (re.test(line)) hits.push(`${rel}:${i + 1} ${why}: ${line.trim().slice(0, 100)}`)
    if (LOW_ALPHA.test(line) && !/aria-hidden/.test(line)) hits.push(`${rel}:${i + 1} use text-ink-onnight or -onnightMuted: ${line.trim().slice(0, 100)}`)
  })
  return hits
}

describe('night-surface files', () => {
  it('every listed file exists (guards against a stale list)', () => {
    const have = new Set(files.map(([rel]) => rel))
    for (const rel of NIGHT_FILES) expect(have.has(rel), rel).toBe(true)
    expect([...NIGHT_FILES].filter(r => r.startsWith('components/home/')).length).toBeGreaterThan(20)
  })
  it('carry no parchment-tuned or low-alpha text outside a light-surface: panel', () => {
    const hits = files.filter(([rel]) => NIGHT_FILES.has(rel)).flatMap(([rel, src]) => nightFileHits(rel, src))
    expect(hits).toEqual([])
  })
  it('the night-file rules catch what they should', () => {
    expect(nightFileHits('x', '<p className="text-sage">')).toHaveLength(1)
    expect(nightFileHits('x', '<p className="text-sage-onnight">')).toEqual([])
    expect(nightFileHits('x', '<p className="text-ink-muted">')).toHaveLength(1)
    expect(nightFileHits('x', '<p className="text-primary-ink">')).toHaveLength(1)
    expect(nightFileHits('x', '<p className="text-ink-onnight/55">')).toHaveLength(1)
    expect(nightFileHits('x', '<p className="placeholder:text-ink-onnight/40">')).toHaveLength(1)
    expect(nightFileHits('x', '<p className="text-ink-onnight/70">')).toEqual([])
    expect(nightFileHits('x', '<span aria-hidden="true" className="text-ink-onnight/40">')).toEqual([])
    expect(nightFileHits('x', '{/* light-surface: parchment card */}\n<p className="text-ink-muted">')).toEqual([])
    expect(nightFileHits('x', '<p className="text-ink-muted"> // light-surface: card')).toEqual([])
  })
})

// Colour literals in plain .js modules too (the token-usage ratchet walks .jsx only).
// theme/tokens.js is the one place hex lives; withAlpha's `rgba(${...})` builds a
// colour from a token, so it is not a literal.
describe('hex literals in .js modules', () => {
  const HEX = /#[0-9a-fA-F]{3,8}\b|rgba?\((?!\$\{)/g
  const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<![:'"`])\/\/[^\n]*/g, '')
  function walkJs(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walkJs(full, out)
      else if (/\.js$/.test(e.name) && !/\.test\.js$/.test(e.name)) out.push(full)
    }
    return out
  }
  const jsFiles = walkJs(SRC)
    .map(f => path.relative(SRC, f).split(path.sep).join('/'))
    .filter(rel => rel !== 'theme/tokens.js')
  it('finds the .js modules', () => expect(jsFiles.length).toBeGreaterThan(20))
  it('no hex or rgba literals outside theme/tokens.js', () => {
    const hits = jsFiles.flatMap(rel => {
      const n = (stripComments(fs.readFileSync(path.join(SRC, rel), 'utf8')).match(HEX) || []).length
      return n ? [`${rel}: ${n}`] : []
    })
    expect(hits, 'Import from theme/tokens.js or use withAlpha').toEqual([])
  })
  it('the .js literal regex catches literals but not withAlpha', () => {
    expect("const a = '#B83232'".match(HEX)).toHaveLength(1)
    expect("const a = 'rgba(1,2,3,.4)'".match(HEX)).toHaveLength(1)
    expect('return `rgba(${r},${g},${b},${alpha})`'.match(HEX)).toBeNull()
    expect(stripComments("x // was rgba(1,2,3,.5)\nconst u = 'https://a'")).toBe("x \nconst u = 'https://a'")
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
