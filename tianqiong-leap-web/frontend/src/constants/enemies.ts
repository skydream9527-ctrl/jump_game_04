export type EnemyType = 'flyer' | 'ground' | 'shooter';

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  hp: number;
  width: number;
  height: number;
  color: number;
  speed: number;          // px/frame at 60fps
  damage: number;
  scoreReward: number;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  flyer: {
    type: 'flyer',
    name: '飞行怪',
    hp: 1,
    width: 28,
    height: 24,
    color: 0xff5252,
    speed: 1.2,
    damage: 1,
    scoreReward: 50,
  },
  ground: {
    type: 'ground',
    name: '地面怪',
    hp: 1,
    width: 30,
    height: 26,
    color: 0x8d6e63,
    speed: 0.6,
    damage: 1,
    scoreReward: 30,
  },
  shooter: {
    type: 'shooter',
    name: '远程怪',
    hp: 2,
    width: 26,
    height: 28,
    color: 0xab47bc,
    speed: 0,
    damage: 1,
    scoreReward: 80,
  },
};

export const ENEMY_SPAWN_CHANCE = 0.08;
export const SHOOTER_FIRE_INTERVAL = 2500; // ms
export const BULLET_SPEED = 3;
export const BULLET_SIZE = 6;
