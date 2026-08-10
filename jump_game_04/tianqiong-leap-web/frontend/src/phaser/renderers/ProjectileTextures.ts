import Phaser from 'phaser';

export function generateProjectileTextures(scene: Phaser.Scene): void {
  generateNinjaArtTextures(scene);
  generateWeaponTextures(scene);
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

