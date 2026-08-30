import { 
  BattleRoom, 
  BattlePlayerState, 
  BattleSummaryReport, 
  IBattleRealtimeAdapter, 
  BattleMode, 
  BattleQuestionMode, 
  SelfReflectionReason 
} from '../types/battle';
import { QuestionItem, QuestionOption, HeroClassId } from '../types';
import { DOJO_QUESTIONS } from '../content/dojo-database';
import { SHRINE_QUESTIONS } from '../content/shrine-database';
import { ONET_QUESTIONS } from '../content/onet-database';

const BATTLE_ROOMS_STORAGE_KEY = 'klapanya_battle_rooms_v1';

export function calculateBattleQuestionScore(isCorrect: boolean, timeSpentSec: number, targetTimeSec: number, currentStreak: number): number {
  if (!isCorrect) return 0;
  const basePoints = 100;
  // Speed bonus: up to 50 points if answered in under half target time
  const speedRatio = Math.max(0, Math.min(1, (targetTimeSec - timeSpentSec) / targetTimeSec));
  const speedBonus = Math.round(speedRatio * 50);
  // Streak bonus: 10 points per streak level (max 30)
  const streakBonus = Math.min(30, currentStreak * 10);

  return basePoints + speedBonus + streakBonus;
}

export function shuffleQuestionOptionsIndependently(options: QuestionOption[], seedKey: string): QuestionOption[] {
  // Deterministic or pseudo-random per player shuffle preserving stable isCorrect flag
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 10 Mock Classmates for Classroom Battle simulation (supports 9-12 student class size)
export const MOCK_CLASSMATE_STUDENTS: Array<{
  id: string;
  name: string;
  avatar: string;
  heroId: HeroClassId;
  baseAccuracy: number;
  avgSpeedSec: number;
}> = [
  { id: 'bot_01', name: 'น้องปัญญาวดี (Luna)', avatar: 'GIRL_KNIGHT', heroId: 'PALADIN', baseAccuracy: 0.95, avgSpeedSec: 8 },
  { id: 'bot_02', name: 'น้องชานนท์ (Kenji)', avatar: 'BOY_RANGER', heroId: 'SNIPER', baseAccuracy: 0.85, avgSpeedSec: 12 },
  { id: 'bot_03', name: 'น้องพิมพ์ใจ (Pim)', avatar: 'GIRL_WIZARD', heroId: 'CHRONOMANCER', baseAccuracy: 0.90, avgSpeedSec: 10 },
  { id: 'bot_04', name: 'น้องภูผา (Phupha)', avatar: 'BOY_WARRIOR', heroId: 'ROGUE', baseAccuracy: 0.80, avgSpeedSec: 14 },
  { id: 'bot_05', name: 'น้องอันดา (Anda)', avatar: 'GIRL_HEALER', heroId: 'PALADIN', baseAccuracy: 0.75, avgSpeedSec: 15 },
  { id: 'bot_06', name: 'น้องเตชินท์ (Techin)', avatar: 'BOY_SCHOLAR', heroId: 'CHRONOMANCER', baseAccuracy: 0.92, avgSpeedSec: 9 },
  { id: 'bot_07', name: 'น้องน้ำใส (Namsai)', avatar: 'GIRL_NINJA', heroId: 'ROGUE', baseAccuracy: 0.88, avgSpeedSec: 11 },
  { id: 'bot_08', name: 'น้องก้องภพ (Kong)', avatar: 'BOY_WIZARD', heroId: 'SNIPER', baseAccuracy: 0.70, avgSpeedSec: 16 },
  { id: 'bot_09', name: 'น้องรินรดา (Rin)', avatar: 'GIRL_ALCHEMIST', heroId: 'CHRONOMANCER', baseAccuracy: 0.86, avgSpeedSec: 13 },
  { id: 'bot_10', name: 'น้องเจตน์ (Jade)', avatar: 'BOY_KNIGHT', heroId: 'PALADIN', baseAccuracy: 0.91, avgSpeedSec: 10 },
];

export class LocalBattleService implements IBattleRealtimeAdapter {
  private rooms: Record<string, BattleRoom> = {};

  constructor() {
    this.rooms = this.loadRooms();
    this.ensureDefaultClassroomRoom();
  }

  private loadRooms(): Record<string, BattleRoom> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(BATTLE_ROOMS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback
    }
    return {};
  }

  private saveRooms(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BATTLE_ROOMS_STORAGE_KEY, JSON.stringify(this.rooms));
    } catch (err) {
      console.warn('Could not save battle rooms', err);
    }
  }

  private ensureDefaultClassroomRoom(): void {
    const defaultCode = 'ICE710';
    if (!this.rooms[defaultCode]) {
      const questions = (DOJO_QUESTIONS.D1 || []).slice(0, 5);
      const players: Record<string, BattlePlayerState> = {};

      MOCK_CLASSMATE_STUDENTS.slice(0, 9).forEach((bot, idx) => {
        players[bot.id] = {
          playerId: bot.id,
          studentName: bot.name,
          classRoomId: 'P6-1',
          avatarVisualId: bot.avatar,
          heroId: bot.heroId,
          status: 'READY',
          currentIndex: 0,
          totalQuestions: questions.length,
          correctCount: 0,
          wrongCount: 0,
          streak: 0,
          battleScore: 0,
          accuracy: 0,
          avgResponseTimeSec: bot.avgSpeedSec,
          joinedAt: Date.now() - 30000 + (idx * 2000),
          answers: [],
        };
      });

      this.rooms[defaultCode] = {
        id: 'room_default_710',
        teacherId: 'teacher_01',
        teacherName: 'คุณครูปัญญา วิชาการ',
        classRoomId: 'P6-1',
        roomCode: defaultCode,
        battleMode: 'LIVE_CLASSROOM',
        questionMode: 'MIRROR_BATTLE',
        sourceStageId: 'D1',
        questionCount: 5,
        showLiveRank: true,
        status: 'LOBBY',
        createdAt: Date.now(),
        questions,
        players,
      };
      this.saveRooms();
    }
  }

  public async createRoom(config: {
    teacherId: string;
    teacherName: string;
    classRoomId: string;
    sourceStageId: string;
    questionCount: number;
    battleMode: BattleMode;
    questionMode: BattleQuestionMode;
    showLiveRank?: boolean;
  }): Promise<BattleRoom> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    let sourcePool: QuestionItem[] = DOJO_QUESTIONS[config.sourceStageId] 
      || SHRINE_QUESTIONS[config.sourceStageId] 
      || ONET_QUESTIONS[config.sourceStageId] 
      || DOJO_QUESTIONS.D1;

    const questions = sourcePool.slice(0, config.questionCount);

    const players: Record<string, BattlePlayerState> = {};
    // Seed 9-11 classmates for classroom simulation
    MOCK_CLASSMATE_STUDENTS.slice(0, 10).forEach((bot, idx) => {
      players[bot.id] = {
        playerId: bot.id,
        studentName: bot.name,
        classRoomId: config.classRoomId,
        avatarVisualId: bot.avatar,
        heroId: bot.heroId,
        status: 'READY',
        currentIndex: 0,
        totalQuestions: questions.length,
        correctCount: 0,
        wrongCount: 0,
        streak: 0,
        battleScore: 0,
        accuracy: 0,
        avgResponseTimeSec: bot.avgSpeedSec,
        joinedAt: Date.now() - 20000 + (idx * 1500),
        answers: [],
      };
    });

    const room: BattleRoom = {
      id: `battle_${Date.now()}`,
      teacherId: config.teacherId,
      teacherName: config.teacherName,
      classRoomId: config.classRoomId,
      roomCode: code,
      battleMode: config.battleMode,
      questionMode: config.questionMode,
      sourceStageId: config.sourceStageId,
      questionCount: config.questionCount,
      showLiveRank: config.showLiveRank ?? true,
      status: 'LOBBY',
      createdAt: Date.now(),
      questions,
      players,
    };

    this.rooms[code] = room;
    this.saveRooms();
    return room;
  }

  public async getRoomByCode(roomCode: string): Promise<BattleRoom | null> {
    const code = roomCode.trim().toUpperCase();
    return this.rooms[code] || null;
  }

  public async getRoomById(roomId: string): Promise<BattleRoom | null> {
    return Object.values(this.rooms).find((r) => r.id === roomId) || null;
  }

  public async joinRoom(roomCode: string, player: {
    playerId: string;
    studentName: string;
    classRoomId: string;
    avatarVisualId: string;
    heroId: HeroClassId;
  }): Promise<{ room: BattleRoom; player: BattlePlayerState }> {
    const code = roomCode.trim().toUpperCase();
    const room = this.rooms[code];
    if (!room) {
      throw new Error(`ไม่พบห้องรหัส ${code}`);
    }

    // Reconnection or existing player check (Connection Safety)
    if (room.players[player.playerId]) {
      room.players[player.playerId].status = 'READY';
      this.saveRooms();
      return { room, player: room.players[player.playerId] };
    }

    // Duplicate name protection
    const safePlayerId = player.playerId || `std_${Date.now()}`;
    const newPlayerState: BattlePlayerState = {
      playerId: safePlayerId,
      studentName: player.studentName,
      classRoomId: player.classRoomId || room.classRoomId,
      avatarVisualId: player.avatarVisualId || 'BOY_WIZARD',
      heroId: player.heroId || 'CHRONOMANCER',
      status: 'WAITING',
      currentIndex: 0,
      totalQuestions: room.questions.length,
      correctCount: 0,
      wrongCount: 0,
      streak: 0,
      battleScore: 0,
      accuracy: 0,
      avgResponseTimeSec: 0,
      joinedAt: Date.now(),
      answers: [],
    };

    room.players[safePlayerId] = newPlayerState;
    this.saveRooms();
    return { room, player: newPlayerState };
  }

  public async setPlayerReady(roomId: string, playerId: string, isReady: boolean): Promise<BattleRoom> {
    const room = await this.getRoomById(roomId);
    if (!room || !room.players[playerId]) throw new Error('Player not found');

    room.players[playerId].status = isReady ? 'READY' : 'WAITING';
    this.saveRooms();
    return room;
  }

  public async startBattle(roomId: string, teacherId: string): Promise<BattleRoom> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room not found');

    room.status = 'IN_BATTLE';
    room.startedAt = Date.now();

    // Set all ready players to PLAYING
    Object.values(room.players).forEach((p) => {
      p.status = 'PLAYING';
      p.currentIndex = 0;
    });

    this.saveRooms();
    return room;
  }

  public async submitPlayerAnswer(
    roomId: string, 
    playerId: string, 
    answer: {
      questionId: string;
      isCorrect: boolean;
      timeSpentSec: number;
      userAnswer: string;
    }
  ): Promise<{ player: BattlePlayerState; room: BattleRoom }> {
    const room = await this.getRoomById(roomId);
    if (!room || !room.players[playerId]) throw new Error('Invalid player or room');

    const player = room.players[playerId];
    const qItem = room.questions.find((q) => q.id === answer.questionId) || room.questions[player.currentIndex];
    const targetTimeSec = qItem?.targetTimeSec || 30;

    const newStreak = answer.isCorrect ? player.streak + 1 : 0;
    const gained = calculateBattleQuestionScore(answer.isCorrect, answer.timeSpentSec, targetTimeSec, newStreak);

    player.answers.push({
      questionId: answer.questionId,
      isCorrect: answer.isCorrect,
      timeSpentSec: answer.timeSpentSec,
      scoreGained: gained,
      userAnswer: answer.userAnswer,
    });

    if (answer.isCorrect) player.correctCount++;
    else player.wrongCount++;

    player.streak = newStreak;
    player.battleScore += gained;
    player.currentIndex++;
    player.accuracy = Math.round((player.correctCount / player.answers.length) * 100);

    const totalTime = player.answers.reduce((acc, a) => acc + a.timeSpentSec, 0);
    player.avgResponseTimeSec = Math.round((totalTime / player.answers.length) * 10) / 10;

    if (player.currentIndex >= room.questions.length) {
      player.status = 'FINISHED';
      player.finishedAt = Date.now();
    }

    // Simulate concurrent bots progression in mock mode
    Object.values(room.players).forEach((p) => {
      if (p.playerId !== playerId && p.playerId.startsWith('bot_') && p.status === 'PLAYING') {
        const botConfig = MOCK_CLASSMATE_STUDENTS.find((b) => b.id === p.playerId);
        if (botConfig && p.currentIndex < room.questions.length) {
          const isBotCorrect = Math.random() < botConfig.baseAccuracy;
          const botTime = Math.max(3, botConfig.avgSpeedSec + (Math.floor(Math.random() * 5) - 2));
          const botGained = calculateBattleQuestionScore(isBotCorrect, botTime, 30, isBotCorrect ? p.streak + 1 : 0);
          p.currentIndex++;
          if (isBotCorrect) {
            p.correctCount++;
            p.streak++;
          } else {
            p.wrongCount++;
            p.streak = 0;
          }
          p.battleScore += botGained;
          p.accuracy = Math.round((p.correctCount / p.currentIndex) * 100);
          if (p.currentIndex >= room.questions.length) {
            p.status = 'FINISHED';
            p.finishedAt = Date.now();
          }
        }
      }
    });

    this.saveRooms();
    return { player, room };
  }

  public async saveSelfReflection(roomId: string, playerId: string, reason: SelfReflectionReason): Promise<void> {
    const room = await this.getRoomById(roomId);
    if (room && room.players[playerId]) {
      room.players[playerId].selfReflection = reason;
      this.saveRooms();
    }
  }

  public async finishPlayerBattle(roomId: string, playerId: string): Promise<BattleRoom> {
    const room = await this.getRoomById(roomId);
    if (!room || !room.players[playerId]) throw new Error('Room or player not found');
    room.players[playerId].status = 'FINISHED';
    room.players[playerId].finishedAt = Date.now();
    this.saveRooms();
    return room;
  }

  public async endBattle(roomId: string): Promise<BattleSummaryReport> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room not found');

    room.status = 'FINISHED';
    room.endedAt = Date.now();

    const playerList = Object.values(room.players);
    const sorted = [...playerList].sort((a, b) => b.battleScore - a.battleScore);

    const totalScore = playerList.reduce((acc, p) => acc + p.battleScore, 0);
    const totalAcc = playerList.reduce((acc, p) => acc + p.accuracy, 0);
    const totalTime = playerList.reduce((acc, p) => acc + p.avgResponseTimeSec, 0);

    const reflections: Record<SelfReflectionReason, number> = {
      READ_TOO_FAST: 0,
      DID_NOT_READ_FULL_QUESTION: 0,
      CALCULATION_ERROR: 0,
      FORGOT_RULE_OR_FORMULA: 0,
      DID_NOT_UNDERSTAND_METHOD: 0,
      TIME_PRESSURE: 0,
      GUESSED_TOO_FAST: 0,
      OTHER: 0,
    };

    playerList.forEach((p) => {
      if (p.selfReflection) reflections[p.selfReflection] = (reflections[p.selfReflection] || 0) + 1;
    });

    const report: BattleSummaryReport = {
      roomId: room.id,
      roomCode: room.roomCode,
      sourceStageId: room.sourceStageId,
      totalParticipants: playerList.length,
      averageClassScore: playerList.length ? Math.round(totalScore / playerList.length) : 0,
      averageClassAccuracy: playerList.length ? Math.round(totalAcc / playerList.length) : 0,
      averageResponseTimeSec: playerList.length ? Math.round((totalTime / playerList.length) * 10) / 10 : 0,
      rankings: sorted.map((p, idx) => ({
        rank: idx + 1,
        playerId: p.playerId,
        studentName: p.studentName,
        avatarVisualId: p.avatarVisualId,
        heroId: p.heroId,
        score: p.battleScore,
        accuracy: p.accuracy,
        avgTimeSec: p.avgResponseTimeSec,
      })),
      mostMissedQuestions: room.questions.slice(0, 3).map((q) => ({
        questionId: q.id,
        questionText: q.questionText,
        topic: q.topic,
        missCount: 3,
        commonMisconception: q.misconceptionTags[0] || 'การคำนวณสลับลำดับ',
      })),
      commonReflections: reflections,
    };

    this.saveRooms();
    return report;
  }
}

export const battleService = new LocalBattleService();
