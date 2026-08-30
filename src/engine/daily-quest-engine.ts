import { Question, PlayerProfile } from '../types';
import { DailyQuestConfig, DailyQuestResult } from '../types/learning';
import { DOJO_QUESTIONS } from '../content/dojo-database';
import { SHRINE_QUESTIONS } from '../content/shrine-database';
import { ONET_QUESTIONS } from '../content/onet-database';
import { BOSS_QUESTIONS } from '../content/boss-database';
import { GEOMETRY_QUESTIONS } from '../content/geometry-database';
import { getAllCanonicalQuestions } from './drill-engine';

export function generateDailyQuestSession(profile: PlayerProfile): DailyQuestConfig {
  const today = new Date().toISOString().slice(0, 10);
  const allQuestions = getAllCanonicalQuestions();

  // 1. Warm-up (3Q) from D1/F1
  const warmUpPool = [...DOJO_QUESTIONS.D1, ...SHRINE_QUESTIONS.F1];
  const warmUpQuestions = [...warmUpPool].sort(() => Math.random() - 0.5).slice(0, 3);

  // 2. Weak Skill Drill (5Q) based on player's lowest mastery
  const masteryEntries = Object.entries(profile.skillMastery || {});
  masteryEntries.sort((a, b) => a[1] - b[1]);
  const weakestSkill = masteryEntries[0]?.[0] || 'calculation';

  const weakPool = allQuestions.filter((q) => q.skillTags.includes(weakestSkill));
  const weakSkillQuestions = [...(weakPool.length >= 5 ? weakPool : allQuestions)]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  // 3. Campaign Practice (5Q) from O-NET / D3-D6
  const campaignPool = [...ONET_QUESTIONS['ONET-1'], ...ONET_QUESTIONS['ONET-2'], ...DOJO_QUESTIONS.D5];
  const campaignPracticeQuestions = [...campaignPool].sort(() => Math.random() - 0.5).slice(0, 5);

  // 4. Challenge (2Q) from Boss / Geometry
  const challengePool = [...BOSS_QUESTIONS['BOSS-1'], ...GEOMETRY_QUESTIONS];
  const challengeQuestions = [...challengePool].sort(() => Math.random() - 0.5).slice(0, 2);

  return {
    dateKey: today,
    warmUpQuestions,
    weakSkillQuestions,
    campaignPracticeQuestions,
    challengeQuestions,
  };
}

export function evaluateDailyQuestResult(
  config: DailyQuestConfig,
  profile: PlayerProfile,
  correctCount: number,
  totalTimeSec: number
): DailyQuestResult {
  const totalQuestions = 15;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);
  const avgSpeed = Math.round(totalTimeSec / totalQuestions);

  const masteryEntries = Object.entries(profile.skillMastery || {});
  masteryEntries.sort((a, b) => a[1] - b[1]);
  const weakestSkill = masteryEntries[0]?.[0] || 'calculation';

  const isAlreadyDoneToday = profile.dailyQuestLastCompletedDate === config.dateKey;
  const newStreak = isAlreadyDoneToday ? profile.dailyQuestStreak : profile.dailyQuestStreak + 1;

  const earnedXp = correctCount * 15 + (accuracy >= 80 ? 100 : 50);
  const earnedCoins = correctCount * 5 + (accuracy >= 80 ? 50 : 20);

  return {
    dateKey: config.dateKey,
    accuracy,
    averageSpeedSeconds: avgSpeed,
    weakSkillTarget: weakestSkill,
    weakSkillImprovementDelta: +0.05,
    earnedXp,
    earnedCoins,
    streakDays: newStreak,
    recommendedStage: accuracy >= 80 ? 'O-NET Gateway หรือ Last Boss Arena' : 'Training Dojo หรือ Tutor Room',
  };
}
