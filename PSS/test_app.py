from fastapi.testclient import TestClient

from app import app

client = TestClient(app)


def test_post_login_with_empty_credentials():
    response = client.post("/", data={"username": "", "password": ""})
    assert "Please enter both your username and password." in response.text

def test_post_login_with_invalid_credentials():
    response = client.post("/", data={"username": "123", "password": "wrong"})
    assert "Invalid username or password." in response.text

def test_get_index_with_session_redirect():
    response = client.post("/", data={"username": "123", "password": "123123"},follow_redirects=False)
    assert response.status_code == 303
    assert response.headers["location"].endswith("/chooseroom")