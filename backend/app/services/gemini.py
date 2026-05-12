import json
import re
import google.generativeai as genai
from ..config import GEMINI_API_KEY
from ..models import ServiceRecord, Recommendation

genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-1.5-flash"


def _build_prompt(rows: list[ServiceRecord]) -> str:
    table = "\n".join(
        f"- {r.name}: ${r.cost:.2f} spend, {r.usage:.1f}% utilisation"
        for r in rows
    )
    return f"""You are a cloud cost optimisation expert. Analyse the following AWS billing data.

BILLING DATA:
{table}

Return ONLY a valid JSON array — no markdown, no explanation, no code fences.
Each element must have exactly these fields:
  "service"  – AWS service name (string)
  "issue"    – concise problem description (string, ≤15 words)
  "action"   – recommended fix (string, ≤20 words)
  "saving"   – estimated monthly saving in USD (number)
  "severity" – one of: "critical" | "high" | "medium" | "low"
  "category" – one of: "rightsizing" | "reserved" | "idle" | "storage" | "network" | "architecture"

One entry per service with a meaningful optimisation. Sort by saving descending."""


def analyse(rows: list[ServiceRecord]) -> list[Recommendation]:
    """Call Gemini and return parsed recommendations."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in environment.")

    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(_build_prompt(rows))
    raw = response.text.strip()

    # Strip accidental markdown fences
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*```\s*$", "", raw)

    data = json.loads(raw)
    if not isinstance(data, list):
        raise ValueError("Gemini returned a non-array response.")

    VALID_SEVERITIES = {"critical", "high", "medium", "low"}
    VALID_CATEGORIES = {"rightsizing", "reserved", "idle", "storage", "network", "architecture"}

    recommendations = []
    for item in data:
        recommendations.append(Recommendation(
            service=str(item.get("service", "")),
            issue=str(item.get("issue", "")),
            action=str(item.get("action", "")),
            saving=float(item.get("saving", 0)),
            severity=item.get("severity", "low") if item.get("severity") in VALID_SEVERITIES else "low",
            category=item.get("category", "architecture") if item.get("category") in VALID_CATEGORIES else "architecture",
        ))

    return recommendations
