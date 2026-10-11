"""
Event Preprocessing Engine for ThermoScope.
Handles raw telemetry validation, event semantics (Reading vs Episode),
hysteresis, episode merging, and cycle-level aggregation.
"""

from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np


class PreprocessingResult:
    def __init__(
        self,
        cycles_df: pd.DataFrame,
        events_df: pd.DataFrame,
        waiting_times: List[float],
        time_unit: str,
        mode: str,
        threshold: float,
        total_readings: int,
        excluded_records: int,
        validation_warnings: List[str]
    ):
        self.cycles_df = cycles_df
        self.events_df = events_df
        self.waiting_times = waiting_times
        self.time_unit = time_unit
        self.mode = mode
        self.threshold = threshold
        self.total_readings = total_readings
        self.excluded_records = excluded_records
        self.validation_warnings = validation_warnings


class EventPreprocessor:
    """Preprocesses raw battery thermal telemetry into structured cycle and event observations."""

    def __init__(
        self,
        default_threshold: float = 40.0,
        hysteresis: float = 0.2,
        merge_time_window_s: float = 30.0
    ):
        self.default_threshold = default_threshold
        self.hysteresis = hysteresis
        self.merge_time_window_s = merge_time_window_s

    def validate_and_normalize_dataframe(
        self,
        df: pd.DataFrame,
        column_mapping: Optional[Dict[str, str]] = None
    ) -> Tuple[pd.DataFrame, List[str], int]:
        """Validates CSV input and normalizes column headers."""
        warnings: List[str] = []
        original_count = len(df)
        
        # Apply user column mapping if provided
        if column_mapping:
            df = df.rename(columns=column_mapping)

        # Standard canonical column resolution
        col_lower = {str(c).lower().strip(): c for c in df.columns}
        
        # Resolve cycle
        cycle_col = None
        for candidate in ["cycle", "cycle_id", "cycle_index", "discharge_cycle"]:
            if candidate in col_lower:
                cycle_col = col_lower[candidate]
                break
                
        # Resolve temperature
        temp_col = None
        for candidate in ["temperature_c", "temperature", "temp", "temp_c", "temperature_measured"]:
            if candidate in col_lower:
                temp_col = col_lower[candidate]
                break
                
        # Resolve time
        time_col = None
        for candidate in ["time_s", "time", "timestamp", "elapsed_time", "elapsed_time_s"]:
            if candidate in col_lower:
                time_col = col_lower[candidate]
                break
                
        if temp_col is None:
            raise ValueError(f"Required temperature column missing. Found columns: {list(df.columns)}")

        # Rename to canonical internal columns
        normalized_df = pd.DataFrame()
        normalized_df["temperature"] = pd.to_numeric(df[temp_col], errors="coerce")
        
        if cycle_col:
            normalized_df["cycle"] = pd.to_numeric(df[cycle_col], errors="coerce")
        else:
            warnings.append("No cycle column found; treating entire sequence as Cycle 1.")
            normalized_df["cycle"] = 1

        if time_col:
            normalized_df["time"] = pd.to_numeric(df[time_col], errors="coerce")
        else:
            warnings.append("No timestamp column found; synthesizing unit sample step indices.")
            normalized_df["time"] = np.arange(len(df), dtype=float)

        # Drop invalid temperature rows
        valid_mask = normalized_df["temperature"].notna() & normalized_df["cycle"].notna()
        # Physical bounds: -20°C to 120°C
        physical_mask = (normalized_df["temperature"] >= -20.0) & (normalized_df["temperature"] <= 120.0)
        valid_mask = valid_mask & physical_mask

        excluded_count = int((~valid_mask).sum())
        if excluded_count > 0:
            warnings.append(f"Excluded {excluded_count} malformed or non-physical temperature records.")

        clean_df = normalized_df[valid_mask].copy()
        clean_df["cycle"] = clean_df["cycle"].astype(int)
        clean_df = clean_df.sort_values(by=["cycle", "time"]).reset_index(drop=True)

        return clean_df, warnings, excluded_count

    def process(
        self,
        df: pd.DataFrame,
        mode: str = "episode",  # 'reading' or 'episode'
        threshold: Optional[float] = None,
        merge_episodes: bool = True
    ) -> PreprocessingResult:
        """
        Process normalized telemetry into cycle aggregations and inter-event waiting times.
        mode:
          - 'reading': counts every sample where T > threshold
          - 'episode': counts distinct crossings with hysteresis
        """
        th = threshold if threshold is not None else self.default_threshold
        clean_df, warnings, excluded = self.validate_and_normalize_dataframe(df)

        clean_df["is_reading_event"] = clean_df["temperature"] > th
        clean_df["is_episode_event"] = False

        # Group by cycle
        cycle_records = []
        waiting_times: List[float] = []
        all_event_timestamps: List[float] = []
        all_event_cycles: List[int] = []

        for cycle_id, group in clean_df.groupby("cycle"):
            temps = group["temperature"].values
            times = group["time"].values
            indices = group.index.values

            min_t = float(np.min(temps))
            max_t = float(np.max(temps))
            mean_t = float(np.mean(temps))
            reading_count = int(np.sum(temps > th))
            
            # Detect episodes within this cycle
            episode_count = 0
            in_episode = False
            last_episode_end_time = -1e9

            for i in range(len(temps)):
                curr_t = temps[i]
                curr_time = times[i]
                
                if curr_t > th:
                    if not in_episode:
                        # Check if within merge window from last episode end
                        if merge_episodes and (curr_time - last_episode_end_time <= self.merge_time_window_s):
                            # Merged with previous episode
                            in_episode = True
                        else:
                            in_episode = True
                            clean_df.loc[indices[i], "is_episode_event"] = True
                            episode_count += 1
                            all_event_timestamps.append(curr_time)
                            all_event_cycles.append(cycle_id)
                else:
                    if in_episode and curr_t <= (th - self.hysteresis):
                        in_episode = False
                        last_episode_end_time = curr_time

            # Selected event count for cycle based on mode
            selected_count = reading_count if mode == "reading" else episode_count

            cycle_records.append({
                "cycle": int(cycle_id),
                "reading_count": reading_count,
                "episode_count": episode_count,
                "event_count": selected_count,
                "min_temperature": round(min_t, 3),
                "mean_temperature": round(mean_t, 3),
                "max_temperature": round(max_t, 3),
                "duration_s": round(float(times[-1] - times[0]), 2) if len(times) > 0 else 0.0
            })

        cycles_df = pd.DataFrame(cycle_records).sort_values("cycle").reset_index(drop=True)

        # Calculate waiting times
        # If multiple events occur across cycles, waiting times between consecutive event occurrences:
        if mode == "episode":
            # For inter-event intervals between distinct episodes:
            # If within-cycle episodes exist, use physical seconds where available, else inter-cycle delta
            event_cycles = cycles_df[cycles_df["event_count"] > 0]["cycle"].values
            if len(event_cycles) > 1:
                # Inter-cycle waiting times (in cycles)
                inter_cycle_gaps = np.diff(event_cycles)
                waiting_times = [float(g) for g in inter_cycle_gaps if g > 0]
                time_unit = "cycles"
            else:
                waiting_times = []
                time_unit = "cycles"
        else:
            # Reading mode: waiting times between consecutive cycles with reading events
            event_cycles = cycles_df[cycles_df["event_count"] > 0]["cycle"].values
            if len(event_cycles) > 1:
                inter_cycle_gaps = np.diff(event_cycles)
                waiting_times = [float(g) for g in inter_cycle_gaps if g > 0]
                time_unit = "cycles"
            else:
                waiting_times = []
                time_unit = "cycles"

        return PreprocessingResult(
            cycles_df=cycles_df,
            events_df=clean_df,
            waiting_times=waiting_times,
            time_unit=time_unit,
            mode=mode,
            threshold=th,
            total_readings=len(clean_df),
            excluded_records=excluded,
            validation_warnings=warnings
        )
