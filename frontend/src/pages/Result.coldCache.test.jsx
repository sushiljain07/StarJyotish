// A signed-in person opening /kundli on a new device or from a shared link
// has nothing cached locally. The page must fetch their profile, not bounce
// them to /home.
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import '../i18n'
import { preloadKundliChunks, PRELOAD_TIMEOUT_MS } from '../test/preloadKundliChunks'

const auth = vi.hoisted(() => ({ value: {} }))
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => auth.value }))
vi.mock('../components/Seo', () => ({ default: () => null }))
const { marker } = vi.hoisted(() => ({ marker: name => ({ default: () => name }) }))
vi.mock('../components/KundliChart', () => marker('KUNDLI_CHART'))
vi.mock('../components/PlanetTable', () => marker('PLANET_TABLE'))
vi.mock('../components/DashaTable', () => marker('DASHA_TABLE'))

import Result from './Result'

const DATA = { planets: [], ascendant: { sign: 'Virgo' }, navamsa_planets: [], navamsa_ascendant: { sign: 'Leo' },
               dasha: { current_mahadasha: { planet: 'Jupiter' } } }
const PROFILE = { id: 7, label: 'Asha', birth_date: '1990-08-16', birth_time: '19:05:00', place: 'Delhi, India', is_primary: true }
const json = body => ({ ok: true, status: 200, json: () => Promise.resolve(body) })

function renderKundli() {
  return render(
    <MemoryRouter initialEntries={['/kundli']}>
      <Routes>
        <Route path="/kundli" element={<Result />} />
        <Route path="/home" element={<div>HOME_PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeAll(preloadKundliChunks, PRELOAD_TIMEOUT_MS)
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); sessionStorage.clear() })

describe('/kundli with a cold cache', () => {
  it('signed in, empty storage: loads the profile and renders the chart', async () => {
    auth.value = { isAuthenticated: true, loading: false, user: { id: 'u1' }, accessToken: 'tok' }
    vi.stubGlobal('fetch', vi.fn(url => Promise.resolve(
      String(url).endsWith('/api/account/birth-profiles/me') ? json([PROFILE]) : json(DATA),
    )))
    renderKundli()
    expect((await screen.findAllByText('KUNDLI_CHART', {}, { timeout: 4000 })).length).toBeGreaterThan(0)
    expect(screen.queryByText('HOME_PAGE')).toBeNull()
  })

  it('signed in with no profile: still goes to /home', async () => {
    auth.value = { isAuthenticated: true, loading: false, user: { id: 'u1' }, accessToken: 'tok' }
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(json([]))))
    renderKundli()
    expect(await screen.findByText('HOME_PAGE', {}, { timeout: 4000 })).toBeInTheDocument()
  })
})
