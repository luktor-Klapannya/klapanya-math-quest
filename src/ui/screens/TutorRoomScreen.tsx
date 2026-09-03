import React, { useState } from 'react';
import { TutorLesson } from '../../types/learning';
import { 
  GraduationCap, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronRight, 
  HelpCircle, 
  Target,
  Play,
  RotateCcw
} from 'lucide-react';

interface TutorRoomScreenProps {
  lesson: TutorLesson;
  onFinishLessonAndStartDrill: () => void;
  onFinishLessonAndPlayStage: () => void;
  onBack: () => void;
}

export const TutorRoomScreen: React.FC<TutorRoomScreenProps> = ({
  lesson,
  onFinishLessonAndStartDrill,
  onFinishLessonAndPlayStage,
  onBack,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedTryOption, setSelectedTryOption] = useState<string | null>(null);
  const [tryResultChecked, setTryResultChecked] = useState<boolean>(false);

  const steps = lesson.steps;
  const tryQuestion = steps.tryOneQuestion;

  const handleSelectTryOption = (optId: string) => {
    if (tryResultChecked) return;
    setSelectedTryOption(optId);
  };

  const handleCheckTryOption = () => {
    setTryResultChecked(true);
  };

  const isTryCorrect = tryQuestion.options.find((o: { id: string; text: string; isCorrect: boolean }) => o.id === selectedTryOption)?.isCorrect || false;

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-between text-slate-100 max-w-4xl mx-auto select-none font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 text-xs md:text-sm font-bold border-2 border-cyan-400/60 shadow-glow-cyan transition-all transform hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
          <span>🏠 กลับสู่แผนที่หลัก (Back to Map)</span>
        </button>

        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-400" />
          <span className="text-xs text-blue-300 font-bold px-3 py-1 rounded-xl bg-blue-950/80 border border-blue-500/40">
            TUTOR ROOM • บทเรียนลัด {lesson.targetMinutes} นาที
          </span>
        </div>
      </div>

      {/* Main Instructional Deck */}
      <div className="frost-card rounded-3xl p-6 md:p-8 border-2 border-blue-400 shadow-glow-cyan flex-1 flex flex-col justify-between mb-4">
        <div>
          {/* Lesson Title */}
          <div className="pb-3 border-b border-slate-700/80">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              {lesson.stageId} • LESSON MASTER
            </span>
            <h1 className="text-lg md:text-2xl font-black text-white mt-0.5">
              {lesson.thaiTitle}
            </h1>
          </div>

          {/* 7-Step Navigation Progress Bar */}
          <div className="grid grid-cols-6 gap-1.5 my-4 text-center">
            {[
              { num: 1, label: '1. แนวคิด' },
              { num: 2, label: '2. หลักการ' },
              { num: 3, label: '3. สูตรลัด' },
              { num: 4, label: '4. จุดลวง' },
              { num: 5, label: '5. ตัวอย่าง' },
              { num: 6, label: '6. ลองทำ' },
            ].map((st) => (
              <button
                key={st.num}
                onClick={() => setActiveStep(st.num)}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all border ${
                  activeStep === st.num
                    ? 'bg-blue-600 border-blue-300 text-white shadow-md ring-2 ring-blue-400'
                    : 'bg-arctic-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Step 1: Concept */}
          {activeStep === 1 && (
            <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2 animate-scale-up">
              <h3 className="text-sm font-black text-blue-300 flex items-center gap-2">
                💡 1. แนวคิดหลักของบทเรียน (Core Concept)
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">{steps.concept}</p>
            </div>
          )}

          {/* Step 2: Key Principle */}
          {activeStep === 2 && (
            <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2 animate-scale-up">
              <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                📐 2. หลักการสำคัญที่ต้องจำ (Key Principle)
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-semibold">{steps.keyPrinciple}</p>
            </div>
          )}

          {/* Step 3: Shortcut */}
          {activeStep === 3 && (
            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 animate-scale-up">
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                ⚡ 3. สูตรลัดและวิธีคิดไว (Shortcut & Fast Technique)
              </h3>
              <p className="text-xs font-mono text-amber-200 font-bold leading-relaxed">{steps.shortcut}</p>
            </div>
          )}

          {/* Step 4: Common Trap */}
          {activeStep === 4 && (
            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2 animate-scale-up">
              <h3 className="text-sm font-black text-rose-300 flex items-center gap-2">
                ⚠️ 4. ข้อควรระวังและจุดลวงในข้อสอบ (Common Trap)
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">{steps.commonTrap}</p>
            </div>
          )}

          {/* Step 5: Worked Example */}
          {activeStep === 5 && (
            <div className="p-5 rounded-2xl bg-arctic-950/90 border border-slate-700 space-y-3 animate-scale-up text-xs">
              <h3 className="text-sm font-black text-emerald-300 flex items-center gap-2">
                📝 5. ตัวอย่างโจทย์และวิธีคิดอย่างเป็นขั้นตอน
              </h3>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-bold text-white">
                {steps.workedExample.problem}
              </div>
              <div className="space-y-1 pl-2 border-l-2 border-emerald-500/50">
                {steps.workedExample.stepByStep.map((s, idx) => (
                  <div key={idx} className="text-slate-300 text-[11px] leading-relaxed">
                    {s}
                  </div>
                ))}
              </div>
              <div className="pt-2 text-xs font-black text-emerald-300 border-t border-slate-800">
                👉 คำตอบที่ถูกต้อง: {steps.workedExample.answer}
              </div>
            </div>
          )}

          {/* Step 6: Try One Interactive Question */}
          {activeStep === 6 && (
            <div className="p-5 rounded-2xl bg-arctic-950/90 border border-slate-700 space-y-3 animate-scale-up text-xs">
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                🎯 6. ลองทำโจทย์จริง 1 ข้อ (Try One Challenge)
              </h3>
              <p className="text-xs font-bold text-white leading-relaxed">
                {tryQuestion.questionText}
              </p>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
                {tryQuestion.options.map((opt: { id: string; text: string; isCorrect: boolean }) => {
                  const isSelected = selectedTryOption === opt.id;
                  let optStyle = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-blue-400';
                  if (isSelected && !tryResultChecked) {
                    optStyle = 'bg-blue-950 border-blue-400 ring-2 ring-blue-400 text-white';
                  } else if (tryResultChecked) {
                    if (opt.isCorrect) {
                      optStyle = 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold';
                    } else if (isSelected && !opt.isCorrect) {
                      optStyle = 'bg-rose-950 border-rose-400 text-rose-300 line-through';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectTryOption(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all text-xs ${optStyle}`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* Check Answer Button & Feedback */}
              {!tryResultChecked ? (
                <button
                  onClick={handleCheckTryOption}
                  disabled={!selectedTryOption}
                  className={`w-full py-2.5 rounded-xl font-black text-xs transition-all ${
                    selectedTryOption
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  ตรวจคำตอบทันที
                </button>
              ) : (
                <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  isTryCorrect ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300' : 'bg-rose-950/80 border-rose-400 text-rose-300'
                }`}>
                  {isTryCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{isTryCorrect ? 'ถูกต้องยอดเยี่ยม! คุณเข้าใจหลักการของบทเรียนนี้แล้ว' : 'ยังไม่ถูกต้อง: ' + tryQuestion.explanation}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                ขั้นตอนก่อนหน้า
              </button>
            )}
            {activeStep < 6 && (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-md"
              >
                <span>ขั้นตอนถัดไป</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onFinishLessonAndStartDrill}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md"
            >
              <Target className="w-4 h-4" />
              <span>เริ่มทำดริลล์ฝึกทักษะ (Start Drill)</span>
            </button>

            <button
              onClick={onFinishLessonAndPlayStage}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-glow-cyan"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>เข้าเล่นด่านจริง (Play Stage)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
