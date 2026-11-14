import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import { preloadKundliChunks, PRELOAD_TIMEOUT_MS } from '../test/preloadKundliChunks'

let mockAuthed = false
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: mockAuthed, user: mockAuthed ? { id: 1 } : null }),
}))
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

beforeAll(preloadKundliChunks, PRELOAD_TIMEOUT_MS)

let now
beforeEach(() => {
  window.scrollY = 0
  now = 1000
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 5000 })
})
afterEach(() => { mockAuthed = false; vi.restoreAllMocks(); delete document.documentElement.scrollHeight; window.scrollY = 0; sessionStorage.clear() })

describe('Kundli sticky chrome', () => {
  it('shows the main-tab row from md up only', () => {
    renderPage()
    const row = screen.getAllByRole('tab', { name: /Birth Chart/ })[0].parentElement
    expect(row.className).toContain('md:flex')
    expect(row.className).not.toContain('sm:flex')
  })

  it('on phones the chips start collapsed, the main-tab row is hidden and the sub-tabs stay', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(q => ({
      matches: q === '(max-width: 767px)', media: q,
      addEventListener: () => {}, removeEventListener: () => {},
    }))
    renderPage()
    expect(screen.getByTestId('summary-chips').className).toContain('max-h-0')
    const mainRow = screen.getAllByRole('tab', { name: /Birth Chart/ })[0].closest('[data-testid="kundli-main-tabs"]')
    expect(mainRow.className).toContain('hidden')
    expect(mainRow.className).toContain('md:block')
    const subRow = screen.getByRole('tab', { name: 'Dasha' }).closest('[data-testid="kundli-sub-tabs"]')
    expect(subRow.className).not.toMatch(/(^|\s)hidden(\s|$)/)
  })

  function phone() {
    vi.spyOn(window, 'matchMedia').mockImplementation(q => ({
      matches: q === '(max-width: 767px)', media: q,
      addEventListener: () => {}, removeEventListener: () => {},
    }))
  }

  it('on phones the collapsed chips are hidden from screen readers', () => {
    phone()
    renderPage()
    const chips = screen.getByTestId('summary-chips')
    expect(chips.getAttribute('aria-hidden')).toBe('true')
    expect(chips.hasAttribute('inert')).toBe(true)
    const toggle = screen.getByRole('button', { name: 'Chart summary' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(toggle.getAttribute('aria-controls')).toBe(chips.id)
    expect(toggle.className).toContain('min-h-11')
    expect(toggle.className).toContain('min-w-11')
    // Inline at the end of the sub-tab row, not a row of its own.
    expect(toggle.closest('[data-testid="kundli-sub-tabs"]')).not.toBeNull()
  })

  it('on phones tapping the toggle reveals the chips until tapped again', () => {
    phone()
    renderPage()
    const chips = screen.getByTestId('summary-chips')
    const toggle = screen.getByRole('button', { name: 'Chart summary' })
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(chips.hasAttribute('aria-hidden')).toBe(false)
    expect(chips.hasAttribute('inert')).toBe(false)
    expect(chips.className).not.toContain('max-h-0')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(chips.getAttribute('aria-hidden')).toBe('true')
  })

  it('on phones revealed chips close again on scroll down', () => {
    phone()
    renderPage()
    scrollTo(300)
    const chips = screen.getByTestId('summary-chips')
    const toggle = screen.getByRole('button', { name: 'Chart summary' })
    fireEvent.click(toggle)
    now += 400
    scrollTo(290)          // up: stays open
    expect(chips.hasAttribute('aria-hidden')).toBe(false)
    scrollTo(340)          // down: closes
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(chips.className).toContain('max-h-0')
  })

  it('on laptops there is no chips toggle and the chips are announced', () => {
    renderPage()
    expect(screen.queryByRole('button', { name: 'Chart summary' })).toBeNull()
    expect(screen.getByTestId('summary-chips').hasAttribute('aria-hidden')).toBe(false)
    expect(screen.getByTestId('summary-chips').hasAttribute('inert')).toBe(false)
  })

  it('on laptops the chips start expanded', () => {
    renderPage()
    expect(screen.getByTestId('summary-chips').className).not.toContain('max-h-0')
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

  it('the band sits under the header and follows it up when the header hides', () => {
    renderPage()
    const band = screen.getByTestId('summary-chips').closest('.sticky')
    expect(band.className).toContain('top-[var(--header-offset)]')
    expect(band.className).not.toContain('top-[60px]')
    expect(band.className).toContain('motion-safe:transition-[top]')
  })

  it('signed in, the section bar owns the true bottom edge (not raised)', () => {
    mockAuthed = true
    renderPage()
    const nav = screen.getAllByRole('navigation').find(n => n.className.includes('fixed'))
    expect(nav.className).toContain('bottom-0')
    expect(nav.style.bottom).toBe('')
    expect(nav.style.paddingBottom).toBe('var(--safe-bottom)')
  })
})
