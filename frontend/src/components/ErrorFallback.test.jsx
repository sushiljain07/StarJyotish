import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ErrorFallback from './ErrorFallback'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: k => k }) }))

describe('ErrorFallback reload button', () => {
  it('uses the AA call-to-action (bg-primary text-night), not white on primary-dark', () => {
    render(<ErrorFallback resetError={() => {}} />)
    const btn = screen.getByRole('button', { name: 'error_fallback_reload' })
    expect(btn.className).toContain('bg-primary')
    expect(btn.className).toContain('text-night')
    expect(btn.className).toContain('hover:bg-primary-dark')
    expect(btn.className).not.toMatch(/\btext-white\b|(^|\s)bg-primary-dark/)
    expect(btn.className).toContain('min-h-[44px]')
  })
})
