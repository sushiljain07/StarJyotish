// The "Why" line names the house with a real ordinal (1st, not 1th) in
// every language, via the shared house_ordinal key.
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import i18n from '../../i18n'
import DailyPatrikaHero from './DailyPatrikaHero'

const edition = house => ({ headline: 'x', headline_event: { planet: 'Sun', house } })

afterEach(async () => { await i18n.changeLanguage('en') })

describe('DailyPatrikaHero why line', () => {
  it('uses a real English ordinal', async () => {
    await i18n.changeLanguage('en')
    render(<DailyPatrikaHero firstName="A" edition={edition(1)} />)
    expect(screen.getByText(/your 1st house/)).toBeTruthy()
    expect(screen.queryByText(/1th/)).toBeNull()
  })

  it('uses the Hindi ordinal', async () => {
    await i18n.changeLanguage('hi')
    render(<DailyPatrikaHero firstName="A" edition={edition(1)} />)
    expect(screen.getByText(/1ला भाव/)).toBeTruthy()
  })
})
