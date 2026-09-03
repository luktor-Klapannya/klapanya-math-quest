import React, { useState } from 'react';
import { HeroClassId } from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  Shield, 
  Target, 
  Check, 
  Swords, 
  Feather, 
  BookOpen,
  Compass
} from 'lucide-react';
import { HERO_ASSET_REGISTRY, CanonicalHeroClass } from '../assets/heroAssetRegistry';
import { EQUIPMENT_ASSET_REGISTRY } from '../assets/equipmentAssetRegistry';

export interface ArcticHeroSelectScreenProps {
  currentHeroId?: HeroClassId;
  playerName?: string;
  onConfirmHero: (heroId: HeroClassId, heroName: string) => void;
  onBackToTerritory: () => void;
}

interface HeroClassMetadata {
  id: HeroClassId;
  canonicalKey: CanonicalHeroClass;
  nameEn: string;
  nameTh: string;
  role: string;
  element: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  activeSkill: string;
  activeSkillDesc: string;
  passiveSkill: string;
  passiveSkillDesc: string;
  lore: string;
  startingEquipment: {
    weapon: string;
    armor: string;
    accessory: string;
  };
}

const HERO_METADATA: Record<HeroClassId, HeroClassMetadata> = {
  CHRONOMANCER: {
    id: 'CHRONOMANCER',
    canonicalKey: 'SPEED_CHRONOMANCER',
    nameEn: 'Speed Chronomancer',
    nameTh: 'จอมเวทกาลเวลา',
    role: 'Mage • Time & Precision',
    element: 'Frost / Time',
    difficulty: 'Easy',
    activeSkill: 'Time Freeze (หยุดเวลาคำนวณ)',
    activeSkillDesc: 'หยุดเวลา 5 วินาทีเพื่อช่วยวิเคราะห์โจทย์และทบทวนสูตรคำนวณ',
    passiveSkill: 'Rapid Calculation (สมาธิเร่งสปีด)',
    passiveSkillDesc: 'เพิ่มความแม่นยำและแต้มโบนัสความเร็ว 15% เมื่อตอบถูกต่อเนื่อง',
    lore: 'ปรมาจารย์แห่งมิติเวลาและธารน้ำแข็งอาร์กติก ควบคุมกระแสกาลเวลาเพื่อชะลอความเร็วของศัตรูและสร้างเกราะป้องกันแห่งกาลเวลา',
    startingEquipment: {
      weapon: 'Novice Chrono Wand',
      armor: 'Apprentice Mage Robe',
      accessory: 'Math Grimoire Scroll',
    },
  },
  PALADIN: {
    id: 'PALADIN',
    canonicalKey: 'LOGIC_PALADIN',
    nameEn: 'Logic Paladin',
    nameTh: 'อัศวินตรรกะ',
    role: 'Tank • Logic & Shield',
    element: 'Holy / Ice',
    difficulty: 'Easy',
    activeSkill: 'Shield of Truth (โล่ตรรกะสกัดกับดัก)',
    activeSkillDesc: 'สร้างโล่ป้องกันความผิดพลาด 1 ครั้งและตัดตัวเลือกลวงออกทันที',
    passiveSkill: 'Unyielding Resolve (จิตตรรกะมั่นคง)',
    passiveSkillDesc: 'ลดดาเมจจากการตอบผิดลง 50% และฟื้นฟู Resolve อัตโนมัติ',
    lore: 'ผู้พิทักษ์แห่งเหตุผลและโล่ตรรกะคริสตัล ยืนหยัดปกป้องเพื่อนร่วมทีมในแนวหน้าด้วยความแม่นยำและความถูกต้อง',
    startingEquipment: {
      weapon: 'Logic Guardian Blade',
      armor: 'Crystal Plate Armor',
      accessory: 'Wisdom Aegis Shield',
    },
  },
  SNIPER: {
    id: 'SNIPER',
    canonicalKey: 'EAGLE_EYE_SNIPER',
    nameEn: 'Eagle-Eye Sniper',
    nameTh: 'พลธนูเนตรเหยี่ยว',
    role: 'Ranged • Agility & Geometry',
    element: 'Frost / Wind',
    difficulty: 'Medium',
    activeSkill: 'Geometry True Shot (ศรเรขาคณิตเจาะจุดตาย)',
    activeSkillDesc: 'ยิงศรเจาะทะลุโจทย์เรขาคณิตและเศษส่วน สร้างคริติคอลดาเมจ 200%',
    passiveSkill: 'Hawk Vision (สายตาเนตรเหยี่ยว)',
    passiveSkillDesc: 'เรืองแสงไฮไลต์คำสำคัญ (Keywords) ในโจทย์ข้อสอบโดยอัตโนมัติ',
    lore: 'พลแม่นปืนผู้มองทะลุทุกมิติเรขาคณิต สไนป์เป้าหมายจากระยะไกลด้วยความแม่นยำระดับพิกเซล',
    startingEquipment: {
      weapon: 'Geometry Eagle Bow',
      armor: 'Windrunner Leather Cloak',
      accessory: 'Falcon Aim Quiver',
    },
  },
  ROGUE: {
    id: 'ROGUE',
    canonicalKey: 'REVERSE_ROGUE',
    nameEn: 'Reverse Rogue',
    nameTh: 'โร้กย้อนรอย',
    role: 'Melee • Stealth & Reverse Logic',
    element: 'Shadow / Frost',
    difficulty: 'Hard',
    activeSkill: 'Reverse Step (คิดย้อนกลับเฉียบพลัน)',
    activeSkillDesc: 'แก้สมการด้วยเทคนิคย้อนรอย (Working Backwards) ข้ามขั้นตอนที่ซับซ้อน',
    passiveSkill: 'Critical Insight (ลอบโจมตีจุดอ่อน)',
    passiveSkillDesc: 'มีโอกาส 35% ในการสร้างโบนัสคะแนนคูณสองในโจทย์ระดับยาก',
    lore: 'ผู้เชี่ยวชาญการคิดย้อนกลับและการเคลื่อนไหวในเงามืด ปรากฏตัวเพื่อแก้โจทย์ซับซ้อนในพริบตาเดียว',
    startingEquipment: {
      weapon: 'Reverse Twin Daggers',
      armor: 'Shadow Stalker Tunic',
      accessory: 'Smoke Reversal Ring',
    },
  },
};

export const ArcticHeroSelectScreen: React.FC<ArcticHeroSelectScreenProps> = ({
  currentHeroId = 'CHRONOMANCER',
  playerName = 'ผู้กล้าคณิตศาสตร์',
  onConfirmHero,
  onBackToTerritory,
}) => {
  const [selectedHeroId, setSelectedHeroId] = useState<HeroClassId>(currentHeroId);
  const [heroGender, setHeroGender] = useState<'male' | 'female'>('male');
  const [nameInput, setNameInput] = useState<string>(playerName);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const heroList: HeroClassId[] = ['CHRONOMANCER', 'PALADIN', 'SNIPER', 'ROGUE'];
  const activeMetadata = HERO_METADATA[selectedHeroId];

  // Resolve visual profile
  const registryKey = `${activeMetadata.canonicalKey}_${heroGender.toUpperCase()}`;
  const visualProfile = HERO_ASSET_REGISTRY[registryKey] || HERO_ASSET_REGISTRY.SPEED_CHRONOMANCER_MALE;

  const handleConfirm = () => {
    onConfirmHero(selectedHeroId, nameInput.trim() || 'ผู้กล้าคณิตศาสตร์');
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-x-hidden font-sans select-none flex flex-col justify-between">
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. LAYER 1: APPROVED BLANK BACKGROUND TEMPLATE                   */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <picture className="absolute inset-0 pointer-events-none z-0">
        <source media="(min-width: 1024px)" srcSet="/backgrounds/arctic/hero-select/arctic_hero_select_blank_desktop.jpg" />
        <img
          src="/backgrounds/arctic/hero-select/arctic_hero_select_mobile.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center pointer-events-none select-none opacity-90"
        />
      </picture>

      {/* 2. LAYER 2: ATMOSPHERIC AURORA OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/40 via-transparent to-[#030712]/60 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 right-1/4 h-64 bg-gradient-to-r from-teal-500/15 via-cyan-400/20 to-blue-600/15 blur-3xl pointer-events-none z-0 animate-pulse" />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 3. LAYER 3: INTERACTIVE DESKTOP VIEW (>= 1024px)                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex relative z-10 flex-col justify-between min-h-screen p-6 max-w-7xl mx-auto w-full">
        
        {/* Top Header & Breadcrumb */}
        <header className="flex items-center justify-between">
          <button
            onClick={onBackToTerritory}
            className="px-4 py-2 rounded-full bg-slate-950/80 hover:bg-cyan-950/90 text-slate-200 hover:text-white border border-sky-300/40 hover:border-cyan-400 flex items-center gap-2 text-xs font-bold transition-all shadow-md min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>กลับสู่แผนที่ดินแดน (Territory)</span>
          </button>

          {/* Center Title in Crystal Frame Zone */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-serif font-black text-sky-950 tracking-wide drop-shadow-sm">
              Select Your Hero
            </h1>
            <p className="text-xs font-bold text-sky-800 tracking-wider">
              ✦ Arctic World • Mathematics ✦
            </p>
          </div>

          {/* Right Player Identity */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/80 border border-sky-300/40 text-xs font-bold text-slate-200">
            <span>ผู้กล้า:</span>
            {isEditingName ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                autoFocus
                className="bg-slate-900 border border-cyan-400 rounded px-2 py-0.5 text-cyan-300 text-xs w-28 focus:outline-none"
              />
            ) : (
              <span 
                onClick={() => setIsEditingName(true)}
                className="text-cyan-300 underline cursor-pointer hover:text-cyan-200"
                title="คลิกเพื่อแก้ไขชื่อ"
              >
                {nameInput} ✎
              </span>
            )}
          </div>
        </header>

        {/* Center Arena Body (Left 4 Heroes Pedestals, Right Hero Large Preview) */}
        <div className="grid grid-cols-12 gap-6 my-auto items-center">
          
          {/* Left Pedestals (4 Hero Selection Cards) - 7 Columns */}
          <div className="col-span-7 grid grid-cols-4 gap-3 pt-6">
            {heroList.map((hId) => {
              const meta = HERO_METADATA[hId];
              const isSelected = selectedHeroId === hId;
              const cardKey = `${meta.canonicalKey}_${heroGender.toUpperCase()}`;
              const cardVisual = HERO_ASSET_REGISTRY[cardKey] || HERO_ASSET_REGISTRY.SPEED_CHRONOMANCER_MALE;

              return (
                <div
                  key={hId}
                  onClick={() => setSelectedHeroId(hId)}
                  className={`cursor-pointer rounded-2xl p-3 flex flex-col justify-between items-center text-center transition-all duration-300 relative group min-h-[300px] ${
                    isSelected
                      ? 'bg-white/85 backdrop-blur-md border-2 border-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.4)] scale-105'
                      : 'bg-white/50 backdrop-blur-sm border border-sky-200/60 hover:bg-white/70 hover:border-cyan-300 hover:scale-[1.02]'
                  }`}
                >
                  {/* Selected Crest Badge */}
                  {isSelected && (
                    <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] shadow-md flex items-center gap-1">
                      <Check className="w-3 h-3" /> SELECTED
                    </div>
                  )}

                  {/* Hero Character Sprite */}
                  <div className="w-28 h-36 flex items-center justify-center my-auto overflow-hidden">
                    <img
                      src={cardVisual.assets.fullBody}
                      alt={meta.nameEn}
                      className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Hero Name & Class Info */}
                  <div className="w-full pt-2 border-t border-sky-200/80">
                    <h3 className="text-xs font-black text-slate-900 truncate">
                      {meta.nameEn.replace('Speed ', '').replace('Eagle-Eye ', '').replace('Reverse ', '')}
                    </h3>
                    <p className="text-[10px] font-bold text-sky-800 truncate">
                      {meta.nameTh}
                    </p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 mt-1 inline-block">
                      Lv. 20
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Hero Preview Stage (5 Columns) */}
          <div className="col-span-5 flex flex-col items-center justify-center relative min-h-[360px]">
            {/* Gender Toggle Pills */}
            <div className="absolute top-0 right-4 flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-full border border-sky-200 shadow-sm z-20">
              <button
                onClick={() => setHeroGender('male')}
                className={`px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                  heroGender === 'male' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👦 ชาย (Boy)
              </button>
              <button
                onClick={() => setHeroGender('female')}
                className={`px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                  heroGender === 'female' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👧 หญิง (Girl)
              </button>
            </div>

            {/* Large Hero Character Artwork Stage */}
            <div className="w-64 h-72 flex items-center justify-center relative z-10">
              <img
                src={visualProfile.assets.fullBody}
                alt={activeMetadata.nameEn}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,180,255,0.3)] animate-float"
              />
            </div>

            {/* Stage Hero Title Badge */}
            <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-sky-200 shadow-md text-center -mt-4 relative z-20">
              <h2 className="text-sm font-black text-slate-900">
                {activeMetadata.nameEn} ({activeMetadata.nameTh})
              </h2>
              <span className="text-[10px] font-bold text-sky-800">
                {activeMetadata.role} • ความยาก: {activeMetadata.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Three Control Panels */}
        <footer className="grid grid-cols-12 gap-4 items-stretch">
          
          {/* Bottom Left: Hero Details & Lore (6 Columns) */}
          <div className="col-span-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-sky-200 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-sky-800" />
                <h4 className="text-xs font-black text-slate-900 uppercase">
                  Hero Details (ข้อมูลผู้กล้า)
                </h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeMetadata.lore}
              </p>
            </div>
            <div className="text-[10px] font-bold text-sky-900 pt-2 border-t border-sky-100 flex items-center justify-between">
              <span>ธาตุหลัก: {activeMetadata.element}</span>
              <span>อุปกรณ์เริ่มต้น: {activeMetadata.startingEquipment.weapon}</span>
            </div>
          </div>

          {/* Bottom Center: Preview Skills (3 Columns) */}
          <div className="col-span-3 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-sky-200 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-black text-slate-900 uppercase">
                  Skill Preview
                </h4>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-[11px] font-bold text-amber-900 truncate">
                  ⚡ {activeMetadata.activeSkill}
                </div>
                <div className="text-[11px] font-bold text-cyan-900 truncate">
                  🛡️ {activeMetadata.passiveSkill}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold">
              * สกิลจะทำงานอัตโนมัติในการต่อสู้
            </span>
          </div>

          {/* Bottom Right: Primary Action (3 Columns) */}
          <div className="col-span-3 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-sky-200 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-sky-900 uppercase block">
                Start Adventure
              </span>
              <h4 className="text-xs font-bold text-slate-700">
                พร้อมออกเดินทางสู่คณิตศาสตร์อาร์กติก
              </h4>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all transform hover:scale-[1.02] shadow-[0_4px_16px_rgba(56,189,248,0.4)] flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Begin Journey (เริ่มต้นการผจญภัย)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 4. LAYER 4: INTERACTIVE MOBILE VIEW (< 1024px)                     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden relative z-10 flex flex-col justify-between min-h-screen p-4 max-w-md mx-auto w-full space-y-4">
        
        {/* Mobile Header */}
        <header className="flex items-center justify-between">
          <button
            onClick={onBackToTerritory}
            className="p-2.5 rounded-full bg-slate-950/80 border border-sky-300/40 text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center shadow-md"
            title="กลับ"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
          </button>

          <div className="text-center">
            <h1 className="text-base font-serif font-black text-sky-950">
              SELECT HERO
            </h1>
            <span className="text-[10px] font-bold text-sky-800">
              ✦ ARCTIC WORLD ✦
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-sky-300 text-[10px] font-black text-sky-950 shadow-sm">
            <span>💎 1,250</span>
          </div>
        </header>

        {/* Selected Featured Hero Card (Large Preview) */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 border-2 border-cyan-400 shadow-[0_8px_24px_rgba(56,189,248,0.25)] relative">
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] shadow-sm">
            ★ RECOMMENDED
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="w-24 h-28 flex items-center justify-center shrink-0">
              <img
                src={visualProfile.assets.fullBody}
                alt={activeMetadata.nameEn}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-black text-slate-900">
                {activeMetadata.nameEn}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 inline-block">
                {activeMetadata.role}
              </span>
              <p className="text-[11px] text-slate-700 leading-snug line-clamp-2">
                {activeMetadata.lore}
              </p>
            </div>
          </div>

          {/* Mobile Skills Preview Badges */}
          <div className="mt-3 pt-3 border-t border-sky-100 flex items-center justify-between text-[10px] font-bold text-slate-800">
            <div className="flex items-center gap-1 text-amber-800">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="truncate max-w-[120px]">{activeMetadata.activeSkill}</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-800">
              <Shield className="w-3.5 h-3.5 text-cyan-600" />
              <span className="truncate max-w-[120px]">{activeMetadata.passiveSkill}</span>
            </div>
          </div>
        </div>

        {/* 3 Collapsed/Other Selectable Hero Class Cards */}
        <div className="space-y-2">
          {heroList.filter((id) => id !== selectedHeroId).map((hId) => {
            const meta = HERO_METADATA[hId];
            const itemKey = `${meta.canonicalKey}_${heroGender.toUpperCase()}`;
            const itemVisual = HERO_ASSET_REGISTRY[itemKey] || HERO_ASSET_REGISTRY.SPEED_CHRONOMANCER_MALE;

            return (
              <div
                key={hId}
                onClick={() => setSelectedHeroId(hId)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-sky-200 flex items-center justify-between hover:bg-white transition-all cursor-pointer min-h-[56px] shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center overflow-hidden shrink-0 border border-sky-200">
                    <img src={itemVisual.assets.portrait} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">{meta.nameEn}</h3>
                    <span className="text-[10px] font-bold text-slate-600">{meta.role}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-700" />
              </div>
            );
          })}
        </div>

        {/* Mobile Primary Action Button */}
        <footer className="space-y-2 pt-2">
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>START ADVENTURE (เข้าสู่ดินแดนคณิตศาสตร์)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[10px] text-center text-slate-400">
            ❄ TIP: You can change or upgrade your hero anytime.
          </p>
        </footer>
      </div>
    </div>
  );
};
