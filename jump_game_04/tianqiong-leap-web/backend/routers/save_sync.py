import json
import re
from pathlib import Path
from fastapi import APIRouter, HTTPException
from models import SaveData

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


@router.post("/{player_id}")
async def post_save(player_id: str, save: SaveData):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = get_save_path(player_id)
    path.write_text(json.dumps(save.model_dump(), ensure_ascii=False, indent=2))
    return {"ok": True}
