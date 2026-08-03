export type EnemyType = 'flyer' | 'ground' | 'shooter' | 'charger' | 'bomber' | 'elite_charger' | 'elite_fire' | 'elite_ice' | 'elite_shadow' | 'elite_crystal' | 'mini_boss';

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
  chapters: number[];     // which chapters this enemy appears in
}

const ALL_CHAPTERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
    chapters: ALL_CHAPTERS,
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
    chapters: ALL_CHAPTERS,
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
    chapters: ALL_CHAPTERS,
  },
  charger: {
    type: 'charger',
    name: '突击怪',
    hp: 2,
    width: 32,
    height: 28,
    color: 0xff6020,
    speed: 2.0,
    damage: 2,
    scoreReward: 100,
    chapters: [3, 4, 5, 6, 7, 8, 9, 10],
  },
  bomber: {
    type: 'bomber',
    name: '轰炸怪',
    hp: 3,
    width: 30,
    height: 30,
    color: 0xff4040,
    speed: 0.5,
    damage: 2,
    scoreReward: 120,
    chapters: [3, 4, 5, 6, 7, 8, 9, 10],
  },
  elite_charger: {
    type: 'elite_charger',
    name: '突袭犀兽',
    hp: 2,
    width: 36,
    height: 30,
    color: 0xb070e0,
    speed: 2.5,
    damage: 2,
    scoreReward: 150,
    chapters: [3, 4, 5, 6, 7, 8, 9, 10],
  },
  elite_fire: {
    type: 'elite_fire',
    name: '火焰精灵',
    hp: 2,
    width: 28,
    height: 28,
    color: 0xff6e40,
    speed: 1.5,
    damage: 2,
    scoreReward: 120,
    chapters: [3, 4, 5, 6, 7, 8, 9, 10],
  },
  elite_ice: {
    type: 'elite_ice',
    name: '寒冰巨兽',
    hp: 4,
    width: 40,
    height: 35,
    color: 0x4fc3f7,
    speed: 0.5,
    damage: 2,
    scoreReward: 180,
    chapters: [5, 6, 7, 8, 9, 10],
  },
  elite_shadow: {
    type: 'elite_shadow',
    name: '暗影潜行者',
    hp: 3,
    width: 32,
    height: 32,
    color: 0x616161,
    speed: 1.8,
    damage: 2,
    scoreReward: 160,
    chapters: [7, 8, 9, 10],
  },
  elite_crystal: {
    type: 'elite_crystal',
    name: '水晶魔像',
    hp: 5,
    width: 38,
    height: 38,
    color: 0xb388ff,
    speed: 0.6,
    damage: 3,
    scoreReward: 200,
    chapters: [9, 10],
  },
  mini_boss: {
    type: 'mini_boss',
    name: '小Boss',
    hp: 15,
    width: 45,
    height: 45,
    color: 0x4fc3f7,
    speed: 0.8,
    damage: 1,
    scoreReward: 200,
    chapters: ALL_CHAPTERS,
  },
};

export function getAvailableEnemyTypes(chapter: number): EnemyType[] {
  return (Object.keys(ENEMY_CONFIGS) as EnemyType[]).filter(
    t => ENEMY_CONFIGS[t].chapters.includes(chapter) && t !== 'mini_boss'
  );
}

export const ENEMY_SPAWN_CHANCE = 0.30;
export const ELITE_SPAWN_CHANCE = 0.08;  // 8% chance for elite
export const MINI_BOSS_SPAWN_CHANCE = 0.03;  // 3% chance for mini-boss
export const SHOOTER_FIRE_INTERVAL = 1800; // ms
export const BULLET_SPEED = 3;
export const BULLET_SIZE = 6;
