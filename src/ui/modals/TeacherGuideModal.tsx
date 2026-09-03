import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  GraduationCap, 
  Swords, 
  BarChart3, 
  AlertTriangle, 
  RotateCcw,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface TeacherGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!isOpen) return null;

  const GUIDES = [
    {
      title: '1. มอบหมายด่าน & การบ้าน (Assign Stage)',
      icon: '📚',
      tag: 'ASSIGNMENT WORKFLOW',
      description: 'คุณครูสามารถกำหนดด่านที่ต้องการให้นักเรียนฝึกฝนประจำสัปดาห์ พร้อมกำหนดวันส่งงานและจำนวนข้อที่ต้องการ',
      bullets: [
        'คลิกที่แท็บ "การบ้าน & งานที่มอบหมาย" ในหน้า Teacher Home',
        'กดปุ่ม "สร้างงานใหม่" เลือกประเภท STAGE หรือ DRILL',
        'ระบุห้องเรียน เช่น ป.6/1 หรือ ป.6/2 และระบุเป้าหมายคะแนนขั้นต่ำ',
        'ระบบจะแจ้งเตือนขึ้นที่หน้าแรกของนักเรียนในกล่อง "Assigned Work"',
      ],
    },
    {
      title: '2. มอบหมายห้องติวเข้ม (Assign Tutor)',
      icon: '🎓',
      tag: 'CONCEPTUAL FOUNDATION',
      description: 'สำหรับนักเรียนที่ต้องการปูพื้นฐานแนวคิดก่อนทำแบบฝึกหัด หรือใช้สำหรับการเรียนแบบ Flipped Classroom',
      bullets: [
        'เลือกประเภทงานเป็น TUTOR',
        'เลือกบทเรียน เช่น เศษส่วนระคน (D1), ทศนิยม (D2), สมการ (D3)',
        'นักเรียนจะได้เรียนบทเรียน 7 สเต็ปสั้น (3-5 นาที) พร้อมโจทย์ทดสอบความเข้าใจ Try-One',
        'ระบบจะบันทึกสถานะว่านักเรียนผ่านการติวแล้วหรือไม่',
      ],
    },
    {
      title: '3. สร้างห้องประลองสดในห้องเรียน (Live Battle Room)',
      icon: '⚔️',
      tag: 'CLASSROOM ENGAGEMENT',
      description: 'กิจกรรม Gamification แข่งขันความเร็วและความแม่นยำในคาบเรียน รองรับนักเรียน 9-12 คนพร้อมกัน',
      bullets: [
        'กดปุ่ม "⚔️ สร้างห้องประลองใหม่ (Create Live Battle)"',
        'เลือกระดับความยาก (10 ข้อ / 15 ข้อ) และเวลาตอบต่อข้อ (15-30 วินาที)',
        'ระบบจะสร้างรหัสห้อง 6 หลัก (เช่น KLAP61) นำไปฉายบนจอโปรเจกเตอร์หน้าห้อง',
        'ให้นักเรียนใส่รหัสเข้าร่วม และกดเริ่มการประลองพร้อมกันทั้งห้อง',
      ],
    },
    {
      title: '4. อ่านค่าสถิติความแม่นยำ & Skill DNA',
      icon: '📊',
      tag: 'LEARNING ANALYTICS',
      description: 'วิเคราะห์ผลการเรียนรู้รายบุคคลและภาพรวมห้องเรียนแบบเรียลไทม์',
      bullets: [
        'Accuracy %: อัตราความถูกต้องของแต่ละมิติ (การคำนวณ, สมการ, ร้อยละ, เรขาคณิต)',
        'Speed / Avg Time: เวลาเฉลี่ยที่ใช้ในการแก้โจทย์แต่ละข้อ',
        'Mastery Score: ดัชนีความเชี่ยวชาญแบบถ่วงน้ำหนัก (0.00 - 1.00)',
        'ช่วยให้เห็นทันทีว่านักเรียนคนใดต้องการการดูแลเป็นพิเศษ',
      ],
    },
    {
      title: '5. ตรวจสอบจุดที่มักเข้าใจผิด (Common Misconceptions)',
      icon: '🩺',
      tag: 'DIAGNOSTIC INSIGHT',
      description: 'เจาะลึกรูปแบบข้อผิดพลาดของนักเรียน เพื่อนำไปสอนเสริมในชั้นเรียนได้อย่างตรงจุด',
      bullets: [
        'ดูสรุปแท็กข้อผิดพลาด เช่น ลืมกลับเศษเป็นส่วน, บวกทศนิยมไม่ตรงหลัก, สับสนสูตรพื้นที่/เส้นรอบรูป',
        'ดูรายการโจทย์ยอดฮิตที่มีอัตราการตอบผิดสูงในห้องเรียน',
        'ใช้เป็นข้อมูลตั้งต้นสำหรับการอธิบายเฉลยหน้าห้องเรียน',
      ],
    },
    {
      title: '6. สั่งชุดฝึกซ่อมแซมจุดอ่อน (Assign Recovery Drill)',
      icon: '🩹',
      tag: 'TARGETED REMEDIATION',
      description: 'ปิดช่องว่างทางการเรียนรู้ด้วยระบบสร้างแบบฝึกซ่อมเสริมอัตโนมัติ',
      bullets: [
        'กดปุ่ม "สั่งชุดฝึกซ่อมเสริม (Assign Recovery Drill)"',
        'ระบบจะดึงโจทย์คู่ขนานที่ตรงกับจุดที่นักเรียนทำผิดมาสร้างเป็นชุดฝึก 5-10 ข้อ',
        'นักเรียนจะได้ทำข้อสอบเพื่อแก้ตัวและปลดล็อกคะแนน Mastery กลับคืนมา',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 font-sans">
      <div className="frost-card rounded-3xl p-5 md:p-8 max-w-2xl w-full border-2 border-amber-400/80 shadow-glow-gold flex flex-col justify-between max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base md:text-lg font-black text-white">
                คู่มือการใช้งานสำหรับคุณครู (Teacher Guide)
              </h3>
              <span className="text-[10px] text-amber-300 font-semibold">
                โรงเรียนกล้าปัญญา • ระบบจัดการการเรียนรู้คณิตศาสตร์ ป.6 $\to$ ม.1
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

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-4">
          {GUIDES.map((g, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`p-2 rounded-xl text-left transition-all border ${
                activeTab === idx
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md scale-102'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{g.icon}</span>
                <span className="text-[11px] truncate font-bold">{g.title.split('(')[0]}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/40 shadow-inner flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-500/40 uppercase">
                {GUIDES[activeTab].tag}
              </span>
              <span className="text-2xl">{GUIDES[activeTab].icon}</span>
            </div>

            <h4 className="text-base font-black text-white mb-2">
              {GUIDES[activeTab].title}
            </h4>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
              {GUIDES[activeTab].description}
            </p>

            <div className="space-y-2 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[11px] font-bold text-amber-300 block">📌 แนวทางปฏิบัติ:</span>
              {GUIDES[activeTab].bullets.map((b, i) => (
                <div key={i} className="text-xs text-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
