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
  return (
    <div className="screen select-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>←</button>
        <h2>角色选择</h2>
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
  const canAfford = currentShards >= character.unlockCost;
  const glowColor = character.glowColor;

  const stats: string[] = [];
  if (character.jumpMultiplier > 1.0) stats.push(`跳跃+${Math.round((character.jumpMultiplier - 1) * 100)}%`);
  if (character.speedMultiplier > 1.0) stats.push(`速度+${Math.round((character.speedMultiplier - 1) * 100)}%`);
  if (character.specialAbility) stats.push(character.specialAbility);
  if (stats.length === 0) stats.push('均衡');

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
          {character.displayName}
        </div>
        <div className="char-subtitle">{character.subtitle}</div>
        <div className="char-stats" style={{ color: glowColor + 'cc' }}>{stats.join(' · ')}</div>
      </div>
      <div className="char-action">
        {!unlocked ? (
          <button
            className={`btn btn-small ${canAfford ? 'btn-primary' : 'btn-disabled'}`}
            onClick={(e) => { e.stopPropagation(); if (canAfford) onUnlock(); }}
          >
            {character.unlockCost} 碎片
          </button>
        ) : selected ? (
          <span className="in-use">使用中</span>
        ) : null}
      </div>
    </div>
  );
}
