"""Iteration 5 backend tests: root + leaderboard with session-token auth."""
import os
import pytest
import requests
from conftest import API, register, unique_nick


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _auth(tok):
    return {"X-Session-Token": tok}


class TestRoot:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()


# ---------- Leaderboard flow ----------
class TestLeaderboardFlow:
    def test_submit_valid_win(self, api_client):
        nick = unique_nick("TEST_A")
        _, tok = register(api_client, nick)
        payload = {
            "player_name": nick, "difficulty": "easy", "score": 15000,
            "time_seconds": 42, "lives_remaining": 3, "won": True,
        }
        r = api_client.post(f"{API}/leaderboard", json=payload, headers=_auth(tok))
        assert r.status_code == 200, r.text
        body = r.json()
        assert "entry" in body and "coins_awarded" in body and "rating_delta" in body
        d = body["entry"]
        assert d["player_name"] == nick
        assert d["won"] is True and d["score"] == 15000
        assert body["coins_awarded"] == 0 and body["rating_delta"] == 0

    def test_submit_requires_session(self, api_client):
        r = api_client.post(f"{API}/leaderboard", json={
            "player_name": "anyone", "difficulty": "easy", "score": 1,
            "time_seconds": 1, "lives_remaining": 1, "won": True,
        })
        assert r.status_code == 401

    def test_submit_nick_mismatch_403(self, api_client):
        _, tok = register(api_client, unique_nick("TEST_M"))
        r = api_client.post(f"{API}/leaderboard", json={
            "player_name": "SomeoneElse", "difficulty": "easy", "score": 10,
            "time_seconds": 5, "lives_remaining": 1, "won": True,
        }, headers=_auth(tok))
        assert r.status_code == 403

    def test_case_insensitive_nick_match(self, api_client):
        nick = unique_nick("TEST_CI")
        _, tok = register(api_client, nick)
        r = api_client.post(f"{API}/leaderboard", json={
            "player_name": nick.upper(), "difficulty": "easy", "score": 5,
            "time_seconds": 5, "lives_remaining": 1, "won": True,
        }, headers=_auth(tok))
        assert r.status_code == 200, r.text

    def test_get_leaderboard_filtered(self, api_client):
        r = api_client.get(f"{API}/leaderboard", params={"difficulty": "easy", "limit": 10})
        assert r.status_code == 200
        data = r.json()
        for e in data:
            assert e["won"] is True and e["difficulty"] == "easy"
        scores = [e["score"] for e in data]
        assert scores == sorted(scores, reverse=True)

    def test_get_recent(self, api_client):
        r = api_client.get(f"{API}/leaderboard/recent", params={"limit": 20})
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Validation ----------
class TestValidation:
    def test_negative_score(self, api_client):
        _, tok = register(api_client, unique_nick("TEST_V"))
        r = api_client.post(f"{API}/leaderboard", json={
            "player_name": "x", "difficulty": "easy", "score": -5,
            "time_seconds": 5, "lives_remaining": 1, "won": True,
        }, headers=_auth(tok))
        assert r.status_code == 422

    def test_missing_field(self, api_client):
        _, tok = register(api_client, unique_nick("TEST_V"))
        r = api_client.post(f"{API}/leaderboard", json={
            "player_name": "x", "difficulty": "easy", "score": 5, "time_seconds": 5,
        }, headers=_auth(tok))
        assert r.status_code == 422


# ---------- No objectid leakage ----------
class TestNoObjectId:
    def test_leaderboard_no_objectid(self, api_client):
        r = api_client.get(f"{API}/leaderboard", params={"limit": 50})
        assert r.status_code == 200
        for e in r.json():
            assert "_id" not in e
