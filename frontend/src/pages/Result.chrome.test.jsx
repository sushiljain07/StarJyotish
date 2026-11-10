import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false, user: null }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))
const { marker } = vi.hoisted(() => ({ marker: name => ({ default: () => name }) }))
vi.mock('../components/KundliChart', () => marker('KUNDLI_CHART'))
vi.mock('../components/PlanetTable', () => marker('PLANET_TABLE'))
vi.mock('../components/DashaTable', () => marker('DASHA_TABLE'))
vi.mock('../components/KPChart', () => marker('KP_CHART'))
vi.mock('../components/DivisionalCharts', () => marker('DIVISIONAL'))
vi.mock('../components/TransitPanel', () => marker('TRANSIT'))
vi.mock('../components/KundliDownload', () => marker('DOWNLOAD'))
vi.mock('../components/BhavaChalit', () => marker('BHAVA'))
vi.mock('../components/AshtakavargaTable', () => marker('ASHTAKAVARGA'))
vi.mock('../components/SarvatobhadraChakra', () => marker('SARVATOBHADRA'))

import Result from './Result'

const CHART = {
  data: { planets: [], ascendant: { sign: 'Virgo' }, navamsa_planets: [], navamsa_ascendant: { sign: 'Leo' },
          dasha: { current_mahadasha: { planet: 'Jupiter' } } },
  input: { name: 'Asha', date: '1990-08-16', time: '19:05', place: 'Delhi, India' },
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/kundli', state: CHART }]}>
      <Routes><Route path="/kundli" element={<Result />} /></Routes>
    </MemoryRouter>,
  )
}

function scrollTo(y) {
  act(() => {
    window.scrollY = y
    window.dispatchEvent(new Event('scroll'))
  })
}

let now
beforeEach(() => {
  window.scrollY = 0
  now = 1000
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 5000 })
})
afterEach(() => { vi.restoreAllMocks(); delete document.documentElement.scrollHeight; window.scrollY = 0; sessionStorage.clear() })

describe('Kundli sticky chrome', () => {
  it('shows the main-tab row from md up only', () => {
    renderPage()
    const row = screen.getAllByRole('button', { name: /Birth Chart/ })[0].parentElement
    expect(row.className).toContain('md:flex')
    expect(row.className).not.toContain('sm:flex')
  })

  it('stops the sticky header from scroll anchoring', () => {
    renderPage()
    expect(screen.getByTestId('summary-chips').closest('.sticky').className).toContain('[overflow-anchor:none]')
  })

  it('collapses the chips while scrolling down and restores them on scroll up', () => {
    renderPage()
    const chips = screen.getByTestId('summary-chips')
    expect(chips.className).not.toContain('max-h-0')
    scrollTo(300)
    scrollTo(400)
    expect(chips.className).toContain('max-h-0')
    expect(chips.className).toContain('motion-safe:transition-all')
    now += 300
    scrollTo(380)
    expect(chips.className).not.toContain('max-h-0')
  })
})
