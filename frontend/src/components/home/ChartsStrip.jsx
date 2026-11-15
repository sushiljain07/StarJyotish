// frontend/src/components/home/ChartsStrip.jsx
//
// Surfaces a few divisional charts through today's lens, then hands off to
// /kundli's divisional tab (components/DivisionalCharts.jsx), which renders
// them in full — this strip is a teaser into that tab, not a second
// implementation of it.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// The name and blurb text lives in the locale files (home_charts_<code>_name / _blurb).
const FEATURED = ['D1', 'D10', 'D9', 'D60']

export default function ChartsStrip({ profile }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const scroller = useRef(null)
  const [edge, setEdge] = useState({ start: true, end: true })

  function measure() {
    const el = scroller.current
    if (!el) return
    setEdge({
      start: el.scrollLeft <= 1,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    })
  }
  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  function scrollByPage(dir) {
    const el = scroller.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

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

  const arrow = 'hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full border border-white/[0.15] bg-night-deep/90 text-primary-light hover:bg-white/[0.12] transition'

  return (
    <div className="relative">
      {!edge.start && (
        <button type="button" aria-label={t('carousel_prev')} onClick={() => scrollByPage(-1)} className={`${arrow} left-0`}>‹</button>
      )}
      {!edge.end && (
        <button type="button" aria-label={t('carousel_next')} onClick={() => scrollByPage(1)} className={`${arrow} right-0`}>›</button>
      )}
    <div ref={scroller} onScroll={measure} className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
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
    </div>
  )
}
