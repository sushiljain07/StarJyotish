// frontend/src/config/moonSignContent.js
//
// All copy for /learn/basics/moon-sign-guide.

export const MOON_HERO = {
  title: 'Why Your Moon Sign Matters More Than You Think',
  subtitle:
    'Western astrology leans on the Sun sign. Vedic astrology leans on the Moon. Here is the difference — and why it changes how you should read your own chart.',
}

export const MOON_QUICK_FACTS = [
  { label: 'Sanskrit name',   value: 'Chandra (Moon), Rashi (Moon sign)' },
  { label: 'Speed',           value: 'Changes sign every ~2.25 days' },
  { label: 'Governs',         value: 'Mind (manas), emotions, mother, memory' },
  { label: 'Exalted in',      value: 'Taurus (strongest at 3°)' },
  { label: 'Debilitated in',  value: 'Scorpio (weakest at 3°)' },
  { label: 'Key timing use',  value: 'Anchors Vimshottari Dasha calculation' },
]

export const EAST_WEST_SPLIT = {
  eyebrow: 'Why Vedic astrology is different',
  title: 'The fundamental split between East and West',
  paragraphs: [
    'Western horoscope columns organise everything around the Sun sign. Open any newspaper astrology page and you will find twelve categories based purely on which 30-day window you were born in. This is convenient — the Sun moves slowly enough that your sign stays fixed your entire life, regardless of birth time or location.',
    'Vedic astrology makes a different bet. It centres everything on the Moon sign (Rashi) and the Lagna (Ascendant). The Moon changes signs every 2.25 days, making it far more personally specific. Two people born a week apart can have very different Rashis. Two people born in the same city on the same day at different times will have different Lagnas and quite possibly different Moon signs.',
    'The deeper reasoning is philosophical. Vedic cosmology holds that the Moon governs the manas — the thinking, feeling, perceiving mind. The mind is the primary instrument through which a human being experiences life. The Sun governs the atma, the soul — more fundamental, but more remote from the texture of daily experience. If you want to understand how someone actually moves through the world day by day — how they feel, what they need, how they react — the Moon is a more direct address than the Sun.',
  ],
  callout: {
    variant: 'tip',
    title: 'Why the Moon matters more in Vedic astrology',
    body: 'Your Sun sign tells you who you are at the deepest level. Your Moon sign tells you how you actually function day by day — what you feel, what you need, how you react before you have had time to think. Most people recognise their Moon sign description more than their Sun sign description, precisely because it describes emotional reality rather than aspirational identity.',
  },
}

export const RASHI_EMOTIONAL_OS = {
  eyebrow: 'Your emotional default setting',
  title: 'Rashi: your emotional operating system',
  paragraphs: [
    'Your Rashi is your emotional baseline — the automatic response that kicks in before you have had time to process. It is how you react to stress, how you receive love, what you need to feel settled, and what kind of environment allows you to function at your natural best.',
    'This is distinct from your personality in a precise way. Your Lagna is your social personality — the interface you present. Your Sun is your essential character. Your Moon is the private interior: how you are when no one is watching, how you feel at 3 AM when sleep will not come, what you actually need (versus what you say you need).',
    'Understanding your Rashi does not mean you are trapped in those patterns. It means you can see them more clearly, catch them when they are driving you automatically, and choose whether to act from them or not.',
  ],
}

export const MOON_SIGNS_TABLE = {
  eyebrow: 'The 12 Rashis',
  title: 'What each Moon sign needs to feel at ease',
  intro: 'Each Rashi has a distinct emotional vocabulary — a specific set of conditions that restore it, and specific stressors that deplete it.',
  items: [
    { sign: 'Aries',       need: 'Independence',   comfort: 'Movement, starting new things, time alone after conflict',     drains: 'Being slowed down, second-guessed, or managed by others' },
    { sign: 'Taurus',      need: 'Security',        comfort: 'Routines, good food, physical comfort, loyalty, predictability', drains: 'Sudden change, financial instability, being rushed' },
    { sign: 'Gemini',      need: 'Stimulation',     comfort: 'Conversation, variety, learning, expressing ideas',            drains: 'Repetitive environment, being emotionally drained without verbal engagement' },
    { sign: 'Cancer',      need: 'Belonging',       comfort: 'Home, family, nurturing others, emotional continuity',         drains: 'Coldness, feeling unwelcome, environments without warmth' },
    { sign: 'Leo',         need: 'Recognition',     comfort: 'Appreciation, creative expression, being seen and celebrated', drains: 'Being overlooked, dismissed, or treated as ordinary' },
    { sign: 'Virgo',       need: 'Usefulness',      comfort: 'Order, problem-solving, being of practical service',           drains: 'Chaos, purposelessness, being told they are overcomplicating things' },
    { sign: 'Libra',       need: 'Harmony',         comfort: 'Beauty, fairness, good company, balanced environments',        drains: 'Conflict, injustice, having to make decisions entirely alone' },
    { sign: 'Scorpio',     need: 'Depth',           comfort: 'Intensity, privacy, truth, transformative experiences',       drains: 'Superficiality, betrayal, being exposed or forced into vulnerability' },
    { sign: 'Sagittarius', need: 'Meaning',         comfort: 'Philosophy, freedom, learning, travel, optimism',             drains: 'Pettiness, pointless routine, being confined without purpose' },
    { sign: 'Capricorn',   need: 'Achievement',     comfort: 'Structure, goals, discipline, the feeling of earning something', drains: 'Dependency, wasted time, environments with no standards' },
    { sign: 'Aquarius',    need: 'Authenticity',    comfort: 'Individuality, community built on shared values, ideas',      drains: 'Conformity, emotional manipulation, being labelled or categorised' },
    { sign: 'Pisces',      need: 'Merging',         comfort: 'Solitude, spirituality, creativity, music, compassion',       drains: 'Harsh environments, constant demands, having to maintain hard boundaries' },
  ],
}

export const MOON_TIMING = {
  eyebrow: 'Why it anchors everything',
  title: 'The Moon and timing: Dasha, transits, and Sade Sati',
  paragraphs: [
    'Your Moon sign is not just a personality descriptor — it is the anchor for the most important timing systems in Vedic astrology. The Vimshottari Dasha system, which divides life into planetary periods totalling 120 years, is calculated from the Nakshatra (lunar mansion) occupied by the Moon at birth. Your Moon\'s Nakshatra determines which planet\'s Dasha you began life in, and the entire sequence that follows.',
    'Transit effects in Vedic astrology are also measured from your Moon sign, not your Sun sign. When an astrologer says "Jupiter transits your 7th house," they mean the 7th house counted from your Rashi — the sign your Moon occupies. When they discuss the effects of Saturn\'s current position, it is your Moon sign that determines whether you are entering a challenging transit or a supportive one.',
    'Sade Sati — the 7.5-year period when Saturn transits through the sign before, directly over, and the sign after your natal Moon — is one of the most discussed periods in Vedic astrology because Saturn\'s weight on the Moon is felt in the most interior, personal way. Sade Sati is not to be feared, but it is worth knowing. It tends to bring restructuring, a falling away of what is inauthentic, and a clarity that is sometimes uncomfortable to arrive at.',
  ],
  callout: {
    variant: 'insight',
    title: 'How to check your Sade Sati status',
    body: 'Note which sign Saturn is currently transiting. If it is in the sign immediately before your Moon sign, directly on your Moon sign, or immediately after your Moon sign — you are in Sade Sati. The middle 2.5 years, when Saturn sits directly over the natal Moon, tend to be the most intense phase. Star Jyotish shows your current transit picture automatically once you generate your Kundli.',
  },
}

export const CHANDRASHTAMA = {
  eyebrow: 'A monthly cycle',
  title: 'Chandrashtama: the Moon\'s monthly low',
  paragraphs: [
    'Every month, as the transiting Moon moves through the sky, it passes through the sign that is 8th from your natal Moon. This 2.25-day window is called Chandrashtama — literally "Moon in the eighth" — and most practicing Vedic astrologers recommend avoiding major decisions, important meetings, medical procedures, and new ventures during this window.',
    'Chandrashtama does not cause disaster. It creates a temporary dip in mental clarity, emotional resilience, and physical energy. The effects are subtle and felt mainly in the area of decision-making under uncertainty. Knowing when yours falls each month — something Star Jyotish calculates automatically — is one of the simplest, most immediately practical things Vedic astrology can offer a person who has never studied it before.',
  ],
}

export const MOON_FAQ = [
  {
    question: 'How is my Moon sign different from my Sun sign?',
    answer: 'Your Sun sign is determined by where the Sun was on your birthday — it changes sign roughly once a month and is the same for everyone born in the same ~30-day period. Your Moon sign is determined by where the Moon was at your exact time and date of birth — it changes sign every 2.25 days, making it far more personally specific. In Vedic astrology, the Moon sign is considered at least as important as the Sun sign for understanding personality, and more important for understanding emotional life and timing.',
  },
  {
    question: 'Can two people with the same Moon sign have very different emotional lives?',
    answer: 'Yes — because the Moon sign is just one factor. The sign and house placement of the Moon, whether the Moon is waxing or waning, planets aspecting or conjunct the Moon, and the overall chart context all modify how the Moon sign expresses itself. Two Scorpio Moons with very different charts can operate quite differently, even though they share the same core emotional vocabulary (depth, intensity, need for truth).',
  },
  {
    question: 'What is the Nakshatra, and how does it relate to my Moon sign?',
    answer: 'Each of the 12 zodiac signs spans 30°. Each sign contains two or three Nakshatras — the 27 lunar mansions, each spanning 13°20\'. Your Moon Nakshatra is the specific mansion within your Moon sign. It adds another layer of detail: two people with Moon in Taurus might have the Moon in Rohini (sensuous, magnetic, fertile) or Mrigashira (curious, restless, seeking). The Moon Nakshatra is also what determines which planet\'s Dasha you begin life in — the specific starting point of your timing cycle.',
  },
  {
    question: 'My Moon sign description doesn\'t resonate with me at all. What does that mean?',
    answer: 'This happens for a few reasons. First, the Moon sign is the interior emotional default — it describes how you feel privately, not how you project yourself. If you have a very strong Lagna or Sun that differs, you may identify more with those. Second, if the Moon is closely conjunct another planet, that planet modifies the Moon\'s expression significantly. Third, if you don\'t know your exact birth time, your Moon sign itself may be uncertain if you were born near a sign change. It is worth checking.',
  },
]
