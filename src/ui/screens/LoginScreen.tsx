import React, { useState } from 'react';
import { authService } from '../../services/auth-service';
import { UserSession } from '../../types/auth';
import { 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Shield, 
  UserCheck, 
  ArrowRight, 
  Compass, 
  CheckCircle2 
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'TEACHER' | 'REVIEWER'>('STUDENT');
  const [studentName, setStudentName] = useState<string>('น้องกล้าหาญ (Alex)');
  const [classRoomId, setClassRoomId] = useState<string>('P6-1');
  const [teacherName, setTeacherName] = useState<string>('คุณครูปัญญา วิชาการ');
  const [schoolName, setSchoolName] = useState<string>('Klapanya Math Academy');

  const handleStudentLogin = async () => {
    const session = await authService.loginAsStudent(studentName, classRoomId);
    onLoginSuccess(session);
  };

  const handleTeacherLogin = async () => {
    const session = await authService.loginAsTeacher(teacherName, schoolName);
    onLoginSuccess(session);
  };

  const handleReviewerLogin = async () => {
    const session = await authService.loginAsReviewer();
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-center items-center text-slate-100 font-sans select-none">
      
      {/* Brand Header */}
      <div className="text-center mb-6 max-w-md">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 text-xs font-black shadow-glow-cyan mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>KLAPANYA MATH ADMISSION QUEST</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
          เตรียมสอบเข้า ม.1 พิชิตดินแดนเหมันต์
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          ระบบการเรียนรู้และฝึกทำโจทย์คณิตศาสตร์ ป.6 $\to$ ม.1 (710 ข้อมาตรฐาน)
        </p>
      </div>

      {/* Main Login Card */}
      <div className="frost-card rounded-3xl p-6 md:p-8 w-full max-w-md border-2 border-cyan-400 shadow-glow-cyan">
        
        {/* Role Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'STUDENT'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> นักเรียน
          </button>

          <button
            onClick={() => setActiveTab('TEACHER')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'TEACHER'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> คุณครู
          </button>

          <button
            onClick={() => setActiveTab('REVIEWER')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'REVIEWER'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" /> ตรวจสอบ
          </button>
        </div>

        {/* TAB 1: Student Login */}
        {activeTab === 'STUDENT' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ชื่อผู้กล้า / รหัสนักเรียน:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="ระบุชื่อนักเรียน"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ห้องเรียน (Classroom ID):
              </label>
              <select
                value={classRoomId}
                onChange={(e) => setClassRoomId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="P6-1">ห้อง ป.6/1 (ห้องคณิตเข้มข้น)</option>
                <option value="P6-2">ห้อง ป.6/2 (ห้องเตรียมสอบเข้า ม.1)</option>
                <option value="P6-VIP">ห้อง ป.6/VIP (กิฟต์เต็ด/สสวท.)</option>
              </select>
            </div>

            <button
              onClick={handleStudentLogin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-glow-cyan flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all"
            >
              <span>เข้าสู่การผจญภัย (Enter Student Quest)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Student Pill */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1.5">เข้าเล่นทันทีด้วยโปรไฟล์ตัวอย่าง:</span>
              <button
                onClick={() => {
                  setStudentName('น้องกล้าหาญ (Alex)');
                  setClassRoomId('P6-1');
                  handleStudentLogin();
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 transition-all"
              >
                <span>⚡ น้องกล้าหาญ ป.6/1 (Level 3 Adept)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Teacher Login */}
        {activeTab === 'TEACHER' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ชื่ออาจารย์ผู้สอน:
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="ระบุชื่ออาจารย์"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                สถาบันการศึกษา / โรงเรียน:
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="ระบุชื่อโรงเรียน"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleTeacherLogin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-glow-gold flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all"
            >
              <span>เข้าสู่ระบบแดชบอร์ดคุณครู (Teacher Portal)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Teacher Pill */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1.5">เข้าสู่ระบบคุณครูตัวอย่าง:</span>
              <button
                onClick={() => {
                  setTeacherName('คุณครูปัญญา วิชาการ');
                  setSchoolName('Klapanya Math Academy');
                  handleTeacherLogin();
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 flex items-center justify-center gap-2 transition-all"
              >
                <span>👨‍🏫 ครูปัญญา (ดูแล 3 ห้องเรียน / 96 นักเรียน)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Reviewer Mode */}
        {activeTab === 'REVIEWER' && (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-400/60 text-left space-y-1 text-xs">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> โหมดผู้ตรวจประเมินระบบ (Auditor / Dev)
              </span>
              <p className="text-slate-300">
                เข้าถึง Review Hub และปลดล็อกทุกด่าน อาวุธ สกิล และ Top Form เพื่อการตรวจสอบ
              </p>
            </div>

            <button
              onClick={handleReviewerLogin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all"
            >
              <span>เปิดโหมดผู้ตรวจประเมิน (Open Reviewer Hub)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-6 text-center text-xs text-slate-400">
        <span>© 2026 Klapanya Math Quest • Frozen Arctic Edition • E-Learning Platform</span>
      </footer>
    </div>
  );
};
