import React from 'react';
import { ArrowRight, BookOpen, CheckCircle2, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import type { StageSessionResult } from '../../types';
import type { TutorLesson } from '../../types/learning';

interface Props { lesson: TutorLesson; result: StageSessionResult; onReview: () => void; onRetry: () => void; onChooseTopic: () => void; onHome: () => void; }

export const TutorResultScreen: React.FC<Props> = ({ lesson, result, onReview, onRetry, onChooseTopic, onHome }) => {
  const passed = result.accuracy >= 80;
  const message = passed ? 'เข้าใจหัวข้อนี้ดีแล้ว' : 'ทบทวน Technique อีกครั้งแล้วลองใหม่';

  return (
    <div className="tutor-library-shell">
      <main className="tutor-stage flex min-h-screen items-center justify-center">
        <section className="tutor-book-panel relative w-full max-w-4xl overflow-hidden p-5 text-center md:p-10">
          <img src="/ui/arctic-library/crystal-cluster.png" alt="" aria-hidden="true" className="tutor-floating-crystal -right-8 bottom-2 hidden w-40 opacity-75 md:block" />
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-amber-300 bg-sky-100 text-amber-600 shadow-inner">
            <Trophy className="h-12 w-12" />
          </span>
          <div className="tutor-blue-ribbon mx-auto mt-5 inline-flex px-4 py-2 text-xs font-black"><Sparkles className="mr-2 h-4 w-4" /> Tutor Result · {lesson.stageId}</div>
          <h1 className="mt-4 text-3xl font-black text-[#09245d] md:text-5xl">{message}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-700 md:text-base">{lesson.thaiTitle}</p>

          <div className="mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-2">
            <div className="tutor-parchment-panel p-5"><strong className="text-4xl font-black text-sky-700">{result.accuracy}%</strong><span className="mt-1 block text-sm font-bold text-slate-700">ความแม่นยำ</span></div>
            <div className="tutor-parchment-panel p-5"><strong className="text-4xl font-black text-emerald-700">{result.correctCount}/{result.totalQuestions}</strong><span className="mt-1 block text-sm font-bold text-slate-700">ตอบถูก</span></div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button onClick={onReview} className="tutor-ghost-button"><BookOpen className="h-5 w-5" /> ทบทวนบทเรียน</button>
            <button onClick={onRetry} className="tutor-blue-button"><RotateCcw className="h-5 w-5" /> ฝึกอีกครั้ง</button>
            <button onClick={onChooseTopic} className="tutor-ice-button"><Target className="h-5 w-5" /> เลือกหัวข้ออื่น</button>
            <button onClick={onHome} className="tutor-gold-button"><CheckCircle2 className="h-5 w-5" /> กลับหน้าหลัก <ArrowRight className="h-4 w-4" /></button>
          </div>
        </section>
      </main>
    </div>
  );
};
