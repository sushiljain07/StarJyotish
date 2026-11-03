// The refresh path from Phase 1: refresh tokens are single-use, so every
// refresh in a tab must share one request, a 409 (another tab won the race)
// gets one retry, and fetchWithAuth refreshes + retries once on a 401.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

let auth
beforeEach(async () => {
  vi.resetModules()               // fresh module state (in-flight promise, listener)
  vi.useFakeTimers({ shouldAdvanceTime: true })
  globalThis.fetch = vi.fn()
  auth = await import('./auth')
})
afterEach(() => {
  vi.useRealTimers()
})

const session = (token) => ({ access_token: token, user: { id: 'u1' } })

describe('refreshSession', () => {
  it('shares one in-flight request between concurrent callers', async () => {
    let resolve
    fetch.mockReturnValue(new Promise(r => { resolve = r }))
    const a = auth.refreshSession()
    const b = auth.refreshSession()
    resolve(jsonResponse(200, session('t1')))
    expect(await a).toEqual(session('t1'))
    expect(await b).toEqual(session('t1'))
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('starts a new request once the previous one settled', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(200, session('t1')))
         .mockResolvedValueOnce(jsonResponse(200, session('t2')))
    await auth.refreshSession()
    expect(await auth.refreshSession()).toEqual(session('t2'))
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('retries once on 409 (lost the cross-tab race)', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(409, { detail: 'in progress' }))
         .mockResolvedValueOnce(jsonResponse(200, session('t2')))
    expect(await auth.refreshSession()).toEqual(session('t2'))
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('does not retry a 401', async () => {
    fetch.mockResolvedValue(jsonResponse(401, { detail: 'expired' }))
    await expect(auth.refreshSession()).rejects.toMatchObject({ status: 401 })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('notifies the session listener (AuthContext) on success', async () => {
    const listener = vi.fn()
    auth.onSessionRefreshed(listener)
    fetch.mockResolvedValue(jsonResponse(200, session('t9')))
    await auth.refreshSession()
    expect(listener).toHaveBeenCalledWith(session('t9'))
  })
})

describe('fetchWithAuth', () => {
  it('refreshes and retries once with the new token on 401', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(401, {}))                 // original call
         .mockResolvedValueOnce(jsonResponse(200, session('fresh')))  // /auth/refresh
         .mockResolvedValueOnce(jsonResponse(200, { ok: 1 }))          // retry
    const resp = await auth.fetchWithAuth('/api/x', {}, 'stale')
    expect(resp.status).toBe(200)
    const [, , retry] = fetch.mock.calls
    expect(retry[0]).toContain('/api/x')
    expect(retry[1].headers.Authorization).toBe('Bearer fresh')
  })

  it('returns the original 401 when the refresh itself fails', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(401, {}))
         .mockResolvedValueOnce(jsonResponse(401, { detail: 'expired' }))
    const resp = await auth.fetchWithAuth('/api/x', {}, 'stale')
    expect(resp.status).toBe(401)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('does not refresh for anonymous calls', async () => {
    fetch.mockResolvedValue(jsonResponse(401, {}))
    await auth.fetchWithAuth('/api/x', {}, null)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('sends JSON bodies with a content type', async () => {
    fetch.mockResolvedValue(jsonResponse(200, {}))
    await auth.fetchWithAuth('/api/x', { method: 'POST', body: { a: 1 } }, 'tok')
    const [, init] = fetch.mock.calls[0]
    expect(init.body).toBe('{"a":1}')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.credentials).toBe('include')
  })
})
