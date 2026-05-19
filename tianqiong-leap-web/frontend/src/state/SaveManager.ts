// Ported from LevelManager.kt
import type { SaveData, LevelRecord, InventoryItem } from '../types/game';
import { getLevelIndex } from '../constants/levels';
import { MAX_INVENTORY_SIZE, MAX_EQUIPPED_ITEMS, getItemById } from '../constants/items';

const SAVE_KEY = 'tianqiong_save';

function getDefaultSave(): SaveData {
  return {
    totalShards: 0,
    currentChapter: 1,
    currentLevel: 1,
    selectedCharacter: 0,
    unlockedCharacters: [0],
    records: [],
    inventory: [],
    equippedItems: [],
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return getDefaultSave();
    const json = JSON.parse(raw);
    return {
      totalShards: json.totalShards ?? 0,
      currentChapter: json.currentChapter ?? 1,
      currentLevel: json.currentLevel ?? 1,
      selectedCharacter: json.selectedCharacter ?? 0,
      unlockedCharacters: json.unlockedCharacters ?? [0],
      records: json.records ?? [],
      inventory: json.inventory ?? [],
      equippedItems: json.equippedItems ?? [],
    };
  } catch {
    return getDefaultSave();
  }
}

export function saveSave(data: SaveData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function getRecord(data: SaveData, chapter: number, level: number): LevelRecord | null {
  const idx = getLevelIndex(chapter, level);
  return data.records.find((r) => r.idx === idx) ?? null;
}

export function recordLevelResult(
  data: SaveData,
  chapter: number,
  level: number,
  score: number,
  shardsCollected: number,
  _livesRemaining: number
): SaveData {
  const idx = getLevelIndex(chapter, level);
  const stars = shardsCollected >= 3 ? 3 : shardsCollected >= 2 ? 2 : 1;

  const existingIdx = data.records.findIndex((r) => r.idx === idx);
  const existing = existingIdx >= 0 ? data.records[existingIdx] : null;

  const record: LevelRecord & { idx: number } = {
    idx,
    cleared: true,
    bestScore: Math.max(score, existing?.bestScore ?? 0),
    bestStars: Math.max(stars, existing?.bestStars ?? 0),
    bestShards: Math.max(shardsCollected, existing?.bestShards ?? 0),
  };

  const records = [...data.records];
  if (existingIdx >= 0) {
    records[existingIdx] = record;
  } else {
    records.push(record);
  }

  const newData: SaveData = {
    ...data,
    totalShards: data.totalShards + shardsCollected,
    records,
  };

  saveSave(newData);
  return newData;
}

export function isLevelUnlocked(data: SaveData, chapter: number, level: number): boolean {
  if (chapter === 1 && level === 1) return true;
  const prevLevel = level > 1 ? level - 1 : 10;
  const prevChapter = level > 1 ? chapter : chapter - 1;
  if (prevChapter < 1) return false;
  const prevIdx = getLevelIndex(prevChapter, prevLevel);
  return data.records.some((r) => r.idx === prevIdx && r.cleared);
}

export function isChapterUnlocked(data: SaveData, chapter: number): boolean {
  if (chapter === 1) return true;
  const lastLevelOfPrev = getLevelIndex(chapter - 1, 10);
  return data.records.some((r) => r.idx === lastLevelOfPrev && r.cleared);
}

export function isCharacterUnlocked(data: SaveData, id: number): boolean {
  return data.unlockedCharacters.includes(id);
}

export function unlockCharacter(data: SaveData, id: number, cost: number): SaveData | null {
  if (data.unlockedCharacters.includes(id)) return null;
  if (data.totalShards < cost) return null;
  const newData: SaveData = {
    ...data,
    totalShards: data.totalShards - cost,
    unlockedCharacters: [...data.unlockedCharacters, id],
    selectedCharacter: id,
  };
  saveSave(newData);
  return newData;
}

export function selectCharacter(data: SaveData, id: number): SaveData {
  const newData = { ...data, selectedCharacter: id };
  saveSave(newData);
  return newData;
}

export function getChapterStars(data: SaveData, chapter: number): number {
  let total = 0;
  for (let l = 1; l <= 10; l++) {
    const rec = getRecord(data, chapter, l);
    total += rec?.bestStars ?? 0;
  }
  return total;
}

export function purchaseItem(data: SaveData, itemId: string, price: number): SaveData | null {
  if (data.totalShards < price) return null;

  const newData: SaveData = {
    ...data,
    totalShards: data.totalShards - price,
  };

  // Track purchased items in localStorage separately
  const purchasedKey = 'tianqiong_purchased';
  const purchased: string[] = JSON.parse(localStorage.getItem(purchasedKey) ?? '[]');
  if (!purchased.includes(itemId)) {
    purchased.push(itemId);
    localStorage.setItem(purchasedKey, JSON.stringify(purchased));
  }

  saveSave(newData);
  return newData;
}

export function isItemPurchased(itemId: string): boolean {
  const purchasedKey = 'tianqiong_purchased';
  const purchased: string[] = JSON.parse(localStorage.getItem(purchasedKey) ?? '[]');
  return purchased.includes(itemId);
}

// ═══════════ Inventory Management ═══════════

export function addItemToInventory(data: SaveData, itemId: string, quantity: number = 1): SaveData {
  const itemDef = getItemById(itemId);
  if (!itemDef) return data;

  const existing = data.inventory.find(i => i.itemId === itemId);
  let newInventory: InventoryItem[];

  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, itemDef.maxStack);
    newInventory = data.inventory.map(i =>
      i.itemId === itemId ? { ...i, quantity: newQty } : i
    );
  } else {
    if (data.inventory.length >= MAX_INVENTORY_SIZE) return data;
    newInventory = [...data.inventory, { itemId, quantity: Math.min(quantity, itemDef.maxStack) }];
  }

  const newData = { ...data, inventory: newInventory };
  saveSave(newData);
  return newData;
}

export function removeItemFromInventory(data: SaveData, itemId: string, quantity: number = 1): SaveData {
  const existing = data.inventory.find(i => i.itemId === itemId);
  if (!existing) return data;

  let newInventory: InventoryItem[];
  if (existing.quantity <= quantity) {
    newInventory = data.inventory.filter(i => i.itemId !== itemId);
  } else {
    newInventory = data.inventory.map(i =>
      i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i
    );
  }

  const newData = { ...data, inventory: newInventory };
  saveSave(newData);
  return newData;
}

export function purchaseItemToInventory(data: SaveData, itemId: string): SaveData | null {
  const itemDef = getItemById(itemId);
  if (!itemDef) return null;
  if (data.totalShards < itemDef.price) return null;

  const existing = data.inventory.find(i => i.itemId === itemId);
  if (existing && existing.quantity >= itemDef.maxStack) return null;

  const newData: SaveData = {
    ...data,
    totalShards: data.totalShards - itemDef.price,
  };
  return addItemToInventory(newData, itemId, 1);
}

export function equipItem(data: SaveData, itemId: string): SaveData {
  if (data.equippedItems.length >= MAX_EQUIPPED_ITEMS) return data;
  if (data.equippedItems.includes(itemId)) return data;
  if (!data.inventory.find(i => i.itemId === itemId)) return data;

  const newData = { ...data, equippedItems: [...data.equippedItems, itemId] };
  saveSave(newData);
  return newData;
}

export function unequipItem(data: SaveData, itemId: string): SaveData {
  const newData = { ...data, equippedItems: data.equippedItems.filter(i => i !== itemId) };
  saveSave(newData);
  return newData;
}

export function setEquippedItems(data: SaveData, itemIds: string[]): SaveData {
  const validIds = itemIds.filter(id => data.inventory.find(i => i.itemId === id));
  const newData = { ...data, equippedItems: validIds.slice(0, MAX_EQUIPPED_ITEMS) };
  saveSave(newData);
  return newData;
}

export function useConsumableItem(data: SaveData, itemId: string): SaveData {
  const itemDef = getItemById(itemId);
  if (!itemDef || itemDef.category !== 'consumable') return data;
  return removeItemFromInventory(data, itemId, 1);
}
