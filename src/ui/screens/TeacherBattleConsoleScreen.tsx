import React, { useState, useEffect } from 'react';
import { BattleRoom, BattleSummaryReport } from '../../types/battle';
import { battleService } from '../../services/battle-service';
import { 
  Users, 
  Play, 
  Square, 
  Trophy, 
  BarChart3, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Flame, 
  AlertTriangle,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';

interface TeacherBattleConsoleScreenProps {
  initialRoomCode?: string;
  onExit: () => void;
}

export const TeacherBattleConsoleScreen: React.FC<TeacherBattleConsoleScreenProps> = ({
  initialRoomCode = 'ICE710',
  onExit,
}) => {
  const [room, setRoom] = useState<BattleRoom | null>(null);
  const [report, setReport] = useState<BattleSummaryReport | null>(null);
  const [showLiveRank, setShowLiveRank] = useState<boolean>(true);

  useEffect(() => {
    async function fetchRoom() {
      const r = await battleService.getRoomByCode(initialRoomCode);
      if (r) setRoom(r);
    }
    fetchRoom();
    const interval = setInterval(fetchRoom, 1000);
    return () => clearInterval(interval);
  }, [initialRoomCode]);

  const handleStartBattle = async () => {
    if (!room) return;
    const updated = await battleService.startBattle(room.id, room.teacherId);
    setRoom(updated);
  };

  const handleEndBattle = async () => {
    if (!room) return;
    const summary = await battleService.endBattle(room.id);
    setReport(summary);
  };

  if (!room) {
    return (
      <div className="min-h-screen aurora-bg p-8 flex items-center justify-center text-slate-300 font-bold">
        กำลังโหลดห้องประลอง...
      </div>
    );
  }

  const playersList = Object.values(room.players);
  const readyCount = playersList.filter((p) => p.status === 'READY' || p.status === 'PLAYING' || p.status === 'FINISHED').length;

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 text-slate-100 font-sans select-none max-w-6xl mx-auto space-y-5">
      
      {/* Header */}
      <header className="frost-card rounded-2xl p-4 md:p-6 border-2 border-amber-400/80 shadow-glow-gold flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase">
                TEACHER LIVE BATTLE CONSOLE
              </span>
              <span className="text-xs text-slate-400">• ห้อง {room.classRoomId}</span>
            </div>
            <h1 className="text-base md:text-xl font-black text-white">
              แผงควบคุมการประลองสดในห้องเรียน (9–12 ผู้เรียน)
            </h1>
          </div>
        </div>

        {/* Room Code Callout */}
        <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-400/60 flex items-center gap-3 text-center shadow-glow-gold">
          <div>
            <span className="text-[10px] text-amber-300 font-bold uppercase block">รหัสห้องเรียน</span>
            <div className="text-2xl font-black font-mono text-white tracking-widest">{room.roomCode}</div>
          </div>
        </div>
      </header>

      {/* Control Bar */}
      <section className="frost-card rounded-2xl p-4 border border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" /> ผู้เรียนในห้อง: {readyCount}/{playersList.length} คน
          </span>

          <button
            onClick={() => setShowLiveRank(!showLiveRank)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showLiveRank ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {showLiveRank ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showLiveRank ? 'เปิดแสดงอันดับสดแก่นักเรียน' : 'ซ่อนอันดับสด (ไม่ให้กดดัน)'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {room.status === 'LOBBY' && (
            <button
              onClick={handleStartBattle}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-glow-cyan flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-slate-950" /> เริ่มการประลองทันที (Start Battle)
            </button>
          )}

          {room.status === 'IN_BATTLE' && (
            <button
              onClick={handleEndBattle}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <Square className="w-4 h-4 fill-white" /> จบการประลอง & สรุปผล
            </button>
          )}
        </div>
      </section>

      {/* Live Student Roster Grid (9-12 Concurrent Students) */}
      {!report && (
        <section className="frost-card rounded-3xl p-5 md:p-6 border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs md:text-sm font-black text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> รายชื่อนักเรียนและสถานะความคืบหน้าแบบ Real-Time
            </h2>
            <span className="text-xs text-slate-400 font-bold">โหมด: {room.questionMode}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {playersList.map((p) => (
              <div
                key={p.playerId}
                className="p-4 rounded-2xl bg-arctic-950 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xl">🧙‍♂️</span>
                    <div className="truncate">
                      <h3 className="text-xs font-black text-white truncate">{p.studentName}</h3>
                      <span className="text-[10px] text-slate-400">{p.heroId}</span>
                    </div>
                  </div>

                  <div>
                    {p.status === 'READY' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold">
                        พร้อม
                      </span>
                    )}
                    {p.status === 'PLAYING' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold animate-pulse">
                        กำลังทำ ({p.currentIndex}/{room.questions.length})
                      </span>
                    )}
                    {p.status === 'FINISHED' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 border border-purple-400 text-purple-300 font-bold">
                        ทำเสร็จแล้ว
                      </span>
                    )}
                    {p.status === 'WAITING' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                        รอกดพร้อม
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold">{p.battleScore} pts</span>
                  <span className="text-emerald-400 font-bold">{p.accuracy}% แม่นยำ</span>
                  <span className="text-slate-400">{p.avgResponseTimeSec}s/ข้อ</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Post-Battle Analytics Report (Once Ended) */}
      {report && (
        <section className="frost-card rounded-3xl p-5 md:p-6 border-2 border-emerald-400/80 shadow-glow-cyan space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-black text-emerald-400 uppercase">CLASSROOM ANALYTICS REPORT</span>
              <h2 className="text-base md:text-lg font-black text-white">
                สรุปผลการประลองห้องเรียน • {report.totalParticipants} ผู้เรียน
              </h2>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="text-right">
                <span className="text-slate-400 block">คะแนนเฉลี่ย:</span>
                <span className="text-amber-400 font-mono font-black">{report.averageClassScore} pts</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">ความแม่นยำเฉลี่ย:</span>
                <span className="text-emerald-400 font-mono font-black">{report.averageClassAccuracy}%</span>
              </div>
            </div>
          </div>

          {/* Ranking Leaderboard Table */}
          <div>
            <h3 className="text-xs font-bold text-cyan-300 mb-2">ตารางอันดับการประลอง (Class Leaderboard):</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">อันดับ</th>
                    <th className="pb-2">ชื่อนักเรียน</th>
                    <th className="pb-2">คะแนนประลอง</th>
                    <th className="pb-2">ความแม่นยำ</th>
                    <th className="pb-2">ความเร็วเฉลี่ย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-bold">
                  {report.rankings.map((r) => (
                    <tr key={r.playerId} className="hover:bg-slate-900/50">
                      <td className="py-2.5 font-mono text-amber-400 font-black">#{r.rank}</td>
                      <td className="py-2.5 text-white">{r.studentName}</td>
                      <td className="py-2.5 font-mono text-cyan-300">{r.score}</td>
                      <td className="py-2.5 font-mono text-emerald-400">{r.accuracy}%</td>
                      <td className="py-2.5 font-mono text-slate-300">{r.avgTimeSec}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Most Missed Questions & Reflections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> ข้อที่ตอบผิดบ่อยที่สุดในห้อง:
              </h4>
              <div className="space-y-2 text-[11px]">
                {report.mostMissedQuestions.map((q) => (
                  <div key={q.questionId} className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-white truncate">{q.topic}: {q.questionText}</div>
                    <div className="text-rose-300 mt-0.5">พบบ่อย: {q.commonMisconception}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> ผลการสะท้อนตนเองของนักเรียน (Self-Reflection):
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-300">อ่านโจทย์เร็วเกินไป / รีบทำ:</span>
                  <span className="font-mono font-bold text-amber-400">4 คน (40%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">คิดเลขผิด / บวกลบเลขพลาด:</span>
                  <span className="font-mono font-bold text-amber-400">3 คน (30%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">ลืมสูตรหรือลำดับเครื่องหมาย:</span>
                  <span className="font-mono font-bold text-amber-400">2 คน (20%)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
