import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { POWER_UP_CONFIGS, MAGNET_RADIUS, type PowerUpType } from '../../constants/powerups';
import { ENERGY_PER_SHARD, ENERGY_MAX } from '../../constants/ninjaarts';
import { getAvailableWeaponTypes, type WeaponType } from '../../constants/weapons';
import { EventBus } from '../EventBus';
import { EVENTS } from '../../types/events';
import type { GameScene, ShardSprite } from '../scenes/GameScene';

export class CollectibleSystem {
  // public for system access (refactor in progress)
  shardSprites: ShardSprite[] = [];
  // public for system access (refactor in progress)
  powerUpSprites: { sprite: Phaser.GameObjects.Image; type: PowerUpType; collected: boolean }[] = [];
  // public for system access (refactor in progress)
  weaponPickups: { sprite: Phaser.GameObjects.Image; type: WeaponType; collected: boolean }[] = [];
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  // ========== Shards ==========
  spawnShard(x: number, y: number): void {
    const glow = this.scene.add.circle(x, y, 12, 0xffd980, 0.3);
    glow.setDepth(4);

    const shard = this.scene.add.image(x, y, 'shard') as ShardSprite;
    shard.setDisplaySize(16, 16);
    shard.setDepth(5);
    shard.collected = false;
    shard.glowCircle = glow;

    this.shardSprites.push(shard);
  }

  // ========== Power-ups ==========
  spawnPowerUp(x: number, y: number): void {
    const types = Object.keys(POWER_UP_CONFIGS) as PowerUpType[];
    const type = types[Math.floor(Math.random() * types.length)];
    const sprite = this.scene.add.image(x, y, `pu-${type}`);
    sprite.setDisplaySize(20, 20);
    sprite.setDepth(6);
    this.powerUpSprites.push({ sprite, type, collected: false });
  }

  private collectPowerUp(type: PowerUpType): void {
    const cfg = POWER_UP_CONFIGS[type];

    switch (type) {
      case 'shield':
        this.scene.hasShield = true;
        break;
      case 'heal':
        // Instant heal: restore 30% life
        if (this.scene.lives < 3) {
          this.scene.lives = Math.min(3, this.scene.lives + 1);
          this.scene.particles.spawn(0xff4040, 8, 3, 3);
        }
        break;
      case 'energy':
        // Instant energy restore: add 50 energy
        this.scene.energy = Math.min(ENERGY_MAX, this.scene.energy + ENERGY_MAX * 0.5);
        this.scene.particles.spawn(0x6bb8e8, 8, 3, 3);
        break;
      case 'revive':
        // Revive token: will trigger on death
        this.scene.activePowerUps.set(type, 0); // 0 = permanent until used
        break;
      case 'xray':
        // X-ray vision: show hidden platforms
        this.scene.activePowerUps.set(type, cfg.duration);
        // TODO: Implement x-ray visibility logic
        break;
      default:
        // Timed power-ups
        this.scene.activePowerUps.set(type, cfg.duration);
        break;
    }

    this.scene.audio.powerup();
    this.scene.hudNeedsUpdate = true;
  }

  // ========== Weapon Pickups ==========
  // public for system access (refactor in progress)
  spawnWeaponPickup(x: number, y: number): void {
    const types = getAvailableWeaponTypes(this.scene.config.chapter);
    if (types.length === 0) return;
    const type = types[Math.floor(Math.random() * types.length)];
    const sprite = this.scene.add.image(x, y, `pu-weapon-${type}`);
    sprite.setDisplaySize(20, 20);
    sprite.setDepth(6);
    this.weaponPickups.push({ sprite, type, collected: false });
  }

  private collectWeapon(type: WeaponType): void {
    this.scene.weaponSystem.currentWeapon = type;
    this.scene.hudNeedsUpdate = true;
    this.scene.audio.pickupWeapon();
  }

  // ========== Update ==========
  preUpdate(normalized: number): void {
    for (const s of this.shardSprites) {
      if (!s.collected && s.active) {
        s.rotation += 0.05 * normalized;
      }
    }
  }

  collect(): void {
    const magnetActive = this.scene.activePowerUps.has('magnet');
    const collectThreshold = (16 + this.scene.playerWidth * 0.5) ** 2;

    // Item: magnet range bonus
    let magnetRangeMult = 1.0;
    for (const item of this.scene.equippedItems) {
      if (item.effect.type === 'passive' && item.effect.stat === 'magnet_range') {
        magnetRangeMult += item.effect.value ?? 0;
      }
    }
    const magnetThreshold = MAGNET_RADIUS * MAGNET_RADIUS * magnetRangeMult * magnetRangeMult;
    for (let i = this.shardSprites.length - 1; i >= 0; i--) {
      const s = this.shardSprites[i];
      if (s.collected || !s.active) continue;
      const dx = this.scene.playerX - s.x;
      const dy = this.scene.playerY - s.y;
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
        this.scene.shardsCollected++;
        this.scene.energy = Math.min(ENERGY_MAX, this.scene.energy + ENERGY_PER_SHARD);
        this.scene.hudNeedsUpdate = true;
        s.destroy();
        if (s.glowCircle) s.glowCircle.destroy();
        this.shardSprites.splice(i, 1);
        this.scene.audio.shard();
        EventBus.emit(EVENTS.SHARD_COLLECTED, { count: this.scene.shardsCollected, total: this.scene.totalShards });

        // Item: triforce_wisdom — collect 3 shards → invincible 1s
        for (const item of this.scene.equippedItems) {
          if (item.effect.type === 'on_collect' && item.effect.stat === 'invincible_on_collect') {
            if (this.scene.shardsCollected % 3 === 0) {
              this.scene.invincibleTimer = item.effect.value ?? 1000;
              this.scene.particles.spawn(0x2979ff, 10, 5, 4);
            }
          }
        }
      }
    }

    const puCollectThreshold = (20 + this.scene.playerWidth * 0.5) ** 2;
    for (let i = this.powerUpSprites.length - 1; i >= 0; i--) {
      const pu = this.powerUpSprites[i];
      if (pu.collected || !pu.sprite.active) continue;
      const dx = this.scene.playerX - pu.sprite.x;
      const dy = this.scene.playerY - pu.sprite.y;
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
      const dx = this.scene.playerX - wp.sprite.x;
      const dy = this.scene.playerY - wp.sprite.y;
      if (dx * dx + dy * dy < puCollectThreshold) {
        wp.collected = true;
        wp.sprite.destroy();
        this.weaponPickups.splice(i, 1);
        this.collectWeapon(wp.type);
      }
    }
  }

  cull(): void {
    const cullLeft = this.scene.cameraTargetX + PHYSICS.PLATFORM_CULL_X;
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
    this.shardSprites.forEach(safeDestroy);
    this.shardSprites = [];
    this.powerUpSprites.forEach(p => safeDestroy(p.sprite));
    this.powerUpSprites = [];
    this.weaponPickups.forEach(w => safeDestroy(w.sprite));
    this.weaponPickups = [];
  }
}
