"""排行榜 API 测试。"""


def _payload(score=100, chapter=1, level=1, player_name="tester",
             stars=1, shards_collected=0, character_id=0):
    return {
        "player_name": player_name,
        "chapter": chapter,
        "level": level,
        "score": score,
        "stars": stars,
        "shards_collected": shards_collected,
        "character_id": character_id,
    }


def test_get_empty_leaderboard(client):
    r = client.get("/api/leaderboard", params={"chapter": 1, "level": 1})
    assert r.status_code == 200
    assert r.json() == {"entries": []}


def test_submit_and_get(client):
    r = client.post("/api/leaderboard", json=_payload(score=100))
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["rank"] == 1

    r = client.get("/api/leaderboard", params={"chapter": 1, "level": 1})
    assert r.status_code == 200
    entries = r.json()["entries"]
    assert len(entries) == 1
    assert entries[0]["score"] == 100
    assert entries[0]["rank"] == 1
    assert entries[0]["player_name"] == "tester"


def test_score_filter_by_chapter_level(client):
    client.post("/api/leaderboard", json=_payload(score=100, chapter=1, level=1))
    client.post("/api/leaderboard", json=_payload(score=200, chapter=1, level=2))

    r = client.get("/api/leaderboard", params={"chapter": 1, "level": 1})
    entries = r.json()["entries"]
    assert len(entries) == 1
    assert entries[0]["score"] == 100

    r = client.get("/api/leaderboard", params={"chapter": 1, "level": 2})
    entries = r.json()["entries"]
    assert len(entries) == 1
    assert entries[0]["score"] == 200


def test_score_sorting(client):
    client.post("/api/leaderboard", json=_payload(score=100, player_name="a"))
    client.post("/api/leaderboard", json=_payload(score=300, player_name="b"))
    client.post("/api/leaderboard", json=_payload(score=200, player_name="c"))

    r = client.get("/api/leaderboard", params={"chapter": 1, "level": 1})
    entries = r.json()["entries"]
    scores = [e["score"] for e in entries]
    assert scores == [300, 200, 100]
    # rank 按降序排列
    assert [e["rank"] for e in entries] == [1, 2, 3]


def test_rate_limit(client):
    # 每 IP 每分钟 5 次：前 5 次成功，第 6 次 429
    for i in range(5):
        r = client.post("/api/leaderboard", json=_payload(score=100))
        assert r.status_code == 200, f"第 {i + 1} 次应成功"
    r = client.post("/api/leaderboard", json=_payload(score=100))
    assert r.status_code == 429


def test_score_validation(client):
    # score < 0 触发 pydantic 校验失败 -> 422
    r = client.post("/api/leaderboard", json=_payload(score=-1))
    assert r.status_code == 422


def test_score_max_limit(client):
    # score > 999999 触发 pydantic 校验失败 -> 422
    r = client.post("/api/leaderboard", json=_payload(score=1000000))
    assert r.status_code == 422


def test_anti_cheat(client):
    # chapter=1 理论上限 5000，超过返回 400（分数本身在 pydantic 上限内）
    r = client.post("/api/leaderboard", json=_payload(score=6000, chapter=1))
    assert r.status_code == 400
