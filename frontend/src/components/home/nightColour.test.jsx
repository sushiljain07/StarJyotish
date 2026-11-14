import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { dayScoreBand } from './dayScoreBand'

const FILES = [
  'DailyPatrikaHero', 'ReportsStrip', 'DoAvoidCards', 'ChartSpotlight', 'TodayWindow',
  'AskPersonaPanel', 'Starfield', 'LocationSection', 'LocationPrompt',
]
const src = Object.fromEntries(FILES.map(f => [f, readFileSync(`src/components/home/${f}.jsx`, 'utf8')]))
const index = readFileSync('src/index.css', 'utf8')

const styleBlocks = s => [...s.matchAll(/<style>\{`([\s\S]*?)`\}<\/style>/g)].map(m => m[1])
const movedCss = () => index.slice(index.indexOf('.sj-night-card'))

describe('/home night colour', () => {
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
