import { describe, expect, it } from 'vitest'
import i18n from './index'

describe('ask_questions_remaining plural', () => {
  it('singular and plural in English', async () => {
    await i18n.changeLanguage('en')
    expect(i18n.t('ask_questions_remaining', { count: 1 })).toBe('1 question remaining')
    expect(i18n.t('ask_questions_remaining', { count: 5 })).toBe('5 questions remaining')
  })
  it('Hindi reads the same for one and many', async () => {
    await i18n.changeLanguage('hi')
    expect(i18n.t('ask_questions_remaining', { count: 1 })).toBe('1 प्रश्न शेष')
    expect(i18n.t('ask_questions_remaining', { count: 5 })).toBe('5 प्रश्न शेष')
    await i18n.changeLanguage('en')
  })
})
