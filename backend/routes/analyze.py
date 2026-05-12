from fastapi import APIRouter, UploadFile, File, HTTPException
from services.csv_parser import parse_csv
from services.gemini import analyse_with_gemini
from db.mongo import get_db
from datetime import datetime, timezone

router = APIRouter(prefix="/analyze", tags=["analyze"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("")
async def analyze(file: UploadFile = File(...)):
    """
    Upload a CSV file → parse → Gemini AI analysis → save to MongoDB → return results.
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 5 MB limit.")

    # Parse CSV
    try:
        rows = parse_csv(contents)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Gemini analysis
    try:
        recommendations = analyse_with_gemini(rows)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    total_saving  = sum(r["saving"] for r in recommendations)
    annual_saving = total_saving * 12

    # Persist to MongoDB
    record = {
        "filename":        file.filename,
        "rows":            rows,
        "recommendations": recommendations,
        "total_saving":    total_saving,
        "annual_saving":   annual_saving,
        "created_at":      datetime.now(timezone.utc),
    }

    try:
        db = get_db()
        result = db["analyses"].insert_one(record)
        record_id = str(result.inserted_id)
    except Exception:
        record_id = None  # DB failure is non-fatal

    return {
        "id":              record_id,
        "rows":            rows,
        "recommendations": recommendations,
        "total_saving":    total_saving,
        "annual_saving":   annual_saving,
    }
