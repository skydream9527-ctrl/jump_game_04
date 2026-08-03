import json
from pathlib import Path
from fastapi import APIRouter
from models import SaveData

router = APIRouter(prefix="/api/save", tags=["save"])

DATA_DIR = Path(__file__).parent.parent / "data" / "saves"


def get_save_path(player_id: str) -> Path:
    return DATA_DIR / f"{player_id}.json"


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
