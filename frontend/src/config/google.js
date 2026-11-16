// Empty string rather than throwing when unset, so the app still boots
// for local dev before Google Cloud credentials exist (see
// frontend/.env.example). Without an id Google Identity Services is not
// loaded at all: no provider, no button, no "or" divider on /login.
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
export const GOOGLE_ENABLED = GOOGLE_CLIENT_ID !== ''
