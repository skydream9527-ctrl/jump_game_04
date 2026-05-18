interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onBackToLevels: () => void;
  onBackToMenu: () => void;
}

export function PauseOverlay({ onResume, onRestart, onBackToLevels, onBackToMenu }: PauseOverlayProps) {
  return (
    <div className="overlay">
      <div className="overlay-panel">
        <h2 className="panel-title">暂停</h2>
        <div className="panel-divider" />
        <div className="panel-actions">
          <button className="btn btn-primary" onClick={onResume}>继续游戏</button>
          <button className="btn btn-secondary" onClick={onRestart}>重新开始</button>
          <button className="btn btn-secondary" onClick={onBackToLevels}>返回关卡选择</button>
          <button className="btn btn-secondary" onClick={onBackToMenu}>返回主菜单</button>
        </div>
      </div>
    </div>
  );
}
