import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { ENEMY_CONFIGS, SHOOTER_FIRE_INTERVAL, BULLET_SPEED, BULLET_SIZE, type EnemyType } from '../../constants/enemies';
import { getRandomMiniBoss } from '../../constants/boss';
import type { GameScene } from '../scenes/GameScene';

interface Enemy {
  sprite: Phaser.GameObjects.Image;
  type: EnemyType;
  hp: number;
  vx: number;
  vy: number;
  baseY: number;
  fireTimer: number;
  frozen: boolean;
}

interface EnemyBullet {
  sprite: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
}

export class EnemySystem {
  // public for system access (refactor in progress)
  enemies: Enemy[] = [];
  // public for system access (refactor in progress)
  bullets: EnemyBullet[] = [];
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  // public for system access (refactor in progress)
  pickType(): EnemyType {
    const ratio = this.scene.config.enemyTypes;
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

  spawn(x: number, y: number, type: EnemyType): void {
    const cfg = ENEMY_CONFIGS[type];
    const sprite = this.scene.add.image(x, y, `enemy-${type}`);
    sprite.setDisplaySize(cfg.width, cfg.height);
    sprite.setDepth(10);

    let vx = 0;
    let vy = 0;
    let hp = cfg.hp;

    // Use chapter-specific mini-boss config
    if (type === 'mini_boss') {
      const miniBossCfg = getRandomMiniBoss(this.scene.config.chapter);
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

  update(delta: number, normalized: number): void {
    const cullLeft = this.scene.cameraTargetX + PHYSICS.PLATFORM_CULL_X;

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
        e.sprite.y = e.baseY + Math.sin(this.scene.time.now * 0.003 + i) * 30;
        e.sprite.x -= cfg.speed * normalized;
      } else if (e.type === 'ground') {
        e.sprite.x -= (this.scene.speed + cfg.speed) * normalized;
      } else if (e.type === 'shooter') {
        e.sprite.x -= this.scene.speed * normalized;
        e.fireTimer -= delta;
        if (e.fireTimer <= 0) {
          e.fireTimer = SHOOTER_FIRE_INTERVAL;
          this.spawnBullet(e.sprite.x - 10, e.sprite.y);
        }
      } else if (e.type === 'charger') {
        // Charger: move slowly until player is near, then charge
        const distToPlayer = this.scene.playerX - e.sprite.x;
        if (distToPlayer > 0 && distToPlayer < 300) {
          // Charge towards player
          e.sprite.x -= (this.scene.speed + cfg.speed * 2) * normalized;
          this.scene.particles.spawn(0xff6020, 2, 1, 1); // Orange trail
        } else {
          e.sprite.x -= this.scene.speed * normalized;
        }
      } else if (e.type === 'bomber') {
        // Bomber: slow movement, drops bombs periodically
        e.sprite.x -= (this.scene.speed + cfg.speed) * normalized;
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

      if (this.scene.playerSystem.playerVY > 0) {
        const playerBottom = this.scene.playerY + this.scene.playerHeight / 2;
        const playerLeft = this.scene.playerX - this.scene.playerWidth / 2;
        const playerRight = this.scene.playerX + this.scene.playerWidth / 2;

        if (playerBottom >= ey - eh && playerBottom <= ey + eh * 0.3 &&
            playerRight > ex - ew && playerLeft < ex + ew) {
          // Combo damage from charm_rage
          let stompDmg = 1;
          for (const item of this.scene.equippedItems) {
            if (item.effect.type === 'passive' && item.effect.stat === 'stomp_damage') stompDmg += item.effect.value ?? 0;
            if (item.effect.type === 'passive' && item.effect.stat === 'combo_damage') stompDmg += this.scene.comboCount * (item.effect.value ?? 0);
            if (item.effect.type === 'passive' && item.effect.stat === 'low_hp_power' && this.scene.lives <= 1) stompDmg *= (item.effect.value ?? 1);
          }
          e.hp -= stompDmg;
          this.scene.comboCount++;
          this.scene.playerSystem.playerVY = PHYSICS.JUMP_FORCE * 0.6; // bounce
          this.scene.particles.spawn(cfg.color, 5, 3, 3);
          this.scene.score += cfg.scoreReward;
          this.scene.hudNeedsUpdate = true;
          if (e.hp <= 0) {
            this.scene.onEnemyKilled();
            e.sprite.destroy();
            this.enemies.splice(i, 1);
            continue;
          }
        }
      }

      // Stealth: enemies don't deal contact damage
      if (this.scene.stealthTimer > 0) continue;

      if (!this.scene.ninjaArtSystem.ninjaArtActive || this.scene.ninjaArtSystem.ninjaArtType !== 'dash') {
        const dx = this.scene.playerX - ex;
        const dy = this.scene.playerY - ey;
        const collisionDist = (ew + this.scene.playerWidth * 0.4);
        if (dx * dx < collisionDist * collisionDist && dy * dy < (eh + this.scene.playerHeight * 0.4) ** 2) {
          this.scene.onPlayerFall();
        }
      }
    }
  }

  spawnBullet(x: number, y: number): void {
    const sprite = this.scene.add.image(x, y, 'bullet');
    sprite.setDisplaySize(BULLET_SIZE, BULLET_SIZE);
    sprite.setDepth(10);
    const dx = this.scene.playerX - x;
    const dy = this.scene.playerY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.bullets.push({
      sprite,
      vx: (dx / dist) * BULLET_SPEED,
      vy: (dy / dist) * BULLET_SPEED,
    });
  }

  spawnBomb(x: number, y: number): void {
    const sprite = this.scene.add.image(x, y, 'bullet');
    sprite.setDisplaySize(BULLET_SIZE * 1.5, BULLET_SIZE * 1.5);
    sprite.setDepth(10);
    sprite.setTint(0xff4040); // Red tint for bombs
    this.bullets.push({
      sprite,
      vx: 0,
      vy: 2, // Fall downward
    });
  }

  updateBullets(normalized: number): void {
    const cullLeft = this.scene.cameraTargetX + PHYSICS.PLATFORM_CULL_X;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.sprite.x += b.vx * normalized;
      b.sprite.y += b.vy * normalized;

      if (b.sprite.x < cullLeft - 50 || b.sprite.y < -50 || b.sprite.y > PHYSICS.CANVAS_HEIGHT + 50) {
        b.sprite.destroy();
        this.bullets.splice(i, 1);
        continue;
      }

      const dx = this.scene.playerX - b.sprite.x;
      const dy = this.scene.playerY - b.sprite.y;
      if (dx * dx + dy * dy < (this.scene.playerWidth * 0.5 + BULLET_SIZE) ** 2) {
        b.sprite.destroy();
        this.bullets.splice(i, 1);
        this.scene.onPlayerFall();
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
    this.enemies.forEach(e => safeDestroy(e.sprite));
    this.bullets.forEach(b => safeDestroy(b.sprite));
    this.enemies = [];
    this.bullets = [];
  }
}
