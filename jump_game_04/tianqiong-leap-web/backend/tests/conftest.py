import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def clean_data(tmp_path, monkeypatch):
    """每个测试用临时 data 目录，避免污染。"""
    import routers.leaderboard as lb
    import routers.save_sync as ss
    import auth
    monkeypatch.setattr(lb, 'DATA_DIR', tmp_path / 'data')
    monkeypatch.setattr(lb, 'LEADERBOARD_FILE', tmp_path / 'data' / 'leaderboard.json')
    monkeypatch.setattr(ss, 'DATA_DIR', tmp_path / 'data' / 'saves')
    monkeypatch.setattr(auth, 'DATA_DIR', tmp_path / 'data')
    monkeypatch.setattr(auth, 'TOKENS_FILE', tmp_path / 'data' / 'tokens.json')
    # 重置限流计数器，避免测试间互相干扰（计数器为模块级全局字典）
    lb.submit_history.clear()
    ss.save_submit_history.clear()
    yield
