import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LANGUAGES, DEFAULT_LANGUAGE, scriptFor } from './languages'

export const LANG_STORAGE_KEY = 'kundli_lang'
// Who picked the saved language: 'user' (an explicit choice on this device)
// or 'profile' (applied from the account at sign-in).
export const LANG_SOURCE_KEY = 'kundli_lang_source'
export const SUPPORTED_LANGS = LANGUAGES.map(l => l.code)

// Every ./xx.json beside this file whose code is in the registry becomes a
// resource bundle automatically.
const localeModules = import.meta.glob('./*.json', { eager: true })
const resources = {}
for (const code of SUPPORTED_LANGS) {
  const mod = localeModules[`./${code}.json`]
  if (mod) resources[code] = { translation: mod.default ?? mod }
}

// Runs at import time, before React or any error boundary exists, so a
// browser that blocks storage must not throw here.
function readSavedLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    return SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

function saveLang(lng) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lng)
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
}

export function markLanguageChosenByUser() {
  try {
    localStorage.setItem(LANG_SOURCE_KEY, 'user')
  } catch {
    // Storage blocked: nothing to remember.
  }
}

export function markLanguageFromProfile() {
  try {
    localStorage.setItem(LANG_SOURCE_KEY, 'profile')
  } catch {
    // Storage blocked: nothing to remember.
  }
}

// A saved code with no source predates this key: the old footer toggle was
// the only way to set it, so it was a user choice.
export function savedLanguageChoice() {
  try {
    const code = localStorage.getItem(LANG_STORAGE_KEY)
    if (!code) return { code: null, source: null }
    const source = localStorage.getItem(LANG_SOURCE_KEY) === 'profile' ? 'profile' : 'user'
    return { code, source }
  } catch {
    return { code: null, source: null }
  }
}

const initialLang = readSavedLang()

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
})

// index.html hardcodes lang="en" since it's static markup served before any
// JS runs. Screen readers and search engines read lang, and CSS keys the
// font stack off data-script, so keep both in sync with the active language.
function syncHtmlLang(lng) {
  const base = String(lng).toLowerCase().split('-')[0]
  const code = SUPPORTED_LANGS.includes(base) ? base : DEFAULT_LANGUAGE
  document.documentElement.lang = code
  document.documentElement.dataset.script = scriptFor(code)
}
syncHtmlLang(initialLang)
i18n.on('languageChanged', lng => {
  syncHtmlLang(lng)
  saveLang(lng)
})

export default i18n
