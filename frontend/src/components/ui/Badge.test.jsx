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
  it('wrap swaps nowrap for normal', () => {
    render(<><Badge wrap>w</Badge><Badge>n</Badge></>)
    expect(screen.getByText('w').className).toContain('whitespace-normal')
    expect(screen.getByText('w').className).not.toContain('whitespace-nowrap')
    expect(screen.getByText('n').className).toContain('whitespace-nowrap')
  })
  it('night gold uses primary-glow', () => {
    render(<Badge tone="gold" surface="night">x</Badge>)
    expect(screen.getByText('x').className).toContain('text-primary-glow')
  })
  it('light tones use their token classes', () => {
    const want = { good: ['bg-good-light', 'text-good'], vermillion: ['bg-vermillion-light', 'text-vermillion'], mauve: ['bg-mauve-light', 'text-mauve'], muted: ['bg-ink-faint/25', 'text-ink-muted'] }
    for (const [tone, classes] of Object.entries(want)) {
      const { unmount } = render(<Badge tone={tone}>{tone}</Badge>)
      for (const c of classes) expect(screen.getByText(tone).className).toContain(c)
      unmount()
    }
  })
  it('night tones use readable onnight text', () => {
    const want = { good: 'text-good-onnight', vermillion: 'text-bad-onnight', mauve: 'text-mauve-onnight', muted: 'text-ink-onnight' }
    for (const [tone, c] of Object.entries(want)) {
      const { unmount } = render(<Badge tone={tone} surface="night">{tone}</Badge>)
      expect(screen.getByText(tone).className).toContain(c)
      unmount()
    }
  })
  it('appends className', () => {
    render(<Badge className="font-mono">x</Badge>)
    expect(screen.getByText('x').className).toContain('font-mono')
  })
  it('emits no arbitrary text sizes or colour literals', () => {
    for (const surface of ['light', 'night']) {
      for (const tone of ['neutral', 'gold', 'sage', 'good', 'vermillion', 'mauve', 'muted']) {
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
