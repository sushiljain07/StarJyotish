import { render, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import '../../i18n'
import indexHtml from '../../../index.html?raw'

import { useBottomChrome, useChromeRegistration } from './useBottomChrome'
import BottomChromeSpacer from './BottomChromeSpacer'
import BottomNav from '../home/BottomNav'

let mockAuthed = true
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: mockAuthed, user: mockAuthed ? { id: 1 } : null }),
}))

// Stand-ins for the bars: register exactly like the real components do.
function Bars({ names }) {
  useChromeRegistration(names)
  return null
}
function chrome(names) {
  const wrapper = ({ children }) => (
    <MemoryRouter>{names.length > 0 && <Bars names={names} />}{children}</MemoryRouter>
  )
  return renderHook(() => useBottomChrome(), { wrapper }).result.current
}

describe('useBottomChrome', () => {
  it('bottom nav only', () => {
    const c = chrome(['bottomNav'])
    expect(c.bottomNav).toBe(true)
    expect(c.subNav).toBe(false)
    expect(c.spacerHeight).toContain('--bottom-nav-h')
    expect(c.spacerHeight).not.toContain('--sub-nav-h')
  })
  it('bottom nav plus raised sub nav', () => {
    const c = chrome(['bottomNav', 'subNav', 'raisedSubNav'])
    expect(c.raisedSubNav).toBe(true)
    expect(c.spacerHeight).toContain('--bottom-nav-h')
    expect(c.spacerHeight).toContain('--sub-nav-h')
  })
  it('sub nav alone (signed out)', () => {
    const c = chrome(['subNav'])
    expect(c.subNav).toBe(true)
    expect(c.bottomNav).toBe(false)
    expect(c.spacerHeight).toContain('--sub-nav-h')
    expect(c.spacerHeight).not.toContain('--bottom-nav-h')
  })
  it('no bars mounted: nothing, even when signed in', () => {
    mockAuthed = true
    expect(chrome([]).spacerHeight).toBe('0px')
  })
  it('footer clearance adds the ScrollToTop reach (and the FAB) to the bars', () => {
    expect(chrome([]).footerClearance).toBe('calc(3.5rem)')
    expect(chrome(['bottomNav']).footerClearance).toContain('+ 3.5rem)')
    expect(chrome(['bottomNav', 'fab']).footerClearance).toContain('4rem + 4.25rem')
  })
})

describe('BottomChromeSpacer', () => {
  it('signed in with no BottomNav on the page (Footer-only page): reserves only the ScrollToTop reach', () => {
    mockAuthed = true
    const { container } = render(<MemoryRouter><BottomChromeSpacer /></MemoryRouter>)
    const spacer = container.firstChild
    expect(spacer.getAttribute('style')).toContain('calc(3.5rem)')
    expect(spacer.getAttribute('style')).not.toContain('--bottom-nav-h')
    expect(spacer.className).toContain('xl:hidden')
    // Desktop ScrollToTop reaches md:bottom-5 (20px) + h-11 (44px) = 64px.
    expect(spacer.className).toContain('md:h-16')
  })
  it('signed in with a mounted BottomNav: reserves the nav height', () => {
    mockAuthed = true
    const { container } = render(
      <MemoryRouter initialEntries={['/home']}><BottomNav /><BottomChromeSpacer /></MemoryRouter>,
    )
    const spacer = container.querySelector('div[aria-hidden="true"]')
    expect(spacer.getAttribute('style')).toContain('--bottom-nav-h')
    // ...plus the ScrollToTop button's reach above the bars, so it never covers footer links.
    expect(spacer.getAttribute('style')).toContain('3.5rem')
  })
  it('signed out: BottomNav renders nothing; the spacer keeps only the ScrollToTop reach', () => {
    mockAuthed = false
    const { container } = render(
      <MemoryRouter><BottomNav /><BottomChromeSpacer /></MemoryRouter>,
    )
    expect(container.querySelector('nav')).toBeNull()
    expect(container.querySelector('div[aria-hidden="true"]').getAttribute('style')).not.toContain('--bottom-nav-h')
  })
})

describe('BottomNav geometry', () => {
  it('height is bottom-nav-h plus safe-bottom, in the box NavBar raises by', () => {
    mockAuthed = true
    const { container } = render(<MemoryRouter><BottomNav /></MemoryRouter>)
    const nav = container.querySelector('nav')
    expect(nav.className).toContain('box-border')
    expect(nav.style.height).toBe('calc(var(--bottom-nav-h) + var(--safe-bottom))')
  })
})

describe('index.html', () => {
  it('uses viewport-fit=cover', () => {
    expect(indexHtml).toContain('viewport-fit=cover')
  })
})
