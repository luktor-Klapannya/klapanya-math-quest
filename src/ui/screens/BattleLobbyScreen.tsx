import React, { useState, useEffect } from 'react';
import { BattleRoom, BattlePlayerState } from '../../types/battle';
import { battleService } from '../../services/battle-service';
import { PlayerProfile } from '../../types';
import { 
  Users, 
  Swords, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Flame 
} from 'lucide-react';
import { SceneBackground } from '../components/SceneBackground';

interface BattleLobbyScreenProps {
  profile: PlayerProfile;
  initialRoomCode?: string;
  onBattleStarted: (room: BattleRoom, player: BattlePlayerState) => void;
  onExit: () => void;
}

export const BattleLobbyScreen: React.FC<BattleLobbyScreenProps> = ({
  profile,
  initialRoomCode = 'ICE710',
  onBattleStarted,
  onExit,
}) => {
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode);
  const [currentRoom, setCurrentRoom] = useState<BattleRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<BattlePlayerState | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string>('');

  const handleJoin = async () => {
    try {
      setJoinError('');
      const { room, player } = await battleService.joinRoom(roomCode, {
        playerId: `std_${profile.heroName.replace(/\s+/g, '_')}`,
        studentName: profile.heroName,
        classRoomId: 'P6-1',
        avatarVisualId: profile.avatarVisualId || 'BOY_WIZARD',
        heroId: profile.heroId,
      });
      setCurrentRoom(room);
      setCurrentPlayer(player);
      setIsReady(player.status === 'READY');
    } catch (err: any) {
      setJoinError(err.message || 'ไม่สามารถเข้าร่วมห้องได้');
    }
  };

  const handleToggleReady = async () => {
    if (!currentRoom || !currentPlayer) return;
    const nextReady = !isReady;
    setIsReady(nextReady);
    const updatedRoom = await battleService.setPlayerReady(currentRoom.id, currentPlayer.playerId, nextReady);
    setCurrentRoom(updatedRoom);
  };

  // Poll room status for teacher starting the battle
  useEffect(() => {
    if (!currentRoom || !currentPlayer) return;

    const interval = setInterval(async () => {
      const room = await battleService.getRoomById(currentRoom.id);
      if (room) {
        setCurrentRoom(room);
        if (room.status === 'IN_BATTLE') {
          clearInterval(interval);
          onBattleStarted(room, currentPlayer);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoom, currentPlayer]);

  return (
    <SceneBackground territoryId="FROZEN_ARCTIC" sceneType="ARENA_LOBBY" className="p-4 md:p-8">
      <div className="flex-1 flex flex-col justify-between text-slate-100 max-w-3xl mx-auto w-full select-none font-sans">
        
        {/* Header */}
        <header className="frost-card rounded-2xl p-4 mb-4 border border-cyan-400/60 shadow-glow-cyan flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest block">
              CLASSROOM BATTLE ARENA • ลานประลองสดในห้องเรียน
            </span>
            <h1 className="text-sm md:text-base font-black text-white">
              ห้องประลองความเร็วและทักษะคณิตศาสตร์ (9–12 ผู้กล้า)
            </h1>
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-400 flex items-center justify-center text-xl shadow-glow-cyan">
          ⚔️
        </div>
      </header>

      {/* Main Container */}
      <main className="space-y-4 flex-1">
        {!currentRoom ? (
          /* Step 1: Join Room */
          <div className="frost-card rounded-3xl p-6 md:p-8 border border-slate-700 max-w-md mx-auto space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-400 mx-auto flex items-center justify-center text-3xl shadow-glow-cyan">
              🛡️
            </div>
            
            <div>
              <h2 className="text-base md:text-lg font-black text-white">ใส่รหัสห้องเรียน (Room Code)</h2>
              <p className="text-xs text-slate-300 mt-0.5">รับรหัส 6 หลักจากคุณครูผู้สอนเพื่อเข้าร่วมประลอง</p>
            </div>

            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoComplete="off"
              placeholder="เช่น ICE710"
              className="w-full p-3.5 rounded-2xl bg-white text-slate-900 border-2 border-cyan-400 text-center font-mono font-black text-xl placeholder:text-slate-400 caret-cyan-600 tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-200 shadow-sm select-text cursor-text pointer-events-auto"
            />

            {joinError && (
              <p className="text-xs text-rose-400 font-bold">{joinError}</p>
            )}

            <button
              onClick={handleJoin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-glow-cyan transition-all transform hover:scale-[1.02]"
            >
              เข้าร่วมห้องประลอง (Join Room)
            </button>
          </div>
        ) : (
          /* Step 2: Lobby Roster & Ready State */
          <div className="frost-card rounded-3xl p-5 md:p-6 border border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">รหัสห้องประลอง</span>
                <div className="text-xl font-black font-mono text-amber-400">{currentRoom.roomCode}</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase">ผู้เข้าร่วมปัจจุบัน</span>
                <div className="text-sm font-black text-cyan-300 flex items-center gap-1">
                  <Users className="w-4 h-4" /> {Object.keys(currentRoom.players).length} / 12 คน
                </div>
              </div>
            </div>

            {/* Players Grid (Supports 9-12 students) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {Object.values(currentRoom.players).map((p) => {
                const isMe = p.playerId === currentPlayer?.playerId;
                return (
                  <div
                    key={p.playerId}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      isMe
                        ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/60 shadow-glow-cyan'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xl">🧙‍♂️</span>
                      <div className="truncate">
                        <div className="text-xs font-black text-white truncate">
                          {p.studentName} {isMe && '(ฉัน)'}
                        </div>
                        <span className="text-[10px] text-slate-400">{p.heroId}</span>
                      </div>
                    </div>

                    <div>
                      {p.status === 'READY' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> พร้อม
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> รอ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ready Button & Waiting Status */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-center">
              <button
                onClick={handleToggleReady}
                className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-md transition-all transform hover:scale-[1.01] ${
                  isReady
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-cyan'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-glow-gold'
                }`}
              >
                {isReady ? '✅ พร้อมแล้ว! (คลิกเพื่อยกเลิก)' : '⚡ กดปุ่มนี้เมื่อพร้อมประลอง (Ready)'}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-300">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>รอคุณครูกดเริ่มการประลองจากหน้าจอคุณครู...</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-4 text-center text-xs text-slate-400">
        <span>ความแม่นยำสำคัญกว่าความเร็ว • ตอบถูกต่อเนื่องรับโบนัสคอมโบ 🪙</span>
      </footer>
      </div>
    </SceneBackground>
  );
};
