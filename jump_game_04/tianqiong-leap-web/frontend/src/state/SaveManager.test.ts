import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDefaultSave,
  loadSave,
  saveSave,
  recordLevelResult,
  isLevelUnlocked,
} from './SaveManager';
import { getLevelIndex } from '../constants/levels';

const SAVE_KEY = 'tianqiong_save';
const TEST_MODE_KEY = 'tianqiong_test_mode';

describe('getDefaultSave', () => {
  it('返回默认存档对象', () => {
    const def = getDefaultSave();
    expect(def).toBeDefined();
    expect(def.totalShards).toBe(0);
    expect(def.currentChapter).toBe(1);
    expect(def.currentLevel).toBe(1);
    expect(def.unlockedCharacters).toEqual([0]);
    expect(def.records).toEqual([]);
    expect(def.ownedPets.length).toBeGreaterThan(0);
  });

  it('默认拥有 pet_pikachu', () => {
    const def = getDefaultSave();
    expect(def.ownedPets.some(p => p.petId === 'pet_pikachu')).toBe(true);
    expect(def.selectedPet).toBe('pet_pikachu');
  });
});

describe('loadSave', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(TEST_MODE_KEY);
  });

  it('空 localStorage 返回默认存档', () => {
    const data = loadSave();
    const def = getDefaultSave();
    expect(data).toEqual(def);
    expect(data.totalShards).toBe(0);
    expect(data.records).toEqual([]);
  });

  it('有数据返回合并后的存档', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      totalShards: 100,
      currentChapter: 3,
      currentLevel: 5,
      selectedCharacter: 2,
      unlockedCharacters: [0, 2],
    }));
    const data = loadSave();
    expect(data.totalShards).toBe(100);
    expect(data.currentChapter).toBe(3);
    expect(data.currentLevel).toBe(5);
    expect(data.selectedCharacter).toBe(2);
    expect(data.unlockedCharacters).toEqual([0, 2]);
    // 缺失字段走默认
    expect(data.records).toEqual([]);
    expect(data.ownedPets).toEqual(getDefaultSave().ownedPets);
  });

  it('损坏 JSON 返回默认存档', () => {
    localStorage.setItem(SAVE_KEY, '{invalid json');
    const data = loadSave();
    expect(data).toEqual(getDefaultSave());
  });
});

describe('saveSave + loadSave 往返', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(TEST_MODE_KEY);
  });

  it('写入 localStorage 后 loadSave 能读回', () => {
    const def = getDefaultSave();
    const modified = {
      ...def,
      totalShards: 42,
      currentChapter: 2,
      currentLevel: 3,
      unlockedCharacters: [0, 1, 2],
    };
    saveSave(modified);
    const loaded = loadSave();
    expect(loaded.totalShards).toBe(42);
    expect(loaded.currentChapter).toBe(2);
    expect(loaded.currentLevel).toBe(3);
    expect(loaded.unlockedCharacters).toEqual([0, 1, 2]);
  });

  it('直接读取 localStorage 写入的字符串', () => {
    const def = getDefaultSave();
    saveSave(def);
    const raw = localStorage.getItem(SAVE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).totalShards).toBe(0);
  });
});

describe('recordLevelResult', () => {
  it('返回新 data，records 数组含新记录', () => {
    const def = getDefaultSave();
    const newData = recordLevelResult(def, 1, 1, 500, 3, 3);
    expect(newData.records).toHaveLength(1);
    const rec = newData.records[0];
    expect(rec.idx).toBe(getLevelIndex(1, 1));
    expect(rec.cleared).toBe(true);
    expect(rec.bestScore).toBe(500);
    expect(rec.bestShards).toBe(3);
  });

  it('不修改原 data（不可变）', () => {
    const def = getDefaultSave();
    const originalRecords = def.records;
    recordLevelResult(def, 1, 1, 500, 3, 3);
    expect(def.records).toBe(originalRecords);
    expect(def.records).toHaveLength(0);
  });

  it('totalShards 累加 shardsCollected', () => {
    const def = getDefaultSave();
    const newData = recordLevelResult(def, 1, 1, 500, 3, 3);
    expect(newData.totalShards).toBe(3);
  });

  it('bestScore 取 max（重复记录取最好）', () => {
    let data = getDefaultSave();
    data = recordLevelResult(data, 1, 1, 100, 2, 1);
    expect(data.records[0].bestScore).toBe(100);

    // 较低分数不覆盖
    data = recordLevelResult(data, 1, 1, 50, 2, 1);
    expect(data.records).toHaveLength(1);
    expect(data.records[0].bestScore).toBe(100);

    // 更高分数覆盖
    data = recordLevelResult(data, 1, 1, 300, 3, 3);
    expect(data.records).toHaveLength(1);
    expect(data.records[0].bestScore).toBe(300);
    expect(data.records[0].bestStars).toBe(3);
    expect(data.records[0].bestShards).toBe(3);
  });

  it('bestStars 取 max', () => {
    let data = getDefaultSave();
    data = recordLevelResult(data, 1, 1, 100, 1, 1); // stars=1
    expect(data.records[0].bestStars).toBe(1);
    data = recordLevelResult(data, 1, 1, 100, 3, 3); // stars=3
    expect(data.records[0].bestStars).toBe(3);
  });

  it('会写入 localStorage', () => {
    const def = getDefaultSave();
    recordLevelResult(def, 1, 1, 500, 3, 3);
    const raw = localStorage.getItem(SAVE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.records).toHaveLength(1);
    expect(parsed.records[0].bestScore).toBe(500);
  });

  it('starsOverride 传入时直接使用（Boss 关固定 3 星）', () => {
    const def = getDefaultSave();
    // Boss 关 shards=0, lives=1，正常计算 stars=1，但传入 3
    const newData = recordLevelResult(def, 1, 10, 1000, 0, 1, 3);
    expect(newData.records[0].bestStars).toBe(3);
  });

  it('starsOverride 不传时按满血加星逻辑重算', () => {
    const def = getDefaultSave();
    // shards=2 → stars=2, lives>=3 → +1 → stars=3
    const newData = recordLevelResult(def, 1, 1, 500, 2, 3);
    expect(newData.records[0].bestStars).toBe(3);
  });

  it('starsOverride 与重算结果一致（同一来源）', () => {
    const def = getDefaultSave();
    const a = recordLevelResult(def, 1, 1, 500, 2, 3);
    const b = recordLevelResult(def, 1, 1, 500, 2, 3, 3);
    expect(a.records[0].bestStars).toBe(b.records[0].bestStars);
  });
});

describe('isLevelUnlocked', () => {
  it('第1章第1关默认解锁', () => {
    const def = getDefaultSave();
    expect(isLevelUnlocked(def, 1, 1)).toBe(true);
  });

  it('未通关前一关时，下一关未解锁', () => {
    const def = getDefaultSave();
    expect(isLevelUnlocked(def, 1, 2)).toBe(false);
    expect(isLevelUnlocked(def, 1, 3)).toBe(false);
    expect(isLevelUnlocked(def, 2, 1)).toBe(false);
  });

  it('通关第1关后第2关解锁', () => {
    const def = getDefaultSave();
    const data = recordLevelResult(def, 1, 1, 500, 3, 3);
    expect(isLevelUnlocked(data, 1, 2)).toBe(true);
    expect(isLevelUnlocked(data, 1, 3)).toBe(false);
  });

  it('通关第1章第10关后第2章第1关解锁', () => {
    const def = getDefaultSave();
    const data = recordLevelResult(def, 1, 10, 9999, 3, 3);
    expect(isLevelUnlocked(data, 2, 1)).toBe(true);
  });
});
