"""
Pydantic schemas for ThermoScope REST API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DatasetMetadata(BaseModel):
    name: str = Field(..., description="Dataset name or identifier")
    total_readings: int = Field(..., description="Total raw measurement samples")
    total_cycles: int = Field(..., description="Number of observed discharge cycles")
    excluded_records: int = Field(0, description="Records excluded due to NaN or non-physical values")
    file_sha256: str = Field(..., description="Cryptographic SHA-256 fingerprint")
    is_synthetic: bool = Field(False, description="Flag indicating whether data is synthetic")
    provenance: str = Field(..., description="Origin and citation of data")
    warnings: List[str] = Field(default_factory=list)


class AnalysisOptions(BaseModel):
    mode: str = Field("episode", description="Event definition: 'episode' or 'reading'")
    threshold: float = Field(40.0, description="Temperature threshold in degrees Celsius")
    query_k: int = Field(3, description="Specific event count k for probability evaluation")
    critical_temp_c: float = Field(43.0, description="Critical temperature rule limit (°C)")
    consecutive_anomaly_window: int = Field(3, description="Consecutive cycle anomaly rule threshold")
    episode_burst_threshold: int = Field(2, description="Intra-cycle episode burst rule threshold")


class ProbabilityCalculationRequest(BaseModel):
    lambda_rate: float = Field(..., ge=0.0, description="Poisson event rate parameter lambda")
    query_k: int = Field(3, ge=0, description="Event count k")


class ProbabilityCalculationResponse(BaseModel):
    lambda_rate: float
    query_k: int
    probabilities: Dict[str, float]


class CycleDataPoint(BaseModel):
    cycle: int
    event_count: int
    reading_count: int
    episode_count: int
    min_temperature: float
    mean_temperature: float
    max_temperature: float
    duration_s: float


class FullAnalysisResponse(BaseModel):
    metadata: DatasetMetadata
    options: AnalysisOptions
    cycles: List[CycleDataPoint]
    poisson: Dict[str, Any]
    exponential: Dict[str, Any]
    regime_shift: Dict[str, Any]
    threshold_sensitivity: Dict[str, Any]
    decision_center: Dict[str, Any]


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    dataset_loaded: bool
    b0005_cycle_count: int
