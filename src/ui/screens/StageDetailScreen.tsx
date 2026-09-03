import React from 'react';
import { PlayerProfile } from '../../types';
import { 
  GraduationCap, 
  Target, 
  Play, 
  Flame, 
  BookOpen, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';

interface StageDetailScreenProps {
  stageId: string;
  stageName: string;
  thaiName: string;
  subtitle: string;
  academicFocus: string;
  questionCount: number;
  rewardText: string;
  commonTrapSummary: string;
  recommendedSkillName: string;
  linkedCodexChapterId: number;
  profile: PlayerProfile;
  onLearnFirst: () => void;
  onDrill: () => void;
  onPlayPractice: () => void;
  onPlayChallenge: () => void;
  onOpenCodexChapter: (chapterId: number) => void;
  onBack: () => void;
}

export const StageDetailScreen: React.FC<StageDetailScreenProps> = ({
  stageId,
  stageName,
  thaiName,
  subtitle,
  academicFocus,
  questionCount,
  rewardText,
  commonTrapSummary,
  recommendedSkillName,
  linkedCodexChapterId,
  profile,
  onLearnFirst,
  onDrill,
  onPlayPractice,
  onPlayChallenge,
  onOpenCodexChapter,
  onBack,
}) => {
  const isCleared = profile.clearedStages.includes(stageId);
  const bestAcc = profile.stageBestAccuracy[stageId] || 0;
  const stars = profile.stageStars[stageId] || 0;

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-between text-slate-100 max-w-4xl mx-auto select-none font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 text-xs md:text-sm font-bold border-2 border-cyan-400/60 shadow-glow-cyan transition-all transform hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
          <span>🏠 กลับสู่แผนที่หลัก (Back to Map)</span>
        </button>

        <span className="text-xs text-cyan-300 font-bold px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40">
          STAGE PREPARATION & TUTOR HUB
        </span>
      </div>

      {/* Main Preparation Card */}
      <div className="frost-card rounded-3xl p-6 md:p-8 border-2 border-cyan-400 shadow-glow-cyan flex-1 flex flex-col justify-between mb-4">
        <div>
          {/* Header info */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
            <div>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                {stageId} • {subtitle}
              </span>
              <h1 className="text-xl md:text-2xl font-black text-white mt-0.5">
                {thaiName} ({stageName})
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {isCleared ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านแล้ว ({stars} ⭐)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-bold">
                  🔷 ด่านใหม่
                </span>
              )}
            </div>
          </div>

          {/* Academic Focus Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-4">
            <div className="p-3.5 rounded-2xl bg-arctic-950/80 border border-slate-700 text-xs space-y-1">
              <span className="font-bold text-cyan-300 block">📚 ขอบเขตเนื้อหาวิชาการ:</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">{academicFocus}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-arctic-950/80 border border-slate-700 text-xs space-y-1">
              <span className="font-bold text-amber-300 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> รางวัลเมื่อผ่านด่าน:
              </span>
              <p className="text-[11px] text-amber-200 font-semibold">{rewardText}</p>
            </div>
          </div>

          {/* Trap & Recommended Skill Bridge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 text-xs">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2 text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300 block text-[11px]">จุดลวงในด่านนี้:</span>
                <p className="text-[10px] text-slate-300">{commonTrapSummary}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-2 text-purple-200">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-300 block text-[11px]">สกิลที่แนะนำ:</span>
                <p className="text-[10px] text-purple-200">{recommendedSkillName}</p>
              </div>
            </div>
          </div>

          {/* Relevant Codex Chapter Link */}
          <div className="mt-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" /> สูตรลัดที่เกี่ยวข้องใน Formula Codex
            </span>
            <button
              onClick={() => onOpenCodexChapter(linkedCodexChapterId)}
              className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              เปิดคัมภีร์บทที่ {linkedCodexChapterId}
            </button>
          </div>
        </div>

        {/* Action Buttons: Learn First / Drill / Play / Challenge */}
        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Learn First */}
          <button
            onClick={onLearnFirst}
            className="p-3.5 rounded-2xl bg-blue-600/90 hover:bg-blue-500 text-white font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg transform hover:scale-102 transition-all border border-blue-400"
          >
            <GraduationCap className="w-5 h-5" />
            <span>1. ติวก่อนเล่น (Learn First)</span>
            <span className="text-[9px] font-normal text-blue-200">บทเรียนลัด 3-5 นาที</span>
          </button>

          {/* 2. Drill */}
          <button
            onClick={onDrill}
            className="p-3.5 rounded-2xl bg-purple-600/90 hover:bg-purple-500 text-white font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg transform hover:scale-102 transition-all border border-purple-400"
          >
            <Target className="w-5 h-5" />
            <span>2. สกิลดริลล์ (Drill)</span>
            <span className="text-[9px] font-normal text-purple-200">ฝึกเจาะจง 5-10 ข้อ</span>
          </button>

          {/* 3. Play Practice */}
          <button
            onClick={onPlayPractice}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 text-slate-950 font-black text-xs flex flex-col items-center justify-center gap-1 shadow-glow-cyan transform hover:scale-102 transition-all"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>3. ลุยด่านฝึกหัด (Play)</span>
            <span className="text-[9px] font-semibold text-slate-800">{questionCount} ข้อ พร้อมคำใบ้</span>
          </button>

          {/* 4. Challenge */}
          <button
            onClick={onPlayChallenge}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs flex flex-col items-center justify-center gap-1 shadow-glow-gold transform hover:scale-102 transition-all"
          >
            <Flame className="w-5 h-5 fill-slate-950" />
            <span>4. โหมดท้าทาย (Challenge)</span>
            <span className="text-[9px] font-semibold text-slate-800">จับเวลา & ตัดตัวช่วย</span>
          </button>
        </div>
      </div>
    </div>
  );
};
