"""
Sentry error monitoring — opt-in, same "degrade gracefully without optional
config" pattern used elsewhere in this backend (no OTP provider key -> OTP
logs to console instead of erroring; no GOOGLE_CLIENT_ID -> Google button
just doesn't work rather than the app failing to boot).

With SENTRY_DSN unset, init_sentry() is a no-op — nothing installs, nothing
imports at request time, zero behavior change. Set SENTRY_DSN (from your
Sentry project's Settings -> Client Keys) to turn it on in any environment,
including local dev if you want to test it.
"""
import os


def init_sentry() -> None:
    dsn = os.getenv("SENTRY_DSN", "").strip()
    if not dsn:
        return

    import sentry_sdk

    sentry_sdk.init(
        dsn=dsn,
        environment=os.getenv("SENTRY_ENVIRONMENT", "production"),
        # Traces/profiles cost quota on Sentry's free tier and aren't needed
        # to get the core value here (exception capture). Start at 0 and
        # raise later if you specifically want performance tracing too.
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0")),
        send_default_pii=False,
    )
