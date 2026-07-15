// frontend/src/config/kundliContent.js
//
// All copy for /learn/basics/what-is-kundli.
// Follows ariesContent.js's precedent exactly — page component only
// composes layout; everything a reader actually reads lives here.

export const KUNDLI_HERO = {
  title: 'What Is a Kundli, Really?',
  subtitle:
    'A birth chart is a snapshot of the sky at the exact moment you were born — here is what that snapshot actually encodes, and how to start reading it.',
}

export const KUNDLI_QUICK_FACTS = [
  { label: 'Also called',       value: 'Janam Patrika, Birth Chart, Horoscope' },
  { label: 'Core inputs',       value: 'Date, exact time, and place of birth' },
  { label: 'Key reference points', value: 'Lagna, Rashi (Moon sign), Sun sign' },
  { label: 'House system',      value: 'Whole-sign (Vedic tradition)' },
  { label: 'Planets tracked',   value: '9 Grahas (includes Rahu & Ketu)' },
  { label: 'Chart styles',      value: 'North Indian diamond, South Indian grid' },
]

export const SKY_AS_CLOCK = {
  eyebrow: 'The Foundation',
  title: 'The sky as a clock',
  paragraphs: [
    'Every moment has a unique astronomical fingerprint. At the precise second of your birth, every planet occupied a specific position in the sky above the specific location where you were born. A Kundli is simply a map of those positions, drawn onto a 360° wheel divided into twelve segments called houses.',
    'Think of it less like a fortune cookie and more like a topographic map. A topographic map does not tell you what will happen when you hike a mountain — it tells you the shape of the terrain: where the ridges are, where water collects, which slopes are steep. What you do with that terrain is still entirely up to you.',
    'This is why the three inputs — date, time, and place — are all essential. Change any one of them and the chart changes. The date tells you where the planets were that day. The place tells you which horizon was relevant. The time tells you which slice of sky was rising in the east.',
  ],
  callout: {
    variant: 'tip',
    title: 'What the chart actually records',
    body: 'Three things are frozen at birth: (1) which zodiac sign was rising on the eastern horizon — your Lagna, (2) which sign the Moon occupied — your Rashi, and (3) where the Sun sat — your Sun sign. Everything else in the chart orbits around these three reference points.',
  },
}

export const CHART_FORMATS = {
  eyebrow: 'Reading the chart',
  title: 'North Indian vs South Indian — same data, different frame',
  paragraphs: [
    'If you have ever seen two Kundlis that look nothing alike, you may have been looking at different regional formats. The North Indian chart uses a diamond-grid where the Lagna is fixed at the top and the houses rotate clockwise around it. The South Indian chart uses a fixed grid where each cell always represents the same zodiac sign regardless of Lagna.',
    'The underlying planetary data is identical in both. The sign that was rising at your birth, where Mars sits, what degree Jupiter occupies — none of that changes based on the format. Only the visual grammar changes. Star Jyotish defaults to the North Indian format — the most widely used across Central and North India — but the interpretations in every guide here apply equally to both.',
  ],
}

export const TWELVE_HOUSES = {
  eyebrow: 'The structure',
  title: 'The twelve houses: life\'s twelve departments',
  intro: 'Imagine your life split into twelve departments, each responsible for a different domain. The planets are like executives placed into those departments by the sky at your birth. A strong planet in a house amplifies that life area; a weak or afflicted one creates friction there.',
  houses: [
    { num: 1,  name: 'Lagna (Tanu)',  governs: 'Self, body, personality, overall vitality' },
    { num: 2,  name: 'Dhana',         governs: 'Wealth, speech, family, food' },
    { num: 3,  name: 'Sahaja',        governs: 'Courage, siblings, short travel, effort' },
    { num: 4,  name: 'Sukha',         governs: 'Home, mother, inner peace, property' },
    { num: 5,  name: 'Putra',         governs: 'Children, intelligence, past-life merit, creativity' },
    { num: 6,  name: 'Shatru',        governs: 'Enemies, illness, debt, service, daily routine' },
    { num: 7,  name: 'Kalatra',       governs: 'Spouse, partnerships, public life, business' },
    { num: 8,  name: 'Mrityu',        governs: 'Transformation, hidden things, longevity, sudden change' },
    { num: 9,  name: 'Dharma',        governs: 'Fortune, father, philosophy, guru, long travel' },
    { num: 10, name: 'Karma',         governs: 'Career, status, public reputation, authority' },
    { num: 11, name: 'Labha',         governs: 'Gains, desires, elder siblings, social networks' },
    { num: 12, name: 'Vyaya',         governs: 'Loss, liberation, foreign lands, spiritual practice' },
  ],
  callout: {
    variant: 'note',
    title: 'Kendra and Trikona — the power houses',
    body: 'Houses 1, 4, 7, and 10 are called Kendras (angles) — they carry the most direct influence on life outcomes. Houses 1, 5, and 9 are called Trikonas (trines) — they are considered the most auspicious. A planet placed in both (e.g. the 1st house, which is both a Kendra and a Trikona) is in an extremely powerful position.',
  },
}

export const WHY_DIFFERENT = {
  eyebrow: 'The most common question',
  title: 'Why two people born on the same day can be completely different',
  paragraphs: [
    'Sun-sign columns in newspapers group everyone born in the same 30-day window together — roughly 1/12th of all humans. That is not a birth chart. That is a category.',
    'A Kundli changes every two hours because the Lagna (rising sign) shifts approximately every two hours as Earth rotates. Twins born ninety minutes apart can have meaningfully different charts. Your birth time matters as much as your birth date.',
    'Beyond the Lagna, the Moon moves about 13° per day — fast enough that its sign changes every 2.25 days. Someone born at midnight and someone born at 10 PM on the same calendar date might have the Moon in entirely different signs, which is one of the most important placements in Vedic astrology.',
  ],
  callout: {
    variant: 'warning',
    title: 'The 2-hour rule',
    body: 'If you do not know your exact birth time, your chart is incomplete. The houses will be uncertain, and any house-based prediction becomes unreliable. Ask a parent, check your birth certificate, or contact the hospital where you were born. Even an approximate time — morning, afternoon, evening, night — helps narrow the Lagna down significantly.',
  },
}

export const WHAT_KUNDLI_CANNOT_TELL = {
  eyebrow: 'An honest note',
  title: 'What the Kundli cannot tell you',
  paragraphs: [
    'A Kundli encodes tendencies, not destiny. It shows the terrain you were born into — the natural strengths you can leverage, the blind spots worth being aware of, the timing windows when effort tends to pay off more than usual. It is a description of potential energy, not a script.',
    'The chart does not remove your agency. A difficult Saturn placement does not mean a difficult life — it often means a life in which discipline, patience, and sustained effort produce more durable results than shortcuts ever could. A powerful Jupiter does not guarantee wealth; it creates a natural orientation toward expansion that still requires cultivation.',
    'The best Vedic astrologers treat the chart the way a good doctor treats a scan: as data that informs decisions, not a verdict to be handed to the patient. How you work with your chart is always your choice.',
  ],
  reflection: 'What would change about how you approach a challenge, if you knew that your chart showed this as an area where sustained effort — not shortcuts — tends to produce results?',
}

export const KUNDLI_FAQ = [
  {
    q: 'What is the difference between a Kundli and a Western horoscope?',
    a: 'Western astrology uses the Tropical zodiac, which is fixed to the seasons. Vedic astrology uses the Sidereal zodiac, which tracks actual star positions. This creates roughly a 23° shift between the two systems, meaning your Sun sign in Western astrology is often different from your Sun sign in Vedic astrology. Vedic astrology also places far more emphasis on the Moon sign and Lagna (Ascendant) than Western sun-sign astrology does.',
  },
  {
    q: 'What if I don\'t know my exact birth time?',
    a: 'A chart without an exact birth time is incomplete. The Lagna (Ascendant) — which changes every two hours — cannot be determined, and all twelve houses are uncertain. Some astrologers use "birth time rectification" techniques to narrow down the time based on life events, but this is an advanced practice. The most reliable step is to obtain your birth certificate or ask a family member who was present.',
  },
  {
    q: 'Does the Kundli predict what will happen to me?',
    a: 'Not in a deterministic sense. A Kundli maps the terrain of your life — natural tendencies, timing windows, areas of strength and challenge. It does not run a fixed script. Many experienced astrologers prefer the language of "predispositions" and "timing": a chart might show a period strongly favourable for career growth, but that growth still requires action, not just waiting.',
  },
  {
    q: 'Can I read my own Kundli, or do I need an astrologer?',
    a: 'You can absolutely learn to read your own chart — that is exactly what this Knowledge Center is built for. The Basics series here (four guides, including this one) gives you the foundation. A trained astrologer brings years of pattern recognition that a beginner cannot replicate, but understanding your own Lagna, Moon sign, and major planetary placements is entirely within reach for anyone willing to spend a few hours learning.',
  },
]
