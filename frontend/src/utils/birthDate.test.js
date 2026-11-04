import { describe, expect, it } from 'vitest'
import { isValidBirthDate } from './birthDate'

const TODAY = new Date(2026, 10, 4) // 4 Nov 2026, local

describe('isValidBirthDate', () => {
  it('rejects a day that does not exist in the month', () => {
    expect(isValidBirthDate(1990, 2, 31, TODAY)).toBe(false)
  })
  it('accepts 29 Feb in a leap year and rejects it otherwise', () => {
    expect(isValidBirthDate(2000, 2, 29, TODAY)).toBe(true)
    expect(isValidBirthDate(1900, 2, 29, TODAY)).toBe(false)
  })
  it('accepts today and rejects tomorrow', () => {
    expect(isValidBirthDate(2026, 11, 4, TODAY)).toBe(true)
    expect(isValidBirthDate(2026, 11, 5, TODAY)).toBe(false)
  })
})
