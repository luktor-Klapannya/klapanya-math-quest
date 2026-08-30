import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayerProfile, 
  QuestionItem, 
  QuestionOption, 
  BossInfo, 
  BossBattleMode, 
  BossBattleResult,
  BossPhaseId
} from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { shuffleOptions } from '../../engine/shuffler';
import { calculateBossDamage, calculateBossPerformanceTier, canForgeLegendaryAdmissionWeapon } from '../../engine/boss-evaluator';
import { calculateCoinReward, calculateXpReward } from '../../engine/economy';
import { WeightedSkillMasteryEngineV1 } from '../../progression/mastery-engine';
import { 
  Shield, 
  Flame, 
  Zap, 
  Timer, 
  HelpCircle, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  Sword
} from 'lucide-react';

interface BossArenaScreenProps {
  bossInfo: BossInfo;
  initialPhaseId: BossPhaseId;
  mode: BossBattleMode;
  questions: QuestionItem[];
  profile: PlayerProfile;
  onFinishBattle: (result: BossBattleResult) => void;
  onExit: () => void;
}

export const BossArenaScreen: React.FC<BossArenaScreenProps> = ({
  bossInfo,
  initialPhaseId,
  mode,
  questions,
  profile,
  onFinishBattle,
  onExit,
}) => {
  const hero = HERO_CLASSES[profile.heroId];
  const masteryEngine = new WeightedSkillMasteryEngineV1();

  const [currentPhase, setCurrentPhase] = useState<BossPhaseId>(initialPhaseId);
  const [bossHp, setBossHp] = useState<number>(bossInfo.maxHp);
  const [playerResolve, setPlayerResolve] = useState<number>(4); // 4 shields
  const [phaseFailures, setPhaseFailures] = useState<number>(0);

  // Question tracking
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnsweringLocked, setIsAnsweringLocked] = useState<boolean>(false);
  const [flashFeedback, setFlashFeedback] = useState<'CRITICAL' | 'HIT' | 'BLOCKED' | 'FAIL' | null>(null);

  // Performance telemetry
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [criticalHits, setCriticalHits] = useState<number>(0);
  const [totalDamageDealt, setTotalDamageDealt] = useState<number>(0);
  const [totalTimeElapsedSec, setTotalTimeElapsedSec] = useState<number>(0);
  const [earnedCoins, setEarnedCoins] = useState<number>(0);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [masteryState, setMasteryState] = useState<Record<string, number>>({ ...profile.skillMastery });
  const [misconceptionCounts, setMisconceptionCounts] = useState<Record<string, number>>({});

  const questionStartTimeRef = useRef<number>(Date.now());

  // Filter questions for active phase
  const phaseQuestions = questions.filter((q) => !q.phaseId || q.phaseId === currentPhase);
  const currentQ = phaseQuestions[currentIndex] || phaseQuestions[0];

  // Global Session Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalTimeElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mount question & shuffle options
  useEffect(() => {
    if (!currentQ) return;
    const shuffled = shuffleOptions(currentQ.options);
    setShuffledOptions(shuffled);
    setSelectedOptionId(null);
    setIsAnsweringLocked(false);
    setFlashFeedback(null);
    questionStartTimeRef.current = Date.now();
  }, [currentIndex, currentQ, currentPhase]);

  // Handle Answer Selection
  const handleSelectOption = (option: QuestionOption) => {
    if (isAnsweringLocked) return;
    setIsAnsweringLocked(true);
    setSelectedOptionId(option.id);

    const elapsedMs = Math.max(100, Date.now() - questionStartTimeRef.current);
    const isCorrect = option.isCorrect === true;

    if (isCorrect) {
      const { damage, isCritical } = calculateBossDamage({
        baseDamage: currentQ.bossDamage || 300,
        difficulty: currentQ.difficulty,
        isCorrect: true,
        elapsedMs,
        targetTimeSec: currentQ.targetTimeSec,
      });

      setBossHp((prev) => Math.max(0, prev - damage));
      setTotalDamageDealt((prev) => prev + damage);
      setCorrectCount((prev) => prev + 1);
      if (isCritical) {
        setCriticalHits((prev) => prev + 1);
        setFlashFeedback('CRITICAL');
      } else {
        setFlashFeedback('HIT');
      }

      // Rewards & Mastery
      const qCoins = calculateCoinReward(currentQ.rewardCoins, elapsedMs / 1000, currentQ.targetTimeSec, 0, false);
      const qXp = calculateXpReward(currentQ.rewardXp, true, 0);
      setEarnedCoins((prev) => prev + qCoins);
      setEarnedXp((prev) => prev + qXp);

      const updated = { ...masteryState };
      currentQ.skillTags.forEach((skill) => {
        const cur = updated[skill] || 0.2;
        updated[skill] = masteryEngine.calculateDelta({
          currentMastery: cur,
          isCorrect: true,
          timeRatio: elapsedMs / (currentQ.targetTimeSec * 1000),
          hintLevelUsed: 0,
          attemptCount: 1,
          weight: 1.0,
        });
      });
      setMasteryState(updated);

      // Check for immediate Boss HP Depletion -> Instant Victory
      const remainingHpAfterHit = Math.max(0, bossHp - damage);
      if (remainingHpAfterHit <= 0) {
        setTimeout(() => {
          completeBattle(true, 0);
        }, 600);
        return;
      }
    } else {
      // Resolve loss on incorrect answer
      const newResolve = playerResolve - 1;
      setPlayerResolve(newResolve);
      setFlashFeedback('BLOCKED');

      currentQ.misconceptionTags.forEach((tag) => {
        setMisconceptionCounts((prev) => ({ ...prev, [tag]: (prev[tag] || 0) + 1 }));
      });

      // Check if Resolve depleted -> Phase Failure
      if (newResolve <= 0) {
        setFlashFeedback('FAIL');
        setPhaseFailures((prev) => prev + 1);
        setTimeout(() => {
          handlePhaseFailureRestart();
        }, 1000);
        return;
      }
    }

    setTimeout(() => {
      advanceNextQuestion();
    }, 450);
  };

  // Phase Failure Recovery: Restart current phase without losing previously cleared phases
  const handlePhaseFailureRestart = () => {
    alert(`⚠️ เกราะพลังใจ (Player Resolve) หมดลง! รีสตาร์ท ${currentPhase} จากจุดเซฟ`);
    setPlayerResolve(4);
    setCurrentIndex(0);
    setIsAnsweringLocked(false);
    setFlashFeedback(null);
  };

  // Advance Question or Phase
  const advanceNextQuestion = () => {
    if (currentIndex + 1 < phaseQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Phase Complete! Advance to next phase or victory
      if (currentPhase === 'PHASE_1') {
        setCurrentPhase('PHASE_2');
        setCurrentIndex(0);
      } else if (currentPhase === 'PHASE_2') {
        setCurrentPhase('PHASE_3');
        setCurrentIndex(0);
      } else if (currentPhase === 'PHASE_3') {
        setCurrentPhase('PHASE_4');
        setCurrentIndex(0);
      } else {
        // Final phase done -> Force remaining HP to 0 if accuracy was solid
        const finalHp = 0;
        setBossHp(0);
        completeBattle(true, finalHp);
      }
    }
  };

  // Complete Battle and Calculate Performance Tiers
  const completeBattle = (isVictory: boolean, finalHp: number) => {
    const totalQ = questions.length;
    const accuracy = Math.round((correctCount / Math.max(1, correctCount + (4 - playerResolve) + phaseFailures * 3)) * 100);
    const avgTimeSec = Math.round(totalTimeElapsedSec / Math.max(1, correctCount));

    const isMasteryMet = accuracy >= 95;
    const performanceTier = calculateBossPerformanceTier({
      bossHpRemaining: finalHp,
      accuracy,
      phaseFailures,
      isMasteryMet,
      mode,
    });

    const relicReward = isVictory ? bossInfo.victoryRelicId : null;
    const unlockedGearList = [...profile.unlockedGear];
    if (relicReward && !unlockedGearList.includes(relicReward)) {
      unlockedGearList.push(relicReward);
    }
    const forgeUnlocked = canForgeLegendaryAdmissionWeapon(unlockedGearList);

    const masteryDiffs: Record<string, { before: number; after: number }> = {};
    Object.keys(masteryState).forEach((k) => {
      masteryDiffs[k] = {
        before: profile.skillMastery[k] || 0.2,
        after: masteryState[k] || 0.2,
      };
    });

    onFinishBattle({
      bossId: bossInfo.id,
      bossName: bossInfo.name,
      mode,
      isVictory,
      finalBossHp: finalHp,
      playerResolveRemaining: playerResolve,
      performanceTier,
      totalQuestions: totalQ,
      correctCount,
      accuracy: Math.min(100, Math.max(0, accuracy)),
      totalDamageDealt,
      criticalHits,
      phaseFailures,
      totalTimeSec: totalTimeElapsedSec,
      averageTimeSec: avgTimeSec,
      earnedCoins: isVictory ? earnedCoins + 300 : earnedCoins,
      earnedXp: isVictory ? earnedXp + 200 : earnedXp,
      unlockedRelic: relicReward,
      forgeUnlocked,
      masteryUpdates: masteryDiffs,
      misconceptionProfile: misconceptionCounts,
    });
  };

  const hpRatio = Math.max(0, bossHp / bossInfo.maxHp);

  return (
    <div className="min-h-screen aurora-bg p-3 md:p-6 flex flex-col justify-between text-slate-100 max-w-4xl mx-auto select-none">
      {/* Top Boss HUD & HP Bar */}
      <header className="frost-card rounded-2xl p-4 shadow-2xl relative overflow-hidden border-2 border-rose-500/60">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center text-3xl shadow-glow-gold animate-pulse">
              {bossInfo.avatar}
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-rose-400 uppercase tracking-widest">
                {bossInfo.citadelTitle}
              </span>
              <h2 className="text-base md:text-lg font-black text-white">{bossInfo.thaiName}</h2>
            </div>
          </div>

          {/* Phase Badge & Mode */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-950 border border-purple-400 text-purple-300 text-xs font-black">
              {currentPhase.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold">
              {mode === 'CHALLENGE' ? '⚔️ Challenge' : '🎯 Practice'}
            </span>
            <button
              onClick={onExit}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
            >
              ยอมแพ้
            </button>
          </div>
        </div>

        {/* Boss HP Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-black px-1">
            <span className="text-rose-400 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-rose-400" /> BOSS HP: {bossHp.toLocaleString()} / {bossInfo.maxHp.toLocaleString()}
            </span>
            <span className="text-slate-300 font-mono">{Math.round(hpRatio * 100)}%</span>
          </div>
          <div className="w-full bg-arctic-950 rounded-full h-4 overflow-hidden border border-rose-500/50 p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 transition-all duration-300 shadow-glow-gold"
              style={{ width: `${hpRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Player Resolve Shields HUD */}
        <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-300">เกราะพลังใจ (Resolve):</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Shield
                  key={i}
                  className={`w-4 h-4 transition-all ${
                    i < playerResolve
                      ? 'text-cyan-400 fill-cyan-400 drop-shadow-md scale-105'
                      : 'text-slate-600 fill-slate-800 opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-slate-400 font-mono">
            ดาเมจสะสม: <span className="text-amber-400 font-bold">{totalDamageDealt.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Combat Arena Question Box */}
      <main className="frost-card rounded-3xl p-5 md:p-8 flex-1 flex flex-col justify-between my-3 shadow-2xl relative overflow-hidden">
        {/* Combat Action Flash */}
        {flashFeedback === 'CRITICAL' && (
          <div className="absolute inset-0 bg-amber-500/20 pointer-events-none flex items-center justify-center animate-scale-up z-20">
            <span className="text-3xl md:text-5xl font-black text-amber-300 drop-shadow-glow text-glow-gold">
              💥 CRITICAL STRIKE! -{currentQ.bossDamage ? Math.round(currentQ.bossDamage * 1.25) : 375} HP
            </span>
          </div>
        )}
        {flashFeedback === 'HIT' && (
          <div className="absolute inset-0 bg-emerald-500/20 pointer-events-none flex items-center justify-center animate-fade-out z-20">
            <span className="text-2xl md:text-4xl font-black text-emerald-300 drop-shadow-lg">
              ⚔️ DIRECT HIT! -{currentQ.bossDamage || 300} HP
            </span>
          </div>
        )}
        {flashFeedback === 'BLOCKED' && (
          <div className="absolute inset-0 bg-rose-500/20 pointer-events-none flex items-center justify-center animate-fade-out z-20">
            <span className="text-2xl md:text-3xl font-black text-rose-300 drop-shadow-lg">
              🛡️ BOSS COUNTER! สูญเสีย 1 Resolve
            </span>
          </div>
        )}

        {/* Header & Subtopic */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-400/40 text-purple-300">
            {currentQ?.subtopic}
          </span>

          {mode === 'PRACTICE' && (
            <button
              onClick={() => setShowHintModal(true)}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 text-xs font-bold flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> คำใบ้ฝึกฝน
            </button>
          )}
        </div>

        {/* High Stakes Math Question */}
        <div className="my-auto py-4">
          <h2 className="text-lg md:text-2xl font-black text-white leading-relaxed">
            {currentQ?.questionText}
          </h2>
        </div>

        {/* 4-Option Attack Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {shuffledOptions.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle = 'bg-arctic-800/90 border-slate-700 hover:border-rose-400 text-white active:scale-98';

            if (isAnsweringLocked) {
              if (opt.isCorrect) {
                btnStyle = 'bg-emerald-950 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400 shadow-glow-cyan';
              } else if (isSelected && !opt.isCorrect) {
                btnStyle = 'bg-rose-950 border-rose-500 text-rose-300';
              } else {
                btnStyle = 'bg-arctic-900/40 border-slate-800 text-slate-600 opacity-40';
              }
            }

            return (
              <button
                key={opt.id}
                disabled={isAnsweringLocked}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl border text-left font-medium transition-all duration-150 flex items-center gap-3.5 ${btnStyle}`}
              >
                <span className="w-8 h-8 rounded-xl bg-arctic-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-rose-300 shrink-0">
                  {opt.displayLetter || opt.id}
                </span>
                <span className="text-sm md:text-base font-semibold">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer Combat Status */}
      <footer className="frost-card rounded-2xl p-3 flex items-center justify-between text-xs text-slate-400 font-semibold">
        <span>ข้อที่ {currentIndex + 1} / {phaseQuestions.length} ({currentPhase})</span>
        <span>💥 คริติคอล: {criticalHits} ครั้ง</span>
        <span>🎯 ถูกต้อง: {correctCount} ข้อ</span>
      </footer>

      {/* Practice Mode Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="frost-card rounded-2xl p-6 max-w-md w-full border border-purple-400 shadow-glow-purple text-slate-100">
            <h3 className="font-extrabold text-base text-purple-300 mb-2">💡 คำใบ้สำหรับโหมดฝึกฝนบอส</h3>
            <p className="text-sm text-slate-200 leading-relaxed mb-4">{currentQ?.powerUpHint}</p>
            <button
              onClick={() => setShowHintModal(false)}
              className="w-full py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
