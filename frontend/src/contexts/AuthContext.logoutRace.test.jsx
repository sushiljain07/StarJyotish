// F4: a refresh that starts while the logout request is in flight must not
// sign the user back in, so logout bumps the logout generation again once
// the logout call has returned.
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const calls = []
let resolveLogout
vi.mock('../api/auth', () => ({
  verifyOtp: vi.fn(), loginWithGoogle: vi.fn(),
  refreshSession: vi.fn(() => Promise.reject(new Error('no session'))),
  onSessionRefreshed: () => () => {},
  awaitRefreshSettled: () => Promise.resolve(),
  markLoggedOut: () => { calls.push('markLoggedOut') },
  logout: vi.fn(() => { calls.push('apiLogout:start'); return new Promise(r => { resolveLogout = () => { calls.push('apiLogout:done'); r() } }) }),
  updateProfile: vi.fn(), sendPhoneLinkOtp: vi.fn(), verifyPhoneLinkOtp: vi.fn(),
  sendEmailLinkOtp: vi.fn(), verifyEmailLinkOtp: vi.fn(),
}))

import { AuthProvider, useAuth } from './AuthContext'

function LogoutButton() {
  const { logout } = useAuth()
  return <button onClick={logout}>out</button>
}

describe('logout race', () => {
  it('marks the tab logged out again after the logout call returns', async () => {
    render(<AuthProvider><LogoutButton /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'out' }))
    await waitFor(() => expect(calls).toContain('apiLogout:start'))
    expect(calls).toEqual(['markLoggedOut', 'apiLogout:start'])
    resolveLogout()
    await waitFor(() => expect(calls).toEqual(['markLoggedOut', 'apiLogout:start', 'apiLogout:done', 'markLoggedOut']))
  })
})
