import React, { useState, useEffect } from 'react';
import { useGameEvidence } from '../../services/game-evidence';
import { 
  PlayerProfile, 
  QuestionItem, 
  QuestionOption, 
  GrandmasterTrialResult, 
  ExamAnswerRecord 
} from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { shuffleOptions } from '../../engine/shuffler';
import { evaluateGridResponse } from '../../engine/grid-normalizer';
import { calculateCoinReward, calculateXpReward } from '../../engine/economy';
import { WeightedSkillMasteryEngineV1 } from '../../progression/mastery-engine';
import { GridKeypad } from '../components/GridKeypad';
import { ExamPaletteDrawer } from '../components/ExamPaletteDrawer';
import { GeometryDiagram } from '../components/GeometryDiagram';
import { 
  Timer, 
  Bookmark, 
  Grid, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  AlertCircle,
  Crown
} from 'lucide-react';

interface FinalTrialScreenProps {
  questions: QuestionItem[];
  profile: PlayerProfile;
  onFinishTrial: (result: GrandmasterTrialResult) => void;
  onExit: () => void;
}

export const FinalTrialScreen: React.FC<FinalTrialScreenProps> = ({
  questions,
  profile,
  onFinishTrial: finishTrial,
  onExit,
}) => {
  const evidence = useGameEvidence('FINAL_TRIAL',{engine:'FINAL_TRIAL_V1',questionIds:questions.map(q=>q.id)});
  const onFinishTrial = (result: GrandmasterTrialResult) => { evidence.finish(result); finishTrial(result); };
  const masteryEngine = new WeightedSkillMasteryEngineV1();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, ExamAnswerRecord>>({});
  const [shuffledOptionsByQ, setShuffledOptionsByQ] = useState<Record<number, QuestionOption[]>>({});
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // 60-Minute Global Timer (3600 seconds)
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(3600);
  const [questionStartTimestamp, setQuestionStartTimestamp] = useState<number>(Date.now());

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

  // Global Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemainingSec((prev) => {
        if (prev <= 1) {
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [answers]);

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

  const handleNavigate = (targetIdx: number) => {
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

  const handleToggleMark = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        isMarkedForReview: !prev[currentIndex]?.isMarkedForReview,
      },
    }));
  };

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

  const handleNumericalChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        numericalInput: val,
      },
    }));
  };

  const handleFinalSubmit = () => {
    let correct = 0;
    let markedCount = 0;
    const misconceptionCounts: Record<string, number> = {};
    const updatedMastery: Record<string, number> = { ...profile.skillMastery };

    questions.forEach((q, idx) => {
      const rec = answers[idx];
      evidence.record({ questionId:q.id, selectedOptionId:rec?.selectedOptionId, numericalInput:rec?.numericalInput, timeSpentSec:rec?.timeSpentSec || 0, hintLevelUsed:0 });
      if (rec?.isMarkedForReview) markedCount++;

      let isQCorrect = false;
      if (q.mechanicType === 'GRID_RESPONSE') {
        isQCorrect = evaluateGridResponse(
          rec?.numericalInput || '',
          q.correctNumericalValue || '',
          q.numericValidation || 'TOLERANCE',
          q.roundingDecimals || 2
        );
      } else {
        const chosen = (shuffledOptionsByQ[idx] || []).find((o) => o.id === rec?.selectedOptionId);
        isQCorrect = chosen?.isCorrect === true;
      }

      if (isQCorrect) {
        correct++;
        q.skillTags.forEach((skill) => {
          const cur = updatedMastery[skill] || 0.2;
          updatedMastery[skill] = masteryEngine.calculateDelta({
            currentMastery: cur,
            isCorrect: true,
            timeRatio: 0.6,
            hintLevelUsed: 0,
            attemptCount: 1,
            weight: 1.0,
          });
        });
      } else {
        q.misconceptionTags.forEach((tag) => {
          misconceptionCounts[tag] = (misconceptionCounts[tag] || 0) + 1;
        });
      }
    });

    const totalQ = questions.length;
    const accuracy = Math.round((correct / totalQ) * 100);
    const isPassed = accuracy >= 80;
    const isTopFormQualified = accuracy >= 85;
    const totalElapsedSec = 3600 - timeRemainingSec;

    const masteryDiffs: Record<string, { before: number; after: number }> = {};
    Object.keys(updatedMastery).forEach((k) => {
      masteryDiffs[k] = {
        before: profile.skillMastery[k] || 0.2,
        after: updatedMastery[k] || 0.2,
      };
    });

    onFinishTrial({
      totalQuestions: totalQ,
      correctCount: correct,
      accuracy,
      isPassed,
      isTopFormQualified,
      totalTimeSec: totalElapsedSec,
      averageTimeSec: Math.round(totalElapsedSec / totalQ),
      markedReviewCount: markedCount,
      earnedCoins: isPassed ? 1000 : 300,
      earnedXp: isPassed ? 500 : 150,
      masteryUpdates: masteryDiffs,
      misconceptionProfile: misconceptionCounts,
    });
  };

  let answeredCount = 0;
  for (let i = 0; i < questions.length; i++) {
    const rec = answers[i];
    if (rec?.selectedOptionId || (rec?.numericalInput && rec.numericalInput.trim() !== '')) {
      answeredCount++;
    }
  }

  const mins = Math.floor(timeRemainingSec / 60);
  const secs = timeRemainingSec % 60;

  return (
    <div className="min-h-screen aurora-bg p-3 md:p-6 flex flex-col justify-between text-slate-100 max-w-4xl mx-auto select-none">
      {/* Header */}
      <header className="frost-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xl border-2 border-amber-400/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-glow-gold">
            👑
          </div>
          <div>
            <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">
              FINAL GRANDMASTER TRIAL (40Q)
            </span>
            <h2 className="text-sm md:text-base font-black text-white">
              การทดสอบตัดสินบัลลังก์ ม.1 (ข้อที่ {currentIndex + 1} / 40)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 60-Minute Countdown Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-arctic-900 border border-amber-400 text-amber-300 font-mono font-black text-sm">
            <Timer className="w-4 h-4 text-amber-400" />
            <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
          </div>

          <button
            onClick={() => setIsPaletteOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-bold flex items-center gap-1.5"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>กระดาษคำตอบ ({answeredCount}/40)</span>
          </button>

          <button onClick={onExit} className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400">
            ออก
          </button>
        </div>
      </header>

      {/* Main Question Arena */}
      <main className="frost-card rounded-3xl p-5 md:p-8 flex-1 flex flex-col justify-between my-3 shadow-2xl relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-arctic-900 border border-slate-700 text-cyan-300">
            {currentQ?.topic} ({currentQ?.id})
          </span>

          <button
            onClick={handleToggleMark}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              currentRecord.isMarkedForReview
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-glow-gold'
                : 'bg-slate-800 text-amber-300 border border-amber-500/40'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${currentRecord.isMarkedForReview ? 'fill-slate-950' : ''}`} />
            <span>{currentRecord.isMarkedForReview ? 'ติดธงแล้ว' : 'ติดธงทบทวน'}</span>
          </button>
        </div>

        <h3 className="text-base md:text-2xl font-black text-white leading-relaxed my-2">
          {currentQ?.questionText}
        </h3>

        {currentQ?.requiresDiagram && (
          <GeometryDiagram
            type={(currentQ.diagramType as any) || 'CUBE_NET'}
            caption={currentQ.subtopic}
          />
        )}

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
                      ? 'bg-amber-950 border-amber-400 ring-2 ring-amber-400 text-amber-200 shadow-glow-gold'
                      : 'bg-arctic-800/90 border-slate-700 hover:border-amber-400/60 text-white'
                  }`}
                >
                  <span className="w-8 h-8 rounded-xl bg-arctic-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
                    {opt.displayLetter || opt.id}
                  </span>
                  <span className="text-sm md:text-base font-semibold">{opt.text}</span>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="frost-card rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <button
          disabled={currentIndex === 0}
          onClick={() => handleNavigate(currentIndex - 1)}
          className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-40 text-xs font-bold flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> ก่อนหน้า
        </button>

        <span className="text-xs font-semibold text-slate-400">
          ตอบแล้ว {answeredCount} / 40 ข้อ
        </span>

        {currentIndex + 1 < questions.length ? (
          <button
            onClick={() => handleNavigate(currentIndex + 1)}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs md:text-sm flex items-center gap-1.5 shadow-md"
          >
            ข้อถัดไป <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs md:text-sm flex items-center gap-1.5 shadow-glow-gold animate-pulse"
          >
            <Send className="w-4 h-4" /> ส่งข้อสอบชิงตำแหน่ง
          </button>
        )}
      </footer>

      {/* Palette Navigation */}
      <ExamPaletteDrawer
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        totalQuestions={questions.length}
        currentIndex={currentIndex}
        answers={answers}
        onSelectQuestion={handleNavigate}
      />

      {/* Final Submit Confirmation Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="frost-card rounded-3xl p-6 md:p-8 max-w-md w-full border-2 border-amber-400 shadow-glow-gold animate-scale-up text-center">
            <Crown className="w-16 h-16 text-amber-400 mx-auto mb-2 fill-amber-400" />
            <h3 className="text-xl font-black text-white">ยืนยันส่งข้อสอบ Final Grandmaster Trial?</h3>
            <p className="text-xs text-slate-300 mt-1">
              ทำเสร็จแล้ว {answeredCount}/40 ข้อ (ต้องการอย่างน้อย 85% สำหรับ Top Form)
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-1/2 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                กลับไปตรวจทาน
              </button>
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  handleFinalSubmit();
                }}
                className="w-1/2 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black rounded-xl text-xs shadow-glow-gold"
              >
                ยืนยันส่งทันที
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
