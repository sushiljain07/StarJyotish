import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import '../../i18n'

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: 1 }, logout: vi.fn() }),
}))
if (!window.matchMedia) {
  window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
}

import WorkspaceLayout from './WorkspaceLayout'
import SiteHeader from '../SiteHeader'
import Footer from '../Footer'
import CompactFooter from '../CompactFooter'

function expectFrame(container) {
  const nodes = [...container.querySelectorAll('header > div'), ...container.querySelectorAll('footer div[class*="max-w-"]')]
    .filter(n => !/max-w-(xs|sm|md)\b/.test(n.className))
  expect(nodes.length).toBeGreaterThan(0)
  for (const n of nodes) {
    expect(n.className).toContain('max-w-5xl')
    expect(n.className).not.toContain('max-w-6xl')
  }
}

describe('one frame width', () => {
  it('workspace header and footer', () => {
    const { container } = render(<MemoryRouter initialEntries={['/home']}><WorkspaceLayout /></MemoryRouter>)
    expectFrame(container)
  })
  it('marketing header', () => {
    expectFrame(render(<MemoryRouter><SiteHeader /></MemoryRouter>).container)
  })
  it('Footer', () => {
    expectFrame(render(<MemoryRouter><Footer /></MemoryRouter>).container)
  })
  it('CompactFooter', () => {
    expectFrame(render(<MemoryRouter><CompactFooter /></MemoryRouter>).container)
  })
})
