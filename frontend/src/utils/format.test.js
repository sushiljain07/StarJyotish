import { describe, it, expect, afterEach } from 'vitest'
import i18n from '../i18n'
import { formatDate, formatNumber } from './format'

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
