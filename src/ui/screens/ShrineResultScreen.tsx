import React from 'react';
import { ShrineRunResult } from '../../types';
import { GEAR_DATABASE } from '../../progression/gear-matrix';
import { 
  Trophy, 
  Coins, 
  Award, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  RotateCcw, 
  Flame, 
  Timer,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface ShrineResultScreenProps {
  result: ShrineRunResult;
  onReturnToMap: () => void;
  onPlayAgain: () => void;
}

export const ShrineResultScreen: React.FC<ShrineResultScreenProps> = ({
  result,
  onReturnToMap,
  onPlayAgain,
}) => {
  const droppedItem = result.earnedMaterial ? GEAR_DATABASE[result.earnedMaterial] : null;

  const gradeColorMap: Record<string, { bg: string; text: string; label: string }> = {
    S: { bg: 'bg-purple-950 border-purple-400 shadow-glow-purple', text: 'text-purple-300', label: 'ระดับตำนาน (S Rank)' },
    A: { bg: 'bg-cyan-950 border-cyan-400 shadow-glow-cyan', text: 'text-cyan-300', label: 'ยอดเยี่ยม (A Rank)' },
    B: { bg: 'bg-emerald-950 border-emerald-400', text: 'text-emerald-300', label: 'ดีเยี่ยม (B Rank)' },
    C: { bg: 'bg-amber-950 border-amber-400', text: 'text-amber-300', label: 'ผ่านเกณฑ์ (C Rank)' },
    TRAIN_AGAIN: { bg: 'bg-rose-950 border-rose-500', text: 'text-rose-300', label: 'ต้องฝึกฝนเพิ่ม' },
  };

  const currentGradeStyle = gradeColorMap[result.speedGrade] || gradeColorMap.C;

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-center items-center text-slate-100">
      <div className="frost-card rounded-3xl p-6 md:p-10 max-w-2xl w-full border-2 border-cyan-400/80 shadow-glow-cyan text-center relative overflow-hidden animate-scale-up">
        {/* Speed Grade Emblem */}
        <div className="flex flex-col items-center justify-center my-2">
          <div
            className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl border-4 flex flex-col items-center justify-center mb-2 animate-bounce ${currentGradeStyle.bg}`}
          >
            <span className={`text-4xl md:text-5xl font-black font-mono ${currentGradeStyle.text}`}>
              {result.speedGrade === 'TRAIN_AGAIN' ? 'RE' : result.speedGrade}
            </span>
          </div>
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-cyan-300">
            {currentGradeStyle.label}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
          {result.isPassed ? '⚡ สปีดรันสำเร็จยอดเยี่ยม!' : '❄️ ยังไม่ผ่านเกณฑ์ 80%'}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          ผลการทดสอบความไวศาลเจ้า {result.stageId} ({result.runSize} ข้อ • {result.runMode === 'RANKED' ? 'โหมดจัดอันดับ' : 'โหมดฝึกฝน'})
        </p>

        {/* Speed Performance Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <div className="p-3 rounded-2xl bg-arctic-800/80 border border-cyan-500/30">
            <div className="text-[11px] text-slate-400 font-semibold">ความแม่นยำ</div>
            <div className="text-xl md:text-2xl font-black text-cyan-300 mt-0.5">{result.accuracy}%</div>
            <div className="text-[10px] text-slate-400">{result.correctCount}/{result.totalQuestions} ข้อ</div>
          </div>

          <div className="p-3 rounded-2xl bg-arctic-800/80 border border-cyan-500/30">
            <div className="text-[11px] text-slate-400 font-semibold">เวลาเฉลี่ย</div>
            <div className="text-xl md:text-2xl font-black text-white mt-0.5">{result.averageTimeSec}s</div>
            <div className="text-[10px] text-slate-400">เร็วสุด {result.fastestAnswerSec}s</div>
          </div>

          <div className="p-3 rounded-2xl bg-arctic-800/80 border border-cyan-500/30">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> คอมโบสูงสุด
            </div>
            <div className="text-xl md:text-2xl font-black text-amber-400 mt-0.5">{result.maxCombo}</div>
            <div className="text-[10px] text-slate-400">Perfect {result.perfectHits} ข้อ</div>
          </div>
        </div>

        {/* Currency & Material Rewards */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between px-4">
            <div className="text-left">
              <span className="text-[11px] text-amber-300 font-bold block">เหรียญทอง</span>
              <span className="text-xl font-black text-amber-400">+{result.earnedCoins} 🪙</span>
            </div>
            <Coins className="w-6 h-6 text-amber-400" />
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between px-4">
            <div className="text-left">
              <span className="text-[11px] text-purple-300 font-bold block">ค่าประสบการณ์</span>
              <span className="text-xl font-black text-purple-400">+{result.earnedXp} XP</span>
            </div>
            <Award className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        {/* Material Drop Banner */}
        {droppedItem && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950 via-teal-950 to-cyan-950 border border-cyan-400 mb-5 flex items-center gap-3 text-left">
            <div className="text-3xl">{droppedItem.icon}</div>
            <div>
              <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> ได้รับวัตถุดิบแสงเหนือ: +{result.materialCount} ชิ้น
              </div>
              <h4 className="text-sm font-extrabold text-white">{droppedItem.name}</h4>
              <p className="text-[11px] text-slate-300">{droppedItem.description}</p>
            </div>
          </div>
        )}

        {/* Skill DNA Update */}
        <div className="frost-card p-3.5 rounded-2xl mb-6 text-left">
          <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> ผลกระทบต่อ Skill DNA (Weighted Mastery Engine v1)
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-1/2 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs md:text-sm"
          >
            <RotateCcw className="w-4 h-4" /> วิ่งใหม่อีกครั้ง (Replay Run)
          </button>
          <button
            onClick={onReturnToMap}
            className="w-full sm:w-1/2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-glow-cyan text-xs md:text-sm"
          >
            กลับสู่แผนที่ <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
