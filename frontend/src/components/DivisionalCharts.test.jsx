import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '../i18n'
import DivisionalCharts from './DivisionalCharts'
import src from './DivisionalCharts.jsx?raw'
import bhava from './BhavaChalit.jsx?raw'

vi.mock('./KundliChart', () => ({
  default: ({ title, planets }) => <div data-testid="chart">{title}|{planets[0].name}</div>,
}))
vi.mock('./ChartHighlight', () => ({ default: () => null }))

const input = { date: '1990-01-01', time: '10:00', place: 'Delhi' }
const payload = name => ({ planets: [{ name }], ascendant: {} })
const ok = data => ({ ok: true, status: 200, json: async () => data })

function deferred() {
  let resolve
  const promise = new Promise(r => { resolve = r })
  return { promise, resolve }
}


beforeEach(() => { sessionStorage.clear() })
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

// Gallery rows contain the code in a span; click the row whose text ends with the code.
const openRow = code => {
  const row = screen.getAllByRole('button').find(b => b.textContent.includes(`· ${code}`))
  fireEvent.click(row)
}

describe('DivisionalCharts fetching', () => {
  it('switching chart while a request is in flight keeps the latest chart', async () => {
    const d9 = deferred()
    const d10 = deferred()
    vi.stubGlobal('fetch', vi.fn((url, opts) => {
      const p = url.includes('division=9') ? d9.promise : d10.promise
      return new Promise((resolve, reject) => {
        opts.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        p.then(resolve)
      })
    }))
    render(<DivisionalCharts input={input} />)
    openRow('D9')
    fireEvent.click(screen.getByText(/Life Areas/))
    openRow('D10')
    d10.resolve(ok(payload('Ten')))
    await waitFor(() => expect(screen.getByTestId('chart').textContent).toContain('Ten'))
    d9.resolve(ok(payload('Nine')))
    await new Promise(r => setTimeout(r, 20))
    expect(screen.getByTestId('chart').textContent).toContain('Ten')
    expect(screen.queryByText(/⚠️/)).toBeNull()
  })

  it('reopening a chart uses the cache', async () => {
    const f = vi.fn(async () => ok(payload('Nine')))
    vi.stubGlobal('fetch', f)
    render(<DivisionalCharts input={input} />)
    openRow('D9')
    await waitFor(() => screen.getByTestId('chart'))
    fireEvent.click(screen.getByText(/Life Areas/))
    openRow('D9')
    await waitFor(() => screen.getByTestId('chart'))
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('different divisions do not share a cache entry', async () => {
    const f = vi.fn(async url => ok(payload(url.includes('division=9') ? 'Nine' : 'Ten')))
    vi.stubGlobal('fetch', f)
    render(<DivisionalCharts input={input} />)
    openRow('D9')
    await waitFor(() => screen.getByTestId('chart'))
    fireEvent.click(screen.getByText(/Life Areas/))
    openRow('D10')
    await waitFor(() => expect(screen.getByTestId('chart').textContent).toContain('Ten'))
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('a 429 is retried once', async () => {
    const f = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}), headers: new Headers() })
      .mockResolvedValueOnce(ok(payload('Nine')))
    vi.stubGlobal('fetch', f)
    render(<DivisionalCharts input={input} />)
    openRow('D9')
    await waitFor(() => screen.getByTestId('chart'), { timeout: 4000 })
    expect(f).toHaveBeenCalledTimes(2)
  })
})

describe('10px headings', () => {
  it('no text-[10px] in BhavaChalit or DivisionalCharts', () => {
    expect(src).not.toContain('text-[10px]')
    expect(bhava).not.toContain('text-[10px]')
  })
})
