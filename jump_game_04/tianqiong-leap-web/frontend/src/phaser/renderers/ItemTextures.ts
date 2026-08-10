import Phaser from 'phaser';

// ==================== Power-ups ====================
export function generateItemTextures(scene: Phaser.Scene): void {
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

