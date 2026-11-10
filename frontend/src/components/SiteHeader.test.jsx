// Signing in from a page must come back to that page (with its chart),
// not drop the user on /home.
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import '../i18n'
import en from '../i18n/en.json'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false, user: null }) }))

import SiteHeader from './SiteHeader'

let loginState
function LoginProbe() { loginState = useLocation().state; return <div>LOGIN</div> }

function renderAt(entry) {
  loginState = 'unset'
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/login" element={<LoginProbe />} />
        <Route path="*" element={<SiteHeader />} />
      </Routes>
    </MemoryRouter>,
  )
  fireEvent.click(screen.getAllByRole('button', { name: en.nav_sign_in })[0])
}

describe('SiteHeader sign in', () => {
  it('passes the current page as next', async () => {
    renderAt('/kundli?tab=analysis')
    await screen.findByText('LOGIN')
    expect(loginState?.next).toBe('/kundli?tab=analysis')
  })

  it('passes no next from the landing page', async () => {
    renderAt('/')
    await screen.findByText('LOGIN')
    expect(loginState?.next).toBeUndefined()
  })
})

function PathProbe({ label }) { return <div>{label} {useLocation().pathname}</div> }

describe('SiteHeader signed-out links', () => {
  function renderHeader(props = {}) {
    render(
      <MemoryRouter initialEntries={['/panchang']}>
        <Routes>
          <Route path="/generate" element={<PathProbe label="AT" />} />
          <Route path="*" element={<SiteHeader {...props} />} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('the menu has Generate Kundli first, going to /generate', async () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: /menu/i }))
    const menu = screen.getAllByRole('navigation').at(-1)
    const first = menu.querySelector('button')
    expect(first.textContent).toBe(en.nav_cta_compact)
    fireEvent.click(first)
    expect(await screen.findByText('AT /generate')).toBeInTheDocument()
  })

  it('the desktop header shows Generate Kundli, Panchang and Explore', () => {
    renderHeader()
    const desktop = screen.getAllByRole('navigation')[0]
    expect([...desktop.querySelectorAll('button')].map(b => b.textContent))
      .toEqual([en.nav_cta_compact, en.nav_panchang_tab, en.nav_explore])
  })

  it('the desktop header drops its Generate Kundli link when the page has the CTA pill', () => {
    renderHeader({ onCtaClick: vi.fn() })
    const desktop = screen.getAllByRole('navigation')[0]
    expect([...desktop.querySelectorAll('button')].map(b => b.textContent))
      .toEqual([en.nav_panchang_tab, en.nav_explore])
  })
})
