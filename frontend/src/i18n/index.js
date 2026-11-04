import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import hi from './hi.json'

export const LANG_STORAGE_KEY = 'kundli_lang'
export const SUPPORTED_LANGS = ['en', 'hi']

// Runs at import time, before React or any error boundary exists, so a
// browser that blocks storage must not throw here.
function readSavedLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    return SUPPORTED_LANGS.includes(saved) ? saved : 'en'
  } catch {
    return 'en'
  }
}

function saveLang(lng) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lng)
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
}

const initialLang = readSavedLang()

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

// index.html hardcodes lang="en" since it's static markup served before any
// JS runs — correct for the default case, but it never updated when someone
// switched to Hindi via the language toggles. Screen
// readers and search engines both read this attribute, so keep it in sync
// here rather than leaving it permanently wrong for Hindi users.
function syncHtmlLang(lng) {
  document.documentElement.lang = lng.startsWith('hi') ? 'hi' : 'en'
}
syncHtmlLang(initialLang)
i18n.on('languageChanged', lng => {
  syncHtmlLang(lng)
  saveLang(lng)
})

export default i18n
