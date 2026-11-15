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

const mq = vi.hoisted(() => ({ lg: false }))
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
  mq.lg = false
  vi.stubGlobal('matchMedia', q => ({
    matches: String(q).includes('min-width: 1024px') ? mq.lg : false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
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

const BEAT_TITLES = [
  'home_right_now_label', 'home_window_label', 'home_week_strip_label', 'home_charts_strip_label',
  'home_your_reports_label', 'home_coming_up_label', 'home_sky_remembers_label', 'home_one_idea_label',
]

describe('PersonalHome below lg', () => {
  it('renders one flat list of beats in the original order, with no rail', async () => {
    const c = await renderHome()
    expect(c.querySelector('[data-rail]')).toBeNull()
    expect(c.querySelector('[data-main]')).toBeNull()
    const titles = [...c.querySelectorAll('h2')].map(h => h.textContent)
    const expected = BEAT_TITLES.map(k => i18n.t(k))
    const idx = expected.map(e => titles.indexOf(e))
    expect(idx.every(i => i >= 0)).toBe(true)
    expect([...idx].sort((x, y) => x - y)).toEqual(idx)
    expect(c.querySelector('.lg\\:grid')).toBeNull()
  })

  it('keeps the narrow column below lg and widens to the 5xl frame only at lg', async () => {
    const c = await renderHome()
    const body = c.querySelector('#sj-week').closest('.max-w-2xl')
    expect(body).toBeTruthy()
    expect(body.className).toContain('lg:max-w-5xl')
  })
})

describe('PersonalHome from lg', () => {
  it('is a grid with a 20rem rail', async () => {
    mq.lg = true
    const c = await renderHome()
    const grid = c.querySelector('[data-main]').parentElement
    expect(grid.className).toContain('lg:grid')
    expect(grid.className).toContain('lg:grid-cols-[minmax(0,1fr)_20rem]')
  })

  it('puts window, week and coming-up in the rail, the rest in the main column', async () => {
    mq.lg = true
    const c = await renderHome()
    const rail = c.querySelector('[data-rail]')
    const main = c.querySelector('[data-main]')
    expect(rail.className).not.toContain('sticky')
    expect(rail.querySelector('#sj-window')).toBeTruthy()
    expect(rail.querySelector('#sj-week')).toBeTruthy()
    expect(rail.textContent).toContain(i18n.t('home_coming_up_label'))
    expect(main.querySelector('#sj-your-day')).toBeTruthy()
    expect(main.querySelector('#sj-charts')).toBeTruthy()
    expect(main.querySelector('#sj-window')).toBeNull()
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
    expect(screen.getByRole('button', { name: i18n.t('carousel_prev') }).disabled).toBe(true)
    const next = screen.getByRole('button', { name: i18n.t('carousel_next') })
    expect(next.disabled).toBe(false)
    expect(next.className).toContain('hidden md:flex')
    fireEvent.click(next)
    expect(scrollBy).toHaveBeenCalledWith({ left: 240, behavior: 'smooth' })
  })

  it('shows only previous at the end', () => {
    setup({ scrollLeft: 400 })
    expect(screen.getByRole('button', { name: i18n.t('carousel_prev') }).disabled).toBe(false)
    expect(screen.getByRole('button', { name: i18n.t('carousel_next') }).disabled).toBe(true)
  })

  it('updates the arrows when the scroller scrolls', () => {
    const { container } = setup()
    const scroller = container.querySelector('.overflow-x-auto')
    vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockReturnValue(200)
    fireEvent.scroll(scroller)
    expect(screen.getByRole('button', { name: i18n.t('carousel_prev') }).disabled).toBe(false)
    expect(screen.getByRole('button', { name: i18n.t('carousel_next') }).disabled).toBe(false)
  })
})
