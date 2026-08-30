import React, { useState, useEffect } from 'react';
import { PlayerProfile, QuestionItem, QuestionOption, StageSessionResult } from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { shuffleOptions } from '../../engine/shuffler';
import { calculateCoinReward, calculateXpReward } from '../../engine/economy';
import { WeightedSkillMasteryEngineV1 } from '../../progression/mastery-engine';
import { QUEST_MISSION_GROUPS } from '../../content/quest-database';
import { 
  Scroll, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Flame,
  Award
} from 'lucide-react';

interface QuestBoardScreenProps {
  questions: QuestionItem[];
  profile: PlayerProfile;
  onFinishSession: (result: StageSessionResult) => void;
  onExit: () => void;
}

export const QuestBoardScreen: React.FC<QuestBoardScreenProps> = ({
  questions,
  profile,
  onFinishSession,
  onExit,
}) => {
  const hero = HERO_CLASSES[profile.heroId];
  const masteryEngine = new WeightedSkillMasteryEngineV1();

  const [activeGroupId, setActiveGroupId] = useState<string>('WP-GROUP-1');
  const [missionRunSize, setMissionRunSize] = useState<number>(10);
  const groupQuestions = questions.filter((q) => q.missionGroupId === activeGroupId).slice(0, missionRunSize);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  const [correctCount, setCorrectCount] = useState<number>(0);
  const [earnedCoins, setEarnedCoins] = useState<number>(0);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [masteryState, setMasteryState] = useState<Record<string, number>>({ ...profile.skillMastery });

  const currentQ = groupQuestions[currentIndex] || groupQuestions[0];

  useEffect(() => {
    if (!currentQ) return;
    setShuffledOptions(shuffleOptions(currentQ.options));
    setSelectedOptionId(null);
    setIsAnswerLocked(false);
  }, [currentIndex, currentQ, activeGroupId, missionRunSize]);

  const handleSelectOption = (option: QuestionOption) => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    setSelectedOptionId(option.id);

    const isCorrect = option.isCorrect === true;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      const qCoins = calculateCoinReward(currentQ.rewardCoins, 25, currentQ.targetTimeSec, 0, false);
      const qXp = calculateXpReward(currentQ.rewardXp, true, 0);
      setEarnedCoins((prev) => prev + qCoins);
      setEarnedXp((prev) => prev + qXp);

      const updated = { ...masteryState };
      currentQ.skillTags.forEach((skill) => {
        const cur = updated[skill] || 0.2;
        updated[skill] = masteryEngine.calculateDelta({
          currentMastery: cur,
          isCorrect: true,
          timeRatio: 0.5,
          hintLevelUsed: 0,
          attemptCount: 1,
          weight: 1.0,
        });
      });
      setMasteryState(updated);
    } else {
      const qXp = calculateXpReward(currentQ.rewardXp, false, 0);
      setEarnedXp((prev) => prev + qXp);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < groupQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Mission Complete!
      const totalQ = groupQuestions.length;
      const accuracy = Math.round((correctCount / totalQ) * 100);
      const isPassed = accuracy >= 80;
      const isMasteryMet = accuracy >= 90;

      const masteryDiffs: Record<string, { before: number; after: number }> = {};
      Object.keys(masteryState).forEach((k) => {
        masteryDiffs[k] = {
          before: profile.skillMastery[k] || 0.2,
          after: masteryState[k] || 0.2,
        };
      });

      onFinishSession({
        stageId: 'ARCTIC_QUEST_BOARD',
        totalQuestions: totalQ,
        correctCount,
        accuracy,
        totalTimeSec: 360,
        averageTimeSec: 36,
        earnedCoins,
        earnedXp,
        unlockedGear: null,
        masteryUpdates: masteryDiffs,
        isPassed,
        isMasteryMet,
      });
    }
  };

  return (
    <div className="min-h-screen aurora-bg p-3 md:p-6 flex flex-col justify-between text-slate-100 max-w-4xl mx-auto select-none">
      {/* Header */}
      <header className="frost-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-400 flex items-center justify-center text-2xl">
            📜
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
              Arctic Quest Board (100Q)
            </span>
            <h2 className="text-sm md:text-base font-black text-white">
              {QUEST_MISSION_GROUPS.find((g) => g.id === activeGroupId)?.thaiName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mission Group Dropdown */}
          <select
            value={activeGroupId}
            onChange={(e) => {
              setActiveGroupId(e.target.value);
              setCurrentIndex(0);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-arctic-800 border border-amber-500/40 text-amber-300 text-xs font-bold"
          >
            {QUEST_MISSION_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <button onClick={onExit} className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400">
            ออก
          </button>
        </div>
      </header>

      {/* Main Question & Mission Box */}
      <main className="frost-card rounded-3xl p-5 md:p-8 flex-1 flex flex-col justify-between my-3 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-400/40 text-amber-300">
            {currentQ?.id} • ภารกิจข้อที่ {currentIndex + 1} / {groupQuestions.length}
          </span>
          <button
            onClick={() => setShowHintModal(true)}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 text-xs font-bold flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" /> ตำราคำใบ้
          </button>
        </div>

        <div className="my-auto py-4">
          <h3 className="text-lg md:text-2xl font-black text-white leading-relaxed">
            {currentQ?.questionText}
          </h3>
        </div>

        {/* 4 Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {shuffledOptions.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle = 'bg-arctic-800/90 border-slate-700 hover:border-amber-400 text-white';

            if (isAnswerLocked) {
              if (opt.isCorrect) {
                btnStyle = 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold ring-2 ring-emerald-400';
              } else if (isSelected && !opt.isCorrect) {
                btnStyle = 'bg-rose-950 border-rose-500 text-rose-300';
              } else {
                btnStyle = 'bg-arctic-900/40 border-slate-800 text-slate-600 opacity-40';
              }
            }

            return (
              <button
                key={opt.id}
                disabled={isAnswerLocked}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl border text-left font-medium text-sm transition-all duration-150 flex items-center gap-3.5 ${btnStyle}`}
              >
                <span className="w-8 h-8 rounded-xl bg-arctic-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
                  {opt.displayLetter || opt.id}
                </span>
                <span className="text-sm md:text-base">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="frost-card rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400">
          ภารกิจสำเร็จ {correctCount} / {currentIndex + 1}
        </span>

        {isAnswerLocked && (
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs md:text-sm flex items-center gap-1.5 shadow-md"
          >
            {currentIndex + 1 < groupQuestions.length ? 'ข้อถัดไป' : 'ส่งรายงานภารกิจ'} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </footer>

      {/* Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="frost-card rounded-2xl p-6 max-w-md w-full border border-amber-400 shadow-glow-gold text-slate-100">
            <h3 className="font-extrabold text-base text-amber-300 mb-2">💡 บันทึกวิเคราะห์โจทย์ประยุกต์</h3>
            <p className="text-sm text-slate-200 leading-relaxed mb-4">{currentQ?.powerUpHint}</p>
            <button
              onClick={() => setShowHintModal(false)}
              className="w-full py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
