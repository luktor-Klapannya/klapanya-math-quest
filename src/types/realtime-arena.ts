import { QuestionItem, HeroClassId } from './index';
import { AuthUser } from '../auth/types';

export type ArenaRoomStatus = 
  | 'LOBBY'
  | 'READY'
  | 'LIVE'
  | 'PAUSED'
  | 'FINISHED'
  | 'CLOSED';

export type ArenaRoundStatus = 'PREPARING' | 'ACTIVE' | 'EVALUATING' | 'COMPLETED';

export type ArenaEventType = 
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'PLAYER_RECONNECTED'
  | 'ROUND_READY'
  | 'ROUND_STARTED'
  | 'ANSWER_SUBMITTED'
  | 'ROUND_RESULT'
  | 'LEADERBOARD_UPDATED'
  | 'BOSS_HP_UPDATED'
  | 'ROUND_PAUSED'
  | 'ROUND_RESUMED'
  | 'ROOM_FINISHED';

export interface ProfessorVisualProfile {
  id: 'professor_male' | 'professor_female';
  nameTh: string;
  nameEn: string;
  portrait: string;
  fullBody: string;
}

export const PROFESSOR_VISUALS: Record<string, ProfessorVisualProfile> = {
  professor_male: {
    id: 'professor_male',
    nameTh: 'ศาสตราจารย์ปัญญา (อาจารย์ชาย)',
    nameEn: 'Professor Panya (Male)',
    portrait: '/characters/professors/professor_male_portrait.png',
    fullBody: '/characters/professors/professor_male_fullbody.png',
  },
  professor_female: {
    id: 'professor_female',
    nameTh: 'ศาสตราจารย์ดร.มณีรัตน์ (อาจารย์หญิง)',
    nameEn: 'Professor Maneerat (Female)',
    portrait: '/characters/professors/professor_female_portrait.png',
    fullBody: '/characters/professors/professor_female_fullbody.png',
  },
};

export interface RealtimeArenaParticipant {
  id: string; // participant UUID
  learnerId: string;
  userCode: string; // e.g. G6001
  displayName: string;
  avatarId: string;
  heroClass: HeroClassId;
  isConnected: boolean;
  isAnswered: boolean;
  score: number;
  streak: number;
  accuracy: number;
  totalAnswered: number;
  correctCount: number;
  avgTimeSec: number;
  joinedAt: string;
  lastActiveAt: string;
}

export interface SharedBossState {
  bossId: string;
  bossName: string;
  currentHp: number;
  maxHp: number;
  isDefeated: boolean;
  shieldPercent: number;
}

export interface RealtimeArenaRoom {
  id: string;
  roomCode: string; // 6-character room code (e.g. ICE742)
  organizationId: string;
  classroomId: string; // e.g. 'P6-1'
  professorId: string;
  professorName: string;
  professorAvatar: 'professor_male' | 'professor_female';
  territoryId: string; // e.g. 'FROZEN_ARCTIC'
  questionSetId: string;
  title: string;
  mode: 'STANDARD_DUEL' | 'BOSS_RAID' | 'SPEED_CHALLENGE';
  status: ArenaRoomStatus;
  maxPlayers: number;
  currentRoundIndex: number;
  totalRounds: number;
  roundTimeLimitSec: number;
  roundSecondsLeft: number;
  questions: QuestionItem[];
  participants: Record<string, RealtimeArenaParticipant>;
  bossState?: SharedBossState;
  hintsUsedCount: number;
  recoveryQueueCount: number;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface RealtimeArenaAnswer {
  id: string;
  roundId: string;
  participantId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpentSec: number;
  damageDealt: number;
  scoreGained: number;
  submittedAt: string;
}

export interface ArenaClassroomAnalytics {
  classAccuracy: number;
  activeLearnersCount: number;
  totalParticipants: number;
  hintsUsed: number;
  recoveryQueue: number;
  bossHpRemaining: number;
  bossHpMax: number;
  leaderboard: {
    rank: number;
    participantId: string;
    displayName: string;
    avatarId: string;
    score: number;
    streak: number;
    accuracy: number;
  }[];
}
