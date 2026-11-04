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
