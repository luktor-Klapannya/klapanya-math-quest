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
import { analyzeWrongAnswer } from '../../engine/remediation-engine';
import { RemediationFeedback } from '../../types/learning';
import { HeroEmoteState, BossAnimationState, DamagePopupData } from '../../types/combat-animation';
import { CombatArenaView } from '../components/CombatArenaView';
import { calculateEffectiveTimeSec } from '../../engine/adaptive-timer-engine';
import { AdaptiveTimerDisplay } from '../components/AdaptiveTimerDisplay';
import { audioEngine } from '../../services/audio-service';
import { 
  Timer, 
  Sparkles, 
  HelpCircle, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Flame,
  AlertTriangle,
  RotateCcw,
  Scissors,
  Hourglass,
  Lightbulb
} from 'lucide-react';

interface BattleScreenProps {
  stageId: string;
  stageName: string;
  questions: QuestionItem[];
  profile: PlayerProfile;
  isExamMode?: boolean; // Invariant: If true, all aids strictly blocked
  onFinishSession: (result: StageSessionResult) => void;
  onExitStage: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  stageId,
  stageName,
  questions,
  profile,
  isExamMode = false,
  onFinishSession,
  onExitStage,
}) => {
  const hero = HERO_CLASSES[profile.heroId];
  const masteryEngine = new WeightedSkillMasteryEngineV1();

  const [questionList, setQuestionList] = useState<QuestionItem[]>(questions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Timers & Combat state
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [targetEffectiveSec, setTargetEffectiveSec] = useState<number>(30);
  const [isTimeFrozen, setIsTimeFrozen] = useState<boolean>(false);
  const [frozenSecondsLeft, setFrozenSecondsLeft] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Hero Skills & Consumable Inventory usage
  const [eliminatedOptionIds, setEliminatedOptionIds] = useState<string[]>([]);
  const [isTrapGlowActive, setIsTrapGlowActive] = useState<boolean>(false);
  const [skillAvailable, setSkillAvailable] = useState<boolean>(true);
  const [hintLevelUsed, setHintLevelUsed] = useState<number>(0);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [remediation, setRemediation] = useState<RemediationFeedback | null>(null);
  const [showRemediationModal, setShowRemediationModal] = useState<boolean>(false);

  // Cumulative Session Metrics
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [earnedCoins, setEarnedCoins] = useState<number>(0);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState<number>(0);
  const [masteryState, setMasteryState] = useState<Record<string, number>>({ ...profile.skillMastery });

  // Combat Animation & Game Feel State
  const [heroEmote, setHeroEmote] = useState<HeroEmoteState>('IDLE');
  const [bossState, setBossState] = useState<BossAnimationState>('IDLE');
  const [damagePopups, setDamagePopups] = useState<DamagePopupData[]>([]);
  const [dummyHp, setDummyHp] = useState<number>(1000);

  const currentQ = questionList[currentIndex];

  // Initialize and shuffle options on question load
  useEffect(() => {
    if (!currentQ) return;
    const shuffled = shuffleOptions(currentQ.options);
    setShuffledOptions(shuffled);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setEliminatedOptionIds([]);
    setIsTrapGlowActive(false);
    setHintLevelUsed(0);
    const eff = calculateEffectiveTimeSec({
      baseTargetTimeSec: currentQ.targetTimeSec || 30,
      difficulty: currentQ.difficulty,
      questionType: currentQ.mechanicType,
      stageId: currentQ.stageId,
      requiresDiagram: currentQ.requiresDiagram,
      isMultiStep: currentQ.mechanicType === 'MULTI_STEP_SURVIVAL',
    });
    setTimeLeft(eff);
    setTargetEffectiveSec(eff);
    setIsTimeFrozen(false);
    setFrozenSecondsLeft(0);
    setStartTime(Date.now());
    setRemediation(null);
  }, [currentIndex, currentQ]);

  // Main countdown timer ticker
  useEffect(() => {
    if (isAnswerSubmitted) return;

    const timer = setInterval(() => {
      if (isTimeFrozen) {
        setFrozenSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimeFrozen(false);
            return 0;
          }
          return prev - 1;
        });
        return;
      }

      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswerSubmitted, isTimeFrozen]);

  const handleTimeExpired = () => {
    if (isAnswerSubmitted) return;
    handleSubmitAnswer(null);
  };

  // Trigger Hero Active Ability
  const handleTriggerHeroSkill = () => {
    if (!skillAvailable || isAnswerSubmitted || isExamMode) return;
    setSkillAvailable(false);

    if (profile.heroId === 'CHRONOMANCER') {
      setIsTimeFrozen(true);
      setFrozenSecondsLeft(15);
    } else if (profile.heroId === 'PALADIN') {
      setIsTrapGlowActive(true);
    } else if (profile.heroId === 'SNIPER') {
      const wrong = shuffledOptions.filter((opt) => !opt.isCorrect);
      if (wrong.length > 0) setEliminatedOptionIds([wrong[0].id]);
    } else if (profile.heroId === 'ROGUE') {
      const wrong = shuffledOptions.filter((opt) => !opt.isCorrect);
      if (wrong.length >= 2) setEliminatedOptionIds([wrong[0].id, wrong[1].id]);
    }
  };

  // Use 50:50 Rune Consumable
  const handleUseFiftyFiftyRune = () => {
    if (isAnswerSubmitted || isExamMode) return;
    const wrong = shuffledOptions.filter((opt) => !opt.isCorrect && !eliminatedOptionIds.includes(opt.id));
    if (wrong.length >= 2) {
      setEliminatedOptionIds((prev) => [...prev, wrong[0].id, wrong[1].id]);
    }
  };

  // Use Time Potion (+30s)
  const handleUseTimePotion = () => {
    if (isAnswerSubmitted || isExamMode) return;
    setTimeLeft((prev) => prev + 30);
  };

  // Submit Answer using isCorrect metadata
  const handleSubmitAnswer = (chosenOptId: string | null) => {
    if (isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setSelectedOptionId(chosenOptId);

    const timeSpentSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    setTotalTimeElapsed((prev) => prev + timeSpentSec);

    const chosenOption = shuffledOptions.find((o) => o.id === chosenOptId);
    const correct = chosenOption ? chosenOption.isCorrect === true : false;
    setIsCorrect(correct);

    const correctOpt = shuffledOptions.find((o) => o.isCorrect);

    if (correct) {
      const newCorrect = correctCount + 1;
      const newCombo = comboCount + 1;
      setCorrectCount(newCorrect);
      setComboCount(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Trigger Game Feel Attack & Hit Reaction (0.8s)
      const isCrit = newCombo >= 2 || timeSpentSec <= (currentQ.targetTimeSec * 0.6);
      setHeroEmote(isCrit ? 'CRITICAL_ATTACK' : 'ATTACK');
      setBossState(isCrit ? 'HIT_CRITICAL' : 'HIT_LIGHT');
      audioEngine.playSfx(isCrit ? 'SFX_CRITICAL' : 'SFX_CORRECT');
      const dmg = isCrit ? 250 : 130;
      setDamagePopups([{ id: String(Date.now()), damage: dmg, isCritical: isCrit, x: 0, y: 0 }]);
      setDummyHp((prev) => Math.max(0, prev - dmg));

      setTimeout(() => {
        setHeroEmote('IDLE');
        setBossState('IDLE');
        setDamagePopups([]);
      }, 850);

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
      setComboCount(0);
      setHeroEmote('HIT_SETBACK');
      setTimeout(() => {
        setHeroEmote('IDLE');
      }, 700);

      const remFeedback = analyzeWrongAnswer(
        currentQ,
        chosenOption?.text || 'ไม่ได้เลือกคำตอบ',
        correctOpt?.text || ''
      );
      setRemediation(remFeedback);
    }
  };

  const handleTrySimilarQuestion = () => {
    if (!remediation?.similarQuestion) return;
    // Insert similar question right after current question
    const updatedList = [...questionList];
    updatedList.splice(currentIndex + 1, 0, remediation.similarQuestion);
    setQuestionList(updatedList);
    setShowRemediationModal(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questionList.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleCompleteBattle();
    }
  };

  const handleCompleteBattle = () => {
    const accuracy = Math.round((correctCount / questionList.length) * 100);
    const avgTime = Math.round(totalTimeElapsed / questionList.length);
    const isPassed = accuracy >= 80;

    const masteryUpdates: Record<string, { before: number; after: number }> = {};
    Object.keys(masteryState).forEach((k) => {
      masteryUpdates[k] = {
        before: profile.skillMastery[k] || 0.2,
        after: masteryState[k],
      };
    });

    let unlockedGear: string | null = null;
    if (stageId === 'D1' && isPassed && !profile.unlockedGear.includes('BLADE_OF_CALCULATION')) {
      unlockedGear = 'BLADE_OF_CALCULATION';
    }

    const sessionResult: StageSessionResult = {
      stageId,
      totalQuestions: questionList.length,
      correctCount,
      accuracy,
      totalTimeSec: totalTimeElapsed,
      averageTimeSec: avgTime,
      earnedCoins,
      earnedXp,
      masteryUpdates,
      unlockedGear,
      isPassed,
      isMasteryMet: accuracy >= 90,
    };

    onFinishSession(sessionResult);
  };

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-between text-slate-100 max-w-5xl mx-auto select-none font-sans">
      {/* Top HUD */}
      <header className="frost-card rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4 border border-cyan-500/40 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onExitStage}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
          >
            ออก
          </button>
          <div>
            <h1 className="font-extrabold text-base md:text-lg text-white">{stageName}</h1>
            <span className="text-xs text-cyan-400">
              ข้อที่ {currentIndex + 1} จาก {questionList.length}
            </span>
          </div>
        </div>

        {/* Adaptive Timer Display */}
        <div className="flex items-center gap-2">
          <AdaptiveTimerDisplay
            secondsLeft={timeLeft}
            totalTargetSec={targetEffectiveSec}
            isPaused={isTimeFrozen}
            isOvertime={timeLeft <= 0}
            suppressSoundCues={false}
          />

          {/* Combo Indicator */}
          {comboCount > 1 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs shadow-glow-gold animate-scale-up">
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>{comboCount}x COMBO!</span>
            </div>
          )}
        </div>

        {/* Practice Utilities Bar (Hidden in Exam Mode) */}
        {!isExamMode && (
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <button
              onClick={handleUseFiftyFiftyRune}
              disabled={isAnswerSubmitted || eliminatedOptionIds.length >= 2}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-900 border border-slate-700 text-purple-300 flex items-center gap-1"
              title="ตัด 2 ช้อยส์ลวงทิ้ง"
            >
              <Scissors className="w-3.5 h-3.5" /> 50:50
            </button>
            <button
              onClick={handleUseTimePotion}
              disabled={isAnswerSubmitted}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-900 border border-slate-700 text-cyan-300 flex items-center gap-1"
              title="เพิ่มเวลาคิด +30 วินาที"
            >
              <Hourglass className="w-3.5 h-3.5" /> +30s
            </button>
          </div>
        )}
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 h-2 rounded-full mb-4 overflow-hidden p-0.5 border border-slate-700">
        <div
          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300 shadow-glow-cyan"
          style={{ width: `${((currentIndex + 1) / questionList.length) * 100}%` }}
        />
      </div>

      {/* Combat Visual Arena */}
      <CombatArenaView
        profile={profile}
        targetName="หุ่นผลึกเหมันต์ฝึกซ้อม (Frost Dummy)"
        targetMaxHp={1000}
        targetCurrentHp={dummyHp}
        bossId="DOJO_TARGET"
        heroEmote={heroEmote}
        bossState={bossState}
        damagePopups={damagePopups}
        isExamMode={isExamMode}
      />

      {/* Main Question Card */}
      <main className="frost-card rounded-2xl p-5 md:p-8 flex-1 flex flex-col justify-between shadow-2xl relative">
        {/* Topic Tag & Skill Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
            {currentQ?.subtopic || currentQ?.topic}
          </span>

          {!isExamMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleTriggerHeroSkill}
                disabled={!skillAvailable || isAnswerSubmitted}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  skillAvailable && !isAnswerSubmitted
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 shadow-glow-gold transform hover:scale-105'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{hero.activeName}</span>
                {skillAvailable ? '(พร้อมใช้)' : '(ใช้แล้ว)'}
              </button>

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
          )}
        </div>

        {/* Question Text */}
        <div className="my-auto py-4">
          <h2 className={`text-base md:text-xl font-black text-white leading-relaxed ${
            isTrapGlowActive ? 'ring-2 ring-amber-400 p-3 rounded-xl bg-amber-950/40' : ''
          }`}>
            {currentQ?.questionText}
          </h2>
          {isTrapGlowActive && (
            <p className="text-xs text-amber-300 font-semibold mt-2 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Trap Detector: เรืองแสงจับประเด็นสำคัญในโจทย์!
            </p>
          )}
        </div>

        {/* 4 Options Grid */}
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
                className={`p-3.5 md:p-4 rounded-xl border text-left font-medium transition-all duration-200 flex items-center gap-3 relative ${optionStyle}`}
              >
                <span className="w-7 h-7 rounded-lg bg-arctic-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-300 shrink-0">
                  {opt.displayLetter || opt.id}
                </span>
                <span className="text-xs md:text-sm font-semibold">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Immediate Solution & Smart Remediation Bar */}
      {isAnswerSubmitted && (
        <div className={`frost-card rounded-2xl p-4 mt-4 animate-fade-in border-2 ${
          isCorrect ? 'border-emerald-400/80 bg-emerald-950/40' : 'border-rose-400/80 bg-rose-950/40'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <h4 className="font-extrabold text-sm text-white">
                  {isCorrect ? 'ถูกต้องยอดเยี่ยม!' : 'ยังไม่ถูกต้อง'}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                  {currentQ.shortcutNote || currentQ.explanation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isCorrect && remediation && (
                <button
                  onClick={() => setShowRemediationModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shrink-0"
                >
                  <Lightbulb className="w-4 h-4" /> ดูบทวิเคราะห์จุดผิด
                </button>
              )}

              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs md:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-glow-cyan transform hover:scale-105 shrink-0"
              >
                {currentIndex + 1 < questionList.length ? 'ข้อถัดไป' : 'ดูผลคะแนน'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Remediation Deep Modal */}
      {showRemediationModal && remediation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="frost-card rounded-3xl p-6 max-w-lg w-full border-2 border-amber-400 shadow-glow-gold animate-scale-up text-slate-100 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <h3 className="font-black text-sm text-amber-300 flex items-center gap-2">
                💡 ระบบวิเคราะห์ความเข้าใจผิด (Smart Remediation)
              </h3>
              <button onClick={() => setShowRemediationModal(false)} className="text-slate-400 hover:text-white">
                ปิด
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40">
              <span className="font-bold text-rose-300 block mb-0.5">⚠️ จุดลวงในข้อนี้:</span>
              <p className="text-slate-200">{remediation.trapExplanation}</p>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40">
              <span className="font-bold text-cyan-300 block mb-0.5">📝 วิธีคิดที่ถูกต้อง:</span>
              <p className="text-slate-200">{remediation.fullSolution}</p>
            </div>

            {remediation.shortcutTip && (
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40">
                <span className="font-bold text-amber-300 block mb-0.5">⚡ สูตรลัดเฉพาะข้อ:</span>
                <p className="text-amber-200 font-mono font-bold">{remediation.shortcutTip}</p>
              </div>
            )}

            {remediation.similarQuestion && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleTrySimilarQuestion}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-glow-gold"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ลองทำโจทย์คล้ายกัน 1 ข้อทันที (Practice Similar Question)</span>
                </button>
              </div>
            )}
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
              <button onClick={() => setShowHintModal(false)} className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1">
                ปิด
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {hintLevelUsed === 1 ? currentQ.powerUpHint : currentQ.hintLevel2 || currentQ.powerUpHint}
            </p>
            <button onClick={() => setShowHintModal(false)} className="w-full mt-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400">
              เข้าใจแล้ว ลุยต่อ!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
