import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '../i18n'
import PlanetTable from './PlanetTable'

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
})
