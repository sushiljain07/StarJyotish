// frontend/src/config/nakshatraContent.js
//
// All copy for /learn/nakshatras — the hub page for the 27 lunar mansions.
// Page component only composes layout; all reader-facing content lives here.

export const NAKSHATRA_HERO = {
  title: 'Nakshatras — The 27 Lunar Mansions',
  subtitle:
    'Most horoscopes stop at the zodiac sign. The Nakshatra system goes a layer deeper — dividing the sky into 27 lunar mansions that add nuance, precision, and a quality of description that no Sun or Moon sign alone can match.',
}

export const WHAT_IS_NAKSHATRA = {
  eyebrow: 'The Foundation',
  title: 'What a Nakshatra actually is',
  paragraphs: [
    'The word Nakshatra comes from Sanskrit: naksha (map or approach) and tra (protect or guard). These 27 divisions of the zodiac each span 13 degrees and 20 minutes of arc, and together they tile the sky completely — every degree of the zodiac belongs to exactly one Nakshatra.',
    'While the 12-sign zodiac (Rashis) follows the Sun\'s annual path, the Nakshatra system is lunar. The Moon moves through all 27 Nakshatras in roughly 27.3 days — which is why, in classical Vedic astrology, where your Moon sits in the Nakshatra map tells you far more about your emotional temperament, instincts, and inner world than your Sun sign does.',
    'Each Nakshatra has a presiding deity (Devata), a ruling planet (from the Vimshottari system), a primary symbol, and a quality (Gana) that describes its fundamental nature. These four layers together give an interpreter significantly more to work with than a sign placement alone.',
  ],
  didYouKnow: {
    title: 'Did you know?',
    body: 'The Nakshatra your Moon occupies at birth determines your Vimshottari Dasha sequence — the most widely used planetary timing system in Vedic astrology. Your birth Nakshatra is not just a descriptor; it is the starting gate for how time unfolds in your chart.',
  },
}

export const NAKSHATRA_VS_RASHI = {
  eyebrow: 'Two Layers of the Same Sky',
  title: 'Nakshatras and Rashis: how they relate',
  description: 'The 12 Rashis and 27 Nakshatras are two maps drawn over the same 360-degree zodiac. Neither replaces the other — they describe different dimensions of the same reality.',
  rashi: {
    label: 'Rashi (Sign)',
    system: 'The Solar Map',
    anchor: '12 equal 30° divisions of the zodiac',
    origin: 'Tracks the Sun\'s annual cycle and broad elemental qualities',
    focus: 'Temperament, life direction, broad identity archetype',
  },
  nakshatra: {
    label: 'Nakshatra (Lunar Mansion)',
    system: 'The Lunar Map',
    anchor: '27 divisions of 13°20\' each — Moon\'s monthly cycle',
    origin: 'Tracks the Moon\'s monthly passage through specific star clusters',
    focus: 'Emotional nature, instinctive drives, Dasha ruling planet',
  },
  closing: 'Two people with the same Moon sign (e.g. Scorpio) but different Nakshatras (Vishakha vs. Anuradha vs. Jyeshtha) can have strikingly different emotional temperaments. The Nakshatra is where the precision lives.',
}

export const NAKSHATRAS_INTRO = {
  eyebrow: 'The 27 Lunar Mansions',
  title: 'Meet the Nakshatras',
  description: 'Each of the 27 Nakshatras spans 13°20\' of the zodiac. They are listed here in order, with their ruling planet, symbol, and primary quality. Find the Nakshatra your Moon occupied at birth to begin.',
}

export const NAKSHATRAS = [
  { id: 1, name: 'Ashwini', devanagari: 'अश्विनी', degrees: '0°–13°20\' Aries', ruler: 'Ketu', symbol: 'Horse\'s head', nature: 'Swift initiation, healing, pioneers', gana: 'Deva (Divine)', comingSoon: true },
  { id: 2, name: 'Bharani', devanagari: 'भरणी', degrees: '13°20\'–26°40\' Aries', ruler: 'Venus', symbol: 'Yoni (womb)', nature: 'Transformation, restraint, bearing of burdens', gana: 'Manushya (Human)', comingSoon: true },
  { id: 3, name: 'Krittika', devanagari: 'कृत्तिका', degrees: '26°40\' Aries–10° Taurus', ruler: 'Sun', symbol: 'Knife or flame', nature: 'Purification, cutting through, courage', gana: 'Rakshasa (Fierce)', comingSoon: true },
  { id: 4, name: 'Rohini', devanagari: 'रोहिणी', degrees: '10°–23°20\' Taurus', ruler: 'Moon', symbol: 'Ox cart, temple', nature: 'Fertility, growth, beauty, creativity', gana: 'Manushya (Human)', comingSoon: true },
  { id: 5, name: 'Mrigashira', devanagari: 'मृगशिरा', degrees: '23°20\' Taurus–6°40\' Gemini', ruler: 'Mars', symbol: 'Deer\'s head', nature: 'Seeking, gentleness, exploration', gana: 'Deva (Divine)', comingSoon: true },
  { id: 6, name: 'Ardra', devanagari: 'आर्द्रा', degrees: '6°40\'–20° Gemini', ruler: 'Rahu', symbol: 'Teardrop, diamond', nature: 'Storms, intensity, breakthroughs after destruction', gana: 'Manushya (Human)', comingSoon: true },
  { id: 7, name: 'Punarvasu', devanagari: 'पुनर्वसु', degrees: '20° Gemini–3°20\' Cancer', ruler: 'Jupiter', symbol: 'Quiver of arrows', nature: 'Return, renewal, contentment, abundance', gana: 'Deva (Divine)', comingSoon: true },
  { id: 8, name: 'Pushya', devanagari: 'पुष्य', degrees: '3°20\'–16°40\' Cancer', ruler: 'Saturn', symbol: 'Flower, circle, arrow', nature: 'Nourishment, protection, spiritual authority', gana: 'Deva (Divine)', comingSoon: true },
  { id: 9, name: 'Ashlesha', devanagari: 'आश्लेषा', degrees: '16°40\'–30° Cancer', ruler: 'Mercury', symbol: 'Coiled serpent', nature: 'Penetration, kundalini, kundalini power, clairvoyance', gana: 'Rakshasa (Fierce)', comingSoon: true },
  { id: 10, name: 'Magha', devanagari: 'मघा', degrees: '0°–13°20\' Leo', ruler: 'Ketu', symbol: 'Royal throne', nature: 'Royalty, ancestral power, authority', gana: 'Rakshasa (Fierce)', comingSoon: true },
  { id: 11, name: 'Purva Phalguni', devanagari: 'पूर्व फाल्गुनी', degrees: '13°20\'–26°40\' Leo', ruler: 'Venus', symbol: 'Front legs of bed or hammock', nature: 'Pleasure, creativity, rest, patronage', gana: 'Manushya (Human)', comingSoon: true },
  { id: 12, name: 'Uttara Phalguni', devanagari: 'उत्तर फाल्गुनी', degrees: '26°40\' Leo–10° Virgo', ruler: 'Sun', symbol: 'Back legs of bed', nature: 'Service, unions, contracts, generosity', gana: 'Manushya (Human)', comingSoon: true },
  { id: 13, name: 'Hasta', devanagari: 'हस्त', degrees: '10°–23°20\' Virgo', ruler: 'Moon', symbol: 'Open hand', nature: 'Skill, craftsmanship, healing, self-control', gana: 'Deva (Divine)', comingSoon: true },
  { id: 14, name: 'Chitra', devanagari: 'चित्रा', degrees: '23°20\' Virgo–6°40\' Libra', ruler: 'Mars', symbol: 'Bright jewel, pearl', nature: 'Art, beauty, architecture, brilliance', gana: 'Rakshasa (Fierce)', comingSoon: true },
  { id: 15, name: 'Swati', devanagari: 'स्वाति', degrees: '6°40\'–20° Libra', ruler: 'Rahu', symbol: 'Shoot of plant, coral, sword', nature: 'Independence, flexibility, diplomacy', gana: 'Deva (Divine)', comingSoon: true },
  { id: 16, name: 'Vishakha', devanagari: 'विशाखा', degrees: '20° Libra–3°20\' Scorpio', ruler: 'Jupiter', symbol: 'Decorated gateway, potter\'s wheel', nature: 'Goal-orientation, patience, achievement', gana: 'Rakshasa (Fierce)', comingSoon: true },
  { id: 17, name: 'Anuradha', devanagari: 'अनुराधा', degrees: '3°20\'–16°40\' Scorpio', ruler: 'Saturn', symbol: 'Lotus flower, staff', nature: 'Devotion, friendship, organizational power', gana: 'Deva (Divine)', comingSoon: true },
  { id: 18, name: 'Jyeshtha', devanagari: 'ज्येष्ठा', degrees: '16°40\'–30° Scorpio', ruler: 'Mercury', symbol: 'Circular amulet, earring, umbrella', nature: 'Seniority, protection of family, occult power', gana: 'Rakshasa (Fierce)', comingSoon: true },
  { id: 19, name: 'Mula', devanagari: 'मूल', degrees: '0°–13°20\' Sagittarius', ruler: 'Ketu', symbol: 'Tied bunch of roots, elephant goad', nature: 'Root investigation, dissolution, liberation', gana: 'Rakshasa (Fierce)', comingSoon: true },
  { id: 20, name: 'Purva Ashadha', devanagari: 'पूर्व आषाढ़ा', degrees: '13°20\'–26°40\' Sagittarius', ruler: 'Venus', symbol: 'Fan, winnowing basket, tusk', nature: 'Early victories, invincibility, purification', gana: 'Manushya (Human)', comingSoon: true },
  { id: 21, name: 'Uttara Ashadha', devanagari: 'उत्तर आषाढ़ा', degrees: '26°40\' Sagittarius–10° Capricorn', ruler: 'Sun', symbol: 'Elephant tusk, small bed', nature: 'Final victory, introspection, broad achievement', gana: 'Manushya (Human)', comingSoon: true },
  { id: 22, name: 'Shravana', devanagari: 'श्रवण', degrees: '10°–23°20\' Capricorn', ruler: 'Moon', symbol: 'Ear, three footprints', nature: 'Listening, learning, connection across distance', gana: 'Deva (Divine)', comingSoon: true },
  { id: 23, name: 'Dhanishtha', devanagari: 'धनिष्ठा', degrees: '23°20\' Capricorn–6°40\' Aquarius', ruler: 'Mars', symbol: 'Drum, flute', nature: 'Wealth, rhythm, music, ambition', gana: 'Rakshasa (Fierce)', comingSoon: true },
  { id: 24, name: 'Shatabhisha', devanagari: 'शतभिषा', degrees: '6°40\'–20° Aquarius', ruler: 'Rahu', symbol: 'Empty circle, 100 stars', nature: 'Healing, seclusion, mysticism, research', gana: 'Rakshasa (Fierce)', comingSoon: true },
  { id: 25, name: 'Purva Bhadrapada', devanagari: 'पूर्व भाद्रपद', degrees: '20° Aquarius–3°20\' Pisces', ruler: 'Jupiter', symbol: 'Sword, front legs of funeral cot', nature: 'Transformation, austerity, fiery idealism', gana: 'Manushya (Human)', comingSoon: true },
  { id: 26, name: 'Uttara Bhadrapada', devanagari: 'उत्तर भाद्रपद', degrees: '3°20\'–16°40\' Pisces', ruler: 'Saturn', symbol: 'Twins, back legs of funeral cot, serpent in water', nature: 'Depth, wisdom, compassion, moksha', gana: 'Manushya (Human)', comingSoon: true },
  { id: 27, name: 'Revati', devanagari: 'रेवती', degrees: '16°40\'–30° Pisces', ruler: 'Mercury', symbol: 'Drum, fish, pair of fish', nature: 'Completion, safe passage, nourishment of all', gana: 'Deva (Divine)', comingSoon: true },
]

export const THREE_GANAS = {
  eyebrow: 'The Three Natures',
  title: 'Deva, Manushya, Rakshasa: the three Ganas',
  description: 'Every Nakshatra belongs to one of three Ganas — a quality that shapes temperament, approach to life, and certain compatibility considerations.',
  items: [
    {
      gana: 'Deva (Divine)',
      emoji: '✦',
      nakshatras: 'Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Swati, Anuradha, Shravana, Revati',
      description: 'Deva Gana Nakshatras are associated with qualities like generosity, clarity, idealism, and a tendency toward conventional virtue. They are often described as easier to work with in relationships, but can veer toward rigidity or naïveté when unexamined.',
    },
    {
      gana: 'Manushya (Human)',
      emoji: '◉',
      nakshatras: 'Bharani, Rohini, Ardra, Purva Phalguni, Uttara Phalguni, Vishakha, Purva Ashadha, Uttara Ashadha, Purva Bhadrapada, Uttara Bhadrapada',
      description: 'Manushya Gana carries a distinctly human quality — a mixture of virtue and desire, idealism and practicality. These Nakshatras are often highly creative, socially skilled, and emotionally nuanced, but can struggle with the competing pulls of aspiration and attachment.',
    },
    {
      gana: 'Rakshasa (Fierce)',
      emoji: '◈',
      nakshatras: 'Krittika, Ashlesha, Magha, Chitra, Vishakha, Jyeshtha, Mula, Dhanishtha, Shatabhisha',
      description: 'Rakshasa Gana is often misread as "demonic" — which misses the point. These Nakshatras carry intensity, focus, and a willingness to move against convention when necessary. The energy is not malevolent; it is purposeful in a way that does not always match social expectation.',
    },
  ],
}

export const HOW_TO_USE = {
  eyebrow: 'Practical Application',
  title: 'How to work with your Nakshatra',
  paragraphs: [
    'Your Janma Nakshatra — the Nakshatra your Moon occupied at birth — is the one most astrologers refer to when they say "your Nakshatra." This is the primary one to know. It shapes your emotional temperament, your instinctive responses, and, critically, which planet starts your Vimshottari Dasha sequence.',
    'But your Ascendant\'s Nakshatra and your Sun\'s Nakshatra are also worth understanding. The Nakshatra of the Ascendant can shape physical constitution and early life environment in ways the Rashi alone does not capture. The Sun\'s Nakshatra colours your sense of purpose and identity at a finer level than the Sun sign.',
    'In electional astrology (Muhurta), Nakshatra placement is often more important than sign placement. Muhurta practitioners choose specific Nakshatras for weddings, business launches, and surgeries not because of the sign the Moon is in, but because of which of the 27 mansions it occupies.',
  ],
}

export const NAKSHATRA_MYTHS = [
  {
    myth: 'Nakshatras are a less important version of the zodiac signs.',
    reality: 'Nakshatras and Rashis are parallel systems answering different questions. In classical Vedic practice, the Nakshatra of the Moon is often given more weight than the Moon\'s Rashi for understanding emotional temperament, Dasha timing, and compatibility. They are not a hierarchy — they are two lenses.',
  },
  {
    myth: 'You only need to know your Janma Nakshatra.',
    reality: 'Your birth Nakshatra (Janma Nakshatra) is the most emphasized, but every planet in your chart occupies a Nakshatra, and each one adds nuance. The Nakshatra of your Ascendant ruler, for instance, can significantly modify the themes described by your Ascendant sign.',
  },
  {
    myth: 'Nakshatras with "fierce" names (like Mula or Jyeshtha) are inauspicious.',
    reality: 'Each Nakshatra has a specific role in the cosmic system. Mula, which carries a quality of getting to the root of things, is not inauspicious — it is powerful in particular directions. Many influential people in history have prominent Mula placements. The quality of the Nakshatra only becomes challenging when the chart context makes it so.',
  },
]

export const NAKSHATRA_FAQ = [
  {
    question: 'How do I find my Janma Nakshatra?',
    answer: 'Your Janma Nakshatra is determined by the position of the Moon in your Vedic birth chart. Generate your Kundli using your birth date, time, and place — the Moon\'s degree will fall within one of the 27 Nakshatras, each spanning 13°20\'. Your chart will typically display this directly.',
  },
  {
    question: 'What is the difference between a Nakshatra Pada and a Navamsa?',
    answer: 'Each Nakshatra is divided into four Padas (quarters) of 3°20\' each. Across 27 Nakshatras, this produces 108 Padas total — which maps exactly to the 12 signs of the Navamsa chart (9 divisions per sign). The Pada of your Moon\'s Nakshatra is the same as your Navamsa Moon sign, connecting the two systems.',
  },
  {
    question: 'Why does my birth star (Nakshatra) matter for Vimshottari Dasha?',
    answer: 'The Vimshottari Dasha system assigns each Nakshatra a ruling planet. The planet ruling your birth Nakshatra is the first Mahadasha (major period) active at birth — or rather, you are born partway through it, with the remaining years calculated from how far the Moon has moved through that Nakshatra. This is why your Dasha sequence is unique to you even if you share a Moon sign with many others.',
  },
  {
    question: 'Are Nakshatras used for marriage compatibility?',
    answer: 'Yes — Nakshatra-based Guna Milan (sometimes called Ashtakoot matching) uses the birth Nakshatras of both partners to generate a compatibility score across eight dimensions. The Gana (nature) of each Nakshatra is one of these eight dimensions. While Guna Milan is widely used, most experienced astrologers read it alongside the full chart analysis rather than as a standalone verdict.',
  },
  {
    question: 'My Western astrology sign is different from my Vedic sign — does my Nakshatra also change?',
    answer: 'Yes. Nakshatras are part of the Vedic (sidereal) system, so they are calculated using the same zodiac as your Vedic Rashi, not your Western sign. The roughly 23-degree difference between the two systems means the Moon\'s position shifts by nearly one Nakshatra when you move from tropical to sidereal calculation. Use a Vedic chart to find your correct Nakshatra.',
  },
]

export const NAKSHATRA_CTA = {
  eyebrow: 'Star Jyotish',
  title: 'Find Your Janma Nakshatra',
  description: 'Your birth Nakshatra is calculated from the Moon\'s exact degree in your Vedic chart. Generate your free Kundli to see which of the 27 Nakshatras your Moon occupies — and which planet governs your Dasha sequence.',
  buttonLabel: 'Generate My Free Kundli',
}
