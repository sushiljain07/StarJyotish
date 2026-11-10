import { describe, it, expect } from 'vitest'
import en from './en.json'
import { LANGUAGES, DEFAULT_LANGUAGE, registerLanguage } from './languages'
import { flatten, placeholders, pluralBase, scriptViolation, parityProblems } from './localeCheck'

const bundles = import.meta.glob('./*.json', { eager: true, import: 'default' })
const bundleFor = code => bundles[`./${code}.json`]

describe('locale parity', () => {
  for (const entry of LANGUAGES.filter(l => l.code !== DEFAULT_LANGUAGE)) {
    const other = bundleFor(entry.code)
    it(`${entry.code} has every en key and no extra`, () => {
      const p = parityProblems(en, other)
      expect(p.missing).toEqual([])
      expect(p.extra).toEqual([])
      expect(p.noOther).toEqual([])
    })
    it(`${entry.code} placeholders match en`, () => {
      expect(parityProblems(en, other).placeholderMismatch).toEqual([])
    })
    it(`${entry.code} values are in its script`, () => {
      if (!entry.scriptRange) return
      const bad = [...flatten(other)].filter(([, v]) => scriptViolation(v, entry.scriptRange)).map(([k]) => k)
      expect(bad).toEqual([])
    })
  }

  it('every registry code has a locale file and vice versa', () => {
    const files = Object.keys(bundles).map(p => p.replace(/^\.\/|\.json$/g, '')).sort()
    expect(files).toEqual(LANGUAGES.map(l => l.code).sort())
  })

  it('a registered pseudo-language is checked', () => {
    const snapshot = [...LANGUAGES]
    try {
      registerLanguage({ code: 'xx', label: 'XX', nativeName: 'XX', locale: 'xx', script: 'deva', scriptRange: /[ऀ-ॿ]/ })
      const flat = flatten(en)
      const firstKey = [...flat.keys()][0]
      const bundle = JSON.parse(JSON.stringify(en))
      delete bundle[firstKey]
      expect(LANGUAGES.some(l => l.code === 'xx')).toBe(true)
      expect(parityProblems(en, bundle).missing).toContain(pluralBase(firstKey))
    } finally {
      LANGUAGES.splice(0, LANGUAGES.length, ...snapshot)
    }
  })

  it('helpers behave', () => {
    expect(placeholders('{{b}} x {{a}}')).toEqual(['a', 'b'])
    expect(pluralBase('house_ordinal_ordinal_few')).toBe('house_ordinal')
    expect(pluralBase('x_other')).toBe('x')
    expect(scriptViolation('Hello', /[ऀ-ॿ]/)).toBe(true)
    expect(scriptViolation('{{n}} AI PDF', /[ऀ-ॿ]/)).toBe(false)
  })
})
