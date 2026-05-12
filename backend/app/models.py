from pydantic import BaseModel, Field
from typing import Literal


class ServiceRecord(BaseModel):
    """A single cloud service billing row."""
    name: str
    cost: float
    usage: float  # utilisation percentage 0-100


class AnalysisRequest(BaseModel):
    """Payload sent by the frontend to trigger AI analysis."""
    rows: list[ServiceRecord]


class Recommendation(BaseModel):
    """A single AI-generated cost-saving recommendation."""
    service: str
    issue: str
    action: str
    saving: float
    severity: Literal["critical", "high", "medium", "low"]
    category: Literal["rightsizing", "reserved", "idle", "storage", "network", "architecture"]


class AnalysisResponse(BaseModel):
    """Full analysis result returned to the frontend."""
    recommendations: list[Recommendation]
    total_saving: float
    annual_saving: float
