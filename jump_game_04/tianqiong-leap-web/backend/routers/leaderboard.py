import json
import threading
from collections import defaultdict
from pathlib import Path
from datetime import datetime
from time import time
from fastapi import APIRouter, Query, Request, HTTPException
from models import LeaderboardEntry, LeaderboardSubmit

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

DATA_DIR = Path(__file__).parent.parent / "data"
LEADERBOARD_FILE = DATA_DIR / "leaderboard.json"

# 文件读写锁，防止并发竞态
leaderboard_lock = threading.Lock()

# 提交频率限制：每 IP 每分钟最多 5 次
submit_history: dict[str, list[float]] = defaultdict(list)


def check_rate_limit(client_ip: str) -> bool:
    now = time()
    history = submit_history[client_ip]
    # 清理 60 秒前的记录
    submit_history[client_ip] = [t for t in history if now - t < 60]
    if len(submit_history[client_ip]) >= 5:
        return False
    submit_history[client_ip].append(now)
    return True


# 各章节理论分数上限（粗略估算：距离×速度 + 碎片×100 + Boss500 + 星级×200）
MAX_SCORE_BY_CHAPTER = {
    1: 5000, 2: 6000, 3: 7000, 4: 8000, 5: 9000,
    6: 10000, 7: 11000, 8: 12000, 9: 13000, 10: 15000,
}


def _load_unlocked() -> list[dict]:
    if not LEADERBOARD_FILE.exists():
        return []
    try:
        return json.loads(LEADERBOARD_FILE.read_text())
    except Exception:
        return []


def load_leaderboard() -> list[dict]:
    with leaderboard_lock:
        return _load_unlocked()


def _save_unlocked(data: list[dict]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    LEADERBOARD_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2))


def save_leaderboard(data: list[dict]) -> None:
    with leaderboard_lock:
        _save_unlocked(data)


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
async def submit_score(entry: LeaderboardSubmit, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="提交过于频繁，请稍后再试")
    # 服务端分数合理性校验
    max_allowed = MAX_SCORE_BY_CHAPTER.get(entry.chapter, 999999)
    if entry.score > max_allowed:
        raise HTTPException(status_code=400, detail="分数异常，疑似作弊")
    with leaderboard_lock:
        entries = _load_unlocked()
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
        _save_unlocked(entries)

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
