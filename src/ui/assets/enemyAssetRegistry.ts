/**
 * Central Enemy Asset Registry
 * Provides authoritative paths and state resolution for all opponents, sparring dummies, and bosses.
 */

export type EnemyKey = 
  | 'FROST_DUMMY'
  | 'SNOW_DEVIL'
  | 'ICE_MONSTER'
  | 'BIG_FOOT'
  | 'CYBER_FROST_DRAGON'
  | 'SPEED_GOLEM'
  | 'OPERATOR_ARCHMAGE';

export type EnemyActionState = 'NORMAL' | 'BOSS' | 'HIT' | 'DEFEAT';

export interface EnemyVisualProfile {
  id: EnemyKey;
  nameEn: string;
  nameTh: string;
  isTrueBoss: boolean;
  colorScheme: {
    primary: string;
    glow: string;
    border: string;
  };
  assets: {
    base: string;
    states: {
      NORMAL: string;
      BOSS?: string;
      HIT?: string;
      DEFEAT?: string;
    };
  };
}

export const ENEMY_ASSET_REGISTRY: Record<EnemyKey, EnemyVisualProfile> = {
  FROST_DUMMY: {
    id: 'FROST_DUMMY',
    nameEn: 'Frost Training Dummy',
    nameTh: 'หุ่นฟรอสต์ฝึกซ้อมโดโจ',
    isTrueBoss: false,
    colorScheme: {
      primary: '#38bdf8',
      glow: 'shadow-[0_0_20px_rgba(56,189,248,0.4)]',
      border: 'border-cyan-400',
    },
    assets: {
      base: '/characters/enemies/frost_dummy.png',
      states: {
        NORMAL: '/characters/enemies/frost_dummy_normal.png',
        HIT: '/characters/enemies/frost_dummy_hit.png',
        DEFEAT: '/characters/enemies/frost_dummy_defeat.png',
      },
    },
  },
  SNOW_DEVIL: {
    id: 'SNOW_DEVIL',
    nameEn: 'Snow Devil',
    nameTh: 'ภูตหิมะจอมป่วน',
    isTrueBoss: false,
    colorScheme: {
      primary: '#38bdf8',
      glow: 'shadow-[0_0_20px_rgba(56,189,248,0.4)]',
      border: 'border-sky-400',
    },
    assets: {
      base: '/characters/enemies/snow_devil.png',
      states: {
        NORMAL: '/characters/enemies/snow_devil_normal.png',
        HIT: '/characters/enemies/snow_devil_hit.png',
        DEFEAT: '/characters/enemies/snow_devil_defeat.png',
      },
    },
  },
  ICE_MONSTER: {
    id: 'ICE_MONSTER',
    nameEn: 'Ice Monster',
    nameTh: 'อสูรน้ำแข็งโบราณ',
    isTrueBoss: false,
    colorScheme: {
      primary: '#0284c7',
      glow: 'shadow-[0_0_25px_rgba(2,132,199,0.4)]',
      border: 'border-blue-400',
    },
    assets: {
      base: '/characters/enemies/ice_monster.png',
      states: {
        NORMAL: '/characters/enemies/ice_monster_normal.png',
        HIT: '/characters/enemies/ice_monster_hit.png',
        DEFEAT: '/characters/enemies/ice_monster_defeat.png',
      },
    },
  },
  BIG_FOOT: {
    id: 'BIG_FOOT',
    nameEn: 'Big Foot Yeti',
    nameTh: 'ยักษ์เหมันต์บิ๊กฟุต',
    isTrueBoss: false,
    colorScheme: {
      primary: '#0369a1',
      glow: 'shadow-[0_0_25px_rgba(3,105,161,0.4)]',
      border: 'border-cyan-500',
    },
    assets: {
      base: '/characters/enemies/big_foot.png',
      states: {
        NORMAL: '/characters/enemies/big_foot_normal.png',
        HIT: '/characters/enemies/big_foot_hit.png',
        DEFEAT: '/characters/enemies/big_foot_defeat.png',
      },
    },
  },
  CYBER_FROST_DRAGON: {
    id: 'CYBER_FROST_DRAGON',
    nameEn: 'Cyber Frost Dragon',
    nameTh: 'มังกรไซเบอร์ฟรอสต์มหาปราสาท',
    isTrueBoss: true,
    colorScheme: {
      primary: '#f43f5e',
      glow: 'shadow-[0_0_35px_rgba(244,63,94,0.5)]',
      border: 'border-rose-400',
    },
    assets: {
      base: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
      states: {
        NORMAL: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
        BOSS: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
      },
    },
  },
  SPEED_GOLEM: {
    id: 'SPEED_GOLEM',
    nameEn: 'Speed Glacial Golem',
    nameTh: 'โกเลมหินผาผลึกน้ำแข็ง',
    isTrueBoss: true,
    colorScheme: {
      primary: '#a855f7',
      glow: 'shadow-[0_0_35px_rgba(168,85,247,0.5)]',
      border: 'border-purple-400',
    },
    assets: {
      base: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
      states: {
        NORMAL: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
        BOSS: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
      },
    },
  },
  OPERATOR_ARCHMAGE: {
    id: 'OPERATOR_ARCHMAGE',
    nameEn: 'Operator Archmage',
    nameTh: 'มหาจอมเวทผู้พิทักษ์สมการ',
    isTrueBoss: true,
    colorScheme: {
      primary: '#3b82f6',
      glow: 'shadow-[0_0_35px_rgba(59,130,246,0.5)]',
      border: 'border-blue-400',
    },
    assets: {
      base: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
      states: {
        NORMAL: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
        BOSS: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
      },
    },
  },
};

export function getEnemySprite(
  enemyKey: EnemyKey,
  state: EnemyActionState = 'NORMAL'
): string {
  const profile = ENEMY_ASSET_REGISTRY[enemyKey] || ENEMY_ASSET_REGISTRY.FROST_DUMMY;
  if (profile.assets.states && profile.assets.states[state]) {
    return profile.assets.states[state]!;
  }
  return profile.assets.base;
}
