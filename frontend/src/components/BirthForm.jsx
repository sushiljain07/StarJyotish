// frontend/src/components/BirthForm.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const currentYear = new Date().getFullYear()
const YEARS  = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1)
const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, '0'))
const MINUTES  = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

function usePlaceSuggestions(query) {
  const [suggestions, setSuggestions] = useState([])
  const timer = useRef(null)

  useEffect(() => {
    if (query.length < 3) { setSuggestions([]); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await resp.json()
        setSuggestions(data.map(d => d.display_name))
      } catch {
        setSuggestions([])
      }
    }, 400)
    return () => clearTimeout(timer.current)
  }, [query])

  return suggestions
}

const selCls = "flex-1 border border-slate-200 rounded-lg px-2 py-2 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"

export default function BirthForm({ onSubmit, loading }) {
  const { t } = useTranslation()

  // Date parts
  const [day,   setDay]   = useState('')
  const [month, setMonth] = useState('')
  const [year,  setYear]  = useState('')

  // Time parts
  const [hour,   setHour]   = useState('')
  const [minute, setMinute] = useState('')
  const [ampm,   setAmpm]   = useState('')

  const [place,   setPlace]   = useState('')
  const [showSug, setShowSug] = useState(false)
  const suggestions = usePlaceSuggestions(place)

  function handleSubmit(e) {
    e.preventDefault()
    if (!day || !month || !year || !hour || !minute || !ampm || !place) return
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    // Convert 12-hr AM/PM to 24-hr HH:MM
    let h = parseInt(hour, 10)
    if (ampm === 'AM' && h === 12) h = 0
    if (ampm === 'PM' && h !== 12) h += 12
    const timeStr = `${String(h).padStart(2,'0')}:${minute}`
    onSubmit({ date: dateStr, time: timeStr, place })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Date ── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('form_date')}
        </label>
        <div className="flex gap-2">
          {/* Day */}
          <select value={day} onChange={e => setDay(e.target.value)} required className={selCls}>
            <option value="">Day</option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Month */}
          <select value={month} onChange={e => setMonth(e.target.value)} required className={`${selCls} flex-[2]`}>
            <option value="">Month</option>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>

          {/* Year */}
          <select value={year} onChange={e => setYear(e.target.value)} required className={`${selCls} flex-[1.5]`}>
            <option value="">Year</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── Time ── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('form_time')}
        </label>
        <div className="flex gap-2 items-center">
          <select value={hour} onChange={e => setHour(e.target.value)} required className={selCls}>
            <option value="">HH</option>
            {HOURS_12.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <span className="text-slate-400 font-bold text-lg">:</span>
          <select value={minute} onChange={e => setMinute(e.target.value)} required className={selCls}>
            <option value="">MM</option>
            {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={ampm} onChange={e => setAmpm(e.target.value)} required className={selCls}>
            <option value="">AM/PM</option>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      {/* ── Place ── */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('form_place')}
        </label>
        <input
          type="text" required value={place} placeholder="e.g. New Delhi, India"
          onChange={e => { setPlace(e.target.value); setShowSug(true) }}
          onBlur={() => setTimeout(() => setShowSug(false), 200)}
          className={inputCls}
        />
        {showSug && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={i} onMouseDown={() => { setPlace(s); setShowSug(false) }}
                className="px-3 py-2 text-sm text-slate-700 hover:bg-primary-light cursor-pointer border-b border-slate-100 last:border-0">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-full transition">
        {loading ? t('loading') : t('form_submit')}
      </button>
    </form>
  )
}
