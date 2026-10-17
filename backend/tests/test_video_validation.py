import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_rejects_unsupported_extension():
    """Verify that uploading an unsupported file format (.txt) returns 400."""
    fake_file = io.BytesIO(b"dummy text content")
    response = client.post(
        "/api/analyze",
        files={"file": ("test.txt", fake_file, "text/plain")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

def test_analyze_requires_file():
    """Verify that omitting the file payload returns 422 validation error."""
    response = client.post("/api/analyze")
    assert response.status_code == 422
