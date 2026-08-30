import React, { useState } from 'react';
import { TeacherSession } from '../../types/auth';
import { Assignment, AssignmentType } from '../../types/assignment';
import { assignmentService } from '../../services/assignment-service';
import { 
  BookOpen, 
  PlusCircle, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Compass, 
  Play, 
  Calendar, 
  LogOut, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface TeacherHomeScreenProps {
  session: TeacherSession;
  onPreviewStage: (stageId: string) => void;
  onPreviewTutor: (stageId: string) => void;
  onOpenLiveBattleConsole: (roomCode?: string) => void;
  onOpenReviewHub: () => void;
  onLogout: () => void;
}

export const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({
  session,
  onPreviewStage,
  onPreviewTutor,
  onOpenLiveBattleConsole,
  onOpenReviewHub,
  onLogout,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('P6-1');
  const [assignments, setAssignments] = useState<Assignment[]>(assignmentService.getAssignments('P6-1'));
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);

  // Form State
  const [asgType, setAsgType] = useState<AssignmentType>('TUTOR');
  const [asgTitle, setAsgTitle] = useState<string>('');
  const [asgStageId, setAsgStageId] = useState<string>('D1');
  const [asgDueDate, setAsgDueDate] = useState<string>('2026-09-08');

  const studentReports = assignmentService.getStudentProgressReports();

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const created = assignmentService.addAssignment({
      teacherId: session.userId,
      teacherName: session.teacherName,
      targetClassRoomId: selectedClass,
      subjectId: 'MATH',
      territoryId: 'FROZEN_ARCTIC',
      assignmentType: asgType,
      title: asgTitle || (asgType === 'TUTOR' ? `ติวเข้มบทเรียน ${asgStageId}` : `การบ้านด่าน ${asgStageId}`),
      description: `การบ้านที่มอบหมายสำหรับนักเรียนห้อง ${selectedClass}`,
      targetStageId: asgStageId,
      dueDate: asgDueDate,
      status: 'ASSIGNED',
    });
    setAssignments([created, ...assignments]);
    setShowAssignModal(false);
    setAsgTitle('');
  };

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 text-slate-100 font-sans select-none max-w-6xl mx-auto space-y-6">
      
      {/* Top Header */}
      <header className="frost-card rounded-2xl p-4 md:p-6 border-2 border-amber-400/80 shadow-glow-gold flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-400 flex items-center justify-center text-3xl shadow-glow-gold">
            👨‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase">
                TEACHER PORTAL & CLASS MANAGEMENT
              </span>
              <span className="text-xs text-slate-400">• {session.schoolName}</span>
            </div>
            <h1 className="text-base md:text-xl font-black text-white">{session.teacherName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenLiveBattleConsole('ICE710')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-glow-gold flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
          >
            <span>⚔️ แผงควบคุมประลองสด (Battle Console)</span>
          </button>

          <button
            onClick={onOpenReviewHub}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
          >
            <Compass className="w-4 h-4" /> เปิด Review Hub
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" /> ออกจากระบบ
          </button>
        </div>
      </header>

      {/* Classroom Selection & Quick Analytics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="frost-card rounded-2xl p-4 border border-slate-700">
          <span className="text-xs text-slate-400">เลือกห้องเรียน:</span>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setAssignments(assignmentService.getAssignments(e.target.value));
            }}
            className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
          >
            <option value="P6-1">ห้อง ป.6/1 (32 คน)</option>
            <option value="P6-2">ห้อง ป.6/2 (30 คน)</option>
            <option value="P6-VIP">ห้อง ป.6/VIP (25 คน)</option>
          </select>
        </div>

        <div className="frost-card rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">อัตราการส่งงานเฉลี่ย:</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5">82.5%</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="frost-card rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">ความแม่นยำเฉลี่ย (Accuracy):</span>
            <div className="text-lg font-black text-cyan-300 mt-0.5">88.6%</div>
          </div>
          <BarChart3 className="w-6 h-6 text-cyan-400" />
        </div>

        <div className="frost-card rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">ทักษะที่ควรเสริมด่วน:</span>
            <div className="text-xs font-black text-rose-300 mt-0.5 truncate">โจทย์เรขาคณิต 3D</div>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>
      </section>

      {/* Assignment Management Section */}
      <section className="frost-card rounded-3xl p-5 md:p-6 border border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm md:text-base font-black text-white">
              รายการการบ้านและบทเรียนที่มอบหมาย (Assigned Tasks)
            </h2>
          </div>

          <button
            onClick={() => setShowAssignModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-glow-gold flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> สั่งการบ้าน / มอบหมายบทเรียน
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {assignments.map((asg) => (
            <div key={asg.id} className="p-4 rounded-2xl bg-arctic-950 border border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-amber-500/30">
                    {asg.assignmentType}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">ส่ง: {asg.dueDate}</span>
                </div>
                <h3 className="text-xs font-black text-white">{asg.title}</h3>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{asg.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">ส่งแล้ว {asg.completedStudentsCount || 20}/{asg.totalStudentsCount || 32} คน</span>
                <button
                  onClick={() => asg.assignmentType === 'TUTOR' ? onPreviewTutor(asg.targetStageId) : onPreviewStage(asg.targetStageId)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-900 text-cyan-300 font-bold text-[11px] flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-cyan-300" /> พรีวิวด่าน
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Roster & Progress Table */}
      <section className="frost-card rounded-3xl p-5 md:p-6 border border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm md:text-base font-black text-white">
              รายชื่อนักเรียนและรายงานผลการเรียนรู้รายบุคคล (Student Skill DNA)
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="pb-2">ชื่อนักเรียน</th>
                <th className="pb-2">คลาสฮีโร่</th>
                <th className="pb-2">ระดับ Rank</th>
                <th className="pb-2 text-center">ด่านที่เคลียร์</th>
                <th className="pb-2 text-center">ความแม่นยำ</th>
                <th className="pb-2">จุดอ่อนที่ต้องซ่อม</th>
                <th className="pb-2">ใช้งานล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold">
              {studentReports.map((std) => (
                <tr key={std.studentId} className="hover:bg-slate-900/50">
                  <td className="py-3 font-bold text-white flex items-center gap-2">
                    <span className="text-lg">🧙‍♂️</span>
                    <span>{std.studentName}</span>
                  </td>
                  <td className="py-3 text-cyan-300">{std.heroId}</td>
                  <td className="py-3 text-amber-300">{std.rank}</td>
                  <td className="py-3 text-center">{std.clearedStagesCount} / 25 ด่าน</td>
                  <td className="py-3 text-center font-mono font-bold text-emerald-400">{std.averageAccuracy}%</td>
                  <td className="py-3 text-rose-300 truncate max-w-[150px]">{std.topWeakSkill}</td>
                  <td className="py-3 text-slate-400">{std.lastActiveDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Create Assignment */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="frost-card rounded-3xl p-6 w-full max-w-md border-2 border-amber-400 shadow-glow-gold space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-400" /> มอบหมายการบ้าน / บทเรียนใหม่
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-300 mb-1">ประเภทงาน:</label>
                <select
                  value={asgType}
                  onChange={(e) => setAsgType(e.target.value as AssignmentType)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="TUTOR">📖 ห้องติวเข้ม 7 ขั้นตอน (Tutor Room)</option>
                  <option value="DRILL">⚡ ดริลล์ฝึกฝนเฉพาะทักษะ (Skill Drill)</option>
                  <option value="STAGE">⚔️ ด่านผจญภัยปกติ (Stage Adventure)</option>
                  <option value="DAILY_QUEST">🔥 เควสต์ฝึกฝนประจำวัน (Daily Quest)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">ด่านเป้าหมาย:</label>
                <select
                  value={asgStageId}
                  onChange={(e) => setAsgStageId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="D1">D1: ค่าประจำหลักและการคำนวณ</option>
                  <option value="D2">D2: ตัวประกอบเฉพาะและ ห.ร.ม./ค.ร.น.</option>
                  <option value="D3">D3: เศษส่วนและทศนิยม</option>
                  <option value="D4">D4: อัตราส่วนและร้อยละ</option>
                  <option value="D5">D5: สมการและโจทย์ปัญหา</option>
                  <option value="D6">D6: เรขาคณิต 2D/3D และพื้นที่ผิว</option>
                  <option value="ONET-1">ONET-1: พื้นฐานข้อสอบ สทศ.</option>
                  <option value="ONET-2">ONET-2: ข้อสอบพัฒนาทักษะ</option>
                  <option value="ONET-3">ONET-3: ข้อสอบความพร้อมมาตรฐาน</option>
                  <option value="ONET-4">ONET-4: ข้อสอบระดับยอดฝีมือ</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">ชื่อหัวข้อการบ้าน (กำหนดเอง):</label>
                <input
                  type="text"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="เช่น ติวเข้มสมการก่อนสอบย่อย"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">วันครบกำหนดส่ง (Due Date):</label>
                <input
                  type="date"
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md"
                >
                  ยืนยันมอบหมาย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
