import React from 'react';
import { Bookmark, CheckCircle2, X } from 'lucide-react';
import { ExamAnswerRecord } from '../../types';

interface ExamPaletteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, ExamAnswerRecord>;
  onSelectQuestion: (index: number) => void;
}

export const ExamPaletteDrawer: React.FC<ExamPaletteDrawerProps> = ({
  isOpen,
  onClose,
  totalQuestions,
  currentIndex,
  answers,
  onSelectQuestion,
}) => {
  if (!isOpen) return null;

  let answeredCount = 0;
  let markedCount = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const rec = answers[i];
    if (rec?.selectedOptionId || (rec?.numericalInput && rec.numericalInput.trim() !== '')) {
      answeredCount++;
    }
    if (rec?.isMarkedForReview) {
      markedCount++;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="frost-card rounded-3xl p-5 md:p-7 max-w-lg w-full border-2 border-cyan-400 shadow-glow-cyan animate-scale-up text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
          <div>
            <h3 className="font-extrabold text-lg text-white">ตารางข้อสอบทั้งหมด (Question Palette)</h3>
            <p className="text-xs text-slate-400">
              ตอบแล้ว {answeredCount}/{totalQuestions} ข้อ • ติดธงทบทวน {markedCount} ข้อ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] mb-4 font-semibold">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> ตอบแล้ว
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" /> ทบทวน
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-500 inline-block" /> ยังไม่ตอบ
          </span>
        </div>

        {/* 20 Question Grid */}
        <div className="grid grid-cols-5 gap-2.5 max-h-64 overflow-y-auto pr-1 py-1">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const rec = answers[idx];
            const isAnswered = Boolean(
              rec?.selectedOptionId || (rec?.numericalInput && rec.numericalInput.trim() !== '')
            );
            const isMarked = rec?.isMarkedForReview;
            const isCurrent = idx === currentIndex;

            let btnStyle = 'bg-arctic-800/80 border-slate-700 text-slate-300 hover:border-cyan-400';

            if (isAnswered) {
              btnStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-300 font-bold';
            }
            if (isMarked) {
              btnStyle = 'bg-amber-950/90 border-amber-400 text-amber-300 font-bold';
            }
            if (isCurrent) {
              btnStyle += ' ring-2 ring-cyan-400 shadow-glow-cyan scale-105';
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  onSelectQuestion(idx);
                  onClose();
                }}
                className={`py-3 rounded-xl border text-center font-mono font-bold text-sm relative transition-all active:scale-95 ${btnStyle}`}
              >
                {idx + 1}
                {isMarked && (
                  <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400 absolute top-1 right-1" />
                )}
                {isAnswered && !isMarked && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
        >
          กลับสู่ข้อสอบ
        </button>
      </div>
    </div>
  );
};
