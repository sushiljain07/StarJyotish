import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '../i18n'
import PlanetTable from './PlanetTable'
import { colors } from '../theme/tokens'
import { chartPalette } from '../theme/chartPalette'
import src from './PlanetTable.jsx?raw'

const planets = [
  { name: 'Sun', sign: 'Aries', sign_index: 0, degree: 10, house: 1, nakshatra: 'Ashwini', nakshatra_pada: 1, nakshatra_lord: 'Ketu', nakshatra_degree: 1 },
  { name: 'Moon', sign: 'Taurus', sign_index: 1, degree: 12, house: 2, nakshatra: 'Rohini', nakshatra_pada: 2, nakshatra_lord: 'Moon', nakshatra_degree: 2 },
]

describe('PlanetTable sticky first column', () => {
  it('first th and every first td are sticky with an opaque background', () => {
    const { container } = render(<PlanetTable planets={planets} />)
    const th = container.querySelector('thead th')
    expect(th.className).toMatch(/\bsticky\b/)
    const tds = [...container.querySelectorAll('tbody tr')].map(tr => tr.querySelector('td'))
    expect(tds.length).toBe(2)
    for (const td of tds) {
      expect(td.className).toMatch(/\bsticky\b/)
      expect(td.className).toMatch(/\bbg-/)
    }
  })
  it('zebra rows: the sticky cell is the opaque twin of the row tint (night 3% over parchment = #F1ECE1)', () => {
    const { container } = render(<PlanetTable planets={planets} />)
    const second = container.querySelectorAll('tbody tr')[1]
    expect(second.className).toContain('bg-night/[0.03]')
    expect(second.querySelector('td').className).toContain('bg-parchment-alt')
  })
})

describe('PlanetTable column order', () => {
  it('reads Planet, House, Sign, Degree and the body follows', () => {
    const { container } = render(<PlanetTable planets={planets} />)
    const heads = [...container.querySelectorAll('thead th')].slice(0, 4).map(th => th.textContent)
    expect(heads).toEqual(['Planet', 'House', 'Sign', 'Degree'])
    const cells = [...container.querySelector('tbody tr').querySelectorAll('td')].slice(0, 4).map(td => td.textContent)
    expect(cells[1]).toBe('1')
    expect(cells[2]).toContain('Aries')
  })
})

describe('PlanetTable tokens', () => {
  it('zebra token keeps its old value', () => {
    expect(colors.parchment.alt).toBe('#F1ECE1')
  })
  it('own dignity does not borrow a planet colour', () => {
    // Jupiter's colour is primary.ink by design, so check the source, not the value.
    const line = src.split('\n').find(l => l.includes('kundli_dignity_own'))
    expect(line).toContain('chartPalette.dignityOwn')
    expect(line).not.toMatch(/PLANET_COLORS|LORD_COLORS/)
    expect(chartPalette.dignityOwn).toBe(colors.primary.ink)
  })
})
