from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import ALLOWED_ORIGINS
from .routers import health, upload, analyse

app = FastAPI(
    title="NimbusAI API",
    description="Cloud cost intelligence backend — CSV ingestion, Gemini AI analysis, MongoDB persistence.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────
app.include_router(health.router)
app.include_router(upload.router)
app.include_router(analyse.router)


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "NimbusAI API is running. Visit /docs for the interactive API reference."}
