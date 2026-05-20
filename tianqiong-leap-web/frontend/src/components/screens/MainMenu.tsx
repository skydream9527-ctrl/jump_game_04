interface MainMenuProps {
  totalShards: number;
  testMode: boolean;
  onStartGame: () => void;
  onCharacterSelect: () => void;
  onShop: () => void;
  onLeaderboard: () => void;
  onInventory: () => void;
  onPet: () => void;
  onToggleTestMode: () => void;
}

export function MainMenu({ totalShards, testMode, onStartGame, onCharacterSelect, onShop, onLeaderboard, onInventory, onPet, onToggleTestMode }: MainMenuProps) {
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
        <div className="shard-display">
          <span className="shard-icon">★</span>
          <span>{totalShards} 星核碎片</span>
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
