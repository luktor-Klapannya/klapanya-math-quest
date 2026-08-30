import React, { useState, useEffect } from 'react';
import { 
  PlayerProfile, 
  QuestionItem, 
  QuestionOption, 
  StageSessionResult 
} from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { shuffleOptions } from '../../engine/shuffler';
import { calculateCoinReward, calculateXpReward } from '../../engine/economy';
import { WeightedSkillMasteryEngineV1 } from '../../progression/mastery-engine';
import { 
  Timer, 
  Sparkles, 
  HelpCircle, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Flame
} from 'lucide-react';

interface BattleScreenProps {
  stageId: string;
  stageName: string;
  questions: QuestionItem[];
  profile: PlayerProfile;
  onFinishSession: (result: StageSessionResult) => void;
  onExitStage: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  stageId,
  stageName,
  questions,
  profile,
  onFinishSession,
  onExitStage,
}) => {
  const hero = HERO_CLASSES[profile.heroId];
  const masteryEngine = new WeightedSkillMasteryEngineV1();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Timers & Combat state
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isTimeFrozen, setIsTimeFrozen] = useState<boolean>(false);
  const [frozenSecondsLeft, setFrozenSecondsLeft] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Hero Skills & Power-up state
  const [eliminatedOptionIds, setEliminatedOptionIds] = useState<string[]>([]);
  const [isTrapGlowActive, setIsTrapGlowActive] = useState<boolean>(false);
  const [skillAvailable, setSkillAvailable] = useState<boolean>(true);
  const [hintLevelUsed, setHintLevelUsed] = useState<number>(0);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  // Cumulative Session Metrics
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [earnedCoins, setEarnedCoins] = useState<number>(0);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState<number>(0);
  const [masteryState, setMasteryState] = useState<Record<string, number>>({ ...profile.skillMastery });

  const currentQ = questions[currentIndex];

  // Initialize and shuffle options on question load
  useEffect(() => {
    if (!currentQ) return;
    const shuffled = shuffleOptions(currentQ.options);
    setShuffledOptions(shuffled);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setTimeLeft(currentQ.targetTimeSec || 30);
    setEliminatedOptionIds([]);
    setIsTrapGlowActive(false);
    setHintLevelUsed(0);
    setShowHintModal(false);
    setStartTime(Date.now());
  }, [currentIndex, currentQ]);

  // Main countdown timer loop
  useEffect(() => {
    if (isAnswerSubmitted) return;

    const interval = setInterval(() => {
      if (isTimeFrozen) {
        setFrozenSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimeFrozen(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnswerSubmitted, isTimeFrozen, timeLeft]);

  // Handle timeout
  const handleTimeExpired = () => {
    if (isAnswerSubmitted) return;
    handleSubmitAnswer(null);
  };

  // Trigger Hero Active Ability
  const handleTriggerHeroSkill = () => {
    if (!skillAvailable || isAnswerSubmitted) return;

    setSkillAvailable(false);

    if (profile.heroId === 'CHRONOMANCER') {
      // Time Stop: 15 seconds pause
      setIsTimeFrozen(true);
      setFrozenSecondsLeft(15);
    } else if (profile.heroId === 'PALADIN') {
      // Trap Detector: highlight keywords
      setIsTrapGlowActive(true);
    } else if (profile.heroId === 'SNIPER') {
      // Snipe: eliminate 1 incorrect option using authoritative isCorrect metadata
      const wrong = shuffledOptions.filter((opt) => !opt.isCorrect);
      if (wrong.length > 0) {
        setEliminatedOptionIds([wrong[0].id]);
      }
    } else if (profile.heroId === 'ROGUE') {
      // 50:50 Shadow: eliminate 2 incorrect options
      const wrong = shuffledOptions.filter((opt) => !opt.isCorrect);
      if (wrong.length >= 2) {
        setEliminatedOptionIds([wrong[0].id, wrong[1].id]);
      }
    }
  };

  // Submit Answer using isCorrect metadata
  const handleSubmitAnswer = (chosenOptId: string | null) => {
    if (isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setSelectedOptionId(chosenOptId);

    const timeSpentSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    setTotalTimeElapsed((prev) => prev + timeSpentSec);

    // Evaluate against stable isCorrect metadata
    const chosenOption = shuffledOptions.find((o) => o.id === chosenOptId);
    const correct = chosenOption ? chosenOption.isCorrect === true : false;
    setIsCorrect(correct);

    if (correct) {
      const newCorrect = correctCount + 1;
      const newCombo = comboCount + 1;
      setCorrectCount(newCorrect);
      setComboCount(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Economy rewards
      const qCoins = calculateCoinReward(
        currentQ.rewardCoins,
        timeSpentSec,
        currentQ.targetTimeSec,
        newCombo,
        profile.heroId === 'CHRONOMANCER'
      );
      const qXp = calculateXpReward(currentQ.rewardXp, true, hintLevelUsed);

      setEarnedCoins((prev) => prev + qCoins);
      setEarnedXp((prev) => prev + qXp);

      // Mastery delta for skill tags
      const updatedMastery = { ...masteryState };
      currentQ.skillTags.forEach((skill) => {
        const cur = updatedMastery[skill] || 0.2;
        updatedMastery[skill] = masteryEngine.calculateDelta({
          currentMastery: cur,
          isCorrect: true,
          timeRatio: timeSpentSec / currentQ.targetTimeSec,
          hintLevelUsed,
          attemptCount: 1,
          weight: 1.0,
        });
      });
      setMasteryState(updatedMastery);
    } else {
      // Paladin Iron Will passive: first wrong answer in session does not break combo
      if (profile.heroId === 'PALADIN' && comboCount > 0 && correctCount === 0) {
        // preserve combo once
      } else {
        setComboCount(0);
      }

      const qXp = calculateXpReward(currentQ.rewardXp, false, hintLevelUsed);
      setEarnedXp((prev) => prev + qXp);

      const updatedMastery = { ...masteryState };
      currentQ.skillTags.forEach((skill) => {
        const cur = updatedMastery[skill] || 0.2;
        updatedMastery[skill] = masteryEngine.calculateDelta({
          currentMastery: cur,
          isCorrect: false,
          timeRatio: 1.2,
          hintLevelUsed,
          attemptCount: 1,
          weight: 1.0,
        });
      });
      setMasteryState(updatedMastery);
    }
  };

  // Next Question or Complete Session
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Session Complete!
      const totalQ = questions.length;
      const finalAccuracy = Math.round((correctCount / totalQ) * 100);
      const isPassed = finalAccuracy >= 70;
      const isMasteryMet = finalAccuracy >= 90;

      // Determine stage gear reward
      const gearRewardMap: Record<string, string> = {
        D1: 'BLADE_OF_CALCULATION',
        D2: 'GAUNTLET_OF_PRECISION',
        D3: 'RUNE_LENS_OF_FACTORS',
        D4: 'SPATIAL_ICE_SHIELD',
        D5: 'CHRONO_BOOTS',
        D6: 'FRACTION_CORE',
      };
      const potentialGear = gearRewardMap[stageId];
      const willUnlockGear = isPassed && potentialGear && !profile.unlockedGear.includes(potentialGear) ? potentialGear : null;

      const masteryDiffs: Record<string, { before: number; after: number }> = {};
      Object.keys(masteryState).forEach((k) => {
        masteryDiffs[k] = {
          before: profile.skillMastery[k] || 0.2,
          after: masteryState[k] || 0.2,
        };
      });

      onFinishSession({
        stageId,
        totalQuestions: totalQ,
        correctCount,
        accuracy: finalAccuracy,
        totalTimeSec: totalTimeElapsed,
        averageTimeSec: Math.round(totalTimeElapsed / totalQ),
        earnedCoins,
        earnedXp,
        masteryUpdates: masteryDiffs,
        unlockedGear: willUnlockGear,
        isPassed,
        isMasteryMet,
      });
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-6 flex flex-col justify-between text-slate-100 max-w-4xl mx-auto">
      {/* Top HUD */}
      <header className="frost-card rounded-2xl p-4 mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{hero.avatar}</div>
          <div>
            <div className="text-xs font-bold text-cyan-400">สถานี {stageId}: {stageName}</div>
            <div className="text-sm font-extrabold text-white">
              ข้อที่ {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Combo & Stats */}
        <div className="flex items-center gap-3 text-xs font-bold">
          {comboCount > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-400 text-amber-300 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{comboCount} COMBO!</span>
            </div>
          )}

          <div className="px-2.5 py-1 rounded-lg bg-arctic-800 border border-cyan-500/30 text-cyan-300">
            🪙 +{earnedCoins}
          </div>

          <button
            onClick={onExitStage}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            ออก
          </button>
        </div>
      </header>

      {/* Progress & Precision Timer Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-xs font-semibold px-1">
          <span className="text-slate-400">ความคืบหน้า {progressPercent}%</span>
          <span
            className={`flex items-center gap-1 font-bold ${
              isTimeFrozen
                ? 'text-cyan-400 text-glow-cyan animate-pulse'
                : timeLeft <= 5
                ? 'text-rose-400 animate-bounce'
                : 'text-cyan-300'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            {isTimeFrozen ? `หยุดเวลา! (${frozenSecondsLeft}s)` : `${timeLeft} วินาที`}
          </span>
        </div>

        <div className="w-full bg-arctic-800 rounded-full h-2.5 overflow-hidden border border-cyan-500/30">
          <div
            className={`h-full transition-all duration-300 ${
              isTimeFrozen
                ? 'bg-cyan-300 shadow-glow-cyan'
                : timeLeft <= 5
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${(timeLeft / (currentQ?.targetTimeSec || 30)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Arena Card */}
      <main className="frost-card rounded-2xl p-5 md:p-8 flex-1 flex flex-col justify-between shadow-2xl relative">
        {/* Topic Tag & Hero Ability Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
            {currentQ?.subtopic || currentQ?.topic}
          </span>

          <div className="flex items-center gap-2">
            {/* Hero Active Skill Button */}
            <button
              onClick={handleTriggerHeroSkill}
              disabled={!skillAvailable || isAnswerSubmitted}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                skillAvailable && !isAnswerSubmitted
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-glow-gold transform hover:scale-105'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{hero.activeName}</span>
              {skillAvailable ? '(พร้อมใช้)' : '(ใช้แล้ว)'}
            </button>

            {/* Hint Button */}
            <button
              onClick={() => {
                setHintLevelUsed((prev) => Math.min(2, prev + 1));
                setShowHintModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 text-xs font-bold flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> คำใบ้
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="my-auto py-4">
          <h2
            className={`text-lg md:text-2xl font-black text-white leading-relaxed ${
              isTrapGlowActive ? 'ring-2 ring-amber-400 p-3 rounded-xl bg-amber-950/40' : ''
            }`}
          >
            {currentQ?.questionText}
          </h2>
          {isTrapGlowActive && (
            <p className="text-xs text-amber-300 font-semibold mt-2 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Trap Detector: เรืองแสงจับประเด็นสำคัญในโจทย์!
            </p>
          )}
        </div>

        {/* Shuffled Options 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {shuffledOptions.map((opt) => {
            const isEliminated = eliminatedOptionIds.includes(opt.id);
            const isSelected = selectedOptionId === opt.id;
            const isCorrectOption = opt.isCorrect;

            let optionStyle = 'bg-arctic-800/90 border-cyan-500/30 hover:border-cyan-400 text-white';

            if (isEliminated) {
              optionStyle = 'bg-slate-900/40 border-slate-800 text-slate-600 line-through cursor-not-allowed';
            } else if (isAnswerSubmitted) {
              if (isCorrectOption) {
                optionStyle = 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold ring-2 ring-emerald-400 shadow-lg';
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'bg-rose-950 border-rose-500 text-rose-300 font-bold';
              } else {
                optionStyle = 'bg-arctic-900/60 border-slate-800 text-slate-500 opacity-50';
              }
            } else if (isSelected) {
              optionStyle = 'bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400 text-cyan-200';
            }

            return (
              <button
                key={opt.id}
                disabled={isAnswerSubmitted || isEliminated}
                onClick={() => handleSubmitAnswer(opt.id)}
                className={`p-4 rounded-xl border text-left font-medium transition-all duration-200 flex items-center gap-3 relative ${optionStyle}`}
              >
                <span className="w-7 h-7 rounded-lg bg-arctic-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-300 shrink-0">
                  {opt.displayLetter || opt.id}
                </span>
                <span className="text-sm md:text-base font-semibold">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Immediate Solution & Feedback Bar */}
      {isAnswerSubmitted && (
        <div className="frost-card rounded-2xl p-4 mt-4 animate-fade-in border-2 border-cyan-400/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <h4 className="font-extrabold text-sm md:text-base text-white">
                  {isCorrect ? 'ถูกต้องยอดเยี่ยม!' : 'ยังไม่ถูกต้อง'}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                  {currentQ.shortcutNote || currentQ.explanation}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs md:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-glow-cyan transform hover:scale-105 shrink-0"
            >
              {currentIndex + 1 < questions.length ? 'ข้อถัดไป' : 'ดูผลคะแนน'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="frost-card rounded-2xl p-6 max-w-md w-full border border-cyan-400 shadow-glow-cyan animate-scale-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-base text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> คำใบ้ระดับที่ {hintLevelUsed}
              </h3>
              <button
                onClick={() => setShowHintModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ปิด
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {hintLevelUsed === 1 ? currentQ.powerUpHint : currentQ.hintLevel2 || currentQ.powerUpHint}
            </p>
            <button
              onClick={() => setShowHintModal(false)}
              className="w-full mt-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
            >
              เข้าใจแล้ว ลุยต่อ!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
