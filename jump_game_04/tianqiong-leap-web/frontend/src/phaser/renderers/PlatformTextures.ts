import Phaser from 'phaser';
import { CHAPTER_DATA } from '../../constants/levels';
import { PHYSICS } from '../../constants/physics';

export function generatePlatformTextures(scene: Phaser.Scene): void {
  generatePlatformBaseTextures(scene);
  generatePlatformTypeOverlays(scene);
}

// ==================== Platform (Mario-style brick) ====================
function generatePlatformBaseTextures(scene: Phaser.Scene): void {
  for (const ch of CHAPTER_DATA) {
    const w = 200;
    const h = PHYSICS.PLATFORM_HEIGHT;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);

    const bodyColor = Phaser.Display.Color.HexStringToColor(ch.platformBodyColor).color;
    const topColor = Phaser.Display.Color.HexStringToColor(ch.platformTopColor).color;

    // Main body
    g.fillStyle(bodyColor, 1);
    g.fillRect(0, 0, w, h);

    // Brick pattern - horizontal lines
    g.lineStyle(1, 0x000000, 0.2);
    g.lineBetween(0, h * 0.5, w, h * 0.5);

    // Brick pattern - vertical lines (staggered)
    const brickW = 25;
    for (let row = 0; row < 2; row++) {
      const y = row * (h / 2);
      const offset = row % 2 === 0 ? 0 : brickW / 2;
      for (let x = offset; x < w; x += brickW) {
        g.lineBetween(x, y, x, y + h / 2);
      }
    }

    // Top grass/surface layer
    g.fillStyle(topColor, 1);
    g.fillRect(0, 0, w, 6);

    // Grass tufts on top
    g.fillStyle(topColor, 0.8);
    for (let x = 5; x < w - 5; x += 12 + Math.random() * 8) {
      const tuftH = 3 + Math.random() * 4;
      g.fillTriangle(x, 0, x + 4, -tuftH, x + 8, 0);
    }

    // Top highlight
    g.lineStyle(1, 0xffffff, 0.15);
    g.lineBetween(1, 1, w - 1, 1);

    // Bottom shadow
    g.lineStyle(1, 0x000000, 0.3);
    g.lineBetween(0, h - 1, w, h - 1);

    g.generateTexture(`platform-${ch.chapter}`, w, h + 8);
    g.destroy();
  }
}

// ==================== Platform Type Overlays ====================
function generatePlatformTypeOverlays(scene: Phaser.Scene): void {
  const w = 200;
  const h = 28;

  // Ice overlay (blue tint + sparkle)
  const gi = scene.make.graphics({ x: 0, y: 0 }, false);
  gi.fillStyle(0x80d8ff, 0.3);
  gi.fillRect(0, 0, w, h);
  gi.fillStyle(0xffffff, 0.5);
  for (let i = 0; i < 8; i++) {
    const sx = Math.random() * w;
    const sy = Math.random() * h;
    gi.fillCircle(sx, sy, 1.5);
  }
  gi.generateTexture('overlay-ice', w, h);
  gi.destroy();

  // Melting overlay (drip effect)
  const gm = scene.make.graphics({ x: 0, y: 0 }, false);
  gm.fillStyle(0xff6e40, 0.4);
  for (let x = 10; x < w - 10; x += 20 + Math.random() * 15) {
    const dripH = 4 + Math.random() * 8;
    gm.fillRoundedRect(x, h, 4, dripH, 2);
  }
  gm.generateTexture('overlay-melting', w, h + 12);
  gm.destroy();

  // Invisible shimmer
  const ginv = scene.make.graphics({ x: 0, y: 0 }, false);
  ginv.lineStyle(1, 0xffffff, 0.15);
  for (let x = 0; x < w; x += 8) {
    ginv.lineBetween(x, 0, x + 4, h);
  }
  ginv.generateTexture('overlay-invisible', w, h);
  ginv.destroy();

  // Liquid metal overlay (mercury-like shimmer)
  const glm = scene.make.graphics({ x: 0, y: 0 }, false);
  glm.fillStyle(0xc0c8d4, 0.4);
  glm.fillRect(0, 0, w, h);
  glm.fillStyle(0xe0e8f0, 0.3);
  for (let i = 0; i < 6; i++) {
    const sx = Math.random() * w;
    const sy = Math.random() * h;
    glm.fillCircle(sx, sy, 2 + Math.random() * 2);
  }
  glm.lineStyle(1, 0xffffff, 0.2);
  glm.lineBetween(0, h / 2, w, h / 2);
  glm.generateTexture('overlay-liquid_metal', w, h);
  glm.destroy();
}

