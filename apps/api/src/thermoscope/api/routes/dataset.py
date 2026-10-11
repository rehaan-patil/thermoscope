"""
Dataset validation and metadata endpoints.
"""

import hashlib
import io
import os
from typing import Optional, Dict, Any
import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from ...engine.preprocessor import EventPreprocessor
from ...models.schemas import DatasetMetadata

router = APIRouter(prefix="/dataset", tags=["Dataset"])

# Locate NASA B0005 data files across monorepo and bundled deployment locations
def resolve_data_paths():
    candidates = [
        os.path.join(os.path.dirname(__file__), "../../../../../data"),  # monorepo root
        os.path.join(os.path.dirname(__file__), "../../../../data"),     # apps/data
        os.path.join(os.path.dirname(__file__), "../../../data"),        # apps/api/data
        os.path.join(os.getcwd(), "data"),                               # current working directory
        os.path.abspath("data")
    ]
    for c in candidates:
        candidate_csv = os.path.join(c, "B0005_thermal_events.csv")
        if os.path.exists(candidate_csv):
            return os.path.abspath(candidate_csv), os.path.abspath(os.path.join(c, "B0005_cycle_summary.csv"))
    # Default fallback
    return os.path.abspath(os.path.join(os.getcwd(), "data", "B0005_thermal_events.csv")), os.path.abspath(os.path.join(os.getcwd(), "data", "B0005_cycle_summary.csv"))

B0005_CSV, B0005_SUMMARY_CSV = resolve_data_paths()


def get_file_sha256(filepath: str) -> str:
    if not os.path.exists(filepath):
        return "not_found"
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()


def load_default_b0005_df() -> pd.DataFrame:
    if not os.path.exists(B0005_CSV):
        raise HTTPException(
            status_code=404,
            detail="Default NASA B0005 dataset not found on server."
        )
    return pd.read_csv(B0005_CSV)


@router.get("/sample", response_model=Dict[str, Any])
async def get_sample_dataset_info():
    """Returns metadata and preview rows for the primary NASA B0005 dataset."""
    if not os.path.exists(B0005_CSV):
        raise HTTPException(status_code=404, detail="B0005 dataset file missing.")

    df_sample = pd.read_csv(B0005_CSV, nrows=50)
    summary_df = pd.read_csv(B0005_SUMMARY_CSV) if os.path.exists(B0005_SUMMARY_CSV) else None
    
    sha256_hash = get_file_sha256(B0005_CSV)
    total_rows = 50285
    total_cycles = len(summary_df) if summary_df is not None else int(df_sample["cycle"].max())

    return {
        "metadata": {
            "name": "NASA Ames B0005 Li-ion Battery Aging Dataset",
            "battery_id": "B0005",
            "cell_type": "18650 LiCoO2 / Graphite (2.0 Ah nominal)",
            "test_temperature": "24°C nominal room temperature",
            "total_readings": total_rows,
            "total_cycles": total_cycles,
            "file_sha256": sha256_hash,
            "provenance": "NASA Ames Prognostics Center of Excellence (PCoE) Repository",
            "citation": "Saha, B., & Goebel, K. (2007). Battery Data Set, NASA Ames PCoE.",
            "is_synthetic": False
        },
        "preview_rows": df_sample.to_dict(orient="records"),
        "columns": list(df_sample.columns),
        "cycle_summary_preview": (
            summary_df.head(20).to_dict(orient="records") if summary_df is not None else []
        )
    }


class CSVValidationRequest(BaseModel):
    csv_content: str
    column_mapping: Optional[Dict[str, str]] = None


@router.post("/validate", response_model=Dict[str, Any])
async def validate_csv(payload: CSVValidationRequest):
    """Validates user-submitted CSV content, checks schemas, and previews normalized records."""
    try:
        df = pd.read_csv(io.StringIO(payload.csv_content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV structure: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="Uploaded CSV contains zero rows.")

    preprocessor = EventPreprocessor()
    try:
        clean_df, warnings, excluded = preprocessor.validate_and_normalize_dataframe(
            df, column_mapping=payload.column_mapping
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Validation failure: {str(e)}")

    sha256_hash = hashlib.sha256(payload.csv_content.encode("utf-8")).hexdigest()
    n_cycles = int(clean_df["cycle"].nunique())

    return {
        "is_valid": True,
        "original_rows": len(df),
        "valid_rows": len(clean_df),
        "excluded_rows": excluded,
        "cycles_detected": n_cycles,
        "detected_columns": list(df.columns),
        "warnings": warnings,
        "sha256": sha256_hash,
        "preview": clean_df.head(15).to_dict(orient="records")
    }
