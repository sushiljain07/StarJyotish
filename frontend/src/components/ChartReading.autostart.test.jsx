// One-tap reveal: an anonymous reader arriving from the Kundli teaser has
// already tapped "Reveal my reading", so the reading starts without the
// idle "Reveal My Prediction" gate.
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import '../i18n'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false }) }))
vi.mock('../config/entitlements', () => ({ hasPremiumAccess: () => true }))

import ChartReading from './ChartReading'

const INPUT = { date: '1990-01-01', time: '12:00', place: 'Delhi, India' }

let fetchMock
beforeEach(() => {
  sessionStorage.clear()
  fetchMock = vi.fn(() => new Promise(() => {}))
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.HTMLElement.prototype.scrollIntoView = () => {}
})
afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear() })

describe('ChartReading autostart (anonymous)', () => {
  it('starts the reading once, with no Reveal button', async () => {
    render(<ChartReading input={INPUT} autostart />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('button', { name: /reveal my prediction/i })).toBeNull()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('without autostart it waits behind the Reveal button', async () => {
    render(<ChartReading input={INPUT} />)
    expect(screen.getByRole('button', { name: /reveal my prediction/i })).toBeInTheDocument()
    await new Promise(r => setTimeout(r, 30))
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
