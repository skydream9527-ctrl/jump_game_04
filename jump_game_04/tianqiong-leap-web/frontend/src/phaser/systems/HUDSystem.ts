import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { getLevelDisplayName } from '../../constants/levels';
import { WEAPON_CONFIGS } from '../../constants/weapons';
import { ENERGY_MAX } from '../../constants/ninjaarts';
import type { PowerUpType } from '../../constants/powerups';
import type { GameScene } from '../scenes/GameScene';

const HUD_DEPTH = 100;

export class HUDSystem {
  private heartIcons: Phaser.GameObjects.Image[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private shardCountText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressFill!: Phaser.GameObjects.Graphics;
  private levelTag!: Phaser.GameObjects.Text;
  private energyBar!: Phaser.GameObjects.Graphics;
  private energyFill!: Phaser.GameObjects.Graphics;
  private energyLabel!: Phaser.GameObjects.Text;
  private powerUpIcons: { type: PowerUpType; icon: Phaser.GameObjects.Image; timer: Phaser.GameObjects.Text }[] = [];
  private weaponIcon!: Phaser.GameObjects.Image;
  private weaponNameText!: Phaser.GameObjects.Text;
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  create(): void {
    const padding = 12;

    this.heartIcons = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.scene.add.image(padding + i * 22 + 8, padding + 10, 'heart-full');
      heart.setScale(0.8);
      heart.setDepth(HUD_DEPTH);
      this.heartIcons.push(heart);
    }

    this.levelTag = this.scene.add.text(padding, padding + 26, getLevelDisplayName(this.scene.config.chapter, this.scene.config.level), {
      fontSize: '11px',
      color: '#9e9486',
      fontFamily: 'sans-serif',
    });
    this.levelTag.setDepth(HUD_DEPTH);

    this.progressBar = this.scene.add.graphics();
    this.progressFill = this.scene.add.graphics();
    this.progressBar.setDepth(HUD_DEPTH);
    this.progressFill.setDepth(HUD_DEPTH + 1);
    this.drawProgressBar();

    this.shardCountText = this.scene.add.text(PHYSICS.CANVAS_WIDTH - padding - 80, padding + 4, '★ 0 / 3', {
      fontSize: '14px',
      color: '#ffd980',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    });
    this.shardCountText.setDepth(HUD_DEPTH);

    this.scoreText = this.scene.add.text(PHYSICS.CANVAS_WIDTH - padding, padding + 30, '0', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    });
    this.scoreText.setOrigin(1, 0);
    this.scoreText.setDepth(HUD_DEPTH);

    const pauseBtn = this.scene.add.text(PHYSICS.CANVAS_WIDTH - 20, 14, '⏸', {
      fontSize: '18px',
      color: '#ece2d0',
      fontFamily: 'sans-serif',
    });
    pauseBtn.setAlpha(0.7);
    pauseBtn.setDepth(HUD_DEPTH);
    pauseBtn.setInteractive();
    pauseBtn.on('pointerdown', () => this.scene.togglePause());

    // Energy bar (ninja art)
    this.energyBar = this.scene.add.graphics();
    this.energyFill = this.scene.add.graphics();
    this.energyBar.setDepth(HUD_DEPTH);
    this.energyFill.setDepth(HUD_DEPTH + 1);

    this.energyLabel = this.scene.add.text(PHYSICS.CANVAS_WIDTH - padding - 80, padding + 48, '忍术 [E]', {
      fontSize: '10px',
      color: '#9e9486',
      fontFamily: 'sans-serif',
    });
    this.energyLabel.setDepth(HUD_DEPTH);
    this.drawEnergyBar();

    // Pre-allocate power-up icon pool (max 4 slots)
    for (let i = 0; i < 4; i++) {
      const x = PHYSICS.CANVAS_WIDTH - 92 - i * 30;
      const y = 78;
      const icon = this.scene.add.image(x, y, 'pu-shield');
      icon.setDisplaySize(16, 16);
      icon.setDepth(HUD_DEPTH);
      icon.setVisible(false);
      const timer = this.scene.add.text(x, y + 10, '', {
        fontSize: '9px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      });
      timer.setOrigin(0.5, 0);
      timer.setDepth(HUD_DEPTH);
      timer.setVisible(false);
      this.powerUpIcons.push({ type: 'shield', icon, timer });
    }

    const hasConsumable = this.scene.equippedItems.some(i => i.category === 'consumable');
    const petHint = this.scene.selectedPet
      ? `  R: ${this.scene.selectedPet.active.name}  T: ${this.scene.selectedPet.active2.name}  Y: ${this.scene.selectedPet.ultimate.name}`
      : '';
    const hint = this.scene.add.text(padding, PHYSICS.CANVAS_HEIGHT - padding - 10,
      `SPACE/点击: 跳跃  E: 忍术${hasConsumable ? '  Q: 使用道具' : ''}${petHint}  自动射击`, {
      fontSize: '10px',
      color: '#9e9486',
      fontFamily: 'sans-serif',
    });
    hint.setDepth(HUD_DEPTH);

    this.weaponIcon = this.scene.add.image(padding + 14, PHYSICS.CANVAS_HEIGHT - padding - 30, 'pu-weapon-pistol');
    this.weaponIcon.setDisplaySize(20, 20);
    this.weaponIcon.setDepth(HUD_DEPTH);
    this.weaponNameText = this.scene.add.text(padding + 30, PHYSICS.CANVAS_HEIGHT - padding - 38, '手枪', {
      fontSize: '11px',
      color: '#ffd980',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    });
    this.weaponNameText.setDepth(HUD_DEPTH);
  }

  private drawBar(
    bg: Phaser.GameObjects.Graphics,
    fill: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number, radius: number,
    bgColor: number, bgAlpha: number, fillColor: number, fillAlpha: number,
    ratio: number,
  ): void {
    bg.clear();
    bg.fillStyle(bgColor, bgAlpha);
    bg.fillRoundedRect(x, y, w, h, radius);
    fill.clear();
    fill.fillStyle(fillColor, fillAlpha);
    fill.fillRoundedRect(x, y, w * ratio, h, radius);
  }

  private drawEnergyBar(): void {
    const progress = this.scene.energy / ENERGY_MAX;
    const color = progress >= 1 ? 0xffd700 : 0x8b5cf6;
    this.drawBar(this.energyBar, this.energyFill, PHYSICS.CANVAS_WIDTH - 92, 64, 80, 5, 2, 0xffffff, 0.15, color, 1, progress);
  }

  private drawProgressBar(): void {
    const progress = this.scene.config.targetDistance > 0 ? Phaser.Math.Clamp(this.scene.distance / this.scene.config.targetDistance, 0, 1) : 0;
    this.drawBar(this.progressBar, this.progressFill, 12, 52, 120, 6, 3, 0xffffff, 0.2, 0x6bb8e8, 1, progress);
  }

  update(): void {
    if (!this.scene.hudNeedsUpdate) return;
    this.scene.hudNeedsUpdate = false;

    for (let i = 0; i < 3; i++) {
      this.heartIcons[i].setTexture(i < this.scene.lives ? 'heart-full' : 'heart-empty');
    }

    this.scoreText.setText(this.scene.score.toLocaleString());
    this.shardCountText.setText(`★ ${this.scene.shardsCollected} / ${this.scene.totalShards}`);
    this.drawProgressBar();
    this.drawEnergyBar();

    if (this.scene.hasShield) {
      this.energyLabel.setText('忍术 [E]  🛡');
    } else {
      this.energyLabel.setText('忍术 [E]');
    }

    // Update pre-allocated power-up icon pool
    let puIdx = 0;
    for (const [type, remaining] of this.scene.activePowerUps) {
      if (puIdx >= 4) break;
      const slot = this.powerUpIcons[puIdx];
      slot.type = type;
      slot.icon.setTexture(`pu-${type}`);
      slot.icon.setVisible(true);
      slot.timer.setText(`${Math.ceil(remaining / 1000)}s`);
      slot.timer.setVisible(true);
      puIdx++;
    }
    for (let i = puIdx; i < 4; i++) {
      this.powerUpIcons[i].icon.setVisible(false);
      this.powerUpIcons[i].timer.setVisible(false);
    }

    const wCfg = WEAPON_CONFIGS[this.scene.weaponSystem.currentWeapon];
    this.weaponIcon.setTexture(`pu-weapon-${this.scene.weaponSystem.currentWeapon}`);
    this.weaponNameText.setText(wCfg.name);
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
    this.heartIcons.forEach(safeDestroy);
    this.heartIcons = [];
    this.powerUpIcons.forEach(p => { safeDestroy(p.icon); safeDestroy(p.timer); });
    this.powerUpIcons = [];
  }
}
