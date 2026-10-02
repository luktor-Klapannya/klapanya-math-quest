import React, { useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, Calendar, CheckCircle2, ChevronRight, ClipboardList, Clock3, Plus, Search, Users, X } from 'lucide-react';
import { TeacherSession } from '../../types/auth';
import { Assignment, AssignmentType } from '../../types/assignment';
import { assignmentService } from '../../services/assignment-service';

interface Props {
  session: TeacherSession;
  onBack: () => void;
  onPreviewStage: (stageId: string) => void;
  onPreviewTutor: (stageId: string) => void;
}

const fallbackClasses = ['P6-1', 'P6-2', 'P6-VIP'];

export const TeacherAssignmentsScreen: React.FC<Props> = ({ session, onBack, onPreviewStage, onPreviewTutor }) => {
  const classes = (session.assignedClasses?.length ? session.assignedClasses : fallbackClasses).map((label) => ({ label, id: label.match(/^\S+/)?.[0] || label }));
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || 'P6-1');
  const [assignments, setAssignments] = useState(() => assignmentService.getAssignments(classes[0]?.id || 'P6-1'));
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [type, setType] = useState<AssignmentType>('TUTOR');
  const [stageId, setStageId] = useState('D1');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-09-15');
  const visible = useMemo(() => assignments.filter((a) => `${a.title} ${a.description}`.toLowerCase().includes(query.toLowerCase())), [assignments, query]);
  const submitted = assignments.reduce((sum, a) => sum + (a.completedStudentsCount || 0), 0);
  const total = assignments.reduce((sum, a) => sum + (a.totalStudentsCount || 0), 0);

  const changeClass = (id: string) => { setSelectedClass(id); setAssignments(assignmentService.getAssignments(id)); };
  const createAssignment = (event: React.FormEvent) => {
    event.preventDefault();
    const created = assignmentService.addAssignment({ teacherId: session.userId, teacherName: session.teacherName, targetClassRoomId: selectedClass, subjectId: 'MATH', territoryId: 'FROZEN_ARCTIC', assignmentType: type, title: title || `${type === 'TUTOR' ? 'ติวพิเศษ' : 'แบบฝึก'} ${stageId}`, description: `งานฝึกคณิตศาสตร์สำหรับห้อง ${selectedClass}`, targetStageId: stageId, dueDate, status: 'ASSIGNED' });
    setAssignments((items) => [created, ...items]); setTitle(''); setShowCreate(false);
  };

  return <div className="student-world-home min-h-screen bg-slate-950 p-4 text-slate-100 md:p-7">
    <div className="mx-auto max-w-7xl">
      <header className="frost-card flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-400/50 p-4 md:p-5">
        <div className="flex items-center gap-3"><button onClick={onBack} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-950/70" aria-label="กลับ"><ArrowLeft className="h-5 w-5" /></button><div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">Teacher · Game Assignment</p><h1 className="text-xl font-black text-white md:text-2xl">งานที่มอบหมาย</h1><p className="text-xs text-slate-400">{session.teacherName} · Mathematics</p></div></div>
        <div className="flex items-center gap-2"><select value={selectedClass} onChange={(e) => changeClass(e.target.value)} className="min-h-11 rounded-xl border border-cyan-400/50 bg-slate-950 px-3 font-bold text-white">{classes.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}</select><button onClick={() => setShowCreate(true)} className="flex min-h-11 items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-black text-slate-950"><Plus className="h-4 w-4" /> สร้างงาน</button></div>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['งานทั้งหมด', assignments.length, ClipboardList, 'text-cyan-300'], ['กำลังดำเนินการ', assignments.filter(a => a.status !== 'COMPLETED').length, Clock3, 'text-amber-300'], ['เสร็จแล้ว', assignments.filter(a => a.status === 'COMPLETED').length, CheckCircle2, 'text-emerald-300'], ['อัตราส่งงาน', total ? `${Math.round(submitted / total * 100)}%` : '0%', BarChart3, 'text-violet-300']].map(([label, value, Icon, color]) => { const StatIcon = Icon as typeof ClipboardList; return <div key={String(label)} className="frost-card rounded-2xl border border-slate-700 p-4"><StatIcon className={`h-5 w-5 ${color}`} /><p className="mt-3 text-2xl font-black text-white">{String(value)}</p><p className="text-xs text-slate-400">{String(label)}</p></div>; })}
      </section>

      <main className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
        <section className="frost-card rounded-3xl border border-slate-700 p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-4"><div><p className="text-xs font-black uppercase tracking-wider text-cyan-300">Class {selectedClass}</p><h2 className="text-lg font-black text-white">รายการงานของห้อง</h2></div><label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหางาน" className="w-36 bg-transparent text-sm outline-none" /></label></div>
          <div className="mt-4 space-y-3">{visible.length === 0 && <div className="rounded-2xl border border-dashed border-slate-600 p-10 text-center text-slate-400">ยังไม่มีงานในห้องนี้</div>}{visible.map((a) => { const done = a.completedStudentsCount || 0; const count = a.totalStudentsCount || 0; const pct = count ? Math.round(done / count * 100) : 0; return <article key={a.id} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4"><div className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-center"><div><div className="flex gap-2"><span className="rounded-lg bg-cyan-500/15 px-2 py-1 text-[10px] font-black text-cyan-300">{a.assignmentType}</span><span className="flex items-center gap-1 text-[11px] text-amber-300"><Calendar className="h-3.5 w-3.5" />{a.dueDate}</span></div><h3 className="mt-2 font-black text-white">{a.title}</h3><p className="mt-1 line-clamp-1 text-xs text-slate-400">{a.description}</p></div><div><div className="flex justify-between text-xs"><span className="text-slate-400">ส่งแล้ว</span><strong>{done}/{count || '—'} คน</strong></div><div className="mt-2 h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{width:`${pct}%`}} /></div></div><button onClick={() => a.assignmentType === 'TUTOR' ? onPreviewTutor(a.targetStageId) : onPreviewStage(a.targetStageId)} className="flex min-h-11 items-center gap-1 rounded-xl border border-cyan-400/60 bg-cyan-950 px-3 text-xs font-black text-cyan-200">ดูงาน <ChevronRight className="h-4 w-4" /></button></div></article>;})}</div>
        </section>
        <aside className="frost-card h-fit rounded-3xl border border-cyan-400/40 p-5"><Users className="h-6 w-6 text-cyan-300" /><h2 className="mt-3 font-black text-white">เลือกห้องได้ทันที</h2><p className="mt-1 text-sm text-slate-400">รายการและผลส่งงานเปลี่ยนตามห้อง ครูมอบหมายเฉพาะกิจกรรมเกมที่มีอยู่แล้วใน V1</p></aside>
      </main>
    </div>

    {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"><section className="frost-card w-full max-w-lg rounded-3xl border border-amber-400/60 p-6"><div className="flex justify-between"><div><p className="text-xs font-black text-amber-300">NEW ASSIGNMENT</p><h2 className="text-2xl font-black">ส่งงานให้ {selectedClass}</h2></div><button onClick={() => setShowCreate(false)} className="h-11 w-11 rounded-xl bg-slate-900" aria-label="ปิด"><X className="mx-auto h-5 w-5" /></button></div><form onSubmit={createAssignment} className="mt-5 space-y-4 text-sm">{[['ประเภทงาน', type, setType, ['TUTOR','DRILL','STAGE','DAILY_QUEST']], ['ด่าน', stageId, setStageId, ['D1','D2','D3','D4','D5','D6','F1','ONET-1','ONET-2','ONET-3','ONET-4']]].map(([label,value,setter,options]) => <label key={String(label)} className="block text-slate-300">{String(label)}<select value={String(value)} onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl bg-white px-3 font-bold text-slate-900">{(options as string[]).map(o => <option key={o}>{o}</option>)}</select></label>)}<label className="block text-slate-300">ชื่องาน<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เว้นว่างเพื่อใช้ชื่ออัตโนมัติ" className="mt-1 min-h-11 w-full rounded-xl bg-white px-3 font-bold text-slate-900" /></label><label className="block text-slate-300">กำหนดส่ง<input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl bg-white px-3 font-bold text-slate-900" /></label><button className="min-h-12 w-full rounded-2xl bg-amber-400 font-black text-slate-950">ยืนยันและส่งงาน</button></form></section></div>}
  </div>;
};
