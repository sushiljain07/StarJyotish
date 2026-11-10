// House ordinals followed by a postposition use the oblique form in Hindi
// ("4थे भाव में"); English output is unchanged.
import { afterEach, describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { computeDoAvoid, computeLifeAreas, computeSpotlight } from './dailyInsights'

// Aries lagna; transit Moon in Cancer = 4th house. Saturn (lord of the
// 10th, Capricorn) sits in the 2nd house.
const chart = {
  ascendant: { sign_index: 0 },
  planets: [
    { name: 'Moon', sign_index: 0, house_number: 1 },
    { name: 'Saturn', sign_index: 1, house_number: 2 },
  ],
  dasha: { current_mahadasha: { planet: 'Saturn', end: '2030-01-01' }, current_antardasha: null },
}
const transit = [{ name: 'Moon', sign_index: 3, sign: 'Cancer' }]
const t = (...a) => i18n.t(...a)
const careerNugget = () => computeLifeAreas(chart, transit, t).find(a => a.id === 'career').nugget

afterEach(async () => { await i18n.changeLanguage('en') })

describe('dailyInsights house ordinals', () => {
  it('English text is unchanged', async () => {
    await i18n.changeLanguage('en')
    expect(computeSpotlight(chart, transit, t).moonSpotlight.text).toBe(
      'The Moon is transiting your 4th house today (home & family) — a natural window for '
      + 'a family matter, property paperwork, or simply resting at home.')
    expect(computeDoAvoid(chart, transit, null, t).doItems[0]).toContain('transiting your 4th house')
    expect(careerNugget()).toMatch(/^Your 10th house lord .+ sits in your 2nd house/)
  })

  it('Hindi uses the oblique ordinal before a postposition', async () => {
    await i18n.changeLanguage('hi')
    expect(computeSpotlight(chart, transit, t).moonSpotlight.text).toContain('4थे भाव में')
    expect(computeDoAvoid(chart, transit, null, t).doItems[0]).toContain('4थे भाव में')
    expect(careerNugget()).toMatch(/^आपके 10वें भाव के स्वामी .+ आपके 2रे भाव में/)
  })
})
