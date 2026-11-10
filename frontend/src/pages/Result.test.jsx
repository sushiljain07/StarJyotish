// Kundli tabs live in the URL, so refresh, Back and shared links keep the
// tab. Old in-app links that pass { activeTab } in router state still work.
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
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

let lastSearch
function LocationProbe() { lastSearch = useLocation().search; return null }

function renderAt(entry) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes><Route path="/kundli" element={<><Result /><LocationProbe /></>} /></Routes>
    </MemoryRouter>,
  )
}

const shown = text => screen.getAllByText(text)[0].closest('.hidden') === null

beforeEach(() => { lastSearch = undefined })
afterEach(() => sessionStorage.clear())

describe('Kundli tabs in the URL', () => {
  it('opens the tab named in the URL', async () => {
    renderAt({ pathname: '/kundli', search: '?tab=analysis&sub=ashtakavarga', state: CHART })
    expect(await screen.findByText('ASHTAKAVARGA')).toBeInTheDocument()
    expect(shown('ASHTAKAVARGA')).toBe(true)
  })

  it('writes the sub-tab to the URL when clicked', () => {
    renderAt({ pathname: '/kundli', state: CHART })
    fireEvent.click(screen.getByRole('button', { name: 'Dasha' }))
    expect(lastSearch).toBe('?tab=birth_chart&sub=dasha')
    expect(shown('DASHA_TABLE')).toBe(true)
  })

  it('still honours the legacy activeTab router state', async () => {
    renderAt({ pathname: '/kundli', state: { ...CHART, activeTab: 'advanced' } })
    expect(await screen.findByText('BHAVA')).toBeInTheDocument()
    expect(shown('BHAVA')).toBe(true)
  })

  it('falls back to Birth Chart › Chart for an unknown tab', () => {
    renderAt({ pathname: '/kundli', search: '?tab=bogus&sub=nope', state: CHART })
    expect(shown('KUNDLI_CHART')).toBe(true)
  })
  it('tapping the active main tab keeps its sub-tab', () => {
    renderAt({ pathname: '/kundli', search: '?tab=birth_chart&sub=dasha', state: CHART })
    fireEvent.click(screen.getAllByRole('button', { name: /Birth Chart/ })[0])
    expect(lastSearch).toBe('?tab=birth_chart&sub=dasha')
  })
})

describe('Kundli main tab icons', () => {
  it('uses TabIcon SVGs (no img) and the download icon for Download', () => {
    const { container } = renderAt({ pathname: '/kundli', state: CHART })
    const tabs = screen.getAllByRole('button', { name: /Download/ })
    expect(tabs.length).toBeGreaterThan(0)
    for (const btn of tabs) {
      expect(btn.querySelector('img')).toBeNull()
      expect(btn.querySelector('svg polyline[points="7 10.5 12 15.5 17 10.5"]')).not.toBeNull()
    }
    expect(container.querySelector('nav img')).toBeNull()
  })
})
