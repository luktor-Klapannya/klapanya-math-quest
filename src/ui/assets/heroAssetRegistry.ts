/**
 * Central Hero Asset Registry
 * Provides authoritative paths and state fallback resolution for all 4 canonical hero classes (8 avatars).
 */

export type CanonicalHeroClass = 
  | 'SPEED_CHRONOMANCER'
  | 'LOGIC_PALADIN'
  | 'EAGLE_EYE_SNIPER'
  | 'REVERSE_ROGUE';

export type HeroGender = 'male' | 'female';
export type VisualLevel = 'L1' | 'L2' | 'L3' | 'L4';
export type HeroActionState = 'IDLE' | 'ATTACK' | 'HURT' | 'VICTORY';

export interface HeroVisualProfile {
  heroClass: CanonicalHeroClass;
  gender: HeroGender;
  nameEn: string;
  nameTh: string;
  titleTh: string;
  colorScheme: {
    primary: string;
    secondary: string;
    border: string;
    glow: string;
  };
  assets: {
    portrait: string;
    fullBody: string;
    battle: string;
    states: {
      IDLE: string;
      ATTACK?: string;
      HURT?: string;
      VICTORY?: string;
    };
    weapon: string;
    emblem: string;
  };
}

export const HERO_ASSET_REGISTRY: Record<string, HeroVisualProfile> = {
  // 1. SPEED CHRONOMANCER
  'SPEED_CHRONOMANCER_MALE': {
    heroClass: 'SPEED_CHRONOMANCER',
    gender: 'male',
    nameEn: 'Speed Chronomancer (Boy)',
    nameTh: 'นักเวทกาลเวลา (ชาย)',
    titleTh: 'จอมเวทผู้ควบคุมมิติเวลาและความเร็ว',
    colorScheme: {
      primary: '#00f0ff',
      secondary: '#3b82f6',
      border: 'border-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(0,240,255,0.4)]',
    },
    assets: {
      portrait: '/characters/heroes/hero_m_speed_chronomancer_portrait.png',
      fullBody: '/characters/heroes/hero_m_speed_chronomancer_fullbody.png',
      battle: '/characters/heroes/hero_m_speed_chronomancer_fullbody.png',
      states: {
        IDLE: '/characters/heroes/hero_m_speed_chronomancer_fullbody.png',
      },
      weapon: '/equipment/weapons/chrono_staff.svg',
      emblem: '/brand/seal.png',
    },
  },
  'SPEED_CHRONOMANCER_FEMALE': {
    heroClass: 'SPEED_CHRONOMANCER',
    gender: 'female',
    nameEn: 'Speed Chronomancer (Girl)',
    nameTh: 'นักเวทกาลเวลา (หญิง)',
    titleTh: 'จอมเวทผู้ควบคุมมิติเวลาและความเร็ว',
    colorScheme: {
      primary: '#00f0ff',
      secondary: '#8b5cf6',
      border: 'border-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(0,240,255,0.4)]',
    },
    assets: {
      portrait: '/characters/heroes/hero_f_speed_chronomancer_portrait.png',
      fullBody: '/characters/heroes/hero_f_speed_chronomancer_fullbody.png',
      battle: '/characters/heroes/hero_f_speed_chronomancer_fullbody.png',
      states: {
        IDLE: '/characters/heroes/hero_f_speed_chronomancer_fullbody.png',
      },
      weapon: '/equipment/weapons/chrono_staff.svg',
      emblem: '/brand/seal.png',
    },
  },

  // 2. LOGIC PALADIN
  'LOGIC_PALADIN_MALE': {
    heroClass: 'LOGIC_PALADIN',
    gender: 'male',
    nameEn: 'Logic Paladin (Boy)',
    nameTh: 'อัศวินตรรกะ (ชาย)',
    titleTh: 'ผู้พิทักษ์แห่งเหตุผลและโล่ตรรกะ',
    colorScheme: {
      primary: '#ffd700',
      secondary: '#38bdf8',
      border: 'border-amber-400',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    },
    assets: {
      portrait: '/characters/heroes/hero_m_logic_paladin_portrait.png',
      fullBody: '/characters/heroes/hero_m_logic_paladin_fullbody.png',
      battle: '/characters/heroes/hero_m_logic_paladin_fullbody.png',
      states: {
        IDLE: '/characters/heroes/hero_m_logic_paladin_fullbody.png',
      },
      weapon: '/equipment/weapons/logic_sword.svg',
      emblem: '/brand/seal.png',
    },
  },
  'LOGIC_PALADIN_FEMALE': {
    heroClass: 'LOGIC_PALADIN',
    gender: 'female',
    nameEn: 'Logic Paladin (Girl)',
    nameTh: 'อัศวินตรรกะ (หญิง)',
    titleTh: 'ผู้พิทักษ์แห่งเหตุผลและโล่ตรรกะ',
    colorScheme: {
      primary: '#ffd700',
      secondary: '#ec4899',
      border: 'border-amber-400',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    },
    assets: {
      portrait: '/characters/heroes/hero_f_logic_paladin_portrait.png',
      fullBody: '/characters/heroes/hero_f_logic_paladin_fullbody.png',
      battle: '/characters/heroes/hero_f_logic_paladin_fullbody.png',
      states: {
        IDLE: '/characters/heroes/hero_f_logic_paladin_fullbody.png',
      },
      weapon: '/equipment/weapons/logic_sword.svg',
      emblem: '/brand/seal.png',
    },
  },

  // 3. EAGLE-EYE SNIPER
  'EAGLE_EYE_SNIPER_MALE': {
    heroClass: 'EAGLE_EYE_SNIPER',
    gender: 'male',
    nameEn: 'Eagle-Eye Sniper (Boy)',
    nameTh: 'พลแม่นปืนเนตรเหยี่ยว (ชาย)',
    titleTh: 'นักแม่นปืนเรขาคณิตผู้มองทะลุจุดลวง',
    colorScheme: {
      primary: '#10b981',
      secondary: '#06b6d4',
      border: 'border-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    },
    assets: {
      portrait: '/characters/heroes/hero_m_eagle_eye_sniper_portrait.png',
      fullBody: '/characters/heroes/hero_m_eagle_eye_sniper_fullbody.png',
      battle: '/characters/heroes/hero_m_eagle_eye_sniper_fullbody.png',
      states: {
        IDLE: '/characters/heroes/hero_m_eagle_eye_sniper_fullbody.png',
      },
      weapon: '/equipment/weapons/geometry_bow.svg',
      emblem: '/brand/seal.png',
    },
  },
  'EAGLE_EYE_SNIPER_FEMALE': {
    heroClass: 'EAGLE_EYE_SNIPER',
    gender: 'female',
    nameEn: 'Eagle-Eye Sniper (Girl)',
    nameTh: 'พลแม่นปืนเนตรเหยี่ยว (หญิง)',
    titleTh: 'นักแม่นปืนเรขาคณิตผู้มองทะลุจุดลวง',
    colorScheme: {
      primary: '#10b981',
      secondary: '#f43f5e',
      border: 'border-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    },
    assets: {
      portrait: '/characters/heroes/hero_f_eagle_eye_sniper_portrait.png',
      fullBody: '/characters/heroes/hero_f_eagle_eye_sniper_fullbody.png',
      battle: '/characters/heroes/hero_f_eagle_eye_sniper_fullbody.png',
      states: {
        IDLE: '/characters/heroes/hero_f_eagle_eye_sniper_fullbody.png',
      },
      weapon: '/equipment/weapons/geometry_bow.svg',
      emblem: '/brand/seal.png',
    },
  },

  // 4. REVERSE ROGUE
  'REVERSE_ROGUE_MALE': {
    heroClass: 'REVERSE_ROGUE',
    gender: 'male',
    nameEn: 'Reverse Rogue (Boy)',
    nameTh: 'จอมโจรย้อนรอย (ชาย)',
    titleTh: 'จอมโจรพีชคณิตผู้ย้อนคิดแก้สมการ',
    colorScheme: {
      primary: '#a855f7',
      secondary: '#38bdf8',
      border: 'border-purple-400',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    },
    assets: {
      portrait: '/characters/heroes/hero_m_reverse_rogue_portrait.png',
      fullBody: '/characters/heroes/hero_m_reverse_rogue_fullbody.png',
      battle: '/characters/heroes/hero_m_reverse_rogue_fullbody.png',
      states: {
        IDLE: '/characters/heroes/hero_m_reverse_rogue_fullbody.png',
      },
      weapon: '/equipment/weapons/algebra_daggers.svg',
      emblem: '/brand/seal.png',
    },
  },
  'REVERSE_ROGUE_FEMALE': {
    heroClass: 'REVERSE_ROGUE',
    gender: 'female',
    nameEn: 'Reverse Rogue (Girl)',
    nameTh: 'จอมโจรย้อนรอย (หญิง)',
    titleTh: 'จอมโจรพีชคณิตผู้ย้อนคิดแก้สมการ',
    colorScheme: {
      primary: '#a855f7',
      secondary: '#fbbf24',
      border: 'border-purple-400',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    },
    assets: {
      portrait: '/characters/heroes/hero_f_reverse_rogue_portrait.png',
      fullBody: '/characters/heroes/hero_f_reverse_rogue_fullbody.png',
      battle: '/characters/heroes/hero_f_reverse_rogue_fullbody.png',
      states: {
        IDLE: '/characters/heroes/hero_f_reverse_rogue_fullbody.png',
      },
      weapon: '/equipment/weapons/algebra_daggers.svg',
      emblem: '/brand/seal.png',
    },
  },
};

/**
 * Resolves the visual level from player rank (R1–R7) without mutating progression logic.
 */
export function resolveVisualLevel(rank: string): VisualLevel {
  if (rank === 'R7') return 'L4'; // Sovereign Top Form
  if (rank === 'R5' || rank === 'R6') return 'L3'; // Master / Grandmaster
  if (rank === 'R3' || rank === 'R4') return 'L2'; // Adept / Scholar
  return 'L1'; // Novice / Apprentice (R1, R2)
}

/**
 * Resolves the hero sprite with fallback rule:
 * If state-specific asset (e.g. ATTACK/HURT) is absent, fallback cleanly to IDLE.
 */
export function getHeroSprite(
  heroClass: CanonicalHeroClass,
  gender: HeroGender = 'male',
  state: HeroActionState = 'IDLE'
): string {
  const key = `${heroClass}_${gender.toUpperCase()}`;
  const profile = HERO_ASSET_REGISTRY[key] || HERO_ASSET_REGISTRY['SPEED_CHRONOMANCER_MALE'];
  
  if (profile.assets.states && profile.assets.states[state]) {
    return profile.assets.states[state]!;
  }
  
  return profile.assets.fullBody;
}

export function getHeroPortrait(
  heroClass: CanonicalHeroClass,
  gender: HeroGender = 'male'
): string {
  const key = `${heroClass}_${gender.toUpperCase()}`;
  const profile = HERO_ASSET_REGISTRY[key] || HERO_ASSET_REGISTRY['SPEED_CHRONOMANCER_MALE'];
  return profile.assets.portrait;
}
