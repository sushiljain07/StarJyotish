# Knowledge Center — Content Architecture

**Date:** 2026-07-03
**Status:** Current
**Scope:** How content, configuration, and components fit together in `/learn/*`

---

## 1. Layering

Three layers, strictly separated:

```
config/*.js                    →  what to say (copy, data, relationships)
components/knowledge/*.jsx     →  how to say it (layout, styling, interaction)
pages/Learn.jsx, pages/learn/*.jsx  →  which pieces, in which order, for this page
```

A page component should be almost entirely composition: import content from config, import components from `components/knowledge/`, arrange them. `pages/learn/Zodiac.jsx` is the reference example — its only non-composition code is `SystemCard`, one small page-local component for a comparison layout nothing else needs yet (see §4 on when to promote something to `components/knowledge/`).

## 2. Config Files

| File | Owns |
|---|---|
| `config/learnContent.js` | `/learn` landing page copy — learning paths, beginner guides, categories, featured guides, "why learn" points |
| `config/zodiacContent.js` | `/learn/zodiac` page copy |
| `config/learningTaxonomy.js` | The shared category list (`CATEGORIES`) and difficulty scale (`DIFFICULTY`) — every other config references these ids rather than redefining them |
| `config/knowledgeGraph.js` | Per-guide structured metadata: category, difficulty, read time, last updated, prerequisites, related topics, next guide. Also owns `MAIN_LEARNING_PATH` (the canonical sequence) and the derivation functions `getGuide()`, `getLearningPathSteps()`, `getNextGuide()` |
| `config/concepts.js` | The term dictionary `ConceptLink` resolves against — decouples "this guide mentions Moon Sign" from "does a Moon Sign page exist yet" |

**Rule of thumb:** if a value could plausibly change without a designer or engineer touching layout, it belongs in config, not JSX. `zodiacContent.js`'s `RASHIS` array vs. `pages/learn/Zodiac.jsx`'s render loop is the clearest example — swapping in real sign-page URLs later is a one-line-per-entry change (`comingSoon: true` → `false`, add `href`), never a JSX edit.

## 3. The Knowledge Graph

`config/knowledgeGraph.js` is intentionally the most structured file in the Knowledge Center — it's described as a "lightweight knowledge graph" in its own header comment because it's meant to outlive this sprint's use cases (`LearningPath`, `RelatedArticles`' next-guide card). The shape (`prerequisites`, `relatedTopics`, `nextGuides`, `difficulty`, `estimatedReadTime`) is exactly what a future search index or recommendation feature would want as input — this sprint doesn't build that feature, but it also doesn't want a second data-migration sprint later to retrofit the structure.

Guide ids in this file are the single source of truth other configs reference: `zodiacContent.js`'s `BEYOND_ZODIAC` items reference concept ids from `concepts.js`; page components reference guide ids from `knowledgeGraph.js` (`getGuide('zodiac')`, `getLearningPathSteps('zodiac')`). Nothing hardcodes a guide's title or href a second time anywhere else in the codebase.

## 4. Component Library

Two tiers:

**Tier 1 — `components/knowledge/*`:** generic, reusable across every current and future guide. Before adding anything here, ask: would a second, unrelated guide plausibly use this exact component with different data? If yes, it belongs here. Current inventory:

- Layout: `Hero`, `Section`, `Breadcrumb`, `ReadingProgress`, `KnowledgeLayout`
- Content blocks: `Callout`, `QuickFacts`, `Reflection`, `FAQ`
- Cards: `ArticleCard` (generic), `ZodiacCard` (sign-specific but reusable — any future page referencing a Rashi can use it, not just `/learn/zodiac`)
- Icons: `CategoryIcon`, `ZodiacSignIcon`
- Navigation/CTA: `CTA`, `RelatedArticles`
- Learning system (sprint 3): `LearningPath`, `LearningMetadata`, `ConceptLink`

**Tier 2 — page-local components:** specific to one page's layout needs, defined inside that page's file (e.g. `SystemCard` in `Zodiac.jsx`). Promote to Tier 1 the moment a second page needs the same shape — not before, since guessing at a reusable API before there's a second real consumer tends to produce the wrong abstraction.

## 5. The "No Dead Links" Rule

Every Knowledge Center component that can reference unbuilt content follows the same pattern: check for a real `href`/`status`, and if one doesn't exist, render a visually consistent non-interactive state instead of linking to `#` or a 404.

| Component | Coming-soon signal | Non-interactive rendering |
|---|---|---|
| `ArticleCard` | `comingSoon: true`, no `href` | Muted card, "Coming soon" pill |
| `ZodiacCard` | `comingSoon: true` (default) | Same pattern, sign-specific styling |
| `ConceptLink` | `concepts.js` entry has `href: null` | Dotted-underline span, `title="Guide coming soon"` |
| `LearningPath` | Step's `status === 'locked'` | Muted pill, "Soon" label, never a `<Link>` |
| `RelatedArticles` (both variants) | Item has no `href` or `comingSoon: true` | Card renders as `<div>`, not `<Link>`, with a "Coming soon" pill |

This is why every "reference a page that doesn't exist yet" situation in the Knowledge Center resolves to one of these five components rather than a one-off `<Link to="#">` — a stray `#` link is exactly what this pattern exists to prevent.

## 6. Adding a New Guide Page

1. Add an entry to `config/knowledgeGraph.js`'s `GUIDES` (status `'comingSoon'`, `href: null`, everything else filled in) as soon as the guide is planned — this makes it show up correctly in `LearningPath` and as a `getNextGuide()` recommendation from whichever page precedes it, even before it's built.
2. Create `config/<guide>Content.js` for its copy, following `zodiacContent.js`'s shape (hero, section-by-section content blocks, FAQ items, final CTA).
3. Create `pages/learn/<Guide>.jsx`, composing `Hero` + `Section` blocks + whichever Tier 1 components fit, reading from both the new content config and `knowledgeGraph.js` (for `LearningPath`, `LearningMetadata`, `getNextGuide`).
4. Register the route in `App.jsx`, add it to `generate-sitemap.js`.
5. Flip the guide's `knowledgeGraph.js` entry to `status: 'available'` with the real `href`.
6. Update anywhere that referenced the guide while it was `comingSoon` — in practice, nothing needs manual updating: `ConceptLink`, `LearningPath`, `RelatedArticles`, and the `/learn` landing page's category cards all read `href`/`status` live from config, so step 5 alone makes every existing reference a live link.

See the AI Agent Guide doc for the same checklist framed for an agent (human or AI) actually doing the work.
