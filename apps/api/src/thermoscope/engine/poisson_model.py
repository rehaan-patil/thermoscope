"""
Poisson Distribution Analysis Engine for ThermoScope.
Provides rigorous parameter estimation, probability mass/survival functions,
observed vs expected frequency binning, dispersion index, goodness-of-fit,
Garwood exact confidence intervals, and model adequacy diagnostics.
"""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import scipy.stats as stats


class PoissonAnalysisResult:
    def __init__(
        self,
        n_observations: int,
        total_events: int,
        lambda_rate: float,
        lambda_ci_95: Tuple[float, float],
        mean: float,
        variance: float,
        dispersion_index: Optional[float],
        dispersion_label: str,
        observed_frequencies: Dict[str, int],
        expected_frequencies: Dict[str, float],
        conservation_difference: float,
        probabilities: Dict[str, float],
        chi_square_stat: Optional[float],
        chi_square_df: Optional[int],
        chi_square_p_value: Optional[float],
        adequacy_status: str,
        adequacy_rationale: str,
        limitations: List[str]
    ):
        self.n_observations = n_observations
        self.total_events = total_events
        self.lambda_rate = lambda_rate
        self.lambda_ci_95 = lambda_ci_95
        self.mean = mean
        self.variance = variance
        self.dispersion_index = dispersion_index
        self.dispersion_label = dispersion_label
        self.observed_frequencies = observed_frequencies
        self.expected_frequencies = expected_frequencies
        self.conservation_difference = conservation_difference
        self.probabilities = probabilities
        self.chi_square_stat = chi_square_stat
        self.chi_square_df = chi_square_df
        self.chi_square_p_value = chi_square_p_value
        self.adequacy_status = adequacy_status
        self.adequacy_rationale = adequacy_rationale
        self.limitations = limitations

    def to_dict(self) -> Dict[str, Any]:
        return {
            "n_observations": self.n_observations,
            "total_events": self.total_events,
            "lambda_rate": round(self.lambda_rate, 4),
            "lambda_ci_95": [round(self.lambda_ci_95[0], 4), round(self.lambda_ci_95[1], 4)],
            "mean": round(self.mean, 4),
            "variance": round(self.variance, 4),
            "dispersion_index": round(self.dispersion_index, 4) if self.dispersion_index is not None else None,
            "dispersion_label": self.dispersion_label,
            "observed_frequencies": self.observed_frequencies,
            "expected_frequencies": {k: round(v, 4) for k, v in self.expected_frequencies.items()},
            "conservation_difference": round(self.conservation_difference, 6),
            "probabilities": {k: round(v, 6) for k, v in self.probabilities.items()},
            "chi_square_stat": round(self.chi_square_stat, 4) if self.chi_square_stat is not None else None,
            "chi_square_df": self.chi_square_df,
            "chi_square_p_value": round(self.chi_square_p_value, 4) if self.chi_square_p_value is not None else None,
            "adequacy_status": self.adequacy_status,
            "adequacy_rationale": self.adequacy_rationale,
            "limitations": self.limitations
        }


class PoissonModelEngine:
    """Rigorous Poisson statistical estimation and diagnostic suite."""

    @staticmethod
    def calculate_garwood_ci(total_events: int, n: int, confidence: float = 0.95) -> Tuple[float, float]:
        """Calculates exact Poisson confidence interval using Garwood's method (Chi-Square percentiles)."""
        if n <= 0:
            return (0.0, 0.0)
            
        alpha = 1.0 - confidence
        k = total_events
        
        if k == 0:
            lower = 0.0
            upper = 0.5 * stats.chi2.ppf(1.0 - alpha / 2.0, 2) / n
        else:
            lower = 0.5 * stats.chi2.ppf(alpha / 2.0, 2 * k) / n
            upper = 0.5 * stats.chi2.ppf(1.0 - alpha / 2.0, 2 * (k + 1)) / n
            
        return (float(max(0.0, lower)), float(upper))

    @classmethod
    def calculate_probabilities(cls, lam: float, query_k: int = 3) -> Dict[str, float]:
        """
        Calculates key Poisson probabilities for rate lambda.
        Explicitly distinguishes P(X >= k) from P(X > k).
        """
        if lam <= 0.0:
            return {
                "P_0": 1.0,
                "P_1": 0.0,
                f"P_{query_k}": 0.0,
                f"P_ge_{query_k}": 0.0,
                f"P_gt_{query_k}": 0.0,
                "P_ge_1": 0.0,
                "P_ge_2": 0.0,
                "P_ge_3": 0.0,
                "P_gt_3": 0.0
            }

        p_0 = float(stats.poisson.pmf(0, lam))
        p_1 = float(stats.poisson.pmf(1, lam))
        p_k = float(stats.poisson.pmf(query_k, lam))
        
        # P(X >= k) = 1 - CDF(k - 1) = sf(k - 1)
        p_ge_k = float(stats.poisson.sf(query_k - 1, lam))
        # P(X > k) = 1 - CDF(k) = sf(k)
        p_gt_k = float(stats.poisson.sf(query_k, lam))
        
        p_ge_1 = float(stats.poisson.sf(0, lam))
        p_ge_2 = float(stats.poisson.sf(1, lam))
        p_ge_3 = float(stats.poisson.sf(2, lam))
        p_gt_3 = float(stats.poisson.sf(3, lam))

        return {
            "P_0": p_0,
            "P_1": p_1,
            f"P_{query_k}": p_k,
            f"P_ge_{query_k}": p_ge_k,
            f"P_gt_{query_k}": p_gt_k,
            "P_ge_1": p_ge_1,
            "P_ge_2": p_ge_2,
            "P_ge_3": p_ge_3,
            "P_gt_3": p_gt_3
        }

    @classmethod
    def fit(cls, counts: List[int], query_k: int = 3) -> PoissonAnalysisResult:
        """Fits Poisson distribution to observed cycle event counts and produces complete diagnostics."""
        n = len(counts)
        if n == 0:
            raise ValueError("Input counts list cannot be empty.")

        counts_arr = np.array(counts, dtype=int)
        total_events = int(np.sum(counts_arr))
        mean_val = float(np.mean(counts_arr))
        lam = mean_val  # MLE for Poisson rate
        
        var_val = float(np.var(counts_arr, ddof=1)) if n > 1 else 0.0
        
        # Dispersion index
        if lam > 0:
            dispersion = var_val / lam
            if dispersion > 1.30:
                dispersion_label = "Overdispersed (s² > x̄)"
            elif dispersion < 0.80:
                dispersion_label = "Underdispersed (s² < x̄)"
            else:
                dispersion_label = "Equidispersed (s² ≈ x̄)"
        else:
            dispersion = None
            dispersion_label = "Zero-event rate (dispersion undefined)"

        # Garwood CI
        ci_95 = cls.calculate_garwood_ci(total_events, n, confidence=0.95)

        # Probabilities
        probs = cls.calculate_probabilities(lam, query_k=query_k)

        # Observed frequencies: 0, 1, 2, 3, 4+
        obs_0 = int(np.sum(counts_arr == 0))
        obs_1 = int(np.sum(counts_arr == 1))
        obs_2 = int(np.sum(counts_arr == 2))
        obs_3 = int(np.sum(counts_arr == 3))
        obs_4plus = int(np.sum(counts_arr >= 4))

        observed_freq = {
            "0": obs_0,
            "1": obs_1,
            "2": obs_2,
            "3": obs_3,
            "4+": obs_4plus
        }

        # Expected frequencies
        if lam > 0:
            exp_0 = float(n * stats.poisson.pmf(0, lam))
            exp_1 = float(n * stats.poisson.pmf(1, lam))
            exp_2 = float(n * stats.poisson.pmf(2, lam))
            exp_3 = float(n * stats.poisson.pmf(3, lam))
            exp_4plus = float(n * stats.poisson.sf(3, lam))  # P(X >= 4)
        else:
            exp_0 = float(n)
            exp_1 = 0.0
            exp_2 = 0.0
            exp_3 = 0.0
            exp_4plus = 0.0

        expected_freq = {
            "0": exp_0,
            "1": exp_1,
            "2": exp_2,
            "3": exp_3,
            "4+": exp_4plus
        }

        total_expected = sum(expected_freq.values())
        conservation_diff = abs(total_expected - n)

        # Goodness-of-fit (Chi-Square) with category pooling
        chi_stat: Optional[float] = None
        chi_df: Optional[int] = None
        chi_p: Optional[float] = None

        if lam > 0 and n >= 20:
            obs_list = [obs_0, obs_1, obs_2, obs_3, obs_4plus]
            exp_list = [exp_0, exp_1, exp_2, exp_3, exp_4plus]
            
            # Pool categories where expected count is small (< 5)
            pooled_obs = []
            pooled_exp = []
            cur_o = 0
            cur_e = 0.0
            
            for o, e in zip(obs_list, exp_list):
                cur_o += o
                cur_e += e
                if cur_e >= 5.0:
                    pooled_obs.append(cur_o)
                    pooled_exp.append(cur_e)
                    cur_o = 0
                    cur_e = 0.0
                    
            if cur_e > 0:
                if pooled_exp:
                    pooled_obs[-1] += cur_o
                    pooled_exp[-1] += cur_e
                else:
                    pooled_obs.append(cur_o)
                    pooled_exp.append(cur_e)

            k_bins = len(pooled_obs)
            # Degrees of freedom = k_bins - 1 (sum constraint) - 1 (estimated lambda)
            df = k_bins - 2
            if df >= 1:
                # Chi square statistic
                stat = float(np.sum([(o - e)**2 / e for o, e in zip(pooled_obs, pooled_exp)]))
                p_val = float(stats.chi2.sf(stat, df))
                chi_stat = stat
                chi_df = df
                chi_p = p_val

        # Rule-based Adequacy Status
        limitations = [
            "Assumes constant event rate λ throughout the entire cycle series.",
            "Assumes independence between discharge cycles (no memory or degradation carryover).",
            "Sensitive to temporal clustering during battery end-of-life knee points."
        ]

        if n < 15 or total_events < 5:
            adequacy_status = "Insufficient Evidence"
            adequacy_rationale = (
                f"Sample size ({n} cycles, {total_events} events) is below statistical threshold "
                "for robust Poisson parameter verification."
            )
        elif dispersion is not None and dispersion > 1.30:
            adequacy_status = "Caution: Overdispersed Process"
            adequacy_rationale = (
                f"Dispersion index D = {dispersion:.2f} significantly exceeds 1.0. "
                "Event variance exceeds the Poisson mean, indicating event clustering or non-stationary aging."
            )
        elif dispersion is not None and dispersion < 0.80:
            adequacy_status = "Caution: Underdispersed Process"
            adequacy_rationale = (
                f"Dispersion index D = {dispersion:.2f} is well below 1.0. "
                "Events are more regular than expected under pure random Poisson arrivals."
            )
        elif chi_p is not None and chi_p < 0.01:
            adequacy_status = "Caution: Goodness-of-Fit Rejection"
            adequacy_rationale = (
                f"Chi-Square goodness-of-fit test rejects the Poisson distribution (p = {chi_p:.4f} < 0.01). "
                "Empirical counts deviate significantly from theoretical expectations."
            )
        else:
            adequacy_status = "Supported by Current Diagnostics"
            adequacy_rationale = (
                f"Dispersion index D = {dispersion:.2f} is near 1.0 and frequency counts "
                "align with theoretical Poisson expectations."
            )

        return PoissonAnalysisResult(
            n_observations=n,
            total_events=total_events,
            lambda_rate=lam,
            lambda_ci_95=ci_95,
            mean=mean_val,
            variance=var_val,
            dispersion_index=dispersion,
            dispersion_label=dispersion_label,
            observed_frequencies=observed_freq,
            expected_frequencies=expected_freq,
            conservation_difference=conservation_diff,
            probabilities=probs,
            chi_square_stat=chi_stat,
            chi_square_df=chi_df,
            chi_square_p_value=chi_p,
            adequacy_status=adequacy_status,
            adequacy_rationale=adequacy_rationale,
            limitations=limitations
        )
