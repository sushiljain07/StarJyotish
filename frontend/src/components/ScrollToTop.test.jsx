import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import '../i18n'

let mockAuthed = true
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: mockAuthed, user: mockAuthed ? { id: 1 } : null }),
}))
import ScrollToTop from './ScrollToTop'

function renderAt(path, authed) {
  mockAuthed = authed
  render(<MemoryRouter initialEntries={[path]}><ScrollToTop visible /></MemoryRouter>)
  return screen.getByRole('button').getAttribute('style')
}

describe('ScrollToTop', () => {
  it('floats above the bottom nav when signed in', () => {
    expect(renderAt('/learn', true)).toContain('--bottom-nav-h')
  })
  it('floats above the FAB on /home', () => {
    expect(renderAt('/home', true)).toContain('--fab-h')
  })
})
