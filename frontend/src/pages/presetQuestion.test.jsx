// A preset question (from the landing page's Ask spotlight) is sent once.
// Only the Kundli page's Ask entry carries it; the AI Insights card and the
// reading teaser pass just the chart. After AskChart sends it, /insights
// drops it from history state, so a reload or Back + Ask doesn't spend
// another free question on it.
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import en from '../i18n/en.json'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, loading: false, authedRequest: fn => fn(null) }),
}))
vi.mock('../components/Seo', () => ({ default: () => null }))
const { marker } = vi.hoisted(() => ({ marker: name => ({ default: () => name }) }))
vi.mock('../components/KundliChart', () => marker('KUNDLI_CHART'))
vi.mock('../components/PlanetTable', () => marker('PLANET_TABLE'))
vi.mock('../components/DashaTable', () => marker('DASHA_TABLE'))
vi.mock('../components/KPChart', () => marker('KP_CHART'))
vi.mock('../components/DivisionalCharts', () => marker('DIVISIONAL'))
vi.mock('../components/TransitPanel', () => marker('TRANSIT'))
vi.mock('../components/KundliDownload', () => marker('DOWNLOAD'))
vi.mock('../components/BhavaChalit', () => marker('BHAVA'))
vi.mock('../components/AshtakavargaTable', () => marker('ASHTAKAVARGA'))
vi.mock('../components/SarvatobhadraChakra', () => marker('SARVATOBHADRA'))
vi.mock('../components/ChartReading', () => marker('READING'))

import Result from './Result'
import Insights from './Insights'

const CHART = {
  data: { planets: [], ascendant: { sign: 'Virgo' }, navamsa_planets: [], navamsa_ascendant: { sign: 'Leo' },
          dasha: { current_mahadasha: { planet: 'Jupiter' } } },
  input: { name: 'Asha', date: '1990-08-16', time: '19:05', place: 'Delhi, India' },
}

let loc, nav
function Probe() { loc = useLocation(); nav = useNavigate(); return null }

let fetchMock
const askCalls = () => fetchMock.mock.calls.filter(([u]) => String(u).includes('/api/kundli/ask')).length

function renderApp() {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/kundli', state: { ...CHART, presetQuestion: 'Will I travel?' } }]}>
      <Routes>
        <Route path="/kundli" element={<><Result /><Probe /></>} />
        <Route path="/insights" element={<><Insights /><Probe /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ answer: 'Yes.', session_id: 's1' }), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.HTMLElement.prototype.scrollIntoView = () => {}
})
afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear() })

describe('presetQuestion is sent once', () => {
  it('the AI Insights card and the reading teaser pass only the chart', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(en.kundli_insights_title) }))
    expect(loc.pathname).toBe('/insights')
    expect(Object.keys(loc.state).sort()).toEqual(['data', 'input'])
    act(() => nav(-1))
    fireEvent.click(screen.getByRole('button', { name: new RegExp(en.teaser_reveal) }))
    expect(loc.pathname).toBe('/insights')
    expect(Object.keys(loc.state).sort()).toEqual(['data', 'input'])
    expect(askCalls()).toBe(0)
  })

  it('Ask sends it once, then it is gone from both history entries', async () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(en.kundli_ask_title) }))
    expect(loc.search).toBe('?sub=ask')
    await screen.findByText('Yes.')
    expect(askCalls()).toBe(1)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).question).toBe('Will I travel?')
    // This /insights entry no longer carries it: a reload would not resend.
    await waitFor(() => expect(loc.state.presetQuestion).toBeUndefined())
    expect(loc.state.input).toEqual(CHART.input)
    expect(loc.search).toBe('?sub=ask')

    // Back to /kundli: its entry dropped it too, so Ask again sends nothing.
    act(() => nav(-1))
    expect(loc.pathname).toBe('/kundli')
    expect(loc.state.presetQuestion).toBeUndefined()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(en.kundli_ask_title) }))
    await screen.findByRole('textbox')
    await act(async () => { await new Promise(r => setTimeout(r, 30)) })
    expect(askCalls()).toBe(1)
  })
})
