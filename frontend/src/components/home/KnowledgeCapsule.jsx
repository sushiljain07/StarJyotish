// frontend/src/components/home/KnowledgeCapsule.jsx
//
// "Today's Learning" — a single, short, automatically selected piece of
// Vedic knowledge that ties directly to today's chart:
//   1. The backend's daily_editor already picks a dominant planet and event
//      type in `headline_event`. We use that to select the capsule topic.
//   2. The capsule links to the relevant Knowledge Center article.
//   3. It rotates daily (seeded by the date), so returning tomorrow brings
//      something new even if the dominant planet hasn't changed.
//
// This is the retention trigger the document calls out: unexpected learning
// mid-scroll is more memorable than content the user expects. It appears
// AFTER the hero (earned) not before.
//
// Content map: planet → knowledge article slug. Extend as articles are added.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const CAPSULES = {
  Moon: [
    { slug: 'moon-in-houses',      title: 'Why the Moon is more personal than your Sun sign',       mins: 3 },
    { slug: 'nakshatra-moon',      title: 'How your Janma Nakshatra shapes your instincts',          mins: 4 },
  ],
  Sun: [
    { slug: 'sun-soul-indicator',  title: "The Sun as Atmakaraka — your soul's purpose planet",    mins: 3 },
  ],
  Mercury: [
    { slug: 'mercury-intellect',   title: 'Mercury retrograde: what it actually means in your 3rd', mins: 3 },
  ],
  Venus: [
    { slug: 'venus-relationships', title: 'Venus in your 7th: the partnership mirror',              mins: 4 },
  ],
  Mars: [
    { slug: 'mars-energy',         title: 'Mars as the action planet — ambition vs. aggression',    mins: 3 },
  ],
  Jupiter: [
    { slug: 'jupiter-wisdom',      title: 'Jupiter Dasha: the 16-year chapter of expansion',        mins: 5 },
    { slug: 'jupiter-transit',     title: 'What happens when Jupiter transits your 1st house',      mins: 4 },
  ],
  Saturn: [
    { slug: 'saturn-karma',        title: "Saturn's 7.5-year Sade Sati: what it really means",      mins: 6 },
    { slug: 'saturn-discipline',   title: 'Saturn Mahadasha: building what lasts',                  mins: 5 },
  ],
  Rahu: [
    { slug: 'rahu-obsession',      title: "Rahu's house: the area of life you're obsessed with",   mins: 4 },
  ],
  Ketu: [
    { slug: 'ketu-liberation',     title: 'Ketu: the planet of past-life mastery',                  mins: 3 },
  ],
}

const FALLBACK = [
  { slug: 'vedic-vs-western',     title: 'Vedic vs Western astrology: the sidereal difference',    mins: 3 },
  { slug: 'lagna-rising',         title: 'Why your Lagna (rising sign) matters more than your Sun', mins: 4 },
  { slug: 'dasha-system',         title: 'The Vimshottari Dasha: a 120-year map of your life',     mins: 5 },
]

// Deterministic daily rotation — same person gets the same capsule all day
function dailySeed() {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

function pickCapsule(planet) {
  const pool = CAPSULES[planet] ?? FALLBACK
  const seed = dailySeed()
  return pool[seed % pool.length]
}

// Planet glyph map — one character, no emoji, Vedic tradition
const GLYPHS = {
  Moon: '☽', Sun: '☉', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Rahu: '☊', Ketu: '☋',
}

export default function KnowledgeCapsule({ edition }) {
  const { t } = useTranslation()
  const planet = edition?.headline_event?.planet
  const capsule = useMemo(() => pickCapsule(planet), [planet])
  const glyph = GLYPHS[planet] ?? '✦'

  return (
    <div className="bg-parchment-card border border-line rounded-2xl overflow-hidden">
      {/* Gold top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="px-5 py-4 flex items-start gap-4">
        {/* Glyph circle */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-primary/30 font-serif text-base"
             style={{ background: 'rgba(217,164,65,0.10)', color: '#D9A441' }}>
          {glyph}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary-dark mb-1">
            {t('capsule_eyebrow')}
          </p>
          <p className="font-serif font-semibold text-[15px] text-ink leading-snug mb-1">
            {capsule.title}
          </p>
          <p className="text-[11px] text-ink-faint">
            {t('capsule_read_time', { mins: capsule.mins })}
          </p>
        </div>

        <Link
          to={`/learn/knowledge/${capsule.slug}`}
          className="shrink-0 self-center text-[12px] font-bold text-primary-dark hover:text-primary transition flex items-center gap-1"
        >
          {t('capsule_cta')} →
        </Link>
      </div>
    </div>
  )
}
