import { describe, it, expect } from 'vitest';
import {
  CHAPTER_DATA,
  CHAPTER_1_LEVELS,
  CHAPTER_10_LEVELS,
  CHAPTER_NAMES,
  getChapterData,
  getLevelConfig,
  getLevelIndex,
  getLevelDisplayName,
  isBossLevel,
  isMiniBossLevel,
} from './levels';

describe('getChapterData', () => {
  it('正常返回对应章数据', () => {
    expect(getChapterData(1).chapter).toBe(1);
    expect(getChapterData(1).name).toBe('荒废地球');
    expect(getChapterData(5).name).toBe('冰封星');
    expect(getChapterData(10).chapter).toBe(10);
    expect(getChapterData(10).name).toBe('暗物质领域');
  });

  it('越界 chapter=0 回退到 CHAPTER_DATA[0]', () => {
    expect(getChapterData(0)).toEqual(CHAPTER_DATA[0]);
  });

  it('越界 chapter=11 回退到 CHAPTER_DATA[0]', () => {
    expect(getChapterData(11)).toEqual(CHAPTER_DATA[0]);
  });

  it('越界 chapter=-1 回退到 CHAPTER_DATA[0]', () => {
    expect(getChapterData(-1)).toEqual(CHAPTER_DATA[0]);
  });
});

describe('getLevelConfig', () => {
  it('正常返回数据表里的关卡', () => {
    const cfg = getLevelConfig(1, 1);
    expect(cfg.chapter).toBe(1);
    expect(cfg.level).toBe(1);
    expect(cfg.targetDistance).toBe(3800);

    const boss = getLevelConfig(1, 10);
    expect(boss.isBossLevel).toBe(true);
    expect(boss.targetDistance).toBe(11000);

    const ch5lv10 = getLevelConfig(5, 10);
    expect(ch5lv10.targetDistance).toBe(19600);
  });

  it('未命中 (chapter=11, level=11) 走兜底公式', () => {
    const cfg = getLevelConfig(11, 11);
    // baseDistance = 3000 + 11*800 = 11800
    // chapterScale = 1 + (11-1)*0.15 = 2.5
    // targetDistance = 11800 * 2.5 = 29500
    expect(cfg.chapter).toBe(11);
    expect(cfg.level).toBe(11);
    expect(cfg.targetDistance).toBe(29500);
    expect(cfg.shardCount).toBe(3);
    // platformGapMultiplier = 1 + (11-1)*0.05 + 11*0.02 = 1 + 0.5 + 0.22 = 1.72
    expect(cfg.platformGapMultiplier).toBeCloseTo(1.72);
    // speedMultiplier = 1 + (11-1)*0.03 = 1.3
    expect(cfg.speedMultiplier).toBeCloseTo(1.3);
  });
});

describe('getLevelIndex', () => {
  it('验证公式 (chapter-1)*10 + level - 1', () => {
    expect(getLevelIndex(1, 1)).toBe(0);
    expect(getLevelIndex(1, 10)).toBe(9);
    expect(getLevelIndex(2, 1)).toBe(10);
    expect(getLevelIndex(5, 5)).toBe(44);
    expect(getLevelIndex(10, 10)).toBe(99);
  });
});

describe('getLevelDisplayName', () => {
  it('正常返回含章名的字符串', () => {
    const name = getLevelDisplayName(1, 1);
    expect(name).toContain('第1章');
    expect(name).toContain('荒废地球');
    expect(name).toContain('第1关');

    const ch5 = getLevelDisplayName(5, 10);
    expect(ch5).toContain('冰封星');
    expect(ch5).toContain('第10关');
  });

  it('未知章返回含 "未知"', () => {
    expect(getLevelDisplayName(99, 1)).toContain('未知');
  });
});

describe('isBossLevel', () => {
  it('level=10 返回 true', () => {
    expect(isBossLevel(10)).toBe(true);
  });

  it('其他 level 返回 false', () => {
    expect(isBossLevel(1)).toBe(false);
    expect(isBossLevel(5)).toBe(false);
    expect(isBossLevel(9)).toBe(false);
    expect(isBossLevel(0)).toBe(false);
  });
});

describe('isMiniBossLevel', () => {
  it('level=5 或 9 返回 true', () => {
    expect(isMiniBossLevel(5)).toBe(true);
    expect(isMiniBossLevel(9)).toBe(true);
  });

  it('其他 level 返回 false', () => {
    expect(isMiniBossLevel(1)).toBe(false);
    expect(isMiniBossLevel(10)).toBe(false);
    expect(isMiniBossLevel(4)).toBe(false);
  });
});

describe('数据完整性', () => {
  it('CHAPTER_1_LEVELS 有 10 关', () => {
    expect(CHAPTER_1_LEVELS).toHaveLength(10);
    expect(CHAPTER_1_LEVELS[0].level).toBe(1);
    expect(CHAPTER_1_LEVELS[9].level).toBe(10);
  });

  it('CHAPTER_10_LEVELS 有 10 关', () => {
    expect(CHAPTER_10_LEVELS).toHaveLength(10);
    expect(CHAPTER_10_LEVELS[0].level).toBe(1);
    expect(CHAPTER_10_LEVELS[9].level).toBe(10);
  });

  it('每章 level 10 的 isBossLevel=true', () => {
    for (let ch = 1; ch <= 10; ch++) {
      const boss = getLevelConfig(ch, 10);
      expect(boss.chapter, `chapter ${ch} 第10关 chapter 应为 ${ch}`).toBe(ch);
      expect(boss.level, `chapter ${ch} 第10关 level 应为 10`).toBe(10);
      expect(boss.isBossLevel, `chapter ${ch} 第10关应为 boss`).toBe(true);
    }
  });
});

describe('#9 平台类型权重', () => {
  it('每个 ChapterData 都有 defaultPlatformTypeWeights 字段', () => {
    for (const ch of CHAPTER_DATA) {
      expect(ch).toHaveProperty('defaultPlatformTypeWeights');
      expect(typeof ch.defaultPlatformTypeWeights).toBe('object');
      expect(ch.defaultPlatformTypeWeights).not.toBeUndefined();
    }
  });

  it('ch5 level10 的 platformTypeWeights 存在且 ice 权重高于章节默认', () => {
    const ch5DefaultIce = CHAPTER_DATA[4].defaultPlatformTypeWeights.ice ?? 0;
    const ch5lv10 = getLevelConfig(5, 10);
    expect(ch5lv10.platformTypeWeights).toBeDefined();
    const lv10Ice = ch5lv10.platformTypeWeights!.ice ?? 0;
    expect(lv10Ice).toBeGreaterThan(ch5DefaultIce);
    expect(lv10Ice).toBe(0.75);
    expect(ch5DefaultIce).toBe(0.5);
  });
});

describe('CHAPTER_NAMES', () => {
  it('包含 10 个章节名', () => {
    expect(Object.keys(CHAPTER_NAMES)).toHaveLength(10);
    expect(CHAPTER_NAMES[1]).toBe('荒废地球');
    expect(CHAPTER_NAMES[10]).toBe('暗物质领域');
  });
});
