import React, { useState } from 'react';
import { AvatarVisualId } from '../../types/learning';
import { getCharacterVisualEntry, CharacterVisualEntry } from '../../progression/character-visual-registry';

export type CharacterArtRole = 'PORTRAIT' | 'HERO_CARD_ART' | 'FULL_BODY_ART' | 'BATTLE_ART';
export type BattleActionPose = 'IDLE' | 'FOCUS' | 'ATTACK' | 'VICTORY';

interface HeroCharacterArtProps {
  avatarId: AvatarVisualId | string;
  role?: CharacterArtRole;
  mode?: CharacterArtRole;
  battlePose?: BattleActionPose;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'card' | 'arena';
  showWeapon?: boolean;
  className?: string;
  animate?: boolean;
}

export const HeroCharacterArt: React.FC<HeroCharacterArtProps> = ({
  avatarId,
  role,
  mode,
  battlePose = 'IDLE',
  size = 'md',
  showWeapon = true,
  className = '',
  animate = false,
}) => {
  const effectiveRole: CharacterArtRole = role || mode || 'HERO_CARD_ART';
  const [imgError, setImgError] = useState<boolean>(false);
  const entry: CharacterVisualEntry = getCharacterVisualEntry(avatarId);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28 md:w-32 md:h-32',
    xl: 'w-48 h-48 md:w-60 md:h-60',
    card: 'w-full h-36 sm:h-40 md:h-44',
    arena: 'w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44',
  };

  const assetSrc = effectiveRole === 'PORTRAIT' ? entry.portraitAsset : entry.fullBodyAsset;

  // Dynamic animation and pose transforms for BATTLE_ART
  let poseTransform = '';
  let weaponTransform = '';
  let attackVFX = false;
  let victoryVFX = false;

  if (effectiveRole === 'BATTLE_ART') {
    if (battlePose === 'ATTACK') {
      poseTransform = 'scale(1.1) translate(12px, -4px) rotate(4deg)';
      weaponTransform = 'translate(10px, -8px) rotate(25deg)';
      attackVFX = true;
    } else if (battlePose === 'FOCUS') {
      poseTransform = 'scale(1.02) translate(0px, 3px)';
      weaponTransform = 'translate(0px, -4px)';
    } else if (battlePose === 'VICTORY') {
      poseTransform = 'translate(0px, -8px) scale(1.05)';
      weaponTransform = 'translate(-4px, -18px) rotate(-15deg)';
      victoryVFX = true;
    }
  }

  // If local high-res anime illustration exists, render genuine anime artwork
  if (assetSrc && !imgError) {
    return (
      <div 
        className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}
        style={{ transform: poseTransform, transition: 'transform 0.25s ease-out' }}
      >
        <img
          src={assetSrc}
          alt={entry.titleThai}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(6,182,212,0.35)]"
        />
      </div>
    );
  }

  const isBoy = entry.gender === 'BOY';
  const isChrono = entry.heroClass === 'CHRONOMANCER';
  const isPaladin = entry.heroClass === 'PALADIN';
  const isSniper = entry.heroClass === 'SNIPER';
  const isRogue = entry.heroClass === 'ROGUE';

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 240 280"
        className="w-full h-full drop-shadow-xl overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id={`bg_glow_${entry.registryKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#082f49" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id={`cloak_grad_${entry.registryKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
            {isChrono && (
              <>
                <stop offset="0%" stopColor={isBoy ? '#06b6d4' : '#a855f7'} />
                <stop offset="100%" stopColor={isBoy ? '#0e7490' : '#6b21a8'} />
              </>
            )}
            {isPaladin && (
              <>
                <stop offset="0%" stopColor={isBoy ? '#38bdf8' : '#0284c7'} />
                <stop offset="100%" stopColor={isBoy ? '#1d4ed8' : '#1e3a8a'} />
              </>
            )}
            {isSniper && (
              <>
                <stop offset="0%" stopColor={isBoy ? '#10b981' : '#14b8a6'} />
                <stop offset="100%" stopColor={isBoy ? '#047857' : '#0f766e'} />
              </>
            )}
            {isRogue && (
              <>
                <stop offset="0%" stopColor={isBoy ? '#f59e0b' : '#f43f5e'} />
                <stop offset="100%" stopColor={isBoy ? '#b45309' : '#be123c'} />
              </>
            )}
          </linearGradient>

          <linearGradient id="hair_boy_wizard" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="hair_girl_wizard" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <linearGradient id="hair_boy_knight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="hair_girl_knight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="hair_boy_sniper" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="hair_girl_sniper" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="hair_boy_rogue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="hair_girl_rogue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>

          <filter id={`frost_glow_${entry.registryKey}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft Floor Shadow / Grounding Aura */}
        <ellipse cx="120" cy="268" rx="60" ry="10" fill="#0284c7" opacity="0.25" />
        <ellipse cx="120" cy="268" rx="45" ry="6" fill="#38bdf8" opacity="0.15" />

        {/* Hero Character Stance Wrapper */}
        <g style={{ transform: poseTransform, transformOrigin: '120px 140px', transition: 'transform 0.2s ease-out' }}>
          
          {/* Back Cloak / Arctic Fur Mantle */}
          <path
            d="M 60 140 Q 120 90 180 140 L 195 240 Q 120 225 45 240 Z"
            fill={`url(#cloak_grad_${entry.registryKey})`}
            stroke="#e0f2fe"
            strokeWidth="1.5"
            opacity="0.95"
          />

          {/* Lower Torso / Legs (if Card or Full Body) */}
          {(effectiveRole === 'FULL_BODY_ART' || effectiveRole === 'HERO_CARD_ART' || effectiveRole === 'BATTLE_ART') && (
            <g>
              {/* Tunic / Armor Base */}
              <path d="M 75 160 L 165 160 L 175 245 L 65 245 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              {/* Belt & Buckle */}
              <rect x="70" y="185" width="100" height="14" rx="4" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1" />
              <polygon points="120,182 130,192 120,202 110,192" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
              {/* Arctic Snow Boots */}
              <rect x="75" y="240" width="38" height="28" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <rect x="127" y="240" width="38" height="28" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <ellipse cx="94" cy="245" rx="16" ry="5" fill="#f8fafc" />
              <ellipse cx="146" cy="245" rx="16" ry="5" fill="#f8fafc" />
            </g>
          )}

          {/* Upper Body Torso & Chest Armor */}
          <path d="M 80 120 L 160 120 L 168 185 L 72 185 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />

          {/* Class-Specific Chestplate / Rune Insignia */}
          {isChrono && (
            <g filter={`url(#frost_glow_${entry.registryKey})`}>
              <circle cx="120" cy="148" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              <text x="114" y="153" fill="#ffffff" fontSize="13" fontWeight="bold">Σ</text>
            </g>
          )}
          {isPaladin && (
            <g>
              <polygon points="120,132 145,148 120,172 95,148" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2.5" />
              <polygon points="120,138 138,148 120,166 102,148" fill="#0284c7" />
            </g>
          )}
          {isSniper && (
            <g>
              <polygon points="120,134 140,152 120,170 100,152" fill="#065f46" stroke="#34d399" strokeWidth="2" />
              <circle cx="120" cy="152" r="5" fill="#38bdf8" />
            </g>
          )}
          {isRogue && (
            <g>
              <polygon points="120,136 136,150 120,168 104,150" fill="#7f1d1d" stroke="#f59e0b" strokeWidth="2" />
              <polygon points="120,140 130,150 120,162 110,150" fill="#f59e0b" />
            </g>
          )}

          {/* Fluffy Arctic Fur Collar */}
          <ellipse cx="120" cy="118" rx="46" ry="16" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
          <ellipse cx="120" cy="118" rx="38" ry="12" fill="#ffffff" />

          {/* Head & Neck */}
          <rect x="110" y="90" width="20" height="20" rx="5" fill="#fed7aa" />
          <ellipse cx="120" cy="74" rx="36" ry="34" fill="#fed7aa" stroke="#fbcfe8" strokeWidth="1" />

          {/* Character Eyes (Expressive & Heroic) */}
          <ellipse cx="106" cy="76" rx="6" ry="8" fill="#0f172a" />
          <ellipse cx="134" cy="76" rx="6" ry="8" fill="#0f172a" />
          {/* Eye Iris Color */}
          <circle cx="106" cy="76" r="4.5" fill={isChrono ? '#06b6d4' : isPaladin ? '#38bdf8' : isSniper ? '#10b981' : '#f59e0b'} />
          <circle cx="134" cy="76" r="4.5" fill={isChrono ? '#06b6d4' : isPaladin ? '#38bdf8' : isSniper ? '#10b981' : '#f59e0b'} />
          {/* Eye Sparkle */}
          <circle cx="104.5" cy="73.5" r="2" fill="#ffffff" />
          <circle cx="132.5" cy="73.5" r="2" fill="#ffffff" />
          <circle cx="107.5" cy="78.5" r="1" fill="#ffffff" />
          <circle cx="135.5" cy="78.5" r="1" fill="#ffffff" />

          {/* Eyebrows */}
          <path d="M 98 64 Q 106 61 114 65" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 126 65 Q 134 61 142 64" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

          {/* Confident Smile */}
          <path d="M 112 92 Q 120 98 128 92" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="98" cy="85" rx="5" ry="3" fill="#f43f5e" opacity="0.35" />
          <ellipse cx="142" cy="85" rx="5" ry="3" fill="#f43f5e" opacity="0.35" />

          {/* Distinct Hairstyles */}
          {isBoy && isChrono && (
            <path
              d="M 80 72 Q 85 24 120 20 Q 155 24 160 72 Q 140 40 120 44 Q 100 40 80 72 Z"
              fill="url(#hair_boy_wizard)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )}
          {!isBoy && isChrono && (
            <g>
              <path
                d="M 80 72 Q 85 20 120 18 Q 155 20 160 72 Q 140 40 120 42 Q 100 40 80 72 Z"
                fill="url(#hair_girl_wizard)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Twin Frost Braids */}
              <path d="M 82 65 Q 52 95 60 145 Q 72 115 86 85 Z" fill="url(#hair_girl_wizard)" />
              <path d="M 158 65 Q 188 95 180 145 Q 168 115 154 85 Z" fill="url(#hair_girl_wizard)" />
              {/* Braid Ribbons */}
              <circle cx="60" cy="140" r="4" fill="#38bdf8" />
              <circle cx="180" cy="140" r="4" fill="#38bdf8" />
            </g>
          )}

          {isBoy && isPaladin && (
            <path
              d="M 80 70 Q 88 28 120 24 Q 152 28 160 70 Q 140 44 120 46 Q 100 44 80 70 Z"
              fill="url(#hair_boy_knight)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )}
          {!isBoy && isPaladin && (
            <g>
              <path
                d="M 80 70 Q 88 24 120 22 Q 152 24 160 70 Q 140 42 120 44 Q 100 42 80 70 Z"
                fill="url(#hair_girl_knight)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Long Silver-Cyan Ponytail */}
              <path d="M 120 30 Q 175 35 185 95 Q 165 75 140 50 Z" fill="url(#hair_girl_knight)" />
            </g>
          )}

          {isBoy && isSniper && (
            <path
              d="M 80 70 Q 86 26 120 22 Q 154 26 160 70 Q 140 42 120 44 Q 100 42 80 70 Z"
              fill="url(#hair_boy_sniper)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )}
          {!isBoy && isSniper && (
            <g>
              <path
                d="M 80 70 Q 86 22 120 20 Q 154 22 160 70 Q 140 40 120 42 Q 100 40 80 70 Z"
                fill="url(#hair_girl_sniper)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <path d="M 80 70 Q 55 105 65 140 Q 75 110 88 85 Z" fill="url(#hair_girl_sniper)" />
            </g>
          )}

          {isBoy && isRogue && (
            <path
              d="M 80 68 Q 90 25 120 22 Q 150 25 160 68 Q 140 40 120 42 Q 100 40 80 68 Z"
              fill="url(#hair_boy_rogue)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )}
          {!isBoy && isRogue && (
            <g>
              <path
                d="M 80 68 Q 90 22 120 20 Q 150 22 160 68 Q 140 38 120 40 Q 100 38 80 68 Z"
                fill="url(#hair_girl_rogue)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <path d="M 120 30 Q 185 45 190 110 Q 165 80 135 50 Z" fill="url(#hair_girl_rogue)" />
            </g>
          )}

          {/* Headgear & Badges */}
          {isChrono && (
            <g>
              <polygon points="120,4 146,38 94,38" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
              <circle cx="120" cy="24" r="6" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
            </g>
          )}
          {isPaladin && (
            <g>
              <path d="M 102,32 L 120,12 L 138,32 L 120,24 Z" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="120" cy="22" r="3.5" fill="#38bdf8" />
            </g>
          )}
          {isSniper && (
            <g>
              {/* Tactical Sniper Goggles */}
              <rect x="94" y="52" width="52" height="12" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
              <circle cx="108" cy="58" r="4" fill="#34d399" />
              <circle cx="132" cy="58" r="4" fill="#34d399" />
              {/* Plume Feather */}
              <path d="M 148 55 Q 170 30 165 15 Q 150 30 144 50" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
            </g>
          )}
          {isRogue && (
            <g>
              {/* Ninja Mask / Stealth Veil */}
              <path d="M 92 84 Q 120 102 148 84 L 148 98 Q 120 116 92 98 Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
              {/* Dynamic Flowing Scarf */}
              <path d="M 140 105 Q 185 125 200 160 Q 175 145 145 120 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
            </g>
          )}
        </g>

        {/* WEAPONS & COMBAT ACTION RIG (Rendered distinct and large!) */}
        {showWeapon && (
          <g style={{ transform: weaponTransform, transformOrigin: '120px 140px', transition: 'transform 0.15s ease-out' }}>
            {isChrono && (
              /* Chronos Frost Time Staff */
              <g transform="translate(178, 60)" filter={`url(#frost_glow_${entry.registryKey})`}>
                <line x1="0" y1="0" x2="-20" y2="175" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
                <polygon points="0,-25 24,0 0,25 -24,0" fill="#38bdf8" stroke="#ffffff" strokeWidth="3" />
                <circle cx="0" cy="0" r="9" fill="#0284c7" stroke="#fbbf24" strokeWidth="2" />
                <text x="-5" y="4" fill="#ffffff" fontSize="11" fontWeight="bold">∞</text>
                <circle cx="0" cy="0" r="16" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
              </g>
            )}

            {isPaladin && (
              /* Aegis Shield + Heavy Frost War Hammer */
              <g>
                {/* Shield on Left Arm */}
                <g transform="translate(20, 110)">
                  <polygon points="0,0 45,0 38,65 22,82 8,65" fill="#f8fafc" stroke="#38bdf8" strokeWidth="3.5" />
                  <polygon points="6,6 39,6 33,60 22,72 13,60" fill="#0284c7" />
                  <text x="13" y="42" fill="#ffffff" fontSize="22" fontWeight="bold">🛡️</text>
                </g>
                {/* War Hammer on Right Arm */}
                <g transform="translate(185, 90)">
                  <line x1="0" y1="0" x2="-25" y2="135" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                  <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
                  <rect x="-10" y="-8" width="20" height="16" rx="2" fill="#0284c7" />
                </g>
              </g>
            )}

            {isSniper && (
              /* Crystal Aurora Recurve Bow */
              <g transform="translate(170, 75)" filter={`url(#frost_glow_${entry.registryKey})`}>
                <path d="M -15 -35 Q 35 45 -15 125" stroke="#10b981" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M -15 -35 Q 25 45 -15 125" stroke="#34d399" strokeWidth="3" fill="none" />
                <line x1="-15" y1="-35" x2="-15" y2="125" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 2" />
                {/* Glowing Arrow Nock */}
                <line x1="-30" y1="45" x2="35" y2="45" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                <polygon points="35,45 25,38 25,52" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
              </g>
            )}

            {isRogue && (
              /* Twin Reverse Frost Daggers */
              <g>
                {/* Right Hand Reverse Dagger */}
                <g transform="translate(182, 125)" filter={`url(#frost_glow_${entry.registryKey})`}>
                  <polygon points="0,0 28,-32 35,-25 7,7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <polygon points="4,-4 22,-24 26,-20 8,0" fill="#f97316" />
                  <line x1="0" y1="0" x2="-10" y2="10" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
                </g>
                {/* Left Hand Reverse Dagger */}
                <g transform="translate(42, 135)" filter={`url(#frost_glow_${entry.registryKey})`}>
                  <polygon points="0,0 -28,-32 -35,-25 -7,7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <polygon points="-4,-4 -22,-24 -26,-20 -8,0" fill="#f97316" />
                  <line x1="0" y1="0" x2="10" y2="10" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
                </g>
              </g>
            )}
          </g>
        )}

        {/* Combat Attack Slash VFX */}
        {attackVFX && (
          <g filter={`url(#frost_glow_${entry.registryKey})`}>
            <path
              d="M 150 50 Q 230 130 170 210"
              stroke="#38bdf8"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M 160 70 Q 220 130 180 190"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* Victory Sparkle VFX */}
        {victoryVFX && (
          <g>
            <text x="40" y="50" fontSize="24">✨</text>
            <text x="180" y="40" fontSize="24">⭐</text>
            <text x="200" y="110" fontSize="20">🌟</text>
          </g>
        )}
      </svg>
    </div>
  );
};

export const FrostTrainingDummy: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'arena' }> = ({
  className = '',
  size = 'arena',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28 md:w-32 md:h-32',
    arena: 'w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44',
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dummy_wood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="dummy_frost_plate" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <filter id="dummy_target_glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Snow Base Pedestal */}
        <ellipse cx="100" cy="225" rx="65" ry="14" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
        <ellipse cx="100" cy="222" rx="55" ry="10" fill="#ffffff" />

        {/* Wooden Stand Pole */}
        <rect x="92" y="150" width="16" height="75" rx="4" fill="url(#dummy_wood)" stroke="#292524" strokeWidth="2" />

        {/* Dummy Crossbar Arms */}
        <rect x="25" y="105" width="150" height="18" rx="6" fill="url(#dummy_wood)" stroke="#292524" strokeWidth="2" />
        {/* Arm Frost Wraps */}
        <rect x="35" y="103" width="22" height="22" rx="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
        <rect x="143" y="103" width="22" height="22" rx="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

        {/* Wooden Torso Body */}
        <rect x="68" y="70" width="64" height="90" rx="14" fill="url(#dummy_wood)" stroke="#292524" strokeWidth="2.5" />

        {/* Frost Iron Shoulder Armor */}
        <polygon points="55,80 75,70 75,100 55,95" fill="url(#dummy_frost_plate)" stroke="#ffffff" strokeWidth="1.5" />
        <polygon points="145,80 125,70 125,100 145,95" fill="url(#dummy_frost_plate)" stroke="#ffffff" strokeWidth="1.5" />

        {/* Center Glowing Math Target Core */}
        <g filter="url(#dummy_target_glow)">
          <circle cx="100" cy="115" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
          <circle cx="100" cy="115" r="16" fill="#0284c7" stroke="#e0f2fe" strokeWidth="2" />
          <circle cx="100" cy="115" r="8" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
          {/* Target Crosshairs */}
          <line x1="100" y1="88" x2="100" y2="142" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="73" y1="115" x2="127" y2="115" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
        </g>

        {/* Carved Dummy Head */}
        <ellipse cx="100" cy="42" rx="26" ry="28" fill="url(#dummy_wood)" stroke="#292524" strokeWidth="2.5" />
        {/* Snow Cap on Head */}
        <path d="M 76 40 Q 100 15 124 40 Q 100 32 76 40 Z" fill="#ffffff" stroke="#e0f2fe" strokeWidth="1.5" />

        {/* Friendly Carved Expression */}
        <ellipse cx="90" cy="44" rx="4" ry="4" fill="#292524" />
        <ellipse cx="110" cy="44" rx="4" ry="4" fill="#292524" />
        <circle cx="91" cy="43" r="1.5" fill="#ffffff" />
        <circle cx="111" cy="43" r="1.5" fill="#ffffff" />
        <path d="M 94 56 Q 100 62 106 56" stroke="#292524" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
};
