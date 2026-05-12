import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.analyze import router as analyze_router
from routes.history import router as history_router

load_dotenv()

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173"
).split(",")

app = FastAPI(
    title="NimbusAI API",
    description="Cloud cost intelligence — CSV upload, Gemini AI analysis, MongoDB history.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(analyze_router)
app.include_router(history_router)


@app.get("/health", tags=["health"])
async def health():
    """Liveness check."""
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "NimbusAI API running. Visit /docs for the API reference."}
