"""Iteration 5: auth (register/login/logout/change-password/me) + admin (Limp4)."""
import os
import pytest
import requests
from conftest import API, register, login, unique_nick, DEFAULT_PW


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _auth(tok): return {"X-Session-Token": tok}


class TestRegisterValidation:
    def test_short_nick_422(self, api_client):
        r = api_client.post(f"{API}/players/register", json={"nickname": "ab", "password": "pw12"})
        assert r.status_code == 422

    def test_missing_password_422(self, api_client):
        r = api_client.post(f"{API}/players/register", json={"nickname": unique_nick()})
        assert r.status_code == 422

    def test_short_password_422(self, api_client):
        r = api_client.post(f"{API}/players/register", json={"nickname": unique_nick(), "password": "pw"})
        assert r.status_code == 422

    def test_duplicate_409(self, api_client):
        nick = unique_nick()
        r1 = api_client.post(f"{API}/players/register", json={"nickname": nick, "password": DEFAULT_PW})
        assert r1.status_code == 200
        r2 = api_client.post(f"{API}/players/register", json={"nickname": nick.upper(), "password": DEFAULT_PW})
        assert r2.status_code == 409

    def test_register_returns_player_and_token(self, api_client):
        nick = unique_nick()
        r = api_client.post(f"{API}/players/register", json={"nickname": nick, "password": DEFAULT_PW})
        assert r.status_code == 200
        body = r.json()
        assert "player" in body and "token" in body
        assert body["player"]["nickname"] == nick
        assert "password_hash" not in body["player"]
        assert "_id" not in body["player"]
        assert len(body["token"]) > 10


class TestLogin:
    def test_login_wrong_password_401(self, api_client):
        nick = unique_nick()
        register(api_client, nick, "correctpw")
        r = api_client.post(f"{API}/players/login", json={"nickname": nick, "password": "wrongpw"})
        assert r.status_code == 401

    def test_login_unknown_404(self, api_client):
        r = api_client.post(f"{API}/players/login", json={"nickname": unique_nick("NOPE"), "password": "x"})
        assert r.status_code == 404

    def test_login_correct_returns_token(self, api_client):
        nick = unique_nick()
        register(api_client, nick, "mypass")
        r = api_client.post(f"{API}/players/login", json={"nickname": nick, "password": "mypass"})
        assert r.status_code == 200
        assert "token" in r.json()


class TestMeAndLogout:
    def test_me_requires_token(self, api_client):
        r = api_client.get(f"{API}/me")
        assert r.status_code == 401

    def test_me_returns_player(self, api_client):
        nick = unique_nick()
        _, tok = register(api_client, nick)
        r = api_client.get(f"{API}/me", headers=_auth(tok))
        assert r.status_code == 200
        assert r.json()["nickname"] == nick

    def test_logout_invalidates_token(self, api_client):
        nick = unique_nick()
        _, tok = register(api_client, nick)
        r = api_client.post(f"{API}/players/logout", headers=_auth(tok))
        assert r.status_code == 200
        r2 = api_client.get(f"{API}/me", headers=_auth(tok))
        assert r2.status_code == 401


class TestChangePassword:
    def test_wrong_old_401(self, api_client):
        nick = unique_nick()
        _, tok = register(api_client, nick, "orig1234")
        r = api_client.post(f"{API}/players/change-password",
                            json={"old_password": "wrong", "new_password": "newer1"},
                            headers=_auth(tok))
        assert r.status_code == 401

    def test_correct_rotates_token(self, api_client):
        nick = unique_nick()
        _, tok = register(api_client, nick, "orig1234")
        r = api_client.post(f"{API}/players/change-password",
                            json={"old_password": "orig1234", "new_password": "newpass1"},
                            headers=_auth(tok))
        assert r.status_code == 200, r.text
        new_tok = r.json()["token"]
        assert new_tok and new_tok != tok
        # Old token is revoked
        r_old = api_client.get(f"{API}/me", headers=_auth(tok))
        assert r_old.status_code == 401
        # New token works
        r_new = api_client.get(f"{API}/me", headers=_auth(new_tok))
        assert r_new.status_code == 200
        # Can log in with new password
        lr = api_client.post(f"{API}/players/login", json={"nickname": nick, "password": "newpass1"})
        assert lr.status_code == 200

    def test_short_new_password_422(self, api_client):
        nick = unique_nick()
        _, tok = register(api_client, nick, "orig1234")
        r = api_client.post(f"{API}/players/change-password",
                            json={"old_password": "orig1234", "new_password": "x"},
                            headers=_auth(tok))
        assert r.status_code == 422


class TestCheckEndpoint:
    def test_check_admin_flag(self, api_client):
        r = api_client.get(f"{API}/players/check", params={"nickname": "Limp4"})
        assert r.status_code == 200
        assert r.json()["is_admin_nick"] is True


class TestAdminFlow:
    def test_submit_as_admin_then_delete(self, api_client, admin_token):
        r = api_client.post(f"{API}/leaderboard", json={
            "player_name": "Limp4", "difficulty": "easy",
            "score": 321, "time_seconds": 10, "lives_remaining": 2, "won": True,
        }, headers=_auth(admin_token))
        assert r.status_code == 200, r.text
        entry_id = r.json()["entry"]["id"]

        # No token -> 401
        r0 = api_client.delete(f"{API}/leaderboard/{entry_id}")
        assert r0.status_code == 401

        # Non-admin -> 403
        _, tok = register(api_client, unique_nick("NA"))
        r_na = api_client.delete(f"{API}/leaderboard/{entry_id}", headers=_auth(tok))
        assert r_na.status_code == 403

        # Admin -> 200
        r_ok = api_client.delete(f"{API}/leaderboard/{entry_id}", headers=_auth(admin_token))
        assert r_ok.status_code == 200
        assert r_ok.json() == {"deleted": entry_id}
        # Repeat -> 404
        r_again = api_client.delete(f"{API}/leaderboard/{entry_id}", headers=_auth(admin_token))
        assert r_again.status_code == 404
