import React from 'react';
import { ArrowLeft, Clock, Coins, Flame, Shield, Sparkles } from 'lucide-react';

interface BattleHudProps {
  stageName: string;
  stageBadge?: string;
  timeLeft: number;
  totalTime: number;
  comboStreak: number;
  coinsEarned: number;
  playerLevel?: number;
  onExit: () => void;
}

export const BattleHud: React.FC<BattleHudProps> = ({
  stageName,
  stageBadge = 'DOJO TRAINING',
  timeLeft,
  totalTime,
  comboStreak,
  coinsEarned,
  playerLevel = 1,
  onExit,
}) => {
  const timePercent = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const isTimeWarning = timeLeft <= 5;

  return (
    <div className="relative z-30 w-full px-3 py-2 sm:px-6 sm:py-3 flex flex-col gap-2 select-none">
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3">
        
        {/* Left: Exit Button & Stage Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-full bg-slate-950/80 hover:bg-rose-950 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-200 transition-all shadow-md"
            title="ออกจากการต่อสู้"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/60 text-cyan-300 w-fit">
              {stageBadge}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[140px] sm:max-w-xs">
              {stageName}
            </span>
          </div>
        </div>

        {/* Center: Adaptive Timer Countdown Capsule */}
        <div className={`px-3 sm:px-5 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2 transition-all ${
          isTimeWarning 
            ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]'
            : 'bg-slate-950/80 border-cyan-400/50 text-cyan-200 shadow-glass-crystal'
        }`}>
          <Clock className={`w-3.5 h-3.5 ${isTimeWarning ? 'text-rose-400' : 'text-cyan-300'}`} />
          <span className="font-mono text-xs sm:text-sm font-black">
            {timeLeft}s
          </span>
          <div className="w-12 sm:w-20 h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${
                isTimeWarning ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        {/* Right: Combo & Coins Stats */}
        <div className="flex items-center gap-2">
          {comboStreak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-400/80 text-amber-300 text-xs font-black shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-bounce">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{comboStreak}x COMBO</span>
            </div>
          )}

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-amber-300 text-xs font-bold shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{coinsEarned}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
