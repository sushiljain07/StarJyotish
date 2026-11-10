// Class-level check that nav/tab/header/footer controls are >= 44px tall.
// Real measured sizes are verified in a browser (Phase 4 Task 8).
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import '../i18n'
import en from '../i18n/en.json'

let mockAuth = { isAuthenticated: false, user: null, logout: vi.fn(), loginWithPhone: vi.fn() }
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => mockAuth }))
vi.mock('../api/auth', () => ({ sendOtp: vi.fn().mockResolvedValue({}) }))

import AnimatedTabRow from './AnimatedTabRow'
import SegmentedToggle from './SegmentedToggle'
import AccountMenu from './AccountMenu'
import SiteHeader from './SiteHeader'
import CompactFooter from './CompactFooter'
import Footer from './Footer'
import LanguageSwitcher from './LanguageSwitcher'
import NavBar from './NavBar'
import PhoneOtpForm from './auth/PhoneOtpForm'

const TALL = /(^|\s)(min-h-11|min-h-\[var\(--bottom-nav-h\)\])(\s|$)/
const WIDE = /(^|\s)min-w-11(\s|$)/
const tall = el => TALL.test(el.className)
const bad = els => els.filter(el => !tall(el)).map(el => el.textContent || el.getAttribute('aria-label'))
if (!window.matchMedia) {
  window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
}
const wrap = ui => render(<MemoryRouter>{ui}</MemoryRouter>)

const tabs = [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }]

describe('44px tap targets', () => {
  it('AnimatedTabRow pill', () => {
    wrap(<AnimatedTabRow tabs={tabs} active="a" onChange={vi.fn()} variant="pill" />)
    expect(bad(screen.getAllByRole('tab'))).toEqual([])
  })
  it('AnimatedTabRow underline', () => {
    wrap(<AnimatedTabRow tabs={tabs} active="a" onChange={vi.fn()} variant="underline" />)
    expect(bad(screen.getAllByRole('tab'))).toEqual([])
  })
  it('SegmentedToggle', () => {
    wrap(<SegmentedToggle options={tabs} active="a" onChange={vi.fn()} />)
    expect(bad(screen.getAllByRole('button'))).toEqual([])
  })
  it('AccountMenu trigger and menu links', () => {
    mockAuth = { isAuthenticated: true, user: { name: 'Asha', role: 'admin' }, logout: vi.fn() }
    wrap(<AccountMenu />)
    const trigger = screen.getByRole('button', { name: en.nav_account_menu })
    expect(tall(trigger) && WIDE.test(trigger.className)).toBe(true)
    fireEvent.click(trigger)
    const items = screen.getAllByRole('menuitem')
    expect(items.length).toBeGreaterThan(2)
    expect(bad(items)).toEqual([])
  })
  it('SiteHeader sign-in, CTA and hamburger', () => {
    mockAuth = { isAuthenticated: false, user: null }
    wrap(<SiteHeader onCtaClick={vi.fn()} />)
    const signIn = screen.getAllByRole('button', { name: en.nav_sign_in })
    const menu = screen.getByRole('button', { name: /menu/i })
    expect(WIDE.test(menu.className)).toBe(true)
    const cta = screen.getAllByRole('button').filter(b => b.textContent.includes(en.nav_cta_mobile))
    expect(cta.length).toBe(1)
    expect(bad([...signIn, menu, ...cta])).toEqual([])
  })
  it('CompactFooter links', () => {
    wrap(<CompactFooter />)
    const links = screen.getAllByRole('link')
    expect(bad(links)).toEqual([])
  })
  it('Footer links', () => {
    mockAuth = { isAuthenticated: false, user: null }
    const { container } = wrap(<Footer />)
    const links = [...container.querySelectorAll('a')]
    expect(links.length).toBeGreaterThan(5)
    expect(bad(links)).toEqual([])
  })
  it('LanguageSwitcher both sizes', () => {
    for (const size of ['sm', 'md']) {
      const { unmount } = wrap(<LanguageSwitcher size={size} />)
      const btns = screen.getAllByRole('button')
      expect(bad(btns)).toEqual([])
      expect(btns.every(b => WIDE.test(b.className))).toBe(true)
      unmount()
    }
  })
  it('NavBar items', () => {
    wrap(<NavBar tabs={tabs} activeTab="a" onTabChange={vi.fn()} />)
    expect(bad(screen.getAllByRole('button'))).toEqual([])
  })
  it('PhoneOtpForm resend and change number', async () => {
    mockAuth = { loginWithPhone: vi.fn() }
    wrap(<PhoneOtpForm />)
    fireEvent.change(document.querySelector('input'), { target: { value: 'a@b.co' } })
    fireEvent.click(screen.getByRole('button', { name: en.login_send_code }))
    const change = await screen.findByRole('button', { name: en.login_change_number })
    const resend = screen.getByRole('button', { name: /resend/i })
    await waitFor(() => expect(change).toBeInTheDocument())
    expect(bad([change, resend])).toEqual([])
  })
})
