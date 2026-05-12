import io
import pandas as pd
from ..models import ServiceRecord

REQUIRED_COLUMNS = {"service", "spend", "usage"}


def parse(contents: bytes) -> list[ServiceRecord]:
    """
    Parse CSV bytes into a list of ServiceRecord.
    Raises ValueError with a descriptive message on validation failure.
    """
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise ValueError(f"Could not read CSV file: {e}")

    # Normalise column names
    df.columns = [c.strip().lower() for c in df.columns]

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(
            f"Missing required column(s): {', '.join(sorted(missing))}. "
            f"Expected: service, spend, usage."
        )

    records: list[ServiceRecord] = []
    errors: list[str] = []

    for i, row in df.iterrows():
        service = str(row["service"]).strip()
        if not service:
            errors.append(f"Row {i + 2}: missing service name.")
            continue

        try:
            cost = float(str(row["spend"]).replace("$", "").replace(",", "").strip())
        except ValueError:
            errors.append(f"Row {i + 2}: invalid spend value '{row['spend']}'.")
            continue

        try:
            usage = float(str(row["usage"]).replace("%", "").strip())
        except ValueError:
            errors.append(f"Row {i + 2}: invalid usage value '{row['usage']}'.")
            continue

        records.append(ServiceRecord(name=service, cost=cost, usage=usage))

    if not records:
        detail = " Issues: " + "; ".join(errors) if errors else ""
        raise ValueError(f"No valid rows found in CSV.{detail}")

    return records
