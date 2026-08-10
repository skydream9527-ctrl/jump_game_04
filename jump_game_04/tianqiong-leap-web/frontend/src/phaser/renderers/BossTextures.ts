import Phaser from 'phaser';

// ==================== Boss ====================
export function generateBossTextures(scene: Phaser.Scene): void {
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

