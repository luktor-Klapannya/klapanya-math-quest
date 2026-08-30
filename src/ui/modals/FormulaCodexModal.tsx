import React, { useState } from 'react';
import { CODEX_CHAPTERS } from '../../progression/codex-database';
import { CodexChapter, CodexTopic } from '../../types/learning';
import { BookOpen, Search, Sparkles, X, ChevronRight, AlertTriangle, CheckCircle2, Play, ExternalLink } from 'lucide-react';

interface FormulaCodexModalProps {
  initialChapterId?: number;
  onPracticeSkill?: (skillId: string, stageId?: string) => void;
  onClose: () => void;
}

export const FormulaCodexModal: React.FC<FormulaCodexModalProps> = ({
  initialChapterId = 1,
  onPracticeSkill,
  onClose,
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<number>(initialChapterId);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedChapter = CODEX_CHAPTERS.find((c) => c.id === selectedChapterId) || CODEX_CHAPTERS[0];

  // Search filter across all chapters and topics
  const filteredChapters = CODEX_CHAPTERS.filter((ch) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ch.thaiTitle.toLowerCase().includes(q) ||
      ch.summary.toLowerCase().includes(q) ||
      ch.topics.some((t) => 
        t.title.toLowerCase().includes(q) ||
        t.formulaOrShortcut.toLowerCase().includes(q) ||
        t.coreConcept.toLowerCase().includes(q)
      )
    );
  });

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 select-none font-sans">
      <div className="frost-card rounded-3xl p-5 md:p-7 max-w-5xl w-full border-2 border-purple-400 shadow-glow-purple text-slate-100 max-h-[92vh] flex flex-col justify-between overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-400 flex items-center justify-center text-3xl shadow-glow-purple">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                  FORMULA CODEX (12 บท)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-500/40">
                  คลังคัมภีร์เวทมนตร์คิดลัด
                </span>
              </div>
              <h3 className="text-base md:text-lg font-black text-white">
                สรุปสูตรลัดและเทคนิคพิชิตข้อสอบเข้า ม.1
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="my-3 relative">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อสูตร, หัวข้อ, เทคนิค เช่น ห.ร.ม., ร้อยละ, รูปคลี่, PEMDAS..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-arctic-950/90 border border-slate-700 focus:border-purple-400 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        {/* Split-Panel Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-[360px]">
          
          {/* Left: 12 Chapters Navigation Drawer */}
          <div className="overflow-y-auto space-y-1.5 pr-1 max-h-[50vh] md:max-h-[54vh]">
            {filteredChapters.map((ch) => {
              const isSelected = selectedChapterId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-950/90 border-purple-400 ring-2 ring-purple-400 shadow-glow-purple'
                      : 'bg-arctic-900/70 border-slate-800 hover:border-purple-500/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{ch.icon}</span>
                    <div>
                      <h4 className="text-xs font-black text-white">{ch.thaiTitle}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{ch.summary}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-300' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Right 2 Cols: Selected Chapter Study Deck */}
          <div className="md:col-span-2 overflow-y-auto pr-1 max-h-[50vh] md:max-h-[54vh] space-y-3">
            <div className="frost-card rounded-2xl p-4 border border-purple-500/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">{selectedChapter.icon}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">ด่านที่เกี่ยวข้อง:</span>
                  {selectedChapter.linkedStages.map((stg) => (
                    <span key={stg} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30">
                      {stg}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="text-sm font-black text-white">{selectedChapter.thaiTitle}</h3>
              <p className="text-xs text-slate-300 mt-1">{selectedChapter.summary}</p>
            </div>

            {/* Topics in Chapter */}
            {selectedChapter.topics.map((topic) => (
              <div key={topic.id} className="p-4 rounded-2xl bg-arctic-950/90 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {topic.title}
                  </h4>
                  {onPracticeSkill && (
                    <button
                      onClick={() => onPracticeSkill(topic.linkedSkills[0], selectedChapter.linkedStages[0])}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md"
                    >
                      <Play className="w-3 h-3" /> ฝึกทักษะนี้
                    </button>
                  )}
                </div>

                {/* Core Concept */}
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                  <span className="font-bold text-purple-300 block mb-0.5">💡 แนวคิดหลัก (Core Concept):</span>
                  <p className="text-[11px] text-slate-200">{topic.coreConcept}</p>
                </div>

                {/* Formula or Shortcut */}
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs">
                  <span className="font-bold text-amber-300 block mb-0.5">⚡ สูตรลัด / วิธีคิดไว (Shortcut):</span>
                  <p className="text-[11px] font-mono text-amber-200 font-bold">{topic.formulaOrShortcut}</p>
                </div>

                {/* Worked Example */}
                <div className="p-2.5 rounded-xl bg-arctic-900 border border-slate-700 text-xs space-y-1">
                  <span className="font-bold text-cyan-300 block">📝 ตัวอย่างโจทย์ & ขั้นตอนคิด:</span>
                  <p className="text-[11px] text-white font-semibold">{topic.workedExample.problem}</p>
                  <div className="space-y-0.5 pt-1">
                    {topic.workedExample.steps.map((st, sIdx) => (
                      <div key={sIdx} className="text-[10px] text-slate-300 pl-2 border-l border-slate-700">
                        • {st}
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 text-[11px] font-black text-emerald-300">
                    👉 ตอบ: {topic.workedExample.answer}
                  </div>
                </div>

                {/* Common Trap */}
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs flex items-start gap-2 text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300 block text-[11px]">⚠️ จุดลวงที่ต้องระวัง (Common Trap):</span>
                    <p className="text-[10px] text-slate-300">{topic.commonTrap}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>* คลังคัมภีร์เปิดอ่านได้ตลอดเวลาโดยไม่มีค่าใช้จ่าย</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            ปิดคัมภีร์
          </button>
        </div>
      </div>
    </div>
  );
};
