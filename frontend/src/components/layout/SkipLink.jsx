// frontend/src/components/layout/SkipLink.jsx
//
// First focusable element on every page: lets keyboard and screen-reader
// users jump past the header/nav straight to <main id="main">.
import { useTranslation } from 'react-i18next'

export default function SkipLink() {
  const { t } = useTranslation()
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-night focus:font-semibold focus:shadow-lg"
    >
      {t('skip_to_content')}
    </a>
  )
}
