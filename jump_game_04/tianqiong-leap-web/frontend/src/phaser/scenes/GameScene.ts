import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { getCharacterById } from '../../constants/characters';
import { getLevelConfig, getChapterData, type LevelConfig, type ChapterData } from '../../constants/levels';
import { isMiniBossLevel } from '../../constants/levels';
import { PLATFORM_TYPE_CONFIGS, type PlatformType } from '../../constants/platformtypes';
import { POWER_UP_CONFIGS, POWER_UP_SPAWN_CHANCE, MAGNET_RADIUS, type PowerUpType } from '../../constants/powerups';
import { ENERGY_PER_SHARD, ENERGY_MAX, NINJA_ART_CONFIGS, type NinjaArtType } from '../../constants/ninjaarts';
import { ENEMY_CONFIGS, ENEMY_SPAWN_CHANCE, ELITE_SPAWN_CHANCE, MINI_BOSS_SPAWN_CHANCE, getAvailableEnemyTypes, type EnemyType } from '../../constants/enemies';
import { WEAPON_CONFIGS, WEAPON_SPAWN_CHANCE, getAvailableWeaponTypes, type WeaponType } from '../../constants/weapons';
import { getItemById, type ItemDef } from '../../constants/items';
import { getPetById, type PetDef } from '../../constants/pets';
import { EventBus } from '../EventBus';
import { EVENTS, type StartLevelPayload } from '../../types/events';
import type { GameState } from '../../types/game';
import { generateAllTextures } from '../renderers/TextureFactory';
import { AudioManager } from '../audio/AudioManager';
import { ParticleSystem } from '../systems/ParticleSystem';
import { BackgroundSystem } from '../systems/BackgroundSystem';
import { EnvironmentSystem } from '../systems/EnvironmentSystem';
import { HUDSystem } from '../systems/HUDSystem';
import { PlayerSystem } from '../systems/PlayerSystem';
import { EnemySystem } from '../systems/EnemySystem';
import { BossSystem } from '../systems/BossSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { PetSystem } from '../systems/PetSystem';

type PlatformSprite = Phaser.GameObjects.TileSprite & {
  passed?: boolean;
  platformType?: PlatformType;
  meltTimer?: number;
  overlaySprite?: Phaser.GameObjects.Image;
};

interface ShardSprite extends Phaser.GameObjects.Image {
  collected?: boolean;
  glowCircle?: Phaser.GameObjects.Arc;
}

const HUD_DEPTH = 100;
const PLAYER_SCREEN_X = 80;

export class GameScene extends Phaser.Scene {
  // Systems (refactored from inline implementations)
  // public for system access (refactor in progress)
  particles!: ParticleSystem;
  private background!: BackgroundSystem;
  private environment!: EnvironmentSystem;
  private hud!: HUDSystem;
  // public for system access (refactor in progress)
  playerSystem!: PlayerSystem;
  // public for system access (refactor in progress)
  enemySystem!: EnemySystem;
  // public for system access (refactor in progress)
  bossSystem!: BossSystem;
  // public for system access (refactor in progress)
  weaponSystem!: WeaponSystem;
  // public for system access (refactor in progress)
  petSystem!: PetSystem;

  // Game objects
  // public for system access (refactor in progress)
  platforms: PlatformSprite[] = [];
  private shardSprites: ShardSprite[] = [];

  // HUD state
  // public for system access (refactor in progress)
  hudNeedsUpdate = false;

  // Audio
  // public for system access (refactor in progress)
  audio!: AudioManager;

  // State
  // public for system access (refactor in progress)
  characterId = 0;
  // public for system access (refactor in progress)
  config!: LevelConfig;
  // public for system access (refactor in progress)
  chapterData!: ChapterData;

  // public for system access (refactor in progress)
  score = 0;
  // public for system access (refactor in progress)
  bestScore = 0;
  // public for system access (refactor in progress)
  shardsCollected = 0;
  // public for system access (refactor in progress)
  totalShards = 3;
  private shardsSpawned = 0;
  private passedPlatformCount = 0;
  // public for system access (refactor in progress)
  speed: number = PHYSICS.STARTING_SPEED;
  // public for system access (refactor in progress)
  distance = 0;
  // public for system access (refactor in progress)
  lives = 3;
  // public for system access (refactor in progress)
  gameState: GameState = 'idle';
  // public for system access (refactor in progress)
  playerWidth = 36 * PHYSICS.WORLD_SCALE;
  // public for system access (refactor in progress)
  playerHeight = 44 * PHYSICS.WORLD_SCALE;
  // public for system access (refactor in progress)
  playerX = 80;
  // public for system access (refactor in progress)
  playerY = 340;

  private lastProgressEmit = 0;

  // Item system
  // public for system access (refactor in progress)
  equippedItems: ItemDef[] = [];
  // public for system access (refactor in progress)
  killCount = 0;
  // public for system access (refactor in progress)
  comboCount = 0;
  // public for system access (refactor in progress)
  stealthTimer = 0;
  // public for system access (refactor in progress)
  autoShieldTimer = 0;
  // public for system access (refactor in progress)
  slowFallActive = false;
  // public for system access (refactor in progress)
  slowFallTimer = 0;
  // public for system access (refactor in progress)
  invincibleTimer = 0;
  // public for system access (refactor in progress)
  swordBeamTimer = 0;
  // public for system access (refactor in progress)
  stunTimer = 0;

  // Pet system
  // public for system access (refactor in progress)
  selectedPet: PetDef | null = null;

  // Power-ups
  private powerUpSprites: { sprite: Phaser.GameObjects.Image; type: PowerUpType; collected: boolean }[] = [];
  private weaponPickups: { sprite: Phaser.GameObjects.Image; type: WeaponType; collected: boolean }[] = [];
  // public for system access (refactor in progress)
  activePowerUps: Map<PowerUpType, number> = new Map();
  // public for system access (refactor in progress)
  hasShield = false;

  // Ninja art
  // public for system access (refactor in progress)
  energy = 0;
  // public for system access (refactor in progress)
  ninjaArtActive = false;
  private ninjaArtTimer = 0;
  // public for system access (refactor in progress)
  ninjaArtType: NinjaArtType | null = null;

  // Camera
  private hudCam: Phaser.Cameras.Scene2D.Camera | null = null;

  // Input
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private wKey!: Phaser.Input.Keyboard.Key;
  private upKey!: Phaser.Input.Keyboard.Key;
  // public for system access (refactor in progress)
  rKey!: Phaser.Input.Keyboard.Key;
  // public for system access (refactor in progress)
  tKey!: Phaser.Input.Keyboard.Key;
  // public for system access (refactor in progress)
  yKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;
  private qKey!: Phaser.Input.Keyboard.Key;
  private sKey!: Phaser.Input.Keyboard.Key;
  private downKey!: Phaser.Input.Keyboard.Key;

  // public for system access (refactor in progress)
  get cameraTargetX(): number {
    return this.playerX - PLAYER_SCREEN_X;
  }

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    generateAllTextures(this);
    this.audio = new AudioManager(this);
    this.particles = new ParticleSystem(this);
    this.background = new BackgroundSystem(this);
    this.environment = new EnvironmentSystem(this);
    this.hud = new HUDSystem(this);
    this.playerSystem = new PlayerSystem(this);
    this.enemySystem = new EnemySystem(this);
    this.bossSystem = new BossSystem(this);
    this.weaponSystem = new WeaponSystem(this);
    this.petSystem = new PetSystem(this);
    this.setupInput();
    this.setupEventListeners();
    this.background.drawIdle();
    EventBus.emit(EVENTS.GAME_READY);
  }

  private setupInput(): void {
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.rKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.tKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    this.yKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.qKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.sKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameState === 'playing') {
        if (pointer.x > PHYSICS.CANVAS_WIDTH - 50 && pointer.y < 50) {
          this.togglePause();
          return;
        }
        this.playerSystem.jump();
      } else if (this.gameState === 'paused') {
        this.resumeGame();
      }
    });
  }

  private setupEventListeners(): void {
    EventBus.on(EVENTS.START_LEVEL, (payload: StartLevelPayload) => {
      this.startLevel(payload.chapter, payload.level, payload.characterId, payload.equippedItems, payload.selectedPet);
    });
    EventBus.on(EVENTS.PAUSE, () => this.pauseGame());
    EventBus.on(EVENTS.RESUME, () => this.resumeGame());
    EventBus.on(EVENTS.RESTART, () => {
      if (this.config) {
        this.startLevel(this.config.chapter, this.config.level, this.characterId);
      }
    });
  }

  private clearGameObjects(): void {
    this.tweens.killAll();

    // Safely destroy game objects
    const safeDestroy = (obj: { active?: boolean; destroy?: () => void } | null | undefined) => {
      try {
        if (obj && obj.active !== false && typeof obj.destroy === 'function') {
          obj.destroy();
        }
      } catch {
        // Object may already be destroyed
      }
    };

    // Destroy tracked objects
    this.platforms.forEach(safeDestroy);
    this.shardSprites.forEach(safeDestroy);
    this.particles.clear();
    this.background.clear();
    this.hud.clear();
    this.environment.clear();
    this.powerUpSprites.forEach(p => safeDestroy(p.sprite));
    this.weaponPickups.forEach(w => safeDestroy(w.sprite));

    // Clear subsystem-owned objects
    this.playerSystem?.clear();
    this.enemySystem?.clear();
    this.bossSystem?.clear();
    this.weaponSystem?.clear();
    this.petSystem?.clear();

    // Reset arrays
    this.platforms = [];
    this.shardSprites = [];
    this.powerUpSprites = [];
    this.weaponPickups = [];

    // Reset state
    this.activePowerUps.clear();
    this.hasShield = false;
    this.energy = 0;
    this.ninjaArtActive = false;
    this.ninjaArtTimer = 0;
    this.ninjaArtType = null;
    this.lastProgressEmit = 0;
    this.audio.stopBGM();
  }

  private startLevel(chapter: number, level: number, characterId: number, equippedItemIds?: string[], selectedPetId?: string | null): void {
    // Guard: ensure scene is ready
    if (!this.add || !this.children) {
      console.warn('GameScene not ready, deferring startLevel');
      this.time.delayedCall(100, () => this.startLevel(chapter, level, characterId, equippedItemIds, selectedPetId));
      return;
    }

    this.characterId = characterId;
    this.config = getLevelConfig(chapter, level);
    this.chapterData = getChapterData(chapter);

    this.score = 0;
    this.shardsCollected = 0;
    this.totalShards = this.config.shardCount;
    this.shardsSpawned = 0;
    this.passedPlatformCount = 0;
    this.distance = 0;
    this.lives = 3;
    this.playerSystem.jumpCount = 0;
    this.playerSystem.isGrounded = false;
    this.playerSystem.playerVY = 0;
    this.speed = PHYSICS.STARTING_SPEED * this.config.speedMultiplier * getCharacterById(characterId).speedMultiplier;
    this.gameState = 'playing';
    this.playerX = 80;
    this.playerY = 340;

    // ── Resolve equipped items ──
    this.equippedItems = (equippedItemIds ?? []).map(id => getItemById(id)).filter((d): d is ItemDef => !!d);
    this.killCount = 0;
    this.comboCount = 0;
    this.stealthTimer = 0;
    this.autoShieldTimer = 0;
    
    this.slowFallActive = false;
    this.slowFallTimer = 0;
    this.invincibleTimer = 0;
    this.swordBeamTimer = 0;
    this.stunTimer = 0;

    // Apply passive item effects on start
    for (const item of this.equippedItems) {
      const e = item.effect;
      if (e.type !== 'passive') continue;
      if (e.stat === 'shield') {  this.hasShield = true; }
      if (e.stat === 'speed') { this.speed *= (1 + (e.value ?? 0)); }
      if (e.stat === 'game_speed') { this.speed *= (1 + (e.value ?? 0)); }
      if (e.stat === 'stealth') { this.stealthTimer = e.value ?? 5000; }
      if (e.stat === 'auto_shield') { this.autoShieldTimer = e.value ?? 30000; }
      if (e.stat === 'revive') {
        // Fairy item handles revive on fall/death automatically
      }
    }

    // ── Resolve pet ──
    this.selectedPet = selectedPetId ? (getPetById(selectedPetId) ?? null) : null;
    this.petSystem.petActiveCooldown = 0;
    this.petSystem.petTCooldown = 0;
    this.petSystem.petUltCooldown = 0;

    // Apply pet passive stats
    if (this.selectedPet) {
      const ps = this.selectedPet.stats;
      this.speed *= (1 + ps.speedBonus / 100);
      if (this.selectedPet.passive.type === 'speed_boost') {
        this.speed *= (1 + this.selectedPet.passive.value);
      }
      if (this.selectedPet.passive.type === 'regen') {
        // Handled in update loop
      }
    }

    this.clearGameObjects();
    this.background.create();
    this.playerSystem.create();
    this.petSystem.create();
    this.generateInitialPlatforms();
    this.setupCamera();
    this.hud.create();
    this.audio.startBGM(chapter);
    this.environment.init(chapter);

    const mainCam = this.cameras.main;
    const hudElements = this.children.list.filter(c => (c as unknown as { depth?: number }).depth !== undefined && (c as unknown as { depth: number }).depth >= HUD_DEPTH);
    mainCam.ignore(hudElements);

    this.hudNeedsUpdate = true;
    EventBus.emit(EVENTS.GAME_STATE_CHANGED, 'playing');
  }

  // ========== Camera ==========
  private setupCamera(): void {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, Number.MAX_SAFE_INTEGER, PHYSICS.CANVAS_HEIGHT + Math.abs(PHYSICS.CAMERA_SCROLL_Y) + 200);
    cam.startFollow(this.playerSystem.player, false, 0.15, 0.1);
    cam.setFollowOffset(-PHYSICS.CANVAS_WIDTH / 2 + PLAYER_SCREEN_X, Math.round(PHYSICS.CANVAS_HEIGHT * 0.3));
    cam.scrollX = 0;
    cam.scrollY = PHYSICS.CAMERA_SCROLL_Y;
    cam.setLerp(0.15, 0.1);

    if (!this.hudCam) {
      this.hudCam = this.cameras.add(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);
    }
    this.hudCam.setScroll(0, 0);
    this.hudCam.ignore(this.children.list.filter(c => {
      const d = (c as unknown as { depth?: number }).depth;
      return d === undefined || d < HUD_DEPTH;
    }));
  }

  // ========== Platforms ==========
  // public for system access (refactor in progress)
  spawnPlatform(x: number, y: number, width: number): PlatformSprite {
    const texKey = `platform-${this.config.chapter}`;
    const h = PHYSICS.PLATFORM_HEIGHT + 8;
    const plat = this.add.tileSprite(x + width / 2, y + h / 2, width, h, texKey) as unknown as PlatformSprite;
    plat.setDepth(1);
    plat.passed = false;

    // Assign platform type based on chapter
    const ch = this.config.chapter;
    let pType: PlatformType = 'normal';
    if (ch === 4 && Math.random() < PLATFORM_TYPE_CONFIGS.liquid_metal.spawnChance) {
      pType = 'liquid_metal';
    } else if (ch === 5 && Math.random() < PLATFORM_TYPE_CONFIGS.ice.spawnChance) {
      pType = 'ice';
    } else if (ch === 6 && Math.random() < PLATFORM_TYPE_CONFIGS.melting.spawnChance) {
      pType = 'melting';
    } else if (ch === 9 && Math.random() < PLATFORM_TYPE_CONFIGS.invisible.spawnChance) {
      pType = 'invisible';
    } else if (ch === 10) {
      const roll = Math.random();
      if (roll < 0.25) {
        const sub = Math.random();
        if (sub < 0.6) pType = 'invisible';       // Dark theme: mostly invisible
        else if (sub < 0.8) pType = 'melting';
        else pType = 'ice';
      }
    }
    plat.platformType = pType;

    // Add overlay for special platforms
    if (pType === 'ice') {
      const overlay = this.add.image(plat.x, plat.y, 'overlay-ice');
      overlay.setDisplaySize(width, h);
      overlay.setDepth(2);
      overlay.setAlpha(0.6);
      plat.overlaySprite = overlay;
    } else if (pType === 'melting') {
      plat.meltTimer = 0;
      const overlay = this.add.image(plat.x, plat.y, 'overlay-melting');
      overlay.setDisplaySize(width, h + 12);
      overlay.setDepth(2);
      overlay.setAlpha(0.5);
      plat.overlaySprite = overlay;
    } else if (pType === 'invisible') {
      plat.setAlpha(0);
      if (plat.overlaySprite) plat.overlaySprite.setAlpha(0);
    } else if (pType === 'liquid_metal') {
      const overlay = this.add.image(plat.x, plat.y, 'overlay-liquid_metal');
      overlay.setDisplaySize(width, h);
      overlay.setDepth(2);
      overlay.setAlpha(0.5);
      plat.overlaySprite = overlay;
    }

    this.platforms.push(plat);
    return plat;
  }

  private generateInitialPlatforms(): void {
    const startY = 350;
    const platformCount = this.config.initialPlatformCount ?? PHYSICS.INITIAL_PLATFORM_COUNT;
    this.spawnPlatform(0, startY, 400);

    let lastCX = 200;
    let lastTopY = startY;
    let lastW = 400;

    const shardIndices = this.config.shardPlatformIndices;

    for (let i = 1; i < platformCount; i++) {
      const { x, y, w } = this.calcNextPlatform(lastCX, lastTopY, lastW, i);
      this.spawnPlatform(x, y, w);

      if (shardIndices && shardIndices.includes(i) && this.shardsSpawned < this.totalShards) {
        this.spawnShard(x + w / 2, y - 35);
      } else if (!shardIndices && this.shardsSpawned < this.totalShards && Math.random() < 0.5) {
        this.spawnShard(x + w / 2, y - 35);
      }
      if (Math.random() < POWER_UP_SPAWN_CHANCE) {
        this.spawnPowerUp(x + w / 2, y - 50);
      }
      if (Math.random() < WEAPON_SPAWN_CHANCE) {
        this.spawnWeaponPickup(x + w / 2, y - 65);
      }
      if (i > 1) {
        const spawnChance = Math.max(this.config.enemySpawnChance ?? 0, ENEMY_SPAWN_CHANCE);
        if (Math.random() < spawnChance) {
          const et = this.enemySystem.pickType();
          const ey = et === 'flyer' ? y - 50 : y - 15;
          this.enemySystem.spawn(x + w / 2, ey, et);
        }
      }

      lastCX = x + w / 2;
      lastTopY = y;
      lastW = w;
    }
  }

  private ensurePlatforms(): void {
    const camRight = this.cameraTargetX + PHYSICS.CANVAS_WIDTH + PHYSICS.PLATFORM_SPAWN_BUFFER;
    const estimatedTotal = Math.max(10, this.config.targetDistance / 180);

    for (let safety = 0; safety < 5; safety++) {
      const last = this.platforms[this.platforms.length - 1];
      if (!last) break;

      const lastRight = last.x + last.width / 2;
      if (lastRight >= camRight) break;

      const lastTopY = last.y - (PHYSICS.PLATFORM_HEIGHT + 8) / 2;
      const idx = this.platforms.length;
      const { x, y, w } = this.calcNextPlatform(last.x, lastTopY, last.width, idx);

      this.spawnPlatform(x, y, w);

      const shardIndices = this.config.shardPlatformIndices;
      if (shardIndices && shardIndices.includes(idx) && this.shardsSpawned < this.totalShards) {
        this.spawnShard(x + w / 2, y - 35);
      } else if (!shardIndices) {
        const shardUrgent = idx > estimatedTotal * 0.4 && this.shardsSpawned < this.totalShards;
        if (this.shardsSpawned < this.totalShards && (shardUrgent || Math.random() < 0.30)) {
          this.spawnShard(x + w / 2, y - 35);
        }
      }
      if (Math.random() < POWER_UP_SPAWN_CHANCE) {
        this.spawnPowerUp(x + w / 2, y - 50);
      }
      if (Math.random() < WEAPON_SPAWN_CHANCE) {
        this.spawnWeaponPickup(x + w / 2, y - 65);
      }
      // Basic enemies — config-driven or chapter-based
      const spawnChance = Math.max(this.config.enemySpawnChance ?? 0, ENEMY_SPAWN_CHANCE);
      if (idx >= 5 && Math.random() < spawnChance) {
        const et = this.enemySystem.pickType();
        const ey = et === 'flyer' ? y - 50 : y - 15;
        this.enemySystem.spawn(x + w / 2, ey, et);
      }
      // Advanced enemies (charger/bomber) — from idx 8+
      if (idx >= 8 && Math.random() < ENEMY_SPAWN_CHANCE * 0.4) {
        const advTypes = getAvailableEnemyTypes(this.config.chapter).filter(
          t => t === 'charger' || t === 'bomber'
        );
        if (advTypes.length > 0) {
          const et = advTypes[Math.floor(Math.random() * advTypes.length)];
          this.enemySystem.spawn(x + w / 2, y - 15, et);
        }
      }
      // Elite enemies — from idx 12+
      if (idx >= 12 && Math.random() < ELITE_SPAWN_CHANCE) {
        const eliteTypes: EnemyType[] = ['elite_charger', 'elite_fire', 'elite_ice', 'elite_shadow', 'elite_crystal'];
        const available = eliteTypes.filter(t => {
          const cfg = ENEMY_CONFIGS[t];
          return cfg && cfg.chapters.includes(this.config.chapter);
        });
        if (available.length > 0) {
          const et = available[Math.floor(Math.random() * available.length)];
          this.enemySystem.spawn(x + w / 2, y - 15, et);
        }
      }
      // Mini boss — from idx 18+, 15% on levels 5/9, otherwise 3%
      const miniBossChance = isMiniBossLevel(this.config.level) ? 0.15 : MINI_BOSS_SPAWN_CHANCE;
      if (idx >= 18 && Math.random() < miniBossChance) {
        this.enemySystem.spawn(x + w / 2, y - 20, 'mini_boss');
      }
    }
  }

  // ========== Jump Physics Helpers ==========
  private calcJumpMetrics(): { maxReach: number; maxHeight: number } {
    const char = getCharacterById(this.characterId);
    const gravity = PHYSICS.GRAVITY * this.chapterData.gravityMultiplier;
    const jumpV = Math.abs(PHYSICS.JUMP_FORCE * char.jumpMultiplier);
    const airTime = 2 * jumpV / gravity;
    const maxReach = this.speed * airTime;
    // Apply 0.85 safety factor: discrete Euler integration produces ~85% of continuous height
    const maxHeight = (jumpV * jumpV) / (2 * gravity) * 0.85;
    return { maxReach, maxHeight };
  }

  private calcNextPlatform(
    lastCenterX: number,
    lastTopY: number,
    lastWidth: number,
    platformIndex: number,
  ): { x: number; y: number; w: number } {
    const { maxReach, maxHeight } = this.calcJumpMetrics();
    const gapMult = this.config.platformGapMultiplier;
    const estimatedTotal = Math.max(10, this.config.targetDistance / 180);
    const difficulty = Math.min(1, platformIndex / estimatedTotal);
    const isWarmup = platformIndex < 4;
    const ch = this.config.chapter;

    // Chapter-specific gap/width modifiers
    let gapMod = 1.0;
    let widthMod = 1.0;
    if (ch === 2) { gapMod = 1.2; }           // Low gravity: wider gaps
    else if (ch === 5) { widthMod = 1.25; }    // Ice: wider platforms for sliding
    else if (ch === 9) { gapMod = 0.85; }      // Invisible: tighter gaps as anchors

    const baseGap = isWarmup ? 50 : 60 + difficulty * 60;
    const rawGap = baseGap * gapMult * gapMod * (0.85 + Math.random() * 0.3);
    const gap = Math.min(maxReach * 0.65, rawGap);

    const baseW = isWarmup ? 220 : Math.max(90, 170 - difficulty * 50);
    const w = Math.max(70, (baseW + (Math.random() - 0.5) * 40) * widthMod);

    const maxRise = maxHeight * (isWarmup ? 0.15 : 0.4);
    const maxDrop = isWarmup ? 30 : maxHeight * 0.5;
    const rawDy = (Math.random() - 0.4) * (maxRise + maxDrop) - maxDrop * 0.2;
    const dy = Phaser.Math.Clamp(rawDy, -maxDrop, maxRise);
    const y = Phaser.Math.Clamp(lastTopY + dy, PHYSICS.PLATFORM_Y_MIN, PHYSICS.PLATFORM_Y_MAX);

    const lastRight = lastCenterX + lastWidth / 2;
    return { x: lastRight + gap, y, w };
  }

  // ========== Power-ups ==========
  private spawnPowerUp(x: number, y: number): void {
    const types = Object.keys(POWER_UP_CONFIGS) as PowerUpType[];
    const type = types[Math.floor(Math.random() * types.length)];
    const sprite = this.add.image(x, y, `pu-${type}`);
    sprite.setDisplaySize(20, 20);
    sprite.setDepth(6);
    this.powerUpSprites.push({ sprite, type, collected: false });
  }

  private collectPowerUp(type: PowerUpType): void {
    const cfg = POWER_UP_CONFIGS[type];

    switch (type) {
      case 'shield':
        this.hasShield = true;
        break;
      case 'heal':
        // Instant heal: restore 30% life
        if (this.lives < 3) {
          this.lives = Math.min(3, this.lives + 1);
          this.particles.spawn(0xff4040, 8, 3, 3);
        }
        break;
      case 'energy':
        // Instant energy restore: add 50 energy
        this.energy = Math.min(ENERGY_MAX, this.energy + ENERGY_MAX * 0.5);
        this.particles.spawn(0x6bb8e8, 8, 3, 3);
        break;
      case 'revive':
        // Revive token: will trigger on death
        this.activePowerUps.set(type, 0); // 0 = permanent until used
        break;
      case 'xray':
        // X-ray vision: show hidden platforms
        this.activePowerUps.set(type, cfg.duration);
        // TODO: Implement x-ray visibility logic
        break;
      default:
        // Timed power-ups
        this.activePowerUps.set(type, cfg.duration);
        break;
    }

    this.audio.powerup();
    this.hudNeedsUpdate = true;
  }

  // ========== Shards ==========
  private spawnShard(x: number, y: number): void {
    const glow = this.add.circle(x, y, 12, 0xffd980, 0.3);
    glow.setDepth(4);

    const shard = this.add.image(x, y, 'shard') as ShardSprite;
    shard.setDisplaySize(16, 16);
    shard.setDepth(5);
    shard.collected = false;
    shard.glowCircle = glow;

    this.shardSprites.push(shard);
  }

  // ========== Game State ==========
  private pauseGame(): void {
    if (this.gameState !== 'playing') return;
    this.gameState = 'paused';
    EventBus.emit(EVENTS.GAME_STATE_CHANGED, 'paused');
  }

  private resumeGame(): void {
    if (this.gameState !== 'paused') return;
    this.gameState = 'playing';
    EventBus.emit(EVENTS.GAME_STATE_CHANGED, 'playing');
  }

  // public for system access (refactor in progress)
  togglePause(): void {
    if (this.gameState === 'playing') {
      this.pauseGame();
    } else if (this.gameState === 'paused') {
      this.resumeGame();
    }
  }

  // public for system access (refactor in progress)
  onPlayerFall(): void {
    this.playerSystem.fall();
  }

  // ========== Item: Enemy Kill Tracking ==========
  // public for system access (refactor in progress)
  onEnemyKilled(): void {
    this.killCount++;
    this.comboCount++;

    // charm_vampire: every 5 kills restore 1 life
    for (const item of this.equippedItems) {
      if (item.effect.type === 'on_kill' && item.effect.stat === 'lifesteal') {
        const threshold = item.effect.value ?? 5;
        if (this.killCount % threshold === 0 && this.lives < 3) {
          this.lives++;
          this.hudNeedsUpdate = true;
          this.particles.spawn(0xc62828, 8, 4, 3);
        }
      }
      // triforce_power: kill refreshes jump
      if (item.effect.type === 'on_kill' && item.effect.stat === 'refresh_jump') {
        this.playerSystem.jumpCount = 0;
      }
    }
  }

  // public for system access (refactor in progress)
  emitLevelComplete(stars: number): void {
    this.gameState = 'result';
    if (this.score > this.bestScore) this.bestScore = this.score;
    this.audio.stopBGM();
    this.audio.levelComplete();
    EventBus.emit(EVENTS.LEVEL_COMPLETE, {
      score: this.score,
      shards: this.shardsCollected,
      lives: this.lives,
      stars,
    });
    EventBus.emit(EVENTS.GAME_STATE_CHANGED, 'result');
  }

  // ========== Main Update Loop ==========
  update(_time: number, delta: number): void {
    if (this.gameState !== 'playing') {
      if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
        this.togglePause();
      }
      if (Phaser.Input.Keyboard.JustDown(this.rKey) && (this.gameState === 'game_over' || this.gameState === 'result')) {
        this.startLevel(this.config.chapter, this.config.level, this.characterId);
      }
      if (this.particles.count > 0) {
        this.particles.update(Math.min(delta, 32) / 16.67);
      }
      return;
    }

    const normalized = Math.min(delta, 32) / 16.67;

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this.wKey) ||
        Phaser.Input.Keyboard.JustDown(this.upKey)) {
      this.playerSystem.jump();
    }
    if (!this.playerSystem.isGrounded && (this.sKey.isDown || this.downKey.isDown)) {
      this.playerSystem.playerVY += 0.8 * normalized;
    }
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.tryActivateNinjaArt();
    }
    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      this.playerSystem.useConsumable();
    }
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.pauseGame();
      return;
    }

    const slowTimeActive = this.activePowerUps.has('slowtime');
    const speedFactor = slowTimeActive ? 0.5 : 1.0;
    const maxSpeed = PHYSICS.MAX_SPEED * this.config.speedMultiplier * speedFactor;
    this.speed = Math.min(maxSpeed, this.speed + PHYSICS.SPEED_RAMP * normalized);

    // ── Item effect timers ──
    if (this.stealthTimer > 0) { this.stealthTimer -= delta; }
    if (this.invincibleTimer > 0) { this.invincibleTimer -= delta; }
    if (this.stunTimer > 0) { this.stunTimer -= delta; }
    if (this.slowFallActive) {
      this.slowFallTimer -= delta;
      if (this.slowFallTimer <= 0) this.slowFallActive = false;
    }
    // Auto shield (hylian_shield)
    if (this.autoShieldTimer > 0) {
      this.autoShieldTimer -= delta;
      if (this.autoShieldTimer <= 0 && !this.hasShield) {
        this.hasShield = true;
        
        this.hudNeedsUpdate = true;
        this.particles.spawn(0x1565c0, 8, 4, 3);
        this.autoShieldTimer = 30000; // Reset timer
      }
    }
    // Sword beam (master_sword) — auto fire every 800ms
    this.swordBeamTimer += delta;
    if (this.equippedItems.some(i => i.effect.stat === 'sword_beam') && this.swordBeamTimer > 800) {
      this.swordBeamTimer = 0;
      const beam = this.add.image(this.playerX + 20, this.playerY, 'bullet-laser');
      beam.setDisplaySize(20, 4);
      beam.setDepth(15);
      this.weaponSystem.playerBullets.push({ sprite: beam, vx: 8, vy: 0, config: { ...WEAPON_CONFIGS.laser, piercing: true }, pierced: 0, age: 0 });
    }

    // Apply slow fall gravity reduction
    let gravityMult = this.chapterData.gravityMultiplier;
    if (this.slowFallActive && this.playerSystem.playerVY > 0) {
      gravityMult *= 0.4;
    }

    this.playerSystem.playerVY += PHYSICS.GRAVITY * gravityMult * normalized;
    this.playerY += this.playerSystem.playerVY * normalized;

    if (this.playerY < this.playerHeight / 2) {
      this.playerY = this.playerHeight / 2;
      this.playerSystem.playerVY = 0;
    }

    const deathY = PHYSICS.CANVAS_HEIGHT;
    if (!this.playerSystem.dead && this.playerY > deathY) {
      this.onPlayerFall();
      return;
    }

    const speedPx = this.speed * normalized;
    this.playerX += speedPx;
    this.distance += speedPx;

    // Chapter 5: Global ice inertia on all platforms
    if (this.config.chapter === 5 && this.playerSystem.isGrounded) {
      this.playerSystem.iceSlideVX = Math.max(this.playerSystem.iceSlideVX, this.speed * 0.3);
    }

    if (this.playerSystem.isGrounded && this.playerSystem.iceSlideVX > 0) {
      this.playerX += this.playerSystem.iceSlideVX * normalized;
      this.playerSystem.iceSlideVX *= 0.96; // friction decay
      if (this.playerSystem.iceSlideVX < 0.1) this.playerSystem.iceSlideVX = 0;
    }
    if (!this.playerSystem.isGrounded) {
      this.playerSystem.iceSlideVX *= 0.9;
    }

    // Prevent player from going off-screen to the left
    const camLeft = this.cameras.main.scrollX;
    if (this.playerX < camLeft + 20) {
      this.playerX = camLeft + 20;
    }

    for (const s of this.shardSprites) {
      if (!s.collected && s.active) {
        s.rotation += 0.05 * normalized;
      }
    }

    if (!this.playerSystem.isGrounded && this.playerSystem.jumpCount === 0 && this.playerY < PHYSICS.CANVAS_HEIGHT * 0.8) {
      this.playerSystem.jumpCount = 1;
    }

    // Platform collision
    this.playerSystem.isGrounded = false;
    const playerBottom = this.playerY + this.playerHeight / 2;
    const playerLeft = this.playerX - this.playerWidth / 2 + PHYSICS.COLLISION_X_INSET;
    const playerRight = this.playerX + this.playerWidth / 2 - PHYSICS.COLLISION_X_INSET;
    const collisionLeft = this.playerX - 300;
    const collisionRight = this.playerX + 100;

    for (const plat of this.platforms) {
      const platRight = plat.x + plat.width / 2;
      if (platRight < collisionLeft) continue;
      const platLeft = plat.x - plat.width / 2;
      if (platLeft > collisionRight) continue;
      const platTop = plat.y - plat.height / 2;

      if (this.playerSystem.playerVY >= 0 &&
          playerRight > platLeft && playerLeft < platRight &&
          playerBottom >= platTop && playerBottom <= platTop + Math.max(this.playerSystem.playerVY * normalized, 8)) {
        this.playerY = platTop - this.playerHeight / 2;
        this.playerSystem.playerVY = 0;
        this.playerSystem.isGrounded = true;
        if (this.playerSystem.jumpCount > 0) {
          this.particles.spawn(0xffffff, PHYSICS.LAND_PARTICLE_COUNT, 3, 2);
          this.audio.land();
        }
        this.playerSystem.jumpCount = 0;

        if (plat.platformType === 'ice' && this.playerSystem.isGrounded) {
          this.playerSystem.iceSlideVX = this.speed * 1.5;
        }

        if (plat.platformType === 'melting' && plat.meltTimer !== undefined) {
          plat.meltTimer += delta;
          const meltCfg = PLATFORM_TYPE_CONFIGS.melting;
          const progress = plat.meltTimer / meltCfg.meltTime;
          if (plat.overlaySprite) plat.overlaySprite.setAlpha(0.5 + progress * 0.5);
          plat.setAlpha(1 - progress * 0.6);
          if (plat.meltTimer >= meltCfg.meltTime) {
            plat.destroy();
            if (plat.overlaySprite) plat.overlaySprite.destroy();
            const idx = this.platforms.indexOf(plat);
            if (idx >= 0) this.platforms.splice(idx, 1);
          }
        }
      }

      if (!plat.passed && platRight < this.playerX) {
        plat.passed = true;
        this.passedPlatformCount++;
      }
    }

    const magnetActive = this.activePowerUps.has('magnet');
    const collectThreshold = (16 + this.playerWidth * 0.5) ** 2;

    // Item: magnet range bonus
    let magnetRangeMult = 1.0;
    for (const item of this.equippedItems) {
      if (item.effect.type === 'passive' && item.effect.stat === 'magnet_range') {
        magnetRangeMult += item.effect.value ?? 0;
      }
    }
    const magnetThreshold = MAGNET_RADIUS * MAGNET_RADIUS * magnetRangeMult * magnetRangeMult;
    for (let i = this.shardSprites.length - 1; i >= 0; i--) {
      const s = this.shardSprites[i];
      if (s.collected || !s.active) continue;
      const dx = this.playerX - s.x;
      const dy = this.playerY - s.y;
      const distSq = dx * dx + dy * dy;

      // Magnet: pull shards toward player
      if (magnetActive && distSq < magnetThreshold) {
        const pull = 0.08;
        s.x += dx * pull;
        s.y += dy * pull;
        if (s.glowCircle) {
          s.glowCircle.x = s.x;
          s.glowCircle.y = s.y;
        }
      }

      if (distSq < collectThreshold) {
        s.collected = true;
        this.shardsCollected++;
        this.energy = Math.min(ENERGY_MAX, this.energy + ENERGY_PER_SHARD);
        this.hudNeedsUpdate = true;
        s.destroy();
        if (s.glowCircle) s.glowCircle.destroy();
        this.shardSprites.splice(i, 1);
        this.audio.shard();
        EventBus.emit(EVENTS.SHARD_COLLECTED, { count: this.shardsCollected, total: this.totalShards });

        // Item: triforce_wisdom — collect 3 shards → invincible 1s
        for (const item of this.equippedItems) {
          if (item.effect.type === 'on_collect' && item.effect.stat === 'invincible_on_collect') {
            if (this.shardsCollected % 3 === 0) {
              this.invincibleTimer = item.effect.value ?? 1000;
              this.particles.spawn(0x2979ff, 10, 5, 4);
            }
          }
        }
      }
    }

    const puCollectThreshold = (20 + this.playerWidth * 0.5) ** 2;
    for (let i = this.powerUpSprites.length - 1; i >= 0; i--) {
      const pu = this.powerUpSprites[i];
      if (pu.collected || !pu.sprite.active) continue;
      const dx = this.playerX - pu.sprite.x;
      const dy = this.playerY - pu.sprite.y;
      if (dx * dx + dy * dy < puCollectThreshold) {
        pu.collected = true;
        pu.sprite.destroy();
        this.powerUpSprites.splice(i, 1);
        this.collectPowerUp(pu.type);
      }
    }

    for (let i = this.weaponPickups.length - 1; i >= 0; i--) {
      const wp = this.weaponPickups[i];
      if (wp.collected || !wp.sprite.active) continue;
      const dx = this.playerX - wp.sprite.x;
      const dy = this.playerY - wp.sprite.y;
      if (dx * dx + dy * dy < puCollectThreshold) {
        wp.collected = true;
        wp.sprite.destroy();
        this.weaponPickups.splice(i, 1);
        this.collectWeapon(wp.type);
      }
    }

    for (const [type, remaining] of this.activePowerUps) {
      const newTime = remaining - delta;
      if (newTime <= 0) {
        this.activePowerUps.delete(type);
        this.hudNeedsUpdate = true;
      } else {
        this.activePowerUps.set(type, newTime);
      }
    }

    const cullLeft = this.cameraTargetX + PHYSICS.PLATFORM_CULL_X;
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const plat = this.platforms[i];
      if (plat.x + plat.width / 2 < cullLeft) {
        if (plat.overlaySprite) plat.overlaySprite.destroy();
        plat.destroy();
        this.platforms.splice(i, 1);
      }
    }
    this.shardSprites = this.shardSprites.filter(s => {
      if (s.x < cullLeft - 50 || !s.active) {
        if (s.glowCircle && s.glowCircle.active) s.glowCircle.destroy();
        return false;
      }
      return true;
    });

    for (let i = this.powerUpSprites.length - 1; i >= 0; i--) {
      const pu = this.powerUpSprites[i];
      if (pu.sprite.x < cullLeft - 50 || !pu.sprite.active) {
        pu.sprite.destroy();
        this.powerUpSprites.splice(i, 1);
      }
    }

    for (let i = this.weaponPickups.length - 1; i >= 0; i--) {
      const wp = this.weaponPickups[i];
      if (wp.sprite.x < cullLeft - 50 || !wp.sprite.active) {
        wp.sprite.destroy();
        this.weaponPickups.splice(i, 1);
      }
    }

    if (this.distance < this.config.targetDistance - 400) {
      this.ensurePlatforms();
    }

    const newScore = Math.max(
      this.passedPlatformCount * PHYSICS.SCORE_PER_PLATFORM,
      Math.floor(this.distance / PHYSICS.DISTANCE_SCORE_DIVISOR),
    );
    if (newScore !== this.score) {
      this.score = newScore;
      this.hudNeedsUpdate = true;
      EventBus.emit(EVENTS.SCORE_CHANGED, { score: this.score });
    }

    // Throttle progress emission to every ~50px
    if (Math.abs(this.distance - this.lastProgressEmit) > 50) {
      this.lastProgressEmit = this.distance;
      EventBus.emit(EVENTS.PROGRESS_CHANGED, { distance: this.distance, target: this.config.targetDistance });
    }

    this.playerSystem.checkWin();

    this.playerSystem.updateVisuals(normalized);
    this.petSystem.update(delta, normalized);
    this.particles.update(normalized);
    this.updatePlatformTypes();
    this.updateNinjaArt(delta);
    this.weaponSystem.shoot();
    this.weaponSystem.updateBullets(normalized);
    this.enemySystem.update(delta, normalized);
    this.enemySystem.updateBullets(normalized);
    this.bossSystem.update(delta, normalized);
    this.hud.update();

    // Chapter-specific environment effects
    this.environment.update(delta, normalized);
  }

  // ========== Boss Defeat ==========
  // public for system access (refactor in progress)
  onBossDefeated(): void {
    if (!this.bossSystem.boss) return;
    // Explosion particles
    for (let i = 0; i < 20; i++) {
      const px = this.bossSystem.boss.sprite.x + (Math.random() - 0.5) * 60;
      const py = this.bossSystem.boss.sprite.y + (Math.random() - 0.5) * 60;
      const p = this.add.circle(px, py, 3 + Math.random() * 4, 0xff4400, 0.8);
      p.setDepth(30);
      this.particles.push(p, { vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 4, life: 40 });
    }
    this.bossSystem.boss.sprite.destroy();
    this.bossSystem.boss = null;
    if (this.bossSystem.bossHpBar) { this.bossSystem.bossHpBar.destroy(); this.bossSystem.bossHpBar = null; }
    this.score += 500;
    this.hudNeedsUpdate = true;
    this.emitLevelComplete(3);
  }

  // ========== Ninja Art ==========
  private tryActivateNinjaArt(): void {
    if (this.ninjaArtActive || this.energy < ENERGY_MAX) return;

    const artType = Object.values(NINJA_ART_CONFIGS).find(a => a.characterId === this.characterId);
    if (!artType) return;

    this.energy = 0;
    this.ninjaArtActive = true;
    this.ninjaArtTimer = artType.duration;
    this.ninjaArtType = artType.type;
    this.hudNeedsUpdate = true;

    const flash = this.add.graphics();
    flash.setDepth(50);
    flash.setScrollFactor(0);
    flash.fillStyle(artType.color, 0.3);
    flash.fillRect(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    if (artType.type === 'freeze' || artType.type === 'timestop') {
      for (const e of this.enemySystem.enemies) e.frozen = true;
      for (const b of this.enemySystem.bullets) {
        if (artType.type === 'freeze') {
          b.sprite.setTexture('bullet-frozen');
          b.vx *= 0.1;
          b.vy *= 0.1;
        } else {
          b.vx = 0;
          b.vy = 0;
        }
      }
    }

    if (artType.type === 'freeze') {
      const effect = this.add.image(PHYSICS.CANVAS_WIDTH / 2, PHYSICS.CANVAS_HEIGHT / 2, 'ninja-freeze');
      effect.setDepth(45);
      effect.setScrollFactor(0);
      effect.setAlpha(0.6);
      effect.setScale(2);
      this.tweens.add({
        targets: effect,
        alpha: 0,
        scale: 3,
        duration: artType.duration,
        onComplete: () => effect.destroy(),
      });
    }
  }

  private updateNinjaArt(delta: number): void {
    if (!this.ninjaArtActive) return;

    this.ninjaArtTimer -= delta;
    if (this.ninjaArtTimer <= 0) {
      this.ninjaArtActive = false;
      this.ninjaArtType = null;
      this.hudNeedsUpdate = true;
      for (const e of this.enemySystem.enemies) e.frozen = false;
      return;
    }

    if (this.ninjaArtType === 'freeze' || this.ninjaArtType === 'timestop') {
      // Only freeze newly spawned enemies/bullets
      for (const e of this.enemySystem.enemies) e.frozen = true;
      for (const b of this.enemySystem.bullets) {
        if (this.ninjaArtType === 'freeze') {
          b.vx *= 0.95;
          b.vy *= 0.95;
        } else {
          b.vx = 0;
          b.vy = 0;
        }
      }
    } else if (this.ninjaArtType === 'dash') {
      this.playerX += 8;
      this.distance += 8;
      const trail = this.add.image(this.playerX - 20, this.playerY, `player-${this.characterId}`);
      trail.setScale(PHYSICS.WORLD_SCALE);
      trail.setAlpha(0.5);
      trail.setDepth(19);
      this.tweens.add({
        targets: trail,
        alpha: 0,
        duration: 300,
        onComplete: () => trail.destroy(),
      });
    } else if (this.ninjaArtType === 'tornado') {
      for (let i = this.enemySystem.enemies.length - 1; i >= 0; i--) {
        const e = this.enemySystem.enemies[i];
        const dx = this.playerX - e.sprite.x;
        const dy = this.playerY - e.sprite.y;
        if (dx * dx + dy * dy < 300 * 300) {
          e.hp = 0;
          this.particles.spawn(0x00e676, 4, 3, 3);
        }
      }
      for (let i = this.enemySystem.bullets.length - 1; i >= 0; i--) {
        const b = this.enemySystem.bullets[i];
        const dx = this.playerX - b.sprite.x;
        const dy = this.playerY - b.sprite.y;
        if (dx * dx + dy * dy < 250 * 250) {
          b.sprite.destroy();
          this.enemySystem.bullets.splice(i, 1);
        }
      }
    }
  }

  // ========== Weapon Pickups ==========
  // public for system access (refactor in progress)
  spawnWeaponPickup(x: number, y: number): void {
    const types = getAvailableWeaponTypes(this.config.chapter);
    if (types.length === 0) return;
    const type = types[Math.floor(Math.random() * types.length)];
    const sprite = this.add.image(x, y, `pu-weapon-${type}`);
    sprite.setDisplaySize(20, 20);
    sprite.setDepth(6);
    this.weaponPickups.push({ sprite, type, collected: false });
  }

  private collectWeapon(type: WeaponType): void {
    this.weaponSystem.currentWeapon = type;
    this.hudNeedsUpdate = true;
    this.audio.pickupWeapon();
  }

  // ========== Platform Type Updates ==========
  private updatePlatformTypes(): void {
    const xrayActive = this.activePowerUps.has('xray');
    for (const plat of this.platforms) {
      if (plat.platformType === 'invisible') {
        if (xrayActive) {
          plat.setAlpha(0.6);
          if (plat.overlaySprite) plat.overlaySprite.setAlpha(0.3);
        } else {
          const dx = Math.abs(this.playerX - plat.x);
          const fadeDist = PLATFORM_TYPE_CONFIGS.invisible.fadeDistance;
          if (dx < fadeDist) {
            const alpha = 1 - dx / fadeDist;
            plat.setAlpha(alpha);
            if (plat.overlaySprite) plat.overlaySprite.setAlpha(alpha * 0.5);
          } else {
            plat.setAlpha(0);
            if (plat.overlaySprite) plat.overlaySprite.setAlpha(0);
          }
        }
      }
      // Liquid metal morphing
      if (plat.platformType === 'liquid_metal') {
        const phase = Math.sin(this.environment.liquidMetalTimer * 0.002 + plat.x * 0.01);
        plat.setScale(1, 0.85 + phase * 0.15);
        plat.setAlpha(0.85 + phase * 0.15);
        if (plat.overlaySprite) plat.overlaySprite.setAlpha(0.3 + phase * 0.2);
      }
    }
  }

  // ========== Environment Effects ==========
  // (Moved to EnvironmentSystem.ts)
}
