from pydantic import BaseModel, Field
from datetime import datetime


class LeaderboardEntry(BaseModel):
    rank: int = 0
    player_name: str = Field(max_length=16)
    chapter: int = Field(ge=1, le=10)
    level: int = Field(ge=1, le=10)
    score: int = Field(ge=0)
    stars: int = Field(ge=0, le=3)
    shards_collected: int = Field(ge=0, le=3)
    character_id: int = Field(ge=0, le=3)
    timestamp: str = ""


class LeaderboardSubmit(BaseModel):
    player_name: str = Field(max_length=16)
    chapter: int = Field(ge=1, le=10)
    level: int = Field(ge=1, le=10)
    score: int = Field(ge=0)
    stars: int = Field(ge=0, le=3)
    shards_collected: int = Field(ge=0, le=3)
    character_id: int = Field(ge=0, le=3)


class LevelRecord(BaseModel):
    cleared: bool = False
    best_score: int = 0
    best_stars: int = 0
    best_shards: int = 0


class SaveData(BaseModel):
    total_shards: int = 0
    current_chapter: int = 1
    current_level: int = 1
    selected_character: int = 0
    unlocked_characters: list[int] = [0]
    records: list[dict] = []
    inventory: list[dict] = []
    equipped_items: list[str] = []
    owned_pets: list[dict] = []
    selected_pet: str | None = None
