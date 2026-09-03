import React from 'react';
import { Snowflake, Castle, Waves, Flame, Landmark, Lock, ArrowRight } from 'lucide-react';
import { GLASS_TOKENS } from '../../tokens/glassTokens';

export type TerritoryKey = 'ARCTIC' | 'SKY' | 'OCEAN' | 'VOLCANIC' | 'THAI';

interface TerritoryMiniPortalProps {
  realmKey: TerritoryKey;
  title: string;
  subject: string;
  thaiSubject: string;
  isActive?: boolean;
  onClick: () => void;
}

const REALM_CONFIGS = {
  ARCTIC: {
    icon: Snowflake,
    accentColor: 'text-cyan-300',
    borderActive: 'border-cyan-400',
    glow: 'from-cyan-500/20 to-blue-600/20',
  },
  SKY: {
    icon: Castle,
    accentColor: 'text-amber-300',
    borderActive: 'border-amber-400',
    glow: 'from-amber-500/20 to-sky-600/20',
  },
  OCEAN: {
    icon: Waves,
    accentColor: 'text-blue-300',
    borderActive: 'border-blue-400',
    glow: 'from-blue-500/20 to-teal-600/20',
  },
  VOLCANIC: {
    icon: Flame,
    accentColor: 'text-rose-400',
    borderActive: 'border-rose-400',
    glow: 'from-rose-500/20 to-amber-600/20',
  },
  THAI: {
    icon: Landmark,
    accentColor: 'text-emerald-300',
    borderActive: 'border-emerald-400',
    glow: 'from-emerald-500/20 to-teal-600/20',
  },
};

export const TerritoryMiniPortal: React.FC<TerritoryMiniPortalProps> = ({
  realmKey,
  title,
  subject,
  thaiSubject,
  isActive = false,
  onClick,
}) => {
  const config = REALM_CONFIGS[realmKey];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer select-none rounded-2xl p-3.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
        isActive
          ? `${GLASS_TOKENS.REALM_MEDALLION_ACTIVE} hover:scale-[1.03]`
          : `${GLASS_TOKENS.REALM_MEDALLION_LOCKED} hover:scale-[1.02]`
      }`}
    >
      {/* Background Gradient Mesh */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${config.glow} opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none`} 
      />

      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className={`p-1.5 rounded-xl bg-slate-950/70 border border-slate-700/60 ${config.accentColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
              isActive
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                : 'bg-slate-900 border border-slate-700 text-slate-400 flex items-center gap-1'
            }`}
          >
            {isActive ? 'ACTIVE' : <><Lock className="w-2.5 h-2.5" /> LOCKED</>}
          </span>
        </div>

        <div>
          <h4 className="font-display font-black text-xs text-white group-hover:text-amber-200 transition-colors">
            {title}
          </h4>
          <p className="text-[10px] text-slate-300 font-semibold mt-0.5">
            {subject} ({thaiSubject})
          </p>
        </div>
      </div>

      <div className="relative z-10 pt-2 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-cyan-300 transition-colors">
        <span>{isActive ? 'เข้าสู่ดินแดน' : 'ดูข้อมูลดินแดน'}</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
