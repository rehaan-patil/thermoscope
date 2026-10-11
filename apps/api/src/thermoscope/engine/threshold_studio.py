"""
Threshold Sensitivity Studio for ThermoScope.
Evaluates how varying the project-defined temperature threshold shifts
event classification, Poisson rates, dispersion, and alert profiles.
"""

from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from .preprocessor import EventPreprocessor
from .poisson_model import PoissonModelEngine


class ThresholdSensitivityEngine:
    """Evaluates statistical model response across a spectrum of analytical temperature thresholds."""

    @classmethod
    def evaluate_sensitivity(
        cls,
        raw_df: pd.DataFrame,
        mode: str = "episode",
        threshold_range: Optional[List[float]] = None
    ) -> Dict[str, Any]:
        """
        Runs parameter sweep across candidate temperature thresholds.
        Default range: 36.0°C to 45.0°C in 1.0°C increments.
        """
        if threshold_range is None:
            threshold_range = [36.0, 37.0, 38.0, 39.0, 40.0, 41.0, 42.0, 43.0, 44.0, 45.0]

        preprocessor = EventPreprocessor()
        sensitivity_points: List[Dict[str, Any]] = []

        for th in sorted(threshold_range):
            prep_res = preprocessor.process(raw_df, mode=mode, threshold=th)
            counts = prep_res.cycles_df["event_count"].tolist()
            
            p_res = PoissonModelEngine.fit(counts)
            cycles_with_events = int((prep_res.cycles_df["event_count"] > 0).sum())
            pct_cycles = round((cycles_with_events / len(prep_res.cycles_df)) * 100.0, 2)

            sensitivity_points.append({
                "threshold_c": round(th, 1),
                "total_events": p_res.total_events,
                "lambda_rate": round(p_res.lambda_rate, 4),
                "lambda_ci_lower": round(p_res.lambda_ci_95[0], 4),
                "lambda_ci_upper": round(p_res.lambda_ci_95[1], 4),
                "dispersion_index": round(p_res.dispersion_index, 3) if p_res.dispersion_index is not None else None,
                "cycles_with_events": cycles_with_events,
                "percent_cycles_with_events": pct_cycles,
                "adequacy_status": p_res.adequacy_status,
                "n_waiting_intervals": len(prep_res.waiting_times)
            })

        # Narrative explanation of threshold impact
        if sensitivity_points:
            t_min = sensitivity_points[0]
            t_max = sensitivity_points[-1]
            diff_events = t_min["total_events"] - t_max["total_events"]
            narrative = (
                f"Varying the threshold from {t_min['threshold_c']}°C to {t_max['threshold_c']}°C "
                f"reduces total observed events by {diff_events} ({t_min['total_events']} down to {t_max['total_events']}), "
                f"shifting estimated cycle event rate λ from {t_min['lambda_rate']:.3f} to {t_max['lambda_rate']:.3f}. "
                "This sensitivity demonstrates how engineering threshold selection directly drives downstream risk probabilities."
            )
        else:
            narrative = "No sensitivity points computed."

        return {
            "mode": mode,
            "points": sensitivity_points,
            "narrative": narrative,
            "disclaimer": (
                "Thresholds evaluated in this studio represent analytical research scenarios. "
                "They do not constitute certified OEM limits or physical failure boundaries."
            )
        }
