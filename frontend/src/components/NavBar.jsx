import { useTranslation } from 'react-i18next'

const NAV_ITEMS = [
  { key: 'birth_chart', icon: '🔯' },
  { key: 'navamsa',     icon: '⭕' },
  { key: 'dasha',       icon: '📅' },
  { key: 'planets',     icon: '🪐' },
  { key: 'reading',     icon: '✨' },
  { key: 'ask',         icon: '💬' },
]

export default function NavBar({ activeTab, onTabChange }) {
  const { t } = useTranslation()

  return (
    <>
      {/* Mobile: fixed bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
        <div className="flex justify-around items-center py-2">
          {NAV_ITEMS.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-0"
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className={`text-[10px] font-medium leading-none truncate ${
                activeTab === key ? 'text-primary' : 'text-slate-400'
              }`}>
                {t(`tab_${key}`)}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop: inline top nav (rendered inside header by Result.jsx) */}
      <div className="hidden sm:flex gap-1">
        {NAV_ITEMS.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t transition-colors ${
              activeTab === key
                ? 'bg-white/20 text-white border-b-2 border-white'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{icon}</span>
            <span>{t(`tab_${key}`)}</span>
          </button>
        ))}
      </div>
    </>
  )
}
