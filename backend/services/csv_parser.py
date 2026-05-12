import io
import pandas as pd

REQUIRED_COLUMNS = ["service", "spend", "usage"]


def parse_csv(contents: bytes) -> list[dict]:
    """
    Parse uploaded CSV bytes using pandas.

    Expects columns (case-insensitive): service, spend, usage
    Returns a clean JSON-serialisable list of dicts:
        [{ "name": str, "cost": float, "usage": float }, ...]

    Raises:
        ValueError — with a descriptive message for any validation failure.
    """

    # ── 1. Read CSV ───────────────────────────────────────────────────────────
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except pd.errors.EmptyDataError:
        raise ValueError("The uploaded file is empty.")
    except pd.errors.ParserError as e:
        raise ValueError(f"Could not parse CSV file: {e}")
    except Exception as e:
        raise ValueError(f"Unexpected error reading file: {e}")

    if df.empty:
        raise ValueError("The CSV file contains no data rows.")

    # ── 2. Normalise column names ─────────────────────────────────────────────
    df.columns = [str(c).strip().lower() for c in df.columns]

    # ── 3. Validate required columns ─────────────────────────────────────────
    present = set(df.columns)
    missing = [col for col in REQUIRED_COLUMNS if col not in present]

    if missing:
        missing_fmt  = ", ".join(f'"{c}"' for c in missing)
        present_fmt  = ", ".join(f'"{c}"' for c in sorted(present))
        raise ValueError(
            f"Missing required column(s): {missing_fmt}. "
            f"Found columns: {present_fmt}. "
            f"Expected: \"service\", \"spend\", \"usage\"."
        )

    # ── 4. Keep only the columns we need ─────────────────────────────────────
    df = df[REQUIRED_COLUMNS].copy()

    # ── 5. Drop fully empty rows ──────────────────────────────────────────────
    df.dropna(how="all", inplace=True)

    if df.empty:
        raise ValueError("All rows in the CSV are empty after removing blank lines.")

    # ── 6. Parse row by row with per-row error collection ────────────────────
    records: list[dict] = []
    row_errors: list[str] = []

    for idx, row in df.iterrows():
        row_num = int(idx) + 2  # +1 for header, +1 for 1-based display

        # service
        service = str(row["service"]).strip()
        if not service or service.lower() in ("nan", "none", ""):
            row_errors.append(f"Row {row_num}: 'service' is empty.")
            continue

        # spend
        raw_spend = str(row["spend"]).strip()
        try:
            cost = float(raw_spend.replace("$", "").replace(",", "").strip())
            if cost < 0:
                raise ValueError("negative value")
        except ValueError:
            row_errors.append(
                f"Row {row_num} ({service}): invalid 'spend' value \"{raw_spend}\". "
                "Expected a non-negative number."
            )
            continue

        # usage
        raw_usage = str(row["usage"]).strip()
        try:
            usage = float(raw_usage.replace("%", "").strip())
            if not (0 <= usage <= 100):
                raise ValueError("out of range")
        except ValueError:
            row_errors.append(
                f"Row {row_num} ({service}): invalid 'usage' value \"{raw_usage}\". "
                "Expected a percentage between 0 and 100."
            )
            continue

        records.append({
            "name":  service,
            "cost":  round(cost, 2),
            "usage": round(usage, 2),
        })

    # ── 7. Fail if nothing valid was parsed ───────────────────────────────────
    if not records:
        error_detail = "\n".join(row_errors) if row_errors else "No valid data rows found."
        raise ValueError(f"No valid rows could be parsed.\n{error_detail}")

    # ── 8. Return result with optional warnings attached ─────────────────────
    # Attach skipped-row warnings as a special key so the caller can surface them
    result = records  # clean list[dict] — JSON serialisable

    # Expose warnings via a module-level variable so routes can read them
    # without changing the return type
    parse_csv.warnings = row_errors  # type: ignore[attr-defined]

    return result
