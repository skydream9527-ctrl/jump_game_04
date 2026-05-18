import json
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, Query
from models import LeaderboardEntry, LeaderboardSubmit

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

DATA_DIR = Path(__file__).parent.parent / "data"
LEADERBOARD_FILE = DATA_DIR / "leaderboard.json"


def load_leaderboard() -> list[dict]:
    if not LEADERBOARD_FILE.exists():
        return []
    try:
        return json.loads(LEADERBOARD_FILE.read_text())
    except Exception:
        return []


def save_leaderboard(data: list[dict]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    LEADERBOARD_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2))


@router.get("")
async def get_leaderboard(
    chapter: int = Query(ge=1, le=10),
    level: int = Query(ge=1, le=10),
    limit: int = Query(default=10, ge=1, le=50),
):
    entries = load_leaderboard()
    filtered = [
        e for e in entries
        if e.get("chapter") == chapter and e.get("level") == level
    ]
    filtered.sort(key=lambda e: e.get("score", 0), reverse=True)
    result = []
    for i, entry in enumerate(filtered[:limit]):
        result.append({
            "rank": i + 1,
            "player_name": entry.get("player_name", ""),
            "score": entry.get("score", 0),
            "stars": entry.get("stars", 0),
            "character_id": entry.get("character_id", 0),
            "timestamp": entry.get("timestamp", ""),
        })
    return {"entries": result}


@router.post("")
async def submit_score(entry: LeaderboardSubmit):
    entries = load_leaderboard()
    entries.append({
        "player_name": entry.player_name,
        "chapter": entry.chapter,
        "level": entry.level,
        "score": entry.score,
        "stars": entry.stars,
        "shards_collected": entry.shards_collected,
        "character_id": entry.character_id,
        "timestamp": datetime.now().isoformat(),
    })
    # Keep max 500 entries total
    if len(entries) > 500:
        entries = entries[-500:]
    save_leaderboard(entries)

    # Calculate rank for this chapter/level
    level_entries = [
        e for e in entries
        if e.get("chapter") == entry.chapter and e.get("level") == entry.level
    ]
    level_entries.sort(key=lambda e: e.get("score", 0), reverse=True)
    rank = next(
        (i + 1 for i, e in enumerate(level_entries) if e.get("score", 0) == entry.score),
        len(level_entries),
    )
    return {"ok": True, "rank": rank}
