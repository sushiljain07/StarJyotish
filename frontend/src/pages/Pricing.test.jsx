// /pricing used to sell ₹99/₹299/₹499 plans with no checkout behind them
// while the whole app is free. It is now an honest early-access page.
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'

vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false, user: null }) }))

import Pricing from './Pricing'

let fetchMock
beforeEach(async () => {
  await i18n.changeLanguage('en')
  fetchMock = vi.fn(() => Promise.resolve(new Response('{}', { status: 200 })))
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
  // jsdom has no matchMedia; Reveal and the header use it for motion/size.
  window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
})
afterEach(() => vi.unstubAllGlobals())

const renderPricing = () => render(<MemoryRouter><Pricing /></MemoryRouter>)

describe('Early access page', () => {
  it('shows the early-access offer with no prices', () => {
    const { container } = renderPricing()
    expect(screen.getByRole('heading', { level: 1, name: en.early_access_heading })).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/₹|\/month|Razorpay/)
    // Rate limits and the 5-question Ask cap exist, so don't promise "no limits".
    expect(container.textContent).not.toMatch(/no hidden limits/i)
  })

  it('does not read admin pricing plans', () => {
    renderPricing()
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/api/settings/public'))
  })

  it('CTA goes to /generate', () => {
    renderPricing()
    expect(screen.getByRole('link', { name: en.early_access_cta })).toHaveAttribute('href', '/generate')
  })

  it('renders in Hindi', async () => {
    await i18n.changeLanguage('hi')
    renderPricing()
    expect(screen.getByRole('heading', { level: 1, name: hi.early_access_heading })).toBeInTheDocument()
  })
})
