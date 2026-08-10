import { describe, it, expect, vi } from 'vitest';

// BossSystem 顶部 `import Phaser from 'phaser'` 会触发 Phaser 模块初始化，
// 其内部调用 canvas.getContext('2d')，而 jsdom 不支持，导致抛错。
// BossSystem 仅将 Phaser 用作类型标注（运行时擦除），故用空对象 mock 即可。
vi.mock('phaser', () => ({ default: {} }));

import { BossSystem } from './BossSystem';
import type { GameScene } from '../scenes/GameScene';

/**
 * BossSystem.update 与 Phaser 深度耦合（sprite.setTint / clearTint / tweens 等），
 * 但其「弱点窗口机制」（攻击中无敌 → 攻击结束暴露弱点 2.2s → 窗口结束恢复无敌）
 * 是纯状态机逻辑，可通过手动构造 boss 对象 + mock sprite 来测。
 *
 * 这里只测状态机转换，跳过渲染相关副作用。
 */

function createMockSprite() {
  return {
    x: 500,
    y: 196,
    setDisplaySize: vi.fn(),
    setDepth: vi.fn(),
    setTint: vi.fn(),
    clearTint: vi.fn(),
    setScale: vi.fn(),
    setAlpha: vi.fn(),
    destroy: vi.fn(),
    active: true,
  };
}

function createMockScene(overrides: Record<string, unknown> = {}): GameScene {
  return {
    config: { chapter: 1, level: 10 },
    playerX: 100,
    playerY: 200,
    playerWidth: 36,
    playerHeight: 44,
    time: { now: 0 },
    // playerVY = 0 → 跳过「玩家踩 Boss」碰撞块
    playerSystem: { playerVY: 0 },
    // ninjaArt 未激活 → 但玩家距 Boss 远，不会触发 onPlayerFall
    ninjaArtSystem: { ninjaArtActive: false, ninjaArtType: null },
    particles: { spawn: vi.fn() },
    score: 0,
    hudNeedsUpdate: false,
    onPlayerFall: vi.fn(),
    onBossDefeated: vi.fn(),
    tweens: { add: vi.fn() },
    add: {
      image: vi.fn(() => createMockSprite()),
      graphics: vi.fn(() => ({
        setDepth: vi.fn(),
        setScrollFactor: vi.fn(),
        clear: vi.fn(),
        fillStyle: vi.fn(),
        fillRoundedRect: vi.fn(),
        destroy: vi.fn(),
      })),
    },
    ...overrides,
  } as unknown as GameScene;
}

interface MockBoss {
  sprite: ReturnType<typeof createMockSprite>;
  hp: number;
  maxHp: number;
  phase: string;
  attackTimer: number;
  currentAttack: number;
  attackCooldown: number;
  invulnerable: boolean;
  vulnerableTimer: number;
  vulnerabilityFlash: number;
}

function createMockBoss(overrides: Partial<MockBoss> = {}): MockBoss {
  return {
    sprite: createMockSprite(),
    hp: 30,
    maxHp: 30,
    phase: 'idle',
    attackTimer: 99999, // 设很大，避免触发 executeBossAttack
    currentAttack: 0,
    attackCooldown: 0,
    invulnerable: true,
    vulnerableTimer: 0,
    vulnerabilityFlash: 0,
    ...overrides,
  };
}

describe('BossSystem 弱点窗口机制', () => {
  it('攻击进行中：保持无敌并预置弱点窗口', () => {
    const scene = createMockScene();
    const bs = new BossSystem(scene);
    bs.boss = createMockBoss({
      attackCooldown: 800, // 攻击进行中
      invulnerable: false,
    }) as unknown as BossSystem['boss'];
    bs.bossHpBar = null; // 跳过 drawHPBar

    bs.update(100, 1);

    expect(bs.boss!.invulnerable).toBe(true);
    expect(bs.boss!.vulnerableTimer).toBe(2200); // VULNERABLE_WINDOW_MS
    expect(bs.boss!.attackCooldown).toBe(700);   // 800 - 100
    expect(bs.boss!.sprite.clearTint).toHaveBeenCalled();
  });

  it('攻击结束后：进入弱点窗口，可被攻击', () => {
    const scene = createMockScene();
    const bs = new BossSystem(scene);
    bs.boss = createMockBoss({
      attackCooldown: 0, // 攻击已结束
      invulnerable: true,
      vulnerableTimer: 2200,
    }) as unknown as BossSystem['boss'];
    bs.bossHpBar = null;

    bs.update(100, 1);

    expect(bs.boss!.invulnerable).toBe(false);    // 弱点期可被打
    expect(bs.boss!.vulnerableTimer).toBe(2100);  // 2200 - 100
  });

  it('弱点窗口期间调用 setTint 闪烁', () => {
    const scene = createMockScene();
    const bs = new BossSystem(scene);
    bs.boss = createMockBoss({
      attackCooldown: 0,
      invulnerable: true,
      vulnerableTimer: 2200,
      vulnerabilityFlash: 0,
    }) as unknown as BossSystem['boss'];
    bs.bossHpBar = null;

    bs.update(100, 1);

    expect(bs.boss!.sprite.setTint).toHaveBeenCalled();
  });

  it('弱点窗口耗尽（vulnerableTimer 已为 0）：恢复无敌', () => {
    const scene = createMockScene();
    const bs = new BossSystem(scene);
    bs.boss = createMockBoss({
      attackCooldown: 0,
      invulnerable: false,
      vulnerableTimer: 0, // 窗口已耗尽
    }) as unknown as BossSystem['boss'];
    bs.bossHpBar = null;

    bs.update(100, 1);

    expect(bs.boss!.invulnerable).toBe(true);
    expect(bs.boss!.sprite.clearTint).toHaveBeenCalled();
  });

  it('弱点窗口倒计时归零后下一帧恢复无敌', () => {
    const scene = createMockScene();
    const bs = new BossSystem(scene);
    bs.boss = createMockBoss({
      attackCooldown: 0,
      invulnerable: false,
      vulnerableTimer: 50, // 即将耗尽
    }) as unknown as BossSystem['boss'];
    bs.bossHpBar = null;

    // 第一帧：50 > 0 → 进入弱点分支，倒计时变 -50，仍标记为可攻击
    bs.update(100, 1);
    expect(bs.boss!.invulnerable).toBe(false);

    // 第二帧：-50 不 > 0 → 进入 else，恢复无敌
    bs.update(100, 1);
    expect(bs.boss!.invulnerable).toBe(true);
  });

  it('攻击中 → 弱点期 → 窗口结束 的完整状态机流转', () => {
    const scene = createMockScene();
    const bs = new BossSystem(scene);
    // attackCooldown=200：分支在递减前判断 >0，需两帧递减到恰好 0，第三帧才进入弱点分支。
    bs.boss = createMockBoss({
      attackCooldown: 200,
      invulnerable: false,
      vulnerableTimer: 0,
    }) as unknown as BossSystem['boss'];
    bs.bossHpBar = null;

    // 帧1：attackCooldown=200 > 0 → 攻击分支 → 100，无敌
    bs.update(100, 1);
    expect(bs.boss!.invulnerable).toBe(true);
    expect(bs.boss!.attackCooldown).toBe(100);

    // 帧2：attackCooldown=100 > 0 → 攻击分支 → 归 0，仍无敌
    bs.update(100, 1);
    expect(bs.boss!.attackCooldown).toBe(0);
    expect(bs.boss!.invulnerable).toBe(true);

    // 帧3：attackCooldown=0（不 > 0）→ 进入弱点分支 → 可被打
    bs.update(100, 1);
    expect(bs.boss!.invulnerable).toBe(false);
    expect(bs.boss!.vulnerableTimer).toBe(2100); // 2200 - 100

    // 帧4：把剩余窗口一次性倒完（帧开始时 > 0 → 走 >0 分支，倒计时到负）
    bs.update(2200, 1);
    expect(bs.boss!.invulnerable).toBe(false); // 本帧仍走了 >0 分支

    // 帧5：vulnerableTimer <= 0 → 恢复无敌
    bs.update(100, 1);
    expect(bs.boss!.invulnerable).toBe(true);
  });

  it('无 boss 时 update 无副作用', () => {
    const scene = createMockScene();
    const bs = new BossSystem(scene);
    bs.boss = null;
    expect(() => bs.update(100, 1)).not.toThrow();
  });
});

describe('BossSystem.clear', () => {
  it('清理 boss 与血条并置 null', () => {
    const scene = createMockScene();
    const bs = new BossSystem(scene);
    const sprite = createMockSprite();
    bs.boss = createMockBoss({ sprite }) as unknown as BossSystem['boss'];
    bs.bossHpBar = { destroy: vi.fn(), clear: vi.fn() } as unknown as BossSystem['bossHpBar'];

    bs.clear();

    expect(sprite.destroy).toHaveBeenCalled();
    expect(bs.boss).toBeNull();
    expect(bs.bossHpBar).toBeNull();
  });

  it('无 boss / 无血条时清理不抛错', () => {
    const scene = createMockScene();
    const bs = new BossSystem(scene);
    bs.boss = null;
    bs.bossHpBar = null;
    expect(() => bs.clear()).not.toThrow();
  });
});
