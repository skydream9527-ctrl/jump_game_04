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
    score: int = Field(ge=0, le=999999)  # 合理上限，防异常大分数
    stars: int = Field(ge=0, le=3)
    shards_collected: int = Field(ge=0, le=3)
    character_id: int = Field(ge=0, le=3)


class LevelRecord(BaseModel):
    idx: int = 0
    cleared: bool = False
    bestScore: int = Field(ge=0)
    bestStars: int = Field(ge=0, le=3)
    bestShards: int = Field(ge=0, le=3)


class InventoryItem(BaseModel):
    itemId: str
    quantity: int = Field(ge=0)


class PetInstance(BaseModel):
    petId: str
    level: int = Field(ge=1)
    exp: int = Field(ge=0)
    friendship: int = Field(ge=0)


class SaveData(BaseModel):
    total_shards: int = Field(ge=0)
    current_chapter: int = Field(ge=1, le=10)
    current_level: int = Field(ge=1, le=10)
    selected_character: int = Field(ge=0, le=3)
    unlocked_characters: list[int] = []
    records: list[LevelRecord] = []
    inventory: list[InventoryItem] = []
    equipped_items: list[str] = []
    owned_pets: list[PetInstance] = []
    selected_pet: str | None = None
