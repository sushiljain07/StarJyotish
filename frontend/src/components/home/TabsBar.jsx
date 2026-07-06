import { useTranslation } from 'react-i18next'

const TABS = [
  { id: 'today', key: 'tab_today_v2' },
  { id: 'week',  key: 'tab_guidance' },
  { id: 'month', key: 'tab_learn'    },
]

export default function TabsBar({ active, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-1">
      {TABS.map(({ id, key }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`text-[12px] font-bold tracking-widest uppercase px-5 py-2 rounded-full transition ${
            active === id
              ? 'bg-night text-primary-light'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          {t(key)}
        </button>
      ))}
    </div>
  )
}
