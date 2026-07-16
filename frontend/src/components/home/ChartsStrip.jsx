// frontend/src/components/home/ChartsStrip.jsx
//
// Surfaces a few divisional charts through today's lens, then hands off to
// the existing ShodashvargaPanel (components/ShodashvargaPanel.jsx) at
// /kundli's divisional tab, which already renders all 16 — this strip is a
// teaser into that panel, not a second implementation of it.
import { useNavigate } from 'react-router-dom'

const FEATURED = [
  { code: 'D1', name: 'Lagna', blurb: 'Your foundation chart' },
  { code: 'D10', name: 'Dashamsha', blurb: "Why today's Saturn matters" },
  { code: 'D9', name: 'Navamsa', blurb: 'Your marriage chart' },
  { code: 'D60', name: 'Shashtiamsa', blurb: 'The finest-grain detail' },
]

export default function ChartsStrip({ profile }) {
  const navigate = useNavigate()

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
      {FEATURED.map(c => (
        <button
          key={c.code}
          onClick={openDivisional}
          className="flex-shrink-0 w-[148px] text-left rounded-xl border border-white/[0.09] bg-white/[0.045] p-3.5 hover:bg-white/[0.07] transition"
        >
          <p className="text-3xs font-mono text-ink-onnight/60 mb-1.5">{c.code}</p>
          <p className="font-serif text-sm font-medium text-primary-light mb-1 leading-tight">{c.name}</p>
          <p className="text-[11px] text-ink-onnight/50 leading-snug">{c.blurb}</p>
        </button>
      ))}
    </div>
  )
}
