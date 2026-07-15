// frontend/src/config/vedicsContent.js
//
// All copy for /learn/paths/new-to-vedic — the "New to Vedic Astrology"
// learning path hub. A path hub is different from a guide: it introduces
// the journey, lists the steps in order, and gives just enough context
// about each step that the reader knows what to expect — without
// duplicating the content of the individual guides.

export const VEDICS_HERO = {
  title: 'New to Vedic Astrology',
  subtitle:
    'A five-part path that takes you from a blank chart to a working understanding — in order, at your own pace. No prior knowledge assumed.',
}

export const VEDICS_INTRO = {
  eyebrow: 'About this path',
  title: 'What you will be able to do at the end',
  paragraphs: [
    'Vedic astrology has a reputation for being complex. That reputation is earned — but it is also misleading. The complexity is in the details. The foundation is a handful of clear ideas that, once understood, make the rest click into place.',
    'This five-part path covers exactly that foundation — in the order that makes each concept build on the last. By the end, you will be able to look at your own Kundli, identify the key placements, and understand what they mean in plain terms. You will not know everything, but you will know enough to use your chart as a real tool.',
    'Each guide is self-contained and takes 6–10 minutes to read. You can complete the path in a single afternoon, or spread it across a week.',
  ],
}

export const VEDICS_STEPS = [
  {
    num: 1,
    id: 'what-is-kundli',
    title: 'What Is a Kundli, Really?',
    href: '/learn/basics/what-is-kundli',
    readTime: 6,
    teaser: 'The chart is a snapshot of the sky at your birth — not a personality label. This guide explains what a Kundli actually encodes: the twelve houses, the three reference points (Lagna, Rashi, Sun sign), and why your birth time matters as much as your birth date.',
    outcome: 'You will understand what the chart is measuring and why it is more specific than a newspaper horoscope.',
  },
  {
    num: 2,
    id: 'lagna-guide',
    title: 'Reading Your Ascendant (Lagna)',
    href: '/learn/basics/lagna-guide',
    readTime: 7,
    teaser: 'The Ascendant is the most important single point in your chart — it sets the house structure everything else hangs from. This guide explains what it is, why it changes every two hours, and why two people born on the same day can have completely different charts.',
    outcome: 'You will be able to identify your Lagna, understand its ruling planet, and know why it matters more than your Sun sign in Vedic astrology.',
  },
  {
    num: 3,
    id: 'planets-guide',
    title: 'The 9 Planets, Simply Explained',
    href: '/learn/basics/planets-guide',
    readTime: 9,
    teaser: 'Each of the nine Navagrahas governs a specific domain of life. This guide covers all nine — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu — explaining what each one represents, where it is most powerful, and where it struggles.',
    outcome: 'You will know what each graha governs and how to read its placement as strong, comfortable, or challenged.',
  },
  {
    num: 4,
    id: 'moon-sign-guide',
    title: 'Why Your Moon Sign Matters More Than You Think',
    href: '/learn/basics/moon-sign-guide',
    readTime: 6,
    teaser: 'Vedic astrology centres on the Moon sign, not the Sun sign. This guide explains why — the Moon governs the mind, anchors the timing system (Dasha), and determines your emotional baseline. It also introduces Sade Sati and Chandrashtama, two Moon-based timing patterns worth knowing.',
    outcome: 'You will understand your Rashi as an emotional operating system, and know how the Moon anchors predictions in Vedic astrology.',
  },
  {
    num: 5,
    id: 'zodiac',
    title: 'The Twelve Zodiac Signs (Rashis)',
    href: '/learn/zodiac',
    readTime: 10,
    teaser: 'The zodiac provides the sign each planet sits in — which modifies how that planet expresses itself. This hub introduces all twelve Rashis, their qualities, ruling planets, and their relationship to the elements and modes. From here, individual sign guides go much deeper.',
    outcome: 'You will be able to read any planet\'s sign placement and understand how the sign colours the planet\'s expression.',
  },
]

export const VEDICS_AFTER = {
  eyebrow: 'After this path',
  title: 'Where to go next',
  paragraphs: [
    'Completing this path gives you the vocabulary to read any Vedic astrology text or discussion without feeling lost. The concepts introduced here — houses, Lagna, Grahas, Rashis, Moon sign — appear in every more advanced topic.',
    'From here, most readers find that going deeper into one of two directions works best: either the Nakshatra system (the 27 lunar mansions that sit inside each sign, adding a layer of precision to Moon and planet placements), or Dashas (the planetary time period system that is Vedic astrology\'s main tool for timing events in life).',
  ],
}

export const VEDICS_FAQ = [
  {
    q: 'Do I need to read these in order?',
    a: 'Yes, for this path. Each guide builds on the previous one — guide 2 assumes you understand what a house is (guide 1), guide 3 assumes you know what the Lagna is (guide 2), and so on. If you already have some background, you can start from wherever feels unfamiliar.',
  },
  {
    q: 'Do I need to generate my Kundli first?',
    a: 'Not to read the guides — they are self-contained. But having your chart open alongside makes everything more concrete. You can generate your free Kundli on Star Jyotish and refer to it as you work through each guide. Most concepts land much faster when you can see them in your own chart.',
  },
  {
    q: 'How is Vedic astrology different from Western astrology?',
    a: 'The main structural differences are: Vedic astrology uses the Sidereal zodiac (aligned to actual star positions) rather than the Tropical zodiac (aligned to seasons), which shifts most sign placements by about 23°; it centres on the Moon sign and Ascendant rather than the Sun sign; it uses a whole-sign house system; and it has a detailed timing system (Vimshottari Dasha) that Western astrology does not. Guide 4 in this path covers the Moon sign difference in detail.',
  },
  {
    q: 'How long does this path take to complete?',
    a: 'About 38 minutes if you read all five guides back to back (6 + 7 + 9 + 6 + 10 minutes). Most people find it useful to pause after each guide, look at their own chart, and sit with what they have just read before moving on.',
  },
]

export const VEDICS_CTA = {
  eyebrow: 'Star Jyotish',
  title: 'See this path applied to your own chart',
  description: 'Every concept in this path becomes personal once you generate your free Kundli. Your Lagna, your Moon sign, your planetary placements — all of it, calculated from your exact birth data.',
  buttonLabel: 'Generate My Free Kundli →',
}
