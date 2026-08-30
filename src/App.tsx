import React, { useState, useEffect } from 'react';
import { 
  PlayerProfile, 
  HeroClassId, 
  StageSessionResult, 
  ShrineRunMode, 
  ShrineRunSize, 
  ShrineRunResult, 
  GatewayRunMode, 
  GatewayExamResult, 
  BossBattleMode, 
  BossPhaseId, 
  BossBattleResult,
  GrandmasterTrialResult,
  QuestionItem
} from './types';
import { AvatarVisualId, AvatarGender, DrillConfig, DrillResult, TutorLesson } from './types/learning';
import { DEFAULT_PROFILE, LocalStorageAdapter } from './storage/local-storage-adapter';
import { HERO_CLASSES } from './progression/hero-classes';
import { DOJO_STAGES, getDojoQuestions } from './content/dojo-database';
import { SHRINE_STAGES, getShrineQuestions } from './content/shrine-database';
import { GATEWAY_STAGES, getGatewayQuestions } from './content/onet-database';
import { BOSS_CITADELS, getBossQuestions } from './content/boss-database';
import { ALL_GEOMETRY_QUESTIONS } from './content/geometry-database';
import { ALL_QUEST_QUESTIONS } from './content/quest-database';
import { sampleGrandmasterTrialQuestions } from './engine/trial-sampler';
import { evaluateTopFormEligibility } from './progression/top-form';
import { getTutorLessonForStage } from './progression/tutor-database';
import { generateDrillSession } from './engine/drill-engine';
import { generateDailyQuestSession } from './engine/daily-quest-engine';

// UI Screens & Modals
import { AvatarHeroSelectScreen } from './ui/screens/AvatarHeroSelectScreen';
import { HeroSelectScreen } from './ui/screens/HeroSelectScreen';
import { MapScreen } from './ui/screens/MapScreen';
import { StageDetailScreen } from './ui/screens/StageDetailScreen';
import { TutorRoomScreen } from './ui/screens/TutorRoomScreen';
import { DrillCenterScreen } from './ui/screens/DrillCenterScreen';
import { SkillInventoryScreen } from './ui/screens/SkillInventoryScreen';
import { BattleScreen } from './ui/screens/BattleScreen';
import { ResultScreen } from './ui/screens/ResultScreen';
import { ShrineSpeedrunScreen } from './ui/screens/ShrineSpeedrunScreen';
import { ShrineResultScreen } from './ui/screens/ShrineResultScreen';
import { GatewayExamScreen } from './ui/screens/GatewayExamScreen';
import { GatewayResultScreen } from './ui/screens/GatewayResultScreen';
import { BossArenaScreen } from './ui/screens/BossArenaScreen';
import { BossResultScreen } from './ui/screens/BossResultScreen';
import { GeometryScreen } from './ui/screens/GeometryScreen';
import { QuestBoardScreen } from './ui/screens/QuestBoardScreen';
import { FinalTrialScreen } from './ui/screens/FinalTrialScreen';
import { TopFormCeremonyScreen } from './ui/screens/TopFormCeremonyScreen';
import { InventoryScreen } from './ui/screens/InventoryScreen';
import { ReviewHubScreen } from './ui/screens/ReviewHubScreen';
import { MagicMarketModal } from './ui/modals/MagicMarketModal';
import { FormulaCodexModal } from './ui/modals/FormulaCodexModal';
import { LoginScreen } from './ui/screens/LoginScreen';
import { StudentHomeScreen } from './ui/screens/StudentHomeScreen';
import { TeacherHomeScreen } from './ui/screens/TeacherHomeScreen';
import { BattleLobbyScreen } from './ui/screens/BattleLobbyScreen';
import { ClassroomBattleScreen } from './ui/screens/ClassroomBattleScreen';
import { BattleReviewScreen } from './ui/screens/BattleReviewScreen';
import { TeacherBattleConsoleScreen } from './ui/screens/TeacherBattleConsoleScreen';
import { authService } from './services/auth-service';
import { UserSession, StudentSession, TeacherSession } from './types/auth';
import { BattleRoom, BattlePlayerState } from './types/battle';

type AppScreen = 
  | 'LOGIN'
  | 'STUDENT_HOME'
  | 'TEACHER_HOME'
  | 'BATTLE_LOBBY'
  | 'CLASSROOM_BATTLE'
  | 'BATTLE_REVIEW'
  | 'TEACHER_BATTLE_CONSOLE'
  | 'AVATAR_SELECT'
  | 'HERO_SELECT' 
  | 'MAP' 
  | 'STAGE_DETAIL'
  | 'TUTOR_ROOM'
  | 'DRILL_CENTER'
  | 'DRILL_SESSION'
  | 'SKILL_INVENTORY'
  | 'DOJO_BATTLE' 
  | 'DOJO_RESULT' 
  | 'SHRINE_BATTLE' 
  | 'SHRINE_RESULT'
  | 'GATEWAY_EXAM'
  | 'GATEWAY_RESULT'
  | 'BOSS_BATTLE'
  | 'BOSS_RESULT'
  | 'GEOMETRY'
  | 'QUEST_BOARD'
  | 'FINAL_TRIAL'
  | 'TOP_FORM_CEREMONY'
  | 'INVENTORY'
  | 'REVIEW_HUB';

export const App: React.FC = () => {
  const storage = new LocalStorageAdapter();
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('AVATAR_SELECT');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [showMarketModal, setShowMarketModal] = useState<boolean>(false);
  const [showCodexModal, setShowCodexModal] = useState<boolean>(false);
  const [codexInitialChapter, setCodexInitialChapter] = useState<number>(1);

  // Selected Stage / Prep state
  const [selectedPrepStageId, setSelectedPrepStageId] = useState<string>('D1');
  const [activeTutorLesson, setActiveTutorLesson] = useState<TutorLesson>(getTutorLessonForStage('D1'));

  // Drill state
  const [activeDrillConfig, setActiveDrillConfig] = useState<DrillConfig | null>(null);

  // Dojo state
  const [activeDojoStageId, setActiveDojoStageId] = useState<string>('D1');
  const [dojoSessionResult, setDojoSessionResult] = useState<StageSessionResult | null>(null);

  // Shrine state
  const [activeShrineStageId, setActiveShrineStageId] = useState<string>('F1');
  const [shrineMode, setShrineMode] = useState<ShrineRunMode>('RANKED');
  const [shrineRunSize, setShrineRunSize] = useState<ShrineRunSize>(10);
  const [shrineResult, setShrineResult] = useState<ShrineRunResult | null>(null);

  // Gateway state
  const [activeGatewayStageId, setActiveGatewayStageId] = useState<string>('ONET-1');
  const [gatewayMode, setGatewayMode] = useState<GatewayRunMode>('EXAM');
  const [gatewayResult, setGatewayResult] = useState<GatewayExamResult | null>(null);

  // Boss state
  const [activeBossId, setActiveBossId] = useState<string>('BOSS-1');
  const [bossMode, setBossMode] = useState<BossBattleMode>('CHALLENGE');
  const [bossPhaseId, setBossPhaseId] = useState<BossPhaseId>('PHASE_1');
  const [bossResult, setBossResult] = useState<BossBattleResult | null>(null);

  // Final Trial state
  const [trialQuestions, setTrialQuestions] = useState<QuestionItem[]>([]);

  // Auth & Session state
  const [session, setSession] = useState<UserSession | null>(authService.getCurrentSession());

  // Classroom Battle state
  const [activeBattleRoom, setActiveBattleRoom] = useState<BattleRoom | null>(null);
  const [activeBattlePlayer, setActiveBattlePlayer] = useState<BattlePlayerState | null>(null);

  // Load saved profile on mount
  useEffect(() => {
    async function init() {
      const saved = await storage.loadProfile();
      if (saved) {
        setProfile(saved);
        if (saved.clearedStages.length > 0) {
          setCurrentScreen(session?.role === 'TEACHER' ? 'TEACHER_HOME' : 'STUDENT_HOME');
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const updateProfile = async (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    await storage.saveProfile(newProfile);
  };

  const handleConfirmCharacter = async (
    heroId: HeroClassId,
    avatarId: AvatarVisualId,
    gender: AvatarGender,
    heroName: string
  ) => {
    const updated: PlayerProfile = {
      ...profile,
      heroId,
      avatarVisualId: avatarId,
      avatarGender: gender,
      heroName,
    };
    await updateProfile(updated);
    setCurrentScreen('MAP');
  };

  // Open Stage Preparation Detail Screen
  const handleOpenStageDetail = (stageId: string) => {
    setSelectedPrepStageId(stageId);
    setActiveTutorLesson(getTutorLessonForStage(stageId));
    setCurrentScreen('STAGE_DETAIL');
  };

  // Open Tutor Room directly
  const handleOpenTutor = (stageId: string = 'D1') => {
    setSelectedPrepStageId(stageId);
    setActiveTutorLesson(getTutorLessonForStage(stageId));
    setCurrentScreen('TUTOR_ROOM');
  };

  // Open Drill Center directly or with preconfigured drill
  const handleOpenDrill = (drillType: string = 'QUICK_DRILL') => {
    const dSession = generateDrillSession(drillType as any, profile);
    setActiveDrillConfig(dSession);
    setCurrentScreen('DRILL_SESSION');
  };

  // Start Daily Quest session
  const handleStartDailyQuest = () => {
    const qSession = generateDailyQuestSession(profile);
    const combinedQuestions = [
      ...qSession.warmUpQuestions,
      ...qSession.weakSkillQuestions,
      ...qSession.campaignPracticeQuestions,
      ...qSession.challengeQuestions,
    ];
    setActiveDrillConfig({
      type: 'QUICK_DRILL',
      title: 'เควสต์ฝึกฝนประจำวัน (Daily Training Quest)',
      timeLimitSeconds: 900,
      questions: combinedQuestions,
    });
    setCurrentScreen('DRILL_SESSION');
  };

  // Select Stage helper
  const handleSelectStage = (stageId: string) => {
    handleOpenStageDetail(stageId);
  };

  // Generic session completion handler for Dojo
  const handleFinishSessionGeneric = async (result: StageSessionResult) => {
    const isStageNewlyCleared = result.isPassed && !profile.clearedStages.includes(result.stageId);
    const updatedCleared = isStageNewlyCleared 
      ? [...profile.clearedStages, result.stageId] 
      : profile.clearedStages;

    const newStars = result.accuracy >= 90 ? 3 : result.accuracy >= 80 ? 2 : 1;
    const oldStars = profile.stageStars[result.stageId] || 0;

    const newGear = result.unlockedGear && !profile.unlockedGear.includes(result.unlockedGear)
      ? [...profile.unlockedGear, result.unlockedGear]
      : profile.unlockedGear;

    const updatedMastery = { ...profile.skillMastery };
    Object.entries(result.masteryUpdates).forEach(([k, v]) => {
      updatedMastery[k] = v.after;
    });

    const updated: PlayerProfile = {
      ...profile,
      xp: profile.xp + result.earnedXp,
      coins: profile.coins + result.earnedCoins,
      clearedStages: updatedCleared,
      stageStars: {
        ...profile.stageStars,
        [result.stageId]: Math.max(oldStars, newStars),
      },
      stageBestAccuracy: {
        ...profile.stageBestAccuracy,
        [result.stageId]: Math.max(profile.stageBestAccuracy[result.stageId] || 0, result.accuracy),
      },
      unlockedGear: newGear,
      skillMastery: updatedMastery,
    };

    await updateProfile(updated);
  };

  // Finish Shrine Session
  const handleFinishShrineSession = async (res: ShrineRunResult) => {
    const isNewClear = res.isPassed && !profile.clearedStages.includes(res.stageId);
    const updatedCleared = isNewClear ? [...profile.clearedStages, res.stageId] : profile.clearedStages;

    const updatedMaterials = { ...profile.materials };
    if (res.earnedMaterial && res.materialCount > 0) {
      updatedMaterials[res.earnedMaterial] = (updatedMaterials[res.earnedMaterial] || 0) + res.materialCount;
    }

    const updated: PlayerProfile = {
      ...profile,
      xp: profile.xp + res.earnedXp,
      coins: profile.coins + res.earnedCoins,
      clearedStages: updatedCleared,
      shrineBestGrades: {
        ...profile.shrineBestGrades,
        [res.stageId]: res.speedGrade,
      },
      materials: updatedMaterials,
    };

    await updateProfile(updated);
    setShrineResult(res);
    setCurrentScreen('SHRINE_RESULT');
  };

  // Finish Gateway Exam Session
  const handleFinishGatewayExam = async (res: GatewayExamResult) => {
    const isNewClear = res.isPassed && !profile.clearedStages.includes(res.stageId);
    const updatedCleared = isNewClear ? [...profile.clearedStages, res.stageId] : profile.clearedStages;

    const updatedGear = res.unlockedGear && !profile.unlockedGear.includes(res.unlockedGear)
      ? [...profile.unlockedGear, res.unlockedGear]
      : profile.unlockedGear;

    const updated: PlayerProfile = {
      ...profile,
      xp: profile.xp + res.earnedXp,
      coins: profile.coins + res.earnedCoins,
      clearedStages: updatedCleared,
      gatewayReadiness: {
        ...profile.gatewayReadiness,
        [res.stageId]: res.readinessLevel,
      },
      unlockedGear: updatedGear,
    };

    await updateProfile(updated);
    setGatewayResult(res);
    setCurrentScreen('GATEWAY_RESULT');
  };

  // Finish Boss Battle Session
  const handleFinishBossBattle = async (res: BossBattleResult) => {
    const isNewClear = res.isVictory && !profile.clearedStages.includes(res.bossId);
    const updatedCleared = isNewClear ? [...profile.clearedStages, res.bossId] : profile.clearedStages;

    const updatedGear = [...profile.unlockedGear];
    if (res.unlockedRelic && !updatedGear.includes(res.unlockedRelic)) {
      updatedGear.push(res.unlockedRelic);
    }

    const updated: PlayerProfile = {
      ...profile,
      xp: profile.xp + res.earnedXp,
      coins: profile.coins + res.earnedCoins,
      clearedStages: updatedCleared,
      bossPerformanceTiers: {
        ...profile.bossPerformanceTiers,
        [res.bossId]: res.performanceTier,
      },
      unlockedGear: updatedGear,
    };

    await updateProfile(updated);
    setBossResult(res);
    setCurrentScreen('BOSS_RESULT');
  };

  // Finish Final Trial
  const handleFinishTrial = async (res: GrandmasterTrialResult) => {
    const updated: PlayerProfile = {
      ...profile,
      trialBestScore: Math.max(profile.trialBestScore || 0, res.accuracy),
      xp: profile.xp + res.earnedXp,
      coins: profile.coins + res.earnedCoins,
    };
    await updateProfile(updated);
    if (res.accuracy >= 85) {
      setCurrentScreen('TOP_FORM_CEREMONY');
    } else {
      setCurrentScreen('MAP');
    }
  };

  const handleResetProgress = async () => {
    if (window.confirm('คุณต้องการรีเซ็ตความคืบหน้าทั้งหมดเพื่อเริ่มเล่นใหม่หรือไม่?')) {
      await updateProfile(DEFAULT_PROFILE);
      setCurrentScreen('AVATAR_SELECT');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-bold font-sans">
        กำลังโหลดดินแดนแห่งตัวเลข Klapanya Math Quest...
      </div>
    );
  }

  const activeDojoStageInfo = DOJO_STAGES.find((s) => s.id === activeDojoStageId) || DOJO_STAGES[0];
  const activeDojoQuestions = getDojoQuestions(activeDojoStageId);

  const activeShrineStageInfo = SHRINE_STAGES.find((s) => s.id === activeShrineStageId) || SHRINE_STAGES[0];
  const activeShrineQuestions = getShrineQuestions(activeShrineStageId);

  const activeGatewayStageInfo = GATEWAY_STAGES.find((s) => s.id === activeGatewayStageId) || GATEWAY_STAGES[0];
  const activeGatewayQuestions = getGatewayQuestions(activeGatewayStageId);

  const activeBossInfo = BOSS_CITADELS.find((b) => b.id === activeBossId) || BOSS_CITADELS[0];
  const activeBossQuestions = getBossQuestions(activeBossId);

  const topFormEligibility = evaluateTopFormEligibility(profile);

  // If not logged in, render LoginScreen
  if (!session || currentScreen === 'LOGIN') {
    return (
      <LoginScreen
        onLoginSuccess={(newSession) => {
          setSession(newSession);
          if (newSession.role === 'TEACHER') {
            setCurrentScreen('TEACHER_HOME');
          } else {
            setCurrentScreen('STUDENT_HOME');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-arctic-900 text-slate-100 font-sans">
      
      {/* 0a. Student Home Screen */}
      {currentScreen === 'STUDENT_HOME' && session.role === 'STUDENT' && (
        <StudentHomeScreen
          session={session as StudentSession}
          profile={profile}
          onNavigateToMap={() => setCurrentScreen('MAP')}
          onNavigateToTutor={(stgId) => handleOpenTutor(stgId || 'D1')}
          onNavigateToDrill={(drillType) => handleOpenDrill(drillType as any)}
          onNavigateToDailyQuest={() => handleStartDailyQuest()}
          onNavigateToBattle={() => setCurrentScreen('BATTLE_LOBBY')}
          onOpenCodex={() => setShowCodexModal(true)}
          onOpenMarket={() => setShowMarketModal(true)}
          onOpenInventory={() => setCurrentScreen('SKILL_INVENTORY')}
          onOpenAvatarSelect={() => setCurrentScreen('AVATAR_SELECT')}
          onLogout={async () => {
            await authService.logout();
            setSession(null);
            setCurrentScreen('LOGIN');
          }}
        />
      )}

      {/* 0b. Teacher Home Screen */}
      {currentScreen === 'TEACHER_HOME' && session.role === 'TEACHER' && (
        <TeacherHomeScreen
          session={session as TeacherSession}
          onPreviewStage={(stgId) => handleSelectStage(stgId)}
          onPreviewTutor={(stgId) => handleOpenTutor(stgId)}
          onOpenLiveBattleConsole={() => setCurrentScreen('TEACHER_BATTLE_CONSOLE')}
          onOpenReviewHub={() => setCurrentScreen('REVIEW_HUB')}
          onLogout={async () => {
            await authService.logout();
            setSession(null);
            setCurrentScreen('LOGIN');
          }}
        />
      )}

      {/* 0c. Battle Lobby Screen */}
      {currentScreen === 'BATTLE_LOBBY' && (
        <BattleLobbyScreen
          profile={profile}
          onBattleStarted={(bRoom, bPlayer) => {
            setActiveBattleRoom(bRoom);
            setActiveBattlePlayer(bPlayer);
            setCurrentScreen('CLASSROOM_BATTLE');
          }}
          onExit={() => setCurrentScreen(session?.role === 'TEACHER' ? 'TEACHER_HOME' : 'STUDENT_HOME')}
        />
      )}

      {/* 0d. Classroom Live Battle */}
      {currentScreen === 'CLASSROOM_BATTLE' && activeBattleRoom && activeBattlePlayer && (
        <ClassroomBattleScreen
          room={activeBattleRoom}
          player={activeBattlePlayer}
          profile={profile}
          onFinishBattle={(fRoom, fPlayer) => {
            setActiveBattleRoom(fRoom);
            setActiveBattlePlayer(fPlayer);
            setCurrentScreen('BATTLE_REVIEW');
          }}
        />
      )}

      {/* 0e. Battle Review & Self-Reflection */}
      {currentScreen === 'BATTLE_REVIEW' && activeBattleRoom && activeBattlePlayer && (
        <BattleReviewScreen
          room={activeBattleRoom}
          player={activeBattlePlayer}
          profile={profile}
          onStartRecoveryDrill={() => handleOpenDrill('RECOVERY_DRILL')}
          onReturnHome={() => setCurrentScreen(session?.role === 'TEACHER' ? 'TEACHER_HOME' : 'STUDENT_HOME')}
          onRematch={() => setCurrentScreen('BATTLE_LOBBY')}
        />
      )}

      {/* 0f. Teacher Live Battle Console */}
      {currentScreen === 'TEACHER_BATTLE_CONSOLE' && (
        <TeacherBattleConsoleScreen
          initialRoomCode="ICE710"
          onExit={() => setCurrentScreen('TEACHER_HOME')}
        />
      )}

      {/* 1. Character & 2D Avatar Select */}
      {currentScreen === 'AVATAR_SELECT' && (
        <AvatarHeroSelectScreen
          currentProfile={profile}
          onConfirmCharacter={handleConfirmCharacter}
        />
      )}

      {/* Legacy Class Select */}
      {currentScreen === 'HERO_SELECT' && (
        <HeroSelectScreen
          currentHeroId={profile.heroId}
          onSelectHero={async (hId) => {
            await updateProfile({ ...profile, heroId: hId });
            setCurrentScreen('MAP');
          }}
        />
      )}

      {/* 2. World Map Screen with Learning Shortcuts */}
      {currentScreen === 'MAP' && (
        <MapScreen
          profile={profile}
          onEnterStage={(id) => { setActiveDojoStageId(id); handleOpenStageDetail(id); }}
          onEnterShrine={(id, mode, size) => { setActiveShrineStageId(id); setShrineMode(mode); setShrineRunSize(size); setCurrentScreen('SHRINE_BATTLE'); }}
          onEnterGateway={(id, mode) => { setActiveGatewayStageId(id); setGatewayMode(mode); setCurrentScreen('GATEWAY_EXAM'); }}
          onEnterBoss={(id, mode, phase) => { setActiveBossId(id); setBossMode(mode); setBossPhaseId(phase); setCurrentScreen('BOSS_BATTLE'); }}
          onEnterGeometry={() => setCurrentScreen('GEOMETRY')}
          onEnterQuestBoard={() => setCurrentScreen('QUEST_BOARD')}
          onEnterFinalTrial={() => { setTrialQuestions(sampleGrandmasterTrialQuestions()); setCurrentScreen('FINAL_TRIAL'); }}
          onEnterTopFormCeremony={() => setCurrentScreen('TOP_FORM_CEREMONY')}
          onOpenInventory={() => setCurrentScreen('SKILL_INVENTORY')}
          onOpenMarket={() => setShowMarketModal(true)}
          onOpenCodex={(chId) => { setCodexInitialChapter(chId || 1); setShowCodexModal(true); }}
          onOpenDrillCenter={() => setCurrentScreen('DRILL_CENTER')}
          onOpenSkillInventory={() => setCurrentScreen('SKILL_INVENTORY')}
          onOpenStageDetail={handleOpenStageDetail}
          onSelectPet={async (petId) => { await updateProfile({ ...profile, activePetId: petId }); }}
          onChangeHero={() => setCurrentScreen('AVATAR_SELECT')}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* 3. Stage Preparation Detail Screen */}
      {currentScreen === 'STAGE_DETAIL' && (
        <StageDetailScreen
          stageId={selectedPrepStageId}
          stageName={activeDojoStageInfo.name}
          thaiName={activeDojoStageInfo.thaiName}
          subtitle={activeDojoStageInfo.academicFocus}
          academicFocus={activeDojoStageInfo.academicFocus}
          questionCount={30}
          rewardText="Dojo Master Arctic Crown (👑)"
          commonTrapSummary="ระวังการคิดเลขสลับลำดับ และการตัดตัวเลือกที่ใกล้เคียงกัน"
          recommendedSkillName="Frost Recall & Time Stop"
          linkedCodexChapterId={1}
          profile={profile}
          onLearnFirst={() => setCurrentScreen('TUTOR_ROOM')}
          onDrill={() => setCurrentScreen('DRILL_CENTER')}
          onPlayPractice={() => setCurrentScreen('DOJO_BATTLE')}
          onPlayChallenge={() => setCurrentScreen('DOJO_BATTLE')}
          onOpenCodexChapter={(chId) => { setCodexInitialChapter(chId); setShowCodexModal(true); }}
          onBack={() => setCurrentScreen('MAP')}
        />
      )}

      {/* 4. Tutor Room Screen (7-step instruction) */}
      {currentScreen === 'TUTOR_ROOM' && (
        <TutorRoomScreen
          lesson={activeTutorLesson}
          onFinishLessonAndStartDrill={() => setCurrentScreen('DRILL_CENTER')}
          onFinishLessonAndPlayStage={() => setCurrentScreen('DOJO_BATTLE')}
          onBack={() => setCurrentScreen('STAGE_DETAIL')}
        />
      )}

      {/* 5. Drill Center Screen */}
      {currentScreen === 'DRILL_CENTER' && (
        <DrillCenterScreen
          profile={profile}
          onStartDrillSession={(dConfig) => {
            setActiveDrillConfig(dConfig);
            setCurrentScreen('DRILL_SESSION');
          }}
          onBack={() => setCurrentScreen('MAP')}
        />
      )}

      {/* 5b. Drill Session (Uses BattleScreen with drill questions) */}
      {currentScreen === 'DRILL_SESSION' && activeDrillConfig && (
        <BattleScreen
          stageId={activeDrillConfig.type}
          stageName={activeDrillConfig.title}
          questions={activeDrillConfig.questions}
          profile={profile}
          isExamMode={false}
          onFinishSession={async (res) => {
            await handleFinishSessionGeneric(res);
            setCurrentScreen('MAP');
          }}
          onExitStage={() => setCurrentScreen('DRILL_CENTER')}
        />
      )}

      {/* 6. Skill & Gear Inventory Screen */}
      {currentScreen === 'SKILL_INVENTORY' && (
        <SkillInventoryScreen
          profile={profile}
          onOpenMarket={() => setShowMarketModal(true)}
          onBack={() => setCurrentScreen('MAP')}
        />
      )}

      {/* 7. Dojo Battle Screen with Smart Remediation */}
      {currentScreen === 'DOJO_BATTLE' && (
        <BattleScreen
          stageId={activeDojoStageId}
          stageName={activeDojoStageInfo.thaiName}
          questions={activeDojoQuestions}
          profile={profile}
          isExamMode={false}
          onFinishSession={async (res) => {
            setDojoSessionResult(res);
            await handleFinishSessionGeneric(res);
            setCurrentScreen('DOJO_RESULT');
          }}
          onExitStage={() => setCurrentScreen('MAP')}
        />
      )}

      {currentScreen === 'DOJO_RESULT' && dojoSessionResult && (
        <ResultScreen
          result={dojoSessionResult}
          onReturnToMap={() => setCurrentScreen('MAP')}
        />
      )}

      {/* Shrine Speedrun */}
      {currentScreen === 'SHRINE_BATTLE' && (
        <ShrineSpeedrunScreen
          stageId={activeShrineStageId}
          stageName={activeShrineStageInfo.thaiName}
          targetTimeSec={activeShrineStageInfo.targetTimeSec || 15}
          questions={activeShrineQuestions}
          profile={profile}
          runMode={shrineMode}
          runSize={shrineRunSize}
          onFinishRun={handleFinishShrineSession}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {currentScreen === 'SHRINE_RESULT' && shrineResult && (
        <ShrineResultScreen
          result={shrineResult}
          onReturnToMap={() => setCurrentScreen('MAP')}
          onPlayAgain={() => setCurrentScreen('SHRINE_BATTLE')}
        />
      )}

      {/* O-NET Gateway Exam */}
      {currentScreen === 'GATEWAY_EXAM' && (
        <GatewayExamScreen
          stageId={activeGatewayStageId}
          stageName={activeGatewayStageInfo.thaiName}
          targetTimeSec={activeGatewayStageInfo.targetTimeSec || 120}
          questions={activeGatewayQuestions}
          profile={profile}
          runMode={gatewayMode}
          onFinishExam={handleFinishGatewayExam}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {currentScreen === 'GATEWAY_RESULT' && gatewayResult && (
        <GatewayResultScreen
          result={gatewayResult}
          onReturnToMap={() => setCurrentScreen('MAP')}
        />
      )}

      {/* Boss Battle */}
      {currentScreen === 'BOSS_BATTLE' && (
        <BossArenaScreen
          bossInfo={activeBossInfo}
          initialPhaseId={bossPhaseId}
          mode={bossMode}
          questions={activeBossQuestions}
          profile={profile}
          onFinishBattle={handleFinishBossBattle}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {currentScreen === 'BOSS_RESULT' && bossResult && (
        <BossResultScreen
          result={bossResult}
          onReturnToMap={() => setCurrentScreen('MAP')}
        />
      )}

      {/* Geometry & Quest Board */}
      {currentScreen === 'GEOMETRY' && (
        <GeometryScreen
          questions={ALL_GEOMETRY_QUESTIONS}
          profile={profile}
          onFinishSession={handleFinishSessionGeneric}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {currentScreen === 'QUEST_BOARD' && (
        <QuestBoardScreen
          questions={ALL_QUEST_QUESTIONS}
          profile={profile}
          onFinishSession={handleFinishSessionGeneric}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {/* Final Grandmaster Trial */}
      {currentScreen === 'FINAL_TRIAL' && (
        <FinalTrialScreen
          questions={trialQuestions}
          profile={profile}
          onFinishTrial={handleFinishTrial}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {/* Top Form Ceremony */}
      {currentScreen === 'TOP_FORM_CEREMONY' && (
        <TopFormCeremonyScreen
          profile={profile}
          eligibility={topFormEligibility}
          onReturnToMap={() => setCurrentScreen('MAP')}
        />
      )}

      {/* Frost Core Forge & Armory */}
      {currentScreen === 'INVENTORY' && (
        <InventoryScreen
          profile={profile}
          onUpdateProfile={updateProfile}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {/* Floating Review & Playtest Hub Trigger */}
      <div className="fixed bottom-3 right-3 z-50">
        <button
          onClick={() => setCurrentScreen('REVIEW_HUB')}
          className="px-3.5 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-glow-cyan flex items-center gap-1.5 border-2 border-cyan-200 transform hover:scale-105 transition-all"
          title="เปิดแดชบอร์ดตรวจสอบงาน UI & ทดสอบทุกหน้าจอ"
        >
          <span>🔬</span>
          <span>Review Hub</span>
        </button>
      </div>

      {currentScreen === 'REVIEW_HUB' && (
        <ReviewHubScreen
          profile={profile}
          onNavigate={(scr) => setCurrentScreen(scr as AppScreen)}
          onSelectHeroClass={async (hId) => { await updateProfile({ ...profile, heroId: hId }); }}
          onToggleTopForm={async (top) => { await updateProfile({ ...profile, isTopFormUnlocked: top }); }}
        />
      )}

      {/* Magic Market Modal */}
      {showMarketModal && (
        <MagicMarketModal
          profile={profile}
          onUpdateProfile={updateProfile}
          onClose={() => setShowMarketModal(false)}
        />
      )}

      {/* Formula Codex Modal */}
      {showCodexModal && (
        <FormulaCodexModal
          initialChapterId={codexInitialChapter}
          onPracticeSkill={(skillId, stgId) => {
            setShowCodexModal(false);
            if (stgId) handleOpenStageDetail(stgId);
            else setCurrentScreen('DRILL_CENTER');
          }}
          onClose={() => setShowCodexModal(false)}
        />
      )}
    </div>
  );
};
export default App;
