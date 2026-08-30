import React, { useState } from 'react';
import { PlayerProfile, HeroClassId, TerritoryId } from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { TERRITORY_DATABASE } from '../../progression/territory-matrix';
import { GEAR_DATABASE } from '../../progression/gear-matrix';
import { HeroAvatarView } from '../components/HeroAvatarView';
import { 
  Compass, 
  Layers, 
  Flame, 
  BookOpen, 
  Sword, 
  Scroll, 
  Crown, 
  Shield, 
  Eye, 
  Hammer, 
  ArrowLeft,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Play
} from 'lucide-react';

import { HeroEmoteState, BossAnimationState, DamagePopupData, SoundHookEvent } from '../../types/combat-animation';
import { WEAPON_PROGRESSION_DATABASE } from '../../progression/weapon-visuals';
import { CombatArenaView } from '../components/CombatArenaView';
import { audioEngine, ZONE_MUSIC_DATABASE } from '../../services/audio-service';
import { AudioSfxEvent, ZoneMusicProfileId } from '../../types/audio';
import { 
  calculateEffectiveTimeSec, 
  STAGE_TIMER_BOUNDS, 
  DIFFICULTY_MODIFIERS, 
  QUESTION_TYPE_MODIFIERS 
} from '../../engine/adaptive-timer-engine';
import { AdaptiveTimerDisplay } from '../components/AdaptiveTimerDisplay';

interface ReviewHubScreenProps {
  profile: PlayerProfile;
  onNavigate: (screen: string) => void;
  onSelectHeroClass: (heroId: HeroClassId) => void;
  onToggleTopForm: (enable: boolean) => void;
}

export const ReviewHubScreen: React.FC<ReviewHubScreenProps> = ({
  profile,
  onNavigate,
  onSelectHeroClass,
  onToggleTopForm,
}) => {
  const [selectedHero, setSelectedHero] = useState<HeroClassId>(profile.heroId);
  const [selectedRankTier, setSelectedRankTier] = useState<number>(profile.isTopFormUnlocked ? 3 : 0);
  const [reviewTab, setReviewTab] = useState<'NAV' | 'ANIMATION_LAB' | 'AUDIO_LAB' | 'TIMER_LAB' | 'HEROES' | 'GEAR'>('NAV');

  // Animation Lab State
  const [labHeroEmote, setLabHeroEmote] = useState<HeroEmoteState>('IDLE');
  const [labBossState, setLabBossState] = useState<BossAnimationState>('IDLE');
  const [labBossId, setLabBossId] = useState<string>('BOSS-1');
  const [labWeaponId, setLabWeaponId] = useState<string>('TRAINING_WEAPON');
  const [labDamagePopups, setLabDamagePopups] = useState<DamagePopupData[]>([]);
  const [lastSoundEvent, setLastSoundEvent] = useState<string>('SFX_IDLE');

  // Audio Lab State
  const [audioSettings, setAudioSettings] = useState(audioEngine.getSettings());
  const [activeZoneMusic, setActiveZoneMusic] = useState<ZoneMusicProfileId>('TRAINING_DOJO');

  // Timer Lab State
  const [timerBaseSec, setTimerBaseSec] = useState<number>(30);
  const [timerDiff, setTimerDiff] = useState<number>(3);
  const [timerQType, setTimerQType] = useState<string>('MCQ_STANDARD');
  const [timerStageId, setTimerStageId] = useState<string>('D1');
  const [timerHasDiagram, setTimerHasDiagram] = useState<boolean>(false);
  const [timerIsMultiStep, setTimerIsMultiStep] = useState<boolean>(false);
  const [testSecondsLeft, setTestSecondsLeft] = useState<number>(30);
  const [testIsPaused, setTestIsPaused] = useState<boolean>(false);

  const territory = TERRITORY_DATABASE.FROZEN_ARCTIC;
  const heroInfo = HERO_CLASSES[selectedHero];
  const rankNames = ['R1 Novice Trainee', 'R3 Dojo Adept', 'R5 Gateway Guardian', 'R7 Top Form Sovereign'];

  // Temporary mock profile for inspecting any hero class + rank
  const previewProfile: PlayerProfile = {
    ...profile,
    heroId: selectedHero,
    isTopFormUnlocked: selectedRankTier === 3,
    level: selectedRankTier === 3 ? 20 : selectedRankTier === 2 ? 10 : selectedRankTier === 1 ? 5 : 1,
    rank: selectedRankTier === 3 ? 'Top Form Sovereign' : selectedRankTier === 2 ? 'Gateway Guardian' : selectedRankTier === 1 ? 'Dojo Adept' : 'Novice Trainee',
  };

  const costume = territory.costumeSet[selectedHero]?.[selectedRankTier] || territory.costumeSet[selectedHero]?.[0];
  const weapon = territory.weaponSet[selectedHero]?.[selectedRankTier] || territory.weaponSet[selectedHero]?.[0];
  const skillVfx = territory.skillVfx[selectedHero];

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col text-slate-100 max-w-6xl mx-auto select-none">
      {/* Header */}
      <header className="frost-card rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border-2 border-cyan-400 shadow-glow-cyan">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-2xl shadow-glow-cyan">
            🔬
          </div>
          <div>
            <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">
              VISUAL REVIEW & PLAYTEST HUB
            </span>
            <h1 className="text-base md:text-xl font-black text-white">
              Klapanya Math Quest: Frozen Arctic Inspector
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(['NAV', 'ANIMATION_LAB', 'AUDIO_LAB', 'TIMER_LAB', 'HEROES', 'GEAR'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setReviewTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                reviewTab === tab
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {tab === 'NAV' && '🧭 แดชบอร์ดนำทาง (Direct Nav)'}
              {tab === 'ANIMATION_LAB' && '🎬 แอนิเมชัน (Animation Lab)'}
              {tab === 'AUDIO_LAB' && '🎵 ระบบเสียง (Audio Lab)'}
              {tab === 'TIMER_LAB' && '⏱️ ตัวจับเวลา (Timer Lab)'}
              {tab === 'HEROES' && '🧙‍♂️ ตรวจสอบฮีโร่ (Hero Evolution)'}
              {tab === 'GEAR' && '🛡️ คลังยุทธภัณฑ์ (Gear Matrix)'}
            </button>
          ))}
          <button
            onClick={() => onNavigate('MAP')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs font-bold"
          >
            เข้าสู่เกมหลัก
          </button>
        </div>
      </header>

      {/* TAB 1: Direct Demo Navigation Dashboard */}
      {reviewTab === 'NAV' && (
        <div className="space-y-6">
          <div className="frost-card rounded-2xl p-4 border border-cyan-500/40">
            <h3 className="text-sm font-black text-cyan-300 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> เข้าชมและทดสอบ 13 โซน/หน้าจอหลักได้โดยตรง (Instant Access)
            </h3>
            <p className="text-xs text-slate-300">
              โหมดทดสอบพิเศษสำหรับการตรวจงาน UI/UX โดยไม่ต้องรอปลดล็อกเนื้อหาตามลำดับจริง
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 0. 2D Avatar Select */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-cyan-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400">NEW LEARNING</span>
                <h4 className="text-sm font-black text-white">เลือกตัวละคร 2D (Avatar Select)</h4>
                <p className="text-xs text-slate-400 mt-1">8 ตัวละคร ชาย/หญิง × จอมเวท, อัศวิน, เรนเจอร์, นินจา</p>
              </div>
              <button
                onClick={() => onNavigate('AVATAR_SELECT')}
                className="mt-3 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> เปิด Avatar Select
              </button>
            </div>

            {/* 0b. Tutor Room */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-blue-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-400">TUTOR ROOM</span>
                <h4 className="text-sm font-black text-white">ห้องติวเข้ม 7 ขั้นตอน (Tutor Room)</h4>
                <p className="text-xs text-slate-400 mt-1">แนวคิด, หลักการ, สูตรลัด, จุดลวง, ตัวอย่าง, และลองทำ</p>
              </div>
              <button
                onClick={() => onNavigate('TUTOR_ROOM')}
                className="mt-3 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> เปิด Tutor Room
              </button>
            </div>

            {/* 0c. Drill Center */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-purple-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400">DRILL CENTER</span>
                <h4 className="text-sm font-black text-white">ศูนย์ฝึกดริลล์ (Drill Center)</h4>
                <p className="text-xs text-slate-400 mt-1">Quick, Skill, Trap, Speed, และ Recovery Drills</p>
              </div>
              <button
                onClick={() => onNavigate('DRILL_CENTER')}
                className="mt-3 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> เปิด Drill Center
              </button>
            </div>

            {/* 0d. Stage Detail Preparation */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-cyan-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400">STAGE DETAIL</span>
                <h4 className="text-sm font-black text-white">หน้าเตรียมตัวก่อนเข้าด่าน (Stage Detail)</h4>
                <p className="text-xs text-slate-400 mt-1">ติวก่อนเล่น, ดริลล์, ลุยด่าน, และโหมดท้าทาย</p>
              </div>
              <button
                onClick={() => onNavigate('STAGE_DETAIL')}
                className="mt-3 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> เปิด Stage Detail
              </button>
            </div>

            {/* 0e. Skill Inventory */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-amber-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400">SKILL VAULT</span>
                <h4 className="text-sm font-black text-white">คลังสกิล & ไอเทม (Skill Inventory)</h4>
                <p className="text-xs text-slate-400 mt-1">แยกไอเทมใช้งาน, สกิลพิเศษ, อาวุธ, เกราะ, และศิลา</p>
              </div>
              <button
                onClick={() => onNavigate('SKILL_INVENTORY')}
                className="mt-3 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> เปิด Skill Inventory
              </button>
            </div>

            {/* 1. Hero Select */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-cyan-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400">SCREEN 1</span>
                <h4 className="text-sm font-black text-white">หน้าเลือกคลาสฮีโร่ (Hero Select)</h4>
                <p className="text-xs text-slate-400 mt-1">4 คลาสฮีโร่ สกิลติดตัว และความสามารถเฉพาะทาง</p>
              </div>
              <button
                onClick={() => onNavigate('HERO_SELECT')}
                className="mt-3 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> เปิดหน้า Hero Select
              </button>
            </div>

            {/* 2. World Map */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-cyan-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400">SCREEN 2</span>
                <h4 className="text-sm font-black text-white">แผนที่โลกอาร์กติก (Frozen Arctic Map)</h4>
                <p className="text-xs text-slate-400 mt-1">ศูนย์กลางแคมเปญ 6 โซน สถานะด่าน และคลังอาวุธ</p>
              </div>
              <button
                onClick={() => onNavigate('MAP')}
                className="mt-3 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> เปิดแผนที่โลก Map
              </button>
            </div>

            {/* 3. Training Dojo */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-cyan-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400">ACT 1 (180Q)</span>
                <h4 className="text-sm font-black text-white">โดโจฝึกหัดน้ำแข็ง (Training Dojo: D1)</h4>
                <p className="text-xs text-slate-400 mt-1">การเรียนรู้เน้นความแม่นยำ คำใบ้ 2 ระดับ และการสับตัวเลือก</p>
              </div>
              <button
                onClick={() => onNavigate('DOJO_BATTLE')}
                className="mt-3 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> ทดสอบ Dojo Battle
              </button>
            </div>

            {/* 4. Farming Shrine */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-purple-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400">ACT 2 (120Q)</span>
                <h4 className="text-sm font-black text-white">ศาลเจ้าแสงเหนือ (Farming Shrine: F1)</h4>
                <p className="text-xs text-slate-400 mt-1">สปีดรัน 5-15 วินาที คอมโบความเร็ว และเกรด S/A/B/C</p>
              </div>
              <button
                onClick={() => onNavigate('SHRINE_BATTLE')}
                className="mt-3 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> ทดสอบ Shrine Speedrun
              </button>
            </div>

            {/* 5. O-NET Gateway Exam */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400">ACT 3 (80Q)</span>
                <h4 className="text-sm font-black text-white">ประตูข้อสอบ O-NET (ONET-4 Grid)</h4>
                <p className="text-xs text-slate-400 mt-1">กระดาษคำตอบ Palette Drawer, ติดธงทบทวน และแป้นตัวเลข</p>
              </div>
              <button
                onClick={() => onNavigate('GATEWAY_EXAM')}
                className="mt-3 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> ทดสอบ O-NET Exam
              </button>
            </div>

            {/* 6. Last Boss Arena */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-rose-500/50 hover:border-rose-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-400">ACT 4 (180Q)</span>
                <h4 className="text-sm font-black text-white">ปราสาท 3 มหาบอส (Boss Citadel: BOSS-1)</h4>
                <p className="text-xs text-slate-400 mt-1">Boss HP bar, โล่พลังใจ Player Resolve, ความเสียหายคริติคอล</p>
              </div>
              <button
                onClick={() => onNavigate('BOSS_BATTLE')}
                className="mt-3 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> ทดสอบ Boss Arena
              </button>
            </div>

            {/* 7. Forbidden Geometry Ruins */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-cyan-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-400">ACT 5A (50Q)</span>
                <h4 className="text-sm font-black text-white">วิหารเรขาคณิต (Geometry Ruins)</h4>
                <p className="text-xs text-slate-400 mt-1">รูปคลี่ลูกบาศก์ 3D, มุมเส้นขนาน, ซูมและหมุนเวกเตอร์ SVG</p>
              </div>
              <button
                onClick={() => onNavigate('GEOMETRY')}
                className="mt-3 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> ทดสอบ Geometry Ruins
              </button>
            </div>

            {/* 8. Arctic Quest Board */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-amber-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400">ACT 5B (100Q)</span>
                <h4 className="text-sm font-black text-white">กระดานภารกิจประยุกต์ (Arctic Quest Board)</h4>
                <p className="text-xs text-slate-400 mt-1">10 หมวดโจทย์ปัญหา สมการอายุ ขาสัตว์ ท่อน้ำ และร้อยละ</p>
              </div>
              <button
                onClick={() => onNavigate('QUEST_BOARD')}
                className="mt-3 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> ทดสอบ Quest Board
              </button>
            </div>

            {/* 9. Inventory & Frost Core Forge */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 hover:border-amber-400 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400">ARMORY & FORGE</span>
                <h4 className="text-sm font-black text-white">คลังยุทธภัณฑ์ & เตาหลอมผลึก</h4>
                <p className="text-xs text-slate-400 mt-1">ตรวจอุปกรณ์สวมใส่ และทดสอบพิธีหลอมศาสตรามหาปราชญ์</p>
              </div>
              <button
                onClick={() => onNavigate('INVENTORY')}
                className="mt-3 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> เปิด Inventory & Forge
              </button>
            </div>

            {/* 10. Final Grandmaster Trial */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-amber-400 shadow-glow-gold transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400">CULMINATION EXAM (40Q)</span>
                <h4 className="text-sm font-black text-white">Final Grandmaster Trial (60 mins)</h4>
                <p className="text-xs text-slate-400 mt-1">ข้อสอบคัดเลือก 40 ข้อสุ่มตามพิมพ์เขียว ตัดสินสิทธิ์ Top Form</p>
              </div>
              <button
                onClick={() => onNavigate('FINAL_TRIAL')}
                className="mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> ทดสอบ Final Trial (40Q)
              </button>
            </div>

            {/* 11. Top Form Ceremony */}
            <div className="p-4 rounded-2xl bg-arctic-800 border border-amber-400 shadow-glow-gold transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400">TOP FORM ASCENSION</span>
                <h4 className="text-sm font-black text-white">พิธีแต่งตั้งจักรพรรดิอาร์กติก</h4>
                <p className="text-xs text-slate-400 mt-1">พิธีสวมเกราะ Mythic Arctic Armor และรัศมี Sovereign Halo</p>
              </div>
              <button
                onClick={() => onNavigate('TOP_FORM_CEREMONY')}
                className="mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> เปิด Top Form Ceremony
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hero Evolution & Character Inspector */}
      {reviewTab === 'HEROES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Class Selection & Rank Controls */}
          <div className="space-y-4">
            <div className="frost-card rounded-2xl p-4">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                1. เลือกคลาสฮีโร่ (Hero Class)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(HERO_CLASSES).map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSelectedHero(h.id);
                      onSelectHeroClass(h.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      selectedHero === h.id
                        ? 'bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400'
                        : 'bg-arctic-800/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-2xl">{h.avatar}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{h.thaiName}</div>
                      <span className="text-[10px] text-cyan-400">{h.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="frost-card rounded-2xl p-4">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                2. เลือกระดับขั้นแรงก์ (Rank Tier Evolution)
              </h4>
              <div className="space-y-2">
                {rankNames.map((rName, idx) => (
                  <button
                    key={rName}
                    onClick={() => {
                      setSelectedRankTier(idx);
                      onToggleTopForm(idx === 3);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                      selectedRankTier === idx
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 ring-2 ring-amber-400'
                        : 'bg-arctic-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{rName}</span>
                    {idx === 3 && <span className="text-[10px] text-amber-400">✨ MAX</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center & Right: Live Character Evolution Showcase */}
          <div className="lg:col-span-2 space-y-4">
            <div className="frost-card rounded-3xl p-6 border-2 border-cyan-400 shadow-glow-cyan text-center">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                FROZEN ARCTIC VISUAL IDENTITY
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                {heroInfo.thaiName} • {rankNames[selectedRankTier]}
              </h3>

              {/* Large Avatar Rendering */}
              <div className="my-4">
                <HeroAvatarView profile={previewProfile} size="xl" showPet={true} />
              </div>

              {/* Costume & Weapon Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left my-4">
                <div className="p-3.5 rounded-2xl bg-arctic-950/80 border border-slate-700">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">ชุดเกราะประจำขั้น (Costume)</span>
                  <h5 className="text-xs font-black text-white mt-0.5">{costume.thaiName}</h5>
                  <p className="text-[11px] text-slate-300 mt-1">{costume.description}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-arctic-950/80 border border-slate-700">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">ศาสตราวุธประจำขั้น (Weapon)</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xl">{weapon.icon}</span>
                    <h5 className="text-xs font-black text-white">{weapon.thaiName}</h5>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">{weapon.description}</p>
                </div>
              </div>

              {/* Skill VFX & Aura */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-left text-xs space-y-1">
                <div className="text-cyan-300 font-bold">✨ เอฟเฟกต์สกิล (Skill VFX): {skillVfx.primaryEffect}</div>
                <div className="text-slate-300 text-[11px]">⚡ สกิลกดใช้: {skillVfx.activeVFX}</div>
                <div className="text-amber-300 font-bold text-[11px]">👑 ออร่าร่างสมบูรณ์: {skillVfx.topFormAura}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Gear Matrix Review */}
      {reviewTab === 'GEAR' && (
        <div className="space-y-4">
          <div className="frost-card rounded-2xl p-4 border border-cyan-500/40">
            <h3 className="text-sm font-black text-white">คลังไอเทมและยุทธภัณฑ์ทั้งหมดในระบบ (15 รายการ)</h3>
            <p className="text-xs text-slate-300">แบ่งตาม 5 แหล่งที่มา: โดโจ, ศาลเจ้า, O-NET, บอสอารีน่า และร่างสมบูรณ์ Top Form</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(GEAR_DATABASE).map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-arctic-800 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30">
                      {item.rarity}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white">{item.name}</h4>
                  <p className="text-[11px] text-cyan-400 font-semibold">{item.thaiName}</p>
                  <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-amber-300 font-bold">
                  ⚡ {item.statBonus}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Animation & Game Feel Lab */}
      {reviewTab === 'ANIMATION_LAB' && (
        <div className="space-y-4">
          <div className="frost-card rounded-2xl p-4 border-2 border-cyan-400 shadow-glow-cyan flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> ห้องทดลองแอนิเมชันและการต่อสู้ (Combat & Game Feel Lab)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                ทดสอบท่าโจมตีฮีโร่, การสวมใส่อาวุธ, ปฏิกิริยาบอสโดนตี, ท่าไม้ตายคริติคอล และฉากปราบมหาบอส
              </p>
            </div>

            <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300">
              🔊 เสียงล่าสุด: <span className="text-amber-400 font-bold">{lastSoundEvent}</span>
            </div>
          </div>

          {/* Live Arena Preview */}
          <CombatArenaView
            profile={{ ...previewProfile, equippedWeaponId: labWeaponId }}
            targetName={labBossId === 'BOSS-1' ? 'มังกรไซเบอร์ฟรอสต์' : labBossId === 'BOSS-2' ? 'โกเลมปรมาจารย์' : labBossId === 'BOSS-3' ? 'มหาจอมเวทศูนย์' : 'หุ่นฝึกซ้อม'}
            targetMaxHp={1000}
            targetCurrentHp={labBossState === 'DEFEATED' ? 0 : 750}
            bossId={labBossId}
            heroEmote={labHeroEmote}
            bossState={labBossState}
            damagePopups={labDamagePopups}
            onSoundHook={(ev) => setLastSoundEvent(ev)}
            onSkipDefeat={() => setLabBossState('IDLE')}
            isExamMode={false}
          />

          {/* Interactive Control Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. Hero Class & Emote Controls */}
            <div className="frost-card rounded-2xl p-3.5 border border-slate-700 space-y-2">
              <span className="font-bold text-xs text-cyan-300 block">1. ท่าทางฮีโร่ (Hero Emote):</span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                {(['IDLE', 'ATTACK', 'CRITICAL_ATTACK', 'HIT_SETBACK', 'VICTORY', 'LEVEL_UP', 'TOP_FORM'] as const).map((em) => (
                  <button
                    key={em}
                    onClick={() => {
                      setLabHeroEmote(em);
                      if (em === 'ATTACK') setLabBossState('HIT_LIGHT');
                      else if (em === 'CRITICAL_ATTACK') {
                        setLabBossState('HIT_CRITICAL');
                        setLabDamagePopups([{ id: String(Date.now()), damage: 350, isCritical: true, x: 0, y: 0 }]);
                      }
                    }}
                    className={`py-1.5 px-2 rounded-xl border transition-all ${
                      labHeroEmote === em ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Boss & Target Reactions */}
            <div className="frost-card rounded-2xl p-3.5 border border-slate-700 space-y-2">
              <span className="font-bold text-xs text-rose-300 block">2. ปฏิกิริยาบอส (Boss Reaction):</span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                {(['IDLE', 'HIT_LIGHT', 'HIT_CRITICAL', 'RAGE', 'PHASE_TRANSITION', 'DEFEATED'] as const).map((bs) => (
                  <button
                    key={bs}
                    onClick={() => setLabBossState(bs)}
                    className={`py-1.5 px-2 rounded-xl border transition-all ${
                      labBossState === bs ? 'bg-rose-500 text-slate-950 font-black shadow-md' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {bs}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Boss Model Selection */}
            <div className="frost-card rounded-2xl p-3.5 border border-slate-700 space-y-2">
              <span className="font-bold text-xs text-purple-300 block">3. เลือกรุ่นบอส (Boss Model):</span>
              <div className="space-y-1.5 text-xs font-bold">
                {[
                  { id: 'BOSS-1', label: '🐉 Cyber-Frost Dragon' },
                  { id: 'BOSS-2', label: '🤖 Grandmaster Golem' },
                  { id: 'BOSS-3', label: '🧙‍♂️ Archmage of Zero' },
                  { id: 'DOJO_TARGET', label: '🎯 Frost Training Dummy' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setLabBossId(b.id)}
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-left transition-all ${
                      labBossId === b.id ? 'bg-purple-600 text-white font-black shadow-md' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Weapon Progression & Equip Test */}
            <div className="frost-card rounded-2xl p-3.5 border border-slate-700 space-y-2">
              <span className="font-bold text-xs text-amber-300 block">4. ทดสอบติดตั้งอาวุธ (Weapon Tier):</span>
              <div className="space-y-1.5 text-xs font-bold">
                {Object.values(WEAPON_PROGRESSION_DATABASE).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setLabWeaponId(w.id)}
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      labWeaponId === w.id ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{w.icon} Tier {w.tier}: {w.thaiName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Audio Lab */}
      {reviewTab === 'AUDIO_LAB' && (
        <div className="space-y-4">
          <div className="frost-card rounded-2xl p-4 border-2 border-cyan-400 shadow-glow-cyan flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> ห้องทดลองระบบเสียงและการปรับแต่ง (Audio & Zone Profiles Lab)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                ทดสอบเพลงประจำโซนทั้ง 8 โซน, ปรับระดับเสียง Master/Music/SFX/UI, ทดสอบ Event SFX
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const updated = audioEngine.saveSettings({ isMuted: !audioSettings.isMuted });
                  setAudioSettings(updated);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  audioSettings.isMuted ? 'bg-rose-600 text-white border-rose-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {audioSettings.isMuted ? '🔇 ปิดเสียงทั้งหมด (Muted)' : '🔊 เปิดเสียง (Unmuted)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Zone Music Profiles */}
            <div className="frost-card rounded-2xl p-4 border border-slate-700 space-y-3">
              <span className="font-bold text-xs text-cyan-300 block">1. โปรไฟล์เสียงดนตรีประจำโซน (8 Zone Profiles):</span>
              <div className="space-y-2">
                {Object.values(ZONE_MUSIC_DATABASE).map((z) => {
                  const isActive = activeZoneMusic === z.id;
                  return (
                    <div 
                      key={z.id}
                      onClick={() => {
                        setActiveZoneMusic(z.id);
                        audioEngine.setZoneMusic(z.id);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400 shadow-glow-cyan'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white">{z.thaiName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono font-bold">
                          {z.tempoBpm} BPM
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{z.moodDescription}</p>
                      <p className="text-[10px] text-cyan-300 mt-0.5">เครื่องดนตรี: {z.instrumentation}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Volume Controls & SFX Triggers */}
            <div className="space-y-4">
              {/* Volume Sliders */}
              <div className="frost-card rounded-2xl p-4 border border-slate-700 space-y-3">
                <span className="font-bold text-xs text-amber-300 block">2. ตัวควบคุมระดับเสียง (Volume Sliders):</span>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Master Volume:</span>
                      <span className="font-mono font-bold text-amber-400">{Math.round(audioSettings.masterVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={audioSettings.masterVolume}
                      onChange={(e) => {
                        const updated = audioEngine.saveSettings({ masterVolume: parseFloat(e.target.value) });
                        setAudioSettings(updated);
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Music Volume:</span>
                      <span className="font-mono font-bold text-cyan-400">{Math.round(audioSettings.musicVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={audioSettings.musicVolume}
                      onChange={(e) => {
                        const updated = audioEngine.saveSettings({ musicVolume: parseFloat(e.target.value) });
                        setAudioSettings(updated);
                      }}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>SFX Volume:</span>
                      <span className="font-mono font-bold text-emerald-400">{Math.round(audioSettings.sfxVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={audioSettings.sfxVolume}
                      onChange={(e) => {
                        const updated = audioEngine.saveSettings({ sfxVolume: parseFloat(e.target.value) });
                        setAudioSettings(updated);
                      }}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SFX Event Triggers */}
              <div className="frost-card rounded-2xl p-4 border border-slate-700 space-y-3">
                <span className="font-bold text-xs text-emerald-300 block">3. ทดสอบเสียงเอฟเฟกต์ (SFX Event Hooks):</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { ev: 'SFX_CORRECT', label: '✅ ตอบถูก (Correct)' },
                    { ev: 'SFX_WRONG', label: '❌ ตอบผิด (Wrong)' },
                    { ev: 'SFX_CRITICAL', label: '💥 คริติคอล (Critical)' },
                    { ev: 'SFX_ATTACK', label: '⚔️ โจมตี (Attack)' },
                    { ev: 'SFX_BOSS_HIT', label: '🛡️ บอสโดนตี (Boss Hit)' },
                    { ev: 'SFX_BOSS_DEFEAT', label: '👑 ปราบมหาบอส (Boss Defeat)' },
                    { ev: 'SFX_TOP_FORM', label: '🌟 Top Form จุติ' },
                    { ev: 'SFX_UI_CLICK', label: '🔘 คลิกปุ่ม (UI Click)' },
                  ].map((s) => (
                    <button
                      key={s.ev}
                      onClick={() => audioEngine.playSfx(s.ev as AudioSfxEvent)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-left transition-all truncate"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Timer Lab */}
      {reviewTab === 'TIMER_LAB' && (
        <div className="space-y-4">
          <div className="frost-card rounded-2xl p-4 border-2 border-cyan-400 shadow-glow-cyan flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> ห้องทดลองตัวจับเวลาแปรผัน (Adaptive Timer Engine Lab)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                ทดสอบสูตรคำนวณเวลา, ตัวคูณความยาก, โหมดรูปภาพ, การป้องกันโกง และสถานะ Normal / Warning / Critical / Overtime
              </p>
            </div>

            <div className="flex items-center gap-2">
              <AdaptiveTimerDisplay
                secondsLeft={testSecondsLeft}
                totalTargetSec={calculateEffectiveTimeSec({
                  baseTargetTimeSec: timerBaseSec,
                  difficulty: timerDiff,
                  questionType: timerQType,
                  stageId: timerStageId,
                  requiresDiagram: timerHasDiagram,
                  isMultiStep: timerIsMultiStep,
                })}
                isPaused={testIsPaused}
                isOvertime={testSecondsLeft <= 0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interactive Calculator Inputs */}
            <div className="frost-card rounded-2xl p-4 border border-slate-700 space-y-3">
              <span className="font-bold text-xs text-cyan-300 block">1. ปรับค่าตัวแปรคำนวณเวลา (Timer Inputs):</span>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Base Target Time (Canonical Q):</span>
                    <span className="font-mono font-bold text-cyan-300">{timerBaseSec} วินาที</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={timerBaseSec}
                    onChange={(e) => setTimerBaseSec(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>ระดับความยาก (Difficulty 1-5):</span>
                    <span className="font-mono font-bold text-amber-400">Level {timerDiff} ({DIFFICULTY_MODIFIERS[timerDiff]}x)</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <button
                        key={d}
                        onClick={() => setTimerDiff(d)}
                        className={`flex-1 py-1.5 rounded-lg border font-bold ${
                          timerDiff === d ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold">ประเภทคำถาม (Question Type Modifiers):</label>
                  <select
                    value={timerQType}
                    onChange={(e) => setTimerQType(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold"
                  >
                    {Object.keys(QUESTION_TYPE_MODIFIERS).map((k) => (
                      <option key={k} value={k}>
                        {k} ({QUESTION_TYPE_MODIFIERS[k]}x)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold">ด่านเป้าหมาย (Stage Bounds Clamping):</label>
                  <select
                    value={timerStageId}
                    onChange={(e) => setTimerStageId(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold"
                  >
                    {Object.keys(STAGE_TIMER_BOUNDS).map((s) => (
                      <option key={s} value={s}>
                        {s} (Min: {STAGE_TIMER_BOUNDS[s].minSec}s, Max: {STAGE_TIMER_BOUNDS[s].maxSec}s)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timerHasDiagram}
                      onChange={(e) => setTimerHasDiagram(e.target.checked)}
                      className="accent-cyan-400"
                    />
                    <span>มีรูปเรขาคณิต (Requires Diagram +20%)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timerIsMultiStep}
                      onChange={(e) => setTimerIsMultiStep(e.target.checked)}
                      className="accent-cyan-400"
                    />
                    <span>โจทย์หลายขั้นตอน (Multi-step +15%)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Calculated Output Breakdown & Live Test Controls */}
            <div className="space-y-4">
              <div className="frost-card rounded-2xl p-4 border border-slate-700 space-y-3">
                <span className="font-bold text-xs text-emerald-300 block">2. ผลลัพธ์เวลาแปรผันสุทธิ (Effective Timer Output):</span>
                
                {(() => {
                  const eff = calculateEffectiveTimeSec({
                    baseTargetTimeSec: timerBaseSec,
                    difficulty: timerDiff,
                    questionType: timerQType,
                    stageId: timerStageId,
                    requiresDiagram: timerHasDiagram,
                    isMultiStep: timerIsMultiStep,
                  });
                  const bounds = STAGE_TIMER_BOUNDS[timerStageId] || { minSec: 15, maxSec: 120 };

                  return (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span>เวลาคำนวณสุทธิ (Effective Time):</span>
                        <span className="text-xl font-black font-mono text-emerald-400">{eff} วินาที</span>
                      </div>
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div>สูตร: Base ({timerBaseSec}s) × Diff ({DIFFICULTY_MODIFIERS[timerDiff]}x) × Type ({QUESTION_TYPE_MODIFIERS[timerQType]}x) {timerHasDiagram ? '× Diagram (1.2x)' : ''} {timerIsMultiStep ? '× MultiStep (1.15x)' : ''}</div>
                        <div>ขอบเขตด่าน: Min {bounds.minSec}s - Max {bounds.maxSec}s</div>
                      </div>
                    </div>
                  );
                })()}

                {/* State Test Buttons */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-300 block mb-1.5">ทดสอบสถานะ UI ตัวจับเวลา:</span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                    <button
                      onClick={() => setTestSecondsLeft(30)}
                      className="p-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                    >
                      Normal (30s)
                    </button>
                    <button
                      onClick={() => setTestSecondsLeft(10)}
                      className="p-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/40"
                    >
                      Warning (10s)
                    </button>
                    <button
                      onClick={() => setTestSecondsLeft(4)}
                      className="p-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-500/40"
                    >
                      Critical (4s)
                    </button>
                    <button
                      onClick={() => setTestSecondsLeft(0)}
                      className="p-1.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/40"
                    >
                      Overtime (0s)
                    </button>
                    <button
                      onClick={() => setTestIsPaused(!testIsPaused)}
                      className="p-1.5 rounded-lg bg-blue-950 text-blue-300 border border-blue-500/40 col-span-2"
                    >
                      {testIsPaused ? '▶️ ยกเลิกหยุดเวลา' : '⏸️ ทดสอบหยุดเวลา (Pause)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
