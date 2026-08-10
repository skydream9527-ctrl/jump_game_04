import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { getCharacterById } from '../../constants/characters';
import { ENERGY_MAX, ENERGY_PER_JUMP } from '../../constants/ninjaarts';
import { isBossLevel } from '../../constants/levels';
import { EventBus } from '../EventBus';
import { EVENTS } from '../../types/events';
import type { GameScene } from '../scenes/GameScene';

const RUN_FRAMES = ['run1', 'run2', 'run3', 'run4'] as const;
const PLAYER_SCREEN_X = 80;
// 角色技能位移距离（px）
const ENERGY_DASH_DISTANCE = 120;
const VOID_SHIFT_DISTANCE = 100;
// 推进冲刺速度倍率
const PROPULSION_SPEED_MULT = 1.5;

export class PlayerSystem {
  // public for system access (refactor in progress)
  player!: Phaser.GameObjects.Image;
  // public for system access (refactor in progress)
  playerVY = 0;
  // public for system access (refactor in progress)
  jumpCount = 0;
  // public for system access (refactor in progress)
  isGrounded = false;
  // public for system access (refactor in progress)
  dead = false;
  // public for system access (refactor in progress)
  iceSlideVX = 0;
  private wasGrounded = false;
  private animFrameIndex = 0;
  private animTimer = 0;
  private spinTween: Phaser.Tweens.Tween | null = null;
  // ── 角色技能状态 ──
  abilityCooldown = 0;     // 冷却剩余 ms
  abilityActiveTimer = 0;  // 持续型技能剩余 ms（推进冲刺）
  abilityInvincible = false; // 能量冲刺期间无敌
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  create(): void {
    const texKey = `player-${this.scene.characterId}`;
    this.player = this.scene.add.image(this.scene.playerX, this.scene.playerY, texKey);
    this.player.setScale(PHYSICS.WORLD_SCALE);
    this.player.setDepth(20);
    this.animFrameIndex = 0;
    this.animTimer = 0;
    this.wasGrounded = false;
    this.abilityCooldown = 0;
    this.abilityActiveTimer = 0;
    this.abilityInvincible = false;
  }

  updateVisuals(normalized: number): void {
    this.player.setPosition(this.scene.playerX, this.scene.playerY);

    if (!this.isGrounded) {
      this.setTextureSafe(`player-${this.scene.characterId}-jump`);
    } else {
      this.animTimer += normalized * 16.67;
      if (this.animTimer > 80) {
        this.animTimer = 0;
        this.animFrameIndex = (this.animFrameIndex + 1) % RUN_FRAMES.length;
      }
      this.setTextureSafe(`player-${this.scene.characterId}-${RUN_FRAMES[this.animFrameIndex]}`);
    }

    if (this.isGrounded && !this.wasGrounded) {
      // Reset spin angle on landing
      if (this.spinTween) { this.spinTween.stop(); this.spinTween = null; }
      this.player.setAngle(0);

      this.player.setScale(PHYSICS.WORLD_SCALE * 1.2, PHYSICS.WORLD_SCALE * 0.8);
      this.scene.tweens.add({
        targets: this.player,
        scaleX: PHYSICS.WORLD_SCALE,
        scaleY: PHYSICS.WORLD_SCALE,
        duration: 150,
        ease: 'Back.easeOut',
      });
    }
    this.wasGrounded = this.isGrounded;
  }

  private setTextureSafe(key: string): void {
    if (this.player.texture.key !== key && this.scene.textures.exists(key)) {
      this.player.setTexture(key);
    }
  }

  jump(): void {
    if (this.jumpCount >= 2) return;

    const char = getCharacterById(this.scene.characterId);
    const boostActive = this.scene.activePowerUps.has('boostboots');

    // Item jump bonus
    let itemJumpMult = 1.0;
    for (const item of this.scene.equippedItems) {
      if (item.effect.type === 'passive' && item.effect.stat === 'jump') {
        itemJumpMult += item.effect.value ?? 0;
      }
    }

    const jumpMult = (boostActive ? 1.5 : 1.0) * itemJumpMult;
    const jumpForce = PHYSICS.JUMP_FORCE * char.jumpMultiplier * jumpMult;
    const force = this.jumpCount === 0 ? jumpForce : jumpForce * PHYSICS.DOUBLE_JUMP_MULTIPLIER;

    this.playerVY = force;
    this.jumpCount++;
    this.isGrounded = false;
    this.scene.energy = Math.min(ENERGY_MAX, this.scene.energy + ENERGY_PER_JUMP);
    this.scene.particles.spawn(0xffe4b5, PHYSICS.JUMP_PARTICLE_COUNT, 4, 3);
    this.scene.audio.jump();

    // Slow fall on double jump (charm_gravity)
    if (this.jumpCount >= 2) {
      for (const item of this.scene.equippedItems) {
        if (item.effect.type === 'on_jump' && item.effect.stat === 'slow_fall') {
          this.scene.slowFallActive = true;
          this.scene.slowFallTimer = item.effect.value ?? 500;
        }
      }

      // Contra-style rolling spin on double jump
      if (this.spinTween) this.spinTween.stop();
      this.player.setAngle(0);
      this.spinTween = this.scene.tweens.add({
        targets: this.player,
        angle: 360,
        duration: 400,
        ease: 'Linear',
        onComplete: () => { this.spinTween = null; },
      });
    }

    this.player.setScale(PHYSICS.WORLD_SCALE * 0.8, PHYSICS.WORLD_SCALE * 1.2);
    this.scene.tweens.add({
      targets: this.player,
      scaleX: PHYSICS.WORLD_SCALE,
      scaleY: PHYSICS.WORLD_SCALE,
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  respawn(): void {
    const camLeft = this.scene.cameras.main.scrollX;
    const camRight = camLeft + PHYSICS.CANVAS_WIDTH;
    const platforms = this.scene.levelSystem.platforms;
    let found: (typeof platforms)[number] | null = null;
    for (let i = platforms.length - 1; i >= 0; i--) {
      const p = platforms[i];
      if (p.x + p.width / 2 > camLeft && p.x - p.width / 2 < camRight) {
        found = p;
        break;
      }
    }
    if (found) {
      this.scene.playerX = found.x;
      this.scene.playerY = found.y - found.height / 2 - this.scene.playerHeight / 2;
    } else {
      this.scene.playerX = camLeft + PLAYER_SCREEN_X;
      this.scene.playerY = 340;
    }
    this.playerVY = 0;
    this.jumpCount = 0;
    this.isGrounded = true;
  }

  spawnRespawnPlatform(): void {
    const safeWidth = 300;
    const safeX = this.scene.playerX - safeWidth / 2;
    const safeY = this.scene.playerY + this.scene.playerHeight / 2;
    this.scene.levelSystem.spawnPlatform(safeX, safeY, safeWidth);
  }

  // public for system access (refactor in progress)
  fall(): void {
    // 能量冲刺期间无敌
    if (this.abilityInvincible) return;
    // Invincibility from items
    if (this.scene.invincibleTimer > 0) return;

    // Item: damage reduce (armor_light) — 20% chance to ignore
    for (const item of this.scene.equippedItems) {
      if (item.effect.type === 'passive' && item.effect.stat === 'damage_reduce') {
        if (Math.random() < (item.effect.value ?? 0)) {
          this.scene.particles.spawn(0xffd700, 6, 4, 3);
          return;
        }
      }
    }

    // Shield absorbs one hit — always check, even if dead is already set
    if (this.scene.hasShield) {
      this.scene.hasShield = false;

      this.scene.hudNeedsUpdate = true;
      this.scene.particles.spawn(0x4fc3f7, 8, 5, 4);
      this.respawn();
      this.spawnRespawnPlatform();
      this.scene.invincibleTimer = 2000;
      this.dead = false;
      return;
    }

    // Item: fairy revive — restore full lives
    if (this.scene.equippedItems.some(i => i.effect.stat === 'revive')) {
      this.scene.lives = 3;
      this.scene.hudNeedsUpdate = true;
      this.scene.particles.spawn(0xe040fb, 12, 5, 5);
      this.scene.audio.powerup();
      this.respawn();
      this.spawnRespawnPlatform();
      this.scene.invincibleTimer = 2000;
      this.dead = false;
      // Remove fairy from equipped (consumed)
      this.scene.equippedItems = this.scene.equippedItems.filter(i => i.effect.stat !== 'revive');
      return;
    }

    // Revive token — always check, even if dead is already set
    if (this.scene.activePowerUps.has('revive')) {
      this.scene.activePowerUps.delete('revive');
      this.scene.lives = Math.max(1, Math.floor(3 * 0.5)); // Restore 50% life
      this.scene.hudNeedsUpdate = true;
      this.scene.particles.spawn(0xffc800, 12, 5, 5);
      this.scene.audio.powerup();
      this.respawn();
      this.spawnRespawnPlatform();
      this.scene.invincibleTimer = 2000;
      this.dead = false;
      return;
    }

    // Prevent duplicate death processing in the same frame
    if (this.dead) return;
    this.dead = true;

    this.scene.lives--;
    this.scene.killCount = 0; // Reset combo on death
    this.scene.hudNeedsUpdate = true;
    EventBus.emit(EVENTS.LIVES_CHANGED, { lives: this.scene.lives });

    if (this.scene.lives <= 0) {
      this.scene.gameState = 'game_over';
      if (this.scene.score > this.scene.bestScore) this.scene.bestScore = this.scene.score;
      this.scene.audio.stopBGM();
      this.scene.audio.gameOver();
      EventBus.emit(EVENTS.GAME_OVER, { score: this.scene.score, bestScore: this.scene.bestScore });
      EventBus.emit(EVENTS.GAME_STATE_CHANGED, 'game_over');
    } else {
      this.respawn();
      this.spawnRespawnPlatform();
      this.scene.invincibleTimer = 2000;
      this.player.setScale(PHYSICS.WORLD_SCALE);
      this.updateVisuals(1);
      this.dead = false;
    }
  }

  useConsumable(): void {
    const consumables = this.scene.equippedItems.filter(i => i.category === 'consumable');
    if (consumables.length === 0) return;

    const item = consumables[0]; // Use first consumable
    const e = item.effect;

    switch (e.stat) {
      case 'lives': // Potion HP
        this.scene.lives = Math.min(3, this.scene.lives + (e.value ?? 1));
        this.scene.hudNeedsUpdate = true;
        this.scene.particles.spawn(0xe91e63, 8, 4, 3);
        break;
      case 'shield': // Potion shield
        this.scene.hasShield = true;
        this.scene.hudNeedsUpdate = true;
        this.scene.particles.spawn(0x4fc3f7, 8, 4, 3);
        break;
      case 'bomb_range': // Bomb — destroy all enemies in range
        for (const enemy of this.scene.enemySystem.enemies) {
          const dx = this.scene.playerX - enemy.sprite.x;
          if (Math.abs(dx) < (e.value ?? 300)) {
            enemy.hp = 0;
            this.scene.particles.spawn(0xff5722, 6, 4, 3);
            this.scene.score += 50;
          }
        }
        this.scene.enemySystem.enemies = this.scene.enemySystem.enemies.filter(enemy => {
          if (enemy.hp <= 0) { enemy.sprite.destroy(); return false; }
          return true;
        });
        this.scene.particles.spawn(0xff5722, 12, 6, 4);
        this.scene.audio.lightningStrike();
        break;
      case 'light_arrow': // Light arrow — damage all enemies
        for (const enemy of this.scene.enemySystem.enemies) {
          enemy.hp -= (e.value ?? 2);
          this.scene.particles.spawn(0xffeb3b, 4, 3, 2);
        }
        this.scene.enemySystem.enemies = this.scene.enemySystem.enemies.filter(enemy => {
          if (enemy.hp <= 0) { enemy.sprite.destroy(); this.scene.onEnemyKilled(); return false; }
          return true;
        });
        break;
      case 'stun': // Deku nut — stun all enemies
        this.scene.stunTimer = e.value ?? 3000;
        for (const enemy of this.scene.enemySystem.enemies) {
          enemy.frozen = true;
          this.scene.time.delayedCall(e.value ?? 3000, () => { if (enemy.sprite.active) enemy.frozen = false; });
        }
        this.scene.particles.spawn(0x8d6e63, 10, 5, 4);
        break;
    }

    // Remove consumed item from equipped list
    this.scene.equippedItems = this.scene.equippedItems.filter(i => i !== item);
    this.scene.hudNeedsUpdate = true;
  }

  // ── 角色特殊能力 ──
  /** 激活角色主动技能（Shift 键）。被动技能（精准着陆）不由此触发。 */
  activateAbility(): void {
    const char = getCharacterById(this.scene.characterId);
    const ab = char.ability;
    if (!ab.type || ab.cooldown === 0) return;          // 被动或无能力
    if (this.abilityCooldown > 0) return;                 // 冷却中
    if (this.abilityActiveTimer > 0) return;               // 已激活中

    this.abilityCooldown = ab.cooldown;

    switch (ab.type) {
      case 'energy_dash': {
        // 瞬间向前位移 + 短暂无敌
        this.scene.playerX += ENERGY_DASH_DISTANCE;
        this.scene.distance += ENERGY_DASH_DISTANCE;
        this.abilityInvincible = true;
        this.abilityActiveTimer = ab.duration;
        this.scene.particles.spawn(0x6bb8e8, 12, 6, 2);
        this.scene.audio.powerup();
        break;
      }
      case 'void_shift': {
        // 瞬间传送到前方
        this.scene.playerX += VOID_SHIFT_DISTANCE;
        this.scene.distance += VOID_SHIFT_DISTANCE;
        this.scene.particles.spawn(0xb060e0, 14, 5, 3);
        this.scene.audio.powerup();
        break;
      }
      case 'propulsion': {
        // 速度 +50%，持续 3 秒
        this.abilityActiveTimer = ab.duration;
        this.scene.particles.spawn(0xff6030, 10, 4, 3);
        this.scene.audio.powerup();
        break;
      }
      case 'precise_landing':
        break;  // 被动，不由此激活
    }
  }

  /** 每帧更新技能状态（冷却倒计时、持续型技能效果）。 */
  updateAbility(delta: number, normalized: number): void {
    if (this.abilityCooldown > 0) {
      this.abilityCooldown -= delta;
      if (this.abilityCooldown < 0) this.abilityCooldown = 0;
    }

    if (this.abilityActiveTimer > 0) {
      this.abilityActiveTimer -= delta;
      if (this.abilityActiveTimer <= 0) {
        this.abilityActiveTimer = 0;
        this.abilityInvincible = false;
      } else {
        // 推进冲刺：持续加速
        const char = getCharacterById(this.scene.characterId);
        if (char.ability.type === 'propulsion') {
          this.scene.playerX += this.scene.speed * (PROPULSION_SPEED_MULT - 1) * normalized;
          this.scene.distance += this.scene.speed * (PROPULSION_SPEED_MULT - 1) * normalized;
        }
      }
    }
  }

  /** 被动技能：零号精准着陆 — 落地时吸附到平台中心。由 LevelSystem 在落地时调用。 */
  applyPreciseLanding(platformX: number, platformWidth: number): void {
    const char = getCharacterById(this.scene.characterId);
    if (char.ability.type !== 'precise_landing') return;
    const center = platformX;
    const halfW = platformWidth / 2;
    // 仅当玩家在平台范围内才吸附（±halfW）
    const dx = center - this.scene.playerX;
    if (Math.abs(dx) < halfW) {
      // 平滑吸附：移动差值的 60%，避免突兀瞬移
      this.scene.playerX += dx * 0.6;
    }
  }

  checkWin(): void {
    if (this.scene.gameState !== 'playing') return;

    const isBoss = isBossLevel(this.scene.config.level);

    if (isBoss && !this.scene.bossSystem.boss && this.scene.distance >= this.scene.config.targetDistance * 0.85) {
      this.scene.bossSystem.spawn();
      return;
    }

    if (!isBoss && this.scene.distance >= this.scene.config.targetDistance) {
      const stars = this.scene.shardsCollected >= 3 ? 3 : this.scene.shardsCollected >= 2 ? 2 : 1;
      this.scene.emitLevelComplete(stars);
    }
  }

  clear(): void {
    this.iceSlideVX = 0;
    this.dead = false;
    this.abilityCooldown = 0;
    this.abilityActiveTimer = 0;
    this.abilityInvincible = false;
  }
}
