export type HeroClassId = 'CHRONOMANCER' | 'PALADIN' | 'SNIPER' | 'ROGUE';

export interface HeroClass {
  id: HeroClassId;
  name: string;
  thaiName: string;
  avatar: string;
  style: string;
  passiveName: string;
  passiveDescription: string;
  activeName: string;
  activeDescription: string;
  cooldownSeconds: number;
  color: string;
}

// --- Territory Form System Types ---
export type TerritoryId = 
  | 'FROZEN_ARCTIC' 
  | 'SKY_CITADEL' 
  | 'VOLCANIC_FORGE' 
  | 'OCEAN_ABYSS' 
  | 'THAI_LEGEND';

export interface TerritoryCostume {
  tier: 1 | 2 | 3 | 4;
  name: string;
  thaiName: string;
  description: string;
  avatarVariant: string;
  rankRequired: string;
}

export interface TerritoryWeapon {
  tier: 1 | 2 | 3 | 4;
  name: string;
  thaiName: string;
  description: string;
  icon: string;
}

export interface TerritorySkillVFX {
  primaryEffect: string;
  activeVFX: string;
  passiveVFX: string;
  topFormAura: string;
}

export interface TerritoryUITheme {
  primaryGradient: string;
  accentColor: string;
  cardBg: string;
  glowShadow: string;
  borderStyle: string;
  badgeStyle: string;
}

export interface TerritoryPet {
  id: string;
  name: string;
  thaiName: string;
  avatar: string;
  description: string;
  practiceFlavorBonus: string; // Practice/Boss Practice cosmetic/flavor only
}

export interface TerritoryFormConfig {
  id: TerritoryId;
  name: string;
  thaiName: string;
  tagline: string;
  status: 'ACTIVE' | 'PREPARED_FUTURE';
  costumeSet: Record<HeroClassId, TerritoryCostume[]>;
  weaponSet: Record<HeroClassId, TerritoryWeapon[]>;
  skillVfx: Record<HeroClassId, TerritorySkillVFX>;
  uiTheme: TerritoryUITheme;
  mapTheme: {
    backgroundClass: string;
    ambientTitle: string;
    weatherEffect: string;
  };
  companionPets: TerritoryPet[];
  topFormVisuals: {
    title: string;
    thaiTitle: string;
    haloIcon: string;
    auraEffect: string;
    regaliaName: string;
  };
}

export type CognitiveLevel = 'KNOWING' | 'APPLICATION' | 'ADVANCED_REASONING' | 'COMPETITION';
export type MechanicType = 
  | 'MCQ_STANDARD' | 'SPEED_DUEL' | 'COMBO_RUSH' | 'TRAP_HUNT' 
  | 'ICE_BRIDGE' | 'NUMBER_LOCK' | 'SEQUENCE_PATH' | 'OPTION_ELIMINATION' 
  | 'MULTI_STEP_SURVIVAL' | 'DIAGRAM_INSPECTION' | 'GEOMETRY_ROTATE' 
  | 'BOSS_STRIKE' | 'GRID_RESPONSE' | 'FINAL_EXAM';

export type AuditStatus = 'VERIFIED' | 'VERIFIED_WITH_TRAP_TAG' | 'CONTENT_FIX_REQUIRED' | 'ASSET_BLOCKED';

export type NumericValidationPolicy = 'EXACT' | 'TOLERANCE' | 'ROUND_TO_N_DECIMALS' | 'FRACTION_EQUIVALENT';

export interface QuestionOption {
  id: string; // Stable internal key
  displayLetter?: string; // 'A', 'B', 'C', 'D'
  text: string;
  isCorrect: boolean;
}

export interface QuestionItem {
  id: string;
  stageId: string;
  phaseId?: 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'PHASE_4';
  missionGroupId?: string;
  chamberId?: string;
  topic: string;
  subtopic: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  cognitiveLevel: CognitiveLevel;
  mechanicType: MechanicType;
  skillTags: string[];
  misconceptionTags: string[];
  auditStatus: AuditStatus;
  
  questionText: string;
  options: QuestionOption[];
  correctNumericalValue?: string;
  numericValidation?: NumericValidationPolicy;
  roundingDecimals?: number;
  
  powerUpHint: string;
  hintLevel2?: string;
  explanation: string;
  shortcutNote?: string;
  trapWarning?: string;
  
  targetTimeSec: number;
  rewardCoins: number;
  rewardXp: number;
  bossDamage?: number;
  requiresDiagram?: boolean;
  diagramType?: 'CUBE_NET' | 'PARALLEL_ANGLES' | 'SHADED_CIRCLE' | 'CYLINDER_WATER' | 'COMPOSITE_3D' | 'POLYGON_GRID';
  diagramData?: Record<string, unknown>;
}

export interface StageInfo {
  id: string;
  name: string;
  thaiName: string;
  academicFocus: string;
  questionCount: number;
  targetTimeSec: number;
  gearRewardId: string;
  requiredStageId: string | null;
  passAccuracy: number;
  masteryAccuracy: number;
}

export type SpeedGrade = 'S' | 'A' | 'B' | 'C' | 'TRAIN_AGAIN';
export type ShrineRunMode = 'PRACTICE' | 'RANKED';
export type ShrineRunSize = 10 | 20 | 30;

export interface ShrineRunResult {
  stageId: string;
  runMode: ShrineRunMode;
  runSize: ShrineRunSize;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  speedGrade: SpeedGrade;
  totalTimeSec: number;
  averageTimeSec: number;
  fastestAnswerSec: number;
  maxCombo: number;
  perfectHits: number;
  timeouts: number;
  earnedCoins: number;
  earnedXp: number;
  earnedMaterial: string | null;
  materialCount: number;
  masteryUpdates: Record<string, { before: number; after: number }>;
  isPassed: boolean;
  isMasteryMet: boolean;
}

// --- O-NET Gateway Types ---
export type GatewayRunMode = 'PRACTICE' | 'EXAM';
export type GatewayReadinessLevel = 'FOUNDATION' | 'DEVELOPING' | 'PROFICIENT' | 'ADVANCED' | 'MASTER';

export interface ExamAnswerRecord {
  questionId: string;
  selectedOptionId: string | null;
  numericalInput: string | null;
  isMarkedForReview: boolean;
  answerChangeCount: number;
  timeSpentSec: number;
  firstAttemptCorrect?: boolean;
}

export interface GatewayExamResult {
  stageId: string;
  runMode: GatewayRunMode;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  readinessLevel: GatewayReadinessLevel;
  totalTimeSec: number;
  averageTimeSec: number;
  markedReviewCount: number;
  earnedCoins: number;
  earnedXp: number;
  unlockedGear: string | null;
  masteryUpdates: Record<string, { before: number; after: number }>;
  misconceptionProfile: Record<string, number>;
  isPassed: boolean;
  isMasteryMet: boolean;
}

// --- Boss Arena Types ---
export type BossPerformanceTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'MYTHIC' | 'DEFEATED_FAILED';
export type BossBattleMode = 'PRACTICE' | 'CHALLENGE';
export type BossPhaseId = 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'PHASE_4';

export interface BossInfo {
  id: string;
  name: string;
  thaiName: string;
  avatar: string;
  citadelTitle: string;
  academicFocus: string;
  maxHp: number;
  phases: {
    id: BossPhaseId;
    name: string;
    description: string;
    questionCount: number;
  }[];
  victoryRelicId: string;
}

export interface BossBattleResult {
  bossId: string;
  bossName: string;
  mode: BossBattleMode;
  isVictory: boolean;
  finalBossHp: number;
  playerResolveRemaining: number;
  performanceTier: BossPerformanceTier;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  totalDamageDealt: number;
  criticalHits: number;
  phaseFailures: number;
  totalTimeSec: number;
  averageTimeSec: number;
  earnedCoins: number;
  earnedXp: number;
  unlockedRelic: string | null;
  forgeUnlocked: boolean;
  masteryUpdates: Record<string, { before: number; after: number }>;
  misconceptionProfile: Record<string, number>;
}

// --- Grandmaster Trial & Top Form Types ---
export interface GrandmasterTrialResult {
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  isPassed: boolean;
  isTopFormQualified: boolean;
  totalTimeSec: number;
  averageTimeSec: number;
  markedReviewCount: number;
  earnedCoins: number;
  earnedXp: number;
  masteryUpdates: Record<string, { before: number; after: number }>;
  misconceptionProfile: Record<string, number>;
}

export interface TopFormEligibility {
  isEligible: boolean;
  criteria: {
    dojoComplete: boolean;
    shrineSpeedMet: boolean;
    gatewayMasteryMet: boolean;
    boss1Defeated: boolean;
    boss2Defeated: boolean;
    boss3Defeated: boolean;
    geometryMastered: boolean;
    questBoardMastered: boolean;
    skillDnaThresholdMet: boolean;
    finalTrialScoreMet: boolean;
  };
  missingRequirements: string[];
}

export interface PlayerProfile {
  heroId: HeroClassId;
  heroName: string;
  currentTerritoryId: TerritoryId;
  activePetId: string;
  level: number;
  xp: number;
  coins: number;
  rank: string;
  unlockedGear: string[];
  materials: Record<string, number>;
  clearedStages: string[];
  stageStars: Record<string, number>;
  stageBestAccuracy: Record<string, number>;
  shrineBestGrades: Record<string, SpeedGrade>;
  gatewayReadiness: Record<string, GatewayReadinessLevel>;
  bossPerformanceTiers: Record<string, BossPerformanceTier>;
  bossPhaseCheckpoints: Record<string, BossPhaseId>;
  isFrostCoreForgeUnlocked: boolean;
  isTopFormUnlocked: boolean;
  trialBestScore: number;
  skillMastery: Record<string, number>;
  activeActiveSkillCooldown: number;
}

export interface StageSessionResult {
  stageId: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  totalTimeSec: number;
  averageTimeSec: number;
  earnedCoins: number;
  earnedXp: number;
  masteryUpdates: Record<string, { before: number; after: number }>;
  unlockedGear: string | null;
  isPassed: boolean;
  isMasteryMet: boolean;
}
