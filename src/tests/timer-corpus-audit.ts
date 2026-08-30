import { getQuestionsByStage } from '../content/dojo-database';
import { getShrineQuestions } from '../content/shrine-database';
import { getGatewayQuestions } from '../content/onet-database';
import { getBossQuestions } from '../content/boss-database';
import { ALL_GEOMETRY_QUESTIONS } from '../content/geometry-database';
import { ALL_QUEST_QUESTIONS } from '../content/quest-database';
import { calculateEffectiveTimeSec, STAGE_TIMER_BOUNDS } from '../engine/adaptive-timer-engine';

export const ALL_710_QUESTIONS = [
  ...getQuestionsByStage('D1'), ...getQuestionsByStage('D2'), ...getQuestionsByStage('D3'),
  ...getQuestionsByStage('D4'), ...getQuestionsByStage('D5'), ...getQuestionsByStage('D6'),
  ...getShrineQuestions('F1'), ...getShrineQuestions('F2'), ...getShrineQuestions('F3'), ...getShrineQuestions('F4'),
  ...getGatewayQuestions('ONET-1'), ...getGatewayQuestions('ONET-2'), ...getGatewayQuestions('ONET-3'), ...getGatewayQuestions('ONET-4'),
  ...getBossQuestions('BOSS-1'), ...getBossQuestions('BOSS-2'), ...getBossQuestions('BOSS-3'),
  ...ALL_GEOMETRY_QUESTIONS,
  ...ALL_QUEST_QUESTIONS,
];

interface ZoneTimerStats {
  zoneName: string;
  stageIds: string[];
  totalQuestions: number;
  minEffectiveSec: number;
  medianEffectiveSec: number;
  maxEffectiveSec: number;
  hittingMinClampCount: number;
  hittingMaxClampCount: number;
}

export function run710QTimerSanityAudit(): Record<string, ZoneTimerStats> {
  const zones: Record<string, { name: string; filter: (stageId: string) => boolean }> = {
    DOJO: { name: 'Training Dojo (180Q)', filter: (s) => ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'].includes(s) },
    SHRINE: { name: 'Farming Shrine (120Q)', filter: (s) => ['F1', 'F2', 'F3', 'F4'].includes(s) },
    ONET: { name: 'O-NET Gateway (80Q)', filter: (s) => ['ONET-1', 'ONET-2', 'ONET-3', 'ONET-4'].includes(s) },
    BOSS: { name: 'Boss Citadels (180Q)', filter: (s) => ['BOSS-1', 'BOSS-2', 'BOSS-3'].includes(s) },
    GEOMETRY: { name: 'Geometry Ruins (50Q)', filter: (s) => s === 'FORBIDDEN_GEOMETRY_RUINS' },
    QUEST: { name: 'Arctic Quest Board (100Q)', filter: (s) => s === 'ARCTIC_QUEST_BOARD' },
  };

  const results: Record<string, ZoneTimerStats> = {};

  for (const [key, config] of Object.entries(zones)) {
    const questions = ALL_710_QUESTIONS.filter((q) => config.filter(q.stageId));
    const effectiveTimes: number[] = [];
    let hitMinCount = 0;
    let hitMaxCount = 0;

    questions.forEach((q) => {
      const eff = calculateEffectiveTimeSec({
        baseTargetTimeSec: q.targetTimeSec,
        difficulty: q.difficulty,
        questionType: q.mechanicType,
        stageId: q.stageId,
        requiresDiagram: q.requiresDiagram,
        isMultiStep: q.mechanicType === 'MULTI_STEP_SURVIVAL',
      });

      effectiveTimes.push(eff);

      const bounds = STAGE_TIMER_BOUNDS[q.stageId] || { minSec: 15, maxSec: 120 };
      if (eff === bounds.minSec) hitMinCount++;
      if (eff === bounds.maxSec) hitMaxCount++;
    });

    effectiveTimes.sort((a, b) => a - b);
    const min = effectiveTimes[0] || 0;
    const max = effectiveTimes[effectiveTimes.length - 1] || 0;
    const midIdx = Math.floor(effectiveTimes.length / 2);
    const median = effectiveTimes.length % 2 !== 0 
      ? effectiveTimes[midIdx] 
      : Math.round((effectiveTimes[midIdx - 1] + effectiveTimes[midIdx]) / 2);

    results[key] = {
      zoneName: config.name,
      stageIds: Array.from(new Set(questions.map((q) => q.stageId))),
      totalQuestions: questions.length,
      minEffectiveSec: min,
      medianEffectiveSec: median,
      maxEffectiveSec: max,
      hittingMinClampCount: hitMinCount,
      hittingMaxClampCount: hitMaxCount,
    };
  }

  return results;
}

const audit = run710QTimerSanityAudit();
console.log('\n================================================================');
console.log('       710Q GRAND CORPUS ADAPTIVE TIMER SANITY AUDIT            ');
console.log('================================================================');
for (const [key, stats] of Object.entries(audit)) {
  console.log(`\nZone: ${stats.zoneName}`);
  console.log(`- Total Questions: ${stats.totalQuestions}`);
  console.log(`- Min Effective: ${stats.minEffectiveSec}s | Median: ${stats.medianEffectiveSec}s | Max Effective: ${stats.maxEffectiveSec}s`);
  console.log(`- Hitting Min Clamp: ${stats.hittingMinClampCount} (${Math.round((stats.hittingMinClampCount / stats.totalQuestions) * 100)}%)`);
  console.log(`- Hitting Max Clamp: ${stats.hittingMaxClampCount} (${Math.round((stats.hittingMaxClampCount / stats.totalQuestions) * 100)}%)`);
}
