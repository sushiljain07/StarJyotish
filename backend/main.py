from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.kundli import router as kundli_router
from routers.career_report import router as career_router

app = FastAPI(title="Kundli API", version="1.0.0")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", ""),  # set this in Render backend env vars
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kundli_router, prefix="/api")
app.include_router(career_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
