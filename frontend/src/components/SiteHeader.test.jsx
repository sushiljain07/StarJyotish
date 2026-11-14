// Signing in from a page must come back to that page (with its chart),
// not drop the user on /home.
import { act, render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import en from '../i18n/en.json'

let mockAuthed = false
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: mockAuthed, user: mockAuthed ? { id: 1 } : null }),
}))
vi.mock('./AccountMenu', () => ({ default: () => null }))

import SiteHeader from './SiteHeader'

let loginState
function LoginProbe() { loginState = useLocation().state; return <div>LOGIN</div> }

function renderAt(entry) {
  loginState = 'unset'
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/login" element={<LoginProbe />} />
        <Route path="*" element={<SiteHeader />} />
      </Routes>
    </MemoryRouter>,
  )
  fireEvent.click(screen.getAllByRole('button', { name: en.nav_sign_in })[0])
}

describe('SiteHeader sign in', () => {
  it('passes the current page as next', async () => {
    renderAt('/kundli?tab=analysis')
    await screen.findByText('LOGIN')
    expect(loginState?.next).toBe('/kundli?tab=analysis')
  })

  it('passes no next from the landing page', async () => {
    renderAt('/')
    await screen.findByText('LOGIN')
    expect(loginState?.next).toBeUndefined()
  })
})

function PathProbe({ label }) { return <div>{label} {useLocation().pathname}</div> }

describe('SiteHeader signed-out links', () => {
  function renderHeader(props = {}) {
    render(
      <MemoryRouter initialEntries={['/panchang']}>
        <Routes>
          <Route path="/generate" element={<PathProbe label="AT" />} />
          <Route path="*" element={<SiteHeader {...props} />} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('the menu has Generate Kundli first, going to /generate', async () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: /menu/i }))
    const menu = screen.getAllByRole('navigation').at(-1)
    const first = menu.querySelector('button')
    expect(first.textContent).toBe(en.nav_cta_compact)
    fireEvent.click(first)
    expect(await screen.findByText('AT /generate')).toBeInTheDocument()
  })

  it('the desktop header shows Generate Kundli, Panchang and Explore', () => {
    renderHeader()
    const desktop = screen.getAllByRole('navigation')[0]
    expect([...desktop.querySelectorAll('button')].map(b => b.textContent))
      .toEqual([en.nav_cta_compact, en.nav_panchang_tab, en.nav_explore])
  })

  it('the desktop header drops its Generate Kundli link when the page has the CTA pill', () => {
    renderHeader({ onCtaClick: vi.fn() })
    const desktop = screen.getAllByRole('navigation')[0]
    expect([...desktop.querySelectorAll('button')].map(b => b.textContent))
      .toEqual([en.nav_panchang_tab, en.nav_explore])
  })
})

// Mobile /kundli: the header slides away on scroll-down so the chart gets
// the screen, and comes back on scroll-up and at the top.
describe('SiteHeader hide on scroll', () => {
  // matchMedia stand-in that keeps its change listeners, so a test can
  // rotate / resize the "device" mid-test with setWidth().
  let mqlListeners = []
  let mqlMobile = false
  function mockWidth(mobile) {
    mqlMobile = mobile
    window.matchMedia = q => ({
      get matches() { return mqlMobile && q === '(max-width: 767px)' },
      media: q,
      addEventListener: (_, fn) => { mqlListeners.push(fn) },
      removeEventListener: (_, fn) => { mqlListeners = mqlListeners.filter(l => l !== fn) },
      addListener() {}, removeListener() {},
    })
  }
  function setWidth(mobile) {
    mqlMobile = mobile
    act(() => { mqlListeners.forEach(fn => fn({ matches: mobile })) })
  }
  function scrollTo(y) {
    act(() => {
      window.scrollY = y
      window.dispatchEvent(new Event('scroll'))
    })
  }
  function renderHeaderAt(path) {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/home" element={<><SiteHeader /><PathProbe label="AT" /></>} />
          <Route path="*" element={<SiteHeader />} />
        </Routes>
      </MemoryRouter>,
    )
    return screen.getByRole('banner')
  }
  const originalMatchMedia = window.matchMedia
  afterEach(() => {
    window.matchMedia = originalMatchMedia
    mqlListeners = []
    window.scrollY = 0
    mockAuthed = false
  })

  it('hides on scroll-down on mobile /kundli and comes back on scroll-up', () => {
    mockWidth(true)
    const header = renderHeaderAt('/kundli')
    // One transition-property utility, with the transform under motion-safe.
    expect(header.className).toContain('motion-safe:transition-[transform,backdrop-filter,border-color]')
    expect(header.className.match(/transition-\[/g)).toHaveLength(1)
    expect(header.className).not.toContain('-translate-y-full')
    scrollTo(300)
    expect(header.className).toContain('-translate-y-full')
    expect(document.documentElement.hasAttribute('data-header-hidden')).toBe(true)
    scrollTo(250)
    expect(header.className).not.toContain('-translate-y-full')
    expect(document.documentElement.hasAttribute('data-header-hidden')).toBe(false)
  })

  it('comes back at the top of the page', () => {
    mockWidth(true)
    const header = renderHeaderAt('/kundli')
    scrollTo(300)
    expect(header.className).toContain('-translate-y-full')
    scrollTo(40)
    expect(header.className).not.toContain('-translate-y-full')
  })

  it('a keyboard user tabbing into the hidden header shows it, and the band follows', () => {
    mockWidth(true)
    const header = renderHeaderAt('/kundli')
    scrollTo(300)
    expect(header.className).toContain('-translate-y-full')
    act(() => { screen.getByRole('button', { name: en.app_title }).focus() })
    expect(header.className).not.toContain('-translate-y-full')
    expect(document.documentElement.hasAttribute('data-header-hidden')).toBe(false)
  })

  it('a header button focused by a tap while visible does not stop it hiding', () => {
    mockWidth(true)
    const header = renderHeaderAt('/kundli')
    act(() => { screen.getByRole('button', { name: en.app_title }).focus() })
    scrollTo(300)
    expect(header.className).toContain('-translate-y-full')
  })

  it('never hides on desktop', () => {
    mockWidth(false)
    const header = renderHeaderAt('/kundli')
    scrollTo(300)
    scrollTo(900)
    expect(header.className).not.toContain('-translate-y-full')
    expect(header.className).not.toContain('transition-[transform')
    expect(header.className).toContain('transition-[backdrop-filter,border-color]')
    expect(document.documentElement.hasAttribute('data-header-hidden')).toBe(false)
  })

  it('never hides on other mobile pages', () => {
    mockWidth(true)
    const header = renderHeaderAt('/panchang')
    scrollTo(300)
    expect(header.className).not.toContain('-translate-y-full')
  })

  it('clears the hidden flag when it unmounts', () => {
    mockWidth(true)
    const { unmount } = render(
      <MemoryRouter initialEntries={['/kundli']}><SiteHeader /></MemoryRouter>,
    )
    scrollTo(300)
    expect(document.documentElement.hasAttribute('data-header-hidden')).toBe(true)
    unmount()
    expect(document.documentElement.hasAttribute('data-header-hidden')).toBe(false)
  })

  it('signed in on /kundli, the logo leads home (the way out without the app bar)', async () => {
    mockAuthed = true
    mockWidth(true)
    renderHeaderAt('/kundli')
    fireEvent.click(screen.getByRole('button', { name: en.app_title }))
    expect(await screen.findByText('AT /home')).toBeInTheDocument()
  })

  // The way out of /kundli without the app bar: navigating away while the
  // header is hidden must never strand it hidden on the next page.
  it('navigating away while hidden shows the header on the next page', async () => {
    mockAuthed = true
    mockWidth(true)
    function Shell() {
      return <><SiteHeader /><Outlet /></>
    }
    function KundliPage() {
      const navigate = useNavigate()
      return <button type="button" onClick={() => navigate('/home')}>GO HOME</button>
    }
    render(
      <MemoryRouter initialEntries={['/kundli']}>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/kundli" element={<KundliPage />} />
            <Route path="/home" element={<PathProbe label="AT" />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    const header = screen.getByRole('banner')
    scrollTo(300)
    expect(header.className).toContain('-translate-y-full')
    expect(document.documentElement.hasAttribute('data-header-hidden')).toBe(true)
    fireEvent.click(screen.getByText('GO HOME'))
    expect(await screen.findByText('AT /home')).toBeInTheDocument()
    // Same header element: the shell keeps it mounted across the navigation.
    expect(screen.getByRole('banner')).toBe(header)
    expect(header.className).not.toContain('-translate-y-full')
    expect(document.documentElement.hasAttribute('data-header-hidden')).toBe(false)
  })

  it('growing to desktop while hidden shows the header', () => {
    mockWidth(true)
    const header = renderHeaderAt('/kundli')
    scrollTo(300)
    expect(header.className).toContain('-translate-y-full')
    setWidth(false)
    expect(header.className).not.toContain('-translate-y-full')
    expect(document.documentElement.hasAttribute('data-header-hidden')).toBe(false)
  })
})

// Tablet (md to lg): the signed-in links must not wrap to two lines.
describe('SiteHeader signed-in tablet row', () => {
  function renderSignedIn() {
    mockAuthed = true
    render(
      <MemoryRouter initialEntries={['/home']}>
        <SiteHeader />
      </MemoryRouter>,
    )
    return screen.getAllByRole('navigation')[0]
  }
  afterEach(() => { mockAuthed = false })

  it('keeps every link on one line with tighter spacing at md', () => {
    const nav = renderSignedIn()
    const links = [...nav.querySelectorAll('button')]
    expect(links).toHaveLength(5)
    for (const b of links) {
      expect(b.className).toContain('whitespace-nowrap')
      expect(b.className).toContain('md:px-2')
      expect(b.className).toContain('lg:px-4')
      expect(b.className).toContain('min-h-11')
    }
    expect(nav.className).toContain('md:gap-0.5')
    expect(nav.className).toContain('lg:gap-1')
  })
})
