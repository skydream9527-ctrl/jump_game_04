import type Phaser from 'phaser';
import { generateUITextures } from './UITextures';
import { generatePlatformTextures } from './PlatformTextures';
import { generateCharacterTextures } from './CharacterTextures';
import { generateBackgroundTextures } from './BackgroundTextures';
import { generateItemTextures } from './ItemTextures';
import { generateEnemyTextures } from './EnemyTextures';
import { generateBossTextures } from './BossTextures';
import { generateProjectileTextures } from './ProjectileTextures';
import { generatePetTextures } from './PetTextures';

export function generateAllTextures(scene: Phaser.Scene): void {
  generateUITextures(scene);
  generatePlatformTextures(scene);
  generateCharacterTextures(scene);
  generateBackgroundTextures(scene);
  generateItemTextures(scene);
  generateEnemyTextures(scene);
  generateBossTextures(scene);
  generateProjectileTextures(scene);
  generatePetTextures(scene);
}
