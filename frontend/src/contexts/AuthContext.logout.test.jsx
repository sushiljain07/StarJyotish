// Signing out must not leave this person's chart or readings in the tab
// for the next person on a shared device.
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/auth', () => ({
  verifyOtp: vi.fn(), loginWithGoogle: vi.fn(),
  refreshSession: vi.fn(() => Promise.reject(new Error('no session'))),
  onSessionRefreshed: () => () => {},
  logout: vi.fn(() => Promise.resolve()),
  updateProfile: vi.fn(), sendPhoneLinkOtp: vi.fn(), verifyPhoneLinkOtp: vi.fn(),
  sendEmailLinkOtp: vi.fn(), verifyEmailLinkOtp: vi.fn(),
}))

import { AuthProvider, useAuth } from './AuthContext'

function LogoutButton() {
  const { logout } = useAuth()
  return <button onClick={logout}>out</button>
}

describe('logout', () => {
  it('clears the session chart and cached reports, and nothing else', async () => {
    sessionStorage.setItem('sj_last_chart', '{"data":{},"input":{}}')
    sessionStorage.setItem('sj_report:/api/kundli/reading:{}', '{}')
    sessionStorage.setItem('unrelated', 'keep')
    render(<AuthProvider><LogoutButton /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'out' }))
    await waitFor(() => expect(sessionStorage.getItem('sj_last_chart')).toBeNull())
    expect(sessionStorage.getItem('sj_report:/api/kundli/reading:{}')).toBeNull()
    expect(sessionStorage.getItem('unrelated')).toBe('keep')
  })
})
