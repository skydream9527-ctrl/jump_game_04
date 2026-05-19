// Shop system configuration

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'character' | 'weapon' | 'powerup' | 'consumable';
  icon: string;
  color: number;
  unlockCondition?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Characters
  {
    id: 'char_ling',
    name: '凌',
    description: '人类精英特工，均衡全能型角色',
    price: 0,
    type: 'character',
    icon: '👤',
    color: 0x6bb8e8,
  },
  {
    id: 'char_zero',
    name: '零号',
    description: 'AI战斗义体，精准着陆能力',
    price: 30,
    type: 'character',
    icon: '🤖',
    color: 0x00ccff,
    unlockCondition: '收集30个星核碎片',
  },
  {
    id: 'char_echo',
    name: '艾珂',
    description: '外星混血，跳跃力+8%',
    price: 60,
    type: 'character',
    icon: '🧝‍♀️',
    color: 0xb070e0,
    unlockCondition: '收集60个星核碎片',
  },
  {
    id: 'char_gale',
    name: '疾风',
    description: '改造人战士，移动速度+8%',
    price: 100,
    type: 'character',
    icon: '🦾',
    color: 0xff6020,
    unlockCondition: '收集100个星核碎片',
  },

  // Weapons
  {
    id: 'weapon_pistol',
    name: '能量脉冲枪',
    description: '基础能量武器，稳定可靠',
    price: 0,
    type: 'weapon',
    icon: '🔫',
    color: 0xffeb3b,
  },
  {
    id: 'weapon_spread',
    name: '散弹枪',
    description: '扇形散射，覆盖范围广',
    price: 20,
    type: 'weapon',
    icon: '💥',
    color: 0xff9800,
  },
  {
    id: 'weapon_laser',
    name: '离子光束',
    description: '高速穿透，连续伤害',
    price: 35,
    type: 'weapon',
    icon: '⚡',
    color: 0x00e5ff,
  },
  {
    id: 'weapon_machinegun',
    name: '机枪',
    description: '超高射速，持续火力',
    price: 40,
    type: 'weapon',
    icon: '🔫',
    color: 0xe0e0e0,
  },
  {
    id: 'weapon_fireball',
    name: '火球发射器',
    description: '命中后爆炸，范围伤害',
    price: 50,
    type: 'weapon',
    icon: '🔥',
    color: 0xff5722,
  },
  {
    id: 'weapon_plasma',
    name: '等离子炮',
    description: '高能等离子球，大范围爆炸',
    price: 75,
    type: 'weapon',
    icon: '💎',
    color: 0xb070e0,
  },
  {
    id: 'weapon_quantum',
    name: '量子分解器',
    description: '终极武器，对Boss伤害+50%',
    price: 120,
    type: 'weapon',
    icon: '✨',
    color: 0xffa000,
  },
  {
    id: 'weapon_gravity',
    name: '引力场发生器',
    description: '产生微型黑洞，吸引并伤害敌人',
    price: 100,
    type: 'weapon',
    icon: '🌀',
    color: 0xff4040,
  },
  {
    id: 'weapon_timeslow',
    name: '时间减速器',
    description: '击中敌人后减速50%',
    price: 80,
    type: 'weapon',
    icon: '⏳',
    color: 0xb088c8,
  },

  // Power-ups (consumable purchases)
  {
    id: 'powerup_shield',
    name: '能量护盾',
    description: '抵挡一次伤害',
    price: 8,
    type: 'powerup',
    icon: '🛡️',
    color: 0x4fc3f7,
  },
  {
    id: 'powerup_magnet',
    name: '碎片磁铁',
    description: '自动吸附碎片，持续8秒',
    price: 6,
    type: 'powerup',
    icon: '🧲',
    color: 0xff9800,
  },
  {
    id: 'powerup_slowtime',
    name: '缓时装置',
    description: '速度减半，持续5秒',
    price: 10,
    type: 'powerup',
    icon: '⏳',
    color: 0xce93d8,
  },
  {
    id: 'powerup_boostboots',
    name: '强化靴',
    description: '跳跃力×1.5，持续8秒',
    price: 8,
    type: 'powerup',
    icon: '👢',
    color: 0x66bb6a,
  },
  {
    id: 'powerup_xray',
    name: '透视镜',
    description: '显示隐藏平台和道具',
    price: 12,
    type: 'powerup',
    icon: '👓',
    color: 0x80ff80,
  },

  // Consumables
  {
    id: 'consumable_heal',
    name: '生命药剂',
    description: '恢复30%生命值',
    price: 5,
    type: 'consumable',
    icon: '❤️',
    color: 0xff4040,
  },
  {
    id: 'consumable_fullheal',
    name: '完全恢复药剂',
    description: '恢复100%生命值',
    price: 15,
    type: 'consumable',
    icon: '💖',
    color: 0xff8080,
  },
  {
    id: 'consumable_energy',
    name: '能量电池',
    description: '恢复50%能量',
    price: 4,
    type: 'consumable',
    icon: '🔋',
    color: 0x6bb8e8,
  },
  {
    id: 'consumable_revive',
    name: '复活币',
    description: '死亡时自动复活，恢复50%生命',
    price: 25,
    type: 'consumable',
    icon: '🪙',
    color: 0xffc800,
  },
];

export function getShopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === id);
}

export function getShopItemsByType(type: ShopItem['type']): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.type === type);
}

export function getCharacterShopItems(): ShopItem[] {
  return getShopItemsByType('character');
}

export function getWeaponShopItems(): ShopItem[] {
  return getShopItemsByType('weapon');
}

export function getPowerUpShopItems(): ShopItem[] {
  return getShopItemsByType('powerup');
}

export function getConsumableShopItems(): ShopItem[] {
  return getShopItemsByType('consumable');
}