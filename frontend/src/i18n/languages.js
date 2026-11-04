// The single frontend registry of supported languages. Adding a language is
// one locale file (xx.json beside en.json) plus one entry here; nothing else
// in the app compares against a language code. See docs/i18n.md.
import i18n from 'i18next'

export const LANGUAGES = [
  { code: 'en', label: 'EN', nativeName: 'English', locale: 'en-IN', script: 'latn' },
  { code: 'hi', label: 'हि', nativeName: 'हिन्दी', locale: 'hi-IN', script: 'deva', scriptRange: /[ऀ-ॿ]/ },
]

export const DEFAULT_LANGUAGE = 'en'

export function languageEntry(code) {
  return LANGUAGES.find(l => l.code === code) ?? LANGUAGES.find(l => l.code === DEFAULT_LANGUAGE)
}

// i18n.language can be a regional variant ('hi-IN'); map it to the registry.
export function currentLanguage() {
  const base = String(i18n.language ?? '').toLowerCase().split('-')[0]
  return LANGUAGES.some(l => l.code === base) ? base : DEFAULT_LANGUAGE
}

export const localeFor = code => languageEntry(code).locale
export const scriptFor = code => languageEntry(code).script

// For tests and future plugins; replaces an existing entry with the same code.
export function registerLanguage(entry) {
  const i = LANGUAGES.findIndex(l => l.code === entry.code)
  if (i >= 0) LANGUAGES.splice(i, 1)
  LANGUAGES.push(entry)
}
