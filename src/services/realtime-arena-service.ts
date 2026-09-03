import { 
  RealtimeArenaRoom, 
  RealtimeArenaParticipant, 
  RealtimeArenaAnswer, 
  ArenaClassroomAnalytics, 
  SharedBossState, 
  ArenaEventType 
} from '../types/realtime-arena';
import { QuestionItem } from '../types';
import { AuthUser } from '../auth/types';
import { DOJO_STAGES, getQuestionsByStage } from '../content/dojo-database';
import { shuffleOptions } from '../engine/shuffler';

function generateRoomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  let code = '';
  for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 3; i++) code += digits.charAt(Math.floor(Math.random() * digits.length));
  return code;
}

export class RealtimeArenaService {
  private rooms: Map<string, RealtimeArenaRoom> = new Map();
  private answersByRound: Map<string, RealtimeArenaAnswer[]> = new Map();

  constructor() {
    this.seedDefaultClassroomRoom();
  }

  private seedDefaultClassroomRoom(): void {
    const defaultQuestions = getQuestionsByStage('D1').slice(0, 8);
    const defaultRoom: RealtimeArenaRoom = {
      id: 'room_seed_001',
      roomCode: 'ICE742',
      organizationId: 'ORG_KLAPANYA',
      classroomId: 'P6-1',
      professorId: 'usr_prof_001',
      professorName: 'คุณครูปัญญา วิชาการ',
      professorAvatar: 'professor_male',
      territoryId: 'FROZEN_ARCTIC',
      questionSetId: 'DOJO_D1_CORE',
      title: 'ลานประลองสมการเชิงเส้น ป.6/1 (Arctic Classroom Duel)',
      mode: 'STANDARD_DUEL',
      status: 'LOBBY',
      maxPlayers: 12,
      currentRoundIndex: 0,
      totalRounds: defaultQuestions.length,
      roundTimeLimitSec: 30,
      roundSecondsLeft: 30,
      questions: defaultQuestions,
      participants: {},
      hintsUsedCount: 0,
      recoveryQueueCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Seed 9 sample student participants for 9–12 concurrent testing
    const sampleStudents = [
      { id: 'usr_lrn_001', code: 'G6001', name: 'น้องกล้าหาญ (Alex)', hero: 'SPEED_CHRONOMANCER', avatar: 'BOY_WIZARD' },
      { id: 'usr_lrn_002', code: 'G6002', name: 'น้องปัญญา (Sarah)', hero: 'LOGIC_PALADIN', avatar: 'GIRL_KNIGHT' },
      { id: 'usr_lrn_003', code: 'G6003', name: 'น้องธันวา (Leo)', hero: 'EAGLE_EYE_SNIPER', avatar: 'BOY_SNIPER' },
      { id: 'usr_lrn_004', code: 'G6004', name: 'น้องพิมพ์ใจ (Mina)', hero: 'REVERSE_ROGUE', avatar: 'GIRL_ROGUE' },
      { id: 'usr_lrn_005', code: 'G6005', name: 'น้องอาร์ม (Arthur)', hero: 'LOGIC_PALADIN', avatar: 'BOY_KNIGHT' },
      { id: 'usr_lrn_006', code: 'G6006', name: 'น้องเหมย (Mei)', hero: 'SPEED_CHRONOMANCER', avatar: 'GIRL_WIZARD' },
      { id: 'usr_lrn_007', code: 'G6007', name: 'น้องพีช (Peach)', hero: 'EAGLE_EYE_SNIPER', avatar: 'GIRL_SNIPER' },
      { id: 'usr_lrn_008', code: 'G6008', name: 'น้องเจต (Jet)', hero: 'REVERSE_ROGUE', avatar: 'BOY_ROGUE' },
      { id: 'usr_lrn_009', code: 'G6009', name: 'น้องแก้ว (Kaew)', hero: 'LOGIC_PALADIN', avatar: 'GIRL_KNIGHT' },
    ];

    sampleStudents.forEach((st) => {
      defaultRoom.participants[st.id] = {
        id: `part_${st.id}`,
        learnerId: st.id,
        userCode: st.code,
        displayName: st.name,
        avatarId: st.avatar,
        heroClass: st.hero as any,
        isConnected: true,
        isAnswered: false,
        score: 0,
        streak: 0,
        accuracy: 100.0,
        totalAnswered: 0,
        correctCount: 0,
        avgTimeSec: 0,
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
    });

    this.rooms.set(defaultRoom.id, defaultRoom);
    this.rooms.set(defaultRoom.roomCode, defaultRoom);
  }

  public async createRoom(params: {
    professor: AuthUser;
    classroomId: string;
    title: string;
    questions?: QuestionItem[];
    mode?: 'STANDARD_DUEL' | 'BOSS_RAID' | 'SPEED_CHALLENGE';
  }): Promise<RealtimeArenaRoom> {
    const roomCode = generateRoomCode();
    const questions = params.questions && params.questions.length > 0 
      ? params.questions 
      : getQuestionsByStage('D1').slice(0, 10);

    const room: RealtimeArenaRoom = {
      id: `room_${Date.now()}`,
      roomCode,
      organizationId: params.professor.organizationId || 'ORG_KLAPANYA',
      classroomId: params.classroomId,
      professorId: params.professor.id,
      professorName: params.professor.displayName,
      professorAvatar: 'professor_male',
      territoryId: 'FROZEN_ARCTIC',
      questionSetId: `SET_${Date.now()}`,
      title: params.title,
      mode: params.mode || 'STANDARD_DUEL',
      status: 'LOBBY',
      maxPlayers: 12,
      currentRoundIndex: 0,
      totalRounds: questions.length,
      roundTimeLimitSec: 30,
      roundSecondsLeft: 30,
      questions,
      participants: {},
      hintsUsedCount: 0,
      recoveryQueueCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (room.mode === 'BOSS_RAID') {
      room.bossState = {
        bossId: 'CYBER_FROST_DRAGON',
        bossName: 'มังกรไซเบอร์ฟรอสต์มหาปราสาท (Citadel Frost Dragon)',
        currentHp: 5000,
        maxHp: 5000,
        isDefeated: false,
        shieldPercent: 100,
      };
    }

    this.rooms.set(room.id, room);
    this.rooms.set(room.roomCode, room);
    return room;
  }

  public async getRoomById(roomIdOrCode: string): Promise<RealtimeArenaRoom | null> {
    return this.rooms.get(roomIdOrCode) || null;
  }

  public async joinRoom(roomCode: string, learner: AuthUser): Promise<{
    success: boolean;
    room?: RealtimeArenaRoom;
    participant?: RealtimeArenaParticipant;
    error?: string;
  }> {
    const room = this.rooms.get(roomCode.trim().toUpperCase());
    if (!room) {
      return { success: false, error: 'ไม่พบรหัสห้องประลอง กรุณาตรวจสอบรหัส 6 ตัวอักษร' };
    }

    if (room.status === 'CLOSED' || room.status === 'FINISHED') {
      return { success: false, error: 'การประลองในห้องนี้สิ้นสุดลงแล้ว' };
    }

    // Check existing participant for safe reconnection
    if (room.participants[learner.id]) {
      const existing = room.participants[learner.id];
      existing.isConnected = true;
      existing.lastActiveAt = new Date().toISOString();
      return { success: true, room, participant: existing };
    }

    // Check room capacity (9–12 max)
    const currentCount = Object.keys(room.participants).length;
    if (currentCount >= room.maxPlayers) {
      return { success: false, error: 'ห้องประลองเต็มแล้ว (จำกัด 12 คนต่อห้อง)' };
    }

    const newParticipant: RealtimeArenaParticipant = {
      id: `part_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      learnerId: learner.id,
      userCode: learner.userCode,
      displayName: learner.displayName,
      avatarId: learner.avatarId || 'BOY_WIZARD',
      heroClass: (learner.heroClass as any) || 'SPEED_CHRONOMANCER',
      isConnected: true,
      isAnswered: false,
      score: 0,
      streak: 0,
      accuracy: 100.0,
      totalAnswered: 0,
      correctCount: 0,
      avgTimeSec: 0,
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    room.participants[learner.id] = newParticipant;
    return { success: true, room, participant: newParticipant };
  }

  public async startRound(roomId: string, roundIndex: number): Promise<RealtimeArenaRoom> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room not found');

    room.currentRoundIndex = roundIndex;
    room.status = 'LIVE';
    room.roundSecondsLeft = room.roundTimeLimitSec;

    // Reset answered status for all participants for this round
    Object.values(room.participants).forEach((p) => {
      p.isAnswered = false;
    });

    return room;
  }

  public async pauseRound(roomId: string): Promise<RealtimeArenaRoom> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room not found');
    room.status = 'PAUSED';
    return room;
  }

  public async resumeRound(roomId: string): Promise<RealtimeArenaRoom> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room not found');
    room.status = 'LIVE';
    return room;
  }

  public async extendRoundTime(roomId: string, extraSec: number = 30): Promise<RealtimeArenaRoom> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room not found');
    room.roundSecondsLeft += extraSec;
    return room;
  }

  public async submitAnswer(
    roomId: string,
    learnerId: string,
    params: {
      selectedOptionId: string;
      isCorrect: boolean;
      timeSpentSec: number;
    }
  ): Promise<{
    participant: RealtimeArenaParticipant;
    room: RealtimeArenaRoom;
    scoreGained: number;
    damageDealt: number;
  }> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room not found');

    const participant = room.participants[learnerId];
    if (!participant) throw new Error('Participant not found');

    participant.isAnswered = true;
    participant.totalAnswered += 1;
    participant.lastActiveAt = new Date().toISOString();

    let scoreGained = 0;
    let damageDealt = 0;

    // RULE: Accuracy dominates speed
    // Wrong answer = 0 score / 0 damage
    if (params.isCorrect) {
      participant.correctCount += 1;
      participant.streak += 1;

      // Base (100) + speed bonus (max 50) + streak bonus (max 30)
      const speedBonus = Math.max(0, Math.min(50, Math.round((30 - params.timeSpentSec) * 2)));
      const streakBonus = Math.min(30, participant.streak * 5);
      scoreGained = 100 + speedBonus + streakBonus;
      damageDealt = 150 + speedBonus * 2;

      participant.score += scoreGained;

      // Shared Boss HP deduction
      if (room.bossState && !room.bossState.isDefeated) {
        room.bossState.currentHp = Math.max(0, room.bossState.currentHp - damageDealt);
        room.bossState.shieldPercent = Math.round((room.bossState.currentHp / room.bossState.maxHp) * 100);
        if (room.bossState.currentHp === 0) {
          room.bossState.isDefeated = true;
        }
      }
    } else {
      participant.streak = 0;
      room.recoveryQueueCount += 1;
    }

    participant.accuracy = Math.round((participant.correctCount / participant.totalAnswered) * 100);
    participant.avgTimeSec = Number(
      ((participant.avgTimeSec * (participant.totalAnswered - 1) + params.timeSpentSec) / participant.totalAnswered).toFixed(1)
    );

    return { participant, room, scoreGained, damageDealt };
  }

  public async triggerBossRound(roomId: string, bossName?: string, maxHp: number = 5000): Promise<RealtimeArenaRoom> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room not found');

    room.mode = 'BOSS_RAID';
    room.bossState = {
      bossId: 'CYBER_FROST_DRAGON',
      bossName: bossName || 'มังกรไซเบอร์ฟรอสต์มหาปราสาท (Citadel Frost Dragon)',
      currentHp: maxHp,
      maxHp,
      isDefeated: false,
      shieldPercent: 100,
    };

    return room;
  }

  public async sendHint(roomId: string): Promise<RealtimeArenaRoom> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room not found');
    room.hintsUsedCount += 1;
    return room;
  }

  public getLiveAnalytics(room: RealtimeArenaRoom): ArenaClassroomAnalytics {
    const participantsList = Object.values(room.participants);
    const total = participantsList.length;
    const active = participantsList.filter((p) => p.isConnected).length;

    const totalAccuracy = participantsList.reduce((acc, p) => acc + p.accuracy, 0);
    const classAccuracy = total > 0 ? Math.round(totalAccuracy / total) : 100;

    const sortedByScore = [...participantsList].sort((a, b) => b.score - a.score);
    const leaderboard = sortedByScore.map((p, idx) => ({
      rank: idx + 1,
      participantId: p.id,
      displayName: p.displayName,
      avatarId: p.avatarId,
      score: p.score,
      streak: p.streak,
      accuracy: p.accuracy,
    }));

    return {
      classAccuracy,
      activeLearnersCount: active,
      totalParticipants: total,
      hintsUsed: room.hintsUsedCount,
      recoveryQueue: room.recoveryQueueCount,
      bossHpRemaining: room.bossState?.currentHp ?? 0,
      bossHpMax: room.bossState?.maxHp ?? 1,
      leaderboard,
    };
  }
}

export const realtimeArenaService = new RealtimeArenaService();
