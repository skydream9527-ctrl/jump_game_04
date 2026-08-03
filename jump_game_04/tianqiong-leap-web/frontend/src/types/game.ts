export interface LevelRecord {
  idx: number;
  cleared: boolean;
  bestScore: number;
  bestStars: number;
  bestShards: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface PetInstance {
  petId: string;
  level: number;
  exp: number;
  friendship: number;
}

export interface SaveData {
  totalShards: number;
  currentChapter: number;
  currentLevel: number;
  selectedCharacter: number;
  unlockedCharacters: number[];
  records: LevelRecord[];
  inventory: InventoryItem[];
  equippedItems: string[];
  ownedPets: PetInstance[];
  selectedPet: string | null;
}

export type GameScreen = 'menu' | 'planet_select' | 'level_select' | 'character_select' | 'game' | 'shop' | 'settings' | 'item_select' | 'pet_select' | 'achievements';

export type GameState = 'idle' | 'playing' | 'paused' | 'game_over' | 'result';
