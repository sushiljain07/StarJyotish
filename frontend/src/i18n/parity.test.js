import { describe, it, expect } from 'vitest'
import en from './en.json'
import hi from './hi.json'
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

// Settled rows of the Hindi glossary (docs/i18n-glossary.md). Each check
// lists the offending keys so a failure says exactly what to fix.
describe('hi glossary', () => {
  const flat = [...flatten(hi)]
  const keysWith = re => flat.filter(([, v]) => re.test(v)).map(([k]) => k)

  // चार्ट only where a key names a specific divisional chart (D-number or
  // नवांश); a chart in general is कुंडली / जन्म कुंडली.
  const CHART_ALLOWED = [
    'testimonial_4_text', // नवांश (D9) chart, in a user quote
    'home_this_week_subtext', // D10, D9, D2/D11 and D6 charts
    'report_career_note', // D10 chart
    'report_finance_note', // D2 and D11 charts
    'report_relationship_note', // D9 and D7 charts
    'report_health_note', // D6 chart
  ]

  it('uses कुंडली, not चार्ट, outside the allow-list', () => {
    expect(keysWith(/चार्ट/).filter(k => !CHART_ALLOWED.includes(k))).toEqual([])
  })
  it('every allow-listed चार्ट key still exists and names a specific chart', () => {
    const map = new Map(flat)
    for (const k of CHART_ALLOWED) expect(map.get(k)).toMatch(/(D\d+|नवांश) चार्ट/)
  })
  it('uses चंद्र, not चंद्रमा', () => expect(keysWith(/चंद्रमा/)).toEqual([]))
  it('uses गुरु, not बृहस्पति', () => expect(keysWith(/बृहस्पति/)).toEqual([]))
  it('uses पुनः प्रयास करें', () => expect(keysWith(/फिर से प्रयास|फिर कोशिश/)).toEqual([]))
  it('writes राजयोग as one word', () => expect(keysWith(/राज योग/)).toEqual([]))
  it('patrika_rarity has a verb', () => expect(hi.patrika_rarity).toMatch(/होता/))
  it('chart_sarvato_corner_Saturn repeats no word', () => {
    const words = hi.chart_sarvato_corner_Saturn.split(/[\s()]+/).filter(Boolean)
    expect(new Set(words).size).toBe(words.length)
  })
})
