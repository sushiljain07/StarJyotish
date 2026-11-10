import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LANGUAGES } from './languages'

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CODES = LANGUAGES.map(l => l.code).join('|')

const PATTERNS = [
  new RegExp(`[!=]==?\\s*(['"])(${CODES})\\1`),
  new RegExp(`(['"])(${CODES})\\1\\s*[!=]==?`),
  new RegExp(`startsWith\\(\\s*(['"])(${CODES})`),
  new RegExp(`(\\|\\||\\?\\?)\\s*(['"])(${CODES})\\2`),
]

const hits = line => PATTERNS.some(p => p.test(line))

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (full === path.join(SRC, 'i18n')) continue
      walk(full, out)
    } else if (/\.(js|jsx)$/.test(e.name) && !/\.test\./.test(e.name)) {
      out.push(full)
    }
  }
  return out
}

describe('no language-code literals outside src/i18n', () => {
  it('matcher catches both quote styles and both operand orders', () => {
    expect(hits('if (lang === "hi") {}')).toBe(true)
    expect(hits("if (lang !== 'en') {}")).toBe(true)
    expect(hits("if ('hi' == lang) {}")).toBe(true)
    expect(hits("lang.startsWith('hi')")).toBe(true)
    expect(hits("const l = user.lang || 'en'")).toBe(true)
    expect(hits("const l = user.lang ?? \"hi\"")).toBe(true)
    expect(hits("const x = a === 'high'")).toBe(false)
  })

  it('source files use the registry instead', () => {
    const found = []
    for (const file of walk(SRC)) {
      fs.readFileSync(file, 'utf8').split('\n').forEach((text, i) => {
        if (hits(text)) found.push(`${path.relative(SRC, file)}:${i + 1}: ${text.trim()}`)
      })
    }
    expect(found, found.join('\n')).toEqual([])
  })
})
