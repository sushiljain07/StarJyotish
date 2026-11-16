import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Section from './Section'

describe('Section width', () => {
  it('sits in the shared page frame by default', () => {
    const { container } = render(<Section title="t">x</Section>)
    const section = container.querySelector('section')
    expect(section.className).not.toMatch(/\bpx-/)
    const inner = section.firstElementChild
    expect(inner.classList.contains('max-w-5xl')).toBe(true)
    expect(inner.classList.contains('pl-[max(1rem,var(--safe-left))]')).toBe(true)
    expect(container.innerHTML).not.toContain('max-w-6xl')
  })

  it('keeps an explicit prose width and its own padding', () => {
    const { container } = render(<Section maxWidth="max-w-3xl">x</Section>)
    const section = container.querySelector('section')
    expect(section.className).toContain('px-4 sm:px-6')
    expect(section.firstElementChild.className).toBe('max-w-3xl mx-auto')
  })
})
