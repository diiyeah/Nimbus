from fastapi import APIRouter, HTTPException
from ..models import AnalysisRequest, AnalysisResponse
from ..services import gemini
from ..database import get_db

router = APIRouter(prefix="/analyse", tags=["analyse"])


@router.post("", response_model=AnalysisResponse)
async def analyse_billing(payload: AnalysisRequest):
    """
    Accept billing rows, call Gemini for recommendations,
    persist result to MongoDB, return analysis.
    """
    if not payload.rows:
        raise HTTPException(status_code=400, detail="No billing rows provided.")

    try:
        recommendations = gemini.analyse(payload.rows)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    total_saving = sum(r.saving for r in recommendations)
    annual_saving = total_saving * 12

    # Persist to MongoDB (fire-and-forget — don't fail the request if DB is down)
    try:
        db = get_db()
        db["analyses"].insert_one({
            "rows": [r.model_dump() for r in payload.rows],
            "recommendations": [r.model_dump() for r in recommendations],
            "total_saving": total_saving,
            "annual_saving": annual_saving,
        })
    except Exception:
        pass  # DB write failure is non-fatal

    return AnalysisResponse(
        recommendations=recommendations,
        total_saving=total_saving,
        annual_saving=annual_saving,
    )
