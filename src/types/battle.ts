import { QuestionItem, HeroClassId } from './index';

export type BattleMode = 'SOLO_TIME_ATTACK' | 'ASYNC_CLASSROOM' | 'LIVE_CLASSROOM' | 'TEAM_BATTLE';
export type BattleQuestionMode = 'MIRROR_BATTLE' | 'EQUIVALENT_BATTLE';
export type BattleRoomStatus = 'LOBBY' | 'STARTING' | 'IN_BATTLE' | 'FINISHED';
export type PlayerBattleStatus = 'WAITING' | 'READY' | 'PLAYING' | 'FINISHED' | 'DISCONNECTED';

export type SelfReflectionReason = 
  | 'READ_TOO_FAST'
  | 'DID_NOT_READ_FULL_QUESTION'
  | 'CALCULATION_ERROR'
  | 'FORGOT_RULE_OR_FORMULA'
  | 'DID_NOT_UNDERSTAND_METHOD'
  | 'TIME_PRESSURE'
  | 'GUESSED_TOO_FAST'
  | 'OTHER';

export interface BattlePlayerAnswer {
  questionId: string;
  isCorrect: boolean;
  timeSpentSec: number;
  scoreGained: number;
  userAnswer: string;
}

export interface BattlePlayerState {
  playerId: string;
  studentName: string;
  classRoomId: string;
  avatarVisualId: string;
  heroId: HeroClassId;
  status: PlayerBattleStatus;
  currentIndex: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  streak: number;
  battleScore: number;
  accuracy: number;
  avgResponseTimeSec: number;
  joinedAt: number;
  finishedAt?: number;
  answers: BattlePlayerAnswer[];
  selfReflection?: SelfReflectionReason;
}

export interface BattleRoom {
  id: string;
  teacherId: string;
  teacherName: string;
  classRoomId: string;
  roomCode: string; // 6-character room code, e.g. "ICE999"
  battleMode: BattleMode;
  questionMode: BattleQuestionMode;
  sourceStageId: string;
  questionCount: number;
  showLiveRank: boolean;
  status: BattleRoomStatus;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  questions: QuestionItem[];
  players: Record<string, BattlePlayerState>; // Keyed by playerId (supports 9-12 students)
}

export interface BattleSummaryReport {
  roomId: string;
  roomCode: string;
  sourceStageId: string;
  totalParticipants: number;
  averageClassScore: number;
  averageClassAccuracy: number;
  averageResponseTimeSec: number;
  rankings: Array<{
    rank: number;
    playerId: string;
    studentName: string;
    avatarVisualId: string;
    heroId: HeroClassId;
    score: number;
    accuracy: number;
    avgTimeSec: number;
  }>;
  mostMissedQuestions: Array<{
    questionId: string;
    questionText: string;
    topic: string;
    missCount: number;
    commonMisconception: string;
  }>;
  commonReflections: Record<SelfReflectionReason, number>;
}

export interface IBattleRealtimeAdapter {
  createRoom(config: {
    teacherId: string;
    teacherName: string;
    classRoomId: string;
    sourceStageId: string;
    questionCount: number;
    battleMode: BattleMode;
    questionMode: BattleQuestionMode;
    showLiveRank?: boolean;
  }): Promise<BattleRoom>;

  getRoomByCode(roomCode: string): Promise<BattleRoom | null>;
  getRoomById(roomId: string): Promise<BattleRoom | null>;

  joinRoom(roomCode: string, player: {
    playerId: string;
    studentName: string;
    classRoomId: string;
    avatarVisualId: string;
    heroId: HeroClassId;
  }): Promise<{ room: BattleRoom; player: BattlePlayerState }>;

  setPlayerReady(roomId: string, playerId: string, isReady: boolean): Promise<BattleRoom>;
  startBattle(roomId: string, teacherId: string): Promise<BattleRoom>;

  submitPlayerAnswer(
    roomId: string, 
    playerId: string, 
    answer: {
      questionId: string;
      isCorrect: boolean;
      timeSpentSec: number;
      userAnswer: string;
    }
  ): Promise<{ player: BattlePlayerState; room: BattleRoom }>;

  saveSelfReflection(roomId: string, playerId: string, reason: SelfReflectionReason): Promise<void>;
  finishPlayerBattle(roomId: string, playerId: string): Promise<BattleRoom>;
  endBattle(roomId: string): Promise<BattleSummaryReport>;
}
