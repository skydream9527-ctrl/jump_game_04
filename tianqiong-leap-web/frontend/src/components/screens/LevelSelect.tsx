import { CHAPTER_NAMES, isBossLevel } from '../../constants/levels';
import type { LevelRecord } from '../../types/game';

interface LevelSelectProps {
  chapter: number;
  isLevelUnlocked: (ch: number, lv: number) => boolean;
  getRecord: (ch: number, lv: number) => LevelRecord | null;
  onSelect: (chapter: number, level: number) => void;
  onBack: () => void;
}

export function LevelSelect({ chapter, isLevelUnlocked, getRecord, onSelect, onBack }: LevelSelectProps) {
  const chapterName = CHAPTER_NAMES[chapter] ?? '未知';

  return (
    <div className="screen select-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>←</button>
        <div>
          <div className="chapter-label">第{chapter}章</div>
          <h2>{chapterName}</h2>
        </div>
      </div>
      <div className="level-grid">
        {Array.from({ length: 10 }, (_, i) => {
          const level = i + 1;
          const unlocked = isLevelUnlocked(chapter, level);
          const record = getRecord(chapter, level);
          const boss = isBossLevel(level);

          return (
            <div
              key={level}
              className={`level-card ${boss ? 'boss' : ''} ${unlocked ? '' : 'locked'}`}
              onClick={() => unlocked && onSelect(chapter, level)}
            >
              {!unlocked ? (
                <span className="lock-icon">🔒</span>
              ) : (
                <>
                  <span className="level-num">{boss ? 'BOSS' : level}</span>
                  {record && (
                    <>
                      <div className="star-row small">
                        {[1, 2, 3].map(i => (
                          <span key={i} className={i <= record.bestStars ? 'star-filled' : 'star-empty'}>★</span>
                        ))}
                      </div>
                      <span className="best-score">{record.bestScore}</span>
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
