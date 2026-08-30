import { SpeedGrade, ShrineRunMode } from '../types';

export interface SpeedGradeParams {
  accuracy: number; // 0 to 100
  averageTimeSec: number;
  targetTimeSec: number;
  maxCombo: number;
  totalQuestions: number;
  isTimeStopUsed: boolean;
  runMode: ShrineRunMode;
}

export function calculateSpeedGrade(params: SpeedGradeParams): SpeedGrade {
  const { accuracy, averageTimeSec, targetTimeSec, maxCombo, totalQuestions, isTimeStopUsed } = params;

  // Strict rule: Accuracy strictly dominates speed
  if (accuracy < 60) return 'TRAIN_AGAIN';

  // 1. Accuracy score (0 - 50 pts)
  const accuracyScore = (accuracy / 100) * 50;

  // 2. Speed score (strictly clamped to 0 - 30 pts)
  const speedRatio = Math.max(0.0, averageTimeSec / Math.max(1, targetTimeSec));
  const rawSpeedScore = (1 - Math.min(1.0, speedRatio)) * 30 * 2;
  const speedScore = Math.max(0, Math.min(30, rawSpeedScore));

  // 3. Combo score (0 - 20 pts)
  const comboRatio = Math.min(1.0, maxCombo / Math.max(1, totalQuestions));
  const comboScore = comboRatio * 20;

  const totalScore = accuracyScore + speedScore + comboScore;

  let grade: SpeedGrade = 'C';
  if (totalScore >= 88 && accuracy >= 90) {
    grade = 'S';
  } else if (totalScore >= 75 && accuracy >= 80) {
    grade = 'A';
  } else if (totalScore >= 60 && accuracy >= 70) {
    grade = 'B';
  } else if (accuracy >= 60) {
    grade = 'C';
  } else {
    grade = 'TRAIN_AGAIN';
  }

  // If Time Stop was used, rank cannot exceed A
  if (isTimeStopUsed && grade === 'S') {
    grade = 'A';
  }

  return grade;
}

export function getComboMilestone(combo: number): { title: string; color: string } | null {
  if (combo >= 15) return { title: '👑 Grandmaster Chain!', color: 'text-purple-300 shadow-glow-purple' };
  if (combo >= 10) return { title: '✨ Perfect Flow!', color: 'text-amber-300 shadow-glow-gold' };
  if (combo >= 5) return { title: '⚡ Aurora Surge!', color: 'text-cyan-300 shadow-glow-cyan' };
  if (combo >= 3) return { title: '❄️ Frost Spark!', color: 'text-teal-300' };
  return null;
}

export function calculateShrineDrop(
  stageId: string,
  grade: SpeedGrade,
  runMode: ShrineRunMode,
  isPassed: boolean,
  hasMasterCrest: boolean = false
): { materialId: string | null; count: number } {
  if (!isPassed) return { materialId: null, count: 0 };

  // F4 gives MASTER_MENTAL_CREST as a 1-time reward, subsequent clears drop AURORA_SHARD_III
  let mat = 'AURORA_SHARD_I';
  if (stageId === 'F1') mat = 'AURORA_SHARD_I';
  else if (stageId === 'F2') mat = 'AURORA_SHARD_II';
  else if (stageId === 'F3') mat = 'AURORA_SHARD_III';
  else if (stageId === 'F4') {
    mat = hasMasterCrest ? 'AURORA_SHARD_III' : 'MASTER_MENTAL_CREST';
  }

  if (runMode === 'PRACTICE') {
    return { materialId: mat, count: 1 };
  }

  let count = 1;
  if (grade === 'S') count = 3;
  else if (grade === 'A') count = 2;
  else count = 1;

  return { materialId: mat, count };
}
