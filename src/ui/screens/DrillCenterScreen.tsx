import React, { useState } from 'react';
import { PlayerProfile } from '../../types';
import { DrillType, DrillConfig } from '../../types/learning';
import { generateDrillSession } from '../../engine/drill-engine';
import { 
  Target, 
  Zap, 
  AlertTriangle, 
  Flame, 
  ShieldCheck, 
  ArrowLeft, 
  Play, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface DrillCenterScreenProps {
  profile: PlayerProfile;
  onStartDrillSession: (drillConfig: DrillConfig) => void;
  onBack: () => void;
}

export const DrillCenterScreen: React.FC<DrillCenterScreenProps> = ({
  profile,
  onStartDrillSession,
  onBack,
}) => {
  const [selectedDrillType, setSelectedDrillType] = useState<DrillType>('QUICK_DRILL');
  const [selectedSkill, setSelectedSkill] = useState<string>('calculation');

  const drillOptions: { type: DrillType; title: string; subtitle: string; icon: string; count: number; badgeColor: string }[] = [
    {
      type: 'QUICK_DRILL',
      title: '⚡ ควิกดริลล์ 5 ข้อ (Quick Drill)',
      subtitle: 'ชุดฝึกซ้อมเร็ว 5 ข้อสุ่มรวมทุกหมวด เพื่อวอร์มอัปสมองก่อนลงสนามจริง',
      icon: '⚡',
      count: 5,
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
    },
    {
      type: 'SKILL_DRILL',
      title: '🎯 สกิลดริลล์เจาะลึก (Skill Drill)',
      subtitle: 'ฝึกทักษะเฉพาะด้าน 10 ข้อติดกัน เพื่อสร้างความชำนาญแบบก้าวกระโดด',
      icon: '🎯',
      count: 10,
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/40',
    },
    {
      type: 'TRAP_DRILL',
      title: '🕳️ ดริลล์ปราบกับดักข้อสอบ (Trap Drill)',
      subtitle: 'เจาะจงเฉพาะโจทย์ที่มีกับดักคำลวงและจุดที่นักเรียนตอบผิดบ่อยที่สุด',
      icon: '⚠️',
      count: 5,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/40',
    },
    {
      type: 'SPEED_DRILL',
      title: '🏎️ สปีดดริลล์คิดเลขเร็ว (Speed Fluency)',
      subtitle: 'ฝึกความไวและการดึงคำตอบอัตโนมัติในเวลา 10 วินาทีต่อข้อ',
      icon: '🏎️',
      count: 10,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
    },
    {
      type: 'RECOVERY_DRILL',
      title: '🛡️ รีโคฟเวอรีดริลล์ ซ่อมจุดอ่อน (Recovery Drill)',
      subtitle: 'ระบบวิเคราะห์ Skill DNA ดึงข้อสอบจากทักษะที่คุณยังได้คะแนนน้อยมาติวซ่อม',
      icon: '🛡️',
      count: 8,
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
    },
  ];

  const handleLaunch = () => {
    const config = generateDrillSession(selectedDrillType, profile, selectedSkill);
    onStartDrillSession(config);
  };

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-between text-slate-100 max-w-4xl mx-auto select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold border border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่แผนที่หลัก
        </button>

        <span className="text-xs text-purple-300 font-bold px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-500/40">
          DRILL CENTER • ศูนย์ฝึกดริลล์เฉพาะทาง
        </span>
      </div>

      {/* Main Selection Card */}
      <div className="frost-card rounded-3xl p-6 md:p-8 border-2 border-purple-400 shadow-glow-purple flex-1 flex flex-col justify-between mb-4">
        <div>
          <div className="pb-3 border-b border-slate-700/80 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-400 flex items-center justify-center text-3xl shadow-glow-purple">
              🎯
            </div>
            <div>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                TARGETED PRACTICE & RECOVERY
              </span>
              <h1 className="text-lg md:text-2xl font-black text-white">
                เลือกรูปแบบดริลล์เพื่อพัฒนาทักษะ
              </h1>
            </div>
          </div>

          {/* Drill Type Options Grid */}
          <div className="space-y-2.5 my-4">
            {drillOptions.map((opt) => {
              const isSelected = selectedDrillType === opt.type;
              return (
                <button
                  key={opt.type}
                  onClick={() => setSelectedDrillType(opt.type)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-950/90 border-purple-400 ring-2 ring-purple-400 shadow-glow-purple'
                      : 'bg-arctic-900/80 border-slate-800 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-arctic-950 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      {opt.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs md:text-sm font-black text-white">{opt.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                          {opt.count} ข้อ
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{opt.subtitle}</p>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-purple-300' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Skill Selector if SKILL_DRILL is selected */}
          {selectedDrillType === 'SKILL_DRILL' && (
            <div className="p-3.5 rounded-2xl bg-arctic-950/90 border border-purple-500/40 text-xs my-3 animate-scale-up">
              <span className="font-bold text-purple-300 block mb-2">เลือกทักษะที่ต้องการเจาะลึก:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'calculation', label: 'การคำนวณ & PEMDAS' },
                  { id: 'mental_math', label: 'คณิตคิดเร็ว' },
                  { id: 'fractions_decimals', label: 'เศษส่วน & ทศนิยม' },
                  { id: 'algebraic_reasoning', label: 'สมการ & โจทย์ปัญหา' },
                  { id: 'geometry_spatial', label: 'เรขาคณิต & รูปคลี่ 3D' },
                  { id: 'ratio_percentage_scale', label: 'ร้อยละ & กำไรขาดทุน' },
                  { id: 'trap_detection', label: 'การจับกับดักคำลวง' },
                  { id: 'number_sense', label: 'ค่าประจำหลัก & ห.ร.ม.' },
                ].map((sk) => (
                  <button
                    key={sk.id}
                    onClick={() => setSelectedSkill(sk.id)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                      selectedSkill === sk.id
                        ? 'bg-purple-600 border-purple-300 text-white shadow-md'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sk.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Launch Button */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={handleLaunch}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-glow-purple transform hover:scale-102 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>เริ่มทำดริลล์ชุดนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
};
