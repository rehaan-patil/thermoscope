"""
Integration and API endpoint tests for ThermoScope FastAPI service.
"""

import pytest
from starlette.testclient import TestClient
from thermoscope.api.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"
    assert data["dataset_loaded"] is True
    assert data["b0005_cycle_count"] == 168


def test_dataset_sample_endpoint():
    response = client.get("/api/v1/dataset/sample")
    assert response.status_code == 200
    data = response.json()
    assert "metadata" in data
    assert data["metadata"]["battery_id"] == "B0005"
    assert len(data["preview_rows"]) > 0


def test_probability_calculation_endpoint():
    payload = {"lambda_rate": 1.5, "query_k": 3}
    response = client.post("/api/v1/analytics/probability", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "probabilities" in data
    assert "P_0" in data["probabilities"]
    assert "P_ge_3" in data["probabilities"]
    assert "P_gt_3" in data["probabilities"]
    assert data["probabilities"]["P_ge_3"] > data["probabilities"]["P_gt_3"]


def test_analytics_run_default():
    payload = {
        "options": {
            "mode": "episode",
            "threshold": 40.0,
            "query_k": 3,
            "critical_temp_c": 43.0,
            "consecutive_anomaly_window": 3,
            "episode_burst_threshold": 2
        }
    }
    response = client.post("/api/v1/analytics/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["metadata"]["total_cycles"] == 168
    assert len(data["cycles"]) == 168
    
    # Poisson results
    assert "poisson" in data
    assert data["poisson"]["total_events"] > 0
    assert "conservation_difference" in data["poisson"]
    assert data["poisson"]["conservation_difference"] < 1e-4
    
    # Exponential results
    assert "exponential" in data
    assert data["exponential"]["mean_waiting_time"] > 0
    assert data["exponential"]["time_unit"] == "cycles"
    
    # Regime shift
    assert "regime_shift" in data
    assert len(data["regime_shift"]["stages"]) == 3
    
    # Threshold sensitivity
    assert "threshold_sensitivity" in data
    assert len(data["threshold_sensitivity"]["points"]) > 0
    
    # Decision Center
    assert "decision_center" in data
    assert data["decision_center"]["overall_classification"] in ["SAFE", "WARNING", "HIGH RISK"]


def test_analytics_run_reading_vs_episode_semantics():
    """Verify that Reading Mode yields significantly higher event count than Episode Mode on NASA data."""
    res_ep = client.post("/api/v1/analytics/run", json={"options": {"mode": "episode", "threshold": 40.0}})
    res_read = client.post("/api/v1/analytics/run", json={"options": {"mode": "reading", "threshold": 40.0}})
    
    data_ep = res_ep.json()
    data_read = res_read.json()
    
    # Reading mode counts every sensor sample > 40C; Episode mode counts only threshold excursions
    assert data_read["poisson"]["total_events"] > data_ep["poisson"]["total_events"]
    assert data_read["poisson"]["lambda_rate"] > data_ep["poisson"]["lambda_rate"]


def test_evidence_pack_manifest_and_csv_export():
    payload = {"options": {"mode": "episode", "threshold": 40.0}}
    
    # Test JSON manifest
    res_manifest = client.post("/api/v1/export/manifest", json=payload)
    assert res_manifest.status_code == 200
    manifest = res_manifest.json()
    assert manifest["manifest_type"] == "ReproducibleEvidencePack"
    assert "dataset_provenance" in manifest
    assert "sha256" in manifest["dataset_provenance"]
    
    # Test CSV export
    res_csv = client.post("/api/v1/export/csv", json=payload)
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "cycle,min_temperature_c" in res_csv.text
