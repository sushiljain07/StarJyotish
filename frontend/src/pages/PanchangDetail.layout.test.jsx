import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '../i18n'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../hooks/useCurrentLocation', () => ({ useCurrentLocation: () => ({ location: null }) }))
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

describe('PanchangDetail layout and location', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('sj_current_location_v1:anon', JSON.stringify({
      lat: 18.5, lon: 73.8, label: 'Pune', timezone: 'Asia/Kolkata', source: 'manual',
      savedAt: Date.now() - 48 * 3600e3,
    }))
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: (_ok, fail) => fail(new Error('denied')) },
    })
  })

  async function renderIt() {
    const utils = render(<MemoryRouter><PanchangDetail /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Siddhi')).toBeTruthy())
    return utils
  }

  it('falls back to a stale saved city when geolocation fails, instead of the prompt', async () => {
    await renderIt()
    expect(screen.queryByPlaceholderText(/search city/i)).toBeNull()
  })

  it('hero and content use the frame, not the narrow column', async () => {
    const { container } = await renderIt()
    expect(container.querySelector('.bg-night .max-w-5xl')).toBeTruthy()
    expect(container.querySelector('.flex-1.max-w-5xl')).toBeTruthy()
    expect(container.querySelector('.max-w-2xl')).toBeNull()
  })

  it('Today sections sit in two columns at lg', async () => {
    const { container } = await renderIt()
    expect(container.querySelector('.lg\\:grid-cols-2.gap-6')).toBeTruthy()
  })

  it('has no 10px text', async () => {
    const { container } = await renderIt()
    expect(container.innerHTML).not.toContain('text-[10px]')
  })
})
