import { useTranslation } from 'react-i18next'

// Dismissible inline status note (replaces the browser dialog).
export default function InlineNotice({ children, onDismiss, className = '' }) {
  const { t } = useTranslation()
  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-2 rounded-xl border border-line bg-parchment-card px-4 py-2 text-sm text-ink-muted motion-safe:animate-fade-in-fast ${className}`}
    >
      <span className="py-2.5">{children}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('jump_nav_close')}
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-ink-faint hover:text-ink"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  )
}
