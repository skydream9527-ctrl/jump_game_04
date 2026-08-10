import type { PlatformType } from './levels';

export interface PlatformTypeConfig {
  type: PlatformType;
  chapter: number;       // which chapter introduces this type
  spawnChance: number;   // 0-1, chance per platform in that chapter
  friction: number;      // 1.0 = normal, <1 = slippery, >1 = sticky
  meltTime: number;      // ms before melting, 0 = no melt
  invisible: boolean;    // starts hidden?
  fadeDistance: number;  // px distance to start fading in, 0 = always visible
}

export const PLATFORM_TYPE_CONFIGS: Record<PlatformType, PlatformTypeConfig> = {
  normal: {
    type: 'normal',
    chapter: 1,
    spawnChance: 1.0,
    friction: 1.0,
    meltTime: 0,
    invisible: false,
    fadeDistance: 0,
  },
  ice: {
    type: 'ice',
    chapter: 5,
    spawnChance: 0.35,
    friction: 0.15,
    meltTime: 0,
    invisible: false,
    fadeDistance: 0,
  },
  melting: {
    type: 'melting',
    chapter: 6,
    spawnChance: 0.30,
    friction: 1.0,
    meltTime: 1500,
    invisible: false,
    fadeDistance: 0,
  },
  invisible: {
    type: 'invisible',
    chapter: 9,
    spawnChance: 0.30,
    friction: 1.0,
    meltTime: 0,
    invisible: true,
    fadeDistance: 180,
  },
  liquid_metal: {
    type: 'liquid_metal',
    chapter: 4,
    spawnChance: 0.25,
    friction: 0.7,
    meltTime: 0,
    invisible: false,
    fadeDistance: 0,
  },
};
