export type PowerUpType = 'shield' | 'magnet' | 'slowtime' | 'boostboots' | 'xray' | 'revive' | 'heal' | 'energy';

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
  xray: {
    type: 'xray',
    name: '透视镜',
    duration: 15000,
    color: 0x80ff80,
    description: '显示隐藏平台和道具',
  },
  revive: {
    type: 'revive',
    name: '复活币',
    duration: 0,           // instant, triggers on death
    color: 0xffc800,
    description: '死亡时自动复活，恢复50%生命',
  },
  heal: {
    type: 'heal',
    name: '生命药剂',
    duration: 0,           // instant
    color: 0xff4040,
    description: '恢复30%生命值',
  },
  energy: {
    type: 'energy',
    name: '能量电池',
    duration: 0,           // instant
    color: 0x6bb8e8,
    description: '恢复50%能量',
  },
};

export const POWER_UP_SPAWN_CHANCE = 0.12; // 12% per platform
export const MAGNET_RADIUS = 200;          // px
