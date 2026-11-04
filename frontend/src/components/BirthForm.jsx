// frontend/src/components/BirthForm.jsx
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlaceSuggestions } from '../hooks/usePlaceSuggestions'
import { isValidBirthDate } from '../utils/birthDate'
import { UNKNOWN_BIRTH_TIME_DEFAULT } from '../services/astrologyProfiles'
import BirthTimeSelector from './onboarding/BirthTimeSelector'
import PlaceCombobox from './PlaceCombobox'
import { Button } from './ui'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const currentYear = new Date().getFullYear()
const YEARS  = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1)

const selCls = "flex-1 border border-line rounded-lg px-2 py-2 bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
const inputCls = "w-full border border-line rounded-lg px-3 py-2 bg-parchment text-ink focus:outline-none focus:ring-2 focus:ring-primary"
const labelCls = "block text-sm font-medium text-ink mb-1"

export default function BirthForm({ onSubmit, loading }) {
  const { t } = useTranslation()
  const ids = useId()

  const [name,   setName]   = useState('')

  // Date parts
  const [day,   setDay]   = useState('')
  const [month, setMonth] = useState('')
  const [year,  setYear]  = useState('')

  // Time: accuracy decides whether the time pickers are needed at all
  const [accuracy, setAccuracy] = useState('exact')
  const [time, setTime] = useState({ hour: '', minute: '', ampm: '' })

  const [place, setPlace] = useState('')
  // True once a suggestion is picked; typing again clears it. A pick is
  // required only while suggestions are on offer: with none (service down
  // or a rare town) free text is fine, the backend geocodes it.
  const [placePicked, setPlacePicked] = useState(false)
  const suggestions = usePlaceSuggestions(place)

  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const needsTime = accuracy !== 'unknown'
    if (!day || !month || !year || !place) return
    if (needsTime && (!time.hour || !time.minute || !time.ampm)) {
      setError(t('form_error_time'))
      return
    }
    if (!placePicked && suggestions.length > 0) {
      setError(t('form_error_pick_place'))
      return
    }

    const y = Number(year), m = Number(month), d = Number(day)
    if (!isValidBirthDate(y, m, d)) {
      const exists = isValidBirthDate(y, m, d, new Date(9999, 0, 1))
      setError(t(exists ? 'form_error_future_date' : 'form_error_invalid_date'))
      return
    }
    const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`

    let timeStr = UNKNOWN_BIRTH_TIME_DEFAULT
    if (needsTime) {
      // Convert 12-hr AM/PM to 24-hr HH:MM
      let h = parseInt(time.hour, 10)
      if (time.ampm === 'AM' && h === 12) h = 0
      if (time.ampm === 'PM' && h !== 12) h += 12
      timeStr = `${String(h).padStart(2,'0')}:${time.minute}`
    }
    onSubmit({ date: dateStr, time: timeStr, place, name, timeAccuracy: accuracy })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Name ── */}
      <div>
        <label htmlFor={`${ids}-name`} className={labelCls}>
          {t('form_name')}
        </label>
        <input
          id={`${ids}-name`}
          type="text" required value={name} placeholder="e.g. Arjun Sharma"
          onChange={e => setName(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* ── Date ── */}
      <fieldset>
        <legend className={labelCls}>{t('form_date')}</legend>
        <div className="flex gap-2">
          <select aria-label="Day" value={day} onChange={e => setDay(e.target.value)} required className={selCls}>
            <option value="">Day</option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select aria-label="Month" value={month} onChange={e => setMonth(e.target.value)} required className={`${selCls} flex-[2]`}>
            <option value="">Month</option>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select aria-label="Year" value={year} onChange={e => setYear(e.target.value)} required className={`${selCls} flex-[1.5]`}>
            <option value="">Year</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </fieldset>

      {/* ── Time ── */}
      <fieldset>
        <legend className={labelCls}>{t('form_time')}</legend>
        <p className="text-xs text-ink-muted mb-2">{t('form_time_accuracy_label')}</p>
        <BirthTimeSelector
          t={t}
          accuracy={accuracy}
          onAccuracyChange={setAccuracy}
          hour={time.hour}
          minute={time.minute}
          ampm={time.ampm}
          onTimeChange={setTime}
        />
      </fieldset>

      {/* ── Place ── */}
      <div>
        <label htmlFor={`${ids}-place`} className={labelCls}>
          {t('form_place')}
        </label>
        <PlaceCombobox
          id={`${ids}-place`}
          required
          value={place}
          items={suggestions}
          placeholder="e.g. New Delhi, India"
          className={inputCls}
          onInputChange={text => { setPlace(text); setPlacePicked(false) }}
          onSelect={item => { setPlace(item); setPlacePicked(true) }}
        />
      </div>

      {error && <p role="alert" className="text-sm text-vermillion">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t('loading') : t('form_submit')}
      </Button>
    </form>
  )
}
