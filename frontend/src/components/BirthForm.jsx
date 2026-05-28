// frontend/src/components/BirthForm.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

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

export default function BirthForm({ onSubmit, loading }) {
  const { t } = useTranslation()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [showSug, setShowSug] = useState(false)
  const suggestions = usePlaceSuggestions(place)

  function handleSubmit(e) {
    e.preventDefault()
    if (!date || !time || !place) return
    onSubmit({ date, time, place })
  }

  const inputCls = "w-full border border-amber-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">{t('form_date')}</label>
        <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">{t('form_time')}</label>
        <input type="time" required value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-amber-900 mb-1">{t('form_place')}</label>
        <input
          type="text" required value={place} placeholder="e.g. New Delhi, India"
          onChange={e => { setPlace(e.target.value); setShowSug(true) }}
          onBlur={() => setTimeout(() => setShowSug(false), 200)}
          className={inputCls}
        />
        {showSug && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-amber-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={i} onMouseDown={() => { setPlace(s); setShowSug(false) }}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 cursor-pointer border-b border-amber-100 last:border-0">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-lg transition">
        {loading ? t('loading') : t('form_submit')}
      </button>
    </form>
  )
}
