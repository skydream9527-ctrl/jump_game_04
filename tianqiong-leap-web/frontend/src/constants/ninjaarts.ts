export type NinjaArtType = 'freeze' | 'dash' | 'timestop' | 'tornado';

export interface NinjaArtConfig {
  type: NinjaArtType;
  characterId: number;    // 0=ling, 1=zero, 2=echo, 3=gale
  name: string;
  cost: number;           // energy cost (100 = full bar)
  duration: number;       // ms
  color: number;
  description: string;
}

export const NINJA_ART_CONFIGS: Record<NinjaArtType, NinjaArtConfig> = {
  freeze: {
    type: 'freeze',
    characterId: 1,
    name: '冰封千里',
    cost: 100,
    duration: 4000,
    color: 0x00bfff,
    description: '全屏冰冻减速敌人',
  },
  dash: {
    type: 'dash',
    characterId: 0,
    name: '疾风冲刺',
    cost: 100,
    duration: 2000,
    color: 0xff4500,
    description: '向前冲刺，无敌状态',
  },
  timestop: {
    type: 'timestop',
    characterId: 2,
    name: '时空停滞',
    cost: 100,
    duration: 3000,
    color: 0xda70d6,
    description: '暂停时间 3 秒',
  },
  tornado: {
    type: 'tornado',
    characterId: 3,
    name: '龙卷旋风',
    cost: 100,
    duration: 3000,
    color: 0x00e676,
    description: '龙卷风清除障碍和敌人',
  },
};

export const ENERGY_PER_JUMP = 3;
export const ENERGY_PER_SHARD = 15;
export const ENERGY_PER_PLATFORM = 1;
export const ENERGY_MAX = 100;
