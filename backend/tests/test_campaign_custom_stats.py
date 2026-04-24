"""Iteration 5: lobbies, matchmaking, two-session multiplayer."""
import pytest
import requests
from conftest import API, register, unique_nick


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _auth(tok): return {"X-Session-Token": tok}


DEFAULT_CFG = {"mode": "battle_simple", "public": True, "rows": 10, "cols": 10, "mines": 15, "lives": 3}


class TestLobbyLifecycle:
    def test_create_join_start_result_finish(self, api_client):
        # Session A: host
        _, tok_a = register(api_client, unique_nick("HOST"))
        # Session B: guest
        guest_nick = unique_nick("GUEST")
        _, tok_b = register(api_client, guest_nick)

        # Create lobby
        r = api_client.post(f"{API}/lobbies", json=DEFAULT_CFG, headers=_auth(tok_a))
        assert r.status_code == 200, r.text
        lobby = r.json()
        code = lobby["code"]
        assert len(code) == 6 and code.isalnum()
        assert lobby["status"] == "waiting"
        assert "seed" in lobby and isinstance(lobby["seed"], int)
        assert lobby["guest"] is None

        # Start before guest joins -> 409
        r_early = api_client.post(f"{API}/lobbies/{code}/start", headers=_auth(tok_a))
        assert r_early.status_code == 409

        # Guest joins
        r_join = api_client.post(f"{API}/lobbies/{code}/join", headers=_auth(tok_b))
        assert r_join.status_code == 200
        assert r_join.json()["guest"] == guest_nick

        # Get lobby public
        r_get = api_client.get(f"{API}/lobbies/{code}")
        assert r_get.status_code == 200
        assert r_get.json()["status"] == "waiting"

        # Non-host tries to start -> 403
        r_bad = api_client.post(f"{API}/lobbies/{code}/start", headers=_auth(tok_b))
        assert r_bad.status_code == 403

        # Host starts
        r_start = api_client.post(f"{API}/lobbies/{code}/start", headers=_auth(tok_a))
        assert r_start.status_code == 200
        assert r_start.json()["status"] == "playing"

        # Both submit results
        r1 = api_client.post(f"{API}/lobbies/{code}/result",
                             json={"score": 100, "time_seconds": 50, "won": True, "lives_remaining": 2},
                             headers=_auth(tok_a))
        assert r1.status_code == 200
        assert r1.json()["status"] == "playing"  # still waiting for guest

        r2 = api_client.post(f"{API}/lobbies/{code}/result",
                             json={"score": 50, "time_seconds": 80, "won": False, "lives_remaining": 0},
                             headers=_auth(tok_b))
        assert r2.status_code == 200
        final = r2.json()
        assert final["status"] == "finished"
        assert final["host_result"]["score"] == 100
        assert final["guest_result"]["won"] is False

    def test_join_full_lobby_409(self, api_client):
        _, tok_a = register(api_client, unique_nick("H"))
        _, tok_b = register(api_client, unique_nick("G1"))
        _, tok_c = register(api_client, unique_nick("G2"))
        code = api_client.post(f"{API}/lobbies", json=DEFAULT_CFG, headers=_auth(tok_a)).json()["code"]
        api_client.post(f"{API}/lobbies/{code}/join", headers=_auth(tok_b))
        r = api_client.post(f"{API}/lobbies/{code}/join", headers=_auth(tok_c))
        assert r.status_code == 409

    def test_get_unknown_404(self, api_client):
        r = api_client.get(f"{API}/lobbies/ZZZZZZ")
        assert r.status_code == 404

    def test_create_requires_session(self, api_client):
        r = api_client.post(f"{API}/lobbies", json=DEFAULT_CFG)
        assert r.status_code == 401


class TestMatchmaking:
    def test_find_creates_then_joins(self, api_client):
        # First player: should create a new public lobby
        _, tok_a = register(api_client, unique_nick("MMA"))
        cfg = {"mode": "battle_simple", "public": True, "rows": 12, "cols": 12, "mines": 20, "lives": 3}
        r1 = api_client.post(f"{API}/matchmaking/find", json=cfg, headers=_auth(tok_a))
        assert r1.status_code == 200, r1.text
        lobby1 = r1.json()
        assert lobby1["guest"] is None

        # Second player: should match into the same lobby
        _, tok_b = register(api_client, unique_nick("MMB"))
        r2 = api_client.post(f"{API}/matchmaking/find", json=cfg, headers=_auth(tok_b))
        assert r2.status_code == 200, r2.text
        lobby2 = r2.json()
        assert lobby2["code"] == lobby1["code"]
        assert lobby2["guest"] is not None
