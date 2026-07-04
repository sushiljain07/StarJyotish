// frontend/src/components/onboarding/BirthTimeSelector.jsx
//
// "Do you know the birth time?" — the one step this sprint's brief is
// most explicit about: never force it. Three accuracy levels rather than
// a plain yes/no because "approximately" is a genuinely different,
// common case (a family member who remembers "sometime in the morning"
// but not the minute) that shouldn't be forced into either a false exact
// time or a total unknown.
const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

const selCls = 'flex-1 border border-line rounded-lg px-2 py-2.5 bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer'

const ACCURACY_OPTIONS = ['exact', 'approximate', 'unknown']

export default function BirthTimeSelector({ t, accuracy, onAccuracyChange, hour, minute, ampm, onTimeChange }) {
  const showTimePicker = accuracy === 'exact' || accuracy === 'approximate'

  return (
    <div>
      <div className="space-y-2">
        {ACCURACY_OPTIONS.map(id => (
          <button
            key={id}
            onClick={() => onAccuracyChange(id)}
            aria-pressed={accuracy === id}
            className={`w-full text-left flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${
              accuracy === id ? 'border-primary bg-primary-light/50' : 'border-line bg-parchment hover:border-primary/40'
            }`}
          >
            <span className={`w-4 h-4 rounded-full border-2 shrink-0 ${accuracy === id ? 'border-primary bg-primary' : 'border-line'}`} />
            <span className="text-ink text-sm font-medium">{t(`onboarding_time_${id}`)}</span>
          </button>
        ))}
      </div>

      {showTimePicker && (
        <div className="mt-4">
          <div className="flex gap-2 items-center">
            <select value={hour} onChange={e => onTimeChange({ hour: e.target.value, minute, ampm })} className={selCls}>
              <option value="">HH</option>
              {HOURS_12.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="text-ink-faint font-bold text-lg">:</span>
            <select value={minute} onChange={e => onTimeChange({ hour, minute: e.target.value, ampm })} className={selCls}>
              <option value="">MM</option>
              {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={ampm} onChange={e => onTimeChange({ hour, minute, ampm: e.target.value })} className={selCls}>
              <option value="">AM/PM</option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          {accuracy === 'approximate' && (
            <p className="text-ink-faint text-xs mt-2">{t('onboarding_time_approximate_note')}</p>
          )}
        </div>
      )}

      {accuracy === 'unknown' && (
        <p className="text-ink-faint text-xs mt-3">{t('onboarding_time_unknown_note')}</p>
      )}
    </div>
  )
}
