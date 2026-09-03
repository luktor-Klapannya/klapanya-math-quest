import React, { useState, useEffect } from 'react';
import { BattleRoom, BattlePlayerState, BattlePlayerAnswer } from '../../types/battle';
import { battleService, shuffleQuestionOptionsIndependently } from '../../services/battle-service';
import { PlayerProfile, QuestionOption } from '../../types';
import { audioEngine } from '../../services/audio-service';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Shield 
} from 'lucide-react';
import { SceneBackground } from '../components/SceneBackground';

interface ClassroomBattleScreenProps {
  room: BattleRoom;
  player: BattlePlayerState;
  profile: PlayerProfile;
  onFinishBattle: (finalRoom: BattleRoom, finalPlayer: BattlePlayerState) => void;
}

export const ClassroomBattleScreen: React.FC<ClassroomBattleScreenProps> = ({
  room,
  player,
  profile,
  onFinishBattle,
}) => {
  const [currentRoom, setCurrentRoom] = useState<BattleRoom>(room);
  const [currentPlayer, setCurrentPlayer] = useState<BattlePlayerState>(player);
  const [qIndex, setQIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [scorePopup, setScorePopup] = useState<number | null>(null);
  const [raceFeedback, setRaceFeedback] = useState<'IDLE' | 'DIG_GOLD' | 'STRIKE'>('IDLE');

  const currentQ = currentRoom.questions[qIndex];
  const isFarmingStage = currentRoom.sourceStageId.startsWith('F');

  // Shuffle options independently for this student on each question
  useEffect(() => {
    if (currentQ) {
      const opts = shuffleQuestionOptionsIndependently(currentQ.options, `${player.playerId}_${currentQ.id}`);
      setShuffledOptions(opts);
      setSelectedOptionId(null);
      setSecondsLeft(currentQ.targetTimeSec || 30);
      setTimeSpent(0);
    }
  }, [qIndex, currentQ]);

  // Question Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [qIndex]);

  // Calculate live ranking
  const playersList = Object.values(currentRoom.players);
  const sortedPlayers = [...playersList].sort((a, b) => b.battleScore - a.battleScore);
  const myRank = sortedPlayers.findIndex((p) => p.playerId === currentPlayer.playerId) + 1;
  const top3 = sortedPlayers.slice(0, 3);

  const handleSelectOption = async (option: QuestionOption) => {
    if (selectedOptionId !== null) return; // Prevent double submit
    setSelectedOptionId(option.id);

    const isCorrect = option.isCorrect;
    audioEngine.playSfx(isCorrect ? 'SFX_CORRECT' : 'SFX_WRONG');

    // Trigger visual race feedback
    setRaceFeedback(isFarmingStage ? 'DIG_GOLD' : 'STRIKE');

    const result = await battleService.submitPlayerAnswer(currentRoom.id, currentPlayer.playerId, {
      questionId: currentQ.id,
      isCorrect,
      timeSpentSec: timeSpent,
      userAnswer: option.text,
    });

    setCurrentPlayer(result.player);
    setCurrentRoom(result.room);

    const lastAns = result.player.answers[result.player.answers.length - 1];
    if (lastAns && lastAns.scoreGained > 0) {
      setScorePopup(lastAns.scoreGained);
    }

    setTimeout(() => {
      setScorePopup(null);
      setRaceFeedback('IDLE');
      if (qIndex + 1 < currentRoom.questions.length) {
        setQIndex(qIndex + 1);
      } else {
        onFinishBattle(result.room, result.player);
      }
    }, 850);
  };

  if (!currentQ) return null;

  return (
    <SceneBackground territoryId="FROZEN_ARCTIC" sceneType="ARENA_LIVE" className="p-3 md:p-6">
      <div className="flex-1 flex flex-col justify-between text-slate-100 max-w-4xl mx-auto w-full select-none font-sans">
        
        {/* Top HUD: Own Rank + Score + Leaderboard */}
        <header className="frost-card rounded-2xl p-3 md:p-4 mb-3 border-2 border-cyan-400 shadow-glow-cyan space-y-2">
        <div className="flex items-center justify-between gap-2">
          
          {/* My Rank Badge */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center font-black text-amber-300 text-base shadow-glow-gold">
              #{myRank}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">อันดับของฉัน</span>
              <div className="text-xs font-black text-white">จาก {playersList.length} คนในห้อง</div>
            </div>
          </div>

          {/* My Score & Streak */}
          <div className="flex items-center gap-3">
            {currentPlayer.streak > 1 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-glow-gold animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                <span>{currentPlayer.streak}x STREAK</span>
              </div>
            )}

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">คะแนนประลอง</span>
              <div className="text-sm md:text-base font-black text-amber-400 font-mono">
                {currentPlayer.battleScore.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Live Top 3 Capsule (If Enabled by Teacher) */}
        {currentRoom.showLiveRank && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1 overflow-x-auto text-[11px] font-bold">
            <span className="text-cyan-300 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> ผู้นำ Top 3:
            </span>
            <div className="flex items-center gap-2">
              {top3.map((tp, idx) => (
                <div key={tp.playerId} className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-1 text-[10px]">
                  <span className="text-amber-400 font-black">#{idx + 1}</span>
                  <span className="text-slate-200 truncate max-w-[80px]">{tp.studentName}</span>
                  <span className="text-cyan-300 font-mono">({tp.battleScore})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Battle Area: Race Fantasy View */}
      <main className="space-y-3 flex-1 flex flex-col justify-center">
        
        {/* Race Fantasy Box */}
        <div className="frost-card rounded-2xl p-3 border border-slate-700 bg-slate-950/80 flex items-center justify-between text-xs relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isFarmingStage ? '⛏️' : '⚡'}</span>
            <div>
              <span className="font-bold text-white block">
                {isFarmingStage ? 'Dig Gold Race (ขุดสายแร่ทองคำ)' : 'Training Race (ชาร์จพลังทำลายศิลา)'}
              </span>
              <span className="text-[10px] text-slate-400">
                ข้อที่ {qIndex + 1} จาก {currentRoom.questions.length} • เวลา: {secondsLeft}s
              </span>
            </div>
          </div>

          {/* Visual Race Strike Animation */}
          {raceFeedback === 'DIG_GOLD' && (
            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center text-amber-300 font-black text-sm animate-scale-up">
              ⛏️ ขุดพบสายแร่ทองคำบริสุทธิ์! (+โบนัสสปีด)
            </div>
          )}
          {raceFeedback === 'STRIKE' && (
            <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-black text-sm animate-scale-up">
              💥 Superman Strike! ทำลายเป้าหมายสำเร็จ!
            </div>
          )}

          {scorePopup && (
            <div className="font-black text-base font-mono text-amber-400 animate-bounce">
              +{scorePopup} pts!
            </div>
          )}
        </div>

        {/* Question Text Box — Bright Frosted Ice Panel */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-sky-200/90 shadow-[0_8px_32px_rgba(56,189,248,0.18)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300">
              {currentQ.topic}
            </span>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-sky-900">
              <Timer className="w-3.5 h-3.5 text-sky-700" /> {secondsLeft}s
            </div>
          </div>

          <h2 className="text-sm md:text-base font-extrabold text-slate-900 leading-relaxed">
            {currentQ.questionText}
          </h2>
        </div>

        {/* Shuffled Multiple Choice Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {shuffledOptions.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                disabled={selectedOptionId !== null}
                className={`p-3.5 rounded-2xl border text-left font-bold text-xs md:text-sm min-h-[48px] transition-all transform hover:scale-[1.01] flex items-center justify-between shadow-sm ${
                  isSelected
                    ? opt.isCorrect
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400 shadow-md'
                      : 'bg-rose-50 border-rose-400 text-rose-900'
                    : 'bg-slate-50/90 hover:bg-sky-50/90 border-slate-200 text-slate-800 hover:border-sky-400'
                }`}
              >
                <span>{opt.text}</span>
                {isSelected && (
                  opt.isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-3 text-center text-[11px] text-slate-400">
        <span>คำตอบของคุณเป็นความลับส่วนบุคคล • ลำดับตัวเลือกถูกสุ่มแยกต่อผู้เล่น 🛡️</span>
      </footer>
      </div>
    </SceneBackground>
  );
};
