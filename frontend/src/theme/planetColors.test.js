import { describe, it, expect } from 'vitest'
import { colors as c } from './tokens.js'
import { ratio } from './contrastUtil.js'
import { PLANET_COLORS, PLANET_COLORS_NIGHT, LORD_COLORS } from '../config/planetColors.js'
import { PLANETS } from '../config/planetsHubContent.js'

const NAMES = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu', 'uranus', 'neptune', 'pluto']

describe('planet palette contrast', () => {
  const light = { 'parchment.card': c.parchment.card, 'parchment.alt': c.parchment.alt, 'primary.light': c.primary.light }
  for (const n of NAMES) {
    for (const [sn, bg] of Object.entries(light)) {
      it(`planet.${n} on ${sn} is at least 4.5:1`, () => expect(ratio(c.planet[n], bg)).toBeGreaterThanOrEqual(4.5))
    }
    for (const [sn, bg] of Object.entries({ night: c.night.DEFAULT, 'night.deep': c.night.deep })) {
      it(`planetNight.${n} on ${sn} is at least 4.5:1`, () => expect(ratio(c.planetNight[n], bg)).toBeGreaterThanOrEqual(4.5))
    }
  }
})

describe('planetColors.js', () => {
  it('LORD_COLORS is the same map as PLANET_COLORS', () => expect(LORD_COLORS).toBe(PLANET_COLORS))
  it('PLANET_COLORS and PLANET_COLORS_NIGHT come from the tokens', () => {
    for (const n of NAMES) {
      const k = n[0].toUpperCase() + n.slice(1)
      expect(PLANET_COLORS[k]).toBe(c.planet[n])
      expect(PLANET_COLORS_NIGHT[k]).toBe(c.planetNight[n])
    }
  })
  it('planetsHubContent colours agree with PLANET_COLORS', () => {
    const byEnglish = { 'North Node': 'Rahu', 'South Node': 'Ketu' }
    for (const p of PLANETS) expect(p.color).toBe(PLANET_COLORS[byEnglish[p.english] || p.english])
  })
})
