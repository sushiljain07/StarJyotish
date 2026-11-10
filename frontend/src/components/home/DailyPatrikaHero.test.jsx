// The "Why" line names the house with a real ordinal (1st, not 1th). Hindi
// uses the oblique ordinal because the house is followed by a postposition
// ("पहले भाव को"; houses 1–6 are words).
import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import i18n from '../../i18n'
import DailyPatrikaHero from './DailyPatrikaHero'

const edition = house => ({ headline: 'x', headline_event: { planet: 'Sun', house } })
const whyLine = house => {
  render(<DailyPatrikaHero firstName="A" edition={edition(house)} />)
  const text = screen.getByText(/^(Why|क्यों):/).textContent
  cleanup()
  return text
}

afterEach(async () => { await i18n.changeLanguage('en') })

describe('DailyPatrikaHero why line', () => {
  it('uses real English ordinals', async () => {
    await i18n.changeLanguage('en')
    expect(whyLine(1)).toBe('Why: transit Sun activates your 1st house today.')
    expect(whyLine(3)).toContain('your 3rd house')
    expect(whyLine(11)).toContain('your 11th house')
  })

  it('uses the Hindi oblique ordinal before the postposition', async () => {
    await i18n.changeLanguage('hi')
    expect(whyLine(1)).toContain('आपके पहले भाव को')
    expect(whyLine(3)).toContain('आपके तीसरे भाव को')
    expect(whyLine(11)).toContain('आपके 11वें भाव को')
  })
})
