# 天穹跃迁 / TianqiongLeap

多端横版跳跃动作游戏。玩家在不同星球间穿梭，挑战 **10 章 × 10 关 = 110 关** 的关卡内容，包含角色、武器、忍术、道具、宠物、Boss 等多种系统。

前端运行在浏览器（PC / 移动端自适应），后端提供排行榜与存档同步服务。

## 技术栈

- **前端**：React 19 · TypeScript · Vite · Phaser 4
- **国际化**：i18next + react-i18next（中 / 英）
- **测试**：Vitest + Testing Library
- **后端**：FastAPI（排行榜 + 存档同步）
- **部署**：Docker · docker-compose
- **CI/CD**：GitHub Actions

## 目录结构

```
tianqiong-leap-web/
├── frontend/          # 前端（React + Vite + Phaser）
│   ├── src/
│   │   ├── components/   # UI 组件与遮罩层
│   │   ├── constants/    # 角色 / 武器 / 关卡 / 敌人等数据
│   │   ├── phaser/       # Phaser 场景与各子系统
│   │   ├── state/        # 存档 / 排行榜 / 成就
│   │   └── i18n/         # 多语言资源
│   └── Dockerfile
├── backend/           # 后端（FastAPI）
│   ├── routers/          # leaderboard / save_sync
│   ├── tests/            # pytest
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev          # 默认 http://localhost:5173
```

### 后端

```bash
cd backend
pip install -r requirements.txt
python main.py       # 默认 http://localhost:8000
```

### Docker（一键启动前后端）

```bash
docker-compose up
```

## 环境变量

复制 `.env.example` 为 `.env` 后按需修改：

| 变量 | 作用 | 注入时机 | 默认值 |
| --- | --- | --- | --- |
| `VITE_API_BASE` | 前端请求的后端 API 地址 | 构建期（Vite） | `http://localhost:8000` |
| `CORS_ORIGINS` | 后端允许的跨域来源（逗号分隔） | 运行期 | `http://localhost:5173,http://localhost:3000` |

## 按键说明

| 按键 | 功能 |
| --- | --- |
| `SPACE` / `W` / `↑` | 跳跃 |
| `E` | 忍术 |
| `Q` | 使用道具 |
| `R` | 重试当前关卡 |
| `T` / `Y` | 切换武器 |
| `S` / `↓` | 下蹲 / 快速下落 |
| `SHIFT` | 角色技能 |
| `ESC` | 暂停 |

## 测试

```bash
# 前端（Vitest）
cd frontend
npm test             # watch 模式
npm run test:run     # 单次运行

# 后端（pytest）
cd backend
python -m pytest tests/
```

## 构建

```bash
cd frontend
npm run build        # tsc -b && vite build，产物输出到 dist/
npm run preview      # 本地预览构建产物
```

## CI/CD

通过 GitHub Actions 实现：在 `push` 与 Pull Request 时自动执行 **lint + test + build**，确保代码质量与构建可用性。

## License

暂未指定。
