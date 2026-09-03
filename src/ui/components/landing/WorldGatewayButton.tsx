import React from 'react';
import { Swords, Compass, ArrowRight } from 'lucide-react';
import { GLASS_TOKENS } from '../../tokens/glassTokens';

interface WorldGatewayButtonProps {
  type: 'ARENA' | 'TERRITORY';
  title: string;
  thaiTitle: string;
  subtitle: string;
  onClick: () => void;
}

export const WorldGatewayButton: React.FC<WorldGatewayButtonProps> = ({
  type,
  title,
  thaiTitle,
  subtitle,
  onClick,
}) => {
  const isArena = type === 'ARENA';

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer select-none relative overflow-hidden ${GLASS_TOKENS.GATEWAY_PLAQUE}`}
    >
      {/* Ambient background glow accent */}
      <div 
        className={`absolute -right-8 -top-8 w-36 h-36 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none ${
          isArena ? 'bg-rose-500' : 'bg-cyan-400'
        }`} 
      />

      <div className="relative z-10 flex items-start gap-4">
        {/* Emblem Capsule */}
        <div 
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
            isArena 
              ? 'bg-rose-950/60 border-rose-400/50 text-rose-300 group-hover:border-rose-300 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'
              : 'bg-cyan-950/60 border-cyan-400/50 text-cyan-300 group-hover:border-cyan-300 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
          }`}
        >
          {isArena ? <Swords className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
        </div>

        {/* Text Details */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-display font-black text-sm tracking-wider text-white group-hover:text-amber-200 transition-colors">
              {title}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
              {isArena ? 'LIVE BATTLE' : '5 REALMS'}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-300">{thaiTitle}</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">{subtitle}</p>

          <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all">
            <span>Explore (สำรวจ)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
