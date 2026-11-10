import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import '../../i18n'
import SkipLink from './SkipLink'
import StaticPageLayout from '../StaticPageLayout'
import Landing from '../../pages/Landing'

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false, user: null }),
}))

if (!window.matchMedia) {
  window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
}
const wrap = ui => <HelmetProvider><MemoryRouter>{ui}</MemoryRouter></HelmetProvider>

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
})

describe('SkipLink and landmarks', () => {
  it('is a link to #main and is the first focusable element', () => {
    render(<><SkipLink /><button>after</button></>)
    const link = screen.getByRole('link', { name: 'Skip to content' })
    expect(link).toHaveAttribute('href', '#main')
    expect(document.body.querySelector('a, button')).toBe(link)
  })

  it('StaticPageLayout renders exactly one main#main', () => {
    const { container } = render(wrap(<StaticPageLayout title="T">x</StaticPageLayout>))
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelector('main#main')).not.toBeNull()
  })

  it('Landing renders exactly one main#main', () => {
    const { container } = render(wrap(<Landing />))
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelector('main#main')).not.toBeNull()
  })
})
