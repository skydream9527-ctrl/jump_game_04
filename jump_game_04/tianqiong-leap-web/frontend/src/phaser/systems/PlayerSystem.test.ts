import { describe, it, expect, vi } from 'vitest';

// PlayerSystem 顶部 `import Phaser from 'phaser'` 会触发 Phaser 模块初始化，
// 其内部调用 canvas.getContext('2d')，而 jsdom 不支持，导致抛错。
// PlayerSystem 仅将 Phaser 用作类型标注（运行时擦除），故用空对象 mock 即可。
vi.mock('phaser', () => ({ default: {} }));

import { PlayerSystem } from './PlayerSystem';
import type { GameScene } from '../scenes/GameScene';

/**
 * 由于 PlayerSystem 构造接收 GameScene（Phaser.Scene 子类），
 * 我们用部分 mock 构造一个只包含被测方法依赖字段的对象。
 * 被测方法（applyPreciseLanding / activateAbility / updateAbility / clear）
 * 不调用 Phaser 渲染/物理 API，因此 mock 只需覆盖场景上的数据字段与
 * particles.spawn / audio.powerup 这两个副作用方法。
 */
function createMockScene(overrides: Partial<GameScene> = {}): GameScene {
  return {
    characterId: 0,
    playerX: 100,
    playerY: 200,
    playerWidth: 36,
    playerHeight: 44,
    speed: 3,
    distance: 0,
    lives: 3,
    shardsCollected: 0,
    particles: { spawn: vi.fn() } as unknown as GameScene['particles'],
    audio: { powerup: vi.fn() } as unknown as GameScene['audio'],
    ...overrides,
  } as unknown as GameScene;
}

describe('PlayerSystem.applyPreciseLanding', () => {
  it('零号在平台范围内时按 60% 吸附到中心', () => {
    const scene = createMockScene({ characterId: 1, playerX: 100 });
    const ps = new PlayerSystem(scene);
    ps.applyPreciseLanding(110, 100);
    // dx = 110 - 100 = 10, halfW = 50, |dx| < halfW → playerX += 10 * 0.6 = 6
    expect(scene.playerX).toBe(106);
  });

  it('零号不在平台范围内时不吸附', () => {
    const scene = createMockScene({ characterId: 1, playerX: 100 });
    const ps = new PlayerSystem(scene);
    ps.applyPreciseLanding(200, 60);
    // dx = 100, halfW = 30, |dx| > halfW → 不移动
    expect(scene.playerX).toBe(100);
  });

  it('非精准着陆角色（凌）不吸附', () => {
    const scene = createMockScene({ characterId: 0, playerX: 100 });
    const ps = new PlayerSystem(scene);
    ps.applyPreciseLanding(110, 100);
    expect(scene.playerX).toBe(100);
  });

  it('玩家在平台左侧也能向中心吸附（dx 为负）', () => {
    const scene = createMockScene({ characterId: 1, playerX: 120 });
    const ps = new PlayerSystem(scene);
    ps.applyPreciseLanding(100, 100);
    // dx = -20, |dx| < halfW(50) → playerX += -20 * 0.6 = -12 → 108
    expect(scene.playerX).toBe(108);
  });

  it('玩家恰在平台边缘外侧（|dx| == halfW）不吸附', () => {
    const scene = createMockScene({ characterId: 1, playerX: 100 });
    const ps = new PlayerSystem(scene);
    ps.applyPreciseLanding(150, 100);
    // dx = 50, halfW = 50, |dx| < halfW 为 false（相等）→ 不移动
    expect(scene.playerX).toBe(100);
  });

  it('推进冲刺角色（疾风）也不吸附', () => {
    const scene = createMockScene({ characterId: 3, playerX: 100 });
    const ps = new PlayerSystem(scene);
    ps.applyPreciseLanding(110, 100);
    expect(scene.playerX).toBe(100);
  });
});

describe('PlayerSystem.activateAbility', () => {
  it('冷却中不激活', () => {
    const scene = createMockScene({ characterId: 0, playerX: 100, distance: 0 });
    const ps = new PlayerSystem(scene);
    ps.abilityCooldown = 1000;
    ps.activateAbility();
    expect(scene.playerX).toBe(100);
    expect(scene.distance).toBe(0);
    expect(ps.abilityCooldown).toBe(1000);
    expect(ps.abilityInvincible).toBe(false);
    expect(scene.particles.spawn).not.toHaveBeenCalled();
  });

  it('技能持续中不重复激活', () => {
    const scene = createMockScene({ characterId: 0, playerX: 100, distance: 0 });
    const ps = new PlayerSystem(scene);
    ps.abilityActiveTimer = 200;
    ps.activateAbility();
    expect(scene.playerX).toBe(100);
    expect(ps.abilityCooldown).toBe(0);
  });

  it('能量冲刺（凌）激活后位移 + 无敌 + 进入冷却', () => {
    const scene = createMockScene({ characterId: 0, playerX: 100, distance: 50 });
    const ps = new PlayerSystem(scene);
    ps.activateAbility();
    expect(scene.playerX).toBe(220);  // 100 + 120 (ENERGY_DASH_DISTANCE)
    expect(scene.distance).toBe(170); // 50 + 120
    expect(ps.abilityCooldown).toBe(3000);
    expect(ps.abilityActiveTimer).toBe(400);
    expect(ps.abilityInvincible).toBe(true);
    expect(scene.particles.spawn).toHaveBeenCalledTimes(1);
    expect(scene.audio.powerup).toHaveBeenCalledTimes(1);
  });

  it('虚空跃迁（艾珂）激活后位移但无无敌', () => {
    const scene = createMockScene({ characterId: 2, playerX: 100, distance: 0 });
    const ps = new PlayerSystem(scene);
    ps.activateAbility();
    expect(scene.playerX).toBe(200);  // 100 + 100 (VOID_SHIFT_DISTANCE)
    expect(scene.distance).toBe(100);
    expect(ps.abilityCooldown).toBe(4000);
    expect(ps.abilityInvincible).toBe(false);
    expect(ps.abilityActiveTimer).toBe(0); // 虚空跃迁不设持续计时器
  });

  it('推进冲刺（疾风）激活后进入持续状态但不瞬间位移', () => {
    const scene = createMockScene({ characterId: 3, playerX: 100, distance: 0 });
    const ps = new PlayerSystem(scene);
    ps.activateAbility();
    expect(scene.playerX).toBe(100);  // 不瞬间位移
    expect(scene.distance).toBe(0);
    expect(ps.abilityActiveTimer).toBe(3000);
    expect(ps.abilityCooldown).toBe(5000);
    expect(ps.abilityInvincible).toBe(false);
  });

  it('精准着陆（零号）为被动，activateAbility 不触发', () => {
    const scene = createMockScene({ characterId: 1, playerX: 100, distance: 0 });
    const ps = new PlayerSystem(scene);
    ps.activateAbility();
    expect(scene.playerX).toBe(100);
    expect(scene.distance).toBe(0);
    expect(ps.abilityCooldown).toBe(0);
    expect(ps.abilityActiveTimer).toBe(0);
  });
});

describe('PlayerSystem.updateAbility', () => {
  it('冷却倒计时递减', () => {
    const scene = createMockScene({ characterId: 0 });
    const ps = new PlayerSystem(scene);
    ps.abilityCooldown = 3000;
    ps.updateAbility(1000, 1);
    expect(ps.abilityCooldown).toBe(2000);
  });

  it('冷却不为负（被钳制到 0）', () => {
    const scene = createMockScene({ characterId: 0 });
    const ps = new PlayerSystem(scene);
    ps.abilityCooldown = 500;
    ps.updateAbility(1000, 1);
    expect(ps.abilityCooldown).toBe(0);
  });

  it('持续技能计时器递减', () => {
    const scene = createMockScene({ characterId: 0 });
    const ps = new PlayerSystem(scene);
    ps.abilityActiveTimer = 1000;
    ps.updateAbility(400, 1);
    expect(ps.abilityActiveTimer).toBe(600);
  });

  it('持续技能结束时关闭无敌', () => {
    const scene = createMockScene({ characterId: 0 });
    const ps = new PlayerSystem(scene);
    ps.abilityActiveTimer = 300;
    ps.abilityInvincible = true;
    ps.updateAbility(400, 1);
    expect(ps.abilityActiveTimer).toBe(0);
    expect(ps.abilityInvincible).toBe(false);
  });

  it('推进冲刺期间持续加速（疾风）', () => {
    const scene = createMockScene({ characterId: 3, speed: 3, playerX: 100, distance: 0 });
    const ps = new PlayerSystem(scene);
    ps.abilityActiveTimer = 2000;
    ps.updateAbility(1000, 1);
    // speed * (PROPULSION_SPEED_MULT - 1) * normalized = 3 * 0.5 * 1 = 1.5
    expect(scene.playerX).toBe(101.5);
    expect(scene.distance).toBe(1.5);
    expect(ps.abilityActiveTimer).toBe(1000);
  });

  it('推进冲刺加速随 normalized 缩放', () => {
    const scene = createMockScene({ characterId: 3, speed: 4, playerX: 100, distance: 0 });
    const ps = new PlayerSystem(scene);
    ps.abilityActiveTimer = 2000;
    ps.updateAbility(500, 2);
    // speed * 0.5 * normalized = 4 * 0.5 * 2 = 4
    expect(scene.playerX).toBe(104);
    expect(scene.distance).toBe(4);
  });

  it('非推进角色持续期间不额外加速', () => {
    const scene = createMockScene({ characterId: 0, speed: 3, playerX: 100, distance: 0 });
    const ps = new PlayerSystem(scene);
    ps.abilityActiveTimer = 2000;
    ps.updateAbility(1000, 1);
    expect(scene.playerX).toBe(100);
    expect(scene.distance).toBe(0);
  });

  it('无技能状态时调用无副作用', () => {
    const scene = createMockScene({ characterId: 0, playerX: 100, distance: 0 });
    const ps = new PlayerSystem(scene);
    ps.updateAbility(1000, 1);
    expect(ps.abilityCooldown).toBe(0);
    expect(ps.abilityActiveTimer).toBe(0);
    expect(scene.playerX).toBe(100);
    expect(scene.distance).toBe(0);
  });
});

describe('PlayerSystem.clear', () => {
  it('重置所有技能与运动状态', () => {
    const scene = createMockScene();
    const ps = new PlayerSystem(scene);
    ps.iceSlideVX = 5;
    ps.dead = true;
    ps.abilityCooldown = 3000;
    ps.abilityActiveTimer = 2000;
    ps.abilityInvincible = true;
    ps.clear();
    expect(ps.iceSlideVX).toBe(0);
    expect(ps.dead).toBe(false);
    expect(ps.abilityCooldown).toBe(0);
    expect(ps.abilityActiveTimer).toBe(0);
    expect(ps.abilityInvincible).toBe(false);
  });
});
