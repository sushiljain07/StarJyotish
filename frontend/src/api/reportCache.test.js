// Reports are slow, paid LLM calls. The same chart + language must not be
// generated twice in a session, but Regenerate must always reach the server.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchReport, peekReport, readingBody } from './reportCache'

const ok = body => new Response(JSON.stringify(body), { status: 200 })
const INPUT = { date: '1990-08-16', time: '19:05', place: 'Delhi' }

let fetchMock
beforeEach(() => {
  fetchMock = vi.fn(() => Promise.resolve(ok({ n: fetchMock.mock.calls.length })))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); sessionStorage.clear() })

describe('fetchReport', () => {
  it('serves a repeat request from the cache', async () => {
    const a = await fetchReport('/api/x', readingBody(INPUT, 'en'))
    const b = await fetchReport('/api/x', readingBody(INPUT, 'en'))
    expect(b).toEqual(a)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('ignores key order in the body', async () => {
    await fetchReport('/api/x', { a: 1, b: 2 })
    await fetchReport('/api/x', { b: 2, a: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('caches each language separately', async () => {
    await fetchReport('/api/x', readingBody(INPUT, 'en'))
    await fetchReport('/api/x', readingBody(INPUT, 'hi'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).language).toBe('hi')
  })

  it('force skips the cache', async () => {
    await fetchReport('/api/x', { a: 1 })
    await fetchReport('/api/x', { a: 1 }, { force: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not cache errors', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"detail":"busy"}', { status: 503 }))
    await expect(fetchReport('/api/x', { a: 1 })).rejects.toMatchObject({ status: 503 })
    await fetchReport('/api/x', { a: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('works when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    await expect(fetchReport('/api/x', { a: 1 })).resolves.toEqual({ n: 1 })
    expect(peekReport('/api/x', { a: 1 })).toBeNull()
  })

  it('peekReport reads the cache without calling the network', async () => {
    expect(peekReport('/api/x', { a: 1 })).toBeNull()
    await fetchReport('/api/x', { a: 1 })
    expect(peekReport('/api/x', { a: 1 })).toEqual({ n: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
