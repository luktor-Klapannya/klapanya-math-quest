import { BossPerformanceTier, BossBattleMode } from '../types';

export interface BossPerformanceParams {
  bossHpRemaining: number;
  accuracy: number; // 0 to 100
  phaseFailures: number;
  isMasteryMet: boolean;
  mode: BossBattleMode;
}

export function calculateBossPerformanceTier(params: BossPerformanceParams): BossPerformanceTier {
  const { bossHpRemaining, accuracy, phaseFailures, isMasteryMet, mode } = params;

  // Authoritative condition: boss_hp <= 0 is required for any victory tier
  if (bossHpRemaining > 0) {
    return 'DEFEATED_FAILED';
  }

  // In Challenge Mode, calculate full tiered achievement
  if (mode === 'CHALLENGE') {
    if (accuracy >= 95 && phaseFailures === 0 && isMasteryMet) {
      return 'MYTHIC';
    }
    if (accuracy >= 90) {
      return 'GOLD';
    }
    if (accuracy >= 80) {
      return 'SILVER';
    }
    return 'BRONZE';
  }

  // Practice Mode is capped at Bronze
  return 'BRONZE';
}

export interface DamageCalculationParams {
  baseDamage: number;
  difficulty: number;
  isCorrect: boolean;
  elapsedMs: number;
  targetTimeSec: number;
}

export function calculateBossDamage(params: DamageCalculationParams): { damage: number; isCritical: boolean } {
  const { baseDamage, difficulty, isCorrect, elapsedMs, targetTimeSec } = params;

  if (!isCorrect) {
    return { damage: 0, isCritical: false };
  }

  const difficultyMultiplier = 1.0 + (difficulty - 1) * 0.15;
  let totalDamage = Math.round(baseDamage * difficultyMultiplier);

  // Critical bonus for fast and accurate reasoning
  const isCritical = elapsedMs <= (targetTimeSec * 1000 * 0.5);
  if (isCritical) {
    totalDamage = Math.round(totalDamage * 1.25);
  }

  return { damage: totalDamage, isCritical };
}

export function canForgeLegendaryAdmissionWeapon(unlockedGear: string[]): boolean {
  const hasBoss1 = unlockedGear.includes('SPATIAL_DRAGON_CORE');
  const hasBoss2 = unlockedGear.includes('GRANDMASTER_BLADE_CORE');
  const hasBoss3 = unlockedGear.includes('ARCANE_LOGIC_CRYSTAL');
  return hasBoss1 && hasBoss2 && hasBoss3;
}
