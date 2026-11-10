import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import '../i18n'

import ScrollToTop from './ScrollToTop'
import { useChromeRegistration } from './layout/useBottomChrome'

function Bars({ names }) {
  useChromeRegistration(names)
  return null
}

function renderWith(names) {
  render(<MemoryRouter><Bars names={names} /><ScrollToTop visible /></MemoryRouter>)
  return screen.getByRole('button').getAttribute('style')
}

describe('ScrollToTop', () => {
  it('floats above the bottom nav when one is mounted', () => {
    expect(renderWith(['bottomNav'])).toContain('--bottom-nav-h')
  })
  it('does not reserve nav height when no BottomNav is mounted', () => {
    expect(renderWith([])).not.toContain('--bottom-nav-h')
  })
  it('floats above the FAB when one is mounted', () => {
    expect(renderWith(['bottomNav', 'fab'])).toContain('var(--fab-h) + 0.75rem')
  })
})
