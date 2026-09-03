import React, { useState } from 'react';
import { 
  X, 
  HeartHandshake, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Smile, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface ParentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentGuideModal: React.FC<ParentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTopic, setActiveTopic] = useState<number>(0);

  if (!isOpen) return null;

  const TOPICS = [
    {
      title: '1. เป้าหมายของ Klapanya Math Quest',
      icon: '🎯',
      subtitle: 'สร้างทัศนคติที่ดีต่อคณิตศาสตร์ & เตรียมความพร้อมสอบเข้า ม.1',
      description: 'ระบบนี้ถูกออกแบบมาเพื่อเปลี่ยนการทำโจทย์คณิตศาสตร์ที่น่าเบื่อให้กลายเป็นการผจญภัยในธีมแฟนตาซีน้ำแข็ง เพื่อให้นักเรียนระดับชั้น ป.6 สนุกกับการคิดคำนวณและสร้างความมั่นใจก่อนลงสนามสอบจริง โดยข้อสอบทั้ง 710 ข้ออ้างอิงตามมาตรฐาน O-NET และ สพฐ.',
    },
    {
      title: '2. ตารางฝึกฝนประจำวันที่แนะนำ (15-20 นาที)',
      icon: '⏰',
      subtitle: 'ฝึกน้อยแต่สม่ำเสมอ ดีกว่าการอัดอ่านก่อนสอบ',
      description: 'แนะนำให้นักเรียนทำ Daily Training Quest วันละ 1 รอบ (15 ข้อ ใช้เวลาประมาณ 15-20 นาที) ซึ่งระบบจะจัดสรรข้อสอบแบบผสมผสาน: วอร์มอัป 3 ข้อ + ซ่อมจุดอ่อน 5 ข้อ + โจทย์ด่านปัจจุบัน 5 ข้อ + ข้อสอบท้าทาย 2 ข้อ ไม่สร้างความเหนื่อยล้าจนเกินไป',
    },
    {
      title: '3. เข้าใจโหมดการเรียนรู้แต่ละประเภท',
      icon: '🧭',
      subtitle: 'ติว (Tutor) • ดริลล์ (Drill) • ประลอง (Battle)',
      description: '• ห้องติว (Tutor Room): มีคลิปและสเต็ปสอนแนวคิดและสูตรลัด 3-5 นาทีก่อนเริ่มเล่น\n• ศูนย์ดริลล์ (Drill): ฝึกคิดเลขเร็วและความคล่องแคล่วเพื่อเพิ่มความเร็วในการทำข้อสอบ\n• ห้องประลอง (Classroom Battle): เล่นแข่งขันกับเพื่อนในห้องเพื่อสร้างความตื่นเต้นและฝึกควบคุมอารมณ์ภายใต้ความกดดัน',
    },
    {
      title: '4. วิธีชวนลูกทบทวนข้อผิดพลาดอย่างสร้างสรรค์',
      icon: '❤️',
      subtitle: 'ข้อผิดพลาดคือโอกาสทองในการเรียนรู้',
      description: 'เมื่อลูกทำข้อสอบผิด ระบบจะมีปุ่ม "🩺 ดูเทคนิคแก้จุดพลาด" และบันทึกไว้ใน Review Hub ผู้ปกครองสามารถร่วมเปิดดูเฉลยไปพร้อมลูก และชวนคุยว่า "หนูคิดอย่างไรถึงเลือกตอบข้อนี้?" แล้วให้ลองทำข้อสอบแก้ตัวใน Recovery Drill เพื่อสร้างกำลังใจว่าข้อผิดพลาดสามารถแก้ไขได้เสมอ',
    },
    {
      title: '5. เน้นความก้าวหน้า มากกว่าอันดับคะแนน',
      icon: '🌟',
      subtitle: 'สร้าง Growth Mindset ให้นักเรียนมั่นใจในตัวเอง',
      description: 'หลีกเลี่ยงการเปรียบเทียบอันดับในลานประลองกับเพื่อนคนอื่น แต่ให้ชื่นชมความพยายาม สถิติความต่อเนื่อง (Streak) และความแม่นยำที่เพิ่มขึ้นทีละนิดใน Skill DNA ของตัวลูกเอง เพื่อสร้างความภูมิใจในตนเอง (Self-Efficacy) อย่างยั่งยืน',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 font-sans">
      <div className="frost-card rounded-3xl p-5 md:p-8 max-w-2xl w-full border-2 border-emerald-400/80 shadow-glow-cyan flex flex-col justify-between max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base md:text-lg font-black text-white">
                คู่มือสำหรับผู้ปกครอง (Parent Guide)
              </h3>
              <span className="text-[10px] text-emerald-300 font-semibold">
                โรงเรียนกล้าปัญญา • ส่งเสริมการเรียนรู้อย่างมีความสุข
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            aria-label="ปิดคู่มือ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {TOPICS.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTopic(idx)}
              className={`p-2.5 rounded-xl text-left transition-all border ${
                activeTopic === idx
                  ? 'bg-emerald-500 text-slate-950 font-black border-emerald-300 shadow-md scale-102'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{t.icon}</span>
                <span className="text-xs truncate font-bold">{t.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Topic Detail */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 shadow-inner flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{TOPICS[activeTopic].icon}</span>
              <h4 className="text-base font-black text-white">
                {TOPICS[activeTopic].title}
              </h4>
            </div>

            <p className="text-xs text-emerald-300 font-bold mb-3">
              {TOPICS[activeTopic].subtitle}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {TOPICS[activeTopic].description}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
          <span className="text-[11px] text-slate-400">
            💬 มีคำถามเพิ่มเติม? ติดต่อคุณครูประจำชั้นโรงเรียนกล้าปัญญา
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all shrink-0"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
