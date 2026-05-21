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
  generateDecorTextures(scene);
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
  const mw = 600;
  const mh = 200;

  // Per-chapter mountain/terrain textures
  for (const ch of CHAPTER_DATA) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const mc = ch.mountainColor;
    if (mc === 0) { g.destroy(); continue; } // skip chapters with no mountains

    g.fillStyle(mc, 1);
    const path = new Phaser.Curves.Path(0, mh);

    switch (ch.chapter) {
      case 1: // 废弃地球 - irregular ruins silhouette
        path.lineTo(0, mh * 0.55);
        path.lineTo(mw * 0.08, mh * 0.25);
        path.lineTo(mw * 0.12, mh * 0.35);
        path.lineTo(mw * 0.2, mh * 0.15);
        path.lineTo(mw * 0.28, mh * 0.4);
        path.lineTo(mw * 0.35, mh * 0.2);
        path.lineTo(mw * 0.45, mh * 0.3);
        path.lineTo(mw * 0.55, mh * 0.1);
        path.lineTo(mw * 0.65, mh * 0.35);
        path.lineTo(mw * 0.75, mh * 0.18);
        path.lineTo(mw * 0.85, mh * 0.42);
        path.lineTo(mw * 0.95, mh * 0.25);
        path.lineTo(mw, mh * 0.5);
        break;
      case 3: // 火星 - rounded dunes
        path.lineTo(0, mh * 0.6);
        path.lineTo(mw * 0.2, mh * 0.3);
        path.lineTo(mw * 0.4, mh * 0.5);
        path.lineTo(mw * 0.6, mh * 0.25);
        path.lineTo(mw * 0.8, mh * 0.45);
        path.lineTo(mw, mh * 0.55);
        break;
      case 4: // 水银星 - metallic pillars
        path.lineTo(0, mh * 0.7);
        path.lineTo(mw * 0.1, mh * 0.7);
        path.lineTo(mw * 0.1, mh * 0.15);
        path.lineTo(mw * 0.15, mh * 0.15);
        path.lineTo(mw * 0.15, mh * 0.65);
        path.lineTo(mw * 0.35, mh * 0.65);
        path.lineTo(mw * 0.35, mh * 0.25);
        path.lineTo(mw * 0.4, mh * 0.25);
        path.lineTo(mw * 0.4, mh * 0.6);
        path.lineTo(mw * 0.6, mh * 0.6);
        path.lineTo(mw * 0.6, mh * 0.2);
        path.lineTo(mw * 0.65, mh * 0.2);
        path.lineTo(mw * 0.65, mh * 0.55);
        path.lineTo(mw * 0.85, mh * 0.55);
        path.lineTo(mw * 0.85, mh * 0.3);
        path.lineTo(mw * 0.9, mh * 0.3);
        path.lineTo(mw * 0.9, mh * 0.65);
        path.lineTo(mw, mh * 0.65);
        break;
      case 5: // 冰封星 - sharp ice peaks
        path.lineTo(0, mh * 0.65);
        path.lineTo(mw * 0.05, mh * 0.65);
        path.lineTo(mw * 0.12, mh * 0.1);
        path.lineTo(mw * 0.19, mh * 0.6);
        path.lineTo(mw * 0.28, mh * 0.6);
        path.lineTo(mw * 0.35, mh * 0.05);
        path.lineTo(mw * 0.42, mh * 0.55);
        path.lineTo(mw * 0.55, mh * 0.55);
        path.lineTo(mw * 0.62, mh * 0.15);
        path.lineTo(mw * 0.69, mh * 0.5);
        path.lineTo(mw * 0.78, mh * 0.5);
        path.lineTo(mw * 0.85, mh * 0.08);
        path.lineTo(mw * 0.92, mh * 0.55);
        path.lineTo(mw, mh * 0.55);
        break;
      case 6: // 火焰星球 - volcanoes
        path.lineTo(0, mh * 0.7);
        path.lineTo(mw * 0.05, mh * 0.65);
        path.lineTo(mw * 0.15, mh * 0.15);
        path.lineTo(mw * 0.2, mh * 0.12); // crater
        path.lineTo(mw * 0.25, mh * 0.15);
        path.lineTo(mw * 0.35, mh * 0.6);
        path.lineTo(mw * 0.55, mh * 0.55);
        path.lineTo(mw * 0.65, mh * 0.3);
        path.lineTo(mw * 0.72, mh * 0.28);
        path.lineTo(mw * 0.78, mh * 0.32);
        path.lineTo(mw * 0.85, mh * 0.5);
        path.lineTo(mw, mh * 0.6);
        break;
      case 7: // 雷电星球 - dark rolling hills
        path.lineTo(0, mh * 0.55);
        path.lineTo(mw * 0.15, mh * 0.3);
        path.lineTo(mw * 0.3, mh * 0.5);
        path.lineTo(mw * 0.45, mh * 0.2);
        path.lineTo(mw * 0.6, mh * 0.45);
        path.lineTo(mw * 0.75, mh * 0.25);
        path.lineTo(mw * 0.9, mh * 0.5);
        path.lineTo(mw, mh * 0.4);
        break;
      case 8: // 丛林星 - tree canopy
        path.lineTo(0, mh * 0.5);
        path.lineTo(mw * 0.05, mh * 0.3);
        path.lineTo(mw * 0.12, mh * 0.45);
        path.lineTo(mw * 0.18, mh * 0.2);
        path.lineTo(mw * 0.25, mh * 0.4);
        path.lineTo(mw * 0.32, mh * 0.15);
        path.lineTo(mw * 0.4, mh * 0.35);
        path.lineTo(mw * 0.48, mh * 0.1);
        path.lineTo(mw * 0.55, mh * 0.3);
        path.lineTo(mw * 0.62, mh * 0.18);
        path.lineTo(mw * 0.7, mh * 0.38);
        path.lineTo(mw * 0.78, mh * 0.12);
        path.lineTo(mw * 0.85, mh * 0.35);
        path.lineTo(mw * 0.92, mh * 0.22);
        path.lineTo(mw, mh * 0.45);
        break;
      case 9: // 晶体星 - crystal spires
        path.lineTo(0, mh * 0.7);
        path.lineTo(mw * 0.08, mh * 0.65);
        path.lineTo(mw * 0.12, mh * 0.08);
        path.lineTo(mw * 0.16, mh * 0.6);
        path.lineTo(mw * 0.3, mh * 0.6);
        path.lineTo(mw * 0.34, mh * 0.15);
        path.lineTo(mw * 0.38, mh * 0.55);
        path.lineTo(mw * 0.52, mh * 0.55);
        path.lineTo(mw * 0.55, mh * 0.05);
        path.lineTo(mw * 0.58, mh * 0.5);
        path.lineTo(mw * 0.72, mh * 0.5);
        path.lineTo(mw * 0.76, mh * 0.12);
        path.lineTo(mw * 0.8, mh * 0.55);
        path.lineTo(mw * 0.92, mh * 0.55);
        path.lineTo(mw * 0.95, mh * 0.2);
        path.lineTo(mw, mh * 0.55);
        break;
      default: // generic mountain
        path.lineTo(0, mh * 0.6);
        path.lineTo(mw * 0.15, mh * 0.2);
        path.lineTo(mw * 0.25, mh * 0.45);
        path.lineTo(mw * 0.4, mh * 0.1);
        path.lineTo(mw * 0.55, mh * 0.35);
        path.lineTo(mw * 0.7, mh * 0.15);
        path.lineTo(mw * 0.85, mh * 0.4);
        path.lineTo(mw, mh * 0.6);
        break;
    }
    path.lineTo(mw, mh);
    const points = path.getPoints(40);
    g.fillPoints(points, true);
    g.generateTexture(`bg-mountain-${ch.chapter}`, mw, mh);
    g.destroy();
  }

  // Star dot
  const g2 = scene.make.graphics({ x: 0, y: 0 }, false);
  g2.fillStyle(0xffffff, 1);
  g2.fillCircle(2, 2, 2);
  g2.generateTexture('star-dot', 4, 4);
  g2.destroy();
}

function generateDecorTextures(scene: Phaser.Scene): void {
  // Cloud (generic, tinted per-chapter at runtime)
  const cg = scene.make.graphics({ x: 0, y: 0 }, false);
  cg.fillStyle(0xffffff, 1);
  cg.fillEllipse(40, 20, 80, 30);
  cg.fillEllipse(25, 18, 50, 25);
  cg.fillEllipse(55, 18, 50, 25);
  cg.generateTexture('bg-cloud', 80, 35);
  cg.destroy();

  // Ruin building (Ch1)
  const rg = scene.make.graphics({ x: 0, y: 0 }, false);
  rg.fillStyle(0x4b5563, 1);
  rg.fillRect(5, 20, 30, 80);
  rg.fillRect(0, 0, 40, 20);
  rg.fillRect(10, 0, 20, -15); // tower
  rg.generateTexture('bg-ruin', 45, 100);
  rg.destroy();

  // Dome base (Ch2)
  const dg = scene.make.graphics({ x: 0, y: 0 }, false);
  dg.fillStyle(0x888888, 1);
  dg.fillEllipse(50, 40, 100, 60);
  dg.fillStyle(0x666666, 1);
  dg.fillRect(0, 40, 100, 30);
  dg.fillStyle(0xaaccff, 0.3);
  dg.fillEllipse(30, 35, 12, 8);
  dg.fillEllipse(50, 35, 12, 8);
  dg.fillEllipse(70, 35, 12, 8);
  dg.generateTexture('bg-dome', 100, 70);
  dg.destroy();

  // Habitat (Ch3)
  const hg = scene.make.graphics({ x: 0, y: 0 }, false);
  hg.fillStyle(0xc07040, 1);
  hg.fillRect(0, 10, 60, 40);
  hg.fillStyle(0xd08050, 1);
  hg.fillRect(0, 0, 60, 12);
  hg.fillStyle(0xffcc80, 0.5);
  hg.fillRect(8, 15, 10, 8);
  hg.fillRect(25, 15, 10, 8);
  hg.fillRect(42, 15, 10, 8);
  hg.generateTexture('bg-habitat', 60, 50);
  hg.destroy();

  // Volcano (Ch6) - simple triangle
  const vg = scene.make.graphics({ x: 0, y: 0 }, false);
  vg.fillStyle(0x3a1810, 1);
  const vPath = new Phaser.Curves.Path(0, 120);
  vPath.lineTo(40, 120);
  vPath.lineTo(60, 20);
  vPath.lineTo(80, 15); // crater rim
  vPath.lineTo(100, 20);
  vPath.lineTo(120, 120);
  vPath.lineTo(120, 120);
  vg.fillPoints(vPath.getPoints(20), true);
  // Lava glow at crater
  vg.fillStyle(0xff6020, 0.6);
  vg.fillEllipse(90, 18, 20, 8);
  vg.generateTexture('bg-volcano', 120, 120);
  vg.destroy();

  // Tree trunk (Ch8)
  const tg = scene.make.graphics({ x: 0, y: 0 }, false);
  tg.fillStyle(0x1a2a1a, 1);
  tg.fillRect(15, 30, 20, 120);
  // Canopy
  tg.fillStyle(0x2a5a2a, 0.7);
  tg.fillEllipse(25, 25, 60, 45);
  tg.fillEllipse(15, 35, 40, 35);
  tg.fillEllipse(35, 35, 40, 35);
  tg.generateTexture('bg-tree', 55, 150);
  tg.destroy();

  // Crystal pillar (Ch9)
  const cpg = scene.make.graphics({ x: 0, y: 0 }, false);
  cpg.fillStyle(0x8060c0, 0.8);
  const cpPath = new Phaser.Curves.Path(15, 100);
  cpPath.lineTo(5, 100);
  cpPath.lineTo(10, 20);
  cpPath.lineTo(15, 0);
  cpPath.lineTo(20, 20);
  cpPath.lineTo(25, 100);
  cpg.fillPoints(cpPath.getPoints(15), true);
  // Highlight
  cpg.fillStyle(0xb388ff, 0.4);
  cpg.fillEllipse(15, 30, 6, 20);
  cpg.generateTexture('bg-crystal-pillar', 30, 100);
  cpg.destroy();
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

// ==================== Pet Textures (100x100 unique designs) ====================
function generatePetTextures(scene: Phaser.Scene): void {
  for (const pet of PETS) {
    const S = 100;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);

    // Dispatch to per-pet drawing function
    const drawer = PET_DRAWERS[pet.id];
    if (drawer) {
      drawer(g, pet);
    } else {
      // Fallback: generic blob
      g.fillStyle(pet.bodyColor, 1);
      g.fillCircle(50, 55, 25);
      drawEyes(g, 50, 48, pet.eyeColor);
    }

    g.generateTexture(`pet-${pet.id}`, S, S);
    g.destroy();
  }
}

// ── Shared helpers ──
function drawEyes(g: Phaser.GameObjects.Graphics, cx: number, cy: number, eyeColor: number, size = 5): void {
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 10, cy, size + 1);
  g.fillCircle(cx + 10, cy, size + 1);
  g.fillStyle(eyeColor, 1);
  g.fillCircle(cx - 9, cy + 1, size - 1);
  g.fillCircle(cx + 11, cy + 1, size - 1);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 8, cy - 1, 1.5);
  g.fillCircle(cx + 12, cy - 1, 1.5);
}

function drawSmallEyes(g: Phaser.GameObjects.Graphics, cx: number, cy: number, eyeColor: number): void {
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 8, cy, 4);
  g.fillCircle(cx + 8, cy, 4);
  g.fillStyle(eyeColor, 1);
  g.fillCircle(cx - 7, cy + 1, 2.5);
  g.fillCircle(cx + 9, cy + 1, 2.5);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 6, cy - 1, 1);
  g.fillCircle(cx + 10, cy - 1, 1);
}

function drawMouth(g: Phaser.GameObjects.Graphics, cx: number, y: number): void {
  g.lineStyle(1.5, 0x1a1a2e, 0.8);
  g.beginPath();
  g.moveTo(cx - 4, y);
  g.lineTo(cx + 4, y);
  g.stroke();
}

function drawBlush(g: Phaser.GameObjects.Graphics, cx: number, y: number): void {
  g.fillStyle(0xff8a80, 0.3);
  g.fillCircle(cx - 16, y, 5);
  g.fillCircle(cx + 16, y, 5);
}

// ── Per-pet drawing functions ──
type PetDrawer = (g: Phaser.GameObjects.Graphics, pet: typeof PETS[number]) => void;

const PET_DRAWERS: Record<string, PetDrawer> = {
  // ═══════════════════════════════════════════
  //                 一般系 (6只)
  // ═══════════════════════════════════════════
  'pet_slime': (g, pet) => {
    // Slime: dome body with drip
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 60, 28);
    g.fillRect(22, 60, 56, 18);
    // Dome highlight
    g.fillStyle(0xffffff, 0.2);
    g.fillCircle(42, 48, 8);
    // Drip
    g.fillStyle(pet.bodyColor, 0.7);
    g.fillCircle(65, 78, 5);
    drawSmallEyes(g, 50, 55, pet.eyeColor);
    drawMouth(g, 50, 68);
  },

  'pet_bunny': (g, pet) => {
    // Bunny: long ears
    g.fillStyle(pet.bodyColor, 1);
    // Ears
    g.fillRoundedRect(35, 8, 10, 32, 5);
    g.fillRoundedRect(55, 8, 10, 32, 5);
    // Inner ears
    g.fillStyle(0xf8bbd0, 0.5);
    g.fillRoundedRect(38, 14, 4, 22, 2);
    g.fillRoundedRect(58, 14, 4, 22, 2);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 60, 24);
    // Feet
    g.fillEllipse(38, 82, 14, 8);
    g.fillEllipse(62, 82, 14, 8);
    drawEyes(g, 50, 54, pet.eyeColor, 4);
    drawBlush(g, 50, 62);
    // Nose
    g.fillStyle(0xe91e63, 0.8);
    g.fillCircle(50, 60, 2);
  },

  'pet_rock': (g, pet) => {
    // Rock: angular boulder body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 58, 28);
    // Cracks
    g.lineStyle(2, 0x5d4037, 0.5);
    g.beginPath(); g.moveTo(40, 45); g.lineTo(48, 55); g.lineTo(42, 68); g.stroke();
    g.beginPath(); g.moveTo(55, 42); g.lineTo(60, 58); g.stroke();
    // Small rocks on head
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillCircle(38, 32, 6);
    g.fillCircle(58, 30, 5);
    drawSmallEyes(g, 50, 52, pet.eyeColor);
    // Flat mouth
    g.lineStyle(2, 0x3e2723, 0.6);
    g.beginPath(); g.moveTo(42, 65); g.lineTo(58, 65); g.stroke();
  },

  'pet_fox': (g, pet) => {
    // Fox: pointy face, big ears, fluffy tail
    // Tail
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillCircle(78, 55, 12);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(82, 58, 6);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 60, 22);
    // Ears
    g.fillTriangle(32, 38, 26, 14, 42, 30);
    g.fillTriangle(68, 38, 74, 14, 58, 30);
    g.fillStyle(0x1a1a2e, 0.3);
    g.fillTriangle(34, 36, 30, 20, 40, 32);
    g.fillTriangle(66, 36, 70, 20, 60, 32);
    // Snout
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(50, 62, 10);
    // Nose
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(50, 58, 3);
    drawEyes(g, 50, 50, pet.eyeColor, 4);
  },

  'pet_eevee': (g, pet) => {
    // Eevee: fluffy collar, fox-like
    // Collar fluff
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(50, 48, 18);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 62, 22);
    // Ears
    g.fillTriangle(32, 42, 24, 16, 40, 34);
    g.fillTriangle(68, 42, 76, 16, 60, 34);
    g.fillStyle(0x1a1a2e, 0.3);
    g.fillTriangle(34, 40, 28, 22, 38, 34);
    g.fillTriangle(66, 40, 72, 22, 62, 34);
    // Tail (big fluffy)
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillCircle(76, 52, 10);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(80, 50, 5);
    drawEyes(g, 50, 56, pet.eyeColor, 4);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(50, 62, 2.5);
    drawBlush(g, 50, 64);
  },

  'pet_snorlax': (g, pet) => {
    // Snorlax: huge round body, tiny limbs
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 55, 35);
    // Belly
    g.fillStyle(0xcfd8dc, 0.5);
    g.fillCircle(50, 62, 20);
    // Arms
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(18, 58, 8);
    g.fillCircle(82, 58, 8);
    // Feet
    g.fillEllipse(36, 85, 14, 8);
    g.fillEllipse(64, 85, 14, 8);
    // Eyes (closed/sleepy)
    g.lineStyle(2, 0x1a1a2e, 0.8);
    g.beginPath(); g.moveTo(38, 46); g.lineTo(44, 48); g.stroke();
    g.beginPath(); g.moveTo(56, 48); g.lineTo(62, 46); g.stroke();
    // Mouth (happy)
    g.lineStyle(2, 0x1a1a2e, 0.6);
    g.beginPath();
    g.moveTo(42, 56);
    g.lineTo(50, 60);
    g.lineTo(58, 56);
    g.stroke();
  },

  // ═══════════════════════════════════════════
  //                 火系 (7只)
  // ═══════════════════════════════════════════
  'pet_candle': (g, pet) => {
    // Candle: wax body with flame on top
    // Wax body
    g.fillStyle(0xfff9c4, 1);
    g.fillRoundedRect(38, 45, 24, 40, 4);
    // Wax drip
    g.fillStyle(0xfff9c4, 0.7);
    g.fillCircle(40, 45, 4);
    g.fillCircle(60, 48, 3);
    // Wick
    g.lineStyle(2, 0x5d4037, 1);
    g.beginPath(); g.moveTo(50, 45); g.lineTo(50, 35); g.stroke();
    // Flame outer
    g.fillStyle(0xff9800, 0.9);
    g.fillCircle(50, 28, 10);
    g.fillTriangle(45, 28, 50, 10, 55, 28);
    // Flame inner
    g.fillStyle(0xffeb3b, 0.9);
    g.fillCircle(50, 30, 5);
    g.fillTriangle(47, 30, 50, 16, 53, 30);
    // Eyes on candle body
    drawSmallEyes(g, 50, 58, pet.eyeColor);
    drawMouth(g, 50, 66);
  },

  'pet_firedrake': (g, pet) => {
    // Salamander/lizard shape
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 55, 40, 24);
    // Head
    g.fillCircle(26, 48, 14);
    // Tail (flame)
    g.fillStyle(0xff5722, 0.9);
    g.fillTriangle(72, 52, 90, 45, 78, 60);
    g.fillStyle(0xffeb3b, 0.7);
    g.fillTriangle(76, 54, 88, 48, 80, 58);
    // Legs
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(36, 66, 6, 14, 3);
    g.fillRoundedRect(56, 66, 6, 14, 3);
    // Dorsal fins
    g.fillStyle(0xff8a65, 0.8);
    g.fillTriangle(40, 42, 44, 30, 48, 42);
    g.fillTriangle(52, 42, 56, 30, 60, 42);
    drawSmallEyes(g, 22, 44, pet.eyeColor);
    // Nostril
    g.fillStyle(0xff5722, 0.6);
    g.fillCircle(16, 50, 2);
  },

  'pet_charmander': (g, pet) => {
    // Charmander: standing lizard with tail flame
    // Tail flame
    g.fillStyle(0xff5722, 0.9);
    g.fillCircle(82, 50, 10);
    g.fillTriangle(76, 48, 90, 35, 82, 55);
    g.fillStyle(0xffeb3b, 0.8);
    g.fillCircle(82, 48, 5);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 58, 30, 28);
    // Head
    g.fillCircle(35, 40, 16);
    // Belly
    g.fillStyle(0xffcc80, 0.5);
    g.fillEllipse(50, 62, 16, 18);
    // Arms
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(24, 55, 6, 16, 3);
    // Legs
    g.fillRoundedRect(38, 74, 8, 14, 3);
    g.fillRoundedRect(54, 74, 8, 14, 3);
    // Crest
    g.fillStyle(0xff5722, 0.7);
    g.fillTriangle(30, 28, 34, 16, 38, 28);
    drawEyes(g, 32, 36, pet.eyeColor, 4);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(30, 44, 2);
  },

  'pet_charmeleon': (g, pet) => {
    // Charmeleon: more aggressive lizard
    // Tail flame (bigger)
    g.fillStyle(0xff3d00, 0.9);
    g.fillCircle(84, 42, 12);
    g.fillTriangle(78, 40, 94, 28, 86, 50);
    g.fillStyle(0xffeb3b, 0.7);
    g.fillCircle(84, 40, 6);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 56, 32, 30);
    // Head (angular)
    g.fillCircle(32, 38, 16);
    // Jaw
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillEllipse(24, 44, 14, 8);
    // Belly
    g.fillStyle(0xffab91, 0.4);
    g.fillEllipse(50, 60, 18, 20);
    // Arms with claws
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(22, 52, 6, 16, 3);
    g.fillStyle(0xffffff, 0.8);
    g.fillTriangle(20, 68, 22, 64, 24, 68);
    // Legs
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(38, 74, 8, 14, 3);
    g.fillRoundedRect(54, 74, 8, 14, 3);
    // Crest (larger)
    g.fillStyle(0xff3d00, 0.8);
    g.fillTriangle(28, 26, 34, 10, 40, 24);
    drawEyes(g, 30, 34, pet.eyeColor, 4);
    // Angry brow
    g.lineStyle(2, 0x1a1a2e, 0.8);
    g.beginPath(); g.moveTo(22, 30); g.lineTo(30, 32); g.stroke();
    g.beginPath(); g.moveTo(38, 32); g.lineTo(34, 30); g.stroke();
  },

  'pet_charizard': (g, pet) => {
    // Charizard: dragon with wings
    // Wings
    g.fillStyle(0x1565c0, 0.6);
    g.fillTriangle(55, 35, 88, 15, 75, 50);
    g.fillTriangle(60, 38, 90, 22, 78, 52);
    // Tail flame
    g.fillStyle(0xff5722, 0.9);
    g.fillCircle(85, 55, 10);
    g.fillStyle(0xffeb3b, 0.7);
    g.fillCircle(85, 53, 5);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(48, 58, 34, 30);
    // Head
    g.fillCircle(30, 38, 16);
    // Horns
    g.fillStyle(0xffcc80, 0.9);
    g.fillTriangle(24, 26, 20, 14, 30, 24);
    g.fillTriangle(34, 24, 38, 12, 38, 24);
    // Belly
    g.fillStyle(0xffcc80, 0.5);
    g.fillEllipse(48, 64, 20, 20);
    // Arms
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(20, 52, 6, 16, 3);
    // Legs
    g.fillRoundedRect(36, 76, 8, 14, 3);
    g.fillRoundedRect(54, 76, 8, 14, 3);
    drawEyes(g, 28, 34, pet.eyeColor, 4);
    // Mouth (open, fire)
    g.fillStyle(0xff5722, 0.6);
    g.fillEllipse(20, 42, 10, 6);
  },

  'pet_flareon': (g, pet) => {
    // Flareon: fluffy fox with flame mane
    // Mane (fluffy fire)
    g.fillStyle(0xff5722, 0.6);
    g.fillCircle(50, 42, 22);
    g.fillCircle(36, 48, 12);
    g.fillCircle(64, 48, 12);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 60, 22);
    // Ears
    g.fillTriangle(32, 40, 26, 18, 40, 34);
    g.fillTriangle(68, 40, 74, 18, 60, 34);
    // Tail (fluffy flame)
    g.fillStyle(0xff5722, 0.8);
    g.fillCircle(78, 55, 10);
    g.fillStyle(0xffeb3b, 0.5);
    g.fillCircle(80, 52, 5);
    // Feet
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(38, 80, 12, 6);
    g.fillEllipse(62, 80, 12, 6);
    drawEyes(g, 50, 54, pet.eyeColor, 4);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(50, 60, 2.5);
  },

  'pet_moltres': (g, pet) => {
    // Moltres: phoenix with spread wings
    // Wings (fire)
    g.fillStyle(0xff6d00, 0.7);
    g.fillTriangle(48, 40, 10, 20, 30, 55);
    g.fillTriangle(52, 40, 90, 20, 70, 55);
    g.fillStyle(0xffab40, 0.5);
    g.fillTriangle(48, 42, 15, 25, 32, 52);
    g.fillTriangle(52, 42, 85, 25, 68, 52);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 55, 20, 30);
    // Head
    g.fillCircle(50, 30, 12);
    // Crest (flame)
    g.fillStyle(0xff5722, 0.9);
    g.fillTriangle(44, 22, 50, 6, 56, 22);
    g.fillStyle(0xffeb3b, 0.6);
    g.fillTriangle(46, 20, 50, 10, 54, 20);
    // Tail (long flames)
    g.fillStyle(0xff6d00, 0.8);
    g.fillTriangle(44, 72, 50, 92, 56, 72);
    g.fillStyle(0xffab40, 0.6);
    g.fillTriangle(46, 74, 50, 88, 54, 74);
    drawSmallEyes(g, 50, 28, pet.eyeColor);
  },

  // ═══════════════════════════════════════════
  //                 水系 (7只)
  // ═══════════════════════════════════════════
  'pet_bubble': (g, pet) => {
    // Bubble fish: round transparent body with fins
    // Bubbles around
    g.fillStyle(0x90caf9, 0.3);
    g.fillCircle(72, 35, 6);
    g.fillCircle(80, 48, 4);
    g.fillCircle(26, 38, 5);
    // Body
    g.fillStyle(pet.bodyColor, 0.7);
    g.fillCircle(50, 55, 26);
    // Inner glow
    g.fillStyle(0xffffff, 0.15);
    g.fillCircle(44, 48, 10);
    // Fins
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillTriangle(24, 50, 14, 40, 18, 58);
    g.fillTriangle(76, 50, 86, 40, 82, 58);
    // Top fin
    g.fillTriangle(44, 30, 50, 18, 56, 30);
    // Tail fin
    g.fillTriangle(72, 52, 86, 42, 86, 62);
    drawEyes(g, 50, 50, pet.eyeColor, 5);
    // Mouth (bubble)
    g.fillStyle(0x64b5f6, 0.5);
    g.fillCircle(50, 62, 4);
  },

  'pet_crab': (g, pet) => {
    // Crab: body with big claws
    // Claws
    g.fillStyle(0xe53935, 1);
    g.fillCircle(18, 50, 12);
    g.fillCircle(82, 50, 12);
    // Claw pincers
    g.fillStyle(0xef5350, 1);
    g.fillEllipse(8, 48, 12, 6);
    g.fillEllipse(92, 48, 12, 6);
    // Body
    g.fillStyle(0xe53935, 1);
    g.fillEllipse(50, 55, 36, 28);
    // Shell pattern
    g.fillStyle(0xc62828, 0.4);
    g.fillEllipse(50, 52, 20, 14);
    // Legs
    g.fillStyle(0xef5350, 1);
    g.fillRoundedRect(30, 70, 4, 12, 2);
    g.fillRoundedRect(40, 72, 4, 12, 2);
    g.fillRoundedRect(56, 72, 4, 12, 2);
    g.fillRoundedRect(66, 70, 4, 12, 2);
    // Eye stalks
    g.lineStyle(3, 0xe53935, 1);
    g.beginPath(); g.moveTo(42, 42); g.lineTo(38, 30); g.stroke();
    g.beginPath(); g.moveTo(58, 42); g.lineTo(62, 30); g.stroke();
    drawSmallEyes(g, 38, 28, pet.eyeColor);
    drawSmallEyes(g, 62, 28, pet.eyeColor);
  },

  'pet_squirtle': (g, pet) => {
    // Squirtle: turtle with shell
    // Shell
    g.fillStyle(0x795548, 0.8);
    g.fillEllipse(50, 58, 34, 28);
    g.fillStyle(0x4caf50, 0.3);
    g.fillEllipse(50, 56, 24, 18);
    // Shell pattern
    g.lineStyle(1.5, 0x5d4037, 0.5);
    g.beginPath(); g.moveTo(50, 42); g.lineTo(50, 72); g.stroke();
    g.beginPath(); g.moveTo(34, 56); g.lineTo(66, 56); g.stroke();
    // Head
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 36, 16);
    // Tail
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillTriangle(50, 72, 44, 82, 56, 82);
    // Arms
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(28, 52, 8, 12, 4);
    g.fillRoundedRect(64, 52, 8, 12, 4);
    // Legs
    g.fillRoundedRect(34, 72, 10, 10, 4);
    g.fillRoundedRect(56, 72, 10, 10, 4);
    // Belly
    g.fillStyle(0xffcc80, 0.4);
    g.fillEllipse(50, 64, 14, 12);
    drawEyes(g, 50, 32, pet.eyeColor, 4);
    drawMouth(g, 50, 42);
  },

  'pet_wartortle': (g, pet) => {
    // Wartortle: bigger turtle with fluffy tail
    // Shell
    g.fillStyle(0x795548, 0.8);
    g.fillEllipse(50, 56, 36, 30);
    g.fillStyle(0x2196f3, 0.2);
    g.fillEllipse(50, 54, 26, 20);
    // Head
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 34, 17);
    // Ears (fur tufts)
    g.fillTriangle(34, 28, 26, 14, 38, 24);
    g.fillTriangle(66, 28, 74, 14, 62, 24);
    // Tail (fluffy)
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillCircle(50, 82, 10);
    g.fillStyle(0x90caf9, 0.5);
    g.fillCircle(50, 80, 5);
    // Arms & legs
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(26, 50, 8, 14, 4);
    g.fillRoundedRect(66, 50, 8, 14, 4);
    g.fillRoundedRect(32, 74, 12, 10, 4);
    g.fillRoundedRect(56, 74, 12, 10, 4);
    drawEyes(g, 50, 30, pet.eyeColor, 4);
    drawMouth(g, 50, 40);
  },

  'pet_blastoise': (g, pet) => {
    // Blastoise: turtle with water cannons
    // Cannons
    g.fillStyle(0x78909c, 1);
    g.fillRoundedRect(22, 30, 10, 20, 3);
    g.fillRoundedRect(68, 30, 10, 20, 3);
    g.fillStyle(0x42a5f5, 0.7);
    g.fillCircle(27, 30, 4);
    g.fillCircle(73, 30, 4);
    // Shell
    g.fillStyle(0x795548, 0.8);
    g.fillEllipse(50, 56, 40, 32);
    g.fillStyle(0x1565c0, 0.2);
    g.fillEllipse(50, 54, 30, 22);
    // Head
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 32, 16);
    // Arms & legs (thick)
    g.fillRoundedRect(22, 50, 10, 16, 4);
    g.fillRoundedRect(68, 50, 10, 16, 4);
    g.fillRoundedRect(30, 76, 14, 12, 4);
    g.fillRoundedRect(56, 76, 14, 12, 4);
    drawEyes(g, 50, 28, pet.eyeColor, 4);
    // Determined mouth
    g.lineStyle(2, 0x1a1a2e, 0.8);
    g.beginPath(); g.moveTo(42, 38); g.lineTo(58, 38); g.stroke();
  },

  'pet_vaporeon': (g, pet) => {
    // Vaporeon: sleek aquatic fox
    // Tail fin
    g.fillStyle(0x00bcd4, 0.7);
    g.fillTriangle(76, 52, 92, 40, 92, 64);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 58, 30, 26);
    // Head
    g.fillCircle(34, 42, 15);
    // Ears (fin-like)
    g.fillTriangle(26, 32, 18, 14, 34, 28);
    g.fillTriangle(42, 30, 46, 12, 46, 28);
    // Collar fin
    g.fillStyle(0x80deea, 0.5);
    g.fillTriangle(28, 44, 34, 34, 40, 44);
    // Belly
    g.fillStyle(0xb2ebf2, 0.4);
    g.fillEllipse(50, 64, 16, 14);
    // Legs
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(36, 74, 8, 14, 3);
    g.fillRoundedRect(56, 74, 8, 14, 3);
    drawEyes(g, 32, 38, pet.eyeColor, 4);
    drawMouth(g, 34, 48);
  },

  'pet_articuno': (g, pet) => {
    // Articuno: ice bird with crystal wings
    // Wings (ice crystals)
    g.fillStyle(0x4fc3f7, 0.5);
    g.fillTriangle(48, 40, 10, 25, 30, 55);
    g.fillTriangle(52, 40, 90, 25, 70, 55);
    g.fillStyle(0xb3e5fc, 0.3);
    g.fillTriangle(48, 42, 18, 30, 32, 52);
    g.fillTriangle(52, 42, 82, 30, 68, 52);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 55, 18, 28);
    // Head
    g.fillCircle(50, 32, 12);
    // Tail feathers
    g.fillStyle(0x4fc3f7, 0.6);
    g.fillTriangle(44, 72, 50, 90, 56, 72);
    g.fillTriangle(40, 70, 46, 88, 52, 70);
    // Crest
    g.fillStyle(0x81d4fa, 0.7);
    g.fillTriangle(46, 22, 50, 10, 54, 22);
    drawSmallEyes(g, 50, 30, pet.eyeColor);
  },

  // ═══════════════════════════════════════════
  //                 草系 (6只)
  // ═══════════════════════════════════════════
  'pet_seed': (g, pet) => {
    // Seed: round seed body with sprout on top
    // Sprout
    g.fillStyle(0x4caf50, 0.9);
    g.fillRoundedRect(48, 20, 4, 18, 2);
    // Leaves
    g.fillEllipse(42, 20, 12, 6);
    g.fillEllipse(58, 20, 12, 6);
    // Body (seed)
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 55, 24);
    // Seed pattern
    g.fillStyle(0x66bb6a, 0.3);
    g.beginPath();
    g.moveTo(50, 35);
    g.lineTo(38, 55);
    g.lineTo(50, 75);
    g.lineTo(62, 55);
    g.closePath();
    g.fill();
    // Root legs
    g.fillStyle(0x795548, 0.6);
    g.fillRoundedRect(38, 76, 6, 12, 3);
    g.fillRoundedRect(56, 76, 6, 12, 3);
    drawSmallEyes(g, 50, 50, pet.eyeColor);
    drawMouth(g, 50, 60);
  },

  'pet_mushroom': (g, pet) => {
    // Mushroom: cap and stem
    // Spore particles
    g.fillStyle(0xce93d8, 0.3);
    g.fillCircle(30, 35, 3);
    g.fillCircle(70, 38, 3);
    g.fillCircle(35, 25, 2);
    // Cap
    g.fillStyle(0xe53935, 0.9);
    g.fillCircle(50, 38, 28);
    g.fillRect(22, 38, 56, 8);
    // Cap spots
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(40, 28, 6);
    g.fillCircle(58, 32, 5);
    g.fillCircle(48, 22, 4);
    // Stem
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(38, 46, 24, 32, 8);
    // Gills
    g.lineStyle(1, 0xd7ccc8, 0.4);
    for (let i = 0; i < 5; i++) {
      g.beginPath(); g.moveTo(38 + i * 6, 46); g.lineTo(38 + i * 6, 52); g.stroke();
    }
    drawSmallEyes(g, 50, 56, pet.eyeColor);
    drawMouth(g, 50, 66);
  },

  'pet_bulbasaur': (g, pet) => {
    // Bulbasaur: with bulb on back
    // Bulb
    g.fillStyle(0x4caf50, 0.8);
    g.fillCircle(52, 32, 18);
    g.fillStyle(0x2e7d32, 0.4);
    g.fillCircle(52, 28, 10);
    // Spots on bulb
    g.fillStyle(0x81c784, 0.5);
    g.fillCircle(46, 26, 3);
    g.fillCircle(58, 30, 3);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 58, 36, 28);
    // Head
    g.fillCircle(34, 44, 16);
    // Ears
    g.fillTriangle(24, 36, 18, 22, 30, 32);
    g.fillTriangle(44, 34, 46, 20, 42, 32);
    // Legs (short, thick)
    g.fillRoundedRect(32, 72, 12, 12, 4);
    g.fillRoundedRect(56, 72, 12, 12, 4);
    // Spots on body
    g.fillStyle(0x2e7d32, 0.3);
    g.fillCircle(44, 56, 4);
    g.fillCircle(58, 60, 3);
    drawEyes(g, 32, 40, pet.eyeColor, 4);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(28, 48, 2);
  },

  'pet_ivysaur': (g, pet) => {
    // Ivysaur: larger with flower bud
    // Bud
    g.fillStyle(0xe91e63, 0.7);
    g.fillCircle(52, 26, 14);
    g.fillStyle(0x4caf50, 0.8);
    g.fillCircle(52, 22, 8);
    // Vine
    g.lineStyle(3, 0x4caf50, 0.7);
    g.beginPath(); g.moveTo(52, 38); g.lineTo(56, 32); g.lineTo(52, 26); g.stroke();
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 56, 38, 30);
    // Head
    g.fillCircle(32, 42, 16);
    // Ears
    g.fillTriangle(22, 34, 16, 20, 28, 30);
    g.fillTriangle(42, 32, 44, 18, 40, 30);
    // Legs
    g.fillRoundedRect(30, 72, 14, 12, 4);
    g.fillRoundedRect(56, 72, 14, 12, 4);
    drawEyes(g, 30, 38, pet.eyeColor, 4);
    drawMouth(g, 30, 48);
  },

  'pet_venusaur': (g, pet) => {
    // Venusaur: large with giant flower
    // Flower petals
    g.fillStyle(0xe91e63, 0.6);
    g.fillCircle(50, 18, 10);
    g.fillCircle(38, 24, 10);
    g.fillCircle(62, 24, 10);
    g.fillCircle(42, 14, 8);
    g.fillCircle(58, 14, 8);
    // Flower center
    g.fillStyle(0xffeb3b, 0.8);
    g.fillCircle(50, 20, 8);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 55, 42, 32);
    // Head
    g.fillCircle(30, 44, 16);
    // Ears
    g.fillTriangle(20, 36, 14, 22, 26, 32);
    g.fillTriangle(40, 34, 42, 20, 38, 32);
    // Legs (thick)
    g.fillRoundedRect(26, 72, 16, 14, 5);
    g.fillRoundedRect(58, 72, 16, 14, 5);
    // Spots
    g.fillStyle(0x2e7d32, 0.3);
    g.fillCircle(42, 52, 5);
    g.fillCircle(60, 56, 4);
    drawEyes(g, 28, 40, pet.eyeColor, 4);
    drawMouth(g, 28, 50);
  },

  'pet_celebi': (g, pet) => {
    // Celebi: fairy-like with onion head
    // Onion head
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillCircle(50, 24, 14);
    g.fillStyle(0x4caf50, 0.6);
    g.fillTriangle(44, 14, 50, 2, 56, 14);
    // Wings
    g.fillStyle(0xc8e6c9, 0.4);
    g.fillEllipse(30, 42, 14, 20);
    g.fillEllipse(70, 42, 14, 20);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 55, 18, 24);
    // Arms
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillRoundedRect(30, 48, 8, 14, 4);
    g.fillRoundedRect(62, 48, 8, 14, 4);
    // Legs
    g.fillRoundedRect(40, 72, 8, 14, 4);
    g.fillRoundedRect(52, 72, 8, 14, 4);
    // Antennae
    g.lineStyle(1.5, 0x81c784, 0.7);
    g.beginPath(); g.moveTo(44, 14); g.lineTo(38, 6); g.lineTo(32, 8); g.stroke();
    g.beginPath(); g.moveTo(56, 14); g.lineTo(62, 6); g.lineTo(68, 8); g.stroke();
    g.fillStyle(0x81c784, 0.8);
    g.fillCircle(32, 8, 3);
    g.fillCircle(68, 8, 3);
    drawSmallEyes(g, 50, 22, pet.eyeColor);
  },

  // ═══════════════════════════════════════════
  //                 电系 (6只)
  // ═══════════════════════════════════════════
  'pet_spark': (g, pet) => {
    // Spark: small electric orb with sparks
    // Spark lines
    g.lineStyle(2, 0xffeb3b, 0.7);
    g.beginPath(); g.moveTo(28, 40); g.lineTo(18, 34); g.stroke();
    g.beginPath(); g.moveTo(72, 40); g.lineTo(82, 34); g.stroke();
    g.beginPath(); g.moveTo(50, 26); g.lineTo(50, 16); g.stroke();
    g.beginPath(); g.moveTo(36, 30); g.lineTo(28, 22); g.stroke();
    g.beginPath(); g.moveTo(64, 30); g.lineTo(72, 22); g.stroke();
    // Body (glowing orb)
    g.fillStyle(0xfff9c4, 0.4);
    g.fillCircle(50, 48, 22);
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillCircle(50, 48, 16);
    // Core
    g.fillStyle(0xffeb3b, 0.8);
    g.fillCircle(50, 48, 8);
    // Eyes
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(44, 46, 3);
    g.fillCircle(56, 46, 3);
    // Mouth (zap)
    g.lineStyle(1.5, 0x1a1a2e, 0.7);
    g.beginPath(); g.moveTo(46, 54); g.lineTo(50, 52); g.lineTo(54, 54); g.stroke();
  },

  'pet_pikachu': (g, pet) => {
    // Pikachu: iconic electric mouse
    // Ears
    g.fillStyle(pet.bodyColor, 1);
    g.fillTriangle(32, 36, 22, 8, 40, 28);
    g.fillTriangle(68, 36, 78, 8, 60, 28);
    // Black ear tips
    g.fillStyle(0x1a1a2e, 0.8);
    g.fillTriangle(30, 16, 22, 8, 36, 20);
    g.fillTriangle(70, 16, 78, 8, 64, 20);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 55, 32, 30);
    // Head
    g.fillCircle(50, 38, 18);
    // Cheeks
    g.fillStyle(0xe53935, 0.7);
    g.fillCircle(32, 46, 6);
    g.fillCircle(68, 46, 6);
    // Tail (lightning bolt)
    g.fillStyle(0xffeb3b, 0.9);
    g.fillTriangle(72, 52, 88, 42, 78, 58);
    g.fillTriangle(78, 48, 92, 36, 86, 52);
    // Arms
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(26, 52, 8, 10, 4);
    g.fillRoundedRect(66, 52, 8, 10, 4);
    // Feet
    g.fillRoundedRect(36, 76, 10, 8, 4);
    g.fillRoundedRect(54, 76, 10, 8, 4);
    drawEyes(g, 50, 34, pet.eyeColor, 4);
    // Nose
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(50, 40, 2);
    // Mouth
    g.beginPath();
    g.moveTo(46, 44);
    g.lineTo(50, 46);
    g.lineTo(54, 44);
    g.stroke();
  },

  'pet_raichu': (g, pet) => {
    // Raichu: evolved Pikachu, orange with long tail
    // Ears
    g.fillStyle(pet.bodyColor, 1);
    g.fillTriangle(30, 34, 18, 6, 38, 26);
    g.fillTriangle(70, 34, 82, 6, 62, 26);
    // Body
    g.fillEllipse(50, 55, 34, 32);
    // Head
    g.fillCircle(50, 36, 18);
    // Cheeks (bigger)
    g.fillStyle(0xe53935, 0.7);
    g.fillCircle(30, 44, 7);
    g.fillCircle(70, 44, 7);
    // Tail (long, flat)
    g.fillStyle(0xffcc80, 0.9);
    g.fillEllipse(82, 52, 16, 6);
    g.fillTriangle(88, 50, 96, 44, 96, 56);
    // Arms & legs
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(24, 52, 8, 12, 4);
    g.fillRoundedRect(68, 52, 8, 12, 4);
    g.fillRoundedRect(34, 78, 12, 8, 4);
    g.fillRoundedRect(54, 78, 12, 8, 4);
    drawEyes(g, 50, 32, pet.eyeColor, 4);
    drawMouth(g, 50, 42);
  },

  'pet_magnemite': (g, pet) => {
    // Magnemite: floating magnet with screws
    // Magnet arms (U-shape)
    g.fillStyle(0x78909c, 1);
    g.fillRoundedRect(16, 36, 12, 28, 4);
    g.fillRoundedRect(72, 36, 12, 28, 4);
    // Magnet tips (red/blue)
    g.fillStyle(0xe53935, 1);
    g.fillCircle(22, 36, 6);
    g.fillCircle(78, 36, 6);
    g.fillStyle(0x1565c0, 1);
    g.fillCircle(22, 64, 6);
    g.fillCircle(78, 64, 6);
    // Body (sphere)
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 50, 20);
    // Metallic highlight
    g.fillStyle(0xffffff, 0.2);
    g.fillCircle(44, 44, 8);
    // Eye (single, big)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(50, 48, 10);
    g.fillStyle(pet.eyeColor, 1);
    g.fillCircle(50, 48, 6);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(48, 46, 2);
    // Screws
    g.fillStyle(0x90a4ae, 1);
    g.fillCircle(38, 58, 3);
    g.fillCircle(62, 58, 3);
    g.lineStyle(1, 0x546e7a, 0.8);
    g.beginPath(); g.moveTo(36, 58); g.lineTo(40, 58); g.stroke();
    g.beginPath(); g.moveTo(38, 56); g.lineTo(38, 60); g.stroke();
    g.beginPath(); g.moveTo(60, 58); g.lineTo(64, 58); g.stroke();
    g.beginPath(); g.moveTo(62, 56); g.lineTo(62, 60); g.stroke();
    // Floating bolts
    g.fillStyle(0x90a4ae, 0.5);
    g.fillCircle(30, 76, 3);
    g.fillCircle(70, 78, 3);
  },

  'pet_jolteon': (g, pet) => {
    // Jolteon: spiky electric fox
    // Spikes (all around)
    g.fillStyle(pet.bodyColor, 1);
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2 - Math.PI / 2;
      const x1 = 50 + Math.cos(angle) * 20;
      const y1 = 50 + Math.sin(angle) * 20;
      const x2 = 50 + Math.cos(angle) * 34;
      const y2 = 50 + Math.sin(angle) * 34;
      g.fillTriangle(
        x1 + Math.cos(angle + 0.3) * 4, y1 + Math.sin(angle + 0.3) * 4,
        x2, y2,
        x1 + Math.cos(angle - 0.3) * 4, y1 + Math.sin(angle - 0.3) * 4,
      );
    }
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 52, 18);
    // Head
    g.fillCircle(50, 38, 14);
    // Ears (spiky)
    g.fillTriangle(38, 30, 30, 10, 42, 26);
    g.fillTriangle(62, 30, 70, 10, 58, 26);
    // Legs
    g.fillRoundedRect(38, 66, 8, 14, 3);
    g.fillRoundedRect(54, 66, 8, 14, 3);
    drawEyes(g, 50, 34, pet.eyeColor, 4);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(50, 42, 2);
  },

  'pet_zapdos': (g, pet) => {
    // Zapdos: legendary lightning bird
    // Wings (electric bolts)
    g.fillStyle(0xffd600, 0.6);
    g.fillTriangle(48, 38, 8, 20, 28, 55);
    g.fillTriangle(52, 38, 92, 20, 72, 55);
    // Lightning wing edges
    g.fillStyle(0xffeb3b, 0.4);
    g.fillTriangle(46, 40, 12, 28, 26, 50);
    g.fillTriangle(54, 40, 88, 28, 74, 50);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 52, 18, 26);
    // Head
    g.fillCircle(50, 30, 12);
    // Crest (spiky)
    g.fillStyle(0xffd600, 0.8);
    g.fillTriangle(44, 22, 38, 8, 48, 20);
    g.fillTriangle(50, 20, 50, 4, 54, 20);
    g.fillTriangle(56, 22, 62, 8, 52, 20);
    // Tail (long feathers)
    g.fillStyle(0xffd600, 0.7);
    g.fillTriangle(42, 68, 36, 88, 50, 70);
    g.fillTriangle(50, 70, 50, 90, 58, 70);
    g.fillTriangle(58, 68, 64, 88, 50, 70);
    drawSmallEyes(g, 50, 28, pet.eyeColor);
  },

  // ═══════════════════════════════════════════
  //                 冰系 (6只)
  // ═══════════════════════════════════════════
  'pet_snowman': (g, _pet) => {
    // Snowman: three snowballs
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(50, 72, 22);
    g.fillCircle(50, 48, 16);
    g.fillCircle(50, 28, 12);
    // Eyes
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(44, 24, 3);
    g.fillCircle(56, 24, 3);
    // Carrot nose
    g.fillStyle(0xff9800, 1);
    g.fillTriangle(50, 28, 50, 30, 62, 30);
    // Buttons
    g.fillCircle(50, 46, 2.5);
    g.fillCircle(50, 54, 2.5);
    g.fillCircle(50, 62, 2.5);
    // Hat
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(38, 14, 24, 4);
    g.fillRoundedRect(42, 2, 16, 14, 2);
    // Scarf
    g.fillStyle(0xe53935, 0.8);
    g.fillRect(38, 36, 24, 4);
    g.fillRect(58, 36, 4, 14);
    // Arms
    g.lineStyle(2, 0x795548, 0.8);
    g.beginPath(); g.moveTo(34, 48); g.lineTo(18, 38); g.stroke();
    g.beginPath(); g.moveTo(66, 48); g.lineTo(82, 38); g.stroke();
  },

  'pet_seal': (g, pet) => {
    // Seal: round body with flippers
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 55, 40, 30);
    // Head
    g.fillCircle(50, 34, 18);
    // Flippers
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillTriangle(22, 52, 10, 60, 26, 64);
    g.fillTriangle(78, 52, 90, 60, 74, 64);
    // Tail
    g.fillTriangle(42, 74, 50, 86, 58, 74);
    // Belly
    g.fillStyle(0xbbdefb, 0.4);
    g.fillEllipse(50, 60, 24, 16);
    // Whiskers
    g.lineStyle(1, 0x1a1a2e, 0.5);
    g.beginPath(); g.moveTo(40, 40); g.lineTo(26, 38); g.stroke();
    g.beginPath(); g.moveTo(40, 42); g.lineTo(26, 42); g.stroke();
    g.beginPath(); g.moveTo(60, 40); g.lineTo(74, 38); g.stroke();
    g.beginPath(); g.moveTo(60, 42); g.lineTo(74, 42); g.stroke();
    drawEyes(g, 50, 30, pet.eyeColor, 5);
    // Nose
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(50, 38, 3);
  },

  'pet_cubchoo': (g, pet) => {
    // Cubchoo: small bear with runny nose
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 56, 26);
    // Ears
    g.fillCircle(32, 28, 10);
    g.fillCircle(68, 28, 10);
    g.fillStyle(0x1a1a2e, 0.2);
    g.fillCircle(32, 28, 5);
    g.fillCircle(68, 28, 5);
    // Arms
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(22, 50, 10, 16, 5);
    g.fillRoundedRect(68, 50, 10, 16, 5);
    // Feet
    g.fillEllipse(38, 78, 14, 8);
    g.fillEllipse(62, 78, 14, 8);
    // Belly
    g.fillStyle(0xe3f2fd, 0.4);
    g.fillCircle(50, 60, 14);
    // Face
    drawEyes(g, 50, 46, pet.eyeColor, 4);
    // Nose
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(50, 54, 3);
    // Runny nose (drool)
    g.fillStyle(0x90caf9, 0.6);
    g.fillCircle(50, 60, 3);
    g.fillEllipse(50, 66, 2, 6);
  },

  'pet_glalie': (g, pet) => {
    // Glalie: floating ice sphere with face
    // Ice spikes
    g.fillStyle(0xb0bec5, 0.7);
    g.fillTriangle(50, 8, 44, 20, 56, 20);
    g.fillTriangle(22, 24, 30, 34, 24, 34);
    g.fillTriangle(78, 24, 70, 34, 76, 34);
    g.fillTriangle(28, 68, 36, 60, 30, 60);
    g.fillTriangle(72, 68, 64, 60, 70, 60);
    // Body (dark sphere)
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 44, 28);
    // Ice shell
    g.fillStyle(0xcfd8dc, 0.3);
    g.fillCircle(50, 42, 22);
    // Face crack
    g.lineStyle(2, 0x455a64, 0.5);
    g.beginPath(); g.moveTo(50, 30); g.lineTo(48, 44); g.lineTo(52, 56); g.stroke();
    // Eyes (menacing)
    g.fillStyle(0xc62828, 0.9);
    g.fillEllipse(40, 40, 8, 5);
    g.fillEllipse(60, 40, 8, 5);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(40, 40, 3);
    g.fillCircle(60, 40, 3);
    // Mouth (jagged)
    g.lineStyle(2, 0x37474f, 0.8);
    g.beginPath();
    g.moveTo(38, 52);
    g.lineTo(42, 48);
    g.lineTo(46, 52);
    g.lineTo(50, 48);
    g.lineTo(54, 52);
    g.lineTo(58, 48);
    g.lineTo(62, 52);
    g.stroke();
  },

  'pet_frosmoth': (g, pet) => {
    // Frosmoth: moth with ice crystal wings
    // Wings (ice crystals)
    g.fillStyle(0xb3e5fc, 0.5);
    g.fillEllipse(30, 44, 24, 36);
    g.fillEllipse(70, 44, 24, 36);
    // Wing patterns
    g.fillStyle(0xe1f5fe, 0.3);
    g.fillCircle(28, 38, 6);
    g.fillCircle(32, 52, 5);
    g.fillCircle(72, 38, 6);
    g.fillCircle(68, 52, 5);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 55, 16, 28);
    // Head
    g.fillCircle(50, 32, 10);
    // Antennae
    g.lineStyle(1.5, 0xb3e5fc, 0.7);
    g.beginPath(); g.moveTo(44, 24); g.lineTo(38, 16); g.lineTo(30, 16); g.stroke();
    g.beginPath(); g.moveTo(56, 24); g.lineTo(62, 16); g.lineTo(70, 16); g.stroke();
    g.fillStyle(0xe1f5fe, 0.8);
    g.fillCircle(30, 16, 3);
    g.fillCircle(70, 16, 3);
    // Legs
    g.lineStyle(1.5, 0x90caf9, 0.5);
    g.beginPath(); g.moveTo(44, 68); g.lineTo(38, 80); g.stroke();
    g.beginPath(); g.moveTo(50, 70); g.lineTo(50, 82); g.stroke();
    g.beginPath(); g.moveTo(56, 68); g.lineTo(62, 80); g.stroke();
    // Ice dust
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(20, 64, 3);
    g.fillCircle(80, 60, 3);
    g.fillCircle(36, 74, 2);
    drawSmallEyes(g, 50, 30, pet.eyeColor);
  },

  'pet_articuno2': (g, pet) => {
    // Ice Phoenix: elegant ice bird
    // Wings (wide, ice crystal)
    g.fillStyle(0x4fc3f7, 0.5);
    g.fillTriangle(48, 38, 4, 18, 26, 56);
    g.fillTriangle(52, 38, 96, 18, 74, 56);
    g.fillStyle(0xb3e5fc, 0.3);
    g.fillTriangle(48, 40, 10, 24, 28, 52);
    g.fillTriangle(52, 40, 90, 24, 72, 52);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 52, 18, 28);
    // Head
    g.fillCircle(50, 30, 12);
    // Crown
    g.fillStyle(0x4fc3f7, 0.9);
    g.fillTriangle(44, 22, 50, 8, 56, 22);
    g.fillStyle(0xe1f5fe, 0.6);
    g.fillTriangle(46, 20, 50, 12, 54, 20);
    // Tail (ice streamers)
    g.fillStyle(0x4fc3f7, 0.6);
    g.fillTriangle(44, 70, 40, 90, 50, 72);
    g.fillTriangle(50, 72, 50, 92, 56, 72);
    g.fillTriangle(56, 70, 60, 90, 50, 72);
    // Frost particles
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(20, 30, 3);
    g.fillCircle(80, 28, 3);
    g.fillCircle(30, 60, 2);
    g.fillCircle(70, 58, 2);
    drawSmallEyes(g, 50, 28, pet.eyeColor);
  },

  // ═══════════════════════════════════════════
  //                 暗系 (6只)
  // ═══════════════════════════════════════════
  'pet_bat': (g, pet) => {
    // Bat: with spread wings
    // Wings
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillTriangle(42, 45, 8, 30, 22, 58);
    g.fillTriangle(58, 45, 92, 30, 78, 58);
    // Wing membrane
    g.fillStyle(0x424242, 0.4);
    g.fillTriangle(42, 46, 14, 34, 24, 56);
    g.fillTriangle(58, 46, 86, 34, 76, 56);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 55, 18, 22);
    // Head
    g.fillCircle(50, 38, 12);
    // Ears (big, pointy)
    g.fillTriangle(38, 30, 30, 12, 42, 28);
    g.fillTriangle(62, 30, 70, 12, 58, 28);
    g.fillStyle(0x1a1a2e, 0.3);
    g.fillTriangle(39, 29, 34, 18, 41, 28);
    g.fillTriangle(61, 29, 66, 18, 59, 28);
    // Fangs
    g.fillStyle(0xffffff, 0.9);
    g.fillTriangle(46, 48, 44, 54, 48, 48);
    g.fillTriangle(54, 48, 56, 54, 52, 48);
    // Eyes
    g.fillStyle(0xe53935, 0.9);
    g.fillCircle(44, 36, 4);
    g.fillCircle(56, 36, 4);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(44, 36, 2);
    g.fillCircle(56, 36, 2);
    // Feet
    g.fillStyle(pet.bodyColor, 0.7);
    g.fillCircle(44, 72, 3);
    g.fillCircle(56, 72, 3);
  },

  'pet_ghost': (g, pet) => {
    // Ghost: floating with wavy bottom
    // Glow
    g.fillStyle(pet.color, 0.15);
    g.fillCircle(50, 48, 32);
    // Body
    g.fillStyle(pet.bodyColor, 0.85);
    g.fillCircle(50, 40, 24);
    g.fillRect(26, 40, 48, 30);
    // Wavy bottom
    g.fillCircle(34, 70, 10);
    g.fillCircle(50, 72, 10);
    g.fillCircle(66, 70, 10);
    // Arms
    g.fillCircle(24, 50, 8);
    g.fillCircle(76, 50, 8);
    // Eyes (big, hollow)
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(40, 38, 12, 14);
    g.fillEllipse(60, 38, 12, 14);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(42, 40, 4);
    g.fillCircle(58, 40, 4);
    // Mouth
    g.fillStyle(0x1a1a2e, 0.6);
    g.fillEllipse(50, 54, 8, 10);
  },

  'pet_murkrow': (g, pet) => {
    // Murkrow: crow with hat
    // Wings
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillTriangle(42, 48, 10, 36, 26, 62);
    g.fillTriangle(58, 48, 90, 36, 74, 62);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 55, 20, 24);
    // Head
    g.fillCircle(50, 36, 14);
    // Hat (witch-like)
    g.fillStyle(0x1a1a2e, 0.9);
    g.fillTriangle(44, 26, 50, 8, 56, 26);
    g.fillRect(36, 26, 28, 4);
    // Hat feather
    g.fillStyle(0xe53935, 0.7);
    g.fillTriangle(58, 24, 66, 14, 62, 26);
    // Tail feathers
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillTriangle(44, 72, 38, 88, 50, 74);
    g.fillTriangle(50, 74, 50, 90, 56, 74);
    // Beak
    g.fillStyle(0xff9800, 1);
    g.fillTriangle(50, 40, 46, 44, 54, 44);
    g.fillTriangle(50, 44, 48, 48, 52, 48);
    // Eyes
    g.fillStyle(0xffd600, 0.9);
    g.fillCircle(44, 34, 4);
    g.fillCircle(56, 34, 4);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(44, 34, 2);
    g.fillCircle(56, 34, 2);
  },

  'pet_umbreon': (g, pet) => {
    // Umbreon: black fox with glowing rings
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 58, 24);
    // Head
    g.fillCircle(50, 36, 16);
    // Ears
    g.fillTriangle(34, 28, 26, 10, 40, 24);
    g.fillTriangle(66, 28, 74, 10, 60, 24);
    // Tail
    g.fillCircle(78, 58, 8);
    // Glowing rings (yellow)
    g.fillStyle(0xffd600, 0.8);
    // Forehead ring
    g.fillCircle(50, 28, 4);
    // Ear rings
    g.fillCircle(34, 16, 3);
    g.fillCircle(66, 16, 3);
    // Shoulder rings
    g.fillCircle(34, 52, 3);
    g.fillCircle(66, 52, 3);
    // Tail ring
    g.fillCircle(78, 54, 3);
    // Legs
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(36, 76, 10, 12, 4);
    g.fillRoundedRect(54, 76, 10, 12, 4);
    // Eyes (red)
    g.fillStyle(0xe53935, 0.9);
    g.fillCircle(42, 34, 5);
    g.fillCircle(58, 34, 5);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(42, 34, 2);
    g.fillCircle(58, 34, 2);
  },

  'pet_darkrai': (g, pet) => {
    // Darkrai: shadowy floating figure
    // Shadow tendrils
    g.fillStyle(pet.bodyColor, 0.5);
    g.fillCircle(36, 78, 8);
    g.fillCircle(50, 82, 8);
    g.fillCircle(64, 78, 8);
    g.fillCircle(28, 72, 6);
    g.fillCircle(72, 72, 6);
    // Body (ghostly)
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillEllipse(50, 48, 28, 36);
    // Head
    g.fillCircle(50, 28, 16);
    // Hood/cape
    g.fillStyle(0x0d0d1a, 0.6);
    g.fillTriangle(34, 32, 28, 50, 42, 40);
    g.fillTriangle(66, 32, 72, 50, 58, 40);
    // Red eyes
    g.fillStyle(0xc62828, 0.9);
    g.fillEllipse(42, 26, 8, 5);
    g.fillEllipse(58, 26, 8, 5);
    g.fillStyle(0xff1744, 0.6);
    g.fillCircle(42, 26, 3);
    g.fillCircle(58, 26, 3);
    // Mouth (dark void)
    g.fillStyle(0x000000, 0.7);
    g.fillEllipse(50, 38, 10, 6);
  },

  'pet_spiritomb': (g, pet) => {
    // Spiritomb: stone face with swirling spirit
    // Spirit wisps
    g.fillStyle(pet.bodyColor, 0.4);
    g.fillCircle(30, 30, 8);
    g.fillCircle(70, 32, 8);
    g.fillCircle(24, 50, 6);
    g.fillCircle(76, 52, 6);
    // Stone body
    g.fillStyle(0x616161, 0.9);
    g.fillCircle(50, 50, 30);
    // Stone crack
    g.lineStyle(2, 0x424242, 0.6);
    g.beginPath(); g.moveTo(50, 22); g.lineTo(48, 38); g.lineTo(52, 56); g.stroke();
    // Face hole (dark)
    g.fillStyle(0x1a1a2e, 0.9);
    g.fillEllipse(50, 46, 24, 28);
    // Swirling eye
    g.fillStyle(0x76ff03, 0.9);
    g.fillCircle(50, 44, 6);
    g.fillStyle(0x000000, 0.8);
    g.fillCircle(50, 44, 3);
    // Small eyes
    g.fillStyle(0x76ff03, 0.6);
    g.fillCircle(38, 38, 3);
    g.fillCircle(62, 38, 3);
    // Mouth slit
    g.lineStyle(2, 0x76ff03, 0.5);
    g.beginPath(); g.moveTo(40, 56); g.lineTo(60, 56); g.stroke();
  },

  // ═══════════════════════════════════════════
  //                 光系 (6只)
  // ═══════════════════════════════════════════
  'pet_pixie': (g, pet) => {
    // Pixie: small fairy with wings and glow
    // Glow
    g.fillStyle(pet.color, 0.15);
    g.fillCircle(50, 48, 30);
    // Wings
    g.fillStyle(0xfff9c4, 0.4);
    g.fillEllipse(30, 42, 16, 24);
    g.fillEllipse(70, 42, 16, 24);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 50, 14);
    // Head
    g.fillCircle(50, 32, 12);
    // Hair (spiky)
    g.fillStyle(0xffe082, 0.8);
    g.fillTriangle(44, 22, 38, 10, 48, 20);
    g.fillTriangle(50, 20, 50, 8, 54, 20);
    g.fillTriangle(56, 22, 62, 10, 52, 20);
    // Arms
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillCircle(34, 52, 5);
    g.fillCircle(66, 52, 5);
    // Legs
    g.fillRoundedRect(42, 62, 6, 12, 3);
    g.fillRoundedRect(52, 62, 6, 12, 3);
    // Sparkle trail
    g.fillStyle(0xffd700, 0.5);
    g.fillCircle(26, 60, 3);
    g.fillCircle(74, 58, 3);
    g.fillCircle(50, 78, 2);
    drawSmallEyes(g, 50, 30, pet.eyeColor);
    drawBlush(g, 50, 36);
  },

  'pet_clefairy': (g, pet) => {
    // Clefairy: pink fairy with star
    // Wings
    g.fillStyle(0xf8bbd0, 0.4);
    g.fillEllipse(28, 46, 14, 22);
    g.fillEllipse(72, 46, 14, 22);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 55, 22);
    // Head
    g.fillCircle(50, 34, 16);
    // Ears
    g.fillCircle(34, 20, 8);
    g.fillCircle(66, 20, 8);
    g.fillStyle(0x1a1a2e, 0.2);
    g.fillCircle(34, 20, 4);
    g.fillCircle(66, 20, 4);
    // Star on forehead
    g.fillStyle(0xe53935, 0.8);
    g.fillCircle(50, 24, 5);
    // Arms
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillCircle(30, 54, 6);
    g.fillCircle(70, 54, 6);
    // Feet
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(40, 76, 12, 6);
    g.fillEllipse(60, 76, 12, 6);
    drawEyes(g, 50, 32, pet.eyeColor, 4);
    drawMouth(g, 50, 40);
    drawBlush(g, 50, 38);
  },

  'pet_ralts': (g, pet) => {
    // Ralts: small humanoid with horn
    // Body (dress-like)
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 60, 24, 28);
    // Head
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(50, 36, 16);
    // Hair (green)
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillCircle(50, 30, 16);
    g.fillRect(34, 30, 32, 10);
    // Horn
    g.fillStyle(0xe53935, 0.8);
    g.fillTriangle(46, 18, 50, 6, 54, 18);
    // Eyes (red)
    g.fillStyle(0xe53935, 0.9);
    g.fillCircle(44, 36, 4);
    g.fillCircle(56, 36, 4);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(44, 36, 2);
    g.fillCircle(56, 36, 2);
    // Legs
    g.fillStyle(0x4caf50, 0.5);
    g.fillRoundedRect(42, 78, 6, 12, 3);
    g.fillRoundedRect(52, 78, 6, 12, 3);
  },

  'pet_gardevoir': (g, pet) => {
    // Gardevoir: elegant robed figure
    // Dress/robe
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillEllipse(50, 62, 32, 32);
    g.fillTriangle(34, 56, 50, 90, 66, 56);
    // White horn
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(50, 24, 8);
    g.fillCircle(50, 18, 5);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 48, 20, 24);
    // Head
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(50, 30, 14);
    // Hair
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillCircle(50, 24, 14);
    g.fillTriangle(36, 28, 30, 44, 40, 36);
    g.fillTriangle(64, 28, 70, 44, 60, 36);
    // Arms (flowing)
    g.fillStyle(pet.bodyColor, 0.7);
    g.fillTriangle(30, 48, 18, 62, 34, 56);
    g.fillTriangle(70, 48, 82, 62, 66, 56);
    // Green chest spike
    g.fillStyle(0x4caf50, 0.5);
    g.fillCircle(50, 42, 5);
    // Eyes (red)
    g.fillStyle(0xe53935, 0.8);
    g.fillEllipse(44, 28, 5, 3);
    g.fillEllipse(56, 28, 5, 3);
  },

  'pet_espeon': (g, pet) => {
    // Espeon: cat-like with forked tail
    // Tail (forked)
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillCircle(80, 52, 8);
    g.fillTriangle(76, 48, 88, 38, 84, 52);
    g.fillTriangle(78, 52, 90, 48, 84, 56);
    // Body
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(50, 58, 22);
    // Head
    g.fillCircle(50, 38, 16);
    // Ears (large, pointed)
    g.fillTriangle(34, 30, 22, 8, 40, 26);
    g.fillTriangle(66, 30, 78, 8, 60, 26);
    // Gem on forehead
    g.fillStyle(0xe53935, 0.8);
    g.fillCircle(50, 28, 4);
    // Legs
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(36, 76, 10, 12, 4);
    g.fillRoundedRect(54, 76, 10, 12, 4);
    // Collar fur
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(50, 46, 10);
    drawEyes(g, 50, 34, pet.eyeColor, 4);
    drawMouth(g, 50, 42);
  },

  'pet_arceus': (g, pet) => {
    // Arceus: majestic with halo and mane
    // Halo
    g.lineStyle(3, 0xffd700, 0.7);
    g.strokeCircle(50, 14, 12);
    // Mane (flowing)
    g.fillStyle(0xffe082, 0.5);
    g.fillCircle(50, 32, 18);
    g.fillCircle(36, 38, 10);
    g.fillCircle(64, 38, 10);
    // Body (horse-like)
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(50, 58, 30, 28);
    // Head
    g.fillCircle(50, 34, 14);
    // Horn
    g.fillStyle(0xffd700, 0.9);
    g.fillTriangle(46, 24, 50, 8, 54, 24);
    // Legs
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(34, 74, 8, 14, 3);
    g.fillRoundedRect(58, 74, 8, 14, 3);
    // Hooves
    g.fillStyle(0xffd700, 0.6);
    g.fillRoundedRect(34, 84, 8, 4, 2);
    g.fillRoundedRect(58, 84, 8, 4, 2);
    // Tail (flowing)
    g.fillStyle(pet.bodyColor, 0.7);
    g.fillCircle(76, 62, 8);
    g.fillCircle(82, 58, 6);
    // Arceus markings
    g.fillStyle(0x4caf50, 0.5);
    g.fillCircle(42, 54, 4);
    g.fillCircle(58, 54, 4);
    g.fillStyle(0xe53935, 0.5);
    g.fillCircle(50, 62, 4);
    drawEyes(g, 50, 30, pet.eyeColor, 4);
  },
};
