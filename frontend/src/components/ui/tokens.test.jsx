import { render, screen } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Button from './Button'
import Card from './Card'
import SectionHeading from './SectionHeading'
import InlineNotice from './InlineNotice'

describe('ui surface tokens (AA)', () => {
  it('Button outline: light uses primary-ink, night keeps primary-glow', () => {
    render(
      <MemoryRouter>
        <Button variant="outline" surface="light">Light</Button>
        <Button variant="outline" surface="night">Night</Button>
      </MemoryRouter>,
    )
    const light = screen.getByText('Light')
    const night = screen.getByText('Night')
    expect(light.className).toContain('text-primary-ink')
    expect(light.className).not.toMatch(/text-primary-dark/)
    expect(night.className).toContain('text-primary-glow')
    expect(night.className).not.toContain('text-primary-ink')
  })

  it('SectionHeading eyebrow: light uses primary-ink, night keeps primary-glow', () => {
    render(
      <>
        <SectionHeading surface="light" eyebrow="LightEyebrow">h</SectionHeading>
        <SectionHeading surface="night" eyebrow="NightEyebrow">h</SectionHeading>
      </>,
    )
    expect(screen.getByText('LightEyebrow').className).toContain('text-primary-ink')
    expect(screen.getByText('NightEyebrow').className).toContain('text-primary-glow')
    expect(screen.getByText('NightEyebrow').className).not.toContain('text-primary-ink')
  })

  it('InlineNotice dismiss is an icon-only decorative ink-faint button with an aria-label', () => {
    render(<InlineNotice onDismiss={() => {}}>label</InlineNotice>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('text-ink-faint')
    expect(btn.getAttribute('aria-label')).toBeTruthy()
  })

  it('Button href renders an external anchor', () => {
    render(<MemoryRouter><Button href="https://x.test">Go</Button></MemoryRouter>)
    const a = screen.getByRole('link')
    expect(a.getAttribute('href')).toBe('https://x.test')
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toContain('noopener')
  })

  it('Card as={Link} renders a router link', () => {
    render(<MemoryRouter><Card as={Link} to="/x">c</Card></MemoryRouter>)
    expect(screen.getByRole('link').getAttribute('href')).toBe('/x')
  })

  it('Button wrap swaps nowrap for normal; default is nowrap', () => {
    render(<><Button wrap>w</Button><Button>n</Button></>)
    const w = screen.getByText('w').className, n = screen.getByText('n').className
    expect(w).toContain('whitespace-normal'); expect(w).not.toContain('whitespace-nowrap')
    expect(n).toContain('whitespace-nowrap'); expect(n).not.toContain('whitespace-normal')
  })

  it('Button sm keeps a 44px target at every width', () => {
    render(<Button size="sm">s</Button>)
    const c = screen.getByRole('button').className
    expect(c).toContain('min-h-11'); expect(c).not.toContain('md:min-h-0')
  })

  it('Button internal/hash href has no target; external has _blank + rel; caller target wins', () => {
    render(<><Button href="#x">h</Button><Button href="//x.com">p</Button><Button href="https://x.com" target="_self">o</Button></>)
    const h = screen.getByText('h'), p = screen.getByText('p'), o = screen.getByText('o')
    expect(h.hasAttribute('target')).toBe(false); expect(h.hasAttribute('rel')).toBe(false)
    expect(p.getAttribute('target')).toBe('_blank'); expect(p.getAttribute('rel')).toContain('noopener')
    expect(o.getAttribute('target')).toBe('_self')
  })

  it('Card as button defaults type=button, caller type wins', () => {
    render(<><Card as="button">a</Card><Card as="button" type="submit">b</Card></>)
    expect(screen.getByText('a').getAttribute('type')).toBe('button')
    expect(screen.getByText('b').getAttribute('type')).toBe('submit')
  })
})
