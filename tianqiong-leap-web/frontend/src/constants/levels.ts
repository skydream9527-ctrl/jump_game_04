// Ported from LevelConfig.kt
export interface LevelConfig {
  chapter: number;
  level: number;
  targetDistance: number;
  shardCount: number;
  platformGapMultiplier: number;
  speedMultiplier: number;
  enemySpawnChance?: number;
  enemyTypes?: Partial<Record<import('./enemies').EnemyType, number>>;
  shardPlatformIndices?: number[];
  isBossLevel?: boolean;
  initialPlatformCount?: number;
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
  mountainColor: number;
  cloudColor: number;
  starColor: number;
  decorAccent: number;
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
  { chapter: 1, name: '荒废地球', theme: '教学关', color: 0x8b7355, skyColors: ['#4a5568', '#2d3748'], platformTopColor: '#6b7280', platformBodyColor: '#4a5568', groundColor: '#2d3748', gravityMultiplier: 1.0, mountainColor: 0x2d3748, cloudColor: 0x4a5568, starColor: 0xffffff, decorAccent: 0x4b5563 },
  { chapter: 2, name: '月球基地', theme: '低重力', color: 0x9e9e9e, skyColors: ['#0a0a0a', '#1a1a2e'], platformTopColor: '#c0c0c0', platformBodyColor: '#a0a0a0', groundColor: '#d0d0d0', gravityMultiplier: 0.67, mountainColor: 0, cloudColor: 0, starColor: 0xffffff, decorAccent: 0xc0c0c0 },
  { chapter: 3, name: '火星殖民地', theme: '沙尘暴', color: 0xbf5b3b, skyColors: ['#c06030', '#803020'], platformTopColor: '#c07040', platformBodyColor: '#8a4020', groundColor: '#a05030', gravityMultiplier: 1.0, mountainColor: 0x8a4020, cloudColor: 0, starColor: 0xffffff, decorAccent: 0xd08050 },
  { chapter: 4, name: '水银星', theme: '液态金属', color: 0xc0c0c0, skyColors: ['#4a4a5a', '#2a2a3a'], platformTopColor: '#b0b8c8', platformBodyColor: '#808898', groundColor: '#c0c0d0', gravityMultiplier: 1.0, mountainColor: 0x4a5262, cloudColor: 0, starColor: 0xffffff, decorAccent: 0x8a92a2 },
  { chapter: 5, name: '冰封星', theme: '冰面滑动', color: 0x6bb8d6, skyColors: ['#1a3050', '#0a1830'], platformTopColor: '#b0e0f0', platformBodyColor: '#70a0c0', groundColor: '#a0d0e0', gravityMultiplier: 1.0, mountainColor: 0x3a6898, cloudColor: 0, starColor: 0xffffff, decorAccent: 0x64ffda },
  { chapter: 6, name: '火焰星球', theme: '融化平台', color: 0xd44a2e, skyColors: ['#4a1000', '#2a0800'], platformTopColor: '#8a4020', platformBodyColor: '#602010', groundColor: '#ff3000', gravityMultiplier: 1.0, mountainColor: 0x3a1810, cloudColor: 0x804030, starColor: 0xffcc80, decorAccent: 0xff6020 },
  { chapter: 7, name: '雷电星球', theme: '闪电攻击', color: 0x8b5cf6, skyColors: ['#2a1050', '#1a0830'], platformTopColor: '#6040a0', platformBodyColor: '#402080', groundColor: '#3a2060', gravityMultiplier: 1.0, mountainColor: 0x1a1a3a, cloudColor: 0x1a1a45, starColor: 0xffffff, decorAccent: 0x5a8aee },
  { chapter: 8, name: '丛林星', theme: '藤蔓生长', color: 0x4caf50, skyColors: ['#103010', '#0a200a'], platformTopColor: '#40a040', platformBodyColor: '#206020', groundColor: '#204020', gravityMultiplier: 1.0, mountainColor: 0x1a3a1a, cloudColor: 0x0c1a0c, starColor: 0xffffff, decorAccent: 0x80ff80 },
  { chapter: 9, name: '晶体星', theme: '隐形平台', color: 0xff69b4, skyColors: ['#301050', '#200838'], platformTopColor: '#a080e0', platformBodyColor: '#6040a0', groundColor: '#8060c0', gravityMultiplier: 1.0, mountainColor: 0x2a1850, cloudColor: 0, starColor: 0xd0c0ff, decorAccent: 0xb388ff },
  { chapter: 10, name: '暗物质领域', theme: '黑暗区域', color: 0x6b21a8, skyColors: ['#0a0010', '#1a0830'], platformTopColor: '#3a2060', platformBodyColor: '#2a1040', groundColor: '#1a0830', gravityMultiplier: 1.0, mountainColor: 0, cloudColor: 0, starColor: 0xd0c0ff, decorAccent: 0xa050ff },
];

export const CHAPTER_1_LEVELS: LevelConfig[] = [
  { chapter:1, level:1, targetDistance:3800, shardCount:3, platformGapMultiplier:1.00, speedMultiplier:1.00, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,4,6], initialPlatformCount:10 },
  { chapter:1, level:2, targetDistance:4600, shardCount:3, platformGapMultiplier:1.02, speedMultiplier:1.00, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,5,8], initialPlatformCount:10 },
  { chapter:1, level:3, targetDistance:5400, shardCount:3, platformGapMultiplier:1.04, speedMultiplier:1.00, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,5,8], initialPlatformCount:10 },
  { chapter:1, level:4, targetDistance:6200, shardCount:3, platformGapMultiplier:1.06, speedMultiplier:1.00, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,7,10], initialPlatformCount:10 },
  { chapter:1, level:5, targetDistance:7000, shardCount:3, platformGapMultiplier:1.08, speedMultiplier:1.00, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,6,10], initialPlatformCount:10 },
  { chapter:1, level:6, targetDistance:7800, shardCount:3, platformGapMultiplier:1.10, speedMultiplier:1.01, enemySpawnChance:0.10, enemyTypes:{ground:0.75,flyer:0.25}, shardPlatformIndices:[2,7,11], initialPlatformCount:10 },
  { chapter:1, level:7, targetDistance:8600, shardCount:3, platformGapMultiplier:1.12, speedMultiplier:1.02, enemySpawnChance:0.10, enemyTypes:{ground:0.60,flyer:0.20,shooter:0.20}, shardPlatformIndices:[3,7,12], initialPlatformCount:10 },
  { chapter:1, level:8, targetDistance:9400, shardCount:3, platformGapMultiplier:1.14, speedMultiplier:1.02, enemySpawnChance:0.12, enemyTypes:{ground:0.50,flyer:0.30,shooter:0.20}, shardPlatformIndices:[4,8,13], initialPlatformCount:10 },
  { chapter:1, level:9, targetDistance:10200, shardCount:3, platformGapMultiplier:1.16, speedMultiplier:1.03, enemySpawnChance:0.14, enemyTypes:{ground:0.45,flyer:0.30,shooter:0.25}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:1, level:10, targetDistance:11000, shardCount:3, platformGapMultiplier:1.18, speedMultiplier:1.03, enemySpawnChance:0.12, enemyTypes:{ground:0.50,flyer:0.30,shooter:0.20}, shardPlatformIndices:[3,7,14], isBossLevel:true, initialPlatformCount:10 },
];

export const CHAPTER_2_LEVELS: LevelConfig[] = [
  { chapter:2, level:1, targetDistance:4600, shardCount:3, platformGapMultiplier:1.06, speedMultiplier:1.15, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,5,8], initialPlatformCount:10 },
  { chapter:2, level:2, targetDistance:5400, shardCount:3, platformGapMultiplier:1.08, speedMultiplier:1.15, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,6,9], initialPlatformCount:10 },
  { chapter:2, level:3, targetDistance:6200, shardCount:3, platformGapMultiplier:1.10, speedMultiplier:1.15, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,6,9], initialPlatformCount:10 },
  { chapter:2, level:4, targetDistance:7150, shardCount:3, platformGapMultiplier:1.12, speedMultiplier:1.15, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,10], initialPlatformCount:10 },
  { chapter:2, level:5, targetDistance:8100, shardCount:3, platformGapMultiplier:1.14, speedMultiplier:1.16, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:2, level:6, targetDistance:9050, shardCount:3, platformGapMultiplier:1.16, speedMultiplier:1.17, enemySpawnChance:0.10, enemyTypes:{ground:0.65,flyer:0.35}, shardPlatformIndices:[3,8,12], initialPlatformCount:10 },
  { chapter:2, level:7, targetDistance:10000, shardCount:3, platformGapMultiplier:1.18, speedMultiplier:1.18, enemySpawnChance:0.10, enemyTypes:{ground:0.50,flyer:0.50}, shardPlatformIndices:[3,8,13], initialPlatformCount:10 },
  { chapter:2, level:8, targetDistance:10950, shardCount:3, platformGapMultiplier:1.20, speedMultiplier:1.19, enemySpawnChance:0.12, enemyTypes:{ground:0.40,flyer:0.40,shooter:0.20}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:2, level:9, targetDistance:11900, shardCount:3, platformGapMultiplier:1.22, speedMultiplier:1.20, enemySpawnChance:0.12, enemyTypes:{ground:0.40,flyer:0.35,shooter:0.25}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:2, level:10, targetDistance:12650, shardCount:3, platformGapMultiplier:1.24, speedMultiplier:1.20, enemySpawnChance:0.10, enemyTypes:{ground:0.45,flyer:0.35,shooter:0.20}, shardPlatformIndices:[3,8,14], isBossLevel:true, initialPlatformCount:10 },
];

export const CHAPTER_3_LEVELS: LevelConfig[] = [
  { chapter:3, level:1, targetDistance:5550, shardCount:3, platformGapMultiplier:1.10, speedMultiplier:1.30, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,5,8], initialPlatformCount:10 },
  { chapter:3, level:2, targetDistance:6500, shardCount:3, platformGapMultiplier:1.12, speedMultiplier:1.30, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,6,9], initialPlatformCount:10 },
  { chapter:3, level:3, targetDistance:7450, shardCount:3, platformGapMultiplier:1.14, speedMultiplier:1.30, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,6,9], initialPlatformCount:10 },
  { chapter:3, level:4, targetDistance:8550, shardCount:3, platformGapMultiplier:1.16, speedMultiplier:1.31, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:3, level:5, targetDistance:9650, shardCount:3, platformGapMultiplier:1.18, speedMultiplier:1.32, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:3, level:6, targetDistance:10750, shardCount:3, platformGapMultiplier:1.20, speedMultiplier:1.33, enemySpawnChance:0.10, enemyTypes:{ground:0.65,flyer:0.35}, shardPlatformIndices:[3,8,12], initialPlatformCount:10 },
  { chapter:3, level:7, targetDistance:11850, shardCount:3, platformGapMultiplier:1.22, speedMultiplier:1.34, enemySpawnChance:0.10, enemyTypes:{ground:0.50,flyer:0.50}, shardPlatformIndices:[3,8,13], initialPlatformCount:10 },
  { chapter:3, level:8, targetDistance:12950, shardCount:3, platformGapMultiplier:1.24, speedMultiplier:1.35, enemySpawnChance:0.12, enemyTypes:{ground:0.40,flyer:0.35,shooter:0.25}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:3, level:9, targetDistance:14050, shardCount:3, platformGapMultiplier:1.26, speedMultiplier:1.36, enemySpawnChance:0.12, enemyTypes:{ground:0.40,flyer:0.35,shooter:0.25}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:3, level:10, targetDistance:15000, shardCount:3, platformGapMultiplier:1.28, speedMultiplier:1.36, enemySpawnChance:0.10, enemyTypes:{ground:0.45,flyer:0.35,shooter:0.20}, shardPlatformIndices:[3,8,14], isBossLevel:true, initialPlatformCount:10 },
];

export const CHAPTER_4_LEVELS: LevelConfig[] = [
  { chapter:4, level:1, targetDistance:6500, shardCount:3, platformGapMultiplier:1.15, speedMultiplier:1.45, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,5,8], initialPlatformCount:10 },
  { chapter:4, level:2, targetDistance:7600, shardCount:3, platformGapMultiplier:1.17, speedMultiplier:1.45, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,6,9], initialPlatformCount:10 },
  { chapter:4, level:3, targetDistance:8700, shardCount:3, platformGapMultiplier:1.19, speedMultiplier:1.45, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,7,10], initialPlatformCount:10 },
  { chapter:4, level:4, targetDistance:9950, shardCount:3, platformGapMultiplier:1.21, speedMultiplier:1.46, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:4, level:5, targetDistance:11200, shardCount:3, platformGapMultiplier:1.23, speedMultiplier:1.47, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:4, level:6, targetDistance:12450, shardCount:3, platformGapMultiplier:1.25, speedMultiplier:1.48, enemySpawnChance:0.10, enemyTypes:{ground:0.65,flyer:0.35}, shardPlatformIndices:[3,8,12], initialPlatformCount:10 },
  { chapter:4, level:7, targetDistance:13700, shardCount:3, platformGapMultiplier:1.27, speedMultiplier:1.49, enemySpawnChance:0.10, enemyTypes:{ground:0.50,flyer:0.50}, shardPlatformIndices:[3,8,13], initialPlatformCount:10 },
  { chapter:4, level:8, targetDistance:14950, shardCount:3, platformGapMultiplier:1.29, speedMultiplier:1.50, enemySpawnChance:0.12, enemyTypes:{ground:0.40,flyer:0.35,shooter:0.25}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:4, level:9, targetDistance:16200, shardCount:3, platformGapMultiplier:1.31, speedMultiplier:1.51, enemySpawnChance:0.12, enemyTypes:{ground:0.40,flyer:0.35,shooter:0.25}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:4, level:10, targetDistance:17300, shardCount:3, platformGapMultiplier:1.33, speedMultiplier:1.51, enemySpawnChance:0.10, enemyTypes:{ground:0.45,flyer:0.35,shooter:0.20}, shardPlatformIndices:[3,8,14], isBossLevel:true, initialPlatformCount:10 },
];

export const CHAPTER_5_LEVELS: LevelConfig[] = [
  { chapter:5, level:1, targetDistance:7450, shardCount:3, platformGapMultiplier:1.18, speedMultiplier:1.60, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,5,8], initialPlatformCount:10 },
  { chapter:5, level:2, targetDistance:8700, shardCount:3, platformGapMultiplier:1.20, speedMultiplier:1.60, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,6,9], initialPlatformCount:10 },
  { chapter:5, level:3, targetDistance:9950, shardCount:3, platformGapMultiplier:1.22, speedMultiplier:1.60, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,7,10], initialPlatformCount:10 },
  { chapter:5, level:4, targetDistance:11350, shardCount:3, platformGapMultiplier:1.24, speedMultiplier:1.61, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:5, level:5, targetDistance:12750, shardCount:3, platformGapMultiplier:1.26, speedMultiplier:1.62, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:5, level:6, targetDistance:14150, shardCount:3, platformGapMultiplier:1.28, speedMultiplier:1.63, enemySpawnChance:0.10, enemyTypes:{ground:0.60,flyer:0.40}, shardPlatformIndices:[3,8,12], initialPlatformCount:10 },
  { chapter:5, level:7, targetDistance:15550, shardCount:3, platformGapMultiplier:1.30, speedMultiplier:1.64, enemySpawnChance:0.10, enemyTypes:{ground:0.50,flyer:0.50}, shardPlatformIndices:[3,8,13], initialPlatformCount:10 },
  { chapter:5, level:8, targetDistance:16950, shardCount:3, platformGapMultiplier:1.32, speedMultiplier:1.65, enemySpawnChance:0.12, enemyTypes:{ground:0.40,flyer:0.35,shooter:0.25}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:5, level:9, targetDistance:18350, shardCount:3, platformGapMultiplier:1.34, speedMultiplier:1.66, enemySpawnChance:0.12, enemyTypes:{ground:0.40,flyer:0.35,shooter:0.25}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:5, level:10, targetDistance:19600, shardCount:3, platformGapMultiplier:1.36, speedMultiplier:1.66, enemySpawnChance:0.10, enemyTypes:{ground:0.45,flyer:0.35,shooter:0.20}, shardPlatformIndices:[3,8,14], isBossLevel:true, initialPlatformCount:10 },
];

export const CHAPTER_6_LEVELS: LevelConfig[] = [
  { chapter:6, level:1, targetDistance:8550, shardCount:3, platformGapMultiplier:1.20, speedMultiplier:1.75, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,5,8], initialPlatformCount:10 },
  { chapter:6, level:2, targetDistance:9950, shardCount:3, platformGapMultiplier:1.22, speedMultiplier:1.75, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,6,9], initialPlatformCount:10 },
  { chapter:6, level:3, targetDistance:11350, shardCount:3, platformGapMultiplier:1.24, speedMultiplier:1.75, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,7,10], initialPlatformCount:10 },
  { chapter:6, level:4, targetDistance:12900, shardCount:3, platformGapMultiplier:1.26, speedMultiplier:1.76, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:6, level:5, targetDistance:14450, shardCount:3, platformGapMultiplier:1.28, speedMultiplier:1.77, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:6, level:6, targetDistance:16000, shardCount:3, platformGapMultiplier:1.30, speedMultiplier:1.78, enemySpawnChance:0.10, enemyTypes:{ground:0.55,flyer:0.45}, shardPlatformIndices:[3,8,12], initialPlatformCount:10 },
  { chapter:6, level:7, targetDistance:17550, shardCount:3, platformGapMultiplier:1.32, speedMultiplier:1.79, enemySpawnChance:0.10, enemyTypes:{ground:0.45,flyer:0.55}, shardPlatformIndices:[3,8,13], initialPlatformCount:10 },
  { chapter:6, level:8, targetDistance:19100, shardCount:3, platformGapMultiplier:1.34, speedMultiplier:1.80, enemySpawnChance:0.12, enemyTypes:{ground:0.35,flyer:0.35,shooter:0.30}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:6, level:9, targetDistance:20650, shardCount:3, platformGapMultiplier:1.36, speedMultiplier:1.81, enemySpawnChance:0.12, enemyTypes:{ground:0.35,flyer:0.35,shooter:0.30}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:6, level:10, targetDistance:22000, shardCount:3, platformGapMultiplier:1.38, speedMultiplier:1.81, enemySpawnChance:0.10, enemyTypes:{ground:0.40,flyer:0.35,shooter:0.25}, shardPlatformIndices:[3,8,14], isBossLevel:true, initialPlatformCount:10 },
];

export const CHAPTER_7_LEVELS: LevelConfig[] = [
  { chapter:7, level:1, targetDistance:9800, shardCount:3, platformGapMultiplier:1.22, speedMultiplier:1.90, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,5,8], initialPlatformCount:10 },
  { chapter:7, level:2, targetDistance:11350, shardCount:3, platformGapMultiplier:1.24, speedMultiplier:1.90, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,6,9], initialPlatformCount:10 },
  { chapter:7, level:3, targetDistance:12900, shardCount:3, platformGapMultiplier:1.26, speedMultiplier:1.90, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,7,10], initialPlatformCount:10 },
  { chapter:7, level:4, targetDistance:14600, shardCount:3, platformGapMultiplier:1.28, speedMultiplier:1.91, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:7, level:5, targetDistance:16300, shardCount:3, platformGapMultiplier:1.30, speedMultiplier:1.92, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:7, level:6, targetDistance:18000, shardCount:3, platformGapMultiplier:1.32, speedMultiplier:1.93, enemySpawnChance:0.10, enemyTypes:{ground:0.50,flyer:0.50}, shardPlatformIndices:[3,8,12], initialPlatformCount:10 },
  { chapter:7, level:7, targetDistance:19700, shardCount:3, platformGapMultiplier:1.34, speedMultiplier:1.94, enemySpawnChance:0.10, enemyTypes:{ground:0.40,flyer:0.60}, shardPlatformIndices:[3,8,13], initialPlatformCount:10 },
  { chapter:7, level:8, targetDistance:21400, shardCount:3, platformGapMultiplier:1.36, speedMultiplier:1.95, enemySpawnChance:0.12, enemyTypes:{ground:0.30,flyer:0.35,shooter:0.35}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:7, level:9, targetDistance:23100, shardCount:3, platformGapMultiplier:1.38, speedMultiplier:1.96, enemySpawnChance:0.12, enemyTypes:{ground:0.30,flyer:0.35,shooter:0.35}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:7, level:10, targetDistance:24600, shardCount:3, platformGapMultiplier:1.40, speedMultiplier:1.96, enemySpawnChance:0.10, enemyTypes:{ground:0.35,flyer:0.35,shooter:0.30}, shardPlatformIndices:[3,8,14], isBossLevel:true, initialPlatformCount:10 },
];

export const CHAPTER_8_LEVELS: LevelConfig[] = [
  { chapter:8, level:1, targetDistance:11200, shardCount:3, platformGapMultiplier:1.24, speedMultiplier:2.05, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,5,8], initialPlatformCount:10 },
  { chapter:8, level:2, targetDistance:12950, shardCount:3, platformGapMultiplier:1.26, speedMultiplier:2.05, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,6,9], initialPlatformCount:10 },
  { chapter:8, level:3, targetDistance:14700, shardCount:3, platformGapMultiplier:1.28, speedMultiplier:2.05, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,7,10], initialPlatformCount:10 },
  { chapter:8, level:4, targetDistance:16600, shardCount:3, platformGapMultiplier:1.30, speedMultiplier:2.06, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:8, level:5, targetDistance:18500, shardCount:3, platformGapMultiplier:1.32, speedMultiplier:2.07, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:8, level:6, targetDistance:20400, shardCount:3, platformGapMultiplier:1.34, speedMultiplier:2.08, enemySpawnChance:0.10, enemyTypes:{ground:0.45,flyer:0.55}, shardPlatformIndices:[3,8,12], initialPlatformCount:10 },
  { chapter:8, level:7, targetDistance:22300, shardCount:3, platformGapMultiplier:1.36, speedMultiplier:2.09, enemySpawnChance:0.10, enemyTypes:{ground:0.35,flyer:0.65}, shardPlatformIndices:[3,8,13], initialPlatformCount:10 },
  { chapter:8, level:8, targetDistance:24200, shardCount:3, platformGapMultiplier:1.38, speedMultiplier:2.10, enemySpawnChance:0.12, enemyTypes:{ground:0.25,flyer:0.40,shooter:0.35}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:8, level:9, targetDistance:26100, shardCount:3, platformGapMultiplier:1.40, speedMultiplier:2.11, enemySpawnChance:0.12, enemyTypes:{ground:0.25,flyer:0.40,shooter:0.35}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:8, level:10, targetDistance:27800, shardCount:3, platformGapMultiplier:1.42, speedMultiplier:2.11, enemySpawnChance:0.10, enemyTypes:{ground:0.30,flyer:0.35,shooter:0.35}, shardPlatformIndices:[3,8,14], isBossLevel:true, initialPlatformCount:10 },
];

export const CHAPTER_9_LEVELS: LevelConfig[] = [
  { chapter:9, level:1, targetDistance:12750, shardCount:3, platformGapMultiplier:1.26, speedMultiplier:2.20, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,5,8], initialPlatformCount:10 },
  { chapter:9, level:2, targetDistance:14700, shardCount:3, platformGapMultiplier:1.28, speedMultiplier:2.20, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,6,9], initialPlatformCount:10 },
  { chapter:9, level:3, targetDistance:16650, shardCount:3, platformGapMultiplier:1.30, speedMultiplier:2.20, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,7,10], initialPlatformCount:10 },
  { chapter:9, level:4, targetDistance:18800, shardCount:3, platformGapMultiplier:1.32, speedMultiplier:2.21, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:9, level:5, targetDistance:20950, shardCount:3, platformGapMultiplier:1.34, speedMultiplier:2.22, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:9, level:6, targetDistance:23100, shardCount:3, platformGapMultiplier:1.36, speedMultiplier:2.23, enemySpawnChance:0.10, enemyTypes:{ground:0.40,flyer:0.60}, shardPlatformIndices:[3,8,12], initialPlatformCount:10 },
  { chapter:9, level:7, targetDistance:25250, shardCount:3, platformGapMultiplier:1.38, speedMultiplier:2.24, enemySpawnChance:0.10, enemyTypes:{ground:0.30,flyer:0.70}, shardPlatformIndices:[3,8,13], initialPlatformCount:10 },
  { chapter:9, level:8, targetDistance:27400, shardCount:3, platformGapMultiplier:1.40, speedMultiplier:2.25, enemySpawnChance:0.12, enemyTypes:{ground:0.20,flyer:0.40,shooter:0.40}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:9, level:9, targetDistance:29550, shardCount:3, platformGapMultiplier:1.42, speedMultiplier:2.26, enemySpawnChance:0.12, enemyTypes:{ground:0.20,flyer:0.40,shooter:0.40}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:9, level:10, targetDistance:31500, shardCount:3, platformGapMultiplier:1.44, speedMultiplier:2.26, enemySpawnChance:0.10, enemyTypes:{ground:0.25,flyer:0.35,shooter:0.40}, shardPlatformIndices:[3,8,14], isBossLevel:true, initialPlatformCount:10 },
];

export const CHAPTER_10_LEVELS: LevelConfig[] = [
  { chapter:10, level:1, targetDistance:14500, shardCount:3, platformGapMultiplier:1.28, speedMultiplier:2.35, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[2,5,8], initialPlatformCount:10 },
  { chapter:10, level:2, targetDistance:16650, shardCount:3, platformGapMultiplier:1.30, speedMultiplier:2.35, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,6,9], initialPlatformCount:10 },
  { chapter:10, level:3, targetDistance:18800, shardCount:3, platformGapMultiplier:1.32, speedMultiplier:2.35, enemySpawnChance:0, enemyTypes:{}, shardPlatformIndices:[3,7,10], initialPlatformCount:10 },
  { chapter:10, level:4, targetDistance:21200, shardCount:3, platformGapMultiplier:1.34, speedMultiplier:2.36, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:10, level:5, targetDistance:23600, shardCount:3, platformGapMultiplier:1.36, speedMultiplier:2.37, enemySpawnChance:0.08, enemyTypes:{ground:1.0}, shardPlatformIndices:[3,7,11], initialPlatformCount:10 },
  { chapter:10, level:6, targetDistance:26000, shardCount:3, platformGapMultiplier:1.38, speedMultiplier:2.38, enemySpawnChance:0.10, enemyTypes:{ground:0.35,flyer:0.65}, shardPlatformIndices:[3,8,12], initialPlatformCount:10 },
  { chapter:10, level:7, targetDistance:28400, shardCount:3, platformGapMultiplier:1.40, speedMultiplier:2.39, enemySpawnChance:0.10, enemyTypes:{ground:0.25,flyer:0.75}, shardPlatformIndices:[3,8,13], initialPlatformCount:10 },
  { chapter:10, level:8, targetDistance:30800, shardCount:3, platformGapMultiplier:1.42, speedMultiplier:2.40, enemySpawnChance:0.12, enemyTypes:{ground:0.20,flyer:0.35,shooter:0.45}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:10, level:9, targetDistance:33200, shardCount:3, platformGapMultiplier:1.44, speedMultiplier:2.41, enemySpawnChance:0.12, enemyTypes:{ground:0.20,flyer:0.35,shooter:0.45}, shardPlatformIndices:[3,9,14], initialPlatformCount:10 },
  { chapter:10, level:10, targetDistance:35400, shardCount:3, platformGapMultiplier:1.46, speedMultiplier:2.41, enemySpawnChance:0.10, enemyTypes:{ground:0.25,flyer:0.35,shooter:0.40}, shardPlatformIndices:[3,8,14], isBossLevel:true, initialPlatformCount:10 },
];

export function getChapterData(chapter: number): ChapterData {
  return CHAPTER_DATA[chapter - 1] ?? CHAPTER_DATA[0];
}

const LEVEL_CONFIGS: Record<number, LevelConfig[]> = {
  1: CHAPTER_1_LEVELS,
  2: CHAPTER_2_LEVELS,
  3: CHAPTER_3_LEVELS,
  4: CHAPTER_4_LEVELS,
  5: CHAPTER_5_LEVELS,
  6: CHAPTER_6_LEVELS,
  7: CHAPTER_7_LEVELS,
  8: CHAPTER_8_LEVELS,
  9: CHAPTER_9_LEVELS,
  10: CHAPTER_10_LEVELS,
};

export function getLevelConfig(chapter: number, level: number): LevelConfig {
  const chapterLevels = LEVEL_CONFIGS[chapter];
  if (chapterLevels) {
    const cfg = chapterLevels[level - 1];
    if (cfg) return cfg;
  }

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

export function isMiniBossLevel(level: number): boolean {
  return level === 5 || level === 9;
}
