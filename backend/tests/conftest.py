"""Shared fixtures for iteration-5: session-token helpers."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

DEFAULT_PW = "pw12345"


def register(session, nick, password=DEFAULT_PW):
    r = session.post(f"{API}/players/register", json={"nickname": nick, "password": password}, timeout=15)
    assert r.status_code == 200, f"register {nick} failed: {r.status_code} {r.text}"
    body = r.json()
    return body["player"], body["token"]


def login(session, nick, password=DEFAULT_PW):
    r = session.post(f"{API}/players/login", json={"nickname": nick, "password": password}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["player"], r.json()["token"]


def unique_nick(prefix="TEST"):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


@pytest.fixture(scope="session")
def http():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(http):
    # Ensure Limp4 exists with known password. Register first-time; otherwise log in.
    r = http.post(f"{API}/players/register", json={"nickname": "Limp4", "password": DEFAULT_PW})
    if r.status_code == 200:
        return r.json()["token"]
    if r.status_code == 409:
        lr = http.post(f"{API}/players/login", json={"nickname": "Limp4", "password": DEFAULT_PW})
        if lr.status_code == 200:
            return lr.json()["token"]
    pytest.skip(f"cannot obtain admin Limp4 session: register={r.status_code} login_pw={DEFAULT_PW}")
