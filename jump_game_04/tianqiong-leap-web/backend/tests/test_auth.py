"""鉴权模块测试。"""
import pytest
from fastapi import HTTPException

from auth import register_player, verify_token


def test_register_returns_token():
    token = register_player("auth_player1")
    assert token
    assert isinstance(token, str)
    assert len(token) > 0


def test_register_same_id_returns_same_token():
    t1 = register_player("auth_player2")
    t2 = register_player("auth_player2")
    assert t1 == t2


def test_verify_correct_token():
    token = register_player("auth_player3")
    # 正确 token 不抛异常
    verify_token("auth_player3", f"Bearer {token}")


def test_verify_wrong_token():
    register_player("auth_player4")
    with pytest.raises(HTTPException) as exc:
        verify_token("auth_player4", "Bearer wrongtoken")
    assert exc.value.status_code == 403


def test_verify_missing_token():
    register_player("auth_player5")
    with pytest.raises(HTTPException) as exc:
        verify_token("auth_player5", None)
    assert exc.value.status_code == 401
