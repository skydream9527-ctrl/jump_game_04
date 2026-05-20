import { useState, useCallback, useEffect } from 'react';
import { PhaserGame } from './phaser/PhaserGame';
import { EventBus } from './phaser/EventBus';
import { EVENTS } from './types/events';
import type { GameScreen, GameState } from './types/game';
import type { GameOverPayload, LevelCompletePayload } from './types/events';
import { useSaveData } from './hooks/useSaveData';
import { getCharacterById } from './constants/characters';
import { ACHIEVEMENTS, type Achievement } from './constants/achievements';
import { unlockAchievement } from './state/achievements';
import { addLeaderboardEntry } from './state/leaderboard';
import { MainMenu } from './components/screens/MainMenu';
import { PlanetSelect } from './components/screens/PlanetSelect';
import { LevelSelect } from './components/screens/LevelSelect';
import { CharacterSelect } from './components/screens/CharacterSelect';
import { Shop } from './components/screens/Shop';
import { ItemSelect } from './components/screens/ItemSelect';
import { PetSelect } from './components/screens/PetSelect';
import type { ShopItem } from './constants/shop';
import { PauseOverlay } from './components/overlays/PauseOverlay';
import { GameOverOverlay } from './components/overlays/GameOverOverlay';
import { LevelCompleteOverlay } from './components/overlays/LevelCompleteOverlay';
import { LeaderboardOverlay } from './components/overlays/LeaderboardOverlay';
import { AchievementToast } from './components/overlays/AchievementToast';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameOverData, setGameOverData] = useState<GameOverPayload>({ score: 0, bestScore: 0 });
  const [completeData, setCompleteData] = useState<LevelCompletePayload>({ score: 0, shards: 0, lives: 0, stars: 0 });
  const [_phaserReady, setPhaserReady] = useState(false);
  const [standaloneView, setStandaloneView] = useState(false);

  const save = useSaveData();

  const tryUnlock = useCallback((id: string) => {
    if (unlockAchievement(id)) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) setAchievementToast(ach);
    }
  }, []);

  // Subscribe to Phaser events
  useEffect(() => {
    const onGameOver = (data: GameOverPayload) => {
      setGameOverData(data);
      setGameState('game_over');
    };

    const onLevelComplete = (data: LevelCompletePayload) => {
      setCompleteData(data);
      setGameState('result');
      save.recordResult(currentChapter, currentLevel, data.score, data.shards, data.lives);
      const char = getCharacterById(save.saveData.selectedCharacter);
      addLeaderboardEntry({ name: char.displayName, score: data.score, chapter: currentChapter, level: currentLevel });

      // Achievement checks
      tryUnlock('first_clear');
      if (data.shards >= 3) tryUnlock('all_shards');
      if (data.lives >= 3) tryUnlock('no_damage');
      if (currentLevel === 10) tryUnlock('boss_slayer');
      if (currentChapter === 1 && currentLevel === 10) tryUnlock('chapter1_clear');
    };

    const onStateChanged = (state: GameState) => {
      setGameState(state);
    };

    EventBus.on(EVENTS.GAME_OVER, onGameOver);
    EventBus.on(EVENTS.LEVEL_COMPLETE, onLevelComplete);
    EventBus.on(EVENTS.GAME_STATE_CHANGED, onStateChanged);

    return () => {
      EventBus.off(EVENTS.GAME_OVER, onGameOver);
      EventBus.off(EVENTS.LEVEL_COMPLETE, onLevelComplete);
      EventBus.off(EVENTS.GAME_STATE_CHANGED, onStateChanged);
    };
  }, [currentChapter, currentLevel, save]);

  const startLevel = useCallback((chapter: number, level: number, items: string[] = []) => {
    setCurrentChapter(chapter);
    setCurrentLevel(level);
    setGameState('playing');
    setScreen('game');

    // Delay to allow React to render the game container as visible first
    // so Phaser can properly initialize/resize
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        EventBus.emit(EVENTS.START_LEVEL, {
          chapter,
          level,
          characterId: save.saveData.selectedCharacter,
          equippedItems: items,
          selectedPet: save.saveData.selectedPet,
        });
      });
    });
  }, [save.saveData.selectedCharacter, save.saveData.selectedPet]);

  const handleNextLevel = useCallback(() => {
    save.refresh();
    if (currentLevel < 10) {
      setCurrentLevel(currentLevel + 1);
      setStandaloneView(false);
      setScreen('item_select');
    } else if (currentChapter < 10) {
      setCurrentChapter(currentChapter + 1);
      setCurrentLevel(1);
      setStandaloneView(false);
      setScreen('item_select');
    }
  }, [currentChapter, currentLevel, save]);

  const handleBackToMenu = useCallback(() => {
    setScreen('menu');
    setGameState('idle');
    EventBus.emit(EVENTS.PAUSE);
  }, []);

  const handlePurchase = useCallback((item: ShopItem) => {
    if (item.price === 0) {
      alert(`${item.name} 是免费物品！`);
      return;
    }

    if (save.saveData.totalShards < item.price) {
      alert(`星核碎片不足！需要 ${item.price}，当前 ${save.saveData.totalShards}`);
      return;
    }

    save.purchaseItem(item.id, item.price);
    alert(`成功购买 ${item.name}！`);
  }, [save]);

  const handleBackToLevels = useCallback(() => {
    save.refresh();
    setScreen('level_select');
    setGameState('idle');
    EventBus.emit(EVENTS.PAUSE);
  }, [save]);

  const showGame = screen === 'game';

  return (
    <div className="app">
      {/* Phaser canvas - always mounted, always visible, behind UI */}
      <div className="game-container">
        <PhaserGame onGameReady={() => setPhaserReady(true)} />
      </div>

      {/* React UI screens - overlay on top of Phaser when not in game */}
      {!showGame && (
        <div className="ui-layer">
          {screen === 'menu' && (
            <MainMenu
              totalShards={save.saveData.totalShards}
              onStartGame={() => { save.refresh(); setScreen('planet_select'); }}
              onCharacterSelect={() => { save.refresh(); setScreen('character_select'); }}
              onShop={() => { save.refresh(); setScreen('shop'); }}
              onLeaderboard={() => setShowLeaderboard(true)}
              onInventory={() => { save.refresh(); setStandaloneView(true); setScreen('item_select'); }}
              onPet={() => { save.refresh(); setStandaloneView(true); setScreen('pet_select'); }}
            />
          )}
          {screen === 'shop' && (
            <Shop
              totalShards={save.saveData.totalShards}
              onBack={() => setScreen('menu')}
              onPurchase={handlePurchase}
            />
          )}
          {screen === 'planet_select' && (
            <PlanetSelect
              getChapterStars={save.getChapterStars}
              isChapterUnlocked={save.isChapterUnlocked}
              onSelect={(ch) => { setSelectedChapter(ch); setScreen('level_select'); }}
              onBack={() => setScreen('menu')}
            />
          )}
          {screen === 'level_select' && (
            <LevelSelect
              chapter={selectedChapter}
              isLevelUnlocked={save.isLevelUnlocked}
              getRecord={save.getRecord}
              onSelect={(ch, lv) => { setCurrentChapter(ch); setCurrentLevel(lv); setStandaloneView(false); setScreen('item_select'); }}
              onBack={() => setScreen('planet_select')}
            />
          )}
          {screen === 'item_select' && (
            <ItemSelect
              inventory={save.saveData.inventory}
              equippedItems={save.saveData.equippedItems}
              chapter={currentChapter}
              level={currentLevel}
              standalone={standaloneView}
              onConfirm={(items) => {
                save.setEquippedItems(items);
                if (standaloneView) {
                  setStandaloneView(false);
                  setScreen('menu');
                } else {
                  setScreen('pet_select');
                }
              }}
              onBack={() => {
                setStandaloneView(false);
                setScreen(standaloneView ? 'menu' : 'level_select');
              }}
            />
          )}
          {screen === 'pet_select' && (
            <PetSelect
              ownedPets={save.saveData.ownedPets}
              selectedPet={save.saveData.selectedPet}
              standalone={standaloneView}
              onSelect={(petId) => {
                save.selectPet(petId);
                if (standaloneView) {
                  setStandaloneView(false);
                  setScreen('menu');
                } else {
                  startLevel(currentChapter, currentLevel, save.saveData.equippedItems);
                }
              }}
              onBack={() => {
                if (standaloneView) {
                  setStandaloneView(false);
                  setScreen('menu');
                } else {
                  setScreen('item_select');
                }
              }}
            />
          )}
          {screen === 'character_select' && (
            <CharacterSelect
              selectedCharacterId={save.saveData.selectedCharacter}
              totalShards={save.saveData.totalShards}
              isCharacterUnlocked={save.isCharacterUnlocked}
              onSelect={save.selectChar}
              onUnlock={save.unlockChar}
              onBack={() => setScreen('menu')}
            />
          )}
        </div>
      )}

      {/* Game overlays (rendered on top of Phaser canvas) */}
      {showGame && gameState === 'paused' && (
        <PauseOverlay
          onResume={() => EventBus.emit(EVENTS.RESUME)}
          onRestart={() => EventBus.emit(EVENTS.RESTART)}
          onBackToLevels={handleBackToLevels}
          onBackToMenu={handleBackToMenu}
        />
      )}
      {showGame && gameState === 'game_over' && (
        <GameOverOverlay
          score={gameOverData.score}
          bestScore={gameOverData.bestScore}
          onRestart={() => EventBus.emit(EVENTS.RESTART)}
          onBackToLevels={handleBackToLevels}
        />
      )}
      {showGame && gameState === 'result' && (
        <LevelCompleteOverlay
          score={completeData.score}
          shards={completeData.shards}
          totalShards={3}
          lives={completeData.lives}
          stars={completeData.stars}
          chapter={currentChapter}
          level={currentLevel}
          onNextLevel={handleNextLevel}
          onBackToLevels={handleBackToLevels}
        />
      )}

      {/* Back button in game */}
      {showGame && (gameState === 'playing' || gameState === 'paused') && (
        <button className="btn-back-game" onClick={handleBackToMenu}>← 菜单</button>
      )}

      {/* Leaderboard overlay */}
      {showLeaderboard && (
        <LeaderboardOverlay onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Achievement toast */}
      {achievementToast && (
        <AchievementToast
          achievement={achievementToast}
          onDismiss={() => setAchievementToast(null)}
        />
      )}
    </div>
  );
}
