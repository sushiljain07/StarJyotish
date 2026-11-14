import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { chartPalette as P } from './chartPalette.js'
import { colors } from './tokens.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const read = rel => fs.readFileSync(path.resolve(HERE, '..', rel), 'utf8')

describe('UX2 gold selection', () => {
  const tab = read('components/AnimatedTabRow.jsx')
  it('AnimatedTabRow has no accent maps; selected pill is bg-primary text-night', () => {
    expect(tab).not.toMatch(/bg-(sage|mauve)/)
    expect(tab).not.toMatch(/PILL_ACCENT/)
    expect(tab).toContain('bg-primary')
    expect(tab).toContain('text-night')
  })
  it('callers no longer pass an accent', () => {
    for (const f of ['pages/Result.jsx', 'pages/Insights.jsx', 'components/SectionJumpNav.jsx']) {
      expect(read(f), f).not.toMatch(/accent="(sage|mauve)"/)
    }
  })
})

describe('Result and Insights have no inline colour literals', () => {
  for (const f of ['pages/Result.jsx', 'pages/Insights.jsx']) {
    it(f, () => {
      const src = read(f)
      expect(src).not.toMatch(/style=\{\{[^}]*(color|background|borderColor)\s*:\s*['"]/)
      expect(src).not.toMatch(/rgba?\(\s*\d/)
      expect(src).not.toMatch(/#[0-9a-fA-F]{6}\b/)
    })
  }
})

describe('Sarvatobhadra natal / transit colours', () => {
  const src = read('components/SarvatobhadraChakra.jsx')
  it('chartPalette has natal and transit keys derived from tokens', () => {
    expect(P.transit).toBe(colors.planet.saturn)
    expect(P.natal).toBe(colors.mauve.DEFAULT)
  })
  it('markers and legend do not use status tokens', () => {
    expect(src).toContain('P.natal')
    expect(src).toContain('P.transit')
    expect(src).not.toMatch(/P\.(good|caution|goodFill|cautionFill)\b/)
    expect(src).not.toMatch(/bg-(good|caution)/)
    expect(src).not.toMatch(/border-(good|caution)/)
  })
})
