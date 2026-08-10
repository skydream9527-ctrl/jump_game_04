import { describe, it, expect } from 'vitest';
import { CHARACTERS, getCharacterById } from './characters';

describe('CHARACTERS 数据', () => {
  it('有 4 个角色', () => {
    expect(CHARACTERS).toHaveLength(4);
  });

  it('角色 id 与下标对应', () => {
    CHARACTERS.forEach((c, i) => {
      expect(c.id).toBe(i);
    });
  });

  it('displayName 与预期一致', () => {
    expect(CHARACTERS[0].displayName).toBe('凌');
    expect(CHARACTERS[1].displayName).toBe('零号');
    expect(CHARACTERS[2].displayName).toBe('艾珂');
    expect(CHARACTERS[3].displayName).toBe('疾风');
  });
});

describe('ability 字段', () => {
  it('每个角色都有 ability 字段且含 type/name/cooldown/duration', () => {
    for (const c of CHARACTERS) {
      expect(c.ability).toBeDefined();
      expect(typeof c.ability.type).toBe('string');
      expect(c.ability.type).not.toBeNull();
      expect(typeof c.ability.name).toBe('string');
      expect(typeof c.ability.cooldown).toBe('number');
      expect(typeof c.ability.duration).toBe('number');
    }
  });

  it('凌(0) ability.type === "energy_dash"', () => {
    expect(CHARACTERS[0].ability.type).toBe('energy_dash');
  });

  it('零号(1) ability.type === "precise_landing"', () => {
    expect(CHARACTERS[1].ability.type).toBe('precise_landing');
  });

  it('艾珂(2) ability.type === "void_shift"', () => {
    expect(CHARACTERS[2].ability.type).toBe('void_shift');
  });

  it('疾风(3) ability.type === "propulsion"', () => {
    expect(CHARACTERS[3].ability.type).toBe('propulsion');
  });

  it('被动技能 (precise_landing) cooldown=0', () => {
    expect(CHARACTERS[1].ability.cooldown).toBe(0);
  });

  it('主动技能 cooldown > 0', () => {
    expect(CHARACTERS[0].ability.cooldown).toBeGreaterThan(0);
    expect(CHARACTERS[2].ability.cooldown).toBeGreaterThan(0);
    expect(CHARACTERS[3].ability.cooldown).toBeGreaterThan(0);
  });
});

describe('getCharacterById', () => {
  it('id=0/1/2/3 正常返回对应角色', () => {
    expect(getCharacterById(0).id).toBe(0);
    expect(getCharacterById(0).displayName).toBe('凌');
    expect(getCharacterById(1).displayName).toBe('零号');
    expect(getCharacterById(2).displayName).toBe('艾珂');
    expect(getCharacterById(3).displayName).toBe('疾风');
  });

  it('越界 id=99 回退到 CHARACTERS[0]', () => {
    expect(getCharacterById(99)).toBe(CHARACTERS[0]);
    expect(getCharacterById(99).id).toBe(0);
  });

  it('负数 id 回退到 CHARACTERS[0]', () => {
    expect(getCharacterById(-1)).toBe(CHARACTERS[0]);
  });
});
