import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { getCharacterById } from '../../constants/characters';
import { getLevelConfig, getChapterData, getLevelDisplayName, type LevelConfig, type ChapterData } from '../../constants/levels';
import { PLATFORM_TYPE_CONFIGS, type PlatformType } from '../../constants/platformtypes';
import { POWER_UP_CONFIGS, POWER_UP_SPAWN_CHANCE, MAGNET_RADIUS, type PowerUpType } from '../../constants/powerups';
import { ENERGY_PER_JUMP, ENERGY_PER_SHARD, ENERGY_MAX, NINJA_ART_CONFIGS, type NinjaArtType } from '../../constants/ninjaarts';
import { ENEMY_CONFIGS, ENEMY_SPAWN_CHANCE, ELITE_SPAWN_CHANCE, MINI_BOSS_SPAWN_CHANCE, SHOOTER_FIRE_INTERVAL, BULLET_SPEED, BULLET_SIZE, getAvailableEnemyTypes, type EnemyType } from '../../constants/enemies';
import { getBossConfig, getRandomMiniBoss, type BossPhase, type BossAttack } from '../../constants/boss';
import { WEAPON_CONFIGS, WEAPON_DROP_CHANCE, WEAPON_SPAWN_CHANCE, getAvailableWeaponTypes, type WeaponType, type WeaponConfig } from '../../constants/weapons';
import { EventBus } from '../EventBus';
import { EVENTS, type StartLevelPayload } from '../../types/events';
import type { GameState } from '../../types/game';
import { isBossLevel, isMiniBossLevel } from '../../constants/levels';
import { generateAllTextures } from '../renderers/TextureFactory';
import { AudioManager } from '../audio/AudioManager';

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

interface ParticleData {
  vx: number;
  vy: number;
  life: number;
}

const RUN_FRAMES = ['run1', 'run2', 'run3', 'run4'] as const;
const HUD_DEPTH = 100;
const PLAYER_SCREEN_X = 80;

export class GameScene extends Phaser.Scene {
  // Game objects
  private player!: Phaser.GameObjects.Image;
  private platforms: PlatformSprite[] = [];
  private shardSprites: ShardSprite[] = [];
  private particles: { obj: Phaser.GameObjects.Arc; data: ParticleData }[] = [];

  // Background
  private skyBg!: Phaser.GameObjects.Graphics;
  private stars: Phaser.GameObjects.Image[] = [];
  private mountainTiles: Phaser.GameObjects.TileSprite[] = [];

  // HUD
  private heartIcons: Phaser.GameObjects.Image[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private shardCountText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressFill!: Phaser.GameObjects.Graphics;
  private levelTag!: Phaser.GameObjects.Text;
  private hudNeedsUpdate = false;
  private energyBar!: Phaser.GameObjects.Graphics;
  private energyFill!: Phaser.GameObjects.Graphics;
  private energyLabel!: Phaser.GameObjects.Text;
  private powerUpIcons: { type: PowerUpType; icon: Phaser.GameObjects.Image; timer: Phaser.GameObjects.Text }[] = [];
  private weaponIcon!: Phaser.GameObjects.Image;
  private weaponNameText!: Phaser.GameObjects.Text;

  // Audio
  private audio!: AudioManager;

  // State
  private characterId = 0;
  private config!: LevelConfig;
  private chapterData!: ChapterData;

  private score = 0;
  private bestScore = 0;
  private shardsCollected = 0;
  private totalShards = 3;
  private shardsSpawned = 0;
  private passedPlatformCount = 0;
  private speed: number = PHYSICS.STARTING_SPEED;
  private distance = 0;
  private lives = 3;
  private jumpCount = 0;
  private isGrounded = false;
  private playerVY = 0;
  private dead = false;
  private gameState: GameState = 'idle';
  private playerWidth = 36 * PHYSICS.WORLD_SCALE;
  private playerHeight = 44 * PHYSICS.WORLD_SCALE;
  private playerX = 80;
  private playerY = 340;

  // Animation
  private animFrameIndex = 0;
  private animTimer = 0;
  private wasGrounded = false;

  // Ice platform sliding
  private iceSlideVX = 0;
  private lastProgressEmit = 0;

  // Environment effects (chapter-specific)
  private envOverlay: Phaser.GameObjects.Graphics | null = null;
  private envParticles: { obj: Phaser.GameObjects.Arc; data: ParticleData }[] = [];
  private lightningTimer = 0;
  private vineSegments: { sprite: Phaser.GameObjects.Arc; age: number; maxHeight: number; platformX: number }[] = [];
  private liquidMetalTimer = 0;

  // Power-ups
  private powerUpSprites: { sprite: Phaser.GameObjects.Image; type: PowerUpType; collected: boolean }[] = [];
  private weaponPickups: { sprite: Phaser.GameObjects.Image; type: WeaponType; collected: boolean }[] = [];
  private activePowerUps: Map<PowerUpType, number> = new Map();
  private hasShield = false;

  // Weapon system
  private currentWeapon: WeaponType = 'pistol';
  private lastFireTime = 0;
  private playerBullets: { sprite: Phaser.GameObjects.Image; vx: number; vy: number; config: WeaponConfig; pierced: number; age: number }[] = [];

  // Ninja art
  private energy = 0;
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
  private escKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;

  private get cameraTargetX(): number {
    return this.playerX - PLAYER_SCREEN_X;
  }

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    generateAllTextures(this);
    this.audio = new AudioManager(this);
    this.setupInput();
    this.setupEventListeners();
    this.drawIdleBackground();
    EventBus.emit(EVENTS.GAME_READY);
  }

  private drawIdleBackground(): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = PHYSICS;
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.setDepth(-100);
  }

  private setupInput(): void {
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.rKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

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
      this.startLevel(payload.chapter, payload.level, payload.characterId);
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
    const safeDestroy = (obj: any) => {
      try {
        if (obj && obj.active !== false && typeof obj.destroy === 'function') {
          obj.destroy();
        }
      } catch {}
    };

    // Destroy tracked objects
    this.platforms.forEach(safeDestroy);
    this.shardSprites.forEach(safeDestroy);
    this.particles.forEach(p => safeDestroy(p.obj));
    this.heartIcons.forEach(safeDestroy);
    this.stars.forEach(safeDestroy);
    this.mountainTiles.forEach(safeDestroy);
    this.powerUpSprites.forEach(p => safeDestroy(p.sprite));
    this.powerUpIcons.forEach(p => { safeDestroy(p.icon); safeDestroy(p.timer); });
    this.weaponPickups.forEach(safeDestroy);
    this.playerBullets.forEach(b => safeDestroy(b.sprite));
    this.enemies.forEach(e => safeDestroy(e.sprite));
    this.bullets.forEach(b => safeDestroy(b.sprite));
    safeDestroy(this.bossHpBar);

    // Reset arrays
    this.platforms = [];
    this.shardSprites = [];
    this.particles = [];
    this.heartIcons = [];
    this.stars = [];
    this.mountainTiles = [];
    this.powerUpSprites = [];
    this.powerUpIcons = [];
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

    // Clean up environment effects
    if (this.envOverlay) {
      this.envOverlay.destroy();
      this.envOverlay = null;
    }
    for (const p of this.envParticles) {
      try { p.obj.destroy(); } catch {}
    }
    this.envParticles = [];
    for (const v of this.vineSegments) {
      try { v.sprite.destroy(); } catch {}
    }
    this.vineSegments = [];
    this.lightningTimer = 0;
    this.liquidMetalTimer = 0;
  }

  private startLevel(chapter: number, level: number, characterId: number): void {
    // Guard: ensure scene is ready
    if (!this.add || !this.children) {
      console.warn('GameScene not ready, deferring startLevel');
      this.time.delayedCall(100, () => this.startLevel(chapter, level, characterId));
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

    this.clearGameObjects();
    this.createBackground();
    this.createPlayer();
    this.generateInitialPlatforms();
    this.setupCamera();
    this.createHUD();
    this.audio.startBGM(chapter);
    this.initEnvironmentEffect(chapter);

    const mainCam = this.cameras.main;
    const hudElements = this.children.list.filter(c => (c as any).depth >= HUD_DEPTH);
    mainCam.ignore(hudElements);

    this.hudNeedsUpdate = true;
    EventBus.emit(EVENTS.GAME_STATE_CHANGED, 'playing');
  }

  // ========== Camera ==========
  private setupCamera(): void {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, Number.MAX_SAFE_INTEGER, PHYSICS.CANVAS_HEIGHT + Math.abs(PHYSICS.CAMERA_SCROLL_Y));
    cam.startFollow(this.player, false, 0.15, 0.08);
    cam.setFollowOffset(-PHYSICS.CANVAS_WIDTH / 2 + PLAYER_SCREEN_X, 0);
    cam.scrollX = 0;
    cam.scrollY = PHYSICS.CAMERA_SCROLL_Y;
    cam.setLerp(0.15, 0);

    if (!this.hudCam) {
      this.hudCam = this.cameras.add(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);
    }
    this.hudCam.setScroll(0, 0);
    this.hudCam.ignore(this.children.list.filter(c => {
      const d = (c as any).depth;
      return d === undefined || d < HUD_DEPTH;
    }));
  }

  // ========== Background ==========
  private createBackground(): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = PHYSICS;
    const colors = this.chapterData.skyColors;

    this.skyBg = this.add.graphics();
    const c1 = Phaser.Display.Color.HexStringToColor(colors[0]);
    const c2 = Phaser.Display.Color.HexStringToColor(colors[1]);
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      const t = y / CANVAS_HEIGHT;
      const r = Math.floor(Phaser.Math.Linear(c1.red, c2.red, t));
      const g = Math.floor(Phaser.Math.Linear(c1.green, c2.green, t));
      const b = Math.floor(Phaser.Math.Linear(c1.blue, c2.blue, t));
      this.skyBg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      this.skyBg.fillRect(0, y, CANVAS_WIDTH, 1);
    }
    this.skyBg.setDepth(-10);
    this.skyBg.setScrollFactor(0);

    this.stars = [];
    for (let i = 0; i < 40; i++) {
      const star = this.add.image(
        Math.random() * CANVAS_WIDTH * 2,
        Math.random() * CANVAS_HEIGHT * 0.6,
        'star-dot'
      );
      star.setAlpha(0.2 + Math.random() * 0.5);
      star.setScale(0.5 + Math.random() * 0.5);
      star.setDepth(-9);
      star.setScrollFactor(0.08);
      this.stars.push(star);
    }

    this.mountainTiles = [];
    for (let i = 0; i < 2; i++) {
      const factor = i === 0 ? PHYSICS.PARALLAX_MOUNTAINS : PHYSICS.PARALLAX_CLOUDS;
      const tile = this.add.tileSprite(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.7 + i * 20,
        CANVAS_WIDTH, 200, 'mountain-layer'
      );
      tile.setAlpha(0.6 - i * 0.2);
      tile.setDepth(-8 + i);
      tile.setScrollFactor(factor);
      this.mountainTiles.push(tile);
    }
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
      if (i > 3) {
        const spawnChance = this.config.enemySpawnChance ?? ENEMY_SPAWN_CHANCE;
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
      const spawnChance = this.config.enemySpawnChance ?? ENEMY_SPAWN_CHANCE;
      if (idx >= 10 && Math.random() < spawnChance) {
        const et = this.pickEnemyType();
        const ey = et === 'flyer' ? y - 50 : y - 15;
        this.spawnEnemy(x + w / 2, ey, et);
      }
      // Advanced enemies (charger/bomber) — from idx 15+
      if (idx >= 15 && Math.random() < ENEMY_SPAWN_CHANCE * 0.5) {
        const advTypes = getAvailableEnemyTypes(this.config.chapter).filter(
          t => t === 'charger' || t === 'bomber'
        );
        if (advTypes.length > 0) {
          const et = advTypes[Math.floor(Math.random() * advTypes.length)];
          this.spawnEnemy(x + w / 2, y - 15, et);
        }
      }
      // Elite enemies — from idx 20+
      if (idx >= 20 && Math.random() < ELITE_SPAWN_CHANCE) {
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
      // Mini boss — from idx 25+, 15% on levels 5/9, otherwise 1%
      const miniBossChance = isMiniBossLevel(this.config.level) ? 0.15 : MINI_BOSS_SPAWN_CHANCE;
      if (idx >= 25 && Math.random() < miniBossChance) {
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

    const baseGap = isWarmup ? 50 : 60 + difficulty * 100;
    const rawGap = baseGap * gapMult * gapMod * (0.85 + Math.random() * 0.3);
    const gap = Math.min(maxReach * 0.80, rawGap);

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
    const jumpMult = boostActive ? 1.5 : 1.0;
    const jumpForce = PHYSICS.JUMP_FORCE * char.jumpMultiplier * jumpMult;
    const force = this.jumpCount === 0 ? jumpForce : jumpForce * PHYSICS.DOUBLE_JUMP_MULTIPLIER;

    this.playerVY = force;
    this.jumpCount++;
    this.isGrounded = false;
    this.energy = Math.min(ENERGY_MAX, this.energy + ENERGY_PER_JUMP);
    this.spawnParticles(0xffe4b5, PHYSICS.JUMP_PARTICLE_COUNT, 4, 3);
    this.audio.jump();

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
          this.spawnParticles(0xff4040, 8, 3, 3);
        }
        break;
      case 'energy':
        // Instant energy restore: add 50 energy
        this.energy = Math.min(ENERGY_MAX, this.energy + ENERGY_MAX * 0.5);
        this.spawnParticles(0x6bb8e8, 8, 3, 3);
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

  // ========== Particles ==========
  private spawnParticles(color: number, count: number, vxRange: number, vyRange: number): void {
    for (let i = 0; i < count; i++) {
      const obj = this.add.circle(
        this.playerX + (Math.random() - 0.5) * 10,
        this.playerY + this.playerHeight / 2,
        2 + Math.random() * 3,
        color,
        0.8
      );
      obj.setDepth(15);
      this.particles.push({
        obj,
        data: {
          vx: (Math.random() - 0.5) * vxRange,
          vy: -Math.random() * vyRange,
          life: 30,
        },
      });
    }
  }

  private updateParticles(normalized: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.obj.x += p.data.vx * normalized;
      p.data.vy += PHYSICS.PARTICLE_GRAVITY * normalized;
      p.obj.y += p.data.vy * normalized;
      p.data.life -= normalized;
      p.obj.setAlpha(Math.max(0, p.data.life / 30));
      if (p.data.life <= 0) {
        p.obj.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  // ========== HUD ==========
  private createHUD(): void {
    const padding = 12;

    this.heartIcons = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(padding + i * 22 + 8, padding + 10, 'heart-full');
      heart.setScale(0.8);
      heart.setDepth(HUD_DEPTH);
      this.heartIcons.push(heart);
    }

    this.levelTag = this.add.text(padding, padding + 26, getLevelDisplayName(this.config.chapter, this.config.level), {
      fontSize: '11px',
      color: '#9e9486',
      fontFamily: 'sans-serif',
    });
    this.levelTag.setDepth(HUD_DEPTH);

    this.progressBar = this.add.graphics();
    this.progressFill = this.add.graphics();
    this.progressBar.setDepth(HUD_DEPTH);
    this.progressFill.setDepth(HUD_DEPTH + 1);
    this.drawProgressBar();

    this.shardCountText = this.add.text(PHYSICS.CANVAS_WIDTH - padding - 80, padding + 4, '★ 0 / 3', {
      fontSize: '14px',
      color: '#ffd980',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    });
    this.shardCountText.setDepth(HUD_DEPTH);

    this.scoreText = this.add.text(PHYSICS.CANVAS_WIDTH - padding, padding + 30, '0', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    });
    this.scoreText.setOrigin(1, 0);
    this.scoreText.setDepth(HUD_DEPTH);

    const pauseBtn = this.add.text(PHYSICS.CANVAS_WIDTH - 20, 14, '⏸', {
      fontSize: '18px',
      color: '#ece2d0',
      fontFamily: 'sans-serif',
    });
    pauseBtn.setAlpha(0.7);
    pauseBtn.setDepth(HUD_DEPTH);
    pauseBtn.setInteractive();
    pauseBtn.on('pointerdown', () => this.togglePause());

    // Energy bar (ninja art)
    this.energyBar = this.add.graphics();
    this.energyFill = this.add.graphics();
    this.energyBar.setDepth(HUD_DEPTH);
    this.energyFill.setDepth(HUD_DEPTH + 1);

    this.energyLabel = this.add.text(PHYSICS.CANVAS_WIDTH - padding - 80, padding + 48, '忍术 [E]', {
      fontSize: '10px',
      color: '#9e9486',
      fontFamily: 'sans-serif',
    });
    this.energyLabel.setDepth(HUD_DEPTH);
    this.drawEnergyBar();

    // Pre-allocate power-up icon pool (max 4 slots)
    for (let i = 0; i < 4; i++) {
      const x = PHYSICS.CANVAS_WIDTH - 92 - i * 30;
      const y = 78;
      const icon = this.add.image(x, y, 'pu-shield');
      icon.setDisplaySize(16, 16);
      icon.setDepth(HUD_DEPTH);
      icon.setVisible(false);
      const timer = this.add.text(x, y + 10, '', {
        fontSize: '9px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      });
      timer.setOrigin(0.5, 0);
      timer.setDepth(HUD_DEPTH);
      timer.setVisible(false);
      this.powerUpIcons.push({ type: 'shield', icon, timer });
    }

    const hint = this.add.text(padding, PHYSICS.CANVAS_HEIGHT - padding - 10, 'SPACE/点击: 跳跃  E: 忍术  自动射击', {
      fontSize: '10px',
      color: '#9e9486',
      fontFamily: 'sans-serif',
    });
    hint.setDepth(HUD_DEPTH);

    this.weaponIcon = this.add.image(padding + 14, PHYSICS.CANVAS_HEIGHT - padding - 30, 'pu-weapon-pistol');
    this.weaponIcon.setDisplaySize(20, 20);
    this.weaponIcon.setDepth(HUD_DEPTH);
    this.weaponNameText = this.add.text(padding + 30, PHYSICS.CANVAS_HEIGHT - padding - 38, '手枪', {
      fontSize: '11px',
      color: '#ffd980',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    });
    this.weaponNameText.setDepth(HUD_DEPTH);
  }

  private drawBar(
    bg: Phaser.GameObjects.Graphics,
    fill: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number, radius: number,
    bgColor: number, bgAlpha: number, fillColor: number, fillAlpha: number,
    ratio: number,
  ): void {
    bg.clear();
    bg.fillStyle(bgColor, bgAlpha);
    bg.fillRoundedRect(x, y, w, h, radius);
    fill.clear();
    fill.fillStyle(fillColor, fillAlpha);
    fill.fillRoundedRect(x, y, w * ratio, h, radius);
  }

  private drawEnergyBar(): void {
    const progress = this.energy / ENERGY_MAX;
    const color = progress >= 1 ? 0xffd700 : 0x8b5cf6;
    this.drawBar(this.energyBar, this.energyFill, PHYSICS.CANVAS_WIDTH - 92, 64, 80, 5, 2, 0xffffff, 0.15, color, 1, progress);
  }

  private drawProgressBar(): void {
    const progress = this.config.targetDistance > 0 ? Phaser.Math.Clamp(this.distance / this.config.targetDistance, 0, 1) : 0;
    this.drawBar(this.progressBar, this.progressFill, 12, 52, 120, 6, 3, 0xffffff, 0.2, 0x6bb8e8, 1, progress);
  }

  private updateHUD(): void {
    if (!this.hudNeedsUpdate) return;
    this.hudNeedsUpdate = false;

    for (let i = 0; i < 3; i++) {
      this.heartIcons[i].setTexture(i < this.lives ? 'heart-full' : 'heart-empty');
    }

    this.scoreText.setText(this.score.toLocaleString());
    this.shardCountText.setText(`★ ${this.shardsCollected} / ${this.totalShards}`);
    this.drawProgressBar();
    this.drawEnergyBar();

    if (this.hasShield) {
      this.energyLabel.setText('忍术 [E]  🛡');
    } else {
      this.energyLabel.setText('忍术 [E]');
    }

    // Update pre-allocated power-up icon pool
    let puIdx = 0;
    for (const [type, remaining] of this.activePowerUps) {
      if (puIdx >= 4) break;
      const slot = this.powerUpIcons[puIdx];
      slot.type = type;
      slot.icon.setTexture(`pu-${type}`);
      slot.icon.setVisible(true);
      slot.timer.setText(`${Math.ceil(remaining / 1000)}s`);
      slot.timer.setVisible(true);
      puIdx++;
    }
    for (let i = puIdx; i < 4; i++) {
      this.powerUpIcons[i].icon.setVisible(false);
      this.powerUpIcons[i].timer.setVisible(false);
    }

    const wCfg = WEAPON_CONFIGS[this.currentWeapon];
    this.weaponIcon.setTexture(`pu-weapon-${this.currentWeapon}`);
    this.weaponNameText.setText(wCfg.name);
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

  private togglePause(): void {
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

  private onPlayerFall(): void {
    // Shield absorbs one hit — always check, even if dead is already set
    if (this.hasShield) {
      this.hasShield = false;
      this.hudNeedsUpdate = true;
      this.spawnParticles(0x4fc3f7, 8, 5, 4);
      this.respawnOnPlatform();
      this.dead = false;
      return;
    }

    // Revive token — always check, even if dead is already set
    if (this.activePowerUps.has('revive')) {
      this.activePowerUps.delete('revive');
      this.lives = Math.max(1, Math.floor(3 * 0.5)); // Restore 50% life
      this.hudNeedsUpdate = true;
      this.spawnParticles(0xffc800, 12, 5, 5);
      this.audio.powerup();
      this.respawnOnPlatform();
      this.dead = false;
      return;
    }

    // Prevent duplicate death processing in the same frame
    if (this.dead) return;
    this.dead = true;

    this.lives--;
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
      this.player.setScale(PHYSICS.WORLD_SCALE);
      this.updatePlayerVisuals(1);
      this.dead = false;
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
      if (this.particles.length > 0) {
        this.updateParticles(Math.min(delta, 32) / 16.67);
      }
      return;
    }

    const normalized = Math.min(delta, 32) / 16.67;

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this.wKey) ||
        Phaser.Input.Keyboard.JustDown(this.upKey)) {
      this.doJump();
    }
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.tryActivateNinjaArt();
    }
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.pauseGame();
      return;
    }

    const slowTimeActive = this.activePowerUps.has('slowtime');
    const speedFactor = slowTimeActive ? 0.5 : 1.0;
    const maxSpeed = PHYSICS.MAX_SPEED * this.config.speedMultiplier * speedFactor;
    this.speed = Math.min(maxSpeed, this.speed + PHYSICS.SPEED_RAMP * normalized);

    this.playerVY += PHYSICS.GRAVITY * this.chapterData.gravityMultiplier * normalized;
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
          this.spawnParticles(0xffffff, PHYSICS.LAND_PARTICLE_COUNT, 3, 2);
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
    const magnetThreshold = MAGNET_RADIUS * MAGNET_RADIUS;
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
    this.updateParticles(normalized);
    this.updatePlatformTypes();
    this.updateNinjaArt(delta);
    this.shootWeapon();
    this.updatePlayerBullets(normalized);
    this.updateEnemies(delta, normalized);
    this.updateBullets(normalized);
    this.updateBoss(delta, normalized);
    this.updateHUD();

    // Chapter-specific environment effects
    this.liquidMetalTimer += delta;
    this.updateSandstorm(normalized);
    this.updateLightning(delta);
    this.updateVines(delta, normalized);
    this.updateDarkness();
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
          this.spawnParticles(0xff6020, 2, 1, 1); // Orange trail
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
          e.hp--;
          this.playerVY = PHYSICS.JUMP_FORCE * 0.6; // bounce
          this.spawnParticles(cfg.color, 5, 3, 3);
          this.score += cfg.scoreReward;
          this.hudNeedsUpdate = true;
          if (e.hp <= 0) {
            e.sprite.destroy();
            this.enemies.splice(i, 1);
            continue;
          }
        }
      }

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
        this.spawnParticles(0xff0000, 6, 4, 3);
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
      this.particles.push({
        obj: p,
        data: { vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 4, life: 40 },
      });
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
          this.spawnParticles(0x00e676, 4, 3, 3);
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
          this.spawnParticles(0xffa000, 5, 3, 3);
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
            this.spawnParticles(0xb088c8, 4, 2, 2);
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
          this.spawnParticles(cfg.color, 3, 2, 2);
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
          this.spawnParticles(0xff0000, 3, 2, 2);
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
    this.spawnParticles(0xff5722, 8, 5, 5);

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
        const phase = Math.sin(this.liquidMetalTimer * 0.002 + plat.x * 0.01);
        plat.setScale(1, 0.85 + phase * 0.15);
        plat.setAlpha(0.85 + phase * 0.15);
        if (plat.overlaySprite) plat.overlaySprite.setAlpha(0.3 + phase * 0.2);
      }
    }
  }

  // ========== Environment Effects ==========

  private initEnvironmentEffect(chapter: number): void {
    if (this.envOverlay) {
      this.envOverlay.destroy();
      this.envOverlay = null;
    }

    switch (chapter) {
      case 3: // Sandstorm
        this.envOverlay = this.add.graphics();
        this.envOverlay.setDepth(40);
        this.envOverlay.setScrollFactor(0);
        break;
      case 7: // Lightning
        this.lightningTimer = 3000 + Math.random() * 5000;
        break;
      case 8: // Vine growth
        this.vineSegments = [];
        break;
      case 10: // Darkness
        this.envOverlay = this.add.graphics();
        this.envOverlay.setDepth(40);
        this.envOverlay.setScrollFactor(0);
        break;
    }
  }

  private updateSandstorm(normalized: number): void {
    if (!this.envOverlay || this.config.chapter !== 3) return;

    this.envOverlay.clear();

    // Semi-transparent sandy overlay that pulses
    const pulse = 0.15 + Math.sin(this.time.now * 0.001) * 0.05;
    this.envOverlay.fillStyle(0xbf5b3b, pulse);
    this.envOverlay.fillRect(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);

    // Horizontal sand streaks
    for (let i = 0; i < 6; i++) {
      const y = (this.time.now * 0.05 + i * 70) % PHYSICS.CANVAS_HEIGHT;
      const alpha = 0.08 + Math.sin(this.time.now * 0.002 + i) * 0.04;
      this.envOverlay.fillStyle(0xd4a574, alpha);
      this.envOverlay.fillRect(0, y, PHYSICS.CANVAS_WIDTH, 3);
    }

    // Sand particle effect
    if (Math.random() < 0.3 * normalized && this.envParticles.length < 50) {
      const obj = this.add.circle(
        PHYSICS.CANVAS_WIDTH + 10,
        Math.random() * PHYSICS.CANVAS_HEIGHT,
        1.5 + Math.random() * 1.5,
        0xd4a574,
        0.4
      );
      obj.setDepth(39);
      obj.setScrollFactor(0);
      this.envParticles.push({
        obj,
        data: { vx: -3 - Math.random() * 2, vy: 0.5 + Math.random(), life: 200 },
      });
    }

    for (let i = this.envParticles.length - 1; i >= 0; i--) {
      const p = this.envParticles[i];
      p.obj.x += p.data.vx * normalized;
      p.obj.y += p.data.vy * normalized;
      p.data.life -= normalized;
      if (p.data.life <= 0 || p.obj.x < -10) {
        p.obj.destroy();
        this.envParticles.splice(i, 1);
      }
    }
  }

  private updateLightning(delta: number): void {
    if (this.config.chapter !== 7) return;

    this.lightningTimer -= delta;
    if (this.lightningTimer <= 0) {
      this.lightningTimer = 3000 + Math.random() * 5000;

      // Lightning flash
      const flash = this.add.graphics();
      flash.setDepth(45);
      flash.setScrollFactor(0);
      flash.fillStyle(0xffffff, 0.6);
      flash.fillRect(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 150,
        onComplete: () => flash.destroy(),
      });

      // Lightning bolt visual
      const boltX = this.cameraTargetX + Math.random() * PHYSICS.CANVAS_WIDTH;
      const bolt = this.add.graphics();
      bolt.setDepth(44);
      bolt.lineStyle(3, 0xffdd00, 0.9);
      let bx = boltX;
      let by = 0;
      while (by < PHYSICS.CANVAS_HEIGHT) {
        const nextBx = bx + (Math.random() - 0.5) * 30;
        const nextBy = by + 15 + Math.random() * 25;
        bolt.lineBetween(bx, by, nextBx, nextBy);
        bx = nextBx;
        by = nextBy;
      }
      this.tweens.add({
        targets: bolt,
        alpha: 0,
        duration: 200,
        onComplete: () => bolt.destroy(),
      });

      // Damage check
      const boltScreenX = boltX - this.cameraTargetX;
      const playerScreenX = this.playerX - this.cameraTargetX;
      if (Math.abs(boltScreenX - playerScreenX) < 40) {
        if (!this.hasShield && !this.activePowerUps.has('shield')) {
          this.onPlayerFall();
        }
      }

      this.audio.lightningStrike();
    }
  }

  private updateVines(delta: number, normalized: number): void {
    if (this.config.chapter !== 8) return;

    // Spawn new vines periodically
    if (Math.random() < 0.005 * normalized && this.vineSegments.length < 20) {
      const camLeft = this.cameraTargetX;
      const camRight = camLeft + PHYSICS.CANVAS_WIDTH;
      const candidates = this.platforms.filter(p =>
        p.x > camLeft && p.x < camRight && p.platformType === 'normal'
      );
      if (candidates.length > 0) {
        const plat = candidates[Math.floor(Math.random() * candidates.length)];
        const platTop = plat.y - plat.height / 2;
        const vine = this.add.circle(plat.x, platTop, 3, 0x2d8a2d, 0.8);
        vine.setDepth(8);
        this.vineSegments.push({
          sprite: vine,
          age: 0,
          maxHeight: 40 + Math.random() * 30,
          platformX: plat.x,
        });
      }
    }

    for (let i = this.vineSegments.length - 1; i >= 0; i--) {
      const v = this.vineSegments[i];
      v.age += delta;

      if (v.age < 3000) {
        // Growing phase
        const growProgress = v.age / 3000;
        v.sprite.setRadius(3 + growProgress * 2);
        v.sprite.y -= 0.3 * normalized;

        // Vine collision with player
        const dx = Math.abs(this.playerX - v.platformX);
        const currentHeight = v.maxHeight * growProgress;
        if (dx < 15 && this.playerY > v.sprite.y - currentHeight && this.playerY < v.sprite.y + 10) {
          this.playerX -= this.speed * 0.5 * normalized;
        }
      } else if (v.age > 8000) {
        // Decay phase
        const decayProgress = (v.age - 8000) / 2000;
        v.sprite.setAlpha(1 - decayProgress);
        if (decayProgress >= 1) {
          v.sprite.destroy();
          this.vineSegments.splice(i, 1);
        }
      }
    }
  }

  private updateDarkness(): void {
    if (!this.envOverlay || this.config.chapter !== 10) return;

    this.envOverlay.clear();

    const playerScreenX = this.playerX - this.cameraTargetX;
    const playerScreenY = this.playerY - PHYSICS.CAMERA_SCROLL_Y;
    const radius = 90;

    // Dark edges
    this.envOverlay.fillStyle(0x000000, 0.85);
    this.envOverlay.fillRect(0, 0, PHYSICS.CANVAS_WIDTH, Math.max(0, playerScreenY - radius));
    this.envOverlay.fillRect(0, playerScreenY + radius, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT - playerScreenY - radius);
    this.envOverlay.fillRect(0, 0, Math.max(0, playerScreenX - radius), PHYSICS.CANVAS_HEIGHT);
    this.envOverlay.fillRect(playerScreenX + radius, 0, PHYSICS.CANVAS_WIDTH - playerScreenX - radius, PHYSICS.CANVAS_HEIGHT);

    // Gradient ring
    for (let r = radius; r > 20; r -= 10) {
      const alpha = 0.85 * (1 - (r / radius));
      this.envOverlay.fillStyle(0x000000, alpha);
      this.envOverlay.fillCircle(playerScreenX, playerScreenY, r);
    }
  }
}
