import { useState, useCallback } from 'react';
import type { SaveData } from '../types/game';
import * as SaveManager from '../state/SaveManager';

export function useSaveData() {
  const [saveData, setSaveData] = useState<SaveData>(() => SaveManager.loadSave());

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

  return {
    saveData,
    refresh,
    recordResult,
    unlockChar,
    selectChar,
    purchaseItem,
    isLevelUnlocked: (ch: number, lv: number) => SaveManager.isLevelUnlocked(saveData, ch, lv),
    isChapterUnlocked: (ch: number) => SaveManager.isChapterUnlocked(saveData, ch),
    isCharacterUnlocked: (id: number) => SaveManager.isCharacterUnlocked(saveData, id),
    isItemPurchased: (itemId: string) => SaveManager.isItemPurchased(itemId),
    getRecord: (ch: number, lv: number) => SaveManager.getRecord(saveData, ch, lv),
    getChapterStars: (ch: number) => SaveManager.getChapterStars(saveData, ch),
  };
}
