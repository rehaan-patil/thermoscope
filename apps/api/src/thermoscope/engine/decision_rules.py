"""
Explainable Engineering Decision Engine for ThermoScope.
Evaluates cycle telemetry and statistical indicators against transparent rules,
producing classified alerts (SAFE, WARNING, HIGH RISK) with full audit trails.
"""

from typing import List, Dict, Any, Optional
import pandas as pd


STANDARD_DISCLAIMER = (
    "ThermoScope is an analytical research and decision-support application. "
    "Its thresholds and alert rules are not certified safety limits. "
    "It does not independently predict or prevent thermal runaway and does not "
    "replace a certified battery management system or manufacturer safety procedures."
)


class EngineeringAlert:
    def __init__(
        self,
        alert_id: str,
        cycle: int,
        severity: str,  # 'SAFE', 'WARNING', 'HIGH RISK'
        rule_id: str,
        rule_name: str,
        trigger_condition: str,
        observed_value: Any,
        threshold_value: Any,
        rationale: str,
        manufacturer_reminder: str,
        limitations: str
    ):
        self.alert_id = alert_id
        self.cycle = cycle
        self.severity = severity
        self.rule_id = rule_id
        self.rule_name = rule_name
        self.trigger_condition = trigger_condition
        self.observed_value = observed_value
        self.threshold_value = threshold_value
        self.rationale = rationale
        self.manufacturer_reminder = manufacturer_reminder
        self.limitations = limitations

    def to_dict(self) -> Dict[str, Any]:
        return {
            "alert_id": self.alert_id,
            "cycle": self.cycle,
            "severity": self.severity,
            "rule_id": self.rule_id,
            "rule_name": self.rule_name,
            "trigger_condition": self.trigger_condition,
            "observed_value": self.observed_value,
            "threshold_value": self.threshold_value,
            "rationale": self.rationale,
            "manufacturer_reminder": self.manufacturer_reminder,
            "limitations": self.limitations
        }


class DecisionRulesEngine:
    """Configurable rule evaluator generating auditable decision records."""

    def __init__(
        self,
        critical_temp_c: float = 43.0,
        consecutive_anomaly_window: int = 3,
        episode_burst_threshold: int = 2
    ):
        self.critical_temp_c = critical_temp_c
        self.consecutive_anomaly_window = consecutive_anomaly_window
        self.episode_burst_threshold = episode_burst_threshold

    def evaluate_cycles(
        self,
        cycles_df: pd.DataFrame,
        base_threshold_c: float = 40.0
    ) -> Dict[str, Any]:
        """Evaluates sequence of discharge cycles against safety decision rules."""
        if cycles_df.empty:
            return {
                "overall_classification": "SAFE",
                "alerts": [],
                "alert_counts": {"SAFE": 0, "WARNING": 0, "HIGH RISK": 0},
                "disclaimer": STANDARD_DISCLAIMER
            }

        alerts: List[Dict[str, Any]] = []
        consecutive_active_count = 0
        counts_by_severity = {"SAFE": 0, "WARNING": 0, "HIGH RISK": 0}

        for idx, row in cycles_df.iterrows():
            cycle_num = int(row["cycle"])
            max_t = float(row.get("max_temperature", 0.0))
            events = int(row.get("event_count", 0))

            alert_obj: Optional[EngineeringAlert] = None

            if events > 0:
                consecutive_active_count += 1
            else:
                consecutive_active_count = 0

            # Rule 1: Critical Temperature Excursion (HIGH RISK)
            if max_t >= self.critical_temp_c:
                alert_obj = EngineeringAlert(
                    alert_id=f"ALT-HR-T-{cycle_num}",
                    cycle=cycle_num,
                    severity="HIGH RISK",
                    rule_id="RULE-01-CRIT-TEMP",
                    rule_name="Critical Surface Temperature Excursion",
                    trigger_condition=f"Max temperature ({max_t:.2f}°C) exceeded critical limit ({self.critical_temp_c:.1f}°C)",
                    observed_value=round(max_t, 2),
                    threshold_value=self.critical_temp_c,
                    rationale=(
                        f"Discharge cycle {cycle_num} reached {max_t:.2f}°C. Sustained operations at this level "
                        "accelerate SEI breakdown and cathode transition metal dissolution."
                    ),
                    manufacturer_reminder="Consult OEM service manual; verify active thermal management coolant loop flow rate.",
                    limitations="Evaluated from exterior surface thermocouple; cell core temperature may be 3-6°C higher."
                )

            # Rule 2: Consecutive Degradation Run (HIGH RISK)
            elif consecutive_active_count >= self.consecutive_anomaly_window:
                alert_obj = EngineeringAlert(
                    alert_id=f"ALT-HR-RUN-{cycle_num}",
                    cycle=cycle_num,
                    severity="HIGH RISK",
                    rule_id="RULE-02-CONSEC-BURST",
                    rule_name="Persistent Consecutive Thermal Anomaly Run",
                    trigger_condition=f"{consecutive_active_count} consecutive cycles with thermal events (window={self.consecutive_anomaly_window})",
                    observed_value=consecutive_active_count,
                    threshold_value=self.consecutive_anomaly_window,
                    rationale=(
                        f"Cell has sustained thermal exceedances across {consecutive_active_count} consecutive cycles, "
                        "indicating systemic impedance increase rather than an isolated transient excursion."
                    ),
                    manufacturer_reminder="Schedule cell impedance spectroscopy check; inspect module contact resistance.",
                    limitations="Rule assumes identical ambient conditions between cycles."
                )

            # Rule 3: Intra-Cycle Event Burst (WARNING)
            elif events >= self.episode_burst_threshold:
                alert_obj = EngineeringAlert(
                    alert_id=f"ALT-WN-BURST-{cycle_num}",
                    cycle=cycle_num,
                    severity="WARNING",
                    rule_id="RULE-03-EVENT-BURST",
                    rule_name="Intra-Cycle Event Frequency Surge",
                    trigger_condition=f"Cycle generated {events} distinct episodes (limit={self.episode_burst_threshold})",
                    observed_value=events,
                    threshold_value=self.episode_burst_threshold,
                    rationale=(
                        f"Cycle {cycle_num} registered multiple thermal episodes ({events}), "
                        "indicating oscillating thermal equilibrium under discharge."
                    ),
                    manufacturer_reminder="Review current discharge load profile and ambient ventilation airflow.",
                    limitations="Multi-episode counting depends on hysteresis and merge window configuration."
                )

            # Rule 4: Moderate Threshold Exceedance (WARNING)
            elif events > 0 or max_t > base_threshold_c:
                alert_obj = EngineeringAlert(
                    alert_id=f"ALT-WN-EXC-{cycle_num}",
                    cycle=cycle_num,
                    severity="WARNING",
                    rule_id="RULE-04-MOD-EXCEED",
                    rule_name="Moderate Analytical Threshold Exceedance",
                    trigger_condition=f"Peak temperature ({max_t:.2f}°C) exceeded analytical threshold ({base_threshold_c:.1f}°C)",
                    observed_value=round(max_t, 2),
                    threshold_value=base_threshold_c,
                    rationale=(
                        f"Cycle {cycle_num} peaked at {max_t:.2f}°C, above the nominal {base_threshold_c:.1f}°C threshold. "
                        "Initial indication of cell thermal rise."
                    ),
                    manufacturer_reminder="Log telemetry for trend monitoring across upcoming operating cycles.",
                    limitations="Analytical threshold is an experimental research parameter, not an absolute safety trip."
                )

            if alert_obj:
                alerts.append(alert_obj.to_dict())
                counts_by_severity[alert_obj.severity] += 1
            else:
                counts_by_severity["SAFE"] += 1

        # Determine overall classification
        if counts_by_severity["HIGH RISK"] > 0:
            overall = "HIGH RISK"
        elif counts_by_severity["WARNING"] > 0:
            overall = "WARNING"
        else:
            overall = "SAFE"

        return {
            "overall_classification": overall,
            "total_cycles_evaluated": len(cycles_df),
            "alerts": alerts,
            "alert_counts": counts_by_severity,
            "disclaimer": STANDARD_DISCLAIMER
        }
