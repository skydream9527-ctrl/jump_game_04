import Phaser from 'phaser';
import { CHAPTER_DATA } from '../../constants/levels';

export function generateBackgroundTextures(scene: Phaser.Scene): void {
  generateBackgroundBaseTextures(scene);
  generateDecorTextures(scene);
}

// ==================== Background ====================
function generateBackgroundBaseTextures(scene: Phaser.Scene): void {
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

