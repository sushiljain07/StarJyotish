// frontend/src/config/knowledgeGraph.js
//
// A lightweight knowledge graph for the Knowledge Center — not a search
// index, just a declarative map of how guides relate to each other
// (prerequisites, what to read next, which concepts they touch, how
// long/hard they are). This is the single source both LearningPath and
// RelatedArticles' "next" variant read from, and it's deliberately shaped
// so a future search or recommendation feature has real structured data
// to build on instead of needing an entirely new content model.
//
// Every guide's `status` is either 'available' (a real page exists at
// `href`) or 'comingSoon' (`href: null` — no page yet). Nothing outside
// this file should ever hardcode a guide's title, href, or metadata;
// pages read it via getGuide()/getLearningPathSteps() below.
import { DIFFICULTY } from './learningTaxonomy'

export const GUIDES = {
  'what-is-kundli': {
    id: 'what-is-kundli',
    title: 'What Is a Kundli, Really?',
    href: '/learn/basics/what-is-kundli',
    category: 'beginner',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 6,
    lastUpdated: '2026-07-15',
    prerequisites: [],
    relatedTopics: ['ascendant', 'moon-sign', 'houses'],
    nextGuides: ['lagna-guide'],
    status: 'available',
    teaser: 'What a birth chart actually encodes — and how to start reading it.',
  },
  'lagna-guide': {
    id: 'lagna-guide',
    title: 'Reading Your Ascendant (Lagna)',
    href: '/learn/basics/lagna-guide',
    category: 'beginner',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 7,
    lastUpdated: '2026-07-15',
    prerequisites: ['what-is-kundli'],
    relatedTopics: ['ascendant', 'moon-sign', 'zodiac'],
    nextGuides: ['planets-guide'],
    prevGuides: ['what-is-kundli'],
    status: 'available',
    teaser: 'Why the Ascendant matters more than your Sun sign — and how it shapes your entire chart.',
  },
  'planets-guide': {
    id: 'planets-guide',
    title: 'The 9 Planets, Simply Explained',
    href: '/learn/basics/planets-guide',
    category: 'beginner',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 9,
    lastUpdated: '2026-07-15',
    prerequisites: ['lagna-guide'],
    relatedTopics: ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'],
    nextGuides: ['moon-sign-guide'],
    prevGuides: ['lagna-guide'],
    status: 'available',
    teaser: 'What each of the nine grahas governs — without the jargon.',
  },
  'moon-sign-guide': {
    id: 'moon-sign-guide',
    title: 'Why Your Moon Sign Matters More Than You Think',
    href: '/learn/basics/moon-sign-guide',
    category: 'beginner',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 6,
    lastUpdated: '2026-07-15',
    prerequisites: ['planets-guide'],
    relatedTopics: ['moon-sign', 'dasha', 'sade-sati'],
    nextGuides: ['zodiac'],
    prevGuides: ['planets-guide'],
    status: 'available',
    teaser: 'Why Vedic astrology centres on the Moon sign — and what that means for reading your chart.',
  },
  'birth-chart-basics': {
    id: 'birth-chart-basics',
    title: 'Birth Chart Basics',
    href: '/learn/basics/what-is-kundli',
    category: 'beginner',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 6,
    lastUpdated: '2026-07-15',
    prerequisites: [],
    relatedTopics: ['ascendant', 'moon-sign'],
    nextGuides: ['zodiac'],
    status: 'available',
  },
  zodiac: {
    id: 'zodiac',
    title: 'Zodiac Signs',
    href: '/learn/zodiac',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 10,
    lastUpdated: '2026-07-03',
    prerequisites: ['birth-chart-basics'],
    relatedTopics: ['moon-sign', 'ascendant', 'nakshatra'],
    nextGuides: ['nakshatra'],
    status: 'available',
    teaser: 'Understand what a Rashi is and how the zodiac fits into a complete chart.',
  },
  // Individual zodiac sign guides live here; MAIN_LEARNING_PATH does NOT
  // include them — sign-to-sign navigation uses SIGN_LEARNING_PATH below
  // instead of growing the main curriculum stepper to 18 steps.
  'zodiac-aries': {
    id: 'zodiac-aries',
    title: 'Mesha (Aries)',
    href: '/learn/zodiac/aries',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 12,
    lastUpdated: '2026-07-03',
    prerequisites: ['zodiac'],
    relatedTopics: ['ascendant', 'moon-sign', 'nakshatra', 'mars'],
    // within the sign sequence, Aries → Taurus; in the main curriculum,
    // Aries recommends the reader go back to the Zodiac hub before moving
    // on to Nakshatras
    nextGuides: ['zodiac-taurus'],
    prevGuides: [],
    status: 'available',
    teaser: 'The first sign: initiative, courage and the willingness to begin.',
  },
  'zodiac-taurus': {
    id: 'zodiac-taurus',
    title: 'Vrishabha (Taurus)',
    href: '/learn/zodiac/taurus',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 13,
    lastUpdated: '2026-07-06',
    prerequisites: ['zodiac'],
    relatedTopics: ['moon-sign', 'venus'],
    nextGuides: ['zodiac-gemini'],
    prevGuides: ['zodiac-aries'],
    status: 'available',
    teaser: 'The builder: steadiness, beauty and the art of endurance.',
  },
  'zodiac-gemini': {
    id: 'zodiac-gemini',
    title: 'Mithuna (Gemini)',
    href: '/learn/zodiac/gemini',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 12,
    lastUpdated: '2026-07-16',
    prerequisites: ['zodiac'],
    relatedTopics: ['ascendant', 'moon-sign', 'mercury'],
    nextGuides: ['zodiac-cancer'],
    prevGuides: ['zodiac-taurus'],
    status: 'available',
    teaser: 'The communicator: curiosity, connection, and the intelligence that reaches across.',
  },
  'zodiac-cancer': {
    id: 'zodiac-cancer',
    title: 'Karka (Cancer)',
    href: '/learn/zodiac/cancer',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 13,
    lastUpdated: '2026-07-16',
    prerequisites: ['zodiac'],
    relatedTopics: ['moon-sign', 'moon'],
    nextGuides: ['zodiac-leo'],
    prevGuides: ['zodiac-gemini'],
    status: 'available',
    teaser: 'The nurturer: belonging, emotional depth, and the wisdom of the interior life.',
  },
  'zodiac-leo': {
    id: 'zodiac-leo',
    title: 'Simha (Leo)',
    href: '/learn/zodiac/leo',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 12,
    lastUpdated: '2026-07-16',
    prerequisites: ['zodiac'],
    relatedTopics: ['ascendant', 'sun'],
    nextGuides: ['zodiac-virgo'],
    prevGuides: ['zodiac-cancer'],
    status: 'available',
    teaser: 'The sovereign: authentic authority, creative radiance, and the gift of genuine warmth.',
  },
  'zodiac-virgo': {
    id: 'zodiac-virgo',
    title: 'Kanya (Virgo)',
    href: '/learn/zodiac/virgo',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 13,
    lastUpdated: '2026-07-16',
    prerequisites: ['zodiac'],
    relatedTopics: ['mercury'],
    nextGuides: ['zodiac-libra'],
    prevGuides: ['zodiac-leo'],
    status: 'available',
    teaser: 'The analyst: discernment, precision, and service that comes from genuine care.',
  },
  'zodiac-libra': {
    id: 'zodiac-libra',
    title: 'Tula (Libra)',
    href: '/learn/zodiac/libra',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 12,
    lastUpdated: '2026-07-16',
    prerequisites: ['zodiac'],
    relatedTopics: ['ascendant', 'venus'],
    nextGuides: ['zodiac-scorpio'],
    prevGuides: ['zodiac-virgo'],
    status: 'available',
    teaser: 'The diplomat: balance, beauty, and the intelligence that finds the meeting point.',
  },
  'zodiac-scorpio': {
    id: 'zodiac-scorpio',
    title: 'Vrishchika (Scorpio)',
    href: '/learn/zodiac/scorpio',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 14,
    lastUpdated: '2026-07-16',
    prerequisites: ['zodiac'],
    relatedTopics: ['mars'],
    nextGuides: ['zodiac-sagittarius'],
    prevGuides: ['zodiac-libra'],
    status: 'available',
    teaser: 'The transformer: depth, perceptiveness, and the willingness to go where others will not.',
  },
  'zodiac-sagittarius': {
    id: 'zodiac-sagittarius',
    title: 'Dhanu (Sagittarius)',
    href: '/learn/zodiac/sagittarius',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 13,
    lastUpdated: '2026-07-16',
    prerequisites: ['zodiac'],
    relatedTopics: ['jupiter'],
    nextGuides: ['zodiac-capricorn'],
    prevGuides: ['zodiac-scorpio'],
    status: 'available',
    teaser: 'The seeker: vision, philosophical intelligence, and the arrow aimed at meaning.',
  },
  'zodiac-capricorn': {
    id: 'zodiac-capricorn',
    title: 'Makara (Capricorn)',
    href: '/learn/zodiac/capricorn',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 13,
    lastUpdated: '2026-07-16',
    prerequisites: ['zodiac'],
    relatedTopics: ['saturn'],
    nextGuides: ['zodiac-aquarius'],
    prevGuides: ['zodiac-sagittarius'],
    status: 'available',
    teaser: 'The strategist: discipline, patience, and achievement earned through sustained effort.',
  },
  'zodiac-aquarius': {
    id: 'zodiac-aquarius',
    title: 'Kumbha (Aquarius)',
    href: '/learn/zodiac/aquarius',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 12,
    lastUpdated: '2026-07-16',
    prerequisites: ['zodiac'],
    relatedTopics: ['saturn'],
    nextGuides: ['zodiac-pisces'],
    prevGuides: ['zodiac-capricorn'],
    status: 'available',
    teaser: 'The visionary: original intelligence, humanitarian concern, and the future built in the present.',
  },
  'zodiac-pisces': {
    id: 'zodiac-pisces',
    title: 'Meena (Pisces)',
    href: '/learn/zodiac/pisces',
    category: 'zodiac',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 14,
    lastUpdated: '2026-07-16',
    prerequisites: ['zodiac'],
    relatedTopics: ['jupiter', 'moon-sign'],
    nextGuides: [],
    prevGuides: ['zodiac-aquarius'],
    status: 'available',
    teaser: 'The dreamer: compassion, imagination, and the wisdom that comes from dissolution.',
  },
  nakshatra: {
    id: 'nakshatra',
    title: 'Nakshatras',
    href: '/learn/nakshatras',
    category: 'nakshatra',
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedReadTime: 12,
    lastUpdated: '2026-07-17',
    prerequisites: ['zodiac'],
    relatedTopics: ['moon-sign'],
    nextGuides: ['planets'],
    status: 'available',
    teaser: 'Go deeper: the 27 lunar mansions behind your Moon sign.',
  },
  planets: {
    id: 'planets',
    title: 'Planets',
    href: '/learn/planets',
    category: 'planets',
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedReadTime: 12,
    lastUpdated: '2026-07-17',
    prerequisites: ['nakshatra'],
    relatedTopics: [],
    nextGuides: ['houses'],
    status: 'available',
    teaser: 'What each of the nine grahas governs and how placement shapes your chart.',
  },
  houses: {
    id: 'houses',
    title: 'Houses',
    href: '/learn/houses',
    category: 'houses',
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedReadTime: 13,
    lastUpdated: '2026-07-17',
    prerequisites: ['planets'],
    relatedTopics: [],
    nextGuides: ['dashas'],
    status: 'available',
    teaser: 'The 12 life areas — where in your world each planet\'s energy actually operates.',
  },
  dashas: {
    id: 'dashas',
    title: 'Dashas',
    href: '/learn/dashas',
    category: 'dashas',
    difficulty: DIFFICULTY.ADVANCED,
    estimatedReadTime: 14,
    lastUpdated: '2026-07-17',
    prerequisites: ['houses'],
    relatedTopics: ['dasha'],
    nextGuides: [],
    status: 'available',
    teaser: 'The planetary timing system that answers when, not just what.',
  },
  yogas: {
    id: 'yogas',
    title: 'Yogas',
    href: '/learn/yogas',
    category: 'yogas',
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedReadTime: 13,
    lastUpdated: '2026-07-17',
    prerequisites: ['planets', 'houses'],
    relatedTopics: [],
    nextGuides: [],
    status: 'available',
    teaser: 'Raj Yoga, Gaja Kesari, Dhana Yoga — what they are and how to spot them.',
  },
  doshas: {
    id: 'doshas',
    title: 'Doshas',
    href: '/learn/doshas',
    category: 'doshas',
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedReadTime: 12,
    lastUpdated: '2026-07-17',
    prerequisites: ['planets', 'houses'],
    relatedTopics: [],
    nextGuides: [],
    status: 'available',
    teaser: 'Mangal Dosha, Kaal Sarp, Sade Sati — what they mean and what they don\'t.',
  },
}

// The single ordered sequence LearningPath renders on every guide page.
// Category hubs (Yogas, Doshas) are intentionally not part of this main
// sequence — they're deeper-dive categories a reader branches into once
// they know the basics, not a required step in the core path.
export const MAIN_LEARNING_PATH = ['birth-chart-basics', 'zodiac', 'nakshatra', 'planets', 'houses', 'dashas']

export function getGuide(id) {
  return GUIDES[id] ?? null
}

// Resolves a page's own id + the reader's completed-guide list (if any)
// into the {id, label, href, status} step list LearningPath.jsx renders.
//
// `completedIds` defaults to empty — nothing populates it today (no
// persistence, per this sprint's explicit scope), but the shape already
// supports it: a future localStorage- or account-backed completion
// feature only has to supply that one array here, LearningPath itself
// doesn't change.
export function getLearningPathSteps(currentId, completedIds = []) {
  return MAIN_LEARNING_PATH.map(id => {
    const guide = GUIDES[id]
    let status
    if (id === currentId) status = 'current'
    else if (completedIds.includes(id)) status = 'completed'
    else if (guide.status === 'comingSoon') status = 'locked'
    else status = 'available'

    return { id, label: guide.title, href: guide.href, status }
  })
}

// Resolves a guide's `nextGuides` into the single-item shape
// RelatedArticles' `variant="next"` expects. Returns null if the guide
// has no next step (e.g. Dashas, currently the end of the main path).
export function getNextGuide(currentId) {
  const guide = GUIDES[currentId]
  const nextId = guide?.nextGuides?.[0]
  if (!nextId) return null

  const next = GUIDES[nextId]
  if (!next) return null

  return {
    title: next.title,
    href: next.href,
    comingSoon: next.status === 'comingSoon',
    description: next.teaser ?? null,
  }
}

// Resolves prev/next guide pointers for sign-level navigation (the
// Aries ← → Taurus stepper that individual sign pages show). Distinct
// from getNextGuide because sign-to-sign navigation is a separate
// sequence from the main curriculum path — see knowledgeGraph.js comment
// above on MAIN_LEARNING_PATH vs individual signs.
export function getSignNavigation(currentId) {
  const guide = GUIDES[currentId]
  if (!guide) return { prev: null, next: null }

  function resolve(id) {
    if (!id) return null
    const g = GUIDES[id]
    if (!g) return null
    return { id, title: g.title, href: g.href, comingSoon: g.status === 'comingSoon' }
  }

  return {
    prev: resolve(guide.prevGuides?.[0]),
    next: resolve(guide.nextGuides?.[0]),
  }
}
