import React,{useEffect,useState} from 'react';
import { authSession } from '../../auth/session';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { classroomProgress,loadGameProgress,studentProgress } from '../../services/game-progress-report';
import type { ProgressData,StudentProgress } from '../../services/game-progress-report';

const metric=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('th-TH',{maximumFractionDigits:1}):'—';
const object=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const date=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v))?new Date(v).toLocaleString('th-TH'):'—';
function StudentEvidence({student}:{student:StudentProgress}) {
  const result=object(student.latest?.verifiedResult);
  const verified=!!student.latest?.verifiedResult;
  const state=student.verified?object(student.verified.state):{};
  const status=student.latest?.status==='STARTED'?'เริ่มแล้ว':student.latest?.status==='IN_PROGRESS'?'กำลังเล่น / ยังไม่จบรอบ':verified?'จบรอบและยืนยันแล้ว':student.latest?'รอการยืนยัน':'ยังไม่เริ่ม';
  return <section className="space-y-3" aria-label="รายละเอียดความคืบหน้า">
    <h2 className="text-lg font-bold">{student.name}</h2>
    <p>เกม: {student.latest?.campaign_id || 'Math 710Q'} · ด่านล่าสุด: {student.latest?.stage_id || 'ยังไม่มีรอบที่บันทึก'}</p>
    <p>เล่นล่าสุด: {date(student.latest?.submitted_at)}</p>
    <p>สถานะ: {status} · ข้อถูก: {metric(result.correctCount)} / {metric(result.totalQuestions)} · ความแม่นยำ: {metric(result.accuracy)}%</p>
    <p className="text-sm text-amber-200">{verified?'ผลรอบนี้ผ่านการยืนยันจากเซิร์ฟเวอร์':'คะแนนและความคืบหน้าที่ผู้เล่นส่งมายังไม่ใช่ผลยืนยัน'}</p>
    <p>XP ยืนยัน: {metric(state.xp)} · ด่านที่ผ่านการยืนยัน: {Array.isArray(state.clearedStages)?state.clearedStages.filter(x=>typeof x==='string').join(', ')||'ยังไม่มี':'—'}</p>
    <details><summary className="cursor-pointer min-h-[44px] py-2">ทักษะและความคืบหน้ารายด่าน ({student.verified?'ยืนยันแล้ว':'ยังไม่มีข้อมูลยืนยัน'})</summary>
      <dl className="grid grid-cols-2 gap-2">{Object.entries(object(state.skillMastery)).filter(([,v])=>typeof v==='number').map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{metric(v)}</dd></React.Fragment>)}</dl>
      <p className="mt-2">ความแม่นยำสูงสุดรายด่าน</p>
      <dl className="grid grid-cols-2 gap-2">{Object.entries(object(state.stageBestAccuracy)).map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{metric(v)}%</dd></React.Fragment>)}</dl>
    </details>
    <details><summary className="cursor-pointer min-h-[44px] py-2">ประวัติรอบเล่น ({student.sessions.length})</summary>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th>ด่าน</th><th>วันที่ส่ง</th><th>สถานะ</th><th>คะแนน</th><th>แม่นยำ</th></tr></thead>
        <tbody>{student.sessions.map(s=>{const r=object(s.verifiedResult);return <tr key={s.id}><td className="py-2">{s.stage_id}</td><td>{date(s.submitted_at)}</td><td>{s.verifiedResult?'จบรอบ / ยืนยันแล้ว':s.status==='STARTED'?'เริ่มแล้ว':s.status==='IN_PROGRESS'?'ยังไม่จบรอบ':s.status==='REJECTED'?'ไม่ผ่านการตรวจสอบ':'รอตรวจสอบ'}</td><td>{metric(r.correctCount)} / {metric(r.totalQuestions)}</td><td>{metric(r.accuracy)}%</td></tr>;})}</tbody></table></div>
    </details>
  </section>;
}
export function PersistedProgressHome({owner,teacher=false,onContinue,onLogout}:{owner:string;teacher?:boolean;onContinue?:()=>void;onLogout?:()=>void}) {
  const [loaded,setLoaded]=useState<{owner:string;data:ProgressData}|null>(null);
  const [error,setError]=useState('');const [refresh,setRefresh]=useState(0);
  const [selectedClass,setSelectedClass]=useState('');const [selectedStudent,setSelectedStudent]=useState('');
  useEffect(()=>{
    let cancelled=false;setLoaded(null);setError('');
    const client=getSupabaseClient();
    if(!client){setError('ยังไม่ได้ตั้งค่าข้อมูลเกม');return;}
    loadGameProgress(client,owner,()=>authSession.getCurrentUser()?.id||null).then(data=>{
      if(!cancelled){setLoaded({owner,data});setSelectedClass('');setSelectedStudent('');}
    }).catch(()=>{if(!cancelled)setError('โหลดข้อมูลไม่ได้ กรุณาเข้าสู่ระบบใหม่หรือลองอีกครั้ง');});
    return()=>{cancelled=true;};
  },[owner,refresh]);
  const data=loaded?.owner===owner?loaded.data:null;
  const classes=data?[...new Set([...data.enrollments.filter(e=>e.status==='ACTIVE'),...(data.assignments||[])].map(e=>e.classroom_id as string))].sort():[];
  const classroom=classes.includes(selectedClass)?selectedClass:classes[0]||'';
  const overview=data?classroomProgress(data,classroom):null;
  const student=data?studentProgress(data,teacher?(overview?.students.find(s=>s.id===selectedStudent)?.id||overview?.students[0]?.id||''):owner):null;
  const admin=teacher&&authSession.getCurrentUser()?.role==='ADMIN';
  return <div className="frost-card rounded-2xl p-4 md:p-6 space-y-4 text-slate-100 border border-cyan-400/40" aria-busy={!data&&!error}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-bold">{teacher?admin?'ภาพรวมระบบเกม':'ความคืบหน้าเกมในห้องเรียน':'เล่นต่อและผลล่าสุด'}</h1>
      <div className="flex gap-2"><button className="min-h-[44px] px-3 rounded bg-slate-800" onClick={()=>setRefresh(n=>n+1)}>รีเฟรชข้อมูล</button>{onLogout&&<button className="min-h-[44px] px-3 rounded bg-slate-800" onClick={onLogout}>ออกจากระบบ</button>}</div></header>
    {error?<p role="alert">{error}</p>:!data?<p role="status">กำลังโหลดข้อมูลที่บันทึกไว้…</p>:<>
      {teacher&&<>
        <p className="text-sm text-slate-300">{admin?'เฉพาะองค์กรที่คุณมีสิทธิ์ดูแล':'เฉพาะห้องเรียนและปีการศึกษาที่ได้รับมอบหมาย'}</p>
        {classes.length?<label className="block">ห้องเรียน <select aria-label="ห้องเรียน" className="min-h-[44px] rounded bg-slate-900 px-3" value={classroom} onChange={e=>{setSelectedClass(e.target.value);setSelectedStudent('');}}>{classes.map(c=><option key={c}>{c}</option>)}</select></label>:<p>ไม่พบห้องเรียนที่มีนักเรียนในขอบเขตสิทธิ์ของคุณ</p>}
        {overview&&classes.length>0&&<>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3"><p>นักเรียน<br/><strong>{overview.count}</strong></p><p>เริ่มแล้ว<br/><strong>{overview.started}</strong></p><p>มีรอบที่ยังไม่จบ<br/><strong>{overview.inProgress}</strong></p><p>จบรอบ / ยืนยันแล้ว<br/><strong>{overview.completed}</strong></p><p>แม่นยำเฉลี่ย (ยืนยัน)<br/><strong>{metric(overview.averageAccuracy)}%</strong></p></div>
          <p className="text-xs text-slate-300">นับนักเรียนไม่ซ้ำในแต่ละสถานะ นักเรียนอาจมีทั้งรอบจบและรอบค้าง; รอบค้างไม่ใช่สถานะออนไลน์ ค่าเฉลี่ยใช้เฉพาะผลยืนยัน ไม่ใช่อัตราจบแคมเปญ</p>
          <label className="block">นักเรียน <select aria-label="นักเรียน" className="min-h-[44px] rounded bg-slate-900 px-3 max-w-full" value={student?.id||''} onChange={e=>setSelectedStudent(e.target.value)}>{overview.students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        </>}
      </>}
      {student?.id&&<StudentEvidence student={student}/>}
      {onContinue&&<><button className="min-h-[44px] rounded-xl bg-cyan-400 text-slate-950 font-bold px-5" onClick={onContinue}>เล่นต่อจากความคืบหน้าที่บันทึก</button><p className="text-xs">กลับสู่แผนที่ตามความคืบหน้าที่บันทึกไว้ รอบที่ยังไม่จบจะไม่ถูกเล่นต่ออัตโนมัติ</p></>}
    </>}
  </div>;
}
