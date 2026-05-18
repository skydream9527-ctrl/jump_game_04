import Phaser from 'phaser';
import { generateAllTextures } from '../renderers/TextureFactory';
import { EventBus } from '../EventBus';
import { EVENTS } from '../../types/events';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    generateAllTextures(this);
    EventBus.emit(EVENTS.GAME_READY);
  }
}
