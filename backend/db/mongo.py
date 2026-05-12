import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.collection import Collection
from pymongo.database import Database
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

# ── Client & database ─────────────────────────────────────────────────────────
_client: MongoClient = MongoClient(MONGODB_URI)
db: Database = _client["nimbusai"]

# ── Collections ───────────────────────────────────────────────────────────────
analyses: Collection = db["analyses"]
users: Collection    = db["users"]

# ── Indexes (created once on startup, ignored if already exist) ───────────────
# analyses: sort by created_at descending for history queries
analyses.create_index([("created_at", DESCENDING)], name="analyses_created_at")

# users: unique email index for login/signup
users.create_index([("email", ASCENDING)], unique=True, name="users_email_unique")


def ping() -> bool:
    """Return True if MongoDB is reachable, False otherwise."""
    try:
        _client.admin.command("ping")
        return True
    except Exception:
        return False
