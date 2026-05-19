export type WeaponType = 'pistol' | 'spread' | 'laser' | 'machinegun' | 'fireball' | 'plasma' | 'quantum' | 'gravity' | 'timeslow';

export interface WeaponConfig {
  type: WeaponType;
  name: string;
  damage: number;
  fireRate: number;
  bulletSpeed: number;
  bulletCount: number;
  spreadAngle: number;
  bulletSize: number;
  piercing: boolean;
  explosionRadius: number;
  color: number;
  description: string;
  minChapter: number;
}

export const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig> = {
  pistol: {
    type: 'pistol',
    name: '手枪',
    damage: 1,
    fireRate: 400,
    bulletSpeed: 6,
    bulletCount: 1,
    spreadAngle: 0,
    bulletSize: 6,
    piercing: false,
    explosionRadius: 0,
    color: 0xffeb3b,
    description: '基础武器，稳定可靠',
    minChapter: 1,
  },
  spread: {
    type: 'spread',
    name: '散弹',
    damage: 1,
    fireRate: 500,
    bulletSpeed: 5,
    bulletCount: 3,
    spreadAngle: 15,
    bulletSize: 7,
    piercing: false,
    explosionRadius: 0,
    color: 0xff9800,
    description: '扇形散射，覆盖范围广',
    minChapter: 3,
  },
  laser: {
    type: 'laser',
    name: '激光',
    damage: 2,
    fireRate: 600,
    bulletSpeed: 10,
    bulletCount: 1,
    spreadAngle: 0,
    bulletSize: 4,
    piercing: true,
    explosionRadius: 0,
    color: 0x00e5ff,
    description: '高速穿透，连续伤害',
    minChapter: 3,
  },
  machinegun: {
    type: 'machinegun',
    name: '机枪',
    damage: 1,
    fireRate: 150,
    bulletSpeed: 7,
    bulletCount: 1,
    spreadAngle: 0,
    bulletSize: 4,
    piercing: false,
    explosionRadius: 0,
    color: 0xe0e0e0,
    description: '超高射速，持续火力',
    minChapter: 4,
  },
  fireball: {
    type: 'fireball',
    name: '火球',
    damage: 3,
    fireRate: 800,
    bulletSpeed: 4,
    bulletCount: 1,
    spreadAngle: 0,
    bulletSize: 10,
    piercing: false,
    explosionRadius: 60,
    color: 0xff5722,
    description: '命中后爆炸，范围伤害',
    minChapter: 5,
  },
  plasma: {
    type: 'plasma',
    name: '等离子炮',
    damage: 4,
    fireRate: 1000,
    bulletSpeed: 5,
    bulletCount: 1,
    spreadAngle: 0,
    bulletSize: 14,
    piercing: false,
    explosionRadius: 80,
    color: 0xb070e0,
    description: '高能等离子球，范围爆炸伤害',
    minChapter: 7,
  },
  quantum: {
    type: 'quantum',
    name: '量子分解器',
    damage: 8,
    fireRate: 1500,
    bulletSpeed: 6,
    bulletCount: 1,
    spreadAngle: 0,
    bulletSize: 12,
    piercing: true,
    explosionRadius: 40,
    color: 0xffa000,
    description: '终极武器，对Boss伤害+50%',
    minChapter: 9,
  },
  gravity: {
    type: 'gravity',
    name: '引力场发生器',
    damage: 2,
    fireRate: 2000,
    bulletSpeed: 3,
    bulletCount: 1,
    spreadAngle: 0,
    bulletSize: 20,
    piercing: false,
    explosionRadius: 120,
    color: 0xff4040,
    description: '产生微型黑洞，吸引并伤害敌人',
    minChapter: 9,
  },
  timeslow: {
    type: 'timeslow',
    name: '时间减速器',
    damage: 1,
    fireRate: 800,
    bulletSpeed: 5,
    bulletCount: 1,
    spreadAngle: 0,
    bulletSize: 8,
    piercing: false,
    explosionRadius: 0,
    color: 0xb088c8,
    description: '击中敌人后减速50%，持续3秒',
    minChapter: 7,
  },
};

export const WEAPON_DROP_CHANCE = 0.15;
export const WEAPON_SPAWN_CHANCE = 0.10;

export function getAvailableWeaponTypes(chapter: number): WeaponType[] {
  return (Object.keys(WEAPON_CONFIGS) as WeaponType[]).filter(
    t => WEAPON_CONFIGS[t].minChapter <= chapter
  );
}
