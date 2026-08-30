import { QuestionItem } from '../types';

export type TimerVisualState = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OVERTIME' | 'PAUSED';

export interface StageTimerBounds {
  minSec: number;
  maxSec: number;
  isGlobalTimer?: boolean;
  globalTimeLimitSec?: number;
}

export const STAGE_TIMER_BOUNDS: Record<string, StageTimerBounds> = {
  // Dojo
  D1: { minSec: 15, maxSec: 45 },
  D2: { minSec: 15, maxSec: 40 },
  D3: { minSec: 15, maxSec: 45 },
  D4: { minSec: 25, maxSec: 60 },
  D5: { minSec: 20, maxSec: 55 },
  D6: { minSec: 25, maxSec: 60 },

  // Shrine (Speed-duel fixed baselines)
  F1: { minSec: 5, maxSec: 5 },
  F2: { minSec: 10, maxSec: 10 },
  F3: { minSec: 15, maxSec: 15 },
  F4: { minSec: 15, maxSec: 15 },

  // O-NET Gateway
  'ONET-1': { minSec: 45, maxSec: 90 },
  'ONET-2': { minSec: 60, maxSec: 110 },
  'ONET-3': { minSec: 75, maxSec: 135 },
  'ONET-4': { minSec: 90, maxSec: 180 },

  // Boss Arenas
  'BOSS-1': { minSec: 45, maxSec: 120 },
  'BOSS-2': { minSec: 45, maxSec: 120 },
  'BOSS-3': { minSec: 45, maxSec: 120 },

  // Forbidden Geometry Ruins
  FORBIDDEN_GEOMETRY_RUINS: { minSec: 60, maxSec: 180 },

  // Arctic Quest Board
  ARCTIC_QUEST_BOARD: { minSec: 45, maxSec: 150 },

  // Final Grandmaster Trial (40Q Global Exam)
  FINAL_TRIAL: { minSec: 1, maxSec: 3600, isGlobalTimer: true, globalTimeLimitSec: 3600 },
};

export const DIFFICULTY_MODIFIERS: Record<number, number> = {
  1: 0.80,
  2: 0.90,
  3: 1.00,
  4: 1.15,
  5: 1.30,
};

export const QUESTION_TYPE_MODIFIERS: Record<string, number> = {
  MCQ_STANDARD: 1.00,
  SPEED_DUEL: 1.00,
  TRAP_HUNT: 1.10,
  MULTI_STEP_SURVIVAL: 1.25,
  GRID_RESPONSE: 1.10,
  DIAGRAM_INSPECTION: 1.25,
  GEOMETRY_ROTATE: 1.35,
  BOSS_STRIKE: 1.15,
  FINAL_EXAM: 1.00,
};

export interface CalculateEffectiveTimerParams {
  baseTargetTimeSec: number;
  difficulty?: number;
  questionType?: string;
  stageId?: string;
  gameMode?: 'PRACTICE' | 'EXAM' | 'RANKED' | 'CHALLENGE';
  requiresDiagram?: boolean;
  isMultiStep?: boolean;
}

/**
 * Calculates the data-driven effective timer without mutating the canonical question.
 * Formula: effective_time = clamp(base_time * diff_mod * type_mod * diagram_mod * multistep_mod, minSec, maxSec)
 */
export function calculateEffectiveTimeSec(params: CalculateEffectiveTimerParams): number {
  const {
    baseTargetTimeSec,
    difficulty = 3,
    questionType = 'MCQ_STANDARD',
    stageId = 'D1',
    requiresDiagram = false,
    isMultiStep = false,
  } = params;

  // Fixed Shrine overrides
  if (stageId === 'F1') return 5;
  if (stageId === 'F2') return 10;
  if (stageId === 'F3' || stageId === 'F4') return 15;

  const diffMod = DIFFICULTY_MODIFIERS[difficulty] || 1.00;
  const typeMod = QUESTION_TYPE_MODIFIERS[questionType] || 1.00;
  const diagramMod = requiresDiagram ? 1.20 : 1.00;
  const stepMod = isMultiStep ? 1.15 : 1.00;

  const rawCalculated = baseTargetTimeSec * diffMod * typeMod * diagramMod * stepMod;

  const bounds = STAGE_TIMER_BOUNDS[stageId] || { minSec: 15, maxSec: 120 };
  const clamped = Math.min(bounds.maxSec, Math.max(bounds.minSec, Math.round(rawCalculated)));

  return clamped;
}

/**
 * Determines high-contrast, accessible timer visual state (Color + Icon + Label)
 */
export function getTimerVisualState(
  secondsLeft: number,
  totalTargetSec: number,
  isPaused: boolean = false,
  isOvertime: boolean = false
): {
  state: TimerVisualState;
  label: string;
  icon: string;
  colorClass: string;
  progressPercent: number;
} {
  if (isPaused) {
    return {
      state: 'PAUSED',
      label: 'หยุดเวลา (Paused)',
      icon: '⏸️',
      colorClass: 'text-cyan-300 border-cyan-400 bg-cyan-950/80',
      progressPercent: 100,
    };
  }

  if (isOvertime || secondsLeft <= 0) {
    return {
      state: 'OVERTIME',
      label: 'เกินเวลาเป้าหมาย (Overtime)',
      icon: '⏳',
      colorClass: 'text-purple-300 border-purple-400 bg-purple-950/80',
      progressPercent: 0,
    };
  }

  const ratio = Math.max(0, secondsLeft / Math.max(1, totalTargetSec));
  const percent = Math.min(100, Math.round(ratio * 100));

  if (ratio < 0.20) {
    return {
      state: 'CRITICAL',
      label: 'เวลาวิกฤต! (Critical)',
      icon: '🔥',
      colorClass: 'text-rose-400 border-rose-500 bg-rose-950/80',
      progressPercent: percent,
    };
  }

  if (ratio <= 0.40) {
    return {
      state: 'WARNING',
      label: 'เวลาใกล้หมด (Warning)',
      icon: '⚠️',
      colorClass: 'text-amber-300 border-amber-400 bg-amber-950/80',
      progressPercent: percent,
    };
  }

  return {
    state: 'NORMAL',
    label: 'เวลาปกติ (Normal)',
    icon: '⏱️',
    colorClass: 'text-cyan-300 border-cyan-400 bg-arctic-950/80',
    progressPercent: percent,
  };
}
