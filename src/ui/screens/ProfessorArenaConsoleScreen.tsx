import React, { useState, useEffect } from 'react';
import { 
  RealtimeArenaRoom, 
  RealtimeArenaParticipant, 
  ArenaClassroomAnalytics, 
  PROFESSOR_VISUALS 
} from '../../types/realtime-arena';
import { realtimeArenaService } from '../../services/realtime-arena-service';
import { 
  Users, 
  Play, 
  Pause, 
  RotateCcw, 
  Hourglass, 
  Lightbulb, 
  Flame, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowLeft, 
  MessageSquare, 
  Shuffle, 
  Target, 
  Swords,
  Crown
} from 'lucide-react';
import { SceneBackground } from '../components/SceneBackground';
import { HeroAvatarView } from '../components/HeroAvatarView';

interface ProfessorArenaConsoleScreenProps {
  room: RealtimeArenaRoom;
  onExit: () => void;
  onOpenReviewHub?: () => void;
}

export const ProfessorArenaConsoleScreen: React.FC<ProfessorArenaConsoleScreenProps> = ({
  room: initialRoom,
  onExit,
  onOpenReviewHub,
}) => {
  const [room, setRoom] = useState<RealtimeArenaRoom>(initialRoom);
  const [selectedLearner, setSelectedLearner] = useState<RealtimeArenaParticipant | null>(null);
  const [activeTabMobile, setActiveTabMobile] = useState<'CLASS' | 'QUESTION' | 'ANALYTICS'>('CLASS');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);

  // Live seconds countdown when room is LIVE
  useEffect(() => {
    if (room.status !== 'LIVE') return;
    const timer = setInterval(() => {
      setRoom((prev) => {
        if (prev.roundSecondsLeft <= 1) {
          return { ...prev, roundSecondsLeft: 0, status: 'READY' };
        }
        return { ...prev, roundSecondsLeft: prev.roundSecondsLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [room.status]);

  const currentQ = room.questions[room.currentRoundIndex] || room.questions[0];
  const analytics: ArenaClassroomAnalytics = realtimeArenaService.getLiveAnalytics(room);
  const participantsList = Object.values(room.participants);
  const profProfile = PROFESSOR_VISUALS[room.professorAvatar] || PROFESSOR_VISUALS.professor_male;

  // Handlers for Teacher Actions
  const handleStartRound = async () => {
    const nextIdx = room.status === 'READY' ? (room.currentRoundIndex + 1) % room.totalRounds : room.currentRoundIndex;
    const updated = await realtimeArenaService.startRound(room.id, nextIdx);
    setRoom({ ...updated });
  };

  const handlePauseToggle = async () => {
    if (room.status === 'LIVE') {
      const updated = await realtimeArenaService.pauseRound(room.id);
      setRoom({ ...updated });
    } else if (room.status === 'PAUSED') {
      const updated = await realtimeArenaService.resumeRound(room.id);
      setRoom({ ...updated });
    }
  };

  const handleExtendTime = async () => {
    const updated = await realtimeArenaService.extendRoundTime(room.id, 30);
    setRoom({ ...updated });
  };

  const handleSendHint = async () => {
    const updated = await realtimeArenaService.sendHint(room.id);
    setRoom({ ...updated });
  };

  const handleTriggerBoss = async () => {
    const updated = await realtimeArenaService.triggerBossRound(room.id, 'มังกรไซเบอร์ฟรอสต์มหาปราสาท (Citadel Frost Dragon)', 6000);
    setRoom({ ...updated });
  };

  return (
    <SceneBackground territoryId="FROZEN_ARCTIC" sceneType="ARENA_LIVE">
      <div className="relative min-h-screen flex flex-col justify-between p-2 sm:p-4 text-slate-100 font-sans select-none z-10">
        
        {/* ════════════════════════════════════════════════════════════════ */}
        {/* 1. TOP IDENTITY & SESSION HEADER                                 */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <header className="frost-card rounded-2xl p-3 sm:p-4 mb-3 border border-cyan-400/40 bg-slate-950/90 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-2xl">
          
          {/* Left: Exit + Teacher Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-200 transition-all shadow-md"
              title="ออกจากห้องควบคุม"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-full bg-slate-900 border border-amber-400 p-0.5 shadow-glow-gold flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src={profProfile.portrait || "/brand/seal.png"} alt="Professor" className="w-full h-full object-cover rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-amber-200 tracking-wide truncate max-w-[140px] sm:max-w-xs">
                  {room.professorName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-400/60 text-amber-300 font-black">
                  PROFESSOR
                </span>
              </div>
              <p className="text-[11px] text-cyan-300 font-semibold">
                ห้องเรียน: {room.classroomId} • สถาบันกล้าปัญญา
              </p>
            </div>
          </div>

          {/* Center: Live Room Code Capsule */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 border border-cyan-400/80 shadow-glass-crystal">
            <span className="text-xs text-slate-400 font-bold uppercase">Room Code:</span>
            <span className="text-base sm:text-lg font-black font-mono tracking-widest text-cyan-300 animate-pulse">
              {room.roomCode}
            </span>
          </div>

          {/* Right: Mode Badge & Live Status */}
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-md ${
              room.status === 'LIVE' 
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 animate-pulse'
                : room.status === 'PAUSED'
                ? 'bg-amber-950/80 border-amber-400 text-amber-300'
                : 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>{room.status === 'LIVE' ? 'LIVE BATTLE' : room.status}</span>
            </div>

            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{participantsList.length}/{room.maxPlayers} คน</span>
            </div>
          </div>
        </header>

        {/* Mobile Tab Switcher (Visible on small viewports only) */}
        <div className="lg:hidden flex items-center gap-1 p-1 bg-slate-950/90 rounded-2xl border border-slate-800 mb-3">
          <button
            onClick={() => setActiveTabMobile('CLASS')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTabMobile === 'CLASS' ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan' : 'text-slate-400'
            }`}
          >
            👥 นักเรียน ({participantsList.length})
          </button>
          <button
            onClick={() => setActiveTabMobile('QUESTION')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTabMobile === 'QUESTION' ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan' : 'text-slate-400'
            }`}
          >
            📝 โจทย์ข้อที่ {room.currentRoundIndex + 1}
          </button>
          <button
            onClick={() => setActiveTabMobile('ANALYTICS')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTabMobile === 'ANALYTICS' ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan' : 'text-slate-400'
            }`}
          >
            📊 สถิติสด
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* 2. 3-COLUMN DESKTOP DASHBOARD                                    */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 mb-3">
          
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: LIVE CLASSROOM (9–12 Learner Cards) (Span 4)     */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className={`lg:col-span-4 frost-card rounded-3xl p-4 border border-slate-700 bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between ${
            activeTabMobile === 'CLASS' ? 'block' : 'hidden lg:flex'
          }`}>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-sm text-white">ห้องเรียนสด (Live Roster)</span>
                </div>
                <span className="text-[11px] text-cyan-300 font-mono font-bold">
                  {participantsList.filter(p => p.isAnswered).length}/{participantsList.length} ตอบแล้ว
                </span>
              </div>

              {/* 9–12 Learners Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-3 max-h-[460px] overflow-y-auto pr-1">
                {participantsList.map((p) => {
                  const isSelected = selectedLearner?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedLearner(p)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-cyan-950/90 border-cyan-400 shadow-glow-cyan'
                          : p.isAnswered
                          ? 'bg-slate-900/90 border-emerald-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-950 border border-cyan-400 p-0.5 flex-shrink-0">
                          <img src="/brand/seal.png" alt="Avatar" className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate max-w-[110px] sm:max-w-[140px]">
                            {p.displayName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.userCode} • {p.score} pts
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.streak > 1 && (
                          <div className="flex items-center gap-0.5 text-[10px] font-black text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded-md border border-amber-400/50">
                            <Flame className="w-3 h-3 text-amber-400" />
                            <span>{p.streak}x</span>
                          </div>
                        )}
                        {p.isAnswered ? (
                          <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-400/50">
                            ✓ ส่งแล้ว
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 animate-pulse">
                            กำลังคิด...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Roster Summary */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>ความแม่นยำเฉลี่ยห้อง:</span>
              <span className="font-bold text-amber-300">{analytics.classAccuracy}%</span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* CENTER COLUMN: QUESTION PREVIEW & ROUND CONTROLS (Span 5)       */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className={`lg:col-span-5 frost-card rounded-3xl p-4 sm:p-5 border border-cyan-400/40 bg-slate-950/85 backdrop-blur-xl flex flex-col justify-between ${
            activeTabMobile === 'QUESTION' ? 'block' : 'hidden lg:flex'
          }`}>
            <div>
              {/* Round Header & Countdown */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-cyan-950 border border-cyan-400/60 text-cyan-300">
                  ข้อที่ {room.currentRoundIndex + 1} / {room.totalRounds} • {currentQ?.topic}
                </span>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono font-black">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{room.roundSecondsLeft}s</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="my-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm md:text-base font-bold text-white leading-relaxed">
                {currentQ?.questionText}
              </div>

              {/* Answer Choices with Teacher's Secret Answer Key Highlight */}
              <div className="space-y-2">
                {currentQ?.options?.map((opt, idx) => {
                  const isCorrect = opt.isCorrect;
                  return (
                    <div
                      key={opt.id || idx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                        isCorrect
                          ? 'bg-emerald-950/80 border-emerald-400/80 text-emerald-200 shadow-md font-bold'
                          : 'bg-slate-900/50 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-950 border border-slate-700 flex items-center justify-center text-[10px] font-black text-amber-300">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isCorrect && (
                        <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-400">
                          ★ เฉลย (Key)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Round Control Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={handleStartRound}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-glow-cyan flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{room.status === 'LIVE' ? 'ปล่อยข้อถัดไป (Next)' : 'เริ่มข้อนี้ (Start Round)'}</span>
              </button>

              <button
                onClick={handlePauseToggle}
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                {room.status === 'PAUSED' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: LIVE ANALYTICS & SHARED BOSS HP (Span 3)         */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className={`lg:col-span-3 space-y-3 ${
            activeTabMobile === 'ANALYTICS' ? 'block' : 'hidden lg:block'
          }`}>
            
            {/* Class Accuracy Card */}
            <div className="frost-card rounded-3xl p-4 border border-slate-700 bg-slate-950/80 backdrop-blur-xl">
              <span className="text-xs font-bold text-slate-300 block mb-2">ความแม่นยำรวมห้องเรียน</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-300 font-mono">
                  {analytics.classAccuracy}%
                </span>
                <span className="text-xs text-slate-400">เฉลี่ย 9-12 คน</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-700 mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${analytics.classAccuracy}%` }}
                />
              </div>
            </div>

            {/* Shared Boss HP Card (If Boss Raid Active) */}
            {room.bossState && (
              <div className="frost-card rounded-3xl p-4 border border-rose-500/50 bg-rose-950/40 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                  <span className="flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-rose-400" /> บอสมหารวมพลัง
                  </span>
                  <span>{room.bossState.currentHp} / {room.bossState.maxHp} HP</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-rose-900 p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-400 transition-all duration-300"
                    style={{ width: `${room.bossState.shieldPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">คำใบ้ที่ใช้</span>
                <span className="text-lg font-black text-cyan-300 font-mono">{analytics.hintsUsed}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">คิวฝึกซ่อม (Drill)</span>
                <span className="text-lg font-black text-rose-400 font-mono">{analytics.recoveryQueue}</span>
              </div>
            </div>

            {/* Top 3 Live Podium */}
            <div className="frost-card rounded-3xl p-3 border border-slate-700 bg-slate-950/80 backdrop-blur-xl">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1 mb-2">
                <Award className="w-3.5 h-3.5 text-amber-400" /> ผู้นำคะแนน Top 3
              </span>
              <div className="space-y-1.5 text-xs">
                {analytics.leaderboard.slice(0, 3).map((lead) => (
                  <div key={lead.participantId} className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                      <span className="font-black text-amber-400 font-mono">#{lead.rank}</span>
                      <span className="truncate text-white font-bold">{lead.displayName}</span>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold">{lead.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* 3. BOTTOM QUICK ACTIONS BAR                                      */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <footer className="frost-card rounded-2xl p-2.5 sm:p-3 border border-slate-700 bg-slate-950/90 backdrop-blur-xl flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendHint}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              <span>ส่งคำใบ้ (Hint)</span>
            </button>

            <button
              onClick={handleExtendTime}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-blue-950 border border-slate-700 hover:border-blue-400 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Hourglass className="w-3.5 h-3.5 text-blue-400" />
              <span>เพิ่มเวลา (+30s)</span>
            </button>

            <button
              onClick={handleTriggerBoss}
              className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/80 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>เปิดบอสรวมพลัง (Boss Raid)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenReviewHub && (
              <button
                onClick={onOpenReviewHub}
                className="px-3 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/80 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>สั่ง Recovery Drill</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </SceneBackground>
  );
};
