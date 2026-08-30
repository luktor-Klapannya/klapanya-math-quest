import { PlayerProfile, TopFormEligibility } from '../types';

export function evaluateTopFormEligibility(profile: PlayerProfile): TopFormEligibility {
  const missingRequirements: string[] = [];

  const dojoStages = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];
  const dojoComplete = dojoStages.every((s) => profile.clearedStages.includes(s));
  if (!dojoComplete) missingRequirements.push('พิชิตครบ 6 เสาหลักโดโจน้ำแข็ง (Act 1: D1–D6)');

  const shrineStages = ['F1', 'F2', 'F3', 'F4'];
  const shrineSpeedMet = shrineStages.every((s) => profile.clearedStages.includes(s));
  if (!shrineSpeedMet) missingRequirements.push('พิชิตศาลเจ้าความเร็วออโรร่า (Act 2: F1–F4)');

  const gatewayStages = ['ONET-1', 'ONET-2', 'ONET-3', 'ONET-4'];
  const gatewayMasteryMet = gatewayStages.every((s) => profile.clearedStages.includes(s));
  if (!gatewayMasteryMet) missingRequirements.push('ผ่านประตูข้อสอบระดับชาติ (Act 3: ONET-1–4)');

  const boss1Defeated = profile.clearedStages.includes('BOSS-1');
  if (!boss1Defeated) missingRequirements.push('โค่น Cyber-Frost Dragon ณ Chulabhorn Citadel');

  const boss2Defeated = profile.clearedStages.includes('BOSS-2');
  if (!boss2Defeated) missingRequirements.push('โค่น Grandmaster Golem ณ SWCH Citadel');

  const boss3Defeated = profile.clearedStages.includes('BOSS-3');
  if (!boss3Defeated) missingRequirements.push('โค่น Archmage of Zero ณ Tri-Math Citadel');

  const geometryMastered = profile.clearedStages.includes('FORBIDDEN_GEOMETRY_RUINS');
  if (!geometryMastered) missingRequirements.push('ไขปริศนาโบราณสถาน Forbidden Geometry Ruins (50Q)');

  const questBoardMastered = profile.clearedStages.includes('ARCTIC_QUEST_BOARD');
  if (!questBoardMastered) missingRequirements.push('พิชิตกระดานภารกิจ Arctic Quest Board (100Q)');

  // Skill DNA threshold >= 75% average
  const masteryValues = Object.values(profile.skillMastery);
  const avgMastery = masteryValues.length > 0 ? masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length : 0;
  const skillDnaThresholdMet = avgMastery >= 0.70;
  if (!skillDnaThresholdMet) missingRequirements.push(`ค่าเฉลี่ย Skill DNA ต้องถึง 70% (ปัจจุบัน ${Math.round(avgMastery * 100)}%)`);

  // Final Grandmaster Trial >= 85%
  const finalTrialScoreMet = (profile.trialBestScore || 0) >= 85;
  if (!finalTrialScoreMet) missingRequirements.push(`คะแนนสอบ Final Grandmaster Trial ต้องได้ >= 85% (ปัจจุบัน ${profile.trialBestScore || 0}%)`);

  const isEligible =
    dojoComplete &&
    shrineSpeedMet &&
    gatewayMasteryMet &&
    boss1Defeated &&
    boss2Defeated &&
    boss3Defeated &&
    geometryMastered &&
    questBoardMastered &&
    skillDnaThresholdMet &&
    finalTrialScoreMet;

  return {
    isEligible,
    criteria: {
      dojoComplete,
      shrineSpeedMet,
      gatewayMasteryMet,
      boss1Defeated,
      boss2Defeated,
      boss3Defeated,
      geometryMastered,
      questBoardMastered,
      skillDnaThresholdMet,
      finalTrialScoreMet,
    },
    missingRequirements,
  };
}
