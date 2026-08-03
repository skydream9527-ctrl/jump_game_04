export interface LeaderboardEntry {
  name: string;
  score: number;
  chapter: number;
  level: number;
  date: number;
}

const STORAGE_KEY = 'tianqiong_leaderboard';
const MAX_ENTRIES = 20;

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'date'>): void {
  const entries = getLeaderboard();
  entries.push({ ...entry, date: Date.now() });
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function clearLeaderboard(): void {
  localStorage.removeItem(STORAGE_KEY);
}
