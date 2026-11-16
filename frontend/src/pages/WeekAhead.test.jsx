import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '../i18n'

const hook = vi.hoisted(() => ({ value: null }))
vi.mock('../hooks/useCurrentLocation', () => ({ useCurrentLocation: () => hook.value }))
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../components/CelestialBackdrop', () => ({ default: () => null }))
vi.mock('../hooks/usePlaceMatches', () => ({
  usePlaceMatches: q => (q ? [{ display_name: 'Pune, India', lat: 18.5, lon: 73.8 }] : []),
}))
const week = vi.hoisted(() => ({ days: [{ date: '2026-11-14', tithi: { name: 'Pratipada' }, nakshatra: 'Ashwini' }] }))
vi.mock('../api/astro', () => ({
  fetchPanchangWeek: () => Promise.resolve({ days: week.days }),
}))
vi.mock('../services/astrologyProfiles', () => ({ getPrimaryProfile: () => ({ place: 'Jaipur, India' }) }))

import WeekAhead from './WeekAhead'
import LocationPrompt from '../components/home/LocationPrompt'

const renderIt = () => render(<MemoryRouter><WeekAhead /></MemoryRouter>)

describe('WeekAhead without a location', () => {
  let setManualLocation
  beforeEach(() => { setManualLocation = vi.fn() })

  it('shows the city picker when geolocation was denied', () => {
    hook.value = { location: null, status: 'denied', retryGeolocation: vi.fn(), setManualLocation }
    renderIt()
    expect(screen.getByPlaceholderText(/search city/i)).toBeTruthy()
    expect(screen.getByText('Jaipur, India')).toBeTruthy()
  })

  it('shows a loading state while requesting', () => {
    hook.value = { location: null, status: 'requesting', retryGeolocation: vi.fn(), setManualLocation }
    renderIt()
    expect(screen.getByRole('status').textContent).toMatch(/finding/i)
    expect(screen.queryByPlaceholderText(/search city/i)).toBeNull()
  })

  it('choosing a place calls setManualLocation', () => {
    hook.value = { location: null, status: 'denied', retryGeolocation: vi.fn(), setManualLocation }
    renderIt()
    fireEvent.change(screen.getByPlaceholderText(/search city/i), { target: { value: 'Pun' } })
    fireEvent.click(screen.getByText('Pune, India'))
    expect(setManualLocation).toHaveBeenCalledWith({ lat: 18.5, lon: 73.8, label: 'Pune, India' })
  })

  it('LocationPrompt (used by the home week beat) renders the same picker', () => {
    render(<LocationPrompt status="denied" birthPlace="Jaipur, India" onRetryGeolocation={() => {}} onSetManualLocation={setManualLocation} />)
    expect(screen.getByPlaceholderText(/search city/i)).toBeTruthy()
  })

  it('card labels: birth card offers device location and is hidden without a birth place', () => {
    const { rerender } = render(<LocationPrompt status="denied" birthPlace="Jaipur, India" onRetryGeolocation={() => {}} onSetManualLocation={() => {}} />)
    expect(screen.getByText(/device location/i)).toBeTruthy()
    rerender(<LocationPrompt status="denied" onRetryGeolocation={() => {}} onSetManualLocation={() => {}} />)
    expect(screen.queryByText(/device location/i)).toBeNull()
    expect(screen.queryByText(/chart cast for/i)).toBeNull()
  })
})

describe('WeekAhead with a location', () => {
  it('still renders the week and no prompt', async () => {
    hook.value = { location: { lat: 1, lon: 2, label: 'Pune' }, status: 'ready', retryGeolocation: vi.fn(), setManualLocation: vi.fn() }
    renderIt()
    await waitFor(() => expect(screen.getByText(/Pratipada/)).toBeTruthy())
    expect(screen.queryByPlaceholderText(/search city/i)).toBeNull()
  })
})

describe('WeekAhead layout', () => {
  const ONE_DAY = week.days
  afterEach(() => { week.days = ONE_DAY })

  it('keeps the narrow column below lg and widens to the frame at lg', async () => {
    hook.value = { location: { lat: 1, lon: 2, label: 'Pune' }, status: 'ready', retryGeolocation: vi.fn(), setManualLocation: vi.fn() }
    const { container } = renderIt()
    await waitFor(() => expect(screen.getByText(/Pratipada/)).toBeTruthy())
    const body = screen.getByText(/Pratipada/).closest('.max-w-2xl')
    expect(body).toBeTruthy()
    expect(body.classList.contains('lg:max-w-5xl')).toBe(true)
    expect(container.querySelector('.max-w-5xl')).toBeNull()
  })

  it('leaves no bottom divider under either card of the last row at lg', async () => {
    week.days = Array.from({ length: 7 }, (_, i) => ({ date: `2026-11-${14 + i}`, tithi: { name: `T${i}` }, nakshatra: 'Ashwini' }))
    hook.value = { location: { lat: 1, lon: 2, label: 'Pune' }, status: 'ready', retryGeolocation: vi.fn(), setManualLocation: vi.fn() }
    const { container } = renderIt()
    await waitFor(() => expect(screen.getByText(/T6/)).toBeTruthy())
    const cards = [...container.querySelector('.lg\\:grid-cols-2').children]
    expect(cards).toHaveLength(7)
    cards.forEach((card, i) => {
      // Below lg: one list, divider under every card but the last.
      expect(card.classList.contains('border-b')).toBe(true)
      expect(card.classList.contains('last:border-b-0')).toBe(true)
      // At lg: no bottom dividers; a top divider from the second row on.
      expect(card.classList.contains('lg:border-b-0')).toBe(true)
      expect(card.classList.contains('lg:border-t')).toBe(i >= 2)
    })
  })
})
