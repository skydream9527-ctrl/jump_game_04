import secrets
import json
from pathlib import Path
from fastapi import HTTPException

DATA_DIR = Path(__file__).parent.parent / "data"
TOKENS_FILE = DATA_DIR / "tokens.json"


def _load_tokens() -> dict[str, str]:
    if not TOKENS_FILE.exists():
        return {}
    try:
        return json.loads(TOKENS_FILE.read_text())
    except Exception:
        return {}


def _save_tokens(tokens: dict[str, str]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    TOKENS_FILE.write_text(json.dumps(tokens, ensure_ascii=False, indent=2))


def register_player(player_id: str) -> str:
    """注册新玩家或返回已有 token。"""
    tokens = _load_tokens()
    if player_id in tokens:
        return tokens[player_id]
    token = secrets.token_urlsafe(32)
    tokens[player_id] = token
    _save_tokens(tokens)
    return token


def verify_token(player_id: str, authorization: str | None) -> None:
    """校验 Bearer token。"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少认证 token")
    token = authorization[7:]
    tokens = _load_tokens()
    expected = tokens.get(player_id)
    if not expected or not secrets.compare_digest(token, expected):
        raise HTTPException(status_code=403, detail="无效的认证 token")
