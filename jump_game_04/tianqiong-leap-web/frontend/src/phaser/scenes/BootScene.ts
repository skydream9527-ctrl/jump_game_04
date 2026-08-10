import Phaser from 'phaser';
import { generateAllTextures } from '../renderers/TextureFactory';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    generateAllTextures(this);
    this.scene.start('GameScene');
  }
}
