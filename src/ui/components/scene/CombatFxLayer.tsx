import React from 'react';
import { Sparkles, Zap, Flame, ShieldAlert } from 'lucide-react';

export type CombatFxType = 'NONE' | 'HERO_SLASH' | 'CHRONO_BEAM' | 'CRITICAL_BURST' | 'BOSS_COUNTER';

interface CombatFxLayerProps {
  fxType: CombatFxType;
  damageValue?: number;
  isCritical?: boolean;
}

export const CombatFxLayer: React.FC<CombatFxLayerProps> = ({
  fxType,
  damageValue,
  isCritical = false,
}) => {
  if (fxType === 'NONE') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden select-none">
      
      {/* 1. HERO SLASH / BEAM ANIMATION */}
      {fxType === 'HERO_SLASH' && (
        <div className="w-48 h-2 bg-cyan-300 rounded-full shadow-[0_0_30px_#00f0ff] transform rotate-45 animate-ping" />
      )}

      {fxType === 'CHRONO_BEAM' && (
        <div className="w-full h-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-300 shadow-[0_0_40px_#38bdf8] animate-pulse" />
      )}

      {fxType === 'CRITICAL_BURST' && (
        <div className="flex flex-col items-center justify-center animate-bounce">
          <div className="w-32 h-32 rounded-full border-4 border-amber-300 bg-amber-400/20 shadow-[0_0_50px_#ffd700] animate-ping" />
          <span className="font-serif font-black text-2xl text-amber-300 drop-shadow-[0_0_20px_#ffd700] -mt-16">
            CRITICAL!
          </span>
        </div>
      )}

      {fxType === 'BOSS_COUNTER' && (
        <div className="w-64 h-64 rounded-full border-4 border-rose-500 bg-rose-950/40 shadow-[0_0_50px_#f43f5e] animate-ping flex items-center justify-center">
          <Flame className="w-16 h-16 text-rose-400 animate-bounce" />
        </div>
      )}

      {/* 2. FLOATING DAMAGE NUMBER */}
      {damageValue !== undefined && (
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-4xl font-black font-mono animate-bounce drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] ${
          isCritical ? 'text-amber-300 scale-125' : 'text-cyan-300'
        }`}>
          {isCritical ? `💥 -${damageValue} CRIT!` : `-${damageValue}`}
        </div>
      )}
    </div>
  );
};
