import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import '../i18n'
import en from '../i18n/en.json'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Asha', role: 'user' }, logout: vi.fn() }),
}))

import AccountMenu from './AccountMenu'

describe('AccountMenu language row', () => {
  it('is a labelled group, and no menuitem wraps a button', () => {
    render(<MemoryRouter><AccountMenu /></MemoryRouter>)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByRole('menu')).toBeInTheDocument()
    const group = screen.getAllByRole('group', { name: en.lang_toggle_label })
    expect(group.length).toBeGreaterThan(0)
    for (const item of screen.getAllByRole('menuitem')) {
      expect(within(item).queryAllByRole('button')).toHaveLength(0)
    }
  })
})

describe('AccountMenu About link', () => {
  it('goes to /about, not the landing page', () => {
    render(<MemoryRouter><AccountMenu /></MemoryRouter>)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByRole('menuitem', { name: en.nav_about_product })).toHaveAttribute('href', '/about')
  })
})
