// frontend/src/config/planetsHubContent.js
//
// All copy for /learn/planets — the hub page for the nine Vedic grahas.
// (Distinct from planetsContent.js, which serves the /learn/basics/planets-guide
// beginner page. This hub page goes deeper and links to individual planet guides.)

export const PLANETS_HUB_HERO = {
  title: 'The Nine Planets (Navagrahas)',
  subtitle:
    'Vedic astrology works with nine grahas — seven classical planets plus the lunar nodes Rahu and Ketu. Each graha represents a fundamental principle of existence, and its placement in your chart shows how that principle operates in your life.',
}

export const WHAT_IS_A_GRAHA = {
  eyebrow: 'The Foundation',
  title: 'What a graha actually is',
  paragraphs: [
    'The Sanskrit word graha means "that which grasps" — a graha seizes and colours whatever it touches in the chart. This is why Vedic astrology talks about planetary influence in terms of grasp or aspecting, not just the planet\'s own position.',
    'Vedic tradition works with nine grahas, not the ten bodies used in Western astrology. Uranus, Neptune, and Pluto are not included in classical Jyotish because the system was finalized before their discovery. Some contemporary Vedic astrologers incorporate them; most classical practitioners do not. The outer planets are occasionally referred to as "Parigraha" (outer bodies) but hold no standard role in the core system.',
    'Each graha governs specific life areas (natural significations), rules one or two zodiac signs, and produces different results depending on which house it occupies, which houses it rules in a given chart, and which other grahas aspect or conjoin it. These four factors — placement, rulership, aspects, and conjunctions — together determine how a planet expresses in a specific birth chart.',
  ],
  didYouKnow: {
    title: 'Did you know?',
    body: 'Rahu and Ketu — the lunar north and south nodes — are not physical bodies but mathematical points: the intersections of the Moon\'s orbit with the ecliptic. Vedic astrology treats them as fully functional grahas with sign rulerships (disputed among different schools), significations, and Dasha periods of 18 and 7 years respectively.',
  },
}

export const PLANETS = [
  {
    id: 'surya',
    sanskrit: 'Surya',
    english: 'Sun',
    symbol: '☀',
    ruler: 'Leo (Simha)',
    exaltation: 'Aries (Mesha) at 10°',
    debilitation: 'Libra (Tula) at 10°',
    governs: 'Soul, vitality, father, authority, self-confidence, career',
    dasha: '6 years',
    color: '#D97706',
    tagline: 'The soul\'s light — identity, vitality, and the father principle',
    comingSoon: true,
  },
  {
    id: 'chandra',
    sanskrit: 'Chandra',
    english: 'Moon',
    symbol: '☽',
    ruler: 'Cancer (Karka)',
    exaltation: 'Taurus (Vrishabha) at 3°',
    debilitation: 'Scorpio (Vrishchika) at 3°',
    governs: 'Mind, emotions, mother, public image, nourishment, habits',
    dasha: '10 years',
    color: '#6B7280',
    tagline: 'The mind and emotional body — mother, memory, instinct',
    comingSoon: true,
  },
  {
    id: 'mangal',
    sanskrit: 'Mangal',
    english: 'Mars',
    symbol: '♂',
    ruler: 'Aries (Mesha) and Scorpio (Vrishchika)',
    exaltation: 'Capricorn (Makara) at 28°',
    debilitation: 'Cancer (Karka) at 28°',
    governs: 'Energy, courage, siblings, property, accidents, warfare',
    dasha: '7 years',
    color: '#DC2626',
    tagline: 'Energy, courage, and the drive to act — the warrior principle',
    comingSoon: true,
  },
  {
    id: 'budha',
    sanskrit: 'Budha',
    english: 'Mercury',
    symbol: '☿',
    ruler: 'Gemini (Mithuna) and Virgo (Kanya)',
    exaltation: 'Virgo (Kanya) at 15°',
    debilitation: 'Pisces (Meena) at 15°',
    governs: 'Intellect, communication, skills, trade, mathematics, speech',
    dasha: '17 years',
    color: '#059669',
    tagline: 'Intelligence, communication, and the power to discriminate',
    comingSoon: true,
  },
  {
    id: 'guru',
    sanskrit: 'Guru (Brihaspati)',
    english: 'Jupiter',
    symbol: '♃',
    ruler: 'Sagittarius (Dhanu) and Pisces (Meena)',
    exaltation: 'Cancer (Karka) at 5°',
    debilitation: 'Capricorn (Makara) at 5°',
    governs: 'Wisdom, knowledge, dharma, children, teachers, expansion, prosperity',
    dasha: '16 years',
    color: '#D97706',
    tagline: 'The great benefic — wisdom, expansion, dharma, and abundance',
    comingSoon: true,
  },
  {
    id: 'shukra',
    sanskrit: 'Shukra',
    english: 'Venus',
    symbol: '♀',
    ruler: 'Taurus (Vrishabha) and Libra (Tula)',
    exaltation: 'Pisces (Meena) at 27°',
    debilitation: 'Virgo (Kanya) at 27°',
    governs: 'Love, beauty, luxury, marriage, arts, vehicles, sensory pleasure',
    dasha: '20 years',
    color: '#7C3AED',
    tagline: 'Beauty, love, creativity, and all things that delight the senses',
    comingSoon: true,
  },
  {
    id: 'shani',
    sanskrit: 'Shani',
    english: 'Saturn',
    symbol: '♄',
    ruler: 'Capricorn (Makara) and Aquarius (Kumbha)',
    exaltation: 'Libra (Tula) at 20°',
    debilitation: 'Aries (Mesha) at 20°',
    governs: 'Discipline, karma, longevity, service, delays, detachment',
    dasha: '19 years',
    color: '#374151',
    tagline: 'The taskmaster — karma, discipline, endurance, and liberation through effort',
    comingSoon: true,
  },
  {
    id: 'rahu',
    sanskrit: 'Rahu',
    english: 'North Node',
    symbol: '☊',
    ruler: 'Disputed (Aquarius per some schools)',
    exaltation: 'Taurus (Vrishabha) or Gemini (Mithuna) — schools differ',
    debilitation: 'Scorpio (Vrishchika) or Sagittarius (Dhanu) — schools differ',
    governs: 'Desire, foreign things, technology, obsession, unconventional paths',
    dasha: '18 years',
    color: '#1F2937',
    tagline: 'The north node — worldly desire, obsession, and the hunger to experience',
    comingSoon: true,
  },
  {
    id: 'ketu',
    sanskrit: 'Ketu',
    english: 'South Node',
    symbol: '☋',
    ruler: 'Disputed (Scorpio per some schools)',
    exaltation: 'Scorpio (Vrishchika) or Sagittarius (Dhanu) — schools differ',
    debilitation: 'Taurus (Vrishabha) or Gemini (Mithuna) — schools differ',
    governs: 'Liberation, past-life karma, spirituality, isolation, detachment',
    dasha: '7 years',
    color: '#6B7280',
    tagline: 'The south node — liberation, detachment, and what the soul already knows',
    comingSoon: true,
  },
]

export const PLANETARY_RELATIONSHIPS = {
  eyebrow: 'How Planets Interact',
  title: 'Natural friendships and enmities',
  description: 'In Vedic astrology, planets carry natural relationships with each other — friendships (Mitra), enmities (Shatru), and neutral relationships (Sama). When planets are in each other\'s signs or conjoined, these relationships modify how each one performs.',
  paragraphs: [
    'A planet placed in a friendly sign is generally comfortable and expressive. A planet in an enemy sign faces friction — it still produces results, but with more difficulty or in a less refined form. A planet in its own sign is particularly strong; in its sign of exaltation, it performs at its peak.',
    'Temporary relationships are also calculated based on mutual position in the chart — a planet seven houses away from another is treated as temporarily friendly, regardless of the natural relationship. The combined relationship (natural + temporary) gives the "compound" relationship that some calculations use.',
    'Understanding which planets are friends and which are enemies in your chart is one of the first steps in learning to read planetary interactions — a topic each individual planet guide covers in context.',
  ],
}

export const PLANETS_MYTHS = [
  {
    myth: 'Saturn is always bad and Jupiter is always good.',
    reality: 'In Vedic astrology, every planet is "good" in some contexts and challenging in others. Saturn as the ruler of your Ascendant can be highly beneficial. Jupiter ruling two malefic houses in your chart can create more friction than help. Planet quality in Vedic astrology is always chart-specific, never universal.',
  },
  {
    myth: 'The planet in your Sun sign is the most important.',
    reality: 'In Vedic astrology, the Ascendant ruler (Lagnesh) is typically given more weight than the Sun sign ruler for understanding personality and life events. The Moon\'s ruling planet (through its Nakshatra) matters for timing. Multiple planets can be important depending on what question you\'re asking.',
  },
  {
    myth: 'Rahu and Ketu are imaginary — they don\'t count as "real" planets.',
    reality: 'Rahu and Ketu are gravitational reference points, not physical bodies — but in Vedic astrology, they behave as fully functional grahas. They have Dasha periods (18 and 7 years respectively), produce specific results by house and sign placement, and are often involved in some of the most significant life events a chart describes. Classical texts treat them with as much seriousness as any physical planet.',
  },
]

export const PLANETS_FAQ = [
  {
    question: 'How do I know which planet is most important in my chart?',
    answer: 'The most important planet is usually the Lagnesh — the ruler of your Ascendant sign. This planet\'s placement by house and sign shapes more of your chart\'s themes than any other. The Atmakaraka (the planet with the highest degree in your chart, across all signs) is also significant in some Vedic approaches, particularly Jaimini astrology.',
  },
  {
    question: 'What does it mean when a planet is "debilitated"?',
    answer: 'Debilitation (Neecha) means a planet is placed in the sign opposite to where it\'s exalted — the position of greatest discomfort. A debilitated planet typically struggles to express its positive qualities cleanly and may produce its results with difficulty, delay, or in distorted form. However, Neecha Bhanga (cancellation of debilitation) can occur when specific conditions are met, restoring much of the planet\'s strength.',
  },
  {
    question: 'Are some planets always malefic and others always benefic?',
    answer: 'Natural benefics (Shubha Graha) — Jupiter, Venus, waxing Moon, and Mercury (when not conjunct malefics) — tend toward positive results by nature. Natural malefics — Saturn, Mars, Sun, Rahu, Ketu, and waning Moon — tend toward more challenging results by nature. But functional beneficence and maleficence depend on chart-specific rulership: the same planet can be a benefic for one Ascendant and a malefic for another.',
  },
  {
    question: 'What is the difference between a planet\'s sign and its house?',
    answer: 'The sign a planet occupies describes the quality or style of its expression. The house it occupies describes which life area it activates. For example, Venus in Libra (its own sign, strong) placed in the 6th house (disputes, health, service) will express Venusian themes — beauty, relationships, pleasure — through 6th house channels like workplace harmony or aesthetic healthcare. Sign and house together tell a more complete story than either alone.',
  },
]

export const PLANETS_HUB_CTA = {
  eyebrow: 'Star Jyotish',
  title: 'See Where the Nine Planets Fall in Your Chart',
  description: 'Each planet\'s sign, house, and relationships in your Kundli tells a specific story. Generate your free Vedic birth chart to see all nine grahas placed in their exact positions.',
  buttonLabel: 'Generate My Free Kundli',
}
