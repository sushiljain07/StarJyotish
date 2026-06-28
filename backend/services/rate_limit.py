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
