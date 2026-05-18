import Phaser from 'phaser';
import { PHYSICS } from '../constants/physics';
import { GameScene } from './scenes/GameScene';

export function createPhaserConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: PHYSICS.CANVAS_WIDTH,
    height: PHYSICS.CANVAS_HEIGHT,
    parent,
    backgroundColor: '#1B1520',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [GameScene],
    audio: {
      disableWebAudio: false,
    },
    render: {
      pixelArt: false,
      antialias: true,
    },
  };
}
