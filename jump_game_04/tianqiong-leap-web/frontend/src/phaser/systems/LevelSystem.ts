import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { getCharacterById } from '../../constants/characters';
import { isMiniBossLevel, type PlatformType } from '../../constants/levels';
import { PLATFORM_TYPE_CONFIGS } from '../../constants/platformtypes';
import { POWER_UP_SPAWN_CHANCE } from '../../constants/powerups';
import { WEAPON_SPAWN_CHANCE } from '../../constants/weapons';
import { ENEMY_CONFIGS, ENEMY_SPAWN_CHANCE, ELITE_SPAWN_CHANCE, MINI_BOSS_SPAWN_CHANCE, getAvailableEnemyTypes, type EnemyType } from '../../constants/enemies';
import type { GameScene, PlatformSprite } from '../scenes/GameScene';

const HUD_DEPTH = 100;
const PLAYER_SCREEN_X = 80;

export class LevelSystem {
  // public for system access (refactor in progress)
  platforms: PlatformSprite[] = [];
  // public for system access (refactor in progress)
  passedPlatformCount = 0;
  // public for system access (refactor in progress)
  shardsSpawned = 0;
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  // ========== Camera ==========
  setupCamera(): void {
    const cam = this.scene.cameras.main;
    cam.setBounds(0, 0, Number.MAX_SAFE_INTEGER, PHYSICS.CANVAS_HEIGHT + Math.abs(PHYSICS.CAMERA_SCROLL_Y) + 200);
    cam.startFollow(this.scene.playerSystem.player, false, 0.15, 0.1);
    cam.setFollowOffset(-PHYSICS.CANVAS_WIDTH / 2 + PLAYER_SCREEN_X, Math.round(PHYSICS.CANVAS_HEIGHT * 0.3));
    cam.scrollX = 0;
    cam.scrollY = PHYSICS.CAMERA_SCROLL_Y;
    cam.setLerp(0.15, 0.1);

    if (!this.scene.hudCam) {
      this.scene.hudCam = this.scene.cameras.add(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);
    }
    this.scene.hudCam.setScroll(0, 0);
    this.scene.hudCam.ignore(this.scene.children.list.filter(c => {
      const d = (c as unknown as { depth?: number }).depth;
      return d === undefined || d < HUD_DEPTH;
    }));
  }

  // ========== Platforms ==========
  // public for system access (refactor in progress)
  spawnPlatform(x: number, y: number, width: number): PlatformSprite {
    const texKey = `platform-${this.scene.config.chapter}`;
    const h = PHYSICS.PLATFORM_HEIGHT + 8;
    const plat = this.scene.add.tileSprite(x + width / 2, y + h / 2, width, h, texKey) as unknown as PlatformSprite;
    plat.setDepth(1);
    plat.passed = false;

    // Assign platform type based on level config (data-driven)
    const weights = this.scene.config.platformTypeWeights
      ?? this.scene.chapterData.defaultPlatformTypeWeights;
    let pType: PlatformType = 'normal';
    const roll = Math.random();
    let acc = 0;
    for (const [t, w] of Object.entries(weights)) {
      if (w === undefined) continue;
      acc += w;
      if (roll < acc) {
        pType = t as PlatformType;
        break;
      }
    }
    plat.platformType = pType;

    // Add overlay for special platforms
    if (pType === 'ice') {
      const overlay = this.scene.add.image(plat.x, plat.y, 'overlay-ice');
      overlay.setDisplaySize(width, h);
      overlay.setDepth(2);
      overlay.setAlpha(0.6);
      plat.overlaySprite = overlay;
    } else if (pType === 'melting') {
      plat.meltTimer = 0;
      const overlay = this.scene.add.image(plat.x, plat.y, 'overlay-melting');
      overlay.setDisplaySize(width, h + 12);
      overlay.setDepth(2);
      overlay.setAlpha(0.5);
      plat.overlaySprite = overlay;
    } else if (pType === 'invisible') {
      plat.setAlpha(0);
      if (plat.overlaySprite) plat.overlaySprite.setAlpha(0);
    } else if (pType === 'liquid_metal') {
      const overlay = this.scene.add.image(plat.x, plat.y, 'overlay-liquid_metal');
      overlay.setDisplaySize(width, h);
      overlay.setDepth(2);
      overlay.setAlpha(0.5);
      plat.overlaySprite = overlay;
    }

    this.platforms.push(plat);
    return plat;
  }

  generateInitial(): void {
    const startY = 350;
    const platformCount = this.scene.config.initialPlatformCount ?? PHYSICS.INITIAL_PLATFORM_COUNT;
    this.spawnPlatform(0, startY, 400);

    let lastCX = 200;
    let lastTopY = startY;
    let lastW = 400;

    const shardIndices = this.scene.config.shardPlatformIndices;

    for (let i = 1; i < platformCount; i++) {
      const { x, y, w } = this.calcNextPlatform(lastCX, lastTopY, lastW, i);
      this.spawnPlatform(x, y, w);

      if (shardIndices && shardIndices.includes(i) && this.shardsSpawned < this.scene.totalShards) {
        this.scene.collectibleSystem.spawnShard(x + w / 2, y - 35);
      } else if (!shardIndices && this.shardsSpawned < this.scene.totalShards && Math.random() < 0.5) {
        this.scene.collectibleSystem.spawnShard(x + w / 2, y - 35);
      }
      if (Math.random() < POWER_UP_SPAWN_CHANCE) {
        this.scene.collectibleSystem.spawnPowerUp(x + w / 2, y - 50);
      }
      if (Math.random() < WEAPON_SPAWN_CHANCE) {
        this.scene.collectibleSystem.spawnWeaponPickup(x + w / 2, y - 65);
      }
      if (i > 1) {
        const spawnChance = Math.max(this.scene.config.enemySpawnChance ?? 0, ENEMY_SPAWN_CHANCE);
        if (Math.random() < spawnChance) {
          const et = this.scene.enemySystem.pickType();
          const ey = et === 'flyer' ? y - 50 : y - 15;
          this.scene.enemySystem.spawn(x + w / 2, ey, et);
        }
      }

      lastCX = x + w / 2;
      lastTopY = y;
      lastW = w;
    }
  }

  ensure(): void {
    if (this.scene.distance >= this.scene.config.targetDistance - 400) return;

    const camRight = this.scene.cameraTargetX + PHYSICS.CANVAS_WIDTH + PHYSICS.PLATFORM_SPAWN_BUFFER;
    const estimatedTotal = Math.max(10, this.scene.config.targetDistance / 180);

    for (let safety = 0; safety < 5; safety++) {
      const last = this.platforms[this.platforms.length - 1];
      if (!last) break;

      const lastRight = last.x + last.width / 2;
      if (lastRight >= camRight) break;

      const lastTopY = last.y - (PHYSICS.PLATFORM_HEIGHT + 8) / 2;
      const idx = this.platforms.length;
      const { x, y, w } = this.calcNextPlatform(last.x, lastTopY, last.width, idx);

      this.spawnPlatform(x, y, w);

      const shardIndices = this.scene.config.shardPlatformIndices;
      if (shardIndices && shardIndices.includes(idx) && this.shardsSpawned < this.scene.totalShards) {
        this.scene.collectibleSystem.spawnShard(x + w / 2, y - 35);
      } else if (!shardIndices) {
        const shardUrgent = idx > estimatedTotal * 0.4 && this.shardsSpawned < this.scene.totalShards;
        if (this.shardsSpawned < this.scene.totalShards && (shardUrgent || Math.random() < 0.30)) {
          this.scene.collectibleSystem.spawnShard(x + w / 2, y - 35);
        }
      }
      if (Math.random() < POWER_UP_SPAWN_CHANCE) {
        this.scene.collectibleSystem.spawnPowerUp(x + w / 2, y - 50);
      }
      if (Math.random() < WEAPON_SPAWN_CHANCE) {
        this.scene.collectibleSystem.spawnWeaponPickup(x + w / 2, y - 65);
      }
      // Basic enemies — config-driven or chapter-based
      const spawnChance = Math.max(this.scene.config.enemySpawnChance ?? 0, ENEMY_SPAWN_CHANCE);
      if (idx >= 5 && Math.random() < spawnChance) {
        const et = this.scene.enemySystem.pickType();
        const ey = et === 'flyer' ? y - 50 : y - 15;
        this.scene.enemySystem.spawn(x + w / 2, ey, et);
      }
      // Advanced enemies (charger/bomber) — from idx 8+
      if (idx >= 8 && Math.random() < ENEMY_SPAWN_CHANCE * 0.4) {
        const advTypes = getAvailableEnemyTypes(this.scene.config.chapter).filter(
          t => t === 'charger' || t === 'bomber'
        );
        if (advTypes.length > 0) {
          const et = advTypes[Math.floor(Math.random() * advTypes.length)];
          this.scene.enemySystem.spawn(x + w / 2, y - 15, et);
        }
      }
      // Elite enemies — from idx 12+
      if (idx >= 12 && Math.random() < ELITE_SPAWN_CHANCE) {
        const eliteTypes: EnemyType[] = ['elite_charger', 'elite_fire', 'elite_ice', 'elite_shadow', 'elite_crystal'];
        const available = eliteTypes.filter(t => {
          const cfg = ENEMY_CONFIGS[t];
          return cfg && cfg.chapters.includes(this.scene.config.chapter);
        });
        if (available.length > 0) {
          const et = available[Math.floor(Math.random() * available.length)];
          this.scene.enemySystem.spawn(x + w / 2, y - 15, et);
        }
      }
      // Mini boss — from idx 18+, 15% on levels 5/9, otherwise 3%
      const miniBossChance = isMiniBossLevel(this.scene.config.level) ? 0.15 : MINI_BOSS_SPAWN_CHANCE;
      if (idx >= 18 && Math.random() < miniBossChance) {
        this.scene.enemySystem.spawn(x + w / 2, y - 20, 'mini_boss');
      }
    }
  }

  // ========== Jump Physics Helpers ==========
  private calcJumpMetrics(): { maxReach: number; maxHeight: number } {
    const char = getCharacterById(this.scene.characterId);
    const gravity = PHYSICS.GRAVITY * this.scene.chapterData.gravityMultiplier;
    const jumpV = Math.abs(PHYSICS.JUMP_FORCE * char.jumpMultiplier);
    const airTime = 2 * jumpV / gravity;
    const maxReach = this.scene.speed * airTime;
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
    const gapMult = this.scene.config.platformGapMultiplier;
    const estimatedTotal = Math.max(10, this.scene.config.targetDistance / 180);
    const difficulty = Math.min(1, platformIndex / estimatedTotal);
    const isWarmup = platformIndex < 4;
    const ch = this.scene.config.chapter;

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

  // ========== Collision ==========
  handleCollision(normalized: number, delta: number): void {
    // Platform collision
    this.scene.playerSystem.isGrounded = false;
    const playerBottom = this.scene.playerY + this.scene.playerHeight / 2;
    const playerLeft = this.scene.playerX - this.scene.playerWidth / 2 + PHYSICS.COLLISION_X_INSET;
    const playerRight = this.scene.playerX + this.scene.playerWidth / 2 - PHYSICS.COLLISION_X_INSET;
    const collisionLeft = this.scene.playerX - 300;
    const collisionRight = this.scene.playerX + 100;

    for (const plat of this.platforms) {
      const platRight = plat.x + plat.width / 2;
      if (platRight < collisionLeft) continue;
      const platLeft = plat.x - plat.width / 2;
      if (platLeft > collisionRight) continue;
      const platTop = plat.y - plat.height / 2;

      if (this.scene.playerSystem.playerVY >= 0 &&
          playerRight > platLeft && playerLeft < platRight &&
          playerBottom >= platTop && playerBottom <= platTop + Math.max(this.scene.playerSystem.playerVY * normalized, 8)) {
        this.scene.playerY = platTop - this.scene.playerHeight / 2;
        this.scene.playerSystem.playerVY = 0;
        this.scene.playerSystem.isGrounded = true;
        if (this.scene.playerSystem.jumpCount > 0) {
          this.scene.particles.spawn(0xffffff, PHYSICS.LAND_PARTICLE_COUNT, 3, 2);
          this.scene.audio.land();
        }
        this.scene.playerSystem.jumpCount = 0;

        // 角色被动技能：零号精准着陆 — 落地吸附到平台中心
        this.scene.playerSystem.applyPreciseLanding(plat.x, plat.width);

        if (plat.platformType === 'ice' && this.scene.playerSystem.isGrounded) {
          this.scene.playerSystem.iceSlideVX = this.scene.speed * 1.5;
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

      if (!plat.passed && platRight < this.scene.playerX) {
        plat.passed = true;
        this.passedPlatformCount++;
      }
    }
  }

  // ========== Cull ==========
  cull(): void {
    const cullLeft = this.scene.cameraTargetX + PHYSICS.PLATFORM_CULL_X;
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const plat = this.platforms[i];
      if (plat.x + plat.width / 2 < cullLeft) {
        if (plat.overlaySprite) plat.overlaySprite.destroy();
        plat.destroy();
        this.platforms.splice(i, 1);
      }
    }
  }

  // ========== Platform Type Updates ==========
  updatePlatformTypes(): void {
    const xrayActive = this.scene.activePowerUps.has('xray');
    for (const plat of this.platforms) {
      if (plat.platformType === 'invisible') {
        if (xrayActive) {
          plat.setAlpha(0.6);
          if (plat.overlaySprite) plat.overlaySprite.setAlpha(0.3);
        } else {
          const dx = Math.abs(this.scene.playerX - plat.x);
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
        const phase = Math.sin(this.scene.environment.liquidMetalTimer * 0.002 + plat.x * 0.01);
        plat.setScale(1, 0.85 + phase * 0.15);
        plat.setAlpha(0.85 + phase * 0.15);
        if (plat.overlaySprite) plat.overlaySprite.setAlpha(0.3 + phase * 0.2);
      }
    }
  }

  clear(): void {
    const safeDestroy = (obj: { active?: boolean; destroy?: () => void } | null | undefined) => {
      try {
        if (obj && obj.active !== false && typeof obj.destroy === 'function') {
          obj.destroy();
        }
      } catch {
        // Object may already be destroyed
      }
    };
    this.platforms.forEach(safeDestroy);
    this.platforms = [];
    this.passedPlatformCount = 0;
    this.shardsSpawned = 0;
  }
}
