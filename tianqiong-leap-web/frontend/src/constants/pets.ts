// 宝可梦风格宠物系统

export type PetElement = 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice' | 'dark' | 'light';

export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface PetDef {
  id: string;
  name: string;
  element: PetElement;
  rarity: PetRarity;
  description: string;
  icon: string;
  color: number;
  bodyColor: number;
  eyeColor: number;
  stats: PetStats;
  passive: PetPassive;
  active: PetActive;
  evolution?: {
    toPetId: string;
    requiredLevel: number;
    requiredShards: number;
  };
}

export interface PetStats {
  hpBonus: number;
  attackBonus: number;
  speedBonus: number;
  defenseBonus: number;
}

export interface PetPassive {
  type: string;
  value: number;
  description: string;
}

export interface PetActive {
  name: string;
  cooldown: number;
  duration: number;
  type: string;
  value: number;
  description: string;
}

export interface PetInstance {
  petId: string;
  level: number;
  exp: number;
  friendship: number;
}

export const PET_ELEMENT_COLORS: Record<PetElement, number> = {
  normal: 0x9e9e9e,
  fire: 0xff5722,
  water: 0x2196f3,
  grass: 0x4caf50,
  electric: 0xffeb3b,
  ice: 0x00bcd4,
  dark: 0x616161,
  light: 0xffd700,
};

export const PET_ELEMENT_NAMES: Record<PetElement, string> = {
  normal: '一般',
  fire: '火',
  water: '水',
  grass: '草',
  electric: '电',
  ice: '冰',
  dark: '暗',
  light: '光',
};

export const PETS: PetDef[] = [
  // ═══════════ 一般系 ═══════════
  {
    id: 'pet_pikachu',
    name: '电电鼠',
    element: 'electric',
    rarity: 'rare',
    description: '黄色电气老鼠，尾巴可释放强力电击',
    icon: '⚡',
    color: 0xffeb3b,
    bodyColor: 0xffeb3b,
    eyeColor: 0x1a1a2e,
    stats: { hpBonus: 0, attackBonus: 0, speedBonus: 5, defenseBonus: 0 },
    passive: { type: 'speed_boost', value: 0.05, description: '移动速度 +5%' },
    active: { name: '十万伏特', cooldown: 15000, duration: 0, type: 'lightning', value: 3, description: '释放闪电，全屏伤害 3 点' },
  },
  {
    id: 'pet_charmander',
    name: '小火龙',
    element: 'fire',
    rarity: 'uncommon',
    description: '尾巴上的火焰代表生命力，越强越旺',
    icon: '🔥',
    color: 0xff5722,
    bodyColor: 0xff7043,
    eyeColor: 0x1a1a2e,
    stats: { hpBonus: 0, attackBonus: 3, speedBonus: 0, defenseBonus: 0 },
    passive: { type: 'attack_boost', value: 3, description: '踩踏伤害 +3' },
    active: { name: '喷射火焰', cooldown: 12000, duration: 3000, type: 'fire_trail', value: 2, description: '身后留下火焰路径，持续 3 秒' },
    evolution: { toPetId: 'pet_charmeleon', requiredLevel: 5, requiredShards: 30 },
  },
  {
    id: 'pet_charmeleon',
    name: '火恐龙',
    element: 'fire',
    rarity: 'rare',
    description: '性格粗暴，火焰更加猛烈',
    icon: '🔥',
    color: 0xff3d00,
    bodyColor: 0xe64a19,
    eyeColor: 0x1a1a2e,
    stats: { hpBonus: 0, attackBonus: 5, speedBonus: 2, defenseBonus: 0 },
    passive: { type: 'attack_boost', value: 5, description: '踩踏伤害 +5' },
    active: { name: '大字爆', cooldown: 10000, duration: 0, type: 'fire_explosion', value: 5, description: '前方大范围火焰爆炸，伤害 5' },
  },
  {
    id: 'pet_squirtle',
    name: '杰尼龟',
    element: 'water',
    rarity: 'uncommon',
    description: '壳可抵挡攻击，水枪精准',
    icon: '💧',
    color: 0x2196f3,
    bodyColor: 0x42a5f5,
    eyeColor: 0x1a1a2e,
    stats: { hpBonus: 1, attackBonus: 0, speedBonus: 0, defenseBonus: 3 },
    passive: { type: 'defense_boost', value: 0.10, description: '10% 概率免疫伤害' },
    active: { name: '水炮', cooldown: 12000, duration: 2000, type: 'water_wave', value: 2, description: '释放水波，推开并伤害前方敌人' },
    evolution: { toPetId: 'pet_wartortle', requiredLevel: 5, requiredShards: 30 },
  },
  {
    id: 'pet_wartortle',
    name: '卡咪龟',
    element: 'water',
    rarity: 'rare',
    description: '尾巴蓬松，长寿象征',
    icon: '💧',
    color: 0x1565c0,
    bodyColor: 0x1e88e5,
    eyeColor: 0x1a1a2e,
    stats: { hpBonus: 2, attackBonus: 0, speedBonus: 0, defenseBonus: 5 },
    passive: { type: 'defense_boost', value: 0.15, description: '15% 概率免疫伤害' },
    active: { name: '水之护盾', cooldown: 15000, duration: 5000, type: 'water_shield', value: 1, description: '水之护盾包裹，5 秒内免疫伤害' },
  },
  {
    id: 'pet_bulbasaur',
    name: '妙蛙种子',
    element: 'grass',
    rarity: 'uncommon',
    description: '背上的种子会随阳光成长',
    icon: '🌿',
    color: 0x4caf50,
    bodyColor: 0x66bb6a,
    eyeColor: 0xc62828,
    stats: { hpBonus: 2, attackBonus: 0, speedBonus: 0, defenseBonus: 2 },
    passive: { type: 'regen', value: 1, description: '每 20 秒恢复 1 条生命' },
    active: { name: '藤鞭', cooldown: 10000, duration: 0, type: 'vine_whip', value: 2, description: '藤鞭横扫，伤害并眩晕前方敌人' },
    evolution: { toPetId: 'pet_ivysaur', requiredLevel: 5, requiredShards: 30 },
  },
  {
    id: 'pet_ivysaur',
    name: '妙蛙草',
    element: 'grass',
    rarity: 'rare',
    description: '花苞散发催眠粉',
    icon: '🌿',
    color: 0x2e7d32,
    bodyColor: 0x388e3c,
    eyeColor: 0xc62828,
    stats: { hpBonus: 3, attackBonus: 2, speedBonus: 0, defenseBonus: 3 },
    passive: { type: 'regen', value: 1, description: '每 15 秒恢复 1 条生命' },
    active: { name: '飞叶风暴', cooldown: 12000, duration: 3000, type: 'leaf_storm', value: 3, description: '飞叶旋转，3 秒内持续伤害周围敌人' },
  },
  {
    id: 'pet_eevee',
    name: '伊布',
    element: 'normal',
    rarity: 'rare',
    description: '不稳定的遗传因子，进化方向多样',
    icon: '🦊',
    color: 0x8d6e63,
    bodyColor: 0xa1887f,
    eyeColor: 0x4a148c,
    stats: { hpBonus: 1, attackBonus: 1, speedBonus: 1, defenseBonus: 1 },
    passive: { type: 'all_boost', value: 0.02, description: '全属性 +2%' },
    active: { name: '珍藏', cooldown: 20000, duration: 0, type: 'last_resort', value: 4, description: '积蓄力量释放，伤害 4 点' },
    evolution: { toPetId: 'pet_vaporeon', requiredLevel: 8, requiredShards: 50 },
  },
  {
    id: 'pet_vaporeon',
    name: '水伊布',
    element: 'water',
    rarity: 'epic',
    description: '细胞结构与水分子相似，可溶于水中',
    icon: '🐬',
    color: 0x00bcd4,
    bodyColor: 0x26c6da,
    eyeColor: 0x1a1a2e,
    stats: { hpBonus: 3, attackBonus: 0, speedBonus: 2, defenseBonus: 4 },
    passive: { type: 'water_body', value: 0.20, description: '20% 概率免疫伤害 + 水中无敌' },
    active: { name: '水之波动', cooldown: 15000, duration: 5000, type: 'water_pulse', value: 3, description: '水波护体，5 秒内持续伤害靠近的敌人' },
  },
  {
    id: 'pet_jolteon',
    name: '雷伊布',
    element: 'electric',
    rarity: 'epic',
    description: '体内蓄满高压电，毛发如针',
    icon: '⚡',
    color: 0xffd600,
    bodyColor: 0xffee58,
    eyeColor: 0xc62828,
    stats: { hpBonus: 0, attackBonus: 3, speedBonus: 6, defenseBonus: 0 },
    passive: { type: 'speed_boost', value: 0.10, description: '移动速度 +10%' },
    active: { name: '雷光闪', cooldown: 10000, duration: 0, type: 'thunder', value: 5, description: '闪电劈下，全屏伤害 5 点' },
  },
  {
    id: 'pet_flareon',
    name: '火伊布',
    element: 'fire',
    rarity: 'epic',
    description: '体内火焰袋可产生 1700° 高温',
    icon: '🦊',
    color: 0xff3d00,
    bodyColor: 0xe64a19,
    eyeColor: 0x1a1a2e,
    stats: { hpBonus: 0, attackBonus: 6, speedBonus: 0, defenseBonus: 2 },
    passive: { type: 'attack_boost', value: 6, description: '踩踏伤害 +6' },
    active: { name: '闪焰冲锋', cooldown: 12000, duration: 2000, type: 'flare_blitz', value: 4, description: '火焰冲锋，2 秒内接触敌人自动消灭' },
  },
  {
    id: 'pet_mew',
    name: '梦幻',
    element: 'psychic' as PetElement,
    rarity: 'legendary',
    description: '传说中的宝可梦，拥有所有基因',
    icon: '🐱',
    color: 0xe040fb,
    bodyColor: 0xf48fb1,
    eyeColor: 0x1a1a2e,
    stats: { hpBonus: 3, attackBonus: 3, speedBonus: 3, defenseBonus: 3 },
    passive: { type: 'all_boost', value: 0.05, description: '全属性 +5%' },
    active: { name: '精神强念', cooldown: 18000, duration: 5000, type: 'psychic', value: 3, description: '5 秒内所有敌人减速 50%' },
  },
  {
    id: 'pet_mewtwo',
    name: '超梦',
    element: 'psychic' as PetElement,
    rarity: 'legendary',
    description: '人工创造的最强宝可梦',
    icon: '🧠',
    color: 0x7c4dff,
    bodyColor: 0xb388ff,
    eyeColor: 0xc62828,
    stats: { hpBonus: 2, attackBonus: 5, speedBonus: 4, defenseBonus: 2 },
    passive: { type: 'all_boost', value: 0.08, description: '全属性 +8%' },
    active: { name: '精神击破', cooldown: 15000, duration: 0, type: 'psychic_blast', value: 8, description: '释放精神冲击波，全屏伤害 8 点' },
  },
];

export const PET_EXP_PER_LEVEL = [0, 10, 25, 50, 80, 120, 170, 230, 300, 400];
export const MAX_PET_LEVEL = 10;
export const MAX_OWNED_PETS = 6;

export function getPetById(id: string): PetDef | undefined {
  return PETS.find(p => p.id === id);
}

export function getPetsByElement(element: PetElement): PetDef[] {
  return PETS.filter(p => p.element === element);
}

export function getPetsByRarity(rarity: PetRarity): PetDef[] {
  return PETS.filter(p => p.rarity === rarity);
}
