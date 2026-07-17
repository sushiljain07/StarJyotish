// frontend/src/config/dashasHubContent.js
//
// All copy for /learn/dashas — hub page for the Vimshottari Dasha timing system.

export const DASHAS_HERO = {
  title: 'Dashas — Vedic Astrology\'s Timing System',
  subtitle:
    'Vedic astrology\'s most powerful contribution to predictive work is its timing system: the Dashas. These planetary time periods answer not just "what does my chart say" but "when does it happen" — making timing central to how astrology actually works in practice.',
}

export const WHAT_ARE_DASHAS = {
  eyebrow: 'The Foundation',
  title: 'What a Dasha actually is',
  paragraphs: [
    'The word Dasha means "condition" or "state" in Sanskrit. A Dasha period is a span of time during which a specific planet governs the unfolding of events — when its themes, the house it occupies, the houses it rules, and its relationships with other planets all become particularly prominent in a person\'s life.',
    'The most widely used system is Vimshottari Dasha — a 120-year cycle divided among the nine Vedic planets. The cycle begins at your birth Nakshatra and unfolds in a fixed sequence. You are born partway through one planet\'s period (calculated by how far the Moon has travelled through your birth Nakshatra), and the remaining years of that planet\'s period are the first Dasha of your life.',
    'Within each Mahadasha (major period), there are nine Antardashas (sub-periods), one for each planet in sequence. Within each Antardasha, there are nine Pratyantardashas (sub-sub-periods). This three-level subdivision is what allows Vedic astrologers to time events with remarkable specificity — down to a particular season or even a particular month in some cases.',
  ],
  didYouKnow: {
    title: 'Did you know?',
    body: 'The 120-year total of the Vimshottari system corresponds to the maximum human lifespan recognized in classical Vedic thought. Very few people live long enough to complete the full cycle — which means your Dasha sequence is always a partial experience of the complete 120-year pattern.',
  },
}

export const VIMSHOTTARI_SEQUENCE = {
  eyebrow: 'The 120-Year Cycle',
  title: 'The Vimshottari Dasha sequence',
  description: 'The nine planets each rule a fixed span of years in a fixed order. You enter this cycle at the planet ruling your birth Nakshatra, and proceed through each in sequence. Where the Sun\'s period ends, the Moon\'s begins; and so on.',
  dashas: [
    { planet: 'Sun (Surya)', years: 6, nakshatra: 'Krittika, Uttara Phalguni, Uttara Ashadha', quality: 'Authority, soul direction, the father principle, ambition and recognition' },
    { planet: 'Moon (Chandra)', years: 10, nakshatra: 'Rohini, Hasta, Shravana', quality: 'Emotional life, the mother, public connection, nourishment and fluctuation' },
    { planet: 'Mars (Mangal)', years: 7, nakshatra: 'Mrigashira, Chitra, Dhanishtha', quality: 'Energy, courage, siblings, property, competition and physical vitality' },
    { planet: 'Rahu', years: 18, nakshatra: 'Ardra, Swati, Shatabhisha', quality: 'Worldly ambition, obsession, foreign influences, unconventional paths, rapid change' },
    { planet: 'Jupiter (Guru)', years: 16, nakshatra: 'Punarvasu, Vishakha, Purva Bhadrapada', quality: 'Wisdom, expansion, children, teachers, prosperity and dharmic alignment' },
    { planet: 'Saturn (Shani)', years: 19, nakshatra: 'Pushya, Anuradha, Uttara Bhadrapada', quality: 'Discipline, karma, service, delays, long-term achievement through effort' },
    { planet: 'Mercury (Budha)', years: 17, nakshatra: 'Ashlesha, Jyeshtha, Revati', quality: 'Intellect, communication, trade, skill, analysis and adaptability' },
    { planet: 'Ketu', years: 7, nakshatra: 'Ashwini, Magha, Mula', quality: 'Detachment, spirituality, past-life patterns, sudden separations, moksha' },
    { planet: 'Venus (Shukra)', years: 20, nakshatra: 'Bharani, Purva Phalguni, Purva Ashadha', quality: 'Love, beauty, luxury, marriage, creative arts and sensory experience' },
  ],
}

export const DASHA_LEVELS = {
  eyebrow: 'Three Levels of Time',
  title: 'Mahadasha, Antardasha, Pratyantardasha',
  description: 'The Dasha system operates at three nested levels, each providing greater timing resolution than the one above it.',
  levels: [
    {
      name: 'Mahadasha',
      duration: '6–20 years',
      description: 'The major period — the broad backdrop of a phase of life. The Mahadasha planet\'s themes dominate this entire span, though they are most strongly felt when an Antardasha of the same planet or a friendly planet runs within it.',
    },
    {
      name: 'Antardasha (Bhukti)',
      duration: 'Months to a few years',
      description: 'The sub-period within each Mahadasha. Nine planets take turns running as sub-lords within each major period. When the Antardasha lord and Mahadasha lord are in harmony (friendly, or with good mutual placement in the chart), the period tends to be productive. When they conflict, friction and mixed results are more common.',
    },
    {
      name: 'Pratyantardasha',
      duration: 'Days to months',
      description: 'The sub-sub-period. Astrologers use Pratyantardasha primarily for timing specific events — a wedding, a relocation, a health episode — when the broader Mahadasha and Antardasha already indicate that the relevant life area is active.',
    },
  ],
}

export const FAMOUS_DASHA_EXAMPLES = {
  eyebrow: 'Dashas in Practice',
  title: 'How Dashas manifest in life',
  paragraphs: [
    'Saturn Mahadasha (19 years) is often the most significant restructuring period in a life. For charts where Saturn is strong and well-placed, it can be a period of extraordinary achievement through disciplined effort — many people reach the peak of their careers during Saturn periods. For charts where Saturn is afflicted or placed in difficult houses, it can bring enforced simplification, loss, or the slow dissolution of structures that were no longer serving.',
    'Rahu Mahadasha (18 years) tends toward rapid change, worldly ambition, and the encounter with unfamiliar territory — foreign places, new technologies, uncharted professional paths. People frequently report that their Rahu period felt less like themselves and more like a compelling character they inhabited for 18 years. Ketu Mahadasha, which follows Venus and precedes Sun, often brings spiritual deepening, detachment from what was previously important, and a quality of quiet clarity.',
    'The key insight for working with Dashas is that the planet\'s condition in the natal chart shapes how its period unfolds. A well-placed Jupiter in Dasha produces very different results than a debilitated or afflicted Jupiter in the same period. The Dasha is the when; the natal chart is the what.',
  ],
}

export const SADE_SATI = {
  eyebrow: 'Saturn\'s Special Transit',
  title: 'Sade Sati — the 7.5-year Saturn transit',
  paragraphs: [
    'Sade Sati is not a Dasha period but a transit phenomenon closely related to Dasha understanding: it occurs when Saturn transits through the sign before your Moon sign, through your Moon sign itself, and through the sign after your Moon sign — a journey that takes approximately 7.5 years (2.5 years per sign × 3 signs).',
    'Sade Sati is often described with excessive fear in popular astrology. Classical texts recognize it as a period of significant pressure — particularly in the 12th and 1st transit phases relative to the Moon — but also as a period that often produces the most meaningful work and most substantial life restructuring. Many people look back on their Sade Sati as the period that, though difficult, was also the most formative.',
    'The effects of Sade Sati are strongly modified by Saturn\'s natal strength in your chart and by the concurrent Dasha period. A Sade Sati coinciding with a Saturn Mahadasha in a chart where Saturn is strong can produce remarkable achievement. The same transit in a chart with a severely afflicted Saturn during a challenging Rahu or Ketu period can bring genuine hardship. Context, as always, is everything.',
  ],
}

export const DASHAS_MYTHS = [
  {
    myth: 'The Mahadasha of a malefic planet is always a bad period.',
    reality: 'Whether a Dasha period is beneficial or challenging depends on the planet\'s condition in your natal chart: its sign, house, aspects, and functional role for your Ascendant. Saturn Mahadasha in a chart where Saturn rules the 9th and 10th (as it does for Taurus Ascendant) can be among the most rewarding periods of a life. Planet quality in a period is always chart-specific.',
  },
  {
    myth: 'Events can only happen during the Dasha of the relevant planet.',
    reality: 'Dashas are one of several timing tools. Events can also be triggered by transits (Gochara), especially of slow-moving planets like Saturn and Jupiter. Marriage might happen during Venus Antardasha, or during a transit of Jupiter over the 7th house lord, or both simultaneously. The most significant events often coincide with multiple timing indicators pointing the same direction.',
  },
  {
    myth: 'If my current Dasha is difficult, nothing good can happen.',
    reality: 'Within a challenging Mahadasha, there are typically two or three Antardasha sub-periods that provide relief, clarity, or genuine opportunity. Vedic astrologers look for these windows — particularly when the sub-lord is a natural benefic or a functional benefic for the chart — to identify the periods of greatest positive potential within an overall difficult phase.',
  },
]

export const DASHAS_FAQ = [
  {
    question: 'How do I calculate my current Dasha?',
    answer: 'Your Dasha sequence begins at your birth Nakshatra — the Moon\'s position at birth. The remaining years of the birth Nakshatra\'s ruling planet\'s period are calculated from how far the Moon has travelled through that Nakshatra. From there, the sequence proceeds in the fixed Vimshottari order. Generate your Kundli to see your complete Dasha sequence with all sub-periods.',
  },
  {
    question: 'Why is Rahu Mahadasha 18 years and Ketu only 7?',
    answer: 'The Vimshottari Dasha durations are fixed by tradition and tied to specific astronomical relationships. Rahu and Ketu are given 18 and 7 years respectively — different from their physical counterpart periods. The 7-year periods (Mars and Ketu) are typically experienced as more intense and compressed, while longer periods like Venus (20 years) and Saturn (19 years) allow themes to unfold more gradually.',
  },
  {
    question: 'Can two people with the same birth Nakshatra have the same Dasha timing?',
    answer: 'They would start in the same Dasha but at different points within it — calculated from the Moon\'s exact degree within the Nakshatra at birth. The closer two people are in birth time and birth Nakshatra degree, the more similar their Dasha timing. But the effects of the same Dasha will still differ based on how the ruling planet is placed in each person\'s unique natal chart.',
  },
  {
    question: 'Are there other Dasha systems besides Vimshottari?',
    answer: 'Yes — Vedic astrology includes over a dozen Dasha systems: Yogini Dasha (36 years), Ashtottari (108 years, used when Rahu is angular), Kalachakra Dasha, Chara Dasha (Jaimini system), and several more. Each has specific conditions under which it is considered most reliable. Vimshottari is by far the most widely used and is the default for most practitioners.',
  },
]

export const DASHAS_CTA = {
  eyebrow: 'Star Jyotish',
  title: 'See Your Complete Dasha Timeline',
  description: 'Your Dasha sequence is calculated from your birth Nakshatra. Generate your free Kundli to see your Mahadasha, Antardasha, and Pratyantardasha periods — and understand which planetary chapter you\'re currently in.',
  buttonLabel: 'Generate My Free Kundli',
}
