from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.kundli import router as kundli_router

app = FastAPI(title="Kundli API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kundli_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
