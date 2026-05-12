from fastapi import APIRouter
from ..database import get_client

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    """Liveness check — also pings MongoDB."""
    db_ok = False
    try:
        get_client().admin.command("ping")
        db_ok = True
    except Exception:
        pass

    return {"status": "ok", "db": "connected" if db_ok else "unreachable"}
