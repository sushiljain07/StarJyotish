import { useTranslation } from 'react-i18next'

const TAB_IDS = ['today', 'week', 'month']
const TAB_KEYS = { today: 'tab_today', week: 'tab_this_week', month: 'tab_this_month' }

export default function TabsBar({ active, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-1.5">
      {TAB_IDS.map(id => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`text-[13px] font-semibold px-4 py-2 rounded-full border transition ${
            active === id
              ? 'bg-night text-primary-light border-night'
              : 'border-line text-ink-muted hover:border-primary/50 hover:text-primary-dark'
          }`}
        >
          {t(TAB_KEYS[id])}
        </button>
      ))}
    </div>
  )
}
