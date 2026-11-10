import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import i18n from '../i18n'
import KundliChart from './KundliChart'
import SouthIndiaChart from './SouthIndiaChart'

const asc = { sign_index: 0, degree: 12.3 }

// KundliChart renders the label in its own <tspan>; SouthIndiaChart as "12° La" in one text node.
afterEach(() => i18n.changeLanguage('en'))

describe.each([['KundliChart', KundliChart], ['SouthIndiaChart', SouthIndiaChart]])('%s lagna label', (_n, Chart) => {
  it('shows ल in Hindi and no Latin La', async () => {
    await i18n.changeLanguage('hi')
    const { container } = render(<Chart planets={[]} ascendant={asc} />)
    expect(screen.getAllByText(/(^|\s)ल$/).length).toBeGreaterThan(0)
    expect(container.textContent).not.toMatch(/\bLa\b/)
  })
  it('shows La in English', () => {
    render(<Chart planets={[]} ascendant={asc} />)
    expect(screen.getAllByText(/(^|\s)La$/).length).toBeGreaterThan(0)
  })
})
