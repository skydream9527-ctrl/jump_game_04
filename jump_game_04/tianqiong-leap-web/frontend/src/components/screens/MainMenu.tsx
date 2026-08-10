import { useState } from 'react';
import { setPlayerName } from '../../state/cloudSave';
import type { SyncStatus } from '../../hooks/useSaveData';

interface MainMenuProps {
  totalShards: number;
  testMode: boolean;
  playerName: string;
  syncStatus: SyncStatus;
  onStartGame: () => void;
  onCharacterSelect: () => void;
  onShop: () => void;
  onLeaderboard: () => void;
  onCloudSync: () => void;
  onInventory: () => void;
  onPet: () => void;
  onAchievements: () => void;
  onToggleTestMode: () => void;
}

export function MainMenu({
  totalShards,
  testMode,
  playerName,
  syncStatus,
  onStartGame,
  onCharacterSelect,
  onShop,
  onLeaderboard,
  onCloudSync,
  onInventory,
  onPet,
  onAchievements,
  onToggleTestMode,
}: MainMenuProps) {
  const [displayName, setDisplayName] = useState(playerName);

  const handleRename = () => {
    const newName = window.prompt('请输入玩家名（用于云存档标识，最多 16 字符）', displayName);
    if (newName && newName.trim()) {
      const trimmed = newName.trim().slice(0, 16);
      setPlayerName(trimmed);
      setDisplayName(trimmed);
    }
  };

  const syncLabel =
    syncStatus === 'syncing' ? '同步中...'
    : syncStatus === 'synced' ? '✓ 已同步'
    : syncStatus === 'error' ? '✗ 同步失败，点击重试'
    : '☁ 云同步';

  return (
    <div className="screen menu-screen">
      <div className="menu-content">
        <h1 className="game-title">天穹跃迁</h1>
        <p className="game-subtitle">TIANQIONG LEAP</p>
        <div className="menu-divider" />
        <button className="btn btn-primary" onClick={onStartGame}>开始游戏</button>
        <button className="btn btn-secondary" onClick={onCharacterSelect}>角色选择</button>
        <button className="btn btn-secondary" onClick={onInventory}>储物袋</button>
        <button className="btn btn-secondary" onClick={onPet}>宠物</button>
        <button className="btn btn-secondary" onClick={onShop}>商店</button>
        <button className="btn btn-secondary" onClick={onLeaderboard}>排行榜</button>
        <button
          className="btn btn-secondary"
          onClick={onCloudSync}
          disabled={syncStatus === 'syncing'}
        >
          {syncLabel}
        </button>
        <button className="btn btn-secondary" onClick={onAchievements}>🏆 成就</button>
        <div className="shard-display">
          <span className="shard-icon">★</span>
          <span>{totalShards} 星核碎片</span>
        </div>
        <div className="player-info" style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
          <span>玩家：</span>
          <button
            onClick={handleRename}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: 'inherit',
              padding: 0,
            }}
          >
            {displayName}
          </button>
        </div>
        <button
          className="btn btn-secondary"
          onClick={onToggleTestMode}
          style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}
        >
          {testMode ? '🔓 测试模式（已开启）' : '🔒 测试模式'}
        </button>
      </div>
    </div>
  );
}
