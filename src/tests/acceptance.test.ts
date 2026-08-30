import { HERO_CLASSES } from '../progression/hero-classes';
import { DOJO_STAGES, getQuestionsByStage, getTotalDojoQuestionCount } from '../content/dojo-database';
import { SHRINE_STAGES, getShrineQuestions, getTotalShrineQuestionCount } from '../content/shrine-database';
import { GATEWAY_STAGES, getGatewayQuestions, getTotalGatewayQuestionCount } from '../content/onet-database';
import { BOSS_CITADELS, getBossQuestions, getTotalBossQuestionCount } from '../content/boss-database';
import { GEOMETRY_CHAMBERS, getGeometryQuestions, getTotalGeometryQuestionCount, ALL_GEOMETRY_QUESTIONS } from '../content/geometry-database';
import { QUEST_MISSION_GROUPS, getQuestQuestions, getTotalQuestQuestionCount, ALL_QUEST_QUESTIONS } from '../content/quest-database';
import { sampleGrandmasterTrialQuestions } from '../engine/trial-sampler';
import { evaluateTopFormEligibility } from '../progression/top-form';
import { GEAR_DATABASE } from '../progression/gear-matrix';
import { TERRITORY_DATABASE } from '../progression/territory-matrix';
import { calculateSpeedGrade } from '../engine/speedrun-evaluator';
import { evaluateGridResponse } from '../engine/grid-normalizer';
import { calculateGatewayReadiness } from '../engine/gateway-readiness';
import { calculateBossDamage, calculateBossPerformanceTier, canForgeLegendaryAdmissionWeapon } from '../engine/boss-evaluator';
import { DEFAULT_PROFILE } from '../storage/local-storage-adapter';
import { HeroClassId } from '../types';

export function runTestSuite(): boolean {
  console.log('================================================================');
  console.log('  KLAPANYA MATH ADMISSION QUEST — FULL 710Q ACCEPTANCE SUITE    ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ✅ ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ❌ ${testName}`);
      failed++;
    }
  }

  // ==========================================
  // SECTION 1: HERO CLASS MATRIX
  // ==========================================
  console.log('--- 1. HERO CLASS MATRIX ---');
  const heroIds = Object.keys(HERO_CLASSES) as HeroClassId[];
  assert(heroIds.length === 4, 'Contains exactly 4 canonical hero classes');
  assert(HERO_CLASSES.CHRONOMANCER.activeName === 'Time Stop', 'Speed Chronomancer active skill is Time Stop');
  assert(HERO_CLASSES.PALADIN.passiveName === 'Iron Will', 'Logic Paladin passive skill is Iron Will');
  assert(HERO_CLASSES.SNIPER.activeName === 'Snipe', 'Eagle-Eye Sniper active skill is Snipe');
  assert(HERO_CLASSES.ROGUE.activeName === '50:50 Shadow', 'Reverse Rogue active skill is 50:50 Shadow');

  // ==========================================
  // SECTION 2: TRAINING DOJO (180 QUESTIONS)
  // ==========================================
  console.log('\n--- 2. TRAINING DOJO 180Q INTEGRITY ---');
  assert(DOJO_STAGES.length === 6, 'Dojo contains exactly 6 stations (D1-D6)');
  assert(getTotalDojoQuestionCount() === 180, 'Total Dojo questions equal exactly 180');
  DOJO_STAGES.forEach((st) => {
    const qList = getQuestionsByStage(st.id);
    assert(qList.length === 30, `Station ${st.id} has exactly 30 questions`);
  });

  // ==========================================
  // SECTION 3: FARMING SHRINE (120 QUESTIONS)
  // ==========================================
  console.log('\n--- 3. FARMING SHRINE 120Q INTEGRITY ---');
  assert(SHRINE_STAGES.length === 4, 'Farming Shrine contains exactly 4 stages (F1-F4)');
  assert(getTotalShrineQuestionCount() === 120, 'Total Shrine questions equal exactly 120');
  SHRINE_STAGES.forEach((st) => {
    const qList = getShrineQuestions(st.id);
    assert(qList.length === 30, `Shrine Stage ${st.id} has exactly 30 questions`);
  });

  // ==========================================
  // SECTION 4: O-NET GATEWAY (80 QUESTIONS)
  // ==========================================
  console.log('\n--- 4. O-NET GATEWAY 80Q INTEGRITY ---');
  assert(GATEWAY_STAGES.length === 4, 'O-NET Gateway contains exactly 4 tiers (ONET-1 -> ONET-4)');
  assert(getTotalGatewayQuestionCount() === 80, 'Total O-NET Gateway questions equal exactly 80');

  // ==========================================
  // SECTION 5: LAST BOSS ARENA (180 QUESTIONS)
  // ==========================================
  console.log('\n--- 5. LAST BOSS ARENA 180Q INTEGRITY ---');
  assert(BOSS_CITADELS.length === 3, 'Boss Arena contains exactly 3 Citadels (BOSS-1, BOSS-2, BOSS-3)');
  assert(getTotalBossQuestionCount() === 180, 'Total Boss questions equal exactly 180');
  BOSS_CITADELS.forEach((boss) => {
    const bQuestions = getBossQuestions(boss.id);
    assert(bQuestions.length === 60, `Citadel ${boss.id} has exactly 60 questions`);
    assert(boss.phases.length === 4, `Citadel ${boss.id} has 4 phases`);
  });

  // ==========================================
  // SECTION 6: FORBIDDEN GEOMETRY RUINS (50 QUESTIONS)
  // ==========================================
  console.log('\n--- 6. FORBIDDEN GEOMETRY RUINS 50Q INTEGRITY ---');
  assert(GEOMETRY_CHAMBERS.length === 5, 'Geometry Ruins contains exactly 5 chambers (GEO-1 -> GEO-5)');
  assert(getTotalGeometryQuestionCount() === 50, 'Total Geometry questions equal exactly 50');

  const formerBlockedQuestions = ALL_GEOMETRY_QUESTIONS.filter((q) =>
    ['GEO-045', 'GEO-046', 'GEO-047', 'GEO-048', 'GEO-049', 'GEO-050'].includes(q.id)
  );
  assert(formerBlockedQuestions.length === 6, 'All 6 former asset-blocked questions (GEO-045 to GEO-050) exist');
  assert(
    formerBlockedQuestions.every((q) => q.auditStatus === 'VERIFIED' && q.requiresDiagram === true),
    'All 6 former blocked questions are now VERIFIED with playable vector diagram definitions'
  );

  // ==========================================
  // SECTION 7: ARCTIC QUEST BOARD (100 QUESTIONS)
  // ==========================================
  console.log('\n--- 7. ARCTIC QUEST BOARD 100Q INTEGRITY ---');
  assert(QUEST_MISSION_GROUPS.length === 10, 'Arctic Quest Board contains exactly 10 mission groups');
  assert(getTotalQuestQuestionCount() === 100, 'Total Arctic Quest Board questions equal exactly 100');
  QUEST_MISSION_GROUPS.forEach((g) => {
    const gList = getQuestQuestions(g.id);
    assert(gList.length === 10, `Mission group ${g.name} has exactly 10 questions`);
  });

  // ==========================================
  // SECTION 8: 710Q CORPUS INVARIANT & ZERO DUPLICATES
  // ==========================================
  console.log('\n--- 8. 710Q GRAND CORPUS INTEGRITY & UNIQUENESS ---');
  const all710Questions = [
    ...getQuestionsByStage('D1'), ...getQuestionsByStage('D2'), ...getQuestionsByStage('D3'),
    ...getQuestionsByStage('D4'), ...getQuestionsByStage('D5'), ...getQuestionsByStage('D6'),
    ...getShrineQuestions('F1'), ...getShrineQuestions('F2'), ...getShrineQuestions('F3'), ...getShrineQuestions('F4'),
    ...getGatewayQuestions('ONET-1'), ...getGatewayQuestions('ONET-2'), ...getGatewayQuestions('ONET-3'), ...getGatewayQuestions('ONET-4'),
    ...getBossQuestions('BOSS-1'), ...getBossQuestions('BOSS-2'), ...getBossQuestions('BOSS-3'),
    ...ALL_GEOMETRY_QUESTIONS,
    ...ALL_QUEST_QUESTIONS,
  ];

  assert(all710Questions.length === 710, `Full corpus contains EXACTLY 710 questions (Current: ${all710Questions.length})`);

  const idSet = new Set<string>();
  let hasDuplicate = false;
  all710Questions.forEach((q) => {
    if (idSet.has(q.id)) hasDuplicate = true;
    idSet.add(q.id);
  });
  assert(!hasDuplicate && idSet.size === 710, 'All 710 question IDs are strictly unique (Zero duplicates)');

  const hasUnfixedContent = all710Questions.some((q) => q.auditStatus === 'CONTENT_FIX_REQUIRED');
  const hasAssetBlocked = all710Questions.some((q) => q.auditStatus === 'ASSET_BLOCKED');
  assert(!hasUnfixedContent, 'CONTENT_FIX_REQUIRED = 0 (100% remediated)');
  assert(!hasAssetBlocked, 'ASSET_BLOCKED = 0 (100% playable)');

  // ==========================================
  // SECTION 9: FINAL GRANDMASTER TRIAL SAMPLER (40Q)
  // ==========================================
  console.log('\n--- 9. FINAL TRIAL BLUEPRINT SAMPLER (40Q) ---');
  const sampledTrial = sampleGrandmasterTrialQuestions();
  assert(sampledTrial.length === 40, 'Final Trial sampler returns EXACTLY 40 questions');

  const trialIdSet = new Set<string>();
  sampledTrial.forEach((q) => trialIdSet.add(q.id));
  assert(trialIdSet.size === 40, 'Final Trial session has zero duplicate questions');

  const dojoSampleCount = sampledTrial.filter((q) => ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'].includes(q.stageId)).length;
  const shrineSampleCount = sampledTrial.filter((q) => ['F1', 'F2', 'F3', 'F4'].includes(q.stageId)).length;
  const onetSampleCount = sampledTrial.filter((q) => ['ONET-1', 'ONET-2', 'ONET-3', 'ONET-4'].includes(q.stageId)).length;
  const bossSampleCount = sampledTrial.filter((q) => ['BOSS-1', 'BOSS-2', 'BOSS-3'].includes(q.stageId)).length;
  const geoSampleCount = sampledTrial.filter((q) => q.stageId === 'FORBIDDEN_GEOMETRY_RUINS').length;
  const questSampleCount = sampledTrial.filter((q) => q.stageId === 'ARCTIC_QUEST_BOARD').length;

  assert(dojoSampleCount === 10, 'Blueprint: exactly 10 questions from Training Dojo');
  assert(shrineSampleCount === 10, 'Blueprint: exactly 10 questions from Farming Shrine');
  assert(onetSampleCount === 10, 'Blueprint: exactly 10 questions from O-NET Gateway');
  assert(bossSampleCount === 6, 'Blueprint: exactly 6 questions from Boss Arena (2 per Citadel)');
  assert(geoSampleCount === 2, 'Blueprint: exactly 2 questions from Geometry Ruins');
  assert(questSampleCount === 2, 'Blueprint: exactly 2 questions from Arctic Quest Board');

  // ==========================================
  // SECTION 10: TOP FORM ELIGIBILITY & ASCENSION
  // ==========================================
  console.log('\n--- 10. TOP FORM ELIGIBILITY & ASCENSION ---');

  const freshEligibility = evaluateTopFormEligibility(DEFAULT_PROFILE);
  assert(freshEligibility.isEligible === false, 'Fresh profile is correctly ineligible for Top Form');
  assert(freshEligibility.missingRequirements.length > 0, 'Ineligible profile lists specific missing requirements');

  const completedProfile = {
    ...DEFAULT_PROFILE,
    clearedStages: [
      'D1', 'D2', 'D3', 'D4', 'D5', 'D6',
      'F1', 'F2', 'F3', 'F4',
      'ONET-1', 'ONET-2', 'ONET-3', 'ONET-4',
      'BOSS-1', 'BOSS-2', 'BOSS-3',
      'FORBIDDEN_GEOMETRY_RUINS',
      'ARCTIC_QUEST_BOARD',
    ],
    skillMastery: {
      calculation: 0.85,
      mental_math: 0.80,
      number_sense: 0.80,
      fractions_decimals: 0.80,
      algebraic_reasoning: 0.80,
      geometry_spatial: 0.80,
      ratio_percentage_scale: 0.80,
      trap_detection: 0.80,
    },
    trialBestScore: 90,
  };

  const fullEligibility = evaluateTopFormEligibility(completedProfile);
  assert(fullEligibility.isEligible === true, 'Profile meeting all 10 gates qualifies for Top Form (>=85% Trial)');

  assert(GEAR_DATABASE.MYTHIC_ARCTIC_ARMOR !== undefined, 'Mythic Arctic Armor defined');
  assert(GEAR_DATABASE.CELESTIAL_ADMISSION_BLADE !== undefined, 'Celestial Admission Blade defined');
  assert(GEAR_DATABASE.ARCTIC_SOVEREIGN_HALO !== undefined, 'Arctic Sovereign Halo defined');

  // ==========================================
  // SECTION 11: TERRITORY FORM SYSTEM
  // ==========================================
  console.log('\n--- 11. TERRITORY FORM SYSTEM ARCHITECTURE ---');
  const arctic = TERRITORY_DATABASE.FROZEN_ARCTIC;
  assert(arctic !== undefined && arctic.status === 'ACTIVE', 'FROZEN_ARCTIC territory is defined and ACTIVE');
  assert(arctic.companionPets.length >= 3, 'FROZEN_ARCTIC includes at least 3 companion pets');
  
  heroIds.forEach((hId) => {
    const costumes = arctic.costumeSet[hId];
    const weapons = arctic.weaponSet[hId];
    const vfx = arctic.skillVfx[hId];

    assert(costumes && costumes.length === 4, `Hero ${hId} has 4 costume tiers in Frozen Arctic`);
    assert(weapons && weapons.length === 4, `Hero ${hId} has 4 weapon tiers in Frozen Arctic`);
    assert(vfx && vfx.primaryEffect !== '' && vfx.activeVFX !== '', `Hero ${hId} has complete skill VFX definitions`);
  });

  // Future territory preparedness
  const futureTerritories = ['SKY_CITADEL', 'VOLCANIC_FORGE', 'OCEAN_ABYSS', 'THAI_LEGEND'] as const;
  futureTerritories.forEach((tId) => {
    const tConfig = TERRITORY_DATABASE[tId];
    assert(tConfig !== undefined, `Future territory ${tId} is defined in TERRITORY_DATABASE`);
    assert(tConfig.status === 'PREPARED_FUTURE', `Future territory ${tId} is marked PREPARED_FUTURE`);
    assert(tConfig.uiTheme !== undefined && tConfig.mapTheme !== undefined, `Future territory ${tId} has UI and Map themes configured`);
  });

  // Exam mode neutrality verification
  assert(
    arctic.companionPets.every((p) => p.practiceFlavorBonus.includes('โหมดฝึกฝน') || p.practiceFlavorBonus.includes('ฝึกฝน')),
    'Companion pet bonuses are strictly restricted to practice mode (Cosmetic/Neutral in Exam Mode)'
  );

  console.log('\n================================================================');
  console.log(`TOTAL TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    throw new Error(`${failed} tests failed!`);
  }
  return true;
}

if (typeof window === 'undefined') {
  runTestSuite();
}
