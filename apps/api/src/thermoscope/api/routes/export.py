"""
Evidence pack and reproducible export endpoints.
"""

import io
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import pandas as pd
from fastapi import APIRouter, Response, HTTPException
from pydantic import BaseModel

from .analytics import run_analysis, RunAnalysisPayload

router = APIRouter(prefix="/export", tags=["Export & Reproducibility"])


@router.post("/manifest", response_model=Dict[str, Any])
async def export_evidence_manifest(payload: RunAnalysisPayload):
    """
    Generates a cryptographically auditable, reproducible evidence pack manifest
    linking configuration, data fingerprint, model estimates, and alerts.
    """
    analysis = await run_analysis(payload)
    
    now_iso = datetime.now(timezone.utc).isoformat()
    
    manifest = {
        "thermoscope_version": "1.0.0",
        "manifest_type": "ReproducibleEvidencePack",
        "generated_at_utc": now_iso,
        "dataset_provenance": {
            "name": analysis.metadata.name,
            "sha256": analysis.metadata.file_sha256,
            "total_readings": analysis.metadata.total_readings,
            "total_cycles": analysis.metadata.total_cycles,
            "excluded_records": analysis.metadata.excluded_records,
            "origin": analysis.metadata.provenance
        },
        "analysis_configuration": analysis.options.model_dump(),
        "statistical_findings": {
            "poisson": {
                "lambda_rate": analysis.poisson["lambda_rate"],
                "lambda_ci_95": analysis.poisson["lambda_ci_95"],
                "dispersion_index": analysis.poisson["dispersion_index"],
                "dispersion_label": analysis.poisson["dispersion_label"],
                "adequacy_status": analysis.poisson["adequacy_status"],
                "adequacy_rationale": analysis.poisson["adequacy_rationale"]
            },
            "exponential": {
                "mean_waiting_time": analysis.exponential["mean_waiting_time"],
                "lambda_rate": analysis.exponential["lambda_rate"],
                "lambda_ci_95": analysis.exponential["lambda_ci_95"],
                "coefficient_of_variation": analysis.exponential["coefficient_of_variation"],
                "cv_label": analysis.exponential["cv_label"],
                "adequacy_status": analysis.exponential["adequacy_status"]
            },
            "regime_shift": {
                "has_regime_shift": analysis.regime_shift["has_regime_shift"],
                "conclusion": analysis.regime_shift["conclusion"]
            }
        },
        "decision_summary": {
            "overall_classification": analysis.decision_center["overall_classification"],
            "alert_counts": analysis.decision_center["alert_counts"],
            "total_alerts_logged": len(analysis.decision_center["alerts"])
        },
        "reproducibility_instructions": (
            "This manifest contains all parameters required to reconstruct the exact "
            "analytical run. Submit these options to POST /api/v1/analytics/run with the "
            "identical dataset hash."
        ),
        "disclaimer": analysis.decision_center["disclaimer"],
        "references": [
            "Saha, B., & Goebel, K. (2007). Battery Data Set, NASA Ames PCoE.",
            "NIST/SEMATECH e-Handbook of Statistical Methods.",
            "Virtanen, P. et al. (2020). SciPy 1.0: Fundamental Algorithms for Scientific Computing."
        ]
    }
    return manifest


@router.post("/csv")
async def export_analysis_csv(payload: RunAnalysisPayload):
    """Generates downloadable CSV containing cycle-level measurements and alert classifications."""
    analysis = await run_analysis(payload)
    
    rows = []
    # Index alerts by cycle
    cycle_alerts: Dict[int, str] = {}
    for a in analysis.decision_center.get("alerts", []):
        cycle_alerts[a["cycle"]] = a["severity"]

    for c in analysis.cycles:
        rows.append({
            "cycle": c.cycle,
            "min_temperature_c": c.min_temperature,
            "mean_temperature_c": c.mean_temperature,
            "max_temperature_c": c.max_temperature,
            "reading_events": c.reading_count,
            "episode_events": c.episode_count,
            "active_mode_events": c.event_count,
            "duration_s": c.duration_s,
            "alert_classification": cycle_alerts.get(c.cycle, "SAFE")
        })

    df = pd.DataFrame(rows)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=thermoscope_analysis_{analysis.options.mode}_{int(analysis.options.threshold)}c.csv"
        }
    )
