import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const chapterName = t(`data.chapter_name.${chapter}`, { defaultValue: CHAPTER_NAMES[chapter] ?? '' });

  return (
    <div className="screen select-screen" role="navigation" aria-label={chapterName}>
      <div className="screen-header">
        <button className="btn-back" onClick={onBack} aria-label={t('level_select.back', { defaultValue: 'Back' })}>←</button>
        <div>
          <div className="chapter-label">{t('level_select.chapter', { n: chapter })}</div>
          <h2>{chapterName}</h2>
        </div>
      </div>
      <div className="level-grid" role="list">
        {Array.from({ length: 10 }, (_, i) => {
          const level = i + 1;
          const unlocked = isLevelUnlocked(chapter, level);
          const record = getRecord(chapter, level);
          const boss = isBossLevel(level);

          const label = boss
            ? `${t('level_select.boss', { defaultValue: 'Boss' })} ${level}`
            : `${t('level_select.level', { defaultValue: 'Level' })} ${level}`;

          return (
            <div
              key={level}
              className={`level-card ${boss ? 'boss' : ''} ${unlocked ? '' : 'locked'}`}
              role="button"
              tabIndex={unlocked ? 0 : -1}
              aria-disabled={!unlocked}
              aria-label={label}
              onClick={() => unlocked && onSelect(chapter, level)}
              onKeyDown={(e) => {
                if (unlocked && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelect(chapter, level);
                }
              }}
            >
              {!unlocked ? (
                <span className="lock-icon" aria-hidden="true">🔒</span>
              ) : (
                <>
                  <span className="level-num">{boss ? 'BOSS' : level}</span>
                  {record && (
                    <>
                      <div className="star-row small" aria-hidden="true">
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
