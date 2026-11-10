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
})

describe('BottomChromeSpacer', () => {
  it('signed in with no BottomNav on the page (Footer-only page): renders nothing', () => {
    mockAuthed = true
    const { container } = render(<MemoryRouter><BottomChromeSpacer /></MemoryRouter>)
    expect(container.firstChild).toBeNull()
  })
  it('signed in with a mounted BottomNav: reserves the nav height', () => {
    mockAuthed = true
    const { container } = render(
      <MemoryRouter initialEntries={['/home']}><BottomNav /><BottomChromeSpacer /></MemoryRouter>,
    )
    const spacer = container.querySelector('div.md\\:hidden')
    expect(spacer.getAttribute('style')).toContain('--bottom-nav-h')
  })
  it('signed out: BottomNav renders nothing and no spacer is reserved', () => {
    mockAuthed = false
    const { container } = render(
      <MemoryRouter><BottomNav /><BottomChromeSpacer /></MemoryRouter>,
    )
    expect(container.firstChild).toBeNull()
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
