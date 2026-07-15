// frontend/src/config/lagnaContent.js
//
// All copy for /learn/basics/lagna-guide.

export const LAGNA_HERO = {
  title: 'Reading Your Ascendant (Lagna)',
  subtitle:
    'Your Lagna sets the frame for your entire chart. Here is what it represents, why it matters more than your Sun sign, and why two people with the same Sun sign can feel completely different.',
}

export const LAGNA_QUICK_FACTS = [
  { label: 'Sanskrit name',    value: 'Lagna (also Udaya Lagna)' },
  { label: 'Also called',      value: 'Ascendant, Rising Sign' },
  { label: 'How it is set',    value: 'The sign rising on the eastern horizon at birth' },
  { label: 'Changes how often', value: 'Roughly every 2 hours (varies by latitude)' },
  { label: 'Its ruling planet', value: 'The lord of the Lagna sign (Lagna Lord)' },
  { label: 'Why it matters',   value: 'Sets the house structure for the entire chart' },
]

export const LAGNA_SPINE = {
  eyebrow: 'The foundation',
  title: 'The Lagna is your chart\'s spine',
  paragraphs: [
    'At the moment you were born, one of the twelve zodiac signs was rising above the eastern horizon. That sign is your Lagna — your Ascendant. In Vedic astrology, it is the single most important point in your chart. Every house, every planetary interpretation, every timing system flows from it.',
    'Think of the Lagna as the lens through which you experience the world — and, equally, the lens through which the world first experiences you. Your Sun sign describes your core self-expression. Your Moon sign describes your emotional interior. But your Lagna describes your interface: how you arrive in a room, how you process new situations, what kind of energy you put out before you have said a single word.',
    'This is different from personality in a precise way. Your Sun is the melody you are playing. Your Moon is the key you feel it in. Your Lagna is the instrument you play it on — the immediate, physical, visible form your life takes.',
  ],
  callout: {
    variant: 'tip',
    title: 'Why it changes every ~2 hours',
    body: 'The Earth completes a full rotation in 24 hours, carrying all 12 signs past the eastern horizon. That means each sign rises for roughly 2 hours — though this varies by latitude and by the sign itself. It is why birth time is so critical: 90 minutes of difference can shift your Lagna entirely, reordering every house in your chart.',
  },
}

export const LAGNA_LORD = {
  eyebrow: 'The most important planet in your chart',
  title: 'The Lagna Lord: your chart\'s ruler',
  paragraphs: [
    'Every sign has a ruling planet — the graha that governs and shapes it. The ruling planet of your Lagna is called your Lagna Lord (or Ascendant Lord). It is, by a wide margin, the single most important planet in your entire chart.',
    'Where your Lagna Lord sits — which house, which sign, conjunct or aspected by which other planets — colours everything. A Lagna Lord placed in the 10th house naturally draws your energy toward career and public achievement. One placed in the 12th can signal a life that finds its deepest meaning in spiritual inquiry, solitude, or work that happens behind the scenes.',
    'The Lagna Lord\'s strength or weakness essentially sets the vitality of the chart as a whole. A strong Lagna Lord can compensate for difficulties elsewhere. A weak or afflicted Lagna Lord (combust, in debilitation, or hemmed between malefics) makes even strong placements elsewhere harder to access.',
  ],
}

export const TWELVE_LAGNAS = {
  eyebrow: 'The 12 Ascendants',
  title: 'The 12 Lagnas at a glance',
  intro: 'Each Lagna carries a distinct temperament, physical constitution, and default approach to life. These are tendencies — starting conditions, not fixed fates.',
  items: [
    { sign: 'Aries',       lord: 'Mars',    quality: 'Cardinal Fire',   vibe: 'Direct, energetic, acts before thinking' },
    { sign: 'Taurus',      lord: 'Venus',   quality: 'Fixed Earth',     vibe: 'Calm, measured, builds slowly and solidly' },
    { sign: 'Gemini',      lord: 'Mercury', quality: 'Mutable Air',     vibe: 'Curious, communicative, adapts constantly' },
    { sign: 'Cancer',      lord: 'Moon',    quality: 'Cardinal Water',  vibe: 'Nurturing, intuitive, absorbs others\' moods' },
    { sign: 'Leo',         lord: 'Sun',     quality: 'Fixed Fire',      vibe: 'Charismatic, warm, needs to be seen' },
    { sign: 'Virgo',       lord: 'Mercury', quality: 'Mutable Earth',   vibe: 'Precise, analytical, quietly competent' },
    { sign: 'Libra',       lord: 'Venus',   quality: 'Cardinal Air',    vibe: 'Balanced, diplomatic, partnership-oriented' },
    { sign: 'Scorpio',     lord: 'Mars',    quality: 'Fixed Water',     vibe: 'Intense, perceptive, holds things close' },
    { sign: 'Sagittarius', lord: 'Jupiter', quality: 'Mutable Fire',    vibe: 'Philosophical, optimistic, needs a horizon' },
    { sign: 'Capricorn',   lord: 'Saturn',  quality: 'Cardinal Earth',  vibe: 'Disciplined, ambitious, earns everything slowly' },
    { sign: 'Aquarius',    lord: 'Saturn',  quality: 'Fixed Air',       vibe: 'Original, principled, detached but visionary' },
    { sign: 'Pisces',      lord: 'Jupiter', quality: 'Mutable Water',   vibe: 'Empathic, porous, moves between inner worlds' },
  ],
}

export const WHY_DIFFERENT = {
  eyebrow: 'The most common confusion',
  title: 'Why two Libra Sun signs can be completely different people',
  paragraphs: [
    'Two people born in October might both have the Sun in Libra — a gentle, justice-seeking, socially skilled energy. But if one is born at 4 AM with Virgo rising and the other at 2 PM with Capricorn rising, their charts are structured entirely differently.',
    'The Virgo Lagna person leads with precision and discernment. They show up as careful and analytical even if their Sun is quietly idealistic. The Capricorn Lagna person leads with ambition and self-sufficiency. They may come across as serious and reserved even when their Libran core values harmony above everything else.',
    'The Sun sign is the melody. The Lagna is the key it is played in. Both matter. But the Lagna is the first thing anyone else experiences — including the person themselves, in terms of how they naturally react to the world.',
  ],
  callout: {
    variant: 'insight',
    title: 'Sun, Moon, and Lagna — a three-part identity',
    body: 'Most Vedic astrologers ask for all three before beginning any reading. Sun sign = your solar identity, the story you are living. Moon sign (Rashi) = your emotional default, how you feel from the inside. Lagna = your physical and social interface, how the world meets you first.',
  },
}

export const LAGNA_IN_PRACTICE = {
  eyebrow: 'Practical application',
  title: 'Using your Lagna in daily life',
  paragraphs: [
    'Your Lagna is not a constraint. It is a starting condition — the natural frequency you operate on most easily. When you understand yours, you can work with it instead of against it.',
    'A Scorpio Lagna person tends to feel most alive when engaged in something that requires depth, investigation, or transformation. Shallow small talk drains them. Deep one-on-one conversation energises them. Structuring work and relationships around that reality is not self-indulgence — it is efficiency.',
    'A Sagittarius Lagna person needs expansiveness. Confine them to repetitive routine without a horizon to aim at, and their natural optimism curdles into restlessness. Give them a philosophy to build toward, and the same person becomes relentless. The chart does not tell them what to do. It tells them what conditions bring out their best.',
  ],
  reflection: 'If your Lagna describes how you naturally meet the world, what would it mean to deliberately design your environment to match that energy rather than fight it?',
}

export const LAGNA_FAQ = [
  {
    q: 'What if I don\'t know my exact birth time — can I still know my Lagna?',
    a: 'Not reliably, no. The Lagna changes roughly every 2 hours, so without a birth time within at least 30 minutes of accuracy, the Lagna cannot be confirmed. Astrologers use a technique called birth-time rectification to narrow it down using significant life events, but this is advanced work. The best step is to check your birth certificate or ask a family member.',
  },
  {
    q: 'My Western astrology "rising sign" is different from my Vedic Lagna — which is correct?',
    a: 'Both are internally consistent within their own systems. Western astrology uses the Tropical zodiac (fixed to seasons), while Vedic astrology uses the Sidereal zodiac (fixed to actual star positions). The roughly 23° difference between the two means your Tropical Ascendant and your Vedic Lagna are usually different signs. This guide is about the Vedic Lagna.',
  },
  {
    q: 'Can the Lagna change if I travel to a different country?',
    a: 'No. Your Lagna is set at birth and does not change based on where you move later. However, a technique called Astrocartography (not a classical Vedic tool, but used by some astrologers) maps which planets are emphasised in different geographic locations — separate from the Lagna itself.',
  },
  {
    q: 'Is the Lagna more important than the Moon sign in Vedic astrology?',
    a: 'Both are foundational, and traditional Vedic practice reads charts from all three reference points: Lagna, Moon, and Sun. The Lagna governs physical constitution, personality, and the house structure. The Moon sign governs the mind and emotions, and anchors the Vimshottari Dasha timing system. Different astrologers weight them differently depending on the question being answered.',
  },
]
