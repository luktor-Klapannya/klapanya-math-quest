import React, { useEffect, useRef } from 'react';
import { getTimerVisualState } from '../../engine/adaptive-timer-engine';
import { audioEngine } from '../../services/audio-service';

interface AdaptiveTimerDisplayProps {
  secondsLeft: number;
  totalTargetSec: number;
  isPaused?: boolean;
  isOvertime?: boolean;
  isGlobalExamTimer?: boolean;
  suppressSoundCues?: boolean;
  onTimeout?: () => void;
}

export const AdaptiveTimerDisplay: React.FC<AdaptiveTimerDisplayProps> = ({
  secondsLeft,
  totalTargetSec,
  isPaused = false,
  isOvertime = false,
  isGlobalExamTimer = false,
  suppressSoundCues = false,
  onTimeout,
}) => {
  const previousStateRef = useRef<string>('NORMAL');

  const visual = getTimerVisualState(secondsLeft, totalTargetSec, isPaused, isOvertime);

  // Audio Cue Trigger on state transitions
  useEffect(() => {
    if (suppressSoundCues) return;

    if (visual.state === 'CRITICAL' && previousStateRef.current !== 'CRITICAL') {
      audioEngine.playSfx('SFX_UI_CLICK');
    } else if (visual.state === 'WARNING' && previousStateRef.current === 'NORMAL') {
      audioEngine.playSfx('SFX_UI_CLICK');
    }
    previousStateRef.current = visual.state;
  }, [visual.state, suppressSoundCues]);

  // Format MM:SS for global timers
  const formatTime = (secs: number) => {
    if (isGlobalExamTimer || secs >= 60) {
      const m = Math.floor(Math.max(0, secs) / 60);
      const s = Math.max(0, secs) % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${Math.max(0, secs)}s`;
  };

  return (
    <div className="flex flex-col gap-1 min-w-[130px] md:min-w-[160px] select-none font-sans">
      {/* Top Status Capsule */}
      <div 
        className={`px-2.5 py-1 rounded-xl border flex items-center justify-between gap-2 shadow-md transition-colors duration-200 ${visual.colorClass}`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{visual.icon}</span>
          <span className="text-[10px] font-black tracking-tight">{visual.label}</span>
        </div>

        <span className="font-mono font-black text-xs md:text-sm">
          {formatTime(secondsLeft)}
        </span>
      </div>

      {/* Smooth Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800 p-0.5">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            visual.state === 'CRITICAL'
              ? 'bg-rose-500 shadow-glow-rose'
              : visual.state === 'WARNING'
              ? 'bg-amber-400'
              : visual.state === 'OVERTIME'
              ? 'bg-purple-500'
              : 'bg-cyan-400 shadow-glow-cyan'
          }`}
          style={{ width: `${visual.progressPercent}%` }}
        />
      </div>
    </div>
  );
};
