import React, { useState } from 'react';
import { BattleRoom, BattlePlayerState, SelfReflectionReason } from '../../types/battle';
import { battleService } from '../../services/battle-service';
import { PlayerProfile } from '../../types';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Zap, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  BookOpen 
} from 'lucide-react';

interface BattleReviewScreenProps {
  room: BattleRoom;
  player: BattlePlayerState;
  profile: PlayerProfile;
  onStartRecoveryDrill: (skillTag?: string) => void;
  onReturnHome: () => void;
  onRematch: () => void;
}

const REFLECTION_OPTIONS: Array<{ key: SelfReflectionReason; label: string; icon: string }> = [
  { key: 'READ_TOO_FAST', label: 'อ่านโจทย์เร็วเกินไป / รีบทำ', icon: '⚡' },
  { key: 'DID_NOT_READ_FULL_QUESTION', label: 'อ่านคำถามไม่จบข้อ / ข้ามหน่วย', icon: '🔍' },
  { key: 'CALCULATION_ERROR', label: 'คิดเลขผิด / บวกลบเลขพลาด', icon: '🧮' },
  { key: 'FORGOT_RULE_OR_FORMULA', label: 'ลืมสูตร / ลืมลำดับเครื่องหมาย PEMDAS', icon: '📜' },
  { key: 'DID_NOT_UNDERSTAND_METHOD', label: 'ยังไม่เข้าใจวิธีคิดของโจทย์ข้อนี้', icon: '❓' },
  { key: 'TIME_PRESSURE', label: 'กังวลเรื่องเวลา / ตื่นเต้นกับการแข่ง', icon: '⏱️' },
  { key: 'GUESSED_TOO_FAST', label: 'เดาคำตอบเร็วเกินไป', icon: '🎲' },
  { key: 'OTHER', label: 'สาเหตุอื่นๆ', icon: '💭' },
];

export const BattleReviewScreen: React.FC<BattleReviewScreenProps> = ({
  room,
  player,
  profile,
  onStartRecoveryDrill,
  onReturnHome,
  onRematch,
}) => {
  const [selectedReflection, setSelectedReflection] = useState<SelfReflectionReason | null>(
    player.selfReflection || null
  );
  const [reflectionSaved, setReflectionSaved] = useState<boolean>(Boolean(player.selfReflection));

  // Determine ranking
  const playersList = Object.values(room.players);
  const sortedPlayers = [...playersList].sort((a, b) => b.battleScore - a.battleScore);
  const myRank = sortedPlayers.findIndex((p) => p.playerId === player.playerId) + 1;

  const wrongAnswers = player.answers.filter((a) => !a.isCorrect);

  const handleSelectReflection = async (reason: SelfReflectionReason) => {
    setSelectedReflection(reason);
    await battleService.saveSelfReflection(room.id, player.playerId, reason);
    setReflectionSaved(true);
  };

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 text-slate-100 font-sans select-none max-w-4xl mx-auto space-y-6">
      
      {/* Header Summary Card */}
      <header className="frost-card rounded-3xl p-6 border-2 border-cyan-400 shadow-glow-cyan text-center relative overflow-hidden bg-gradient-to-b from-cyan-950 via-slate-900 to-slate-950">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-black mb-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>BATTLE ARENA REVIEW & ERROR ANALYSIS</span>
        </div>

        <h1 className="text-xl md:text-2xl font-black text-white">
          ผลการประลองห้องเรียน • ห้อง {room.roomCode}
        </h1>

        {/* Big 3 Stats */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-4 text-center">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">อันดับในห้อง</span>
            <div className="text-xl md:text-2xl font-black text-amber-400 mt-0.5 font-mono">
              #{myRank}
            </div>
            <span className="text-[10px] text-slate-400">จาก {playersList.length} คน</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">คะแนนประลอง</span>
            <div className="text-xl md:text-2xl font-black text-cyan-300 mt-0.5 font-mono">
              {player.battleScore}
            </div>
            <span className="text-[10px] text-slate-400">Battle Pts</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">ความแม่นยำ</span>
            <div className="text-xl md:text-2xl font-black text-emerald-400 mt-0.5 font-mono">
              {player.accuracy}%
            </div>
            <span className="text-[10px] text-slate-400">เฉลี่ย {player.avgResponseTimeSec}s</span>
          </div>
        </div>
      </header>

      {/* Self Reflection Section (Crucial Educational Feedback) */}
      <section className="frost-card rounded-3xl p-5 md:p-6 border border-amber-400/60 shadow-glow-gold space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-xs md:text-sm font-black text-white">
              บันทึกการสะท้อนตนเอง: "ครั้งนี้ฉันพลาดเพราะอะไร?"
            </h2>
            <p className="text-[11px] text-slate-300">
              การรู้สาเหตุที่แท้จริงจะช่วยให้ระบบแนะนำแบบฝึกหัด Recovery Drill ได้ตรงจุด
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
          {REFLECTION_OPTIONS.map((item) => {
            const isSelected = selectedReflection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelectReflection(item.key)}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-black ring-2 ring-amber-400'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
              </button>
            );
          })}
        </div>

        {reflectionSaved && (
          <div className="text-right text-[11px] text-emerald-400 font-bold">
            ✓ บันทึกข้อสะท้อนตนเองเรียบร้อยแล้ว
          </div>
        )}
      </section>

      {/* Wrong Answers & Step-by-Step Breakdown */}
      {wrongAnswers.length > 0 && (
        <section className="frost-card rounded-3xl p-5 md:p-6 border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <h2 className="text-xs md:text-sm font-black text-white">
                วิเคราะห์ข้อที่ตอบผิด ({wrongAnswers.length} ข้อ)
              </h2>
            </div>

            <button
              onClick={() => onStartRecoveryDrill()}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
            >
              <Zap className="w-3.5 h-3.5" /> ซ่อมจุดอ่อนด้วย Recovery Drill
            </button>
          </div>

          <div className="space-y-3">
            {wrongAnswers.map((ans, idx) => {
              const qItem = room.questions.find((q) => q.id === ans.questionId);
              if (!qItem) return null;
              const correctOpt = qItem.options.find((o) => o.isCorrect);

              return (
                <div key={ans.questionId} className="p-4 rounded-2xl bg-arctic-950 border border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300">ข้อที่ {idx + 1}: {qItem.topic}</span>
                    <span className="text-rose-400 font-bold font-mono">ใช้เวลา: {ans.timeSpentSec}s</span>
                  </div>

                  <p className="text-white font-medium">{qItem.questionText}</p>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                    <div className="text-rose-300 font-semibold">❌ คำตอบของคุณ: {ans.userAnswer}</div>
                    <div className="text-emerald-300 font-bold">✅ คำตอบที่ถูกต้อง: {correctOpt?.text}</div>
                    {qItem.explanation && (
                      <div className="text-slate-300 pt-1 border-t border-slate-800">
                        <span className="font-bold text-cyan-300">แนวคิด:</span> {qItem.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Action Buttons */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onReturnHome}
          className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 transition-all"
        >
          กลับสู่หน้าหลัก (Student Home)
        </button>

        <button
          onClick={onRematch}
          className="flex-1 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-glow-cyan flex items-center justify-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> ประลองรอบใหม่ (Rematch)
        </button>
      </footer>
    </div>
  );
};
