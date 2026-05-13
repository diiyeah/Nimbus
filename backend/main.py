import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.analyze import router as analyze_router
from routes.history import router as history_router
from db.mongo import ping

load_dotenv()

# ── CORS origins ──────────────────────────────────────────────────────────────
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# Always include localhost:5173 for local frontend dev
if "http://localhost:5173" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("http://localhost:5173")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NimbusAI API",
    description=(
        "Cloud cost intelligence backend. "
        "Upload billing CSVs, get Gemini AI recommendations, "
        "and browse analysis history."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS middleware ───────────────────────────────────────────────────────────
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

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["health"])
async def root():
    """Root health check — confirms the API is running."""
    return {
        "status": "ok",
        "message": "NimbusAI API is running.",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
async def health():
    """
    Detailed health check.
    Pings MongoDB and reports connection status.
    """
    db_status = "connected" if ping() else "unreachable"
    return {
        "status": "ok",
        "db":     db_status,
        "version": "1.0.0",
    }
