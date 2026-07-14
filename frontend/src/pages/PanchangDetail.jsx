// frontend/src/pages/PanchangDetail.jsx
//
// Public page — no auth required. Accessible to anyone at /panchang.
// Logged-in users get their saved location pre-filled; anonymous visitors
// are asked for a city (or can allow browser geolocation). A date picker
// defaults to today but lets anyone look up any date's Panchang.
//
// Layout matches Knowledge Center / Privacy Policy: SiteHeader (opaque
// bg-night) + parchment body + Footer.
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import SiteHeader from '../components/SiteHeader'
import Footer from '../components/Footer'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { usePanchang } from '../hooks/usePanchang'
import { usePlaceMatches } from '../hooks/usePlaceMatches'
import { getPrimaryProfile } from '../services/astrologyProfiles'
import { requestBrowserLocation, setCurrentLocation, getCurrentLocation, isLocationStale } from '../services/currentLocation'

// ─── helpers ──────────────────────────────────────────────────────────────────

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDisplayDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return new Date(+y, +m - 1, +d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── sub-components ───────────────────────────────────────────────────────────

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
      <span className="text-sm font-semibold text-ink">{value ?? '—'}</span>
    </div>
  )
}

// ─── Location picker (self-contained, anonymous-friendly) ─────────────────────

function LocationPicker({ location, onSetLocation }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [geoStatus, setGeoStatus] = useState('idle') // idle | requesting | denied
  const matches = usePlaceMatches(query)

  function pick(place) {
    onSetLocation({ lat: place.lat, lon: place.lon, label: place.display_name, timezone: place.timezone })
    setOpen(false)
    setQuery('')
  }

  async function useDeviceLocation() {
    setGeoStatus('requesting')
    try {
      const { lat, lon, timezone } = await requestBrowserLocation()
      onSetLocation({ lat, lon, label: null, timezone })
      setCurrentLocation(null, { lat, lon, label: null, timezone, source: 'geolocation' })
      setOpen(false)
    } catch {
      setGeoStatus('denied')
    }
  }

  const label = location?.label ?? (location ? `${location.lat.toFixed(1)}°, ${location.lon.toFixed(1)}°` : null)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-primary-dark font-semibold hover:underline"
      >
        <span className="text-base">📍</span>
        <span>{label ?? 'Set location'}</span>
        <span className="text-ink-faint text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-30 bg-parchment-card border border-line rounded-2xl shadow-xl p-4 w-72">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">Choose city</p>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search city, e.g. Raigarh"
            className="w-full border border-line rounded-xl px-3 py-2 text-sm bg-parchment text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {matches.length > 0 && (
            <ul className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-line bg-parchment">
              {matches.map((m, i) => (
                <li key={i}>
                  <button
                    onClick={() => pick(m)}
                    className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-primary-light transition"
                  >
                    {m.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={useDeviceLocation}
              disabled={geoStatus === 'requesting'}
              className="text-xs text-primary-dark font-semibold hover:underline disabled:opacity-50"
            >
              {geoStatus === 'requesting' ? 'Detecting…' : '⌖ Use my location'}
            </button>
            {geoStatus === 'denied' && (
              <span className="text-xs text-vermillion">Location blocked</span>
            )}
            <button onClick={() => { setOpen(false); setQuery('') }} className="ml-auto text-xs text-ink-faint hover:underline">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Date picker ──────────────────────────────────────────────────────────────

function DatePicker({ value, onChange }) {
  const today = todayISO()
  return (
    <div className="flex items-center gap-2">
      <span className="text-base">📅</span>
      <input
        type="date"
        value={value}
        max={today}
        onChange={e => onChange(e.target.value)}
        className="text-sm font-semibold text-primary-dark bg-transparent border-none outline-none cursor-pointer appearance-none"
        style={{ colorScheme: 'light' }}
      />
      {value !== today && (
        <button
          onClick={() => onChange(today)}
          className="text-xs text-ink-faint hover:text-primary-dark hover:underline"
        >
          Today
        </button>
      )}
    </div>
  )
}

// ─── Empty state for anonymous user with no location ──────────────────────────

function LocationPrompt({ onSetLocation }) {
  const [query, setQuery] = useState('')
  const [geoStatus, setGeoStatus] = useState('idle')
  const matches = usePlaceMatches(query)

  function pick(place) {
    onSetLocation({ lat: place.lat, lon: place.lon, label: place.display_name, timezone: place.timezone })
  }

  async function useDeviceLocation() {
    setGeoStatus('requesting')
    try {
      const { lat, lon, timezone } = await requestBrowserLocation()
      onSetLocation({ lat, lon, label: null, timezone })
      setCurrentLocation(null, { lat, lon, label: null, timezone, source: 'geolocation' })
    } catch {
      setGeoStatus('denied')
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-parchment-card px-6 py-8 text-center max-w-md mx-auto">
      <div className="text-4xl mb-3">🌍</div>
      <h2 className="font-serif text-lg font-semibold text-ink mb-1">Where are you?</h2>
      <p className="text-sm text-ink-muted mb-5">
        Panchang timings (sunrise, Rahu Kaal, muhurtas) are location-specific. Set your city to continue.
      </p>
      <div className="relative">
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search city, e.g. Mumbai, Raigarh…"
          className="w-full border border-line rounded-xl px-4 py-2.5 text-sm bg-parchment text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary"
        />
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
      <button
        onClick={useDeviceLocation}
        disabled={geoStatus === 'requesting'}
        className="mt-4 text-sm text-primary-dark font-semibold hover:underline disabled:opacity-50"
      >
        {geoStatus === 'requesting' ? 'Detecting location…' : '⌖ Use my current location'}
      </button>
      {geoStatus === 'denied' && (
        <p className="text-xs text-vermillion mt-2">Browser location blocked — please search for your city above.</p>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PanchangDetail() {
  const { t } = useTranslation()
  const { user } = useAuth()

  // For logged-in users, useCurrentLocation pulls from their profile + localStorage.
  // For anonymous users we let them set a local-only location below.
  const currentLocationHook = useCurrentLocation()

  // Anonymous visitors need their own local location state (they have no profile).
  const [anonLocation, setAnonLocation] = useState(null)

  const location = user ? currentLocationHook.location : anonLocation

  const [date, setDate] = useState(todayISO)
  const isToday = date === todayISO()

  const panchang = usePanchang(location, isToday ? undefined : date)
  const data = panchang.data

  function handleSetLocation(loc) {
    if (user) {
      currentLocationHook.setManualLocation(loc)
    } else {
      setAnonLocation(loc)
      // also persist to anon localStorage slot
      setCurrentLocation(null, { ...loc, source: 'manual' })
    }
  }

  // On mount for anon users, try to load from localStorage or geolocation
  useEffect(() => {
    if (user) return
    const saved = getCurrentLocation(null)
    if (saved && !isLocationStale(saved)) {
      setAnonLocation(saved)
      return
    }
    requestBrowserLocation()
      .then(({ lat, lon, timezone }) => {
        const loc = { lat, lon, label: null, timezone, source: 'geolocation' }
        setCurrentLocation(null, loc)
        setAnonLocation(loc)
      })
      .catch(() => {
        // No permission — LocationPrompt will appear and let user search
      })
  }, [user])

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Seo title="Panchang — Tithi, Nakshatra & Muhurta" path="/panchang" />
      <SiteHeader />

      {/* Hero band — dark, matches Knowledge Center */}
      <div className="bg-night pt-20 pb-10 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Daily Panchang</p>
          <h1 className="font-serif text-3xl font-medium text-primary-light leading-snug">
            {isToday ? "Today's Panchang" : formatDisplayDate(date)}
          </h1>
          {isToday && (
            <p className="text-sm text-ink-onnight/60 mt-1">{formatDisplayDate(date)}</p>
          )}

          {/* Controls row */}
          <div className="mt-5 flex flex-wrap items-center gap-4 bg-night-light border border-white/[0.08] rounded-2xl px-4 py-3">
            <LocationPicker location={location} onSetLocation={handleSetLocation} />
            <span className="text-line hidden sm:block">|</span>
            <DatePicker value={date} onChange={setDate} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-8 pb-12 space-y-6">

        {/* No location yet — prompt anon user */}
        {!location && !panchang.loading && (
          <LocationPrompt onSetLocation={handleSetLocation} />
        )}

        {panchang.loading && (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 rounded-xl bg-line animate-pulse" />
            ))}
          </div>
        )}

        {panchang.error && (
          <div className="rounded-xl border border-vermillion/30 bg-vermillion-light px-4 py-3 text-sm text-vermillion">
            Couldn't load panchang for this location. Try again in a moment.
          </div>
        )}

        {data && (
          <>
            {/* Pancha Anga */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-primary-dark font-bold mb-3">
                Pancha Anga
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                <Anga
                  label="Tithi"
                  value={data.tithi?.name}
                  sub={[
                    data.tithi?.paksha ? `${data.tithi.paksha} Paksha` : null,
                    data.tithi?.ends_at ? `ends ${data.tithi.ends_at}` : null,
                  ].filter(Boolean).join(' · ')}
                />
                <Anga
                  label="Nakshatra"
                  value={typeof data.nakshatra === 'object' ? data.nakshatra?.name : data.nakshatra}
                  sub={data.nakshatra?.ends_at ? `ends ${data.nakshatra.ends_at}` : null}
                />
                <Anga label="Yoga" value={data.yoga} />
                <Anga label="Karana" value={data.karana} />
                <Anga label="Vara (Day)" value={data.weekday} />
                <Anga label="Timezone" value={data.timezone} />
              </div>
            </section>

            {/* Sunrise / Sunset / Moonrise / Moonset */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-primary-dark font-bold mb-3">
                Sky Timings
              </h2>
              <div className="rounded-xl border border-line bg-parchment-card px-4">
                <Row label="🌅 Sunrise" value={data.sunrise} />
                <Row label="🌇 Sunset" value={data.sunset} />
                <Row label="🌕 Moonrise" value={data.moonrise} />
                <Row label="🌑 Moonset" value={data.moonset} />
              </div>
            </section>

            {/* Muhurtas */}
            {data.muhurtas && (
              <section>
                <h2 className="text-[11px] uppercase tracking-widest text-primary-dark font-bold mb-3">
                  Auspicious & Inauspicious Windows
                </h2>
                <div className="rounded-xl border border-line bg-parchment-card px-4">
                  {data.muhurtas.abhijit_muhurta && (
                    <Row
                      label={<span className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-sage shrink-0" />Abhijit Muhurta</span>}
                      value={`${data.muhurtas.abhijit_muhurta.start} – ${data.muhurtas.abhijit_muhurta.end}`}
                    />
                  )}
                  {data.muhurtas.rahu_kaal && (
                    <Row
                      label={<span className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-vermillion shrink-0" />Rahu Kaal</span>}
                      value={`${data.muhurtas.rahu_kaal.start} – ${data.muhurtas.rahu_kaal.end}`}
                    />
                  )}
                  {data.muhurtas.yamaganda && (
                    <Row
                      label={<span className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-vermillion/60 shrink-0" />Yamaganda</span>}
                      value={`${data.muhurtas.yamaganda.start} – ${data.muhurtas.yamaganda.end}`}
                    />
                  )}
                  {data.muhurtas.gulika_kaal && (
                    <Row
                      label={<span className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-vermillion/40 shrink-0" />Gulika Kaal</span>}
                      value={`${data.muhurtas.gulika_kaal.start} – ${data.muhurtas.gulika_kaal.end}`}
                    />
                  )}
                </div>
                <p className="text-[11px] text-ink-faint mt-2 leading-relaxed">
                  <span className="inline-block w-2 h-2 rounded-full bg-sage mr-1 align-middle" />Auspicious &nbsp;
                  <span className="inline-block w-2 h-2 rounded-full bg-vermillion mr-1 align-middle" />Avoid for important work
                </p>
              </section>
            )}

            {/* Upcoming eclipse */}
            {data.upcoming_eclipse && (
              <div className="rounded-xl border border-primary/25 bg-primary-light px-4 py-3.5">
                <p className="text-[11px] uppercase tracking-widest text-primary-dark font-bold mb-1">
                  Upcoming Eclipse
                </p>
                <p className="text-sm text-ink">
                  {data.upcoming_eclipse.name} — {data.upcoming_eclipse.date}
                  {data.upcoming_eclipse.peak_time_local ? ` at ${data.upcoming_eclipse.peak_time_local}` : ''}
                </p>
              </div>
            )}

            <p className="text-[11px] text-ink-faint leading-relaxed">
              Amrit Kaal and the vrat/festival calendar are not shown yet — we'd rather omit
              them than show timings people rely on for religious observance until they've been
              verified against a classical reference.
            </p>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
