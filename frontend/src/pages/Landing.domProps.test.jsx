import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import '../i18n'
import Landing from './Landing'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false, user: null }),
}))

if (!window.matchMedia) {
  window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
})
afterEach(() => vi.restoreAllMocks())

describe('Landing (signed out)', () => {
  it('passes no unknown props to DOM elements', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<HelmetProvider><MemoryRouter><Landing /></MemoryRouter></HelmetProvider>)
    const unknown = err.mock.calls
      .map(a => a.map(String).join(' '))
      .filter(m => /does not recognize|for a non-boolean attribute|Unknown event handler/.test(m))
    expect(unknown).toEqual([])
  })
})
