// frontend/src/pages/PanchangDetail.jsx
//
// The expanded panchang view reachable from PersonalHome's "View full
// Panchang →" link (previously a dead end — see App.jsx diff). Deliberately
// shows only fields calculate_panchang() actually computes: no Choghadiya,
// no vrat/festival calendar. services/panchang.py's own docstring is
// explicit that shipping a guessed version of religious-timing data is
// worse than omitting it — this page holds to that rather than inventing
// filler to make the page feel fuller.
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import CelestialBackdrop from '../components/CelestialBackdrop'
import BottomNav from '../components/home/BottomNav'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { usePanchang } from '../hooks/usePanchang'
import { getPrimaryProfile } from '../services/astrologyProfiles'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.07] last:border-b-0">
      <span className="text-sm text-ink-onnight/70">{label}</span>
      <span className="text-sm font-medium text-primary-light">{value ?? '—'}</span>
    </div>
  )
}

function Anga({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/[0.09] bg-white/[0.045] px-4 py-3.5">
      <p className="text-[10px] uppercase tracking-wider text-indigo-200/70 mb-1.5">{label}</p>
      <p className="font-serif text-[15px] font-medium text-primary-light">{value ?? '—'}</p>
      {sub && <p className="text-[10.5px] text-ink-onnight/50 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function PanchangDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const profile = getPrimaryProfile(user)
  const { location } = useCurrentLocation()
  const panchang = usePanchang(location)
  const data = panchang.data

  return (
    <div className="min-h-screen bg-night-deep pb-24 md:pb-12">
      <Seo title={t('panchang_full_title')} path="/panchang" noindex />

      <div className="relative overflow-hidden bg-night px-4 pt-6 pb-8">
        <CelestialBackdrop className="text-primary opacity-40" />
        <div className="relative max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-sm text-ink-onnight/70 hover:text-primary-light transition mb-4"
          >
            <span aria-hidden="true">←</span> {t('panchang_back_cta')}
          </button>
          <h1 className="font-serif text-2xl font-medium text-primary-light">
            {t('panchang_full_title')}
          </h1>
          {data?.date && (
            <p className="text-sm text-ink-onnight/60 mt-1">
              {data.weekday}, {data.date}
              {location?.label ? ` · ${location.label}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {panchang.loading && (
          <p className="text-sm text-ink-onnight/60">Loading today's panchang…</p>
        )}
        {panchang.error && (
          <p className="text-sm text-vermillion">
            Couldn't load panchang for your current location. Try again in a moment.
          </p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <Anga label="Tithi" value={data.tithi?.name} sub={data.tithi?.paksha ? `${data.tithi.paksha} paksha` : null} />
              <Anga label="Nakshatra" value={data.nakshatra} />
              <Anga label="Yoga" value={data.yoga} />
              <Anga label="Karana" value={data.karana} />
              <Anga label="Vara" value={data.weekday} />
              <Anga label="Timezone" value={data.timezone} />
            </div>

            <div>
              <h2 className="text-[11px] uppercase tracking-wider text-primary-light font-medium mb-2">
                {t('panchang_sun_moon_label')}
              </h2>
              <div className="rounded-xl border border-white/[0.09] bg-white/[0.045] px-4">
                <Row label="Sunrise" value={data.sunrise} />
                <Row label="Sunset" value={data.sunset} />
                <Row label="Moonrise" value={data.moonrise} />
                <Row label="Moonset" value={data.moonset} />
              </div>
            </div>

            {data.muhurtas && (
              <div>
                <h2 className="text-[11px] uppercase tracking-wider text-primary-light font-medium mb-2">
                  {t('panchang_windows_label')}
                </h2>
                <div className="rounded-xl border border-white/[0.09] bg-white/[0.045] px-4">
                  {data.muhurtas.abhijit_muhurta && (
                    <Row
                      label={<span><span className="text-sage" aria-hidden="true">●</span> Abhijit Muhurta</span>}
                      value={`${data.muhurtas.abhijit_muhurta.start} – ${data.muhurtas.abhijit_muhurta.end}`}
                    />
                  )}
                  {data.muhurtas.rahu_kaal && (
                    <Row
                      label={<span><span className="text-vermillion" aria-hidden="true">●</span> Rahu Kaal</span>}
                      value={`${data.muhurtas.rahu_kaal.start} – ${data.muhurtas.rahu_kaal.end}`}
                    />
                  )}
                  {data.muhurtas.yamaganda && (
                    <Row
                      label={<span><span className="text-vermillion" aria-hidden="true">●</span> Yamaganda</span>}
                      value={`${data.muhurtas.yamaganda.start} – ${data.muhurtas.yamaganda.end}`}
                    />
                  )}
                  {data.muhurtas.gulika_kaal && (
                    <Row
                      label={<span><span className="text-vermillion" aria-hidden="true">●</span> Gulika Kaal</span>}
                      value={`${data.muhurtas.gulika_kaal.start} – ${data.muhurtas.gulika_kaal.end}`}
                    />
                  )}
                </div>
              </div>
            )}

            {data.upcoming_eclipse && (
              <div className="rounded-xl border border-primary/25 bg-primary/[0.08] px-4 py-3.5">
                <p className="text-[11px] uppercase tracking-wider text-primary-light font-medium mb-1">
                  Upcoming eclipse
                </p>
                <p className="text-sm text-ink-onnight/85">
                  {data.upcoming_eclipse.name} — {data.upcoming_eclipse.date}
                  {data.upcoming_eclipse.peak_time_local ? ` at ${data.upcoming_eclipse.peak_time_local}` : ''}
                </p>
              </div>
            )}

            <p className="text-[11px] text-ink-onnight/40 leading-relaxed">
              Amrit Kaal and the vrat/festival calendar aren't shown yet — we'd rather leave
              them out than guess at timings people use for religious observance.
            </p>
          </>
        )}
      </div>

      <BottomNav profile={profile} />
    </div>
  )
}
