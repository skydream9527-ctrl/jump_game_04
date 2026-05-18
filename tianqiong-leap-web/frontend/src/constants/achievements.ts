export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string; // human-readable
}

export const ACHIEVEMENTS: Achievement[] = [
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
];
