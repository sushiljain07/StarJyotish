// frontend/src/config/learnContent.js
//
// Single source of truth for the Learn landing page's content. Kept
// separate from pages/Learn.jsx for the same reason config/topics.js is
// separate from Landing.jsx: the page component should only own layout,
// not copy — makes it possible to update category descriptions or add a
// featured guide without touching JSX.
//
// None of the individual guide/category pages exist yet apart from
// /learn/zodiac, so every other entry below is marked `comingSoon: true`
// and left without an `href` — see ArticleCard.jsx for how that renders.
// The two exceptions are Zodiac Signs, which now links to the real
// /learn/zodiac guide, and Beginner Guides, which links to the real
// on-page #beginner-guides section.

export const LEARNING_PATHS = [
  {
    title: 'New to Vedic Astrology',
    description: 'Start from zero: what a Kundli actually is, how to read your Ascendant, and why the Moon sign matters more than most people realize.',
    meta: '5-part path',
    href: '/learn/paths/new-to-vedic',
    comingSoon: false,
  },
  {
    title: 'Understand Your Career Direction',
    description: 'Work through the D10 chart step by step — the 10th house, its lord, and the planetary periods that tend to open doors.',
    meta: '6-part path',
    href: '/learn/paths/career-direction',
    comingSoon: false,
  },
  {
    title: 'Marriage & Compatibility',
    description: 'From Guna Milan basics to Mangal Dosha and the 7th house — a grounded path through what Vedic astrology actually says about compatibility.',
    meta: '7-part path',
    href: '/learn/paths/marriage-compatibility',
    comingSoon: false,
  },
]

export const BEGINNER_GUIDES = [
  {
    title: 'What Is a Kundli, Really?',
    description: 'A birth chart is a snapshot of the sky at the moment you were born — here is what that snapshot actually encodes, and how to start reading it.',
    meta: '6 min read',
    badge: 'Basics',
    href: '/learn/basics/what-is-kundli',
    comingSoon: false,
  },
  {
    title: 'Reading Your Ascendant (Lagna)',
    description: 'Your Lagna sets the frame for your entire chart. Learn what it represents and why two people with the same Sun sign can feel completely different.',
    meta: '7 min read',
    badge: 'Basics',
    href: '/learn/basics/lagna-guide',
    comingSoon: false,
  },
  {
    title: 'The 9 Planets, Simply Explained',
    description: 'Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu — what each one governs, without the jargon.',
    meta: '9 min read',
    badge: 'Basics',
    href: '/learn/basics/planets-guide',
    comingSoon: false,
  },
  {
    title: 'Why Your Moon Sign Matters More Than You Think',
    description: 'Western astrology leans on the Sun sign. Vedic astrology leans on the Moon. Here is the difference, and why it changes how you should read your own chart.',
    meta: '6 min read',
    badge: 'Basics',
    href: '/learn/basics/moon-sign-guide',
    comingSoon: false,
  },
]

export const CATEGORIES = [
  {
    id: 'zodiac',
    title: 'Zodiac Signs',
    description: 'All 12 Rāshis — traits, ruling planets, and how each one shapes personality and life direction.',
    meta: '12 signs',
    href: '/learn/zodiac',
    comingSoon: false,
  },
  {
    id: 'nakshatra',
    title: 'Nakshatras',
    description: 'The 27 lunar mansions behind your Moon sign — a layer of detail most horoscopes skip entirely.',
    meta: '27 nakshatras',
    href: '/learn/nakshatras',
    comingSoon: false,
  },
  {
    id: 'planets',
    title: 'Planets',
    description: 'What each of the nine grahas represents, and how their placement in your chart plays out in real life.',
    meta: '9 planets',
    href: '/learn/planets',
    comingSoon: false,
  },
  {
    id: 'houses',
    title: 'Houses',
    description: 'The 12 houses of the birth chart — career, marriage, wealth, and everything they govern.',
    meta: '12 houses',
    href: '/learn/houses',
    comingSoon: false,
  },
  {
    id: 'dashas',
    title: 'Dashas',
    description: 'Planetary time periods — the framework Vedic astrology uses to answer "when," not just "what."',
    meta: 'Timing guides',
    href: '/learn/dashas',
    comingSoon: false,
  },
  {
    id: 'yogas',
    title: 'Yogas',
    description: 'Auspicious planetary combinations, from Raj Yoga to Gaja Kesari — what they are and how to spot one in your own chart.',
    meta: 'Combinations',
    href: '/learn/yogas',
    comingSoon: false,
  },
  {
    id: 'doshas',
    title: 'Doshas',
    description: 'Mangal Dosha, Kaal Sarp Dosha, and other chart afflictions — what they mean, and what they do not.',
    meta: 'Chart afflictions',
    href: '/learn/doshas',
    comingSoon: false,
  },
  {
    id: 'beginner',
    title: 'Beginner Guides',
    description: 'Never read a birth chart before? Start here — the foundational concepts everything else builds on.',
    meta: '4 guides',
    href: '/learn#beginner-guides',
    comingSoon: false,
  },
]

export const FEATURED_GUIDES = [
  {
    title: 'Saturn\'s Sade Sati: What It Is and Isn\'t',
    description: 'The most misunderstood 7.5-year period in Vedic astrology, explained without the fear-based framing it usually gets.',
    meta: '10 min read',
    badge: 'Dashas',
    comingSoon: true,
  },
  {
    title: 'Raj Yoga: How to Spot One in Your Chart',
    description: 'Not every powerful combination needs a rare alignment. Here is what actually qualifies, and how to check your own chart.',
    meta: '8 min read',
    badge: 'Yogas',
    comingSoon: true,
  },
  {
    title: 'The 7th House: Marriage, Partnership, and What It Really Shows',
    description: 'Marriage astrology starts here — but the 7th house governs more than weddings. A grounded walkthrough of what it actually means.',
    meta: '9 min read',
    badge: 'Houses',
    comingSoon: true,
  },
]

export const WHY_LEARN_POINTS = [
  {
    title: 'Read your own chart, not someone else\'s summary',
    description: 'Every prediction you get from Star Jyotish is built on principles you can also learn to apply yourself — no black box.',
  },
  {
    title: 'Grounded in classical texts, explained plainly',
    description: 'Sourced from established Vedic astrology teaching, not repackaged Western sun-sign content with Sanskrit words swapped in.',
  },
  {
    title: 'Built for how you actually browse',
    description: 'Short, focused guides you can read in one sitting on your phone — not 3,000-word blog posts padded for search engines.',
  },
  {
    title: 'Free to explore, no account required',
    description: 'The entire Knowledge Center is open. Generate your Kundli when you are ready to see these ideas applied to your own chart.',
  },
]
