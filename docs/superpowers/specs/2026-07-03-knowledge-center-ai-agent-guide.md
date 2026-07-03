# Knowledge Center — AI Agent Guide

**Date:** 2026-07-03
**Status:** Current
**Audience:** An AI agent (or human) tasked with building the next `/learn/*` guide page

---

This is a practical checklist, not a design rationale doc — see the PRD and Content Architecture docs for the "why." Read those two first if anything here is unclear.

## Before writing anything

1. **Read `pages/learn/Zodiac.jsx` end to end.** It's the reference implementation every future guide should structurally resemble — Seo + SiteHeader + Hero (with `LearningMetadata` in `meta`) + a `LearningPath` section + a stack of `Section` blocks + `FAQ` + `RelatedArticles` (`variant="next"`) + `CTA` + Footer.
2. **Check `components/knowledge/` before writing any new component.** If the guide needs a hero, a section heading, a callout, a card grid, a FAQ, an inline term reference, a "what's next" prompt, or a metadata row — it already exists. Building a second version of any of these is the single most likely mistake.
3. **Check `config/knowledgeGraph.js`'s `GUIDES` entry for this guide.** If the guide was anticipated in a previous sprint, its metadata (category, difficulty, estimated read time, prerequisites, next guides) is already there with `status: 'comingSoon'` — don't redefine it elsewhere, just flip `status` and add `href` once the page exists.

## Building the page

1. Content goes in `config/<guide>Content.js`, not inline in the page component. If you catch yourself writing a paragraph of copy directly inside JSX, stop and move it to config.
2. Compose from `components/knowledge/*`. Page-local components are allowed (see `SystemCard` in `Zodiac.jsx`) but only for layouts genuinely specific to this one page — if you're not sure, ask whether a second guide would plausibly reuse it. If yes, it belongs in `components/knowledge/`, not the page file.
3. Wire in the learning system:
   - `<LearningMetadata estimatedReadTime={guide.estimatedReadTime} difficulty={guide.difficulty} category={getCategoryLabel(guide.category)} lastUpdated={guide.lastUpdated} variant="dark" />` inside the `Hero`'s `meta` prop.
   - `<LearningPath steps={getLearningPathSteps('<guide-id>')} />` in a `Section` right after the Hero.
   - Wrap any mention of a cross-referenceable term (Moon Sign, Ascendant, Nakshatra, Dasha, ...) in `<ConceptLink id="...">` instead of plain text or a hardcoded `<Link>`. If the term isn't in `config/concepts.js` yet, add it there (with `href: null` if no page exists) rather than hardcoding behavior in the page.
   - End with `<RelatedArticles variant="next" items={[...]} />` sourced from `getNextGuide('<guide-id>')`, before the final `<CTA>`.
4. **Never write a raw `<Link to="#">` or similar placeholder link for content that doesn't exist yet.** Use the `comingSoon` pattern on whichever component you're using (see the Content Architecture doc's §5 table). This is the single hard rule in this system — every other convention here is a strong default, this one is not optional.
5. Register the route in `App.jsx` and add it to `frontend/scripts/generate-sitemap.js`'s `PUBLIC_ROUTES`.
6. Update the guide's `knowledgeGraph.js` entry: `status: 'available'`, real `href`. Do not manually update other files that reference this guide (the `/learn` category cards, any `ConceptLink`/`LearningPath` reference elsewhere) — they read live from config and will pick up the change automatically. If you find yourself editing a second file to "make the link work," something upstream isn't reading from config correctly — fix that instead of patching around it.

## Conventions to hold the line on

- **No new design tokens.** Every color, font, radius, and spacing value used in the Knowledge Center already exists in `tailwind.config.js`. If a guide's content seems to need a new color (e.g. a fifth accent for a new category), that's a signal to reuse an existing token thoughtfully, not to extend the palette — raise it explicitly rather than adding one inline.
- **No PropTypes / TypeScript.** This repo is plain JS/JSX throughout with zero PropTypes usage — ESLint's `react/prop-types` warnings on every `components/knowledge/*` file are expected and correct to leave as-is; don't "fix" them by introducing typing that doesn't match the rest of the codebase.
- **No new animation library.** Scroll-reveal is `<Reveal>` (IntersectionObserver-based, already exists, respects `prefers-reduced-motion`). Don't add framer-motion or similar.
- **`t('key', 'Default English text')`** is the pattern for any copy that might eventually need Hindi translation (see `Footer.jsx`, `NotFound.jsx`), but the Knowledge Center guides built so far (Learn.jsx, Zodiac.jsx) are English-only in plain strings, matching `Blog.jsx`/`BlogArticle.jsx`'s existing precedent of not i18n-wrapping long-form content. Don't introduce i18n wrapping for guide body copy unless asked — it would be inconsistent with the one existing long-form content precedent in this codebase.
- **Verify before finishing:** `npm run build` from `frontend/` must succeed, and `npx eslint` on every file you touched must report 0 errors (warnings are fine — see above). Both are cheap and catch the large majority of real mistakes before a human ever looks at the diff.

## Recommendations before building the first individual sign page (e.g. Aries)

These are open questions this sprint deliberately left unresolved — worth a decision before, not during, that build:

1. **URL shape.** `/learn/zodiac-signs/aries` vs. `/learn/zodiac/aries` vs. `/learn/aries`. `ZodiacCard`'s `href` prop and `RASHIS` entries in `zodiacContent.js` don't assume a shape yet — whichever is chosen, it's a one-line change per sign, not a refactor.
2. **Layout: `KnowledgeLayout` vs. `Section`-stack.** An individual sign page (identity, ruling planet, compatible signs, famous traits) is much closer to "one continuous article" than `/learn/zodiac`'s multi-block magazine layout — this is exactly the case `KnowledgeLayout` (built in sprint 1, unused so far) was designed for. Strongly recommend using it here rather than the `Hero` + `Section`-stack pattern, both to validate `KnowledgeLayout` against a real page and because a narrow reading column genuinely fits single-sign content better.
3. **Template vs. 12 hand-authored pages.** Twelve sign pages will share close to 100% of their structure (Overview, Traits, Ruling Planet, Compatible Signs, Famous People, Career Tendencies, ...) and differ almost entirely in content. Strongly recommend one `pages/learn/zodiac-signs/[Sign].jsx`-style template driven by a per-sign config object (extending the existing `RASHIS` entries in `zodiacContent.js` with the additional fields each detail page needs), rather than twelve separate page components — the latter guarantees drift within a few sprints.
4. **`QuickFacts` is the natural fit** for a sign page's at-a-glance block (Element, Ruling Planet, Symbol, Quality, Compatible Signs) — it exists specifically for this and hasn't been used anywhere yet.
5. **Decide the `knowledgeGraph.js` question now:** are individual signs first-class `GUIDES` entries (each with its own prerequisites/next-guide chain, e.g. Aries → Taurus → ... → Pisces), or are they children of the single `zodiac` guide entry with a separate, smaller graph? The `MAIN_LEARNING_PATH` sequence (Birth Chart Basics → Zodiac → Nakshatras → ...) treats "Zodiac Signs" as one step — inserting twelve individual signs into that same top-level sequence would make `LearningPath` unwieldy. Recommend keeping `MAIN_LEARNING_PATH` as-is and giving sign-to-sign navigation its own mechanism (e.g. a simple prev/next within the sign template, not `LearningPath`).
