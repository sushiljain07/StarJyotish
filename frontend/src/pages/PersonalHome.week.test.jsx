// "This week" must ask for a location instead of rendering an empty heading.
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import kundli from '../test/fixtures/kundli.json'
import transit from '../test/fixtures/transit.json'
import outlook from '../test/fixtures/outlook.json'
import panchang from '../test/fixtures/panchang.json'

const hook = vi.hoisted(() => ({ value: null }))
vi.mock('../hooks/useCurrentLocation', () => ({ useCurrentLocation: () => hook.value }))
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, accessToken: null }),
}))
vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../hooks/usePlaceSuggestions', () => ({ usePlaceSuggestions: () => [] }))
vi.mock('../hooks/usePlaceMatches', () => ({ usePlaceMatches: () => [] }))
vi.mock('../services/astrologyProfiles', async importOriginal => {
  const actual = await importOriginal()
  const profile = {
    id: 'p1', label: 'Asha Verma', birth_date: '1990-08-16', birth_time: '19:05',
    place: 'New Delhi, India', is_primary: true, chart: kundli,
  }
  return { ...actual, loadProfiles: async () => [profile], getPrimaryProfile: () => profile, listProfiles: () => [profile] }
})
vi.mock('../hooks/useDailyEditor', () => ({
  useDailyEditor: () => ({ edition: { headline: 'x', variation: 0, cards: [] }, requestRefresh: () => {} }),
}))

import PersonalHome from './PersonalHome'

beforeEach(async () => {
  const ctx = new Proxy({}, { get: (_t, k) => (k === 'canvas' ? {} : () => ({ addColorStop() {} })), set: () => true })
  vi.stubGlobal('matchMedia', () => ({
    matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx)
  Element.prototype.scrollIntoView = () => {}
  vi.stubGlobal('fetch', vi.fn(async url => {
    const u = String(url)
    const body = u.includes('/kundli/transit') ? transit : u.includes('/kundli/outlook') ? outlook
      : u.includes('/api/panchang') ? panchang : {}
    return { ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) }
  }))
  await i18n.changeLanguage('en')
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('PersonalHome "This week" without a location', () => {
  it('renders the city picker inside the week beat', async () => {
    hook.value = { location: null, status: 'denied', retryGeolocation: vi.fn(), setManualLocation: vi.fn() }
    const { container } = render(
      <MemoryRouter initialEntries={['/home']}><Routes><Route path="*" element={<PersonalHome />} /></Routes></MemoryRouter>,
    )
    await waitFor(() => expect(container.querySelector('#sj-week')).toBeTruthy())
    const beat = container.querySelector('#sj-week')
    expect(beat.querySelector('.sj-loc-grid')).toBeTruthy()
    expect(beat.querySelector('input')).toBeTruthy()
    expect(screen.getAllByText('New Delhi, India').length).toBeGreaterThan(0)
  })
})
