// 塞尔达风格道具系统 — 永久道具 + 消耗道具

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemCategory = 'consumable' | 'equipment' | 'relic' | 'charm';

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  price: number;
  icon: string;
  color: number;
  maxStack: number;
  effect: ItemEffect;
}

export interface ItemEffect {
  type: 'passive' | 'active' | 'on_hit' | 'on_jump' | 'on_kill' | 'on_collect' | 'on_land';
  stat?: string;
  value?: number;
  duration?: number;
  description: string;
}

export const RARITY_COLORS: Record<ItemRarity, number> = {
  common: 0x9e9e9e,
  uncommon: 0x4caf50,
  rare: 0x2196f3,
  epic: 0x9c27b0,
  legendary: 0xff9800,
};

export const RARITY_NAMES: Record<ItemRarity, string> = {
  common: '普通',
  uncommon: '精良',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const ITEMS: ItemDef[] = [
  // ═══════════ 消耗道具 ═══════════
  {
    id: 'potion_hp',
    name: '生命药水',
    description: '恢复 1 条生命',
    category: 'consumable',
    rarity: 'common',
    price: 5,
    icon: '🧪',
    color: 0xe91e63,
    maxStack: 5,
    effect: { type: 'active', stat: 'lives', value: 1, description: '恢复 1 条生命' },
  },
  {
    id: 'potion_shield',
    name: '铁壁药水',
    description: '开局获得护盾，抵挡一次伤害',
    category: 'consumable',
    rarity: 'uncommon',
    price: 8,
    icon: '🛡️',
    color: 0x4fc3f7,
    maxStack: 3,
    effect: { type: 'active', stat: 'shield', value: 1, description: '开局自带护盾' },
  },
  {
    id: 'bomb',
    name: '炸弹',
    description: '炸毁前方 300px 内所有敌人',
    category: 'consumable',
    rarity: 'uncommon',
    price: 10,
    icon: '💣',
    color: 0xff5722,
    maxStack: 3,
    effect: { type: 'active', stat: 'bomb_range', value: 300, description: '炸毁前方敌人' },
  },
  {
    id: 'arrow_light',
    name: '光之箭',
    description: '发射一束穿透光线，伤害全屏敌人 2 点',
    category: 'consumable',
    rarity: 'rare',
    price: 15,
    icon: '🏹',
    color: 0xffeb3b,
    maxStack: 2,
    effect: { type: 'active', stat: 'light_arrow', value: 2, description: '穿透光线全屏伤害' },
  },
  {
    id: 'fairy',
    name: '精灵之泪',
    description: '死亡时自动复活，恢复全部生命',
    category: 'consumable',
    rarity: 'epic',
    price: 25,
    icon: '🧚',
    color: 0xe040fb,
    maxStack: 1,
    effect: { type: 'passive', stat: 'revive', value: 1, description: '死亡时自动复活' },
  },
  {
    id: 'deku_nut',
    name: '德库坚果',
    description: '投掷后眩晕范围内敌人 3 秒',
    category: 'consumable',
    rarity: 'common',
    price: 3,
    icon: '🥜',
    color: 0x8d6e63,
    maxStack: 5,
    effect: { type: 'active', stat: 'stun', value: 3000, description: '眩晕敌人 3 秒' },
  },

  // ═══════════ 装备道具（永久） ═══════════
  {
    id: 'boots_speed',
    name: '疾风之靴',
    description: '移动速度永久 +5%',
    category: 'equipment',
    rarity: 'uncommon',
    price: 20,
    icon: '👢',
    color: 0x66bb6a,
    maxStack: 1,
    effect: { type: 'passive', stat: 'speed', value: 0.05, description: '移动速度 +5%' },
  },
  {
    id: 'boots_jump',
    name: '弹跳之靴',
    description: '跳跃力永久 +5%',
    category: 'equipment',
    rarity: 'uncommon',
    price: 20,
    icon: '🥾',
    color: 0x42a5f5,
    maxStack: 1,
    effect: { type: 'passive', stat: 'jump', value: 0.05, description: '跳跃力 +5%' },
  },
  {
    id: 'armor_light',
    name: '光之铠甲',
    description: '受到伤害时 20% 概率免疫',
    category: 'equipment',
    rarity: 'rare',
    price: 30,
    icon: '⚔️',
    color: 0xffd700,
    maxStack: 1,
    effect: { type: 'passive', stat: 'damage_reduce', value: 0.20, description: '20% 概率免疫伤害' },
  },
  {
    id: 'gauntlet_power',
    name: '力量手套',
    description: '踩踏敌人伤害 +1',
    category: 'equipment',
    rarity: 'uncommon',
    price: 18,
    icon: '🧤',
    color: 0xff7043,
    maxStack: 1,
    effect: { type: 'passive', stat: 'stomp_damage', value: 1, description: '踩踏伤害 +1' },
  },
  {
    id: 'cloak_invisible',
    name: '隐身斗篷',
    description: '开局 5 秒内敌人不主动攻击',
    category: 'equipment',
    rarity: 'rare',
    price: 35,
    icon: '🧥',
    color: 0x78909c,
    maxStack: 1,
    effect: { type: 'passive', stat: 'stealth', value: 5000, description: '开局隐身 5 秒' },
  },
  {
    id: 'ring_magnet',
    name: '磁力戒指',
    description: '碎片吸附范围永久扩大 50%',
    category: 'equipment',
    rarity: 'uncommon',
    price: 15,
    icon: '💍',
    color: 0xff9800,
    maxStack: 1,
    effect: { type: 'passive', stat: 'magnet_range', value: 0.5, description: '碎片吸附范围 +50%' },
  },

  // ═══════════ 遗物道具（永久，强力） ═══════════
  {
    id: 'triforce_courage',
    name: '勇气碎片',
    description: '生命值 ≤ 1 时，攻击力翻倍',
    category: 'relic',
    rarity: 'epic',
    price: 50,
    icon: '🔺',
    color: 0xff6d00,
    maxStack: 1,
    effect: { type: 'passive', stat: 'low_hp_power', value: 2, description: '低血量时攻击翻倍' },
  },
  {
    id: 'triforce_wisdom',
    name: '智慧碎片',
    description: '每收集 3 个碎片，获得 1 秒无敌',
    category: 'relic',
    rarity: 'epic',
    price: 50,
    icon: '🔷',
    color: 0x2979ff,
    maxStack: 1,
    effect: { type: 'on_collect', stat: 'invincible_on_collect', value: 1000, description: '收集碎片后短暂无敌' },
  },
  {
    id: 'triforce_power',
    name: '力量碎片',
    description: '消灭敌人后恢复 0.5 秒跳跃次数',
    category: 'relic',
    rarity: 'epic',
    price: 50,
    icon: '🔶',
    color: 0xd50000,
    maxStack: 1,
    effect: { type: 'on_kill', stat: 'refresh_jump', value: 1, description: '杀敌后重置跳跃' },
  },
  {
    id: 'master_sword',
    name: '大师之剑',
    description: '自动发射剑气，伤害 2，穿透',
    category: 'relic',
    rarity: 'legendary',
    price: 80,
    icon: '🗡️',
    color: 0x00e5ff,
    maxStack: 1,
    effect: { type: 'passive', stat: 'sword_beam', value: 2, description: '自动发射穿透剑气' },
  },
  {
    id: 'hylian_shield',
    name: '海利亚盾',
    description: '每 30 秒自动获得一次护盾',
    category: 'relic',
    rarity: 'legendary',
    price: 80,
    icon: '🛡️',
    color: 0x1565c0,
    maxStack: 1,
    effect: { type: 'passive', stat: 'auto_shield', value: 30000, description: '每 30 秒自动护盾' },
  },

  // ═══════════ 护符道具（永久，被动增益） ═══════════
  {
    id: 'charm_luck',
    name: '幸运护符',
    description: '道具掉落率 +30%',
    category: 'charm',
    rarity: 'uncommon',
    price: 12,
    icon: '🍀',
    color: 0x69f0ae,
    maxStack: 1,
    effect: { type: 'passive', stat: 'drop_rate', value: 0.30, description: '道具掉落率 +30%' },
  },
  {
    id: 'charm_greed',
    name: '贪婪护符',
    description: '通关时碎片奖励 +20%',
    category: 'charm',
    rarity: 'uncommon',
    price: 12,
    icon: '💰',
    color: 0xffd740,
    maxStack: 1,
    effect: { type: 'passive', stat: 'shard_bonus', value: 0.20, description: '碎片奖励 +20%' },
  },
  {
    id: 'charm_rage',
    name: '狂怒护符',
    description: '连续踩踏敌人时，每次伤害递增 +1',
    category: 'charm',
    rarity: 'rare',
    price: 25,
    icon: '🔥',
    color: 0xff3d00,
    maxStack: 1,
    effect: { type: 'passive', stat: 'combo_damage', value: 1, description: '连踩递增伤害' },
  },
  {
    id: 'charm_gravity',
    name: '引力护符',
    description: '二段跳后短暂滞空（慢下落 0.5 秒）',
    category: 'charm',
    rarity: 'rare',
    price: 28,
    icon: '🌀',
    color: 0x7c4dff,
    maxStack: 1,
    effect: { type: 'on_jump', stat: 'slow_fall', value: 500, description: '二段跳后慢下落' },
  },
  {
    id: 'charm_vampire',
    name: '吸血护符',
    description: '每消灭 5 个敌人，恢复 1 条生命',
    category: 'charm',
    rarity: 'epic',
    price: 40,
    icon: '🧛',
    color: 0xc62828,
    maxStack: 1,
    effect: { type: 'on_kill', stat: 'lifesteal', value: 5, description: '每杀 5 敌回血' },
  },
  {
    id: 'charm_time',
    name: '时间护符',
    description: '游戏速度永久 -3%',
    category: 'charm',
    rarity: 'legendary',
    price: 60,
    icon: '⏳',
    color: 0xb388ff,
    maxStack: 1,
    effect: { type: 'passive', stat: 'game_speed', value: -0.03, description: '游戏速度 -3%' },
  },
];

export function getItemById(id: string): ItemDef | undefined {
  return ITEMS.find(i => i.id === id);
}

export function getItemsByCategory(category: ItemCategory): ItemDef[] {
  return ITEMS.filter(i => i.category === category);
}

export function getItemsByRarity(rarity: ItemRarity): ItemDef[] {
  return ITEMS.filter(i => i.rarity === rarity);
}

export const MAX_INVENTORY_SIZE = 20;
export const MAX_EQUIPPED_ITEMS = 3;
