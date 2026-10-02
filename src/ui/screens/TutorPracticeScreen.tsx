import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, HelpCircle, Sparkles, XCircle } from 'lucide-react';
import { shuffleOptions } from '../../engine/shuffler';
import type { PlayerProfile, QuestionItem, QuestionOption, StageSessionResult } from '../../types';
import type { TutorLesson } from '../../types/learning';

interface Props {
  lesson: TutorLesson;
  questions: QuestionItem[];
  profile: PlayerProfile;
  onFinish: (result: StageSessionResult) => void;
  onBack: () => void;
}

export const TutorPracticeScreen: React.FC<Props> = ({ lesson, questions, profile, onFinish, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<QuestionOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [hintOpen, setHintOpen] = useState(false);

  const currentQ = questions[currentIndex];
  const isLast = currentIndex + 1 >= questions.length;
  const selectedOption = shuffledOptions.find((opt) => opt.id === selectedOptionId);
  const isCorrect = Boolean(selectedOption?.isCorrect);

  useEffect(() => {
    if (!currentQ) return;
    setShuffledOptions(shuffleOptions(currentQ.options));
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setHintOpen(false);
  }, [currentQ]);

  const progress = useMemo(() => questions.length ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0, [currentIndex, questions.length]);

  const submitAnswer = (optionId: string) => {
    if (isAnswerSubmitted) return;
    const chosen = shuffledOptions.find((opt) => opt.id === optionId);
    setSelectedOptionId(optionId);
    setIsAnswerSubmitted(true);
    if (chosen?.isCorrect) setCorrectCount((count) => count + 1);
  };

  const finish = () => {
    const finalCorrectCount = correctCount;
    const totalQuestions = questions.length || 1;
    const totalTimeSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    onFinish({
      stageId: lesson.stageId,
      totalQuestions,
      correctCount: finalCorrectCount,
      accuracy: Math.round((finalCorrectCount / totalQuestions) * 100),
      totalTimeSec,
      averageTimeSec: Math.round(totalTimeSec / totalQuestions),
      earnedCoins: 0,
      earnedXp: 0,
      masteryUpdates: {},
      unlockedGear: null,
      isPassed: Math.round((finalCorrectCount / totalQuestions) * 100) >= 80,
      isMasteryMet: Math.round((finalCorrectCount / totalQuestions) * 100) >= 90,
    });
  };

  const next = () => {
    if (isLast) finish();
    else setCurrentIndex((index) => index + 1);
  };

  if (!currentQ) {
    return (
      <div className="tutor-library-shell">
        <main className="tutor-stage flex min-h-screen items-center justify-center">
          <section className="tutor-book-panel p-8 text-center">
            <h1 className="text-3xl font-black text-[#09245d]">ยังไม่มีโจทย์ฝึกสำหรับหัวข้อนี้</h1>
            <button onClick={onBack} className="tutor-back-button mx-auto mt-5"><ArrowLeft className="h-5 w-5" /> กลับบทเรียน</button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="tutor-library-shell">
      <main className="tutor-stage flex min-h-screen flex-col justify-center gap-4 py-4 md:py-5">
        <header className="tutor-crest-header relative z-10">
          <button onClick={onBack} className="tutor-back-button"><ArrowLeft className="h-5 w-5" /> กลับบทเรียน</button>
          <div className="min-w-0 text-center">
            <h1 className="tutor-title">Tutor Practice</h1>
            <p className="tutor-subtitle mt-1 truncate">{lesson.thaiTitle}</p>
          </div>
          <div className="tutor-blue-ribbon justify-self-center px-4 py-2 text-sm font-black">ข้อ {currentIndex + 1}/{questions.length}</div>
        </header>

        <section className="tutor-book-panel relative z-10 p-4 md:p-6 lg:p-7">
          <div className="mb-4 h-3 overflow-hidden rounded-full border border-cyan-200 bg-sky-950/20 p-0.5">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-[26px] border border-amber-200/80 bg-white/70 p-4 shadow-inner md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-black text-sky-900"><BookOpen className="h-4 w-4" /> {currentQ.subtopic || currentQ.topic}</span>
                <button onClick={() => setHintOpen((open) => !open)} className="tutor-ice-button !min-h-[40px] !px-3 !py-2 text-xs"><HelpCircle className="h-4 w-4" /> คำใบ้</button>
              </div>

              <h2 className="text-xl font-black leading-[1.65] text-slate-950 md:text-3xl">{currentQ.questionText}</h2>

              {hintOpen && (
                <div className="mt-4 rounded-2xl border border-cyan-200 bg-sky-50 p-4 text-sm font-semibold leading-7 text-sky-950">
                  {currentQ.powerUpHint || 'อ่านโจทย์ช้า ๆ แล้วตัดตัวเลือกที่เป็นไปไม่ได้ก่อน'}
                </div>
              )}

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {shuffledOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let stateClass = '';
                  if (!isAnswerSubmitted && isSelected) stateClass = 'is-selected';
                  if (isAnswerSubmitted && opt.isCorrect) stateClass = 'is-correct';
                  if (isAnswerSubmitted && isSelected && !opt.isCorrect) stateClass = 'is-wrong';
                  return (
                    <button key={opt.id} onClick={() => submitAnswer(opt.id)} disabled={isAnswerSubmitted} className={`tutor-option ${stateClass}`}>
                      <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-sky-300 bg-white text-xs font-black text-sky-800">{opt.displayLetter || opt.id}</span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="tutor-parchment-panel p-4 md:p-5">
              <img src="/ui/arctic-library/crystal-crest.png" alt="" aria-hidden="true" className="mx-auto h-16 w-16 object-contain" />
              <h3 className="mt-3 text-center text-xl font-black text-[#09245d]">สมุดฝึกติวเตอร์</h3>
              <p className="mt-2 text-center text-sm font-semibold leading-6 text-slate-700">ฝึกแบบไม่มีฉากต่อสู้ ไม่มี HP และไม่มี timer เพื่อให้จดจ่อกับวิธีคิด</p>
              <div className="mt-5 rounded-2xl bg-sky-50 p-4 text-center">
                <strong className="text-3xl font-black text-sky-800">{correctCount}</strong>
                <span className="ml-2 text-sm font-bold text-slate-700">ตอบถูกแล้ว</span>
              </div>
              {isAnswerSubmitted && (
                <div className={`mt-4 rounded-2xl p-4 text-sm font-bold leading-6 ${isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                  <div className="mb-1 flex items-center gap-2 font-black">{isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />} {isCorrect ? 'ถูกต้อง' : 'ยังไม่ถูก'}</div>
                  {currentQ.shortcutNote || currentQ.explanation}
                </div>
              )}
              <button onClick={next} disabled={!isAnswerSubmitted} className="tutor-gold-button mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50">
                {isLast ? 'ดูผลการฝึก' : 'ข้อถัดไป'} <ArrowRight className="h-5 w-5" />
              </button>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};
