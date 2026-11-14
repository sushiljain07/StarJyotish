// Analysis panels fetch when first opened, not on every /kundli load, and
// keep their data across tab switches. A 429 gets one retry.
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false, user: null }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../components/KundliChart', () => ({ default: () => null }))
vi.mock('../components/DashaTable', () => ({ default: () => null }))
vi.mock('../components/PlanetTable', () => ({ default: () => null }))
vi.mock('../components/DivisionalCharts', () => ({ default: () => null }))
vi.mock('../components/KundliDownload', () => ({ default: () => null }))
vi.mock('../components/SarvatobhadraChakra', () => ({ default: () => null }))

import Result from './Result'

const mk = date => ({
  data: { planets: [], ascendant: { sign: 'Virgo' }, navamsa_planets: [], navamsa_ascendant: { sign: 'Leo' },
          dasha: { current_mahadasha: { planet: 'Jupiter' } } },
  input: { name: 'Asha', date, time: '19:05', place: 'Delhi, India' },
})
const CHART = mk('1990-08-16')

const AV = { sarvashtakavarga: [{ points: 28 }], bhinnashtakavarga: {} }
const BHAVA = { ascendant: { sign: 'Virgo', degree: 5 }, planets: [], houses: [] }
const bodyFor = url => (String(url).includes('/bhava-chalit') ? BHAVA : AV)
let fetchMock
const calls = part => fetchMock.mock.calls.filter(([url]) => String(url).includes(part))

function Jump({ to }) {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/kundli?tab=analysis&sub=ashtakavarga', { state: to })}>go</button>
}

function renderAt(search, extra = null) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/kundli', search, state: CHART }]}>
      <Routes><Route path="/kundli" element={<><Result />{extra}</>} /></Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  sessionStorage.clear()
  fetchMock = vi.fn(async url => ({ ok: true, status: 200, json: async () => bodyFor(url) }))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => { sessionStorage.clear(); vi.unstubAllGlobals() })

describe('lazy kundli analysis panels', () => {
  it('fetches nothing for hidden tabs on the chart tab', async () => {
    renderAt('?tab=birth_chart&sub=chart')
    await screen.findAllByRole('tab')
    await new Promise(r => setTimeout(r, 50))
    expect(calls('/ashtakavarga')).toHaveLength(0)
    expect(calls('/bhava-chalit')).toHaveLength(0)
    expect(calls('/transit')).toHaveLength(0)
  })

  it('fetches ashtakavarga once on opening and not again on switching back', async () => {
    renderAt('?tab=analysis&sub=bhava')
    await waitFor(() => expect(calls('/bhava-chalit')).toHaveLength(1))
    expect(calls('/ashtakavarga')).toHaveLength(0)
    const tab = () => screen.getAllByRole('tab').find(el => /ashtakavarga/i.test(el.textContent))
    fireEvent.click(tab())
    await waitFor(() => expect(calls('/ashtakavarga')).toHaveLength(1))
    fireEvent.click(screen.getAllByRole('tab').find(el => /bhava/i.test(el.textContent) && el !== tab()))
    fireEvent.click(tab())
    await new Promise(r => setTimeout(r, 50))
    expect(calls('/ashtakavarga')).toHaveLength(1)
    expect(calls('/bhava-chalit')).toHaveLength(1)
  })

  it('retries once after a 429 and then shows the data, not the error', async () => {
    let n = 0
    fetchMock.mockImplementation(async () => (++n === 1
      ? { ok: false, status: 429, json: async () => ({ detail: 'slow down' }) }
      : { ok: true, status: 200, json: async () => AV }))
    renderAt('?tab=analysis&sub=ashtakavarga')
    await waitFor(() => expect(calls('/ashtakavarga')).toHaveLength(2), { timeout: 4000 })
    await waitFor(() => expect(screen.queryByText(/⚠️/)).toBeNull())
    expect(n).toBe(2)
  }, 8000)

  it('loads the new chart data when a different chart arrives', async () => {
    renderAt('?tab=analysis&sub=ashtakavarga', <Jump to={mk('2000-01-01')} />)
    await waitFor(() => expect(calls('/ashtakavarga')).toHaveLength(1))
    fireEvent.click(screen.getByText('go'))
    await waitFor(() => expect(calls('/ashtakavarga')).toHaveLength(2))
    expect(JSON.parse(calls('/ashtakavarga')[1][1].body).date).toBe('2000-01-01')
  })
})
