import { render, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import '../../i18n'
import indexHtml from '../../../index.html?raw'

let mockAuthed = true
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: mockAuthed, user: mockAuthed ? { id: 1 } : null }),
}))

import { useBottomChrome } from './useBottomChrome'
import BottomChromeSpacer from './BottomChromeSpacer'

function chrome(path, authed) {
  mockAuthed = authed
  const wrapper = ({ children }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  return renderHook(() => useBottomChrome(), { wrapper }).result.current
}

describe('useBottomChrome', () => {
  it('signed in on /home: bottom nav only', () => {
    const c = chrome('/home', true)
    expect(c.bottomNav).toBe(true)
    expect(c.subNav).toBe(false)
    expect(c.spacerHeight).toContain('--bottom-nav-h')
    expect(c.spacerHeight).not.toContain('--sub-nav-h')
  })
  it('signed in on /kundli: both bars', () => {
    const c = chrome('/kundli', true)
    expect(c.raisedSubNav).toBe(true)
    expect(c.spacerHeight).toContain('--bottom-nav-h')
    expect(c.spacerHeight).toContain('--sub-nav-h')
  })
  it('signed out on /kundli: sub nav only', () => {
    const c = chrome('/kundli', false)
    expect(c.subNav).toBe(true)
    expect(c.bottomNav).toBe(false)
    expect(c.raisedSubNav).toBe(false)
    expect(c.spacerHeight).toContain('--sub-nav-h')
    expect(c.spacerHeight).not.toContain('--bottom-nav-h')
  })
  it('signed out on /: nothing', () => {
    expect(chrome('/', false).spacerHeight).toBe('0px')
  })
})

describe('BottomChromeSpacer', () => {
  it('renders an md:hidden spacer with the computed height', () => {
    mockAuthed = true
    const { container } = render(<MemoryRouter initialEntries={['/home']}><BottomChromeSpacer /></MemoryRouter>)
    const el = container.firstChild
    expect(el.className).toContain('md:hidden')
    expect(el.getAttribute('style')).toContain('--bottom-nav-h')
  })
  it('renders nothing when there are no bars', () => {
    mockAuthed = false
    const { container } = render(<MemoryRouter initialEntries={['/']}><BottomChromeSpacer /></MemoryRouter>)
    expect(container.firstChild).toBeNull()
  })
})

describe('index.html', () => {
  it('uses viewport-fit=cover', () => {
    expect(indexHtml).toContain('viewport-fit=cover')
  })
})
