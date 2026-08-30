import { Question, PlayerProfile } from '../types';
import { DrillType, DrillConfig, DrillResult } from '../types/learning';
import { DOJO_QUESTIONS } from '../content/dojo-database';
import { SHRINE_QUESTIONS } from '../content/shrine-database';
import { ONET_QUESTIONS } from '../content/onet-database';
import { BOSS_QUESTIONS } from '../content/boss-database';
import { GEOMETRY_QUESTIONS } from '../content/geometry-database';
import { QUEST_QUESTIONS } from '../content/quest-database';

export function getAllCanonicalQuestions(): Question[] {
  const dojoList = Object.values(DOJO_QUESTIONS).flat();
  const shrineList = Object.values(SHRINE_QUESTIONS).flat();
  const onetList = Object.values(ONET_QUESTIONS).flat();
  const bossList = Object.values(BOSS_QUESTIONS).flat();
  return [
    ...dojoList,
    ...shrineList,
    ...onetList,
    ...bossList,
    ...GEOMETRY_QUESTIONS,
    ...QUEST_QUESTIONS,
  ];
}

export function generateDrillSession(
  type: DrillType,
  profile: PlayerProfile,
  specificSkillOrTrap?: string
): DrillConfig {
  const allQuestions = getAllCanonicalQuestions();

  if (type === 'QUICK_DRILL') {
    // 5 random questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    return {
      type: 'QUICK_DRILL',
      title: '⚡ ควิกดริลล์ 5 ข้อ (Quick 5Q Drill)',
      timeLimitSeconds: 150,
      questions: shuffled,
    };
  }

  if (type === 'SKILL_DRILL') {
    const targetSkill = specificSkillOrTrap || 'calculation';
    const filtered = allQuestions.filter((q) => q.skillTags.includes(targetSkill));
    const pool = filtered.length >= 10 ? filtered : allQuestions;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    return {
      type: 'SKILL_DRILL',
      title: `🎯 สกิลดริลล์: ${targetSkill} (10 ข้อ)`,
      targetSkillId: targetSkill,
      timeLimitSeconds: 300,
      questions: shuffled,
    };
  }

  if (type === 'TRAP_DRILL') {
    const targetTrap = specificSkillOrTrap || 'PEMDAS_ORDER';
    const filtered = allQuestions.filter((q) => q.misconceptionTags.some((t: string) => t.includes(targetTrap)));
    const pool = filtered.length >= 5 ? filtered : allQuestions.filter((q) => q.misconceptionTags.length > 0);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
    return {
      type: 'TRAP_DRILL',
      title: `🕳️ ปราบกับดักโจทย์: ${targetTrap} (5 ข้อ)`,
      targetMisconception: targetTrap,
      timeLimitSeconds: 180,
      questions: shuffled,
    };
  }

  if (type === 'SPEED_DRILL') {
    // Fast arithmetic set from Shrine F1 / D1
    const fastQuestions = [...SHRINE_QUESTIONS.F1, ...DOJO_QUESTIONS.D1];
    const shuffled = [...fastQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    return {
      type: 'SPEED_DRILL',
      title: '🏎️ สปีดดริลล์คิดเลขเร็ว (10 ข้อ / 10 วิ)',
      timeLimitSeconds: 100,
      questions: shuffled,
    };
  }

  // RECOVERY_DRILL: Find the lowest mastery skill from PlayerProfile
  const masteryEntries = Object.entries(profile.skillMastery || {});
  masteryEntries.sort((a, b) => a[1] - b[1]);
  const weakestSkill = masteryEntries[0]?.[0] || 'calculation';

  const weakPool = allQuestions.filter((q) => q.skillTags.includes(weakestSkill));
  const pool = weakPool.length >= 8 ? weakPool : allQuestions;
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);

  return {
    type: 'RECOVERY_DRILL',
    title: `🛡️ รีโคฟเวอรีดริลล์ ซ่อมทักษะอ่อน: ${weakestSkill} (8 ข้อ)`,
    targetSkillId: weakestSkill,
    timeLimitSeconds: 240,
    questions: shuffled,
  };
}

export function evaluateDrillResult(
  config: DrillConfig,
  correctCount: number,
  totalTimeSec: number,
  firstAttemptSuccessCount: number,
  hintUsageCount: number
): DrillResult {
  const accuracy = Math.round((correctCount / config.questions.length) * 100);
  const avgTime = Math.round(totalTimeSec / config.questions.length);
  const skillImprovedId = config.targetSkillId || 'general_mastery';

  const earnedCoins = correctCount * 5 + (accuracy >= 80 ? 20 : 0);
  const earnedXp = correctCount * 10 + (accuracy >= 80 ? 40 : 0);

  let nextAction = 'กลับสู่แผนที่หลักเพื่อลุยด่านถัดไป';
  if (accuracy < 60) nextAction = 'แนะนำให้เข้าติวใน Tutor Room หรือทบทวนใน Formula Codex เพิ่มเติม';
  else if (accuracy >= 90) nextAction = 'ความแม่นยำยอดเยี่ยม! พร้อมสำหรับโหมด Challenge หรือ O-NET Exam';

  return {
    type: config.type,
    totalQuestions: config.questions.length,
    correctAnswers: correctCount,
    accuracy,
    averageTimeSeconds: avgTime,
    firstAttemptSuccessCount,
    hintUsageCount,
    skillImprovedId,
    earnedCoins,
    earnedXp,
    recommendedNextAction: nextAction,
  };
}
