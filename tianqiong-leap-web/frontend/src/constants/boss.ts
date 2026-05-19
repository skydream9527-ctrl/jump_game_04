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

export interface MiniBossConfig {
  id: string;
  name: string;
  hp: number;
  width: number;
  height: number;
  color: number;
  speed: number;
  damage: number;
  scoreReward: number;
  attacks: BossAttack[];
  chapters: number[];  // Which chapters this mini-boss appears in
}

export interface EliteEnemyConfig {
  id: string;
  name: string;
  hp: number;
  width: number;
  height: number;
  color: number;
  speed: number;
  damage: number;
  scoreReward: number;
  ability: string;
  chapters: number[];
}

export const BOSS_CONFIGS: BossConfig[] = [
  {
    chapter: 1,
    name: '钢铁巨像',
    hp: 30,
    width: 60,
    height: 60,
    color: 0x6b7280,
    speed: 1.0,
    attacks: [
      { name: '挥臂扫过', duration: 800, cooldown: 2000, damage: 1, pattern: 'sweep' },
      { name: '踏步震动', duration: 600, cooldown: 3000, damage: 1, pattern: 'slam' },
    ],
    phases: [
      { hpThreshold: 50, phase: 'enraged', speedMultiplier: 1.5 },
    ],
  },
  {
    chapter: 2,
    name: '月震虫',
    hp: 40,
    width: 64,
    height: 56,
    color: 0xa0a0a0,
    speed: 1.2,
    attacks: [
      { name: '钻出撞击', duration: 1000, cooldown: 2500, damage: 1, pattern: 'charge' },
      { name: '地面震动', duration: 500, cooldown: 2000, damage: 1, pattern: 'slam' },
    ],
    phases: [
      { hpThreshold: 60, phase: 'attack', speedMultiplier: 1.2 },
      { hpThreshold: 30, phase: 'enraged', speedMultiplier: 1.8 },
    ],
  },
  {
    chapter: 3,
    name: '沙暴巨蝎',
    hp: 50,
    width: 70,
    height: 64,
    color: 0xa05030,
    speed: 0.8,
    attacks: [
      { name: '尾刺破坏', duration: 1000, cooldown: 2000, damage: 2, pattern: 'sweep' },
      { name: '沙尘漩涡', duration: 800, cooldown: 3000, damage: 1, pattern: 'barrage' },
      { name: '冲锋', duration: 1200, cooldown: 2500, damage: 1, pattern: 'charge' },
    ],
    phases: [
      { hpThreshold: 40, phase: 'enraged', speedMultiplier: 1.6 },
    ],
  },
  {
    chapter: 4,
    name: '水银巨灵',
    hp: 60,
    width: 75,
    height: 70,
    color: 0xc0c8d4,
    speed: 1.0,
    attacks: [
      { name: '锤击形态', duration: 800, cooldown: 2000, damage: 2, pattern: 'slam' },
      { name: '鞭扫形态', duration: 600, cooldown: 1800, damage: 1, pattern: 'sweep' },
      { name: '弹射形态', duration: 400, cooldown: 1500, damage: 1, pattern: 'charge' },
    ],
    phases: [
      { hpThreshold: 50, phase: 'attack', speedMultiplier: 1.3 },
      { hpThreshold: 25, phase: 'enraged', speedMultiplier: 1.8 },
    ],
  },
  {
    chapter: 5,
    name: '霜暴龙',
    hp: 70,
    width: 80,
    height: 65,
    color: 0xa0d0e0,
    speed: 1.1,
    attacks: [
      { name: '冰息冻结', duration: 1500, cooldown: 3000, damage: 1, pattern: 'barrage' },
      { name: '冰锥雨', duration: 2000, cooldown: 3500, damage: 2, pattern: 'barrage' },
      { name: '俯冲', duration: 800, cooldown: 2500, damage: 2, pattern: 'charge' },
    ],
    phases: [
      { hpThreshold: 45, phase: 'attack', speedMultiplier: 1.2 },
      { hpThreshold: 20, phase: 'enraged', speedMultiplier: 1.7 },
    ],
  },
  {
    chapter: 6,
    name: '熔岩领主',
    hp: 80,
    width: 85,
    height: 75,
    color: 0xff4000,
    speed: 0.9,
    attacks: [
      { name: '火山弹轰炸', duration: 2000, cooldown: 3000, damage: 2, pattern: 'barrage' },
      { name: '岩浆潮汐', duration: 1500, cooldown: 3500, damage: 3, pattern: 'sweep' },
      { name: '熔岩喷发', duration: 1000, cooldown: 2500, damage: 2, pattern: 'slam' },
    ],
    phases: [
      { hpThreshold: 50, phase: 'attack', speedMultiplier: 1.2 },
      { hpThreshold: 25, phase: 'enraged', speedMultiplier: 1.6 },
    ],
  },
  {
    chapter: 7,
    name: '雷霆守卫',
    hp: 90,
    width: 80,
    height: 70,
    color: 0x8060c0,
    speed: 1.3,
    attacks: [
      { name: '连锁闪电', duration: 800, cooldown: 2000, damage: 2, pattern: 'barrage' },
      { name: '电磁风暴', duration: 2000, cooldown: 3500, damage: 3, pattern: 'sweep' },
      { name: '雷电冲刺', duration: 600, cooldown: 2000, damage: 2, pattern: 'charge' },
    ],
    phases: [
      { hpThreshold: 40, phase: 'attack', speedMultiplier: 1.4 },
      { hpThreshold: 20, phase: 'enraged', speedMultiplier: 2.0 },
    ],
  },
  {
    chapter: 8,
    name: '巨树之心',
    hp: 100,
    width: 90,
    height: 80,
    color: 0x408040,
    speed: 0.7,
    attacks: [
      { name: '藤蔓陷阱', duration: 1500, cooldown: 3000, damage: 1, pattern: 'sweep' },
      { name: '毒孢子云', duration: 2000, cooldown: 3500, damage: 2, pattern: 'barrage' },
      { name: '根须缠绕', duration: 1000, cooldown: 2500, damage: 2, pattern: 'slam' },
    ],
    phases: [
      { hpThreshold: 50, phase: 'attack', speedMultiplier: 1.2 },
      { hpThreshold: 25, phase: 'enraged', speedMultiplier: 1.5 },
    ],
  },
  {
    chapter: 9,
    name: '棱镜巨像',
    hp: 110,
    width: 85,
    height: 75,
    color: 0xa080e0,
    speed: 1.0,
    attacks: [
      { name: '光束网', duration: 2000, cooldown: 3000, damage: 2, pattern: 'barrage' },
      { name: '晶体碎片', duration: 800, cooldown: 2000, damage: 2, pattern: 'sweep' },
      { name: '折射光线', duration: 1500, cooldown: 2500, damage: 3, pattern: 'barrage' },
    ],
    phases: [
      { hpThreshold: 45, phase: 'attack', speedMultiplier: 1.3 },
      { hpThreshold: 20, phase: 'enraged', speedMultiplier: 1.8 },
    ],
  },
  {
    chapter: 10,
    name: '暗物质核心',
    hp: 120,
    width: 90,
    height: 80,
    color: 0x3a2060,
    speed: 1.2,
    attacks: [
      { name: '黑洞吸力', duration: 2000, cooldown: 3500, damage: 2, pattern: 'sweep' },
      { name: '平台坍缩', duration: 1500, cooldown: 3000, damage: 3, pattern: 'slam' },
      { name: '能量风暴', duration: 2500, cooldown: 4000, damage: 3, pattern: 'barrage' },
    ],
    phases: [
      { hpThreshold: 60, phase: 'attack', speedMultiplier: 1.3 },
      { hpThreshold: 30, phase: 'enraged', speedMultiplier: 2.0 },
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

// Mini Boss configurations
export const MINI_BOSS_CONFIGS: MiniBossConfig[] = [
  {
    id: 'guardian_sentinel',
    name: '守护者哨兵',
    hp: 15,
    width: 45,
    height: 45,
    color: 0x4fc3f7,
    speed: 0.8,
    damage: 1,
    scoreReward: 200,
    attacks: [
      { name: '能量射击', duration: 600, cooldown: 1500, damage: 1, pattern: 'barrage' },
      { name: '护盾冲锋', duration: 800, cooldown: 2000, damage: 1, pattern: 'charge' },
    ],
    chapters: [1, 2],
  },
  {
    id: 'moonshell_crab',
    name: '月壳蟹',
    hp: 20,
    width: 50,
    height: 40,
    color: 0x78909c,
    speed: 0.6,
    damage: 1,
    scoreReward: 250,
    attacks: [
      { name: '钳击', duration: 500, cooldown: 1500, damage: 1, pattern: 'sweep' },
      { name: '钻地突袭', duration: 1000, cooldown: 2500, damage: 2, pattern: 'charge' },
    ],
    chapters: [2, 3],
  },
  {
    id: 'desert_lurker',
    name: '沙漠潜伏者',
    hp: 18,
    width: 48,
    height: 35,
    color: 0xff8c00,
    speed: 1.2,
    damage: 2,
    scoreReward: 280,
    attacks: [
      { name: '沙地潜行', duration: 800, cooldown: 2000, damage: 1, pattern: 'charge' },
      { name: '噬咬', duration: 400, cooldown: 1200, damage: 2, pattern: 'sweep' },
    ],
    chapters: [3, 4],
  },
  {
    id: 'lava_crawler',
    name: '熔岩爬虫',
    hp: 22,
    width: 45,
    height: 38,
    color: 0xff5722,
    speed: 0.7,
    damage: 2,
    scoreReward: 300,
    attacks: [
      { name: '熔岩吐息', duration: 800, cooldown: 1800, damage: 2, pattern: 'barrage' },
      { name: '滚石冲击', duration: 600, cooldown: 2000, damage: 1, pattern: 'charge' },
    ],
    chapters: [4, 5],
  },
  {
    id: 'ice_crystal_guard',
    name: '冰晶守卫',
    hp: 25,
    width: 42,
    height: 42,
    color: 0x80d8ff,
    speed: 0.9,
    damage: 2,
    scoreReward: 320,
    attacks: [
      { name: '冰锥射击', duration: 600, cooldown: 1500, damage: 1, pattern: 'barrage' },
      { name: '冰冻领域', duration: 1200, cooldown: 3000, damage: 2, pattern: 'sweep' },
    ],
    chapters: [5, 6],
  },
  {
    id: 'thunder_warden',
    name: '雷电守望者',
    hp: 28,
    width: 46,
    height: 46,
    color: 0xffd600,
    speed: 1.1,
    damage: 2,
    scoreReward: 350,
    attacks: [
      { name: '雷电链', duration: 500, cooldown: 1500, damage: 2, pattern: 'barrage' },
      { name: '电磁脉冲', duration: 1000, cooldown: 2500, damage: 1, pattern: 'slam' },
    ],
    chapters: [7, 8],
  },
  {
    id: 'vine_weaver',
    name: '藤蔓编织者',
    hp: 30,
    width: 44,
    height: 44,
    color: 0x66bb6a,
    speed: 0.5,
    damage: 2,
    scoreReward: 380,
    attacks: [
      { name: '藤蔓缠绕', duration: 800, cooldown: 2000, damage: 1, pattern: 'sweep' },
      { name: '毒孢子', duration: 600, cooldown: 1500, damage: 2, pattern: 'barrage' },
    ],
    chapters: [8, 9],
  },
  {
    id: 'prism_shard',
    name: '棱镜碎片',
    hp: 32,
    width: 40,
    height: 40,
    color: 0xe040fb,
    speed: 1.0,
    damage: 3,
    scoreReward: 400,
    attacks: [
      { name: '光束折射', duration: 700, cooldown: 1800, damage: 2, pattern: 'barrage' },
      { name: '空间撕裂', duration: 900, cooldown: 2200, damage: 3, pattern: 'charge' },
    ],
    chapters: [9, 10],
  },
];

// Elite enemy configurations
export const ELITE_ENEMY_CONFIGS: EliteEnemyConfig[] = [
  {
    id: 'charger_rhino',
    name: '突袭犀兽',
    hp: 2,
    width: 36,
    height: 30,
    color: 0xb070e0,
    speed: 2.5,
    damage: 2,
    scoreReward: 150,
    ability: 'charge',
    chapters: [3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 'flame_sprite',
    name: '火焰精灵',
    hp: 2,
    width: 28,
    height: 28,
    color: 0xff6e40,
    speed: 1.5,
    damage: 2,
    scoreReward: 120,
    ability: 'fire_trail',
    chapters: [4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 'ice_behemoth',
    name: '寒冰巨兽',
    hp: 4,
    width: 40,
    height: 35,
    color: 0x4fc3f7,
    speed: 0.5,
    damage: 2,
    scoreReward: 180,
    ability: 'freeze',
    chapters: [5, 6, 7, 8, 9, 10],
  },
  {
    id: 'shadow_stalker',
    name: '暗影潜行者',
    hp: 3,
    width: 32,
    height: 32,
    color: 0x616161,
    speed: 1.8,
    damage: 2,
    scoreReward: 160,
    ability: 'teleport',
    chapters: [7, 8, 9, 10],
  },
  {
    id: 'crystal_golem',
    name: '水晶魔像',
    hp: 5,
    width: 38,
    height: 38,
    color: 0xb388ff,
    speed: 0.6,
    damage: 3,
    scoreReward: 200,
    ability: 'reflect',
    chapters: [9, 10],
  },
];

export function getMiniBossConfigsForChapter(chapter: number): MiniBossConfig[] {
  return MINI_BOSS_CONFIGS.filter(mb => mb.chapters.includes(chapter));
}

export function getEliteEnemyConfigsForChapter(chapter: number): EliteEnemyConfig[] {
  return ELITE_ENEMY_CONFIGS.filter(ee => ee.chapters.includes(chapter));
}

export function getRandomMiniBoss(chapter: number): MiniBossConfig | null {
  const configs = getMiniBossConfigsForChapter(chapter);
  if (configs.length === 0) return null;
  return configs[Math.floor(Math.random() * configs.length)];
}

export function getRandomEliteEnemy(chapter: number): EliteEnemyConfig | null {
  const configs = getEliteEnemyConfigsForChapter(chapter);
  if (configs.length === 0) return null;
  return configs[Math.floor(Math.random() * configs.length)];
}
