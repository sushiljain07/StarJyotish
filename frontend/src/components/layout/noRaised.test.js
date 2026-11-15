import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const read = rel => fs.readFileSync(path.join(SRC, rel), 'utf8')

describe('NavBar has no raised mode', () => {
  it('no raised prop or raisedSubNav remains', () => {
    for (const f of ['components/NavBar.jsx', 'components/layout/useBottomChrome.js', 'pages/Result.jsx']) {
      expect(read(f), f).not.toMatch(/raisedSubNav|raised\s*[=,}]|raised\s*\?/)
    }
  })
})

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })
}

describe('no 10px text', () => {
  it('no text-[10px] anywhere under src (tests excluded)', () => {
    const bad = walk(SRC)
      .filter(p => /\.(jsx?|css)$/.test(p) && !/\.test\./.test(p))
      .filter(p => fs.readFileSync(p, 'utf8').includes('text-[10px]'))
      .map(p => path.relative(SRC, p))
    expect(bad).toEqual([])
  })
})
