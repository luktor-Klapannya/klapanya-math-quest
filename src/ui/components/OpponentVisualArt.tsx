import React from 'react';
import { BossAnimationState } from '../../types/combat-animation';

export type OpponentType = 
  | 'DOJO_DUMMY'
  | 'ONET_GUARDIAN'
  | 'CYBER_FROST_DRAGON'
  | 'GRANDMASTER_GOLEM'
  | 'ARCHMAGE_OF_ZERO';

interface OpponentVisualArtProps {
  opponentType: OpponentType;
  state?: BossAnimationState | 'IDLE' | 'HIT_LIGHT' | 'HIT_CRITICAL' | 'RAGE' | 'DEFEATED';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'arena';
  className?: string;
}

export const OpponentVisualArt: React.FC<OpponentVisualArtProps> = ({
  opponentType,
  state = 'IDLE',
  size = 'arena',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44 md:w-56 md:h-56',
    arena: 'w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48',
  };

  // State-based dynamic transforms
  let opponentTransform = '';
  let hitFilter = '';
  let chargeFX = false;
  let defeatFX = false;

  if (state === 'HIT_LIGHT') {
    opponentTransform = 'translate(10px, -2px) rotate(4deg) scale(0.96)';
    hitFilter = 'brightness(1.4) drop-shadow(0 0 10px rgba(244,63,94,0.8))';
  } else if (state === 'HIT_CRITICAL') {
    opponentTransform = 'translate(18px, -6px) rotate(8deg) scale(0.92)';
    hitFilter = 'brightness(1.8) drop-shadow(0 0 18px rgba(245,158,11,1))';
  } else if (state === 'RAGE') {
    opponentTransform = 'scale(1.08) translate(0px, -4px)';
    chargeFX = true;
  } else if (state === 'DEFEATED') {
    opponentTransform = 'translate(0px, 20px) scale(0.75) rotate(-6deg)';
    defeatFX = true;
  }

  // If DOJO_DUMMY, render genuine anime illustration
  if (opponentType === 'DOJO_DUMMY') {
    return (
      <div 
        className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
        style={{ transform: opponentTransform, filter: hitFilter, transition: 'transform 0.2s ease-out' }}
      >
        <img
          src="/characters/frost_dummy_anime.png"
          alt="Frost Training Dummy"
          className={`w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(244,63,94,0.35)] ${defeatFX ? 'opacity-30 blur-[2px]' : ''}`}
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 260 280"
        className={`w-full h-full drop-shadow-2xl overflow-visible transition-all duration-200 ${defeatFX ? 'opacity-30 blur-[2px]' : ''}`}
        style={{ transform: opponentTransform, filter: hitFilter }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Shaders and Gradients */}
          <linearGradient id="dummy_wood_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          <linearGradient id="guardian_armor_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id="dragon_cyber_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="golem_stone_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="archmage_void_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#6b21a8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <filter id="enemy_core_glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TYPE 2: O-NET GATEWAY — EXAM SENTINEL / WISDOM GUARDIAN           */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {opponentType === 'ONET_GUARDIAN' && (
          <g>
            {/* Arctic Mist Base */}
            <ellipse cx="130" cy="255" rx="85" ry="16" fill="#0369a1" opacity="0.3" />

            {/* Heavy Sentinel Plate Legs & Robe */}
            <path d="M 75 160 L 185 160 L 195 255 L 65 255 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <path d="M 95 170 L 165 170 L 175 255 L 85 255 Z" fill="#1e293b" />

            {/* Silver-Cyan Heavy Breastplate */}
            <path d="M 70 100 L 190 100 L 180 180 L 80 180 Z" fill="url(#guardian_armor_grad)" stroke="#ffffff" strokeWidth="2.5" />
            {/* Ministry O-NET Exam Crest */}
            <polygon points="130,115 155,135 130,165 105,135" fill="#0f172a" stroke="#fbbf24" strokeWidth="2.5" />
            <text x="123" y="143" fill="#fbbf24" fontSize="18" fontWeight="black">⚜️</text>

            {/* Winged Pauldrons */}
            <polygon points="45,95 75,85 85,130 50,135" fill="url(#guardian_armor_grad)" stroke="#ffffff" strokeWidth="2" />
            <polygon points="215,95 185,85 175,130 210,135" fill="url(#guardian_armor_grad)" stroke="#ffffff" strokeWidth="2" />

            {/* Sentinel Great Shield (Left Arm) */}
            <g transform="translate(30, 95)">
              <polygon points="0,0 48,0 40,75 24,95 8,75" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
              <polygon points="6,6 42,6 35,68 24,84 13,68" fill="url(#guardian_armor_grad)" />
              <text x="14" y="50" fill="#ffffff" fontSize="22">📜</text>
            </g>

            {/* Halberd of Wisdom (Right Arm) */}
            <g transform="translate(195, 45)">
              <line x1="0" y1="0" x2="-20" y2="200" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
              <polygon points="0,-25 25,0 0,25 -15,0" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
            </g>

            {/* Sentinel Full Helmet & Visor */}
            <ellipse cx="130" cy="55" rx="32" ry="34" fill="url(#guardian_armor_grad)" stroke="#ffffff" strokeWidth="2.5" />
            {/* Golden Exam Crown */}
            <polygon points="110,25 120,8 130,22 140,8 150,25" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
            {/* Glowing Blue T-Visor */}
            <path d="M 112 55 L 148 55 M 130 55 L 130 75" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" filter="url(#enemy_core_glow)" />
          </g>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TYPE 3: BOSS 1 — CYBER-FROST DRAGON (มังกรไซเบอร์ฟรอสต์)          */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {opponentType === 'CYBER_FROST_DRAGON' && (
          <g>
            {/* Angular Cyber Wings */}
            <path
              d="M 130 110 L 25 35 L 50 145 L 85 105 L 80 180 L 130 150 Z"
              fill="url(#dragon_cyber_grad)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
            <path
              d="M 130 110 L 235 35 L 210 145 L 175 105 L 180 180 L 130 150 Z"
              fill="url(#dragon_cyber_grad)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />

            {/* Wing Cyber Circuit Lines */}
            <line x1="25" y1="35" x2="85" y2="105" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 3" />
            <line x1="235" y1="35" x2="175" y2="105" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 3" />

            {/* Massive Dragon Armored Torso */}
            <path d="M 85 110 L 175 110 L 160 230 L 100 230 Z" fill="#0f172a" stroke="#0284c7" strokeWidth="3" />

            {/* Cyber Reactor Core */}
            <g filter="url(#enemy_core_glow)">
              <polygon points="130,125 155,150 130,180 105,150" fill="#00f0ff" stroke="#ffffff" strokeWidth="3" />
              <polygon points="130,135 145,150 130,170 115,150" fill="#0284c7" />
              <circle cx="130" cy="150" r="6" fill="#ffffff" />
            </g>

            {/* Mechanical Dragon Head & Horns */}
            <path d="M 95 65 L 130 20 L 165 65 L 155 105 L 105 105 Z" fill="url(#dragon_cyber_grad)" stroke="#38bdf8" strokeWidth="3" />
            {/* Icy Angular Horns */}
            <polygon points="95,65 50,15 80,45" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            <polygon points="165,65 210,15 180,45" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />

            {/* Glowing Cyber Dragon Eyes */}
            <polygon points="110,65 122,62 118,72" fill="#00f0ff" filter="url(#enemy_core_glow)" />
            <polygon points="150,65 138,62 142,72" fill="#00f0ff" filter="url(#enemy_core_glow)" />

            {/* Dragon Snout & Frost Breath Vent */}
            <polygon points="120,85 140,85 130,102" fill="#0f172a" stroke="#00f0ff" strokeWidth="2" />
            <circle cx="130" cy="94" r="3" fill="#00f0ff" />
          </g>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TYPE 4: BOSS 2 — GRANDMASTER GOLEM (โกเลมปรมาจารย์ความเร็ว)        */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {opponentType === 'GRANDMASTER_GOLEM' && (
          <g>
            {/* Giant Heavy Rock Shoulders & Torso */}
            <polygon points="35,90 130,45 225,90 195,240 65,240" fill="url(#golem_stone_grad)" stroke="#94a3b8" strokeWidth="4" />

            {/* Ice Spikes On Shoulders */}
            <polygon points="45,90 20,40 55,65" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            <polygon points="215,90 240,40 205,65" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />

            {/* Rune Engraved Plates */}
            <rect x="75" y="105" width="110" height="75" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />

            {/* Center Speed Rune Reactor */}
            <g filter="url(#enemy_core_glow)">
              <circle cx="130" cy="142" r="26" fill="#0284c7" stroke="#fbbf24" strokeWidth="3" />
              <polygon points="130,122 148,142 130,162 112,142" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
              <text x="122" y="148" fill="#0f172a" fontSize="16" fontWeight="black">⚡</text>
            </g>

            {/* Golem Stone Head & Cyclops Eye */}
            <rect x="100" y="35" width="60" height="45" rx="8" fill="#334155" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="130" cy="56" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="130" cy="56" r="8" fill="#f59e0b" filter="url(#enemy_core_glow)" />
            <circle cx="130" cy="56" r="4" fill="#ffffff" />
          </g>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TYPE 5: BOSS 3 — ARCHMAGE OF ZERO (มหาจอมเวทแห่งจุดศูนย์)         */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {opponentType === 'ARCHMAGE_OF_ZERO' && (
          <g>
            {/* Orbiting Void Runes */}
            <circle cx="130" cy="130" r="115" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
            <g filter="url(#enemy_core_glow)">
              <text x="35" y="60" fill="#c084fc" fontSize="16" fontWeight="bold">∅</text>
              <text x="215" y="60" fill="#c084fc" fontSize="16" fontWeight="bold">0</text>
              <text x="25" y="190" fill="#38bdf8" fontSize="16" fontWeight="bold">∞</text>
              <text x="220" y="190" fill="#38bdf8" fontSize="16" fontWeight="bold">π</text>
            </g>

            {/* Floating Void Cloak */}
            <path
              d="M 80 80 Q 130 30 180 80 L 210 245 Q 130 220 50 245 Z"
              fill="url(#archmage_void_grad)"
              stroke="#c084fc"
              strokeWidth="3"
            />

            {/* Inner Dark Robe */}
            <path d="M 90 100 L 170 100 L 180 230 L 80 230 Z" fill="#09090b" stroke="#7e22ce" strokeWidth="2" />

            {/* Zero Void Singularity Core */}
            <g filter="url(#enemy_core_glow)">
              <circle cx="130" cy="145" r="25" fill="#000000" stroke="#c084fc" strokeWidth="3.5" />
              <circle cx="130" cy="145" r="18" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
              <text x="123" y="152" fill="#ffffff" fontSize="20" fontWeight="black">0</text>
            </g>

            {/* Mysterious Shadow Hood */}
            <polygon points="130,2 178,72 82,72" fill="#18181b" stroke="#a855f7" strokeWidth="3" />
            <ellipse cx="130" cy="65" rx="30" ry="18" fill="#000000" />

            {/* Glowing Twin Void Eyes */}
            <ellipse cx="118" cy="65" rx="5" ry="3" fill="#c084fc" filter="url(#enemy_core_glow)" />
            <ellipse cx="142" cy="65" rx="5" ry="3" fill="#c084fc" filter="url(#enemy_core_glow)" />

            {/* Archmage Floating Crystal Void Staff */}
            <g transform="translate(195, 65)" filter="url(#enemy_core_glow)">
              <line x1="0" y1="0" x2="-15" y2="170" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
              <circle cx="0" cy="-15" r="18" fill="#000000" stroke="#a855f7" strokeWidth="3" />
              <text x="-6" y="-8" fill="#c084fc" fontSize="16" fontWeight="bold">∅</text>
            </g>
          </g>
        )}

        {/* Rage / Attack Charging Aura Effect */}
        {chargeFX && (
          <g filter="url(#enemy_core_glow)">
            <circle cx="130" cy="140" r="110" stroke="#f43f5e" strokeWidth="4" strokeDasharray="8 4" />
            <text x="110" y="30" fill="#f43f5e" fontSize="22" fontWeight="bold">⚠️ RAGE</text>
          </g>
        )}
      </svg>
    </div>
  );
};
