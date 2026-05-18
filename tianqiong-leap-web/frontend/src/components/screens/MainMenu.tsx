interface MainMenuProps {
  totalShards: number;
  onStartGame: () => void;
  onCharacterSelect: () => void;
  onLeaderboard: () => void;
}

export function MainMenu({ totalShards, onStartGame, onCharacterSelect, onLeaderboard }: MainMenuProps) {
  return (
    <div className="screen menu-screen">
      <div className="menu-content">
        <h1 className="game-title">天穹跃迁</h1>
        <p className="game-subtitle">TIANQIONG LEAP</p>
        <div className="menu-divider" />
        <button className="btn btn-primary" onClick={onStartGame}>开始游戏</button>
        <button className="btn btn-secondary" onClick={onCharacterSelect}>角色选择</button>
        <button className="btn btn-secondary" onClick={onLeaderboard}>排行榜</button>
        <div className="shard-display">
          <span className="shard-icon">★</span>
          <span>{totalShards} 星核碎片</span>
        </div>
      </div>
    </div>
  );
}
