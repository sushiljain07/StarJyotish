import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import '../i18n'
import KundliChart from './KundliChart'
import SarvatobhadraChakra from './SarvatobhadraChakra'
import { chartPalette as P } from '../theme/chartPalette'
import { ratio, composite } from '../theme/contrastUtil'
import kundli from '../test/fixtures/kundli.json'
import transit from '../test/fixtures/transit.json'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'

// An SVG fill is either an opaque hex or withAlpha's rgba(); flatten it onto paper.
function flatten(fill, under = P.paper) {
  if (fill.startsWith('#')) return fill
  const [r, g, b, a] = fill.match(/[\d.]+/g).map(Number)
  const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
  return composite(hex, a, under)
}
const rgb = hex => `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`

describe('KundliChart transit labels (B2)', () => {
  // Rendered per test: RTL's cleanup unmounts after each one.
  const transitLabels = () => [...render(
    <KundliChart planets={kundli.planets} ascendant={kundli.ascendant} transitPlanets={transit.transit_planets} />,
  ).container.querySelectorAll('text[data-label="transit"]')]

  it('render at full opacity, marked by italics and the T: prefix', () => {
    const labels = transitLabels()
    expect(labels.length).toBe(transit.transit_planets.length)
    for (const l of labels) {
      expect(l.getAttribute('opacity')).toBeNull()
      expect(l.getAttribute('fill-opacity')).toBeNull()
      expect(l.getAttribute('font-style')).toBe('italic')
      expect(l.textContent).toContain(en.chart_transit_marker)
    }
  })
  it('every transit label (and its degrees) is at least 4.5:1 on paper and on ascFill', () => {
    const labels = transitLabels()
    for (const l of labels) {
      for (const bg of [P.paper, P.ascFill]) {
        expect(ratio(l.getAttribute('fill'), bg), `${l.textContent} on ${bg}`).toBeGreaterThanOrEqual(4.5)
      }
      for (const s of l.querySelectorAll('tspan')) {
        expect(s.getAttribute('opacity')).toBeNull()
        expect(s.getAttribute('fill')).toBeNull() // inherits the label's fill
      }
    }
  })
})

describe('SarvatobhadraChakra (B3)', () => {
  const natal = kundli.planets
  const tr = transit.transit_planets
  const chakra = () => render(<SarvatobhadraChakra natalPlanets={natal} transitPlanets={tr} />).container

  it('every corner label is full-colour and at least 4.5:1 on its cell', () => {
    const container = chakra()
    const corners = [...container.querySelectorAll('g[data-cell="corner"]')]
    expect(corners).toHaveLength(4)
    for (const g of corners) {
      const bg = flatten(g.querySelector('rect').getAttribute('fill'))
      const texts = [...g.querySelectorAll('text')]
      expect(texts.length).toBeGreaterThan(0)
      for (const t of texts) {
        if (!t.textContent) continue
        const fill = t.getAttribute('fill')
        expect(fill.startsWith('#'), `${t.textContent} fill ${fill}`).toBe(true)
        expect(ratio(fill, bg), `${t.textContent} on ${bg}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('legend swatches use the same colours and shapes as the markers', () => {
    const container = chakra()
    const marker = k => container.querySelector(`[data-marker="${k}"]`)
    const legend = k => container.querySelector(`[data-legend="${k}"]`)
    // Transit planet: circle ringed in the transit colour.
    expect(marker('transit').tagName.toLowerCase()).toBe('circle')
    expect(marker('transit').getAttribute('stroke')).toBe(P.transit)
    expect(legend('transit').className).toContain('rounded-full')
    expect(legend('transit').style.borderColor).toBe(rgb(P.transit))
    // Natal planet: square bordered in the natal colour.
    expect(marker('natal').tagName.toLowerCase()).toBe('rect')
    expect(marker('natal').getAttribute('stroke')).toBe(P.natal)
    expect(legend('natal').className).not.toContain('rounded-full')
    expect(legend('natal').style.borderColor).toBe(rgb(P.natal))
    // Nakshatra cells: tint and border.
    for (const [k, fill, stroke] of [['transit_nak', P.transitFill, P.transit], ['natal_nak', P.natalFill, P.natal]]) {
      const cell = marker(k)
      expect(cell, k).not.toBeNull()
      expect(cell.getAttribute('fill')).toBe(fill)
      expect(cell.getAttribute('stroke')).toBe(stroke)
      expect(legend(k).style.background.replace(/\s/g, '')).toBe(fill.replace(/\s/g, ''))
      expect(legend(k).style.borderColor).toBe(rgb(stroke))
    }
  })
})

describe('Sarvatobhadra intro and legend wording (B3)', () => {
  it('describes the colours actually drawn, not green / yellow', () => {
    const keys = ['chart_sarvato_intro', 'chart_sarvato_legend_transit', 'chart_sarvato_legend_natal',
      'chart_sarvato_legend_transit_nak', 'chart_sarvato_legend_natal_nak']
    const enText = keys.map(k => en[k]).join(' ')
    const hiText = keys.map(k => hi[k]).join(' ')
    expect(enText).not.toMatch(/green|yellow/i)
    expect(hiText).not.toMatch(/हरा|पीला/)
    for (const k of keys.slice(1)) {
      expect(en[k], k).toMatch(/blue|mauve/i)
      expect(hi[k], k).toMatch(/नील|बैंगनी/)
    }
    expect(en.chart_sarvato_intro).toMatch(/blue/i)
    expect(en.chart_sarvato_intro).toMatch(/mauve/i)
    expect(hi.chart_sarvato_intro).toMatch(/नील/)
    expect(hi.chart_sarvato_intro).toMatch(/बैंगनी/)
  })
})
