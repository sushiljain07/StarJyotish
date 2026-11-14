// Phase 5a: pin WCAG contrast for the text tokens on both light surfaces.
import { describe, it, expect } from 'vitest'
import config from '../../tailwind.config.js'
import { ratio } from './contrastUtil.js'

const c = config.theme.extend.colors
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

describe('focus ring contrast (non-text UI, 3:1)', () => {
  it('primary.ink outline is at least 3:1 on both light surfaces', () => {
    for (const bg of Object.values(surfaces)) expect(ratio(c.primary.ink, bg)).toBeGreaterThanOrEqual(3)
  })
  it('primary.glow halo is at least 3:1 on night.DEFAULT and night.deep', () => {
    for (const bg of [c.night.DEFAULT, c.night.deep]) expect(ratio(c.primary.glow, bg)).toBeGreaterThanOrEqual(3)
  })
})
