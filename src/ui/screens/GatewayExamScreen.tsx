import React, { useState, useEffect, useRef } from 'react';
import { useGameEvidence } from '../../services/game-evidence';
import { 
  PlayerProfile, 
  QuestionItem, 
  QuestionOption, 
  GatewayRunMode, 
  GatewayExamResult, 
  ExamAnswerRecord 
} from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { shuffleOptions } from '../../engine/shuffler';
import { evaluateGridResponse } from '../../engine/grid-normalizer';
import { calculateGatewayReadiness } from '../../engine/gateway-readiness';
import { calculateCoinReward, calculateXpReward } from '../../engine/economy';
import { WeightedSkillMasteryEngineV1 } from '../../progression/mastery-engine';
import { GridKeypad } from '../components/GridKeypad';
import { ExamPaletteDrawer } from '../components/ExamPaletteDrawer';
import { 
  Timer, 
  Bookmark, 
  Grid, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  HelpCircle, 
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface GatewayExamScreenProps {
  stageId: string;
  stageName: string;
  targetTimeSec: number;
  runMode: GatewayRunMode;
  questions: QuestionItem[];
  profile: PlayerProfile;
  onFinishExam: (result: GatewayExamResult) => void;
  onExit: () => void;
}

export const GatewayExamScreen: React.FC<GatewayExamScreenProps> = ({
  stageId,
  stageName,
  targetTimeSec,
  runMode,
  questions,
  profile,
  onFinishExam: finishExam,
  onExit,
}) => {
  const evidence = useGameEvidence(stageId,{engine:'GATEWAY_V1',runMode,questionIds:questions.map(q=>q.id)});
  const onFinishExam = (result: GatewayExamResult) => { evidence.finish(result); finishExam(result); };
  const hero = HERO_CLASSES[profile.heroId];
  const masteryEngine = new WeightedSkillMasteryEngineV1();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, ExamAnswerRecord>>({});
  const [shuffledOptionsByQ, setShuffledOptionsByQ] = useState<Record<number, QuestionOption[]>>({});
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // Global & Question Timer
  const [globalTimeElapsedSec, setGlobalTimeElapsedSec] = useState<number>(0);
  const [questionStartTimestamp, setQuestionStartTimestamp] = useState<number>(Date.now());
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  // Initialize option shuffling for all questions upfront
  useEffect(() => {
    const map: Record<number, QuestionOption[]> = {};
    const initAns: Record<number, ExamAnswerRecord> = {};

    questions.forEach((q, idx) => {
      if (q.options && q.options.length > 0) {
        map[idx] = shuffleOptions(q.options);
      } else {
        map[idx] = [];
      }
      initAns[idx] = {
        questionId: q.id,
        selectedOptionId: null,
        numericalInput: null,
        isMarkedForReview: false,
        answerChangeCount: 0,
        timeSpentSec: 0,
      };
    });

    setShuffledOptionsByQ(map);
    setAnswers(initAns);
    setQuestionStartTimestamp(Date.now());
  }, [questions]);

  // Global Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalTimeElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentQ = questions[currentIndex];
  const currentRecord = answers[currentIndex] || {
    questionId: currentQ?.id,
    selectedOptionId: null,
    numericalInput: null,
    isMarkedForReview: false,
    answerChangeCount: 0,
    timeSpentSec: 0,
  };
  const currentShuffledOptions = shuffledOptionsByQ[currentIndex] || [];
  const isGridResponse = currentQ?.mechanicType === 'GRID_RESPONSE';

  // Record time on question navigation
  const handleNavigateQuestion = (targetIdx: number) => {
    const spent = Math.max(1, Math.round((Date.now() - questionStartTimestamp) / 1000));
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        timeSpentSec: (prev[currentIndex]?.timeSpentSec || 0) + spent,
      },
    }));
    setCurrentIndex(targetIdx);
    setQuestionStartTimestamp(Date.now());
  };

  // Toggle Mark for Review
  const handleToggleMarkReview = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        isMarkedForReview: !prev[currentIndex]?.isMarkedForReview,
      },
    }));
  };

  // Select Option (MCQ)
  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => {
      const rec = prev[currentIndex];
      const isChanged = rec?.selectedOptionId !== null && rec?.selectedOptionId !== optionId;
      return {
        ...prev,
        [currentIndex]: {
          ...rec,
          selectedOptionId: optionId,
          answerChangeCount: isChanged ? rec.answerChangeCount + 1 : rec.answerChangeCount,
        },
      };
    });
  };

  // Change Numerical Input (Grid Response)
  const handleNumericalChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        numericalInput: val,
      },
    }));
  };

  // Final Exam Submission & Comprehensive Scoring
  const handleFinalSubmit = () => {
    // Commit current question time
    const lastSpent = Math.max(1, Math.round((Date.now() - questionStartTimestamp) / 1000));
    const finalAnswers = {
      ...answers,
      [currentIndex]: {
        ...answers[currentIndex],
        timeSpentSec: (answers[currentIndex]?.timeSpentSec || 0) + lastSpent,
      },
    };

    let correct = 0;
    let markedCount = 0;
    const misconceptionCounts: Record<string, number> = {};
    const updatedMastery: Record<string, number> = { ...profile.skillMastery };

    questions.forEach((q, idx) => {
      const rec = finalAnswers[idx];
      evidence.record({ questionId:q.id, selectedOptionId:rec?.selectedOptionId, numericalInput:rec?.numericalInput, timeSpentSec:rec?.timeSpentSec || 0, hintLevelUsed:0 });
      if (rec?.isMarkedForReview) markedCount++;

      let isQCorrect = false;
      if (q.mechanicType === 'GRID_RESPONSE') {
        isQCorrect = evaluateGridResponse(rec?.numericalInput || '', q.correctNumericalValue || '');
      } else {
        const chosenOpt = (shuffledOptionsByQ[idx] || []).find((o) => o.id === rec?.selectedOptionId);
        isQCorrect = chosenOpt?.isCorrect === true;
      }

      if (isQCorrect) {
        correct++;
        // Positive mastery
        q.skillTags.forEach((skill) => {
          const cur = updatedMastery[skill] || 0.2;
          updatedMastery[skill] = masteryEngine.calculateDelta({
            currentMastery: cur,
            isCorrect: true,
            timeRatio: (rec?.timeSpentSec || q.targetTimeSec) / q.targetTimeSec,
            hintLevelUsed: 0,
            attemptCount: 1,
            weight: 1.0,
          });
        });
      } else {
        // Track misconception
        q.misconceptionTags.forEach((tag) => {
          misconceptionCounts[tag] = (misconceptionCounts[tag] || 0) + 1;
        });
        q.skillTags.forEach((skill) => {
          const cur = updatedMastery[skill] || 0.2;
          updatedMastery[skill] = masteryEngine.calculateDelta({
            currentMastery: cur,
            isCorrect: false,
            timeRatio: 1.2,
            hintLevelUsed: 0,
            attemptCount: 1,
            weight: 1.0,
          });
        });
      }
    });

    const totalQ = questions.length;
    const accuracy = Math.round((correct / totalQ) * 100);
    const avgTimeSec = Math.round(globalTimeElapsedSec / totalQ);

    const readinessLevel = calculateGatewayReadiness({
      accuracy,
      averageTimeSec: avgTimeSec,
      targetTimeSec,
    });

    const passThreshold = stageId === 'ONET-4' ? 80 : 75;
    const masteryThreshold = stageId === 'ONET-4' ? 95 : 90;
    const isPassed = accuracy >= passThreshold;
    const isMasteryMet = accuracy >= masteryThreshold;

    const gearRewardMap: Record<string, string> = {
      'ONET-1': 'KNOWLEDGE_HELM',
      'ONET-2': 'APPLICATION_CHESTPLATE',
      'ONET-3': 'REASONING_GAUNTLET',
      'ONET-4': 'GUARDIAN_CAPE',
    };
    const potentialGear = gearRewardMap[stageId];
    const willUnlockGear = isPassed && potentialGear && !profile.unlockedGear.includes(potentialGear) ? potentialGear : null;

    // Coins & XP
    const earnedCoins = calculateCoinReward(100, avgTimeSec, targetTimeSec, 0, false);
    const earnedXp = calculateXpReward(50, isPassed, 0);

    const masteryDiffs: Record<string, { before: number; after: number }> = {};
    Object.keys(updatedMastery).forEach((k) => {
      masteryDiffs[k] = {
        before: profile.skillMastery[k] || 0.2,
        after: updatedMastery[k] || 0.2,
      };
    });

    onFinishExam({
      stageId,
      runMode,
      totalQuestions: totalQ,
      correctCount: correct,
      accuracy,
      readinessLevel,
      totalTimeSec: globalTimeElapsedSec,
      averageTimeSec: avgTimeSec,
      markedReviewCount: markedCount,
      earnedCoins,
      earnedXp,
      unlockedGear: willUnlockGear,
      masteryUpdates: masteryDiffs,
      misconceptionProfile: misconceptionCounts,
      isPassed,
      isMasteryMet,
    });
  };

  // Answered questions counter for review
  let answeredCount = 0;
  for (let i = 0; i < questions.length; i++) {
    const rec = answers[i];
    if (rec?.selectedOptionId || (rec?.numericalInput && rec.numericalInput.trim() !== '')) {
      answeredCount++;
    }
  }

  const minutes = Math.floor(globalTimeElapsedSec / 60);
  const seconds = globalTimeElapsedSec % 60;

  return (
    <div className="min-h-screen aurora-bg p-3 md:p-6 flex flex-col justify-between text-slate-100 max-w-4xl mx-auto select-none">
      {/* Top Standardized Exam Bar */}
      <header className="frost-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-2xl shadow-glow-cyan">
            🏛️
          </div>
          <div>
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              {stageName} • {runMode === 'EXAM' ? '📋 ข้อสอบมาตรฐานจริง (Exam Mode)' : '🎯 โหมดฝึกฝน'}
            </div>
            <div className="text-sm font-black text-white">
              ข้อที่ {currentIndex + 1} จากทั้งหมด {questions.length} ข้อ
            </div>
          </div>
        </div>

        {/* Exam Timer & Palette Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-arctic-800 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setIsPaletteOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-glow-cyan"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>กระดาษคำตอบ ({answeredCount}/{questions.length})</span>
          </button>

          <button
            onClick={onExit}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
          >
            ออก
          </button>
        </div>
      </header>

      {/* Main Question Arena */}
      <main className="frost-card rounded-3xl p-5 md:p-8 flex-1 flex flex-col justify-between my-3 shadow-2xl relative">
        {/* Topic Badge & Mark for Review Toggle */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
            {currentQ?.subtopic || currentQ?.topic}
          </span>

          <div className="flex items-center gap-2">
            {/* Practice Hint Button (Practice Mode Only) */}
            {runMode === 'PRACTICE' && (
              <button
                onClick={() => setShowHintModal(true)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 text-xs font-bold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" /> คำใบ้ฝึกฝน
              </button>
            )}

            {/* Mark for Review Button */}
            <button
              onClick={handleToggleMarkReview}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                currentRecord.isMarkedForReview
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-glow-gold'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${currentRecord.isMarkedForReview ? 'fill-slate-950' : ''}`} />
              <span>{currentRecord.isMarkedForReview ? 'ติดธงทบทวนแล้ว' : 'ติดธงทบทวน (Mark)'}</span>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="my-auto py-4">
          <h2 className="text-lg md:text-2xl font-black text-white leading-relaxed">
            {currentQ?.questionText}
          </h2>
        </div>

        {/* Render: 4-Option MCQ or Grid Keypad */}
        {isGridResponse ? (
          <div className="mt-4">
            <GridKeypad
              value={currentRecord.numericalInput || ''}
              onChange={handleNumericalChange}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {currentShuffledOptions.map((opt) => {
              const isSelected = currentRecord.selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-2xl border text-left font-medium transition-all duration-150 flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400 text-cyan-200 shadow-glow-cyan'
                      : 'bg-arctic-800/90 border-slate-700/80 hover:border-cyan-400/60 text-white'
                  }`}
                >
                  <span className="w-8 h-8 rounded-xl bg-arctic-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-300 shrink-0">
                    {opt.displayLetter || opt.id}
                  </span>
                  <span className="text-sm md:text-base font-semibold">{opt.text}</span>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Exam Navigation & Submit */}
      <footer className="frost-card rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <button
          disabled={currentIndex === 0}
          onClick={() => handleNavigateQuestion(currentIndex - 1)}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs md:text-sm font-bold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ก่อนหน้า
        </button>

        <div className="text-xs font-semibold text-slate-400">
          ตอบแล้ว {answeredCount} / {questions.length}
        </div>

        {currentIndex + 1 < questions.length ? (
          <button
            onClick={() => handleNavigateQuestion(currentIndex + 1)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs md:text-sm flex items-center gap-1.5 transition-all shadow-md"
          >
            ข้อถัดไป <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs md:text-sm flex items-center gap-1.5 shadow-lg transform hover:scale-105"
          >
            <Send className="w-4 h-4" /> ตรวจทาน & ส่งข้อสอบ
          </button>
        )}
      </footer>

      {/* Palette Navigation Drawer */}
      <ExamPaletteDrawer
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        totalQuestions={questions.length}
        currentIndex={currentIndex}
        answers={answers}
        onSelectQuestion={handleNavigateQuestion}
      />

      {/* Final Review & Submission Confirmation Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="frost-card rounded-3xl p-6 md:p-8 max-w-md w-full border-2 border-emerald-400 shadow-glow-cyan animate-scale-up text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-400 flex items-center justify-center mx-auto mb-3 text-3xl">
              📝
            </div>
            <h3 className="text-xl font-black text-white">พร้อมส่งข้อสอบมาตรฐาน O-NET?</h3>
            <p className="text-xs text-slate-300 mt-1">
              โปรดตรวจสอบสถานะการทำข้อสอบก่อนกดยืนยันการส่ง
            </p>

            <div className="grid grid-cols-2 gap-3 my-5 text-left text-xs">
              <div className="p-3 rounded-xl bg-arctic-800 border border-slate-700">
                <span className="text-slate-400 block font-semibold">ทำเสร็จแล้ว</span>
                <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                  {answeredCount} / {questions.length} ข้อ
                </span>
              </div>
              <div className="p-3 rounded-xl bg-arctic-800 border border-slate-700">
                <span className="text-slate-400 block font-semibold">ยังไม่ได้ตอบ</span>
                <span className="text-xl font-black text-rose-400 mt-0.5 block">
                  {questions.length - answeredCount} ข้อ
                </span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 mb-4 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>ยังมีข้อที่ยังไม่ได้ระบายคำตอบ ต้องการส่งข้อสอบหรือไม่?</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                กลับไปแก้ไข
              </button>
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  handleFinalSubmit();
                }}
                className="w-1/2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-lg"
              >
                ยืนยันส่งข้อสอบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practice Mode Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="frost-card rounded-2xl p-6 max-w-md w-full border border-cyan-400 shadow-glow-cyan text-slate-100">
            <h3 className="font-extrabold text-base text-cyan-300 mb-2">💡 คำใบ้สำหรับโหมดฝึกฝน</h3>
            <p className="text-sm text-slate-200 leading-relaxed mb-4">{currentQ.powerUpHint}</p>
            <button
              onClick={() => setShowHintModal(false)}
              className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
