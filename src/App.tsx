import React, { useState, useEffect, useMemo } from 'react';
import {entryScreen} from './services/entry-path';
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
import { DEFAULT_PROFILE } from './storage/local-storage-adapter';
import { HERO_CLASSES } from './progression/hero-classes';
import { DOJO_STAGES, getDojoQuestions } from './content/dojo-database';
import { SHRINE_STAGES, getShrineQuestions } from './content/shrine-database';
import { GATEWAY_STAGES, getGatewayQuestions } from './content/onet-database';
import { BOSS_CITADELS, getBossQuestions } from './content/boss-database';
import { ALL_GEOMETRY_QUESTIONS } from './content/geometry-database';
import { ALL_QUEST_QUESTIONS } from './content/quest-database';
import { sampleGrandmasterTrialQuestions } from './engine/trial-sampler';
import { evaluateTopFormEligibility } from './progression/top-form';
import { getTutorLessonForStage, getTutorPracticeQuestions } from './progression/tutor-database';
import { generateDrillSession } from './engine/drill-engine';
import { generateDailyQuestSession } from './engine/daily-quest-engine';

// UI Screens & Modals
import { AvatarHeroSelectScreen } from './ui/screens/AvatarHeroSelectScreen';
import { HeroSelectScreen } from './ui/screens/HeroSelectScreen';
import { ArcticHeroSelectScreen } from './ui/screens/ArcticHeroSelectScreen';
import { MapScreen } from './ui/screens/MapScreen';
import { StageDetailScreen } from './ui/screens/StageDetailScreen';
import { TutorRoomScreen } from './ui/screens/TutorRoomScreen';
import { TutorCatalogScreen } from './ui/screens/TutorCatalogScreen';
import { TutorTopicOverviewScreen } from './ui/screens/TutorTopicOverviewScreen';
import { TutorResultScreen } from './ui/screens/TutorResultScreen';
import { TutorPracticeScreen } from './ui/screens/TutorPracticeScreen';
import { DrillCenterScreen } from './ui/screens/DrillCenterScreen';
import { SkillInventoryScreen } from './ui/screens/SkillInventoryScreen';
import { BattleScreen } from './ui/screens/BattleScreen';
import { ResultScreen } from './ui/screens/ResultScreen';
import { ShrineSpeedrunScreen } from './ui/screens/ShrineSpeedrunScreen';
import { ShrineResultScreen } from './ui/screens/ShrineResultScreen';
import { GatewayExamScreen } from './ui/screens/GatewayExamScreen';
import { GatewayResultScreen } from './ui/screens/GatewayResultScreen';
import { BossArenaScreen } from './ui/screens/BossArenaScreen';
import { ArenaTemplatePreviewScreen } from './ui/screens/ArenaTemplatePreviewScreen';
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
import { LandingScreen } from './ui/screens/LandingScreen';
import { StudentHomeScreen } from './ui/screens/StudentHomeScreen';
import { TeacherHomeScreen } from './ui/screens/TeacherHomeScreen';
import { TeacherAssignmentsScreen } from './ui/screens/TeacherAssignmentsScreen';
import { VerifiedCampaignGate } from './ui/components/VerifiedCampaignGate';
import { VerifiedCampaignResult } from './ui/components/VerifiedCampaignResult';
import { AdminAccessGuard } from './ui/components/AdminAccessGuard';
import { AdminConsoleScreen } from './ui/screens/AdminConsoleScreen';
import { BattleLobbyScreen } from './ui/screens/BattleLobbyScreen';
import { ClassroomBattleScreen } from './ui/screens/ClassroomBattleScreen';
import { BattleReviewScreen } from './ui/screens/BattleReviewScreen';
import { TeacherBattleConsoleScreen } from './ui/screens/TeacherBattleConsoleScreen';
import { ProfessorArenaConsoleScreen } from './ui/screens/ProfessorArenaConsoleScreen';
import { realtimeArenaService } from './services/realtime-arena-service';
import { authService } from './services/auth-service';
import { authSession } from './auth/session';
import { getSupabaseClient } from './lib/supabaseClient';
import { flushGameEvidence } from './services/game-evidence';
import { CloudOwnedProgress, DemoOwnedProgress, freshProfile, supabaseProgressTransport } from './storage/owned-progress';
import { UserSession, StudentSession, TeacherSession } from './types/auth';
import { BattleRoom, BattlePlayerState } from './types/battle';
import type { AppScreen } from './ui/game-ui/runtime-screens';
import { activityReturnDestination, postLoginDestination, type ActivityOrigin } from './services/navigation-continuity';

export const App: React.FC = () => {
  const studentHomePreviewHash = typeof window !== 'undefined' && window.location.hash.startsWith('#/student-home');
  const previewStudentSession: StudentSession | null = studentHomePreviewHash ? {
    userId: 'student_home_preview',
    role: 'STUDENT',
    studentName: 'น้องกล้าหาญ (Alex)',
    classRoomId: 'P6-1',
    avatarVisualId: DEFAULT_PROFILE.avatarVisualId || 'BOY_WIZARD',
    heroId: DEFAULT_PROFILE.heroId || 'CHRONOMANCER',
    profile: { ...DEFAULT_PROFILE, heroName: 'น้องกล้าหาญ (Alex)' },
    loginTimestamp: Date.now(),
  } : null;
  const [profile, setProfile] = useState<PlayerProfile>(previewStudentSession?.profile || DEFAULT_PROFILE);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(()=>studentHomePreviewHash?'STUDENT_HOME':entryScreen(window.location.pathname));
  const [authReady,setAuthReady]=useState(studentHomePreviewHash);
  const returnToLanding=()=>{window.history.replaceState(null,'','/');setCurrentScreen('LANDING');};
  const enterAdmin=()=>{if(window.location.pathname!=='/admin')window.history.pushState(null,'','/admin');setCurrentScreen('ADMIN_CONSOLE');};
  const openStudentHomePreview = () => {
    const studentSess: StudentSession = {
      userId: 'student_home_preview',
      role: 'STUDENT',
      studentName: 'น้องกล้าหาญ (Alex)',
      classRoomId: 'P6-1',
      avatarVisualId: DEFAULT_PROFILE.avatarVisualId || 'BOY_WIZARD',
      heroId: DEFAULT_PROFILE.heroId || 'CHRONOMANCER',
      profile: { ...DEFAULT_PROFILE, heroName: 'น้องกล้าหาญ (Alex)' },
      loginTimestamp: Date.now(),
    };
    setSession(studentSess);
    setProfile(studentSess.profile);
    setLoadedOwner(studentSess.userId);
    setProgressError('');
    setCurrentScreen('STUDENT_HOME');
  };
  useEffect(()=>{
    const changed=()=>{
      if(window.location.hash==='#/student-home') { openStudentHomePreview(); return; }
      setCurrentScreen(entryScreen(window.location.pathname));
    };
    window.addEventListener('popstate',changed);
    window.addEventListener('hashchange',changed);
    return()=>{window.removeEventListener('popstate',changed);window.removeEventListener('hashchange',changed);};
  },[]);
  useEffect(()=>{if(currentScreen==='ADMIN_CONSOLE'&&entryScreen(window.location.pathname)!=='ADMIN_CONSOLE')window.history.replaceState(null,'','/admin');},[currentScreen]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [showMarketModal, setShowMarketModal] = useState<boolean>(false);
  const [showCodexModal, setShowCodexModal] = useState<boolean>(false);
  const [codexInitialChapter, setCodexInitialChapter] = useState<number>(1);

  // Selected Stage / Prep state
  const [selectedPrepStageId, setSelectedPrepStageId] = useState<string>('D1');
  const [activeTutorLesson, setActiveTutorLesson] = useState<TutorLesson>(getTutorLessonForStage('D1'));
  const [tutorResult,setTutorResult]=useState<StageSessionResult|null>(null);

  // Drill state
  const [activeDrillConfig, setActiveDrillConfig] = useState<DrillConfig | null>(null);
  const [activityOrigin, setActivityOrigin] = useState<ActivityOrigin>('MAP');

  // Dojo state
  const [activeDojoStageId, setActiveDojoStageId] = useState<string>('D1');
  const [dojoSessionResult, setDojoSessionResult] = useState<StageSessionResult | null>(null);
  const [completedCampaignId,setCompletedCampaignId]=useState<string|null>(null);

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
  const [session, setSession] = useState<UserSession | null>(previewStudentSession || authService.getCurrentSession());
  const [loadedOwner, setLoadedOwner] = useState<string | null>(previewStudentSession?.userId || null);
  const [progressError, setProgressError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const realMode = authSession.getAdapterMode() === 'supabase' && !studentHomePreviewHash;
  const storage = useMemo(() => {
    if (!session) return null;
    if (realMode && session.role === 'STUDENT') {
      const client = getSupabaseClient();
      return client ? new CloudOwnedProgress(session.userId, supabaseProgressTransport(client),
        () => authSession.getCurrentUser()?.id || null) : null;
    }
    return new DemoOwnedProgress(`${session.role}:${session.userId}`, localStorage);
  }, [session?.userId, session?.role, realMode, loadAttempt]);

  useEffect(() => {
    let cancelled = false;
    setLoadedOwner(null);
    setProfile(freshProfile());
    setProgressError('');
    if (session && storage) {
      storage.loadProfile().then(saved => {
        if (!cancelled) { setProfile(saved); setLoadedOwner(session.userId); }
      }).catch(() => {
        if (!cancelled) setProgressError('โหลดความคืบหน้าไม่ได้ กรุณาลองใหม่ ข้อมูลของบัญชีอื่นจะไม่ถูกนำมาใช้');
      });
    } else if (session) setProgressError('ยังไม่ได้ตั้งค่าการบันทึกความคืบหน้าของเกม');
    return () => { cancelled = true; };
  }, [storage, session?.userId, loadAttempt]);

  useEffect(() => {
    const owner = realMode && session?.role === 'STUDENT' ? session.userId : null;
    const flush = () => { if (owner) void flushGameEvidence(owner).catch(() => {}); };
    flush();
    window.addEventListener('online',flush);
    return () => window.removeEventListener('online',flush);
  }, [session?.userId, realMode]);

  useEffect(() => {
    const warn = () => window.alert('บันทึกหลักฐานการเล่นไม่ได้ พื้นที่จัดเก็บของเบราว์เซอร์อาจเต็ม คะแนนรอบนี้ยังไม่ได้รับการยืนยัน');
    window.addEventListener('game-evidence-save-error',warn);
    return () => window.removeEventListener('game-evidence-save-error',warn);
  }, []);

  // Classroom Battle state
  const [activeBattleRoom, setActiveBattleRoom] = useState<BattleRoom | null>(null);
  const [activeBattlePlayer, setActiveBattlePlayer] = useState<BattlePlayerState | null>(null);

  // Load saved profile on mount
  useEffect(() => {
    async function init() {
      if (studentHomePreviewHash) {
        setIsLoading(false);
        return;
      }
      let restoredSession:UserSession|null=null;
      try{restoredSession=await authService.restoreSession();}catch{/* Restoration failure must not authorize Admin. */}
      setSession(restoredSession);
      setCurrentScreen(entryScreen(window.location.pathname));
      setAuthReady(true);

      // Check URL hash for fast inspection routing
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (hash === '#/student-home') {
        openStudentHomePreview();
      } else if (hash === '#/tutor-preview') {
        setCurrentScreen('TUTOR_CATALOG');
      } else if (hash === '#/boss-preview') {
        setActiveBossId('BOSS-1');
        setBossMode('CHALLENGE');
        setBossPhaseId('PHASE_1');
        setCurrentScreen('BOSS_PREVIEW');
      } else if (typeof window !== 'undefined' && entryScreen(window.location.pathname)==='LANDING' && authSession.getAdapterMode() === 'mock') {
        if (hash === '#/professor-console') {
          setCurrentScreen('TEACHER_BATTLE_CONSOLE');
        } else if (hash === '#/hero-select') {
          setCurrentScreen('HERO_SELECT');
        } else if (hash === '#/login') {
          setCurrentScreen('LOGIN');

        } else if (hash === '#/battle') {
          // Initialize mock active battle for visual inspection
          const mockBRoom: BattleRoom = {
            id: 'room_preview_01',
            teacherId: 'usr_prof_001',
            teacherName: 'คุณครูปัญญา วิชาการ',
            classRoomId: 'P6-1',
            roomCode: 'ICE742',
            battleMode: 'LIVE_CLASSROOM',
            questionMode: 'MIRROR_BATTLE',
            sourceStageId: 'D1',
            questionCount: 8,
            showLiveRank: true,
            status: 'IN_BATTLE',
            questions: getDojoQuestions('D1').slice(0, 8),
            players: {},
            createdAt: Date.now(),
          };
          const mockBPlayer: BattlePlayerState = {
            playerId: 'usr_lrn_001',
            studentName: 'น้องกล้าหาญ (Alex)',
            classRoomId: 'P6-1',
            avatarVisualId: 'BOY_WIZARD',
            heroId: 'CHRONOMANCER',
            status: 'PLAYING',
            currentIndex: 0,
            totalQuestions: 8,
            correctCount: 2,
            wrongCount: 0,
            streak: 2,
            battleScore: 280,
            accuracy: 100,
            avgResponseTimeSec: 4.5,
            joinedAt: Date.now(),
            answers: [],
          };
          setActiveBattleRoom(mockBRoom);
          setActiveBattlePlayer(mockBPlayer);
          setCurrentScreen('CLASSROOM_BATTLE');
        }
      }

      setIsLoading(false);
    }
    init();
    return authSession.subscribe(() => {
      if (authSession.getAdapterMode() === 'supabase') {
        setSession(authService.getCurrentSession());
      }
    });
  }, []);

  const updateProfile = async (newProfile: PlayerProfile) => {
    if (!storage || !session || loadedOwner !== session.userId) throw new Error('Player progress is not loaded');
    setProfile(newProfile);
    try { await storage.saveProfile(newProfile); }
    catch { setProgressError('ยังบันทึกความคืบหน้าไม่ได้ กรุณาลองบันทึกซ้ำก่อนออกจากหน้านี้'); }
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
    if (!storage || !session || loadedOwner !== session.userId) throw new Error('Player progress is not loaded');
    await storage.saveProfile(updated);
    setProfile(updated);
    setCurrentScreen('MAP');
  };

  // Open Stage Preparation Detail Screen
  const handleOpenStageDetail = (stageId: string) => {
    setSelectedPrepStageId(stageId);
    setActiveTutorLesson(getTutorLessonForStage(stageId));
    setCurrentScreen('STAGE_DETAIL');
  };

  // Open Tutor Room directly
  const handleOpenTutor = (stageId?: string) => {
    if (!stageId) { setCurrentScreen('TUTOR_CATALOG'); return; }
    setSelectedPrepStageId(stageId);
    setActiveTutorLesson(getTutorLessonForStage(stageId));
    setCurrentScreen('TUTOR_OVERVIEW');
  };

  const startTutorPractice=()=>{
    setActivityOrigin('TUTOR_ROOM');
    setActiveDrillConfig({type:'QUICK_DRILL',title:`Tutor Practice · ${activeTutorLesson.thaiTitle}`,questions:getTutorPracticeQuestions(activeTutorLesson.stageId)});
    setCurrentScreen('TUTOR_PRACTICE');
  };

  // Open Drill Center directly or with preconfigured drill
  const handleOpenDrill = (drillType: string = 'QUICK_DRILL', origin: ActivityOrigin = 'MAP') => {
    setActivityOrigin(origin);
    const dSession = generateDrillSession(drillType as any, profile);
    setActiveDrillConfig(dSession);
    setCurrentScreen('DRILL_SESSION');
  };

  // Start Daily Quest session
  const handleStartDailyQuest = () => {
    setActivityOrigin('STUDENT_HOME');
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

  // These boundaries precede generic session/game-save rendering. Direct screen entry
  // still requires verified ADMIN membership and cannot reuse a Teacher UI label.
  if(currentScreen==='LANDING'&&!authReady)return <main role="status" className="min-h-screen bg-slate-950 text-slate-100 p-8">Restoring game session…</main>;
  if (currentScreen === 'ADMIN_CONSOLE') {
    if(!authReady)return <main className="min-h-screen bg-slate-100 text-slate-900 p-8" role="status">Restoring Game Admin session…</main>;
    return <AdminAccessGuard onExit={returnToLanding} renderDenied={realMode?()=>
      <LoginScreen initialRole="ADMIN" lockRole mode="ALL" onBackToLanding={returnToLanding}
        onLoginSuccess={newSession=>{setSession(newSession);enterAdmin();}}/>:undefined}>
      {identity => <AdminConsoleScreen identity={identity} onLogout={() => {
        setSession(null); returnToLanding();
        void authService.logout().catch(() => {});
      }} />}
    </AdminAccessGuard>;
  }
  if (currentScreen === 'STAFF_LOGIN') {
    if (!realMode) return <main className="min-h-screen bg-slate-100 text-slate-900 p-8"><p role="alert">Staff/Admin entry requires real Supabase authentication. Demo access is unavailable.</p><button className="min-h-[44px] border rounded px-4 mt-4" onClick={() => setCurrentScreen('LANDING')}>Return to landing</button></main>;
    return <LoginScreen initialRole="ADMIN" lockRole mode="ALL" onBackToLanding={returnToLanding}
      onLoginSuccess={newSession => { setSession(newSession); setCurrentScreen('ADMIN_CONSOLE'); }} />;
  }

  if (progressError && currentScreen!=='LANDING' && !studentHomePreviewHash) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 p-8" role="alert">
      <p>{progressError}</p>
      <button className="min-h-[44px] p-3" onClick={async () => {
        if (loadedOwner && storage) {
          try { await storage.retry(); setProgressError(''); }
          catch { setProgressError('บันทึกไม่สำเร็จ หากข้อมูลถูกเปลี่ยนจากอุปกรณ์อื่น ให้โหลดข้อมูลล่าสุด'); }
        } else setLoadAttempt(value => value + 1);
      }}>ลองอีกครั้ง</button>
      <button className="min-h-[44px] p-3" onClick={() => {
        if (window.confirm('โหลดข้อมูลล่าสุดจากเซิร์ฟเวอร์? การเปลี่ยนแปลงที่ยังไม่ได้บันทึกในหน้านี้จะหายไป')) {
          setLoadAttempt(value => value + 1);
        }
      }}>โหลดข้อมูลล่าสุด</button>
      <button className="min-h-[44px] p-3" onClick={async () => {
        await authService.logout(); setSession(null); setCurrentScreen('LOGIN'); setProgressError('');
      }}>ออกจากระบบ</button>
    </div>;
  }
  const isStudentHomePreview = typeof window !== 'undefined' && window.location.hash.startsWith('#/student-home');
  if (currentScreen!=='LANDING' && !isStudentHomePreview && (isLoading || (session && loadedOwner !== session.userId))) {
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

  // 1. Landing and Login screen states
  if (currentScreen === 'LANDING') {
    return (
      <LandingScreen
        onGoToStaffLogin={enterAdmin}
        onGoToStudentLogin={() => setCurrentScreen('STUDENT_LOGIN')}
        onGoToTeacherLogin={() => setCurrentScreen('TEACHER_LOGIN')}
        onQuickDemoStudent={async () => {
          if (authSession.getAdapterMode() !== 'mock') { setCurrentScreen('STUDENT_LOGIN'); return; }
          const s = await authService.loginAsStudent('น้องกล้าหาญ (Alex)', 'P6-1');
          setSession(s);
          setCurrentScreen('STUDENT_HOME');
        }}
        onQuickDemoTeacher={async () => {
          if (authSession.getAdapterMode() !== 'mock') { setCurrentScreen('TEACHER_LOGIN'); return; }
          const t = await authService.loginAsTeacher('คุณครูปัญญา วิชาการ', 'โรงเรียนกล้าปัญญา (The Wisdom Academy School)');
          setSession(t);
          setCurrentScreen('TEACHER_HOME');
        }}
      />
    );
  }

  if (currentScreen === 'STUDENT_LOGIN') {
    return (
      <LoginScreen
        mode="STUDENT"
        onLoginSuccess={(newSession) => {
          setSession(newSession);
          setCurrentScreen(realMode && authSession.getCurrentUser()?.role === 'ADMIN' ? 'ADMIN_CONSOLE' : postLoginDestination(newSession.role));
        }}
        onBackToLanding={returnToLanding}
      />
    );
  }

  if (currentScreen === 'TEACHER_LOGIN') {
    return (
      <LoginScreen
        mode="TEACHER"
        onLoginSuccess={(newSession) => {
          setSession(newSession);
          setCurrentScreen(realMode && authSession.getCurrentUser()?.role === 'ADMIN' ? 'ADMIN_CONSOLE' : postLoginDestination(newSession.role));
        }}
        onBackToLanding={returnToLanding}
      />
    );
  }

  if (currentScreen === 'LOGIN' || (!session && !['HERO_SELECT', 'TUTOR_CATALOG', 'TUTOR_OVERVIEW', 'TUTOR_ROOM', 'BOSS_PREVIEW'].includes(currentScreen))) {
    return (
      <LoginScreen
        mode="ALL"
        onLoginSuccess={(newSession) => {
          setSession(newSession);
          if (realMode && authSession.getCurrentUser()?.role === 'ADMIN') {
            setCurrentScreen('ADMIN_CONSOLE');
          } else if (newSession.role === 'TEACHER') {
            setCurrentScreen('TEACHER_HOME');
          } else {
            setCurrentScreen('STUDENT_HOME');
          }
        }}
        onBackToLanding={returnToLanding}
      />
    );
  }

  return (
    <div className="min-h-screen bg-arctic-900 text-slate-100 font-sans">
      
      {/* 0a. Student Home Screen */}
      {currentScreen === 'STUDENT_HOME' && session && session.role === 'STUDENT' && (
        <StudentHomeScreen
          session={session as StudentSession}
          profile={profile}
          onNavigateToMap={async () => {
            if(realMode){
              const owner=session.userId;
              try {await storage?.retry();}catch{setProgressError('ยังบันทึกข้อมูลไม่ได้ กรุณาลองอีกครั้งก่อนเล่นต่อ');return;}
              if(authSession.getCurrentUser()?.id!==owner)return;
              setLoadedOwner(null);setLoadAttempt(n=>n+1);
            }
            setCurrentScreen('MAP');
          }}
          onNavigateToTutor={(stgId) => { setActivityOrigin('STUDENT_HOME'); handleOpenTutor(stgId); }}
          onNavigateToDrill={(drillType) => {
            setActivityOrigin('STUDENT_HOME');
            if (drillType) handleOpenDrill(drillType, 'STUDENT_HOME');
            else setCurrentScreen('DRILL_CENTER');
          }}
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
      {currentScreen === 'TEACHER_HOME' && session && session.role === 'TEACHER' && (
        <TeacherHomeScreen
          session={session as TeacherSession}
          onOpenAssignments={() => setCurrentScreen('TEACHER_ASSIGNMENTS')}
          onOpenBattleLobby={() => setCurrentScreen('BATTLE_LOBBY')}
          onOpenBattleConsole={() => setCurrentScreen('TEACHER_BATTLE_CONSOLE')}
          onLogout={async () => {
            await authService.logout();
            setSession(null);
            setCurrentScreen('LOGIN');
          }}
        />
      )}

      {currentScreen === 'TEACHER_ASSIGNMENTS' && session && session.role === 'TEACHER' && (
        <TeacherAssignmentsScreen
          session={session as TeacherSession}
          onBack={() => setCurrentScreen('TEACHER_HOME')}
          onPreviewStage={(stageId) => { setActivityOrigin('TEACHER_ASSIGNMENTS'); handleSelectStage(stageId); }}
          onPreviewTutor={(stageId) => { setActivityOrigin('TEACHER_ASSIGNMENTS'); handleOpenTutor(stageId); }}
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
          onStartRecoveryDrill={() => handleOpenDrill('RECOVERY_DRILL', session?.role === 'TEACHER' ? 'TEACHER_ASSIGNMENTS' : 'STUDENT_HOME')}
          onReturnHome={() => setCurrentScreen(session?.role === 'TEACHER' ? 'TEACHER_HOME' : 'STUDENT_HOME')}
          onRematch={() => setCurrentScreen('BATTLE_LOBBY')}
        />
      )}

      {/* 0f. Teacher Live Battle Console (Sprint 7 Professor Arena Console) */}
      {currentScreen === 'TEACHER_BATTLE_CONSOLE' && (
        <ProfessorArenaConsoleScreen
          room={
            (realtimeArenaService as any).rooms?.get('room_seed_001') || {
              id: 'room_seed_001',
              roomCode: 'ICE742',
              organizationId: 'ORG_KLAPANYA',
              classroomId: 'P6-1',
              professorId: 'usr_prof_001',
              professorName: 'คุณครูปัญญา วิชาการ',
              professorAvatar: 'professor_male',
              territoryId: 'FROZEN_ARCTIC',
              questionSetId: 'DOJO_D1_CORE',
              title: 'ลานประลองสมการเชิงเส้น ป.6/1 (Arctic Classroom Duel)',
              mode: 'STANDARD_DUEL',
              status: 'LOBBY',
              maxPlayers: 12,
              currentRoundIndex: 0,
              totalRounds: 8,
              roundTimeLimitSec: 30,
              roundSecondsLeft: 30,
              questions: getDojoQuestions('D1').slice(0, 8),
              participants: {},
              hintsUsedCount: 0,
              recoveryQueueCount: 0,
              createdAt: new Date().toISOString(),
            }
          }
          onExit={() => setCurrentScreen('TEACHER_HOME')}
          onOpenReviewHub={() => setCurrentScreen('REVIEW_HUB')}
        />
      )}

      {/* 1. Character & 2D Avatar Select */}
      {currentScreen === 'AVATAR_SELECT' && (
        <AvatarHeroSelectScreen
          currentProfile={profile}
          onConfirmCharacter={handleConfirmCharacter}
          onBack={() => setCurrentScreen('STUDENT_HOME')}
        />
      )}

      {/* Arctic Hero Select (Master Approved Template) */}
      {currentScreen === 'HERO_SELECT' && (
        <AvatarHeroSelectScreen
          currentProfile={profile}
          onConfirmCharacter={handleConfirmCharacter}
          onBack={() => setCurrentScreen('LANDING')}
        />
      )}

      {/* 2. World Map Screen with Learning Shortcuts */}
      {currentScreen === 'MAP' && (
        <MapScreen
          profile={profile}
          onGoHome={() => setCurrentScreen('STUDENT_HOME')}
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
          onOpenDrillCenter={() => { setActivityOrigin('MAP'); setCurrentScreen('DRILL_CENTER'); }}
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
          onDrill={() => { setActivityOrigin(activityOrigin === 'TEACHER_ASSIGNMENTS' ? 'TEACHER_ASSIGNMENTS' : 'MAP'); setCurrentScreen('DRILL_CENTER'); }}
          onPlayPractice={() => setCurrentScreen('DOJO_BATTLE')}
          onPlayChallenge={() => setCurrentScreen('DOJO_BATTLE')}
          onOpenCodexChapter={(chId) => { setCodexInitialChapter(chId); setShowCodexModal(true); }}
          onBack={() => setCurrentScreen(activityReturnDestination(activityOrigin, session?.role))}
        />
      )}

      {/* Tutor 1/5: searchable topic catalog */}
      {currentScreen === 'TUTOR_CATALOG' && <TutorCatalogScreen onBack={() => setCurrentScreen(activityOrigin === 'TEACHER_ASSIGNMENTS' ? 'TEACHER_ASSIGNMENTS' : 'STUDENT_HOME')} onSelectLesson={handleOpenTutor} />}

      {/* Tutor 2/5: topic overview */}
      {currentScreen === 'TUTOR_OVERVIEW' && <TutorTopicOverviewScreen lesson={activeTutorLesson} onBack={() => setCurrentScreen(activityOrigin === 'TEACHER_ASSIGNMENTS' ? 'TEACHER_ASSIGNMENTS' : 'TUTOR_CATALOG')} onStart={() => setCurrentScreen('TUTOR_ROOM')} />}

      {/* Tutor 3/5: 7-step lesson */}
      {currentScreen === 'TUTOR_ROOM' && (
        <TutorRoomScreen
          lesson={activeTutorLesson}
          onFinishLessonAndStartDrill={startTutorPractice}
          onFinishLessonAndPlayStage={() => setCurrentScreen('DOJO_BATTLE')}
          onBack={() => setCurrentScreen('TUTOR_OVERVIEW')}
        />
      )}

      {/* Tutor 4/5: quiet practice sheet, not a battle arena */}
      {currentScreen === 'TUTOR_PRACTICE' && activeDrillConfig && (
        <TutorPracticeScreen
          lesson={activeTutorLesson}
          questions={activeDrillConfig.questions}
          profile={profile}
          onFinish={(res) => { setTutorResult(res); setCurrentScreen('TUTOR_RESULT'); }}
          onBack={() => setCurrentScreen('TUTOR_ROOM')}
        />
      )}

      {/* Tutor 5/5: standalone result */}
      {currentScreen === 'TUTOR_RESULT' && tutorResult && <TutorResultScreen lesson={activeTutorLesson} result={tutorResult} onReview={() => setCurrentScreen('TUTOR_ROOM')} onRetry={startTutorPractice} onChooseTopic={() => setCurrentScreen('TUTOR_CATALOG')} onHome={() => setCurrentScreen('STUDENT_HOME')} />}

      {/* 5. Drill Center Screen */}
      {currentScreen === 'DRILL_CENTER' && (
        <DrillCenterScreen
          profile={profile}
          onStartDrillSession={(dConfig) => {
            setActiveDrillConfig(dConfig);
            setCurrentScreen('DRILL_SESSION');
          }}
          onBack={() => setCurrentScreen(activityReturnDestination(activityOrigin, session?.role))}
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
            setCurrentScreen(activityReturnDestination(activityOrigin, session?.role));
          }}
          onExitStage={() => setCurrentScreen(activityReturnDestination(activityOrigin, session?.role))}
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
        realMode&&session?.role==='STUDENT'?<VerifiedCampaignGate key={`${session.userId}:${activeDojoStageId}`} owner={session.userId} stageId={activeDojoStageId} heroId={profile.heroId} onExit={()=>setCurrentScreen('MAP')}>
          {sessionId=><BattleScreen trustedSessionId={sessionId} stageId={activeDojoStageId} stageName={activeDojoStageInfo.thaiName} questions={activeDojoQuestions} profile={profile} isExamMode={false}
            onFinishSession={async res=>{setCompletedCampaignId(sessionId);setDojoSessionResult(res);await handleFinishSessionGeneric(res);setCurrentScreen('DOJO_RESULT');}} onExitStage={()=>setCurrentScreen('MAP')}/>}
        </VerifiedCampaignGate>:
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
        realMode&&session&&completedCampaignId?<VerifiedCampaignResult sessionId={completedCampaignId} owner={session.userId} onExit={()=>setCurrentScreen('MAP')}/>:
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

      {/* Full-screen safe Boss preview: real player UI with persistence disabled. */}
      {currentScreen === 'BOSS_PREVIEW' && (
        <ArenaTemplatePreviewScreen />
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

      {/* Floating Review & Playtest Hub Trigger (Dev & Teacher Authorized Only) */}
      {authSession.can('ACCESS_REVIEW_HUB') && (
        <div className="fixed bottom-3 right-3 z-50">
          <button
            onClick={() => setCurrentScreen('REVIEW_HUB')}
            className="px-3 py-1.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[11px] shadow-lg flex items-center gap-1.5 border border-purple-300 transform hover:scale-105 transition-all opacity-80 hover:opacity-100"
            title="Authorized Review & Inspection Hub"
          >
            <span>🔬</span>
            <span>Review Hub</span>
          </button>
        </div>
      )}

      {currentScreen === 'REVIEW_HUB' && !authSession.can('ACCESS_REVIEW_HUB') && <div role="alert" className="p-6">Review Hub access denied.<button className="min-h-[44px] px-4" onClick={() => setCurrentScreen('LANDING')}>Return to landing</button></div>}
      {currentScreen === 'REVIEW_HUB' && authSession.can('ACCESS_REVIEW_HUB') && (
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
