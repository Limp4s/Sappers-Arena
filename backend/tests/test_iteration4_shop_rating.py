"""Iteration 5: shop + coin/rating awards with session tokens + always-award campaign coins."""
import pytest
import requests
from conftest import API, register, unique_nick


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _auth(tok): return {"X-Session-Token": tok}


class TestShopCatalog:
    def test_catalog_has_cursors_and_16_items(self, api_client):
        r = api_client.get(f"{API}/shop/items")
        assert r.status_code == 200
        items = r.json()
        cats = {}
        for it in items:
            cats[it["category"]] = cats.get(it["category"], 0) + 1
        assert "cursor" in cats and cats["cursor"] >= 3
        assert len(items) >= 16, f"got {len(items)}: {cats}"


class TestShopPurchase:
    def test_requires_session(self, api_client):
        r = api_client.post(f"{API}/shop/purchase", json={"item_id": "mine_skull"})
        assert r.status_code == 401

    def test_invalid_item_404(self, api_client):
        _, tok = register(api_client, unique_nick())
        r = api_client.post(f"{API}/shop/purchase", json={"item_id": "bogus"}, headers=_auth(tok))
        assert r.status_code == 404

    def test_insufficient_coins_402(self, api_client):
        _, tok = register(api_client, unique_nick())
        r = api_client.post(f"{API}/shop/purchase", json={"item_id": "cell_sunset"}, headers=_auth(tok))
        assert r.status_code == 402

    def test_cursor_purchase_success(self, api_client):
        nick = unique_nick("CUR")
        _, tok = register(api_client, nick)
        # cursor_crosshair = 600. Starter 100.
        # New campaign win formula is capped at 50 per level.
        for _ in range(20):
            r = api_client.post(f"{API}/leaderboard", json={
                "player_name": nick, "difficulty": "campaign", "mode": "campaign",
                "level_id": 5, "rows": 8, "cols": 8, "mines": 10,
                "score": 100, "time_seconds": 25,
                "lives_remaining": 3, "lives_total": 5, "won": True,
            }, headers=_auth(tok))
            assert r.status_code == 200, r.text
            p = api_client.get(f"{API}/players/{nick}").json()
            if p["coins"] >= 600:
                break
        p = api_client.get(f"{API}/players/{nick}").json()
        assert p["coins"] >= 600
        r = api_client.post(f"{API}/shop/purchase", json={"item_id": "cursor_crosshair"}, headers=_auth(tok))
        assert r.status_code == 200, r.text
        body = r.json()
        assert "cursor_crosshair" in body["player"]["owned_items"]


class TestCoinAwardsAlwaysOnCampaign:
    def test_campaign_win_new_formula(self, api_client):
        nick = unique_nick("CW")
        _, tok = register(api_client, nick)
        r = api_client.post(f"{API}/leaderboard", json={
            "player_name": nick, "difficulty": "campaign", "mode": "campaign",
            "level_id": 5, "rows": 8, "cols": 8, "mines": 10,
            "score": 3000, "time_seconds": 25,
            "lives_remaining": 3, "lives_total": 5, "flags": 4, "won": True,
        }, headers=_auth(tok))
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["coins_awarded"] == 27, body

    def test_campaign_loss_small_bonus(self, api_client):
        nick = unique_nick("CL")
        _, tok = register(api_client, nick)
        r = api_client.post(f"{API}/leaderboard", json={
            "player_name": nick, "difficulty": "campaign", "mode": "campaign",
            "level_id": 7, "rows": 8, "cols": 8, "mines": 10,
            "score": 100, "time_seconds": 10, "flags": 2,
            "lives_remaining": 0, "lives_total": 3, "won": False,
        }, headers=_auth(tok))
        assert r.status_code == 200
        assert r.json()["coins_awarded"] == 7

    def test_ranked_win_rating_and_coins(self, api_client):
        nick = unique_nick("RW")
        _, tok = register(api_client, nick)
        r = api_client.post(f"{API}/leaderboard", json={
            "player_name": nick, "difficulty": "ranked", "mode": "battle_ranked",
            "rows": 14, "cols": 14, "mines": 42,
            "score": 500, "time_seconds": 60,
            "lives_remaining": 2, "lives_total": 3, "won": True,
        }, headers=_auth(tok))
        assert r.status_code == 200
        body = r.json()
        assert body["rating_delta"] == 46
        assert body["coins_awarded"] == 56

    def test_ranked_loss_negative_rating(self, api_client):
        nick = unique_nick("RL")
        _, tok = register(api_client, nick)
        r = api_client.post(f"{API}/leaderboard", json={
            "player_name": nick, "difficulty": "ranked", "mode": "battle_ranked",
            "rows": 14, "cols": 14, "mines": 42,
            "score": 10, "time_seconds": 30,
            "lives_remaining": 0, "lives_total": 3, "won": False,
        }, headers=_auth(tok))
        assert r.status_code == 200
        assert r.json()["rating_delta"] == -12


class TestRankedLeaderboard:
    def test_ranked_list_sorted(self, api_client):
        r = api_client.get(f"{API}/leaderboard/ranked", params={"limit": 20})
        assert r.status_code == 200
        data = r.json()
        for p in data:
            assert "_id" not in p and "password_hash" not in p
        ratings = [p.get("rating", 0) for p in data]
        assert ratings == sorted(ratings, reverse=True)
