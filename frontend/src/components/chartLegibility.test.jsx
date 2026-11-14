import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import i18n from '../i18n'
import KundliChart from './KundliChart'
import SouthIndiaChart from './SouthIndiaChart'
import WesternChart from './WesternChart'
import SarvatobhadraChakra from './SarvatobhadraChakra'
import KundliDownload from './KundliDownload'
import { estimateTextWidth, NORTH_HOUSE_POLYGONS, pointInPolygon } from '../utils/chartLabelLayout'
import kundli from '../test/fixtures/kundli.json'
import transit from '../test/fixtures/transit.json'

// kundli.json puts Sun, Jupiter, Venus and Ketu in house 6 (a corner triangle,
// the tightest house shape); with transit.json's Mars it holds five labels.
const busiest = Math.max(...Object.values(
  kundli.planets.reduce((m, p) => ({ ...m, [p.house]: (m[p.house] ?? 0) + 1 }), {}),
))

// jsdom has no layout: report a chosen rendered width for every observed element.
function renderAtWidth(ui, width) {
  vi.stubGlobal('ResizeObserver', class {
    constructor(cb) { this.cb = cb }
    observe(el) { this.cb([{ target: el, contentRect: { width } }]) }
    unobserve() {}
    disconnect() {}
  })
  return render(ui)
}

afterEach(async () => {
  vi.unstubAllGlobals()
  await i18n.changeLanguage('en')
})

const fs = el => Number(el.getAttribute('font-size'))

// Estimated box of a label <text>, from its own tspans, in viewBox units.
function labelBox(text) {
  const base = fs(text)
  const parts = text.querySelectorAll('tspan').length
    ? [...text.querySelectorAll('tspan')].map(s => [s.textContent, s.getAttribute('font-size') ? fs(s) : base])
    : [[text.textContent, base]]
  const w = parts.reduce((sum, [s, size]) => sum + estimateTextWidth(s, size), 0)
  const x = Number(text.getAttribute('x'))
  const y = Number(text.getAttribute('y'))
  const anchor = text.getAttribute('text-anchor')
  const x0 = anchor === 'middle' ? x - w / 2 : x
  return { x0, x1: x0 + w, y0: y - 0.8 * base, y1: y + 0.25 * base }
}

function overlaps(a, b) {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
}

function expectNoOverlap(labels) {
  const boxes = labels.map(labelBox)
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const sameLine = Math.abs(Number(labels[i].getAttribute('y')) - Number(labels[j].getAttribute('y')))
      // Labels either sit a full line apart or side by side without touching.
      expect(
        sameLine >= Math.max(fs(labels[i]), fs(labels[j])) || !overlaps(boxes[i], boxes[j]),
        `${labels[i].textContent} vs ${labels[j].textContent}`,
      ).toBe(true)
    }
  }
}

describe('KundliChart on a 360px phone (scale 0.59)', () => {
  const W = 295 // 0.59 × 500

  it('hides degree superscripts and renders planet labels at ≥ 11px', () => {
    const { container } = renderAtWidth(
      <KundliChart planets={kundli.planets} ascendant={kundli.ascendant} navamsaPlanets={kundli.navamsa_planets} />, W)
    expect(container.querySelectorAll('[data-deg]')).toHaveLength(0)
    const planets = container.querySelectorAll('text[data-label="planet"]')
    expect(planets.length).toBe(kundli.planets.length)
    planets.forEach(p => expect(fs(p) * 0.59).toBeGreaterThanOrEqual(11))
    container.querySelectorAll('text[data-label="sign"]').forEach(s => expect(fs(s) * 0.59).toBeGreaterThanOrEqual(10))
  })

  it('shows status markers as a ≥ 10px suffix, not a superscript', () => {
    const { container } = renderAtWidth(
      <KundliChart planets={kundli.planets} ascendant={kundli.ascendant} navamsaPlanets={kundli.navamsa_planets} />, W)
    const status = container.querySelectorAll('[data-status]')
    expect(status.length).toBeGreaterThan(0) // Saturn, Rahu… are retrograde
    status.forEach(s => {
      expect(fs(s) * 0.59).toBeGreaterThanOrEqual(10)
      expect(s.getAttribute('dy')).toBeNull()
    })
  })

  it('renders transit labels at ≥ 11px', () => {
    const { container } = renderAtWidth(
      <KundliChart planets={kundli.planets} ascendant={kundli.ascendant} transitPlanets={transit.transit_planets} />, W)
    const tr = container.querySelectorAll('text[data-label="transit"]')
    expect(tr.length).toBe(transit.transit_planets.length)
    tr.forEach(p => expect(fs(p) * 0.59).toBeGreaterThanOrEqual(11))
  })

  describe.each(['en', 'hi'])('busy houses (%s)', lng => {
    it.each([
      ['natal', { planets: kundli.planets, ascendant: kundli.ascendant, navamsaPlanets: kundli.navamsa_planets }],
      ['natal + transit', { planets: kundli.planets, ascendant: kundli.ascendant, transitPlanets: transit.transit_planets }],
    ])('%s: labels in a house never overlap and stay inside it', async (_n, props) => {
      expect(busiest).toBeGreaterThanOrEqual(4)
      await i18n.changeLanguage(lng)
      const { container } = renderAtWidth(<KundliChart {...props} />, W)
      for (let h = 1; h <= 12; h++) {
        const labels = [...container.querySelectorAll(`g[data-house="${h}"] text`)]
        expectNoOverlap(labels)
        for (const l of labels) {
          const b = labelBox(l)
          for (const [x, y] of [[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1]]) {
            expect(pointInPolygon(x, y, NORTH_HOUSE_POLYGONS[h - 1]), `H${h} ${l.textContent}`).toBe(true)
          }
        }
      }
      const h6 = [...container.querySelectorAll('g[data-house="6"] text')]
      expect(h6.length).toBeGreaterThanOrEqual(4)
      const ys = [...new Set(h6.map(l => Number(l.getAttribute('y'))))].sort((a, b) => a - b)
      for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(fs(h6[0]))
    })
  })
})

describe('KundliChart: synthetic crowded kite (Lagna + 6 planets in H1)', () => {
  const crowded = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus'].map((name, i) => ({
    name, house: 1, sign_index: 0, degree: 3 + i * 4, retrograde: i % 2 === 0,
  }))
  it.each(['en', 'hi'])('wraps without overlap inside the kite at 360px (%s)', async lng => {
    await i18n.changeLanguage(lng)
    const { container } = renderAtWidth(<KundliChart planets={crowded} ascendant={{ sign_index: 0, degree: 1 }} />, 295)
    const labels = [...container.querySelectorAll('g[data-house="1"] text')]
    expect(labels).toHaveLength(7)
    expectNoOverlap(labels)
    for (const l of labels) {
      const b = labelBox(l)
      for (const [x, y] of [[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1]]) {
        expect(pointInPolygon(x, y, NORTH_HOUSE_POLYGONS[0]), l.textContent).toBe(true)
      }
    }
  })

  it('separates the status suffix from the name by a small gap', () => {
    const { container } = renderAtWidth(<KundliChart planets={crowded} ascendant={null} />, 295)
    const s = container.querySelector('[data-status]')
    expect(Number(s.getAttribute('dx'))).toBeCloseTo(0.2 * fs(s), 5)
  })
})

describe('KundliDownload charts keep full detail', () => {
  it('renders degree superscripts at desktop sizes even at scale 0.64', () => {
    const { container } = renderAtWidth(
      <KundliDownload data={kundli} input={{ name: 'A', date: '1990-05-15', time: '10:30', place: 'Delhi' }} />, 320)
    const charts = container.querySelectorAll('svg[viewBox="0 0 500 500"]')
    expect(charts).toHaveLength(2)
    for (const svg of charts) {
      expect(svg.querySelectorAll('[data-deg]').length).toBeGreaterThan(0)
      svg.querySelectorAll('text[data-label="planet"]').forEach(p => expect(fs(p)).toBe(15))
    }
  })

  it('the same chart without detail="full" goes compact at 0.64', () => {
    const { container } = renderAtWidth(<KundliChart planets={kundli.planets} ascendant={kundli.ascendant} />, 320)
    expect(container.querySelectorAll('[data-deg]')).toHaveLength(0)
  })
})

describe('KundliChart on desktop (scale 1)', () => {
  it('keeps the degree superscripts and the desktop sizes', () => {
    const { container } = render(
      <KundliChart planets={kundli.planets} ascendant={kundli.ascendant} navamsaPlanets={kundli.navamsa_planets} />)
    const degs = container.querySelectorAll('[data-deg]')
    expect(degs.length).toBe(kundli.planets.length + 1) // + Lagna
    degs.forEach(d => expect(d.getAttribute('dy')).toBe('-3'))
    container.querySelectorAll('text[data-label="planet"]').forEach(p => expect(fs(p)).toBe(15))
    container.querySelectorAll('[data-status]').forEach(s => expect(s.getAttribute('dy')).toBe('-3'))
  })

  it('places the house-6 grid exactly where it always was', () => {
    const { container } = render(<KundliChart planets={kundli.planets} ascendant={kundli.ascendant} />)
    const pos = [...container.querySelectorAll('g[data-house="6"] text')].map(t => [t.getAttribute('x'), t.getAttribute('y')])
    // centre (130,450), 2 columns ±22, row height 22
    expect(pos).toEqual([['108', '439'], ['152', '439'], ['108', '461'], ['152', '461']])
  })
})

describe('SouthIndiaChart on a phone (scale 0.6)', () => {
  it.each(['en', 'hi'])('legible, no degrees, no overlap (%s)', async lng => {
    await i18n.changeLanguage(lng)
    const { container } = renderAtWidth(
      <SouthIndiaChart planets={kundli.planets} ascendant={kundli.ascendant} transitPlanets={transit.transit_planets} />, 288)
    expect(container.querySelectorAll('[data-deg]')).toHaveLength(0)
    const labels = container.querySelectorAll('text[data-label="planet"], text[data-label="transit"]')
    expect(labels.length).toBe(kundli.planets.length + transit.transit_planets.length)
    labels.forEach(p => expect(fs(p) * 0.6).toBeGreaterThanOrEqual(11))
    container.querySelectorAll('[data-status]').forEach(s => expect(fs(s) * 0.6).toBeGreaterThanOrEqual(10))
    container.querySelectorAll('text[data-label="sign"]').forEach(s => expect(fs(s) * 0.6).toBeGreaterThanOrEqual(10))
    const cells = container.querySelectorAll('g[data-cell]')
    expect(cells).toHaveLength(12)
    for (const cell of cells) {
      expectNoOverlap([...cell.querySelectorAll('text')])
    }
  })
})

describe('WesternChart on a phone', () => {
  it('renders planet glyphs at ≥ 11px and hides degrees', () => {
    const s = 296 / 520
    const { container } = renderAtWidth(
      <WesternChart planets={kundli.planets} ascendant={kundli.ascendant} transitPlanets={transit.transit_planets} />, 296)
    expect(container.querySelectorAll('[data-deg]')).toHaveLength(0)
    const glyphs = container.querySelectorAll('text[data-label="planet"], text[data-label="transit"]')
    expect(glyphs.length).toBe(kundli.planets.length + transit.transit_planets.length)
    glyphs.forEach(g => expect(fs(g) * s).toBeGreaterThanOrEqual(11))
  })
})

describe('SarvatobhadraChakra', () => {
  it('scrolls sideways with a 560px minimum grid', () => {
    const { container } = render(<SarvatobhadraChakra natalPlanets={kundli.planets} />)
    const svg = container.querySelector('svg')
    const inner = svg.parentElement
    expect(inner.className).toContain('min-w-[560px]')
    expect(inner.parentElement.className).toContain('overflow-x-auto')
  })

  it('every label renders at ≥ 10px at that width', () => {
    const { container } = render(<SarvatobhadraChakra natalPlanets={kundli.planets} />)
    const svg = container.querySelector('svg')
    const vbW = Number(svg.getAttribute('viewBox').split(' ')[2])
    svg.querySelectorAll('text').forEach(t => expect(fs(t) * 560 / vbW).toBeGreaterThanOrEqual(10))
  })
})
