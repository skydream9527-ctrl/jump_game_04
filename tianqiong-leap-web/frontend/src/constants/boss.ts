export type BossPhase = 'idle' | 'attack' | 'vulnerable' | 'enraged';

export interface BossAttack {
  name: string;
  duration: number;       // ms
  cooldown: number;       // ms after attack ends
  damage: number;
  pattern: 'charge' | 'barrage' | 'slam' | 'sweep';
}

export interface BossConfig {
  chapter: number;
  name: string;
  hp: number;
  width: number;
  height: number;
  color: number;
  speed: number;
  attacks: BossAttack[];
  phases: {
    hpThreshold: number;   // % hp to trigger phase
    phase: BossPhase;
    speedMultiplier: number;
  }[];
}

export const BOSS_CONFIGS: BossConfig[] = [
  {
    chapter: 1,
    name: '废墟守卫',
    hp: 30,
    width: 60,
    height: 60,
    color: 0x8b7355,
    speed: 1.0,
    attacks: [
      { name: '冲锋', duration: 800, cooldown: 2000, damage: 1, pattern: 'charge' },
      { name: '砸地', duration: 600, cooldown: 3000, damage: 1, pattern: 'slam' },
    ],
    phases: [
      { hpThreshold: 50, phase: 'enraged', speedMultiplier: 1.5 },
    ],
  },
  {
    chapter: 2,
    name: '月面机甲',
    hp: 40,
    width: 64,
    height: 56,
    color: 0x9e9e9e,
    speed: 1.2,
    attacks: [
      { name: '弹幕', duration: 2000, cooldown: 2500, damage: 1, pattern: 'barrage' },
      { name: '横扫', duration: 500, cooldown: 2000, damage: 1, pattern: 'sweep' },
    ],
    phases: [
      { hpThreshold: 60, phase: 'attack', speedMultiplier: 1.2 },
      { hpThreshold: 30, phase: 'enraged', speedMultiplier: 1.8 },
    ],
  },
  {
    chapter: 3,
    name: '火星巨兽',
    hp: 50,
    width: 70,
    height: 64,
    color: 0xbf5b3b,
    speed: 0.8,
    attacks: [
      { name: '冲锋', duration: 1000, cooldown: 2000, damage: 1, pattern: 'charge' },
      { name: '砸地', duration: 800, cooldown: 3000, damage: 2, pattern: 'slam' },
      { name: '弹幕', duration: 2500, cooldown: 3000, damage: 1, pattern: 'barrage' },
    ],
    phases: [
      { hpThreshold: 40, phase: 'enraged', speedMultiplier: 1.6 },
    ],
  },
];

// Fallback boss for chapters without custom config
export function getBossConfig(chapter: number): BossConfig {
  return BOSS_CONFIGS[chapter - 1] ?? {
    chapter,
    name: `第${chapter}章 Boss`,
    hp: 30 + chapter * 10,
    width: 56 + chapter * 2,
    height: 56 + chapter * 2,
    color: 0xff0000,
    speed: 1.0 + chapter * 0.1,
    attacks: [
      { name: '冲锋', duration: 800, cooldown: 2000, damage: 1, pattern: 'charge' },
      { name: '弹幕', duration: 2000, cooldown: 2500, damage: 1, pattern: 'barrage' },
    ],
    phases: [
      { hpThreshold: 50, phase: 'enraged', speedMultiplier: 1.5 },
    ],
  };
}
