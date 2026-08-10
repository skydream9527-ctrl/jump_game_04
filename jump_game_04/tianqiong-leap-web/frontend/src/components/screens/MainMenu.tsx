import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const [displayName, setDisplayName] = useState(playerName);

  const handleRename = () => {
    const newName = window.prompt(t('menu.rename_prompt'), displayName);
    if (newName && newName.trim()) {
      const trimmed = newName.trim().slice(0, 16);
      setPlayerName(trimmed);
      setDisplayName(trimmed);
    }
  };

  const syncLabel =
    syncStatus === 'syncing' ? t('menu.sync_syncing')
    : syncStatus === 'synced' ? t('menu.sync_synced')
    : syncStatus === 'error' ? t('menu.sync_error')
    : t('menu.cloud_sync');

  return (
    <div className="screen menu-screen">
      <div className="menu-content">
        <h1 className="game-title">{t('menu.title')}</h1>
        <p className="game-subtitle">TIANQIONG LEAP</p>
        <div className="menu-divider" />
        <button className="btn btn-primary" onClick={onStartGame}>{t('menu.play')}</button>
        <button className="btn btn-secondary" onClick={onCharacterSelect}>{t('menu.character_select')}</button>
        <button className="btn btn-secondary" onClick={onInventory}>{t('menu.inventory')}</button>
        <button className="btn btn-secondary" onClick={onPet}>{t('menu.pet')}</button>
        <button className="btn btn-secondary" onClick={onShop}>{t('menu.shop')}</button>
        <button className="btn btn-secondary" onClick={onLeaderboard}>{t('menu.leaderboard')}</button>
        <button
          className="btn btn-secondary"
          onClick={onCloudSync}
          disabled={syncStatus === 'syncing'}
        >
          {syncLabel}
        </button>
        <button className="btn btn-secondary" onClick={onAchievements}>{t('menu.achievements')}</button>
        <div className="shard-display">
          <span className="shard-icon">★</span>
          <span>{totalShards} {t('menu.shard_unit')}</span>
        </div>
        <div className="player-info" style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
          <span>{t('menu.player_label')}</span>
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
          {testMode ? t('menu.test_mode_off') : t('menu.test_mode_on')}
        </button>
        <div className="lang-switch" style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center' }}>
          <button
            onClick={() => i18n.changeLanguage('zh')}
            style={{
              background: i18n.language === 'zh' ? '#6bb8e8' : 'none',
              border: '1px solid #6bb8e8',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              opacity: 0.85,
            }}
          >
            {t('lang.zh')}
          </button>
          <button
            onClick={() => i18n.changeLanguage('en')}
            style={{
              background: i18n.language === 'en' ? '#6bb8e8' : 'none',
              border: '1px solid #6bb8e8',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              opacity: 0.85,
            }}
          >
            {t('lang.en')}
          </button>
        </div>
      </div>
    </div>
  );
}
