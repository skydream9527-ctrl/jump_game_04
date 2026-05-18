import { CHAPTER_DATA } from '../../constants/levels';

interface PlanetSelectProps {
  getChapterStars: (ch: number) => number;
  isChapterUnlocked: (ch: number) => boolean;
  onSelect: (chapter: number) => void;
  onBack: () => void;
}

export function PlanetSelect({ getChapterStars, isChapterUnlocked, onSelect, onBack }: PlanetSelectProps) {
  return (
    <div className="screen select-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>←</button>
        <h2>选择星球</h2>
      </div>
      <div className="planet-grid">
        {CHAPTER_DATA.map((ch) => {
          const unlocked = isChapterUnlocked(ch.chapter);
          const stars = getChapterStars(ch.chapter);
          const colorHex = '#' + ch.color.toString(16).padStart(6, '0');
          return (
            <div
              key={ch.chapter}
              className={`planet-card ${unlocked ? '' : 'locked'}`}
              onClick={() => unlocked && onSelect(ch.chapter)}
            >
              <div className="planet-header">
                <div className="planet-badge" style={{ backgroundColor: colorHex + '30', color: colorHex }}>
                  {ch.chapter}
                </div>
                <span className="planet-name">{ch.name}</span>
              </div>
              <div className="planet-footer">
                {unlocked ? (
                  <>
                    <div className="star-row">
                      {[1, 2, 3].map(i => (
                        <span key={i} className={i * 10 <= stars ? 'star-filled' : 'star-empty'}>★</span>
                      ))}
                    </div>
                    <span className="star-count">{stars}/30</span>
                  </>
                ) : (
                  <span className="locked-text">未解锁</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
