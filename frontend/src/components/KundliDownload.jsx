// frontend/src/components/KundliDownload.jsx
import KundliChart from './KundliChart'
import { formatDate as fmtDate, formatTime as fmtTime } from '../utils/format'

// ── Basic prediction lookup tables ───────────────────────────────────────────

const LAGNA_TRAITS = {
  Aries:       'Energetic, pioneering and courageous. You are a natural leader with a bold spirit. Impulsive at times, but your drive gets things done.',
  Taurus:      'Patient, reliable and deeply practical. You value comfort, beauty and stability. Loyal in relationships and persistent in your goals.',
  Gemini:      'Quick-witted, curious and communicative. You thrive on variety and ideas. Dual-natured — adaptable in almost any situation.',
  Cancer:      'Nurturing, intuitive and deeply sensitive. Home and family are your anchor. Strong emotional intelligence and a protective nature.',
  Leo:         'Confident, creative and naturally magnetic. You carry a royal presence and inspire others. Generous-hearted and deeply proud.',
  Virgo:       'Analytical, meticulous and service-oriented. You notice details others miss. Practical wisdom and a desire to improve everything around you.',
  Libra:       'Diplomatic, charming and harmony-seeking. Relationships are central to your life. A strong sense of justice and an eye for beauty.',
  Scorpio:     'Intense, perceptive and deeply transformative. You feel everything profoundly. Magnetic, resilient and never superficial.',
  Sagittarius: 'Optimistic, philosophical and freedom-loving. You seek truth and wide horizons. Enthusiastic and generous in spirit.',
  Capricorn:   'Disciplined, ambitious and deeply responsible. You build things that last. Patient with a quiet determination to reach the top.',
  Aquarius:    'Innovative, humanitarian and intellectually independent. You think ahead of your time. Idealistic with a genuine wish to uplift others.',
  Pisces:      'Compassionate, intuitive and spiritually inclined. You absorb the feelings of those around you. Creative, empathetic and deeply soulful.',
}

const MOON_TRAITS = {
  Aries:       'Your emotions are quick, passionate and direct. You react fast and recover fast. Mentally independent and action-oriented.',
  Taurus:      'Emotionally steady and comfort-seeking. You need security and consistency to feel at peace. Sensual and deeply appreciative of nature.',
  Gemini:      'Your mind is always active. You process emotions through thought and conversation. Need mental stimulation to feel emotionally fulfilled.',
  Cancer:      'Deeply intuitive and home-centered. Strong connection to mother and family. Highly empathetic — you sense moods before words are spoken.',
  Leo:         'Warm, expressive and proud in emotion. You give generously and need appreciation in return. Inner child is vibrant and creative.',
  Virgo:       'You analyze your feelings before expressing them. Caring in practical ways — you show love through service and attention to detail.',
  Libra:       'You seek emotional harmony and dislike conflict. Romantic and relationship-oriented. Balance and fairness matter deeply to you.',
  Scorpio:     'Emotions run deep, intense and private. You feel transformation through life\'s highs and lows. Powerful inner strength.',
  Sagittarius: 'Emotionally optimistic and freedom-seeking. You need space and adventure to feel alive. Philosophy and travel nourish your soul.',
  Capricorn:   'Reserved with emotions but fiercely dependable. You show love through action and responsibility. Slow to open up, loyal forever.',
  Aquarius:    'Emotionally detached yet compassionately aware. You care deeply for humanity. Unconventional inner world with flashes of brilliance.',
  Pisces:      'Extremely sensitive and empathetic. Your emotional world is rich, imaginative and spiritual. Boundaries between self and others can blur.',
}

const DASHA_THEMES = {
  Sun:     'This is a period of authority, self-expression and career advancement. Relationships with father figures and government come into focus. Your vitality and confidence are highlighted.',
  Moon:    'Emotions, intuition and the mind take centre stage. Travel, business and public dealings are favoured. Your relationship with your mother gains importance.',
  Mars:    'A period of energy, action and drive. Property, siblings and courage are activated. Conflicts may arise but decisive action brings results.',
  Mercury: 'Communication, intellect and business flourish. Education, writing and short journeys are favoured. Analytical thinking opens new doors.',
  Jupiter: 'Blessings, wisdom and expansion are the theme. Marriage, children, spirituality and wealth can grow. A broadly positive and auspicious period.',
  Venus:   'Love, beauty, luxury and relationships are highlighted. Marriage, arts, vehicles and material comforts come into focus. Enjoyment and creativity thrive.',
  Saturn:  'Discipline, karma and hard work define this period. Obstacles appear but patient effort leads to lasting achievement. Lessons of responsibility are learned.',
  Rahu:    'Unconventional gains and sudden changes mark this time. Foreign connections, technology and ambition are active. Disruption can lead to transformation.',
  Ketu:    'A spiritually oriented period of detachment and introspection. Past karma surfaces. Mystical experiences, isolation and self-realisation are themes.',
}

// Classical dignity tables (sign_index 0=Aries … 11=Pisces)
const EXALTED     = { Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6 }
const DEBILITATED = { Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5,  Saturn:0 }
const OWN_SIGNS   = {
  Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5],
  Jupiter:[8,11], Venus:[1,6], Saturn:[9,10],
}

function getDignity(name, signIndex) {
  if (EXALTED[name]     === signIndex)        return 'Exalted'
  if (DEBILITATED[name] === signIndex)        return 'Debilitated'
  if (OWN_SIGNS[name]?.includes(signIndex))   return 'Own Sign'
  return ''
}

const DIGNITY_COLOR = { 'Exalted':'#16a34a', 'Debilitated':'#dc2626', 'Own Sign':'#2563eb' }

export default function KundliDownload({ data, input }) {
  const { planets, ascendant, navamsa_planets, navamsa_ascendant, dasha } = data
  const moon = planets.find(p => p.name === 'Moon')
  const md   = dasha.current_mahadasha
  const ad   = dasha.current_antardasha

  function handleDownload() {
    const style = document.createElement('style')
    style.id = '_kp_print_style'
    style.textContent = `
      @media print {
        @page { margin: 10mm; size: A4 portrait; }
        html, body {
          height: auto !important;
          overflow: visible !important;
        }
        body > * { visibility: hidden !important; }
        #kundli-print-area,
        #kundli-print-area * { visibility: visible !important; }
        #kundli-print-area {
          position: absolute; top: 0; left: 0;
          width: 100%; background: white;
          height: auto !important;
          overflow: visible !important;
        }
        .no-print { display: none !important; }
      }
    `
    document.head.appendChild(style)
    window.print()
    setTimeout(() => {
      document.getElementById('_kp_print_style')?.remove()
    }, 500)
  }

  return (
    <div>
      {/* Download button — hidden during print */}
      <div className="flex justify-between items-center mb-4 no-print">
        <p className="text-sm text-ink-muted">
          Preview your Kundli below, then click Download to save as PDF.
        </p>
        <button
          onClick={handleDownload}
          className="bg-primary hover:bg-primary-dark text-night text-sm font-semibold px-5 py-2 rounded-lg shadow transition flex items-center gap-2 whitespace-nowrap"
        >
          <span>⬇</span> Download PDF
        </button>
      </div>

      {/* ── Printable area ── */}
      <div id="kundli-print-area" className="bg-parchment-card rounded-xl border border-line p-6 space-y-5">

        {/* Header */}
        <div className="text-center border-b border-line pb-4">
          <div className="text-lg font-bold text-primary-dark tracking-wide">✦ AstroGuru Kundli ✦</div>
          {input.name && (
            <div className="text-2xl font-semibold text-ink mt-1">{input.name}</div>
          )}
          <div className="text-sm text-ink-muted mt-1">
            {fmtDate(input.date)} &nbsp;·&nbsp; {fmtTime(input.time)} &nbsp;·&nbsp; {input.place}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <span className="bg-primary-light text-primary-dark text-xs font-semibold px-3 py-1 rounded-full">
              Lagna: {ascendant.sign}
            </span>
            {moon && (
              <span className="bg-mauve-light text-mauve text-xs font-semibold px-3 py-1 rounded-full">
                Rashi: {moon.sign}
              </span>
            )}
            <span className="bg-sage-light text-sage text-xs font-semibold px-3 py-1 rounded-full">
              Nakshatra: {ascendant.nakshatra}
            </span>
            <span className="bg-vermillion-light text-vermillion text-xs font-semibold px-3 py-1 rounded-full">
              Mahadasha: {md.planet} · ends {fmtDate(md.end)}
            </span>
          </div>
        </div>

        {/* Charts — Lagna + Navamsa */}
        <div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex-1 max-w-[320px] mx-auto sm:mx-0">
              <p className="text-center text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
                Lagna Chart (D1)
              </p>
              <KundliChart
                planets={planets}
                ascendant={ascendant}
                navamsaPlanets={navamsa_planets}
                title="Lagna Chart"
              />
            </div>
            <div className="flex-1 max-w-[320px] mx-auto sm:mx-0">
              <p className="text-center text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
                Navamsa Chart (D9)
              </p>
              <KundliChart
                planets={navamsa_planets}
                ascendant={navamsa_ascendant}
                title="Navamsa (D9)"
              />
            </div>
          </div>
        </div>

        {/* Planet table */}
        <div>
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
            Planetary Positions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-primary-light text-primary-dark">
                  {['Planet','Sign','Deg°','House','Nakshatra','Pada','Dignity','R'].map(h => (
                    <th key={h} className={`p-1.5 border border-primary/30 ${h==='R'||h==='Pada'||h==='House'?'text-center':'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planets.map((p, i) => {
                  const dignity = getDignity(p.name, p.sign_index)
                  return (
                    <tr key={p.name} className={i % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}>
                      <td className="p-1.5 border border-line font-semibold text-ink">{p.name}</td>
                      <td className="p-1.5 border border-line text-ink-muted">{p.sign}</td>
                      <td className="p-1.5 border border-line text-ink-muted">{p.degree.toFixed(1)}</td>
                      <td className="p-1.5 border border-line text-center text-ink-muted">{p.house}</td>
                      <td className="p-1.5 border border-line text-ink-muted">{p.nakshatra}</td>
                      <td className="p-1.5 border border-line text-center text-ink-muted">{p.nakshatra_pada}</td>
                      <td className="p-1.5 border border-line font-medium"
                          style={{ color: DIGNITY_COLOR[dignity] ?? '#64748b' }}>
                        {dignity}
                      </td>
                      <td className="p-1.5 border border-line text-center font-bold text-vermillion">
                        {p.retrograde ? 'R' : ''}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dasha system */}
        <div>
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
            Vimshottari Dasha
          </h3>

          {/* Current dasha chain */}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="bg-primary-light border border-primary/30 rounded-lg px-3 py-2">
              <div className="text-xs text-primary-dark/70 uppercase font-medium">Mahadasha</div>
              <div className="text-sm font-bold text-primary-dark">{md.planet}</div>
              <div className="text-xs text-ink-muted">{fmtDate(md.start)} – {fmtDate(md.end)} ({md.years}y)</div>
            </div>
            {ad && (
              <div className="bg-mauve-light border border-mauve/30 rounded-lg px-3 py-2">
                <div className="text-xs text-mauve/70 uppercase font-medium">Antardasha</div>
                <div className="text-sm font-bold text-mauve">{ad.planet}</div>
                <div className="text-xs text-ink-muted">{fmtDate(ad.start)} – {fmtDate(ad.end)}</div>
              </div>
            )}
            {dasha.current_pratyantar && (
              <div className="bg-vermillion-light border border-vermillion/30 rounded-lg px-3 py-2">
                <div className="text-xs text-vermillion/70 uppercase font-medium">Pratyantar</div>
                <div className="text-sm font-bold text-vermillion">{dasha.current_pratyantar.planet}</div>
                <div className="text-xs text-ink-muted">{fmtDate(dasha.current_pratyantar.start)} – {fmtDate(dasha.current_pratyantar.end)}</div>
              </div>
            )}
            {dasha.current_sookshma && (
              <div className="bg-sage-light border border-sage/30 rounded-lg px-3 py-2">
                <div className="text-xs text-sage/70 uppercase font-medium">Sookshma</div>
                <div className="text-sm font-bold text-sage">{dasha.current_sookshma.planet}</div>
                <div className="text-xs text-ink-muted">{fmtDate(dasha.current_sookshma.start)} – {fmtDate(dasha.current_sookshma.end)}</div>
              </div>
            )}
          </div>

          {/* Full sequence pills */}
          <div className="flex flex-wrap gap-1">
            {dasha.full_sequence.map((entry, i) => (
              <span key={i}
                    className={`text-xs px-2 py-0.5 rounded border ${
                      entry.planet === md.planet
                        ? 'bg-primary text-night border-primary font-semibold'
                        : 'bg-parchment-card text-ink-muted border-line'
                    }`}>
                {entry.planet} {entry.start.slice(0,4)}–{entry.end.slice(0,4)}
              </span>
            ))}
          </div>
        </div>

        {/* Basic predictions & personality */}
        <div>
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
            Basic Predictions &amp; Personality
          </h3>
          <div className="space-y-3">

            <div className="bg-primary-light border-l-4 border-primary rounded-r-lg p-3">
              <div className="text-xs font-bold text-primary-dark uppercase mb-1">
                Lagna ({ascendant.sign}) — Personality
              </div>
              <p className="text-sm text-ink leading-relaxed">
                {LAGNA_TRAITS[ascendant.sign] ?? 'A unique and complex personality shaped by your rising sign.'}
              </p>
            </div>

            {moon && (
              <div className="bg-mauve-light border-l-4 border-mauve rounded-r-lg p-3">
                <div className="text-xs font-bold text-mauve uppercase mb-1">
                  Moon in {moon.sign} — Emotional Nature
                </div>
                <p className="text-sm text-ink leading-relaxed">
                  {MOON_TRAITS[moon.sign] ?? 'Your emotional nature is deeply influenced by your Moon sign.'}
                </p>
              </div>
            )}

            <div className="bg-primary-light border-l-4 border-primary rounded-r-lg p-3">
              <div className="text-xs font-bold text-primary-dark uppercase mb-1">
                {md.planet} Mahadasha — Current Life Theme
              </div>
              <p className="text-sm text-ink leading-relaxed">
                {DASHA_THEMES[md.planet] ?? 'This dasha brings its own unique lessons and opportunities.'}
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line pt-3 text-center text-xs text-ink-faint">
          Generated by AstroGuru &nbsp;·&nbsp; {new Date().toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </div>

      </div>
    </div>
  )
}
