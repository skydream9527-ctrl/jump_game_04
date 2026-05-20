import Phaser from 'phaser';
import { CHAPTER_DATA } from '../../constants/levels';
import { PHYSICS } from '../../constants/physics';
import { PETS } from '../../constants/pets';

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
  generatePetTextures(scene);
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

// ==================== Zelda-style Character System ====================
function generateMarioCharacterTextures(scene: Phaser.Scene): void {
  const frames = ['idle', 'run1', 'run2', 'run3', 'run4', 'jump'];
  const w = 36;
  const h = 48;

  const charDrawers: Record<number, (g: Phaser.GameObjects.Graphics, frame: string, w: number, h: number) => void> = {
    0: drawLingFrame,
    1: drawZeroFrame,
    2: drawEchoFrame,
    3: drawGaleFrame,
  };

  for (const [id, drawer] of Object.entries(charDrawers)) {
    for (const frame of frames) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      drawer(g, frame, w, h);
      g.generateTexture(`player-${id}-${frame}`, w + 4, h + 4);
      g.destroy();
    }
    const gDefault = scene.make.graphics({ x: 0, y: 0 }, false);
    charDrawers[Number(id)](gDefault, 'idle', w, h);
    gDefault.generateTexture(`player-${id}`, w + 4, h + 4);
    gDefault.destroy();
  }
}

// ── 凌（Ling）— 深海蓝制服 · 钢蓝肩甲 · 天蓝能量核心 ──
function drawLingFrame(g: Phaser.GameObjects.Graphics, frame: string, w: number, h: number): void {
  const cx = w / 2 + 2, cy = h / 2 + 2;
  const headR = 10, bodyW = 18, bodyH = 14, legW = 7, legH = 12;

  const headY = cy - 14;
  const bodyY = headY + headR + 2;
  const legY = bodyY + bodyH;
  const armY = bodyY + 2;

  const isJump = frame === 'jump';
  const runOff = frame === 'run1' ? 4 : frame === 'run2' ? -3 : frame === 'run3' ? -4 : frame === 'run4' ? 3 : 0;
  const armOff = frame === 'run1' ? 3 : frame === 'run2' ? -2 : frame === 'run3' ? -3 : frame === 'run4' ? 2 : 0;
  const bodyLean = isJump ? -2 : 0;

  // ── 能量核心光晕 ──
  g.fillStyle(0x6bb8e8, 0.15);
  g.fillCircle(cx, bodyY + 6, 16);

  // ── 靴子 ──
  g.fillStyle(0x3a4a60, 1);
  g.fillRoundedRect(cx - 9, legY + legH - 3 + bodyLean, legW + 2, 5, 2);
  g.fillRoundedRect(cx + 2 + runOff, legY + legH - 3 + bodyLean, legW + 2, 5, 2);
  // 靴子高光
  g.fillStyle(0x5a7a9a, 0.5);
  g.fillRoundedRect(cx - 8, legY + legH - 2 + bodyLean, legW, 2, 1);
  g.fillRoundedRect(cx + 3 + runOff, legY + legH - 2 + bodyLean, legW, 2, 1);

  // ── 腿 ──
  g.fillStyle(0x1e3550, 1);
  g.fillRoundedRect(cx - 8, legY + bodyLean, legW, legH, 2);
  g.fillRoundedRect(cx + 2 + runOff, legY + bodyLean, legW, legH, 2);
  // 腿部条纹
  g.fillStyle(0x2a4a68, 0.6);
  g.fillRect(cx - 7, legY + 4 + bodyLean, legW - 2, 1);
  g.fillRect(cx + 3 + runOff, legY + 4 + bodyLean, legW - 2, 1);

  // ── 身体 ──
  g.fillStyle(0x1e3550, 1);
  g.fillRoundedRect(cx - bodyW / 2, bodyY + bodyLean, bodyW, bodyH, 4);
  // V 形胸甲
  g.fillStyle(0x2a5080, 1);
  g.beginPath();
  g.moveTo(cx, bodyY + 1 + bodyLean);
  g.lineTo(cx - 7, bodyY + bodyH - 2 + bodyLean);
  g.lineTo(cx + 7, bodyY + bodyH - 2 + bodyLean);
  g.closePath();
  g.fill();
  // 胸甲高光
  g.fillStyle(0x4a7aaa, 0.4);
  g.beginPath();
  g.moveTo(cx, bodyY + 2 + bodyLean);
  g.lineTo(cx - 4, bodyY + bodyH / 2 + bodyLean);
  g.lineTo(cx + 4, bodyY + bodyH / 2 + bodyLean);
  g.closePath();
  g.fill();

  // ── 能量核心 ──
  g.fillStyle(0x6bb8e8, 0.9);
  g.fillCircle(cx, bodyY + 6 + bodyLean, 3);
  g.fillStyle(0xa0d8ff, 0.6);
  g.fillCircle(cx - 1, bodyY + 5 + bodyLean, 1.5);

  // ── 肩甲 ──
  g.fillStyle(0x3a5575, 1);
  g.fillRoundedRect(cx - bodyW / 2 - 4, bodyY + bodyLean, 6, 8, 2);
  g.fillRoundedRect(cx + bodyW / 2 - 2, bodyY + bodyLean, 6, 8, 2);
  // 肩甲高光
  g.fillStyle(0x5a85aa, 0.6);
  g.fillRect(cx - bodyW / 2 - 3, bodyY + 2 + bodyLean, 4, 1);
  g.fillRect(cx + bodyW / 2 - 1, bodyY + 2 + bodyLean, 4, 1);

  // ── 能量臂环 ──
  g.fillStyle(0x4a7a9f, 1);
  g.fillRoundedRect(cx - bodyW / 2 - 3, armY + 4 + armOff + bodyLean, 4, 3, 1);
  g.fillRoundedRect(cx + bodyW / 2 - 1, armY + 4 - armOff + bodyLean, 4, 3, 1);
  g.fillStyle(0x6bb8e8, 0.7);
  g.fillRect(cx - bodyW / 2 - 2, armY + 5 + armOff + bodyLean, 2, 1);
  g.fillRect(cx + bodyW / 2, armY + 5 - armOff + bodyLean, 2, 1);

  // ── 手臂 ──
  g.fillStyle(0xe8c8a0, 1);
  g.fillRoundedRect(cx - bodyW / 2 - 3, armY + armOff + bodyLean, 4, 10, 2);
  g.fillRoundedRect(cx + bodyW / 2 - 1, armY - armOff + bodyLean, 4, 10, 2);
  // 手套
  g.fillStyle(0x3a4a60, 1);
  g.fillRoundedRect(cx - bodyW / 2 - 3, armY + 8 + armOff + bodyLean, 4, 3, 1);
  g.fillRoundedRect(cx + bodyW / 2 - 1, armY + 8 - armOff + bodyLean, 4, 3, 1);

  // ── 腰带 ──
  g.fillStyle(0x3a4a60, 1);
  g.fillRect(cx - bodyW / 2, bodyY + bodyH - 2 + bodyLean, bodyW, 3);
  g.fillStyle(0x6bb8e8, 1);
  g.fillRoundedRect(cx - 2, bodyY + bodyH - 2 + bodyLean, 4, 3, 1);

  // ── 头 ──
  const headAdj = isJump ? headY - 2 : headY;
  g.fillStyle(0xe8c8a0, 1);
  g.fillCircle(cx, headAdj, headR);

  // 头发
  g.fillStyle(0x1a2a40, 1);
  g.beginPath();
  g.arc(cx, headAdj - 3, headR, Math.PI, Math.PI * 2);
  g.fill();
  g.fillRect(cx - headR, headAdj - 3, headR * 2, 4);
  // 刘海斜分
  g.beginPath();
  g.moveTo(cx - 8, headAdj - 3);
  g.lineTo(cx - 4, headAdj - 7);
  g.lineTo(cx + 2, headAdj - 3);
  g.closePath();
  g.fill();

  // 护目镜框
  g.fillStyle(0x3a5575, 1);
  g.fillRoundedRect(cx - 8, headAdj - 4, 16, 5, 2);
  // 护目镜片
  g.fillStyle(0x6bb8e8, 0.6);
  g.fillRoundedRect(cx - 7, headAdj - 3, 6, 3, 1);
  g.fillRoundedRect(cx + 1, headAdj - 3, 6, 3, 1);
  // 镜片高光
  g.fillStyle(0xa0d8ff, 0.4);
  g.fillRect(cx - 6, headAdj - 2, 2, 1);
  g.fillRect(cx + 2, headAdj - 2, 2, 1);

  // 眼睛
  g.fillStyle(0xffffff, 1);
  g.fillEllipse(cx - 3, headAdj + 2, 5, 6);
  g.fillEllipse(cx + 4, headAdj + 2, 5, 6);
  g.fillStyle(0x2a5580, 1);
  g.fillCircle(cx - 2, headAdj + 3, 2);
  g.fillCircle(cx + 5, headAdj + 3, 2);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 1.5, headAdj + 1.5, 0.8);
  g.fillCircle(cx + 5.5, headAdj + 1.5, 0.8);

  // 嘴
  g.fillStyle(0xc8a080, 1);
  g.fillRect(cx - 2, headAdj + 6, 4, 1);
}

// ── 零号（Zero）— 银白外壳 · 青蓝光学眼 · 机械关节 ──
function drawZeroFrame(g: Phaser.GameObjects.Graphics, frame: string, w: number, h: number): void {
  const cx = w / 2 + 2, cy = h / 2 + 2;
  const headR = 10, bodyW = 18, bodyH = 16, legW = 7, legH = 12;

  const headY = cy - 14;
  const bodyY = headY + headR + 2;
  const legY = bodyY + bodyH;
  const armY = bodyY + 2;

  const isJump = frame === 'jump';
  const runOff = frame === 'run1' ? 4 : frame === 'run2' ? -3 : frame === 'run3' ? -4 : frame === 'run4' ? 3 : 0;
  const armOff = frame === 'run1' ? 3 : frame === 'run2' ? -2 : frame === 'run3' ? -3 : frame === 'run4' ? 2 : 0;
  const bodyLean = isJump ? -2 : 0;

  // 光学眼发光
  g.fillStyle(0x00ccff, 0.1);
  g.fillCircle(cx, headY, 16);

  // ── 足部 ──
  g.fillStyle(0x505a68, 1);
  g.fillRoundedRect(cx - 9, legY + legH - 3 + bodyLean, legW + 2, 5, 2);
  g.fillRoundedRect(cx + 2 + runOff, legY + legH - 3 + bodyLean, legW + 2, 5, 2);
  g.fillStyle(0x00aadd, 0.4);
  g.fillRect(cx - 7, legY + legH + bodyLean, 3, 1);
  g.fillRect(cx + 4 + runOff, legY + legH + bodyLean, 3, 1);

  // ── 小腿 ──
  g.fillStyle(0xc0c8d4, 1);
  g.fillRoundedRect(cx - 8, legY + bodyLean, legW, legH, 2);
  g.fillRoundedRect(cx + 2 + runOff, legY + bodyLean, legW, legH, 2);
  // 膝关节
  g.fillStyle(0x505a68, 1);
  g.fillCircle(cx - 4, legY + bodyLean, 2.5);
  g.fillCircle(cx + 5 + runOff, legY + bodyLean, 2.5);

  // ── 身体 ──
  g.fillStyle(0xc0c8d4, 1);
  g.fillRoundedRect(cx - bodyW / 2, bodyY + bodyLean, bodyW, bodyH, 4);
  // 能量纹路
  g.lineStyle(1, 0x00aadd, 0.5);
  g.beginPath();
  g.moveTo(cx - 4, bodyY + 3 + bodyLean);
  g.lineTo(cx, bodyY + 1 + bodyLean);
  g.lineTo(cx + 4, bodyY + 3 + bodyLean);
  g.stroke();
  g.beginPath();
  g.moveTo(cx - 6, bodyY + 7 + bodyLean);
  g.lineTo(cx, bodyY + 5 + bodyLean);
  g.lineTo(cx + 6, bodyY + 7 + bodyLean);
  g.stroke();
  // 六边形核心
  g.fillStyle(0x00ccff, 0.8);
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 - 90) * Math.PI / 180;
    const px = cx + Math.cos(a) * 4;
    const py = bodyY + 8 + bodyLean + Math.sin(a) * 4;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath();
  g.fill();

  // ── 肩甲 ──
  g.fillStyle(0xc0c8d4, 1);
  g.fillRoundedRect(cx - bodyW / 2 - 4, bodyY + bodyLean, 6, 9, 2);
  g.fillRoundedRect(cx + bodyW / 2 - 2, bodyY + bodyLean, 6, 9, 2);
  // 散热槽
  g.fillStyle(0xa0aab8, 0.7);
  g.fillRect(cx - bodyW / 2 - 3, bodyY + 2 + bodyLean, 4, 1);
  g.fillRect(cx - bodyW / 2 - 3, bodyY + 4 + bodyLean, 4, 1);
  g.fillRect(cx + bodyW / 2 - 1, bodyY + 2 + bodyLean, 4, 1);
  g.fillRect(cx + bodyW / 2 - 1, bodyY + 4 + bodyLean, 4, 1);

  // ── 手臂（分段式）──
  g.fillStyle(0xc0c8d4, 1);
  g.fillRoundedRect(cx - bodyW / 2 - 3, armY + armOff + bodyLean, 4, 9, 2);
  g.fillRoundedRect(cx + bodyW / 2 - 1, armY - armOff + bodyLean, 4, 9, 2);
  // 关节
  g.fillStyle(0x505a68, 1);
  g.fillCircle(cx - bodyW / 2 - 1, armY + 9 + armOff + bodyLean, 2);
  g.fillCircle(cx + bodyW / 2 + 1, armY + 9 - armOff + bodyLean, 2);
  // 三指手
  g.fillStyle(0xa0aab8, 1);
  for (let i = -1; i <= 1; i++) {
    g.fillRect(cx - bodyW / 2 - 3 + i * 1.5, armY + 10 + armOff + bodyLean, 1.5, 3);
    g.fillRect(cx + bodyW / 2 - 1 + i * 1.5, armY + 10 - armOff + bodyLean, 1.5, 3);
  }
  // 指尖蓝光
  g.fillStyle(0x00ccff, 0.5);
  g.fillRect(cx - bodyW / 2 - 2, armY + 12 + armOff + bodyLean, 1, 1);
  g.fillRect(cx + bodyW / 2, armY + 12 - armOff + bodyLean, 1, 1);

  // ── 腰部球形关节 ──
  g.fillStyle(0x505a68, 1);
  g.fillCircle(cx, bodyY + bodyH + bodyLean, 3);
  g.fillStyle(0xa0aab8, 1);
  g.fillCircle(cx, bodyY + bodyH + bodyLean, 1.5);

  // ── 头 ──
  const headAdj = isJump ? headY - 2 : headY;
  g.fillStyle(0xc0c8d4, 1);
  g.fillRoundedRect(cx - headR, headAdj - headR, headR * 2, headR * 2, 5);
  // 几何切面
  g.fillStyle(0xb0b8c4, 1);
  g.beginPath();
  g.moveTo(cx - headR, headAdj);
  g.lineTo(cx - 5, headAdj - headR);
  g.lineTo(cx + 5, headAdj - headR);
  g.lineTo(cx + headR, headAdj);
  g.closePath();
  g.fill();
  // 光学传感器带
  g.fillStyle(0x00ccff, 0.9);
  g.fillRoundedRect(cx - 7, headAdj - 2, 14, 3, 1);
  // 散热孔
  g.fillStyle(0x505a68, 1);
  g.fillRect(cx - 8, headAdj + 4, 2, 2);
  g.fillRect(cx + 6, headAdj + 4, 2, 2);
}

// ── 艾珂（Echo）— 淡紫皮肤 · 尖耳 · 紫色能量纹路 ──
function drawEchoFrame(g: Phaser.GameObjects.Graphics, frame: string, w: number, h: number): void {
  const cx = w / 2 + 2, cy = h / 2 + 2;
  const headR = 10, bodyW = 17, bodyH = 14, legW = 6, legH = 12;

  const headY = cy - 14;
  const bodyY = headY + headR + 2;
  const legY = bodyY + bodyH;
  const armY = bodyY + 2;

  const isJump = frame === 'jump';
  const runOff = frame === 'run1' ? 4 : frame === 'run2' ? -3 : frame === 'run3' ? -4 : frame === 'run4' ? 3 : 0;
  const armOff = frame === 'run1' ? 3 : frame === 'run2' ? -2 : frame === 'run3' ? -3 : frame === 'run4' ? 2 : 0;
  const bodyLean = isJump ? -2 : 0;
  const floatY = isJump ? -3 : 0;

  // 粒子光晕
  g.fillStyle(0xb070e0, 0.1);
  g.fillCircle(cx, bodyY + 6 + bodyLean + floatY, 18);

  // ── 靴子（悬浮离地）──
  g.fillStyle(0x4a2868, 1);
  g.fillRoundedRect(cx - 8, legY + legH - 1 + bodyLean + floatY, legW + 1, 4, 1);
  g.fillRoundedRect(cx + 2 + runOff, legY + legH - 1 + bodyLean + floatY, legW + 1, 4, 1);
  // 悬浮光晕
  g.fillStyle(0xb070e0, 0.2);
  g.fillEllipse(cx - 5, legY + legH + 3 + bodyLean + floatY, 8, 3);
  g.fillEllipse(cx + 5 + runOff, legY + legH + 3 + bodyLean + floatY, 8, 3);

  // ── 腿 ──
  g.fillStyle(0x4a2868, 1);
  g.fillRoundedRect(cx - 7, legY + bodyLean + floatY, legW, legH, 2);
  g.fillRoundedRect(cx + 2 + runOff, legY + bodyLean + floatY, legW, legH, 2);
  // 腿部能量线
  g.lineStyle(1, 0xb070e0, 0.6);
  g.beginPath();
  g.moveTo(cx - 4, legY + 2 + bodyLean + floatY);
  g.lineTo(cx - 4, legY + 8 + bodyLean + floatY);
  g.stroke();
  g.beginPath();
  g.moveTo(cx + 5 + runOff, legY + 2 + bodyLean + floatY);
  g.lineTo(cx + 5 + runOff, legY + 8 + bodyLean + floatY);
  g.stroke();

  // ── 身体 ──
  g.fillStyle(0x4a2868, 1);
  g.fillRoundedRect(cx - bodyW / 2, bodyY + bodyLean + floatY, bodyW, bodyH, 4);
  // V 领
  g.fillStyle(0x3a1858, 1);
  g.beginPath();
  g.moveTo(cx, bodyY + bodyLean + floatY);
  g.lineTo(cx - 5, bodyY + 5 + bodyLean + floatY);
  g.lineTo(cx + 5, bodyY + 5 + bodyLean + floatY);
  g.closePath();
  g.fill();
  // 能量纹路
  g.lineStyle(1.5, 0xb070e0, 0.7);
  g.beginPath();
  g.moveTo(cx - 4, bodyY + 3 + bodyLean + floatY);
  g.lineTo(cx + 4, bodyY + 3 + bodyLean + floatY);
  g.stroke();
  g.beginPath();
  g.moveTo(cx - 6, bodyY + 9 + bodyLean + floatY);
  g.lineTo(cx + 6, bodyY + 9 + bodyLean + floatY);
  g.stroke();

  // ── 悬浮能量护肩 ──
  g.fillStyle(0x7040b0, 0.7);
  g.fillRoundedRect(cx - bodyW / 2 - 5, bodyY - 1 + bodyLean + floatY, 5, 7, 2);
  g.fillRoundedRect(cx + bodyW / 2, bodyY - 1 + bodyLean + floatY, 5, 7, 2);

  // ── 手臂 ──
  g.fillStyle(0xc8a0d8, 1);
  g.fillRoundedRect(cx - bodyW / 2 - 3, armY + armOff + bodyLean + floatY, 4, 10, 2);
  g.fillRoundedRect(cx + bodyW / 2 - 1, armY - armOff + bodyLean + floatY, 4, 10, 2);
  // 螺旋纹路
  g.lineStyle(1, 0xb070e0, 0.5);
  g.beginPath();
  g.moveTo(cx - bodyW / 2 - 1, armY + 2 + armOff + bodyLean + floatY);
  g.lineTo(cx - bodyW / 2 - 1, armY + 8 + armOff + bodyLean + floatY);
  g.stroke();
  // 指尖光点
  g.fillStyle(0xb070e0, 0.7);
  g.fillCircle(cx - bodyW / 2 - 1, armY + 10 + armOff + bodyLean + floatY, 1);
  g.fillCircle(cx + bodyW / 2 + 1, armY + 10 - armOff + bodyLean + floatY, 1);

  // ── 腰带 ──
  g.fillStyle(0x3a1858, 1);
  g.fillRect(cx - bodyW / 2, bodyY + bodyH - 2 + bodyLean + floatY, bodyW, 3);
  // 星形扣饰
  g.fillStyle(0xb070e0, 1);
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 - 90) * Math.PI / 180;
    const px = cx + Math.cos(a) * 2.5;
    const py = bodyY + bodyH - 0.5 + bodyLean + floatY + Math.sin(a) * 2.5;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    const b = (i * 72 + 36 - 90) * Math.PI / 180;
    g.lineTo(cx + Math.cos(b) * 1, bodyY + bodyH - 0.5 + bodyLean + floatY + Math.sin(b) * 1);
  }
  g.closePath();
  g.fill();

  // ── 头 ──
  const headAdj = isJump ? headY - 3 : headY;
  g.fillStyle(0xc8a0d8, 1);
  g.fillCircle(cx, headAdj + floatY, headR);

  // 能量纹路面部
  g.lineStyle(0.8, 0xb070e0, 0.5);
  g.beginPath();
  g.moveTo(cx - 6, headAdj - 2 + floatY);
  g.lineTo(cx - 4, headAdj - 6 + floatY);
  g.stroke();
  g.beginPath();
  g.moveTo(cx + 6, headAdj - 2 + floatY);
  g.lineTo(cx + 4, headAdj - 6 + floatY);
  g.stroke();

  // 尖耳
  g.fillStyle(0xc8a0d8, 1);
  g.beginPath();
  g.moveTo(cx - 9, headAdj - 8 + floatY);
  g.lineTo(cx - 12, headAdj - 18 + floatY);
  g.lineTo(cx - 5, headAdj - 10 + floatY);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(cx + 9, headAdj - 8 + floatY);
  g.lineTo(cx + 12, headAdj - 18 + floatY);
  g.lineTo(cx + 5, headAdj - 10 + floatY);
  g.closePath();
  g.fill();

  // 银紫长发
  g.fillStyle(0xd0d0e8, 1);
  g.beginPath();
  g.arc(cx, headAdj - 3 + floatY, headR + 1, Math.PI, Math.PI * 2);
  g.fill();
  g.fillRect(cx - headR - 1, headAdj - 3 + floatY, (headR + 1) * 2, 5);
  // 飘逸发丝
  g.beginPath();
  g.moveTo(cx - headR - 1, headAdj + floatY);
  g.lineTo(cx - headR + 2, headAdj + 8 + floatY);
  g.lineTo(cx - headR + 4, headAdj + 4 + floatY);
  g.lineTo(cx - headR - 1, headAdj + floatY);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(cx + headR + 1, headAdj + floatY);
  g.lineTo(cx + headR - 2, headAdj + 8 + floatY);
  g.lineTo(cx + headR - 4, headAdj + 4 + floatY);
  g.lineTo(cx + headR + 1, headAdj + floatY);
  g.closePath();
  g.fill();

  // 眼睛
  g.fillStyle(0xffffff, 1);
  g.fillEllipse(cx - 3, headAdj + 2 + floatY, 5, 6);
  g.fillEllipse(cx + 4, headAdj + 2 + floatY, 5, 6);
  g.fillStyle(0xa060e0, 1);
  g.fillCircle(cx - 2, headAdj + 3 + floatY, 2.2);
  g.fillCircle(cx + 5, headAdj + 3 + floatY, 2.2);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 1.5, headAdj + 1.5 + floatY, 0.8);
  g.fillCircle(cx + 5.5, headAdj + 1.5 + floatY, 0.8);
}

// ── 疾风（Gale）— 暗金装甲 · 不对称设计 · 红色光眼 ──
function drawGaleFrame(g: Phaser.GameObjects.Graphics, frame: string, w: number, h: number): void {
  const cx = w / 2 + 2, cy = h / 2 + 2;
  const headR = 10, bodyW = 18, bodyH = 14, legW = 7, legH = 12;

  const headY = cy - 14;
  const bodyY = headY + headR + 2;
  const legY = bodyY + bodyH;
  const armY = bodyY + 2;

  const isJump = frame === 'jump';
  const runOff = frame === 'run1' ? 4 : frame === 'run2' ? -3 : frame === 'run3' ? -4 : frame === 'run4' ? 3 : 0;
  const armOff = frame === 'run1' ? 3 : frame === 'run2' ? -2 : frame === 'run3' ? -3 : frame === 'run4' ? 2 : 0;
  const bodyLean = isJump ? -2 : 0;

  // 推进器光晕
  g.fillStyle(0xff6020, 0.1);
  g.fillCircle(cx, legY + legH + 4 + bodyLean, 12);

  // ── 足部（流线型）──
  g.fillStyle(0xb08840, 1);
  g.fillRoundedRect(cx - 9, legY + legH - 3 + bodyLean, legW + 2, 5, 2);
  g.fillRoundedRect(cx + 2 + runOff, legY + legH - 3 + bodyLean, legW + 2, 5, 2);
  // 推进器口
  g.fillStyle(0x8a6820, 1);
  g.fillRect(cx - 7, legY + legH + bodyLean, 3, 2);
  g.fillRect(cx + 4 + runOff, legY + legH + bodyLean, 3, 2);

  // ── 左腿（全机械 · 暗金）──
  g.fillStyle(0xb08840, 1);
  g.fillRoundedRect(cx - 8, legY + bodyLean, legW, legH, 2);
  // ── 右腿（半机械 · 暗棕）──
  g.fillStyle(0x3a3020, 1);
  g.fillRoundedRect(cx + 2 + runOff, legY + bodyLean, legW, legH, 2);
  // 膝关节
  g.fillStyle(0x8a6820, 1);
  g.fillCircle(cx - 4, legY + bodyLean, 2.5);
  g.fillStyle(0x2a2018, 1);
  g.fillCircle(cx + 5 + runOff, legY + bodyLean, 2.5);

  // ── 身体（暗棕装甲）──
  g.fillStyle(0x3a3020, 1);
  g.fillRoundedRect(cx - bodyW / 2, bodyY + bodyLean, bodyW, bodyH, 4);
  // 装甲纹理
  g.fillStyle(0x2a2018, 0.6);
  g.fillRect(cx - bodyW / 2 + 2, bodyY + 2 + bodyLean, bodyW - 4, 1);
  g.fillRect(cx - bodyW / 2 + 2, bodyY + 6 + bodyLean, bodyW - 4, 1);
  // 左胸能量核心
  g.fillStyle(0xff4040, 0.9);
  g.fillCircle(cx - 4, bodyY + 6 + bodyLean, 3);
  g.fillStyle(0xff8080, 0.5);
  g.fillCircle(cx - 5, bodyY + 5 + bodyLean, 1.5);

  // ── 左肩甲（大型 · 暗金）──
  g.fillStyle(0xb08840, 1);
  g.fillRoundedRect(cx - bodyW / 2 - 5, bodyY - 1 + bodyLean, 7, 10, 3);
  g.fillStyle(0xd0a850, 0.5);
  g.fillRect(cx - bodyW / 2 - 4, bodyY + 1 + bodyLean, 5, 1);
  g.fillRect(cx - bodyW / 2 - 4, bodyY + 3 + bodyLean, 5, 1);
  // ── 右肩甲（小型 · 暗棕）──
  g.fillStyle(0x3a3020, 1);
  g.fillRoundedRect(cx + bodyW / 2 - 2, bodyY + bodyLean, 5, 7, 2);

  // ── 左臂（全机械）──
  g.fillStyle(0xb08840, 1);
  g.fillRoundedRect(cx - bodyW / 2 - 4, armY + armOff + bodyLean, 5, 10, 2);
  g.fillStyle(0x8a6820, 1);
  g.fillCircle(cx - bodyW / 2 - 1, armY + 10 + armOff + bodyLean, 2);
  // 三指爪
  g.fillStyle(0xd0a850, 1);
  g.fillRect(cx - bodyW / 2 - 4, armY + 11 + armOff + bodyLean, 1.5, 3);
  g.fillRect(cx - bodyW / 2 - 2.5, armY + 11 + armOff + bodyLean, 1.5, 3);
  g.fillRect(cx - bodyW / 2 - 1, armY + 11 + armOff + bodyLean, 1.5, 3);
  // ── 右臂（半机械）──
  g.fillStyle(0xd8b890, 1);
  g.fillRoundedRect(cx + bodyW / 2 - 1, armY - armOff + bodyLean, 4, 6, 2);
  g.fillStyle(0x3a3020, 1);
  g.fillRoundedRect(cx + bodyW / 2 - 1, armY + 5 - armOff + bodyLean, 4, 7, 2);

  // ── 腰带 ──
  g.fillStyle(0x3a3020, 1);
  g.fillRect(cx - bodyW / 2, bodyY + bodyH - 2 + bodyLean, bodyW, 3);
  g.fillStyle(0x8a6820, 1);
  g.fillRoundedRect(cx - 2, bodyY + bodyH - 1 + bodyLean, 4, 2, 1);

  // ── 头 ──
  const headAdj = isJump ? headY - 2 : headY;
  // 人类半脸
  g.fillStyle(0xd8b890, 1);
  g.fillCircle(cx, headAdj, headR);
  // 机械半脸
  g.fillStyle(0xb08840, 1);
  g.beginPath();
  g.arc(cx - 2, headAdj, headR, -Math.PI * 0.3, Math.PI * 0.8);
  g.closePath();
  g.fill();

  // 短发（凌乱）
  g.fillStyle(0x2a1a08, 1);
  g.beginPath();
  g.moveTo(cx - 8, headAdj - 8);
  g.lineTo(cx - 6, headAdj - 12);
  g.lineTo(cx - 2, headAdj - 8);
  g.lineTo(cx, headAdj - 11);
  g.lineTo(cx + 3, headAdj - 7);
  g.lineTo(cx + 6, headAdj - 10);
  g.lineTo(cx + 8, headAdj - 6);
  g.lineTo(cx + headR, headAdj - 6);
  g.lineTo(cx + headR, headAdj - 8);
  g.lineTo(cx - 8, headAdj - 10);
  g.closePath();
  g.fill();

  // 左眼（红色光眼）
  g.fillStyle(0xff4040, 0.9);
  g.fillEllipse(cx - 4, headAdj + 2, 5, 4);
  g.fillStyle(0xff8080, 0.7);
  g.fillCircle(cx - 4, headAdj + 2, 1.5);
  // 右眼（人类棕色）
  g.fillStyle(0xffffff, 1);
  g.fillEllipse(cx + 4, headAdj + 2, 4.5, 5.5);
  g.fillStyle(0x5a3a10, 1);
  g.fillCircle(cx + 5, headAdj + 3, 1.8);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx + 5.5, headAdj + 1.5, 0.6);

  // 嘴
  g.fillStyle(0xc8a080, 1);
  g.fillRect(cx - 2, headAdj + 6, 4, 1);
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
    { key: 'pu-xray', color: 0x7c4dff, icon: 'eye' },
    { key: 'pu-revive', color: 0xffd700, icon: 'star' },
    { key: 'pu-heal', color: 0xe91e63, icon: 'heart' },
    { key: 'pu-energy', color: 0x00e676, icon: 'bolt' },
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
    } else if (cfg.icon === 'eye') {
      g.fillEllipse(s / 2, s / 2, 12, 7);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(s / 2, s / 2, 3);
    } else if (cfg.icon === 'star') {
      const cx = s / 2, cy = s / 2, r = 5, ir = 2;
      const starPts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i < 5; i++) {
        starPts.push(new Phaser.Math.Vector2(cx + r * Math.cos(Phaser.Math.DegToRad(i * 72 - 90)), cy + r * Math.sin(Phaser.Math.DegToRad(i * 72 - 90))));
        starPts.push(new Phaser.Math.Vector2(cx + ir * Math.cos(Phaser.Math.DegToRad(i * 72 + 36 - 90)), cy + ir * Math.sin(Phaser.Math.DegToRad(i * 72 + 36 - 90))));
      }
      g.fillPoints(starPts, true);
    } else if (cfg.icon === 'heart') {
      g.fillCircle(s / 2 - 2.5, s / 2 - 2, 3);
      g.fillCircle(s / 2 + 2.5, s / 2 - 2, 3);
      g.fillTriangle(s / 2 - 6, s / 2, s / 2 + 6, s / 2, s / 2, s / 2 + 5);
    } else if (cfg.icon === 'bolt') {
      g.fillTriangle(s / 2 + 1, s / 2 - 6, s / 2 - 4, s / 2 + 1, s / 2 + 2, s / 2 + 1);
      g.fillTriangle(s / 2 - 1, s / 2 + 6, s / 2 + 4, s / 2 - 1, s / 2 - 2, s / 2 - 1);
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

  // Charger - orange rhino-like
  const gc = scene.make.graphics({ x: 0, y: 0 }, false);
  gc.fillStyle(0xff8c00, 1);
  gc.fillRoundedRect(es / 2 - 12, es / 2 - 6, 24, 16, 6);
  // Horn
  gc.fillStyle(0xffd700, 1);
  gc.fillTriangle(es / 2 + 12, es / 2 - 2, es / 2 + 18, es / 2 - 6, es / 2 + 12, es / 2 + 4);
  // Eyes
  gc.fillStyle(0xffffff, 1);
  gc.fillCircle(es / 2 + 4, es / 2 - 2, 2.5);
  gc.fillStyle(0xff0000, 1);
  gc.fillCircle(es / 2 + 5, es / 2 - 2, 1.5);
  // Legs
  gc.fillStyle(0xcc7000, 1);
  gc.fillRoundedRect(es / 2 - 8, es / 2 + 8, 5, 4, 1);
  gc.fillRoundedRect(es / 2 + 3, es / 2 + 8, 5, 4, 1);
  gc.generateTexture('enemy-charger', es, es);
  gc.destroy();

  // Bomber - dark red flying saucer
  const gbm = scene.make.graphics({ x: 0, y: 0 }, false);
  gbm.fillStyle(0xd32f2f, 1);
  gbm.fillEllipse(es / 2, es / 2, 26, 14);
  // Cockpit
  gbm.fillStyle(0xff5252, 1);
  gbm.fillCircle(es / 2, es / 2, 5);
  // Eyes
  gbm.fillStyle(0xffffff, 1);
  gbm.fillCircle(es / 2 - 2, es / 2, 2);
  gbm.fillCircle(es / 2 + 2, es / 2, 2);
  gbm.fillStyle(0x000000, 1);
  gbm.fillCircle(es / 2 - 1, es / 2, 1);
  gbm.fillCircle(es / 2 + 3, es / 2, 1);
  // Bottom glow
  gbm.fillStyle(0xff8a80, 0.5);
  gbm.fillCircle(es / 2, es / 2 + 6, 4);
  gbm.generateTexture('enemy-bomber', es, es);
  gbm.destroy();

  // Bomb (dropped by bomber)
  const gbb = scene.make.graphics({ x: 0, y: 0 }, false);
  gbb.fillStyle(0x212121, 1);
  gbb.fillCircle(6, 6, 5);
  gbb.fillStyle(0xff5252, 1);
  gbb.fillCircle(6, 6, 2);
  gbb.lineStyle(1, 0xffd700, 1);
  gbb.lineBetween(6, 1, 8, -2);
  gbb.generateTexture('bomb', 12, 12);
  gbb.destroy();

  // Elite Charger - purple rhino
  const gec = scene.make.graphics({ x: 0, y: 0 }, false);
  gec.fillStyle(0xb070e0, 1);
  gec.fillRoundedRect(es / 2 - 14, es / 2 - 8, 28, 20, 8);
  // Horn
  gec.fillStyle(0xd4a0ff, 1);
  gec.fillTriangle(es / 2 + 14, es / 2 - 4, es / 2 + 22, es / 2 - 10, es / 2 + 14, es / 2 + 6);
  // Eyes
  gec.fillStyle(0xffffff, 1);
  gec.fillCircle(es / 2 + 6, es / 2 - 4, 3);
  gec.fillStyle(0xff0000, 1);
  gec.fillCircle(es / 2 + 7, es / 2 - 4, 2);
  // Armor plates
  gec.fillStyle(0x9050c0, 1);
  gec.fillRoundedRect(es / 2 - 10, es / 2 - 2, 20, 4, 2);
  gec.generateTexture('enemy-elite_charger', es, es);
  gec.destroy();

  // Elite Fire - flame spirit
  const gef = scene.make.graphics({ x: 0, y: 0 }, false);
  gef.fillStyle(0xff6e40, 1);
  gef.fillCircle(es / 2, es / 2, 10);
  // Flame tendrils
  gef.fillStyle(0xff9e80, 0.8);
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    const tx = es / 2 + Math.cos(angle) * 12;
    const ty = es / 2 + Math.sin(angle) * 12;
    gef.fillCircle(tx, ty, 4);
  }
  // Core
  gef.fillStyle(0xffeb3b, 1);
  gef.fillCircle(es / 2, es / 2, 5);
  gef.generateTexture('enemy-elite_fire', es, es);
  gef.destroy();

  // Elite Ice - ice behemoth
  const gei = scene.make.graphics({ x: 0, y: 0 }, false);
  gei.fillStyle(0x4fc3f7, 1);
  gei.fillRoundedRect(es / 2 - 16, es / 2 - 12, 32, 28, 8);
  // Ice crystals
  gei.fillStyle(0x80d8ff, 1);
  gei.fillTriangle(es / 2 - 8, es / 2 - 12, es / 2 - 4, es / 2 - 20, es / 2, es / 2 - 12);
  gei.fillTriangle(es / 2 + 4, es / 2 - 12, es / 2 + 8, es / 2 - 22, es / 2 + 12, es / 2 - 12);
  // Eyes
  gei.fillStyle(0xffffff, 1);
  gei.fillCircle(es / 2 - 5, es / 2 - 2, 3);
  gei.fillCircle(es / 2 + 5, es / 2 - 2, 3);
  gei.fillStyle(0x00bcd4, 1);
  gei.fillCircle(es / 2 - 4, es / 2 - 2, 2);
  gei.fillCircle(es / 2 + 6, es / 2 - 2, 2);
  gei.generateTexture('enemy-elite_ice', es + 4, es + 4);
  gei.destroy();

  // Elite Shadow - shadow stalker
  const ges = scene.make.graphics({ x: 0, y: 0 }, false);
  ges.fillStyle(0x616161, 0.8);
  ges.fillCircle(es / 2, es / 2, 12);
  // Shadow tendrils
  ges.fillStyle(0x424242, 0.6);
  ges.fillRoundedRect(es / 2 - 15, es / 2 - 2, 8, 12, 4);
  ges.fillRoundedRect(es / 2 + 7, es / 2 - 2, 8, 12, 4);
  // Eyes
  ges.fillStyle(0xff1744, 1);
  ges.fillCircle(es / 2 - 4, es / 2 - 2, 3);
  ges.fillCircle(es / 2 + 4, es / 2 - 2, 3);
  ges.generateTexture('enemy-elite_shadow', es, es);
  ges.destroy();

  // Elite Crystal - crystal golem
  const gecr = scene.make.graphics({ x: 0, y: 0 }, false);
  gecr.fillStyle(0xb388ff, 1);
  // Crystal body (hexagonal shape)
  const cx = es / 2, cy = es / 2;
  const crystalPts = [
    new Phaser.Math.Vector2(cx, cy - 14),
    new Phaser.Math.Vector2(cx + 12, cy - 7),
    new Phaser.Math.Vector2(cx + 12, cy + 7),
    new Phaser.Math.Vector2(cx, cy + 14),
    new Phaser.Math.Vector2(cx - 12, cy + 7),
    new Phaser.Math.Vector2(cx - 12, cy - 7),
  ];
  gecr.fillPoints(crystalPts, true);
  // Inner glow
  gecr.fillStyle(0xd4b0ff, 0.6);
  gecr.fillCircle(cx, cy, 6);
  // Eye
  gecr.fillStyle(0xffffff, 1);
  gecr.fillCircle(cx, cy - 3, 4);
  gecr.fillStyle(0x7c4dff, 1);
  gecr.fillCircle(cx, cy - 3, 2);
  gecr.generateTexture('enemy-elite_crystal', es, es);
  gecr.destroy();

  // Mini Boss - guardian sentinel
  const gmb = scene.make.graphics({ x: 0, y: 0 }, false);
  const mbs = 48;
  // Shield ring
  gmb.lineStyle(3, 0x4fc3f7, 0.6);
  gmb.strokeCircle(mbs / 2, mbs / 2, 20);
  // Body
  gmb.fillStyle(0x4fc3f7, 1);
  gmb.fillCircle(mbs / 2, mbs / 2, 15);
  // Core
  gmb.fillStyle(0x81d4fa, 1);
  gmb.fillCircle(mbs / 2, mbs / 2, 8);
  // Eye
  gmb.fillStyle(0xff0000, 1);
  gmb.fillCircle(mbs / 2, mbs / 2, 4);
  gmb.fillStyle(0xffffff, 1);
  gmb.fillCircle(mbs / 2 + 1, mbs / 2 - 1, 2);
  gmb.generateTexture('enemy-mini_boss', mbs, mbs);
  gmb.destroy();

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

// ==================== Weapon Textures ====================
function generateWeaponTextures(scene: Phaser.Scene): void {
  // Bullet textures
  const bulletDefs: { key: string; w: number; h: number; color: number; shape: 'circle' | 'rect' | 'ellipse' }[] = [
    { key: 'bullet-pistol', w: 6, h: 6, color: 0xffeb3b, shape: 'circle' },
    { key: 'bullet-spread', w: 8, h: 5, color: 0xff9800, shape: 'ellipse' },
    { key: 'bullet-laser', w: 16, h: 4, color: 0x00e5ff, shape: 'rect' },
    { key: 'bullet-machinegun', w: 4, h: 4, color: 0xe0e0e0, shape: 'circle' },
    { key: 'bullet-fireball', w: 10, h: 10, color: 0xff5722, shape: 'circle' },
    { key: 'bullet-plasma', w: 8, h: 8, color: 0x7c4dff, shape: 'circle' },
    { key: 'bullet-quantum', w: 12, h: 4, color: 0xe040fb, shape: 'ellipse' },
    { key: 'bullet-gravity', w: 10, h: 10, color: 0x536dfe, shape: 'circle' },
    { key: 'bullet-timeslow', w: 8, h: 8, color: 0xb388ff, shape: 'circle' },
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
    { key: 'pu-weapon-plasma', color: 0x7c4dff, mark: 'Pl' },
    { key: 'pu-weapon-quantum', color: 0xe040fb, mark: 'Q' },
    { key: 'pu-weapon-gravity', color: 0x536dfe, mark: 'G' },
    { key: 'pu-weapon-timeslow', color: 0xb388ff, mark: 'T' },
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

// ==================== Pet Textures ====================
function generatePetTextures(scene: Phaser.Scene): void {
  for (const pet of PETS) {
    const s = 32;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);

    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(s / 2, s / 2 + 2, 10);

    // Element glow
    g.fillStyle(pet.color, 0.25);
    g.fillCircle(s / 2, s / 2 + 2, 14);

    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(s / 2 - 3, s / 2, 3);
    g.fillCircle(s / 2 + 3, s / 2, 3);
    g.fillStyle(pet.eyeColor, 1);
    g.fillCircle(s / 2 - 2, s / 2 + 0.5, 1.8);
    g.fillCircle(s / 2 + 4, s / 2 + 0.5, 1.8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(s / 2 - 1.5, s / 2 - 0.5, 0.7);
    g.fillCircle(s / 2 + 4.5, s / 2 - 0.5, 0.7);

    // Ears (element-specific shape)
    if (pet.element === 'electric') {
      // Pointy ears
      g.fillStyle(pet.bodyColor, 1);
      g.fillTriangle(s / 2 - 6, s / 2 - 6, s / 2 - 10, s / 2 - 16, s / 2 - 2, s / 2 - 10);
      g.fillTriangle(s / 2 + 6, s / 2 - 6, s / 2 + 10, s / 2 - 16, s / 2 + 2, s / 2 - 10);
      g.fillStyle(0x1a1a2e, 1);
      g.fillTriangle(s / 2 - 7, s / 2 - 8, s / 2 - 9, s / 2 - 14, s / 2 - 3, s / 2 - 10);
      g.fillTriangle(s / 2 + 7, s / 2 - 8, s / 2 + 9, s / 2 - 14, s / 2 + 3, s / 2 - 10);
    } else if (pet.element === 'fire') {
      // Flame ears
      g.fillStyle(0xff8a65, 1);
      g.fillTriangle(s / 2 - 6, s / 2 - 6, s / 2 - 8, s / 2 - 14, s / 2, s / 2 - 8);
      g.fillTriangle(s / 2 + 6, s / 2 - 6, s / 2 + 8, s / 2 - 14, s / 2, s / 2 - 8);
    } else if (pet.element === 'water') {
      // Round ears
      g.fillStyle(pet.bodyColor, 1);
      g.fillCircle(s / 2 - 7, s / 2 - 8, 4);
      g.fillCircle(s / 2 + 7, s / 2 - 8, 4);
    } else if (pet.element === 'grass') {
      // Leaf ears
      g.fillStyle(0x81c784, 1);
      g.fillTriangle(s / 2 - 5, s / 2 - 6, s / 2 - 10, s / 2 - 14, s / 2 + 2, s / 2 - 10);
      g.fillTriangle(s / 2 + 5, s / 2 - 6, s / 2 + 10, s / 2 - 14, s / 2 - 2, s / 2 - 10);
    } else {
      // Default round ears
      g.fillStyle(pet.bodyColor, 1);
      g.fillCircle(s / 2 - 6, s / 2 - 7, 4);
      g.fillCircle(s / 2 + 6, s / 2 - 7, 4);
    }

    // Tail (element-specific)
    g.lineStyle(2, pet.color, 0.8);
    if (pet.element === 'electric') {
      // Lightning bolt tail
      g.beginPath();
      g.moveTo(s / 2 + 8, s / 2 + 4);
      g.lineTo(s / 2 + 14, s / 2 - 2);
      g.lineTo(s / 2 + 10, s / 2 + 2);
      g.lineTo(s / 2 + 16, s / 2 - 4);
      g.stroke();
    } else if (pet.element === 'fire') {
      // Flame tail
      g.fillStyle(0xff5722, 0.8);
      g.fillTriangle(s / 2 + 8, s / 2 + 2, s / 2 + 16, s / 2 - 6, s / 2 + 12, s / 2 + 6);
      g.fillStyle(0xffab40, 0.6);
      g.fillTriangle(s / 2 + 10, s / 2 + 2, s / 2 + 14, s / 2 - 4, s / 2 + 12, s / 2 + 4);
    } else if (pet.element === 'water') {
      // Bubble tail
      g.fillStyle(0x64b5f6, 0.6);
      g.fillCircle(s / 2 + 12, s / 2 + 2, 4);
      g.fillCircle(s / 2 + 16, s / 2 - 2, 2);
    } else {
      // Default tail
      g.fillStyle(pet.bodyColor, 0.8);
      g.fillCircle(s / 2 + 10, s / 2 + 2, 4);
    }

    // Mouth
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(s / 2 - 1, s / 2 + 4, 3, 1);

    g.generateTexture(`pet-${pet.id}`, s + 8, s + 8);
    g.destroy();
  }
}
