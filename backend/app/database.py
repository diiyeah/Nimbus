from pymongo import MongoClient
from pymongo.database import Database
from .config import MONGO_URI

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
    return _client


def get_db() -> Database:
    return get_client()["nimbusai"]
