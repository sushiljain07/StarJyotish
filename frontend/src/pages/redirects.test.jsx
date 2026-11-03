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
      </Routes>
    </MemoryRouter>,
  )
}


function StateProbe({ label }) {
  return <div>{label} {JSON.stringify(useLocation().state)}</div>
}

beforeEach(() => {
  auth.isAuthenticated = false
  auth.user = null
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
