import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Clock3, GraduationCap, Lightbulb, ShieldAlert, Target } from 'lucide-react';
import type { TutorLesson } from '../../types/learning';

interface Props { lesson: TutorLesson; onBack: () => void; onStart: () => void; }

export const TutorTopicOverviewScreen: React.FC<Props> = ({ lesson, onBack, onStart }) => {
  const title = lesson.thaiTitle.replace(/^บทเรียนติวเข้ม\s*/, '');
  const sections = [
    ['แนวคิด', BookOpen, lesson.steps.concept],
    ['สูตรลัด', Lightbulb, lesson.steps.shortcut],
    ['จุดลวง', ShieldAlert, lesson.steps.commonTrap],
    ['ลองทำ', Target, 'อ่านตัวอย่าง แล้วเข้า Skill Drill เพื่อฝึกโจทย์จากคลังจริง'],
  ] as const;

  return (
    <div className="tutor-library-shell">
      <main className="tutor-stage flex min-h-screen flex-col justify-center">
        <header className="tutor-crest-header relative z-10">
          <button onClick={onBack} className="tutor-back-button"><ArrowLeft className="h-5 w-5" /> หัวข้ออื่น</button>
          <div className="text-center">
            <h1 className="tutor-title">{title}</h1>
            <p className="tutor-subtitle mt-2">ก่อนเข้าโจทย์จริง นักเรียนจะเห็นแก่นความคิด สูตรลัด จุดลวง และตัวอย่างทีละขั้น</p>
          </div>
          <div className="tutor-blue-ribbon justify-self-center px-4 py-2 text-sm font-black"><Clock3 className="mr-2 inline h-4 w-4" /> {lesson.targetMinutes} นาที</div>
        </header>

        <section className="tutor-book-panel relative z-10 mt-5 overflow-hidden p-5 md:p-8 lg:p-10">
          <img src="/ui/arctic-library/crystal-crest.png" alt="" aria-hidden="true" className="mx-auto mb-2 h-16 w-16 object-contain" />
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-[#09245d] md:text-4xl">เส้นทางบทเรียน {lesson.stageId}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-700 md:text-base">เลือกเริ่มเมื่อพร้อม ระบบจะพาไปห้อง Tutor แบบ 6 ขั้นตอน โดยยังใช้เนื้อหาบทเรียนและโจทย์ชุดเดิมทั้งหมด</p>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {sections.map(([name, Icon, copy]) => (
              <article key={name} className="tutor-parchment-panel p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-inner"><Icon className="h-6 w-6" /></span>
                  <div>
                    <h3 className="text-lg font-black text-[#09245d]">{name}</h3>
                    <p className="mt-1 line-clamp-3 text-sm font-semibold leading-6 text-slate-700">{copy}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button onClick={onStart} className="tutor-gold-button mx-auto mt-7 flex w-full max-w-xl text-lg"><GraduationCap className="h-6 w-6" /> เริ่มเข้าห้อง Tutor <ArrowRight className="h-5 w-5" /></button>
        </section>
      </main>
    </div>
  );
};
