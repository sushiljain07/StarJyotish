// frontend/src/components/layout/SkipLink.jsx
//
// First focusable element on every page: lets keyboard and screen-reader
// users jump past the header/nav straight to <main id="main" tabIndex={-1}>.
// The click is handled here so the router never sees a "#main" navigation;
// the href stays for no-JS and for "copy link".
import { useTranslation } from 'react-i18next'

export default function SkipLink() {
  const { t } = useTranslation()
  return (
    <a
      href="#main"
      onClick={e => {
        e.preventDefault()
        const main = document.getElementById('main')
        main?.focus()
        main?.scrollIntoView?.()
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-night focus:font-semibold focus:shadow-lg"
    >
      {t('skip_to_content')}
    </a>
  )
}
