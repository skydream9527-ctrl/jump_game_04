interface LevelCompleteOverlayProps {
  score: number;
  shards: number;
  totalShards: number;
  lives: number;
  stars: number;
  chapter: number;
  level: number;
  onNextLevel: () => void;
  onBackToLevels: () => void;
}

export function LevelCompleteOverlay({
  score, shards, totalShards, lives, stars, chapter, level, onNextLevel, onBackToLevels,
}: LevelCompleteOverlayProps) {
  const nextText = level < 10
    ? `进入第${level + 1}关`
    : chapter < 10
    ? `进入第${chapter + 1}章`
    : '恭喜通关全部！';

  const canAdvance = chapter < 10 || level < 10;

  return (
    <div className="overlay">
      <div className="overlay-panel wide">
        <h2 className="panel-title">关卡通关！</h2>
        <div className="star-row large">
          {[1, 2, 3].map(i => (
            <span key={i} className={i <= stars ? 'star-filled' : 'star-empty'}>★</span>
          ))}
        </div>
        <p className="panel-score">得分: {score.toLocaleString()}</p>
        <p className="panel-info">碎片: {shards} / {totalShards}</p>
        <p className="panel-info">剩余生命: {lives}</p>
        <div className="panel-actions">
          {canAdvance && (
            <button className="btn btn-primary" onClick={onNextLevel}>{nextText}</button>
          )}
          <button className="btn btn-secondary" onClick={onBackToLevels}>返回关卡选择</button>
        </div>
      </div>
    </div>
  );
}
