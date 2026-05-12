import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ── Configure Gemini client ───────────────────────────────────────────────────
_API_KEY = os.getenv("GEMINI_API_KEY", "")
if _API_KEY:
    genai.configure(api_key=_API_KEY)

MODEL_NAME = "gemini-1.5-flash"

# ── Allowed enum values ───────────────────────────────────────────────────────
VALID_SEVERITIES = {"critical", "high", "medium", "low"}
VALID_CATEGORIES = {"rightsizing", "reserved", "idle", "storage", "network", "architecture"}


# ── Prompt builder ────────────────────────────────────────────────────────────
def _build_prompt(rows: list[dict]) -> str:
    """Format billing rows into a structured prompt for Gemini."""
    table = "\n".join(
        f"  - {r['name']}: ${r['cost']:.2f} monthly spend, {r['usage']:.1f}% utilisation"
        for r in rows
    )

    return f"""You are an expert AWS cloud cost optimisation consultant.

Analyse the following cloud billing data and identify actionable cost-saving opportunities.

BILLING DATA:
{table}

INSTRUCTIONS:
- Return ONLY a valid JSON array. No markdown, no explanation, no code fences, no extra text.
- Each element in the array must have EXACTLY these six fields:
    "service"  : the AWS service name (string)
    "issue"    : a concise description of the cost problem (string, max 15 words)
    "action"   : the specific remediation step to take (string, max 20 words)
    "saving"   : estimated monthly cost saving in USD as a plain number (number, no $ sign)
    "severity" : one of exactly: "critical", "high", "medium", "low"
    "category" : one of exactly: "rightsizing", "reserved", "idle", "storage", "network", "architecture"
- Include one entry per service that has a meaningful optimisation opportunity.
- Sort the array by "saving" descending (highest saving first).
- Do not include services where no saving is possible.

Respond with the JSON array only."""


# ── Response cleaner ──────────────────────────────────────────────────────────
def _clean_response(text: str) -> str:
    """Strip markdown fences and leading/trailing whitespace from Gemini output."""
    text = text.strip()
    # Remove ```json ... ``` or ``` ... ``` wrappers
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```\s*$", "", text)
    return text.strip()


# ── Row normaliser ────────────────────────────────────────────────────────────
def _normalise(item: dict) -> dict:
    """Coerce types and validate enum fields on a single recommendation."""
    severity = item.get("severity", "").lower()
    category = item.get("category", "").lower()

    return {
        "service":  str(item.get("service", "")).strip(),
        "issue":    str(item.get("issue",   "")).strip(),
        "action":   str(item.get("action",  "")).strip(),
        "saving":   round(float(item.get("saving", 0)), 2),
        "severity": severity  if severity  in VALID_SEVERITIES else "low",
        "category": category  if category  in VALID_CATEGORIES else "architecture",
    }


# ── Main export ───────────────────────────────────────────────────────────────
def analyse_with_gemini(rows: list[dict]) -> list[dict]:
    """
    Send billing rows to Gemini 1.5 Flash and return parsed recommendations.

    Args:
        rows: list of dicts with keys: name, cost, usage

    Returns:
        list of recommendation dicts with keys:
            service, issue, action, saving, severity, category

    Raises:
        ValueError: missing API key, empty rows, unparseable response
        RuntimeError: Gemini API call failed
    """
    # ── Guard: API key ────────────────────────────────────────────────────────
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY is not set. Add it to your .env file."
        )

    # ── Guard: empty input ────────────────────────────────────────────────────
    if not rows:
        raise ValueError("No billing rows provided for analysis.")

    # ── Call Gemini ───────────────────────────────────────────────────────────
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={
                "temperature":     0.2,   # low temp = consistent, structured output
                "top_p":           0.8,
                "max_output_tokens": 2048,
            },
        )
        response = model.generate_content(_build_prompt(rows))
    except Exception as e:
        raise RuntimeError(f"Gemini API call failed: {e}")

    # ── Extract text ──────────────────────────────────────────────────────────
    raw_text = getattr(response, "text", "").strip()
    if not raw_text:
        raise ValueError("Gemini returned an empty response.")

    cleaned = _clean_response(raw_text)

    # ── Parse JSON ────────────────────────────────────────────────────────────
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Gemini response could not be parsed as JSON: {e}\n"
            f"Raw response (first 400 chars):\n{raw_text[:400]}"
        )

    if not isinstance(data, list):
        raise ValueError(
            f"Expected a JSON array from Gemini, got {type(data).__name__}."
        )

    if len(data) == 0:
        raise ValueError("Gemini returned an empty recommendations array.")

    # ── Normalise each item ───────────────────────────────────────────────────
    recommendations = []
    for i, item in enumerate(data):
        if not isinstance(item, dict):
            continue  # skip malformed entries silently
        norm = _normalise(item)
        # Skip entries with no service name or zero saving
        if norm["service"] and norm["saving"] >= 0:
            recommendations.append(norm)

    if not recommendations:
        raise ValueError("Gemini returned no valid recommendations after parsing.")

    # Sort by saving descending (Gemini should do this, but enforce it)
    recommendations.sort(key=lambda r: r["saving"], reverse=True)

    return recommendations
