import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mergeSaves,
  getPlayerId,
  getPlayerName,
  setPlayerName,
  fetchCloudSave,
  pushCloudSave,
} from './cloudSave';
import { getDefaultSave } from './SaveManager';
import { getLevelIndex } from '../constants/levels';
import type { SaveData } from '../types/game';

const PLAYER_ID_KEY = 'tianqiong_player_id';
const PLAYER_NAME_KEY = 'tianqiong_player_name';

function makeSave(overrides: Partial<SaveData> = {}): SaveData {
  return { ...getDefaultSave(), ...overrides };
}

describe('mergeSaves — records', () => {
  it('按 idx 合并，bestScore/bestStars/bestShards 取 max，cleared 取 ||', () => {
    const local = makeSave({
      records: [
        { idx: 0, cleared: true, bestScore: 100, bestStars: 2, bestShards: 2 },
        { idx: 1, cleared: false, bestScore: 50, bestStars: 1, bestShards: 1 },
      ],
    });
    const cloud = makeSave({
      records: [
        { idx: 0, cleared: false, bestScore: 200, bestStars: 3, bestShards: 1 },
        { idx: 2, cleared: true, bestScore: 999, bestStars: 3, bestShards: 3 },
      ],
    });
    const merged = mergeSaves(local, cloud);
    const rec0 = merged.records.find(r => r.idx === 0)!;
    expect(rec0.cleared).toBe(true); // true || false
    expect(rec0.bestScore).toBe(200);
    expect(rec0.bestStars).toBe(3);
    expect(rec0.bestShards).toBe(2);

    const rec1 = merged.records.find(r => r.idx === 1)!;
    expect(rec1.cleared).toBe(false);
    expect(rec1.bestScore).toBe(50);

    const rec2 = merged.records.find(r => r.idx === 2)!;
    expect(rec2.cleared).toBe(true);
    expect(rec2.bestScore).toBe(999);
  });
});

describe('mergeSaves — inventory', () => {
  it('按 itemId 合并，quantity 取 max', () => {
    const local = makeSave({
      inventory: [
        { itemId: 'item_a', quantity: 5 },
        { itemId: 'item_b', quantity: 3 },
      ],
    });
    const cloud = makeSave({
      inventory: [
        { itemId: 'item_a', quantity: 2 },
        { itemId: 'item_c', quantity: 9 },
      ],
    });
    const merged = mergeSaves(local, cloud);
    const get = (id: string) => merged.inventory.find(i => i.itemId === id)?.quantity;
    expect(get('item_a')).toBe(5);
    expect(get('item_b')).toBe(3);
    expect(get('item_c')).toBe(9);
    expect(merged.inventory).toHaveLength(3);
  });
});

describe('mergeSaves — ownedPets', () => {
  it('按 petId 合并，level/exp/friendship 取 max', () => {
    const local = makeSave({
      ownedPets: [
        { petId: 'pet_pikachu', level: 3, exp: 10, friendship: 40 },
        { petId: 'pet_a', level: 1, exp: 0, friendship: 10 },
      ],
    });
    const cloud = makeSave({
      ownedPets: [
        { petId: 'pet_pikachu', level: 5, exp: 5, friendship: 80 },
        { petId: 'pet_b', level: 2, exp: 20, friendship: 30 },
      ],
    });
    const merged = mergeSaves(local, cloud);
    const pik = merged.ownedPets.find(p => p.petId === 'pet_pikachu')!;
    expect(pik.level).toBe(5);
    expect(pik.exp).toBe(10);
    expect(pik.friendship).toBe(80);

    const a = merged.ownedPets.find(p => p.petId === 'pet_a')!;
    expect(a.level).toBe(1);
    const b = merged.ownedPets.find(p => p.petId === 'pet_b')!;
    expect(b.level).toBe(2);
    expect(merged.ownedPets).toHaveLength(3);
  });
});

describe('mergeSaves — 解锁与进度', () => {
  it('unlockedCharacters 取并集', () => {
    const local = makeSave({ unlockedCharacters: [0, 1] });
    const cloud = makeSave({ unlockedCharacters: [1, 2, 3] });
    const merged = mergeSaves(local, cloud);
    expect(merged.unlockedCharacters.sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });

  it('totalShards/currentChapter/currentLevel 取 max', () => {
    const local = makeSave({ totalShards: 10, currentChapter: 2, currentLevel: 3 });
    const cloud = makeSave({ totalShards: 50, currentChapter: 1, currentLevel: 9 });
    const merged = mergeSaves(local, cloud);
    expect(merged.totalShards).toBe(50);
    expect(merged.currentChapter).toBe(2);
    expect(merged.currentLevel).toBe(9);
  });

  it('selectedCharacter/equippedItems/selectedPet 本地优先', () => {
    const local = makeSave({
      selectedCharacter: 2,
      equippedItems: ['item_local'],
      selectedPet: 'pet_local',
    });
    const cloud = makeSave({
      selectedCharacter: 3,
      equippedItems: ['item_cloud'],
      selectedPet: 'pet_cloud',
    });
    const merged = mergeSaves(local, cloud);
    expect(merged.selectedCharacter).toBe(2);
    expect(merged.equippedItems).toEqual(['item_local']);
    expect(merged.selectedPet).toBe('pet_local');
  });
});

describe('getPlayerId', () => {
  beforeEach(() => {
    localStorage.removeItem(PLAYER_ID_KEY);
  });

  it('首次生成并持久化到 localStorage', () => {
    const id = getPlayerId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
    expect(id.startsWith('p_')).toBe(true);
    expect(localStorage.getItem(PLAYER_ID_KEY)).toBe(id);
  });

  it('二次读取一致', () => {
    const first = getPlayerId();
    const second = getPlayerId();
    expect(second).toBe(first);
    expect(localStorage.getItem(PLAYER_ID_KEY)).toBe(first);
  });
});

describe('getPlayerName / setPlayerName', () => {
  beforeEach(() => {
    localStorage.removeItem(PLAYER_NAME_KEY);
  });

  it('默认返回 "跃迁者"', () => {
    expect(getPlayerName()).toBe('跃迁者');
  });

  it('设置后读取一致', () => {
    setPlayerName('天空之主');
    expect(getPlayerName()).toBe('天空之主');
    expect(localStorage.getItem(PLAYER_NAME_KEY)).toBe('天空之主');
  });
});

describe('fetchCloudSave', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('mock fetch 返回 {save_data} 时验证 camelCase 转换', async () => {
    const saveData = {
      total_shards: 123,
      current_chapter: 4,
      current_level: 7,
      selected_character: 2,
      unlocked_characters: [0, 2],
      records: [{ idx: getLevelIndex(1, 1), cleared: true, bestScore: 500, bestStars: 3, bestShards: 3 }],
      inventory: [{ itemId: 'item_x', quantity: 2 }],
      equipped_items: ['item_x'],
      owned_pets: [{ petId: 'pet_pikachu', level: 5, exp: 0, friendship: 80 }],
      selected_pet: 'pet_pikachu',
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ save_data: saveData }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchCloudSave('test_player');
    expect(result).not.toBeNull();
    expect(result!.totalShards).toBe(123);
    expect(result!.currentChapter).toBe(4);
    expect(result!.currentLevel).toBe(7);
    expect(result!.selectedCharacter).toBe(2);
    expect(result!.unlockedCharacters).toEqual([0, 2]);
    expect(result!.equippedItems).toEqual(['item_x']);
    expect(result!.selectedPet).toBe('pet_pikachu');
    expect(result!.ownedPets[0].level).toBe(5);

    // 验证请求 URL 含 playerId
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/api/save/test_player');
  });

  it('响应中无 save_data 返回 null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }));
    const result = await fetchCloudSave('test_player');
    expect(result).toBeNull();
  });

  it('!res.ok 返回 null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }));
    const result = await fetchCloudSave('test_player');
    expect(result).toBeNull();
  });

  it('fetch 抛错返回 null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const result = await fetchCloudSave('test_player');
    expect(result).toBeNull();
  });
});

describe('pushCloudSave', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('mock fetch ok=true 返回 true，验证 snake_case body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    const data = makeSave({
      totalShards: 77,
      currentChapter: 3,
      currentLevel: 2,
      selectedCharacter: 1,
      unlockedCharacters: [0, 1],
      equippedItems: ['item_y'],
      selectedPet: 'pet_pikachu',
    });

    const ok = await pushCloudSave('test_player', data);
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const callArgs = fetchMock.mock.calls[0];
    const url = String(callArgs[0]);
    expect(url).toContain('/api/save/test_player');

    const init = callArgs[1] as RequestInit;
    expect(init.method).toBe('POST');
    const body = JSON.parse(String(init.body));
    // snake_case 字段
    expect(body.total_shards).toBe(77);
    expect(body.current_chapter).toBe(3);
    expect(body.current_level).toBe(2);
    expect(body.selected_character).toBe(1);
    expect(body.unlocked_characters).toEqual([0, 1]);
    expect(body.equipped_items).toEqual(['item_y']);
    expect(body.selected_pet).toBe('pet_pikachu');
    // 不应存在 camelCase 字段
    expect(body.totalShards).toBeUndefined();
    expect(body.currentChapter).toBeUndefined();
  });

  it('!res.ok 返回 false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    const ok = await pushCloudSave('test_player', getDefaultSave());
    expect(ok).toBe(false);
  });

  it('fetch 抛错返回 false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const ok = await pushCloudSave('test_player', getDefaultSave());
    expect(ok).toBe(false);
  });
});
