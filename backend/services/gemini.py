import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

MODEL_NAME = "gemini-1.5-flash"

VALID_SEVERITIES = {"critical", "high", "medium", "low"}
VALID_CATEGORIES = {"rightsizing", "reserved", "idle", "storage", "network", "architecture"}


def _build_prompt(rows: list[dict]) -> str:
    table = "\n".join(
        f"- {r['name']}: ${r['cost']:.2f} spend, {r['usage']:.1f}% utilisation"
        for r in rows
    )
    return f"""You are a cloud cost optimisation expert. Analyse the following AWS billing data.

BILLING DATA:
{table}

Return ONLY a valid JSON array — no markdown, no explanation, no code fences.
Each element must have exactly these fields:
  "service"  – AWS service name (string)
  "issue"    – concise problem description (string, max 15 words)
  "action"   – recommended fix (string, max 20 words)
  "saving"   – estimated monthly saving in USD (number)
  "severity" – one of: "critical" | "high" | "medium" | "low"
  "category" – one of: "rightsizing" | "reserved" | "idle" | "storage" | "network" | "architecture"

Produce one entry per service with a meaningful optimisation opportunity.
Sort by saving descending."""


def analyse_with_gemini(rows: list[dict]) -> list[dict]:
    """
    Send billing rows to Gemini and return parsed recommendations.
    Raises ValueError on bad API key or unparseable response.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in .env")

    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(_build_prompt(rows))
    raw = response.text.strip()

    # Strip accidental markdown fences
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*```\s*$", "", raw)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\n\nRaw: {raw[:300]}")

    if not isinstance(data, list):
        raise ValueError("Gemini response was not a JSON array.")

    # Normalise and validate each item
    result = []
    for item in data:
        result.append({
            "service":  str(item.get("service", "")),
            "issue":    str(item.get("issue", "")),
            "action":   str(item.get("action", "")),
            "saving":   float(item.get("saving", 0)),
            "severity": item.get("severity") if item.get("severity") in VALID_SEVERITIES else "low",
            "category": item.get("category") if item.get("category") in VALID_CATEGORIES else "architecture",
        })

    return result
