"""存档同步 API 测试。"""
import pytest
from fastapi import HTTPException

from routers.save_sync import get_save_path


def _save_data(total_shards=0):
    return {
        "total_shards": total_shards,
        "current_chapter": 1,
        "current_level": 1,
        "selected_character": 0,
    }


def test_get_nonexistent_save(client):
    r = client.get("/api/save/nonexistent")
    assert r.status_code == 200
    assert r.json() == {"save_data": None}


def test_register_and_post(client):
    pid = "player1"
    r = client.post(f"/api/save/{pid}/register")
    assert r.status_code == 200
    body = r.json()
    assert body["player_id"] == pid
    token = body["token"]
    assert token

    r = client.post(
        f"/api/save/{pid}",
        json=_save_data(),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_post_without_token(client):
    r = client.post("/api/save/player2", json=_save_data())
    assert r.status_code == 401


def test_post_wrong_token(client):
    r = client.post(
        "/api/save/player3",
        json=_save_data(),
        headers={"Authorization": "Bearer wrongtoken"},
    )
    assert r.status_code == 403


def test_post_and_get(client):
    pid = "player4"
    token = client.post(f"/api/save/{pid}/register").json()["token"]
    r = client.post(
        f"/api/save/{pid}",
        json=_save_data(total_shards=42),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200

    r = client.get(f"/api/save/{pid}")
    assert r.status_code == 200
    data = r.json()["save_data"]
    assert data is not None
    assert data["total_shards"] == 42
    assert data["current_chapter"] == 1


def test_invalid_player_id(client):
    # player_id 含 ../ 触发路径穿越校验 -> 400
    # 直接调用 get_save_path 精确测试 ../ 输入（httpx 会规范化 URL 中的 ../ 段，
    # 无法通过 HTTP 层稳定传递，故在此直接校验保护函数）
    with pytest.raises(HTTPException) as exc:
        get_save_path("../etc/passwd")
    assert exc.value.status_code == 400

    # HTTP 层：含 .. 的 player_id 同样被正则拒绝 -> 400
    r = client.get("/api/save/..foo")
    assert r.status_code == 400


def test_save_rate_limit(client):
    # 每 player_id 每分钟 10 次：前 10 次成功，第 11 次 429
    pid = "player5"
    token = client.post(f"/api/save/{pid}/register").json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    for i in range(10):
        r = client.post(f"/api/save/{pid}", json=_save_data(), headers=headers)
        assert r.status_code == 200, f"第 {i + 1} 次应成功"
    r = client.post(f"/api/save/{pid}", json=_save_data(), headers=headers)
    assert r.status_code == 429
