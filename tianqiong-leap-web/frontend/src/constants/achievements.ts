export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string; // human-readable
}

export const ACHIEVEMENTS: Achievement[] = [
  // 基础成就
  { id: 'first_clear', name: '初出茅庐', description: '首次通关任意关卡', icon: '🎯', condition: '通关1关' },
  { id: 'chapter1_clear', name: '地球守护者', description: '通关第1章全部关卡', icon: '🌍', condition: '通关第1章' },
  { id: 'all_shards', name: '碎片大师', description: '单关收集全部3个碎片', icon: '⭐', condition: '单关3碎片' },
  { id: 'no_damage', name: '完美通关', description: '无伤通关任意关卡', icon: '💎', condition: '无伤通关' },
  { id: 'boss_slayer', name: 'Boss猎人', description: '击败任意Boss', icon: '👑', condition: '击败Boss' },
  { id: 'speed_run', name: '疾风行者', description: '30秒内通关任意关卡', icon: '⚡', condition: '30秒通关' },
  { id: 'ninja_master', name: '忍术大师', description: '使用忍术击败10个敌人', icon: '🌀', condition: '忍术杀敌10' },
  { id: 'collector', name: '收藏家', description: '累计收集50个碎片', icon: '📦', condition: '累计50碎片' },
  { id: 'survivor', name: '不死之身', description: '连续通关5关不死亡', icon: '💀', condition: '连续5关不死' },
  { id: 'explorer', name: '星际探索者', description: '解锁全部10个章节', icon: '🚀', condition: '解锁10章' },

  // 章节通关成就
  { id: 'chapter2_clear', name: '月球征服者', description: '通关第2章全部关卡', icon: '🌙', condition: '通关第2章' },
  { id: 'chapter3_clear', name: '火星先锋', description: '通关第3章全部关卡', icon: '🔴', condition: '通关第3章' },
  { id: 'chapter4_clear', name: '水银行者', description: '通关第4章全部关卡', icon: '🪙', condition: '通关第4章' },
  { id: 'chapter5_clear', name: '冰霜征服者', description: '通关第5章全部关卡', icon: '❄️', condition: '通关第5章' },
  { id: 'chapter6_clear', name: '烈焰战士', description: '通关第6章全部关卡', icon: '🔥', condition: '通关第6章' },
  { id: 'chapter7_clear', name: '雷霆使者', description: '通关第7章全部关卡', icon: '⚡', condition: '通关第7章' },
  { id: 'chapter8_clear', name: '丛林守护者', description: '通关第8章全部关卡', icon: '🌿', condition: '通关第8章' },
  { id: 'chapter9_clear', name: '晶体猎手', description: '通关第9章全部关卡', icon: '💎', condition: '通关第9章' },
  { id: 'chapter10_clear', name: '天穹英雄', description: '通关第10章全部关卡', icon: '🏆', condition: '通关第10章' },

  // Boss击杀成就
  { id: 'boss_1', name: '钢铁破坏者', description: '击败钢铁巨像', icon: '🤖', condition: '击败第1章Boss' },
  { id: 'boss_2', name: '月震终结者', description: '击败月震虫', icon: '🐛', condition: '击败第2章Boss' },
  { id: 'boss_3', name: '沙漠猎手', description: '击败沙暴巨蝎', icon: '🦂', condition: '击败第3章Boss' },
  { id: 'boss_4', name: '水银克星', description: '击败水银巨灵', icon: '👻', condition: '击败第4章Boss' },
  { id: 'boss_5', name: '冰龙屠夫', description: '击败霜暴龙', icon: '🐉', condition: '击败第5章Boss' },
  { id: 'boss_6', name: '火山征服者', description: '击败熔岩领主', icon: '🌋', condition: '击败第6章Boss' },
  { id: 'boss_7', name: '雷电掌控者', description: '击败雷霆守卫', icon: '⚡', condition: '击败第7章Boss' },
  { id: 'boss_8', name: '丛林之心', description: '击败巨树之心', icon: '🌳', condition: '击败第8章Boss' },
  { id: 'boss_9', name: '棱镜破碎者', description: '击败棱镜巨像', icon: '💎', condition: '击败第9章Boss' },
  { id: 'boss_10', name: '暗物质拯救者', description: '击败暗物质核心，拯救天穹', icon: '🔮', condition: '击败第10章Boss' },

  // 收集成就
  { id: 'collector_100', name: '碎片收藏家', description: '累计收集100个碎片', icon: '💰', condition: '累计100碎片' },
  { id: 'collector_500', name: '碎片大亨', description: '累计收集500个碎片', icon: '💎', condition: '累计500碎片' },
  { id: 'collector_1000', name: '碎片之王', description: '累计收集1000个碎片', icon: '👑', condition: '累计1000碎片' },

  // 角色成就
  { id: 'unlock_zero', name: 'AI觉醒', description: '解锁角色零号', icon: '🤖', condition: '解锁零号' },
  { id: 'unlock_echo', name: '混血之力', description: '解锁角色艾珂', icon: '🧝‍♀️', condition: '解锁艾珂' },
  { id: 'unlock_gale', name: '机械之心', description: '解锁角色疾风', icon: '🦾', condition: '解锁疾风' },

  // 战斗成就
  { id: 'kill_100', name: '百人斩', description: '累计击败100个敌人', icon: '⚔️', condition: '击败100敌人' },
  { id: 'kill_500', name: '千人斩', description: '累计击败500个敌人', icon: '🗡️', condition: '击败500敌人' },
  { id: 'kill_1000', name: '万人敌', description: '累计击败1000个敌人', icon: '🔱', condition: '击败1000敌人' },

  // 特殊成就
  { id: 'all_bosses', name: 'Boss征服者', description: '击败全部10个Boss', icon: '🏆', condition: '击败全部Boss' },
  { id: 'all_characters', name: '角色大师', description: '解锁全部4个角色', icon: '👥', condition: '解锁全部角色' },
  { id: 'all_stars', name: '完美主义者', description: '获得全部关卡3星评价', icon: '⭐', condition: '全部3星' },
  { id: 'speed_demon', name: '速度恶魔', description: '20秒内通关任意关卡', icon: '💨', condition: '20秒通关' },
  { id: 'high_score', name: '分数之王', description: '单关获得10000分以上', icon: '📊', condition: '单关10000分' },
];
