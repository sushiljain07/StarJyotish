import { afterEach, describe, expect, it } from 'vitest'
import i18n from './index'
import en from './en.json'
import {
  LANGUAGES, DEFAULT_LANGUAGE, currentLanguage, localeFor, scriptFor, languageEntry, registerLanguage,
} from './languages'

afterEach(async () => { await i18n.changeLanguage('en') })

describe('language registry', () => {
  it('maps a regional variant to its registry code', async () => {
    await i18n.changeLanguage('hi-IN')
    expect(currentLanguage()).toBe('hi')
  })

  it('falls back to the default for an unregistered language', async () => {
    await i18n.changeLanguage('fr')
    expect(currentLanguage()).toBe(DEFAULT_LANGUAGE)
  })

  it('exposes locale, script and entry lookups', () => {
    expect(localeFor('hi')).toBe('hi-IN')
    expect(scriptFor('hi')).toBe('deva')
    expect(languageEntry('zz').code).toBe('en')
  })

  it('syncs <html lang> and data-script on change', async () => {
    await i18n.changeLanguage('hi')
    expect(document.documentElement.lang).toBe('hi')
    expect(document.documentElement.dataset.script).toBe('deva')
  })

  it('a registered language needs no other code change', async () => {
    registerLanguage({ code: 'xx', label: 'XX', nativeName: 'Pseudo', locale: 'en-GB', script: 'latn' })
    try {
      i18n.addResourceBundle('xx', 'translation', { ...en })
      await i18n.changeLanguage('xx')
      expect(currentLanguage()).toBe('xx')
      expect(localeFor('xx')).toBe('en-GB')
    } finally {
      await i18n.changeLanguage('en')
      LANGUAGES.splice(LANGUAGES.findIndex(l => l.code === 'xx'), 1)
    }
    expect(LANGUAGES.some(l => l.code === 'xx')).toBe(false)
  })

  it('falls back to the default locale and script for an unknown code', () => {
    expect(localeFor('zz')).toBe('en-IN')
    expect(scriptFor('zz')).toBe('latn')
  })

  it('replaces an entry registered twice with the second one', () => {
    const before = [...LANGUAGES]
    try {
      registerLanguage({ code: 'hi', label: 'H2', nativeName: 'Hindi2', locale: 'hi-IN', script: 'deva' })
      expect(LANGUAGES.filter(l => l.code === 'hi')).toHaveLength(1)
      expect(languageEntry('hi').label).toBe('H2')
    } finally {
      LANGUAGES.splice(0, LANGUAGES.length, ...before)
    }
  })
})
