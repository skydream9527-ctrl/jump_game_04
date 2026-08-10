import { useState, useCallback } from 'react';
import type { SaveData } from '../types/game';
import * as SaveManager from '../state/SaveManager';
import { fetchCloudSave, pushCloudSave, mergeSaves, getPlayerId } from '../state/cloudSave';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export function useSaveData() {
  const [saveData, setSaveData] = useState<SaveData>(() => SaveManager.loadSave());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const refresh = useCallback(() => {
    setSaveData(SaveManager.loadSave());
  }, []);

  const recordResult = useCallback((chapter: number, level: number, score: number, shards: number, lives: number) => {
    setSaveData(prev => SaveManager.recordLevelResult(prev, chapter, level, score, shards, lives));
  }, []);

  const unlockChar = useCallback((id: number, cost: number) => {
    setSaveData(prev => SaveManager.unlockCharacter(prev, id, cost) ?? prev);
  }, []);

  const selectChar = useCallback((id: number) => {
    setSaveData(prev => SaveManager.selectCharacter(prev, id));
  }, []);

  const purchaseItem = useCallback((itemId: string, price: number) => {
    setSaveData(prev => SaveManager.purchaseItem(prev, itemId, price) ?? prev);
  }, []);

  const purchaseItemToInventory = useCallback((itemId: string) => {
    setSaveData(prev => SaveManager.purchaseItemToInventory(prev, itemId) ?? prev);
  }, []);

  const equipItem = useCallback((itemId: string) => {
    setSaveData(prev => SaveManager.equipItem(prev, itemId));
  }, []);

  const unequipItem = useCallback((itemId: string) => {
    setSaveData(prev => SaveManager.unequipItem(prev, itemId));
  }, []);

  const setEquippedItems = useCallback((itemIds: string[]) => {
    setSaveData(prev => SaveManager.setEquippedItems(prev, itemIds));
  }, []);

  const useConsumableItem = useCallback((itemId: string) => {
    setSaveData(prev => SaveManager.consumeConsumableItem(prev, itemId));
  }, []);

  const adoptPet = useCallback((petId: string) => {
    setSaveData(prev => SaveManager.adoptPet(prev, petId) ?? prev);
  }, []);

  const selectPet = useCallback((petId: string | null) => {
    setSaveData(prev => SaveManager.selectPet(prev, petId));
  }, []);

  const addPetExp = useCallback((petId: string, exp: number) => {
    setSaveData(prev => SaveManager.addPetExp(prev, petId, exp));
  }, []);

  const purchasePet = useCallback((petId: string, price: number) => {
    setSaveData(prev => SaveManager.purchasePet(prev, petId, price) ?? prev);
  }, []);

  // 拉取云端存档并与本地合并写入；云端无存档时不视为错误
  const pullFromCloud = useCallback(async () => {
    setSyncStatus('syncing');
    const cloud = await fetchCloudSave(getPlayerId());
    if (cloud === null) {
      setSyncStatus('idle');
      return;
    }
    const local = SaveManager.loadSave();
    const merged = mergeSaves(local, cloud);
    SaveManager.saveSave(merged);
    refresh();
    setSyncStatus('synced');
  }, [refresh]);

  // 推送本地存档到云端；内部直接读 localStorage 最新值，避免 React state 闭包
  const pushToCloud = useCallback(async () => {
    setSyncStatus('syncing');
    const data = SaveManager.loadSave();
    const ok = await pushCloudSave(getPlayerId(), data);
    setSyncStatus(ok ? 'synced' : 'error');
    return ok;
  }, []);

  // 完整同步：先拉取合并，再推回云端
  const syncCloud = useCallback(async () => {
    setSyncStatus('syncing');
    const playerId = getPlayerId();
    const cloud = await fetchCloudSave(playerId);
    if (cloud) {
      const local = SaveManager.loadSave();
      const merged = mergeSaves(local, cloud);
      SaveManager.saveSave(merged);
      refresh();
    }
    const data = SaveManager.loadSave();
    const ok = await pushCloudSave(playerId, data);
    setSyncStatus(ok ? 'synced' : 'error');
  }, [refresh]);

  return {
    saveData,
    syncStatus,
    refresh,
    recordResult,
    unlockChar,
    selectChar,
    purchaseItem,
    purchaseItemToInventory,
    equipItem,
    unequipItem,
    setEquippedItems,
    useConsumableItem,
    adoptPet,
    selectPet,
    addPetExp,
    purchasePet,
    pullFromCloud,
    pushToCloud,
    syncCloud,
    isLevelUnlocked: (ch: number, lv: number) => SaveManager.isLevelUnlocked(saveData, ch, lv),
    isChapterUnlocked: (ch: number) => SaveManager.isChapterUnlocked(saveData, ch),
    isCharacterUnlocked: (id: number) => SaveManager.isCharacterUnlocked(saveData, id),
    isItemPurchased: (itemId: string) => SaveManager.isItemPurchased(itemId),
    getRecord: (ch: number, lv: number) => SaveManager.getRecord(saveData, ch, lv),
    getChapterStars: (ch: number) => SaveManager.getChapterStars(saveData, ch),
    getPetInstance: (petId: string) => SaveManager.getPetInstance(saveData, petId),
  };
}
