import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import config from '../../tailwind.config.js'
import { chartPalette as P, withAlpha } from './chartPalette.js'
import { ratio } from './contrastUtil.js'

const c = config.theme.extend.colors

describe('chartPalette', () => {
  it('takes its values from the Tailwind tokens', () => {
    expect(P.paper).toBe(c.parchment.card)
    expect(P.paperAlt).toBe(c.parchment.DEFAULT)
    expect(P.ascFill).toBe(c.primary.light)
    expect(P.asc).toBe(c.vermillion.DEFAULT)
    expect(P.line).toBe(c.primary.dark)
    expect(P.signText).toBe(c.primary.ink)
    expect(P.text).toBe(c.ink.DEFAULT)
    expect(P.muted).toBe(c.ink.muted)
    expect(P.hairline).toBe(c.line)
    expect(P.good).toBe(c.good.DEFAULT)
    expect(P.caution).toBe(c.caution.DEFAULT)
    expect(P.night).toBe(c.night.DEFAULT)
    expect(P.onNight).toBe(c.ink.onnight)
  })
  it('is frozen', () => expect(Object.isFrozen(P)).toBe(true))
  it('withAlpha returns rgba', () => {
    expect(withAlpha('#D9A441', 0.5)).toBe('rgba(217,164,65,0.5)')
  })
  for (const key of ['text', 'muted', 'signText', 'asc']) {
    for (const bg of ['paper', 'ascFill']) {
      it(`${key} is at least 4.5:1 on ${bg}`, () => expect(ratio(P[key], P[bg])).toBeGreaterThanOrEqual(4.5))
    }
  }
  it('has no hex or rgba literals in the chart components', () => {
    const files = ['KundliChart', 'SouthIndiaChart', 'WesternChart', 'SarvatobhadraChakra',
      'ChartReading', 'ChartHighlight', 'home/MobileTimelineCard']
    for (const f of files) {
      const src = readFileSync(resolve(import.meta.dirname, `../components/${f}.jsx`), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
      expect(src.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g) ?? [], f).toEqual([])
    }
  })
})
