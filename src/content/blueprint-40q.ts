export interface BlueprintSpec {
  zone: 'DOJO' | 'SHRINE' | 'GATEWAY' | 'BOSS_WP';
  stageSource: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  cognitiveLevel: 'KNOWING' | 'APPLICATION' | 'ADVANCED_REASONING' | 'COMPETITION';
  questionType: 'MCQ' | 'GRID_RESPONSE';
  skillDomain: string;
  count: number;
}

export const GRANDMASTER_40Q_BLUEPRINT: BlueprintSpec[] = [
  // 1. Act 1: Training Dojo Foundations (10 Questions)
  { zone: 'DOJO', stageSource: 'D1', difficulty: 1, cognitiveLevel: 'KNOWING', questionType: 'MCQ', skillDomain: 'calculation', count: 2 },
  { zone: 'DOJO', stageSource: 'D2', difficulty: 1, cognitiveLevel: 'KNOWING', questionType: 'MCQ', skillDomain: 'mental_math', count: 2 },
  { zone: 'DOJO', stageSource: 'D3', difficulty: 2, cognitiveLevel: 'APPLICATION', questionType: 'MCQ', skillDomain: 'number_sense', count: 2 },
  { zone: 'DOJO', stageSource: 'D4', difficulty: 2, cognitiveLevel: 'APPLICATION', questionType: 'MCQ', skillDomain: 'geometry_spatial', count: 1 },
  { zone: 'DOJO', stageSource: 'D5', difficulty: 2, cognitiveLevel: 'APPLICATION', questionType: 'MCQ', skillDomain: 'trap_detection', count: 1 },
  { zone: 'DOJO', stageSource: 'D6', difficulty: 2, cognitiveLevel: 'APPLICATION', questionType: 'MCQ', skillDomain: 'fractions_decimals', count: 2 },

  // 2. Act 2: Farming Shrine Speed & Mental Math (10 Questions)
  { zone: 'SHRINE', stageSource: 'F1', difficulty: 2, cognitiveLevel: 'KNOWING', questionType: 'MCQ', skillDomain: 'mental_math', count: 2 },
  { zone: 'SHRINE', stageSource: 'F2', difficulty: 2, cognitiveLevel: 'KNOWING', questionType: 'MCQ', skillDomain: 'calculation', count: 3 },
  { zone: 'SHRINE', stageSource: 'F3', difficulty: 3, cognitiveLevel: 'APPLICATION', questionType: 'MCQ', skillDomain: 'number_sense', count: 3 },
  { zone: 'SHRINE', stageSource: 'F4', difficulty: 3, cognitiveLevel: 'APPLICATION', questionType: 'MCQ', skillDomain: 'calculation', count: 2 },

  // 3. Act 3: O-NET National Standards (10 Questions)
  { zone: 'GATEWAY', stageSource: 'ONET-1', difficulty: 2, cognitiveLevel: 'KNOWING', questionType: 'MCQ', skillDomain: 'fractions_decimals', count: 2 },
  { zone: 'GATEWAY', stageSource: 'ONET-2', difficulty: 3, cognitiveLevel: 'APPLICATION', questionType: 'MCQ', skillDomain: 'ratio_percentage_scale', count: 2 },
  { zone: 'GATEWAY', stageSource: 'ONET-3', difficulty: 3, cognitiveLevel: 'ADVANCED_REASONING', questionType: 'MCQ', skillDomain: 'algebraic_reasoning', count: 2 },
  { zone: 'GATEWAY', stageSource: 'ONET-4', difficulty: 4, cognitiveLevel: 'ADVANCED_REASONING', questionType: 'GRID_RESPONSE', skillDomain: 'ratio_percentage_scale', count: 4 },

  // 4. Act 4: Boss Citadels & Word Problems (10 Questions)
  { zone: 'BOSS_WP', stageSource: 'BOSS-1', difficulty: 4, cognitiveLevel: 'ADVANCED_REASONING', questionType: 'MCQ', skillDomain: 'geometry_spatial', count: 2 },
  { zone: 'BOSS_WP', stageSource: 'BOSS-2', difficulty: 4, cognitiveLevel: 'ADVANCED_REASONING', questionType: 'MCQ', skillDomain: 'algebraic_reasoning', count: 2 },
  { zone: 'BOSS_WP', stageSource: 'BOSS-3', difficulty: 5, cognitiveLevel: 'COMPETITION', questionType: 'MCQ', skillDomain: 'pattern_logic', count: 2 },
  { zone: 'BOSS_WP', stageSource: 'WP-100', difficulty: 3, cognitiveLevel: 'APPLICATION', questionType: 'MCQ', skillDomain: 'trap_detection', count: 2 },
  { zone: 'BOSS_WP', stageSource: 'GEO-50', difficulty: 4, cognitiveLevel: 'ADVANCED_REASONING', questionType: 'GRID_RESPONSE', skillDomain: 'geometry_spatial', count: 2 },
];
