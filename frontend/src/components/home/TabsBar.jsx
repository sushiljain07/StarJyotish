// frontend/src/components/home/TabsBar.jsx
//
// Sticky section navigator on desktop. Three sections: Today, Guidance,
// and This Month. Active tab gets a pill background; inactive tabs are
// muted text. Full-width underline variant replaced by pill to match the
// rounded language used across the page.
import { useTranslation } from 'react-i18next'

const TABS = [
  { id: 'today', key: 'tab_today_v2' },
  { id: 'week',  key: 'tab_guidance' },
  { id: 'month', key: 'tab_learn'    },
]

export default function TabsBar({ active, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-1 p-1 bg-parchment-card border border-line rounded-full w-fit">
      {TABS.map(({ id, key }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`text-[11px] font-bold tracking-widest uppercase px-5 py-2 rounded-full transition-all ${
            active === id
              ? 'bg-night text-primary-light shadow-sm'
              : 'text-ink-muted hover:text-ink hover:bg-parchment'
          }`}
        >
          {t(key)}
        </button>
      ))}
    </div>
  )
}
