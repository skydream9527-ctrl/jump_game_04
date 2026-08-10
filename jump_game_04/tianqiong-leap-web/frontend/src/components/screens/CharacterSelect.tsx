import { useTranslation } from 'react-i18next';
import { CHARACTERS, type CharacterDef } from '../../constants/characters';

interface CharacterSelectProps {
  selectedCharacterId: number;
  totalShards: number;
  isCharacterUnlocked: (id: number) => boolean;
  onSelect: (id: number) => void;
  onUnlock: (id: number, cost: number) => void;
  onBack: () => void;
}

export function CharacterSelect({
  selectedCharacterId, totalShards, isCharacterUnlocked, onSelect, onUnlock, onBack,
}: CharacterSelectProps) {
  const { t } = useTranslation();
  return (
    <div className="screen select-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>←</button>
        <h2>{t('common.character_select')}</h2>
        <span className="shard-badge">★ {totalShards}</span>
      </div>
      <div className="character-list">
        {CHARACTERS.map((char) => (
          <CharacterCard
            key={char.id}
            character={char}
            unlocked={isCharacterUnlocked(char.id)}
            selected={selectedCharacterId === char.id}
            currentShards={totalShards}
            onSelect={() => onSelect(char.id)}
            onUnlock={() => onUnlock(char.id, char.unlockCost)}
          />
        ))}
      </div>
    </div>
  );
}

function CharacterCard({
  character, unlocked, selected, currentShards, onSelect, onUnlock,
}: {
  character: CharacterDef;
  unlocked: boolean;
  selected: boolean;
  currentShards: number;
  onSelect: () => void;
  onUnlock: () => void;
}) {
  const { t } = useTranslation();
  const canAfford = currentShards >= character.unlockCost;
  const glowColor = character.glowColor;

  const stats: string[] = [];
  if (character.jumpMultiplier > 1.0) stats.push(t('common.jump_bonus', { n: Math.round((character.jumpMultiplier - 1) * 100) }));
  if (character.speedMultiplier > 1.0) stats.push(t('common.speed_bonus', { n: Math.round((character.speedMultiplier - 1) * 100) }));
  if (character.specialAbility) stats.push(t(`data.character.${character.id}.ability_name`, { defaultValue: character.specialAbility }));
  if (stats.length === 0) stats.push(t('common.balanced'));

  return (
    <div
      className={`character-card ${selected ? 'selected' : ''} ${unlocked ? '' : 'locked'}`}
      onClick={() => unlocked && onSelect()}
    >
      <div className="char-avatar" style={{ backgroundColor: glowColor + '20', color: glowColor }}>
        {character.displayName[0]}
      </div>
      <div className="char-info">
        <div className="char-name" style={{ color: unlocked ? '#ece2d0' : '#6a6058' }}>
          {t(`data.character.${character.id}.name`, { defaultValue: character.displayName })}
        </div>
        <div className="char-subtitle">{t(`data.character.${character.id}.subtitle`, { defaultValue: character.subtitle })}</div>
        <div className="char-stats" style={{ color: glowColor + 'cc' }}>{stats.join(' · ')}</div>
      </div>
      <div className="char-action">
        {!unlocked ? (
          <button
            className={`btn btn-small ${canAfford ? 'btn-primary' : 'btn-disabled'}`}
            onClick={(e) => { e.stopPropagation(); if (canAfford) onUnlock(); }}
          >
            {character.unlockCost} {t('common.shard_short')}
          </button>
        ) : selected ? (
          <span className="in-use">{t('common.in_use')}</span>
        ) : null}
      </div>
    </div>
  );
}
