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
