// The Sarvatobhadra grid scrolls sideways on phones. It must mount when its
// sub-tab is first opened (not inside a display:none tab), so ScrollHint
// measures a real width and shows its fade.
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false, user: null }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../components/KundliChart', () => ({ default: () => null }))
vi.mock('../components/DashaTable', () => ({ default: () => null }))
vi.mock('../components/PlanetTable', () => ({ default: () => null }))
vi.mock('../components/DivisionalCharts', () => ({ default: () => null }))
vi.mock('../components/KundliDownload', () => ({ default: () => null }))

import Result from './Result'

const CHART = {
  data: { planets: [], ascendant: { sign: 'Virgo' }, navamsa_planets: [], navamsa_ascendant: { sign: 'Leo' },
          dasha: { current_mahadasha: { planet: 'Jupiter' } } },
  input: { name: 'Asha', date: '1990-08-16', time: '19:05', place: 'Delhi, India' },
}

// jsdom has no layout. A 360px phone: the grid's scroller is 328 wide and its
// content 560; anything inside a display:none (`.hidden`) tab measures 0.
const dims = {
  scrollWidth() { return this.closest('.hidden') ? 0 : this.querySelector('.min-w-\\[560px\\]') ? 560 : 0 },
  clientWidth() { return this.closest('.hidden') ? 0 : this.querySelector('.min-w-\\[560px\\]') ? 328 : 0 },
}

beforeEach(() => {
  for (const k of Object.keys(dims)) {
    Object.defineProperty(HTMLElement.prototype, k, { configurable: true, get: dims[k] })
  }
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ascendant: { sign: 'Virgo', degree: 5 }, planets: [], houses: [] }) })))
})
afterEach(() => {
  // The real getters live on Element.prototype; drop the overrides.
  for (const k of Object.keys(dims)) delete HTMLElement.prototype[k]
  vi.unstubAllGlobals()
})

describe('Sarvatobhadra sub-tab', () => {
  it('mounts on first open and shows the scroll fade at phone width', async () => {
    // Resolve the lazy chunk first, so "not mounted" below is not just "still loading".
    await import('../components/SarvatobhadraChakra')
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/kundli', search: '?tab=analysis&sub=bhava', state: CHART }]}>
        <Routes><Route path="/kundli" element={<Result />} /></Routes>
      </MemoryRouter>,
    )
    await screen.findAllByRole('tab')
    await new Promise(r => setTimeout(r, 50))
    expect(container.querySelector('.min-w-\\[560px\\]')).toBeNull() // not mounted while hidden
    fireEvent.click(screen.getAllByRole('tab').find(el => /sarvatobhadra/i.test(el.textContent)))
    await waitFor(() => expect(container.querySelector('.min-w-\\[560px\\]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[data-scroll-fade]')).not.toBeNull())
  })
})
