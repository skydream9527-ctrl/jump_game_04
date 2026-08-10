import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ACHIEVEMENTS } from '../../constants/achievements';
import { getUnlockedAchievements } from '../../state/achievements';

interface AchievementsScreenProps {
  onBack: () => void;
}

const CATEGORY_ORDER = ['cat_basic', 'cat_chapter', 'cat_boss', 'cat_collect', 'cat_character', 'cat_battle', 'cat_special'] as const;

// Group achievements by rough category based on id prefix
function categorize(id: string): string {
  if (id.startsWith('chapter') && id.endsWith('_clear')) return 'cat_chapter';
  if (id.startsWith('boss_')) return 'cat_boss';
  if (id.startsWith('collector') || id.startsWith('kill_')) return 'cat_collect';
  if (id.startsWith('unlock_')) return 'cat_character';
  if (id === 'all_bosses' || id === 'all_characters' || id === 'all_stars' || id === 'speed_demon' || id === 'high_score') return 'cat_special';
  if (id === 'first_clear' || id === 'all_shards' || id === 'no_damage' || id === 'boss_slayer' || id === 'speed_run' || id === 'ninja_master' || id === 'collector' || id === 'survivor' || id === 'explorer') return 'cat_basic';
  return 'cat_battle';
}

export function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const { t } = useTranslation();
  const unlocked = useMemo(() => getUnlockedAchievements(), []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof ACHIEVEMENTS>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const ach of ACHIEVEMENTS) {
      const cat = categorize(ach.id);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(ach);
    }
    return map;
  }, []);

  const totalUnlocked = unlocked.length;
  const totalAchievements = ACHIEVEMENTS.length;
  const progress = Math.round((totalUnlocked / totalAchievements) * 100);

  return (
    <div className="screen achievements-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>{t('common.back')}</button>
        <h2>{t('common.achievements_title')}</h2>
        <div className="achievement-progress-summary">
          <span className="ach-count">{totalUnlocked} / {totalAchievements}</span>
          <div className="ach-progress-bar">
            <div className="ach-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="ach-pct">{progress}%</span>
        </div>
      </div>

      <div className="achievements-content">
        {CATEGORY_ORDER.map(cat => {
          const items = grouped.get(cat) ?? [];
          if (items.length === 0) return null;
          const catUnlocked = items.filter(a => unlocked.includes(a.id)).length;
          return (
            <div key={cat} className="ach-category">
              <div className="ach-category-header">
                <span className="ach-category-name">{t(`achievement.${cat}`)}</span>
                <span className="ach-category-count">{catUnlocked}/{items.length}</span>
              </div>
              <div className="ach-grid">
                {items.map(ach => {
                  const isUnlocked = unlocked.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`ach-card ${isUnlocked ? 'ach-unlocked' : 'ach-locked'}`}
                    >
                      <div className="ach-card-icon">{isUnlocked ? ach.icon : '🔒'}</div>
                      <div className="ach-card-body">
                        <div className="ach-card-name">{isUnlocked ? t(`data.achievement.${ach.id}.name`, { defaultValue: ach.name }) : t('achievement.locked_name')}</div>
                        <div className="ach-card-desc">
                          {isUnlocked ? t(`data.achievement.${ach.id}.description`, { defaultValue: ach.description }) : t('achievement.locked_desc')}
                        </div>
                        {isUnlocked && (
                          <div className="ach-card-condition">{t(`data.achievement.${ach.id}.condition`, { defaultValue: ach.condition })}</div>
                        )}
                      </div>
                      {isUnlocked && <div className="ach-check">✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
