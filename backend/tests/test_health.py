from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Verify that GET /api/health returns 200 OK and valid status attributes."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app_name" in data
    assert "version" in data
    assert "model_loaded" in data
    assert "audio_model_loaded" in data
    assert "audio_model_name" in data

def test_root_endpoint():
    """Verify root endpoint responds with API metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "TruthLens" in data["message"]
