import React, { useMemo, useState } from 'react';
import type { TutorLesson } from '../../types/learning';
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, FileImage, GraduationCap, Play, Sparkles, Target } from 'lucide-react';

interface TutorRoomScreenProps {
  lesson: TutorLesson;
  onFinishLessonAndStartDrill: () => void;
  onFinishLessonAndPlayStage: () => void;
  onBack: () => void;
}

export const TutorRoomScreen: React.FC<TutorRoomScreenProps> = ({ lesson, onFinishLessonAndStartDrill, onFinishLessonAndPlayStage, onBack }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedTryOption, setSelectedTryOption] = useState<string | null>(null);
  const [tryResultChecked, setTryResultChecked] = useState<boolean>(false);

  const steps = lesson.steps;
  const tryQuestion = steps.tryOneQuestion;
  const isTryCorrect = tryQuestion.options.find((o: { id: string; text: string; isCorrect: boolean }) => o.id === selectedTryOption)?.isCorrect || false;

  const lessonSteps = useMemo(() => [
    { num: 1, label: 'แนวคิด', title: 'แนวคิดหลักของบทเรียน', body: steps.concept },
    { num: 2, label: 'หลักการ', title: 'หลักการสำคัญที่ต้องจำ', body: steps.keyPrinciple },
    { num: 3, label: 'สูตรลัด', title: 'Technique / สูตรลัด', body: steps.shortcut },
    { num: 4, label: 'จุดลวง', title: 'ข้อควรระวังในข้อสอบ', body: steps.commonTrap },
    { num: 5, label: 'ตัวอย่าง', title: 'ตัวอย่างพร้อมวิธีคิด', body: steps.workedExample.problem },
    { num: 6, label: 'ลองทำ', title: 'Try One Challenge', body: tryQuestion.questionText },
  ], [steps, tryQuestion.questionText]);

  const pageAssets = [
    '/ui/arctic-library/library-background-desktop.png',
    '/ui/arctic-library/open-book-panel.png',
    '/ui/arctic-library/parchment-stage-panel.png',
    '/ui/arctic-library/crystal-crest.png',
  ];

  const current = lessonSteps.find((step) => step.num === activeStep) || lessonSteps[0];

  const renderStepBody = () => {
    if (activeStep === 5) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-sky-200 bg-white/80 p-4 text-base font-black leading-7 text-slate-900 shadow-inner">{steps.workedExample.problem}</div>
          <div className="space-y-2 border-l border-amber-300 pl-4">
            {steps.workedExample.stepByStep.map((step, idx) => <p key={idx} className="text-sm font-semibold leading-7 text-slate-700">{step}</p>)}
          </div>
          <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-black text-emerald-800">คำตอบที่ถูกต้อง: {steps.workedExample.answer}</div>
        </div>
      );
    }

    if (activeStep === 6) {
      return (
        <div className="space-y-4">
          <p className="rounded-2xl border border-sky-200 bg-white/80 p-4 text-base font-black leading-7 text-slate-900 shadow-inner">{tryQuestion.questionText}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {tryQuestion.options.map((opt: { id: string; text: string; isCorrect: boolean }) => {
              const isSelected = selectedTryOption === opt.id;
              let stateClass = '';
              if (isSelected && !tryResultChecked) stateClass = 'is-selected';
              if (tryResultChecked && opt.isCorrect) stateClass = 'is-correct';
              if (tryResultChecked && isSelected && !opt.isCorrect) stateClass = 'is-wrong';
              return <button key={opt.id} onClick={() => !tryResultChecked && setSelectedTryOption(opt.id)} className={`tutor-option ${stateClass}`}>{opt.text}</button>;
            })}
          </div>
          {!tryResultChecked ? (
            <button onClick={() => setTryResultChecked(true)} disabled={!selectedTryOption} className="tutor-blue-button w-full disabled:cursor-not-allowed disabled:opacity-50">ตรวจคำตอบทันที</button>
          ) : (
            <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-bold leading-6 ${isTryCorrect ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-rose-300 bg-rose-100 text-rose-800'}`}>
              {isTryCorrect ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />}
              <span>{isTryCorrect ? 'ถูกต้องยอดเยี่ยม! คุณเข้าใจหลักการของบทเรียนนี้แล้ว' : `ยังไม่ถูกต้อง: ${tryQuestion.explanation}`}</span>
            </div>
          )}
        </div>
      );
    }

    return <p className="text-base font-semibold leading-8 text-slate-700 md:text-lg">{current.body}</p>;
  };

  return (
    <div className="tutor-library-shell select-none">
      <main className="tutor-stage tutor-room-stage grid min-h-screen content-center gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="tutor-parchment-panel relative z-10 p-4">
          <button onClick={onBack} className="tutor-back-button mb-5"><ArrowLeft className="h-5 w-5" /> กลับภาพรวม</button>
          <img src="/ui/arctic-library/crystal-crest.png" alt="" aria-hidden="true" className="mx-auto h-14 w-14 object-contain" />
          <h1 className="mt-2 text-center text-xl font-black leading-tight text-[#09245d]">{lesson.thaiTitle}</h1>
          <p className="mt-2 text-center text-xs font-bold leading-5 text-slate-700">ห้องติว {lesson.targetMinutes} นาที · เรียนทีละขั้นก่อนฝึกโจทย์จริง</p>
          <nav className="mt-4 grid gap-2" aria-label="ขั้นตอนบทเรียน">
            {lessonSteps.map((step) => <button key={step.num} onClick={() => setActiveStep(step.num)} className={`tutor-step-tab text-left text-sm font-black ${activeStep === step.num ? 'is-active' : ''}`}><span className="mr-2 opacity-75">{step.num}</span>{step.label}</button>)}
          </nav>
        </aside>

        <section className="tutor-book-panel relative z-10 overflow-hidden p-4 md:p-5 lg:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="tutor-blue-ribbon px-4 py-2 text-xs font-black"><GraduationCap className="mr-2 inline h-4 w-4" /> TUTOR ROOM</div>
            <div className="text-sm font-black text-[#0b3c89]">ขั้นที่ {activeStep} จาก 6</div>
          </div>

          <div className="rounded-[24px] border border-amber-200/70 bg-white/60 p-4 shadow-inner md:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><Sparkles className="h-6 w-6" /></span>
              <div>
                <h2 className="text-xl font-black text-[#09245d] md:text-3xl">{current.title}</h2>
                <p className="mt-1 text-sm font-bold text-slate-600">{lesson.stageId} · {current.label}</p>
              </div>
            </div>
            {renderStepBody()}
          </div>

          <div className="mt-4 rounded-2xl border border-sky-200/70 bg-sky-50/75 p-3 text-left text-xs font-semibold leading-5 text-slate-700">
            <div className="mb-2 flex items-center gap-2 font-black text-sky-900"><FileImage className="h-4 w-4" /> ไฟล์ภาพที่หน้านี้ใช้จริง</div>
            <div className="grid gap-1 sm:grid-cols-2">
              {pageAssets.map((asset) => <code key={asset} className="truncate rounded-lg bg-white/80 px-2 py-1 text-[11px] text-slate-700">{asset}</code>)}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {activeStep > 1 && <button onClick={() => setActiveStep(activeStep - 1)} className="tutor-ghost-button">ขั้นก่อนหน้า</button>}
              {activeStep < 6 && <button onClick={() => setActiveStep(activeStep + 1)} className="tutor-ice-button">ขั้นถัดไป <ChevronRight className="h-4 w-4" /></button>}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button onClick={onFinishLessonAndStartDrill} className="tutor-blue-button"><Target className="h-5 w-5" /> ฝึกโจทย์ใน Tutor</button>
              <button onClick={onFinishLessonAndPlayStage} className="tutor-gold-button"><Play className="h-5 w-5 fill-current" /> เล่นด่านจริง</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
