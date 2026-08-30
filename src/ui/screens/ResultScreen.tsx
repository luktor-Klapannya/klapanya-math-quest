import React from 'react';
import { StageSessionResult } from '../../types';
import { GEAR_DATABASE } from '../../progression/gear-matrix';
import { 
  Trophy, 
  Coins, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  TrendingUp 
} from 'lucide-react';

interface ResultScreenProps {
  result: StageSessionResult;
  onReturnToMap: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onReturnToMap,
}) => {
  const unlockedGearItem = result.unlockedGear ? GEAR_DATABASE[result.unlockedGear] : null;

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-center items-center text-slate-100">
      <div className="frost-card rounded-3xl p-6 md:p-10 max-w-2xl w-full border-2 border-cyan-400/80 shadow-glow-cyan text-center relative overflow-hidden animate-scale-up">
        {/* Banner Status */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
          <Trophy className="w-4 h-4 text-cyan-400" />
          {result.isPassed ? 'การทดสอบเสร็จสมบูรณ์ — ผ่านด่าน!' : 'ยังไม่ผ่านเกณฑ์ — ลองใหม่อีกครั้ง'}
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          {result.isPassed ? '🎉 ยินดีด้วย ผู้กล้า!' : '⚡ อย่ายอมแพ้!'}
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          ผลการประลองสถานี D1: การคูณและการหารลงตัว
        </p>

        {/* Score & Accuracy Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="p-3 rounded-2xl bg-arctic-800/80 border border-cyan-500/30">
            <div className="text-xs text-slate-400 font-semibold">ความแม่นยำ</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{result.accuracy}%</div>
            <div className="text-[10px] text-slate-400">{result.correctCount}/{result.totalQuestions} ข้อ</div>
          </div>

          <div className="p-3 rounded-2xl bg-arctic-800/80 border border-cyan-500/30">
            <div className="text-xs text-slate-400 font-semibold">เวลาเฉลี่ย</div>
            <div className="text-2xl font-black text-white mt-1">{result.averageTimeSec}s</div>
            <div className="text-[10px] text-slate-400">รวม {result.totalTimeSec} วินาที</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40">
            <div className="text-xs text-amber-300 font-semibold flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5" /> เหรียญทอง
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">+{result.earnedCoins}</div>
            <div className="text-[10px] text-amber-300/80">สะสมในคลัง</div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40">
            <div className="text-xs text-purple-300 font-semibold flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" /> ค่าประสบการณ์
            </div>
            <div className="text-2xl font-black text-purple-400 mt-1">+{result.earnedXp}</div>
            <div className="text-[10px] text-purple-300/80">เพิ่มเลเวลผู้กล้า</div>
          </div>
        </div>

        {/* Gear Unlock Alert */}
        {unlockedGearItem && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950 via-blue-950 to-cyan-950 border-2 border-cyan-400 mb-6 text-left flex items-center gap-4 animate-bounce">
            <div className="text-4xl">{unlockedGearItem.icon}</div>
            <div>
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> ปลดล็อกอุปกรณ์ชิ้นใหม่!
              </div>
              <h4 className="text-base font-extrabold text-white">{unlockedGearItem.name}</h4>
              <p className="text-xs text-slate-300">{unlockedGearItem.description}</p>
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
                {unlockedGearItem.statBonus}
              </span>
            </div>
          </div>
        )}

        {/* Weighted Skill DNA Updates */}
        <div className="frost-card p-4 rounded-2xl mb-6 text-left">
          <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> การพัฒนาทักษะ (Skill DNA Updates)
          </h4>
          <div className="space-y-2">
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
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center">
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
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-glow-cyan transform hover:scale-[1.02] transition-all text-sm md:text-base"
        >
          กลับสู่แผนที่การผจญภัย (Return to Map) <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
