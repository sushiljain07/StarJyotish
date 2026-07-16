// frontend/src/components/home/KnowledgeCapsule.jsx
//
// "One idea before you go" — a single, short, automatically selected piece
// of Vedic knowledge that ties directly to today's chart:
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
// v2 (Home reimagined): restyled to the approved mock's "learn card" —
// a square gold-tinted glyph tile instead of a circle badge, a real
// 2-line body under the title (added below; the v1 card only had a title
// + read-time, no body text) instead of a separate "N min read" line, and
// a "Read the guide →" link (new key — capsule_cta already carried the
// old "Continue" copy, kept in place for anything else still using it).
//
// Content map: planet → knowledge article slug. Extend as articles are added.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const CAPSULES = {
  Moon: [
    { slug: 'moon-in-houses', title: 'Why the Moon is more personal than your Sun sign', mins: 3,
      body: 'Your Sun is who you become; your Moon is how you already feel, day to day.' },
    { slug: 'nakshatra-moon', title: 'How your Janma Nakshatra shapes your instincts', mins: 4,
      body: 'The 27 nakshatras cut the zodiac finer than signs — yours colors your gut reactions.' },
  ],
  Sun: [
    { slug: 'sun-soul-indicator', title: "The Sun as Atmakaraka — your soul's purpose planet", mins: 3,
      body: 'In Jaimini astrology, the planet with the highest degree becomes your soul significator.' },
  ],
  Mercury: [
    { slug: 'mercury-intellect', title: 'Mercury retrograde: what it actually means in your 3rd', mins: 3,
      body: "It's a shadow period, not a curse — communication and travel just ask for a second look." },
  ],
  Venus: [
    { slug: 'venus-relationships', title: 'Venus in your 7th: the partnership mirror', mins: 4,
      body: 'The 7th house is the one bhava that is always about someone else, not you.' },
  ],
  Mars: [
    { slug: 'mars-energy', title: 'Mars as the action planet — ambition vs. aggression', mins: 3,
      body: 'Mars gives you the will to act — whether that reads as drive or friction depends on its house.' },
  ],
  Jupiter: [
    { slug: 'jupiter-wisdom', title: 'Jupiter Dasha: the 16-year chapter of expansion', mins: 5,
      body: 'The longest benefic dasha in the Vimshottari system — growth through teaching and faith.' },
    { slug: 'jupiter-transit', title: 'What happens when Jupiter transits your 1st house', mins: 4,
      body: 'A once-in-12-years window where your presence, weight, and optimism visibly expand.' },
  ],
  Saturn: [
    { slug: 'saturn-karma', title: "Saturn's 7.5-year Sade Sati: what it really means", mins: 6,
      body: 'Not a punishment — a slow audit of what in your life is actually built to last.' },
    { slug: 'saturn-discipline', title: 'Saturn Mahadasha: building what lasts', mins: 5,
      body: 'Saturn rewards patience and structure over speed — this chapter favors the long game.' },
  ],
  Rahu: [
    { slug: 'rahu-obsession', title: "Rahu's house: the area of life you're obsessed with", mins: 4,
      body: "A shadow planet with no body of its own — it amplifies whatever house it sits in." },
  ],
  Ketu: [
    { slug: 'ketu-liberation', title: 'Ketu: the planet of past-life mastery', mins: 3,
      body: "Where Rahu hungers, Ketu has already mastered and moved on — often felt as detachment." },
  ],
}

const FALLBACK = [
  { slug: 'vedic-vs-western', title: 'Vedic vs Western astrology: the sidereal difference', mins: 3,
    body: 'Vedic charts track the actual sky (sidereal); Western tracks the seasons (tropical).' },
  { slug: 'lagna-rising', title: 'Why your Lagna (rising sign) matters more than your Sun', mins: 4,
    body: 'Your ascendant sets every house in your chart — it is the lens the rest is read through.' },
  { slug: 'dasha-system', title: 'The Vimshottari Dasha: a 120-year map of your life', mins: 5,
    body: 'A fixed sequence of nine planetary periods, timed from your Moon’s nakshatra at birth.' },
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
    <div className="bg-white/[0.045] border border-white/[0.09] rounded-card overflow-hidden hover:border-primary/30 transition">
      <div className="px-5 py-4 flex items-start gap-3.5">
        {/* Glyph tile — gold-tinted square, not a circle badge, per the mock's learn-card */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 border border-primary/25 font-serif text-lg text-primary-glow">
          {glyph}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-serif font-medium text-[15px] text-primary-light leading-snug mb-1">
            {capsule.title}
          </p>
          <p className="text-xs text-ink-onnight/50 leading-relaxed line-clamp-2 mb-2">
            {capsule.body}
          </p>
          <Link
            to={`/learn/knowledge/${capsule.slug}`}
            className="text-2xs font-bold text-primary hover:text-primary-glow transition"
          >
            {t('capsule_read_guide', 'Read the guide →')}
          </Link>
        </div>
      </div>
    </div>
  )
}
