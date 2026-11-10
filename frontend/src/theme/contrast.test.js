// Phase 5a: pin WCAG contrast for the text tokens on both light surfaces.
import { describe, it, expect } from 'vitest'
import config from '../../tailwind.config.js'

const c = config.theme.extend.colors
const lum = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const surfaces = { parchment: c.parchment.DEFAULT, card: c.parchment.card }

describe('text token contrast (WCAG)', () => {
  const AA = {
    'ink': c.ink.DEFAULT, 'ink-muted': c.ink.muted, 'primary-ink': c.primary.ink,
    'good': c.good.DEFAULT, 'caution': c.caution.DEFAULT, 'bad': c.bad.DEFAULT,
  }
  for (const [name, fg] of Object.entries(AA)) {
    for (const [sname, bg] of Object.entries(surfaces)) {
      it(`${name} on ${sname} is at least 4.5:1`, () => expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5))
    }
  }
  it('status text also passes on its own tinted background', () => {
    for (const k of ['good', 'caution', 'bad']) expect(ratio(c[k].DEFAULT, c[k].light)).toBeGreaterThanOrEqual(4.5)
  })
  it('ink-faint is at least 3:1 (decoration and disabled text only)', () => {
    for (const bg of Object.values(surfaces)) expect(ratio(c.ink.faint, bg)).toBeGreaterThanOrEqual(3)
  })
})
