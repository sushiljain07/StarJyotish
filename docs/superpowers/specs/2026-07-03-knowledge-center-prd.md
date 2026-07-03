# Knowledge Center — Product Requirements Document

**Date:** 2026-07-03
**Status:** In progress — foundation, flagship page, and learning system shipped
**Scope:** `frontend/src/pages/Learn.jsx`, `frontend/src/pages/learn/*`, `frontend/src/components/knowledge/*`, `frontend/src/config/{learnContent,zodiacContent,knowledgeGraph,learningTaxonomy,concepts}.js`

---

## 1. Vision

Star Jyotish's educational content is a core product feature, not a marketing afterthought. The Knowledge Center is not a blog — it's a structured, guided learning experience, closer in feel to Stripe Docs, Linear Docs, Apple Learn, or Khan Academy than to a WordPress content section.

Two things follow from that:

1. **Every guide teaches before it sells.** Educational content earns the right to end with a Kundli-generation CTA; it doesn't lead with one.
2. **Every guide is one node in a curriculum, not an island.** A reader should always be able to see where they are in a larger sequence, what led here, and what's next — hence the learning-system work in sprint 3 (§5).

## 2. Design Principles

Calm, elegant, minimal, typography-first, mobile-first, accessible, fast. Whitespace over decoration. No new design system — the Knowledge Center reuses the existing saffron-gold/night/parchment/ink palette, Inter/Fraunces typography, and Tailwind utility conventions already established across the rest of the app (see `tailwind.config.js`). Nothing in the Knowledge Center introduces a new color, font, or spacing scale.

## 3. What's Shipped

### Sprint 1 — Foundation
- `/learn` route and landing page.
- The reusable `components/knowledge/*` library: `Hero`, `Section`, `Callout`, `QuickFacts`, `FAQ`, `CTA`, `ArticleCard`, `Breadcrumb`, `ReadingProgress`, `Reflection`, `RelatedArticles`, `KnowledgeLayout`, `CategoryIcon`.
- `config/learnContent.js` — categories, learning paths, beginner guides, featured guides, all content-only (no JSX).

### Sprint 2 — Flagship page
- `/learn/zodiac` — "Understanding the 12 Zodiac Signs in Vedic Astrology," composed entirely from the sprint-1 component library plus two page-specific additions: `ZodiacCard` (promoted to `components/knowledge/` as a reusable sign card) and `ZodiacSignIcon` (12 line-icon glyphs).
- `config/zodiacContent.js` — all page copy.

### Sprint 3 — Learning system
- `components/knowledge/LearningPath.jsx` — the curriculum-sequence stepper (Birth Chart Basics → Zodiac → Nakshatras → Planets → Houses → Dashas), with current/completed/available/locked states.
- `components/knowledge/LearningMetadata.jsx` — read time / difficulty / category / last-updated row, fully prop-driven.
- `components/knowledge/ConceptLink.jsx` — inline cross-reference for astrology terms, resolved against `config/concepts.js` so a term is never a dead link.
- `RelatedArticles.jsx` extended with a `variant="next"` single-recommendation card ("Continue Learning") alongside its original grid ("You May Also Like").
- `config/knowledgeGraph.js` — per-guide metadata (category, difficulty, read time, last updated, prerequisites, related topics, next guides) and the two functions (`getLearningPathSteps`, `getNextGuide`) every guide page reads from.
- `config/learningTaxonomy.js` — shared category and difficulty vocabulary.
- `config/concepts.js` — the term dictionary `ConceptLink` resolves against.
- All four learning-system components integrated into `/learn/zodiac` (learning-path stepper below the hero, metadata in the hero, `ConceptLink`-wrapped terms in "Beyond Your Zodiac Sign," a "Continue Learning" card recommending Nakshatras).

## 4. Content Model

A "guide" is any page under `/learn/*`. Every guide has, at minimum:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable key, used everywhere (route slugs, config lookups) |
| `title` | string | |
| `href` | string \| null | `null` means the page doesn't exist yet |
| `category` | string | Must match an id in `learningTaxonomy.CATEGORIES` |
| `difficulty` | `'beginner' \| 'intermediate' \| 'advanced'` | |
| `estimatedReadTime` | number (minutes) | |
| `lastUpdated` | ISO date string \| null | |
| `prerequisites` | string[] | Guide ids |
| `relatedTopics` | string[] | Concept ids (see `concepts.js`) |
| `nextGuides` | string[] | Guide ids, first one is what `getNextGuide()` recommends |
| `status` | `'available' \| 'comingSoon'` | |

This lives in `config/knowledgeGraph.js`. See the Content Architecture doc for how a new guide gets added.

## 5. Non-Goals (this phase)

- **Search.** The knowledge graph is deliberately shaped to support a future search/recommendation feature, but no search UI or index exists yet.
- **Completion tracking / persistence.** `LearningPath` supports a `'completed'` status and `getLearningPathSteps()` accepts a `completedIds` array, but nothing populates it — no localStorage, no account-backed progress. This is an explicit extension point, not an oversight.
- **Individual sign pages** (e.g. `/learn/zodiac/aries`). `RASHIS` entries in `zodiacContent.js` are all `comingSoon: true`.
- **CMS-backed guide authoring.** Guides are React components + config files, following this repo's existing "content lives in JS config" convention (same as `config/topics.js`), not database-backed like the Blog CMS.

## 6. Success Signals

- A new guide page can be built by composing existing `components/knowledge/*` pieces plus one new config file — no new layout primitives should be needed for guides that fit the standard shape (hero + sections + FAQ + CTA).
- No `/learn/*` page ever links to a route that doesn't exist. Every reference to unbuilt content goes through `ArticleCard`'s `comingSoon` prop, `ConceptLink`'s config-driven fallback, or `RelatedArticles`' coming-soon-safe rendering.
- Lighthouse SEO/accessibility scores for `/learn/*` match the rest of the app (100/100 SEO is the existing bar — see README).
