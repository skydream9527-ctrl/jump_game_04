// Ported from CharacterType.kt
export interface CharacterDef {
  id: number;
  displayName: string;
  subtitle: string;
  jumpMultiplier: number;
  speedMultiplier: number;
  specialAbility: string | null;
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
    specialAbility: null,
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
    specialAbility: null,
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
    specialAbility: null,
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
