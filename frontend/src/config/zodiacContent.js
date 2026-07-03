// frontend/src/config/zodiacContent.js
//
// Single source of truth for /learn/zodiac's copy — same reasoning as
// learnContent.js: the page component should compose reusable pieces,
// not carry paragraphs inline. RASHIS in particular is written so that
// once individual sign pages exist, each entry just needs `comingSoon`
// flipped to false and an `href` added — nothing else about this file
// changes.

export const ZODIAC_HERO = {
  title: 'Understanding the 12 Zodiac Signs in Vedic Astrology',
  subtitle:
    'Every birth chart begins with the zodiac, but every life unfolds uniquely. Discover the twelve Rashis of Vedic astrology, what they represent, and why your zodiac sign is only one chapter in your complete birth chart.',
}

export const COSMIC_LANGUAGE = {
  eyebrow: 'The Zodiac',
  title: 'A cosmic language',
  paragraphs: [
    'Long before birth charts were computed, they were watched. The zodiac began as a way of dividing the sky into twelve fixed reference points — a language for describing where the Sun, Moon, and planets stood at any given moment, passed down through generations of careful observation.',
    'That is worth sitting with, because it changes what a "zodiac sign" actually is. It is not a prophecy written in the stars. It is a symbolic vocabulary — a set of patterns, temperaments, and tendencies that Vedic astrology uses to describe a moment in time, and the person born into it. Your sign does not predict your destiny. It describes a starting pattern that the rest of your chart goes on to shape, challenge, and refine.',
  ],
  didYouKnow: {
    title: 'Did You Know?',
    body: 'Because Vedic astrology tracks the actual, currently observable positions of the constellations, and Western astrology tracks the seasons instead, the two systems have slowly drifted apart over centuries. Today, a Vedic zodiac sign often falls about one sign earlier than its Western counterpart for the same birth date.',
  },
}

export const VEDIC_VS_WESTERN = {
  eyebrow: 'Two Systems',
  title: 'Vedic vs. Western astrology',
  description:
    'Both systems use the same twelve signs and the same nine visible bodies. What differs is how each one measures the sky — and that single difference changes everything downstream.',
  vedic: {
    label: 'Vedic Astrology',
    system: 'Sidereal zodiac',
    anchor: 'Anchored to the real, currently observable positions of the constellations.',
    origin: 'Rooted in classical Indian texts and centuries of direct astronomical observation.',
    focus: 'Emphasizes timing — planetary periods (Dashas) and the birth chart as one interconnected map, not a single sign.',
  },
  western: {
    label: 'Western Astrology',
    system: 'Tropical zodiac',
    anchor: "Anchored to the seasons — the Sun's position relative to the spring equinox.",
    origin: 'Rooted in Hellenistic astrology and the European tradition that followed it.',
    focus: 'Emphasizes personality and psychology, typically centered on the Sun sign as the primary lens.',
  },
  closing:
    "Neither system is more \"correct\" than the other — they simply measure the sky differently and ask different questions of it. Star Jyotish works from the Vedic, sidereal tradition because that's the lineage this platform is built on, not because the alternative is wrong.",
}

export const RASHIS_INTRO = {
  eyebrow: 'The Twelve Signs',
  title: 'Meet the twelve Rashis',
  description: 'Each Rashi carries an archetype — a core identity that colors how its energy tends to show up in a chart.',
}

export const RASHIS = [
  { id: 'aries',       sanskrit: 'Mesha',       english: 'Aries',       archetype: 'The Pioneer',     tagline: 'Courage begins with the first step.' },
  { id: 'taurus',      sanskrit: 'Vrishabha',   english: 'Taurus',      archetype: 'The Builder',      tagline: 'What is built slowly rarely falls quickly.' },
  { id: 'gemini',      sanskrit: 'Mithuna',     english: 'Gemini',      archetype: 'The Communicator',  tagline: 'Every idea deserves to be spoken aloud.' },
  { id: 'cancer',      sanskrit: 'Karka',       english: 'Cancer',      archetype: 'The Nurturer',      tagline: 'Home is wherever they choose to protect.' },
  { id: 'leo',         sanskrit: 'Simha',       english: 'Leo',         archetype: 'The Sovereign',     tagline: 'To lead is to be seen, and to be seen is to matter.' },
  { id: 'virgo',       sanskrit: 'Kanya',       english: 'Virgo',       archetype: 'The Analyst',       tagline: 'Perfection is just care, repeated.' },
  { id: 'libra',       sanskrit: 'Tula',        english: 'Libra',       archetype: 'The Diplomat',      tagline: 'Balance is not indecision — it is precision.' },
  { id: 'scorpio',     sanskrit: 'Vrishchika',  english: 'Scorpio',     archetype: 'The Transformer',   tagline: 'Depth is chosen, not avoided.' },
  { id: 'sagittarius', sanskrit: 'Dhanu',       english: 'Sagittarius', archetype: 'The Seeker',        tagline: "The horizon isn't a destination — it's a direction." },
  { id: 'capricorn',   sanskrit: 'Makara',      english: 'Capricorn',   archetype: 'The Strategist',    tagline: 'Patience is ambition in disguise.' },
  { id: 'aquarius',    sanskrit: 'Kumbha',      english: 'Aquarius',    archetype: 'The Visionary',     tagline: 'The future is easier to imagine than to wait for.' },
  { id: 'pisces',      sanskrit: 'Meena',       english: 'Pisces',      archetype: 'The Dreamer',       tagline: 'Two currents, one sea.' },
]

export const BEYOND_ZODIAC = {
  eyebrow: "Beyond Your Sign",
  title: 'Beyond your zodiac sign',
  description: 'A zodiac sign is where a birth chart starts, not where it ends. A complete horoscope also includes:',
  items: [
    { label: 'Ascendant (Lagna)', conceptId: 'ascendant', description: 'The exact degree rising at your birth — it shapes how the world sees you, and where your chart truly begins.' },
    { label: 'Moon Sign (Rashi)', conceptId: 'moon-sign', description: 'Governs your emotional instincts. In Vedic astrology, this often carries more weight than your Sun sign.' },
    { label: 'Planets (Grahas)', conceptId: 'planets', description: 'Nine placements that color everything from ambition to relationships, each in its own way.' },
    { label: 'Houses (Bhavas)', conceptId: 'houses', description: 'Twelve divisions of life — career, marriage, wealth — each governed by a different part of your chart.' },
    { label: 'Nakshatras', conceptId: 'nakshatra', description: 'Twenty-seven lunar mansions that add a layer of detail no single zodiac sign can capture alone.' },
    { label: 'Dashas', conceptId: 'dasha', description: 'Planetary time periods that explain not just what may unfold, but roughly when.' },
  ],
  analogy: 'Your Zodiac Sign is the cover of the book. Your Kundli is the entire story.',
}

export const MYTHS = [
  {
    myth: 'My zodiac sign defines everything about me.',
    reality: "Your sign is one input among many — Ascendant, Moon sign, house placements, and planetary periods all shape a chart together. No single sign tells the whole story.",
  },
  {
    myth: 'People with the same sign are basically identical.',
    reality: "Two people can share a Sun sign and have entirely different Ascendants, Moon signs, and house placements — which is most of what actually distinguishes one chart from another.",
  },
  {
    myth: 'Astrology means everything is predetermined.',
    reality: 'Vedic astrology is more often described as a map of tendencies and timing than a fixed script — it points to patterns and periods, not a single unavoidable outcome.',
  },
]

export const ZODIAC_FAQ = [
  {
    question: 'What is my Vedic zodiac sign?',
    answer: "Your Vedic (sidereal) zodiac sign is based on the Moon's actual, currently observable position among the constellations at your birth — which is why it can differ from the Western sign you may already know.",
  },
  {
    question: 'Why is it different from my Western zodiac sign?',
    answer: "Western astrology anchors the zodiac to the seasons, while Vedic astrology anchors it to the real position of the stars. Over centuries, these two reference points have slowly drifted apart, which is why the same birth date can land in different signs under each system.",
  },
  {
    question: 'Is my Moon sign more important than my Sun sign?',
    answer: 'In Vedic astrology, yes, generally — the Moon sign is often treated as the primary lens for personality and emotional temperament, with the Ascendant shaping outward presentation, and the Sun playing a more specific, focused role.',
  },
  {
    question: 'Does compatibility depend only on zodiac sign?',
    answer: 'No. Traditional Vedic compatibility analysis (Guna Milan) looks primarily at Moon sign and Nakshatra, alongside several other chart factors — a shared Sun sign alone says very little about compatibility.',
  },
]

export const ZODIAC_FINAL_CTA = {
  eyebrow: 'Star Jyotish',
  title: 'Your Story Is More Than a Zodiac Sign',
  description: 'See your Ascendant, Moon sign, planets, and houses come together in a chart built for you.',
  buttonLabel: 'Generate My Free Kundli',
}
