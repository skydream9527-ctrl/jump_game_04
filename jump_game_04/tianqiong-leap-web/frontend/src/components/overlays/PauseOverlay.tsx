import { useTranslation } from 'react-i18next';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onBackToLevels: () => void;
  onBackToMenu: () => void;
}

export function PauseOverlay({ onResume, onRestart, onBackToLevels, onBackToMenu }: PauseOverlayProps) {
  const { t } = useTranslation();
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={t('pause.title')}>
      <div className="overlay-panel">
        <h2 className="panel-title">{t('pause.title')}</h2>
        <div className="panel-divider" aria-hidden="true" />
        <div className="panel-actions">
          <button className="btn btn-primary" onClick={onResume}>{t('pause.resume')}</button>
          <button className="btn btn-secondary" onClick={onRestart}>{t('pause.restart')}</button>
          <button className="btn btn-secondary" onClick={onBackToLevels}>{t('pause.back_to_levels')}</button>
          <button className="btn btn-secondary" onClick={onBackToMenu}>{t('pause.back_to_menu')}</button>
        </div>
      </div>
    </div>
  );
}
