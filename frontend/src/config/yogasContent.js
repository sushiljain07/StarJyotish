// frontend/src/config/yogasContent.js
//
// All copy for /learn/yogas — hub page for Vedic planetary combinations.

export const YOGAS_HERO = {
  title: 'Yogas — Planetary Combinations',
  subtitle:
    'A Yoga is not a pose — in Vedic astrology, it is a specific combination of planets, houses, or both that produces a result beyond what each element would produce on its own. Understanding Yogas transforms chart reading from isolated placements to interconnected patterns.',
}

export const WHAT_ARE_YOGAS = {
  eyebrow: 'The Foundation',
  title: 'What a Yoga actually is',
  paragraphs: [
    'The Sanskrit word Yoga means "union" — the joining of two or more factors to produce a combined result. In Vedic astrology, a Yoga forms when specific planets, houses, or lords meet certain positional conditions. Classical texts catalogue hundreds of Yogas; some are rare, requiring multiple simultaneous conditions, while others form in the charts of a significant portion of the population.',
    'Not all Yogas are beneficial. There are Arishta Yogas (affliction combinations), which describe specific challenges, and Shubha Yogas (auspicious combinations), which indicate areas of strength, fortune, or achievement. A chart might contain several of each — which is why the net reading of a chart is always a synthesis, not just a count of good and bad Yogas.',
    'The most important thing to understand about Yogas is that they are potential — the Yoga describes what is available in the chart, not what automatically happens. A Raj Yoga (power combination) in a chart becomes active primarily during the Dasha of one of the Yoga-forming planets. Without the right timing, even a powerful Yoga may remain latent.',
  ],
  didYouKnow: {
    title: 'Did you know?',
    body: 'Classical texts like Brihat Parashara Hora Shastra describe over 300 named Yogas. But most experienced astrologers prioritize a handful of the most powerful and clearly defined ones — because a chart where you\'re chasing 40 Yogas simultaneously tends to produce confusion rather than clarity.',
  },
}

export const MAJOR_YOGAS = [
  {
    name: 'Raj Yoga',
    type: 'Auspicious',
    formation: 'A planet ruling a Kendra house (1, 4, 7, 10) and a Trikona house (1, 5, 9) simultaneously, or two such planets conjoining or aspecting each other',
    effect: 'Leadership, authority, recognition, and achievement — typically in career, public life, or social standing',
    example: 'For a Leo Ascendant, Mars rules the 4th house (Kendra) and the 9th (Trikona) — making Mars a natural Raj Yoga karaka. A strong Mars placement can indicate significant authority and good fortune.',
    notes: 'Raj Yogas are particularly powerful when the forming planets are in mutual Kendra or Trikona positions, are strong by sign, and are not afflicted by malefics through conjunction or close aspect.',
  },
  {
    name: 'Gaja Kesari Yoga',
    type: 'Auspicious',
    formation: 'Jupiter placed in a Kendra house (1, 4, 7, 10) from the Moon',
    effect: 'Intelligence, wisdom, respect in society, good reputation, and a capacity to influence and inspire others',
    example: 'If your Moon is in Cancer and Jupiter is in Libra (the 4th from Cancer), Gaja Kesari Yoga forms. The name means "elephant-lion" — both symbols of strength and dignity.',
    notes: 'This is one of the most commonly occurring Yogas and one of the most widely discussed. Its strength depends on Jupiter\'s sign strength and the Moon\'s condition. A strong Gaja Kesari in a prominent chart position can produce remarkable public influence.',
  },
  {
    name: 'Dhana Yoga',
    type: 'Auspicious',
    formation: 'The lords of the 2nd and 11th houses (both wealth houses) conjoin, exchange signs, or mutually aspect each other; or a benefic occupies the 2nd or 11th with their lords strongly placed',
    effect: 'Material prosperity, wealth accumulation, and financial success',
    example: 'For a Virgo Ascendant, Venus rules the 2nd house (Libra) and Mercury rules the 1st and 10th. Venus and Mercury in a close relationship in the chart can create Dhana Yoga.',
    notes: 'Dhana Yogas are assessed alongside the chart\'s overall material indicators (2nd house, 11th house, Venus, Jupiter) rather than in isolation. Multiple simultaneous Dhana Yogas generally indicate stronger material prosperity.',
  },
  {
    name: 'Viparita Raj Yoga',
    type: 'Auspicious (from difficult houses)',
    formation: 'Lords of the 6th, 8th, or 12th houses placed in each other\'s houses or conjoined in one of those houses — the difficult lords "cancel" each other\'s difficulty',
    effect: 'Unexpected rise after fall, success through adversity, gaining from others\' difficulty, transformation leading to success',
    example: 'If the 6th lord is placed in the 8th house, Harsha Yoga (a type of Viparita Raj Yoga) forms. The person may face significant challenges but emerges from them with unexpected strength or opportunity.',
    notes: 'Viparita Raj Yogas are fascinating because they describe rise specifically through adversity — they don\'t prevent difficulty, but they indicate that the difficulty itself becomes the vehicle for achievement.',
  },
  {
    name: 'Budha-Aditya Yoga',
    type: 'Auspicious',
    formation: 'Mercury and Sun conjunct in the same sign',
    effect: 'Intelligence, confidence, good communication, recognition for one\'s knowledge and skills',
    example: 'This Yoga forms frequently, since Mercury is always within 28 degrees of the Sun and therefore conjuncts it regularly. Its strength depends on the sign and house involved, and whether Mercury is combust (too close to the Sun, within about 3 degrees).',
    notes: 'Mercury within approximately 3 degrees of the Sun is considered combust — meaning it is overwhelmed by the Sun\'s heat. Combust Mercury within a Budha-Aditya Yoga weakens the Yoga significantly. The sweet spot is Mercury close to but not overwhelmed by the Sun.',
  },
  {
    name: 'Chandra-Mangal Yoga',
    type: 'Mixed',
    formation: 'Moon and Mars conjunct in the same house',
    effect: 'Courage, emotional intensity, financial drive, entrepreneurial instinct — but also potential for emotional reactivity and conflict',
    example: 'This combination creates intense emotional energy that can produce both remarkable drive and sharp volatility, depending on sign placement and other chart factors.',
    notes: 'Often associated with commercial success and business acumen when positively placed, but can also indicate a quick temper and challenging mother relationship when afflicted. The sign and house are crucial for interpretation.',
  },
  {
    name: 'Kemadruma Yoga',
    type: 'Challenging',
    formation: 'The Moon has no planet in the 2nd or 12th house from it, and no planet is conjunct it — the Moon is effectively isolated in the chart',
    effect: 'Difficulty in maintaining stability, tendency toward emotional isolation, challenges in material security and relationships',
    example: 'A Moon in Taurus with no planets in Gemini or Aries, and no planet in Taurus with the Moon, would form Kemadruma Yoga.',
    notes: 'Kemadruma is one of the most discussed "inauspicious" Yogas, but its effects are significantly mitigated by the Moon being in a Kendra from the Ascendant, or by Jupiter aspecting the Moon. Very few charts with Kemadruma on paper actually express the full challenging pattern.',
  },
  {
    name: 'Neecha Bhanga Raj Yoga',
    type: 'Auspicious (cancellation)',
    formation: 'A debilitated planet\'s debilitation is cancelled by specific conditions: the planet that would exalt the debilitated planet or rule its debilitation sign is in a Kendra from Lagna or Moon; or the debilitated planet exchanges signs with the planet ruling the sign where it\'s debilitated',
    effect: 'Transformation of a debilitated planet\'s weakness into a specific form of strength — often producing results in the very area of life the planet struggled with',
    example: 'Saturn debilitated in Aries: if Mars (ruler of Aries) is in a Kendra, or if Mars is in Libra (where Saturn is exalted) while Saturn is in Aries — debilitation can be cancelled. The person may have early career struggles followed by significant achievement.',
    notes: 'Neecha Bhanga is not about the planet becoming exalted — it is about the challenge being transformed into fuel. These charts often describe people who achieve precisely in the area that was most difficult early in life.',
  },
]

export const HOW_TO_SPOT_YOGAS = {
  eyebrow: 'Reading Your Chart',
  title: 'How to look for Yogas in your own chart',
  paragraphs: [
    'Start with the basics before chasing named Yogas. The strength of your Ascendant lord, the condition of your Moon, and the overall disposition of planets in your chart tell you more about someone\'s life than any single named Yoga. Yogas add precision to a reading already grounded in fundamentals.',
    'For Raj Yogas specifically, identify which planets in your chart rule both a Kendra (1, 4, 7, 10) and a Trikona (1, 5, 9) house simultaneously. For a Cancer Ascendant, Mars rules the 5th (Trikona) and 10th (Kendra) — making Mars the natural Raj Yoga karaka for that Ascendant. Look at where Mars is placed and aspected.',
    'Check whether Yoga-forming planets are strong: in their own signs, in friendly signs, exalted, or in Kendra or Trikona houses. A Yoga formed between two weak, debilitated planets in dusthana houses is far less potent than the same Yoga formed between two exalted planets in angular houses. The Yoga is only as strong as its constituents.',
    'Finally, check the relevant Dashas. Even a powerful Yoga that should produce recognition and success will do so most visibly during the Mahadasha or Antardasha of one of the Yoga-forming planets. The natal Yoga is the what; the Dasha is the when.',
  ],
}

export const YOGAS_MYTHS = [
  {
    myth: 'If I have a Raj Yoga, I\'m guaranteed success.',
    reality: 'A Raj Yoga indicates potential for achievement in specific areas of life — but the planet\'s strength, house placement, aspects, and the concurrent Dasha period all determine whether and how that potential manifests. A Raj Yoga involving a severely afflicted planet may produce recognition only after significant struggle, or only during a narrow window of the right Dasha timing.',
  },
  {
    myth: 'More Yogas = better chart.',
    reality: 'A chart with many Yogas is not necessarily more fortunate than one with fewer. Multiple conflicting Yogas can produce a complex, contradictory life rather than a blessed one. And some of the most influential charts in history are built on a small number of extremely powerful, well-supported Yogas rather than a large collection of moderate ones.',
  },
  {
    myth: 'Yogas from classical texts work exactly the same today as they did historically.',
    reality: 'Classical texts were written in specific cultural and historical contexts, and many Yogas are described in terms of social roles (kings, ministers, warriors) that require reinterpretation for modern life. The principle behind a Raj Yoga — the combination of angular and trine house lords — remains valid. But a contemporary astrologer translates "kingdom" as the relevant sphere of leadership or authority in a modern context.',
  },
]

export const YOGAS_FAQ = [
  {
    question: 'How many Yogas will my chart contain?',
    answer: 'Almost every chart contains at least a few minor Yogas and one or two significant ones. Highly complex charts with many planetary connections can contain dozens of named Yogas. The art of reading Yogas is learning which ones are prominent enough to actually shape life outcomes — a skill that comes from reading many charts rather than from memorizing the largest possible list.',
  },
  {
    question: 'Does a Yoga in my chart activate automatically?',
    answer: 'Yogas represent natal potential, not automatic outcomes. A Yoga typically manifests most visibly during the Dasha (major or sub-period) of one of the planets forming the Yoga. Supportive transits — particularly of Jupiter or Saturn over the relevant house or planet — can also trigger or amplify a Yoga\'s expression.',
  },
  {
    question: 'What is the difference between a Yoga and a simple planetary aspect?',
    answer: 'A Yoga is a specific named combination with defined conditions and a predictable category of effects — it is a recognized pattern in classical literature. A planetary aspect (graha drishti) is a geometric relationship between two planets that modifies how they interact. All Yogas involve some form of planetary relationship (conjunction, aspect, or exchange), but not all planetary relationships constitute named Yogas.',
  },
  {
    question: 'Can a Yoga be cancelled or weakened?',
    answer: 'Yes. Yogas can be cancelled or significantly weakened by: combustion (a planet overwhelmed by the Sun), debilitation without Neecha Bhanga cancellation, placement in the 6th/8th/12th houses, close malefic conjunction or aspect, or retrograde motion in some schools\' reckoning. This is why astrologers assess a Yoga\'s strength carefully rather than simply noting its presence.',
  },
]

export const YOGAS_CTA = {
  eyebrow: 'Star Jyotish',
  title: 'Discover the Yogas in Your Chart',
  description: 'Yogas are only meaningful in the context of your complete birth chart. Generate your free Kundli to see which planetary combinations you carry — and what they suggest for your life direction.',
  buttonLabel: 'Generate My Free Kundli',
}
