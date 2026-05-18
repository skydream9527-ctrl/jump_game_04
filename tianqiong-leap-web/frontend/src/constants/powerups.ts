export type PowerUpType = 'shield' | 'magnet' | 'slowtime' | 'boostboots';

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  duration: number;       // ms, 0 = instant
  color: number;
  description: string;
}

export const POWER_UP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  shield: {
    type: 'shield',
    name: '护盾',
    duration: 0,           // lasts until hit
    color: 0x4fc3f7,
    description: '抵挡一次伤害',
  },
  magnet: {
    type: 'magnet',
    name: '磁铁',
    duration: 8000,
    color: 0xff9800,
    description: '自动吸附碎片',
  },
  slowtime: {
    type: 'slowtime',
    name: '缓时',
    duration: 5000,
    color: 0xce93d8,
    description: '速度减半',
  },
  boostboots: {
    type: 'boostboots',
    name: '强化靴',
    duration: 8000,
    color: 0x66bb6a,
    description: '跳跃力 ×1.5',
  },
};

export const POWER_UP_SPAWN_CHANCE = 0.12; // 12% per platform
export const MAGNET_RADIUS = 200;          // px
