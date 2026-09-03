import React from 'react';
import { PlayerProfile, HeroClassId } from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { TERRITORY_DATABASE } from '../../progression/territory-matrix';
import { HeroCharacterArt } from './HeroCharacterArt';

interface HeroAvatarViewProps {
  profile: PlayerProfile;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPet?: boolean;
  showVFX?: boolean;
}

export const HeroAvatarView: React.FC<HeroAvatarViewProps> = ({
  profile,
  size = 'md',
  showPet = true,
  showVFX = true,
}) => {
  const hero = HERO_CLASSES[profile.heroId] || HERO_CLASSES.CHRONOMANCER;
  const territory = TERRITORY_DATABASE[profile.currentTerritoryId] || TERRITORY_DATABASE.FROZEN_ARCTIC;
  
  // Determine costume tier based on rank / Top Form
  let tierIdx = 0; // Novice
  if (profile.isTopFormUnlocked) {
    tierIdx = 3; // Top Form Sovereign
  } else if (profile.rank.includes('Guardian') || profile.rank.includes('Champion') || profile.level >= 10) {
    tierIdx = 2; // Master/Guardian
  } else if (profile.level >= 5) {
    tierIdx = 1; // Adept
  }

  const costume = territory.costumeSet[profile.heroId]?.[tierIdx] || {
    name: 'Arctic Fur Robe',
    thaiName: 'ชุดคลุมขนสัตว์อาร์กติก',
    avatarVariant: hero.avatar,
  };

  const weapon = territory.weaponSet[profile.heroId]?.[tierIdx] || {
    name: 'Frost Weapon',
    thaiName: 'ศาสตราวุธน้ำแข็ง',
    icon: '🗡️',
  };

  const activePet = territory.companionPets.find((p) => p.id === profile.activePetId) || territory.companionPets[0];
  const skillVFX = territory.skillVfx[profile.heroId];

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const artSizeMap = {
    sm: 'sm' as const,
    md: 'sm' as const,
    lg: 'md' as const,
    xl: 'lg' as const,
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      {/* Top Form Halo */}
      {profile.isTopFormUnlocked && (
        <div className="absolute -top-3.5 z-20 animate-bounce text-xs md:text-sm font-black text-amber-300 drop-shadow-md flex items-center gap-0.5">
          {territory.topFormVisuals.haloIcon}
        </div>
      )}

      {/* Main Avatar Frame */}
      <div
        className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-tr from-cyan-950 via-slate-900 to-blue-900 border-2 ${
          profile.isTopFormUnlocked ? 'border-amber-400 shadow-glow-gold' : 'border-cyan-400/80 shadow-glow-cyan'
        } flex items-center justify-center relative overflow-hidden transition-all duration-300 p-0.5`}
      >
        {/* Territory Frost Sparkle Background */}
        <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />

        {/* Hero 2D Character Artwork */}
        <HeroCharacterArt avatarId={profile.avatarVisualId || 'BOY_WIZARD'} size={artSizeMap[size]} mode="PORTRAIT" />

        {/* Weapon Icon Sub-badge */}
        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-tl-lg bg-slate-950/90 border-t border-l border-cyan-400 flex items-center justify-center text-[10px] z-15" title={`${weapon.thaiName} (${weapon.name})`}>
          {weapon.icon}
        </div>
      </div>

      {/* Companion Pet Floating Badge */}
      {showPet && activePet && (
        <div
          className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-slate-900 border border-cyan-300 flex items-center justify-center text-xs shadow-md z-20 animate-pulse"
          title={`สัตว์เลี้ยงคู่หู: ${activePet.thaiName}`}
        >
          {activePet.avatar}
        </div>
      )}

      {/* Visual Skill Glow */}
      {showVFX && (
        <div className="absolute -right-2 top-0 text-[10px] text-cyan-300 font-bold hidden md:block">
          {/* Subtle sparkle indicator */}
        </div>
      )}
    </div>
  );
};
