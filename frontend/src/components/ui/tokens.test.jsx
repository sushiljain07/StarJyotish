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

  it('Button className can override nowrap', () => {
    render(<Button className="whitespace-normal">x</Button>)
    expect(screen.getByRole('button').className).toContain('whitespace-normal')
  })
})
