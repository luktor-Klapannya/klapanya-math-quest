import React, { useState } from 'react';
import { authService } from '../../services/auth-service';
import { UserSession } from '../../types/auth';
import { UserRole } from '../../auth/types';
import { authSession } from '../../auth/session';
import { 
  GraduationCap, 
  Sparkles, 
  ArrowLeft,
  Lock,
  User,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { GLASS_TOKENS } from '../tokens/glassTokens';

interface LoginScreenProps {
  mode?: 'STUDENT' | 'TEACHER' | 'ALL';
  initialRole?: UserRole;
  lockRole?: boolean;
  onLoginSuccess: (session: UserSession) => void;
  onBackToLanding: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  mode = 'STUDENT', 
  initialRole,
  lockRole = false,
  onLoginSuccess,
  onBackToLanding
}) => {
  const isRealAuth = authSession.getAdapterMode() === 'supabase';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeRole, setActiveRole] = useState<UserRole>(
    initialRole || (mode === 'TEACHER' ? 'PROFESSOR' : 'LEARNER')
  );

  const [userName, setUserName] = useState<string>(
    activeRole === 'PROFESSOR' ? 'คุณครูปัญญา วิชาการ' : 'น้องกล้าหาญ (Alex)'
  );
  const [userCode, setUserCode] = useState<string>(
    activeRole === 'PROFESSOR' ? 'PROF001' : 'G6001'
  );
  
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setLoginError('');
    if (role === 'PROFESSOR') {
      setUserName('คุณครูปัญญา วิชาการ');
      setUserCode('PROF001');
    } else {
      setUserName('น้องกล้าหาญ (Alex)');
      setUserCode('G6001');
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await authService.loginWithCredentials(userName, userCode, activeRole,
        isRealAuth ? { email, password } : undefined);
      if (res.success && res.user) {
        const session = authService.getCurrentSession();
        if (session) {
          onLoginSuccess(session);
        }
      } else {
        setLoginError(res.error || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล');
      }
    } catch (err) {
      setLoginError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const isProfessor = activeRole === 'PROFESSOR';

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8 flex flex-col justify-center items-center text-slate-100 font-sans select-none relative overflow-x-hidden">
      {/* 1. LAYER 1: APPROVED LOGIN BACKGROUND WORLD ART (z-0) */}
      <picture className="fixed inset-0 w-full h-full pointer-events-none z-0 select-none">
        <source media="(min-width: 768px)" srcSet="/backgrounds/portal/login_desktop.jpg" />
        <img
          src="/backgrounds/portal/login_mobile.jpg"
          alt="Login Gateway"
          aria-hidden="true"
          className="w-full h-full object-cover object-center pointer-events-none select-none"
        />
      </picture>

      {/* 2. LAYER 2: RESTRAINED ATMOSPHERE OVERLAY (<= 15% Dimming) (z-10) */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#020617]/25 via-transparent to-[#020617]/35 pointer-events-none z-10" />
      <div className="fixed top-0 left-1/4 right-1/4 h-56 bg-gradient-to-r from-blue-600/10 via-cyan-400/15 to-amber-500/10 blur-3xl pointer-events-none z-10 animate-pulse" />

      {/* 3. LAYER 3: INTERACTIVE REACT UI OVERLAYS (z-30) */}
      <div className="relative z-30 w-full flex flex-col items-center">
        {/* Top Left Back to Landing Button */}
        <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="px-4 py-2 rounded-full bg-slate-950/80 hover:bg-cyan-950/80 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-bold border border-slate-700/80 hover:border-cyan-400 transition-all shadow-glass-crystal min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>หน้าหลัก (Portal Home)</span>
        </button>

        <span className="text-[11px] text-amber-300 font-mono font-bold">
          learn.klapanya.ac.th
        </span>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6 max-w-md space-y-2 select-none">
        <div className="w-14 h-14 rounded-full bg-slate-950 border-2 border-amber-400 p-1 shadow-[0_0_20px_rgba(251,191,36,0.3)] mx-auto flex items-center justify-center">
          <img src="/brand/seal.png" alt="School Seal" className="w-full h-full object-contain" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/60 border border-amber-400/40 text-amber-300 text-[10px] font-black shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>THE WISDOM ACADEMY SCHOOL</span>
        </div>

        <h1 className="text-xl md:text-2xl font-serif font-black text-white leading-tight">
          {activeRole==='ADMIN'?'เข้าสู่ระบบผู้ดูแลเกม':isProfessor ? 'ห้องพักครู & แผงจัดการเรียนรู้' : 'เข้าสู่ระบบผู้กล้า (Learner Login)'}
        </h1>

        <p className="text-xs text-slate-300">
          {isProfessor
            ? 'Professor Management & Analytics Portal (ห้องเรียน ป.6)'
            : 'Frozen Arctic Territory • ระบบเตรียมสอบเข้า ม.1'}
        </p>
      </div>

      {/* Main Glass Login Card */}
      <div className={`academy-glass rounded-3xl p-6 md:p-8 w-full max-w-md border-2 shadow-2xl transition-all duration-300 ${
        isProfessor ? 'border-amber-400/80 shadow-[0_0_40px_rgba(234,179,8,0.25)]' : 'border-cyan-400/80 shadow-[0_0_40px_rgba(0,240,255,0.25)]'
      }`}>
        
        {/* Role Switcher Tabs */}
        {!lockRole && <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('LEARNER')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeRole==='LEARNER'
                ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>นักเรียน (Learner)</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('PROFESSOR')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              isProfessor
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-glow-gold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>ครูผู้สอน (Professor)</span>
          </button>
          {isRealAuth&&<button type="button" onClick={()=>handleRoleChange('ADMIN')} className={`flex-1 min-h-[44px] rounded-xl px-2 text-xs font-bold ${activeRole==='ADMIN'?'bg-amber-400 text-slate-950':'text-slate-300'}`}>ผู้ดูแลเกม</button>}
        </div>}

        {/* Login Error Notification */}
        {loginError && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs font-bold flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Form Inputs: USER NAME + CODE */}
        <form onSubmit={handleLogin} className="space-y-4">
          {isRealAuth ? (
            <>
              <label className="block text-xs font-bold text-slate-300">
                อีเมลบัญชีเกม
                <input type="email" autoComplete="username" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  className="mt-1.5 w-full px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-700 focus:ring-2 focus:ring-cyan-400 text-white text-sm" />
              </label>
              <label className="block text-xs font-bold text-slate-300">
                รหัสผ่าน
                <input type="password" autoComplete="current-password" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="mt-1.5 w-full px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-700 focus:ring-2 focus:ring-cyan-400 text-white text-sm" />
              </label>
            </>
          ) : (
          <>
          <p className="text-xs text-amber-300">โหมดสาธิต — ไม่ใช่บัญชีนักเรียนจริง</p>
          
          {/* Field 1: USER NAME */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isProfessor ? 'ชื่อ-นามสกุลคุณครู (Full Name)' : 'ชื่อผู้กล้า / ชื่อเล่นนักเรียน (User Name)'}</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={isProfessor ? 'ระบุชื่อคุณครูผู้สอน...' : 'ระบุชื่อผู้กล้า...'}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white text-sm outline-none transition-all"
              required
            />
          </div>

          {/* Field 2: USER CODE (e.g. G6001, PROF001) */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>{isProfessor ? 'รหัสประจำตัวครู (Professor Code)' : 'รหัสนักเรียนประจำตัว (Student Code / G-Code)'}</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {isProfessor ? 'เช่น PROF001' : 'เช่น G6001'}
              </span>
            </div>
            <input
              type="text"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder={isProfessor ? 'เช่น PROF001' : 'เช่น G6001'}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-amber-200 font-mono font-bold text-sm outline-none transition-all"
              required
            />
          </div>

          {/* Seed Fast Track Help */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>💡 บัญชีทดสอบระบบ:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setUserName('น้องกล้าหาญ (Alex)'); setUserCode('G6001'); setActiveRole('LEARNER'); }}
                className="text-cyan-400 hover:underline font-bold"
              >
                G6001
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => { setUserName('คุณครูปัญญา วิชาการ'); setUserCode('PROF001'); setActiveRole('PROFESSOR'); }}
                className="text-amber-400 hover:underline font-bold"
              >
                PROF001
              </button>
            </div>
          </div>

          </>
          )}
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg min-h-[48px] ${
              isProfessor
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 shadow-glow-gold'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 shadow-glow-cyan'
            }`}
          >
            {isLoading ? (
              <span>กำลังยืนยันตัวตน...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>{isProfessor ? 'เข้าสู่ห้องจัดการเรียนรู้ (Enter Portal)' : 'เข้าสู่ดินแดนการเรียนรู้ (Enter World)'}</span>
              </>
            )}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};
