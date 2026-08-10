import json
import re
from pathlib import Path
from collections import defaultdict
from time import time
from fastapi import APIRouter, HTTPException, Request, Header
from models import SaveData
from auth import register_player, verify_token

router = APIRouter(prefix="/api/save", tags=["save"])

DATA_DIR = Path(__file__).parent.parent / "data" / "saves"


def get_save_path(player_id: str) -> Path:
    # 校验 player_id 字符集，仅允许字母数字下划线连字符，防止路径穿越
    if not re.match(r'^[a-zA-Z0-9_-]+$', player_id):
        raise HTTPException(status_code=400, detail="Invalid player ID")
    filename = f"{player_id}.json"
    path = DATA_DIR / filename
    # 确保最终路径未逃逸出 DATA_DIR（文件名与预期一致）
    if path.name != filename:
        raise HTTPException(status_code=400, detail="Invalid player ID")
    return path


# POST 限流：每 player_id 每分钟最多 10 次
save_submit_history: dict[str, list[float]] = defaultdict(list)


def check_save_rate_limit(player_id: str) -> bool:
    now = time()
    history = save_submit_history[player_id]
    save_submit_history[player_id] = [t for t in history if now - t < 60]
    if len(save_submit_history[player_id]) >= 10:
        return False
    save_submit_history[player_id].append(now)
    return True


@router.get("/{player_id}")
async def get_save(player_id: str):
    path = get_save_path(player_id)
    if not path.exists():
        return {"save_data": None}
    try:
        data = json.loads(path.read_text())
        return {"save_data": data}
    except Exception:
        return {"save_data": None}


@router.post("/{player_id}/register")
async def register(player_id: str):
    token = register_player(player_id)
    return {"player_id": player_id, "token": token}


@router.post("/{player_id}")
async def post_save(
    player_id: str,
    save: SaveData,
    request: Request,
    authorization: str | None = Header(None),
):
    if not check_save_rate_limit(player_id):
        raise HTTPException(status_code=429, detail="存档同步过于频繁，请稍后再试")
    verify_token(player_id, authorization)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = get_save_path(player_id)
    path.write_text(json.dumps(save.model_dump(), ensure_ascii=False, indent=2))
    return {"ok": True}
