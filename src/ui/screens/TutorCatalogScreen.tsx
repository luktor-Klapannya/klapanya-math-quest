import React from 'react';
import { ArrowLeft, BookOpen, Lightbulb, Sparkles, Target } from 'lucide-react';
import { TUTOR_LESSONS } from '../../progression/tutor-database';

interface Props { onBack: () => void; onSelectLesson: (stageId: string) => void; }

const TUTOR_CARDS = [
  ['01','D1','การคูณและการหารลงตัว'],
  ['02','D1','คิดเลขเร็วและกำลังสอง'],
  ['03','D5','ตัวประกอบและจำนวนเฉพาะ'],
  ['04','GEO','เส้นขนานและเรขาคณิต'],
  ['05','D5','ห.ร.ม. และ ค.ร.น.'],
  ['06','D6','เศษส่วนและทศนิยม'],
  ['07','ONET-3','สมการและโจทย์ปัญหา'],
  ['08','ONET-3','ร้อยละ อัตราส่วนและมาตราส่วน'],
  ['09','GEO','เรขาคณิต 2D/3D'],
  ['10','ONET-3','ทบทวนแนวข้อสอบ O-NET'],
] as const;

export const TutorCatalogScreen: React.FC<Props> = ({ onBack, onSelectLesson }) => (
  <div className="tutor-library-shell">
    <main className="tutor-stage">
      <img src="/ui/arctic-library/crystal-cluster.png" alt="" aria-hidden="true" className="tutor-floating-crystal bottom-4 right-4 hidden w-32 opacity-80 md:block lg:w-44" />
      <header className="tutor-crest-header relative z-10">
        <button onClick={onBack} className="tutor-back-button" aria-label="กลับหน้าหลัก"><ArrowLeft className="h-5 w-5" /> กลับ</button>
        <div className="min-w-0 text-center">
          <h1 className="tutor-title">คลังบทเรียนติวเตอร์</h1>
          <p className="tutor-subtitle mt-2">เลือกห้องเรียนเวทคณิตศาสตร์ก่อนเข้าเทคนิค ตัวอย่าง และแบบฝึกหัด</p>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <span className="tutor-blue-ribbon px-4 py-2 text-xs font-black"><BookOpen className="mr-1 inline h-4 w-4" /> Lesson</span>
          <span className="tutor-blue-ribbon px-4 py-2 text-xs font-black"><Lightbulb className="mr-1 inline h-4 w-4" /> Technique</span>
          <span className="tutor-blue-ribbon px-4 py-2 text-xs font-black"><Target className="mr-1 inline h-4 w-4" /> Drill</span>
        </div>
      </header>

      <section className="relative z-10 mt-5 rounded-[32px] border border-cyan-200/30 bg-slate-950/30 p-3 shadow-[0_20px_60px_rgba(2,6,23,.42)] backdrop-blur-sm md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-cyan-100"><Sparkles className="h-5 w-5 text-amber-300" /><span className="text-sm font-black">Tutor Library · Arctic Math</span></div>
          <p className="text-xs font-bold text-sky-100/85">แตะการ์ดเพื่อเริ่มเรียนแบบ 3–5 นาที</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {TUTOR_CARDS.map(([image, stageId, label]) => {
            const ready = Boolean(TUTOR_LESSONS[stageId]);
            return <button key={image} onClick={() => ready && onSelectLesson(stageId)} disabled={!ready} aria-label={`เปิดบทเรียน ${label}`} className="group relative overflow-hidden rounded-[22px] border border-amber-200/70 bg-[#061947] text-left shadow-[0_14px_34px_rgba(2,6,23,.42)] transition duration-200 enabled:hover:-translate-y-1 enabled:hover:border-cyan-100 enabled:hover:shadow-[0_18px_42px_rgba(34,211,238,.28)] disabled:opacity-55">
              <img src={`/tutor/cards/tutor_card_${image}.png`} alt={label} className="aspect-[271/230] h-auto w-full object-fill" />
              <span className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/15 group-hover:ring-cyan-100/80" />
            </button>;
          })}
        </div>
      </section>
    </main>
  </div>
);
