// frontend/src/config/auth.js
//
// Stub for the "ask for login" step between picking a topic on the landing
// page and reaching the birth-detail form. There's no real account system
// yet — see the Master Execution Plan's Phase 7 (Phone + OTP login). This
// always returns false (no login required) so nothing blocks the flow today.
// When that phase lands, this is the one function to change; every call
// site stays the same.

export function isLoginRequired() {
  return false
}
