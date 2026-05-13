import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.collection import Collection
from pymongo.database import Database
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

# ── Lazy client — connects only when first used ───────────────────────────────
_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return _client


def get_db() -> Database:
    return get_client()["nimbusai"]


# ── Collection accessors ──────────────────────────────────────────────────────
@property
def analyses() -> Collection:
    return get_db()["analyses"]


@property
def users() -> Collection:
    return get_db()["users"]


# Expose as module-level callables for direct import
def get_analyses() -> Collection:
    return get_db()["analyses"]


def get_users() -> Collection:
    return get_db()["users"]


def ping() -> bool:
    """Return True if MongoDB is reachable, False otherwise."""
    try:
        get_client().admin.command("ping")
        return True
    except Exception:
        return False
