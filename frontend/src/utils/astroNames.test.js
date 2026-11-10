import { describe, it, expect, afterEach } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
  // The backend source is outside the frontend tree; skip where it is absent.
  // eslint-disable-next-line no-undef
  const backendPath = resolve(process.cwd(), '../backend/services/astro_calc.py')
  it.skipIf(!existsSync(backendPath))('uses exactly the backend NAKSHATRAS spellings', () => {
    const src = readFileSync(backendPath, 'utf8')
    const block = src.match(/NAKSHATRAS\s*=\s*\[([\s\S]*?)\]/)[1]
    const names = [...block.matchAll(/"([^"]+)"/g)].map(m => m[1])
    expect(names).toHaveLength(27)
    // Abhijit is the Sarvatobhadra chakra's 28th cell, not a backend nakshatra.
    expect(Object.keys(en.nakshatras)).toEqual([...names, 'Abhijit'])
    expect(Object.keys(hi.nakshatras)).toEqual([...names, 'Abhijit'])
    expect(Object.keys(en.planet_abbr)).toHaveLength(13)
    expect(Object.keys(hi.planet_abbr)).toHaveLength(13)
  })
})

describe('Abhijit', () => {
  it('has a Hindi name', async () => {
    await i18n.changeLanguage('hi')
    expect(nakshatraName(i18n.t.bind(i18n), 'Abhijit')).toBe('अभिजित')
  })
})
