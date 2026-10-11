"""
Comprehensive Unit Tests for ThermoScope Statistical Engine.
Verifies Poisson calculations, Exponential waiting-time models,
event semantics, regime shift, and decision rules.
"""

import math
import numpy as np
import pandas as pd
import pytest
import scipy.stats as stats

from thermoscope.engine import (
    EventPreprocessor,
    PoissonModelEngine,
    ExponentialModelEngine,
    RegimeShiftEngine,
    ThresholdSensitivityEngine,
    DecisionRulesEngine
)


class TestPoissonEngine:
    def test_poisson_probabilities_and_distinction(self):
        """Test exact probabilities and distinction between P(X >= 3) and P(X > 3)."""
        lam = 2.5
        probs = PoissonModelEngine.calculate_probabilities(lam, query_k=3)
        
        # P(X = 0) = exp(-2.5) ~ 0.082085
        assert math.isclose(probs["P_0"], math.exp(-2.5), rel_tol=1e-5)
        
        # P(X = 3) = 2.5^3 * exp(-2.5) / 6 ~ 0.213763
        expected_p3 = (2.5**3 * math.exp(-2.5)) / 6.0
        assert math.isclose(probs["P_3"], expected_p3, rel_tol=1e-5)
        
        # Distinction: P(X >= 3) MUST be strictly greater than P(X > 3) by exactly P(X = 3)
        assert probs["P_ge_3"] > probs["P_gt_3"]
        diff = probs["P_ge_3"] - probs["P_gt_3"]
        assert math.isclose(diff, probs["P_3"], rel_tol=1e-5)

    def test_observed_and_expected_conservation(self):
        """Test expected frequencies total conservation check (sum E_k == n)."""
        counts = [0, 1, 0, 2, 1, 0, 3, 4, 1, 0, 0, 2, 5, 1, 0]
        n = len(counts)
        res = PoissonModelEngine.fit(counts)
        
        # Total expected must equal total n
        total_expected = sum(res.expected_frequencies.values())
        assert math.isclose(total_expected, n, abs_tol=1e-5)
        assert res.conservation_difference < 1e-5
        
        # Correct 4-or-more grouped count
        assert "4+" in res.observed_frequencies
        assert res.observed_frequencies["4+"] == 2  # counts 4 and 5

    def test_dispersion_and_zero_mean_edge_cases(self):
        """Test dispersion calculation and edge case with zero events."""
        # Zero-events edge case
        zero_counts = [0, 0, 0, 0, 0]
        res_zero = PoissonModelEngine.fit(zero_counts)
        assert res_zero.lambda_rate == 0.0
        assert res_zero.dispersion_index is None
        assert "Zero-event" in res_zero.dispersion_label
        
        # Overdispersed case: many zeros, one huge spike
        clustered = [0, 0, 0, 0, 0, 0, 10, 0, 0, 12]
        res_clustered = PoissonModelEngine.fit(clustered)
        assert res_clustered.dispersion_index is not None
        assert res_clustered.dispersion_index > 1.3
        assert "Overdispersed" in res_clustered.dispersion_label

    def test_garwood_ci_bounds(self):
        """Test exact Garwood confidence intervals."""
        n = 100
        total_events = 50  # lambda = 0.5
        lower, upper = PoissonModelEngine.calculate_garwood_ci(total_events, n, confidence=0.95)
        assert 0.0 < lower < 0.5 < upper
        # Confidence interval coverage check
        assert lower >= 0.0


class TestExponentialEngine:
    def test_exponential_cdf_survival_and_mtbe(self):
        """Test Exponential CDF, survival, and expected waiting time."""
        # Mean waiting time = 5.0, lambda = 0.2
        waiting_times = [4.0, 6.0, 5.0, 5.0]
        res = ExponentialModelEngine.fit(waiting_times, time_unit="cycles")
        
        assert math.isclose(res.mean_waiting_time, 5.0, rel_tol=1e-5)
        assert math.isclose(res.lambda_rate, 0.2, rel_tol=1e-5)
        assert math.isclose(res.expected_waiting_time, 5.0, rel_tol=1e-5)
        
        eval_t = ExponentialModelEngine.evaluate_at(5.0, 0.2)
        # S(5) = exp(-0.2 * 5) = exp(-1) ~ 0.367879
        assert math.isclose(eval_t["survival"], math.exp(-1.0), rel_tol=1e-4)
        assert math.isclose(eval_t["cdf"], 1.0 - math.exp(-1.0), rel_tol=1e-4)

    def test_coefficient_of_variation_diagnostics(self):
        """Test CV diagnostics for exponential suitability."""
        # Exactly uniform spacing -> low CV (hypo-exponential)
        regular = [10.0, 10.0, 10.0, 10.0, 10.0]
        res_reg = ExponentialModelEngine.fit(regular, time_unit="cycles")
        assert res_reg.coefficient_of_variation is not None
        assert res_reg.coefficient_of_variation < 0.8
        assert "Hypo-exponential" in res_reg.cv_label

    def test_invalid_and_empty_waiting_times(self):
        """Test handling of empty, zero, or negative waiting times."""
        invalid = [0.0, -2.5, 0.0]
        res = ExponentialModelEngine.fit(invalid, time_unit="cycles")
        assert res.n_intervals == 0
        assert res.lambda_rate == 0.0
        assert res.adequacy_status == "Insufficient Evidence"


class TestEventPreprocessor:
    def test_reading_vs_episode_semantics(self):
        """Test that Reading Mode counts every tick, while Episode Mode counts contiguous runs."""
        # Sequence with one 3-sample overheat event in cycle 1, and one 2-sample event in cycle 2
        df = pd.DataFrame({
            "cycle": [1, 1, 1, 1, 1, 2, 2, 2, 2],
            "time": [10, 20, 30, 40, 50, 10, 20, 30, 40],
            "temperature": [38.0, 41.0, 41.5, 40.8, 38.5, 39.0, 40.5, 41.0, 39.0]
        })
        
        prep = EventPreprocessor(default_threshold=40.0, hysteresis=0.2)
        
        res_read = prep.process(df, mode="reading", threshold=40.0)
        res_ep = prep.process(df, mode="episode", threshold=40.0)
        
        # Cycle 1: 3 readings > 40 vs 1 episode
        assert res_read.cycles_df.loc[res_read.cycles_df["cycle"] == 1, "reading_count"].iloc[0] == 3
        assert res_ep.cycles_df.loc[res_ep.cycles_df["cycle"] == 1, "episode_count"].iloc[0] == 1
        
        # Total counts: reading = 3 + 2 = 5, episode = 1 + 1 = 2
        assert res_read.cycles_df["event_count"].sum() == 5
        assert res_ep.cycles_df["event_count"].sum() == 2

    def test_data_cleaning_and_non_physical_rejection(self):
        """Test rejection of non-physical temperatures and NaNs."""
        df = pd.DataFrame({
            "cycle": [1, 1, 1, 1],
            "time": [0, 10, 20, 30],
            "temperature": [25.0, np.nan, 250.0, 32.0]  # 250°C is non-physical
        })
        prep = EventPreprocessor()
        clean_df, warnings, excluded = prep.validate_and_normalize_dataframe(df)
        assert excluded == 2
        assert len(clean_df) == 2


class TestRegimeShiftAndDecisionRules:
    def test_regime_shift_detection(self):
        """Test lifecycle stage partition and non-stationarity detection."""
        # Early cycles 1-30: 0 events
        # Mid cycles 31-70: 0.1 events
        # Late cycles 71-100: 2 events per cycle
        cycles = []
        for c in range(1, 101):
            if c <= 30:
                ev = 0
                max_t = 36.0
            elif c <= 70:
                ev = 1 if c % 10 == 0 else 0
                max_t = 39.5
            else:
                ev = 2
                max_t = 42.5
            cycles.append({
                "cycle": c,
                "event_count": ev,
                "reading_count": ev * 5,
                "episode_count": ev,
                "min_temperature": 24.0,
                "mean_temperature": 32.0,
                "max_temperature": max_t,
                "duration_s": 3000.0
            })
            
        df = pd.DataFrame(cycles)
        res = RegimeShiftEngine.analyze_stages(df)
        assert len(res["stages"]) == 3
        assert res["has_regime_shift"] is True
        assert "Non-overlapping" in res["shift_evidence"][0] or "higher" in res["shift_evidence"][0]

    def test_decision_rules_alert_generation(self):
        """Test SAFE, WARNING, and HIGH RISK classifications."""
        cycles = [
            {"cycle": 1, "event_count": 0, "max_temperature": 35.0},
            {"cycle": 2, "event_count": 1, "max_temperature": 40.5},
            {"cycle": 3, "event_count": 1, "max_temperature": 40.8},
            {"cycle": 4, "event_count": 1, "max_temperature": 41.0}, # triggers consecutive run
            {"cycle": 5, "event_count": 1, "max_temperature": 44.0}, # triggers critical temp
        ]
        df = pd.DataFrame(cycles)
        engine = DecisionRulesEngine(critical_temp_c=43.0, consecutive_anomaly_window=3)
        dec = engine.evaluate_cycles(df, base_threshold_c=40.0)
        
        assert dec["overall_classification"] == "HIGH RISK"
        assert dec["alert_counts"]["HIGH RISK"] >= 1
        assert dec["alert_counts"]["WARNING"] >= 1
        assert "ThermoScope is an analytical research" in dec["disclaimer"]
