import { HeroClassId, Question, StageSessionResult } from './index';

export type AvatarGender = 'BOY' | 'GIRL';

export type AvatarVisualId = 
  | 'BOY_WIZARD' 
  | 'BOY_KNIGHT' 
  | 'BOY_RANGER' 
  | 'BOY_ROGUE'
  | 'GIRL_WIZARD' 
  | 'GIRL_KNIGHT' 
  | 'GIRL_RANGER' 
  | 'GIRL_ROGUE';

export interface AvatarVisualProfile {
  id: AvatarVisualId;
  registryKey: string; // e.g. 'hero_m_speed_chronomancer'
  name: string;
  thaiName: string;
  gender: AvatarGender;
  recommendedHeroClass: HeroClassId;
  avatarSprite: string;
  portraitAsset?: string;
  fullBodyAsset?: string;
  battleAsset?: string;
  victoryAsset?: string;
  classEmblemAsset?: string;
  weaponAsset?: string;
  description: string;
  statFlavor: {
    calculationPower: number; // 0 - 100
    magicPower: number;       // 0 - 100
    speed: number;            // 0 - 100
    defense: number;          // 0 - 100
  };
}

export type ConsumableItemId = 
  | 'MAGIC_HINT'
  | 'DEEP_HINT_SCROLL'
  | 'FIFTY_FIFTY_RUNE'
  | 'TIME_POTION'
  | 'AEGIS_SHIELD'
  | 'RETRY_TOKEN'
  | 'REVEAL_STEP'
  | 'DIAGRAM_LENS';

export interface ConsumableItem {
  id: ConsumableItemId;
  name: string;
  thaiName: string;
  icon: string;
  coinPrice: number;
  description: string;
  effectDescription: string;
  isAllowedInExam: false; // Invariant: Practice only
}

export type SpecialSkillId = 
  | 'FROST_RECALL'
  | 'CHAIN_INSIGHT'
  | 'TRAP_SENSE'
  | 'PRECISION_FOCUS'
  | 'SECOND_WIND'
  | 'CRYSTAL_VISION'
  | 'REVERSE_CHECK'
  | 'MENTAL_BURST';

export interface SpecialSkill {
  id: SpecialSkillId;
  name: string;
  thaiName: string;
  icon: string;
  requiredMasteryLevel: number;
  requiredHeroRank: string;
  unlockDescription: string;
  effectDescription: string;
  cooldownBattles: number;
  isAllowedInExam: false; // Invariant: Practice only
}

export interface CodexChapter {
  id: number;
  title: string;
  thaiTitle: string;
  icon: string;
  summary: string;
  topics: CodexTopic[];
  linkedStages: string[];
}

export interface CodexTopic {
  id: string;
  title: string;
  coreConcept: string;
  formulaOrShortcut: string;
  workedExample: {
    problem: string;
    steps: string[];
    answer: string;
  };
  commonTrap: string;
  linkedSkills: string[];
  sampleQuestionId?: string;
}

export interface TutorLesson {
  stageId: string;
  title: string;
  thaiTitle: string;
  targetMinutes: number;
  steps: {
    concept: string;
    keyPrinciple: string;
    shortcut: string;
    commonTrap: string;
    workedExample: {
      problem: string;
      stepByStep: string[];
      answer: string;
    };
    tryOneQuestion: Question;
  };
}

export type DrillType = 
  | 'QUICK_DRILL'     // 5 questions
  | 'SKILL_DRILL'     // 10 questions focused on 1 skill
  | 'TRAP_DRILL'      // Questions linked to 1 misconception
  | 'SPEED_DRILL'     // Timed fluency set (5-10s per Q)
  | 'RECOVERY_DRILL'; // Weak Skill DNA targeted

export interface DrillConfig {
  type: DrillType;
  title: string;
  targetSkillId?: string;
  targetMisconception?: string;
  timeLimitSeconds?: number;
  questions: Question[];
}

export interface DrillResult {
  type: DrillType;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTimeSeconds: number;
  firstAttemptSuccessCount: number;
  hintUsageCount: number;
  skillImprovedId: string;
  earnedCoins: number;
  earnedXp: number;
  recommendedNextAction: string;
}

export interface RemediationFeedback {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  misconceptionIdentified: string;
  trapExplanation: string;
  scaffoldHint: string;
  fullSolution: string;
  shortcutTip?: string;
  similarQuestion?: Question;
}

export interface DailyQuestConfig {
  dateKey: string;
  warmUpQuestions: Question[];     // 3Q
  weakSkillQuestions: Question[];   // 5Q
  campaignPracticeQuestions: Question[]; // 5Q
  challengeQuestions: Question[];  // 2Q
}

export interface DailyQuestResult {
  dateKey: string;
  accuracy: number;
  averageSpeedSeconds: number;
  weakSkillTarget: string;
  weakSkillImprovementDelta: number;
  earnedXp: number;
  earnedCoins: number;
  streakDays: number;
  recommendedStage: string;
}
