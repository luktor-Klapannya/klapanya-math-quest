import React, { useState } from 'react';
import { 
  PlayerProfile, 
  ShrineRunMode, 
  ShrineRunSize, 
  GatewayRunMode, 
  BossBattleMode, 
  BossPhaseId, 
  TerritoryId 
} from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { GEAR_DATABASE } from '../../progression/gear-matrix';
import { TERRITORY_DATABASE } from '../../progression/territory-matrix';
import { DOJO_STAGES } from '../../content/dojo-database';
import { SHRINE_STAGES } from '../../content/shrine-database';
import { GATEWAY_STAGES } from '../../content/onet-database';
import { BOSS_CITADELS } from '../../content/boss-database';
import { GEOMETRY_CHAMBERS } from '../../content/geometry-database';
import { QUEST_MISSION_GROUPS } from '../../content/quest-database';
import { evaluateTopFormEligibility } from '../../progression/top-form';
import { HeroAvatarView } from '../components/HeroAvatarView';
import { 
  Coins, 
  Award, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Zap, 
  Crown, 
  Flame, 
  Layers,
  BookOpen,
  Sword,
  Compass,
  Scroll,
  Globe,
  Mountain,
  Hammer,
  Shield,
  ChevronRight,
  Info
} from 'lucide-react';

interface MapScreenProps {
  profile: PlayerProfile;
  onEnterStage: (stageId: string) => void;
  onEnterShrine: (stageId: string, runMode: ShrineRunMode, runSize: ShrineRunSize) => void;
  onEnterGateway: (stageId: string, runMode: GatewayRunMode) => void;
  onEnterBoss: (bossId: string, mode: BossBattleMode, phaseId: BossPhaseId) => void;
  onEnterGeometry: () => void;
  onEnterQuestBoard: () => void;
  onEnterFinalTrial: () => void;
  onEnterTopFormCeremony: () => void;
  onOpenInventory: () => void;
  onSelectPet?: (petId: string) => void;
  onChangeHero: () => void;
  onResetProgress: () => void;
}

type ZoneNodeId = 'DOJO' | 'SHRINE' | 'GATEWAY' | 'BOSS' | 'GEO' | 'QUEST' | 'FORGE' | 'FINAL_SUMMIT';

interface MapNodeData {
  id: ZoneNodeId;
  name: string;
  thaiName: string;
  subtitle: string;
  icon: string;
  coords: { x: number; y: number }; // Percentage for desktop map placement
  questionCount: number;
  rewardText: string;
  state: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'CLEARED' | 'MASTERED';
  progressPercent: number;
  academicHighlight: string;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  profile,
  onEnterStage,
  onEnterShrine,
  onEnterGateway,
  onEnterBoss,
  onEnterGeometry,
  onEnterQuestBoard,
  onEnterFinalTrial,
  onEnterTopFormCeremony,
  onOpenInventory,
  onSelectPet,
  onChangeHero,
  onResetProgress,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<ZoneNodeId>('DOJO');
  const [viewMode, setViewMode] = useState<'MAP' | 'DETAIL'>('MAP');
  const [shrineMode, setShrineMode] = useState<ShrineRunMode>('RANKED');
  const [shrineRunSize, setShrineRunSize] = useState<ShrineRunSize>(10);
  const [gatewayMode, setGatewayMode] = useState<GatewayRunMode>('EXAM');
  const [bossMode, setBossMode] = useState<BossBattleMode>('CHALLENGE');
  const [showTerritoryModal, setShowTerritoryModal] = useState<boolean>(false);

  const hero = HERO_CLASSES[profile.heroId];
  const territory = TERRITORY_DATABASE[profile.currentTerritoryId] || TERRITORY_DATABASE.FROZEN_ARCTIC;
  const topFormEligibility = evaluateTopFormEligibility(profile);

  // Compute live node states
  const dojoClearedCount = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'].filter((s) => profile.clearedStages.includes(s)).length;
  const dojoState = dojoClearedCount === 6 ? 'CLEARED' : dojoClearedCount > 0 ? 'IN_PROGRESS' : 'AVAILABLE';

  const shrineClearedCount = ['F1', 'F2', 'F3', 'F4'].filter((s) => profile.clearedStages.includes(s)).length;
  const shrineState = shrineClearedCount === 4 ? 'CLEARED' : shrineClearedCount > 0 ? 'IN_PROGRESS' : 'AVAILABLE';

  const gatewayClearedCount = ['ONET-1', 'ONET-2', 'ONET-3', 'ONET-4'].filter((s) => profile.clearedStages.includes(s)).length;
  const gatewayState = gatewayClearedCount === 4 ? 'CLEARED' : gatewayClearedCount > 0 ? 'IN_PROGRESS' : dojoClearedCount >= 2 ? 'AVAILABLE' : 'LOCKED';

  const bossClearedCount = ['BOSS-1', 'BOSS-2', 'BOSS-3'].filter((s) => profile.clearedStages.includes(s)).length;
  const bossState = bossClearedCount === 3 ? 'MASTERED' : bossClearedCount > 0 ? 'IN_PROGRESS' : gatewayClearedCount >= 2 ? 'AVAILABLE' : 'LOCKED';

  const geoCleared = profile.clearedStages.includes('FORBIDDEN_GEOMETRY_RUINS');
  const geoState = geoCleared ? 'CLEARED' : dojoClearedCount >= 4 ? 'AVAILABLE' : 'LOCKED';

  const questCleared = profile.clearedStages.includes('ARCTIC_QUEST_BOARD');
  const questState = questCleared ? 'CLEARED' : shrineClearedCount >= 2 ? 'AVAILABLE' : 'LOCKED';

  const forgeUnlocked = profile.isFrostCoreForgeUnlocked || profile.unlockedGear.includes('LEGENDARY_ADMISSION_WEAPON');
  const forgeState = forgeUnlocked ? 'MASTERED' : (profile.unlockedGear.includes('SPATIAL_DRAGON_CORE') || profile.unlockedGear.includes('GRANDMASTER_BLADE_CORE')) ? 'AVAILABLE' : 'LOCKED';

  const trialScore = profile.trialBestScore || 0;
  const trialState = profile.isTopFormUnlocked ? 'MASTERED' : trialScore >= 80 ? 'CLEARED' : (bossClearedCount >= 1 || gatewayClearedCount >= 3) ? 'AVAILABLE' : 'LOCKED';

  const mapNodes: MapNodeData[] = [
    {
      id: 'DOJO',
      name: 'Training Dojo',
      thaiName: 'เสาหลักโดโจน้ำแข็ง',
      subtitle: 'รากฐาน 6 มิติ (D1 - D6)',
      icon: '🏛️',
      coords: { x: 20, y: 72 },
      questionCount: 180,
      rewardText: 'Dojo Master Arctic Crown (👑)',
      state: dojoState,
      progressPercent: Math.round((dojoClearedCount / 6) * 100),
      academicHighlight: 'แม่สูตรคูณ, กำลังสอง, จำนวนเฉพาะ, เรขาคณิต, ห.ร.ม./ค.ร.น. & เศษส่วนระคน',
    },
    {
      id: 'SHRINE',
      name: 'Farming Shrine',
      thaiName: 'ศาลเจ้าความเร็วออโรร่า',
      subtitle: 'สปีดรันคิดเลขเร็ว (F1 - F4)',
      icon: '⚡',
      coords: { x: 42, y: 80 },
      questionCount: 120,
      rewardText: 'Master Mental Crest & Aurora Shards',
      state: shrineState,
      progressPercent: Math.round((shrineClearedCount / 4) * 100),
      academicHighlight: 'คิดเลขในใจ 5-15 วินาที, คูณ 11, ร้อยละเร็ว, ผลต่างกำลังสอง & อนุกรม',
    },
    {
      id: 'QUEST',
      name: 'Arctic Quest Board',
      thaiName: 'กระดานภารกิจประยุกต์',
      subtitle: 'หมู่บ้านสำรวจอาร์กติก (10 หมวด)',
      icon: '📜',
      coords: { x: 74, y: 75 },
      questionCount: 100,
      rewardText: 'Expedition Master Badge',
      state: questState,
      progressPercent: questCleared ? 100 : 30,
      academicHighlight: 'สมการอายุ, ขาสัตว์, ระยะทาง-เวลา, อัตราทำงาน, ท่อน้ำ, ร้อยละ & มาตราส่วน',
    },
    {
      id: 'GEO',
      name: 'Forbidden Geometry Ruins',
      thaiName: 'วิหารเรขาคณิตโบราณ',
      subtitle: 'โบราณสถานผลึกคริสตัล (5 ห้อง)',
      icon: '📐',
      coords: { x: 18, y: 40 },
      questionCount: 50,
      rewardText: 'Compass of Spatial Truth (🧭)',
      state: geoState,
      progressPercent: geoCleared ? 100 : 20,
      academicHighlight: 'รูปคลี่ 3D, มุมเส้นขนาน, วงกลมใบไม้แรเงา, ปริมาตร & การแทนที่น้ำ (เวกเตอร์ SVG)',
    },
    {
      id: 'GATEWAY',
      name: 'O-NET Gateway',
      thaiName: 'ประตูข้อสอบระดับชาติ',
      subtitle: 'สะพานน้ำแข็งข้อสอบจริง (ONET 1-4)',
      icon: '🌉',
      coords: { x: 50, y: 52 },
      questionCount: 80,
      rewardText: 'O-NET Guardian Armor Set',
      state: gatewayState,
      progressPercent: Math.round((gatewayClearedCount / 4) * 100),
      academicHighlight: 'ข้อสอบมาตรฐานระดับชาติ 4 ตัวเลือก และอัตนัยระบายตัวเลขทศนิยม 2 ตำแหน่ง',
    },
    {
      id: 'BOSS',
      name: 'Last Boss Citadels',
      thaiName: 'ปราสาท 3 มหาบอส',
      subtitle: 'Chulabhorn • SWCH • Tri-Math',
      icon: '🏰',
      coords: { x: 80, y: 38 },
      questionCount: 180,
      rewardText: '3 Boss Cores (Dragon, Blade, Logic)',
      state: bossState,
      progressPercent: Math.round((bossClearedCount / 3) * 100),
      academicHighlight: 'มังกรไซเบอร์ฟรอสต์, โกเลมปรมาจารย์ความเร็ว, มหาจอมเวทโอเปอเรเตอร์',
    },
    {
      id: 'FORGE',
      name: 'Frost Core Forge',
      thaiName: 'เตาหลอมผลึกแกนบอส',
      subtitle: 'แท่นหลอมศาสตราวุธระดับตำนาน',
      icon: '🔨',
      coords: { x: 38, y: 26 },
      questionCount: 0,
      rewardText: 'Excalibur of Absolute Admission (⚔️)',
      state: forgeState,
      progressPercent: forgeUnlocked ? 100 : 0,
      academicHighlight: 'หลอมรวม 3 แกนบอส ปลดล็อกฉายา Grand Admission Champion',
    },
    {
      id: 'FINAL_SUMMIT',
      name: 'Final Grandmaster Trial',
      thaiName: 'ยอดเขาสูงสุด & บัลลังก์ ม.1',
      subtitle: 'การทดสอบตัดสินบัลลังก์ (40Q)',
      icon: '👑',
      coords: { x: 62, y: 15 },
      questionCount: 40,
      rewardText: 'TOP FORM SOVEREIGN ASCENSION',
      state: trialState,
      progressPercent: profile.isTopFormUnlocked ? 100 : trialScore,
      academicHighlight: 'ข้อสอบสุ่ม 40 ข้อตามพิมพ์เขียว (60 นาที) • ผ่าน >=80% • Top Form >=85%',
    },
  ];

  const selectedNode = mapNodes.find((n) => n.id === selectedNodeId) || mapNodes[0];

  const handleEnterSelectedNode = () => {
    if (selectedNode.id === 'DOJO') onEnterStage('D1');
    else if (selectedNode.id === 'SHRINE') onEnterShrine('F1', shrineMode, shrineRunSize);
    else if (selectedNode.id === 'GATEWAY') onEnterGateway('ONET-1', gatewayMode);
    else if (selectedNode.id === 'BOSS') onEnterBoss('BOSS-1', bossMode, 'PHASE_1');
    else if (selectedNode.id === 'GEO') onEnterGeometry();
    else if (selectedNode.id === 'QUEST') onEnterQuestBoard();
    else if (selectedNode.id === 'FORGE') onOpenInventory();
    else if (selectedNode.id === 'FINAL_SUMMIT') {
      if (topFormEligibility.isEligible) onEnterTopFormCeremony();
      else onEnterFinalTrial();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none font-sans">
      {/* Dynamic Animated Environment Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-cyan-950/40 to-slate-950 pointer-events-none z-0" />

      {/* Atmospheric Aurora Light Ribbons */}
      <div className="absolute top-0 left-1/4 right-1/4 h-80 bg-gradient-to-r from-teal-500/10 via-cyan-400/20 to-blue-500/10 blur-3xl pointer-events-none z-0 animate-pulse" />
      
      {/* Soft Mountain Ridge Contours SVG (Background Landscape) */}
      <svg className="absolute bottom-0 left-0 right-0 w-full h-96 opacity-25 pointer-events-none z-0" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0,280 L180,180 L360,260 L540,120 L720,240 L900,100 L1080,210 L1260,150 L1440,300 L1440,400 L0,400 Z" fill="#0369a1" fillOpacity="0.4" />
        <path d="M0,320 L240,220 L480,310 L720,190 L960,280 L1200,200 L1440,330 L1440,400 L0,400 Z" fill="#0f172a" fillOpacity="0.8" />
        {/* Soft Frost Snowcaps */}
        <polygon points="540,120 520,150 560,150" fill="#e0f2fe" fillOpacity="0.6" />
        <polygon points="900,100 875,140 925,140" fill="#e0f2fe" fillOpacity="0.7" />
      </svg>

      {/* Hero Silhouette in Bottom-Right Corner (8-12% Low Opacity, Non-intrusive) */}
      <div className="absolute -bottom-10 -right-8 w-96 h-96 pointer-events-none opacity-10 z-0 flex items-end justify-end select-none">
        <div className="text-[260px] leading-none filter blur-[0.5px]">
          {hero.avatar}
        </div>
      </div>

      {/* Floating Frost Snowflakes (Lightweight CSS particles) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="snow-particle w-1.5 h-1.5 bg-white/40 rounded-full absolute top-10 left-[15%] animate-pulse" />
        <div className="snow-particle w-2 h-2 bg-cyan-200/30 rounded-full absolute top-28 left-[45%] animate-pulse" />
        <div className="snow-particle w-1 h-1 bg-white/50 rounded-full absolute top-60 left-[75%] animate-pulse" />
        <div className="snow-particle w-2.5 h-2.5 bg-sky-200/20 rounded-full absolute top-40 left-[85%] animate-pulse" />
      </div>

      {/* 1. TOP PLAYER HUD (Compact, High-Information Header) */}
      <header className="relative z-20 frost-card rounded-2xl p-3 md:p-4 m-3 md:m-4 max-w-6xl w-[calc(100%-1.5rem)] md:w-[calc(100%-2rem)] mx-auto flex flex-wrap items-center justify-between gap-3 shadow-xl border border-cyan-500/40">
        <div className="flex items-center gap-3">
          <HeroAvatarView profile={profile} size="md" showPet={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-base md:text-lg tracking-tight">{profile.heroName}</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/40">
                Lv.{profile.level} {profile.isTopFormUnlocked ? '👑 Grand Arctic Sovereign' : profile.rank}
              </span>
            </div>
            <p className="text-[11px] text-cyan-300 font-semibold mt-0.5">
              คลาส: {hero.thaiName} • แดน: {territory.thaiName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{profile.coins.toLocaleString()} 🪙</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>{profile.xp.toLocaleString()} XP</span>
          </div>

          <button 
            onClick={onOpenInventory} 
            className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-400 flex items-center gap-1 shadow-md"
          >
            <Sword className="w-3.5 h-3.5" /> คลัง & เตาหลอม
          </button>

          <button 
            onClick={() => setShowTerritoryModal(true)} 
            className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-400 flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" /> แดน & สัตว์เลี้ยง
          </button>

          <button onClick={onChangeHero} className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600">
            เปลี่ยนคลาส
          </button>
        </div>
      </header>

      {/* 2. ZONE QUICK SHORTCUT TABS */}
      <div className="relative z-20 max-w-6xl w-[calc(100%-1.5rem)] md:w-[calc(100%-2rem)] mx-auto grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
        <button 
          onClick={() => setSelectedNodeId('DOJO')} 
          className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            selectedNodeId === 'DOJO' ? 'bg-cyan-600 text-white shadow-glow-cyan' : 'frost-card text-slate-300 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-300" /> Dojo (180Q)
        </button>
        <button 
          onClick={() => setSelectedNodeId('SHRINE')} 
          className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            selectedNodeId === 'SHRINE' ? 'bg-purple-600 text-white shadow-glow-purple' : 'frost-card text-slate-300 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-purple-300" /> Shrine (120Q)
        </button>
        <button 
          onClick={() => setSelectedNodeId('GATEWAY')} 
          className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            selectedNodeId === 'GATEWAY' ? 'bg-emerald-600 text-slate-950 font-black shadow-glow-cyan' : 'frost-card text-slate-300 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-300" /> O-NET (80Q)
        </button>
        <button 
          onClick={() => setSelectedNodeId('BOSS')} 
          className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            selectedNodeId === 'BOSS' ? 'bg-rose-600 text-white shadow-glow-gold' : 'frost-card text-slate-300 hover:text-white'
          }`}
        >
          <Sword className="w-3.5 h-3.5 text-rose-300" /> Boss (180Q)
        </button>
        <button 
          onClick={() => setSelectedNodeId('GEO')} 
          className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            selectedNodeId === 'GEO' ? 'bg-blue-600 text-white' : 'frost-card text-slate-300 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-blue-300" /> Geo (50Q)
        </button>
        <button 
          onClick={() => setSelectedNodeId('QUEST')} 
          className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            selectedNodeId === 'QUEST' ? 'bg-amber-600 text-slate-950 font-black' : 'frost-card text-slate-300 hover:text-white'
          }`}
        >
          <Scroll className="w-3.5 h-3.5 text-amber-300" /> Quest (100Q)
        </button>
      </div>

      {/* Top Form Banner (if eligible) */}
      {topFormEligibility.isEligible && (
        <div className="relative z-20 max-w-6xl w-[calc(100%-1.5rem)] md:w-[calc(100%-2rem)] mx-auto p-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-glow-gold animate-bounce">
          <div className="flex items-center gap-2.5">
            <Crown className="w-7 h-7 fill-slate-950" />
            <div>
              <h4 className="text-sm font-black">🌟 ผ่านเกณฑ์ TOP FORM ครบทั้ง 10 ประตูแล้ว!</h4>
              <p className="text-[11px] font-bold text-slate-900">พร้อมเข้ารับพิธีแต่งตั้งจักรพรรดิอาร์กติกและรับศาสตราวุธระดับ MYTHIC</p>
            </div>
          </div>
          <button
            onClick={onEnterTopFormCeremony}
            className="px-4 py-1.5 rounded-xl bg-slate-950 text-amber-300 font-black text-xs hover:bg-slate-900 shadow-md"
          >
            👑 เข้าสู่พิธี TOP FORM
          </button>
        </div>
      )}

      {/* 3. MAIN INTERACTIVE ADVENTURE CANVAS */}
      <main className="relative z-10 flex-1 max-w-6xl w-[calc(100%-1.5rem)] md:w-[calc(100%-2rem)] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Left 2 Cols: The Visual Map Canvas (Desktop 2D Node Canvas / Mobile Vertical Path) */}
        <div className="lg:col-span-2 frost-card rounded-3xl p-4 md:p-6 border-2 border-cyan-500/40 relative min-h-[420px] md:min-h-[500px] flex flex-col justify-between overflow-hidden shadow-2xl">
          
          {/* Map Title Tag */}
          <div className="flex items-center justify-between z-10 mb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm md:text-base font-black text-white">
                แผนที่มหาแคมเปญ: ดินแดนอาร์กติกเยือกแข็ง (710 ข้อ)
              </h3>
            </div>
            <span className="text-[11px] text-cyan-300 font-bold px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40">
              {territory.mapTheme.ambientTitle}
            </span>
          </div>

          {/* Desktop Interactive SVG Path Layer */}
          <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Connecting Pathways between Zones */}
            <path d="M 20 72 Q 30 76 42 80 T 74 75 Q 60 62 50 52 T 18 40 Q 30 32 38 26 T 62 15 Q 70 26 80 38" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="0.8" 
                  strokeDasharray="2,2" 
                  strokeOpacity="0.5" 
                  className="animate-pulse" />
          </svg>

          {/* Desktop Visual Map Nodes Grid */}
          <div className="hidden md:block relative flex-1 z-10 w-full h-full min-h-[360px]">
            {mapNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              
              // Node State Styling
              let stateRing = 'border-cyan-400 bg-arctic-900/90 text-cyan-300';
              let badgeBg = 'bg-cyan-500/20 text-cyan-300';
              if (node.state === 'LOCKED') {
                stateRing = 'border-slate-700 bg-slate-900/70 text-slate-600 opacity-60';
                badgeBg = 'bg-slate-800 text-slate-500';
              } else if (node.state === 'IN_PROGRESS') {
                stateRing = 'border-amber-400 bg-amber-950/90 text-amber-300 ring-2 ring-amber-400 shadow-glow-gold';
                badgeBg = 'bg-amber-500/20 text-amber-300';
              } else if (node.state === 'CLEARED') {
                stateRing = 'border-emerald-400 bg-emerald-950/90 text-emerald-300 shadow-glow-cyan';
                badgeBg = 'bg-emerald-500/20 text-emerald-300';
              } else if (node.state === 'MASTERED') {
                stateRing = 'border-yellow-400 bg-amber-950 text-amber-200 ring-2 ring-yellow-400 shadow-glow-gold animate-pulse';
                badgeBg = 'bg-yellow-500/20 text-yellow-300';
              }

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ left: `${node.coords.x}%`, top: `${node.coords.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl border transition-all duration-200 group flex flex-col items-center select-none ${stateRing} ${
                    isSelected ? 'scale-115 ring-4 ring-cyan-300 z-30 shadow-2xl bg-cyan-950' : 'hover:scale-105 z-10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-arctic-950/80 border border-white/20 flex items-center justify-center text-xl shadow-inner relative">
                    {node.icon}
                    {node.state === 'LOCKED' && (
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute -top-1 -right-1" />
                    )}
                    {node.state === 'CLEARED' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute -top-1 -right-1" />
                    )}
                    {node.state === 'MASTERED' && (
                      <Crown className="w-3.5 h-3.5 text-yellow-400 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <span className="text-[10px] font-black text-white mt-1 whitespace-nowrap px-1.5 py-0.5 rounded-md bg-black/60">
                    {node.thaiName}
                  </span>
                  <span className={`text-[8px] font-bold px-1 rounded mt-0.5 ${badgeBg}`}>
                    {node.questionCount > 0 ? `${node.questionCount}Q` : 'Forge'} • {node.state}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Vertical Adventure Path (390px Optimized View) */}
          <div className="md:hidden space-y-2.5 z-10 max-h-96 overflow-y-auto pr-1">
            {mapNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-400 shadow-glow-cyan'
                      : 'bg-arctic-900/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-arctic-950 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                      {node.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{node.thaiName}</h4>
                      <p className="text-[10px] text-slate-300">{node.subtitle}</p>
                      <span className="text-[9px] text-cyan-300 font-bold">{node.questionCount > 0 ? `${node.questionCount} ข้อ` : 'หลอมอาวุธ'}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                    node.state === 'LOCKED' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                    node.state === 'CLEARED' ? 'bg-emerald-950 text-emerald-300 border-emerald-500' :
                    node.state === 'MASTERED' ? 'bg-amber-950 text-amber-300 border-amber-500' :
                    'bg-cyan-950 text-cyan-300 border-cyan-500'
                  }`}>
                    {node.state}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Map Footer Helper */}
          <div className="flex items-center justify-between text-[11px] text-slate-300 z-10 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" /> คลิกเลือกแลนด์มาร์กเพื่อดูรายละเอียดและเข้าเล่น
            </span>
            <span className="font-mono text-cyan-300 font-bold">
              ความคืบหน้ารวม: {profile.clearedStages.length} / 17 ด่าน
            </span>
          </div>
        </div>

        {/* Right 1 Col: Selected Landmark Inspector & Direct Action */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Landmark Details Card */}
          <div className="frost-card rounded-3xl p-5 border-2 border-cyan-400/80 shadow-glow-cyan flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                  ZONE INSPECTOR
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  selectedNode.state === 'LOCKED' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                  selectedNode.state === 'CLEARED' ? 'bg-emerald-950 text-emerald-300 border-emerald-500' :
                  selectedNode.state === 'MASTERED' ? 'bg-amber-950 text-amber-300 border-amber-500' :
                  'bg-cyan-950 text-cyan-300 border-cyan-500'
                }`}>
                  {selectedNode.state}
                </span>
              </div>

              <div className="flex items-center gap-3 my-2">
                <div className="w-14 h-14 rounded-2xl bg-arctic-950 border-2 border-cyan-400 flex items-center justify-center text-3xl shadow-glow-cyan">
                  {selectedNode.icon}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{selectedNode.thaiName}</h3>
                  <p className="text-xs text-cyan-300">{selectedNode.name}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {selectedNode.subtitle}
              </p>

              {/* Academic Highlight Box */}
              <div className="p-3 rounded-2xl bg-arctic-950/80 border border-slate-700 my-3 text-xs">
                <span className="font-bold text-cyan-300 block mb-1">📚 ขอบเขตวิชาการที่วัด:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">{selectedNode.academicHighlight}</p>
              </div>

              {/* Progress & Reward */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">ความคืบหน้าโซน:</span>
                  <span className="text-white font-bold">{selectedNode.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${selectedNode.progressPercent}%` }}
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-bold flex items-center gap-1.5 mt-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" /> รางวัล: {selectedNode.rewardText}
                </div>
              </div>
            </div>

            {/* Direct Action Button */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={handleEnterSelectedNode}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-glow-cyan transform hover:scale-102 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>เข้าสู่ {selectedNode.thaiName}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Reset Progress link */}
          <div className="text-center">
            <button onClick={onResetProgress} className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 mx-auto">
              <RotateCcw className="w-3 h-3" /> ล้างข้อมูลทดสอบ
            </button>
          </div>
        </div>
      </main>

      {/* Territory & Companion Pet Modal */}
      {showTerritoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="frost-card rounded-3xl p-6 md:p-8 max-w-xl w-full border border-cyan-400 shadow-glow-cyan animate-scale-up text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-black text-white">ระบบแดนศักดิ์สิทธิ์ & สัตว์เลี้ยง (Territory Form)</h3>
              </div>
              <button onClick={() => setShowTerritoryModal(false)} className="text-slate-400 hover:text-white text-xs">
                ปิด
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-400 mb-4">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">แดนที่กำลังผจญภัย (Active)</span>
              <h4 className="text-base font-black text-white">{territory.thaiName} ({territory.name})</h4>
              <p className="text-xs text-slate-300 mt-0.5">{territory.tagline}</p>
            </div>

            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
              เลือกสัตว์เลี้ยงคู่หู (Companion Pet)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
              {territory.companionPets.map((pet) => {
                const isSelected = profile.activePetId === pet.id;
                return (
                  <button
                    key={pet.id}
                    onClick={() => {
                      if (onSelectPet) onSelectPet(pet.id);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400 shadow-glow-cyan'
                        : 'bg-arctic-800/80 border-slate-700 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{pet.avatar}</div>
                    <div className="text-xs font-bold text-white">{pet.thaiName}</div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{pet.practiceFlavorBonus}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowTerritoryModal(false)}
              className="w-full py-2.5 bg-cyan-500 text-slate-950 font-black rounded-xl text-xs hover:bg-cyan-400 shadow-md"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
