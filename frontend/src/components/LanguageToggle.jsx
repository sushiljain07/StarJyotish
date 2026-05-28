// frontend/src/components/LanguageToggle.jsx
import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'

  function toggle() {
    const next = isHindi ? 'en' : 'hi'
    i18n.changeLanguage(next)
    localStorage.setItem('kundli_lang', next)
  }

  return (
    <button
      onClick={toggle}
      className="text-sm font-medium text-amber-800 border border-amber-400 rounded px-3 py-1 hover:bg-amber-100 transition"
    >
      {isHindi ? 'EN' : 'हि'}
    </button>
  )
}
