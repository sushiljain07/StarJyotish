# User Home Page Redesign

## Goal

Redesign the authenticated `/home` page into a premium astrology dashboard that more closely matches the supplied mockups while preserving the existing header, footer, data hooks, and navigation targets.

## Visual Direction

- Use a **premium cosmic dashboard** layout: parchment base, deep-indigo insight cards, warm gold accents, softer borders, and elevated card depth.
- Keep the page highly personalized with a strong hero that includes avatar, greeting, birth details, astro chips, and celestial artwork/wheel treatment on larger screens.
- Mirror the mockups' balance of **spiritual warmth + structured utility** instead of a generic SaaS dashboard.

## Layout

1. Keep `SiteHeader` and `CompactFooter` unchanged.
2. Rebuild the body of `PersonalHome.jsx` into:
   - premium hero band
   - utility row for location / cosmic snapshot / AI guidance
   - quick-access dashboard modules
   - panchang timeline and daily guidance
   - life-area and report sections
   - learning, reflection, journal, and AI support blocks
3. Desktop should favor a deliberate multi-column layout.
4. Mobile should become a clean vertical flow with tighter spacing and fewer side-by-side card collisions.

## Component Strategy

- Reuse the current data and navigation behavior from `PersonalHome.jsx`.
- Retain and restyle existing home modules where possible:
  - `DailyPatrikaHero`
  - `QuickPanchangStrip`
  - `DoAvoidCards`
  - `LifeAreaGrid`
  - `ReportsStrip`
  - `JournalPrompt`
  - `AskPersonaPanel`
  - `DisclaimerBlock`
- Add small presentation components only where necessary for:
  - premium profile hero shell
  - cosmic snapshot card
  - quick actions strip
  - reusable dashboard section/card wrappers

## Content and UX Rules

- Preserve existing feature coverage and avoid duplicate blocks that serve the same purpose.
- Prioritize the flow: identity -> what matters now -> timing -> deeper reports -> reflection/support.
- If panchang, location, or transit-derived data is missing, the page must still render as a complete premium experience.
- Support both English and Hindi without hardcoded English layout assumptions.

## Implementation Constraints

- Keep header and footer the same.
- Match the supplied image direction as closely as practical using existing project patterns and styling.
- Prefer surgical component additions and layout restructuring over broad rewrites.
- Ensure desktop and mobile both feel intentionally designed, not merely responsive.
