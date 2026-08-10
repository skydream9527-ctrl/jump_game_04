import { useTranslation } from 'react-i18next';

interface GameOverOverlayProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
  onBackToLevels: () => void;
}

export function GameOverOverlay({ score, bestScore, onRestart, onBackToLevels }: GameOverOverlayProps) {
  const { t } = useTranslation();
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={t('game_over.title')}>
      <div className="overlay-panel">
        <h2 className="panel-title">{t('game_over.title')}</h2>
        <div className="panel-divider" aria-hidden="true" />
        <p className="panel-score">{t('game_over.score')}: {score.toLocaleString()}</p>
        <p className="panel-best">{t('game_over.best')}: {bestScore.toLocaleString()}</p>
        <div className="star-row large" aria-hidden="true">
          <span className="star-empty">★</span>
          <span className="star-empty">★</span>
          <span className="star-empty">★</span>
        </div>
        <div className="panel-actions">
          <button className="btn btn-primary" onClick={onRestart}>{t('game_over.retry')}</button>
          <button className="btn btn-secondary" onClick={onBackToLevels}>{t('game_over.back_to_levels')}</button>
        </div>
      </div>
    </div>
  );
}
