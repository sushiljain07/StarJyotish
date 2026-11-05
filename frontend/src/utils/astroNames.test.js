import { describe, it, expect, afterEach } from 'vitest'
import astroCalcSrc from '../../../backend/services/astro_calc.py?raw'
import i18n from '../i18n'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'
import { planetName, signName, nakshatraName, planetAbbr } from './astroNames'

afterEach(() => i18n.changeLanguage('en'))

describe('astroNames in hi', () => {
  it('translates names and abbreviations', async () => {
    await i18n.changeLanguage('hi')
    const t = i18n.t.bind(i18n)
    expect(planetName(t, 'Moon')).toBe('चंद्र')
    expect(nakshatraName(t, 'Rohini')).toBe('रोहिणी')
    expect(planetAbbr(t, 'Uranus')).toBe('अरु')
    expect(planetAbbr(t, 'Ascendant')).toBe('ल')
    expect(signName(t, 'Aries')).toBe(hi.signs.Aries)
  })
  it('falls back to the given name, never a key', async () => {
    await i18n.changeLanguage('hi')
    const t = i18n.t.bind(i18n)
    expect(nakshatraName(t, 'Foo')).toBe('Foo')
    expect(planetName(t, 'Foo')).toBe('Foo')
  })
})

describe('astroNames in en', () => {
  it('keeps the English abbreviations', async () => {
    const t = i18n.t.bind(i18n)
    expect(planetAbbr(t, 'Sun')).toBe('Su')
    expect(planetAbbr(t, 'Pluto')).toBe('Pl')
    expect(planetAbbr(t, 'Ascendant')).toBe('La')
  })
})

describe('nakshatra parity with backend', () => {
  it('uses exactly the backend NAKSHATRAS spellings', () => {
    const src = astroCalcSrc
    const block = src.match(/NAKSHATRAS\s*=\s*\[([\s\S]*?)\]/)[1]
    const names = [...block.matchAll(/"([^"]+)"/g)].map(m => m[1])
    expect(names).toHaveLength(27)
    expect(Object.keys(en.nakshatras)).toEqual(names)
    expect(Object.keys(hi.nakshatras)).toEqual(names)
    expect(Object.keys(en.planet_abbr)).toHaveLength(13)
    expect(Object.keys(hi.planet_abbr)).toHaveLength(13)
  })
})
