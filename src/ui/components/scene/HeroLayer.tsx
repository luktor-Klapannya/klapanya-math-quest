import React from 'react';
import { 
  CanonicalHeroClass, 
  HeroGender, 
  HeroActionState, 
  getHeroSprite,
  resolveVisualLevel
} from '../../assets/heroAssetRegistry';

interface HeroLayerProps {
  heroClass?: CanonicalHeroClass;
  gender?: HeroGender;
  actionState?: HeroActionState;
  heroName?: string;
  rank?: string;
  isTopForm?: boolean;
  className?: string;
}

export const HeroLayer: React.FC<HeroLayerProps> = ({
  heroClass = 'SPEED_CHRONOMANCER',
  gender = 'male',
  actionState = 'IDLE',
  heroName = 'Hero',
  rank = 'R1',
  isTopForm = false,
  className = '',
}) => {
  const spriteSrc = getHeroSprite(heroClass, gender, actionState);
  const visualLevel = resolveVisualLevel(rank);

  return (
    <div className={`relative flex flex-col items-center justify-end select-none ${className}`}>
      
      {/* 1. TOP FORM SOVEREIGN HALO / AURA */}
      {isTopForm && (
        <div className="absolute -top-6 w-24 h-24 rounded-full border-2 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-spin opacity-80 pointer-events-none" style={{ animationDuration: '20s' }}>
          <div className="w-full h-full rounded-full border-2 border-dashed border-cyan-400 opacity-60" />
        </div>
      )}

      {/* 2. GROUND ILLUMINATION SHADOW */}
      <div className="w-28 sm:w-36 h-6 rounded-full bg-cyan-500/20 blur-md -mb-3" />

      {/* 3. HERO SPRITE WITH ACTION STATE ANIMATIONS */}
      <div 
        className={`relative transition-all duration-300 ${
          actionState === 'ATTACK' 
            ? 'scale-110 translate-x-4 filter drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]' 
            : actionState === 'HURT'
            ? 'scale-95 -translate-x-2 filter brightness-125 saturate-150 contrast-125'
            : actionState === 'VICTORY'
            ? 'scale-105 -translate-y-2 filter drop-shadow-[0_0_25px_rgba(251,191,36,0.8)]'
            : 'animate-bounce-subtle'
        }`}
      >
        <img
          src={spriteSrc}
          alt={heroName}
          className="h-44 sm:h-56 md:h-64 object-contain pointer-events-none drop-shadow-2xl"
          loading="eager"
        />
      </div>

      {/* 4. HERO BADGE (Visual Level & Rank) */}
      <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-cyan-400/50 backdrop-blur-md shadow-md text-[10px] font-bold text-cyan-200">
        <span className="text-amber-300 font-black">{visualLevel}</span>
        <span>•</span>
        <span className="truncate max-w-[80px] sm:max-w-[120px]">{heroName}</span>
      </div>
    </div>
  );
};
