import React, { useState } from 'react';
import { BarChart3, BookOpen, ChevronRight, ClipboardList, LogOut, RadioTower, Search, ShieldCheck, Swords, Users } from 'lucide-react';
import { TeacherSession } from '../../types/auth';
import { authSession } from '../../auth/session';
import { assignmentService } from '../../services/assignment-service';
import { PersistedProgressHome } from '../components/PersistedProgressHome';
import { TeacherGuideModal } from '../modals/TeacherGuideModal';

interface Props {
  session: TeacherSession;
  onOpenAssignments: () => void;
  onOpenBattleLobby: () => void;
  onOpenBattleConsole: () => void;
  onLogout: () => void;
}

export const TeacherHomeScreen: React.FC<Props> = ({ session, onOpenAssignments, onOpenBattleLobby, onOpenBattleConsole, onLogout }) => {
  const realMode = authSession.getAdapterMode() === 'supabase';
  const classOptions = (session.assignedClasses?.length ? session.assignedClasses : ['P6-1', 'P6-2', 'P6-VIP']).map((label) => ({ label, id: label.match(/^\S+/)?.[0] || label }));
  const [selectedClass, setSelectedClass] = useState(classOptions[0]?.id || 'P6-1');
  const [query, setQuery] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const reports = realMode ? [] : assignmentService.getStudentProgressReports().filter((student) => student.studentName.toLowerCase().includes(query.toLowerCase()));
  const selectedStudent = reports.find((student) => student.studentId === selectedStudentId);
  const averageAccuracy = reports.length ? Math.round(reports.reduce((sum, student) => sum + student.averageAccuracy, 0) / reports.length) : 0;

  return <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 p-4 text-slate-100 md:p-7">
    <picture className="fixed inset-0 -z-10" aria-hidden="true"><source media="(min-width:768px)" srcSet="/backgrounds/hubs/teacher-hub-desktop.png"/><img src="/backgrounds/hubs/teacher-hub-mobile.png" alt="" onError={(event) => { event.currentTarget.parentElement?.remove(); }} className="h-full w-full object-cover opacity-40" /></picture>
    <div className="fixed inset-0 -z-10 bg-slate-950/40" aria-hidden="true" />
    <div className="mx-auto max-w-6xl space-y-4">
      <header className="frost-card flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-400/50 p-4 md:p-5">
        <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400 bg-amber-950 text-2xl">👨‍🏫</span><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Teacher Game View</p><h1 className="text-lg font-black text-white md:text-2xl">สวัสดี {session.teacherName}</h1><p className="text-xs text-slate-400">ดูความก้าวหน้าจากการเล่นเกมของนักเรียน</p></div></div>
        <div className="flex items-center gap-2"><button onClick={() => setShowGuide(true)} className="flex min-h-11 items-center gap-2 rounded-xl bg-cyan-600 px-4 text-sm font-black text-white"><BookOpen className="h-4 w-4" /> Guide</button><button onClick={onLogout} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-950/70" aria-label="ออกจากระบบ"><LogOut className="h-4 w-4" /></button></div>
      </header>

      <nav aria-label="Teacher game actions" className="grid gap-3 sm:grid-cols-3">
        <button onClick={onOpenAssignments} className="frost-card flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-cyan-400/50 px-4 font-black text-cyan-100"><ClipboardList className="h-5 w-5" /> Teacher Assignments</button>
        <button onClick={onOpenBattleLobby} className="frost-card flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-amber-400/50 px-4 font-black text-amber-100"><Swords className="h-5 w-5" /> Classroom Battle</button>
        <button onClick={onOpenBattleConsole} className="frost-card flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-violet-400/50 px-4 font-black text-violet-100"><RadioTower className="h-5 w-5" /> Battle Console</button>
      </nav>

      <section className="frost-card rounded-3xl border border-cyan-400/40 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-cyan-300">Student Progress</p><h2 className="text-xl font-black text-white">ความก้าวหน้าของนักเรียน</h2></div><label className="flex items-center gap-2 text-xs font-bold text-slate-300">ห้องเรียน<select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} className="min-h-11 rounded-xl border border-cyan-400/50 bg-slate-950 px-3 text-white">{classOptions.map(({id,label}) => <option key={id} value={id}>{label}</option>)}</select></label></div>
      </section>

      {realMode ? <PersistedProgressHome key={`${session.userId}:${selectedClass}`} owner={session.userId} teacher /> : <>
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3"><div className="frost-card rounded-2xl border border-slate-700 p-4"><Users className="h-5 w-5 text-cyan-300" /><p className="mt-3 text-2xl font-black">{reports.length}</p><p className="text-xs text-slate-400">นักเรียนที่มีข้อมูลเกม</p></div><div className="frost-card rounded-2xl border border-slate-700 p-4"><BarChart3 className="h-5 w-5 text-emerald-300" /><p className="mt-3 text-2xl font-black">{averageAccuracy}%</p><p className="text-xs text-slate-400">ความแม่นยำเฉลี่ย</p></div><div className="frost-card col-span-2 rounded-2xl border border-slate-700 p-4 md:col-span-1"><ShieldCheck className="h-5 w-5 text-amber-300" /><p className="mt-3 text-sm font-black">ข้อมูลจาก Game Progress</p><p className="text-xs text-slate-400">ไม่รวมคะแนนจากระบบโรงเรียน</p></div></section>
        <section className="frost-card rounded-3xl border border-slate-700 p-4 md:p-5"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-4"><h2 className="font-black text-white">รายชื่อนักเรียน · {selectedClass}</h2><label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหานักเรียน" className="w-40 bg-transparent text-sm outline-none" /></label></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs text-slate-400"><tr><th className="p-3">นักเรียน</th><th>ด่านที่ผ่าน</th><th>Accuracy</th><th>จุดที่ควรเสริม</th><th>เข้าเล่นล่าสุด</th><th /></tr></thead><tbody className="divide-y divide-slate-800">{reports.map((student) => <tr key={student.studentId} className="hover:bg-slate-900/50"><td className="p-3 font-bold text-white">{student.studentName}</td><td>{student.clearedStagesCount} ด่าน</td><td className="font-black text-emerald-300">{student.averageAccuracy}%</td><td className="text-rose-200">{student.topWeakSkill}</td><td className="text-slate-400">{student.lastActiveDate}</td><td><button onClick={() => setSelectedStudentId(student.studentId)} className="flex min-h-10 items-center gap-1 rounded-xl border border-cyan-400/50 px-3 text-xs font-black text-cyan-200">ดู Progress <ChevronRight className="h-4 w-4" /></button></td></tr>)}</tbody></table></div></section>
      </>}
    </div>
    <TeacherGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    {selectedStudent && <div className="fixed inset-0 z-40 flex items-center justify-end bg-slate-950/70" onClick={() => setSelectedStudentId(null)}><aside className="h-full w-full max-w-md overflow-y-auto border-l border-cyan-400/50 bg-slate-950 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><button onClick={() => setSelectedStudentId(null)} className="float-right h-11 w-11 rounded-xl bg-slate-900" aria-label="ปิด">×</button><p className="text-xs font-black uppercase tracking-wider text-cyan-300">Student Progress</p><h2 className="mt-2 pr-12 text-2xl font-black text-white">{selectedStudent.studentName}</h2><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-900 p-4"><p className="text-2xl font-black text-cyan-300">{selectedStudent.clearedStagesCount}</p><p className="text-xs text-slate-400">ด่านที่ผ่าน</p></div><div className="rounded-2xl bg-slate-900 p-4"><p className="text-2xl font-black text-emerald-300">{selectedStudent.averageAccuracy}%</p><p className="text-xs text-slate-400">Accuracy</p></div></div><div className="mt-4 space-y-3 rounded-2xl border border-slate-700 p-4 text-sm"><p><span className="text-slate-400">Rank:</span> {selectedStudent.rank}</p><p><span className="text-slate-400">ทำได้ดี:</span> <span className="text-emerald-200">{selectedStudent.topMasteredSkill}</span></p><p><span className="text-slate-400">ควรเสริม:</span> <span className="text-rose-200">{selectedStudent.topWeakSkill}</span></p><p><span className="text-slate-400">เวลาฝึกรวม:</span> {selectedStudent.totalTimeMinutes} นาที</p><p><span className="text-slate-400">เข้าเล่นล่าสุด:</span> {selectedStudent.lastActiveDate}</p></div></aside></div>}
  </div>;
};
