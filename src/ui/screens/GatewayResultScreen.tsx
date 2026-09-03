import {useArcticBackground} from '../backgrounds/useArcticVisual';
import React from 'react';
import { GatewayExamResult } from '../../types';
import { GEAR_DATABASE } from '../../progression/gear-matrix';
import { 
  Trophy, 
  Coins, 
  Award, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface GatewayResultScreenProps {
  result: GatewayExamResult;
  onReturnToMap: () => void;
}

export const GatewayResultScreen: React.FC<GatewayResultScreenProps> = ({
  result,
  onReturnToMap,
}) => {
  const visualStyle=useArcticBackground('victory');
  const unlockedGearItem = result.unlockedGear ? GEAR_DATABASE[result.unlockedGear] : null;

  const readinessBadgeMap: Record<string, { bg: string; text: string; thaiLabel: string }> = {
    MASTER: { bg: 'bg-purple-950 border-purple-400 shadow-glow-purple', text: 'text-purple-300', thaiLabel: 'ระดับปรมาจารย์ (Master: 95%+)' },
    ADVANCED: { bg: 'bg-cyan-950 border-cyan-400 shadow-glow-cyan', text: 'text-cyan-300', thaiLabel: 'ระดับดีเยี่ยม (Advanced: 85%+)' },
    PROFICIENT: { bg: 'bg-emerald-950 border-emerald-400', text: 'text-emerald-300', thaiLabel: 'ระดับเชี่ยวชาญ (Proficient: 75%+)' },
    DEVELOPING: { bg: 'bg-amber-950 border-amber-400', text: 'text-amber-300', thaiLabel: 'ระดับกำลังพัฒนา (Developing: 60%+)' },
    FOUNDATION: { bg: 'bg-rose-950 border-rose-500', text: 'text-rose-300', thaiLabel: 'ระดับพื้นฐาน (Foundation: <60%)' },
  };

  const badge = readinessBadgeMap[result.readinessLevel] || readinessBadgeMap.FOUNDATION;

  return (
    <div style={visualStyle} className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-center items-center text-slate-100">
      <div className="frost-card rounded-3xl p-6 md:p-10 max-w-2xl w-full border-2 border-cyan-400/80 shadow-glow-cyan text-center relative overflow-hidden animate-scale-up">
        {/* Readiness Badge */}
        <div className="inline-flex flex-col items-center justify-center mb-4">
          <div className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-2 ${badge.bg} ${badge.text}`}>
            <ShieldCheck className="w-4 h-4 inline-block mr-1" /> {badge.thaiLabel}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            {result.isPassed ? '🎉 สอบผ่านเกณฑ์มาตรฐานระดับชาติ!' : '❄️ ยังไม่ผ่านเกณฑ์มาตรฐาน'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ผลการทดสอบสนามสอบจำลอง O-NET Gateway ({result.stageId})
          </p>
        </div>

        {/* Score & Benchmark Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3 rounded-2xl bg-arctic-800/80 border border-cyan-500/30">
            <div className="text-[11px] text-slate-400 font-semibold">คะแนนมาตรฐาน</div>
            <div className="text-2xl font-black text-cyan-300 mt-0.5">{result.accuracy}%</div>
            <div className="text-[10px] text-slate-400">{result.correctCount}/{result.totalQuestions} ข้อ</div>
          </div>

          <div className="p-3 rounded-2xl bg-arctic-800/80 border border-cyan-500/30">
            <div className="text-[11px] text-slate-400 font-semibold">เวลาสอบรวม</div>
            <div className="text-2xl font-black text-white mt-0.5">
              {Math.floor(result.totalTimeSec / 60)}m {result.totalTimeSec % 60}s
            </div>
            <div className="text-[10px] text-slate-400">เฉลี่ย {result.averageTimeSec}s / ข้อ</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40">
            <div className="text-[11px] text-amber-300 font-semibold flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5" /> เหรียญรางวัล
            </div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">+{result.earnedCoins}</div>
            <div className="text-[10px] text-amber-300/80">สะสมในคลัง</div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40">
            <div className="text-[11px] text-purple-300 font-semibold flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" /> ค่าประสบการณ์
            </div>
            <div className="text-2xl font-black text-purple-400 mt-0.5">+{result.earnedXp}</div>
            <div className="text-[10px] text-purple-300/80">เลเวลผู้กล้า</div>
          </div>
        </div>

        {/* Gatekeeper Armor Piece Unlock */}
        {unlockedGearItem && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950 via-blue-950 to-cyan-950 border-2 border-cyan-400 mb-5 text-left flex items-center gap-4 animate-bounce">
            <div className="text-4xl">{unlockedGearItem.icon}</div>
            <div>
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> ปลดล็อกยุทธภัณฑ์ผู้พิทักษ์ประตู O-NET!
              </div>
              <h4 className="text-base font-extrabold text-white">{unlockedGearItem.name}</h4>
              <p className="text-xs text-slate-300">{unlockedGearItem.description}</p>
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
                {unlockedGearItem.statBonus}
              </span>
            </div>
          </div>
        )}

        {/* Misconception / Trap Breakdown */}
        {Object.keys(result.misconceptionProfile).length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 mb-5 text-left text-xs">
            <h4 className="font-extrabold text-rose-300 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> จุดที่ต้องระวังในการสอบ (Trap & Misconception Profile)
            </h4>
            <div className="space-y-1 text-slate-300">
              {Object.entries(result.misconceptionProfile).map(([tag, count]) => (
                <div key={tag} className="flex justify-between">
                  <span>⚠️ {tag.replace(/_/g, ' ')}</span>
                  <span className="text-rose-400 font-bold">พลาด {count} ข้อ</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weighted Skill DNA Update */}
        <div className="frost-card p-4 rounded-2xl mb-6 text-left">
          <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> การประเมินทักษะมาตรฐาน (Skill DNA Readiness)
          </h4>
          <div className="space-y-1.5">
            {Object.entries(result.masteryUpdates).map(([skill, delta]) => {
              const diff = delta.after - delta.before;
              return (
                <div key={skill} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 capitalize">{skill.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{Math.round(delta.before * 100)}%</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="font-bold text-cyan-300">{Math.round(delta.after * 100)}%</span>
                    {diff > 0 && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5" />+{Math.round(diff * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={onReturnToMap}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-glow-cyan text-sm md:text-base"
        >
          กลับสู่แผนที่การผจญภัย <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
