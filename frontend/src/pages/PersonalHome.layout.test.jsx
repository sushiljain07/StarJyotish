// Two-column /home from lg, plus the charts-carousel arrows.
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import kundli from '../test/fixtures/kundli.json'
import transit from '../test/fixtures/transit.json'
import outlook from '../test/fixtures/outlook.json'
import panchang from '../test/fixtures/panchang.json'
import ChartsStrip from '../components/home/ChartsStrip'

vi.mock('../hooks/useCurrentLocation', () => ({
  useCurrentLocation: () => ({ location: null, status: 'denied', retryGeolocation: vi.fn(), setManualLocation: vi.fn() }),
}))
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

async function renderHome() {
  const r = render(
    <MemoryRouter initialEntries={['/home']}><Routes><Route path="*" element={<PersonalHome />} /></Routes></MemoryRouter>,
  )
  await waitFor(() => expect(r.container.querySelector('#sj-week')).toBeTruthy())
  return r.container
}

describe('PersonalHome two-column layout', () => {
  it('uses the 5xl frame for the page and the masthead', async () => {
    const c = await renderHome()
    const body = c.querySelector('[data-main]').parentElement.parentElement
    expect(body.className).toContain('max-w-5xl')
    const masthead = c.querySelector('.relative.max-w-5xl:not(:has([data-main]))')
    expect(masthead).toBeTruthy()
  })

  it('is a grid with a 20rem rail from lg', async () => {
    const c = await renderHome()
    const grid = c.querySelector('[data-main]').parentElement
    expect(grid.className).toContain('lg:grid')
    expect(grid.className).toContain('lg:grid-cols-[minmax(0,1fr)_20rem]')
  })

  it('puts window, week and coming-up in the sticky rail', async () => {
    const c = await renderHome()
    const rail = c.querySelector('[data-rail]')
    expect(rail.className).toContain('lg:sticky')
    expect(rail.querySelector('#sj-window')).toBeTruthy()
    expect(rail.querySelector('#sj-week')).toBeTruthy()
    expect(rail.textContent).toContain(i18n.t('home_coming_up_label'))
    expect(c.querySelector('[data-main] #sj-window')).toBeNull()
    expect(rail.children.length).toBeGreaterThan(0)
  })

  it('keeps the phone order through order-N classes', async () => {
    const c = await renderHome()
    const beats = [...c.querySelectorAll('[data-main] > div, [data-rail] > div')]
    const ordered = beats
      .map(b => ({ b, n: Number((/order-(\d+)/.exec(b.className) || [])[1]) }))
      .sort((x, y) => x.n - y.n)
    expect(ordered.map(o => o.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(ordered.slice(0, 4).map(o => o.b.id)).toEqual(['sj-your-day', 'sj-window', 'sj-week', 'sj-charts'])
    for (const { b } of ordered) expect(b.className).toContain('lg:order-none')
  })
})

describe('ChartsStrip arrows', () => {
  function setup({ scrollLeft = 0 } = {}) {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(700)
    vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockReturnValue(scrollLeft)
    const scrollBy = vi.fn()
    HTMLElement.prototype.scrollBy = scrollBy
    const { container } = render(<MemoryRouter><ChartsStrip profile={null} /></MemoryRouter>)
    return { scrollBy, container }
  }

  it('shows only next at the start, and next scrolls 80% of the width', () => {
    const { scrollBy } = setup()
    expect(screen.queryByRole('button', { name: i18n.t('carousel_prev') })).toBeNull()
    const next = screen.getByRole('button', { name: i18n.t('carousel_next') })
    expect(next.className).toContain('hidden md:flex')
    fireEvent.click(next)
    expect(scrollBy).toHaveBeenCalledWith({ left: 240, behavior: 'smooth' })
  })

  it('shows only previous at the end', () => {
    setup({ scrollLeft: 400 })
    expect(screen.getByRole('button', { name: i18n.t('carousel_prev') })).toBeTruthy()
    expect(screen.queryByRole('button', { name: i18n.t('carousel_next') })).toBeNull()
  })

  it('updates the arrows when the scroller scrolls', () => {
    const { container } = setup()
    const scroller = container.querySelector('.overflow-x-auto')
    vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockReturnValue(200)
    fireEvent.scroll(scroller)
    expect(screen.getByRole('button', { name: i18n.t('carousel_prev') })).toBeTruthy()
    expect(screen.getByRole('button', { name: i18n.t('carousel_next') })).toBeTruthy()
  })
})
