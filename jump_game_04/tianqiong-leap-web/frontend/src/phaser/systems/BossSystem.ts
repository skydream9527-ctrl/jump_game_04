import Phaser from 'phaser';
import { PHYSICS } from '../../constants/physics';
import { BULLET_SIZE, BULLET_SPEED } from '../../constants/enemies';
import { getBossConfig, type BossPhase, type BossAttack } from '../../constants/boss';
import type { GameScene } from '../scenes/GameScene';

const HUD_DEPTH = 100;
const VULNERABLE_WINDOW_MS = 2200;  // 攻击后暴露弱点的窗口期（2.2秒）
const VULNERABLE_FLASH_RATE = 90;   // 弱点闪烁间隔（ms，越小闪得越快）

interface Boss {
  sprite: Phaser.GameObjects.Image;
  hp: number;
  maxHp: number;
  phase: BossPhase;
  attackTimer: number;
  currentAttack: number;
  attackCooldown: number;
  invulnerable: boolean;
  vulnerableTimer: number;     // 攻击后暴露弱点的窗口期剩余时间（ms）
  vulnerabilityFlash: number;  // 弱点闪烁视觉计时器
}

export class BossSystem {
  // public for system access (refactor in progress)
  boss: Boss | null = null;
  // public for system access (refactor in progress)
  bossHpBar: Phaser.GameObjects.Graphics | null = null;
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  spawn(): void {
    const bossCfg = getBossConfig(this.scene.config.chapter);
    const bx = this.scene.playerX + PHYSICS.CANVAS_WIDTH * 0.6;
    const by = PHYSICS.CANVAS_HEIGHT / 2;

    const sprite = this.scene.add.image(bx, by, `boss-${this.scene.config.chapter}`);
    sprite.setDisplaySize(bossCfg.width, bossCfg.height);
    sprite.setDepth(25);

    this.boss = {
      sprite,
      hp: bossCfg.hp,
      maxHp: bossCfg.hp,
      phase: 'idle',
      attackTimer: 2000,
      currentAttack: 0,
      attackCooldown: 0,
      invulnerable: true,
      vulnerableTimer: 0,
      vulnerabilityFlash: 0,
    };

    this.bossHpBar = this.scene.add.graphics();
    this.bossHpBar.setDepth(HUD_DEPTH + 2);
    this.bossHpBar.setScrollFactor(0);
  }

  update(delta: number, normalized: number): void {
    if (!this.boss) return;

    const bossCfg = getBossConfig(this.scene.config.chapter);
    const b = this.boss;

    const targetX = this.scene.playerX + PHYSICS.CANVAS_WIDTH * 0.4;
    b.sprite.x += (targetX - b.sprite.x) * 0.02 * normalized;

    const hpPercent = (b.hp / b.maxHp) * 100;
    let speedMult = 1;
    for (const ph of bossCfg.phases) {
      if (hpPercent <= ph.hpThreshold) {
        b.phase = ph.phase;
        speedMult = ph.speedMultiplier;
      }
    }

    b.attackTimer -= delta;
    if (b.attackTimer <= 0) {
      const attack = bossCfg.attacks[b.currentAttack % bossCfg.attacks.length];
      b.attackCooldown = attack.duration;
      b.currentAttack++;
      b.attackTimer = attack.duration + attack.cooldown;

      this.executeBossAttack(attack.pattern, speedMult);
    }

    // ── 弱点窗口期机制 ──
    // 攻击进行中：无敌（玩家无法踩到）
    // 攻击刚结束：暴露弱点 VULNERABLE_WINDOW_MS 毫秒，可被踩
    // 弱点窗口结束：恢复无敌，直到下次攻击结束
    if (b.attackCooldown > 0) {
      b.attackCooldown -= delta;
      b.invulnerable = true;                       // 攻击中无敌
      b.vulnerableTimer = VULNERABLE_WINDOW_MS;     // 预置：攻击结束即进入弱点期
      b.vulnerabilityFlash = 0;
      b.sprite.clearTint();                         // 攻击中正常显示
    } else {
      // 攻击已结束，进入弱点窗口倒计时
      if (b.vulnerableTimer > 0) {
        b.vulnerableTimer -= delta;
        b.invulnerable = false;                     // 弱点期可被打
        // 闪烁视觉：用 tint 在橙黄和正常间快速切换，提示玩家"现在可踩"
        b.vulnerabilityFlash += delta;
        const flashOn = Math.floor(b.vulnerabilityFlash / VULNERABLE_FLASH_RATE) % 2 === 0;
        b.sprite.setTint(flashOn ? 0xffee88 : 0xffffff);
      } else {
        b.invulnerable = true;                       // 窗口结束，恢复无敌
        b.sprite.clearTint();
      }
    }

    b.sprite.y = PHYSICS.CANVAS_HEIGHT / 2 + Math.sin(this.scene.time.now * 0.002) * 15;

    if (this.scene.playerSystem.playerVY > 0) {
      const playerBottom = this.scene.playerY + this.scene.playerHeight / 2;
      const dx = this.scene.playerX - b.sprite.x;
      const dy = playerBottom - b.sprite.y;
      const hitW = bossCfg.width * 0.6;
      const hitH = bossCfg.height * 0.4;
      if (dx * dx < hitW * hitW && dy * dy < hitH * hitH && !b.invulnerable) {
        b.hp--;
        // 命中后立刻结束弱点窗口，Boss 恢复无敌并短暂后撤再反击
        b.vulnerableTimer = 0;
        b.invulnerable = true;
        b.sprite.clearTint();
        b.attackTimer = Math.max(b.attackTimer, 900);  // 至少 0.9s 后再攻击
        this.scene.playerSystem.playerVY = PHYSICS.JUMP_FORCE * 0.7;
        this.scene.particles.spawn(0xff0000, 6, 4, 3);
        this.scene.score += 100;
        this.scene.hudNeedsUpdate = true;
        if (b.hp <= 0) {
          this.scene.onBossDefeated();
          return;
        }
      }
    }

    if (!this.scene.ninjaArtSystem.ninjaArtActive || this.scene.ninjaArtSystem.ninjaArtType !== 'dash') {
      const dx = this.scene.playerX - b.sprite.x;
      const dy = this.scene.playerY - b.sprite.y;
      if (dx * dx < (bossCfg.width * 0.5 + this.scene.playerWidth * 0.3) ** 2 &&
          dy * dy < (bossCfg.height * 0.5 + this.scene.playerHeight * 0.3) ** 2) {
        this.scene.onPlayerFall();
      }
    }

    this.drawHPBar();
  }

  private executeBossAttack(pattern: BossAttack['pattern'], speedMult: number): void {
    if (!this.boss) return;
    const bx = this.boss.sprite.x;
    const by = this.boss.sprite.y;

    switch (pattern) {
      case 'charge':
        this.scene.tweens.add({
          targets: this.boss.sprite,
          x: this.scene.playerX + 60,
          duration: 400 / speedMult,
          yoyo: true,
          ease: 'Power2',
        });
        break;
      case 'barrage':
        for (let a = -30; a <= 30; a += 15) {
          const rad = (a * Math.PI) / 180;
          const sprite = this.scene.add.image(bx - 20, by, 'bullet');
          sprite.setDisplaySize(BULLET_SIZE, BULLET_SIZE);
          sprite.setDepth(10);
          this.scene.enemySystem.bullets.push({
            sprite,
            vx: Math.cos(rad) * -BULLET_SPEED * speedMult,
            vy: Math.sin(rad) * BULLET_SPEED * speedMult,
          });
        }
        break;
      case 'slam':
        this.scene.tweens.add({
          targets: this.boss.sprite,
          y: by - 80,
          duration: 300,
          onComplete: () => {
            this.scene.tweens.add({
              targets: this.boss!.sprite,
              y: PHYSICS.CANVAS_HEIGHT / 2,
              duration: 200,
              onComplete: () => {
                for (let a = 0; a < 360; a += 45) {
                  const rad = (a * Math.PI) / 180;
                  const sprite = this.scene.add.image(bx, this.boss!.sprite.y, 'bullet');
                  sprite.setDisplaySize(BULLET_SIZE * 1.5, BULLET_SIZE * 1.5);
                  sprite.setDepth(10);
                  this.scene.enemySystem.bullets.push({
                    sprite,
                    vx: Math.cos(rad) * BULLET_SPEED * 0.8,
                    vy: Math.sin(rad) * BULLET_SPEED * 0.8,
                  });
                }
              },
            });
          },
        });
        break;
      case 'sweep':
        this.scene.tweens.add({
          targets: this.boss.sprite,
          y: PHYSICS.CANVAS_HEIGHT - 60,
          duration: 400 / speedMult,
          yoyo: true,
          ease: 'Sine.easeInOut',
        });
        break;
    }
  }

  drawHPBar(): void {
    if (!this.boss || !this.bossHpBar) return;
    const barW = 200;
    const barH = 8;
    const barX = (PHYSICS.CANVAS_WIDTH - barW) / 2;
    const barY = 10;

    this.bossHpBar.clear();
    this.bossHpBar.fillStyle(0x333333, 0.8);
    this.bossHpBar.fillRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 3);

    const hpRatio = this.boss.hp / this.boss.maxHp;
    const hpColor = hpRatio > 0.5 ? 0xff4444 : hpRatio > 0.25 ? 0xff8800 : 0xff0000;
    this.bossHpBar.fillStyle(hpColor, 1);
    this.bossHpBar.fillRoundedRect(barX, barY, barW * hpRatio, barH, 2);
  }

  clear(): void {
    if (this.boss) {
      try { this.boss.sprite.destroy(); } catch { /* already destroyed */ }
      this.boss = null;
    }
    if (this.bossHpBar) {
      try { this.bossHpBar.destroy(); } catch { /* already destroyed */ }
      this.bossHpBar = null;
    }
  }
}
