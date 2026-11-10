// The language toggle must survive a reload, and a browser that blocks
// storage must not stop the app from loading (this module runs at import
// time, before any error boundary exists).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => vi.resetModules())
afterEach(() => vi.restoreAllMocks())

describe('i18n language persistence', () => {
  it('saves the language when it changes', async () => {
    const { default: i18n } = await import('./index')
    await i18n.changeLanguage('hi')
    expect(localStorage.getItem('kundli_lang')).toBe('hi')
  })

  it('starts in the saved language', async () => {
    localStorage.setItem('kundli_lang', 'hi')
    const { default: i18n } = await import('./index')
    expect(i18n.language).toBe('hi')
  })

  it('falls back to English for an unsupported saved value', async () => {
    localStorage.setItem('kundli_lang', 'fr')
    const { default: i18n } = await import('./index')
    expect(i18n.language).toBe('en')
  })

  it('still loads when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    const { default: i18n } = await import('./index')
    expect(i18n.language).toBe('en')
    await expect(i18n.changeLanguage('hi')).resolves.toBeDefined()
  })

  it('reads the registry at call time, so a runtime-registered language is honoured', async () => {
    const { LANGUAGES, registerLanguage } = await import('./languages')
    const before = [...LANGUAGES]
    try {
      registerLanguage({ code: 'xx', label: 'XX', nativeName: 'Xxish', locale: 'xx', script: 'latn' })
      localStorage.setItem('kundli_lang', 'xx')
      const { readSavedLang } = await import('./index')
      expect(readSavedLang()).toBe('xx')
    } finally {
      LANGUAGES.splice(0, LANGUAGES.length, ...before)
    }
  })

  it('reports no saved choice when storage throws', async () => {
    const { savedLanguageChoice } = await import('./index')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    expect(savedLanguageChoice()).toEqual({ code: null, source: null })
  })
})
