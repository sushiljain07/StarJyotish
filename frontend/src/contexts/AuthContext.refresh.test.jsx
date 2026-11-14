// A rate limit, a 5xx or a dropped connection on /auth/refresh is not a
// sign-out. Only a real 401/403 is.
import { render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { refreshSession } from '../api/auth'
import { AuthProvider, useAuth } from './AuthContext'

const ok = { access_token: 'tok', user: { id: 'u1', preferred_language: 'en' } }
const reply = (status, body = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
})

function Probe() {
  const { loading, isAuthenticated, sessionError, retrySession } = useAuth()
  return (
    <div>
      <span data-testid="state">{`${loading}|${isAuthenticated}|${sessionError}`}</span>
      <button onClick={retrySession}>retry</button>
    </div>
  )
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('refreshSession retries', () => {
  it('retries on 429 then resolves', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(reply(429))
      .mockResolvedValueOnce(reply(429))
      .mockResolvedValueOnce(reply(200, ok))
    vi.stubGlobal('fetch', fetchMock)
    const p = refreshSession()
    await vi.advanceTimersByTimeAsync(600 + 1800)
    await expect(p).resolves.toEqual(ok)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('rejects a 401 at once', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(401, { detail: 'Not authenticated' }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(refreshSession()).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('gives up after two retries on a network error', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetchMock)
    const p = refreshSession()
    const assertion = expect(p).rejects.toBeInstanceOf(TypeError)
    await vi.advanceTimersByTimeAsync(600 + 1800)
    await assertion
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})

describe('AuthProvider on mount', () => {
  it('flags unreachable after three 503s, without signing in', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(503)))
    render(<AuthProvider><Probe /></AuthProvider>)
    await act(() => vi.advanceTimersByTimeAsync(600 + 1800))
    expect(screen.getByTestId('state').textContent).toBe('false|false|unreachable')
  })

  it('a 401 at mount ends signed out within bounded time, no error flag', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(401))
    vi.stubGlobal('fetch', fetchMock)
    render(<AuthProvider><Probe /></AuthProvider>)
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(screen.getByTestId('state').textContent).toBe('false|false|null')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retrySession success clears the error and authenticates', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(reply(503)).mockResolvedValueOnce(reply(503)).mockResolvedValueOnce(reply(503))
      .mockResolvedValueOnce(reply(200, ok))
    vi.stubGlobal('fetch', fetchMock)
    render(<AuthProvider><Probe /></AuthProvider>)
    await act(() => vi.advanceTimersByTimeAsync(600 + 1800))
    expect(screen.getByTestId('state').textContent).toBe('false|false|unreachable')
    await act(async () => { screen.getByText('retry').click() })
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(screen.getByTestId('state').textContent).toBe('false|true|null')
  })
})
