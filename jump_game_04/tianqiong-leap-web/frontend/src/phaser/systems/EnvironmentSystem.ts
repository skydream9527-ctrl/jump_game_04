import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import type { GameScene } from '../scenes/GameScene';

interface ParticleData {
  vx: number;
  vy: number;
  life: number;
}

interface VineSegment {
  sprite: Phaser.GameObjects.Arc;
  age: number;
  maxHeight: number;
  platformX: number;
}

export class EnvironmentSystem {
  private envOverlay: Phaser.GameObjects.Graphics | null = null;
  private envParticles: { obj: Phaser.GameObjects.Arc; data: ParticleData }[] = [];
  private lightningTimer = 0;
  private vineSegments: VineSegment[] = [];
  // public for system access (refactor in progress)
  liquidMetalTimer = 0;
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  init(chapter: number): void {
    this.liquidMetalTimer = 0;
    if (this.envOverlay) {
      this.envOverlay.destroy();
      this.envOverlay = null;
    }

    switch (chapter) {
      case 3: // Sandstorm
        this.envOverlay = this.scene.add.graphics();
        this.envOverlay.setDepth(40);
        this.envOverlay.setScrollFactor(0);
        break;
      case 4: // Liquid metal shimmer
        this.envOverlay = this.scene.add.graphics();
        this.envOverlay.setDepth(40);
        this.envOverlay.setScrollFactor(0);
        break;
      case 5: // Snowfall + aurora
        this.envOverlay = this.scene.add.graphics();
        this.envOverlay.setDepth(40);
        this.envOverlay.setScrollFactor(0);
        break;
      case 6: // Embers + heat haze
        this.envOverlay = this.scene.add.graphics();
        this.envOverlay.setDepth(40);
        this.envOverlay.setScrollFactor(0);
        break;
      case 7: // Lightning
        this.lightningTimer = 3000 + Math.random() * 5000;
        break;
      case 8: // Vine growth
        this.vineSegments = [];
        break;
      case 9: // Crystal sparkles
        this.envOverlay = this.scene.add.graphics();
        this.envOverlay.setDepth(40);
        this.envOverlay.setScrollFactor(0);
        break;
      case 10: // Darkness
        this.envOverlay = this.scene.add.graphics();
        this.envOverlay.setDepth(40);
        this.envOverlay.setScrollFactor(0);
        break;
    }
  }

  update(delta: number, normalized: number): void {
    this.liquidMetalTimer += delta;
    this.updateSandstorm(normalized);
    this.updateCh4Shimmer(delta);
    this.updateCh5Snow(normalized);
    this.updateCh6Embers(normalized);
    this.updateLightning(delta);
    this.updateVines(delta, normalized);
    this.updateCh9Sparkles(normalized);
    this.updateDarkness();
  }

  private updateSandstorm(normalized: number): void {
    if (!this.envOverlay || this.scene.config.chapter !== 3) return;

    this.envOverlay.clear();

    // Semi-transparent sandy overlay that pulses
    const pulse = 0.15 + Math.sin(this.scene.time.now * 0.001) * 0.05;
    this.envOverlay.fillStyle(0xbf5b3b, pulse);
    this.envOverlay.fillRect(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);

    // Horizontal sand streaks
    for (let i = 0; i < 6; i++) {
      const y = (this.scene.time.now * 0.05 + i * 70) % PHYSICS.CANVAS_HEIGHT;
      const alpha = 0.08 + Math.sin(this.scene.time.now * 0.002 + i) * 0.04;
      this.envOverlay.fillStyle(0xd4a574, alpha);
      this.envOverlay.fillRect(0, y, PHYSICS.CANVAS_WIDTH, 3);
    }

    // Sand particle effect
    if (Math.random() < 0.3 * normalized && this.envParticles.length < 50) {
      const obj = this.scene.add.circle(
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
    if (this.scene.config.chapter !== 7) return;

    this.lightningTimer -= delta;
    if (this.lightningTimer <= 0) {
      this.lightningTimer = 3000 + Math.random() * 5000;

      // Lightning flash
      const flash = this.scene.add.graphics();
      flash.setDepth(45);
      flash.setScrollFactor(0);
      flash.fillStyle(0xffffff, 0.6);
      flash.fillRect(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 150,
        onComplete: () => flash.destroy(),
      });

      // Lightning bolt visual
      const boltX = this.scene.cameraTargetX + Math.random() * PHYSICS.CANVAS_WIDTH;
      const bolt = this.scene.add.graphics();
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
      this.scene.tweens.add({
        targets: bolt,
        alpha: 0,
        duration: 200,
        onComplete: () => bolt.destroy(),
      });

      // Damage check
      const boltScreenX = boltX - this.scene.cameraTargetX;
      const playerScreenX = this.scene.playerX - this.scene.cameraTargetX;
      if (Math.abs(boltScreenX - playerScreenX) < 40) {
        if (!this.scene.hasShield && !this.scene.activePowerUps.has('shield')) {
          this.scene.onPlayerFall();
        }
      }

      this.scene.audio.lightningStrike();
    }
  }

  private updateVines(delta: number, normalized: number): void {
    if (this.scene.config.chapter !== 8) return;

    // Spawn new vines periodically
    if (Math.random() < 0.005 * normalized && this.vineSegments.length < 20) {
      const camLeft = this.scene.cameraTargetX;
      const camRight = camLeft + PHYSICS.CANVAS_WIDTH;
      const candidates = this.scene.levelSystem.platforms.filter(p =>
        p.x > camLeft && p.x < camRight && p.platformType === 'normal'
      );
      if (candidates.length > 0) {
        const plat = candidates[Math.floor(Math.random() * candidates.length)];
        const platTop = plat.y - plat.height / 2;
        const vine = this.scene.add.circle(plat.x, platTop, 3, 0x2d8a2d, 0.8);
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
        const dx = Math.abs(this.scene.playerX - v.platformX);
        const currentHeight = v.maxHeight * growProgress;
        if (dx < 15 && this.scene.playerY > v.sprite.y - currentHeight && this.scene.playerY < v.sprite.y + 10) {
          this.scene.playerX -= this.scene.speed * 0.5 * normalized;
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
    if (!this.envOverlay || this.scene.config.chapter !== 10) return;

    this.envOverlay.clear();

    const playerScreenX = this.scene.playerX - this.scene.cameraTargetX;
    const playerScreenY = this.scene.playerY - PHYSICS.CAMERA_SCROLL_Y;
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

  private updateCh4Shimmer(delta: number): void {
    if (!this.envOverlay || this.scene.config.chapter !== 4) return;
    this.liquidMetalTimer += delta;

    this.envOverlay.clear();

    // Pulsing metallic shimmer overlay
    const pulse = 0.02 + Math.sin(this.liquidMetalTimer * 0.001) * 0.015;
    this.envOverlay.fillStyle(0xb8c0d0, pulse);
    this.envOverlay.fillRect(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);

    // Random sparkle points
    if (Math.random() < 0.05) {
      const sx = Math.random() * PHYSICS.CANVAS_WIDTH;
      const sy = Math.random() * PHYSICS.CANVAS_HEIGHT * 0.6 + PHYSICS.CANVAS_HEIGHT * 0.2;
      this.envOverlay.fillStyle(0xd0d8e8, 0.3);
      this.envOverlay.fillCircle(sx, sy, 2);
    }
  }

  private updateCh5Snow(normalized: number): void {
    if (!this.envOverlay || this.scene.config.chapter !== 5) return;

    this.envOverlay.clear();

    // Aurora glow
    const auroraAlpha = 0.015 + Math.sin(this.scene.time.now * 0.0005) * 0.01;
    this.envOverlay.fillStyle(0x64ffda, auroraAlpha);
    this.envOverlay.fillRect(0, 10, PHYSICS.CANVAS_WIDTH, 40);

    // Snowfall particles
    if (Math.random() < 0.25 * normalized && this.envParticles.length < 40) {
      const obj = this.scene.add.circle(
        Math.random() * PHYSICS.CANVAS_WIDTH,
        -5,
        1.5 + Math.random() * 1.5,
        0xffffff,
        0.5
      );
      obj.setDepth(39);
      obj.setScrollFactor(0);
      this.envParticles.push({
        obj,
        data: { vx: -0.3 + Math.random() * 0.6, vy: 0.8 + Math.random() * 0.5, life: 300 },
      });
    }

    for (let i = this.envParticles.length - 1; i >= 0; i--) {
      const p = this.envParticles[i];
      p.obj.x += p.data.vx * normalized;
      p.obj.y += p.data.vy * normalized;
      p.data.life -= normalized;
      if (p.data.life <= 0 || p.obj.y > PHYSICS.CANVAS_HEIGHT) {
        p.obj.destroy();
        this.envParticles.splice(i, 1);
      }
    }
  }

  private updateCh6Embers(normalized: number): void {
    if (!this.envOverlay || this.scene.config.chapter !== 6) return;

    this.envOverlay.clear();

    // Heat haze pulse
    const hazeAlpha = 0.02 + Math.sin(this.scene.time.now * 0.0008) * 0.015;
    this.envOverlay.fillStyle(0xff6020, hazeAlpha);
    this.envOverlay.fillRect(0, PHYSICS.CANVAS_HEIGHT * 0.6, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT * 0.4);

    // Ember particles rising
    if (Math.random() < 0.15 * normalized && this.envParticles.length < 30) {
      const obj = this.scene.add.circle(
        Math.random() * PHYSICS.CANVAS_WIDTH,
        PHYSICS.CANVAS_HEIGHT + 5,
        1 + Math.random() * 2,
        0xff6020,
        0.6
      );
      obj.setDepth(39);
      obj.setScrollFactor(0);
      this.envParticles.push({
        obj,
        data: { vx: -0.5 + Math.random(), vy: -1.5 - Math.random(), life: 250 },
      });
    }

    for (let i = this.envParticles.length - 1; i >= 0; i--) {
      const p = this.envParticles[i];
      p.obj.x += p.data.vx * normalized;
      p.obj.y += p.data.vy * normalized;
      p.data.life -= normalized;
      p.obj.setAlpha(p.data.life / 250);
      if (p.data.life <= 0 || p.obj.y < -10) {
        p.obj.destroy();
        this.envParticles.splice(i, 1);
      }
    }
  }

  private updateCh9Sparkles(normalized: number): void {
    if (!this.envOverlay || this.scene.config.chapter !== 9) return;

    this.envOverlay.clear();

    // Random crystal sparkle flashes
    if (Math.random() < 0.08 * normalized) {
      const sx = Math.random() * PHYSICS.CANVAS_WIDTH;
      const sy = Math.random() * PHYSICS.CANVAS_HEIGHT * 0.7;
      this.envOverlay.fillStyle(0xb388ff, 0.4);
      this.envOverlay.fillCircle(sx, sy, 2);
      this.envOverlay.fillStyle(0xe0c0ff, 0.15);
      this.envOverlay.fillCircle(sx, sy, 6);
    }

    // Slow-moving prism beam
    const beamY = PHYSICS.CANVAS_HEIGHT * 0.25 + Math.sin(this.scene.time.now * 0.0003) * 20;
    this.envOverlay.fillStyle(0xb388ff, 0.02);
    this.envOverlay.fillRect(0, beamY, PHYSICS.CANVAS_WIDTH, 2);
  }

  clear(): void {
    if (this.envOverlay) {
      this.envOverlay.destroy();
      this.envOverlay = null;
    }
    for (const p of this.envParticles) {
      try { p.obj.destroy(); } catch {
        // Ignore already destroyed particles
      }
    }
    this.envParticles = [];
    for (const v of this.vineSegments) {
      try { v.sprite.destroy(); } catch {
        // Ignore already destroyed vine segments
      }
    }
    this.vineSegments = [];
    this.lightningTimer = 0;
    this.liquidMetalTimer = 0;
  }
}
