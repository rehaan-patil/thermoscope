export interface DatasetMetadata {
  name: string;
  total_readings: number;
  total_cycles: number;
  excluded_records: number;
  file_sha256: string;
  is_synthetic: boolean;
  provenance: string;
  warnings: string[];
}

export interface AnalysisOptions {
  mode: "reading" | "episode";
  threshold: number;
  query_k: number;
  critical_temp_c: number;
  consecutive_anomaly_window: number;
  episode_burst_threshold: number;
}

export interface CycleDataPoint {
  cycle: number;
  event_count: number;
  reading_count: number;
  episode_count: number;
  min_temperature: number;
  mean_temperature: number;
  max_temperature: number;
  duration_s: number;
}

export interface PoissonResults {
  n_observations: number;
  total_events: number;
  lambda_rate: number;
  lambda_ci_95: [number, number];
  mean: number;
  variance: number;
  dispersion_index: number | null;
  dispersion_label: string;
  observed_frequencies: {
    "0": number;
    "1": number;
    "2": number;
    "3": number;
    "4+": number;
  };
  expected_frequencies: {
    "0": number;
    "1": number;
    "2": number;
    "3": number;
    "4+": number;
  };
  conservation_difference: number;
  probabilities: Record<string, number>;
  chi_square_stat: number | null;
  chi_square_df: number | null;
  chi_square_p_value: number | null;
  adequacy_status: string;
  adequacy_rationale: string;
  limitations: string[];
}

export interface ExponentialDensityPoint {
  t: number;
  pdf: number;
  cdf: number;
  survival: number;
}

export interface ExponentialResults {
  n_intervals: number;
  mean_waiting_time: number;
  std_waiting_time: number;
  lambda_rate: number;
  lambda_ci_95: [number, number];
  expected_waiting_time: number;
  coefficient_of_variation: number | null;
  cv_label: string;
  time_unit: string;
  density_curve: ExponentialDensityPoint[];
  empirical_quantiles: Record<string, number>;
  adequacy_status: string;
  adequacy_rationale: string;
  limitations: string[];
}

export interface LifecycleStage {
  stage_name: string;
  start_cycle: number;
  end_cycle: number;
  n_cycles: number;
  total_events: number;
  lambda_rate: number;
  lambda_ci_95: [number, number];
  dispersion_index: number | null;
  percent_cycles_with_events: number;
  max_temperature: number;
  mean_temperature: number;
}

export interface RegimeShiftResults {
  stages: LifecycleStage[];
  has_regime_shift: boolean;
  conclusion: string;
  shift_evidence: string[];
  recommendation: string;
  caveat: string;
}

export interface SensitivityPoint {
  threshold_c: number;
  total_events: number;
  lambda_rate: number;
  lambda_ci_lower: number;
  lambda_ci_upper: number;
  dispersion_index: number | null;
  cycles_with_events: number;
  percent_cycles_with_events: number;
  adequacy_status: string;
  n_waiting_intervals: number;
}

export interface SensitivityResults {
  mode: string;
  points: SensitivityPoint[];
  narrative: string;
  disclaimer: string;
}

export interface EngineeringAlert {
  alert_id: string;
  cycle: number;
  severity: "SAFE" | "WARNING" | "HIGH RISK";
  rule_id: string;
  rule_name: string;
  trigger_condition: string;
  observed_value: number | string;
  threshold_value: number | string;
  rationale: string;
  manufacturer_reminder: string;
  limitations: string;
}

export interface DecisionCenterResults {
  overall_classification: "SAFE" | "WARNING" | "HIGH RISK";
  total_cycles_evaluated: number;
  alerts: EngineeringAlert[];
  alert_counts: {
    SAFE: number;
    WARNING: number;
    "HIGH RISK": number;
  };
  disclaimer: string;
}

export interface FullAnalysisResponse {
  metadata: DatasetMetadata;
  options: AnalysisOptions;
  cycles: CycleDataPoint[];
  poisson: PoissonResults;
  exponential: ExponentialResults;
  regime_shift: RegimeShiftResults;
  threshold_sensitivity: SensitivityResults;
  decision_center: DecisionCenterResults;
}
