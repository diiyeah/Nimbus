from fastapi import APIRouter, UploadFile, File, HTTPException
from ..models import ServiceRecord
from ..services.csv_parser import parse

router = APIRouter(prefix="/upload", tags=["upload"])

MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("", response_model=list[ServiceRecord])
async def upload_csv(file: UploadFile = File(...)):
    """
    Accept a CSV upload, parse and validate it,
    return the list of ServiceRecord rows.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()

    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 5 MB limit.")

    try:
        records = parse(contents)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return records
