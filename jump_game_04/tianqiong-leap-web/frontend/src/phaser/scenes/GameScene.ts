import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { getCharacterById } from '../../constants/characters';
import { getLevelConfig, getChapterData, type LevelConfig, type ChapterData } from '../../constants/levels';
import type { PlatformType } from '../../constants/platformtypes';
import type { PowerUpType } from '../../constants/powerups';
import { WEAPON_CONFIGS } from '../../constants/weapons';
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
import { LevelSystem } from '../systems/LevelSystem';
import { CollectibleSystem } from '../systems/CollectibleSystem';
import { NinjaArtSystem } from '../systems/NinjaArtSystem';

export type PlatformSprite = Phaser.GameObjects.TileSprite & {
  passed?: boolean;
  platformType?: PlatformType;
  meltTimer?: number;
  overlaySprite?: Phaser.GameObjects.Image;
};

export interface ShardSprite extends Phaser.GameObjects.Image {
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
  // public for system access (refactor in progress)
  environment!: EnvironmentSystem;
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
  // public for system access (refactor in progress)
  levelSystem!: LevelSystem;
  // public for system access (refactor in progress)
  collectibleSystem!: CollectibleSystem;
  // public for system access (refactor in progress)
  ninjaArtSystem!: NinjaArtSystem;

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
  // public for system access (refactor in progress)
  activePowerUps: Map<PowerUpType, number> = new Map();
  // public for system access (refactor in progress)
  hasShield = false;

  // Ninja art
  // public for system access (refactor in progress)
  energy = 0;

  // Camera
  // public for system access (refactor in progress)
  hudCam: Phaser.Cameras.Scene2D.Camera | null = null;

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
    this.levelSystem = new LevelSystem(this);
    this.collectibleSystem = new CollectibleSystem(this);
    this.ninjaArtSystem = new NinjaArtSystem(this);
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

    this.particles.clear();
    this.background.clear();
    this.hud.clear();
    this.environment.clear();

    // Clear subsystem-owned objects
    this.playerSystem?.clear();
    this.enemySystem?.clear();
    this.bossSystem?.clear();
    this.weaponSystem?.clear();
    this.petSystem?.clear();
    this.levelSystem?.clear();
    this.collectibleSystem?.clear();
    this.ninjaArtSystem?.clear();

    // Reset state
    this.activePowerUps.clear();
    this.hasShield = false;
    this.energy = 0;
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
    this.levelSystem.generateInitial();
    this.levelSystem.setupCamera();
    this.hud.create();
    this.audio.startBGM(chapter);
    this.environment.init(chapter);

    const mainCam = this.cameras.main;
    const hudElements = this.children.list.filter(c => (c as unknown as { depth?: number }).depth !== undefined && (c as unknown as { depth: number }).depth >= HUD_DEPTH);
    mainCam.ignore(hudElements);

    this.hudNeedsUpdate = true;
    EventBus.emit(EVENTS.GAME_STATE_CHANGED, 'playing');
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
      this.ninjaArtSystem.tryActivate();
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

    this.collectibleSystem.preUpdate(normalized);

    if (!this.playerSystem.isGrounded && this.playerSystem.jumpCount === 0 && this.playerY < PHYSICS.CANVAS_HEIGHT * 0.8) {
      this.playerSystem.jumpCount = 1;
    }

    // Platform collision
    this.levelSystem.handleCollision(normalized, delta);

    // Collect shards / power-ups / weapons
    this.collectibleSystem.collect();

    for (const [type, remaining] of this.activePowerUps) {
      const newTime = remaining - delta;
      if (newTime <= 0) {
        this.activePowerUps.delete(type);
        this.hudNeedsUpdate = true;
      } else {
        this.activePowerUps.set(type, newTime);
      }
    }

    // Cull off-screen objects
    this.levelSystem.cull();
    this.collectibleSystem.cull();

    this.levelSystem.ensure();

    const newScore = Math.max(
      this.levelSystem.passedPlatformCount * PHYSICS.SCORE_PER_PLATFORM,
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
    this.levelSystem.updatePlatformTypes();
    this.ninjaArtSystem.update(delta);
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

  // ========== Environment Effects ==========
  // (Moved to EnvironmentSystem.ts)
}
