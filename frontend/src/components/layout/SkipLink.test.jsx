import { fireEvent, render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import '../../i18n'
import SkipLink from './SkipLink'
import StaticPageLayout from '../StaticPageLayout'
import WorkspaceLayout from './WorkspaceLayout'
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

  it('moves focus to main#main without a router navigation', () => {
    let loc
    function Probe() { loc = useLocation(); return null }
    render(
      <MemoryRouter initialEntries={['/kundli?tab=chart']}>
        <SkipLink /><Probe /><main id="main" tabIndex={-1}>x</main>
      </MemoryRouter>,
    )
    const main = document.getElementById('main')
    main.scrollIntoView = vi.fn()
    const link = screen.getByRole('link', { name: 'Skip to content' })
    const ev = fireEvent.click(link)
    expect(ev).toBe(false) // default prevented: the browser doesn't follow #main
    expect(document.activeElement).toBe(main)
    expect(main.scrollIntoView).toHaveBeenCalled()
    expect(loc.pathname + loc.search + loc.hash).toBe('/kundli?tab=chart')
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

  it('is first focusable in WorkspaceLayout and #main is focusable', () => {
    const { container } = render(wrap(<><SkipLink /><WorkspaceLayout /></>))
    const first = container.querySelector('a[href], button, input, [tabindex="0"]')
    expect(first).toBe(screen.getByRole('link', { name: 'Skip to content' }))
    expect(container.querySelector('main#main')).toHaveAttribute('tabindex', '-1')
  })

  it('every page rendering SiteHeader directly provides main#main', () => {
    const files = import.meta.glob('../../pages/**/*.jsx', { query: '?raw', import: 'default', eager: true })
    const missing = Object.entries(files)
      .filter(([f, src]) => !/\.test\./.test(f) && /<SiteHeader/.test(src) && !/<main id="main"/.test(src))
      .map(([f]) => f)
    expect(missing).toEqual([])
  })

  it('a Learn category page renders main#main', async () => {
    const { default: Planets } = await import('../../pages/learn/categories/Planets')
    const { container } = render(wrap(<Planets />))
    expect(container.querySelectorAll('main#main')).toHaveLength(1)
  })
})
