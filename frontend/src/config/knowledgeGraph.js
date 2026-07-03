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
  'birth-chart-basics': {
    id: 'birth-chart-basics',
    title: 'Birth Chart Basics',
    href: '/learn#beginner-guides',
    category: 'beginner',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedReadTime: 6,
    lastUpdated: '2026-07-03',
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
  },
  nakshatra: {
    id: 'nakshatra',
    title: 'Nakshatras',
    href: null,
    category: 'nakshatra',
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedReadTime: 12,
    lastUpdated: null,
    prerequisites: ['zodiac'],
    relatedTopics: ['moon-sign'],
    nextGuides: ['planets'],
    status: 'comingSoon',
    teaser: 'Go deeper: the 27 lunar mansions behind your Moon sign.',
  },
  planets: {
    id: 'planets',
    title: 'Planets',
    href: null,
    category: 'planets',
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedReadTime: 12,
    lastUpdated: null,
    prerequisites: ['nakshatra'],
    relatedTopics: [],
    nextGuides: ['houses'],
    status: 'comingSoon',
  },
  houses: {
    id: 'houses',
    title: 'Houses',
    href: null,
    category: 'houses',
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedReadTime: 12,
    lastUpdated: null,
    prerequisites: ['planets'],
    relatedTopics: [],
    nextGuides: ['dashas'],
    status: 'comingSoon',
  },
  dashas: {
    id: 'dashas',
    title: 'Dashas',
    href: null,
    category: 'dashas',
    difficulty: DIFFICULTY.ADVANCED,
    estimatedReadTime: 14,
    lastUpdated: null,
    prerequisites: ['houses'],
    relatedTopics: ['dasha'],
    nextGuides: [],
    status: 'comingSoon',
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
