import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  GraduationCap, 
  Zap, 
  Play, 
  Swords, 
  RotateCcw, 
  HeartHandshake, 
  Crown,
  BookOpen
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlaying?: () => void;
}

interface PlayStep {
  step: number;
  title: string;
  subtitle: string;
  icon: string;
  badgeColor: string;
  description: string;
  tips: string[];
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  onStartPlaying,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const STEPS: PlayStep[] = [
    {
      step: 1,
      title: '1. เลือกฮีโร่คู่ใจ (Choose Your Hero)',
      subtitle: 'เลือก 1 ใน 4 คลาสผู้กล้าที่มีพลังพิเศษเฉพาะตัว',
      icon: '🧙‍♂️',
      badgeColor: 'bg-cyan-500 text-slate-950',
      description: 'เลือกตัวละครที่เข้ากับสไตล์การคิดเลขของคุณ ทั้งจอมเวทกาลเวลา, อัศวินพิทักษ์ตรรกะ, จอมแม่นธนูอินทรี, หรือจอมโจรย้อนคิด พร้อมปรับแต่งรูปลักษณ์และตั้งชื่อประจำตัว',
      tips: [
        '✨ สกิลกดใช้ช่วยหยุดเวลา, ตัดช้อยส์ลวง, หรือแสดงคำใบ้',
        '🛡️ อัปเกรดอาวุธประจำคลาสเมื่อผ่านด่านและทำเควสต์',
      ],
    },
    {
      step: 2,
      title: '2. ติวเทคนิคก่อนเล่น (Learn with Tutor)',
      subtitle: 'เรียนรู้ 7 ขั้นตอนลัด กระชับ 3-5 นาที',
      icon: '🎓',
      badgeColor: 'bg-blue-500 text-white',
      description: 'ก่อนเริ่มทำโจทย์ในแต่ละด่าน แวะเข้า "ห้องติวเข้ม (Tutor Room)" เพื่อทำความเข้าใจ Concept, สูตรลัด, จุดที่ข้อสอบชอบหลอก, และฝึกทำข้อตัวอย่าง',
      tips: [
        '💡 มีสเต็ป "จุดลวงที่ห้ามพลาด" ช่วยป้องกันการโดนข้อสอบหลอก',
        '📝 มี "ข้อลองทำ (Try-One)" ให้เช็กความเข้าใจก่อนลุยจริง',
      ],
    },
    {
      step: 3,
      title: '3. ฝึกสปีด & ดริลล์ทักษะ (Skill Drill)',
      subtitle: 'ฝึกความแม่นยำและสปีดการคิดเลขในใจ',
      icon: '⚡',
      badgeColor: 'bg-purple-500 text-white',
      description: 'โหมดดริลล์ 5 รูปแบบ ทั้ง Quick Drill 5 ข้อ, Weak Skill Drill แก้จุดอ่อน, Speed Sprint จับเวลาเร็ว, และ Formula Drill ท่องจำสูตร',
      tips: [
        '⏱️ ดริลล์คิดเลขเร็ว 5-15 วินาที ช่วยให้ทำข้อสอบทันเวลา',
        '🔥 ตอบถูกต่อเนื่องเพื่อสะสม Combo คูณคะแนนและเหรียญทอง',
      ],
    },
    {
      step: 4,
      title: '4. ตะลุย 6 เสาหลักโดโจ (Play Dojo Stages)',
      subtitle: 'พิชิต 180 ข้อสอบมาตรฐาน ครอบคลุม ป.6 ทุกมิติ',
      icon: '🏛️',
      badgeColor: 'bg-emerald-500 text-slate-950',
      description: 'สะสมดาว 3 ดาวในแต่ละด่าน ตั้งแต่ D1: เศษส่วนระคน, D2: ทศนิยม & ร้อยละ, D3: สมการ, D4: เรขาคณิต, D5: ห.ร.ม./ค.ร.น., จนถึง D6: อนุกรมและโจทย์ประยุกต์',
      tips: [
        '⭐ ผ่านด่านด้วยความแม่นยำ >= 80% เพื่อปลดล็อกด่านถัดไป',
        '🗡️ ปลดล็อกอาวุธ "Blade of Calculation" เมื่อพิชิตด่านแรก',
      ],
    },
    {
      step: 5,
      title: '5. ประลองสดกับเพื่อนในห้อง (Classroom Battle)',
      subtitle: 'ใส่รหัส 6 หลัก ลุยประลองความเร็วแบบเรียลไทม์',
      icon: '⚔️',
      badgeColor: 'bg-rose-500 text-white',
      description: 'ห้องประลองสดที่จัดขึ้นโดยคุณครู รองรับเพื่อน 9-12 คนพร้อมกัน ตอบถูกและตอบไวเพื่อทำคะแนนติด Top 3 บนกระดานผู้นำ',
      tips: [
        '⚡ มีระบบสลับตำแหน่งช้อยส์อัตโนมัติเพื่อความยุติธรรม',
        '🏆 คะแนน = คะแนนฐาน + โบนัสความเร็ว + โบนัสสตรีค',
      ],
    },
    {
      step: 6,
      title: '6. ทบทวนจุดผิดพลาด (Review Mistakes)',
      subtitle: 'เรียนรู้จากข้อที่ตอบผิด ไม่ปล่อยผ่านความสงสัย',
      icon: '🔍',
      badgeColor: 'bg-amber-500 text-slate-950',
      description: 'ระบบจะบันทึกทุกข้อที่ตอบผิดลงในศูนย์ทบทวน (Review Hub) พร้อมเฉลยละเอียดและวิเคราะห์ประเภทจุดพลาด (Misconception Tag)',
      tips: [
        '🩺 แยกแยะระหว่าง "คิดเลขผิด (Calculation Slip)" กับ "สับสนนิยาม (Conceptual Gap)"',
        '📈 ดูแผนผัง Skill DNA เพื่อเช็กว่าเรื่องไหนเราเก่งแล้ว เรื่องไหนต้องฟิตเพิ่ม',
      ],
    },
    {
      step: 7,
      title: '7. ซ่อมแซมจุดอ่อน 1-Click (Recovery Drill)',
      subtitle: 'ชุดฝึกแก้ตัวอัตโนมัติ เจาะเฉพาะจุดที่เคยพลาด',
      icon: '🩹',
      badgeColor: 'bg-teal-500 text-slate-950',
      description: 'หลังจากทบทวนข้อผิดพลาด กดปุ่ม "1-Click Recovery Drill" เพื่อรับชุดข้อสอบโจทย์คู่ขนานที่มีรูปแบบคล้ายกันมาฝึกซ้ำจนชำนาญ $100\%$',
      tips: [
        '🎯 ทำซ้ำจนระบบอัปเกรดค่า Mastery เป็น 1.0 (Mastered)',
        '🏅 ได้รับเหรียญรางวัลนักสู้ผู้ไม่ยอมแพ้',
      ],
    },
    {
      step: 8,
      title: '8. พิชิตข้อสอบใหญ่ & บัลลังก์ ม.1 (Final Trial & Top Form)',
      subtitle: 'การทดสอบเสมือนจริง 40 ข้อ พร้อมสถิติความพร้อมสอบ',
      icon: '👑',
      badgeColor: 'bg-yellow-400 text-slate-950',
      description: 'วัดผลปลายภาคด้วยข้อสอบสุ่ม 40 ข้อ จับเวลา 60 นาทีตามพิมพ์เขียว O-NET / สพฐ. เพื่อคว้าตำแหน่ง Top Form Sovereign และใบประกาศเกียรติคุณ',
      tips: [
        '📜 จำลองบรรยากาศสอบจริง ไม่มีคำใบ้ ไม่มีหยุดเวลา',
        '🎓 ความแม่นยำ >= 85% ปลดล็อกชุดคอสตูมและรัศมี Top Form ประจำตัว',
      ],
    },
  ];

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 font-sans">
      <div className="frost-card rounded-3xl p-5 md:p-8 max-w-2xl w-full border-2 border-cyan-400 shadow-glow-cyan flex flex-col justify-between max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base md:text-lg font-black text-white">
              คู่มือการเล่นและเรียนรู้ (How to Play)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            aria-label="ปิดคู่มือ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Dots / Indicators */}
        <div className="flex items-center justify-between gap-1.5 mb-5 overflow-x-auto pb-1">
          {STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIndex(idx)}
              className={`flex-1 min-w-[32px] py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center ${
                currentStepIndex === idx
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan font-black scale-105'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{s.step}</span>
            </button>
          ))}
        </div>

        {/* Active Step Content Card */}
        <div className="p-5 md:p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/40 shadow-inner flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl md:text-4xl">{currentStep.icon}</span>
              <div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${currentStep.badgeColor}`}>
                  ขั้นตอนที่ {currentStep.step} / {STEPS.length}
                </span>
                <h4 className="text-base md:text-lg font-black text-white mt-1">
                  {currentStep.title}
                </h4>
              </div>
            </div>

            <p className="text-xs md:text-sm text-cyan-300 font-semibold mb-3">
              {currentStep.subtitle}
            </p>

            <p className="text-xs md:text-sm text-slate-200 leading-relaxed mb-4">
              {currentStep.description}
            </p>

            {/* Tips Container */}
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-300 block">💡 เทคนิคแนะนำ:</span>
              {currentStep.tips.map((tip, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between gap-3 mt-5 pt-3 border-t border-slate-800">
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
          </button>

          <span className="text-xs text-slate-400 font-mono">
            {currentStepIndex + 1} / {STEPS.length}
          </span>

          {currentStepIndex < STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1))}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md transition-all"
            >
              ถัดไป <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                if (onStartPlaying) onStartPlaying();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-glow-cyan animate-bounce"
            >
              <span>พร้อมแล้ว ลุยเลย! 🚀</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
