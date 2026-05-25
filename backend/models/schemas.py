from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


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
    won: bool = False
    time_seconds: int = Field(default=0, ge=0, le=1_000_000_000)
    lives_remaining: int = Field(default=0, ge=0, le=10)
    lives_total: int = Field(default=1, ge=1, le=10)
    flags: int = Field(default=0, ge=0, le=1_000_000_000)
