import Phaser from 'phaser';

// ==================== Enemies ====================
export function generateEnemyTextures(scene: Phaser.Scene): void {
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

