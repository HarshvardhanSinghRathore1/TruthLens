import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_inference_pipeline_on_sample_videos():
    """Verify end-to-end model inference, schema conformity, and honest assessments."""
    with TestClient(app) as client:
        # 1. Health check with model status
        health = client.get("/api/health")
        assert health.status_code == 200
        health_data = health.json()
        assert health_data["status"] == "ok"
        assert health_data["model_loaded"] is True
        assert "Vision Transformer" in health_data["model_name"]

        # 2. Analyze video without faces -> unable_to_assess
        sample_nf = os.path.join("samples", "demo_no_face.mp4")
        if os.path.exists(sample_nf):
            with open(sample_nf, "rb") as f:
                resp = client.post("/api/analyze", files={"file": ("demo_no_face.mp4", f, "video/mp4")})
            assert resp.status_code == 200
            data = resp.json()
            assert data["result"] == "unable_to_assess"
            assert data["risk_score"] is None
            assert "requires localized human faces" in data["summary"]
            assert data["frames_analyzed"] > 0

        # 3. Analyze video with faces -> structured response with genuine model scores
        sample_auth = os.path.join("samples", "demo_authentic.mp4")
        if os.path.exists(sample_auth):
            with open(sample_auth, "rb") as f:
                resp = client.post("/api/analyze", files={"file": ("demo_authentic.mp4", f, "video/mp4")})
            assert resp.status_code == 200
            data = resp.json()
            assert data["analysis_id"].startswith("tl-")
            assert data["status"] == "completed"
            assert data["result"] in [
                "potential_manipulation_detected",
                "no_strong_signs_detected",
                "unable_to_assess"
            ]
            assert isinstance(data["findings"], list)
            assert len(data["findings"]) > 0
            assert isinstance(data["limitations"], list)
            assert len(data["limitations"]) > 0
            assert len(data["frame_results"]) > 0
            # Confirm frames have scores and timestamps
            first_frame = data["frame_results"][0]
            assert "frame_index" in first_frame
            assert "timestamp_seconds" in first_frame
            assert "manipulation_score" in first_frame
