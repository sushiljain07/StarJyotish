# Frontend UX Roadmap: from "works" to production-grade

**Source:** frontend review of 4 Nov 2026. Four parallel reviews (visual design, navigation and layout, English/Hindi, production polish) plus live-site screenshots at 390px and 1440px in EN and HI.
**Decisions already made by the owner:**
- `/pricing` becomes an "Early access: everything free" page.
- The WhatsApp opt-in is removed.
- The Kundli page keeps its two-level tab navigation: main tabs, sub-tab pill rows and the bottom NavBar. Do not flatten it, and do not turn it into hub-and-spoke.

Each phase ships as its own branch off `main` and its own PR, and is releasable on its own. Phase 1 has a detailed task plan (`2026-11-04-phase1-trust-and-cost.md`). Each later phase gets its own detailed plan when it starts, written against the code as it is then.

Finding IDs below come from the review: **N** = navigation/layout, **D** = design, **I** = i18n, **P** = production polish, **W** = "wow" upgrades.

---

## Phase 1: Trust and cost (about 1 day) · detailed plan ready

Goal: stop paying for invisible AI calls, and stop showing users things that aren't true.

| Task | Fixes |
|---|---|
| 1. Save the language choice; guard the storage read that runs at startup | P-H4, P-H5, I-1 |
| 2. Generate the career report only on the career topic, and only when its tab is opened | P-H1 (also reduces Groq 429 bursts) |
| 3. Replace Pricing with an "Early access: everything free" page | P-H3, N-M3 |
| 4. Remove the WhatsApp opt-in and its privacy-policy text | P-H2 |

**Done when:** a Hindi user stays in Hindi after a reload; opening Insights on any topic other than career makes no `/api/career-report` call; `/pricing` shows no ₹ amounts; nothing in the app asks for a WhatsApp number.

---

## Phase 2: Core flows (2–3 days)

Goal: a user never loses their chart, never retypes their details, and never waits twice for the same report.

1. **Birth form** (P-H6):
   - Reject impossible dates with a `new Date(y, m-1, d)` round-trip, and reject future dates.
   - Add the "I don't know my exact birth time" option. Reuse Onboarding's time-accuracy control rather than adding a second one.
   - Link each label to its input with `htmlFor`/`id`.
   - Make place autocomplete an ARIA combobox (arrow keys, Enter, Escape, `aria-activedescendant`), and require a suggestion to be picked.
   - Apply the same combobox to Onboarding (`:293`, `:367`) and Profile (`:338`, `:383`).
2. **Keep the chart through sign-in** (N-H2): from workspace routes, pass `{ next, ...location.state }` to `/login`. After the first login, save the chart just generated as the user's primary profile and skip re-entry in onboarding.
3. **Tabs in the URL; rebuild state when it's missing** (N-H1):
   - `/kundli?tab=analysis&sub=dasha`, `/insights?sub=career&topic=career`. Use `replace` for sub-tab changes so Back steps between main tabs, not every pill.
   - When router state is missing, rebuild it from `getPrimaryProfile(user)` instead of redirecting to /home.
   - Keep the two-level navigation exactly as it is.
4. **Report cache, abort and stale-response guards** (P-M1, P-M2, I-9):
   - Share one `useReportRequest(endpoint, body)` hook between ChartReading, CareerReportTab, TopicReportTab and RajyogasTab.
   - Cache results in sessionStorage keyed by `{endpoint, date, time, place, lang, ctx}`.
   - Use an AbortController on unmount and a request-id guard so an older response can't overwrite a newer one.
   - Re-request when the language changes.
   - Fix the same race in the place-suggestion fetch (`usePlaceSuggestions.js`).
5. **Bring the AI reading up the chart page:** on `/kundli` › Chart, show a two-line preview of the reading (or a "Reveal" teaser for anonymous users) directly under the context chips, above the charts. Today it sits below two full charts.
6. **Clean up the orphaned `/career-report` page** (N-M2): point the `learn/paths/CareerPath.jsx:109` CTA at `/generate?topic=career`, turn `/career-report` into a redirect, then delete `pages/CareerReport.jsx` and the alias in `config/nav.js`.

---

## Phase 3: Full Hindi (3–4 days)

Goal: a Hindi user sees no English on the main journey.

1. **Devanagari typography** (I-7, D-3):
   - Load Noto Sans Devanagari (body) and Tiro Devanagari Hindi (headings) with `display=swap`, and add them to both Tailwind font stacks.
   - Under `:lang(hi)`, set letter-spacing to 0, drop `uppercase`, and use a slightly larger line-height.
   - Don't use `leading-none` on Devanagari labels; BottomNav's 10px labels go up to at least 12px.
2. **Language toggle in the header and account menu** (I-5): give it `aria-label` and `aria-pressed`. When signed in, also save the choice to the profile's `preferred_language`, and apply that preference at login.
3. **Translate the main journey** (I-2, I-4): Result, the chart chips and legend, PlanetTable, DashaTable, TransitPanel, RajyogasTab, ChartReading, CareerReportTab, TopicReportTab, HeroBanner, BirthForm, DailyPatrikaHero, ErrorFallback, Insights sub-tab labels, the loading and error states, and PanchangDetail.
   - Use the existing unused keys (`col_*`, `tab_dasha`, `antardasha_heading`, …).
   - Add a 27-name `nakshatras.*` map, `dasha_md/ad/pd`, and Hindi planet abbreviations for the chart, so labels aren't a mix (सू next to Pl/Ne/Ur/La).
4. **Dates** (I-6): one `formatDate(d, opts)` helper that uses `hi-IN` or `en-IN`, applied in the 7 files that hardcode a locale.
5. **Backend labels** (I-3): send `language` to `/api/rajyogas`; return stable yoga ids from the backend and translate them on the client. Map server `detail` codes to translated messages.
6. **Guardrails:**
   - `eslint-plugin-i18next` `no-literal-string` (jsx-only): an error in `src/components/**` and the main-journey pages, allowed in admin/astrologer.
   - A Vitest key-parity test: same keys, same `{{placeholders}}`, every Hindi value contains Devanagari unless allow-listed.
7. **Wording:** a short glossary (जन्म कुंडली, चंद्र, गुरु, पुनः प्रयास करें) and one pass over hi.json. Use i18next plurals for `coming_in_weeks`; fix `patrika_rarity`.
8. **Knowledge Center and legal pages:** move the Learn content into `content/{en,hi}/` files and lazy-load them. Legal pages can stay English with a Hindi note.

---

## Phase 4: Mobile and navigation polish (1–2 days)

1. **Safe areas** (N-H3): add `viewport-fit=cover` to `index.html`, and set the raised NavBar to `bottom: calc(60px + env(safe-area-inset-bottom))`. Check on an iPhone-sized emulator with a home indicator.
2. **Fixed chrome on /kundli** (N-M1): collapse the summary chips when the user scrolls down; switch the top and bottom tab rows at the same breakpoint (`md`).
3. **Overlaps seen in the screenshots:**
   - The scroll-to-top button covers the footer's "Contact Us" link.
   - An empty parchment strip shows between the footer and the BottomNav.
   - The Download tab uses a speech-bubble icon.
   - The Birth Chart tab icon is a plain yellow dot.
4. **Tap targets of at least 44px** (N-M6): sub-tab pills, avatar, sign-in pill, footer links, language pills, BottomNav.
5. **Naming and reachability** (N-M4, N-M5):
   - Use one name for the AI page everywhere ("AI Guidance" vs "Insights" vs "Insights & Reading").
   - Show fixed Reading/Ask/Topic sub-tabs on `/insights` with the topic chosen in the page.
   - Add "Generate Kundli" to the signed-out menu.
6. **Small items:**
   - `html { scroll-padding-top: 72px }` (N-L2).
   - `min-h-[100dvh]` (N-L3).
   - A sideways-scroll hint or sticky first column on wide tables (N-L4).
   - Align header, content and footer widths, and cap reading text at `max-w-prose` (N-L5).
   - "About" in the account menu shouldn't go to the marketing Landing page (N-L1).
7. **Accessibility** (P-M4, P-M5, P-M6, P-L3, P-L5):
   - Proper tab ARIA and arrow keys in AnimatedTabRow; `aria-pressed` in SegmentedToggle.
   - SectionJumpNav sheet: Escape, focus trap and `aria-labelledby`.
   - OTP form: linked labels, `autoComplete="one-time-code"`, `role="alert"` on errors.
   - A `<main>` landmark and a skip link.
   - `motion-safe:` on spinners.
8. **Replace `alert()`** with inline messages: ContactUs WhatsApp "coming soon" and PaywallCard (P-L1).

---

## Phase 5: Design system, performance and "wow" (ongoing, in slices)

**5a. Contrast and tokens** (D-1, D-2, D-4, D-5, D-10, D-11):
- Add `primary.ink #8F6A22` for gold text on light backgrounds.
- Darken `ink-muted` to `#6F6656` and `ink-faint` to `#857A6A`; move meaningful text off `faint`.
- Add semantic tokens `good`/`caution`/`bad`.
- Remove the second gold and purple palette in ChartReading, ChartHighlight and MobileTimelineCard.
- Build `chartPalette` from the Tailwind config for the chart SVGs.
- Keep the keyframes in one place, and have the focus ring use the token.

**5b. Component adoption** (D-6, D-7):
- Move the 37 hand-built CTAs onto `<Button>` and the cards onto `<Card>`.
- Add `Pill`/`Badge` components.
- Codemod the arbitrary text sizes to the 2xs/3xs scale, with nothing below 10px.
- Add a lint or CI grep that blocks `rounded-xl|2xl` and `shadow-(sm|md|lg)` outside `ui/`.

**5c. Icons** (D-8, D-9): one `<Icon>` SVG set built from `HomeIcons.jsx`, replacing the 344 emoji (the report tabs first). Use `currentColor` icons instead of CSS filter chains.

**5d. Performance** (P-M7, P-L4):
- Load only the active language file.
- Load Sentry dynamically, and only when a DSN is set.
- Scope `GoogleOAuthProvider` to the login and account-linking pages.
- Reload once on `vite:preloadError`.
- Show stage-by-stage AI progress messages with `aria-live` (P-M3).
- Silence the 401 console error from the anonymous session-refresh probe.

**5e. SEO** (P-M8):
- Generate the sitemap from the route list, including the Learn guides and blog slugs.
- Fix titles that end in "| Star Jyotish" twice (Pricing, Testimonials, BlogArticle, NotFound).
- Use a 1200×630 share image.

**5f. Content consistency** (P-L2): use one support address (`contact@` vs `support@`).

**5g. "Wow" upgrades**, one PR each, after 5a:
1. **Chart page hero (W-1):** the person's name, birth date and place, the chart, then an immediate reading preview.
2. **Planet identity system (W-2):** a `ui/Graha.jsx` component giving each planet a fixed colour and SVG glyph, used across charts, tables, the dasha timeline and AI highlights.
3. **Reveal moment (W-3):** staggered fade-in of report sections plus a one-time gold shimmer, only with `motion-safe`.
4. **Patrika styling (W-4):** a subtle paper texture, double-rule card frames, gold-gradient serif headings with a Devanagari serif for Hindi.
5. **Personal sky (W-5):** draw the user's real ascendant and Moon position as faint lines behind their chart.
6. **Gold-capsule tab pills (W-6):** an active sub-tab pill that slides between options, inside the existing two-level navigation.

---

## Tracking

| Phase | Branch | Plan | Status |
|---|---|---|---|
| 1 | `fix/phase1-trust-and-cost` | `2026-11-04-phase1-trust-and-cost.md` | Done — PR open |
| 2 | `fix/phase2-core-flows` | to write | — |
| 3 | `feat/phase3-hindi` | to write | — |
| 4 | `fix/phase4-mobile-nav` | to write | — |
| 5a–g | `feat/phase5-*` | to write per slice | — |
