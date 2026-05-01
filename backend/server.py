from fastapi import FastAPI, APIRouter, Query, HTTPException, Header, Depends, WebSocket, WebSocketDisconnect, Path as FPath
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
import os, logging, re, random, string, hashlib, secrets
import certifi
from pathlib import Path as PathlibPath
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = PathlibPath(__file__).parent
load_dotenv(ROOT_DIR / '.env')


def _get_cors_origins() -> List[str]:
    raw = os.environ.get('CORS_ORIGINS', '*')
    if raw is None:
        return ['*']
    raw = str(raw).strip()
    if raw == '' or raw == '*':
        return ['*']
    parts = [p.strip() for p in raw.split(',')]
    parts = [p for p in parts if p]
    return parts or ['*']


def _cors_allow_credentials(origins: List[str]) -> bool:
    # Browsers require a specific Access-Control-Allow-Origin when credentials are enabled.
    # If we allow '*', we must not enable credentials, otherwise CORS will be blocked.
    return not (len(origins) == 1 and origins[0] == '*')


mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
db = client[os.environ['DB_NAME']]

app = FastAPI()
cors_origins = _get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=_cors_allow_credentials(cors_origins),
    allow_methods=["*"],
    allow_headers=["*"],
)
api_router = APIRouter(prefix="/api")

ADMIN_NICKS = {"limp4"}
ROOT_ADMIN_NICK_LOWER = "limp4"


@api_router.get("/health")
async def health():
    return {
        "ok": True,
        "service": "sappers-arena",
        "commit": os.getenv("RENDER_GIT_COMMIT") or os.getenv("GIT_COMMIT"),
        "build": os.getenv("RENDER_SERVICE_ID"),
    }


def _serialize_cells(cells: set, mines: set, adj: List[List[int]], revealed: set, flags: set, exploded: Optional[tuple] = None) -> List[dict]:
    out: List[dict] = []
    for (r, c) in cells:
        try:
            out.append(_serialize_cell(int(r), int(c), mines, adj, revealed, flags, exploded=exploded))
        except Exception:
            pass
    return out

NICK_PATTERN = re.compile(r"^[\w\-]{3,20}$", re.UNICODE)
STARTER_COINS = 100

SHOP_CATALOG = {
    # mines
    "mine_skull":      {"price": 400, "category": "mine",      "name": "Skull"},
    "mine_zap":        {"price": 500, "category": "mine",      "name": "Zap"},
    "mine_cat":        {"price": 800, "category": "mine",      "name": "Phantom Cat"},
    "mine_ghost":      {"price": 1000, "category": "mine",     "name": "Ghost"},
    "mine_flame":      {"price": 1200, "category": "mine",     "name": "Flame"},
    "mine_radiation":  {"price": 1500, "category": "mine",     "name": "Radiation"},
    "mine_biohazard":  {"price": 1500, "category": "mine",     "name": "Biohazard"},
    "mine_crown":      {"price": 5000, "category": "mine",     "name": "Crown"},
    "mine_gem":        {"price": 4000, "category": "mine",     "name": "Gem"},
    # cells
    "cell_gold":       {"price": 900, "category": "cell",      "name": "Gold Grid"},
    "cell_gold_premium": {"price": 4500, "category": "cell",   "name": "Solid Gold"},
    "cell_silver":     {"price": 2000, "category": "cell",     "name": "Silver"},
    "cell_ice_premium": {"price": 4000, "category": "cell",    "name": "Premium Ice"},
    "cell_fire_premium": {"price": 4000, "category": "cell",   "name": "Premium Flame"},
    "cell_coral":      {"price": 900, "category": "cell",      "name": "Coral Grid"},
    "cell_ice":        {"price": 900, "category": "cell",      "name": "Ice Grid"},
    "cell_retro":      {"price": 1400, "category": "cell",     "name": "Retro Green"},
    "cell_plasma":     {"price": 2400, "category": "cell",     "name": "Plasma"},
    "cell_aurora":     {"price": 3000, "category": "cell",     "name": "Aurora"},
    "cell_sunset":     {"price": 1800, "category": "cell",     "name": "Sunset"},
    "cell_violet":     {"price": 1900, "category": "cell",     "name": "Violet"},
    "cell_mono":       {"price": 1600, "category": "cell",     "name": "Monochrome"},
    "cell_rainbow_premium": {"price": 5000, "category": "cell", "name": "Rainbow"},
    # explosion FX
    "fx_gold":         {"price": 600, "category": "explosion", "name": "Gold Burst"},
    "fx_gold_premium": {"price": 4500, "category": "explosion", "name": "Liquid Gold"},
    "fx_silver":       {"price": 2000, "category": "explosion", "name": "Silver Burst"},
    "fx_ice_premium":  {"price": 4000, "category": "explosion", "name": "Premium Ice"},
    "fx_fire_premium": {"price": 4000, "category": "explosion", "name": "Premium Flame"},
    "fx_rainbow":      {"price": 1200, "category": "explosion", "name": "Rainbow"},
    "fx_rainbow_premium": {"price": 5000, "category": "explosion", "name": "Rainbow"},
    "fx_shockwave":    {"price": 1600, "category": "explosion", "name": "Shockwave"},
    "fx_void":         {"price": 1800, "category": "explosion", "name": "Void"},
    "fx_lime":         {"price": 1400, "category": "explosion", "name": "Lime Burst"},
    "fx_ultraviolet":  {"price": 2400, "category": "explosion", "name": "Ultraviolet"},
    "fx_ember":        {"price": 2600, "category": "explosion", "name": "Ember"},
    "fx_aurora":       {"price": 3000, "category": "explosion", "name": "Aurora Wave"},

    # flags
    "flag_gold":       {"price": 600, "category": "flag", "name": "Gold Flag"},
    "flag_cyan":       {"price": 900, "category": "flag", "name": "Cyan Flag"},
    "flag_coral":      {"price": 900, "category": "flag", "name": "Coral Flag"},
    "flag_ice":        {"price": 900, "category": "flag", "name": "Ice Flag"},
    "flag_lime":       {"price": 900, "category": "flag", "name": "Lime Flag"},
    "flag_violet":     {"price": 900, "category": "flag", "name": "Violet Flag"},
    "flag_silver":     {"price": 2000, "category": "flag", "name": "Silver Flag"},
    "flag_mono":       {"price": 1200, "category": "flag", "name": "Mono Flag"},
    "flag_rainbow":    {"price": 1200, "category": "flag", "name": "Rainbow Flag"},
}


# ---------------- Helpers ----------------

def _hash_password(pw: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 120_000).hex()
    return f"pbkdf2${salt}${h}"


def _verify_password(pw: str, stored: str) -> bool:
    try:
        algo, salt, h = stored.split("$", 2)
        if algo != "pbkdf2": return False
        test = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 120_000).hex()
        return secrets.compare_digest(test, h)
    except Exception:
        return False


def _validate_nick(nick: str) -> str:
    if not NICK_PATTERN.match(nick or ""):
        raise HTTPException(status_code=422, detail="Nickname must be 3-20 characters (letters from any alphabet, digits, _, -).")
    return nick


def _validate_password(pw: str):
    if not pw or len(pw) < 4:
        raise HTTPException(status_code=422, detail="Password must be at least 4 characters.")
    if len(pw) > 100:
        raise HTTPException(status_code=422, detail="Password too long.")


async def _get_player(nick: str):
    return await db.players.find_one({"nickname_lower": (nick or "").lower()}, {"_id": 0})


async def _next_player_num() -> int:
    try:
        doc = await db.counters.find_one_and_update(
            {"_id": "player_num"},
            {"$setOnInsert": {"seq": 0}, "$inc": {"seq": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return int((doc or {}).get("seq") or 0)
    except Exception as e:
        try:
            print(f"_next_player_num failed: {e!r}")
        except Exception:
            pass
        try:
            last = await db.players.find(
                {"player_num": {"$type": "number", "$lt": 2000000}},
                {"player_num": 1},
            ).sort("player_num", -1).limit(1).to_list(length=1)
            cur = int((last[0] or {}).get("player_num") or 0) if last else 0
            return max(1, cur + 1)
        except Exception:
            return 1


async def _ensure_player_ids(player: dict) -> dict:
    if not player:
        return player
    patch: Dict[str, Any] = {}
    if not player.get("player_uuid"):
        patch["player_uuid"] = str(uuid.uuid4())
    if player.get("player_num") is None:
        patch["player_num"] = await _next_player_num()
    if patch:
        await db.players.update_one(
            {"nickname_lower": player.get("nickname_lower")},
            {"$set": patch},
        )
        player = {**player, **patch}
    return player


def _is_admin_nick(nick: str) -> bool:
    return (nick or "").lower() in ADMIN_NICKS


def _sanitize_player(doc: dict) -> dict:
    if not doc: return None
    doc = dict(doc)
    doc.pop("_id", None)
    doc.pop("nickname_lower", None)
    doc.pop("password_hash", None)
    doc.setdefault("player_uuid", None)
    doc.setdefault("player_num", None)
    doc.setdefault("coins", STARTER_COINS)
    doc.setdefault("owned_items", [])
    doc.setdefault("rating", 500)
    try:
        doc["rating"] = max(0, int(doc.get("rating", 500) or 500))
    except Exception:
        doc["rating"] = 500
    return doc


def _parse_iso_to_epoch_seconds(v: Optional[str]) -> Optional[int]:
    if not v:
        return None
    try:
        dt = datetime.fromisoformat(v.replace('Z', '+00:00'))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return int(dt.timestamp())
    except Exception:
        return None


async def _create_session(nick: str) -> str:
    token = secrets.token_urlsafe(24)
    await db.sessions.insert_one({
        "token": token, "nickname": nick,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return token


async def require_session(x_session_token: Optional[str] = Header(default=None, alias="X-Session-Token")) -> str:
    if not x_session_token:
        raise HTTPException(status_code=401, detail="Missing session token.")
    s = await db.sessions.find_one({"token": x_session_token})
    if not s:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")
    return s["nickname"]


def _compute_coins(mode: str, level_id, lives_remaining: int, lives_total: int, time_seconds: int, flags: int, won: bool) -> int:
    """Always-award coins after campaign games (win or lose)."""
    if mode == "campaign" and level_id is not None:
        lvl = int(level_id)
        lvl_win = int(lvl * 0.6)
        lvl_lose = int(lvl * 0.2)
        base_win = (8 + lvl_win + lives_remaining * 3) if won else 0
        base_lose = (2 + lvl_lose) if not won else 0
        time_bonus = 0
        if won and time_seconds > 0:
            target = max(45, lvl * 6)
            time_bonus = max(0, (target - time_seconds) // 12)
        flag_bonus = min(10, flags)
        return min(50, base_win + base_lose + time_bonus + flag_bonus)
    # Online duels: keep rewards small (about 3x lower than before), with a hard cap.
    if mode == "battle_ranked":
        return min(15, (8 + lives_remaining * 2) if won else 1)
    if mode == "battle_simple":
        return min(15, (6 + lives_remaining * 2) if won else 1)
    if mode == "lobby":
        return min(15, (5 + lives_remaining * 2) if won else 1)
    return 0


def _compute_rating_delta(mode: str, won: bool, time_seconds: int, lives_remaining: int) -> int:
    # Kept for backward compatibility (non-lobby ranked runs without lobby_code).
    if mode != "battle_ranked":
        return 0
    if won:
        return 10
    return -10


def _compute_ranked_duel_rating_delta(
    *,
    won: bool,
    lives_remaining: int,
    lives_total: int,
    time_seconds: int,
    safe_revealed: int,
    opp_safe_revealed: int,
    correct_flags: int,
    opp_correct_flags: int,
    mines_total: int,
    opp_time_seconds: Optional[int],
) -> int:
    # Winner: up to +50. Loser: at least -10.
    # Factors: progress (safe cells), correct flags, lives, speed vs opponent, perfect run bonus.
    lr = max(0, int(lives_remaining or 0))
    lt = max(1, int(lives_total or 1))
    sr = max(0, int(safe_revealed or 0))
    osr = max(0, int(opp_safe_revealed or 0))
    cf = max(0, int(correct_flags or 0))
    ocf = max(0, int(opp_correct_flags or 0))
    mt = max(1, int(mines_total or 1))

    progress_adv = sr - osr
    flag_adv = cf - ocf

    life_score = int(round((lr / lt) * 6))  # 0..6
    progress_score = max(-10, min(10, progress_adv // 4))
    flags_score = max(-10, min(10, flag_adv))

    speed_score = 0
    if opp_time_seconds is not None:
        try:
            dt = int(opp_time_seconds) - int(time_seconds)
            if dt > 0:
                speed_score = min(6, dt // 10)
        except Exception:
            speed_score = 0

    perfect = (cf >= mt) and (lr >= lt)
    perfect_speed = (opp_time_seconds is not None) and (speed_score > 0)
    perfect_bonus = 8 if (perfect and perfect_speed) else (4 if perfect else 0)

    if won:
        raw = 22 + life_score + max(0, progress_score) + max(0, flags_score) + speed_score + perfect_bonus
        return int(min(50, max(10, raw)))

    raw_loss = 12 + max(0, -progress_score) + max(0, -flags_score) + max(0, 6 - life_score)
    loss = int(min(50, max(10, raw_loss)))
    return -loss


DAILY_TZ_OFFSET_HOURS = 2  # UTC+2 windows: 00:00-12:00-00:00
DAILY_QUESTS = [
    {"id": "play_1", "type": "gamesPlayed", "target": 1, "rewardCoins": 6},
    {"id": "play_3", "type": "gamesPlayed", "target": 3, "rewardCoins": 10},
    {"id": "win_1", "type": "gamesWon", "target": 1, "rewardCoins": 12},
    {"id": "win_3", "type": "gamesWon", "target": 3, "rewardCoins": 20},
    {"id": "lose_1", "type": "gamesLost", "target": 1, "rewardCoins": 8},
    {"id": "lose_3", "type": "gamesLost", "target": 3, "rewardCoins": 14},
    {"id": "flags_5", "type": "flagsPlaced", "target": 5, "rewardCoins": 6},
    {"id": "flags_20", "type": "flagsPlaced", "target": 20, "rewardCoins": 10},
    {"id": "flags_50", "type": "flagsPlaced", "target": 50, "rewardCoins": 18},
    {"id": "safe_100", "type": "safeRevealed", "target": 100, "rewardCoins": 12},
    {"id": "safe_250", "type": "safeRevealed", "target": 250, "rewardCoins": 22},
    {"id": "time_300", "type": "timePlayedSeconds", "target": 300, "rewardCoins": 10},
    {"id": "time_900", "type": "timePlayedSeconds", "target": 900, "rewardCoins": 20},
    {"id": "fast_60", "type": "winsUnder60", "target": 1, "rewardCoins": 16},
    {"id": "fast_30", "type": "winsUnder30", "target": 1, "rewardCoins": 22},
    {"id": "no_flags", "type": "winsNoFlags", "target": 1, "rewardCoins": 18},
    {"id": "flawless", "type": "winsFlawless", "target": 1, "rewardCoins": 18},
    {"id": "one_life", "type": "winsWith1Life", "target": 1, "rewardCoins": 16},
    {"id": "campaign_1", "type": "campaignWins", "target": 1, "rewardCoins": 12},
    {"id": "campaign_3", "type": "campaignWins", "target": 3, "rewardCoins": 24},
]


def _daily_pick_active_quests(window_key: str, nickname_lower: str, n: int = 5) -> List[str]:
    ids = [q.get("id") for q in (DAILY_QUESTS or []) if q.get("id")]
    ids = [str(x) for x in ids if x]
    if not ids:
        return []
    n = max(1, min(int(n), len(ids)))
    try:
        seed = hashlib.sha256(f"{window_key}|{nickname_lower}".encode("utf-8")).digest()
        rnd = random.Random(int.from_bytes(seed[:8], "big", signed=False))
        rnd.shuffle(ids)
    except Exception:
        pass
    return ids[:n]


ACHIEVEMENTS = [
    {"id": "games_1", "title": "First Steps", "desc": "Первый шаг сделан. Дальше — больше."},
    {"id": "games_10", "title": "Getting Warm", "desc": "Разогрелся. Теперь можно и на серьёзных."},
    {"id": "games_50", "title": "Regular", "desc": "Это уже привычка, да?"},
    {"id": "games_200", "title": "Veteran", "desc": "Видел всё. И мины, и боль."},
    {"id": "games_1000", "title": "Marathon", "desc": "Ты здесь живёшь?"},
    {"id": "wins_1", "title": "First Win", "desc": "Первая победа — самая сладкая."},
    {"id": "streak_3", "title": "Win Streak 3", "desc": "Пошла серия. Не останавливайся!"},
    {"id": "streak_5", "title": "Win Streak 5", "desc": "Уверенно. Очень уверенно."},
    {"id": "streak_10", "title": "Win Streak 10", "desc": "Ты их вообще видишь насквозь?"},
    {"id": "streak_100", "title": "Win Streak 100", "desc": "Стоп. Ты точно не бот?"},
    {"id": "flawless_win", "title": "Flawless", "desc": "Чистая работа. Без царапин."},

    {"id": "speed_win_60", "title": "Quick Mind", "desc": "Думал быстро — нажимал ещё быстрее."},
    {"id": "speed_win_30", "title": "Speedrunner", "desc": "Где ты вообще нашёл время моргнуть?"},
    {"id": "speed_win_20", "title": "Lightning", "desc": "Молния. Поле даже не поняло, что произошло."},
    {"id": "speed_win_10", "title": "Speedster", "desc": "Легенда гласит: ты уже закончил до старта."},

    {"id": "flags_1", "title": "First Flag", "desc": "Первый флажок. Начинается паранойя."},
    {"id": "flags_100", "title": "Flag Master", "desc": "Ты ставишь метки как профессионал."},
    {"id": "flags_1000", "title": "Flag Legend", "desc": "Флагов больше, чем сомнений. Почти."},
    {"id": "precise_all_mines", "title": "Precise", "desc": "Идеально по учебнику. Минёрам бы понравилось."},
    {"id": "no_flags_win", "title": "No Flags", "desc": "На чистой интуиции. Или на безумии."},

    {"id": "campaign_1", "title": "Campaign Start", "desc": "Глава 1: 'А что тут сложного?'"},
    {"id": "campaign_10", "title": "Campaign 10", "desc": "Уже втянулся. Отступать поздно."},
    {"id": "campaign_half", "title": "Campaign Halfway", "desc": "Экватор пройден. Теперь будет жарче."},
    {"id": "campaign_complete", "title": "Campaign Complete", "desc": "Финал. И ты выжил. Как?"},
    {"id": "hard_lesson", "title": "Hard Lesson", "desc": "Одна ошибка и ты ошибса а ой взорвалса!"},

    {"id": "duels_1", "title": "First Duel", "desc": "Добро пожаловать в настоящую мясорубку."},
    {"id": "duel_wins_1", "title": "Duel Winner", "desc": "Первый раз всегда приятно)"},
    {"id": "ranked_10", "title": "Ranked Ready", "desc": "Рейтинг — это боль, но ты привык."},
    {"id": "duel_wins_10", "title": "Rival", "desc": "Тебя уже запомнили. И боятся."},
    {"id": "duel_wins_50", "title": "Nemesis", "desc": "Если ты в лобби — кто-то уже нервничает."},
    {"id": "comeback_1hp", "title": "Comeback", "desc": "На волоске. Но всё равно победа."},
    {"id": "duel_streak_5", "title": "Unstoppable", "desc": "Остановить тебя некому. Пока что."},

    {"id": "rating_600", "title": "Rising", "desc": "Пошёл рост. Дальше — выше."},
    {"id": "rating_1000", "title": "Skilled", "desc": "Уже не новичок. Совсем."},
    {"id": "rating_5000", "title": "Pro", "desc": "Профи. Без вопросов."},
    {"id": "rating_10000", "title": "Elite", "desc": "Элита. Туда просто так не попадают."},
    {"id": "rating_15000", "title": "Legend", "desc": "Легенда. Живая. Опасная."},

    {"id": "coins_balance_10000", "title": "Last Money", "desc": "Ты долго копил? Или просто не тратил?"},
    {"id": "coins_earned_total_10000", "title": "Rich", "desc": "Неплохо поднялся."},

    {"id": "collect_mines_all", "title": "Collector: Mines", "desc": "Собери все скины мин."},
    {"id": "collect_cells_all", "title": "Collector: Cells", "desc": "Собери все скины клеток."},
    {"id": "collect_fx_all", "title": "Collector: FX", "desc": "Собери все эффекты взрыва."},
    {"id": "collect_flags_all", "title": "Collector: Flags", "desc": "Собери все скины флажков."},
    {"id": "collect_shop_all", "title": "Shop Completion", "desc": "Купи всё в магазине."},

    {"id": "daily_claim_1", "title": "Daily Claimer", "desc": "Забрать награду — святое."},
    {"id": "daily_streak_5", "title": "Daily Streak", "desc": "Дисциплина. Железная. Почти."},
]


def _ach_blank_stats() -> dict:
    return {
        "games_played": 0,
        "games_won": 0,
        "win_streak": 0,
        "flags_total": 0,
        "duels_played": 0,
        "duels_won": 0,
        "ranked_played": 0,
        "campaign_wins": 0,
        "coins_earned_total": 0,
        "daily_claims": 0,
        "daily_claim_streak": 0,
        "daily_claim_last_window": None,
    }


def _ach_get(player: dict) -> tuple[dict, dict]:
    unlocked = player.get("achievements_unlocked")
    if not isinstance(unlocked, dict):
        unlocked = {}
    stats = player.get("achievements_stats")
    if not isinstance(stats, dict):
        stats = _ach_blank_stats()
    else:
        base = _ach_blank_stats()
        base.update(stats)
        stats = base
    return unlocked, stats


def _ach_should_unlock(player_after: dict, payload: Optional[Any] = None, coins_balance_after: Optional[int] = None) -> list[str]:
    unlocked, st = _ach_get(player_after)
    ids: list[str] = []

    def add(i: str):
        if i and not unlocked.get(i):
            ids.append(i)

    gp = int(st.get("games_played") or 0)
    gw = int(st.get("games_won") or 0)
    ws = int(st.get("win_streak") or 0)
    ft = int(st.get("flags_total") or 0)
    dw = int(st.get("duels_won") or 0)
    dp = int(st.get("duels_played") or 0)
    rp = int(st.get("ranked_played") or 0)
    cw = int(st.get("campaign_wins") or 0)
    ce = int(st.get("coins_earned_total") or 0)
    rating = int((player_after or {}).get("rating", 500) or 500)
    if coins_balance_after is None:
        coins_balance_after = int((player_after or {}).get("coins", 0) or 0)

    if gp >= 1: add("games_1")
    if gp >= 10: add("games_10")
    if gp >= 50: add("games_50")
    if gp >= 200: add("games_200")
    if gp >= 1000: add("games_1000")
    if gw >= 1: add("wins_1")

    if ws >= 3: add("streak_3")
    if ws >= 5: add("streak_5")
    if ws >= 10: add("streak_10")
    if ws >= 100: add("streak_100")

    if ft >= 1: add("flags_1")
    if ft >= 100: add("flags_100")
    if ft >= 1000: add("flags_1000")

    if dp >= 1: add("duels_1")
    if dw >= 1: add("duel_wins_1")
    if dw >= 10: add("duel_wins_10")
    if dw >= 50: add("duel_wins_50")
    if rp >= 10: add("ranked_10")

    if cw >= 1: add("campaign_1")
    if cw >= 10: add("campaign_10")
    if cw >= 30: add("campaign_half")
    if cw >= 60: add("campaign_complete")

    if rating >= 600: add("rating_600")
    if rating >= 1000: add("rating_1000")
    if rating >= 5000: add("rating_5000")
    if rating >= 10000: add("rating_10000")
    if rating >= 15000: add("rating_15000")

    if ce >= 10000: add("coins_earned_total_10000")
    if int(coins_balance_after or 0) >= 10000: add("coins_balance_10000")

    try:
        owned = set([str(x) for x in (player_after.get("owned_items") or []) if x])
        owned |= {"mine_default", "cell_default", "fx_default", "flag_default"}

        def _cat_ids(cat: str) -> set[str]:
            return set([k for k, v in (SHOP_CATALOG or {}).items() if (v or {}).get("category") == cat])

        if _cat_ids("mine") and _cat_ids("mine").issubset(owned):
            add("collect_mines_all")
        if _cat_ids("cell") and _cat_ids("cell").issubset(owned):
            add("collect_cells_all")
        if _cat_ids("explosion") and _cat_ids("explosion").issubset(owned):
            add("collect_fx_all")
        if _cat_ids("flag") and _cat_ids("flag").issubset(owned):
            add("collect_flags_all")

        all_shop = set([k for k in (SHOP_CATALOG or {}).keys() if k])
        if all_shop and all_shop.issubset(owned):
            add("collect_shop_all")
    except Exception:
        pass

    dc = int(st.get("daily_claims") or 0)
    dcs = int(st.get("daily_claim_streak") or 0)
    if dc >= 1: add("daily_claim_1")
    if dcs >= 5: add("daily_streak_5")

    if payload is not None:
        try:
            won = bool(payload.won)
            if won:
                ts = int(payload.time_seconds or 0)
                if ts > 0 and ts < 60: add("speed_win_60")
                if ts > 0 and ts < 30: add("speed_win_30")
                if ts > 0 and ts < 20: add("speed_win_20")
                if ts > 0 and ts < 10: add("speed_win_10")

                lr = int(payload.lives_remaining or 0)
                lt = int(payload.lives_total or 1)
                if lt > 0 and lr >= lt:
                    add("flawless_win")

                if int(payload.flags or 0) <= 0:
                    add("no_flags_win")

                if payload.mode == "campaign":
                    lvl = payload.level_id
                    if lvl is not None and int(lvl) >= 150 and lr == 1:
                        add("hard_lesson")
        except Exception:
            pass

    return list(dict.fromkeys(ids))


async def _ach_recheck_and_persist(nick: str):
    try:
        player = await _get_player(nick)
        if not player:
            return
        unlocked, st = _ach_get(player)
        coins_after = int((player.get("coins") or 0))
        player_after = {**player, "achievements_unlocked": unlocked, "achievements_stats": st}
        to_unlock = _ach_should_unlock(player_after, payload=None, coins_balance_after=coins_after)
        if not to_unlock:
            return
        ts = int(datetime.now(timezone.utc).timestamp() * 1000)
        set_doc: Dict[str, Any] = {}
        for aid in to_unlock:
            set_doc[f"achievements_unlocked.{aid}"] = ts
        await db.players.update_one(
            {"nickname_lower": (player.get("nickname_lower") or (nick or "").lower())},
            {"$set": set_doc},
        )
    except Exception:
        return


def _daily_now_local() -> datetime:
    return datetime.now(timezone.utc) + timedelta(hours=DAILY_TZ_OFFSET_HOURS)


def _daily_window_key(now_local: Optional[datetime] = None) -> str:
    d = now_local or _daily_now_local()
    w = 0 if d.hour < 12 else 1
    return f"{d.year:04d}-{d.month:02d}-{d.day:02d}-{w}"


def _daily_seconds_until_reset(now_local: Optional[datetime] = None) -> int:
    d = now_local or _daily_now_local()
    next_hour = 12 if d.hour < 12 else 24
    if next_hour == 24:
        nxt = datetime(d.year, d.month, d.day, 0, 0, 0, tzinfo=d.tzinfo) + timedelta(days=1)
    else:
        nxt = datetime(d.year, d.month, d.day, 12, 0, 0, tzinfo=d.tzinfo)
    return max(0, int((nxt - d).total_seconds()))


def _daily_blank_state(window_key: str) -> dict:
    return {
        "daily_window": window_key,
        "daily_active": [],
        "daily_progress": {
            "gamesPlayed": 0,
            "gamesWon": 0,
            "gamesLost": 0,
            "flagsPlaced": 0,
            "safeRevealed": 0,
            "timePlayedSeconds": 0,
            "winsUnder60": 0,
            "winsUnder30": 0,
            "winsNoFlags": 0,
            "winsFlawless": 0,
            "winsWith1Life": 0,
            "campaignWins": 0,
        },
        "daily_claimed": {},
    }


def _daily_prev_window_key(window_key: str) -> Optional[str]:
    try:
        parts = str(window_key).split("-")
    except Exception:
        parts = None
    if not parts or len(parts) != 4:
        return None
    try:
        y = int(parts[0])
        m = int(parts[1])
        d = int(parts[2])
        w = int(parts[3])
    except Exception:
        return None
    try:
        if w == 1:
            return f"{y:04d}-{m:02d}-{d:02d}-0"
        dt = datetime(y, m, d, 0, 0, 0, tzinfo=timezone.utc) - timedelta(days=1)
        return f"{dt.year:04d}-{dt.month:02d}-{dt.day:02d}-1"
    except Exception:
        return None


async def _ensure_daily_window(player: dict) -> dict:
    now_local = _daily_now_local()
    wk = _daily_window_key(now_local)
    if not player:
        return player
    if player.get("daily_window") != wk:
        patch = _daily_blank_state(wk)
        try:
            patch["daily_active"] = _daily_pick_active_quests(wk, str(player.get("nickname_lower") or "").lower(), 5)
        except Exception:
            patch["daily_active"] = []
        await db.players.update_one(
            {"nickname_lower": player.get("nickname_lower")},
            {"$set": patch},
        )
        player = {**player, **patch}
    if not isinstance(player.get("daily_progress"), dict):
        player["daily_progress"] = _daily_blank_state(wk)["daily_progress"]
    if not isinstance(player.get("daily_claimed"), dict):
        player["daily_claimed"] = {}
    if not isinstance(player.get("daily_active"), list) or not player.get("daily_active"):
        try:
            active = _daily_pick_active_quests(wk, str(player.get("nickname_lower") or "").lower(), 5)
        except Exception:
            active = []
        try:
            await db.players.update_one(
                {"nickname_lower": player.get("nickname_lower")},
                {"$set": {"daily_active": active}},
            )
        except Exception:
            pass
        player["daily_active"] = active
    return player


def _daily_quest_progress(state: dict, quest: dict) -> dict:
    st = state or {}
    q = quest or {}
    prog = st.get("daily_progress") or {}
    cur = int(prog.get(q.get("type"), 0) or 0)
    target = max(1, int(q.get("target", 1) or 1))
    done = cur >= target
    claimed = bool((st.get("daily_claimed") or {}).get(q.get("id")))
    return {"cur": cur, "target": target, "done": done, "claimed": claimed}


# ---------------- Models ----------------

class ScoreCreate(BaseModel):
    player_name: str = Field(..., min_length=3, max_length=20)
    difficulty: str = Field(..., min_length=1, max_length=32)
    mode: str = Field(default="classic", min_length=1, max_length=32)
    level_id: Optional[int] = Field(default=None, ge=0, le=999)
    rows: Optional[int] = Field(default=None, ge=3, le=40)
    cols: Optional[int] = Field(default=None, ge=3, le=40)
    mines: Optional[int] = Field(default=None, ge=1, le=500)
    flags: int = Field(default=0, ge=0, le=500)
    score: int = Field(..., ge=0)
    time_seconds: int = Field(..., ge=0)
    lives_remaining: int = Field(..., ge=0, le=99)
    lives_total: int = Field(default=3, ge=1, le=99)
    won: bool
    lobby_code: Optional[str] = Field(default=None, max_length=16)
    safe_revealed: Optional[int] = Field(default=None, ge=0, le=5000)


class Score(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_name: str
    difficulty: str
    mode: str = "classic"
    level_id: Optional[int] = None
    rows: Optional[int] = None
    cols: Optional[int] = None
    mines: Optional[int] = None
    flags: int = 0
    score: int
    time_seconds: int
    lives_remaining: int
    lives_total: int = 3
    won: bool
    lobby_code: Optional[str] = None
    safe_revealed: Optional[int] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    coins_awarded: int = 0


class DailyClaimRequest(BaseModel):
    quest_id: str = Field(..., min_length=1, max_length=40)


class RegisterRequest(BaseModel):
    nickname: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=4, max_length=100)


class LoginRequest(BaseModel):
    nickname: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=1, max_length=100)


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=1, max_length=100)
    new_password: str = Field(..., min_length=4, max_length=100)


class PurchaseRequest(BaseModel):
    item_id: str = Field(..., min_length=1, max_length=40)


class LobbyCreateRequest(BaseModel):
    mode: str = Field(..., min_length=1, max_length=32)   # lobby_friend | battle_simple | battle_ranked
    public: bool = True
    rows: int = Field(..., ge=5, le=30)
    cols: int = Field(..., ge=5, le=30)
    mines: int = Field(..., ge=1, le=500)
    lives: int = Field(default=3, ge=1, le=10)
    narc: bool = False
    random_mode: bool = False
    no_flags: bool = False


class CampaignLevelResultRequest(BaseModel):
    level_id: int = Field(..., ge=1, le=10000)
    stars: int = Field(default=0, ge=0, le=3)
    bestScore: int = Field(default=0, ge=0, le=1_000_000_000)
    bestTime: Optional[int] = Field(default=None, ge=0, le=1_000_000_000)
    completed: bool = False


# ---------------- Routes ----------------

@api_router.get("/")
async def root():
    return {"message": "Mine Grid API online"}


@api_router.get("/campaign/progress")
async def get_campaign_progress(nick: str = Depends(require_session)):
    player = await _get_player(nick)
    if not player:
        # Backward compatibility for legacy docs that may not have nickname_lower.
        legacy = await db.players.find_one({"nickname": nick}, {"_id": 0})
        if legacy:
            await db.players.update_one(
                {"nickname": nick},
                {"$set": {"nickname_lower": (nick or "").lower()}},
            )
            player = legacy
    if not player:
        raise HTTPException(status_code=404, detail="Player not found.")
    return {"progress": player.get("campaign_progress") or {}}


def _merge_campaign_entry(prev: Optional[dict], incoming: dict) -> dict:
    prev = prev or {}
    stars = max(int(prev.get("stars", 0) or 0), int(incoming.get("stars", 0) or 0))
    best_score = max(int(prev.get("bestScore", 0) or 0), int(incoming.get("bestScore", 0) or 0))

    prev_bt = prev.get("bestTime")
    inc_bt = incoming.get("bestTime")
    best_time = prev_bt
    if inc_bt is not None:
        if prev_bt is None:
            best_time = int(inc_bt)
        else:
            best_time = min(int(prev_bt), int(inc_bt))

    completed = bool(prev.get("completed") or incoming.get("completed"))
    return {
        "stars": stars,
        "bestScore": best_score,
        "bestTime": best_time,
        "completed": completed,
    }


@api_router.post("/campaign/level_result")
async def submit_campaign_level_result(payload: CampaignLevelResultRequest, nick: str = Depends(require_session)):
    player = await _get_player(nick)
    if not player:
        # Backward compatibility for legacy docs that may not have nickname_lower.
        legacy = await db.players.find_one({"nickname": nick}, {"_id": 0})
        if legacy:
            await db.players.update_one(
                {"nickname": nick},
                {"$set": {"nickname_lower": (nick or "").lower()}},
            )
            player = legacy
    if not player:
        raise HTTPException(status_code=404, detail="Player not found.")

    progress = dict(player.get("campaign_progress") or {})
    key = str(int(payload.level_id))
    incoming = {
        "stars": int(payload.stars or 0),
        "bestScore": int(payload.bestScore or 0),
        "bestTime": (int(payload.bestTime) if payload.bestTime is not None else None),
        "completed": bool(payload.completed),
    }
    progress[key] = _merge_campaign_entry(progress.get(key), incoming)

    await db.players.update_one(
        {"nickname_lower": (nick or "").lower()},
        {"$set": {"campaign_progress": progress}},
    )

    # Achievements may depend on campaign progress / wins; re-check unlocks.
    updated0 = await _get_player(nick)
    if not updated0:
        return {"ok": True, "progress": progress, "new_unlocked": []}
    unlocked, st = _ach_get(updated0)
    player_after = {**updated0, "achievements_unlocked": unlocked, "achievements_stats": st}
    to_unlock = _ach_should_unlock(player_after, payload=None, coins_balance_after=int(updated0.get("coins") or 0))
    new_unlocked = list(to_unlock or [])
    if new_unlocked:
        ts = int(datetime.now(timezone.utc).timestamp() * 1000)
        set_doc: Dict[str, Any] = {}
        for aid in new_unlocked:
            set_doc[f"achievements_unlocked.{aid}"] = ts
        await db.players.update_one(
            {"nickname_lower": (nick or "").lower()},
            {"$set": set_doc},
        )
    return {"ok": True, "progress": progress, "new_unlocked": new_unlocked}


# --- Auth / Players ---

@api_router.get("/players/check")
async def check_nickname(nickname: str = Query(..., min_length=1, max_length=30)):
    try:
        _validate_nick(nickname)
    except HTTPException:
        return {"available": False, "valid": False, "reason": "invalid_format"}
    existing = await _get_player(nickname)
    return {
        "available": existing is None,
        "valid": True,
        "is_admin_nick": _is_admin_nick(nickname),
        "reason": "taken" if existing else "ok",
    }


@api_router.post("/players/register")
async def register_player(payload: RegisterRequest):
    nick = _validate_nick(payload.nickname)
    _validate_password(payload.password)
    if await _get_player(nick):
        raise HTTPException(status_code=409, detail=f"Nickname '{nick}' is already taken.")
    doc = {
        "player_uuid": str(uuid.uuid4()),
        "player_num": await _next_player_num(),
        "nickname": nick,
        "nickname_lower": nick.lower(),
        "password_hash": _hash_password(payload.password),
        "is_admin": _is_admin_nick(nick),
        "coins": STARTER_COINS,
        "owned_items": [],
        "rating": 500,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.players.insert_one(doc)
    token = await _create_session(nick)
    return {"player": _sanitize_player(doc), "token": token}


@api_router.post("/players/login")
async def login_player(payload: LoginRequest):
    player = await _get_player(payload.nickname)
    if not player:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    player = await _ensure_player_ids(player)
    stored = player.get("password_hash")
    if not stored:
        # Backward compatibility: older accounts may exist without password hashes.
        # First successful login sets the password and migrates the account.
        _validate_password(payload.password)
        patch = {"password_hash": _hash_password(payload.password)}
        if _is_admin_nick(player.get("nickname")):
            patch["is_admin"] = True
        await db.players.update_one(
            {"nickname_lower": player["nickname_lower"]},
            {"$set": patch},
        )
        player = await _get_player(payload.nickname)
        player = await _ensure_player_ids(player)
        stored = player.get("password_hash")
        if not stored:
            raise HTTPException(status_code=500, detail="Failed to initialize account password.")
    if not _verify_password(payload.password, stored):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    token = await _create_session(player["nickname"])
    return {"player": _sanitize_player(player), "token": token}


@api_router.post("/players/logout")
async def logout_player(x_session_token: Optional[str] = Header(default=None, alias="X-Session-Token")):
    if x_session_token:
        await db.sessions.delete_one({"token": x_session_token})
    return {"ok": True}


@api_router.post("/players/change-password")
async def change_password(payload: ChangePasswordRequest, nick: str = Depends(require_session)):
    player = await _get_player(nick)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found.")
    if not _verify_password(payload.old_password, player.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Old password incorrect.")
    _validate_password(payload.new_password)
    await db.players.update_one(
        {"nickname_lower": player["nickname_lower"]},
        {"$set": {"password_hash": _hash_password(payload.new_password)}},
    )
    # Invalidate other sessions
    await db.sessions.delete_many({"nickname": nick})
    new_token = await _create_session(nick)
    return {"ok": True, "token": new_token}


@api_router.get("/me")
async def me(nick: str = Depends(require_session)):
    await _ach_recheck_and_persist(nick)
    player = await _get_player(nick)
    player = await _ensure_player_ids(player)
    out = _sanitize_player(player)
    try:
        rating = max(0, int(out.get("rating", 500) or 500))
        place = (await db.players.count_documents({"rating": {"$gt": rating}})) + 1
        out["league"] = "top500" if (place <= 500 and rating > 10000) else _league_for_rating(rating)
        out["ranked_place"] = int(place) if place <= 500 else None
    except Exception:
        out["league"] = _league_for_rating(max(0, int(out.get("rating", 500) or 500)))
        out["ranked_place"] = None
    return out


async def _require_admin(nick: str):
    me_player = await _get_player(nick)
    if not me_player or not (me_player.get("is_admin") or _is_admin_nick(nick)):
        raise HTTPException(status_code=403, detail="Admin privileges required.")
    return me_player


@api_router.get("/players/{nickname}")
async def get_player_public(nickname: str):
    doc = await _get_player(nickname)
    if not doc:
        raise HTTPException(status_code=404, detail="Player not found.")
    return _sanitize_player(doc)


@api_router.get("/players/by-num/{player_num}")
async def get_player_by_num(player_num: int = FPath(..., ge=0, le=2000000)):
    pn = int(player_num)
    doc = await db.players.find_one({"player_num": pn}, {"_id": 0})
    if not doc:
        doc = await db.players.find_one({"player_num_prev": pn}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Player not found.")
    doc = await _ensure_player_ids(doc)
    return _sanitize_player(doc)


@api_router.get("/achievements/defs")
async def get_achievement_defs():
    return {"achievements": ACHIEVEMENTS}


@api_router.get("/achievements/me")
async def get_my_achievements(nick: str = Depends(require_session)):
    await _ach_recheck_and_persist(nick)
    player = await _get_player(nick)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found.")
    unlocked, _st = _ach_get(player)
    return {
        "nickname": player.get("nickname") or nick,
        "unlocked": unlocked,
        "unlocked_count": len(list(unlocked.keys())),
    }


@api_router.get("/achievements/{nickname}")
async def get_player_achievements_public(nickname: str):
    player = await _get_player(nickname)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found.")
    unlocked, _st = _ach_get(player)
    return {
        "nickname": player.get("nickname") or nickname,
        "unlocked": unlocked,
        "unlocked_count": len(list(unlocked.keys())),
    }


# --- Shop ---

@api_router.get("/shop/items")
async def list_shop_items():
    return [{"id": k, **v} for k, v in SHOP_CATALOG.items()]


@api_router.post("/shop/purchase")
async def purchase_item(payload: PurchaseRequest, nick: str = Depends(require_session)):
    item = SHOP_CATALOG.get(payload.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
    player = await _get_player(nick)
    if payload.item_id in (player.get("owned_items") or []):
        raise HTTPException(status_code=409, detail="Item already owned.")
    if player.get("coins", 0) < item["price"]:
        raise HTTPException(status_code=402, detail=f"Insufficient coins. Need {item['price']}.")
    await db.players.update_one(
        {"nickname_lower": player["nickname_lower"]},
        {"$inc": {"coins": -item["price"]}, "$push": {"owned_items": payload.item_id}},
    )
    await _ach_recheck_and_persist(nick)
    updated = await _get_player(nick)
    return {"ok": True, "item_id": payload.item_id, "player": _sanitize_player(updated)}


# --- Leaderboard ---

@api_router.post("/leaderboard")
async def submit_score(payload: ScoreCreate, nick: str = Depends(require_session)):
    if payload.player_name.lower() != nick.lower():
        raise HTTPException(status_code=403, detail="Player mismatch with session.")
    player = await _get_player(nick)
    if not player:
        raise HTTPException(status_code=403, detail="Player not registered.")

    player = await _ensure_daily_window(player)
    entry = Score(**payload.model_dump())
    entry.coins_awarded = _compute_coins(
        payload.mode, payload.level_id, payload.lives_remaining,
        payload.lives_total, payload.time_seconds, payload.flags, payload.won,
    )
    rating_delta = _compute_rating_delta(payload.mode, payload.won, payload.time_seconds, payload.lives_remaining)
    # Ranked duels: performance-based rating change using server-side duel state.
    if payload.mode == "battle_ranked" and payload.lobby_code:
        try:
            code = (payload.lobby_code or "").upper()
            lobby = await db.lobbies.find_one({"code": code}, {"_id": 0, "host": 1, "guest": 1, "host_result": 1, "guest_result": 1, "config": 1})
            game = ACTIVE_GAMES.get(code)
            if lobby and game and nick in game.players:
                other = (lobby.get("guest") if nick == lobby.get("host") else lobby.get("host"))
                opp_res = None
                if other == lobby.get("host"):
                    opp_res = lobby.get("host_result")
                elif other == lobby.get("guest"):
                    opp_res = lobby.get("guest_result")

                p = game.players.get(nick)
                op = game.players.get(other) if other else None
                correct_flags = len(set(p.flags) & set(p.mines)) if p else 0
                opp_correct_flags = len(set(op.flags) & set(op.mines)) if op else 0
                safe_revealed = p.safe_revealed() if p else 0
                opp_safe_revealed = op.safe_revealed() if op else 0

                opp_time = None
                if isinstance(opp_res, dict):
                    opp_time = opp_res.get("time_seconds")

                mines_total = len(p.mines) if p else int((lobby.get("config") or {}).get("mines") or 1)

                rating_delta = _compute_ranked_duel_rating_delta(
                    won=bool(payload.won),
                    lives_remaining=int(payload.lives_remaining or 0),
                    lives_total=int(payload.lives_total or 1),
                    time_seconds=int(payload.time_seconds or 0),
                    safe_revealed=int(safe_revealed),
                    opp_safe_revealed=int(opp_safe_revealed),
                    correct_flags=int(correct_flags),
                    opp_correct_flags=int(opp_correct_flags),
                    mines_total=int(mines_total),
                    opp_time_seconds=(int(opp_time) if opp_time is not None else None),
                )
        except Exception:
            pass
    await db.leaderboard.insert_one(entry.model_dump())

    # Update daily progress (UTC+2 12-hour windows)
    try:
        won = bool(payload.won)
        lost = not won
        ts = int(payload.time_seconds or 0)
        flags = int(payload.flags or 0)
        lr = int(payload.lives_remaining or 0)
        lt = int(payload.lives_total or 1)

        inc: Dict[str, int] = {
            "daily_progress.gamesPlayed": 1,
            "daily_progress.gamesWon": 1 if won else 0,
            "daily_progress.gamesLost": 1 if lost else 0,
            "daily_progress.flagsPlaced": flags,
            "daily_progress.timePlayedSeconds": max(0, ts),
            "daily_progress.winsUnder60": 1 if (won and ts > 0 and ts < 60) else 0,
            "daily_progress.winsUnder30": 1 if (won and ts > 0 and ts < 30) else 0,
            "daily_progress.winsNoFlags": 1 if (won and flags <= 0) else 0,
            "daily_progress.winsFlawless": 1 if (won and lt > 0 and lr >= lt) else 0,
            "daily_progress.winsWith1Life": 1 if (won and lr == 1) else 0,
            "daily_progress.campaignWins": 1 if (won and str(payload.mode or "") == "campaign") else 0,
        }
        if payload.safe_revealed is not None:
            inc["daily_progress.safeRevealed"] = int(payload.safe_revealed or 0)
        else:
            inc["daily_progress.safeRevealed"] = 0
        await db.players.update_one(
            {"nickname_lower": player["nickname_lower"]},
            {"$inc": inc},
        )
    except Exception:
        pass

    # Update achievements (server-authoritative)
    new_unlocked: List[str] = []
    try:
        unlocked, st = _ach_get(player)
        won = bool(payload.won)

        mode = str(payload.mode or "")
        is_duel = mode in ("battle_simple", "battle_ranked", "lobby")

        next_st = dict(st)
        next_st["games_played"] = int(next_st.get("games_played") or 0) + 1
        next_st["games_won"] = int(next_st.get("games_won") or 0) + (1 if won else 0)
        next_st["win_streak"] = (int(next_st.get("win_streak") or 0) + 1) if won else 0
        next_st["flags_total"] = int(next_st.get("flags_total") or 0) + int(payload.flags or 0)
        if is_duel:
            next_st["duels_played"] = int(next_st.get("duels_played") or 0) + 1
            next_st["duels_won"] = int(next_st.get("duels_won") or 0) + (1 if won else 0)
        if mode == "battle_ranked":
            next_st["ranked_played"] = int(next_st.get("ranked_played") or 0) + 1
        if mode == "campaign" and won:
            next_st["campaign_wins"] = int(next_st.get("campaign_wins") or 0) + 1
        next_st["coins_earned_total"] = int(next_st.get("coins_earned_total") or 0) + max(0, int(entry.coins_awarded or 0))

        rating_after = max(0, int((player.get("rating") or 500)) + int(rating_delta or 0))
        coins_after = int((player.get("coins") or 0)) + int(entry.coins_awarded or 0)
        player_after = {**player, "rating": rating_after, "coins": coins_after, "achievements_unlocked": unlocked, "achievements_stats": next_st}
        to_unlock = _ach_should_unlock(player_after, payload=payload, coins_balance_after=coins_after)

        new_unlocked = list(to_unlock or [])

        set_doc: Dict[str, Any] = {"achievements_stats": next_st}
        if to_unlock:
            ts = int(datetime.now(timezone.utc).timestamp() * 1000)
            for aid in to_unlock:
                set_doc[f"achievements_unlocked.{aid}"] = ts

        await db.players.update_one(
            {"nickname_lower": player["nickname_lower"]},
            {"$set": set_doc},
        )
    except Exception:
        pass
    if entry.coins_awarded or rating_delta:
        await db.players.update_one(
            {"nickname_lower": player["nickname_lower"]},
            [
                {
                    "$set": {
                        "coins": {
                            "$add": [
                                {"$ifNull": ["$coins", 0]},
                                int(entry.coins_awarded or 0),
                            ]
                        },
                        "rating": {
                            "$max": [
                                0,
                                {
                                    "$add": [
                                        {"$ifNull": ["$rating", 500]},
                                        int(rating_delta or 0),
                                    ]
                                },
                            ]
                        },
                    }
                }
            ],
        )
    return {
        "entry": entry.model_dump(),
        "coins_awarded": entry.coins_awarded,
        "rating_delta": rating_delta,
        "new_unlocked": new_unlocked,
    }


@api_router.get("/daily/state")
async def get_daily_state(nick: str = Depends(require_session)):
    player = await _get_player(nick)
    if not player:
        raise HTTPException(status_code=403, detail="Player not registered.")
    player = await _ensure_daily_window(player)
    now_local = _daily_now_local()
    active_ids = player.get("daily_active") or []
    active_ids = [str(x) for x in active_ids if x]
    quests = [q for q in (DAILY_QUESTS or []) if str(q.get("id")) in set(active_ids)]
    claimed = player.get("daily_claimed") or {}
    claimed_coins = 0
    try:
        for q in quests:
            if claimed.get(q.get("id")):
                claimed_coins += max(0, int(q.get("rewardCoins") or 0))
    except Exception:
        claimed_coins = 0
    return {
        "window_key": player.get("daily_window") or _daily_window_key(now_local),
        "active": active_ids,
        "progress": player.get("daily_progress") or {},
        "claimed": claimed,
        "claimed_coins": claimed_coins,
        "seconds_until_reset": _daily_seconds_until_reset(now_local),
        "quests": quests,
    }


@api_router.post("/daily/claim")
async def claim_daily(req: DailyClaimRequest, nick: str = Depends(require_session)):
    qid = (req.quest_id or "").strip()
    q = next((x for x in DAILY_QUESTS if x.get("id") == qid), None)
    if not q:
        raise HTTPException(status_code=404, detail="Quest not found.")

    player = await _get_player(nick)
    if not player:
        raise HTTPException(status_code=403, detail="Player not registered.")

    player = await _ensure_daily_window(player)
    active_ids = player.get("daily_active") or []
    if qid not in set([str(x) for x in active_ids if x]):
        raise HTTPException(status_code=409, detail="Quest is not active in this window.")
    qp = _daily_quest_progress(player, q)
    if not qp.get("done"):
        raise HTTPException(status_code=409, detail="Quest not completed.")
    if qp.get("claimed"):
        raise HTTPException(status_code=409, detail="Already claimed.")

    coins = max(0, int(q.get("rewardCoins") or 0))
    update_doc: Dict[str, Any] = {"$set": {f"daily_claimed.{qid}": True}}
    if coins:
        update_doc["$inc"] = {"coins": coins}
    await db.players.update_one({"nickname_lower": player["nickname_lower"]}, update_doc)

    # Achievements from daily claim
    new_unlocked: List[str] = []
    try:
        updated0 = await _get_player(nick)
        updated0 = await _ensure_daily_window(updated0)
        unlocked, st = _ach_get(updated0)
        wk = updated0.get("daily_window")
        last_wk = st.get("daily_claim_last_window")
        next_st = dict(st)
        if wk and wk != last_wk:
            next_st["daily_claims"] = int(next_st.get("daily_claims") or 0) + 1
            prev = _daily_prev_window_key(str(wk))
            if last_wk and prev and str(last_wk) == str(prev):
                next_st["daily_claim_streak"] = int(next_st.get("daily_claim_streak") or 0) + 1
            else:
                next_st["daily_claim_streak"] = 1
            next_st["daily_claim_last_window"] = wk
        next_st["coins_earned_total"] = int(next_st.get("coins_earned_total") or 0) + max(0, int(coins or 0))

        coins_after = int((updated0.get("coins") or 0))
        player_after = {**updated0, "achievements_unlocked": unlocked, "achievements_stats": next_st}
        to_unlock = _ach_should_unlock(player_after, payload=None, coins_balance_after=coins_after)
        new_unlocked = list(to_unlock or [])
        set_doc: Dict[str, Any] = {"achievements_stats": next_st}
        if to_unlock:
            ts = int(datetime.now(timezone.utc).timestamp() * 1000)
            for aid in to_unlock:
                set_doc[f"achievements_unlocked.{aid}"] = ts
        await db.players.update_one(
            {"nickname_lower": updated0["nickname_lower"]},
            {"$set": set_doc},
        )
    except Exception:
        pass
    updated = await _get_player(nick)
    updated = await _ensure_daily_window(updated)
    now_local = _daily_now_local()
    claimed = updated.get("daily_claimed") or {}
    claimed_coins = 0
    try:
        for q2 in DAILY_QUESTS:
            if claimed.get(q2.get("id")):
                claimed_coins += max(0, int(q2.get("rewardCoins") or 0))
    except Exception:
        claimed_coins = 0
    return {
        "ok": True,
        "quest_id": qid,
        "coins_awarded": coins,
        "new_unlocked": new_unlocked,
        "player": _sanitize_player(updated),
        "daily": {
            "window_key": updated.get("daily_window") or _daily_window_key(now_local),
            "progress": updated.get("daily_progress") or {},
            "claimed": claimed,
            "claimed_coins": claimed_coins,
            "seconds_until_reset": _daily_seconds_until_reset(now_local),
        },
    }


@api_router.get("/leaderboard", response_model=List[Score])
async def get_leaderboard(
    difficulty: Optional[str] = Query(default=None),
    mode: Optional[str] = Query(default=None),
    level_id: Optional[int] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
):
    query = {"won": True}
    if difficulty: query["difficulty"] = difficulty
    if mode: query["mode"] = mode
    if level_id is not None: query["level_id"] = level_id
    cursor = db.leaderboard.find(query, {"_id": 0}).sort("score", -1).limit(limit)
    return await cursor.to_list(length=limit)


@api_router.get("/leaderboard/recent", response_model=List[Score])
async def get_recent_runs(limit: int = Query(default=10, ge=1, le=50)):
    cursor = db.leaderboard.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    return await cursor.to_list(length=limit)


@api_router.get("/leaderboard/ranked")
async def get_ranked_leaderboard(limit: int = Query(default=20, ge=1, le=500)):
    # Defensive de-duplication (old DB data might contain duplicate nicknames).
    # We fetch more than needed, then keep only the highest-rated entry per nickname/player_uuid.
    fetch_n = min(2000, max(500, int(limit) * 4))
    cursor = db.players.find(
        {"rating": {"$exists": True}},
        {"_id": 0, "nickname_lower": 0, "password_hash": 0},
    ).sort("rating", -1).limit(fetch_n)
    rows = await cursor.to_list(length=fetch_n)
    seen = set()
    out = []
    for p in rows:
        try:
            p["rating"] = max(0, int(p.get("rating", 0) or 0))
        except Exception:
            p["rating"] = 0
        try:
            if p.get("hidden_ranked") and int(p.get("hidden_ranked_rating") or 0) == int(p.get("rating") or 0):
                continue
        except Exception:
            pass
        key = (p.get("player_uuid") or p.get("nickname") or "").lower()
        if not key:
            continue
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
        if len(out) >= int(limit):
            break
    return out


@api_router.delete("/leaderboard/{entry_id}")
async def delete_leaderboard_entry(entry_id: str, nick: str = Depends(require_session)):
    if not _is_admin_nick(nick):
        # also check DB is_admin flag
        p = await _get_player(nick)
        if not p or not p.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin privileges required.")
    result = await db.leaderboard.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found.")
    return {"deleted": entry_id}


class AdminPromoteRequest(BaseModel):
    nickname: str = Field(..., min_length=3, max_length=20)


class AdminHideRankedRequest(BaseModel):
    nickname: str = Field(..., min_length=3, max_length=20)


class AdminResetAchievementsRequest(BaseModel):
    nickname: str = Field(..., min_length=3, max_length=20)


@api_router.post("/admin/promote")
async def promote_to_admin(payload: AdminPromoteRequest, nick: str = Depends(require_session)):
    await _require_admin(nick)
    target = await _get_player(payload.nickname)
    if not target:
        raise HTTPException(status_code=404, detail="Target player not found.")
    await db.players.update_one({"nickname_lower": target["nickname_lower"]}, {"$set": {"is_admin": True}})
    updated = await _get_player(payload.nickname)
    return {"ok": True, "player": _sanitize_player(updated)}


@api_router.post("/admin/ranked/hide")
async def admin_hide_ranked(payload: AdminHideRankedRequest, nick: str = Depends(require_session)):
    await _require_admin(nick)
    target = await _get_player(payload.nickname)
    if not target:
        raise HTTPException(status_code=404, detail="Player not found.")
    rating = int(target.get("rating", 0) or 0)
    await db.players.update_one(
        {"nickname_lower": target["nickname_lower"]},
        {"$set": {"hidden_ranked": True, "hidden_ranked_rating": rating}},
    )
    return {"ok": True, "nickname": target.get("nickname"), "hidden_ranked": True, "hidden_ranked_rating": rating}


@api_router.get("/admin/players")
async def admin_list_players(limit: int = Query(default=200, ge=1, le=2000), nick: str = Depends(require_session)):
    await _require_admin(nick)
    cursor = db.players.find(
        {},
        {"_id": 0, "password_hash": 0},
    ).sort("player_num", 1).limit(limit)
    players = await cursor.to_list(length=limit)
    out = []
    for p in players:
        p = await _ensure_player_ids(p)
        out.append({
            "nickname": p.get("nickname"),
            "player_num": p.get("player_num"),
            "player_uuid": p.get("player_uuid"),
            "is_admin": bool(p.get("is_admin")),
        })
    return {"players": out}


@api_router.post("/admin/demote")
async def demote_admin(payload: AdminPromoteRequest, nick: str = Depends(require_session)):
    await _require_admin(nick)
    if _is_admin_nick(payload.nickname):
        raise HTTPException(status_code=403, detail="Cannot demote the root admin.")
    target = await _get_player(payload.nickname)
    if not target:
        raise HTTPException(status_code=404, detail="Target player not found.")
    await db.players.update_one({"nickname_lower": target["nickname_lower"]}, {"$set": {"is_admin": False}})
    return {"ok": True}


@api_router.post("/admin/reindex-player-nums")
async def admin_reindex_player_nums(limit: int = Query(default=5000, ge=1, le=20000), nick: str = Depends(require_session)):
    await _require_admin(nick)
    players = await db.players.find(
        {},
        {"nickname_lower": 1, "created_at": 1},
    ).sort([("created_at", 1), ("_id", 1)]).limit(limit).to_list(length=limit)
    if not players:
        return {"ok": True, "updated": 0}

    updated = 0
    seq = 1
    for p in players:
        nl = p.get("nickname_lower")
        if not nl:
            continue
        if nl == ROOT_ADMIN_NICK_LOWER:
            cur = await db.players.find_one({"nickname_lower": nl}, {"player_num": 1})
            prev_num = (cur or {}).get("player_num")
            set_patch: Dict[str, Any] = {"player_num": 0}
            if prev_num is not None and prev_num != 0:
                set_patch["player_num_prev"] = int(prev_num)
            await db.players.update_one({"nickname_lower": nl}, {"$set": set_patch})
            updated += 1
            continue
        cur = await db.players.find_one({"nickname_lower": nl}, {"player_num": 1, "player_num_prev": 1})
        prev_num = (cur or {}).get("player_num")
        set_patch: Dict[str, Any] = {"player_num": seq}
        if prev_num is not None and prev_num != seq:
            set_patch["player_num_prev"] = int(prev_num)
        await db.players.update_one({"nickname_lower": nl}, {"$set": set_patch})
        updated += 1
        seq += 1

    try:
        await db.counters.update_one({"_id": "player_num"}, {"$set": {"seq": seq - 1}}, upsert=True)
    except Exception:
        pass

    return {"ok": True, "updated": updated, "last": seq - 1}


@api_router.post("/admin/ratings/fix-negative")
async def admin_fix_negative_ratings(nick: str = Depends(require_session)):
    await _require_admin(nick)
    res = await db.players.update_many({"rating": {"$lt": 0}}, {"$set": {"rating": 0}})
    return {"ok": True, "fixed": int(res.modified_count or 0)}


@api_router.post("/admin/rating/grant-win")
async def admin_grant_rating_win(nick: str = Depends(require_session)):
    await _require_admin(nick)
    player = await _get_player(nick)
    if not player:
        raise HTTPException(status_code=403, detail="Player not registered.")

    # Mimic a single ranked win (legacy delta).
    delta = int(_compute_rating_delta("battle_ranked", True, 999, 1) or 0)
    if delta == 0:
        delta = 10

    await db.players.update_one(
        {"nickname_lower": player.get("nickname_lower")},
        {"$inc": {"rating": delta}},
    )
    updated = await _get_player(nick)
    return {"ok": True, "rating_delta": delta, "player": _sanitize_player(updated)}


@api_router.post("/admin/coins/grant")
async def admin_grant_coins(amount: int = Query(default=100, ge=1, le=100000), nick: str = Depends(require_session)):
    await _require_admin(nick)
    player = await _get_player(nick)
    if not player:
        raise HTTPException(status_code=403, detail="Player not registered.")

    inc = int(amount or 0)
    await db.players.update_one(
        {"nickname_lower": player.get("nickname_lower")},
        {"$inc": {"coins": inc}},
    )

    updated0 = await _get_player(nick)
    if not updated0:
        raise HTTPException(status_code=404, detail="Player not found.")

    # Count admin-granted coins towards the "earned" statistic too.
    unlocked, st = _ach_get(updated0)
    next_st = dict(st)
    next_st["coins_earned_total"] = int(next_st.get("coins_earned_total") or 0) + max(0, inc)

    coins_after = int((updated0.get("coins") or 0))
    player_after = {**updated0, "achievements_unlocked": unlocked, "achievements_stats": next_st}
    to_unlock = _ach_should_unlock(player_after, payload=None, coins_balance_after=coins_after)

    set_doc: Dict[str, Any] = {"achievements_stats": next_st}
    if to_unlock:
        ts = int(datetime.now(timezone.utc).timestamp() * 1000)
        for aid in to_unlock:
            set_doc[f"achievements_unlocked.{aid}"] = ts
    await db.players.update_one(
        {"nickname_lower": updated0.get("nickname_lower")},
        {"$set": set_doc},
    )

    updated = await _get_player(nick)
    return {"ok": True, "coins_delta": inc, "player": _sanitize_player(updated)}


@api_router.post("/admin/achievements/reset")
async def admin_reset_achievements(payload: AdminResetAchievementsRequest, nick: str = Depends(require_session)):
    await _require_admin(nick)
    target = await _get_player(payload.nickname)
    if not target:
        raise HTTPException(status_code=404, detail="Player not found.")

    await db.players.update_one(
        {"nickname_lower": target.get("nickname_lower")},
        {"$set": {"achievements_unlocked": {}, "achievements_stats": {}}},
    )
    updated = await _get_player(payload.nickname)
    return {"ok": True, "player": _sanitize_player(updated)}


@api_router.delete("/admin/player/{nickname}")
async def admin_delete_player(nickname: str, nick: str = Depends(require_session)):
    await _require_admin(nick)
    target = await _get_player(nickname)
    if not target:
        raise HTTPException(status_code=404, detail="Player not found.")
    if _is_admin_nick(target.get("nickname")):
        raise HTTPException(status_code=403, detail="Cannot delete the root admin.")
    if target.get("is_admin"):
        raise HTTPException(status_code=403, detail="Cannot delete an admin account.")

    target_nick = target.get("nickname")
    target_lower = (target.get("nickname_lower") or (target_nick or "").lower())

    await db.sessions.delete_many({"nickname": target_nick})
    await db.leaderboard.delete_many({"player_name": target_nick})
    await db.lobbies.delete_many({"$or": [{"host": target_nick}, {"guest": target_nick}]})
    await db.players.delete_one({"nickname_lower": target_lower})

    try:
        for code, game in list(ACTIVE_GAMES.items()):
            try:
                if target_nick in getattr(game, 'players', {}):
                    ACTIVE_GAMES.pop(code, None)
            except Exception:
                pass
    except Exception:
        pass

    return {"ok": True, "deleted": target_nick}


@api_router.get("/stats/player")
async def get_player_stats(name: str = Query(..., min_length=1, max_length=20)):
    cursor = db.leaderboard.find({"player_name": name}, {"_id": 0})
    runs = await cursor.to_list(length=2000)
    total = len(runs)
    wins = sum(1 for r in runs if r.get("won"))
    campaign_wins = sum(1 for r in runs if r.get("won") and r.get("mode") == "campaign")
    battle_wins = sum(1 for r in runs if r.get("won") and r.get("mode", "").startswith("battle"))
    best_score = max((r.get("score", 0) for r in runs if r.get("won")), default=0)
    best_time = min((r.get("time_seconds", 9999) for r in runs if r.get("won")), default=0) if wins else 0
    total_time = sum(r.get("time_seconds", 0) for r in runs)
    return {
        "player_name": name,
        "total_runs": total,
        "wins": wins,
        "losses": total - wins,
        "campaign_wins": campaign_wins,
        "battle_wins": battle_wins,
        "win_rate": round(wins / total, 3) if total else 0,
        "best_score": best_score,
        "best_time": best_time,
        "total_play_time": total_time,
    }


# --- Lobbies / Multiplayer ---

def _gen_code() -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def _norm_lobby_code(code: str) -> str:
    return (code or "").strip().upper()


async def _player_rating_and_last_opponent(nick: str) -> tuple[int, tuple[Optional[str], Optional[int]]]:
    try:
        doc = await _get_player(nick)
        if not doc:
            return (500, (None, None))
        rating = int(doc.get("rating", 500) or 500)
        last_opp = doc.get("last_opponent")
        last_opp_at = doc.get("last_opponent_at")
        try:
            last_opp_at = int(last_opp_at) if last_opp_at is not None else None
        except Exception:
            last_opp_at = None
        if isinstance(last_opp, str) and last_opp.strip():
            return (rating, (last_opp, last_opp_at))
        return (rating, (None, None))
    except Exception:
        return (500, (None, None))


def _sanitize_lobby(doc):
    if not doc: return None
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


DUEL_TIME_LIMIT_SECONDS = 5 * 60
RANKED_DUEL_TIME_LIMIT_SECONDS = 20 * 60


def _duel_time_limit_seconds(mode: Optional[str]) -> int:
    if (mode or "") == "battle_ranked":
        return RANKED_DUEL_TIME_LIMIT_SECONDS
    return DUEL_TIME_LIMIT_SECONDS


def _league_for_rating(rating: int) -> str:
    r = int(rating or 0)
    if r < 1000:
        return "wood"
    if r < 1500:
        return "stone"
    if r < 2500:
        return "bronze"
    if r < 4500:
        return "iron"
    if r < 8500:
        return "gold"
    if r <= 10000:
        return "diamond"
    return "top"


async def _ensure_lobby_playing(code: str) -> Optional[dict]:
    """Server-authoritative start (matchmaking only): if lobby is PUBLIC and both players are present and lobby is waiting, start it."""
    code = _norm_lobby_code(code)
    lobby = await db.lobbies.find_one({"code": code}, {"_id": 0})
    if not lobby:
        return None
    if not lobby.get("public"):
        return lobby
    if lobby.get("status") == "waiting" and lobby.get("guest"):
        await db.lobbies.update_one(
            {"code": code},
            {"$set": {"status": "playing", "started_at": datetime.now(timezone.utc).isoformat()}},
        )
        lobby = await db.lobbies.find_one({"code": code}, {"_id": 0})
    return lobby


@api_router.post("/lobbies")
async def create_lobby(payload: LobbyCreateRequest, nick: str = Depends(require_session)):
    for _ in range(8):
        code = _gen_code()
        if not await db.lobbies.find_one({"code": code}):
            break
    else:
        raise HTTPException(status_code=500, detail="Could not generate unique code.")
    now_ts = int(datetime.now(timezone.utc).timestamp())
    seed = secrets.randbits(32)
    host_rating, _ = await _player_rating_and_last_opponent(nick)
    lobby = {
        "code": code,
        "mode": payload.mode,
        "public": payload.public,
        "host": nick,
        "host_rating": host_rating,
        "guest": None,
        "config": {
            "rows": payload.rows, "cols": payload.cols,
            "mines": payload.mines, "lives": payload.lives,
            "narc": bool(payload.narc),
            "random_mode": bool(payload.random_mode),
            "no_flags": bool(payload.no_flags),
        },
        "seed": seed,
        "status": "waiting",
        "host_result": None,
        "guest_result": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_at_epoch": now_ts,
    }
    await db.lobbies.insert_one(lobby)
    return _sanitize_lobby(lobby)


@api_router.post("/lobbies/{code}/join")
async def join_lobby(code: str, nick: str = Depends(require_session)):
    code = _norm_lobby_code(code)
    lobby = await db.lobbies.find_one({"code": code})
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found.")
    if lobby["status"] != "waiting":
        raise HTTPException(status_code=409, detail="Lobby already started or finished.")
    if lobby["host"] == nick:
        return _sanitize_lobby(lobby)
    if lobby.get("guest") and lobby["guest"] != nick:
        raise HTTPException(status_code=409, detail="Lobby full.")
    await db.lobbies.update_one({"code": code}, {"$set": {"guest": nick}})
    # Auto-start only for PUBLIC matchmaking duels. Friend-code lobbies remain host-started.
    if lobby.get("public"):
        await _ensure_lobby_playing(code)
    return _sanitize_lobby(await db.lobbies.find_one({"code": code}))


@api_router.get("/lobbies/{code}")
async def get_lobby(code: str):
    code = _norm_lobby_code(code)
    lobby = await db.lobbies.find_one({"code": code}, {"_id": 0})
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found.")
    return lobby


@api_router.post("/lobbies/{code}/start")
async def start_lobby(code: str, nick: str = Depends(require_session)):
    code = _norm_lobby_code(code)
    lobby = await db.lobbies.find_one({"code": code})
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found.")

    # Public matchmaking lobbies are started by the server automatically.
    if lobby.get("public"):
        lob = await _ensure_lobby_playing(code)
        if not lob:
            raise HTTPException(status_code=404, detail="Lobby not found.")
        if lob.get("status") != "playing":
            raise HTTPException(status_code=409, detail="No opponent yet.")
        return _sanitize_lobby(lob)

    # Private friend-code lobbies: host must start.
    if lobby["host"] != nick:
        raise HTTPException(status_code=403, detail="Only host can start.")
    if not lobby.get("guest"):
        raise HTTPException(status_code=409, detail="No opponent yet.")
    await db.lobbies.update_one({"code": code}, {"$set": {"status": "playing", "started_at": datetime.now(timezone.utc).isoformat()}})
    return _sanitize_lobby(await db.lobbies.find_one({"code": code}))


@api_router.post("/lobbies/{code}/result")
async def submit_lobby_result(code: str, payload: Dict[str, Any], nick: str = Depends(require_session)):
    code = _norm_lobby_code(code)
    lobby = await db.lobbies.find_one({"code": code})
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found.")
    result = {
        "player": nick,
        "score": int(payload.get("score", 0)),
        "time_seconds": int(payload.get("time_seconds", 0)),
        "won": bool(payload.get("won", False)),
        "lives_remaining": int(payload.get("lives_remaining", 0)),
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }
    field = "host_result" if lobby["host"] == nick else "guest_result" if lobby.get("guest") == nick else None
    if not field:
        raise HTTPException(status_code=403, detail="You are not in this lobby.")
    await db.lobbies.update_one({"code": code}, {"$set": {field: result}})
    updated = await db.lobbies.find_one({"code": code})
    if updated.get("host_result") and updated.get("guest_result"):
        await db.lobbies.update_one({"code": code}, {"$set": {"status": "finished"}})
        try:
            host = updated.get("host")
            guest = updated.get("guest")
            if host and guest:
                now_ts = int(datetime.now(timezone.utc).timestamp())
                await db.players.update_one(
                    {"nickname_lower": str(host).lower()},
                    {"$set": {"last_opponent": guest, "last_opponent_at": now_ts}},
                )
                await db.players.update_one(
                    {"nickname_lower": str(guest).lower()},
                    {"$set": {"last_opponent": host, "last_opponent_at": now_ts}},
                )
        except Exception:
            pass
    return _sanitize_lobby(await db.lobbies.find_one({"code": code}))


@api_router.post("/lobbies/{code}/progress")
async def report_progress(code: str, payload: Dict[str, Any], nick: str = Depends(require_session)):
    """Report live progress during a lobby game. Other player can poll."""
    code = _norm_lobby_code(code)
    lobby = await db.lobbies.find_one({"code": code})
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found.")
    field = "host_progress" if lobby["host"] == nick else "guest_progress" if lobby.get("guest") == nick else None
    if not field:
        raise HTTPException(status_code=403, detail="Not in lobby.")
    progress = {
        "safe_revealed": int(payload.get("safe_revealed") or 0),
        "total_safe": int(payload.get("total_safe") or 0),
        "lives": int(payload.get("lives") or 0),
        "time": int(payload.get("time") or 0),
        "flags": int(payload.get("flags") or 0),
        "done": bool(payload.get("done", False)),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.lobbies.update_one({"code": code}, {"$set": {field: progress}})
    return {"ok": True}


@api_router.post("/matchmaking/find")
async def matchmaking_find(payload: LobbyCreateRequest, nick: str = Depends(require_session)):
    """Find a public waiting lobby matching mode, else create one."""
    my_rating, last_opp_info = await _player_rating_and_last_opponent(nick)
    last_opp, last_opp_at = last_opp_info if isinstance(last_opp_info, tuple) else (None, None)
    now_ts = int(datetime.now(timezone.utc).timestamp())
    is_ranked = (payload.mode or "") == "battle_ranked"
    cooldown_ok = True if not is_ranked else ((last_opp_at is None) or ((now_ts - int(last_opp_at)) >= 120))
    if not is_ranked:
        # Simple duels: allow immediate rematch with the same opponent.
        last_opp = None

    # Only match against lobbies that were created recently.
    # This prevents pairing with a host who stopped searching (closed page/app) leaving a stale waiting lobby behind.
    MM_LOBBY_TTL_SECONDS = 90

    query = {
        "mode": payload.mode,
        "public": True,
        "status": "waiting",
        "host": {"$ne": nick},
        "guest": None,
        "created_at_epoch": {"$gte": int(now_ts - MM_LOBBY_TTL_SECONDS)},
        "config.rows": payload.rows,
        "config.cols": payload.cols,
        "config.mines": payload.mines,
    }

    candidates: List[dict] = []
    try:
        cursor = db.lobbies.find(query, {"_id": 0}).limit(50)
        candidates = await cursor.to_list(length=50)
    except Exception:
        candidates = []

    if candidates:
        def _score(l: dict) -> tuple[int, int]:
            host = (l.get("host") or "")
            hr = l.get("host_rating")
            try:
                hrn = int(hr) if hr is not None else 500
            except Exception:
                hrn = 500
            diff = abs(hrn - int(my_rating or 500))
            same_as_last = last_opp and host and str(host).lower() == str(last_opp).lower()
            repeat_penalty = 1 if (same_as_last and not cooldown_ok) else 0
            return (repeat_penalty, diff)

        candidates.sort(key=_score)
        best = candidates[0]
        if last_opp and (best.get("host") or "") and str(best.get("host")).lower() == str(last_opp).lower() and not cooldown_ok:
            # If the best candidate is the same opponent as last time and cooldown hasn't passed, try to pick the next closest.
            for cand in candidates[1:]:
                if str((cand.get("host") or "")).lower() != str(last_opp).lower():
                    best = cand
                    break

        if last_opp and str((best.get("host") or "")).lower() == str(last_opp).lower() and not cooldown_ok:
            # Only the last opponent is available right now and cooldown hasn't passed; wait for someone else.
            return await create_lobby(payload, nick)

        await db.lobbies.update_one({"code": best["code"], "guest": None, "status": "waiting"}, {"$set": {"guest": nick}})
        await _ensure_lobby_playing(best["code"])
        return _sanitize_lobby(await db.lobbies.find_one({"code": best["code"]}))

    return await create_lobby(payload, nick)


@api_router.post("/lobbies/{code}/cancel")
async def cancel_lobby(code: str, nick: str = Depends(require_session)):
    code = _norm_lobby_code(code)
    lobby = await db.lobbies.find_one({"code": code})
    if not lobby:
        return {"ok": True}
    if lobby["host"] != nick and lobby.get("guest") != nick:
        raise HTTPException(status_code=403, detail="Not in this lobby.")
    if lobby["host"] == nick and lobby["status"] == "waiting":
        await db.lobbies.delete_one({"code": code})
    elif lobby.get("guest") == nick:
        await db.lobbies.update_one({"code": code}, {"$set": {"guest": None}})
    return {"ok": True}


app.include_router(api_router)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


# --- WebSocket Multiplayer (server-authoritative boards, separate per player) ---

class _WsHub:
    def __init__(self):
        self._conns: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, code: str, nick: str, ws: WebSocket):
        code = _norm_lobby_code(code)
        self._conns.setdefault(code, {})[nick] = ws

    def disconnect(self, code: str, nick: str):
        code = _norm_lobby_code(code)
        try:
            room = self._conns.get(code)
            if not room:
                return
            room.pop(nick, None)
            if not room:
                self._conns.pop(code, None)
        except Exception:
            pass

    async def send(self, code: str, nick: str, payload: dict):
        code = _norm_lobby_code(code)
        ws = self._conns.get(code, {}).get(nick)
        if not ws:
            return
        try:
            await ws.send_json(payload)
        except Exception:
            pass

    async def broadcast(self, code: str, payload: dict):
        code = _norm_lobby_code(code)
        room = self._conns.get(code, {})
        for ws in list(room.values()):
            try:
                await ws.send_json(payload)
            except Exception:
                pass


def _rng(seed: int) -> random.Random:
    r = random.Random()
    r.seed(int(seed) & 0xFFFFFFFF)
    return r


def _adj_counts(rows: int, cols: int, mines: set) -> List[List[int]]:
    adj = [[0 for _ in range(cols)] for _ in range(rows)]
    for (mr, mc) in mines:
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                if dr == 0 and dc == 0:
                    continue
                rr = mr + dr
                cc = mc + dc
                if 0 <= rr < rows and 0 <= cc < cols and (rr, cc) not in mines:
                    adj[rr][cc] += 1
    return adj


def _place_mines(rows: int, cols: int, mines_count: int, safe_r: int, safe_c: int, seed: int) -> set:
    r = _rng(seed)
    safe_zone = set()
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            rr = safe_r + dr
            cc = safe_c + dc
            if 0 <= rr < rows and 0 <= cc < cols:
                safe_zone.add((rr, cc))
    all_cells = [(rr, cc) for rr in range(rows) for cc in range(cols) if (rr, cc) not in safe_zone]
    r.shuffle(all_cells)
    return set(all_cells[: max(0, min(mines_count, len(all_cells)))])


def _flood_reveal(rows: int, cols: int, mines: set, adj: List[List[int]], revealed: set, start: tuple) -> List[tuple]:
    stack = [start]
    changed = []
    while stack:
        r, c = stack.pop()
        if (r, c) in revealed:
            continue
        if (r, c) in mines:
            continue
        revealed.add((r, c))
        changed.append((r, c))
        if adj[r][c] == 0:
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    if dr == 0 and dc == 0:
                        continue
                    rr = r + dr
                    cc = c + dc
                    if 0 <= rr < rows and 0 <= cc < cols and (rr, cc) not in revealed:
                        stack.append((rr, cc))
    return changed


def _serialize_cell(r: int, c: int, mines: set, adj: List[List[int]], revealed: set, flags: set, exploded: Optional[tuple] = None) -> dict:
    is_revealed = (r, c) in revealed
    is_mine = (r, c) in mines
    return {
        "r": r,
        "c": c,
        "revealed": is_revealed,
        "flagged": (r, c) in flags,
        "mine": bool(is_mine) if is_revealed else False,
        "exploded": bool(exploded == (r, c)),
        "adjacent": int(adj[r][c]) if is_revealed and not is_mine else 0,
    }


class _PlayerGame:
    def __init__(self, rows: int, cols: int, mines_count: int, lives: int, seed: int):
        self.rows = rows
        self.cols = cols
        self.mines_count = mines_count
        self.lives_total = lives
        self.lives = lives
        self.seed = seed
        self.started = False
        self.flags = set()
        self.revealed = set()
        self.mines = set()
        self.adj = [[0 for _ in range(cols)] for _ in range(rows)]
        self.exploded = None
        self.done = False
        self.won = False

    def _ensure_board(self, safe_r: int, safe_c: int):
        if self.started:
            return
        self.mines = _place_mines(self.rows, self.cols, self.mines_count, safe_r, safe_c, self.seed)
        self.adj = _adj_counts(self.rows, self.cols, self.mines)
        self.started = True

    def total_safe(self) -> int:
        return self.rows * self.cols - self.mines_count

    def safe_revealed(self) -> int:
        return len(self.revealed)

    def open(self, r: int, c: int) -> Dict[str, Any]:
        if self.done:
            return {"ok": False, "reason": "finished"}
        if not (0 <= r < self.rows and 0 <= c < self.cols):
            return {"ok": False, "reason": "oob"}
        if (r, c) in self.revealed or (r, c) in self.flags:
            return {"ok": False, "reason": "ignored"}

        self._ensure_board(r, c)

        if (r, c) in self.mines:
            self.revealed.add((r, c))
            self.exploded = (r, c)
            self.lives = max(0, self.lives - 1)
            changes = [
                _serialize_cell(r, c, self.mines, self.adj, self.revealed, self.flags, exploded=self.exploded)
            ]
            if self.lives <= 0:
                self.done = True
                self.won = False
            return {"ok": True, "type": "mine", "changes": changes, "lives": self.lives, "safe": self.safe_revealed(), "done": self.done, "won": self.won}

        changed = _flood_reveal(self.rows, self.cols, self.mines, self.adj, self.revealed, (r, c))
        changes = [
            _serialize_cell(rr, cc, self.mines, self.adj, self.revealed, self.flags)
            for (rr, cc) in changed
        ]
        if self.safe_revealed() >= self.total_safe():
            self.done = True
            self.won = True
        return {"ok": True, "type": "safe", "changes": changes, "lives": self.lives, "safe": self.safe_revealed(), "done": self.done, "won": self.won}

    def flag(self, r: int, c: int) -> Dict[str, Any]:
        if self.done:
            return {"ok": False, "reason": "finished"}
        if not (0 <= r < self.rows and 0 <= c < self.cols):
            return {"ok": False, "reason": "oob"}
        if (r, c) in self.revealed:
            return {"ok": False, "reason": "ignored"}
        if (r, c) in self.flags:
            self.flags.remove((r, c))
        else:
            self.flags.add((r, c))
        return {
            "ok": True,
            "changes": [_serialize_cell(r, c, self.mines, self.adj, self.revealed, self.flags)],
            "flags": len(self.flags),
        }


class _LobbyGame:
    def __init__(self, code: str, lobby: dict):
        self.code = _norm_lobby_code(code)
        cfg = lobby.get("config") or {}
        self.rows = int(cfg.get("rows") or 10)
        self.cols = int(cfg.get("cols") or 10)
        # Optional modifiers
        self.narc = bool(cfg.get("narc"))
        self.random_mode = bool(cfg.get("random_mode"))
        self.no_flags = bool(cfg.get("no_flags"))

        mines_req = int(cfg.get("mines") or 10)
        if self.random_mode:
            # Deterministic random mines derived from the lobby seed.
            try:
                total = self.rows * self.cols
                max_mines = max(1, min(int(total * 0.6), total - 10))
                r = _rng(int(lobby.get("seed") or 0) ^ 0xA11CE)
                mines_req = max(1, min(max_mines, 1 + int(r.random() * max_mines)))
            except Exception:
                mines_req = int(cfg.get("mines") or 10)
        self.mines = mines_req
        self.lives = int(cfg.get("lives") or 1)
        self.seed = int(lobby.get("seed") or 0)
        self.host = lobby.get("host")
        self.guest = lobby.get("guest")
        self.created_at = lobby.get("created_at") or datetime.now(timezone.utc).isoformat()
        self.started_at = lobby.get("started_at") or datetime.now(timezone.utc).isoformat()
        self.started_at_epoch = _parse_iso_to_epoch_seconds(self.started_at) or int(datetime.now(timezone.utc).timestamp())
        self.finished = False
        self.rematch_votes: set = set()
        self.players: Dict[str, _PlayerGame] = {}
        self.themes: Dict[str, dict] = {}

    def role_of(self, nick: str) -> str:
        if nick == self.host:
            return "host"
        if nick == self.guest:
            return "guest"
        return "spectator"

    def ensure_player(self, nick: str):
        if nick in self.players:
            return
        role = self.role_of(nick)
        base = self.seed
        role_salt = 1337 if role == "host" else 7331 if role == "guest" else 9999
        self.players[nick] = _PlayerGame(self.rows, self.cols, self.mines, self.lives, (base ^ role_salt) & 0xFFFFFFFF)


WS_HUB = _WsHub()
ACTIVE_GAMES: Dict[str, _LobbyGame] = {}


async def _nick_from_token(token: str) -> Optional[str]:
    if not token:
        return None
    s = await db.sessions.find_one({"token": token})
    if not s:
        return None
    return s.get("nickname")


@app.websocket("/api/ws/lobbies/{code}")
async def ws_lobby(code: str, websocket: WebSocket):
    code = _norm_lobby_code(code)
    await websocket.accept()
    token = websocket.query_params.get("token")
    nick = await _nick_from_token(token)
    if not nick:
        await websocket.close(code=4401, reason="Unauthorized")
        return

    lobby = await db.lobbies.find_one({"code": code}, {"_id": 0})
    if not lobby:
        await websocket.close(code=4404, reason="Lobby not found")
        return

    if nick != lobby.get("host") and nick != lobby.get("guest"):
        await websocket.close(code=4403, reason="Forbidden")
        return

    await WS_HUB.connect(code, nick, websocket)

    try:
        # Server-authoritative start for PUBLIC matchmaking duels only.
        lobby = await _ensure_lobby_playing(code) or lobby

        game = ACTIVE_GAMES.get(code)
        if not game and lobby.get("status") == "playing":
            game = _LobbyGame(code, lobby)
            ACTIVE_GAMES[code] = game
        if game:
            game.ensure_player(nick)

        your_cells: List[dict] = []
        opp_cells: List[dict] = []
        try:
            if game and nick in game.players:
                p = game.players[nick]
                your_union = set(p.revealed) | set(p.flags)
                your_cells = _serialize_cells(your_union, p.mines, p.adj, p.revealed, p.flags, exploded=p.exploded)
                other = (game.guest if nick == game.host else game.host)
                if other in game.players:
                    op = game.players[other]
                    opp_cells = _serialize_cells(set(op.revealed), op.mines, op.adj, op.revealed, set(), exploded=op.exploded)
        except Exception:
            pass

        await WS_HUB.send(code, nick, {
            "type": "init",
            "code": code,
            "mode": lobby.get("mode"),
            "status": lobby.get("status"),
            "you": nick,
            "role": (game.role_of(nick) if game else ("host" if nick == lobby.get("host") else "guest")),
            "opponent": (lobby.get("guest") if nick == lobby.get("host") else lobby.get("host")),
            "config": lobby.get("config") or {},
            "server_now": int(datetime.now(timezone.utc).timestamp()),
            "started_at": int((game.started_at_epoch if game else (_parse_iso_to_epoch_seconds(lobby.get('started_at')) or int(datetime.now(timezone.utc).timestamp())))),
            "your_cells": your_cells,
            "opp_cells": opp_cells,
            "themes": (getattr(game, "themes", {}) if game else {}),
        })

        while True:
            msg = await websocket.receive_json()
            mtype = (msg or {}).get("type")

            lobby = await _ensure_lobby_playing(code)
            if not lobby:
                await WS_HUB.send(code, nick, {"type": "error", "error": "Lobby not found"})
                continue

            if lobby.get("status") != "playing" and mtype not in ("ping", "rematch"):
                await WS_HUB.send(code, nick, {"type": "error", "error": "Lobby not playing"})
                continue

            game = ACTIVE_GAMES.get(code)
            if not game:
                game = _LobbyGame(code, lobby)
                ACTIVE_GAMES[code] = game
            game.ensure_player(nick)

            if mtype == "theme":
                try:
                    th = msg.get("theme") or {}
                    if isinstance(th, dict):
                        # Expect keys mine/cell/fx/flag, ignore anything else.
                        patch = {
                            "mine": th.get("mine"),
                            "cell": th.get("cell"),
                            "fx": th.get("fx"),
                            "flag": th.get("flag"),
                        }
                        game.themes[nick] = patch
                        await WS_HUB.broadcast(code, {"type": "themes", "themes": game.themes})
                except Exception:
                    pass
                continue

            # Time limit: resolve duel if it took too long.
            try:
                now_epoch = int(datetime.now(timezone.utc).timestamp())
                started_epoch = int(getattr(game, "started_at_epoch", 0) or 0)
                time_limit = _duel_time_limit_seconds(lobby.get("mode"))
                if started_epoch and not game.finished and (now_epoch - started_epoch) >= time_limit:
                    host_p = game.players.get(game.host)
                    guest_p = game.players.get(game.guest)
                    host_safe = host_p.safe_revealed() if host_p else 0
                    guest_safe = guest_p.safe_revealed() if guest_p else 0
                    host_lives = host_p.lives if host_p else 0
                    guest_lives = guest_p.lives if guest_p else 0

                    # Winner: more safe cells; tie-breaker: more lives; final tie: host wins.
                    if (host_safe, host_lives) >= (guest_safe, guest_lives):
                        winner = game.host
                        loser = game.guest
                    else:
                        winner = game.guest
                        loser = game.host

                    game.finished = True
                    if loser in game.players:
                        game.players[loser].done = True
                        game.players[loser].won = False
                    if winner in game.players:
                        game.players[winner].done = True
                        game.players[winner].won = True
                    await WS_HUB.broadcast(code, {"type": "duel_over", "winner": winner})
                    continue
            except Exception:
                pass

            if mtype == "open":
                r = int(msg.get("r"))
                c = int(msg.get("c"))
                res = game.players[nick].open(r, c)
                if not res.get("ok"):
                    continue

                await WS_HUB.broadcast(code, {
                    "type": "player_update",
                    "player": nick,
                    "changes": res.get("changes") or [],
                    "lives": res.get("lives"),
                    "safe": res.get("safe"),
                    "total_safe": game.players[nick].total_safe(),
                    "done": res.get("done"),
                    "won": res.get("won"),
                })
                if res.get("done") and not res.get("won") and not game.finished:
                    winner = game.guest if nick == game.host else game.host
                    game.finished = True
                    if winner in game.players:
                        game.players[winner].done = True
                        game.players[winner].won = True
                    await WS_HUB.broadcast(code, {"type": "duel_over", "winner": winner})
                    continue

            elif mtype == "flag":
                if game and getattr(game, "no_flags", False):
                    continue
                r = int(msg.get("r"))
                c = int(msg.get("c"))
                res = game.players[nick].flag(r, c)
                if not res.get("ok"):
                    continue
                await WS_HUB.send(code, nick, {
                    "type": "player_update",
                    "player": nick,
                    "changes": res.get("changes") or [],
                    "flags": res.get("flags"),
                    "lives": game.players[nick].lives,
                    "safe": game.players[nick].safe_revealed(),
                    "total_safe": game.players[nick].total_safe(),
                    "done": game.players[nick].done,
                    "won": game.players[nick].won,
                })

            elif mtype == "ping":
                await WS_HUB.send(code, nick, {"type": "pong"})

            elif mtype == "rematch":
                if game and not game.finished:
                    await WS_HUB.send(code, nick, {"type": "error", "error": "Game not finished"})
                    continue
                if not game or nick not in (game.host, game.guest):
                    await WS_HUB.send(code, nick, {"type": "error", "error": "Forbidden"})
                    continue
                game.rematch_votes.add(nick)
                await WS_HUB.broadcast(code, {"type": "rematch_wait", "who": nick})
                if game.host in game.rematch_votes and game.guest in game.rematch_votes:
                    lobby = await db.lobbies.find_one({"code": code}, {"_id": 0})
                    if not lobby:
                        await WS_HUB.broadcast(code, {"type": "error", "error": "Lobby not found"})
                        continue
                    lobby["status"] = "playing"
                    lobby["started_at"] = datetime.now(timezone.utc).isoformat()
                    await db.lobbies.update_one({"code": code}, {"$set": {"status": "playing", "started_at": lobby["started_at"]}})

                    new_game = _LobbyGame(code, lobby)
                    ACTIVE_GAMES[code] = new_game
                    new_game.ensure_player(new_game.host)
                    new_game.ensure_player(new_game.guest)
                    await WS_HUB.broadcast(code, {
                        "type": "rematch_start",
                        "server_now": int(datetime.now(timezone.utc).timestamp()),
                        "started_at": int(new_game.started_at_epoch),
                        "status": "playing",
                    })

            else:
                await WS_HUB.send(code, nick, {"type": "error", "error": "Unknown message"})

            # Resolve duel outcome
            host_done = False
            guest_done = False
            host_won = False
            guest_won = False
            if game and game.host in game.players:
                host_done = game.players[game.host].done
                host_won = game.players[game.host].won
            if game and game.guest in game.players:
                guest_done = game.players[game.guest].done
                guest_won = game.players[game.guest].won

            if game and not game.finished and (host_done or guest_done):
                winner = None
                if host_done and host_won:
                    winner = game.host
                elif guest_done and guest_won:
                    winner = game.guest
                elif host_done and not host_won:
                    winner = game.guest
                elif guest_done and not guest_won:
                    winner = game.host
                if winner:
                    game.finished = True
                    loser = game.guest if winner == game.host else game.host
                    if loser in game.players:
                        game.players[loser].done = True
                        game.players[loser].won = False
                    await WS_HUB.broadcast(code, {"type": "duel_over", "winner": winner})

    except WebSocketDisconnect:
        # If a player leaves mid-duel, it's an instant loss for the leaver.
        try:
            lobby = await db.lobbies.find_one({"code": code}, {"_id": 0, "status": 1})
            if not lobby or lobby.get("status") != "playing":
                return
            game = ACTIVE_GAMES.get(code)
            if game and not game.finished and nick in (game.host, game.guest):
                winner = game.guest if nick == game.host else game.host
                game.finished = True
                if winner in game.players:
                    game.players[winner].done = True
                    game.players[winner].won = True
                if nick in game.players:
                    game.players[nick].done = True
                    game.players[nick].won = False
                await WS_HUB.broadcast(code, {"type": "duel_over", "winner": winner})
        except Exception:
            pass
    except Exception:
        logger.exception("ws_lobby crashed code=%s nick=%s", code, nick)
        try:
            await websocket.close(code=1011)
        except Exception:
            pass
    finally:
        WS_HUB.disconnect(code, nick)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
