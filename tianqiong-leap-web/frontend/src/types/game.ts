export interface LevelRecord {
  idx: number;
  cleared: boolean;
  bestScore: number;
  bestStars: number;
  bestShards: number;
}

export interface SaveData {
  totalShards: number;
  currentChapter: number;
  currentLevel: number;
  selectedCharacter: number;
  unlockedCharacters: number[];
  records: LevelRecord[];
}

export type GameScreen = 'menu' | 'planet_select' | 'level_select' | 'character_select' | 'game' | 'shop' | 'settings';

export type GameState = 'idle' | 'playing' | 'paused' | 'game_over' | 'result';
