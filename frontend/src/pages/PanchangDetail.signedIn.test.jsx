import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '../i18n'

// Signed in, with the REAL useCurrentLocation hook, so "Use my location"
// goes through the same path a signed-in person's tap does.
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('../services/astrologyProfiles', () => ({ getPrimaryProfile: () => null }))
vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../hooks/usePlaceMatches', () => ({ usePlaceMatches: () => [] }))
vi.mock('../hooks/usePanchang', () => ({
  usePanchang: () => ({
    loading: false, error: false,
    data: {
      date: '2026-11-14', timezone: 'Asia/Kolkata', masa: 'Kartika',
      tithi: { name: 'Pratipada', paksha: 'Shukla', ends_at: '10:00' },
      nakshatra: { name: 'Ashwini', ends_at: '11:00' },
      yoga: 'Siddhi', karana: 'Bava', sunrise: '06:00', sunset: '17:30',
      muhurtas: { rahu_kaal: { start: '09:00', end: '10:30' } },
    },
  }),
}))
vi.mock('../api/astro', () => ({
  fetchPanchangWeek: () => Promise.resolve({ days: [] }),
  fetchPanchangHinduMonth: () => Promise.resolve({ days: [] }),
}))

import PanchangDetail from './PanchangDetail'

const geo = fn => Object.defineProperty(navigator, 'geolocation', {
  configurable: true, value: { getCurrentPosition: fn },
})

describe('PanchangDetail signed in: Use my location', () => {
  beforeEach(() => localStorage.clear())

  it('saves the device fix under the user key as geolocation and never writes :anon', async () => {
    geo((_ok, fail) => fail(new Error('denied'))) // automatic attempt on load fails
    render(<MemoryRouter><PanchangDetail /></MemoryRouter>)
    const button = await screen.findByText(/use my current location/i)
    geo(ok => ok({ coords: { latitude: 12.9, longitude: 77.6 } }))
    fireEvent.click(button)
    await waitFor(() => expect(screen.getByText('Siddhi')).toBeTruthy())
    const stored = JSON.parse(localStorage.getItem('sj_current_location_v1:u1'))
    expect(stored.lat).toBe(12.9)
    expect(stored.source).toBe('geolocation')
    expect(localStorage.getItem('sj_current_location_v1:anon')).toBeNull()
  })
})
