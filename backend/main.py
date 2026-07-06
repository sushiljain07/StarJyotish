from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")
import os
import re
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from services.rate_limit import limiter
from services.security_headers import SecurityHeadersMiddleware
from services.monitoring import init_sentry
from routes.kundli import router as kundli_router
from routers.career_report import router as career_router
from routers.rajyogas import router as rajyogas_router
from routers.topic_reports import router as topic_reports_router
from routers.account import router as account_router
from routers.auth import router as auth_router
from routers.places import router as places_router
from routers.admin import router as admin_router
from routers.astrologer import router as astrologer_router
from routers.testimonials import router as testimonials_router
from routers.panchang import router as panchang_router
from routers.contact import router as contact_router
from routers.daily_editor import router as daily_editor_router

init_sentry()

app = FastAPI(title="Kundli API", version="1.0.0")

# Rate limiting (cost control) — see services/rate_limit.py for the limiter
# and the per-endpoint limits used by each router.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RuntimeError)
def db_not_configured_handler(request: Request, exc: RuntimeError):
    # db/session.py's get_db() raises plain RuntimeError when DATABASE_URL
    # isn't set, for the handful of endpoints (routers/account.py) that are
    # meaningless without persistence. Surfacing this as a clean 503 rather
    # than an unhandled 500 makes "Postgres isn't provisioned yet" obvious
    # in the response instead of looking like a server bug.
    if "DATABASE_URL is not configured" in str(exc):
        return JSONResponse(status_code=503, content={"detail": str(exc)})
    raise exc


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# FRONTEND_URL can hold one or more comma-separated domains
frontend_urls = os.getenv("FRONTEND_URL", "")
for raw in frontend_urls.split(","):
    domain = raw.strip().rstrip("/")
    domain = re.sub(r"^https?://", "", domain, flags=re.IGNORECASE)
    if domain:
        ALLOWED_ORIGINS.append(f"https://{domain}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Added last so it wraps everything else (CORS, rate limiting, route
# handlers) and still stamps headers on error responses from any of them.
app.add_middleware(SecurityHeadersMiddleware)

app.include_router(kundli_router, prefix="/api")
app.include_router(career_router, prefix="/api")
app.include_router(rajyogas_router, prefix="/api")
app.include_router(topic_reports_router, prefix="/api")
app.include_router(account_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(places_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(astrologer_router, prefix="/api")
app.include_router(testimonials_router, prefix="/api")
app.include_router(panchang_router, prefix="/api")
app.include_router(contact_router, prefix="/api")
app.include_router(daily_editor_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/db")
def health_db():
    # Deliberately separate from /health above: that one reports the API
    # process is up, this one reports Postgres specifically is reachable —
    # useful right after a Railway deploy to confirm DATABASE_URL/the
    # Postgres plugin are wired correctly before anything else depends on it.
    from sqlalchemy import text
    from db.session import SessionLocal, is_db_configured

    if not is_db_configured():
        return JSONResponse(status_code=503, content={"database": "not_configured"})
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"database": "connected"}
    except Exception as e:
        return JSONResponse(status_code=503, content={"database": "error", "detail": str(e)})