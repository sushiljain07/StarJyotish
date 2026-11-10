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
import CompactFooter from '../CompactFooter'

describe('page widths', () => {
  it('workspace header inner and footer are max-w-5xl', () => {
    const { container } = render(<MemoryRouter initialEntries={['/home']}><WorkspaceLayout /></MemoryRouter>)
    expect(container.querySelector('header > div').className).toContain('max-w-5xl')
    expect(container.querySelector('footer > div').className).toContain('max-w-5xl')
  })
  it('marketing header stays max-w-6xl', () => {
    const { container } = render(<MemoryRouter><SiteHeader /></MemoryRouter>)
    expect(container.querySelector('header > div').className).toContain('max-w-6xl')
  })
  it('footer alone is 5xl', () => {
    const { container } = render(<MemoryRouter><CompactFooter /></MemoryRouter>)
    expect(container.querySelector('footer > div').className).toContain('max-w-5xl')
  })
})
