import { AvatarVisualId, AvatarGender } from '../types/learning';
import { HeroClassId } from '../types';

export interface CharacterVisualEntry {
  registryKey: string;
  avatarId: AvatarVisualId;
  heroClass: HeroClassId;
  gender: AvatarGender;
  titleThai: string;
  titleEng: string;
  portraitAsset: string;
  fullBodyAsset: string;
  battleAsset: string;
  victoryAsset: string;
  classEmblemAsset: string;
  weaponAsset: string;
  themeColor: string;
  accentGlow: string;
}

export const CHARACTER_VISUAL_REGISTRY: Record<string, CharacterVisualEntry> = {
  hero_m_speed_chronomancer: {
    registryKey: 'hero_m_speed_chronomancer',
    avatarId: 'BOY_WIZARD',
    heroClass: 'CHRONOMANCER',
    gender: 'BOY',
    titleThai: 'จอมเวทกาลเวลา (ชาย)',
    titleEng: 'Speed Chronomancer (Boy)',
    portraitAsset: '/characters/hero_m_speed_chronomancer_portrait.png',
    fullBodyAsset: '/characters/hero_m_speed_chronomancer_full.png',
    battleAsset: '/characters/hero_m_speed_chronomancer_battle.png',
    victoryAsset: '/characters/hero_m_speed_chronomancer_victory.png',
    classEmblemAsset: '/icons/emblem_chronomancer.svg',
    weaponAsset: '/weapons/chronos_frost_staff.svg',
    themeColor: 'cyan',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
  },
  hero_f_speed_chronomancer: {
    registryKey: 'hero_f_speed_chronomancer',
    avatarId: 'GIRL_WIZARD',
    heroClass: 'CHRONOMANCER',
    gender: 'GIRL',
    titleThai: 'จอมเวทกาลเวลา (หญิง)',
    titleEng: 'Speed Chronomancer (Girl)',
    portraitAsset: '/characters/hero_f_speed_chronomancer_portrait.png',
    fullBodyAsset: '/characters/hero_f_speed_chronomancer_full.png',
    battleAsset: '/characters/hero_f_speed_chronomancer_battle.png',
    victoryAsset: '/characters/hero_f_speed_chronomancer_victory.png',
    classEmblemAsset: '/icons/emblem_chronomancer.svg',
    weaponAsset: '/weapons/chronos_frost_staff.svg',
    themeColor: 'purple',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
  },
  hero_m_logic_paladin: {
    registryKey: 'hero_m_logic_paladin',
    avatarId: 'BOY_KNIGHT',
    heroClass: 'PALADIN',
    gender: 'BOY',
    titleThai: 'อัศวินตรรกะศิลา (ชาย)',
    titleEng: 'Logic Paladin (Boy)',
    portraitAsset: '/characters/hero_m_logic_paladin_portrait.png',
    fullBodyAsset: '/characters/hero_m_logic_paladin_full.png',
    battleAsset: '/characters/hero_m_logic_paladin_battle.png',
    victoryAsset: '/characters/hero_m_logic_paladin_victory.png',
    classEmblemAsset: '/icons/emblem_paladin.svg',
    weaponAsset: '/weapons/aegis_logic_spear.svg',
    themeColor: 'blue',
    accentGlow: 'rgba(59, 130, 246, 0.4)',
  },
  hero_f_logic_paladin: {
    registryKey: 'hero_f_logic_paladin',
    avatarId: 'GIRL_KNIGHT',
    heroClass: 'PALADIN',
    gender: 'GIRL',
    titleThai: 'อัศวินตรรกะศิลา (หญิง)',
    titleEng: 'Logic Paladin (Girl)',
    portraitAsset: '/characters/hero_f_logic_paladin_portrait.png',
    fullBodyAsset: '/characters/hero_f_logic_paladin_full.png',
    battleAsset: '/characters/hero_f_logic_paladin_battle.png',
    victoryAsset: '/characters/hero_f_logic_paladin_victory.png',
    classEmblemAsset: '/icons/emblem_paladin.svg',
    weaponAsset: '/weapons/aegis_logic_spear.svg',
    themeColor: 'sky',
    accentGlow: 'rgba(14, 165, 233, 0.4)',
  },
  hero_m_eagle_eye_sniper: {
    registryKey: 'hero_m_eagle_eye_sniper',
    avatarId: 'BOY_RANGER',
    heroClass: 'SNIPER',
    gender: 'BOY',
    titleThai: 'สไนเปอร์ตาอินทรี (ชาย)',
    titleEng: 'Eagle-Eye Sniper (Boy)',
    portraitAsset: '/characters/hero_m_eagle_eye_sniper_portrait.png',
    fullBodyAsset: '/characters/hero_m_eagle_eye_sniper_full.png',
    battleAsset: '/characters/hero_m_eagle_eye_sniper_battle.png',
    victoryAsset: '/characters/hero_m_eagle_eye_sniper_victory.png',
    classEmblemAsset: '/icons/emblem_sniper.svg',
    weaponAsset: '/weapons/eagle_frost_bow.svg',
    themeColor: 'emerald',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
  },
  hero_f_eagle_eye_sniper: {
    registryKey: 'hero_f_eagle_eye_sniper',
    avatarId: 'GIRL_RANGER',
    heroClass: 'SNIPER',
    gender: 'GIRL',
    titleThai: 'สไนเปอร์ตาอินทรี (หญิง)',
    titleEng: 'Eagle-Eye Sniper (Girl)',
    portraitAsset: '/characters/hero_f_eagle_eye_sniper_portrait.png',
    fullBodyAsset: '/characters/hero_f_eagle_eye_sniper_full.png',
    battleAsset: '/characters/hero_f_eagle_eye_sniper_battle.png',
    victoryAsset: '/characters/hero_f_eagle_eye_sniper_victory.png',
    classEmblemAsset: '/icons/emblem_sniper.svg',
    weaponAsset: '/weapons/eagle_frost_bow.svg',
    themeColor: 'teal',
    accentGlow: 'rgba(20, 184, 166, 0.4)',
  },
  hero_m_reverse_rogue: {
    registryKey: 'hero_m_reverse_rogue',
    avatarId: 'BOY_ROGUE',
    heroClass: 'ROGUE',
    gender: 'BOY',
    titleThai: 'จอมโจรย้อนรอย (ชาย)',
    titleEng: 'Reverse Rogue (Boy)',
    portraitAsset: '/characters/hero_m_reverse_rogue_portrait.png',
    fullBodyAsset: '/characters/hero_m_reverse_rogue_full.png',
    battleAsset: '/characters/hero_m_reverse_rogue_battle.png',
    victoryAsset: '/characters/hero_m_reverse_rogue_victory.png',
    classEmblemAsset: '/icons/emblem_rogue.svg',
    weaponAsset: '/weapons/dual_reverse_daggers.svg',
    themeColor: 'amber',
    accentGlow: 'rgba(245, 158, 11, 0.4)',
  },
  hero_f_reverse_rogue: {
    registryKey: 'hero_f_reverse_rogue',
    avatarId: 'GIRL_ROGUE',
    heroClass: 'ROGUE',
    gender: 'GIRL',
    titleThai: 'จอมโจรย้อนรอย (หญิง)',
    titleEng: 'Reverse Rogue (Girl)',
    portraitAsset: '/characters/hero_f_reverse_rogue_portrait.png',
    fullBodyAsset: '/characters/hero_f_reverse_rogue_full.png',
    battleAsset: '/characters/hero_f_reverse_rogue_battle.png',
    victoryAsset: '/characters/hero_f_reverse_rogue_victory.png',
    classEmblemAsset: '/icons/emblem_rogue.svg',
    weaponAsset: '/weapons/dual_reverse_daggers.svg',
    themeColor: 'rose',
    accentGlow: 'rgba(244, 63, 94, 0.4)',
  },
};

export function getCharacterVisualEntry(avatarId: AvatarVisualId | string): CharacterVisualEntry {
  const match = Object.values(CHARACTER_VISUAL_REGISTRY).find(
    (e) => e.avatarId === avatarId || e.registryKey === avatarId
  );
  return match || CHARACTER_VISUAL_REGISTRY.hero_m_speed_chronomancer;
}
