from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from bson.errors import InvalidId
from db.mongo import get_analyses

router = APIRouter(prefix="/history", tags=["history"])


# ── Serialiser ────────────────────────────────────────────────────────────────
def _serialize(doc: dict) -> dict:
    """Convert MongoDB ObjectId and datetime to JSON-serialisable types."""
    doc["id"] = str(doc.pop("_id"))
    if "created_at" in doc and hasattr(doc["created_at"], "isoformat"):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc


def _parse_oid(analysis_id: str) -> ObjectId:
    """Parse a string into a MongoDB ObjectId, raise 400 on invalid format."""
    try:
        return ObjectId(analysis_id)
    except (InvalidId, Exception):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis ID '{analysis_id}'. Must be a 24-character hex string."
        )


# ── GET /history ──────────────────────────────────────────────────────────────
@router.get("")
async def get_history(
    limit: int  = Query(default=20, ge=1,  le=100,  description="Max number of results to return"),
    skip:  int  = Query(default=0,  ge=0,            description="Number of results to skip (pagination)"),
):
    """
    Return past analyses sorted by date descending (newest first).
    Raw billing rows are excluded to keep the response lightweight.
    Supports pagination via limit and skip query params.
    """
    try:
        cursor = (
            get_analyses()
            .find({}, {"rows": 0})          # exclude raw rows
            .sort("created_at", -1)         # newest first
            .skip(skip)
            .limit(limit)
        )
        docs = [_serialize(doc) for doc in cursor]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    return {
        "count":  len(docs),
        "skip":   skip,
        "limit":  limit,
        "results": docs,
    }


# ── GET /history/{id} ─────────────────────────────────────────────────────────
@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str):
    """
    Return a single analysis by its MongoDB ObjectId.
    Includes full billing rows and recommendations.
    """
    oid = _parse_oid(analysis_id)

    try:
        doc = get_analyses().find_one({"_id": oid})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis '{analysis_id}' not found."
        )

    return _serialize(doc)


# ── DELETE /history/{id} ──────────────────────────────────────────────────────
@router.delete("/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """
    Permanently delete a single analysis by its MongoDB ObjectId.
    Returns 404 if the analysis does not exist.
    """
    oid = _parse_oid(analysis_id)

    try:
        result = get_analyses().delete_one({"_id": oid})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis '{analysis_id}' not found."
        )

    return {
        "message": "Analysis deleted successfully.",
        "id": analysis_id,
    }
