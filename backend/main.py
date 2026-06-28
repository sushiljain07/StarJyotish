from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")
import os
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.kundli import router as kundli_router
from routers.career_report import router as career_router
from routers.rajyogas import router as rajyogas_router
from routers.topic_reports import router as topic_reports_router

app = FastAPI(title="Kundli API", version="1.0.0")

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