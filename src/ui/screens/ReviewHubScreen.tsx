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
  const [reviewTab, setReviewTab] = useState<'NAV' | 'HEROES' | 'GEAR'>('NAV');

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

        <div className="flex items-center gap-2">
          {(['NAV', 'HEROES', 'GEAR'] as const).map((tab) => (
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
    </div>
  );
};
