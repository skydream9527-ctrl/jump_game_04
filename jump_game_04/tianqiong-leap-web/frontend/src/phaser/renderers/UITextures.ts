import Phaser from 'phaser';

export function generateUITextures(scene: Phaser.Scene): void {
  generateParticleTexture(scene);
  generateCoinTexture(scene);
  generateHeartTextures(scene);
}

// ==================== Particle ====================
function generateParticleTexture(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture('particle-dust', 8, 8);
  g.destroy();
}

// ==================== Coin (replaces star shard) ====================
function generateCoinTexture(scene: Phaser.Scene): void {
  const s = 28;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  // Outer glow
  g.fillStyle(0xffd700, 0.25);
  g.fillCircle(s / 2, s / 2, s / 2);

  // Coin body
  g.fillStyle(0xffd700, 1);
  g.fillCircle(s / 2, s / 2, s / 2 - 3);

  // Inner ring
  g.lineStyle(2, 0xffa500, 0.8);
  g.strokeCircle(s / 2, s / 2, s / 2 - 6);

  // Highlight
  g.fillStyle(0xffec80, 0.7);
  g.fillCircle(s / 2 - 3, s / 2 - 3, 4);

  // Dollar sign or star
  g.fillStyle(0xb8860b, 0.8);
  const cx = s / 2;
  const cy = s / 2;
  const r = 5;
  const ir = 2;
  const path: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 5; i++) {
    path.push(new Phaser.Math.Vector2(
      cx + r * Math.cos(Phaser.Math.DegToRad(i * 72 - 90)),
      cy + r * Math.sin(Phaser.Math.DegToRad(i * 72 - 90))
    ));
    path.push(new Phaser.Math.Vector2(
      cx + ir * Math.cos(Phaser.Math.DegToRad(i * 72 + 36 - 90)),
      cy + ir * Math.sin(Phaser.Math.DegToRad(i * 72 + 36 - 90))
    ));
  }
  g.fillPoints(path, true);

  g.generateTexture('shard', s, s);
  g.destroy();
}

// ==================== Hearts ====================
function generateHeartTextures(scene: Phaser.Scene): void {
  const s = 20;
  const drawHeart = (g: Phaser.GameObjects.Graphics, fill: number, alpha: number) => {
    g.fillStyle(fill, alpha);
    g.fillCircle(s * 0.3, s * 0.35, s * 0.25);
    g.fillCircle(s * 0.7, s * 0.35, s * 0.25);
    g.fillTriangle(s * 0.05, s * 0.45, s * 0.95, s * 0.45, s * 0.5, s * 0.9);
  };

  const g1 = scene.make.graphics({ x: 0, y: 0 }, false);
  drawHeart(g1, 0xe05555, 1);
  g1.generateTexture('heart-full', s, s);
  g1.destroy();

  const g2 = scene.make.graphics({ x: 0, y: 0 }, false);
  drawHeart(g2, 0xe05555, 0.3);
  g2.generateTexture('heart-empty', s, s);
  g2.destroy();
}

