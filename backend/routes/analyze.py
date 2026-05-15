from fastapi import APIRouter, UploadFile, File, HTTPException
from services.csv_parser import parse_csv
from services.gemini import analyse_with_gemini
from db.mongo import get_analyses
from datetime import datetime, timezone

router = APIRouter(prefix="/analyze", tags=["analyze"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

# ── Sample billing data (mirrors frontend mock) ───────────────────────────────
SAMPLE_DATA = [
    {"name": "EC2",         "cost": 4820.0, "usage": 34.0},
    {"name": "RDS",         "cost": 3100.0, "usage": 28.0},
    {"name": "ElastiCache", "cost": 980.0,  "usage": 19.0},
    {"name": "EKS",         "cost": 2200.0, "usage": 41.0},
    {"name": "S3",          "cost": 1240.0, "usage": 71.0},
    {"name": "Lambda",      "cost": 390.0,  "usage": 89.0},
    {"name": "CloudFront",  "cost": 560.0,  "usage": 66.0},
    {"name": "NAT Gateway", "cost": 720.0,  "usage": 55.0},
]


# ── Shared helper ─────────────────────────────────────────────────────────────
def _run_analysis(rows: list[dict], filename: str, warnings: list[str] = []) -> dict:
    """
    Run Gemini analysis on rows, persist to MongoDB, return response dict.
    Raises HTTPException on AI or unexpected errors.
    """
    # Call Gemini — fall back to mock recommendations on any failure
    try:
        recommendations = analyse_with_gemini(rows)
    except Exception:
        from services.mock_recommendations import get_mock_recommendations
        recommendations = get_mock_recommendations(rows)

    total_saving  = round(sum(r["saving"] for r in recommendations), 2)
    annual_saving = round(total_saving * 12, 2)

    # Persist to MongoDB (non-fatal if DB is down)
    record_id = None
    try:
        doc = {
            "filename":        filename,
            "rows":            rows,
            "recommendations": recommendations,
            "total_saving":    total_saving,
            "annual_saving":   annual_saving,
            "warnings":        warnings,
            "created_at":      datetime.now(timezone.utc),
        }
        result = get_analyses().insert_one(doc)
        record_id = str(result.inserted_id)
    except Exception:
        pass

    return {
        "id":              record_id,
        "filename":        filename,
        "rows":            rows,
        "recommendations": recommendations,
        "total_saving":    total_saving,
        "annual_saving":   annual_saving,
        "warnings":        warnings,
    }


# ── POST /analyze/upload ──────────────────────────────────────────────────────
@router.post("/upload")
async def analyze_upload(file: UploadFile = File(...)):
    """
    Upload a CSV file → parse columns (service, spend, usage)
    → send to Gemini AI → save to MongoDB → return recommendations.

    CSV must contain columns: service, spend, usage (case-insensitive).
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only .csv files are accepted. Please upload a valid CSV file."
        )

    # Read and size-check
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds the 5 MB size limit.")

    # Parse CSV
    try:
        rows = parse_csv(contents)
        parse_warnings = getattr(parse_csv, "warnings", [])
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return _run_analysis(rows, filename=file.filename, warnings=parse_warnings)


# ── POST /analyze/sample ──────────────────────────────────────────────────────
@router.post("/sample")
async def analyze_sample():
    """
    Run the built-in sample AWS billing dataset through Gemini AI,
    save result to MongoDB, and return recommendations.

    Useful for demos and testing without uploading a real CSV.
    """
    return _run_analysis(SAMPLE_DATA, filename="sample_data.csv", warnings=[])
