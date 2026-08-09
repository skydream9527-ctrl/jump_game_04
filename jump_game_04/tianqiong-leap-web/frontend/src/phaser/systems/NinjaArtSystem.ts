import { PHYSICS } from '../../constants/physics';
import { ENERGY_MAX, NINJA_ART_CONFIGS, type NinjaArtType } from '../../constants/ninjaarts';
import type { GameScene } from '../scenes/GameScene';

export class NinjaArtSystem {
  // public for system access (refactor in progress)
  ninjaArtActive = false;
  // public for system access (refactor in progress)
  ninjaArtTimer = 0;
  // public for system access (refactor in progress)
  ninjaArtType: NinjaArtType | null = null;
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  // ========== Ninja Art ==========
  tryActivate(): void {
    if (this.ninjaArtActive || this.scene.energy < ENERGY_MAX) return;

    const artType = Object.values(NINJA_ART_CONFIGS).find(a => a.characterId === this.scene.characterId);
    if (!artType) return;

    this.scene.energy = 0;
    this.ninjaArtActive = true;
    this.ninjaArtTimer = artType.duration;
    this.ninjaArtType = artType.type;
    this.scene.hudNeedsUpdate = true;

    const flash = this.scene.add.graphics();
    flash.setDepth(50);
    flash.setScrollFactor(0);
    flash.fillStyle(artType.color, 0.3);
    flash.fillRect(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    if (artType.type === 'freeze' || artType.type === 'timestop') {
      for (const e of this.scene.enemySystem.enemies) e.frozen = true;
      for (const b of this.scene.enemySystem.bullets) {
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
      const effect = this.scene.add.image(PHYSICS.CANVAS_WIDTH / 2, PHYSICS.CANVAS_HEIGHT / 2, 'ninja-freeze');
      effect.setDepth(45);
      effect.setScrollFactor(0);
      effect.setAlpha(0.6);
      effect.setScale(2);
      this.scene.tweens.add({
        targets: effect,
        alpha: 0,
        scale: 3,
        duration: artType.duration,
        onComplete: () => effect.destroy(),
      });
    }
  }

  update(delta: number): void {
    if (!this.ninjaArtActive) return;

    this.ninjaArtTimer -= delta;
    if (this.ninjaArtTimer <= 0) {
      this.ninjaArtActive = false;
      this.ninjaArtType = null;
      this.scene.hudNeedsUpdate = true;
      for (const e of this.scene.enemySystem.enemies) e.frozen = false;
      return;
    }

    if (this.ninjaArtType === 'freeze' || this.ninjaArtType === 'timestop') {
      // Only freeze newly spawned enemies/bullets
      for (const e of this.scene.enemySystem.enemies) e.frozen = true;
      for (const b of this.scene.enemySystem.bullets) {
        if (this.ninjaArtType === 'freeze') {
          b.vx *= 0.95;
          b.vy *= 0.95;
        } else {
          b.vx = 0;
          b.vy = 0;
        }
      }
    } else if (this.ninjaArtType === 'dash') {
      this.scene.playerX += 8;
      this.scene.distance += 8;
      const trail = this.scene.add.image(this.scene.playerX - 20, this.scene.playerY, `player-${this.scene.characterId}`);
      trail.setScale(PHYSICS.WORLD_SCALE);
      trail.setAlpha(0.5);
      trail.setDepth(19);
      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        duration: 300,
        onComplete: () => trail.destroy(),
      });
    } else if (this.ninjaArtType === 'tornado') {
      for (let i = this.scene.enemySystem.enemies.length - 1; i >= 0; i--) {
        const e = this.scene.enemySystem.enemies[i];
        const dx = this.scene.playerX - e.sprite.x;
        const dy = this.scene.playerY - e.sprite.y;
        if (dx * dx + dy * dy < 300 * 300) {
          e.hp = 0;
          this.scene.particles.spawn(0x00e676, 4, 3, 3);
        }
      }
      for (let i = this.scene.enemySystem.bullets.length - 1; i >= 0; i--) {
        const b = this.scene.enemySystem.bullets[i];
        const dx = this.scene.playerX - b.sprite.x;
        const dy = this.scene.playerY - b.sprite.y;
        if (dx * dx + dy * dy < 250 * 250) {
          b.sprite.destroy();
          this.scene.enemySystem.bullets.splice(i, 1);
        }
      }
    }
  }

  clear(): void {
    this.ninjaArtActive = false;
    this.ninjaArtTimer = 0;
    this.ninjaArtType = null;
  }
}
