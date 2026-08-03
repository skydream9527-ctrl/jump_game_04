interface GameOverOverlayProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
  onBackToLevels: () => void;
}

export function GameOverOverlay({ score, bestScore, onRestart, onBackToLevels }: GameOverOverlayProps) {
  return (
    <div className="overlay">
      <div className="overlay-panel">
        <h2 className="panel-title">游戏结束</h2>
        <div className="panel-divider" />
        <p className="panel-score">得分: {score.toLocaleString()}</p>
        <p className="panel-best">最高记录: {bestScore.toLocaleString()}</p>
        <div className="star-row large">
          <span className="star-empty">★</span>
          <span className="star-empty">★</span>
          <span className="star-empty">★</span>
        </div>
        <div className="panel-actions">
          <button className="btn btn-primary" onClick={onRestart}>重新开始</button>
          <button className="btn btn-secondary" onClick={onBackToLevels}>返回关卡选择</button>
        </div>
      </div>
    </div>
  );
}
