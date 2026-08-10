// Ported from CharacterType.kt
export type CharacterAbilityType = 'energy_dash' | 'precise_landing' | 'void_shift' | 'propulsion' | null;

export interface CharacterAbility {
  type: CharacterAbilityType;
  name: string;
  description: string;
  cooldown: number;  // ms, 0 = passive/no cooldown
  duration: number;  // ms, 0 = instant
}

export interface CharacterDef {
  id: number;
  displayName: string;
  subtitle: string;
  jumpMultiplier: number;
  speedMultiplier: number;
  specialAbility: string | null;
  ability: CharacterAbility;  // 结构化能力定义（供逻辑层使用）
  unlockCost: number;
  bodyColor: string;
  accentColor: string;
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  glowColor: string;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 0,
    displayName: '凌',
    subtitle: '人类精英特工',
    jumpMultiplier: 1.0,
    speedMultiplier: 1.0,
    specialAbility: '能量冲刺',
    ability: {
      type: 'energy_dash',
      name: '能量冲刺',
      description: '短距离高速冲刺，可穿越障碍物',
      cooldown: 3000,
      duration: 400,
    },
    unlockCost: 0,
    bodyColor: '#1e3550',
    accentColor: '#3a5575',
    skinColor: '#e8c8a0',
    hairColor: '#1a2a40',
    eyeColor: '#2a5580',
    glowColor: '#6bb8e8',
  },
  {
    id: 1,
    displayName: '零号',
    subtitle: 'AI 战斗义体',
    jumpMultiplier: 1.0,
    speedMultiplier: 1.0,
    specialAbility: '精准着陆',
    ability: {
      type: 'precise_landing',
      name: '精准着陆',
      description: '落地时展开吸附场，减少滑行',
      cooldown: 0,
      duration: 0,
    },
    unlockCost: 30,
    bodyColor: '#c0c0c0',
    accentColor: '#e0e0e0',
    skinColor: '#d0d0d0',
    hairColor: '#a0a0a0',
    eyeColor: '#00aaff',
    glowColor: '#00aaff',
  },
  {
    id: 2,
    displayName: '艾珂',
    subtitle: '外星混血',
    jumpMultiplier: 1.08,
    speedMultiplier: 1.0,
    specialAbility: '虚空跃迁',
    ability: {
      type: 'void_shift',
      name: '虚空跃迁',
      description: '瞬间传送到前方短距离，可穿越障碍物',
      cooldown: 4000,
      duration: 0,
    },
    unlockCost: 60,
    bodyColor: '#4a2080',
    accentColor: '#7040b0',
    skinColor: '#c8a0d8',
    hairColor: '#e0e0e0',
    eyeColor: '#b060e0',
    glowColor: '#b060e0',
  },
  {
    id: 3,
    displayName: '疾风',
    subtitle: '改造人战士',
    jumpMultiplier: 1.0,
    speedMultiplier: 1.08,
    specialAbility: '推进冲刺',
    ability: {
      type: 'propulsion',
      name: '推进冲刺',
      description: '启动全身推进器，移动速度提升50%',
      cooldown: 5000,
      duration: 3000,
    },
    unlockCost: 100,
    bodyColor: '#3a2a10',
    accentColor: '#8a6a20',
    skinColor: '#d0b888',
    hairColor: '#2a1a08',
    eyeColor: '#ff3030',
    glowColor: '#ff6030',
  },
];

export function getCharacterById(id: number): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}
