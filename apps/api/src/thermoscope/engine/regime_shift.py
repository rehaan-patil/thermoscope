"""
Thermal Regime Shift Explorer for ThermoScope.
Analyzes non-stationary aging across configurable battery lifecycle stages
(Early, Middle, Late) and evaluates the constant-rate assumption.
"""

from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np
from .poisson_model import PoissonModelEngine


class StageAnalysis:
    def __init__(
        self,
        stage_name: str,
        start_cycle: int,
        end_cycle: int,
        n_cycles: int,
        total_events: int,
        lambda_rate: float,
        lambda_ci_95: Tuple[float, float],
        dispersion_index: Optional[float],
        percent_cycles_with_events: float,
        max_temperature: float,
        mean_temperature: float
    ):
        self.stage_name = stage_name
        self.start_cycle = start_cycle
        self.end_cycle = end_cycle
        self.n_cycles = n_cycles
        self.total_events = total_events
        self.lambda_rate = lambda_rate
        self.lambda_ci_95 = lambda_ci_95
        self.dispersion_index = dispersion_index
        self.percent_cycles_with_events = percent_cycles_with_events
        self.max_temperature = max_temperature
        self.mean_temperature = mean_temperature

    def to_dict(self) -> Dict[str, Any]:
        return {
            "stage_name": self.stage_name,
            "start_cycle": self.start_cycle,
            "end_cycle": self.end_cycle,
            "n_cycles": self.n_cycles,
            "total_events": self.total_events,
            "lambda_rate": round(self.lambda_rate, 4),
            "lambda_ci_95": [round(self.lambda_ci_95[0], 4), round(self.lambda_ci_95[1], 4)],
            "dispersion_index": round(self.dispersion_index, 4) if self.dispersion_index is not None else None,
            "percent_cycles_with_events": round(self.percent_cycles_with_events, 2),
            "max_temperature": round(self.max_temperature, 3),
            "mean_temperature": round(self.mean_temperature, 3)
        }


class RegimeShiftEngine:
    """Evaluates thermal regime transitions and rate divergence across battery operating life."""

    @classmethod
    def analyze_stages(
        cls,
        cycles_df: pd.DataFrame,
        stage_boundaries: Optional[Dict[str, Tuple[int, int]]] = None
    ) -> Dict[str, Any]:
        """
        Partitions cycles into lifecycle stages and computes stage-level statistical metrics.
        Default boundaries for NASA B0005 (168 cycles):
        - Early: 1 to 50
        - Mid: 51 to 110
        - Late: 111 to 168
        """
        if cycles_df.empty:
            raise ValueError("Cycles dataframe is empty.")

        max_avail_cycle = int(cycles_df["cycle"].max())
        min_avail_cycle = int(cycles_df["cycle"].min())

        if stage_boundaries is None:
            # Automatic heuristic partition
            total_range = max_avail_cycle - min_avail_cycle + 1
            if total_range >= 30:
                s1_end = min_avail_cycle + int(total_range * 0.30) - 1
                s2_end = min_avail_cycle + int(total_range * 0.65) - 1
                stage_boundaries = {
                    "Early-Life (Pristine)": (min_avail_cycle, s1_end),
                    "Mid-Life (Linear Degradation)": (s1_end + 1, s2_end),
                    "Late-Life (Knee Point / Aging)": (s2_end + 1, max_avail_cycle)
                }
            else:
                stage_boundaries = {
                    "Early-Life": (min_avail_cycle, min_avail_cycle + total_range // 2),
                    "Late-Life": (min_avail_cycle + total_range // 2 + 1, max_avail_cycle)
                }

        stage_results: List[Dict[str, Any]] = []

        for stage_name, (start_c, end_c) in stage_boundaries.items():
            mask = (cycles_df["cycle"] >= start_c) & (cycles_df["cycle"] <= end_c)
            stage_sub = cycles_df[mask]
            
            n_c = len(stage_sub)
            if n_c == 0:
                continue

            events = stage_sub["event_count"].values
            tot_events = int(np.sum(events))
            rate = float(np.mean(events))
            var_val = float(np.var(events, ddof=1)) if n_c > 1 else 0.0
            dispersion = (var_val / rate) if rate > 0 else None
            
            ci = PoissonModelEngine.calculate_garwood_ci(tot_events, n_c, confidence=0.95)
            pct_active = float(np.mean(events > 0) * 100.0)
            
            max_t = float(stage_sub["max_temperature"].max()) if "max_temperature" in stage_sub else 0.0
            mean_t = float(stage_sub["mean_temperature"].mean()) if "mean_temperature" in stage_sub else 0.0

            res = StageAnalysis(
                stage_name=stage_name,
                start_cycle=start_c,
                end_cycle=end_c,
                n_cycles=n_c,
                total_events=tot_events,
                lambda_rate=rate,
                lambda_ci_95=ci,
                dispersion_index=dispersion,
                percent_cycles_with_events=pct_active,
                max_temperature=max_t,
                mean_temperature=mean_t
            )
            stage_results.append(res.to_dict())

        # Regime shift diagnosis
        has_shift = False
        shift_evidence = []
        if len(stage_results) >= 2:
            first_stage = stage_results[0]
            last_stage = stage_results[-1]
            
            # Check CI overlap
            r1_upper = first_stage["lambda_ci_95"][1]
            r_last_lower = last_stage["lambda_ci_95"][0]
            
            ci_overlap = not (r_last_lower > r1_upper or first_stage["lambda_ci_95"][0] > last_stage["lambda_ci_95"][1])
            
            if not ci_overlap and last_stage["lambda_rate"] > first_stage["lambda_rate"]:
                has_shift = True
                shift_evidence.append(
                    f"Non-overlapping 95% Garwood confidence intervals between {first_stage['stage_name']} "
                    f"[{first_stage['lambda_ci_95'][0]}, {first_stage['lambda_ci_95'][1]}] and "
                    f"{last_stage['stage_name']} [{last_stage['lambda_ci_95'][0]}, {last_stage['lambda_ci_95'][1]}]."
                )
                
            rate_ratio = (last_stage["lambda_rate"] / max(first_stage["lambda_rate"], 0.01))
            if rate_ratio >= 2.0:
                has_shift = True
                shift_evidence.append(
                    f"Late-stage event rate is {rate_ratio:.1f}x higher than early-stage baseline."
                )

        if has_shift:
            conclusion = "Statistically Significant Regime Shift Detected"
            recommendation = (
                "The constant-rate assumption (homogeneous Poisson process) is violated across the battery lifespan. "
                "Predictive safety systems must employ piecewise or degradation-indexed rates rather than a single global λ."
            )
        else:
            conclusion = "Stationary / Inconclusive Regime Progression"
            recommendation = "Rates remain statistically comparable within the available observation window."

        return {
            "stages": stage_results,
            "has_regime_shift": has_shift,
            "conclusion": conclusion,
            "shift_evidence": shift_evidence,
            "recommendation": recommendation,
            "caveat": (
                "Correlation between thermal events and discharge cycle index reflects electrochemical degradation; "
                "causation should not be inferred without multi-physics cell impedance characterization."
            )
        }
