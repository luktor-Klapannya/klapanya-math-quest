import React, { useState, useEffect, useRef } from 'react';
import { useGameEvidence } from '../../services/game-evidence';
import { 
  PlayerProfile, 
  QuestionItem, 
  QuestionOption, 
  ShrineRunMode, 
  ShrineRunSize, 
  ShrineRunResult 
} from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { shuffleOptions } from '../../engine/shuffler';
import { calculateSpeedGrade, getComboMilestone, calculateShrineDrop } from '../../engine/speedrun-evaluator';
import { calculateCoinReward, calculateXpReward } from '../../engine/economy';
import { WeightedSkillMasteryEngineV1 } from '../../progression/mastery-engine';
import { audioEngine } from '../../services/audio-service';
import { 
  Zap, 
  Flame, 
  Timer, 
  Sparkles, 
  XCircle, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';
import { SceneBackground } from '../components/SceneBackground';

interface ShrineSpeedrunScreenProps {
  stageId: string;
  stageName: string;
  targetTimeSec: number;
  runMode: ShrineRunMode;
  runSize: ShrineRunSize;
  questions: QuestionItem[];
  profile: PlayerProfile;
  onFinishRun: (result: ShrineRunResult) => void;
  onExit: () => void;
}

export const ShrineSpeedrunScreen: React.FC<ShrineSpeedrunScreenProps> = ({
  stageId,
  stageName,
  targetTimeSec,
  runMode,
  runSize,
  questions,
  profile,
  onFinishRun: finishRun,
  onExit,
}) => {
  const evidence = useGameEvidence(stageId,{engine:'SHRINE_V1',runMode,runSize,questionIds:questions.map(q=>q.id)});
  const onFinishRun = (result: ShrineRunResult) => { evidence.finish(result); finishRun(result); };
  const hero = HERO_CLASSES[profile.heroId];
  const masteryEngine = new WeightedSkillMasteryEngineV1();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnsweringLocked, setIsAnsweringLocked] = useState<boolean>(false);

  // High precision timer (increments every 50ms)
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(targetTimeSec * 1000);
  const [isTimeFrozen, setIsTimeFrozen] = useState<boolean>(false);
  const [frozenMsLeft, setFrozenMsLeft] = useState<number>(0);
  const [isTimeStopUsedInSession, setIsTimeStopUsedInSession] = useState<boolean>(false);

  // Hero Skill State: Active skills only in Practice Mode
  const [skillAvailable, setSkillAvailable] = useState<boolean>(runMode === 'PRACTICE');
  const [ironWillUsed, setIronWillUsed] = useState<boolean>(false);

  // Speedrun Performance Metrics
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [perfectHits, setPerfectHits] = useState<number>(0);
  const [timeouts, setTimeouts] = useState<number>(0);
  const [fastestAnswerMs, setFastestAnswerMs] = useState<number>(99999);
  const [responseTimesMs, setResponseTimesMs] = useState<number[]>([]);
  const [earnedCoins, setEarnedCoins] = useState<number>(0);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [flashFeedback, setFlashFeedback] = useState<'CORRECT' | 'WRONG' | 'TIMEOUT' | 'PERFECT' | null>(null);

  const [masteryState, setMasteryState] = useState<Record<string, number>>({ ...profile.skillMastery });
  const questionStartTimeRef = useRef<number>(Date.now());

  const currentQ = questions[currentIndex];
  const activeMilestone = getComboMilestone(currentCombo);

  // Mount new question & shuffle
  useEffect(() => {
    if (!currentQ) return;
    const shuffled = shuffleOptions(currentQ.options);
    setShuffledOptions(shuffled);
    setSelectedOptionId(null);
    setIsAnsweringLocked(false);
    setFlashFeedback(null);
    setTimeRemainingMs(targetTimeSec * 1000);
    questionStartTimeRef.current = Date.now();
  }, [currentIndex, currentQ, targetTimeSec]);

  // Fast Timer loop (50ms interval)
  useEffect(() => {
    if (isAnsweringLocked) return;

    const interval = setInterval(() => {
      if (isTimeFrozen) {
        setFrozenMsLeft((prev) => {
          if (prev <= 50) {
            setIsTimeFrozen(false);
            return 0;
          }
          return prev - 50;
        });
      } else {
        setTimeRemainingMs((prev) => {
          if (prev <= 50) {
            handleTimeout();
            return 0;
          }
          return prev - 50;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isAnsweringLocked, isTimeFrozen, timeRemainingMs]);

  // Handle Timeout
  const handleTimeout = () => {
    if (isAnsweringLocked) return;
    evidence.record({questionId:currentQ.id,selectedOptionId:null,timeSpentSec:targetTimeSec,hintLevelUsed:0});
    setIsAnsweringLocked(true);
    setTimeouts((prev) => prev + 1);
    setFlashFeedback('TIMEOUT');
    setCurrentCombo(0);
    audioEngine.playSfx('SFX_WRONG');

    setResponseTimesMs((prev) => [...prev, targetTimeSec * 1000]);

    setTimeout(() => {
      advanceNextQuestion();
    }, 400);
  };

  // Trigger Hero Skill in Practice Mode
  const handleTriggerHeroSkill = () => {
    if (!skillAvailable || isAnsweringLocked || runMode === 'RANKED') return;

    setSkillAvailable(false);
    if (profile.heroId === 'CHRONOMANCER') {
      setIsTimeFrozen(true);
      setFrozenMsLeft(5000); // 5s freeze in speedrun
      setIsTimeStopUsedInSession(true);
    }
  };

  // Submit Answer
  const handleOptionSelect = (option: QuestionOption) => {
    if (isAnsweringLocked) return;
    setIsAnsweringLocked(true);
    setSelectedOptionId(option.id);

    const elapsedMs = Math.max(50, Date.now() - questionStartTimeRef.current);
    evidence.record({ questionId:currentQ.id, selectedOptionId:option.id, timeSpentSec:elapsedMs / 1000, hintLevelUsed:0 });
    setResponseTimesMs((prev) => [...prev, elapsedMs]);
    if (elapsedMs < fastestAnswerMs) setFastestAnswerMs(elapsedMs);

    const isCorrect = option.isCorrect === true;
    const isPerfect = isCorrect && elapsedMs <= (targetTimeSec * 1000 * 0.5);

    if (isCorrect) {
      const newCorrect = correctCount + 1;
      const newCombo = currentCombo + 1;
      setCorrectCount(newCorrect);
      setCurrentCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      if (isPerfect) {
        setPerfectHits((prev) => prev + 1);
        setFlashFeedback('PERFECT');
      } else {
        setFlashFeedback('CORRECT');
      }

      // Calculate Speedrun Rewards
      const qCoins = calculateCoinReward(
        currentQ.rewardCoins,
        elapsedMs / 1000,
        targetTimeSec,
        newCombo,
        profile.heroId === 'CHRONOMANCER'
      );
      const qXp = calculateXpReward(currentQ.rewardXp, true, 0);
      setEarnedCoins((prev) => prev + qCoins);
      setEarnedXp((prev) => prev + qXp);

      // Mastery delta update
      const updatedMastery = { ...masteryState };
      currentQ.skillTags.forEach((skill) => {
        const cur = updatedMastery[skill] || 0.2;
        updatedMastery[skill] = masteryEngine.calculateDelta({
          currentMastery: cur,
          isCorrect: true,
          timeRatio: elapsedMs / (targetTimeSec * 1000),
          hintLevelUsed: 0,
          attemptCount: 1,
          weight: 1.0,
        });
      });
      setMasteryState(updatedMastery);
    } else {
      // Paladin Iron Will: In Practice Mode only, protects combo once per run
      if (profile.heroId === 'PALADIN' && runMode === 'PRACTICE' && !ironWillUsed && currentCombo > 0) {
        setIronWillUsed(true);
      } else {
        setCurrentCombo(0);
      }

      setFlashFeedback('WRONG');
      audioEngine.playSfx('SFX_WRONG');
      const qXp = calculateXpReward(currentQ.rewardXp, false, 0);
      setEarnedXp((prev) => prev + qXp);
    }

    // Near-instant transition (180ms) for high-cadence speed flow
    setTimeout(() => {
      advanceNextQuestion();
    }, 200);
  };

  // Advance to next question or complete speedrun
  const advanceNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Speedrun Complete!
      const totalQ = questions.length;
      const accuracy = Math.round((correctCount / totalQ) * 100);
      const sumTimesMs = responseTimesMs.reduce((a, b) => a + b, 0);
      const avgTimeSec = parseFloat(((sumTimesMs / totalQ) / 1000).toFixed(2));
      const fastestSec = parseFloat((fastestAnswerMs / 1000).toFixed(2));
      const totalTimeSec = Math.round(sumTimesMs / 1000);

      const speedGrade = calculateSpeedGrade({
        accuracy,
        averageTimeSec: avgTimeSec,
        targetTimeSec,
        maxCombo,
        totalQuestions: totalQ,
        isTimeStopUsed: isTimeStopUsedInSession,
        runMode,
      });

      const isPassed = accuracy >= 80;
      const isMasteryMet = accuracy >= 95 && speedGrade === 'S';

      const hasMasterCrest = profile.unlockedGear.includes('MASTER_MENTAL_CREST');
      const dropInfo = calculateShrineDrop(stageId, speedGrade, runMode, isPassed, hasMasterCrest);

      const masteryDiffs: Record<string, { before: number; after: number }> = {};
      Object.keys(masteryState).forEach((k) => {
        masteryDiffs[k] = {
          before: profile.skillMastery[k] || 0.2,
          after: masteryState[k] || 0.2,
        };
      });

      onFinishRun({
        stageId,
        runMode,
        runSize,
        totalQuestions: totalQ,
        correctCount,
        accuracy,
        speedGrade,
        totalTimeSec,
        averageTimeSec: avgTimeSec,
        fastestAnswerSec: fastestSec < 99 ? fastestSec : avgTimeSec,
        maxCombo,
        perfectHits,
        timeouts,
        earnedCoins,
        earnedXp,
        earnedMaterial: dropInfo.materialId,
        materialCount: dropInfo.count,
        masteryUpdates: masteryDiffs,
        isPassed,
        isMasteryMet,
      });
    }
  };

  const timerRatio = Math.max(0, timeRemainingMs / (targetTimeSec * 1000));
  const timerSecDisplay = (timeRemainingMs / 1000).toFixed(1);

  return (
    <SceneBackground territoryId="FROZEN_ARCTIC" sceneType="FARMING" className="p-3 md:p-6">
      <div className="flex-1 flex flex-col justify-between text-slate-100 max-w-3xl mx-auto w-full select-none font-sans">
        {/* Top Speedrun HUD */}
        <header className="frost-card rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="text-2xl">{hero.avatar}</div>
          <div>
            <div className="text-[11px] font-bold text-cyan-400">
              {stageName} • {runMode === 'RANKED' ? '🔥 โหมดจัดอันดับ' : '🎯 โหมดฝึกฝน'}
            </div>
            <div className="text-xs md:text-sm font-black text-white">
              ข้อที่ {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Combo Badge & Milestone */}
        <div className="flex items-center gap-2">
          {currentCombo >= 3 && (
            <div className="px-3 py-1 rounded-full bg-amber-950/90 border border-amber-400 text-amber-300 font-black text-xs animate-bounce flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{currentCombo} COMBO!</span>
            </div>
          )}

          <div className="px-2.5 py-1 rounded-lg bg-arctic-800 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            🪙 +{earnedCoins}
          </div>

          <button
            onClick={onExit}
            className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
          >
            ออก
          </button>
        </div>
      </header>

      {/* Real-time Combo Milestone Display */}
      {activeMilestone && (
        <div className="text-center my-1 animate-pulse">
          <span className={`text-xs md:text-sm font-extrabold uppercase tracking-wider ${activeMilestone.color}`}>
            {activeMilestone.title}
          </span>
        </div>
      )}

      {/* Speed Timer Bar (Ultra Rapid) */}
      <div className="my-2 space-y-1">
        <div className="flex justify-between text-xs font-bold px-1">
          <span className="text-slate-400">เวลาต่อข้อ ({targetTimeSec}s)</span>
          <span
            className={`flex items-center gap-1 font-mono text-sm font-black ${
              isTimeFrozen
                ? 'text-cyan-300 animate-pulse text-glow-cyan'
                : timerRatio <= 0.3
                ? 'text-rose-400 animate-bounce'
                : 'text-cyan-400'
            }`}
          >
            <Timer className="w-4 h-4" />
            {isTimeFrozen ? 'หยุดเวลา!' : `${timerSecDisplay}s`}
          </span>
        </div>

        <div className="w-full bg-arctic-800 rounded-full h-3 overflow-hidden border border-cyan-500/40 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              isTimeFrozen
                ? 'bg-cyan-300 shadow-glow-cyan'
                : timerRatio <= 0.3
                ? 'bg-rose-500 shadow-lg'
                : timerRatio <= 0.6
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400'
            }`}
            style={{ width: `${timerRatio * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question & Rapid Duel Arena */}
      <main className="frost-card rounded-3xl p-5 md:p-8 flex-1 flex flex-col justify-between shadow-2xl relative overflow-hidden">
        {/* Flash Overlay on Answer */}
        {flashFeedback === 'PERFECT' && (
          <div className="absolute inset-0 bg-cyan-500/20 pointer-events-none flex items-center justify-center animate-fade-out">
            <span className="text-3xl md:text-5xl font-black text-cyan-300 drop-shadow-glow text-glow-cyan">
              ⚡ PERFECT HIT!
            </span>
          </div>
        )}
        {flashFeedback === 'CORRECT' && (
          <div className="absolute inset-0 bg-emerald-500/20 pointer-events-none flex items-center justify-center animate-fade-out">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 drop-shadow-lg" />
          </div>
        )}
        {flashFeedback === 'WRONG' && (
          <div className="absolute inset-0 bg-rose-500/20 pointer-events-none flex items-center justify-center animate-fade-out">
            <XCircle className="w-16 h-16 text-rose-400 drop-shadow-lg" />
          </div>
        )}
        {flashFeedback === 'TIMEOUT' && (
          <div className="absolute inset-0 bg-amber-500/20 pointer-events-none flex items-center justify-center animate-fade-out">
            <span className="text-2xl md:text-3xl font-black text-amber-300">
              ⌛ หมดเวลา!
            </span>
          </div>
        )}

        {/* Practice Hero Skill Trigger */}
        {runMode === 'PRACTICE' && (
          <div className="flex justify-end mb-2">
            <button
              onClick={handleTriggerHeroSkill}
              disabled={!skillAvailable || isAnsweringLocked}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                skillAvailable && !isAnsweringLocked
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-glow-gold'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> {hero.activeName} (หยุดเวลา 5s)
            </button>
          </div>
        )}

        {/* Big Math Question */}
        <div className="my-auto py-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-wider font-mono drop-shadow-md">
            {currentQ?.questionText}
          </h2>
        </div>

        {/* Big 4-Button Grid for Mobile Automaticity */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4">
          {shuffledOptions.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle = 'bg-arctic-800/90 border-cyan-500/30 hover:border-cyan-400 text-white active:scale-95';

            if (isAnsweringLocked) {
              if (opt.isCorrect) {
                btnStyle = 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold ring-2 ring-emerald-400 shadow-glow-cyan';
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
                onClick={() => handleOptionSelect(opt)}
                className={`py-5 md:py-6 px-4 rounded-2xl border text-center font-black text-xl md:text-3xl font-mono transition-all duration-100 flex items-center justify-center gap-2 ${btnStyle}`}
              >
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Speed Metrics Micro Footer */}
      <footer className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-400 px-2">
        <span>⚡ เร็วที่สุด: {fastestAnswerMs < 99999 ? `${(fastestAnswerMs / 1000).toFixed(2)}s` : '-'}</span>
        <span>🔥 คอมโบสูงสุด: {maxCombo}</span>
        <span>🎯 แม่นยำ: {currentIndex > 0 ? `${Math.round((correctCount / currentIndex) * 100)}%` : '100%'}</span>
      </footer>
      </div>
    </SceneBackground>
  );
};
