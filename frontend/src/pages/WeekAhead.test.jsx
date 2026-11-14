import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
})
