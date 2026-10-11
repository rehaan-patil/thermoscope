"""
Analytics endpoints for Poisson, Exponential, Regime Shift, and Sensitivity analysis.
"""

import io
import os
from typing import Optional, Dict, Any, List
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ...engine.preprocessor import EventPreprocessor
from ...engine.poisson_model import PoissonModelEngine
from ...engine.exponential_model import ExponentialModelEngine
from ...engine.regime_shift import RegimeShiftEngine
from ...engine.threshold_studio import ThresholdSensitivityEngine
from ...engine.decision_rules import DecisionRulesEngine
from ...models.schemas import (
    AnalysisOptions,
    FullAnalysisResponse,
    ProbabilityCalculationRequest,
    ProbabilityCalculationResponse,
    DatasetMetadata,
    CycleDataPoint
)
from .dataset import B0005_CSV, load_default_b0005_df, get_file_sha256

router = APIRouter(prefix="/analytics", tags=["Analytics"])


class RunAnalysisPayload(BaseModel):
    options: AnalysisOptions = Field(default_factory=AnalysisOptions)
    csv_content: Optional[str] = Field(None, description="Custom CSV data; if empty, uses default NASA B0005 data.")


@router.post("/run", response_model=FullAnalysisResponse)
async def run_analysis(payload: RunAnalysisPayload):
    """
    Executes complete statistical analytics pipeline:
    1. Preprocesses telemetry (Reading vs Episode mode, thresholding)
    2. Fits Poisson distribution & tests adequacy
    3. Fits Exponential waiting-time model & evaluates CV
    4. Evaluates Thermal Regime Shifts across battery life stages
    5. Computes Threshold Sensitivity continuum
    6. Runs Explainable Decision Rules Engine
    """
    options = payload.options
    
    # Load dataset
    if payload.csv_content and payload.csv_content.strip():
        try:
            raw_df = pd.read_csv(io.StringIO(payload.csv_content))
            dataset_name = "User Uploaded Telemetry"
            sha256_hash = get_file_sha256_str(payload.csv_content)
            provenance = "User session upload"
            is_synthetic = False
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
    else:
        raw_df = load_default_b0005_df()
        dataset_name = "NASA Ames B0005 Battery Aging Dataset"
        sha256_hash = get_file_sha256(B0005_CSV)
        provenance = "NASA Ames Prognostics Center of Excellence (PCoE)"
        is_synthetic = False

    preprocessor = EventPreprocessor(default_threshold=options.threshold)
    prep_res = preprocessor.process(
        raw_df,
        mode=options.mode,
        threshold=options.threshold,
        merge_episodes=True
    )

    cycles_df = prep_res.cycles_df
    event_counts = cycles_df["event_count"].tolist()

    # 1. Poisson Fit
    poisson_res = PoissonModelEngine.fit(event_counts, query_k=options.query_k)

    # 2. Exponential Fit
    exponential_res = ExponentialModelEngine.fit(
        prep_res.waiting_times,
        time_unit=prep_res.time_unit
    )

    # 3. Regime Shift Analysis
    regime_res = RegimeShiftEngine.analyze_stages(cycles_df)

    # 4. Threshold Sensitivity Studio
    sensitivity_res = ThresholdSensitivityEngine.evaluate_sensitivity(
        raw_df,
        mode=options.mode
    )

    # 5. Explainable Decision Rules
    decision_engine = DecisionRulesEngine(
        critical_temp_c=options.critical_temp_c,
        consecutive_anomaly_window=options.consecutive_anomaly_window,
        episode_burst_threshold=options.episode_burst_threshold
    )
    decision_res = decision_engine.evaluate_cycles(cycles_df, base_threshold_c=options.threshold)

    # Prepare cycle data points for frontend visualization
    cycle_points = [
        CycleDataPoint(
            cycle=int(r["cycle"]),
            event_count=int(r["event_count"]),
            reading_count=int(r["reading_count"]),
            episode_count=int(r["episode_count"]),
            min_temperature=float(r["min_temperature"]),
            mean_temperature=float(r["mean_temperature"]),
            max_temperature=float(r["max_temperature"]),
            duration_s=float(r["duration_s"])
        )
        for _, r in cycles_df.iterrows()
    ]

    metadata = DatasetMetadata(
        name=dataset_name,
        total_readings=prep_res.total_readings,
        total_cycles=len(cycles_df),
        excluded_records=prep_res.excluded_records,
        file_sha256=sha256_hash,
        is_synthetic=is_synthetic,
        provenance=provenance,
        warnings=prep_res.validation_warnings
    )

    return FullAnalysisResponse(
        metadata=metadata,
        options=options,
        cycles=cycle_points,
        poisson=poisson_res.to_dict(),
        exponential=exponential_res.to_dict(),
        regime_shift=regime_res,
        threshold_sensitivity=sensitivity_res,
        decision_center=decision_res
    )


def get_file_sha256_str(content: str) -> str:
    import hashlib
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


@router.post("/probability", response_model=ProbabilityCalculationResponse)
async def calculate_probability(payload: ProbabilityCalculationRequest):
    """Computes exact Poisson probabilities P(X = k), P(X >= k), P(X > k) for interactive testing."""
    probs = PoissonModelEngine.calculate_probabilities(payload.lambda_rate, query_k=payload.query_k)
    return ProbabilityCalculationResponse(
        lambda_rate=payload.lambda_rate,
        query_k=payload.query_k,
        probabilities=probs
    )
