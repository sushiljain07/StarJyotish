// Logout racing a refresh must stay logged out (I1), and a stale
// "unreachable" flag must not outlive a later sign-in or refresh (I2),
// and a retry must not blank the reconnect screen (R).
import { render, screen, act, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider, useAuth } from './AuthContext'

const ok = { access_token: 'tok', user: { id: 'u1', preferred_language: 'en' } }
const reply = (status, body = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
})

function Probe() {
  const { loading, isAuthenticated, sessionError, logout, loginWithPhone, retrySession } = useAuth()
  return (
    <div>
      <span data-testid="state">{`${loading}|${isAuthenticated}|${sessionError}`}</span>
      <button onClick={() => logout()}>out</button>
      <button onClick={() => loginWithPhone('9999900001', '123456').catch(() => {})}>in</button>
      <button onClick={() => retrySession()}>retry</button>
    </div>
  )
}

// The refresh promise is module-level in api/auth.js: never leave one
// hanging into the next test.
let pending = []
afterEach(async () => {
  pending.forEach(r => r(reply(401)))
  pending = []
  await Promise.resolve()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('logout racing a refresh', () => {
  it('a refresh that resolves after logout does not sign the user back in', async () => {
    let resolveRefresh
    const calls = []
    vi.stubGlobal('fetch', vi.fn((url) => {
      calls.push(url)
      if (url.endsWith('/api/auth/refresh')) return new Promise(r => { resolveRefresh = r; pending.push(r) })
      return Promise.resolve(reply(200, { logged_out: true }))
    }))
    render(<AuthProvider><Probe /></AuthProvider>)
    // Refresh (mount) is in flight; the user taps "log out".
    await act(async () => { fireEvent.click(screen.getByText('out')) })
    // Logout waits for the refresh to settle before revoking the cookie.
    expect(calls.filter(u => u.endsWith('/api/auth/logout'))).toHaveLength(0)
    await act(async () => { resolveRefresh(reply(200, ok)) })
    await act(async () => {})
    expect(calls.filter(u => u.endsWith('/api/auth/logout'))).toHaveLength(1)
    expect(screen.getByTestId('state').textContent).toBe('false|false|null')
  })
})

describe('sessionError is cleared', () => {
  it('a successful phone login after an unreachable mount clears the flag', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((url) => Promise.resolve(
      url.endsWith('/api/auth/otp/verify') ? reply(200, ok) : reply(503),
    )))
    render(<AuthProvider><Probe /></AuthProvider>)
    await act(() => vi.advanceTimersByTimeAsync(600 + 1800))
    expect(screen.getByTestId('state').textContent).toBe('false|false|unreachable')
    await act(async () => { fireEvent.click(screen.getByText('in')) })
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(screen.getByTestId('state').textContent).toBe('false|true|null')
  })

  it('retrySession keeps loading false and the flag set while it runs', async () => {
    vi.useFakeTimers()
    let resolveLast
    let n = 0
    vi.stubGlobal('fetch', vi.fn(() => {
      n += 1
      if (n <= 3) return Promise.resolve(reply(503))
      return new Promise(r => { resolveLast = r; pending.push(r) })
    }))
    render(<AuthProvider><Probe /></AuthProvider>)
    await act(() => vi.advanceTimersByTimeAsync(600 + 1800))
    await act(async () => { fireEvent.click(screen.getByText('retry')) })
    expect(screen.getByTestId('state').textContent).toBe('false|false|unreachable')
    await act(async () => { resolveLast(reply(200, ok)) })
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(screen.getByTestId('state').textContent).toBe('false|true|null')
  })
})
