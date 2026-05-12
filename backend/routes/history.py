from fastapi import APIRouter, HTTPException, Query
from db.mongo import analyses
from bson import ObjectId

router = APIRouter(prefix="/history", tags=["history"])


def _serialize(doc: dict) -> dict:
    """Convert MongoDB ObjectId and datetime to JSON-serialisable types."""
    doc["id"] = str(doc.pop("_id"))
    if "created_at" in doc:
        doc["created_at"] = doc["created_at"].isoformat()
    return doc


@router.get("")
async def get_history(limit: int = Query(default=10, ge=1, le=100)):
    """Return the most recent analyses, newest first."""
    try:
        docs = list(
            analyses
            .find({}, {"rows": 0})
            .sort("created_at", -1)
            .limit(limit)
        )
        return [_serialize(d) for d in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Return a single analysis by its MongoDB ObjectId."""
    try:
        oid = ObjectId(analysis_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid analysis ID format.")

    try:
        doc = analyses.find_one({"_id": oid})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    return _serialize(doc)


@router.delete("/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """Delete a single analysis by ID."""
    try:
        oid = ObjectId(analysis_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid analysis ID format.")

    try:
        result = analyses.delete_one({"_id": oid})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    return {"message": "Deleted successfully."}
