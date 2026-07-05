"""
Shared slowapi Limiter instance.

This lives in its own module (not main.py) so that route files can import
`limiter` directly without main.py importing routers importing main.py back
— that would be a circular import.

Limits are intentionally tiered:
  - LLM-backed endpoints (reading, ask, career/relationship/wealth reports)
    each cost real money per call (Claude/Groq/OpenRouter), so they get a
    tighter limit.
  - Pure-computation endpoints (kundli, transit, ashtakavarga, kp, divisional,
    rajyogas) are cheap Swiss Ephemeris math, so they get a looser limit —
    mainly to stop accidental hammering/abuse, not to ration compute.

Storage is in-memory (the slowapi/limits default), which is fine for a
single Railway instance. If this ever runs with multiple workers/replicas,
swap to Redis-backed storage (`Limiter(storage_uri="redis://...")`) so all
instances share one counter — worth doing at the same time Redis gets added
for the background-job queue in a later phase.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Reused across every route file so the actual numbers only live in one place.
LLM_LIMIT = "10/minute"
COMPUTE_LIMIT = "30/minute"

# OTP send is the one endpoint that costs real money per call (an SMS) and
# is the classic target for "spam someone else's phone" abuse, so it gets
# the tightest limit of any route in the app. Verify is looser since a
# legitimate user can plausibly mistype a code a couple of times.
OTP_SEND_LIMIT = "5/minute"
OTP_VERIFY_LIMIT = "10/minute"
AUTH_LIMIT = "20/minute"

# Place autocomplete: generous enough for normal typing (already debounced
# client-side), but capped so this backend stays within Nominatim's own
# "max 1 request/second" usage policy in aggregate per client.
PLACES_LIMIT = "60/minute"

# Contact form: costs a real email send (Resend) and has no legitimate
# reason to be submitted often by the same visitor, so it gets a tight,
# per-hour limit rather than per-minute — closer to OTP_SEND_LIMIT's
# "cheap to abuse, annoying if abused" profile than a compute endpoint's.
CONTACT_LIMIT = "5/hour"
