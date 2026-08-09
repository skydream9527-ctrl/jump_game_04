import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import type { GameScene } from '../scenes/GameScene';

interface ParticleData {
  vx: number;
  vy: number;
  life: number;
}

export class ParticleSystem {
  private particles: { obj: Phaser.GameObjects.Arc; data: ParticleData }[] = [];
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  spawn(color: number, count: number, vxRange: number, vyRange: number): void {
    for (let i = 0; i < count; i++) {
      const obj = this.scene.add.circle(
        this.scene.playerX + (Math.random() - 0.5) * 10,
        this.scene.playerY + this.scene.playerHeight / 2,
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

  // Push a pre-created game object with custom particle data (for fire trails, explosions, etc.)
  push(obj: Phaser.GameObjects.Arc, data: { vx: number; vy: number; life: number }): void {
    this.particles.push({ obj, data });
  }

  update(normalized: number): void {
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

  clear(): void {
    for (const p of this.particles) {
      try {
        if (p.obj && p.obj.active !== false) p.obj.destroy();
      } catch {
        // Object may already be destroyed
      }
    }
    this.particles = [];
  }

  get count(): number {
    return this.particles.length;
  }
}
