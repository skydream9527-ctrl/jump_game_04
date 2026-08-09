import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { WEAPON_CONFIGS, WEAPON_DROP_CHANCE, type WeaponType, type WeaponConfig } from '../../constants/weapons';
import { ENEMY_CONFIGS } from '../../constants/enemies';
import { getBossConfig } from '../../constants/boss';
import type { GameScene } from '../scenes/GameScene';

interface PlayerBullet {
  sprite: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  config: WeaponConfig;
  pierced: number;
  age: number;
}

export class WeaponSystem {
  // public for system access (refactor in progress)
  playerBullets: PlayerBullet[] = [];
  // public for system access (refactor in progress)
  currentWeapon: WeaponType = 'pistol';
  private lastFireTime = 0;
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  shoot(): void {
    const now = this.scene.time.now;
    const cfg = WEAPON_CONFIGS[this.currentWeapon];
    if (now - this.lastFireTime < cfg.fireRate) return;
    this.lastFireTime = now;

    const baseX = this.scene.playerX + this.scene.playerWidth / 2;
    const baseY = this.scene.playerY;

    if (cfg.bulletCount === 1) {
      this.spawnBullet(baseX, baseY, cfg.spreadAngle > 0 ? 0 : 0, cfg);
    } else {
      const totalSpread = cfg.spreadAngle * (cfg.bulletCount - 1);
      const startAngle = -totalSpread / 2;
      for (let i = 0; i < cfg.bulletCount; i++) {
        const angle = startAngle + i * cfg.spreadAngle;
        this.spawnBullet(baseX, baseY, angle, cfg);
      }
    }

    if (this.currentWeapon === 'spread') this.scene.audio.shootSpread();
    else if (this.currentWeapon === 'laser') this.scene.audio.shootLaser();
    else this.scene.audio.shoot();
  }

  spawnBullet(x: number, y: number, angleDeg: number, cfg: WeaponConfig): void {
    const rad = (angleDeg * Math.PI) / 180;
    const sprite = this.scene.add.image(x, y, `bullet-${cfg.type}`);
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

  updateBullets(normalized: number): void {
    const cullLeft = this.scene.cameraTargetX + PHYSICS.PLATFORM_CULL_X;

    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const b = this.playerBullets[i];
      b.sprite.x += b.vx * normalized;
      b.sprite.y += b.vy * normalized;
      b.age += normalized;

      if (b.sprite.x < cullLeft - 50 || b.sprite.x > this.scene.cameraTargetX + PHYSICS.CANVAS_WIDTH + 100 ||
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
      if (b.config.type === 'quantum' && this.scene.bossSystem.boss && !this.scene.bossSystem.boss.invulnerable) {
        const bossCfg = getBossConfig(this.scene.config.chapter);
        const dx = b.sprite.x - this.scene.bossSystem.boss.sprite.x;
        const dy = b.sprite.y - this.scene.bossSystem.boss.sprite.y;
        const hitW = bossCfg.width * 0.5 + b.config.bulletSize * 0.5;
        const hitH = bossCfg.height * 0.5 + b.config.bulletSize * 0.5;
        if (dx * dx < hitW * hitW && dy * dy < hitH * hitH) {
          // Quantum does 50% more damage to bosses
          const quantumDmg = Math.floor(b.config.damage * 1.5);
          this.scene.bossSystem.boss.hp -= quantumDmg;
          this.scene.particles.spawn(0xffa000, 5, 3, 3);
          this.scene.score += 100;
          this.scene.hudNeedsUpdate = true;
          if (this.scene.bossSystem.boss.hp <= 0) {
            this.scene.onBossDefeated();
            if (b.sprite.active) b.sprite.destroy();
            this.playerBullets.splice(i, 1);
            continue;
          }
          if (!b.config.piercing) hit = true;
        }
      }

      // Timeslow weapon: slow enemies on hit
      if (b.config.type === 'timeslow') {
        for (let j = this.scene.enemySystem.enemies.length - 1; j >= 0; j--) {
          const e = this.scene.enemySystem.enemies[j];
          const cfg = ENEMY_CONFIGS[e.type];
          const dx = b.sprite.x - e.sprite.x;
          const dy = b.sprite.y - e.sprite.y;
          const hitW = (cfg.width * 0.5 + b.config.bulletSize * 0.5);
          const hitH = (cfg.height * 0.5 + b.config.bulletSize * 0.5);
          if (dx * dx < hitW * hitW && dy * dy < hitH * hitH) {
            e.frozen = true;
            // Slow for 3 seconds
            this.scene.time.delayedCall(3000, () => {
              if (e.sprite.active) e.frozen = false;
            });
            this.scene.particles.spawn(0xb088c8, 4, 2, 2);
            if (!b.config.piercing) {
              hit = true;
              break;
            }
          }
        }
      }

      // Collision vs enemies
      for (let j = this.scene.enemySystem.enemies.length - 1; j >= 0; j--) {
        const e = this.scene.enemySystem.enemies[j];
        const cfg = ENEMY_CONFIGS[e.type];
        const dx = b.sprite.x - e.sprite.x;
        const dy = b.sprite.y - e.sprite.y;
        const hitW = (cfg.width * 0.5 + b.config.bulletSize * 0.5);
        const hitH = (cfg.height * 0.5 + b.config.bulletSize * 0.5);
        if (dx * dx < hitW * hitW && dy * dy < hitH * hitH) {
          e.hp -= b.config.damage;
          this.scene.particles.spawn(cfg.color, 3, 2, 2);
          if (e.hp <= 0) {
            this.scene.score += cfg.scoreReward;
            this.scene.hudNeedsUpdate = true;
            e.sprite.destroy();
            this.scene.enemySystem.enemies.splice(j, 1);
            if (Math.random() < WEAPON_DROP_CHANCE) {
              this.scene.collectibleSystem.spawnWeaponPickup(e.sprite.x, e.sprite.y);
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
      if (!hit && this.scene.bossSystem.boss && !this.scene.bossSystem.boss.invulnerable) {
        const bossCfg = getBossConfig(this.scene.config.chapter);
        const dx = b.sprite.x - this.scene.bossSystem.boss.sprite.x;
        const dy = b.sprite.y - this.scene.bossSystem.boss.sprite.y;
        const hitW = bossCfg.width * 0.5 + b.config.bulletSize * 0.5;
        const hitH = bossCfg.height * 0.5 + b.config.bulletSize * 0.5;
        if (dx * dx < hitW * hitW && dy * dy < hitH * hitH) {
          this.scene.bossSystem.boss.hp -= b.config.damage;
          this.scene.particles.spawn(0xff0000, 3, 2, 2);
          this.scene.score += 50;
          this.scene.hudNeedsUpdate = true;
          if (this.scene.bossSystem.boss.hp <= 0) {
            this.scene.onBossDefeated();
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
    const explosion = this.scene.add.image(x, y, 'explosion');
    explosion.setDisplaySize(cfg.explosionRadius * 2, cfg.explosionRadius * 2);
    explosion.setDepth(30);
    this.scene.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: explosion.scaleX * 1.5,
      duration: 300,
      onComplete: () => explosion.destroy(),
    });
    this.scene.particles.spawn(0xff5722, 8, 5, 5);

    const rSq = cfg.explosionRadius * cfg.explosionRadius;
    for (let j = this.scene.enemySystem.enemies.length - 1; j >= 0; j--) {
      const e = this.scene.enemySystem.enemies[j];
      const dx = x - e.sprite.x;
      const dy = y - e.sprite.y;
      if (dx * dx + dy * dy < rSq) {
        e.hp -= cfg.damage;
        if (e.hp <= 0) {
          const ecfg = ENEMY_CONFIGS[e.type];
          this.scene.score += ecfg.scoreReward;
          this.scene.hudNeedsUpdate = true;
          e.sprite.destroy();
          this.scene.enemySystem.enemies.splice(j, 1);
        }
      }
    }

    if (this.scene.bossSystem.boss) {
      const dx = x - this.scene.bossSystem.boss.sprite.x;
      const dy = y - this.scene.bossSystem.boss.sprite.y;
      if (dx * dx + dy * dy < rSq) {
        this.scene.bossSystem.boss.hp -= cfg.damage;
        this.scene.hudNeedsUpdate = true;
        if (this.scene.bossSystem.boss.hp <= 0) this.scene.onBossDefeated();
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
    this.playerBullets.forEach(b => safeDestroy(b.sprite));
    this.playerBullets = [];
    this.currentWeapon = 'pistol';
    this.lastFireTime = 0;
  }
}
