import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Badge from './Badge'

describe('Badge', () => {
  it('renders a light neutral span by default', () => {
    render(<Badge>New</Badge>)
    const el = screen.getByText('New')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('rounded-full')
    expect(el.className).toContain('text-2xs')
    expect(el.className).toContain('bg-parchment')
  })
  it('night gold uses primary-glow', () => {
    render(<Badge tone="gold" surface="night">x</Badge>)
    expect(screen.getByText('x').className).toContain('text-primary-glow')
  })
  it('appends className', () => {
    render(<Badge className="font-mono">x</Badge>)
    expect(screen.getByText('x').className).toContain('font-mono')
  })
  it('emits no arbitrary text sizes or colour literals', () => {
    for (const surface of ['light', 'night']) {
      for (const tone of ['neutral', 'gold', 'sage']) {
        for (const size of ['sm', 'md']) {
          const { container, unmount } = render(<Badge tone={tone} surface={surface} size={size}>b</Badge>)
          const cls = container.firstChild.className
          expect(cls).not.toContain('text-[')
          expect(cls).not.toContain('#')
          unmount()
        }
      }
    }
  })
})
