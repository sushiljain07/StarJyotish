// frontend/src/components/home/DailyPanchang.jsx
//
// Presentational only — data comes from hooks/usePanchang.js, fetched once
// in PersonalHome.jsx and shared with HeroDial (arc positions) and
// utils/dailyInsights.js's computeDoAvoid (Rahu Kaal line), rather than
// each section fetching /api/panchang separately.
function Fact({ label, value }) {
  return (
    <div className="bg-night-light border border-white/10 rounded-lg px-3 py-2.5">
      <p className="text-[10px] text-ink-onnight/45 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-serif font-semibold text-sm text-parchment">{value ?? '—'}</p>
    </div>
  )
}

function MuhurtaChip({ name, window, tone }) {
  if (!window?.start) return null
  const dotColor = tone === 'avoid' ? 'bg-vermillion' : 'bg-sage'
  const textColor = tone === 'avoid' ? 'text-vermillion' : 'text-sage'
  return (
    <div className="flex items-center gap-2.5 bg-night-light border border-white/10 rounded-lg px-3.5 py-2.5 flex-1 min-w-[160px]">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
      <div>
        <p className="text-xs font-semibold text-parchment">{name}</p>
        <p className={`text-[11px] font-medium ${textColor}`}>{window.start} – {window.end}</p>
      </div>
    </div>
  )
}

export default function DailyPanchang({ location, data, loading, error }) {
  if (!location) {
    return (
      <div className="bg-night-light border border-white/10 rounded-xl p-5 text-center">
        <p className="text-ink-onnight/60 text-sm">
          Set your current city above to see today&apos;s Panchang and auspicious timing.
        </p>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="bg-night-light border border-white/10 rounded-xl p-5 text-center">
        <div className="text-2xl animate-spin inline-block">🪔</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-night-light border border-white/10 rounded-xl p-5 text-center">
        <p className="text-ink-onnight/60 text-sm">Couldn&apos;t load today&apos;s Panchang. Try again shortly.</p>
      </div>
    )
  }

  if (!data) return null

  const m = data.muhurtas
  const eclipse = data.upcoming_eclipse

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Fact label="Tithi" value={data.tithi ? `${data.tithi.name} (${data.tithi.paksha})` : null} />
        <Fact label="Nakshatra" value={data.nakshatra} />
        <Fact label="Yoga" value={data.yoga} />
        <Fact label="Karana" value={data.karana} />
        <Fact label="Sunrise" value={data.sunrise} />
        <Fact label="Sunset" value={data.sunset} />
        <Fact label="Moonrise" value={data.moonrise} />
        <Fact label="Moonset" value={data.moonset} />
      </div>

      {m && (
        <div>
          <p className="text-xs font-semibold text-ink-onnight/60 mb-2.5">Auspicious &amp; inauspicious windows today</p>
          <div className="flex flex-wrap gap-2.5">
            <MuhurtaChip name="Rahu Kaal" window={m.rahu_kaal} tone="avoid" />
            <MuhurtaChip name="Yamaganda" window={m.yamaganda} tone="avoid" />
            <MuhurtaChip name="Gulika Kaal" window={m.gulika_kaal} tone="avoid" />
            <MuhurtaChip name="Abhijit Muhurta" window={m.abhijit_muhurta} tone="favorable" />
          </div>
        </div>
      )}

      {/* Eclipse banner — only ever renders when calculate_panchang found one
          actually visible from this location within the lookahead window,
          so there is no "no eclipse" empty state to design for. */}
      {eclipse && (
        <div
          className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3.5 border border-vermillion/30"
          style={{ background: 'linear-gradient(135deg, #241221, #171B33 65%)' }}
        >
          <span className="text-2xl shrink-0">{eclipse.type === 'lunar' ? '🌑' : '🌒'}</span>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-vermillion font-semibold mb-0.5">
              Upcoming · {eclipse.date}
            </p>
            <p className="font-serif font-semibold text-primary-light text-sm">{eclipse.name}</p>
            <p className="text-ink-onnight/60 text-xs mt-1">
              Visible from your current location, peaking around {eclipse.peak_time_local}.
              Full guidance on timing and traditional observances is coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
