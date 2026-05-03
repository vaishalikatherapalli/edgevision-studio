from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "EdgeVision running"

def test_login_wrong_credentials():
    response = client.post(
        "/auth/login",
        data={"username": "wrong@test.com", "password": "wrong"}
    )
    assert response.status_code == 401