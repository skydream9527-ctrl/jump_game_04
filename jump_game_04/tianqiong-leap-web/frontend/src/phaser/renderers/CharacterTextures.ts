import Phaser from 'phaser';

// ==================== Zelda-style Character System ====================
export function generateCharacterTextures(scene: Phaser.Scene): void {
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

