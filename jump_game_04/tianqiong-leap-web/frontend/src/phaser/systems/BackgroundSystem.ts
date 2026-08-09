import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import type { GameScene } from '../scenes/GameScene';

export class BackgroundSystem {
  private skyBg: Phaser.GameObjects.Graphics | null = null;
  private stars: Phaser.GameObjects.Image[] = [];
  private mountainTiles: Phaser.GameObjects.TileSprite[] = [];
  private bgDecor: Phaser.GameObjects.GameObject[] = [];
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  drawIdle(): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = PHYSICS;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.setDepth(-100);
  }

  create(): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = PHYSICS;
    const ch = this.scene.config.chapter;
    const colors = this.scene.chapterData.skyColors;

    // Sky gradient (all chapters)
    this.skyBg = this.scene.add.graphics();
    const c1 = Phaser.Display.Color.HexStringToColor(colors[0]);
    const c2 = Phaser.Display.Color.HexStringToColor(colors[1]);
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      const t = y / CANVAS_HEIGHT;
      const r = Math.floor(Phaser.Math.Linear(c1.red, c2.red, t));
      const g = Math.floor(Phaser.Math.Linear(c1.green, c2.green, t));
      const b = Math.floor(Phaser.Math.Linear(c1.blue, c2.blue, t));
      this.skyBg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      this.skyBg.fillRect(0, y, CANVAS_WIDTH, 1);
    }
    this.skyBg.setDepth(-10);
    this.skyBg.setScrollFactor(0);

    // Stars (all chapters, colored per chapter)
    this.stars = [];
    const starCount = ch === 2 || ch === 10 ? 60 : 40;
    for (let i = 0; i < starCount; i++) {
      const star = this.scene.add.image(
        Math.random() * CANVAS_WIDTH * 3,
        Math.random() * CANVAS_HEIGHT * 0.6,
        'star-dot'
      );
      star.setAlpha(0.2 + Math.random() * 0.5);
      star.setScale(0.5 + Math.random() * 0.5);
      star.setDepth(-9);
      star.setScrollFactor(0.08);
      if (this.scene.chapterData.starColor !== 0xffffff) {
        star.setTint(this.scene.chapterData.starColor);
      }
      this.stars.push(star);
    }

    // Chapter-specific mountain/terrain layers
    this.mountainTiles = [];
    const mtKey = `bg-mountain-${ch}`;
    if (this.scene.textures.exists(mtKey)) {
      // 3 mountain layers with different parallax
      const layers = [
        { factor: 0.15, alpha: 0.35, yOffset: 30 },
        { factor: PHYSICS.PARALLAX_MOUNTAINS, alpha: 0.55, yOffset: 15 },
        { factor: PHYSICS.PARALLAX_CLOUDS, alpha: 0.75, yOffset: 0 },
      ];
      for (const l of layers) {
        const tile = this.scene.add.tileSprite(
          CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.7 + l.yOffset,
          CANVAS_WIDTH, 200, mtKey
        );
        tile.setAlpha(l.alpha);
        tile.setDepth(-8);
        tile.setScrollFactor(l.factor);
        this.mountainTiles.push(tile);
      }
    }

    // Chapter-specific decorative elements
    this.createChapterDecor(ch, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  private createChapterDecor(ch: number, W: number, H: number): void {
    this.bgDecor = [];

    switch (ch) {
      case 1: { // 废弃地球 - ruins, dead trees, rain
        // Ruins
        for (let i = 0; i < 3; i++) {
          const ruin = this.scene.add.image(120 + i * 280, H * 0.58, 'bg-ruin');
          ruin.setDepth(-7);
          ruin.setScrollFactor(0.35);
          ruin.setAlpha(0.5 - i * 0.1);
          this.bgDecor.push(ruin);
        }
        // Clouds
        for (let i = 0; i < 4; i++) {
          const cloud = this.scene.add.image(80 + i * 220, 30 + Math.random() * 40, 'bg-cloud');
          cloud.setDepth(-6);
          cloud.setScrollFactor(0.12);
          cloud.setAlpha(0.2 + Math.random() * 0.15);
          cloud.setScale(0.8 + Math.random() * 0.5);
          cloud.setTint(this.scene.chapterData.cloudColor || 0x6b7280);
          this.bgDecor.push(cloud);
        }
        break;
      }
      case 2: { // 月球基地 - dome, earth, craters
        // Earth in sky
        const earth = this.scene.add.graphics();
        earth.fillStyle(0x3a7ac0, 1);
        earth.fillCircle(W - 60, 40, 28);
        earth.fillStyle(0x4a9ae0, 0.6);
        earth.fillCircle(W - 65, 35, 12);
        earth.setDepth(-6);
        earth.setScrollFactor(0.05);
        this.bgDecor.push(earth);
        // Dome
        const dome = this.scene.add.image(200, H * 0.55, 'bg-dome');
        dome.setDepth(-7);
        dome.setScrollFactor(0.3);
        dome.setAlpha(0.6);
        this.bgDecor.push(dome);
        break;
      }
      case 3: { // 火星殖民地 - dunes, habitat, sun
        // Sun
        const sun = this.scene.add.graphics();
        sun.fillStyle(0xffcc80, 1);
        sun.fillCircle(0, 0, 18);
        sun.fillStyle(0xffcc80, 0.15);
        sun.fillCircle(0, 0, 35);
        sun.setPosition(W - 80, 35);
        sun.setDepth(-6);
        sun.setScrollFactor(0.05);
        this.bgDecor.push(sun);
        // Habitats
        for (let i = 0; i < 2; i++) {
          const hab = this.scene.add.image(160 + i * 200, H * 0.58, 'bg-habitat');
          hab.setDepth(-7);
          hab.setScrollFactor(0.35);
          hab.setAlpha(0.6);
          this.bgDecor.push(hab);
        }
        break;
      }
      case 4: { // 水银星 - pillars, gears
        // Metallic pillars (drawn with graphics for variety)
        const pillarData = [
          { x: 80, h: 120 }, { x: 200, h: 90 },
          { x: 350, h: 105 }, { x: 500, h: 80 },
        ];
        for (const p of pillarData) {
          const pillar = this.scene.add.graphics();
          pillar.fillStyle(0x4a5262, 1);
          pillar.fillRect(-8, 0, 16, p.h);
          pillar.fillStyle(0x6a7282, 1);
          pillar.fillRect(-12, -6, 24, 8);
          pillar.setPosition(p.x, H * 0.55 - p.h);
          pillar.setDepth(-7);
          pillar.setScrollFactor(0.3);
          pillar.setAlpha(0.6);
          this.bgDecor.push(pillar);
        }
        // Gear decorations
        const gear = this.scene.add.graphics();
        gear.lineStyle(2, 0x8a92a2, 0.2);
        gear.strokeCircle(0, 0, 15);
        gear.strokeCircle(0, 0, 10);
        gear.setPosition(280, H * 0.4);
        gear.setDepth(-6);
        gear.setScrollFactor(0.25);
        this.bgDecor.push(gear);
        break;
      }
      case 5: { // 冰封星 - ice spikes, aurora
        // Ice spikes
        const spikeData = [
          { x: 50, h: 80 }, { x: 150, h: 60 }, { x: 280, h: 100 },
          { x: 400, h: 70 }, { x: 520, h: 95 }, { x: 600, h: 55 },
        ];
        for (const s of spikeData) {
          const spike = this.scene.add.graphics();
          spike.fillStyle(0x3a6898, 0.5);
          const sp = new Phaser.Curves.Path(-10, 0);
          sp.lineTo(0, -s.h);
          sp.lineTo(10, 0);
          spike.fillPoints(sp.getPoints(8), true);
          spike.setPosition(s.x, H * 0.6);
          spike.setDepth(-7);
          spike.setScrollFactor(0.3);
          this.bgDecor.push(spike);
        }
        // Aurora
        const aurora = this.scene.add.graphics();
        aurora.fillStyle(0x64ffda, 0.04);
        aurora.fillRect(0, 0, W, 50);
        aurora.fillStyle(0x46ffc8, 0.03);
        aurora.fillRect(20, 10, W - 40, 30);
        aurora.setDepth(-5);
        aurora.setScrollFactor(0);
        this.bgDecor.push(aurora);
        break;
      }
      case 6: { // 火焰星球 - volcanoes, lava
        // Volcano 1 (active)
        const v1 = this.scene.add.image(100, H * 0.52, 'bg-volcano');
        v1.setDepth(-7);
        v1.setScrollFactor(0.3);
        v1.setAlpha(0.7);
        v1.setScale(1.2);
        this.bgDecor.push(v1);
        // Volcano 2 (dormant, smaller)
        const v2 = this.scene.add.image(450, H * 0.55, 'bg-volcano');
        v2.setDepth(-7);
        v2.setScrollFactor(0.25);
        v2.setAlpha(0.45);
        v2.setScale(0.9);
        v2.setTint(0x2a1008);
        this.bgDecor.push(v2);
        // Lava glow at bottom
        const lava = this.scene.add.graphics();
        lava.fillStyle(0xff6020, 0.12);
        lava.fillRect(0, H * 0.75, W, H * 0.25);
        lava.setDepth(-5);
        lava.setScrollFactor(0);
        this.bgDecor.push(lava);
        break;
      }
      case 7: { // 雷电星球 - storm clouds
        // Storm cloud layers
        for (let i = 0; i < 3; i++) {
          const cloud = this.scene.add.graphics();
          cloud.fillStyle(0x1a1a45, 0.5 - i * 0.12);
          cloud.fillRect(0, 0, W, 25 + i * 12);
          cloud.setPosition(0, 5 + i * 18);
          cloud.setDepth(-6);
          cloud.setScrollFactor(0);
          this.bgDecor.push(cloud);
        }
        break;
      }
      case 8: { // 丛林星 - giant trees, canopy
        // Canopy layer
        const canopy = this.scene.add.graphics();
        canopy.fillStyle(0x0c1a0c, 0.6);
        canopy.fillRect(0, 0, W, H * 0.25);
        canopy.setDepth(-6);
        canopy.setScrollFactor(0.15);
        this.bgDecor.push(canopy);
        // Giant trees
        const treePositions = [60, 220, 400, 550];
        for (let i = 0; i < treePositions.length; i++) {
          const tree = this.scene.add.image(treePositions[i], H * 0.45, 'bg-tree');
          tree.setDepth(-7);
          tree.setScrollFactor(0.28);
          tree.setAlpha(0.55 - i * 0.05);
          tree.setScale(0.8 + Math.random() * 0.4);
          this.bgDecor.push(tree);
        }
        break;
      }
      case 9: { // 晶体星 - crystal pillars, prisms
        // Crystal pillars
        const crystalPositions = [
          { x: 70, s: 1.2 }, { x: 180, s: 0.9 },
          { x: 320, s: 1.0 }, { x: 460, s: 1.1 },
          { x: 570, s: 0.8 },
        ];
        for (const c of crystalPositions) {
          const cp = this.scene.add.image(c.x, H * 0.5, 'bg-crystal-pillar');
          cp.setDepth(-7);
          cp.setScrollFactor(0.3);
          cp.setAlpha(0.5);
          cp.setScale(c.s);
          this.bgDecor.push(cp);
        }
        // Prism beams
        const beam = this.scene.add.graphics();
        beam.fillStyle(0xb388ff, 0.03);
        beam.fillRect(0, 0, W * 0.6, 3);
        beam.setPosition(W * 0.1, H * 0.25);
        beam.setRotation(0.15);
        beam.setDepth(-5);
        beam.setScrollFactor(0.1);
        this.bgDecor.push(beam);
        break;
      }
      case 10: { // 暗物质领域 - portal, void pulse
        // Portal (top-right)
        const portal = this.scene.add.graphics();
        portal.lineStyle(2, 0xa050ff, 0.25);
        portal.strokeCircle(0, 0, 25);
        portal.lineStyle(2, 0x6030a0, 0.15);
        portal.strokeCircle(0, 0, 18);
        portal.fillStyle(0xa050ff, 0.15);
        portal.fillCircle(0, 0, 8);
        portal.setPosition(W - 100, 50);
        portal.setDepth(-6);
        portal.setScrollFactor(0.05);
        this.bgDecor.push(portal);
        // Void pulse overlay
        const voidPulse = this.scene.add.graphics();
        voidPulse.fillStyle(0x6030a0, 0.04);
        voidPulse.fillEllipse(W / 2, H * 0.4, W * 0.6, H * 0.5);
        voidPulse.setDepth(-5);
        voidPulse.setScrollFactor(0);
        this.bgDecor.push(voidPulse);
        break;
      }
    }
  }

  clear(): void {
    const safeDestroy = (obj: { active?: boolean; destroy?: () => void } | null | undefined) => {
      try {
        if (obj && obj.active !== false && typeof obj.destroy === 'function') {
          obj.destroy();
        }
      } catch {
        // Object may already be destroyed
      }
    };
    this.stars.forEach(safeDestroy);
    this.mountainTiles.forEach(safeDestroy);
    this.bgDecor.forEach(safeDestroy);
    safeDestroy(this.skyBg);
    this.stars = [];
    this.mountainTiles = [];
    this.bgDecor = [];
    this.skyBg = null;
  }
}
