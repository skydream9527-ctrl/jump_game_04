import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const nextText = level < 10
    ? t('level_complete.next_level', { n: level + 1 })
    : chapter < 10
    ? t('level_complete.next_chapter', { n: chapter + 1 })
    : t('level_complete.all_clear');

  const canAdvance = chapter < 10 || level < 10;

  return (
    <div className="overlay">
      <div className="overlay-panel wide">
        <h2 className="panel-title">{t('level_complete.title')}</h2>
        <div className="star-row large">
          {[1, 2, 3].map(i => (
            <span key={i} className={i <= stars ? 'star-filled' : 'star-empty'}>★</span>
          ))}
        </div>
        <p className="panel-score">{t('level_complete.score')}: {score.toLocaleString()}</p>
        <p className="panel-info">{t('level_complete.shards')}: {shards} / {totalShards}</p>
        <p className="panel-info">{t('level_complete.lives')}: {lives}</p>
        <div className="panel-actions">
          {canAdvance && (
            <button className="btn btn-primary" onClick={onNextLevel}>{nextText}</button>
          )}
          <button className="btn btn-secondary" onClick={onBackToLevels}>{t('level_complete.back_to_levels')}</button>
        </div>
      </div>
    </div>
  );
}
