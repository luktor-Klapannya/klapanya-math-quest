export interface MasteryUpdateParams {
  currentMastery: number;
  isCorrect: boolean;
  timeRatio: number; // timeTaken / targetTime
  hintLevelUsed: number;
  attemptCount: number;
  weight: number;
}

export interface IMasteryEngine {
  calculateDelta(params: MasteryUpdateParams): number;
}

/**
 * Weighted Skill Mastery Engine v1
 * Provides deterministic competency scoring decoupled from total points.
 * Designed with a replaceable interface for future BKT / Bayesian extensions.
 */
export class WeightedSkillMasteryEngineV1 implements IMasteryEngine {
  calculateDelta(params: MasteryUpdateParams): number {
    const { currentMastery, isCorrect, timeRatio, hintLevelUsed, attemptCount, weight } = params;

    let baseDelta = isCorrect ? 0.08 : -0.06;

    // Fluency speed bonus
    if (isCorrect && attemptCount === 1 && timeRatio <= 0.7 && hintLevelUsed === 0) {
      baseDelta += 0.04;
    }

    // Scaffolding penalty if hint was relied upon
    if (isCorrect && hintLevelUsed > 0) {
      baseDelta *= hintLevelUsed === 1 ? 0.6 : 0.3;
    }

    const scaledDelta = baseDelta * weight;
    const updated = currentMastery + scaledDelta;
    return Math.min(1.0, Math.max(0.0, parseFloat(updated.toFixed(4))));
  }
}
