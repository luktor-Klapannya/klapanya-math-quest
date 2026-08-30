import React, { useState } from 'react';
import { PlayerProfile, HeroClassId } from '../../types';
import { StudentSession } from '../../types/auth';
import { Assignment } from '../../types/assignment';
import { assignmentService } from '../../services/assignment-service';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { AVATAR_DATABASE } from '../../progression/avatar-database';
import { getEquippedWeaponVisual } from '../../progression/weapon-visuals';
import { 
  Play, 
  BookOpen, 
  Zap, 
  ShoppingBag, 
  Scroll, 
  Calendar, 
  Award, 
  Compass, 
  Shield, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  LogOut,
  Sparkles,
  MapPin
} from 'lucide-react';

interface StudentHomeScreenProps {
  session: StudentSession;
  profile: PlayerProfile;
  onNavigateToMap: () => void;
  onNavigateToTutor: (stageId?: string) => void;
  onNavigateToDrill: (drillType?: string) => void;
  onNavigateToDailyQuest: () => void;
  onNavigateToBattle: () => void;
  onOpenCodex: () => void;
  onOpenMarket: () => void;
  onOpenInventory: () => void;
  onOpenAvatarSelect: () => void;
  onLogout: () => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  session,
  profile,
  onNavigateToMap,
  onNavigateToTutor,
  onNavigateToDrill,
  onNavigateToDailyQuest,
  onNavigateToBattle,
  onOpenCodex,
  onOpenMarket,
  onOpenInventory,
  onOpenAvatarSelect,
  onLogout,
}) => {
  const [activeBottomNav, setActiveBottomNav] = useState<'HOME' | 'MAP' | 'TUTOR' | 'BAG' | 'PROFILE'>('HOME');

  const heroClass = HERO_CLASSES[profile.heroId];
  const avatarVisual = (AVATAR_DATABASE as any)[profile.avatarVisualId || 'BOY_WIZARD'] || AVATAR_DATABASE.BOY_WIZARD;
  const equippedWeapon = getEquippedWeaponVisual(profile.equippedWeaponId, profile.heroId);

  const assignments = assignmentService.getAssignments(session.classRoomId);
  const activeAssignment = assignments[0];

  return (
    <div className="min-h-screen aurora-bg p-3 md:p-6 pb-24 text-slate-100 font-sans select-none max-w-5xl mx-auto flex flex-col justify-between">
      
      {/* Top Header & Student Info */}
      <header className="frost-card rounded-2xl p-4 mb-4 border border-cyan-400/50 shadow-glow-cyan">
        <div className="flex items-center justify-between gap-3">
          
          {/* Avatar & Class Title */}
          <div className="flex items-center gap-3">
            <div 
              onClick={onOpenAvatarSelect}
              className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-3xl shadow-glow-cyan cursor-pointer transform hover:scale-105 transition-all"
              title="คลิกเพื่อเปลี่ยนรูปลักษณ์ตัวละคร"
            >
              {avatarVisual.avatarSprite}
              <div className="absolute -bottom-1 -right-1 text-xs bg-slate-900 rounded-full border border-amber-400 p-0.5">
                {equippedWeapon.classVisual.weaponIcon}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-black text-white">{profile.heroName}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40">
                  {session.classRoomId}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span className="font-bold text-amber-300">{heroClass.name}</span>
                <span>•</span>
                <span className="text-[11px] text-cyan-400">{profile.rank}</span>
              </div>
            </div>
          </div>

          {/* Currency & Logout */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400">เหรียญทอง:</span>
              <div className="text-xs md:text-sm font-black text-amber-300">{profile.coins.toLocaleString()} 🪙</div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950 border border-slate-700 text-slate-400 hover:text-rose-300 transition-all"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Territory Status Tag */}
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-cyan-300 font-bold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> ดินแดนปัจจุบัน: ดินแดนเหมันต์ (Frozen Arctic • Math Domain)
          </span>
          <span className="text-[11px] text-slate-400">เคลียร์แล้ว {profile.clearedStages.length} ด่าน</span>
        </div>
      </header>

      {/* Main Responsive Body */}
      <main className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
        
        {/* LEFT / TOP: Continue Adventure & Assigned Quest (7 Cols on Tablet/Desktop) */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Main Play CTA: Continue Math Quest */}
          <div className="frost-card rounded-3xl p-5 md:p-6 border-2 border-cyan-400 shadow-glow-cyan relative overflow-hidden bg-gradient-to-br from-arctic-900 via-cyan-950 to-slate-950">
            <div className="relative z-10">
              <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest block mb-1">
                ADVENTURE CAMPAIGN • ด่านผจญภัยหลัก
              </span>
              <h2 className="text-lg md:text-2xl font-black text-white leading-snug mb-2">
                เดินทางต่อสู่บัลลังก์ ม.1
              </h2>
              <p className="text-xs text-slate-300 mb-4 line-clamp-2">
                ฝึกฝน 710 ข้อมาตรฐาน ทั้งโดโจฝึกซ้อม, ศาลเจ้าคิดเลขเร็ว, และปราการข้อสอบจริง O-NET
              </p>

              <button
                onClick={onNavigateToMap}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-glow-cyan flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>เปิดแผนที่ผจญภัย (Enter World Map)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assigned Work Card (Teacher Assignment) */}
          {activeAssignment && (
            <div className="frost-card rounded-2xl p-4 border border-amber-400/60 shadow-glow-gold bg-gradient-to-r from-amber-950/40 to-slate-950">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 uppercase">
                  การบ้านที่คุณครูมอบหมาย (Assigned Work)
                </span>
                <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> ส่งภายใน: {activeAssignment.dueDate}
                </span>
              </div>

              <h3 className="text-xs md:text-sm font-black text-white mb-1">
                {activeAssignment.title}
              </h3>
              <p className="text-[11px] text-slate-300 mb-3">
                {activeAssignment.description}
              </p>

              <div className="flex items-center gap-2">
                {activeAssignment.assignmentType === 'TUTOR' && (
                  <button
                    onClick={() => onNavigateToTutor(activeAssignment.targetStageId)}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> เข้าเรียนบทนี้ทันที (Start Tutor)
                  </button>
                )}
                {activeAssignment.assignmentType === 'DRILL' && (
                  <button
                    onClick={() => onNavigateToDrill('QUICK_DRILL')}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" /> เริ่มทำดริลล์ (Start Drill)
                  </button>
                )}
                {activeAssignment.assignmentType === 'STAGE' && (
                  <button
                    onClick={onNavigateToMap}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> ลุยด่านที่มอบหมาย
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Daily Training Quest Banner */}
          <div className="frost-card rounded-2xl p-4 border border-cyan-500/40 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black text-cyan-400 uppercase">DAILY TRAINING QUEST</span>
              <h4 className="text-xs md:text-sm font-black text-white">เควสต์ฝึกฝนรายวัน 15 ข้อ</h4>
              <p className="text-[11px] text-slate-300">วอร์มอัป + ติวจุดอ่อน + โจทย์ประยุกต์ (Streak x{profile.dailyQuestStreak || 1})</p>
            </div>

            <button
              onClick={onNavigateToDailyQuest}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" /> ทำเควสต์
            </button>
          </div>

          {/* Classroom Battle Card */}
          <div className="frost-card rounded-2xl p-4 border border-purple-400/60 shadow-md bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black text-purple-400 uppercase">CLASSROOM BATTLE ARENA</span>
              <h4 className="text-xs md:text-sm font-black text-white">ลานประลองสดในห้องเรียน (Live Battle)</h4>
              <p className="text-[11px] text-slate-300">ประลองความเร็ว 9–12 ผู้กล้า • ตอบถูกไวรับโบนัสสปีด</p>
            </div>

            <button
              onClick={onNavigateToBattle}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
            >
              <span>⚔️ เข้าประลอง</span>
            </button>
          </div>
        </div>

        {/* RIGHT / BOTTOM: High Priority Quick Actions & Skill DNA (5 Cols on Tablet/Desktop) */}
        <div className="md:col-span-5 space-y-4">
          
          {/* HIGH PRIORITY ACTION GRID */}
          <div className="frost-card rounded-2xl p-4 border border-slate-700">
            <span className="text-xs font-bold text-slate-300 block mb-2.5">
              ศูนย์การเรียนรู้ & เครื่องมือช่วยเหลือ (Quick Hub)
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* TUTOR ROOM (HIGH PRIORITY) */}
              <button
                onClick={() => onNavigateToTutor('D1')}
                className="p-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border-2 border-cyan-400/80 text-left flex flex-col justify-between shadow-glow-cyan transition-all transform hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold mb-1">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">ห้องติวเข้ม (Tutor)</h4>
                  <span className="text-[10px] text-cyan-300">ติว 7 ขั้นตอนลัด</span>
                </div>
              </button>

              {/* DRILL CENTER */}
              <button
                onClick={() => onNavigateToDrill()}
                className="p-3 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-left flex flex-col justify-between shadow-md transition-all transform hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold mb-1">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">ศูนย์ดริลล์ (Drill)</h4>
                  <span className="text-[10px] text-purple-300">5 โหมดฝึกสปีด</span>
                </div>
              </button>

              {/* FORMULA CODEX */}
              <button
                onClick={onOpenCodex}
                className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex flex-col justify-between transition-all transform hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-1">
                  <Scroll className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">คัมภีร์สูตรลัด</h4>
                  <span className="text-[10px] text-slate-400">12 บทเรียนสรุป</span>
                </div>
              </button>

              {/* MAGIC MARKET */}
              <button
                onClick={onOpenMarket}
                className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex flex-col justify-between transition-all transform hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-1">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">ตลาดเวทมนตร์</h4>
                  <span className="text-[10px] text-amber-300">ไอเทมตัวช่วยซ้อม</span>
                </div>
              </button>
            </div>
          </div>

          {/* Skill DNA Snapshot */}
          <div className="frost-card rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Skill DNA & ความแม่นยำ</span>
              <span className="text-[10px] text-cyan-400 font-bold">Weighted Mastery</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: 'การคำนวณ & ลำดับเลข', score: 94 },
                { name: 'สมการ & โจทย์ปัญหาอายุ', score: 88 },
                { name: 'อัตราส่วน ร้อยละ กำไรขาดทุน', score: 76 },
                { name: 'เรขาคณิต 2D/3D & ทรงกระบอก', score: 82 },
              ].map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-300 truncate">{s.name}</span>
                    <span className="font-mono font-bold text-cyan-300">{s.score}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* COMPACT BOTTOM NAVIGATION (MOBILE & TABLET) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-2 px-4 flex items-center justify-around max-w-lg mx-auto md:rounded-t-3xl md:border-x">
        <button
          onClick={() => setActiveBottomNav('HOME')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeBottomNav === 'HOME' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeBottomNav === 'HOME' ? 'bg-cyan-950 border border-cyan-400/50' : ''}`}>
            🏠
          </div>
          <span>หน้าหลัก</span>
        </button>

        <button
          onClick={onNavigateToMap}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400 hover:text-white"
        >
          <div className="p-1 rounded-xl">🗺️</div>
          <span>แผนที่</span>
        </button>

        {/* HIGH PRIORITY TUTOR TAB */}
        <button
          onClick={() => onNavigateToTutor('D1')}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-cyan-300"
        >
          <div className="p-1 rounded-xl bg-cyan-500 text-slate-950 shadow-glow-cyan transform -translate-y-1">
            📖
          </div>
          <span className="font-black">ติวเข้ม</span>
        </button>

        <button
          onClick={onOpenInventory}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400 hover:text-white"
        >
          <div className="p-1 rounded-xl">🎒</div>
          <span>คลัง</span>
        </button>

        <button
          onClick={onOpenAvatarSelect}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400 hover:text-white"
        >
          <div className="p-1 rounded-xl">👤</div>
          <span>ฮีโร่</span>
        </button>
      </nav>
    </div>
  );
};
