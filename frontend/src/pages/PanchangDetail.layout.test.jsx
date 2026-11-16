import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '../i18n'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../hooks/useCurrentLocation', () => ({ useCurrentLocation: () => ({ location: null }) }))
vi.mock('../hooks/usePlaceMatches', () => ({ usePlaceMatches: q => (q ? [{ display_name: 'Pune, India', lat: 18.5, lon: 73.8, timezone: 'Asia/Kolkata' }] : []) }))
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

  const seed = extra => localStorage.setItem('sj_current_location_v1:anon', JSON.stringify({
    lat: 18.5, lon: 73.8, label: 'Pune', timezone: 'Asia/Kolkata', ...extra,
  }))
  const geo = fn => Object.defineProperty(navigator, 'geolocation', {
    configurable: true, value: { getCurrentPosition: fn },
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

  it('falls back to a stale geolocation fix when geolocation fails, instead of the prompt', async () => {
    seed({ source: 'geolocation', savedAt: Date.now() - 48 * 3600e3 })
    await renderIt()
    expect(screen.queryByPlaceholderText(/search city/i)).toBeNull()
  })

  it('a city picked while geolocation is pending is not overwritten when it later fails', async () => {
    seed({ label: 'Old Town', source: 'geolocation', savedAt: Date.now() - 48 * 3600e3 })
    let reject
    geo((_ok, fail) => { reject = fail })
    const { container } = render(<MemoryRouter><PanchangDetail /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText(/search city/i), { target: { value: 'Pun' } })
    fireEvent.click(screen.getByText('Pune, India'))
    await waitFor(() => expect(screen.getByText('Siddhi')).toBeTruthy())
    await act(async () => { reject(new Error('denied')) })
    expect(container.textContent).toContain('Pune, India')
    expect(container.textContent).not.toContain('Old Town')
  })

  it('a late geolocation success never replaces a picked city, in state or storage', async () => {
    seed({ label: 'Old Town', source: 'geolocation', savedAt: Date.now() - 48 * 3600e3 })
    let resolve
    geo(ok => { resolve = ok })
    const { container } = render(<MemoryRouter><PanchangDetail /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText(/search city/i), { target: { value: 'Pun' } })
    fireEvent.click(screen.getByText('Pune, India'))
    await waitFor(() => expect(screen.getByText('Siddhi')).toBeTruthy())
    await act(async () => { resolve({ coords: { latitude: 1, longitude: 2 } }) })
    expect(container.textContent).toContain('Pune, India')
    const stored = JSON.parse(localStorage.getItem('sj_current_location_v1:anon'))
    expect(stored.label).toBe('Pune, India')
    expect(stored.source).toBe('manual')
  })

  it('hero and content keep the narrow column below lg and use the frame from lg', async () => {
    const { container } = await renderIt()
    const hero = container.querySelector('.bg-night > .max-w-2xl')
    const content = container.querySelector('.flex-1.max-w-2xl')
    for (const el of [hero, content]) {
      expect(el).toBeTruthy()
      expect(el.classList.contains('lg:max-w-5xl')).toBe(true)
    }
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
