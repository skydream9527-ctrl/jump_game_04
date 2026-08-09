import Phaser from 'phaser';
import type { PetActive } from '../../constants/pets';
import type { GameScene } from '../scenes/GameScene';

export class PetSystem {
  // public for system access (refactor in progress)
  petSprite: Phaser.GameObjects.Image | null = null;
  private petTargetX = 0;
  private petTargetY = 0;
  private petActiveTimer = 0;
  // public for system access (refactor in progress)
  petActiveCooldown = 0;
  // public for system access (refactor in progress)
  petTCooldown = 0;
  // public for system access (refactor in progress)
  petUltCooldown = 0;
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  create(): void {
    if (!this.scene.selectedPet) return;
    const texKey = `pet-${this.scene.selectedPet.id}`;
    this.petSprite = this.scene.add.image(this.scene.playerX - 30, this.scene.playerY - 20, texKey);
    this.petSprite.setScale(0.6);
    this.petSprite.setDepth(18);
    this.petSprite.setAlpha(0.9);
    this.petTargetX = this.scene.playerX - 30;
    this.petTargetY = this.scene.playerY - 20;
  }

  update(delta: number, normalized: number): void {
    if (!this.scene.selectedPet || !this.petSprite || !this.petSprite.active) return;

    // Pet follows player with smooth interpolation
    this.petTargetX = this.scene.playerX - 35;
    this.petTargetY = this.scene.playerY - 25;
    this.petSprite.x += (this.petTargetX - this.petSprite.x) * 0.08 * normalized;
    this.petSprite.y += (this.petTargetY - this.petSprite.y) * 0.08 * normalized;

    // Pet bobbing animation
    this.petSprite.y += Math.sin(Date.now() * 0.004) * 0.5;

    // Pet facing direction
    this.petSprite.setFlipX(this.scene.playerX < this.petSprite.x);

    // Passive: regen — heal 1 life every N seconds
    if (this.scene.selectedPet.passive.type === 'regen') {
      const regenInterval = 20000 / (this.scene.selectedPet.passive.value || 1);
      this.petActiveTimer += delta;
      if (this.petActiveTimer >= regenInterval && this.scene.lives < 3) {
        this.scene.lives++;
        this.scene.hudNeedsUpdate = true;
        this.petActiveTimer = 0;
        this.scene.particles.spawn(0x4caf50, 6, 3, 2);
      }
    }

    // Skill cooldowns
    if (this.petActiveCooldown > 0) this.petActiveCooldown -= delta;
    if (this.petTCooldown > 0) this.petTCooldown -= delta;
    if (this.petUltCooldown > 0) this.petUltCooldown -= delta;

    // R — active skill
    if (Phaser.Input.Keyboard.JustDown(this.scene.rKey) && this.petActiveCooldown <= 0) {
      this.activateSkill('active');
    }
    // T — second active skill
    if (Phaser.Input.Keyboard.JustDown(this.scene.tKey) && this.petTCooldown <= 0) {
      this.activateSkill('t_skill');
    }
    // Y — ultimate skill
    if (Phaser.Input.Keyboard.JustDown(this.scene.yKey) && this.petUltCooldown <= 0) {
      this.activateSkill('ultimate');
    }
  }

  private activateSkill(slot: 'active' | 't_skill' | 'ultimate'): void {
    if (!this.scene.selectedPet) return;

    let skill: PetActive;
    if (slot === 'active') {
      skill = this.scene.selectedPet.active;
      this.petActiveCooldown = skill.cooldown;
    } else if (slot === 't_skill') {
      skill = this.scene.selectedPet.active2;
      this.petTCooldown = skill.cooldown;
    } else {
      skill = this.scene.selectedPet.ultimate;
      this.petUltCooldown = skill.cooldown;
    }

    this.runSkill(skill);
    this.scene.hudNeedsUpdate = true;
  }

  private runSkill(skill: PetActive): void {
    switch (skill.type) {
      // ── Full screen damage ──
      case 'lightning':
      case 'thunder':
      case 'psychic_blast':
      case 'sacred_fire':
      case 'blizzard':
      case 'thunder_flash':
      case 'thunder_flash_2':
      case 'dark_pulse':
      case 'moonblast':
      case 'judgment':
      case 'fire_explosion':
      case 'hydro_pump':
      case 'hydro_cannon':
      case 'zap_cannon':
      case 'dual_cannon':
      case 'solar_beam':
      case 'giga_impact':
      case 'inferno':
      case 'blast_burn':
      case 'overheat':
      case 'ice_crash':
      case 'absolute_zero':
      case 'eternal_frost':
      case 'nightmare侵蚀':
      case 'creation':
        for (const e of this.scene.enemySystem.enemies) {
          e.hp -= skill.value;
        }
        this.scene.enemySystem.enemies = this.scene.enemySystem.enemies.filter(e => {
          if (e.hp <= 0) { e.sprite.destroy(); this.scene.onEnemyKilled(); return false; }
          return true;
        });
        if (this.scene.bossSystem.boss) { this.scene.bossSystem.boss.hp -= skill.value; }
        this.scene.particles.spawn(0xffd600, 20, 8, 6);
        break;

      // ── Fire trail behind player ──
      case 'fire_trail':
      case 'ember':
        for (let i = 0; i < 10; i++) {
          const p = this.scene.add.circle(this.scene.playerX - i * 15, this.scene.playerY + 10, 4, 0xff5722, 0.8);
          p.setDepth(15);
          this.scene.particles.push(p, { vx: 0, vy: -0.5, life: 30 });
        }
        break;

      // ── Water wave / push ──
      case 'water_wave':
      case 'water_gun':
      case 'tide':
      case 'crab_hammer':
        for (const e of this.scene.enemySystem.enemies) {
          if (Math.abs(e.sprite.x - this.scene.playerX) < 200) {
            e.sprite.x += 100;
            e.hp -= skill.value;
          }
        }
        this.scene.particles.spawn(0x2196f3, 10, 5, 3);
        break;

      // ── Vine whip / stun nearby ──
      case 'vine_whip':
      case 'razor_leaf':
      case 'sleep_powder':
      case 'supersonic':
        for (const e of this.scene.enemySystem.enemies) {
          if (Math.abs(e.sprite.x - this.scene.playerX) < 150) {
            e.frozen = true;
            e.hp -= skill.value;
            this.scene.time.delayedCall(skill.duration || 2000, () => { if (e.sprite.active) e.frozen = false; });
          }
        }
        this.scene.particles.spawn(0x4caf50, 8, 4, 3);
        break;

      // ── Slow all enemies ──
      case 'psychic':
      case 'psychic_2':
      case 'psychic_3':
      case 'icy_wind':
      case 'snowstorm':
      case 'aurora_beam':
      case 'dark_void':
        for (const e of this.scene.enemySystem.enemies) {
          e.frozen = true;
          this.scene.time.delayedCall(skill.duration || 3000, () => { if (e.sprite.active) e.frozen = false; });
        }
        this.scene.particles.spawn(0xe040fb, 12, 5, 4);
        break;

      // ── Invincible charge ──
      case 'flare_blitz':
      case 'volt_tackle':
      case 'ice_ball':
      case 'shell_charge':
      case 'moon_jump':
        this.scene.invincibleTimer = skill.duration;
        this.scene.speed *= 1.5;
        this.scene.particles.spawn(0xe64a19, 12, 5, 4);
        break;

      // ── Heal ──
      case 'heal_pulse':
      case 'healing_wish':
      case 'healing_wave':
      case 'morning_sun':
      case 'rest':
        this.scene.lives = Math.min(5, this.scene.lives + skill.value);
        this.scene.particles.spawn(0x4caf50, 10, 4, 3);
        break;

      // ── Shield / invincibility ──
      case 'water_shield':
      case 'blessing':
        this.scene.invincibleTimer = skill.duration;
        this.scene.particles.spawn(0x42a5f5, 10, 4, 3);
        break;

      // ── Boost stats ──
      case 'agility':
      case 'evolve':
      case 'cosmic_power':
      case 'overgrow':
      case 'dark_domain':
        this.scene.speed *= 1.3;
        this.scene.particles.spawn(0xffd700, 12, 5, 4);
        break;

      // ── DOT / area effect ──
      case 'fire_spin':
      case 'leaf_storm':
      case 'water_pulse':
      case 'petal_dance':
      case 'storm':
      case 'thunder_storm':
      case 'ice_dance':
      case 'cannon阵列':
      case 'nightmare':
      case 'foxfire':
        for (const e of this.scene.enemySystem.enemies) {
          if (Math.abs(e.sprite.x - this.scene.playerX) < 250) {
            e.hp -= skill.value;
          }
        }
        this.scene.enemySystem.enemies = this.scene.enemySystem.enemies.filter(e => {
          if (e.hp <= 0) { e.sprite.destroy(); this.scene.onEnemyKilled(); return false; }
          return true;
        });
        this.scene.particles.spawn(0x7c4dff, 10, 5, 3);
        break;

      // ── Revive / special ──
      case 'rebirth':
        this.scene.lives = 5;
        this.scene.invincibleTimer = 3000;
        this.scene.particles.spawn(0xff6d00, 15, 6, 5);
        break;

      case 'time_travel':
      case 'time_rewind':
        this.scene.lives = 5;
        this.scene.particles.spawn(0x81c784, 15, 6, 5);
        break;

      case 'thousand_thunders':
        for (const e of this.scene.enemySystem.enemies) {
          e.hp -= skill.value;
        }
        this.scene.enemySystem.enemies = this.scene.enemySystem.enemies.filter(e => {
          if (e.hp <= 0) { e.sprite.destroy(); this.scene.onEnemyKilled(); return false; }
          return true;
        });
        this.scene.particles.spawn(0xffd600, 25, 8, 6);
        break;

      // ── Fallback: generic damage ──
      default:
        for (const e of this.scene.enemySystem.enemies) {
          if (Math.abs(e.sprite.x - this.scene.playerX) < 200) {
            e.hp -= skill.value;
          }
        }
        this.scene.enemySystem.enemies = this.scene.enemySystem.enemies.filter(e => {
          if (e.hp <= 0) { e.sprite.destroy(); this.scene.onEnemyKilled(); return false; }
          return true;
        });
        break;
    }
  }

  clear(): void {
    if (this.petSprite) {
      try { this.petSprite.destroy(); } catch { /* already destroyed */ }
      this.petSprite = null;
    }
  }
}
