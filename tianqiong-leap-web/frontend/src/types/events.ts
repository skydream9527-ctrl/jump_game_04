// Phaser <-> React event types
export interface StartLevelPayload {
  chapter: number;
  level: number;
  characterId: number;
  equippedItems?: string[];
}

export interface ScoreChangedPayload {
  score: number;
}

export interface ShardCollectedPayload {
  count: number;
  total: number;
}

export interface LivesChangedPayload {
  lives: number;
}

export interface ProgressChangedPayload {
  distance: number;
  target: number;
}

export interface GameOverPayload {
  score: number;
  bestScore: number;
}

export interface LevelCompletePayload {
  score: number;
  shards: number;
  lives: number;
  stars: number;
}

// Event name constants
export const EVENTS = {
  // React -> Phaser
  START_LEVEL: 'start-level',
  PAUSE: 'pause',
  RESUME: 'resume',
  RESTART: 'restart',

  // Phaser -> React
  SCORE_CHANGED: 'score-changed',
  SHARD_COLLECTED: 'shard-collected',
  LIVES_CHANGED: 'lives-changed',
  PROGRESS_CHANGED: 'progress-changed',
  GAME_OVER: 'game-over',
  LEVEL_COMPLETE: 'level-complete',
  GAME_READY: 'game-ready',
  GAME_STATE_CHANGED: 'game-state-changed',
} as const;
