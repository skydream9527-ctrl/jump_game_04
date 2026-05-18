import Phaser from 'phaser';
import { CHAPTER_DATA } from '../../constants/levels';
import { PHYSICS } from '../../constants/physics';

export function generateAllTextures(scene: Phaser.Scene): void {
  generateParticleTexture(scene);
  generateCoinTexture(scene);
  generateHeartTextures(scene);
  generatePlatformTextures(scene);
  generateMarioCharacterTextures(scene);
  generateBackgroundTextures(scene);
  generatePowerUpTextures(scene);
  generateEnemyTextures(scene);
  generateBossTextures(scene);
  generateNinjaArtTextures(scene);
  generatePlatformTypeOverlays(scene);
  generateWeaponTextures(scene);
}

// ==================== Particle ====================
function generateParticleTexture(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture('particle-dust', 8, 8);
  g.destroy();
}

// ==================== Coin (replaces star shard) ====================
function generateCoinTexture(scene: Phaser.Scene): void {
  const s = 28;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  // Outer glow
  g.fillStyle(0xffd700, 0.25);
  g.fillCircle(s / 2, s / 2, s / 2);

  // Coin body
  g.fillStyle(0xffd700, 1);
  g.fillCircle(s / 2, s / 2, s / 2 - 3);

  // Inner ring
  g.lineStyle(2, 0xffa500, 0.8);
  g.strokeCircle(s / 2, s / 2, s / 2 - 6);

  // Highlight
  g.fillStyle(0xffec80, 0.7);
  g.fillCircle(s / 2 - 3, s / 2 - 3, 4);

  // Dollar sign or star
  g.fillStyle(0xb8860b, 0.8);
  const cx = s / 2;
  const cy = s / 2;
  const r = 5;
  const ir = 2;
  const path: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 5; i++) {
    path.push(new Phaser.Math.Vector2(
      cx + r * Math.cos(Phaser.Math.DegToRad(i * 72 - 90)),
      cy + r * Math.sin(Phaser.Math.DegToRad(i * 72 - 90))
    ));
    path.push(new Phaser.Math.Vector2(
      cx + ir * Math.cos(Phaser.Math.DegToRad(i * 72 + 36 - 90)),
      cy + ir * Math.sin(Phaser.Math.DegToRad(i * 72 + 36 - 90))
    ));
  }
  g.fillPoints(path, true);

  g.generateTexture('shard', s, s);
  g.destroy();
}

// ==================== Hearts ====================
function generateHeartTextures(scene: Phaser.Scene): void {
  const s = 20;
  const drawHeart = (g: Phaser.GameObjects.Graphics, fill: number, alpha: number) => {
    g.fillStyle(fill, alpha);
    g.fillCircle(s * 0.3, s * 0.35, s * 0.25);
    g.fillCircle(s * 0.7, s * 0.35, s * 0.25);
    g.fillTriangle(s * 0.05, s * 0.45, s * 0.95, s * 0.45, s * 0.5, s * 0.9);
  };

  const g1 = scene.make.graphics({ x: 0, y: 0 }, false);
  drawHeart(g1, 0xe05555, 1);
  g1.generateTexture('heart-full', s, s);
  g1.destroy();

  const g2 = scene.make.graphics({ x: 0, y: 0 }, false);
  drawHeart(g2, 0xe05555, 0.3);
  g2.generateTexture('heart-empty', s, s);
  g2.destroy();
}

// ==================== Platform (Mario-style brick) ====================
function generatePlatformTextures(scene: Phaser.Scene): void {
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

// ==================== Mario-style Character ====================
function generateMarioCharacterTextures(scene: Phaser.Scene): void {
  // Generate 3 frames: idle, run1, run2, jump
  const frames = ['idle', 'run1', 'run2', 'run3', 'run4', 'jump'];
  const w = 32;
  const h = 40;

  for (const frame of frames) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    drawMarioFrame(g, frame, w, h);
    g.generateTexture(`player-frame-${frame}`, w + 4, h + 4);
    g.destroy();
  }

  // Also generate character variants with different colors
  const variants = [
    { id: 0, hat: 0xe03030, shirt: 0xe03030, overalls: 0x2850a0, skin: 0xf0b080, shoes: 0x6b3300, name: 'ling' },
    { id: 1, hat: 0x00aaff, shirt: 0x00aaff, overalls: 0x404040, skin: 0xd0d0d0, shoes: 0x333333, name: 'zero' },
    { id: 2, hat: 0xb060e0, shirt: 0xb060e0, overalls: 0x4a2080, skin: 0xc8a0d8, shoes: 0x3a1858, name: 'echo' },
    { id: 3, hat: 0xff6030, shirt: 0xff6030, overalls: 0x8a6820, skin: 0xd0b888, shoes: 0x3a2a10, name: 'gale' },
  ];

  for (const v of variants) {
    for (const frame of frames) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      drawMarioFrame(g, frame, w, h, v);
      g.generateTexture(`player-${v.id}-${frame}`, w + 4, h + 4);
      g.destroy();
    }
    // Default texture (idle)
    const gDefault = scene.make.graphics({ x: 0, y: 0 }, false);
    drawMarioFrame(gDefault, 'idle', w, h, v);
    gDefault.generateTexture(`player-${v.id}`, w + 4, h + 4);
    gDefault.destroy();
  }
}

interface CharColors {
  hat: number;
  shirt: number;
  overalls: number;
  skin: number;
  shoes: number;
}

const DEFAULT_COLORS: CharColors = {
  hat: 0xe03030,
  shirt: 0xe03030,
  overalls: 0x2850a0,
  skin: 0xf0b080,
  shoes: 0x6b3300,
};

function drawMarioFrame(
  g: Phaser.GameObjects.Graphics,
  frame: string,
  w: number,
  h: number,
  colors: CharColors = DEFAULT_COLORS
): void {
  const cx = w / 2 + 2;
  const cy = h / 2 + 2;

  // All proportions relative to a 32x40 character
  const headR = 9;        // head radius
  const bodyW = 16;
  const bodyH = 12;
  const legW = 6;
  const legH = 10;
  const armW = 5;
  const armH = 10;

  const headY = cy - 12;
  const bodyY = headY + headR + 2;
  const legY = bodyY + bodyH;
  const armY = bodyY + 2;

  if (frame === 'idle') {
    // === IDLE POSE ===
    // Shoes
    g.fillStyle(colors.shoes, 1);
    g.fillRoundedRect(cx - 9, legY + legH - 3, legW + 2, 5, 2);
    g.fillRoundedRect(cx + 3, legY + legH - 3, legW + 2, 5, 2);

    // Legs (overalls color)
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - 8, legY, legW, legH, 2);
    g.fillRoundedRect(cx + 3, legY, legW, legH, 2);

    // Body / overalls
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY, bodyW, bodyH, 4);

    // Shirt (top part)
    g.fillStyle(colors.shirt, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY, bodyW, 6, 3);

    // Overall buttons
    g.fillStyle(0xffd700, 1);
    g.fillCircle(cx - 4, bodyY + 8, 1.5);
    g.fillCircle(cx + 4, bodyY + 8, 1.5);

    // Arms
    g.fillStyle(colors.skin, 1);
    g.fillRoundedRect(cx - bodyW / 2 - armW + 1, armY, armW, armH, 2);
    g.fillRoundedRect(cx + bodyW / 2 - 1, armY, armW, armH, 2);

    // Head
    g.fillStyle(colors.skin, 1);
    g.fillCircle(cx, headY, headR);

    // Cap
    g.fillStyle(colors.hat, 1);
    g.fillRoundedRect(cx - headR - 2, headY - headR, headR * 2 + 4, headR, 4);
    // Cap brim
    g.fillRoundedRect(cx - headR - 4, headY - 2, headR * 2 + 8, 5, 2);

    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(cx - 3, headY + 1, 5, 6);
    g.fillEllipse(cx + 4, headY + 1, 5, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(cx - 2, headY + 2, 2);
    g.fillCircle(cx + 5, headY + 2, 2);
    // Eye highlights
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 1, headY + 1, 1);
    g.fillCircle(cx + 6, headY + 1, 1);

    // Mustache
    g.fillStyle(0x4a2800, 1);
    g.fillRoundedRect(cx - 6, headY + 5, 13, 3, 1);

  } else if (frame === 'run1') {
    // === RUN FRAME 1 (left leg forward) ===
    // Back leg (extended back)
    g.fillStyle(colors.shoes, 1);
    g.fillRoundedRect(cx - 10, legY + legH - 2, legW + 2, 5, 2);
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - 9, legY + 2, legW, legH - 2, 2);

    // Front leg (forward)
    g.fillStyle(colors.shoes, 1);
    g.fillRoundedRect(cx + 4, legY + legH - 5, legW + 2, 5, 2);
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx + 3, legY, legW, legH + 2, 2);

    // Body (slight lean)
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY, bodyW, bodyH, 4);
    g.fillStyle(colors.shirt, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY, bodyW, 6, 3);

    // Buttons
    g.fillStyle(0xffd700, 1);
    g.fillCircle(cx - 4, bodyY + 8, 1.5);
    g.fillCircle(cx + 4, bodyY + 8, 1.5);

    // Arms (running pose - one back, one forward)
    g.fillStyle(colors.skin, 1);
    g.fillRoundedRect(cx - bodyW / 2 - armW + 1, armY - 2, armW, armH, 2);
    g.fillRoundedRect(cx + bodyW / 2, armY + 2, armW, armH, 2);

    // Head
    g.fillStyle(colors.skin, 1);
    g.fillCircle(cx, headY, headR);

    // Cap
    g.fillStyle(colors.hat, 1);
    g.fillRoundedRect(cx - headR - 2, headY - headR, headR * 2 + 4, headR, 4);
    g.fillRoundedRect(cx - headR - 4, headY - 2, headR * 2 + 8, 5, 2);

    // Eyes (looking forward)
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(cx - 2, headY + 1, 5, 6);
    g.fillEllipse(cx + 5, headY + 1, 5, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(cx - 1, headY + 2, 2);
    g.fillCircle(cx + 6, headY + 2, 2);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx, headY + 1, 1);
    g.fillCircle(cx + 7, headY + 1, 1);

    // Mustache
    g.fillStyle(0x4a2800, 1);
    g.fillRoundedRect(cx - 6, headY + 5, 13, 3, 1);

  } else if (frame === 'run2') {
    // === RUN FRAME 2 (right leg forward, mirrored) ===
    // Front leg
    g.fillStyle(colors.shoes, 1);
    g.fillRoundedRect(cx - 10, legY + legH - 5, legW + 2, 5, 2);
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - 9, legY, legW, legH + 2, 2);

    // Back leg
    g.fillStyle(colors.shoes, 1);
    g.fillRoundedRect(cx + 4, legY + legH - 2, legW + 2, 5, 2);
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx + 3, legY + 2, legW, legH - 2, 2);

    // Body
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY, bodyW, bodyH, 4);
    g.fillStyle(colors.shirt, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY, bodyW, 6, 3);

    g.fillStyle(0xffd700, 1);
    g.fillCircle(cx - 4, bodyY + 8, 1.5);
    g.fillCircle(cx + 4, bodyY + 8, 1.5);

    // Arms (opposite)
    g.fillStyle(colors.skin, 1);
    g.fillRoundedRect(cx - bodyW / 2, armY + 2, armW, armH, 2);
    g.fillRoundedRect(cx + bodyW / 2 - armW + 1, armY - 2, armW, armH, 2);

    // Head
    g.fillStyle(colors.skin, 1);
    g.fillCircle(cx, headY, headR);

    // Cap
    g.fillStyle(colors.hat, 1);
    g.fillRoundedRect(cx - headR - 2, headY - headR, headR * 2 + 4, headR, 4);
    g.fillRoundedRect(cx - headR - 4, headY - 2, headR * 2 + 8, 5, 2);

    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(cx - 2, headY + 1, 5, 6);
    g.fillEllipse(cx + 5, headY + 1, 5, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(cx - 1, headY + 2, 2);
    g.fillCircle(cx + 6, headY + 2, 2);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx, headY + 1, 1);
    g.fillCircle(cx + 7, headY + 1, 1);

    // Mustache
    g.fillStyle(0x4a2800, 1);
    g.fillRoundedRect(cx - 6, headY + 5, 13, 3, 1);

  } else if (frame === 'run3') {
    // === RUN FRAME 3 (legs passing center, transition) ===
    // Left leg (passing through center)
    g.fillStyle(colors.shoes, 1);
    g.fillRoundedRect(cx - 6, legY + legH - 3, legW + 2, 5, 2);
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - 5, legY + 1, legW, legH - 1, 2);

    // Right leg (passing through center)
    g.fillStyle(colors.shoes, 1);
    g.fillRoundedRect(cx + 1, legY + legH - 3, legW + 2, 5, 2);
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx + 0, legY + 1, legW, legH - 1, 2);

    // Body
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY, bodyW, bodyH, 4);
    g.fillStyle(colors.shirt, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY, bodyW, 6, 3);
    g.fillStyle(0xffd700, 1);
    g.fillCircle(cx - 4, bodyY + 8, 1.5);
    g.fillCircle(cx + 4, bodyY + 8, 1.5);

    // Arms (centered)
    g.fillStyle(colors.skin, 1);
    g.fillRoundedRect(cx - bodyW / 2 - armW + 1, armY, armW, armH, 2);
    g.fillRoundedRect(cx + bodyW / 2 - 1, armY, armW, armH, 2);

    // Head
    g.fillStyle(colors.skin, 1);
    g.fillCircle(cx, headY, headR);
    g.fillStyle(colors.hat, 1);
    g.fillRoundedRect(cx - headR - 2, headY - headR, headR * 2 + 4, headR, 4);
    g.fillRoundedRect(cx - headR - 4, headY - 2, headR * 2 + 8, 5, 2);
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(cx - 2, headY + 1, 5, 6);
    g.fillEllipse(cx + 5, headY + 1, 5, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(cx - 1, headY + 2, 2);
    g.fillCircle(cx + 6, headY + 2, 2);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx, headY + 1, 1);
    g.fillCircle(cx + 7, headY + 1, 1);
    g.fillStyle(0x4a2800, 1);
    g.fillRoundedRect(cx - 6, headY + 5, 13, 3, 1);

  } else if (frame === 'run4') {
    // === RUN FRAME 4 (right leg forward, left leg back - opposite of run1) ===
    // Back leg (left, extended back)
    g.fillStyle(colors.shoes, 1);
    g.fillRoundedRect(cx + 4, legY + legH - 2, legW + 2, 5, 2);
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx + 3, legY + 2, legW, legH - 2, 2);

    // Front leg (right, forward)
    g.fillStyle(colors.shoes, 1);
    g.fillRoundedRect(cx - 10, legY + legH - 5, legW + 2, 5, 2);
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - 9, legY, legW, legH + 2, 2);

    // Body
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY, bodyW, bodyH, 4);
    g.fillStyle(colors.shirt, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY, bodyW, 6, 3);
    g.fillStyle(0xffd700, 1);
    g.fillCircle(cx - 4, bodyY + 8, 1.5);
    g.fillCircle(cx + 4, bodyY + 8, 1.5);

    // Arms (opposite of run1)
    g.fillStyle(colors.skin, 1);
    g.fillRoundedRect(cx - bodyW / 2, armY + 2, armW, armH, 2);
    g.fillRoundedRect(cx + bodyW / 2 - armW + 1, armY - 2, armW, armH, 2);

    // Head
    g.fillStyle(colors.skin, 1);
    g.fillCircle(cx, headY, headR);
    g.fillStyle(colors.hat, 1);
    g.fillRoundedRect(cx - headR - 2, headY - headR, headR * 2 + 4, headR, 4);
    g.fillRoundedRect(cx - headR - 4, headY - 2, headR * 2 + 8, 5, 2);
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(cx - 2, headY + 1, 5, 6);
    g.fillEllipse(cx + 5, headY + 1, 5, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(cx - 1, headY + 2, 2);
    g.fillCircle(cx + 6, headY + 2, 2);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx, headY + 1, 1);
    g.fillCircle(cx + 7, headY + 1, 1);
    g.fillStyle(0x4a2800, 1);
    g.fillRoundedRect(cx - 6, headY + 5, 13, 3, 1);

  } else if (frame === 'jump') {
    // === JUMP POSE (arms up, legs together) ===
    // Legs (together, slightly bent)
    g.fillStyle(colors.shoes, 1);
    g.fillRoundedRect(cx - 8, legY + legH - 6, legW + 2, 5, 2);
    g.fillRoundedRect(cx + 2, legY + legH - 6, legW + 2, 5, 2);
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - 7, legY - 2, legW, legH + 2, 2);
    g.fillRoundedRect(cx + 2, legY - 2, legW, legH + 2, 2);

    // Body
    g.fillStyle(colors.overalls, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY - 2, bodyW, bodyH, 4);
    g.fillStyle(colors.shirt, 1);
    g.fillRoundedRect(cx - bodyW / 2, bodyY - 2, bodyW, 6, 3);

    g.fillStyle(0xffd700, 1);
    g.fillCircle(cx - 4, bodyY + 6, 1.5);
    g.fillCircle(cx + 4, bodyY + 6, 1.5);

    // Arms (raised up!)
    g.fillStyle(colors.skin, 1);
    g.fillRoundedRect(cx - bodyW / 2 - 3, armY - 10, armW, armH, 2);
    g.fillRoundedRect(cx + bodyW / 2 - 2, armY - 10, armW, armH, 2);

    // Head (slightly tilted up)
    g.fillStyle(colors.skin, 1);
    g.fillCircle(cx, headY - 2, headR);

    // Cap
    g.fillStyle(colors.hat, 1);
    g.fillRoundedRect(cx - headR - 2, headY - headR - 2, headR * 2 + 4, headR, 4);
    g.fillRoundedRect(cx - headR - 4, headY - 4, headR * 2 + 8, 5, 2);

    // Eyes (excited, looking up)
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(cx - 3, headY - 1, 5, 7);
    g.fillEllipse(cx + 4, headY - 1, 5, 7);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(cx - 2, headY, 2);
    g.fillCircle(cx + 5, headY, 2);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 1, headY - 1, 1);
    g.fillCircle(cx + 6, headY - 1, 1);

    // Mustache
    g.fillStyle(0x4a2800, 1);
    g.fillRoundedRect(cx - 6, headY + 3, 13, 3, 1);
  }
}

// ==================== Background ====================
function generateBackgroundTextures(scene: Phaser.Scene): void {
  // Mountain silhouette
  const mw = 600;
  const mh = 200;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x0d1f3c, 1);

  const path = new Phaser.Curves.Path(0, mh);
  path.lineTo(0, mh * 0.6);
  path.lineTo(mw * 0.15, mh * 0.2);
  path.lineTo(mw * 0.25, mh * 0.45);
  path.lineTo(mw * 0.4, mh * 0.1);
  path.lineTo(mw * 0.55, mh * 0.35);
  path.lineTo(mw * 0.7, mh * 0.15);
  path.lineTo(mw * 0.85, mh * 0.4);
  path.lineTo(mw, mh * 0.6);
  path.lineTo(mw, mh);

  const points = path.getPoints(30);
  g.fillPoints(points, true);
  g.generateTexture('mountain-layer', mw, mh);
  g.destroy();

  // Star dot
  const g2 = scene.make.graphics({ x: 0, y: 0 }, false);
  g2.fillStyle(0xffffff, 1);
  g2.fillCircle(2, 2, 2);
  g2.generateTexture('star-dot', 4, 4);
  g2.destroy();
}

// ==================== Power-ups ====================
function generatePowerUpTextures(scene: Phaser.Scene): void {
  const configs = [
    { key: 'pu-shield', color: 0x4fc3f7, icon: 'shield' },
    { key: 'pu-magnet', color: 0xff9800, icon: 'magnet' },
    { key: 'pu-slowtime', color: 0xce93d8, icon: 'clock' },
    { key: 'pu-boostboots', color: 0x66bb6a, icon: 'boot' },
  ];
  const s = 24;
  for (const cfg of configs) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    // Glow
    g.fillStyle(cfg.color, 0.25);
    g.fillCircle(s / 2, s / 2, s / 2);
    // Body
    g.fillStyle(cfg.color, 0.85);
    g.fillCircle(s / 2, s / 2, s / 2 - 3);
    // Inner highlight
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(s / 2 - 2, s / 2 - 2, 3);
    // Icon mark
    g.fillStyle(0xffffff, 0.9);
    if (cfg.icon === 'shield') {
      g.fillTriangle(s / 2, s / 2 - 5, s / 2 - 5, s / 2 + 3, s / 2 + 5, s / 2 + 3);
    } else if (cfg.icon === 'magnet') {
      g.fillRoundedRect(s / 2 - 4, s / 2 - 5, 8, 4, 2);
      g.fillRoundedRect(s / 2 - 5, s / 2 - 1, 3, 6, 1);
      g.fillRoundedRect(s / 2 + 2, s / 2 - 1, 3, 6, 1);
    } else if (cfg.icon === 'clock') {
      g.lineStyle(2, 0xffffff, 0.9);
      g.strokeCircle(s / 2, s / 2, 5);
      g.lineBetween(s / 2, s / 2, s / 2, s / 2 - 3);
      g.lineBetween(s / 2, s / 2, s / 2 + 3, s / 2);
    } else if (cfg.icon === 'boot') {
      g.fillRoundedRect(s / 2 - 3, s / 2 - 5, 6, 8, 2);
      g.fillRoundedRect(s / 2 - 1, s / 2 + 3, 6, 3, 1);
    }
    g.generateTexture(cfg.key, s, s);
    g.destroy();
  }
}

// ==================== Enemies ====================
function generateEnemyTextures(scene: Phaser.Scene): void {
  const es = 32;

  // Flyer - red bat-like
  const gf = scene.make.graphics({ x: 0, y: 0 }, false);
  gf.fillStyle(0xff5252, 1);
  gf.fillEllipse(es / 2, es / 2, 20, 16);
  // Wings
  gf.fillTriangle(es / 2 - 12, es / 2, es / 2 - 4, es / 2 - 8, es / 2 - 4, es / 2 + 4);
  gf.fillTriangle(es / 2 + 12, es / 2, es / 2 + 4, es / 2 - 8, es / 2 + 4, es / 2 + 4);
  // Eyes
  gf.fillStyle(0xffffff, 1);
  gf.fillCircle(es / 2 - 3, es / 2 - 2, 2);
  gf.fillCircle(es / 2 + 3, es / 2 - 2, 2);
  gf.fillStyle(0x000000, 1);
  gf.fillCircle(es / 2 - 2, es / 2 - 2, 1);
  gf.fillCircle(es / 2 + 4, es / 2 - 2, 1);
  gf.generateTexture('enemy-flyer', es, es);
  gf.destroy();

  // Ground - brown slug-like
  const gg = scene.make.graphics({ x: 0, y: 0 }, false);
  gg.fillStyle(0x8d6e63, 1);
  gg.fillRoundedRect(es / 2 - 12, es / 2 - 6, 24, 16, 6);
  // Eyes
  gg.fillStyle(0xffffff, 1);
  gg.fillCircle(es / 2 - 4, es / 2 - 2, 2.5);
  gg.fillCircle(es / 2 + 4, es / 2 - 2, 2.5);
  gg.fillStyle(0x000000, 1);
  gg.fillCircle(es / 2 - 3, es / 2 - 2, 1.5);
  gg.fillCircle(es / 2 + 5, es / 2 - 2, 1.5);
  // Spikes on top
  gg.fillStyle(0x6d4c41, 1);
  for (let i = -8; i <= 8; i += 4) {
    gg.fillTriangle(es / 2 + i, es / 2 - 6, es / 2 + i - 2, es / 2 - 12, es / 2 + i + 2, es / 2 - 12);
  }
  gg.generateTexture('enemy-ground', es, es);
  gg.destroy();

  // Shooter - purple turret
  const gs = scene.make.graphics({ x: 0, y: 0 }, false);
  gs.fillStyle(0xab47bc, 1);
  gs.fillRoundedRect(es / 2 - 10, es / 2 - 8, 20, 20, 4);
  // Barrel
  gs.fillStyle(0x7b1fa2, 1);
  gs.fillRoundedRect(es / 2 - 3, es / 2 - 14, 6, 10, 2);
  // Eye
  gs.fillStyle(0xff5252, 1);
  gs.fillCircle(es / 2, es / 2, 3);
  gs.fillStyle(0x000000, 1);
  gs.fillCircle(es / 2, es / 2, 1.5);
  gs.generateTexture('enemy-shooter', es, es);
  gs.destroy();

  // Bullet
  const gb = scene.make.graphics({ x: 0, y: 0 }, false);
  gb.fillStyle(0xff1744, 1);
  gb.fillCircle(4, 4, 4);
  gb.fillStyle(0xff8a80, 0.6);
  gb.fillCircle(3, 3, 2);
  gb.generateTexture('bullet', 8, 8);
  gb.destroy();

  // Bullet (frozen - for ninja art freeze)
  const gbf = scene.make.graphics({ x: 0, y: 0 }, false);
  gbf.fillStyle(0x00bfff, 0.5);
  gbf.fillCircle(4, 4, 4);
  gbf.generateTexture('bullet-frozen', 8, 8);
  gbf.destroy();
}

// ==================== Boss ====================
function generateBossTextures(scene: Phaser.Scene): void {
  const bs = 80;
  for (let ch = 1; ch <= 10; ch++) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const hue = (ch * 36) % 360;
    const color = Phaser.Display.Color.HSLToColor(hue / 360, 0.6, 0.4).color;
    // Body
    g.fillStyle(color, 1);
    g.fillRoundedRect(8, 12, bs - 16, bs - 16, 12);
    // Eyes
    g.fillStyle(0xff0000, 1);
    g.fillCircle(bs / 2 - 10, bs / 2 - 6, 5);
    g.fillCircle(bs / 2 + 10, bs / 2 - 6, 5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(bs / 2 - 9, bs / 2 - 7, 2);
    g.fillCircle(bs / 2 + 11, bs / 2 - 7, 2);
    // Crown / horns
    g.fillStyle(0xffd700, 1);
    g.fillTriangle(bs / 2 - 20, 12, bs / 2 - 14, 0, bs / 2 - 8, 12);
    g.fillTriangle(bs / 2 + 8, 12, bs / 2 + 14, 0, bs / 2 + 20, 12);
    g.fillTriangle(bs / 2 - 4, 12, bs / 2, 0, bs / 2 + 4, 12);
    g.generateTexture(`boss-${ch}`, bs, bs);
    g.destroy();
  }
}

// ==================== Ninja Art Effects ====================
function generateNinjaArtTextures(scene: Phaser.Scene): void {
  // Freeze wave
  const gf = scene.make.graphics({ x: 0, y: 0 }, false);
  gf.fillStyle(0x00bfff, 0.3);
  gf.fillCircle(64, 64, 64);
  gf.lineStyle(3, 0x00bfff, 0.6);
  gf.strokeCircle(64, 64, 48);
  gf.strokeCircle(64, 64, 32);
  gf.generateTexture('ninja-freeze', 128, 128);
  gf.destroy();

  // Dash trail
  const gd = scene.make.graphics({ x: 0, y: 0 }, false);
  gd.fillStyle(0xff4500, 0.6);
  gd.fillRoundedRect(0, 8, 48, 16, 8);
  gd.fillStyle(0xff8c00, 0.3);
  gd.fillRoundedRect(-16, 12, 32, 8, 4);
  gd.generateTexture('ninja-dash', 64, 32);
  gd.destroy();

  // Timestop rings
  const gt = scene.make.graphics({ x: 0, y: 0 }, false);
  gt.lineStyle(2, 0xda70d6, 0.5);
  gt.strokeCircle(40, 40, 35);
  gt.strokeCircle(40, 40, 25);
  gt.strokeCircle(40, 40, 15);
  gt.fillStyle(0xda70d6, 0.15);
  gt.fillCircle(40, 40, 40);
  gt.generateTexture('ninja-timestop', 80, 80);
  gt.destroy();

  // Tornado
  const gto = scene.make.graphics({ x: 0, y: 0 }, false);
  for (let i = 0; i < 5; i++) {
    const r = 8 + i * 6;
    gto.lineStyle(2, 0x00e676, 0.4 + i * 0.1);
    gto.strokeCircle(40, 40 + i * 4, r);
  }
  gto.generateTexture('ninja-tornado', 80, 100);
  gto.destroy();
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
}

// ==================== Weapon Textures ====================
function generateWeaponTextures(scene: Phaser.Scene): void {
  // Bullet textures
  const bulletDefs: { key: string; w: number; h: number; color: number; shape: 'circle' | 'rect' | 'ellipse' }[] = [
    { key: 'bullet-pistol', w: 6, h: 6, color: 0xffeb3b, shape: 'circle' },
    { key: 'bullet-spread', w: 8, h: 5, color: 0xff9800, shape: 'ellipse' },
    { key: 'bullet-laser', w: 16, h: 4, color: 0x00e5ff, shape: 'rect' },
    { key: 'bullet-machinegun', w: 4, h: 4, color: 0xe0e0e0, shape: 'circle' },
    { key: 'bullet-fireball', w: 10, h: 10, color: 0xff5722, shape: 'circle' },
  ];

  for (const def of bulletDefs) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    // Glow
    g.fillStyle(def.color, 0.3);
    g.fillCircle(def.w / 2, def.h / 2, Math.max(def.w, def.h) / 2);
    // Core
    g.fillStyle(def.color, 1);
    if (def.shape === 'circle') {
      g.fillCircle(def.w / 2, def.h / 2, def.w / 2 - 1);
    } else if (def.shape === 'ellipse') {
      g.fillEllipse(def.w / 2, def.h / 2, def.w - 1, def.h - 1);
    } else {
      g.fillRoundedRect(0, def.h / 2 - 1.5, def.w, 3, 1);
    }
    // Highlight
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(def.w / 2 - 1, def.h / 2 - 1, Math.max(1, def.w / 4));
    g.generateTexture(def.key, def.w, def.h);
    g.destroy();
  }

  // Weapon pickup textures
  const weaponDefs: { key: string; color: number; mark: string }[] = [
    { key: 'pu-weapon-pistol', color: 0xffeb3b, mark: 'P' },
    { key: 'pu-weapon-spread', color: 0xff9800, mark: 'S' },
    { key: 'pu-weapon-laser', color: 0x00e5ff, mark: 'L' },
    { key: 'pu-weapon-machinegun', color: 0xe0e0e0, mark: 'M' },
    { key: 'pu-weapon-fireball', color: 0xff5722, mark: 'F' },
  ];

  for (const def of weaponDefs) {
    const s = 24;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    // Outer glow
    g.fillStyle(def.color, 0.25);
    g.fillCircle(s / 2, s / 2, s / 2);
    // Inner circle
    g.fillStyle(0x1a1a2e, 0.85);
    g.fillCircle(s / 2, s / 2, s / 2 - 3);
    // Border
    g.lineStyle(2, def.color, 1);
    g.strokeCircle(s / 2, s / 2, s / 2 - 3);
    // Center dot
    g.fillStyle(def.color, 1);
    g.fillCircle(s / 2, s / 2, 3);
    g.generateTexture(def.key, s, s);
    g.destroy();
  }

  // Explosion texture
  const ge = scene.make.graphics({ x: 0, y: 0 }, false);
  ge.fillStyle(0xff5722, 0.3);
  ge.fillCircle(10, 10, 10);
  ge.fillStyle(0xffeb3b, 0.6);
  ge.fillCircle(10, 10, 6);
  ge.fillStyle(0xffffff, 0.8);
  ge.fillCircle(10, 10, 3);
  ge.generateTexture('explosion', 20, 20);
  ge.destroy();
}
