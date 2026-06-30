// frontend/src/config/auth.js
//
// Real phone-OTP + Google login now exists (see contexts/AuthContext.jsx,
// pages/Login.jsx, components/ProtectedRoute.jsx) — this is no longer a
// stub with a hardcoded answer. What it controls is a *product* decision,
// not a technical one: should picking a topic on the landing page force a
// login first? That's independent of whether login itself works, so it
// stays a separate, deliberately-defaulted-off flag rather than being
// removed now that the underlying system is real.
//
// Defaults to false (today's fully-open behavior, matching every existing
// call site's expectation) until you're ready to require accounts before
// generating a chart — flip it with VITE_LOGIN_REQUIRED=true in
// frontend/.env (or the Vercel project's env vars for production), no
// code changes needed at any call site.

export function isLoginRequired() {
  return import.meta.env.VITE_LOGIN_REQUIRED === 'true'
}

// ── "Your first free Kundli" gate ────────────────────────────────────
//
// The landing page's copy ("No signup needed for your first free
// Kundli") implies a real limit — generate one for free, log in for any
// more. Until now nothing actually enforced that; isLoginRequired() above
// is a single global on/off switch with no concept of "first" anything.
//
// This is a *soft*, client-side-only gate: a flag in this browser's
// localStorage, set once Home.jsx confirms a generic (no-topic) Kundli
// actually generated successfully for a signed-out visitor (see
// markFreeKundliUsed()'s call site), and checked here before letting
// Landing.jsx's primary CTA skip straight to /generate a second time.
//
// What this does NOT do: stop someone who clears their browser storage,
// opens an incognito window, or uses a different browser/device — there's
// no server-side concept of "this visitor already used their free one"
// behind this, only a local flag. That's a deliberate scope choice for a
// pre-revenue product testing the funnel, not an oversight — a real
// enforcement boundary (IP/device fingerprinting, or simply requiring
// login before generating anything at all) is a bigger decision with its
// own tradeoffs and should be made deliberately, not slipped in as a
// side effect of a UI bug-fix pass.
const FREE_KUNDLI_STORAGE_KEY = 'sj_free_kundli_used'

export function hasUsedFreeKundli() {
  try {
    return localStorage.getItem(FREE_KUNDLI_STORAGE_KEY) === '1'
  } catch {
    // Storage can throw in some private-browsing modes — fail open
    // (treat as "not used yet") rather than blocking the whole flow
    // over a read that doesn't actually matter much either way.
    return false
  }
}

export function markFreeKundliUsed() {
  try {
    localStorage.setItem(FREE_KUNDLI_STORAGE_KEY, '1')
  } catch {
    // Same as above — if storage isn't available, the gate simply never
    // engages for this visitor. Not ideal, but not worth surfacing an
    // error over.
  }
}
