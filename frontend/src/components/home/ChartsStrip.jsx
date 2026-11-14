// frontend/src/components/home/ChartsStrip.jsx
//
// Surfaces a few divisional charts through today's lens, then hands off to
// /kundli's divisional tab (components/DivisionalCharts.jsx), which renders
// them in full — this strip is a teaser into that tab, not a second
// implementation of it.
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// The name and blurb text lives in the locale files (home_charts_<code>_name / _blurb).
const FEATURED = ['D1', 'D10', 'D9', 'D60']

export default function ChartsStrip({ profile }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  function openDivisional() {
    if (!profile) { navigate('/generate'); return }
    navigate('/kundli', {
      state: {
        data: profile.chart,
        input: { name: profile.label, date: profile.birth_date, time: profile.birth_time, place: profile.place },
        activeTab: 'kundli',
        activeSubtab: 'divisional',
      },
    })
  }

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
      {FEATURED.map(code => (
        <button
          key={code}
          onClick={openDivisional}
          className="flex-shrink-0 w-[148px] text-left rounded-xl border border-white/[0.09] bg-white/[0.045] p-3.5 hover:bg-white/[0.07] transition"
        >
          <p className="text-2xs font-mono text-ink-onnightMuted mb-1.5">{code}</p>
          <p className="font-serif text-sm font-medium text-primary-light mb-1 leading-tight">{t(`home_charts_${code}_name`)}</p>
          <p className="text-2xs text-ink-onnightMuted leading-snug">{t(`home_charts_${code}_blurb`)}</p>
        </button>
      ))}
    </div>
  )
}
