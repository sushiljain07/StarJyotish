import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { dayScoreBand } from '../../utils/dayScoreBand'
import { colors } from '../../theme/tokens'
import { ratio, composite } from '../../theme/contrastUtil'
import { computeOneAction } from '../../utils/dailyInsights'

// Every /home component: the whole page is a night surface.
const FILES = readdirSync('src/components/home')
  .filter(f => /\.jsx$/.test(f) && !/\.test\.jsx$/.test(f))
  .map(f => f.replace(/\.jsx$/, ''))
const src = Object.fromEntries(FILES.map(f => [f, readFileSync(`src/components/home/${f}.jsx`, 'utf8')]))
const index = readFileSync('src/index.css', 'utf8')

const styleBlocks = s => [...s.matchAll(/<style>\{`([\s\S]*?)`\}<\/style>/g)].map(m => m[1])
const movedCss = () => index.slice(index.indexOf('.sj-night-card'))

describe('/home night colour', () => {
  it('scans every home component (guards against a broken walk)', () => {
    expect(FILES.length).toBeGreaterThan(20)
    expect(FILES).toEqual(expect.arrayContaining(['HomeMasthead', 'WeekStrip', 'DisclaimerBlock', 'BottomNav']))
  })
  it('embedded <style> blocks hold no hex or rgba literals', () => {
    for (const f of FILES) {
      for (const block of styleBlocks(src[f])) expect(block, f).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/)
    }
  })
  it('the moved sj-* rules in index.css take colours from tokens', () => {
    expect(index.indexOf('.sj-night-card')).toBeGreaterThan(0)
    expect(movedCss()).toContain("theme('colors.")
    expect(movedCss()).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/)
  })
  it('no low-alpha ink-onnight on readable text', () => {
    for (const f of FILES) expect(src[f], f).not.toMatch(/text-ink-onnight\/\[?[0-6]\d/)
  })
  it('night text uses -onnight accents, not the parchment ones', () => {
    for (const f of FILES) {
      // AskPersonaPanel's body is a parchment panel; only its night FAB/header matter.
      const code = f === 'AskPersonaPanel' ? src[f].replace(/^.*(text-vermillion|text-ink-muted).*$/gm, '') : src[f]
      expect(code, f).not.toMatch(/text-(sage|mauve|vermillion|good|bad)(?![\w-])/)
    }
  })
  it('readable text is at least 11px; smaller must be aria-hidden', () => {
    for (const f of FILES) {
      src[f].split('\n').forEach((line, i) => {
        const small = /text-3xs|text-\[(\d(\.\d+)?|10(\.\d+)?)px\]/.test(line)
        if (small) expect(/aria-hidden/.test(line), `${f}:${i + 1} ${line.trim()}`).toBe(true)
      })
    }
  })
  it('moved day-card rules have no sub-11px font-size', () => {
    for (const m of movedCss().matchAll(/font-size:\s*(\d+(\.\d+)?)px/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(11)
  })
})

describe('One Action "why" button (.sj-why-btn) over the tone card', () => {
  // The card sits on the sj-night-card gradient; night.light is its lightest stop.
  const tint = Number(index.match(/\.sj-why-btn\{[^}]*background:theme\('colors\.parchment\.DEFAULT \/ (\d+)%'\)/)[1]) / 100
  const tones = [
    ['opportunity', colors.sage.DEFAULT, 0.22, colors.good.onnight],
    ['steady', colors.primary.DEFAULT, 0.12, colors.primary.glow],
    ['caution', colors.bad.DEFAULT, 0.16, colors.bad.onnight],
  ]
  it.each(tones)('%s label reaches 4.5:1', (_n, from, a, fg) => {
    for (const base of [colors.night.light, colors.night.DEFAULT]) {
      const card = composite(from, a, base)
      expect(ratio(fg, composite(colors.parchment.DEFAULT, tint, card))).toBeGreaterThanOrEqual(4.5)
    }
  })
  it('the hero still uses these tone colours', () => {
    expect(src.DailyPatrikaHero).toMatch(/caution:\s*\{ bg: withAlpha\(colors\.bad\.DEFAULT, 0\.16\).*ac: colors\.bad\.onnight/)
  })
})

describe('WeekStrip day labels', () => {
  it('render at >= 11px through useRenderedScale, at full opacity', () => {
    expect(src.WeekStrip).toMatch(/useRenderedScale\(/)
    expect(src.WeekStrip).toMatch(/fontSize=\{legibleSize\([^)]*11\)\}/)
    expect(src.WeekStrip).not.toMatch(/fillOpacity=\{p\.isToday \? 1 : 0\.\d+\}/)
  })
})

describe('dayScoreBand (C5: ring tone and label share one band)', () => {
  it('4.6 is cautious and gets the caution tone', () => {
    expect(dayScoreBand(4.6)).toEqual({ labelKey: 'dial_label_cautious', tone: 'caution' })
  })
  it('walks every band edge', () => {
    expect(dayScoreBand(8)).toEqual({ labelKey: 'dial_label_excellent', tone: 'opportunity' })
    expect(dayScoreBand(6.5)).toEqual({ labelKey: 'dial_label_steady', tone: 'steady' })
    expect(dayScoreBand(5)).toEqual({ labelKey: 'dial_label_mixed', tone: 'steady' })
    expect(dayScoreBand(3.5).tone).toBe('caution')
    expect(dayScoreBand(2)).toEqual({ labelKey: 'dial_label_challenging', tone: 'caution' })
  })
  it('a missing score is steady with no label', () => {
    expect(dayScoreBand(null)).toEqual({ labelKey: null, tone: 'steady' })
  })
})

describe('ReportsStrip accents on the from-{accent}/20 gradient start', () => {
  const cases = [
    ['sage', colors.sage.DEFAULT, colors.sage.onnight],
    ['mauve', colors.mauve.DEFAULT, colors.mauve.onnight],
    ['vermillion', colors.vermillion.DEFAULT, colors.bad.onnight],
    ['primary', colors.primary.DEFAULT, colors.primary.glow],
  ]
  it.each(cases)('%s text and glyph reach 4.5:1 over the tinted night surface', (_n, from, fg) => {
    for (const base of [colors.night.DEFAULT, colors.night.deep]) {
      expect(ratio(fg, composite(from, 0.2, base))).toBeGreaterThanOrEqual(4.5)
    }
  })
  it('accent glyph boxes carry no white tint behind the glyph', () => {
    expect(src.ReportsStrip).not.toMatch(/bg-white\/10 \$\{accent\.text\}/)
  })
})

describe('ring and One Action card share the day band', () => {
  const chart = { ascendant: { sign_index: 0 }, dasha: { current_mahadasha: { planet: 'Sun' } } }
  const moon = [{ name: 'Moon', sign_index: 0 }]
  const t = (k, d) => (typeof d === 'string' ? d : k)
  it.each([4.6, 7.2, 8.5, 3])('score %s: card tone equals ring tone', score => {
    const card = computeOneAction(chart, moon, { score }, null, t)
    expect(card.tone).toBe(dayScoreBand(score).tone)
  })
})

describe('hero svg text size', () => {
  it('every non-aria-hidden svg fontSize renders at >= 11px', () => {
    for (const m of src.DailyPatrikaHero.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/g)) {
      if (/aria-hidden/.test(m[1])) continue
      const scale = Number(m[1].match(/width="(\d+)"/)[1]) / Number(m[1].match(/viewBox="0 0 (\d+)/)[1])
      for (const f of m[2].matchAll(/fontSize="([\d.]+)"/g)) expect(Number(f[1]) * scale).toBeGreaterThanOrEqual(10.99)
    }
  })
  it('the ring label inside the aria-hidden svg still renders at about 11px', () => {
    const m = src.DailyPatrikaHero.match(/<svg width="(\d+)"[^>]*viewBox="0 0 (\d+)[\s\S]*?fontSize="9\.2"/)
    expect((Number(m[1]) / Number(m[2])) * 9.2).toBeGreaterThanOrEqual(10.99)
  })
})
