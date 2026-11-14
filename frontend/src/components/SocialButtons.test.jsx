import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '../i18n'
import SocialButtons from './SocialButtons'

// Surface assertions (Phase 5a): gold hover text must stay on the night
// branch and use the AA ink on the light branch.
describe('SocialButtons surfaces', () => {
  it('night keeps the gold hover', () => {
    const { container } = render(<SocialButtons dark />)
    const circle = container.querySelector('span.rounded-full')
    expect(circle.className).toContain('group-hover:text-primary')
    expect(circle.className).not.toContain('text-primary-ink')
  })
  it('light hovers to ink, never gold text', () => {
    const { container } = render(<SocialButtons dark={false} />)
    const circle = container.querySelector('span.rounded-full')
    expect(circle.className).toContain('group-hover:text-ink')
    expect(circle.className).not.toMatch(/text-primary(?!\/|-ink)/)
  })
})
