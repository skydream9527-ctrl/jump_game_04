import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { getCharacterById } from '../../constants/characters';
import { getLevelConfig, getChapterData, type LevelConfig, type ChapterData } from '../../constants/levels';
import { PLATFORM_TYPE_CONFIGS, type PlatformType } from '../../constants/platformtypes';
import { POWER_UP_CONFIGS, POWER_UP_SPAWN_CHANCE, MAGNET_RADIUS, type PowerUpType } from '../../constants/powerups';
import { ENERGY_PER_JUMP, ENERGY_PER_SHARD, ENERGY_MAX, NINJA_ART_CONFIGS, type NinjaArtType } from '../../constants/ninjaarts';
import { ENEMY_CONFIGS, ENEMY_SPAWN_CHANCE, ELITE_SPAWN_CHANCE, MINI_BOSS_SPAWN_CHANCE, SHOOTER_FIRE_INTERVAL, BULLET_SPEED, BULLET_SIZE, getAvailableEnemyTypes, type EnemyType } from '../../constants/enemies';
import { getBossConfig, getRandomMiniBoss, type BossPhase, type BossAttack } from '../../constants/boss';
import { WEAPON_CONFIGS, WEAPON_DROP_CHANCE, WEAPON_SPAWN_CHANCE, getAvailableWeaponTypes, type WeaponType, type WeaponConfig } from '../../constants/weapons';
import { getItemById, type ItemDef } from '../../constants/items';
import { getPetById, type PetDef, type PetActive } from '../../constants/pets';
import { EventBus } from '../EventBus';
import { EVENTS, type StartLevelPayload } from '../../types/events';
import type { GameState } from '../../types/game';
import { isBossLevel, isMiniBossLevel } from '../../constants/levels';
import { generateAllTextures } from '../renderers/TextureFactory';
import { AudioManager } from '../audio/AudioManager';
import { ParticleSystem } from '../systems/ParticleSystem';
import { BackgroundSystem } from '../systems/BackgroundSystem';
import { EnvironmentSystem } from '../systems/EnvironmentSystem';
import { HUDSystem } from '../systems/HUDSystem';

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

const RUN_FRAMES = ['run1', 'run2', 'run3', 'run4'] as const;
const HUD_DEPTH = 100;
const PLAYER_SCREEN_X = 80;

export class GameScene extends Phaser.Scene {
  // Systems (refactored from inline implementations)
  private particles!: ParticleSystem;
  private background!: BackgroundSystem;
  private environment!: EnvironmentSystem;
  private hud!: HUDSystem;

  // Game objects
  private player!: Phaser.GameObjects.Image;
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
  private characterId = 0;
  // public for system access (refactor in progress)
  config!: LevelConfig;
  // public for system access (refactor in progress)
  chapterData!: ChapterData;

  // public for system access (refactor in progress)
  score = 0;
  private bestScore = 0;
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
  private jumpCount = 0;
  private isGrounded = false;
  private playerVY = 0;
  private dead = false;
  private gameState: GameState = 'idle';
  // public for system access (refactor in progress)
  playerWidth = 36 * PHYSICS.WORLD_SCALE;
  // public for system access (refactor in progress)
  playerHeight = 44 * PHYSICS.WORLD_SCALE;
  // public for system access (refactor in progress)
  playerX = 80;
  // public for system access (refactor in progress)
  playerY = 340;

  // Animation
  private animFrameIndex = 0;
  private animTimer = 0;
  private wasGrounded = false;
  private spinTween: Phaser.Tweens.Tween | null = null;

  // Ice platform sliding
  private iceSlideVX = 0;
  private lastProgressEmit = 0;

  // Item system
  // public for system access (refactor in progress)
  equippedItems: ItemDef[] = [];
  private killCount = 0;
  private comboCount = 0;
  private stealthTimer = 0;
  private autoShieldTimer = 0;
  private slowFallActive = false;
  private slowFallTimer = 0;
  private invincibleTimer = 0;
  private swordBeamTimer = 0;
  private stunTimer = 0;

  // Pet system
  // public for system access (refactor in progress)
  selectedPet: PetDef | null = null;
  private petSprite!: Phaser.GameObjects.Image;
  private petTargetX = 0;
  private petTargetY = 0;
  private petActiveTimer = 0;
  private petActiveCooldown = 0;
  private petTCooldown = 0;
  private petUltCooldown = 0;

  // Power-ups
  private powerUpSprites: { sprite: Phaser.GameObjects.Image; type: PowerUpType; collected: boolean }[] = [];
  private weaponPickups: { sprite: Phaser.GameObjects.Image; type: WeaponType; collected: boolean }[] = [];
  // public for system access (refactor in progress)
  activePowerUps: Map<PowerUpType, number> = new Map();
  // public for system access (refactor in progress)
  hasShield = false;

  // Weapon system
  // public for system access (refactor in progress)
  currentWeapon: WeaponType = 'pistol';
  private lastFireTime = 0;
  private playerBullets: { sprite: Phaser.GameObjects.Image; vx: number; vy: number; config: WeaponConfig; pierced: number; age: number }[] = [];

  // Ninja art
  // public for system access (refactor in progress)
  energy = 0;
  private ninjaArtActive = false;
  private ninjaArtTimer = 0;
  private ninjaArtType: NinjaArtType | null = null;

  // Enemies
  private enemies: {
    sprite: Phaser.GameObjects.Image;
    type: EnemyType;
    hp: number;
    vx: number;
    vy: number;
    baseY: number;
    fireTimer: number;
    frozen: boolean;
  }[] = [];
  private bullets: { sprite: Phaser.GameObjects.Image; vx: number; vy: number }[] = [];

  // Boss
  private boss: {
    sprite: Phaser.GameObjects.Image;
    hp: number;
    maxHp: number;
    phase: BossPhase;
    attackTimer: number;
    currentAttack: number;
    attackCooldown: number;
    invulnerable: boolean;
  } | null = null;
  private bossHpBar!: Phaser.GameObjects.Graphics;

  // Camera
  private hudCam: Phaser.Cameras.Scene2D.Camera | null = null;

  // Input
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private wKey!: Phaser.Input.Keyboard.Key;
  private upKey!: Phaser.Input.Keyboard.Key;
  private rKey!: Phaser.Input.Keyboard.Key;
  private tKey!: Phaser.Input.Keyboard.Key;
  private yKey!: Phaser.Input.Keyboard.Key;
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
        this.doJump();
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
    this.playerBullets.forEach(b => safeDestroy(b.sprite));
    this.enemies.forEach(e => safeDestroy(e.sprite));
    this.bullets.forEach(b => safeDestroy(b.sprite));
    safeDestroy(this.bossHpBar);

    // Reset arrays
    this.platforms = [];
    this.shardSprites = [];
    this.powerUpSprites = [];
    this.weaponPickups = [];
    this.playerBullets = [];
    this.enemies = [];
    this.bullets = [];

    // Reset state
    this.currentWeapon = 'pistol';
    this.lastFireTime = 0;
    this.activePowerUps.clear();
    this.hasShield = false;
    this.energy = 0;
    this.ninjaArtActive = false;
    this.ninjaArtTimer = 0;
    this.ninjaArtType = null;
    this.boss = null;
    this.iceSlideVX = 0;
    this.lastProgressEmit = 0;
    this.dead = false;
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
    this.jumpCount = 0;
    this.isGrounded = false;
    this.playerVY = 0;
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
    this.petActiveCooldown = 0;
    this.petTCooldown = 0;
    this.petUltCooldown = 0;

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
    this.createPlayer();
    this.createPetSprite();
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
    cam.startFollow(this.player, false, 0.15, 0.1);
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
  private spawnPlatform(x: number, y: number, width: number): PlatformSprite {
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
          const et = this.pickEnemyType();
          const ey = et === 'flyer' ? y - 50 : y - 15;
          this.spawnEnemy(x + w / 2, ey, et);
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
        const et = this.pickEnemyType();
        const ey = et === 'flyer' ? y - 50 : y - 15;
        this.spawnEnemy(x + w / 2, ey, et);
      }
      // Advanced enemies (charger/bomber) — from idx 8+
      if (idx >= 8 && Math.random() < ENEMY_SPAWN_CHANCE * 0.4) {
        const advTypes = getAvailableEnemyTypes(this.config.chapter).filter(
          t => t === 'charger' || t === 'bomber'
        );
        if (advTypes.length > 0) {
          const et = advTypes[Math.floor(Math.random() * advTypes.length)];
          this.spawnEnemy(x + w / 2, y - 15, et);
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
          this.spawnEnemy(x + w / 2, y - 15, et);
        }
      }
      // Mini boss — from idx 18+, 15% on levels 5/9, otherwise 3%
      const miniBossChance = isMiniBossLevel(this.config.level) ? 0.15 : MINI_BOSS_SPAWN_CHANCE;
      if (idx >= 18 && Math.random() < miniBossChance) {
        this.spawnEnemy(x + w / 2, y - 20, 'mini_boss');
      }
    }
  }

  // ========== Enemy Type Selection ==========
  private pickEnemyType(): EnemyType {
    const ratio = this.config.enemyTypes;
    if (!ratio) {
      const eTypes = Object.keys(ENEMY_CONFIGS) as EnemyType[];
      return eTypes[Math.floor(Math.random() * eTypes.length)];
    }
    const entries = Object.entries(ratio).filter(([, v]) => v > 0) as [EnemyType, number][];
    if (entries.length === 0) return 'ground';
    const total = entries.reduce((sum, [, v]) => sum + v, 0);
    let roll = Math.random() * total;
    for (const [type, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return type;
    }
    return entries[0][0];
  }

  // ========== Player ==========
  private createPlayer(): void {
    const texKey = `player-${this.characterId}`;
    this.player = this.add.image(this.playerX, this.playerY, texKey);
    this.player.setScale(PHYSICS.WORLD_SCALE);
    this.player.setDepth(20);
    this.animFrameIndex = 0;
    this.animTimer = 0;
    this.wasGrounded = false;
  }

  private createPetSprite(): void {
    if (!this.selectedPet) return;
    const texKey = `pet-${this.selectedPet.id}`;
    this.petSprite = this.add.image(this.playerX - 30, this.playerY - 20, texKey);
    this.petSprite.setScale(0.6);
    this.petSprite.setDepth(18);
    this.petSprite.setAlpha(0.9);
    this.petTargetX = this.playerX - 30;
    this.petTargetY = this.playerY - 20;
  }

  private updatePlayerVisuals(normalized: number): void {
    this.player.setPosition(this.playerX, this.playerY);

    if (!this.isGrounded) {
      this.setTextureSafe(`player-${this.characterId}-jump`);
    } else {
      this.animTimer += normalized * 16.67;
      if (this.animTimer > 80) {
        this.animTimer = 0;
        this.animFrameIndex = (this.animFrameIndex + 1) % RUN_FRAMES.length;
      }
      this.setTextureSafe(`player-${this.characterId}-${RUN_FRAMES[this.animFrameIndex]}`);
    }

    if (this.isGrounded && !this.wasGrounded) {
      // Reset spin angle on landing
      if (this.spinTween) { this.spinTween.stop(); this.spinTween = null; }
      this.player.setAngle(0);

      this.player.setScale(PHYSICS.WORLD_SCALE * 1.2, PHYSICS.WORLD_SCALE * 0.8);
      this.tweens.add({
        targets: this.player,
        scaleX: PHYSICS.WORLD_SCALE,
        scaleY: PHYSICS.WORLD_SCALE,
        duration: 150,
        ease: 'Back.easeOut',
      });
    }
    this.wasGrounded = this.isGrounded;
  }

  private setTextureSafe(key: string): void {
    if (this.player.texture.key !== key && this.textures.exists(key)) {
      this.player.setTexture(key);
    }
  }

  // ========== Pet System ==========
  private updatePet(delta: number, normalized: number): void {
    if (!this.selectedPet || !this.petSprite || !this.petSprite.active) return;

    // Pet follows player with smooth interpolation
    this.petTargetX = this.playerX - 35;
    this.petTargetY = this.playerY - 25;
    this.petSprite.x += (this.petTargetX - this.petSprite.x) * 0.08 * normalized;
    this.petSprite.y += (this.petTargetY - this.petSprite.y) * 0.08 * normalized;

    // Pet bobbing animation
    this.petSprite.y += Math.sin(Date.now() * 0.004) * 0.5;

    // Pet facing direction
    this.petSprite.setFlipX(this.playerX < this.petSprite.x);

    // Passive: regen — heal 1 life every N seconds
    if (this.selectedPet.passive.type === 'regen') {
      const regenInterval = 20000 / (this.selectedPet.passive.value || 1);
      this.petActiveTimer += delta;
      if (this.petActiveTimer >= regenInterval && this.lives < 3) {
        this.lives++;
        this.hudNeedsUpdate = true;
        this.petActiveTimer = 0;
        this.particles.spawn(0x4caf50, 6, 3, 2);
      }
    }

    // Skill cooldowns
    if (this.petActiveCooldown > 0) this.petActiveCooldown -= delta;
    if (this.petTCooldown > 0) this.petTCooldown -= delta;
    if (this.petUltCooldown > 0) this.petUltCooldown -= delta;

    // R — active skill
    if (Phaser.Input.Keyboard.JustDown(this.rKey) && this.petActiveCooldown <= 0) {
      this.activatePetSkill('active');
    }
    // T — second active skill
    if (Phaser.Input.Keyboard.JustDown(this.tKey) && this.petTCooldown <= 0) {
      this.activatePetSkill('t_skill');
    }
    // Y — ultimate skill
    if (Phaser.Input.Keyboard.JustDown(this.yKey) && this.petUltCooldown <= 0) {
      this.activatePetSkill('ultimate');
    }
  }

  private activatePetSkill(slot: 'active' | 't_skill' | 'ultimate'): void {
    if (!this.selectedPet) return;

    let skill: PetActive;
    if (slot === 'active') {
      skill = this.selectedPet.active;
      this.petActiveCooldown = skill.cooldown;
    } else if (slot === 't_skill') {
      skill = this.selectedPet.active2;
      this.petTCooldown = skill.cooldown;
    } else {
      skill = this.selectedPet.ultimate;
      this.petUltCooldown = skill.cooldown;
    }

    this.runPetSkillEffect(skill);
    this.hudNeedsUpdate = true;
  }

  private runPetSkillEffect(skill: PetActive): void {
    switch (skill.type) {
      // ── Full screen damage ──
      case 'lightning':
      case 'thunder':
      case 'psychic_blast':
      case 'sacred_fire':
      case 'blizzard':
      case 'thunder_flash':
      case 'thunder_flash_2':
      case 'dark_pulse':
      case 'moonblast':
      case 'judgment':
      case 'fire_explosion':
      case 'hydro_pump':
      case 'hydro_cannon':
      case 'zap_cannon':
      case 'dual_cannon':
      case 'solar_beam':
      case 'giga_impact':
      case 'inferno':
      case 'blast_burn':
      case 'overheat':
      case 'ice_crash':
      case 'absolute_zero':
      case 'eternal_frost':
      case 'nightmare侵蚀':
      case 'creation':
        for (const e of this.enemies) {
          e.hp -= skill.value;
        }
        this.enemies = this.enemies.filter(e => {
          if (e.hp <= 0) { e.sprite.destroy(); this.onEnemyKilled(); return false; }
          return true;
        });
        if (this.boss) { this.boss.hp -= skill.value; }
        this.particles.spawn(0xffd600, 20, 8, 6);
        break;

      // ── Fire trail behind player ──
      case 'fire_trail':
      case 'ember':
        for (let i = 0; i < 10; i++) {
          const p = this.add.circle(this.playerX - i * 15, this.playerY + 10, 4, 0xff5722, 0.8);
          p.setDepth(15);
          this.particles.push(p, { vx: 0, vy: -0.5, life: 30 });
        }
        break;

      // ── Water wave / push ──
      case 'water_wave':
      case 'water_gun':
      case 'tide':
      case 'crab_hammer':
        for (const e of this.enemies) {
          if (Math.abs(e.sprite.x - this.playerX) < 200) {
            e.sprite.x += 100;
            e.hp -= skill.value;
          }
        }
        this.particles.spawn(0x2196f3, 10, 5, 3);
        break;

      // ── Vine whip / stun nearby ──
      case 'vine_whip':
      case 'razor_leaf':
      case 'sleep_powder':
      case 'supersonic':
        for (const e of this.enemies) {
          if (Math.abs(e.sprite.x - this.playerX) < 150) {
            e.frozen = true;
            e.hp -= skill.value;
            this.time.delayedCall(skill.duration || 2000, () => { if (e.sprite.active) e.frozen = false; });
          }
        }
        this.particles.spawn(0x4caf50, 8, 4, 3);
        break;

      // ── Slow all enemies ──
      case 'psychic':
      case 'psychic_2':
      case 'psychic_3':
      case 'icy_wind':
      case 'snowstorm':
      case 'aurora_beam':
      case 'dark_void':
        for (const e of this.enemies) {
          e.frozen = true;
          this.time.delayedCall(skill.duration || 3000, () => { if (e.sprite.active) e.frozen = false; });
        }
        this.particles.spawn(0xe040fb, 12, 5, 4);
        break;

      // ── Invincible charge ──
      case 'flare_blitz':
      case 'volt_tackle':
      case 'ice_ball':
      case 'shell_charge':
      case 'moon_jump':
        this.invincibleTimer = skill.duration;
        this.speed *= 1.5;
        this.particles.spawn(0xe64a19, 12, 5, 4);
        break;

      // ── Heal ──
      case 'heal_pulse':
      case 'healing_wish':
      case 'healing_wave':
      case 'morning_sun':
      case 'rest':
        this.lives = Math.min(5, this.lives + skill.value);
        this.particles.spawn(0x4caf50, 10, 4, 3);
        break;

      // ── Shield / invincibility ──
      case 'water_shield':
      case 'blessing':
        this.invincibleTimer = skill.duration;
        this.particles.spawn(0x42a5f5, 10, 4, 3);
        break;

      // ── Boost stats ──
      case 'agility':
      case 'evolve':
      case 'cosmic_power':
      case 'overgrow':
      case 'dark_domain':
        this.speed *= 1.3;
        this.particles.spawn(0xffd700, 12, 5, 4);
        break;

      // ── DOT / area effect ──
      case 'fire_spin':
      case 'leaf_storm':
      case 'water_pulse':
      case 'petal_dance':
      case 'storm':
      case 'thunder_storm':
      case 'ice_dance':
      case 'cannon阵列':
      case 'nightmare':
      case 'foxfire':
        for (const e of this.enemies) {
          if (Math.abs(e.sprite.x - this.playerX) < 250) {
            e.hp -= skill.value;
          }
        }
        this.enemies = this.enemies.filter(e => {
          if (e.hp <= 0) { e.sprite.destroy(); this.onEnemyKilled(); return false; }
          return true;
        });
        this.particles.spawn(0x7c4dff, 10, 5, 3);
        break;

      // ── Revive / special ──
      case 'rebirth':
        this.lives = 5;
        this.invincibleTimer = 3000;
        this.particles.spawn(0xff6d00, 15, 6, 5);
        break;

      case 'time_travel':
      case 'time_rewind':
        this.lives = 5;
        this.particles.spawn(0x81c784, 15, 6, 5);
        break;

      case 'thousand_thunders':
        for (const e of this.enemies) {
          e.hp -= skill.value;
        }
        this.enemies = this.enemies.filter(e => {
          if (e.hp <= 0) { e.sprite.destroy(); this.onEnemyKilled(); return false; }
          return true;
        });
        this.particles.spawn(0xffd600, 25, 8, 6);
        break;

      // ── Fallback: generic damage ──
      default:
        for (const e of this.enemies) {
          if (Math.abs(e.sprite.x - this.playerX) < 200) {
            e.hp -= skill.value;
          }
        }
        this.enemies = this.enemies.filter(e => {
          if (e.hp <= 0) { e.sprite.destroy(); this.onEnemyKilled(); return false; }
          return true;
        });
        break;
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

  private doJump(): void {
    if (this.jumpCount >= 2) return;

    const char = getCharacterById(this.characterId);
    const boostActive = this.activePowerUps.has('boostboots');

    // Item jump bonus
    let itemJumpMult = 1.0;
    for (const item of this.equippedItems) {
      if (item.effect.type === 'passive' && item.effect.stat === 'jump') {
        itemJumpMult += item.effect.value ?? 0;
      }
    }

    const jumpMult = (boostActive ? 1.5 : 1.0) * itemJumpMult;
    const jumpForce = PHYSICS.JUMP_FORCE * char.jumpMultiplier * jumpMult;
    const force = this.jumpCount === 0 ? jumpForce : jumpForce * PHYSICS.DOUBLE_JUMP_MULTIPLIER;

    this.playerVY = force;
    this.jumpCount++;
    this.isGrounded = false;
    this.energy = Math.min(ENERGY_MAX, this.energy + ENERGY_PER_JUMP);
    this.particles.spawn(0xffe4b5, PHYSICS.JUMP_PARTICLE_COUNT, 4, 3);
    this.audio.jump();

    // Slow fall on double jump (charm_gravity)
    if (this.jumpCount >= 2) {
      for (const item of this.equippedItems) {
        if (item.effect.type === 'on_jump' && item.effect.stat === 'slow_fall') {
          this.slowFallActive = true;
          this.slowFallTimer = item.effect.value ?? 500;
        }
      }

      // Contra-style rolling spin on double jump
      if (this.spinTween) this.spinTween.stop();
      this.player.setAngle(0);
      this.spinTween = this.tweens.add({
        targets: this.player,
        angle: 360,
        duration: 400,
        ease: 'Linear',
        onComplete: () => { this.spinTween = null; },
      });
    }

    this.player.setScale(PHYSICS.WORLD_SCALE * 0.8, PHYSICS.WORLD_SCALE * 1.2);
    this.tweens.add({
      targets: this.player,
      scaleX: PHYSICS.WORLD_SCALE,
      scaleY: PHYSICS.WORLD_SCALE,
      duration: 200,
      ease: 'Back.easeOut',
    });
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

  private respawnOnPlatform(): void {
    const camLeft = this.cameras.main.scrollX;
    const camRight = camLeft + PHYSICS.CANVAS_WIDTH;
    let found: PlatformSprite | null = null;
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const p = this.platforms[i];
      if (p.x + p.width / 2 > camLeft && p.x - p.width / 2 < camRight) {
        found = p;
        break;
      }
    }
    if (found) {
      this.playerX = found.x;
      this.playerY = found.y - found.height / 2 - this.playerHeight / 2;
    } else {
      this.playerX = camLeft + PLAYER_SCREEN_X;
      this.playerY = 340;
    }
    this.playerVY = 0;
    this.jumpCount = 0;
    this.isGrounded = true;
  }

  private spawnRespawnPlatform(): void {
    const safeWidth = 300;
    const safeX = this.playerX - safeWidth / 2;
    const safeY = this.playerY + this.playerHeight / 2;
    this.spawnPlatform(safeX, safeY, safeWidth);
  }

  // public for system access (refactor in progress)
  onPlayerFall(): void {
    // Invincibility from items
    if (this.invincibleTimer > 0) return;

    // Item: damage reduce (armor_light) — 20% chance to ignore
    for (const item of this.equippedItems) {
      if (item.effect.type === 'passive' && item.effect.stat === 'damage_reduce') {
        if (Math.random() < (item.effect.value ?? 0)) {
          this.particles.spawn(0xffd700, 6, 4, 3);
          return;
        }
      }
    }

    // Shield absorbs one hit — always check, even if dead is already set
    if (this.hasShield) {
      this.hasShield = false;

      this.hudNeedsUpdate = true;
      this.particles.spawn(0x4fc3f7, 8, 5, 4);
      this.respawnOnPlatform();
      this.spawnRespawnPlatform();
      this.invincibleTimer = 2000;
      this.dead = false;
      return;
    }

    // Item: fairy revive — restore full lives
    if (this.equippedItems.some(i => i.effect.stat === 'revive')) {
      this.lives = 3;
      this.hudNeedsUpdate = true;
      this.particles.spawn(0xe040fb, 12, 5, 5);
      this.audio.powerup();
      this.respawnOnPlatform();
      this.spawnRespawnPlatform();
      this.invincibleTimer = 2000;
      this.dead = false;
      // Remove fairy from equipped (consumed)
      this.equippedItems = this.equippedItems.filter(i => i.effect.stat !== 'revive');
      return;
    }

    // Revive token — always check, even if dead is already set
    if (this.activePowerUps.has('revive')) {
      this.activePowerUps.delete('revive');
      this.lives = Math.max(1, Math.floor(3 * 0.5)); // Restore 50% life
      this.hudNeedsUpdate = true;
      this.particles.spawn(0xffc800, 12, 5, 5);
      this.audio.powerup();
      this.respawnOnPlatform();
      this.spawnRespawnPlatform();
      this.invincibleTimer = 2000;
      this.dead = false;
      return;
    }

    // Prevent duplicate death processing in the same frame
    if (this.dead) return;
    this.dead = true;

    this.lives--;
    this.killCount = 0; // Reset combo on death
    this.hudNeedsUpdate = true;
    EventBus.emit(EVENTS.LIVES_CHANGED, { lives: this.lives });

    if (this.lives <= 0) {
      this.gameState = 'game_over';
      if (this.score > this.bestScore) this.bestScore = this.score;
      this.audio.stopBGM();
      this.audio.gameOver();
      EventBus.emit(EVENTS.GAME_OVER, { score: this.score, bestScore: this.bestScore });
      EventBus.emit(EVENTS.GAME_STATE_CHANGED, 'game_over');
    } else {
      this.respawnOnPlatform();
      this.spawnRespawnPlatform();
      this.invincibleTimer = 2000;
      this.player.setScale(PHYSICS.WORLD_SCALE);
      this.updatePlayerVisuals(1);
      this.dead = false;
    }
  }

  // ========== Item: Use Consumable ==========
  private useConsumableItem(): void {
    const consumables = this.equippedItems.filter(i => i.category === 'consumable');
    if (consumables.length === 0) return;

    const item = consumables[0]; // Use first consumable
    const e = item.effect;

    switch (e.stat) {
      case 'lives': // Potion HP
        this.lives = Math.min(3, this.lives + (e.value ?? 1));
        this.hudNeedsUpdate = true;
        this.particles.spawn(0xe91e63, 8, 4, 3);
        break;
      case 'shield': // Potion shield
        this.hasShield = true;
        this.hudNeedsUpdate = true;
        this.particles.spawn(0x4fc3f7, 8, 4, 3);
        break;
      case 'bomb_range': // Bomb — destroy all enemies in range
        for (const enemy of this.enemies) {
          const dx = this.playerX - enemy.sprite.x;
          if (Math.abs(dx) < (e.value ?? 300)) {
            enemy.hp = 0;
            this.particles.spawn(0xff5722, 6, 4, 3);
            this.score += 50;
          }
        }
        this.enemies = this.enemies.filter(enemy => {
          if (enemy.hp <= 0) { enemy.sprite.destroy(); return false; }
          return true;
        });
        this.particles.spawn(0xff5722, 12, 6, 4);
        this.audio.lightningStrike();
        break;
      case 'light_arrow': // Light arrow — damage all enemies
        for (const enemy of this.enemies) {
          enemy.hp -= (e.value ?? 2);
          this.particles.spawn(0xffeb3b, 4, 3, 2);
        }
        this.enemies = this.enemies.filter(enemy => {
          if (enemy.hp <= 0) { enemy.sprite.destroy(); this.onEnemyKilled(); return false; }
          return true;
        });
        break;
      case 'stun': // Deku nut — stun all enemies
        this.stunTimer = e.value ?? 3000;
        for (const enemy of this.enemies) {
          enemy.frozen = true;
          this.time.delayedCall(e.value ?? 3000, () => { if (enemy.sprite.active) enemy.frozen = false; });
        }
        this.particles.spawn(0x8d6e63, 10, 5, 4);
        break;
    }

    // Remove consumed item from equipped list
    this.equippedItems = this.equippedItems.filter(i => i !== item);
    this.hudNeedsUpdate = true;
  }

  // ========== Item: Enemy Kill Tracking ==========
  private onEnemyKilled(): void {
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
        this.jumpCount = 0;
      }
    }
  }

  private emitLevelComplete(stars: number): void {
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

  private checkWinCondition(): void {
    if (this.gameState !== 'playing') return;

    const isBoss = isBossLevel(this.config.level);

    if (isBoss && !this.boss && this.distance >= this.config.targetDistance * 0.85) {
      this.spawnBoss();
      return;
    }

    if (!isBoss && this.distance >= this.config.targetDistance) {
      const stars = this.shardsCollected >= 3 ? 3 : this.shardsCollected >= 2 ? 2 : 1;
      this.emitLevelComplete(stars);
    }
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
      this.doJump();
    }
    if (!this.isGrounded && (this.sKey.isDown || this.downKey.isDown)) {
      this.playerVY += 0.8 * normalized;
    }
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.tryActivateNinjaArt();
    }
    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      this.useConsumableItem();
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
      this.playerBullets.push({ sprite: beam, vx: 8, vy: 0, config: { ...WEAPON_CONFIGS.laser, piercing: true }, pierced: 0, age: 0 });
    }

    // Apply slow fall gravity reduction
    let gravityMult = this.chapterData.gravityMultiplier;
    if (this.slowFallActive && this.playerVY > 0) {
      gravityMult *= 0.4;
    }

    this.playerVY += PHYSICS.GRAVITY * gravityMult * normalized;
    this.playerY += this.playerVY * normalized;

    if (this.playerY < this.playerHeight / 2) {
      this.playerY = this.playerHeight / 2;
      this.playerVY = 0;
    }

    const deathY = PHYSICS.CANVAS_HEIGHT;
    if (!this.dead && this.playerY > deathY) {
      this.onPlayerFall();
      return;
    }

    const speedPx = this.speed * normalized;
    this.playerX += speedPx;
    this.distance += speedPx;

    // Chapter 5: Global ice inertia on all platforms
    if (this.config.chapter === 5 && this.isGrounded) {
      this.iceSlideVX = Math.max(this.iceSlideVX, this.speed * 0.3);
    }

    if (this.isGrounded && this.iceSlideVX > 0) {
      this.playerX += this.iceSlideVX * normalized;
      this.iceSlideVX *= 0.96; // friction decay
      if (this.iceSlideVX < 0.1) this.iceSlideVX = 0;
    }
    if (!this.isGrounded) {
      this.iceSlideVX *= 0.9;
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

    if (!this.isGrounded && this.jumpCount === 0 && this.playerY < PHYSICS.CANVAS_HEIGHT * 0.8) {
      this.jumpCount = 1;
    }

    // Platform collision
    this.isGrounded = false;
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

      if (this.playerVY >= 0 &&
          playerRight > platLeft && playerLeft < platRight &&
          playerBottom >= platTop && playerBottom <= platTop + Math.max(this.playerVY * normalized, 8)) {
        this.playerY = platTop - this.playerHeight / 2;
        this.playerVY = 0;
        this.isGrounded = true;
        if (this.jumpCount > 0) {
          this.particles.spawn(0xffffff, PHYSICS.LAND_PARTICLE_COUNT, 3, 2);
          this.audio.land();
        }
        this.jumpCount = 0;

        if (plat.platformType === 'ice' && this.isGrounded) {
          this.iceSlideVX = this.speed * 1.5;
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

    this.checkWinCondition();

    this.updatePlayerVisuals(normalized);
    this.updatePet(delta, normalized);
    this.particles.update(normalized);
    this.updatePlatformTypes();
    this.updateNinjaArt(delta);
    this.shootWeapon();
    this.updatePlayerBullets(normalized);
    this.updateEnemies(delta, normalized);
    this.updateBullets(normalized);
    this.updateBoss(delta, normalized);
    this.hud.update();

    // Chapter-specific environment effects
    this.environment.update(delta, normalized);
  }

  // ========== Enemies ==========
  private spawnEnemy(x: number, y: number, type: EnemyType): void {
    const cfg = ENEMY_CONFIGS[type];
    const sprite = this.add.image(x, y, `enemy-${type}`);
    sprite.setDisplaySize(cfg.width, cfg.height);
    sprite.setDepth(10);

    let vx = 0;
    let vy = 0;
    let hp = cfg.hp;

    // Use chapter-specific mini-boss config
    if (type === 'mini_boss') {
      const miniBossCfg = getRandomMiniBoss(this.config.chapter);
      if (miniBossCfg) {
        sprite.setDisplaySize(miniBossCfg.width, miniBossCfg.height);
        hp = miniBossCfg.hp;
      }
    }

    switch (type) {
      case 'ground':
        vx = cfg.speed;
        break;
      case 'flyer':
        vx = cfg.speed * 0.5;
        vy = 0.8;
        break;
      case 'shooter':
        vx = 0;
        break;
      case 'charger':
        vx = cfg.speed; // Will charge when player is near
        break;
      case 'bomber':
        vx = cfg.speed * 0.3;
        break;
    }

    this.enemies.push({
      sprite,
      type,
      hp,
      vx,
      vy,
      baseY: y,
      fireTimer: type === 'shooter' ? SHOOTER_FIRE_INTERVAL : 0,
      frozen: false,
    });
  }

  private updateEnemies(delta: number, normalized: number): void {
    const cullLeft = this.cameraTargetX + PHYSICS.PLATFORM_CULL_X;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.sprite.x < cullLeft - 100 || !e.sprite.active) {
        e.sprite.destroy();
        this.enemies.splice(i, 1);
        continue;
      }

      if (e.frozen) continue;

      const cfg = ENEMY_CONFIGS[e.type];

      if (e.type === 'flyer') {
        e.sprite.y = e.baseY + Math.sin(this.time.now * 0.003 + i) * 30;
        e.sprite.x -= cfg.speed * normalized;
      } else if (e.type === 'ground') {
        e.sprite.x -= (this.speed + cfg.speed) * normalized;
      } else if (e.type === 'shooter') {
        e.sprite.x -= this.speed * normalized;
        e.fireTimer -= delta;
        if (e.fireTimer <= 0) {
          e.fireTimer = SHOOTER_FIRE_INTERVAL;
          this.spawnBullet(e.sprite.x - 10, e.sprite.y);
        }
      } else if (e.type === 'charger') {
        // Charger: move slowly until player is near, then charge
        const distToPlayer = this.playerX - e.sprite.x;
        if (distToPlayer > 0 && distToPlayer < 300) {
          // Charge towards player
          e.sprite.x -= (this.speed + cfg.speed * 2) * normalized;
          this.particles.spawn(0xff6020, 2, 1, 1); // Orange trail
        } else {
          e.sprite.x -= this.speed * normalized;
        }
      } else if (e.type === 'bomber') {
        // Bomber: slow movement, drops bombs periodically
        e.sprite.x -= (this.speed + cfg.speed) * normalized;
        e.fireTimer -= delta;
        if (e.fireTimer <= 0) {
          e.fireTimer = 3000; // Drop bomb every 3 seconds
          this.spawnBomb(e.sprite.x, e.sprite.y + cfg.height / 2);
        }
      }

      const ex = e.sprite.x;
      const ey = e.sprite.y;
      const ew = cfg.width * 0.5;
      const eh = cfg.height * 0.5;

      if (this.playerVY > 0) {
        const playerBottom = this.playerY + this.playerHeight / 2;
        const playerLeft = this.playerX - this.playerWidth / 2;
        const playerRight = this.playerX + this.playerWidth / 2;

        if (playerBottom >= ey - eh && playerBottom <= ey + eh * 0.3 &&
            playerRight > ex - ew && playerLeft < ex + ew) {
          // Combo damage from charm_rage
          let stompDmg = 1;
          for (const item of this.equippedItems) {
            if (item.effect.type === 'passive' && item.effect.stat === 'stomp_damage') stompDmg += item.effect.value ?? 0;
            if (item.effect.type === 'passive' && item.effect.stat === 'combo_damage') stompDmg += this.comboCount * (item.effect.value ?? 0);
            if (item.effect.type === 'passive' && item.effect.stat === 'low_hp_power' && this.lives <= 1) stompDmg *= (item.effect.value ?? 1);
          }
          e.hp -= stompDmg;
          this.comboCount++;
          this.playerVY = PHYSICS.JUMP_FORCE * 0.6; // bounce
          this.particles.spawn(cfg.color, 5, 3, 3);
          this.score += cfg.scoreReward;
          this.hudNeedsUpdate = true;
          if (e.hp <= 0) {
            this.onEnemyKilled();
            e.sprite.destroy();
            this.enemies.splice(i, 1);
            continue;
          }
        }
      }

      // Stealth: enemies don't deal contact damage
      if (this.stealthTimer > 0) continue;

      if (!this.ninjaArtActive || this.ninjaArtType !== 'dash') {
        const dx = this.playerX - ex;
        const dy = this.playerY - ey;
        const collisionDist = (ew + this.playerWidth * 0.4);
        if (dx * dx < collisionDist * collisionDist && dy * dy < (eh + this.playerHeight * 0.4) ** 2) {
          this.onPlayerFall();
        }
      }
    }
  }

  private spawnBullet(x: number, y: number): void {
    const sprite = this.add.image(x, y, 'bullet');
    sprite.setDisplaySize(BULLET_SIZE, BULLET_SIZE);
    sprite.setDepth(10);
    const dx = this.playerX - x;
    const dy = this.playerY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.bullets.push({
      sprite,
      vx: (dx / dist) * BULLET_SPEED,
      vy: (dy / dist) * BULLET_SPEED,
    });
  }

  private spawnBomb(x: number, y: number): void {
    const sprite = this.add.image(x, y, 'bullet');
    sprite.setDisplaySize(BULLET_SIZE * 1.5, BULLET_SIZE * 1.5);
    sprite.setDepth(10);
    sprite.setTint(0xff4040); // Red tint for bombs
    this.bullets.push({
      sprite,
      vx: 0,
      vy: 2, // Fall downward
    });
  }

  private updateBullets(normalized: number): void {
    const cullLeft = this.cameraTargetX + PHYSICS.PLATFORM_CULL_X;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.sprite.x += b.vx * normalized;
      b.sprite.y += b.vy * normalized;

      if (b.sprite.x < cullLeft - 50 || b.sprite.y < -50 || b.sprite.y > PHYSICS.CANVAS_HEIGHT + 50) {
        b.sprite.destroy();
        this.bullets.splice(i, 1);
        continue;
      }

      const dx = this.playerX - b.sprite.x;
      const dy = this.playerY - b.sprite.y;
      if (dx * dx + dy * dy < (this.playerWidth * 0.5 + BULLET_SIZE) ** 2) {
        b.sprite.destroy();
        this.bullets.splice(i, 1);
        this.onPlayerFall();
      }
    }
  }

  // ========== Boss ==========
  private spawnBoss(): void {
    const bossCfg = getBossConfig(this.config.chapter);
    const bx = this.playerX + PHYSICS.CANVAS_WIDTH * 0.6;
    const by = PHYSICS.CANVAS_HEIGHT / 2;

    const sprite = this.add.image(bx, by, `boss-${this.config.chapter}`);
    sprite.setDisplaySize(bossCfg.width, bossCfg.height);
    sprite.setDepth(25);

    this.boss = {
      sprite,
      hp: bossCfg.hp,
      maxHp: bossCfg.hp,
      phase: 'idle',
      attackTimer: 2000,
      currentAttack: 0,
      attackCooldown: 0,
      invulnerable: false,
    };

    this.bossHpBar = this.add.graphics();
    this.bossHpBar.setDepth(HUD_DEPTH + 2);
    this.bossHpBar.setScrollFactor(0);
  }

  private updateBoss(delta: number, normalized: number): void {
    if (!this.boss) return;

    const bossCfg = getBossConfig(this.config.chapter);
    const b = this.boss;

    const targetX = this.playerX + PHYSICS.CANVAS_WIDTH * 0.4;
    b.sprite.x += (targetX - b.sprite.x) * 0.02 * normalized;

    const hpPercent = (b.hp / b.maxHp) * 100;
    let speedMult = 1;
    for (const ph of bossCfg.phases) {
      if (hpPercent <= ph.hpThreshold) {
        b.phase = ph.phase;
        speedMult = ph.speedMultiplier;
      }
    }

    b.attackTimer -= delta;
    if (b.attackTimer <= 0) {
      const attack = bossCfg.attacks[b.currentAttack % bossCfg.attacks.length];
      b.attackCooldown = attack.duration;
      b.currentAttack++;
      b.attackTimer = attack.duration + attack.cooldown;

      this.executeBossAttack(attack.pattern, speedMult);
    }

    if (b.attackCooldown > 0) {
      b.attackCooldown -= delta;
      b.invulnerable = false; // vulnerable during/after attack
    } else {
      b.invulnerable = b.phase !== 'vulnerable';
    }

    b.sprite.y = PHYSICS.CANVAS_HEIGHT / 2 + Math.sin(this.time.now * 0.002) * 15;

    if (this.playerVY > 0) {
      const playerBottom = this.playerY + this.playerHeight / 2;
      const dx = this.playerX - b.sprite.x;
      const dy = playerBottom - b.sprite.y;
      const hitW = bossCfg.width * 0.6;
      const hitH = bossCfg.height * 0.4;
      if (dx * dx < hitW * hitW && dy * dy < hitH * hitH && !b.invulnerable) {
        b.hp--;
        this.playerVY = PHYSICS.JUMP_FORCE * 0.7;
        this.particles.spawn(0xff0000, 6, 4, 3);
        this.score += 100;
        this.hudNeedsUpdate = true;
        if (b.hp <= 0) {
          this.onBossDefeated();
          return;
        }
      }
    }

    if (!this.ninjaArtActive || this.ninjaArtType !== 'dash') {
      const dx = this.playerX - b.sprite.x;
      const dy = this.playerY - b.sprite.y;
      if (dx * dx < (bossCfg.width * 0.5 + this.playerWidth * 0.3) ** 2 &&
          dy * dy < (bossCfg.height * 0.5 + this.playerHeight * 0.3) ** 2) {
        this.onPlayerFall();
      }
    }

    this.drawBossHPBar();
  }

  private executeBossAttack(pattern: BossAttack['pattern'], speedMult: number): void {
    if (!this.boss) return;
    const bx = this.boss.sprite.x;
    const by = this.boss.sprite.y;

    switch (pattern) {
      case 'charge':
        this.tweens.add({
          targets: this.boss.sprite,
          x: this.playerX + 60,
          duration: 400 / speedMult,
          yoyo: true,
          ease: 'Power2',
        });
        break;
      case 'barrage':
        for (let a = -30; a <= 30; a += 15) {
          const rad = (a * Math.PI) / 180;
          const sprite = this.add.image(bx - 20, by, 'bullet');
          sprite.setDisplaySize(BULLET_SIZE, BULLET_SIZE);
          sprite.setDepth(10);
          this.bullets.push({
            sprite,
            vx: Math.cos(rad) * -BULLET_SPEED * speedMult,
            vy: Math.sin(rad) * BULLET_SPEED * speedMult,
          });
        }
        break;
      case 'slam':
        this.tweens.add({
          targets: this.boss.sprite,
          y: by - 80,
          duration: 300,
          onComplete: () => {
            this.tweens.add({
              targets: this.boss!.sprite,
              y: PHYSICS.CANVAS_HEIGHT / 2,
              duration: 200,
              onComplete: () => {
                for (let a = 0; a < 360; a += 45) {
                  const rad = (a * Math.PI) / 180;
                  const sprite = this.add.image(bx, this.boss!.sprite.y, 'bullet');
                  sprite.setDisplaySize(BULLET_SIZE * 1.5, BULLET_SIZE * 1.5);
                  sprite.setDepth(10);
                  this.bullets.push({
                    sprite,
                    vx: Math.cos(rad) * BULLET_SPEED * 0.8,
                    vy: Math.sin(rad) * BULLET_SPEED * 0.8,
                  });
                }
              },
            });
          },
        });
        break;
      case 'sweep':
        this.tweens.add({
          targets: this.boss.sprite,
          y: PHYSICS.CANVAS_HEIGHT - 60,
          duration: 400 / speedMult,
          yoyo: true,
          ease: 'Sine.easeInOut',
        });
        break;
    }
  }

  private drawBossHPBar(): void {
    if (!this.boss || !this.bossHpBar) return;
    const barW = 200;
    const barH = 8;
    const barX = (PHYSICS.CANVAS_WIDTH - barW) / 2;
    const barY = 10;

    this.bossHpBar.clear();
    this.bossHpBar.fillStyle(0x333333, 0.8);
    this.bossHpBar.fillRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 3);

    const hpRatio = this.boss.hp / this.boss.maxHp;
    const hpColor = hpRatio > 0.5 ? 0xff4444 : hpRatio > 0.25 ? 0xff8800 : 0xff0000;
    this.bossHpBar.fillStyle(hpColor, 1);
    this.bossHpBar.fillRoundedRect(barX, barY, barW * hpRatio, barH, 2);
  }

  private onBossDefeated(): void {
    if (!this.boss) return;
    // Explosion particles
    for (let i = 0; i < 20; i++) {
      const px = this.boss.sprite.x + (Math.random() - 0.5) * 60;
      const py = this.boss.sprite.y + (Math.random() - 0.5) * 60;
      const p = this.add.circle(px, py, 3 + Math.random() * 4, 0xff4400, 0.8);
      p.setDepth(30);
      this.particles.push(p, { vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 4, life: 40 });
    }
    this.boss.sprite.destroy();
    this.boss = null;
    if (this.bossHpBar) this.bossHpBar.destroy();
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
      for (const e of this.enemies) e.frozen = true;
      for (const b of this.bullets) {
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
      for (const e of this.enemies) e.frozen = false;
      return;
    }

    if (this.ninjaArtType === 'freeze' || this.ninjaArtType === 'timestop') {
      // Only freeze newly spawned enemies/bullets
      for (const e of this.enemies) e.frozen = true;
      for (const b of this.bullets) {
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
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        const dx = this.playerX - e.sprite.x;
        const dy = this.playerY - e.sprite.y;
        if (dx * dx + dy * dy < 300 * 300) {
          e.hp = 0;
          this.particles.spawn(0x00e676, 4, 3, 3);
        }
      }
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        const dx = this.playerX - b.sprite.x;
        const dy = this.playerY - b.sprite.y;
        if (dx * dx + dy * dy < 250 * 250) {
          b.sprite.destroy();
          this.bullets.splice(i, 1);
        }
      }
    }
  }

  // ========== Weapon System ==========
  private shootWeapon(): void {
    const now = this.time.now;
    const cfg = WEAPON_CONFIGS[this.currentWeapon];
    if (now - this.lastFireTime < cfg.fireRate) return;
    this.lastFireTime = now;

    const baseX = this.playerX + this.playerWidth / 2;
    const baseY = this.playerY;

    if (cfg.bulletCount === 1) {
      this.spawnPlayerBullet(baseX, baseY, cfg.spreadAngle > 0 ? 0 : 0, cfg);
    } else {
      const totalSpread = cfg.spreadAngle * (cfg.bulletCount - 1);
      const startAngle = -totalSpread / 2;
      for (let i = 0; i < cfg.bulletCount; i++) {
        const angle = startAngle + i * cfg.spreadAngle;
        this.spawnPlayerBullet(baseX, baseY, angle, cfg);
      }
    }

    if (this.currentWeapon === 'spread') this.audio.shootSpread();
    else if (this.currentWeapon === 'laser') this.audio.shootLaser();
    else this.audio.shoot();
  }

  private spawnPlayerBullet(x: number, y: number, angleDeg: number, cfg: WeaponConfig): void {
    const rad = (angleDeg * Math.PI) / 180;
    const sprite = this.add.image(x, y, `bullet-${cfg.type}`);
    sprite.setDisplaySize(cfg.bulletSize, cfg.bulletSize);
    sprite.setDepth(10);
    this.playerBullets.push({
      sprite,
      vx: Math.cos(rad) * cfg.bulletSpeed,
      vy: Math.sin(rad) * cfg.bulletSpeed,
      config: cfg,
      pierced: 0,
      age: 0,
    });
  }

  private updatePlayerBullets(normalized: number): void {
    const cullLeft = this.cameraTargetX + PHYSICS.PLATFORM_CULL_X;

    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const b = this.playerBullets[i];
      b.sprite.x += b.vx * normalized;
      b.sprite.y += b.vy * normalized;
      b.age += normalized;

      if (b.sprite.x < cullLeft - 50 || b.sprite.x > this.cameraTargetX + PHYSICS.CANVAS_WIDTH + 100 ||
          b.sprite.y < -50 || b.sprite.y > PHYSICS.CANVAS_HEIGHT + 50) {
        b.sprite.destroy();
        this.playerBullets.splice(i, 1);
        continue;
      }

      let hit = false;

      // Fireball/Plasma: explode after traveling ~200px
      if (b.config.explosionRadius > 0 && b.age > 25) {
        this.explodeFireball(b.sprite.x, b.sprite.y, b.config);
        b.sprite.destroy();
        this.playerBullets.splice(i, 1);
        continue;
      }

      // Quantum weapon: extra damage to boss
      if (b.config.type === 'quantum' && this.boss && !this.boss.invulnerable) {
        const bossCfg = getBossConfig(this.config.chapter);
        const dx = b.sprite.x - this.boss.sprite.x;
        const dy = b.sprite.y - this.boss.sprite.y;
        const hitW = bossCfg.width * 0.5 + b.config.bulletSize * 0.5;
        const hitH = bossCfg.height * 0.5 + b.config.bulletSize * 0.5;
        if (dx * dx < hitW * hitW && dy * dy < hitH * hitH) {
          // Quantum does 50% more damage to bosses
          const quantumDmg = Math.floor(b.config.damage * 1.5);
          this.boss.hp -= quantumDmg;
          this.particles.spawn(0xffa000, 5, 3, 3);
          this.score += 100;
          this.hudNeedsUpdate = true;
          if (this.boss.hp <= 0) {
            this.onBossDefeated();
            if (b.sprite.active) b.sprite.destroy();
            this.playerBullets.splice(i, 1);
            continue;
          }
          if (!b.config.piercing) hit = true;
        }
      }

      // Timeslow weapon: slow enemies on hit
      if (b.config.type === 'timeslow') {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          const cfg = ENEMY_CONFIGS[e.type];
          const dx = b.sprite.x - e.sprite.x;
          const dy = b.sprite.y - e.sprite.y;
          const hitW = (cfg.width * 0.5 + b.config.bulletSize * 0.5);
          const hitH = (cfg.height * 0.5 + b.config.bulletSize * 0.5);
          if (dx * dx < hitW * hitW && dy * dy < hitH * hitH) {
            e.frozen = true;
            // Slow for 3 seconds
            this.time.delayedCall(3000, () => {
              if (e.sprite.active) e.frozen = false;
            });
            this.particles.spawn(0xb088c8, 4, 2, 2);
            if (!b.config.piercing) {
              hit = true;
              break;
            }
          }
        }
      }

      // Collision vs enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        const cfg = ENEMY_CONFIGS[e.type];
        const dx = b.sprite.x - e.sprite.x;
        const dy = b.sprite.y - e.sprite.y;
        const hitW = (cfg.width * 0.5 + b.config.bulletSize * 0.5);
        const hitH = (cfg.height * 0.5 + b.config.bulletSize * 0.5);
        if (dx * dx < hitW * hitW && dy * dy < hitH * hitH) {
          e.hp -= b.config.damage;
          this.particles.spawn(cfg.color, 3, 2, 2);
          if (e.hp <= 0) {
            this.score += cfg.scoreReward;
            this.hudNeedsUpdate = true;
            e.sprite.destroy();
            this.enemies.splice(j, 1);
            if (Math.random() < WEAPON_DROP_CHANCE) {
              this.spawnWeaponPickup(e.sprite.x, e.sprite.y);
            }
          }
          if (!b.config.piercing) {
            hit = true;
            break;
          }
          b.pierced++;
        }
      }

      // Collision vs boss
      if (!hit && this.boss && !this.boss.invulnerable) {
        const bossCfg = getBossConfig(this.config.chapter);
        const dx = b.sprite.x - this.boss.sprite.x;
        const dy = b.sprite.y - this.boss.sprite.y;
        const hitW = bossCfg.width * 0.5 + b.config.bulletSize * 0.5;
        const hitH = bossCfg.height * 0.5 + b.config.bulletSize * 0.5;
        if (dx * dx < hitW * hitW && dy * dy < hitH * hitH) {
          this.boss.hp -= b.config.damage;
          this.particles.spawn(0xff0000, 3, 2, 2);
          this.score += 50;
          this.hudNeedsUpdate = true;
          if (this.boss.hp <= 0) {
            this.onBossDefeated();
            if (b.sprite.active) b.sprite.destroy();
            this.playerBullets.splice(i, 1);
            continue;
          }
          if (!b.config.piercing) hit = true;
        }
      }

      if (hit) {
        b.sprite.destroy();
        this.playerBullets.splice(i, 1);
      }
    }
  }

  private explodeFireball(x: number, y: number, cfg: WeaponConfig): void {
    const explosion = this.add.image(x, y, 'explosion');
    explosion.setDisplaySize(cfg.explosionRadius * 2, cfg.explosionRadius * 2);
    explosion.setDepth(30);
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: explosion.scaleX * 1.5,
      duration: 300,
      onComplete: () => explosion.destroy(),
    });
    this.particles.spawn(0xff5722, 8, 5, 5);

    const rSq = cfg.explosionRadius * cfg.explosionRadius;
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies[j];
      const dx = x - e.sprite.x;
      const dy = y - e.sprite.y;
      if (dx * dx + dy * dy < rSq) {
        e.hp -= cfg.damage;
        if (e.hp <= 0) {
          const ecfg = ENEMY_CONFIGS[e.type];
          this.score += ecfg.scoreReward;
          this.hudNeedsUpdate = true;
          e.sprite.destroy();
          this.enemies.splice(j, 1);
        }
      }
    }

    if (this.boss) {
      const dx = x - this.boss.sprite.x;
      const dy = y - this.boss.sprite.y;
      if (dx * dx + dy * dy < rSq) {
        this.boss.hp -= cfg.damage;
        this.hudNeedsUpdate = true;
        if (this.boss.hp <= 0) this.onBossDefeated();
      }
    }
  }

  private spawnWeaponPickup(x: number, y: number): void {
    const types = getAvailableWeaponTypes(this.config.chapter);
    if (types.length === 0) return;
    const type = types[Math.floor(Math.random() * types.length)];
    const sprite = this.add.image(x, y, `pu-weapon-${type}`);
    sprite.setDisplaySize(20, 20);
    sprite.setDepth(6);
    this.weaponPickups.push({ sprite, type, collected: false });
  }

  private collectWeapon(type: WeaponType): void {
    this.currentWeapon = type;
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
