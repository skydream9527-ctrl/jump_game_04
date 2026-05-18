import { ACHIEVEMENTS } from '../constants/achievements';

const STORAGE_KEY = 'tianqiong_achievements';

export function getUnlockedAchievements(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function unlockAchievement(id: string): boolean {
  const unlocked = getUnlockedAchievements();
  if (unlocked.includes(id)) return false;
  unlocked.push(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  return true;
}

export function isAchievementUnlocked(id: string): boolean {
  return getUnlockedAchievements().includes(id);
}

export function getAchievementById(id: string) {
  return ACHIEVEMENTS.find(a => a.id === id);
}
