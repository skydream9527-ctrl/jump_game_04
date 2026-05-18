// Ported from LevelConfig.kt
export interface LevelConfig {
  chapter: number;
  level: number;
  targetDistance: number;
  shardCount: number;
  platformGapMultiplier: number;
  speedMultiplier: number;
}

export interface ChapterData {
  chapter: number;
  name: string;
  theme: string;
  color: number;
  skyColors: string[];
  platformTopColor: string;
  platformBodyColor: string;
  groundColor: string;
  gravityMultiplier: number;
}

export const CHAPTER_NAMES: Record<number, string> = {
  1: '荒废地球',
  2: '月球基地',
  3: '火星殖民地',
  4: '水银星',
  5: '冰封星',
  6: '火焰星球',
  7: '雷电星球',
  8: '丛林星',
  9: '晶体星',
  10: '暗物质领域',
};

export const CHAPTER_DATA: ChapterData[] = [
  { chapter: 1, name: '荒废地球', theme: '教学关', color: 0x8b7355, skyColors: ['#4a5568', '#2d3748'], platformTopColor: '#6b7280', platformBodyColor: '#4a5568', groundColor: '#2d3748', gravityMultiplier: 1.0 },
  { chapter: 2, name: '月球基地', theme: '低重力', color: 0x9e9e9e, skyColors: ['#0a0a0a', '#1a1a2e'], platformTopColor: '#c0c0c0', platformBodyColor: '#a0a0a0', groundColor: '#d0d0d0', gravityMultiplier: 0.67 },
  { chapter: 3, name: '火星殖民地', theme: '沙尘暴', color: 0xbf5b3b, skyColors: ['#c06030', '#803020'], platformTopColor: '#c07040', platformBodyColor: '#8a4020', groundColor: '#a05030', gravityMultiplier: 1.0 },
  { chapter: 4, name: '水银星', theme: '液态金属', color: 0xc0c0c0, skyColors: ['#4a4a5a', '#2a2a3a'], platformTopColor: '#b0b8c8', platformBodyColor: '#808898', groundColor: '#c0c0d0', gravityMultiplier: 1.0 },
  { chapter: 5, name: '冰封星', theme: '冰面滑动', color: 0x6bb8d6, skyColors: ['#1a3050', '#0a1830'], platformTopColor: '#b0e0f0', platformBodyColor: '#70a0c0', groundColor: '#a0d0e0', gravityMultiplier: 1.0 },
  { chapter: 6, name: '火焰星球', theme: '融化平台', color: 0xd44a2e, skyColors: ['#4a1000', '#2a0800'], platformTopColor: '#8a4020', platformBodyColor: '#602010', groundColor: '#ff3000', gravityMultiplier: 1.0 },
  { chapter: 7, name: '雷电星球', theme: '闪电攻击', color: 0x8b5cf6, skyColors: ['#2a1050', '#1a0830'], platformTopColor: '#6040a0', platformBodyColor: '#402080', groundColor: '#3a2060', gravityMultiplier: 1.0 },
  { chapter: 8, name: '丛林星', theme: '藤蔓生长', color: 0x4caf50, skyColors: ['#103010', '#0a200a'], platformTopColor: '#40a040', platformBodyColor: '#206020', groundColor: '#204020', gravityMultiplier: 1.0 },
  { chapter: 9, name: '晶体星', theme: '隐形平台', color: 0xff69b4, skyColors: ['#301050', '#200838'], platformTopColor: '#a080e0', platformBodyColor: '#6040a0', groundColor: '#8060c0', gravityMultiplier: 1.0 },
  { chapter: 10, name: '暗物质领域', theme: '黑暗区域', color: 0x6b21a8, skyColors: ['#0a0010', '#1a0830'], platformTopColor: '#3a2060', platformBodyColor: '#2a1040', groundColor: '#1a0830', gravityMultiplier: 1.0 },
];

export function getChapterData(chapter: number): ChapterData {
  return CHAPTER_DATA[chapter - 1] ?? CHAPTER_DATA[0];
}

export function getLevelConfig(chapter: number, level: number): LevelConfig {
  const baseDistance = 3000 + level * 800;
  const chapterScale = 1 + (chapter - 1) * 0.15;
  return {
    chapter,
    level,
    targetDistance: baseDistance * chapterScale,
    shardCount: 3,
    platformGapMultiplier: 1 + (chapter - 1) * 0.05 + level * 0.02,
    speedMultiplier: 1 + (chapter - 1) * 0.03,
  };
}

export function getLevelIndex(chapter: number, level: number): number {
  return (chapter - 1) * 10 + level - 1;
}

export function getLevelDisplayName(chapter: number, level: number): string {
  const chapterName = CHAPTER_NAMES[chapter] ?? '未知';
  return `第${chapter}章 · ${chapterName} — 第${level}关`;
}

export function isBossLevel(level: number): boolean {
  return level === 10;
}
