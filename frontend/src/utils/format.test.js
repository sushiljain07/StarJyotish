import { describe, it, expect, afterEach } from 'vitest'
import i18n from '../i18n'
import { formatDate, formatNumber, houseOrdinal } from './format'

afterEach(() => i18n.changeLanguage('en'))

describe('formatDate with options', () => {
  it('formats in English', () => {
    expect(formatDate('2026-11-04', { day: 'numeric', month: 'long' })).toBe('4 November')
  })
  it('formats in Hindi', async () => {
    await i18n.changeLanguage('hi')
    expect(formatDate('2026-11-04', { day: 'numeric', month: 'long' })).toBe('4 नवंबर')
  })
  it('accepts a Date', () => {
    expect(formatDate(new Date(2026, 10, 4), { day: 'numeric', month: 'long' })).toBe('4 November')
  })
  it('keeps the legacy DD-MM-YYYY with no options', () => {
    expect(formatDate('2026-11-04')).toBe('04-11-2026')
  })
})

describe('formatNumber', () => {
  it('uses the current locale', () => {
    expect(formatNumber(1234.5)).toBe('1,234.5')
  })
})

describe('houseOrdinal', () => {
  it('writes houses 1–6 as Hindi words and keeps 7+ as digits', async () => {
    await i18n.changeLanguage('hi')
    const t = i18n.t.bind(i18n)
    expect([1, 2, 3, 4, 5, 6].map((n) => houseOrdinal(t, n, { oblique: true })))
      .toEqual(['पहले', 'दूसरे', 'तीसरे', 'चौथे', 'पाँचवें', 'छठे'])
    expect([1, 2, 3, 4, 5, 6].map((n) => houseOrdinal(t, n)))
      .toEqual(['पहला', 'दूसरा', 'तीसरा', 'चौथा', 'पाँचवाँ', 'छठा'])
    expect(houseOrdinal(t, 7, { oblique: true })).toBe('7वें')
    expect(houseOrdinal(t, 10)).toBe('10वाँ')
  })
  it('is unchanged in English', () => {
    const t = i18n.t.bind(i18n)
    expect([1, 2, 3, 4, 7, 11, 12].map((n) => houseOrdinal(t, n)))
      .toEqual(['1st', '2nd', '3rd', '4th', '7th', '11th', '12th'])
  })
})
