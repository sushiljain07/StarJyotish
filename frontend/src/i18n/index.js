import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import hi from './hi.json'

const initialLang = localStorage.getItem('kundli_lang') || 'en'

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
// switched to Hindi via LanguageToggle.jsx/the footer/header toggles. Screen
// readers and search engines both read this attribute, so keep it in sync
// here rather than leaving it permanently wrong for Hindi users.
function syncHtmlLang(lng) {
  document.documentElement.lang = lng.startsWith('hi') ? 'hi' : 'en'
}
syncHtmlLang(initialLang)
i18n.on('languageChanged', syncHtmlLang)

export default i18n
