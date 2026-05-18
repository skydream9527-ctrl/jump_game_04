export type WeaponType = 'pistol' | 'spread' | 'laser' | 'machinegun' | 'fireball';

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
  },
};

export const WEAPON_DROP_CHANCE = 0.15;
export const WEAPON_SPAWN_CHANCE = 0.10;
