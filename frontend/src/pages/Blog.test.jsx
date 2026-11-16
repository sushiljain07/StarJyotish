import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import '../i18n'
import Blog from './Blog'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false, user: null }),
}))

if (!window.matchMedia) {
  window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
})
afterEach(() => vi.unstubAllGlobals())

describe('Blog featured card', () => {
  it('keeps a solid night fill (light text sits on the parchment page)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        blog_index: ['a'],
        blog_article_a: { title: 'Featured piece', excerpt: 'x', category: 'Basics', featured: true, readMin: 3, date: '1 Jan' },
      }),
    })))
    render(<HelmetProvider><MemoryRouter><Blog /></MemoryRouter></HelmetProvider>)
    const title = await screen.findByText('Featured piece')
    const card = title.closest('button')
    expect(card.className).toMatch(/(^|\s)!?bg-night(\s|$)/)
  })
})
