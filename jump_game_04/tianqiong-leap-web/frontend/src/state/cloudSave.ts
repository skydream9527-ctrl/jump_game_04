import type { SaveData } from '../types/game';
import { getDefaultSave } from './SaveManager';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

// player_id 持久化在 localStorage，首次随机生成
const PLAYER_ID_KEY = 'tianqiong_player_id';
const PLAYER_NAME_KEY = 'tianqiong_player_name';
const TOKEN_KEY = 'tianqiong_token';

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function setPlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name);
}

export function getPlayerName(): string {
  return localStorage.getItem(PLAYER_NAME_KEY) ?? '跃迁者';
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export async function registerPlayer(playerId: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/save/${playerId}/register`, {
      method: 'POST',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.token) {
      setToken(json.token);
      return json.token as string;
    }
    return null;
  } catch {
    return null;
  }
}

// camelCase SaveData → snake_case for backend
function toBackendSave(data: SaveData): Record<string, unknown> {
  return {
    total_shards: data.totalShards,
    current_chapter: data.currentChapter,
    current_level: data.currentLevel,
    selected_character: data.selectedCharacter,
    unlocked_characters: data.unlockedCharacters,
    records: data.records,
    inventory: data.inventory,
    equipped_items: data.equippedItems,
    owned_pets: data.ownedPets,
    selected_pet: data.selectedPet,
  };
}

// snake_case backend → camelCase SaveData，字段缺失用默认值兜底
function fromBackendSave(raw: Record<string, unknown>): SaveData {
  const def = getDefaultSave();
  return {
    totalShards: (raw.total_shards as number) ?? def.totalShards,
    currentChapter: (raw.current_chapter as number) ?? def.currentChapter,
    currentLevel: (raw.current_level as number) ?? def.currentLevel,
    selectedCharacter: (raw.selected_character as number) ?? def.selectedCharacter,
    unlockedCharacters: (raw.unlocked_characters as number[]) ?? def.unlockedCharacters,
    records: (raw.records as SaveData['records']) ?? def.records,
    inventory: (raw.inventory as SaveData['inventory']) ?? def.inventory,
    equippedItems: (raw.equipped_items as string[]) ?? def.equippedItems,
    ownedPets: (raw.owned_pets as SaveData['ownedPets']) ?? def.ownedPets,
    selectedPet: (raw.selected_pet as string | null) ?? def.selectedPet,
  };
}

export async function fetchCloudSave(playerId: string): Promise<SaveData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/save/${playerId}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.save_data) return null;
    return fromBackendSave(json.save_data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function pushCloudSave(playerId: string, data: SaveData): Promise<boolean> {
  try {
    let token = getToken();
    if (!token) {
      token = await registerPlayer(playerId);
      if (!token) return false;
    }
    const res = await fetch(`${API_BASE}/api/save/${playerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(toBackendSave(data)),
    });
    if (res.status === 401 || res.status === 403) {
      // token 失效，重新注册后重试一次
      token = await registerPlayer(playerId);
      if (!token) return false;
      const retryRes = await fetch(`${API_BASE}/api/save/${playerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(toBackendSave(data)),
      });
      return retryRes.ok;
    }
    return res.ok;
  } catch {
    return false;
  }
}

// 合并策略：关卡取最好记录、角色/宠物取并集、选择项本地优先。
// totalShards 取 max（非累加），两端独立玩不同关时碎片增量会丢失——
// 已知限制：分布式余额合并无解，需操作日志才能精确合并。
export function mergeSaves(local: SaveData, cloud: SaveData): SaveData {
  // records: 按 idx 合并，取 bestScore/bestStars/bestShards 最大，cleared 取 ||
  const recordMap = new Map<number, SaveData['records'][0]>();
  for (const r of local.records) recordMap.set(r.idx, { ...r });
  for (const r of cloud.records) {
    const ex = recordMap.get(r.idx);
    if (!ex) {
      recordMap.set(r.idx, { ...r });
    } else {
      recordMap.set(r.idx, {
        idx: r.idx,
        cleared: ex.cleared || r.cleared,
        bestScore: Math.max(ex.bestScore, r.bestScore),
        bestStars: Math.max(ex.bestStars, r.bestStars),
        bestShards: Math.max(ex.bestShards, r.bestShards),
      });
    }
  }
  // inventory: 按 itemId 合并，取最大 quantity
  const invMap = new Map<string, number>();
  for (const i of local.inventory) invMap.set(i.itemId, i.quantity);
  for (const i of cloud.inventory) invMap.set(i.itemId, Math.max(invMap.get(i.itemId) ?? 0, i.quantity));
  // ownedPets: 按 petId 合并，取 max(level, exp, friendship)
  const petMap = new Map<string, SaveData['ownedPets'][0]>();
  for (const p of local.ownedPets) petMap.set(p.petId, { ...p });
  for (const p of cloud.ownedPets) {
    const ex = petMap.get(p.petId);
    if (!ex) {
      petMap.set(p.petId, { ...p });
    } else {
      petMap.set(p.petId, {
        petId: p.petId,
        level: Math.max(ex.level, p.level),
        exp: Math.max(ex.exp, p.exp),
        friendship: Math.max(ex.friendship, p.friendship),
      });
    }
  }
  return {
    totalShards: Math.max(local.totalShards, cloud.totalShards),
    currentChapter: Math.max(local.currentChapter, cloud.currentChapter),
    currentLevel: Math.max(local.currentLevel, cloud.currentLevel),
    selectedCharacter: local.selectedCharacter, // 本地选择优先
    unlockedCharacters: [...new Set([...local.unlockedCharacters, ...cloud.unlockedCharacters])],
    records: Array.from(recordMap.values()),
    inventory: Array.from(invMap.entries()).map(([itemId, quantity]) => ({ itemId, quantity })),
    equippedItems: local.equippedItems, // 本地装备优先
    ownedPets: Array.from(petMap.values()),
    selectedPet: local.selectedPet, // 本地选择优先
  };
}
