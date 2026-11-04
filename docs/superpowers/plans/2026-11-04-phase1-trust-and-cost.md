# Phase 1: Trust and Cost Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop invisible AI calls and remove UI that tells users untrue things: unsaved language choice, paid plans that don't exist, a WhatsApp alert nothing sends.

**Architecture:** Four independent frontend-only changes, one commit each, on branch `fix/phase1-trust-and-cost` off `main`, then one PR to `main`. No backend changes.

**Tech Stack:** React 18, react-router 7, i18next/react-i18next, Vitest + Testing Library (jsdom), Tailwind 3.

**Spec:** `docs/superpowers/plans/2026-11-04-frontend-ux-roadmap.md`, Phase 1 (findings P-H1–H5, N-M3, I-1).

## Global Constraints

- All new user-visible text goes through `t()`, with keys added to **both** `src/i18n/en.json` and `src/i18n/hi.json`.
- Every `localStorage` access is wrapped in try/catch.
- Commit author must be `sushiljain07@gmail.com` (already set repo-locally). End commit messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Gate before each commit: from `frontend/`, `npx vitest run` is all green and `npx eslint <changed files>` reports 0 errors.
- Keep the Kundli two-level navigation untouched.
- Run `graphify update .` from the repo root after the code changes.

## Review Focus

1. **Storage blocked entirely.** If `localStorage` throws, the app should still render in English and the language toggle should still work for the session. Pinned in Task 1.
2. **Unsupported saved value.** A saved `kundli_lang` of `"fr"` should fall back to English, not render raw keys. Pinned in Task 1.
3. **Coming back to the career tab.** Opening the Career sub-tab, switching to Reading and back must not mount CareerReportTab again. A remount re-runs its auto-generate and costs a second LLM call. Pinned in Task 2.
4. **The admin `pricing_plans` setting is still populated.** The Early Access page must ignore it and never fetch `/api/settings/public`. Pinned in Task 3.
5. **Old WhatsApp numbers on users' devices.** Numbers saved by the old opt-in must be deleted on app start. Pinned in Task 4.

---

### Task 1: Save the language choice and guard the startup storage read

**Files:**
- Modify: `frontend/src/i18n/index.js` (lines 6–17 and the `languageChanged` handler)
- Test: `frontend/src/i18n/index.test.js` (create)

**Interfaces:**
- Produces: `LANG_STORAGE_KEY = 'kundli_lang'` and `SUPPORTED_LANGS = ['en', 'hi']`, both exported from `src/i18n/index.js`. Phase 3's header toggle will import them.

- [ ] **Step 1: Write the failing tests** in `src/i18n/index.test.js`. Use `vi.resetModules()` and a dynamic `await import('./index')` in each test so module start-up runs fresh.

```js
it('saves the language when it changes', async () => {
  const { default: i18n } = await import('./index')
  await i18n.changeLanguage('hi')
  expect(localStorage.getItem('kundli_lang')).toBe('hi')
})
it('starts in the saved language', async () => {
  localStorage.setItem('kundli_lang', 'hi')
  const { default: i18n } = await import('./index')
  expect(i18n.language).toBe('hi')
})
it('falls back to English for an unsupported saved value', async () => {
  localStorage.setItem('kundli_lang', 'fr')
  const { default: i18n } = await import('./index')
  expect(i18n.language).toBe('en')
})
it('still loads when storage throws', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  const { default: i18n } = await import('./index')
  expect(i18n.language).toBe('en')
  await expect(i18n.changeLanguage('hi')).resolves.toBeDefined()
})
```

Call `vi.restoreAllMocks()` in `afterEach`.

- [ ] **Step 2: Run to verify they fail.** Run `npx vitest run src/i18n/index.test.js`. Expected: "saves the language" FAILS (null), "unsupported value" FAILS (`fr`), "storage throws" FAILS (import throws).

- [ ] **Step 3: Implement in `src/i18n/index.js`.**
  - Add `readSavedLang()`: a try/catch read that returns the value only when it's in `SUPPORTED_LANGS`, otherwise `'en'`.
  - Use it for `lng`.
  - In the existing `i18n.on('languageChanged', …)`, also write `LANG_STORAGE_KEY` inside try/catch. Keep `syncHtmlLang`.
  - Update the stale comment that mentions "LanguageToggle.jsx/header toggles".

- [ ] **Step 4: Run to verify they pass.** Run `npx vitest run src/i18n/index.test.js`. Expected: 4 passed. Then run `npx vitest run`: all green, since other tests import `../i18n`.

- [ ] **Step 5: Commit** with the message `Save the language choice and survive blocked storage`.

---

### Task 2: Generate the career report only on the career topic, and only when its tab is opened

**Files:**
- Modify: `frontend/src/pages/Insights.jsx:44` (state) and `:84-86` (the CareerReportTab mount)
- Test: `frontend/src/pages/Insights.test.jsx` (create)

**Interfaces:**
- Consumes: `buildSubtabs(t, topicId)` (unchanged). The Career sub-tab id is `'career'` and its label is the literal `'Career'`.
- Produces: nothing new.

- [ ] **Step 1: Write the failing tests.**
  - Mock the four lazy children. Each mock renders a marker and counts its mounts in a `useEffect(() => { mounts[name]++ }, [])`. Mock `ChartReading`, `RajyogasTab`, `CareerReportTab` and `TopicReportTab`.
  - Mock `useAuth` as `{ isAuthenticated: true }` and `Seo` as `() => null`.
  - Render `<Insights/>` in a `MemoryRouter` with `state: { input: { date:'1990-01-01', time:'12:00', place:'Delhi', topic } }`.

```js
it('never mounts the career report on a non-career topic', async () => {
  renderInsights('relationship')
  await screen.findByText('READING')
  expect(mounts.CareerReportTab).toBe(0)
})
it('mounts the career report only when its tab is opened', async () => {
  renderInsights('career')
  await screen.findByText('READING')
  expect(mounts.CareerReportTab).toBe(0)
  fireEvent.click(screen.getByRole('button', { name: 'Career' }))
  expect(await screen.findByText('CAREER')).toBeInTheDocument()
  expect(mounts.CareerReportTab).toBe(1)
})
it('keeps the career report mounted when switching away and back', async () => {
  renderInsights('career')
  fireEvent.click(await screen.findByRole('button', { name: 'Career' }))
  await screen.findByText('CAREER')
  fireEvent.click(screen.getByRole('button', { name: /reading/i }))
  fireEvent.click(screen.getByRole('button', { name: 'Career' }))
  expect(mounts.CareerReportTab).toBe(1)
})
```

  AnimatedTabRow renders each tab as a `<button>` (`AnimatedTabRow.jsx:83`).

- [ ] **Step 2: Run to verify they fail.** Run `npx vitest run src/pages/Insights.test.jsx`. Expected: tests 1 and 2 FAIL, because CareerReportTab mounts on render.

- [ ] **Step 3: Implement in `Insights.jsx`.**
  - Add `const [careerOpened, setCareerOpened] = useState(false)` next to `activeSub`.
  - Wrap `setActiveSub` passed to AnimatedTabRow so selecting `'career'` also sets `careerOpened`.
  - Render the CareerReportTab block only when `topicId === 'career' && careerOpened`. Keep its `hidden` class toggling so it stays mounted after the first open.
  - Leave ChartReading, RajyogasTab and TopicReportTab as they are.

- [ ] **Step 4: Run to verify they pass.** Run `npx vitest run src/pages/Insights.test.jsx`. Expected: 3 passed. Then `npx vitest run`: all green.

- [ ] **Step 5: Commit** with the message `Stop generating a hidden career report on every Insights visit`.

---

### Task 3: Replace Pricing with an "Early access: everything free" page

**Files:**
- Modify (rewrite): `frontend/src/pages/Pricing.jsx`. The route stays `/pricing` so existing links and the sitemap entry keep working.
- Modify: `frontend/src/config/nav.js:24` (label key), `frontend/src/components/Footer.jsx:94` (label key)
- Modify: `frontend/src/i18n/en.json`, `frontend/src/i18n/hi.json`. Delete `pricing_billing_*`, `pricing_annual_save`, `pricing_cta_start` and `pricing_faq_q2/a2/q3/a3/q5/a5`; add the keys below.
- Test: `frontend/src/pages/Pricing.test.jsx` (create)

**Interfaces:**
- Consumes: `SiteHeader`, `Footer`, `Seo`, `FAQAccordion` and `Reveal` exactly as today's Pricing.jsx uses them.
- Produces: i18n keys `nav_early_access` and `early_access_*` (listed below).

**Copy** (exact English; the owner reviews the Hindi in the PR):

| key | en | hi |
|---|---|---|
| `nav_early_access` | Free Access | मुफ़्त एक्सेस |
| `early_access_eyebrow` | Early access | अर्ली एक्सेस |
| `early_access_heading` | Everything is free during early access | अर्ली एक्सेस में सब कुछ मुफ़्त है |
| `early_access_subhead` | No plans, no card, no hidden limits on your chart. Use every feature while we build Star Jyotish with you. | कोई प्लान नहीं, कोई कार्ड नहीं, आपकी कुंडली पर कोई छिपी सीमा नहीं। जब तक हम आपके साथ Star Jyotish बना रहे हैं, हर सुविधा का उपयोग करें। |
| `early_access_included_heading` | What's included | इसमें क्या शामिल है |
| `early_access_item_kundli` | Full Kundli with all 16 divisional charts, Dasha timeline and Ashtakavarga | सभी 16 वर्ग चार्ट, दशा समयरेखा और अष्टकवर्ग के साथ पूरी कुंडली |
| `early_access_item_reading` | Your AI reading, plus Career, Relationship, Wealth and Health reports | आपका AI फलादेश, साथ में करियर, संबंध, धन और स्वास्थ्य रिपोर्ट |
| `early_access_item_ask` | Ask your chart: 5 questions per conversation | अपनी कुंडली से पूछें: हर बातचीत में 5 प्रश्न |
| `early_access_item_panchang` | Daily Panchang and the Knowledge Center | दैनिक पंचांग और ज्ञान केंद्र |
| `early_access_cta` | Generate my free Kundli | मेरी मुफ़्त कुंडली बनाएं |
| `early_access_faq_q1` | Is it really free? | क्या यह सच में मुफ़्त है? |
| `early_access_faq_a1` | Yes. Every feature listed above is free during early access, with no card or payment details. | हाँ। ऊपर बताई गई हर सुविधा अर्ली एक्सेस में मुफ़्त है, बिना कार्ड या भुगतान विवरण के। |
| `early_access_faq_q2` | Will there be paid plans later? | क्या बाद में पेड प्लान आएंगे? |
| `early_access_faq_a2` | We may add optional paid features in future. We'll announce them on this page before they launch. | भविष्य में हम वैकल्पिक पेड सुविधाएँ जोड़ सकते हैं। लॉन्च से पहले हम इसी पेज पर इसकी घोषणा करेंगे। |

Keep `pricing_faq_q4/a4` (privacy) as FAQ item 3.

- [ ] **Step 1: Write the failing tests.** Mock `useAuth` (`{ isAuthenticated: false, user: null }`) and stub `fetch` with `vi.fn()`. Render `<Pricing/>` in a `MemoryRouter`.

```js
it('shows the early-access offer with no prices', () => {
  const { container } = renderPricing()
  expect(screen.getByRole('heading', { level: 1, name: en.early_access_heading })).toBeInTheDocument()
  expect(container.textContent).not.toMatch(/₹|\/month|Razorpay/)
})
it('does not read admin pricing plans', () => {
  renderPricing()
  expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/api/settings/public'))
})
it('CTA goes to /generate', () => {
  renderPricing()
  expect(screen.getByRole('link', { name: en.early_access_cta })).toHaveAttribute('href', '/generate')
})
it('renders in Hindi', async () => {
  await i18n.changeLanguage('hi')
  renderPricing()
  expect(screen.getByRole('heading', { level: 1, name: hi.early_access_heading })).toBeInTheDocument()
  await i18n.changeLanguage('en')
})
```

- [ ] **Step 2: Run to verify they fail.** Run `npx vitest run src/pages/Pricing.test.jsx`. Expected: FAIL (no such heading; ₹ present; fetch called).

- [ ] **Step 3: Implement the rewrite.**
  - Remove `FALLBACK_PLANS`, `PlanCard`, the billing toggle and the settings fetch.
  - Layout: the night hero (eyebrow, h1, subhead), then a single `<Card>` from `components/ui` listing the four `early_access_item_*` entries with the existing `CheckIcon`, then a primary CTA `<Link to="/generate">`, then `FAQAccordion` with the 3 items.
  - Use `<Seo title={t('early_access_heading')} … path="/pricing" />`. Pass no "— Star Jyotish" suffix, because Seo adds it.
  - In `nav.js` and `Footer.jsx`, switch the label to `nav_early_access`. Leave the admin "Pricing Plans" tab alone; it edits a setting nothing reads now and goes away when billing is built.

- [ ] **Step 4: Run to verify they pass.** Run `npx vitest run src/pages/Pricing.test.jsx`: 4 passed. Then `npx vitest run`: all green. Also `grep -rn "pricing_billing\|pricing_cta_start\|pricing_faq_q[235]" src` should return nothing.

- [ ] **Step 5: Commit** with the message `Replace paid plans with an early-access, everything-free page`.

---

### Task 4: Remove the WhatsApp opt-in

**Files:**
- Modify: `frontend/src/components/ChartReading.jsx`. Remove `showWa`, `waNumber`, `waSubmitted` (`:54-58`), `setShowWa(false)` (`:64`), the `setTimeout(() => setShowWa(true)…)` (`:93`), `handleWaSubmit` (`:117-129`) and the "WHATSAPP LEAD CAPTURE" block (about `:262-300`).
- Modify: `frontend/src/pages/PrivacyPolicy.jsx`. Remove the WhatsApp paragraph (`:88-92`), the `<li>` at `:146`, and "and any saved WhatsApp number on that device" at `:150`.
- Modify: `frontend/src/main.jsx`. One-time cleanup before render.
- Test: `frontend/src/components/aiRetry.test.jsx` (add a case; it already renders ChartReading with fetch mocked)

**Interfaces:**
- Consumes: the `ok()`/`fetchMock` helpers already in `aiRetry.test.jsx`.

- [ ] **Step 1: Write the failing tests** in `aiRetry.test.jsx`.

```js
it('a finished reading never asks for a WhatsApp number', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  fetchMock.mockResolvedValueOnce(ok({ prediction_sections: { 'Career & Wealth': 'Good.' } }))
  render(<ChartReading input={INPUT} />)
  await screen.findByText('Good.')
  await vi.advanceTimersByTimeAsync(5000)
  expect(screen.queryByPlaceholderText(/whatsapp/i)).toBeNull()
  expect(screen.queryByText(/whatsapp/i)).toBeNull()
  vi.useRealTimers()
})
```

  Also add `src/legacyCleanup.test.js`. Set `localStorage.setItem('starjyotish_wa', '{"number":"9"}')`, call `removeLegacyStorage()`, and expect `getItem('starjyotish_wa')` to be `null`.

- [ ] **Step 2: Run to verify they fail.** Run `npx vitest run src/components/aiRetry.test.jsx src/legacyCleanup.test.js`. Expected: the WhatsApp text is found; `removeLegacyStorage` is not defined.

- [ ] **Step 3: Implement.**
  - Delete the code listed under Files.
  - Create `src/legacyCleanup.js` exporting `removeLegacyStorage()`, which runs a try/catch `localStorage.removeItem('starjyotish_wa')`. Call it in `main.jsx` before `createRoot`.
  - In ChartReading, keep the staggered section reveal; only the WhatsApp timer goes.

- [ ] **Step 4: Run to verify they pass.** Run `npx vitest run`: all green. Also `grep -rn "starjyotish_wa\|waNumber\|WHATSAPP LEAD" src` should match only `legacyCleanup.js` and its test.

- [ ] **Step 5: Commit** with the message `Remove the WhatsApp opt-in that nothing delivered`.

---

### Task 5: Verify and ship

- [ ] **Step 1:** From `frontend/`, run `npx vitest run && npx vite build`. Expected: all tests pass and the build succeeds. From `backend/`, run `.venv/bin/pytest -q`. Expected: still green; nothing in the backend changed.
- [ ] **Step 2:** Run `npx vite preview`, then use playwright-core with `/usr/bin/google-chrome`, the same approach as the review screenshots, to load `/pricing` at 390px and 1440px in EN and HI. Expected: no ₹, the CTA is visible, and the Hindi heading is in Devanagari.
- [ ] **Step 3:** Push the branch and open a PR to `main` titled "Phase 1: trust and cost fixes". In the body, list the four changes and flag the Hindi copy in Task 3 for the owner's review.
