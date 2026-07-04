# User Journey: Login → Onboarding → Home

## Purpose

This sprint builds the bridge between authentication and the personal
Home (`docs/PRODUCT_HOME.md`): **onboarding**, the guided flow that turns
a brand-new User Account into someone with a real, saved Astrology
Profile. It's framed throughout as "Your First Reading," not a
registration form — one question per screen, real chart generation at
the end, no long forms.

## The core domain split

> **User Account** ≠ **Astrology Profile**

- A **User Account** (`AuthContext`'s `user`, backed by the real `users`
  table) is a login identity — phone, email, name, avatar. It exists the
  moment someone completes OTP or Google login.
- An **Astrology Profile** is a birth chart someone has created: their
  own, or someone else's ("Mom," "Rahul," "Daughter"). One account can
  eventually hold several. Birth data lives here, never on the account
  record — `Profile.jsx` (the account-settings page) was already written
  this way before this sprint (its own comment explicitly calls out that
  gender/DOB/birth-place were removed from it on purpose), so this sprint
  extends an existing principle rather than introducing a new one.

Today, `services/astrologyProfiles.js` is where that split actually
lives on the frontend — see "Architectural decisions" below for exactly
what's real vs. placeholder inside it.

## User lifecycle

```
Anonymous visitor
      │
      ▼
   Login (phone OTP or Google)
      │
      ▼
Does this account have ≥1 Astrology Profile?
      │
      ├── Yes ──────────────────────────────► /home (real chart, full Home)
      │
      └── No ──► /onboarding ("Your First Reading")
                      │
                      ├── Skip ─────────────► /home (EmptyHomeState)
                      │
                      └── Complete all 6 questions
                                │
                                ▼
                         Generate real chart (/api/kundli)
                                │
                                ▼
                         Save as Astrology Profile
                                │
                                ▼
                              /home (real chart, full Home)
```

Once an account has a profile, it **never sees onboarding again** —
enforced twice (belt and suspenders, not redundancy for its own sake):

1. `Login.jsx`'s `destinationFor()` — the common-case shortcut, decided
   once at login time.
2. `OnboardingGate.jsx`, wrapping the `/home` route itself — the actual
   enforcement, which holds regardless of *how* someone reaches `/home`
   (a bookmark, browser back button, typing the URL, a stale tab).

`Onboarding.jsx` also guards itself the other way: if a signed-in
visitor with an existing profile lands on `/onboarding` directly (back
button, stale link), it immediately redirects to `/home`.

## User state machine

States, exactly as implemented:

| State | Where it's decided | What renders |
|---|---|---|
| `signed_out` | `AuthContext.isAuthenticated === false` | `/login` (any protected route redirects here via `ProtectedRoute`, carrying `next`) |
| `signed_in_no_profile_no_skip` | `hasAnyProfile(user) === false && hasSkippedOnboarding(user) === false` | `/onboarding`, starting at `welcome` |
| `signed_in_onboarding_in_progress` | Local state inside `Onboarding.jsx` (`step`) | One of `welcome → profileType → label → birthDate → birthTime → birthPlace → review → generating` |
| `signed_in_skipped` | `hasSkippedOnboarding(user) === true` (and still no profile) | `/home` with `EmptyHomeState` in place of Cosmic Snapshot / Birth Chart |
| `signed_in_with_profile` | `hasAnyProfile(user) === true` | `/home` with real Cosmic Snapshot + Birth Chart, driven by `getPrimaryProfile(user)` |

Transitions:
- `signed_out → signed_in_*`: successful OTP verification or Google
  login (`AuthContext.loginWithPhone` / `loginWithGoogleToken`).
- `signed_in_no_profile_no_skip → signed_in_onboarding_in_progress`:
  automatic (both `Login.jsx` and `OnboardingGate.jsx` route here).
- `signed_in_onboarding_in_progress → signed_in_skipped`: tapping "Skip
  for now" at any point before `generating` (`Onboarding.jsx`'s `skip()`
  → `markOnboardingSkipped`).
- `signed_in_onboarding_in_progress → signed_in_with_profile`: the
  `review` step's "Generate My Birth Chart" completing successfully
  (`createProfile()` resolves) — this also clears any earlier skip flag,
  since a real profile now exists.
- `signed_in_skipped → signed_in_onboarding_in_progress`: tapping
  `EmptyHomeState`'s CTA, or the "Generate New Chart" style prompt,
  re-entering `/onboarding`.
- Generation failure (`createProfile()` rejects — e.g. the place couldn't
  be geocoded): step returns to `review` with an inline error, exactly
  like `Home.jsx`'s existing `/generate` error handling. No dead-end
  state exists; the person can edit and retry.

## The 8 screens (Steps 1–8 from the brief)

| # | Step id | Question | Component |
|---|---|---|---|
| 1 | `welcome` | (intro, no question) | `QuestionCard` |
| 2 | `profileType` | Whose chart would you like to create? | `ProfileTypeSelector` |
| 3 | `label` | What should we call this profile? | plain text input inside `QuestionCard` |
| 4 | `birthDate` | When were they born? | large day/month/year selects inside `QuestionCard` |
| 5 | `birthTime` | Do you know the birth time? | `BirthTimeSelector` |
| 6 | `birthPlace` | Where were they born? | autocomplete input (via `usePlaceSuggestions`) inside `QuestionCard` |
| 7 | `review` | Confirm | `ReviewCard` |
| 8 | `generating` | (transition, no question) | `LoadingState` |

`ProgressIndicator` only counts steps 2–7 (the six real questions) — 1
and 8 are bookends, not questions, exactly per the brief's framing.

## Architecture

### Component hierarchy

```
pages/Onboarding.jsx                          (flow state: step, draft answers)
├── components/onboarding/OnboardingLayout.jsx   (shell: back, skip, wordmark)
│   ├── components/onboarding/ProgressIndicator.jsx
│   └── components/onboarding/QuestionCard.jsx    (shared per-step shell)
│       ├── components/onboarding/ProfileTypeSelector.jsx   (step 2)
│       ├── components/onboarding/BirthTimeSelector.jsx     (step 5)
│       ├── components/onboarding/ReviewCard.jsx            (step 7)
│       └── components/onboarding/LoadingState.jsx          (step 8, outside QuestionCard)

components/OnboardingGate.jsx                 (route guard for /home)
services/astrologyProfiles.js                 (business logic — see below)
components/home/EmptyHomeState.jsx            (rendered by PersonalHome.jsx, not Onboarding.jsx)
```

`EmptyHomeState.jsx` is filed under `components/home/`, not
`components/onboarding/` as the original brief suggested — it's rendered
by `PersonalHome.jsx`, for accounts that skipped, and belongs with the
rest of that page's sections rather than with the flow that leads away
from it.

`Onboarding.jsx` deliberately contains no `fetch`, no `localStorage`
call, and no chart-shaping logic — every one of those lives in
`services/astrologyProfiles.js`, per the brief's "keep business logic
outside UI." The page only ever calls `createProfile()`,
`markOnboardingSkipped()`, and `hasAnyProfile()`.

### `services/astrologyProfiles.js` — what's real, what's a placeholder

**Real:** `createProfile()` calls the actual, already-live
`POST /api/kundli` (via `api/astro.js`'s `fetchKundli`) — the same Swiss
Ephemeris computation `/generate` has always used. Nothing about the
generated chart is fake; a birth date/time/place typed into onboarding
produces exactly the same `ChartResponse` it would from the existing
birth form.

**Placeholder:** *persisting* that chart as belonging to this account.
No backend endpoint exists for "save this chart as an Astrology Profile
on my account" — the backend's `BirthProfile` table
(`backend/models/account_models.py`'s `BirthProfileOut`) is currently
only ever written as a side effect of generating a *report*
(career/rajyogas/relationship/wealth) for a phone number, via
`services/persistence.py`'s `save_for_phone` — and even then, keyed by
phone number, not by account id, with no "list my profiles" read outside
of `GET /api/account/birth-profiles/{phone_number}`. So:

- Profiles are stored in `localStorage`, keyed by `user.id` (stable
  across login method — phone or Google), under `sj_astrology_profiles_v1`.
- Every stored profile is shaped field-for-field like `BirthProfileOut`
  (`birth_date`, `birth_time`, `place`, `is_primary`) plus the full
  `chart` (`ChartResponse`) and one field the backend doesn't have yet
  (`birth_time_accuracy` — see below), so swapping this module's insides
  for real `GET/POST /api/account/astrology-profiles` calls later is a
  pure implementation-detail change. Nothing that reads a profile
  (`PersonalHome.jsx`, `Onboarding.jsx`'s own-profile check) needs to
  change.
- A separate flag, `hasSkippedOnboarding()`/`markOnboardingSkipped()`,
  tracks the skip choice independently of "has a profile" — the two are
  genuinely different facts and `PersonalHome.jsx` needs to tell them
  apart (see the state table above).

### The birth-time-unknown problem

`POST /api/kundli`'s `BirthInput.time` field is **required** — Vedic
chart calculation needs *some* time to place the Ascendant and houses.
But the brief is explicit: never force an exact time out of someone who
doesn't know it. The resolution:

- `BirthTimeSelector.jsx` offers three honest options: exact,
  approximate, or unknown.
- When unknown, `Onboarding.jsx` submits a conventional default
  (`UNKNOWN_BIRTH_TIME_DEFAULT = '12:00'`, noon — the same convention
  Vedic astrologers themselves use when a birth time is lost) rather
  than blocking chart generation entirely.
- The chosen accuracy (`'exact' | 'approximate' | 'unknown'`) is saved
  on the profile as `birth_time_accuracy` and surfaced honestly wherever
  the chart is shown — `ChartPreviewCard.jsx` on `/home` displays a
  caveat about the Ascendant/houses being approximate whenever the time
  wasn't exact, rather than presenting a guessed time with false
  confidence. Planetary *signs* are unaffected either way; only the
  Ascendant and house cusps depend on the exact minute.

### `/home` now uses real data

`PersonalHome.jsx` (from the previous sprint) previously rendered
hand-written placeholder Cosmic Snapshot / Birth Chart data
unconditionally. This sprint changes that:

- `getPrimaryProfile(user)` decides what renders. A profile → real
  Cosmic Snapshot (`getCosmicSnapshotFromChart()` in `config/homeData.js`,
  now deriving Mahadasha/Antardasha/Moon sign directly from the saved
  `ChartResponse`) and real `ChartPreviewCard`. No profile →
  `EmptyHomeState`.
- "View Full Chart" and "Ask AI about My Chart" now deep-link straight
  into `/kundli` (`Result.jsx`) with the account's real saved chart —
  the "once a saved chart exists" future `docs/PRODUCT_HOME.md`
  originally described is the current behavior now.
- "Generate New Chart" still goes to the standalone `/generate` flow
  (a fresh, unsaved, one-off chart) since there's no "Add Profile" UI
  yet to save a second profile — see "Future multi-profile support"
  below.

### Reused, not rebuilt

- **Geocoding** (`onboarding_place_title` step): `usePlaceSuggestions.js`
  was extracted out of `BirthForm.jsx` into `hooks/`, so both the
  original birth form and onboarding's place step now share one
  implementation against the real `routers/places.py` backend, rather
  than onboarding re-implementing autocomplete.
- **Chart generation**: the exact same `fetchKundli()` call `/generate`
  already made.
- **Icons**: `ProfileTypeSelector`'s "Mine"/"Someone Else" cards use two
  new hand-drawn icons added to `components/home/HomeIcons.jsx` (`self`,
  `people`) rather than emoji — consistent with `TopicIcon.jsx`/
  `TabIcon.jsx`'s established no-emoji convention.

## Routing

| Route | Guard | Notes |
|---|---|---|
| `/login` | — | `destinationFor()` now picks `/home` vs `/onboarding` for the plain (no explicit `next`) case |
| `/onboarding` | `ProtectedRoute` | Self-redirects to `/home` if a profile already exists |
| `/home` | `ProtectedRoute` → `OnboardingGate` | Redirects to `/onboarding` if no profile and not skipped |
| `/generate`, `/kundli` | — (unchanged) | Standalone one-off chart flow, untouched |

## Files created

- `frontend/src/pages/Onboarding.jsx`
- `frontend/src/components/onboarding/OnboardingLayout.jsx`
- `frontend/src/components/onboarding/ProgressIndicator.jsx`
- `frontend/src/components/onboarding/QuestionCard.jsx`
- `frontend/src/components/onboarding/ProfileTypeSelector.jsx`
- `frontend/src/components/onboarding/BirthTimeSelector.jsx`
- `frontend/src/components/onboarding/ReviewCard.jsx`
- `frontend/src/components/onboarding/LoadingState.jsx`
- `frontend/src/components/home/EmptyHomeState.jsx`
- `frontend/src/components/OnboardingGate.jsx`
- `frontend/src/services/astrologyProfiles.js`
- `frontend/src/hooks/usePlaceSuggestions.js` (extracted)
- `docs/USER_JOURNEY.md` (this file)

## Files modified

- `frontend/src/App.jsx` — registered `/onboarding`; wrapped `/home` in `OnboardingGate`
- `frontend/src/pages/Login.jsx` — `destinationFor()` picks `/home` vs `/onboarding`
- `frontend/src/pages/PersonalHome.jsx` — reads `getPrimaryProfile()`, renders `EmptyHomeState` when absent, real CTAs into `/kundli`
- `frontend/src/config/homeData.js` — `getCosmicSnapshot()`/`getChartPreview()` (placeholder) replaced by `getCosmicSnapshotFromChart(chart)` (real)
- `frontend/src/components/home/ChartPreviewCard.jsx` — takes a real chart + `timeAccuracy` instead of placeholder data + a generic caption
- `frontend/src/components/home/HomeIcons.jsx` — added `self`/`people` icons
- `frontend/src/components/BirthForm.jsx` — uses the extracted `usePlaceSuggestions` hook
- `frontend/src/i18n/en.json`, `frontend/src/i18n/hi.json` — full bilingual onboarding + updated Home copy
- `docs/PRODUCT_HOME.md` — annotated with what this sprint changed

## Architectural decisions

1. **User Account / Astrology Profile stays a frontend-only split for
   now.** The backend has no `astrology_profiles`-by-account concept
   yet; rather than block this sprint on a backend change, the split is
   enforced entirely in `services/astrologyProfiles.js`, shaped to match
   the backend's real `BirthProfileOut` so the eventual backend work is
   additive, not a rewrite.
2. **Real chart, placeholder persistence — not the reverse.** It would
   have been just as easy to fake the whole thing (a canned demo chart,
   no real API call) and ship a prettier-looking placeholder. That was
   rejected: the brief calls this "the user's First Reading," and a fake
   first reading undermines the exact trust this flow exists to build.
   The one placeholder is invisible to the user (where the chart is
   stored), not visible (what the chart says).
3. **Two-layer profile-existence enforcement.** `Login.jsx` and
   `OnboardingGate.jsx` both check `hasAnyProfile()` — not because one is
   unreliable, but because they answer different questions ("where does
   a fresh login go" vs. "is it ever valid to render `/home` without a
   profile or a skip"). Removing either weakens a different case: without
   the `Login.jsx` check, direct-from-OTP would need an extra redirect
   hop; without `OnboardingGate.jsx`, a bookmark or back-button visit to
   `/home` would silently render without ever having gone through the
   `Login.jsx` decision at all.
4. **Skip is its own flag, not "profile = null."** Conflating them would
   mean a skipped account gets shown onboarding again on every single
   visit — the opposite of graceful. They're tracked separately so
   `EmptyHomeState` (skipped) and "still needs onboarding" (never
   answered) are genuinely different, correctly-handled states.
5. **`birth_time_accuracy` as an honest first-class field.** Rather than
   silently defaulting to noon and presenting the resulting chart as if
   the time were exact, the accuracy travels with the profile and is
   surfaced wherever the chart appears. This was worth a field the
   backend doesn't have yet (see "Future backend integration points").

## Future backend integration points

- **`POST /api/account/astrology-profiles`** — create a profile scoped to
  the authenticated account (not by phone number). Body: everything
  `createProfile()` in `services/astrologyProfiles.js` already collects,
  plus `birth_time_accuracy` (new column — doesn't exist on
  `BirthProfileOut` today).
- **`GET /api/account/astrology-profiles`** (scoped to the authenticated
  account via its JWT, not a phone-number path param like today's
  `GET /api/account/birth-profiles/{phone_number}`) — replaces
  `listProfiles()`'s localStorage read.
- **A persisted `ChartResponse` per profile** — today's
  `BirthProfile` row has no chart data of its own; `/api/kundli` is
  recomputed from `birth_date`/`birth_time`/`place` each time. Either
  store the computed chart alongside the profile, or accept
  recomputation as the permanent design (it's fast and deterministic —
  arguably the simpler, more correct choice, since it means the chart is
  never stale relative to the ephemeris library version).
- Once either of the above exists, `services/astrologyProfiles.js` is
  the *only* file that changes — every component reading a profile
  already expects this exact shape.

## Future multi-profile support plan

Explicitly **not built** this sprint, per the brief — but the storage
shape already supports it without a schema change:

- **Add Profile**: literally another `createProfile()` call. The UI is
  the missing piece — most likely re-entering `Onboarding.jsx`'s
  `profileType → review` steps (skipping `welcome`, which is a
  first-time-only screen) with an "Add another profile" entry point from
  `/home` (e.g. a small affordance near `ChartPreviewCard`, or a profile
  switcher in `SiteHeader`/`AccountMenu`).
- **Switch Profile**: every profile already carries `is_primary`.
  "Switching" is choosing a different array element to be primary — a
  `setPrimaryProfile(user, profileId)` export in
  `services/astrologyProfiles.js`, plus a picker UI (a dropdown or
  list, likely surfaced from `AccountMenu.jsx` next to "My Home").
  `PersonalHome.jsx` already reads whichever profile
  `getPrimaryProfile()` returns, so no changes needed there once
  switching exists.
- **Delete/Archive Profile**: an `archiveProfile(user, profileId)` /
  `deleteProfile(user, profileId)` export, most likely surfaced from a
  future profile-management screen (an extension of `Profile.jsx`, or a
  dedicated `/profiles` page) rather than from `/home` itself.
- None of these have exports in `services/astrologyProfiles.js` yet — the
  brief was explicit about not implementing them, and stub functions
  with no caller would just be dead code. This section is where their
  design lives until then.

## Future AI onboarding evolution

- **Smarter place resolution.** `usePlaceSuggestions` already returns
  real Nominatim-backed suggestions; a future step could use an LLM to
  disambiguate genuinely ambiguous historical place names (a village
  renamed since a grandparent's birth, for instance) before geocoding.
- **A real first reading, not just a first chart.** Today, onboarding's
  "Generating..." step produces a `ChartResponse` and nothing else —
  the actual AI-generated Reading (`/kundli/reading`,
  `services/ai.py`'s `generate_reading`) isn't called. A natural next
  step is generating one short, personalized paragraph as part of
  onboarding's completion (shown briefly before landing on `/home`,
  where `Cosmic Snapshot`'s theme paragraph already has a
  `docs/PRODUCT_HOME.md`-documented future AI integration point waiting
  for exactly this).
- **Conversational data collection.** The six-question wizard could
  eventually be answerable in a single free-text sentence ("I was born
  in Jaipur on March 3rd 1994, early morning, not sure of the exact
  time") parsed by an LLM into the same `draft` shape `Onboarding.jsx`
  already builds one field at a time — the step components
  (`ProfileTypeSelector`, `BirthTimeSelector`, etc.) would still be
  useful as a confirmation/correction UI even if the primary input
  method changed.
