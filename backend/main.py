from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")
import os
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from services.rate_limit import limiter
from routes.kundli import router as kundli_router
from routers.career_report import router as career_router
from routers.rajyogas import router as rajyogas_router
from routers.topic_reports import router as topic_reports_router

app = FastAPI(title="Kundli API", version="1.0.0")

# Rate limiting (cost control) — see services/rate_limit.py for the limiter
# and the per-endpoint limits used by each router.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

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

app.include_router(kundli_router, prefix="/api")
app.include_router(career_router, prefix="/api")
app.include_router(rajyogas_router, prefix="/api")
app.include_router(topic_reports_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}