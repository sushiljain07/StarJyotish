import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ConceptLink from './ConceptLink'
import ArticleCard from './ArticleCard'

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('knowledge surface tokens (AA)', () => {
  it('ConceptLink light uses primary-ink, dark keeps a night gold', () => {
    wrap(
      <>
        <ConceptLink id="aries">LightLink</ConceptLink>
        <ConceptLink id="aries" tone="dark">DarkLink</ConceptLink>
      </>,
    )
    const light = screen.getByText('LightLink')
    const dark = screen.getByText('DarkLink')
    expect(light.className).toContain('text-primary-ink')
    expect(dark.className).toContain('text-primary-light')
    expect(dark.className).toContain('hover:text-primary-glow')
    expect(dark.className).not.toContain('primary-ink')
  })

  it('ArticleCard featured hover stays a night gold; non-featured uses primary-ink', () => {
    wrap(
      <>
        <ArticleCard featured title="FeatTitle" href="/x" />
        <ArticleCard title="PlainTitle" href="/y" />
      </>,
    )
    expect(screen.getByText('FeatTitle').className).toContain('group-hover:text-primary-glow')
    expect(screen.getByText('FeatTitle').className).not.toContain('primary-ink')
    expect(screen.getByText('PlainTitle').className).toContain('group-hover:text-primary-ink')
  })
})
