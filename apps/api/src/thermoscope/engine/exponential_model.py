"""
Exponential Distribution Analysis Engine for ThermoScope.
Provides inter-event waiting time estimation, probability densities,
survival functions, coefficient of variation (CV), exact confidence intervals,
and model adequacy diagnostics.
"""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import scipy.stats as stats


class ExponentialAnalysisResult:
    def __init__(
        self,
        n_intervals: int,
        mean_waiting_time: float,
        std_waiting_time: float,
        lambda_rate: float,
        lambda_ci_95: Tuple[float, float],
        expected_waiting_time: float,
        coefficient_of_variation: Optional[float],
        cv_label: str,
        time_unit: str,
        density_curve: List[Dict[str, float]],
        empirical_quantiles: Dict[str, float],
        adequacy_status: str,
        adequacy_rationale: str,
        limitations: List[str]
    ):
        self.n_intervals = n_intervals
        self.mean_waiting_time = mean_waiting_time
        self.std_waiting_time = std_waiting_time
        self.lambda_rate = lambda_rate
        self.lambda_ci_95 = lambda_ci_95
        self.expected_waiting_time = expected_waiting_time
        self.coefficient_of_variation = coefficient_of_variation
        self.cv_label = cv_label
        self.time_unit = time_unit
        self.density_curve = density_curve
        self.empirical_quantiles = empirical_quantiles
        self.adequacy_status = adequacy_status
        self.adequacy_rationale = adequacy_rationale
        self.limitations = limitations

    def to_dict(self) -> Dict[str, Any]:
        return {
            "n_intervals": self.n_intervals,
            "mean_waiting_time": round(self.mean_waiting_time, 4),
            "std_waiting_time": round(self.std_waiting_time, 4),
            "lambda_rate": round(self.lambda_rate, 5),
            "lambda_ci_95": [round(self.lambda_ci_95[0], 5), round(self.lambda_ci_95[1], 5)],
            "expected_waiting_time": round(self.expected_waiting_time, 4),
            "coefficient_of_variation": (
                round(self.coefficient_of_variation, 4)
                if self.coefficient_of_variation is not None
                else None
            ),
            "cv_label": self.cv_label,
            "time_unit": self.time_unit,
            "density_curve": self.density_curve,
            "empirical_quantiles": {k: round(v, 4) for k, v in self.empirical_quantiles.items()},
            "adequacy_status": self.adequacy_status,
            "adequacy_rationale": self.adequacy_rationale,
            "limitations": self.limitations
        }


class ExponentialModelEngine:
    """Rigorous Exponential waiting-time estimation and diagnostic suite."""

    @staticmethod
    def calculate_rate_ci(
        n_intervals: int,
        mean_t: float,
        confidence: float = 0.95
    ) -> Tuple[float, float]:
        """Calculates exact confidence interval for Exponential rate lambda_E using Chi-Square distribution."""
        if n_intervals <= 0 or mean_t <= 0:
            return (0.0, 0.0)
            
        alpha = 1.0 - confidence
        k = n_intervals
        total_time = k * mean_t
        
        # 2*lambda*total_time follows Chi-Square with 2*k degrees of freedom
        lower = stats.chi2.ppf(alpha / 2.0, 2 * k) / (2.0 * total_time)
        upper = stats.chi2.ppf(1.0 - alpha / 2.0, 2 * k) / (2.0 * total_time)
        return (float(max(0.0, lower)), float(upper))

    @classmethod
    def evaluate_at(cls, t: float, lam: float) -> Dict[str, float]:
        """Evaluates Exponential PDF, CDF, and Survival Probability P(T > t)."""
        if t < 0 or lam <= 0:
            return {"t": t, "pdf": 0.0, "cdf": 0.0, "survival": 1.0}
            
        pdf_val = float(stats.expon.pdf(t, scale=1.0 / lam))
        cdf_val = float(stats.expon.cdf(t, scale=1.0 / lam))
        sf_val = float(stats.expon.sf(t, scale=1.0 / lam))
        return {
            "t": t,
            "pdf": round(pdf_val, 6),
            "cdf": round(cdf_val, 6),
            "survival": round(sf_val, 6)
        }

    @classmethod
    def fit(
        cls,
        waiting_times: List[float],
        time_unit: str = "cycles",
        density_points: int = 25
    ) -> ExponentialAnalysisResult:
        """Fits Exponential distribution to inter-event intervals and produces diagnostic metrics."""
        # Filter strictly positive values
        valid_intervals = [float(w) for w in waiting_times if w > 0]
        k = len(valid_intervals)

        limitations = [
            "Assumes a memoryless process: probability of an event in the next window is independent of elapsed time.",
            "Assumes constant hazard rate throughout the observation lifecycle.",
            "Truncation and right-censoring at observation window endpoints can bias empirical intervals."
        ]

        if k == 0:
            return ExponentialAnalysisResult(
                n_intervals=0,
                mean_waiting_time=0.0,
                std_waiting_time=0.0,
                lambda_rate=0.0,
                lambda_ci_95=(0.0, 0.0),
                expected_waiting_time=0.0,
                coefficient_of_variation=None,
                cv_label="Insufficient intervals",
                time_unit=time_unit,
                density_curve=[],
                empirical_quantiles={},
                adequacy_status="Insufficient Evidence",
                adequacy_rationale="No positive inter-event waiting intervals available in the dataset.",
                limitations=limitations
            )

        arr = np.array(valid_intervals, dtype=float)
        mean_t = float(np.mean(arr))
        std_t = float(np.std(arr, ddof=1)) if k > 1 else 0.0
        lam = 1.0 / mean_t if mean_t > 0 else 0.0
        
        cv = (std_t / mean_t) if (mean_t > 0 and k > 1) else None
        
        if cv is not None:
            if cv > 1.25:
                cv_label = "Hyper-exponential (CV > 1.0, bursty/clustered arrivals)"
            elif cv < 0.80:
                cv_label = "Hypo-exponential (CV < 1.0, periodic/regular arrivals)"
            else:
                cv_label = "Exponential-compatible (CV ≈ 1.0)"
        else:
            cv_label = "Single interval (CV undefined)"

        # 95% Confidence Interval
        ci_95 = cls.calculate_rate_ci(k, mean_t, confidence=0.95)

        # Generate density curve for charting
        max_t = float(np.max(arr))
        grid_max = max(max_t * 1.25, mean_t * 3.0)
        t_grid = np.linspace(0, grid_max, density_points)
        density_curve = [cls.evaluate_at(float(t_val), lam) for t_val in t_grid]

        # Empirical quantiles
        quantiles = {
            "p25": float(np.percentile(arr, 25)),
            "p50_median": float(np.percentile(arr, 50)),
            "p75": float(np.percentile(arr, 75)),
            "p90": float(np.percentile(arr, 90)),
            "max": max_t
        }

        # Adequacy Diagnostic
        if k < 10:
            adequacy_status = "Insufficient Evidence"
            adequacy_rationale = (
                f"Only {k} waiting intervals observed. A minimum of 10-15 intervals is required "
                "for stable Exponential parameter estimation."
            )
        elif cv is not None and cv > 1.25:
            adequacy_status = "Caution: Clustered Waiting Times"
            adequacy_rationale = (
                f"Observed CV = {cv:.2f} significantly exceeds 1.0. "
                "Inter-event waiting times exhibit heavy-tailed or clustered clustering, violating memoryless Exponential arrivals."
            )
        elif cv is not None and cv < 0.80:
            adequacy_status = "Caution: Periodic or Constrained Process"
            adequacy_rationale = (
                f"Observed CV = {cv:.2f} is well below 1.0. "
                "Thermal occurrences are spaced regularly across cycles, which is incompatible with pure Poisson/Exponential memorylessness."
            )
        else:
            adequacy_status = "Supported by Current Diagnostics"
            adequacy_rationale = (
                f"Coefficient of variation CV = {cv:.2f} is compatible with theoretical unit Exponential dispersion."
            )

        return ExponentialAnalysisResult(
            n_intervals=k,
            mean_waiting_time=mean_t,
            std_waiting_time=std_t,
            lambda_rate=lam,
            lambda_ci_95=ci_95,
            expected_waiting_time=mean_t,
            coefficient_of_variation=cv,
            cv_label=cv_label,
            time_unit=time_unit,
            density_curve=density_curve,
            empirical_quantiles=quantiles,
            adequacy_status=adequacy_status,
            adequacy_rationale=adequacy_rationale,
            limitations=limitations
        )
