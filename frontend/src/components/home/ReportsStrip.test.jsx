import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import '../../i18n'
import ReportsStrip from './ReportsStrip'

describe('ReportsStrip', () => {
  it('shows "Open →" once per link, never doubled', () => {
    const { container } = render(<ReportsStrip onOpenReport={vi.fn()} featuredId="career" lifeAreas={[]} />)
    expect(container.textContent).not.toContain('→ →')
    const links = screen.getAllByText('Open →')
    expect(links.length).toBeGreaterThan(1)
    for (const el of links) expect(el.textContent).toBe('Open →')
  })
})
