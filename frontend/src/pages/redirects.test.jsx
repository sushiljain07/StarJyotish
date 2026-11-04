// Pages that bail out when opened without the router state they need
// (bookmark, refresh, direct link) must actually redirect. They used to call
// navigate() during render, which React Router ignores (it only works after
// mount), leaving a blank page.
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const auth = { isAuthenticated: false, user: null }
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: k => k, i18n: { language: 'en', changeLanguage: () => {} } }),
}))
vi.mock('../components/Seo', () => ({ default: () => null }))
// Chart widgets need a full chart payload; these tests are about routing.
vi.mock('../components/KundliChart', () => ({ default: () => null }))
vi.mock('../components/PlanetTable', () => ({ default: () => null }))
vi.mock('../components/DashaTable', () => ({ default: () => null }))

function renderAt(path, element, { state } = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Routes>
        <Route path={path} element={element} />
        <Route path="/" element={<div>LANDING</div>} />
        <Route path="/home" element={<div>HOME</div>} />
        <Route path="/admin" element={<div>ADMIN</div>} />
        <Route path="/blog" element={<div>BLOG LIST</div>} />
        <Route path="/generate" element={<StateProbe label="GENERATE" />} />
        <Route path="/insights" element={<SearchProbe label="INSIGHTS" />} />
      </Routes>
    </MemoryRouter>,
  )
}


function SearchProbe({ label }) {
  return <div>{label} {useLocation().search}</div>
}

function StateProbe({ label }) {
  return <div>{label} {JSON.stringify(useLocation().state)}</div>
}

beforeEach(() => {
  auth.isAuthenticated = false
  auth.user = null
})

describe('state-less pages rebuild from the last chart', () => {
  const LAST = {
    data: { planets: [], ascendant: { sign: 'Virgo' }, navamsa_planets: [], navamsa_ascendant: { sign: 'Leo' },
            dasha: { current_mahadasha: { planet: 'Jupiter' }, mahadashas: [] } },
    input: { name: 'Asha', date: '1990-08-16', time: '19:05', place: 'Delhi, India' },
  }
  it.each([
    ['/kundli', () => import('./Result'), /Lagna: Virgo/],
    ['/insights', () => import('./Insights'), /Insights/],
    ['/ask', () => import('./AskPage'), /Ask Your Chart/],
  ])('%s with a saved last chart renders instead of redirecting', async (path, load, marker) => {
    const { saveLastChart } = await import('../services/lastChart')
    saveLastChart(LAST)
    const { default: Page } = await load()
    renderAt(path, <Page />)
    expect(await screen.findByText(marker)).toBeInTheDocument()
    expect(screen.queryByText('LANDING')).toBeNull()
    sessionStorage.clear()
  })
})

describe('state-less pages redirect home', () => {
  it.each([
    ['/kundli', () => import('./Result')],
    ['/insights', () => import('./Insights')],
    ['/ask', () => import('./AskPage')],
  ])('%s without state → landing (signed out)', async (path, load) => {
    const { default: Page } = await load()
    renderAt(path, <Page />)
    expect(await screen.findByText('LANDING')).toBeInTheDocument()
  })

  it('/ask without state → /home (signed in)', async () => {
    auth.isAuthenticated = true
    const { default: AskPage } = await import('./AskPage')
    renderAt('/ask', <AskPage />)
    expect(await screen.findByText('HOME')).toBeInTheDocument()
  })
})

describe('Login', () => {
  it('redirects an already signed-in admin', async () => {
    auth.isAuthenticated = true
    auth.user = { role: 'admin' }
    const { default: Login } = await import('./Login')
    renderAt('/login', <Login />)
    expect(await screen.findByText('ADMIN')).toBeInTheDocument()
  })

  it('keeps the rest of the router state when forwarding to `next`', async () => {
    auth.isAuthenticated = true
    auth.user = { role: 'user' }
    const { default: Login } = await import('./Login')
    renderAt('/login', <Login />, { state: { next: '/generate', topic: 'career', presetQuestion: 'When?' } })
    expect(await screen.findByText('GENERATE {"topic":"career","presetQuestion":"When?"}')).toBeInTheDocument()
  })
})

describe('/career-report (retired page)', () => {
  it('sends signed-out visitors to /generate for the career topic', async () => {
    const { default: CareerReportRedirect } = await import('./CareerReportRedirect')
    render(
      <MemoryRouter initialEntries={['/career-report']}>
        <Routes>
          <Route path="/career-report" element={<CareerReportRedirect />} />
          <Route path="/generate" element={<SearchProbe label="GENERATE" />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText('GENERATE ?topic=career')).toBeInTheDocument()
  })

  it('sends signed-in users to Insights › Career', async () => {
    auth.isAuthenticated = true
    const { default: CareerReportRedirect } = await import('./CareerReportRedirect')
    renderAt('/career-report', <CareerReportRedirect />)
    expect(await screen.findByText('INSIGHTS ?topic=career&sub=career')).toBeInTheDocument()
  })
})

describe('/generate?topic=', () => {
  it('reads the topic from the query string', async () => {
    const { default: Home } = await import('./Home')
    render(
      <MemoryRouter initialEntries={['/generate?topic=career']}>
        <Routes><Route path="/generate" element={<Home />} /></Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText(/landing_topic_career_label/)).toBeInTheDocument()
  })
})
