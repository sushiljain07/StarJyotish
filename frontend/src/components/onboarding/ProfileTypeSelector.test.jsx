import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProfileTypeSelector from './ProfileTypeSelector'

describe('ProfileTypeSelector selection tokens (Phase 5a)', () => {
  it('selected icon is AA gold ink, others ink-muted, and descriptions are not ink-faint', () => {
    const { container } = render(<ProfileTypeSelector t={k => k} value="self" onChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    const icons = buttons.map(b => b.querySelector('svg'))
    const selected = buttons.findIndex(b => b.getAttribute('aria-pressed') === 'true')
    expect(selected).toBeGreaterThanOrEqual(0)
    icons.forEach((svg, i) => {
      const cls = svg.getAttribute('class')
      if (i === selected) expect(cls).toContain('text-primary-ink')
      else expect(cls).toContain('text-ink-muted')
    })
    expect(container.innerHTML).not.toContain('text-ink-faint')
  })
})
