export function calculateCoinReward(
  baseReward: number,
  timeTakenSec: number,
  targetTimeSec: number,
  comboCount: number,
  isFastCast: boolean
): number {
  // Speed bonus: answering in less than half time grants +25% (or +50% with Chronomancer Fast Cast)
  const isSpeedy = timeTakenSec <= targetTimeSec * 0.5;
  const speedBonusMultiplier = isSpeedy ? (isFastCast ? 0.5 : 0.25) : 0;
  
  // Combo streak bonus: +5% per combo up to 50%
  const comboBonusMultiplier = Math.min(comboCount * 0.05, 0.5);
  
  const totalMultiplier = 1 + speedBonusMultiplier + comboBonusMultiplier;
  return Math.round(baseReward * totalMultiplier);
}

export function calculateXpReward(baseXp: number, isCorrect: boolean, hintLevelUsed: number): number {
  if (!isCorrect) return Math.max(2, Math.round(baseXp * 0.1));
  const hintPenaltyMultiplier = hintLevelUsed === 1 ? 0.8 : hintLevelUsed === 2 ? 0.5 : 1.0;
  return Math.round(baseXp * hintPenaltyMultiplier);
}

export function getRankFromXp(xp: number): { rank: string; level: number } {
  const level = Math.min(50, Math.floor(xp / 200) + 1);
  let rank = 'Novice Trainee';
  if (level >= 36) rank = 'Grandmaster';
  else if (level >= 27) rank = 'Gateway Guardian';
  else if (level >= 19) rank = 'Arctic Elite';
  else if (level >= 11) rank = 'Dojo Adept';
  else if (level >= 6) rank = 'Apprentice';
  return { rank, level };
}
