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
  BossBattleResult,
  BossPhaseId,
  GrandmasterTrialResult
} from './types';
import { LocalStorageAdapter, DEFAULT_PROFILE } from './storage/local-storage-adapter';
import { getQuestionsByStage, DOJO_STAGES } from './content/dojo-database';
import { getShrineQuestions, SHRINE_STAGES } from './content/shrine-database';
import { getGatewayQuestions, GATEWAY_STAGES } from './content/onet-database';
import { getBossQuestions, BOSS_CITADELS } from './content/boss-database';
import { ALL_GEOMETRY_QUESTIONS } from './content/geometry-database';
import { ALL_QUEST_QUESTIONS } from './content/quest-database';
import { sampleGrandmasterTrialQuestions } from './engine/trial-sampler';
import { evaluateTopFormEligibility } from './progression/top-form';
import { getRankFromXp } from './engine/economy';
import { HeroSelectScreen } from './ui/screens/HeroSelectScreen';
import { MapScreen } from './ui/screens/MapScreen';
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

type AppScreen = 
  | 'HERO_SELECT' 
  | 'MAP' 
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
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('HERO_SELECT');
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  const [trialQuestions, setTrialQuestions] = useState(sampleGrandmasterTrialQuestions());

  useEffect(() => {
    async function init() {
      const saved = await storage.loadProfile();
      if (saved) {
        setProfile(saved);
        setCurrentScreen('MAP');
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const updateProfile = async (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    await storage.saveProfile(newProfile);
  };

  const handleSelectHero = async (heroId: HeroClassId, heroName: string) => {
    const updated: PlayerProfile = { ...profile, heroId, heroName };
    await updateProfile(updated);
    setCurrentScreen('MAP');
  };

  const handleFinishSessionGeneric = async (result: StageSessionResult) => {
    const newCoins = profile.coins + result.earnedCoins;
    const newXp = profile.xp + result.earnedXp;
    const { rank, level } = getRankFromXp(newXp);

    const cleared = new Set(profile.clearedStages);
    if (result.isPassed) cleared.add(result.stageId);

    const unlocked = new Set(profile.unlockedGear);
    if (result.unlockedGear) unlocked.add(result.unlockedGear);

    const newSkillMastery = { ...profile.skillMastery };
    Object.entries(result.masteryUpdates).forEach(([k, delta]) => {
      newSkillMastery[k] = delta.after;
    });

    const updated: PlayerProfile = {
      ...profile,
      coins: newCoins,
      xp: newXp,
      level,
      rank,
      clearedStages: Array.from(cleared),
      unlockedGear: Array.from(unlocked),
      skillMastery: newSkillMastery,
    };

    await updateProfile(updated);
    setCurrentScreen('MAP');
  };

  const handleFinishTrial = async (result: GrandmasterTrialResult) => {
    const newCoins = profile.coins + result.earnedCoins;
    const newXp = profile.xp + result.earnedXp;
    const { rank, level } = getRankFromXp(newXp);

    const newBest = Math.max(profile.trialBestScore || 0, result.accuracy);
    const newSkillMastery = { ...profile.skillMastery };
    Object.entries(result.masteryUpdates).forEach(([k, delta]) => {
      newSkillMastery[k] = delta.after;
    });

    const updated: PlayerProfile = {
      ...profile,
      coins: newCoins,
      xp: newXp,
      level,
      rank: result.isTopFormQualified ? 'Grandmaster Scholar' : rank,
      trialBestScore: newBest,
      skillMastery: newSkillMastery,
    };

    await updateProfile(updated);

    const eligibility = evaluateTopFormEligibility(updated);
    if (eligibility.isEligible) {
      setCurrentScreen('TOP_FORM_CEREMONY');
    } else {
      alert(`การทดสอบเสร็จสิ้น! คะแนนที่ได้: ${result.accuracy}% (${result.isPassed ? 'ผ่านเกณฑ์ 80%' : 'ยังไม่ผ่านเกณฑ์'})`);
      setCurrentScreen('MAP');
    }
  };

  const handleResetProgress = async () => {
    if (window.confirm('ต้องการล้างข้อมูลความคืบหน้าการทดสอบทั้งหมดหรือไม่?')) {
      await storage.resetProfile();
      setProfile(DEFAULT_PROFILE);
      setCurrentScreen('HERO_SELECT');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-arctic-900 flex items-center justify-center text-cyan-400 font-bold text-lg">
        กำลังโหลดดินแดนอาร์กติก...
      </div>
    );
  }

  const activeDojoStageInfo = DOJO_STAGES.find((s) => s.id === activeDojoStageId) || DOJO_STAGES[0];
  const activeDojoQuestions = getQuestionsByStage(activeDojoStageId);

  const activeShrineStageInfo = SHRINE_STAGES.find((s) => s.id === activeShrineStageId) || SHRINE_STAGES[0];
  const activeShrineQuestions = getShrineQuestions(activeShrineStageId, shrineRunSize);

  const activeGatewayStageInfo = GATEWAY_STAGES.find((s) => s.id === activeGatewayStageId) || GATEWAY_STAGES[0];
  const activeGatewayQuestions = getGatewayQuestions(activeGatewayStageId);

  const activeBossInfo = BOSS_CITADELS.find((b) => b.id === activeBossId) || BOSS_CITADELS[0];
  const activeBossQuestions = getBossQuestions(activeBossId);

  const topFormEligibility = evaluateTopFormEligibility(profile);

  return (
    <div className="min-h-screen bg-arctic-900 text-slate-100 font-sans">
      {currentScreen === 'HERO_SELECT' && (
        <HeroSelectScreen currentHeroId={profile.heroId} onSelectHero={handleSelectHero} />
      )}

      {currentScreen === 'MAP' && (
        <MapScreen
          profile={profile}
          onEnterStage={(id) => { setActiveDojoStageId(id); setCurrentScreen('DOJO_BATTLE'); }}
          onEnterShrine={(id, mode, size) => { setActiveShrineStageId(id); setShrineMode(mode); setShrineRunSize(size); setCurrentScreen('SHRINE_BATTLE'); }}
          onEnterGateway={(id, mode) => { setActiveGatewayStageId(id); setGatewayMode(mode); setCurrentScreen('GATEWAY_EXAM'); }}
          onEnterBoss={(id, mode, phase) => { setActiveBossId(id); setBossMode(mode); setBossPhaseId(phase); setCurrentScreen('BOSS_BATTLE'); }}
          onEnterGeometry={() => setCurrentScreen('GEOMETRY')}
          onEnterQuestBoard={() => setCurrentScreen('QUEST_BOARD')}
          onEnterFinalTrial={() => { setTrialQuestions(sampleGrandmasterTrialQuestions()); setCurrentScreen('FINAL_TRIAL'); }}
          onEnterTopFormCeremony={() => setCurrentScreen('TOP_FORM_CEREMONY')}
          onOpenInventory={() => setCurrentScreen('INVENTORY')}
          onSelectPet={async (petId) => { await updateProfile({ ...profile, activePetId: petId }); }}
          onChangeHero={() => setCurrentScreen('HERO_SELECT')}
          onResetProgress={handleResetProgress}
        />
      )}

      {currentScreen === 'DOJO_BATTLE' && (
        <BattleScreen
          stageId={activeDojoStageId}
          stageName={activeDojoStageInfo.thaiName}
          questions={activeDojoQuestions}
          profile={profile}
          onFinishSession={async (res) => { setDojoSessionResult(res); await handleFinishSessionGeneric(res); setCurrentScreen('DOJO_RESULT'); }}
          onExitStage={() => setCurrentScreen('MAP')}
        />
      )}

      {currentScreen === 'DOJO_RESULT' && dojoSessionResult && (
        <ResultScreen result={dojoSessionResult} onReturnToMap={() => setCurrentScreen('MAP')} />
      )}

      {currentScreen === 'SHRINE_BATTLE' && (
        <ShrineSpeedrunScreen
          stageId={activeShrineStageId}
          stageName={activeShrineStageInfo.thaiName}
          targetTimeSec={activeShrineStageInfo.targetTimeSec}
          runMode={shrineMode}
          runSize={shrineRunSize}
          questions={activeShrineQuestions}
          profile={profile}
          onFinishRun={async (res) => {
            setShrineResult(res);
            const cleared = new Set(profile.clearedStages);
            if (res.isPassed) cleared.add(res.stageId);
            const shrineBestGrades = { ...(profile.shrineBestGrades || {}) };
            shrineBestGrades[res.stageId] = res.speedGrade;
            await updateProfile({ ...profile, clearedStages: Array.from(cleared), shrineBestGrades });
            setCurrentScreen('SHRINE_RESULT');
          }}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {currentScreen === 'SHRINE_RESULT' && shrineResult && (
        <ShrineResultScreen result={shrineResult} onReturnToMap={() => setCurrentScreen('MAP')} onPlayAgain={() => setCurrentScreen('SHRINE_BATTLE')} />
      )}

      {currentScreen === 'GATEWAY_EXAM' && (
        <GatewayExamScreen
          stageId={activeGatewayStageId}
          stageName={activeGatewayStageInfo.thaiName}
          targetTimeSec={activeGatewayStageInfo.targetTimeSec}
          runMode={gatewayMode}
          questions={activeGatewayQuestions}
          profile={profile}
          onFinishExam={async (res) => {
            setGatewayResult(res);
            const cleared = new Set(profile.clearedStages);
            if (res.isPassed) cleared.add(res.stageId);
            const newReadiness = { ...(profile.gatewayReadiness || {}) };
            newReadiness[res.stageId] = res.readinessLevel;
            await updateProfile({ ...profile, clearedStages: Array.from(cleared), gatewayReadiness: newReadiness });
            setCurrentScreen('GATEWAY_RESULT');
          }}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {currentScreen === 'GATEWAY_RESULT' && gatewayResult && (
        <GatewayResultScreen result={gatewayResult} onReturnToMap={() => setCurrentScreen('MAP')} />
      )}

      {currentScreen === 'BOSS_BATTLE' && (
        <BossArenaScreen
          bossInfo={activeBossInfo}
          initialPhaseId={bossPhaseId}
          mode={bossMode}
          questions={activeBossQuestions}
          profile={profile}
          onFinishBattle={async (res) => {
            setBossResult(res);
            const cleared = new Set(profile.clearedStages);
            if (res.isVictory) cleared.add(res.bossId);
            const tiers = { ...(profile.bossPerformanceTiers || {}) };
            tiers[res.bossId] = res.performanceTier;
            await updateProfile({ ...profile, clearedStages: Array.from(cleared), bossPerformanceTiers: tiers });
            setCurrentScreen('BOSS_RESULT');
          }}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {currentScreen === 'BOSS_RESULT' && bossResult && (
        <BossResultScreen result={bossResult} onReturnToMap={() => setCurrentScreen('MAP')} />
      )}

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

      {currentScreen === 'FINAL_TRIAL' && (
        <FinalTrialScreen
          questions={trialQuestions}
          profile={profile}
          onFinishTrial={handleFinishTrial}
          onExit={() => setCurrentScreen('MAP')}
        />
      )}

      {currentScreen === 'TOP_FORM_CEREMONY' && (
        <TopFormCeremonyScreen
          profile={profile}
          eligibility={topFormEligibility}
          onReturnToMap={() => setCurrentScreen('MAP')}
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
    </div>
  );
};
export default App;
