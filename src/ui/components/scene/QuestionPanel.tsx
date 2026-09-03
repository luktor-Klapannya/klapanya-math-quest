import React from 'react';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface QuestionPanelProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  topicBadge?: string;
  options: string[];
  selectedOptionIndex: number | null;
  correctOptionIndex?: number;
  isAnswered: boolean;
  onSelectOption: (index: number) => void;
  className?: string;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  questionNumber,
  totalQuestions,
  questionText,
  topicBadge = 'คณิตศาสตร์ ม.1',
  options,
  selectedOptionIndex,
  correctOptionIndex,
  isAnswered,
  onSelectOption,
  className = '',
}) => {
  return (
    <div className={`w-full max-w-4xl mx-auto px-3 sm:px-4 flex flex-col gap-3 select-none ${className}`}>
      
      {/* 1. QUESTION PROMPT CARD */}
      <div className="p-3.5 sm:p-5 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-400/40 shadow-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/60 text-cyan-300">
            ข้อที่ {questionNumber} / {totalQuestions} • {topicBadge}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">
            เลือกคำตอบที่ถูกต้องที่สุด
          </span>
        </div>

        <div className="text-sm sm:text-base md:text-lg font-bold text-white leading-relaxed pt-1">
          {questionText}
        </div>
      </div>

      {/* 2. RESPONSIVE CHOICE OPTIONS GRID (2x2 on desktop, single-column touch on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {options.map((option, idx) => {
          const isSelected = selectedOptionIndex === idx;
          const isCorrect = isAnswered && idx === correctOptionIndex;
          const isWrong = isAnswered && isSelected && idx !== correctOptionIndex;

          let btnStyle = 'bg-slate-950/70 border-slate-700/80 text-slate-200 hover:border-cyan-400/60 hover:bg-cyan-950/40';
          if (isSelected && !isAnswered) {
            btnStyle = 'bg-cyan-950/80 border-cyan-400 text-cyan-100 shadow-glow-cyan';
          } else if (isCorrect) {
            btnStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.5)] font-black';
          } else if (isWrong) {
            btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.5)] font-black';
          }

          const optionLabels = ['A', 'B', 'C', 'D'];

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => onSelectOption(idx)}
              className={`min-h-[48px] p-3 sm:p-4 rounded-2xl border backdrop-blur-xl transition-all duration-200 flex items-center justify-between gap-3 text-left ${btnStyle} active:scale-[0.98] cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-300 flex-shrink-0">
                  {optionLabels[idx] || idx + 1}
                </span>
                <span className="text-xs sm:text-sm font-semibold truncate">
                  {option}
                </span>
              </div>

              {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
              {isWrong && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
