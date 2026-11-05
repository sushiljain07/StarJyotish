// The legal pages are published in English only, and the English text is the
// one that counts. The note is a locale string that is empty in English, so
// English readers see nothing and no language is named here.
import { useTranslation } from 'react-i18next'

export default function LegalLanguageNote() {
  const { t } = useTranslation()
  const note = t('legal_english_note')
  if (!note) return null
  return (
    <p
      data-testid="legal-language-note"
      className="bg-primary-light border border-primary/30 rounded-xl px-4 py-3 text-ink text-xs leading-relaxed"
    >
      {note}
    </p>
  )
}
