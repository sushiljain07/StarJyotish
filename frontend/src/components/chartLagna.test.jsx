import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import i18n from '../i18n'
import KundliChart from './KundliChart'
import SouthIndiaChart from './SouthIndiaChart'

const asc = { sign_index: 0, degree: 12.3 }

afterEach(() => i18n.changeLanguage('en'))

describe.each([['KundliChart', KundliChart], ['SouthIndiaChart', SouthIndiaChart]])('%s lagna label', (_n, Chart) => {
  it('shows ल in Hindi and no Latin La', async () => {
    await i18n.changeLanguage('hi')
    const { container } = render(<Chart planets={[]} ascendant={asc} />)
    expect(container.textContent).toContain('ल')
    expect(container.textContent).not.toMatch(/\bLa\b/)
  })
  it('shows La in English', () => {
    const { container } = render(<Chart planets={[]} ascendant={asc} />)
    expect(container.textContent).toMatch(/12.{0,2}La/)
  })
})
