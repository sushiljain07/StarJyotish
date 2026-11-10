// Landscape notch: index.html sets viewport-fit=cover, so every fixed
// full-width bar must pad itself by the side safe-area insets (the body's
// padding doesn't reach fixed elements). Measured in a browser in the
// Phase 4 final sweep (--safe-left: 47px at 844x390).
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import '../i18n'
import en from '../i18n/en.json'

let mockAuth = { isAuthenticated: false, user: null, logout: vi.fn() }
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => mockAuth }))

import SiteHeader from './SiteHeader'
import BottomNav from './home/BottomNav'
import NavBar from './NavBar'
import ScrollToTop from './ScrollToTop'

const wrap = ui => render(<MemoryRouter>{ui}</MemoryRouter>)
const usesLeft = cls => /var\(--safe-left\)/.test(cls)
const usesRight = cls => /var\(--safe-right\)/.test(cls)

describe('side safe areas on fixed bars', () => {
  it('SiteHeader inner row keeps its 16px gutter, widened to the insets', () => {
    mockAuth = { isAuthenticated: false, user: null }
    wrap(<SiteHeader />)
    const row = screen.getByRole('button', { name: en.app_title }).parentElement
    expect(row.className).toContain('pl-[max(1rem,var(--safe-left))]')
    expect(row.className).toContain('pr-[max(1rem,var(--safe-right))]')
    expect(row.className).not.toMatch(/(^|\s)px-4(\s|$)/)
  })
  it('BottomNav pads by both insets', () => {
    mockAuth = { isAuthenticated: true, user: { name: 'Asha', birth_profiles: [] } }
    wrap(<BottomNav />)
    const nav = screen.getByRole('navigation')
    expect(usesLeft(nav.className) && usesRight(nav.className)).toBe(true)
  })
  it('NavBar pads by both insets, raised or not', () => {
    const tabs = [{ id: 'a', label: 'Alpha', icon: 'kundli' }]
    for (const raised of [false, true]) {
      const { unmount } = render(<NavBar tabs={tabs} activeTab="a" onTabChange={vi.fn()} raised={raised} />)
      const nav = screen.getByRole('navigation')
      expect(usesLeft(nav.className) && usesRight(nav.className)).toBe(true)
      unmount()
    }
  })
  it('ScrollToTop keeps its 20px edge offset, widened to the right inset', () => {
    wrap(<ScrollToTop visible />)
    expect(screen.getByRole('button').className).toContain('right-[max(1.25rem,var(--safe-right))]')
  })
})
