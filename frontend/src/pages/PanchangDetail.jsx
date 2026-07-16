// frontend/src/pages/PanchangDetail.jsx
//
// Public page — no auth required. Three tabs:
//   Today      — full daily Panchang, date picker defaults to today
//   This Week  — 7-day strip (today + 6 days), compact table
//   This Month — Hindu lunar month (Chandramasa), from last Pratipada
//                to next Amavasya, labelled by Masa name (Shravan etc.)
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { usePanchang } from '../hooks/usePanchang'
import { usePlaceMatches } from '../hooks/usePlaceMatches'
import { fetchPanchangWeek, fetchPanchangHinduMonth } from '../api/astro'
import {
  requestBrowserLocation, setCurrentLocation,
  getCurrentLocation, isLocationStale,
} from '../services/currentLocation'

// ─── date helpers ─────────────────────────────────────────────────────────────

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatLong(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatShort(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Anga({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-line bg-parchment-card px-4 py-3.5">
      <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-1.5">{label}</p>
      <p className="font-serif text-[15px] font-semibold text-ink">{value ?? '—'}</p>
      {sub && <p className="text-[11px] text-ink-muted mt-0.5">{sub}</p>}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-b-0">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-semibold text-ink tabular-nums">{value ?? '—'}</span>
    </div>
  )
}

// ─── Location picker ──────────────────────────────────────────────────────────

function LocationPicker({ location, onSetLocation }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [geoStatus, setGeoStatus] = useState('idle')
  const matches = usePlaceMatches(query)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  function pick(place) {
    onSetLocation({ lat: place.lat, lon: place.lon, label: place.display_name, timezone: place.timezone })
    setOpen(false); setQuery('')
  }

  async function useDevice() {
    setGeoStatus('requesting')
    try {
      const { lat, lon, timezone } = await requestBrowserLocation()
      onSetLocation({ lat, lon, label: null, timezone })
      setCurrentLocation(null, { lat, lon, label: null, timezone, source: 'geolocation' })
      setOpen(false)
    } catch { setGeoStatus('denied') }
  }

  const label = location?.label ?? (location ? `${location.lat.toFixed(1)}°, ${location.lon.toFixed(1)}°` : 'Set location')

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm font-semibold text-primary-light hover:text-primary transition"
      >
        <span>📍</span>
        <span className="max-w-[220px] truncate">{label}</span>
        <span className="text-ink-onnight/40 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-30 bg-parchment-card border border-line rounded-2xl shadow-xl p-4 w-80">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">Choose city</p>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search city, e.g. Raigarh, Mumbai…"
            className="w-full border border-line rounded-xl px-3 py-2 text-sm bg-parchment text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {matches.length > 0 && (
            <ul className="mt-1 max-h-44 overflow-y-auto rounded-xl border border-line bg-parchment">
              {matches.map((m, i) => (
                <li key={i}>
                  <button onClick={() => pick(m)} className="w-full text-left px-3 py-2.5 text-xs text-ink hover:bg-primary-light transition">
                    {m.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center gap-3">
            <button onClick={useDevice} disabled={geoStatus === 'requesting'}
              className="text-xs text-primary-dark font-semibold hover:underline disabled:opacity-50">
              {geoStatus === 'requesting' ? 'Detecting…' : '⌖ Use my location'}
            </button>
            {geoStatus === 'denied' && <span className="text-xs text-vermillion">Blocked</span>}
            <button onClick={() => { setOpen(false); setQuery('') }} className="ml-auto text-xs text-ink-faint hover:underline">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Styled date picker ───────────────────────────────────────────────────────

function DatePicker({ value, onChange }) {
  const today = todayISO()
  const inputRef = useRef(null)
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.click()}
        className="flex items-center gap-1.5 text-sm font-semibold text-primary-light hover:text-primary transition"
      >
        <span>📅</span>
        <span>{value === today ? 'Today' : formatShort(value)}</span>
        <span className="text-ink-onnight/40 text-xs">▾</span>
      </button>
      <input ref={inputRef} type="date" value={value} max={today}
        onChange={e => e.target.value && onChange(e.target.value)}
        className="sr-only" tabIndex={-1} aria-hidden="true" />
      {value !== today && (
        <button onClick={() => onChange(today)} className="text-xs text-ink-onnight/40 hover:text-primary-light hover:underline transition">
          Today
        </button>
      )}
    </div>
  )
}

// ─── No-location prompt ───────────────────────────────────────────────────────

function LocationPrompt({ onSetLocation }) {
  const [query, setQuery] = useState('')
  const [geoStatus, setGeoStatus] = useState('idle')
  const matches = usePlaceMatches(query)

  function pick(place) {
    onSetLocation({ lat: place.lat, lon: place.lon, label: place.display_name, timezone: place.timezone })
  }
  async function useDevice() {
    setGeoStatus('requesting')
    try {
      const { lat, lon, timezone } = await requestBrowserLocation()
      onSetLocation({ lat, lon, label: null, timezone })
      setCurrentLocation(null, { lat, lon, label: null, timezone, source: 'geolocation' })
    } catch { setGeoStatus('denied') }
  }

  return (
    <div className="rounded-2xl border border-line bg-parchment-card px-6 py-10 text-center max-w-sm mx-auto">
      <div className="text-4xl mb-3">🌍</div>
      <h2 className="font-serif text-lg font-semibold text-ink mb-1">Where are you?</h2>
      <p className="text-sm text-ink-muted mb-5">Panchang timings are location-specific.</p>
      <div className="relative">
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search city, e.g. Raigarh…"
          className="w-full border border-line rounded-xl px-4 py-2.5 text-sm bg-parchment text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary" />
        {matches.length > 0 && (
          <ul className="absolute left-0 right-0 top-full mt-1 z-20 max-h-48 overflow-y-auto rounded-xl border border-line bg-parchment-card shadow-xl text-left">
            {matches.map((m, i) => (
              <li key={i}>
                <button onClick={() => pick(m)} className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-primary-light transition">
                  {m.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={useDevice} disabled={geoStatus === 'requesting'}
        className="mt-4 text-sm text-primary-dark font-semibold hover:underline disabled:opacity-50">
        {geoStatus === 'requesting' ? 'Detecting…' : '⌖ Use my current location'}
      </button>
      {geoStatus === 'denied' && <p className="text-xs text-vermillion mt-2">Blocked — search above.</p>}
    </div>
  )
}

// ─── Compact multi-day table (used by Week and Hindu Month tabs) ──────────────

const PAKSHA_DOT = { Shukla: 'bg-amber-400/80', Krishna: 'bg-slate-400/40' }

function PanchangTable({ days, highlightToday = true }) {
  const todayStr = todayISO()
  return (
    <div className="rounded-xl border border-line bg-parchment-card overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-[3rem_1fr_1fr_auto] sm:grid-cols-[3rem_1fr_1fr_1fr_auto] gap-0 px-4 py-2 bg-parchment border-b border-line">
        {['Date','Tithi','Nakshatra','Yoga','Sunrise'].map((h, i) => (
          <span key={h} className={`text-[10px] font-bold uppercase tracking-wider text-ink-faint ${i === 3 ? 'hidden sm:block' : ''}`}>{h}</span>
        ))}
      </div>

      {days.map((day, i) => {
        const iso = day.date
        const isToday = highlightToday && iso === todayStr
        const tithiName = day.tithi?.name ?? day.tithi
        const paksha = day.tithi?.paksha
        const tithiEnd = day.tithi?.ends_at
        const nakName = typeof day.nakshatra === 'object' ? day.nakshatra?.name : day.nakshatra
        const nakEnd = typeof day.nakshatra === 'object' ? day.nakshatra?.ends_at : null
        const dd = iso ? parseInt(iso.split('-')[2], 10) : i + 1

        return (
          <div key={i}
            className={`grid grid-cols-[3rem_1fr_1fr_auto] sm:grid-cols-[3rem_1fr_1fr_1fr_auto] gap-0 px-4 py-2.5 border-b border-line/50 last:border-b-0 ${
              isToday ? 'bg-primary-light/50' : 'hover:bg-parchment transition'
            }`}
          >
            {/* Date */}
            <div className="flex flex-col justify-center">
              <span className={`text-sm font-bold tabular-nums leading-tight ${isToday ? 'text-primary-dark' : 'text-ink'}`}>{dd}</span>
              <span className="text-[10px] text-ink-faint leading-tight">{day.weekday?.slice(0, 3)}</span>
            </div>

            {/* Tithi */}
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                {paksha && <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${PAKSHA_DOT[paksha] ?? 'bg-ink-faint'}`} />}
                <span className="font-serif text-[12px] font-medium text-ink truncate">{tithiName}</span>
              </div>
              {tithiEnd && <span className="text-[10px] text-ink-faint truncate">ends {tithiEnd}</span>}
            </div>

            {/* Nakshatra */}
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span className="text-[12px] text-ink truncate">{nakName}</span>
              {nakEnd && <span className="text-[10px] text-ink-faint truncate">ends {nakEnd}</span>}
            </div>

            {/* Yoga — hidden on mobile */}
            <div className="hidden sm:flex flex-col justify-center min-w-0 pr-2">
              <span className="text-[12px] text-ink truncate">{day.yoga}</span>
            </div>

            {/* Sunrise */}
            <div className="flex flex-col justify-center text-right">
              <span className="text-[11px] text-ink-muted tabular-nums">{day.sunrise}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Today tab ────────────────────────────────────────────────────────────────

function TodayTab({ location, date, onSetLocation }) {
  const isToday = date === todayISO()
  const { data, loading, error } = usePanchang(location, isToday ? undefined : date)

  if (!location) return <LocationPrompt onSetLocation={onSetLocation} />

  return (
    <div className="space-y-6">
      {loading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-line animate-pulse" />)}</div>}
      {error && <div className="rounded-xl border border-vermillion/30 bg-vermillion-light px-4 py-3 text-sm text-vermillion">Couldn't load panchang. Try again in a moment.</div>}
      {data && (
        <>
          {/* Masa badge */}
          {data.masa && (
            <div className="inline-flex items-center gap-2 bg-primary-light border border-primary/30 rounded-full px-3 py-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">🌙 {data.masa} Masa</span>
            </div>
          )}

          <section>
            <h2 className="text-[11px] uppercase tracking-widest text-primary-dark font-bold mb-3">Pancha Anga</h2>
            <div className="grid grid-cols-2 gap-2.5">
              <Anga label="Tithi" value={data.tithi?.name}
                sub={[
                  data.tithi?.paksha ? `${data.tithi.paksha} Paksha` : null,
                  data.tithi?.ends_at ? `ends ${data.tithi.ends_at}` : null,
                ].filter(Boolean).join(' · ')} />
              <Anga label="Nakshatra"
                value={typeof data.nakshatra === 'object' ? data.nakshatra?.name : data.nakshatra}
                sub={data.nakshatra?.ends_at ? `ends ${data.nakshatra.ends_at}` : null} />
              <Anga label="Yoga" value={data.yoga} />
              <Anga label="Karana" value={data.karana} />
              <Anga label="Vara (Day)" value={data.weekday} />
              <Anga label="Timezone" value={data.timezone} />
            </div>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-widest text-primary-dark font-bold mb-3">Sky Timings</h2>
            <div className="rounded-xl border border-line bg-parchment-card px-4">
              <Row label="🌅 Sunrise" value={data.sunrise} />
              <Row label="🌇 Sunset" value={data.sunset} />
              <Row label="🌕 Moonrise" value={data.moonrise} />
              <Row label="🌑 Moonset" value={data.moonset} />
            </div>
          </section>

          {data.muhurtas && (
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-primary-dark font-bold mb-3">Auspicious & Inauspicious Windows</h2>
              <div className="rounded-xl border border-line bg-parchment-card px-4">
                {data.muhurtas.abhijit_muhurta && (
                  <Row label={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sage inline-block shrink-0" />Abhijit Muhurta</span>}
                    value={`${data.muhurtas.abhijit_muhurta.start} – ${data.muhurtas.abhijit_muhurta.end}`} />
                )}
                {data.muhurtas.rahu_kaal && (
                  <Row label={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-vermillion inline-block shrink-0" />Rahu Kaal</span>}
                    value={`${data.muhurtas.rahu_kaal.start} – ${data.muhurtas.rahu_kaal.end}`} />
                )}
                {data.muhurtas.yamaganda && (
                  <Row label={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-vermillion/60 inline-block shrink-0" />Yamaganda</span>}
                    value={`${data.muhurtas.yamaganda.start} – ${data.muhurtas.yamaganda.end}`} />
                )}
                {data.muhurtas.gulika_kaal && (
                  <Row label={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-vermillion/40 inline-block shrink-0" />Gulika Kaal</span>}
                    value={`${data.muhurtas.gulika_kaal.start} – ${data.muhurtas.gulika_kaal.end}`} />
                )}
              </div>
              <p className="text-[11px] text-ink-faint mt-2">
                <span className="w-2 h-2 rounded-full bg-sage inline-block mr-1 align-middle" />Auspicious &nbsp;
                <span className="w-2 h-2 rounded-full bg-vermillion inline-block mr-1 align-middle" />Avoid for important work
              </p>
            </section>
          )}

          {data.upcoming_eclipse && (
            <div className="rounded-xl border border-primary/25 bg-primary-light px-4 py-3.5">
              <p className="text-[11px] uppercase tracking-widest text-primary-dark font-bold mb-1">Upcoming Eclipse</p>
              <p className="text-sm text-ink">
                {data.upcoming_eclipse.name} — {data.upcoming_eclipse.date}
                {data.upcoming_eclipse.peak_time_local ? ` at ${data.upcoming_eclipse.peak_time_local}` : ''}
              </p>
            </div>
          )}

          <p className="text-[11px] text-ink-faint leading-relaxed">
            Amrit Kaal and the vrat/festival calendar are not shown yet — we'd rather omit them
            than show timings people rely on for religious observance until verified against a
            classical reference.
          </p>
        </>
      )}
    </div>
  )
}

// ─── This Week tab ────────────────────────────────────────────────────────────

function WeekTab({ location, onSetLocation }) {
  const [days, setDays] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!location) return
    let cancelled = false
    setLoading(true); setError(false); setDays(null)
    fetchPanchangWeek({ lat: location.lat, lon: location.lon, timezone: location.timezone, days: 7 })
      .then(res => { if (!cancelled) setDays(res.days) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [location?.lat, location?.lon])

  if (!location) return <LocationPrompt onSetLocation={onSetLocation} />

  return (
    <div className="space-y-4">
      {loading && <div className="space-y-2">{[1,2,3,4,5,6,7].map(i => <div key={i} className="h-12 rounded-xl bg-line animate-pulse" />)}</div>}
      {error && <div className="rounded-xl border border-vermillion/30 bg-vermillion-light px-4 py-3 text-sm text-vermillion">Couldn't load this week's panchang.</div>}
      {days && <PanchangTable days={days} />}
      <PanchangTableLegend />
    </div>
  )
}

// ─── This Month (Hindu Masa) tab ──────────────────────────────────────────────

function HinduMonthTab({ location, onSetLocation }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!location) return
    let cancelled = false
    setLoading(true); setError(false); setResult(null)
    fetchPanchangHinduMonth({ lat: location.lat, lon: location.lon, timezone: location.timezone })
      .then(res => { if (!cancelled) setResult(res) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [location?.lat, location?.lon])

  if (!location) return <LocationPrompt onSetLocation={onSetLocation} />

  return (
    <div className="space-y-4">
      {result?.masa && (
        <div>
          <div className="inline-flex items-center gap-2 bg-primary-light border border-primary/30 rounded-full px-3 py-1 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">🌙 {result.masa} Masa</span>
          </div>
          {result.start_date && result.end_date && (
            <p className="text-xs text-ink-faint mt-1">
              {formatShort(result.start_date)} (Shukla Pratipada) → {formatShort(result.end_date)} (Amavasya)
            </p>
          )}
        </div>
      )}

      {loading && <div className="space-y-2">{Array.from({length:10}).map((_,i) => <div key={i} className="h-12 rounded-xl bg-line animate-pulse" />)}</div>}
      {error && <div className="rounded-xl border border-vermillion/30 bg-vermillion-light px-4 py-3 text-sm text-vermillion">Couldn't load the Hindu month panchang.</div>}
      {result?.days && <PanchangTable days={result.days} />}
      <PanchangTableLegend />
    </div>
  )
}

function PanchangTableLegend() {
  return (
    <p className="text-[11px] text-ink-faint">
      <span className="inline-flex items-center gap-1 mr-4">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400/80" /> Shukla Paksha
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-slate-400/40 border border-line" /> Krishna Paksha
      </span>
    </p>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'week',  label: 'This Week' },
  { id: 'month', label: 'This Month' },
]

export default function PanchangDetail() {
  const { user } = useAuth()
  const locationHook = useCurrentLocation()
  const [anonLocation, setAnonLocation] = useState(null)
  const location = user ? locationHook.location : anonLocation

  const [tab, setTab] = useState('today')
  const [date, setDate] = useState(todayISO)
  const isToday = date === todayISO()

  function handleSetLocation(loc) {
    if (user) locationHook.setManualLocation(loc)
    else {
      setAnonLocation(loc)
      setCurrentLocation(null, { ...loc, source: 'manual' })
    }
  }

  useEffect(() => {
    if (user) return
    const saved = getCurrentLocation(null)
    if (saved && !isLocationStale(saved)) { setAnonLocation(saved); return }
    requestBrowserLocation()
      .then(({ lat, lon, timezone }) => {
        const loc = { lat, lon, label: null, timezone, source: 'geolocation' }
        setCurrentLocation(null, loc)
        setAnonLocation(loc)
      })
      .catch(() => {})
  }, [user])

  const heroTitle =
    tab === 'today' ? (isToday ? "Today's Panchang" : formatLong(date))
    : tab === 'week'  ? "This Week's Panchang"
    : "This Month's Panchang"

  return (
    <div className="flex-1 flex flex-col">
      <Seo title="Panchang — Tithi, Nakshatra & Muhurta" path="/panchang" />

      {/* Dark hero */}
      <div className="bg-night pt-8 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Panchang</p>
          <h1 className="font-serif text-3xl font-medium text-primary-light leading-snug">{heroTitle}</h1>
          {tab === 'today' && isToday && (
            <p className="text-sm text-ink-onnight/55 mt-1">{formatLong(date)}</p>
          )}

          {/* Controls bar */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 bg-night-light border border-white/[0.08] rounded-2xl px-4 py-3">
            <LocationPicker location={location} onSetLocation={handleSetLocation} />
            {tab === 'today' && (
              <>
                <span className="text-white/10 hidden sm:block select-none">|</span>
                <DatePicker value={date} onChange={setDate} />
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                  tab === t.id ? 'bg-primary text-night' : 'text-ink-onnight/60 hover:text-primary-light'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-8 pb-14">
        {tab === 'today' && <TodayTab location={location} date={date} onSetLocation={handleSetLocation} />}
        {tab === 'week'  && <WeekTab  location={location} onSetLocation={handleSetLocation} />}
        {tab === 'month' && <HinduMonthTab location={location} onSetLocation={handleSetLocation} />}
      </div>
    </div>
  )
}
