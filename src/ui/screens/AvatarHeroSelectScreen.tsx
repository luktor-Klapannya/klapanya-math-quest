import React, { useState } from 'react';
import { PlayerProfile, HeroClassId } from '../../types';
import { AvatarVisualId, AvatarGender } from '../../types/learning';
import { AVATAR_DATABASE } from '../../progression/avatar-database';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { HeroCharacterArt } from '../components/HeroCharacterArt';
import { Sparkles, User, Shield, Zap, Sword, ChevronRight, Check } from 'lucide-react';

interface AvatarHeroSelectScreenProps {
  currentProfile: PlayerProfile;
  onConfirmCharacter: (
    heroId: HeroClassId,
    avatarId: AvatarVisualId,
    gender: AvatarGender,
    heroName: string
  ) => Promise<void>;
  onBack?: () => void;
}

export const AvatarHeroSelectScreen: React.FC<AvatarHeroSelectScreenProps> = ({
  currentProfile,
  onConfirmCharacter,
  onBack,
}) => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<AvatarVisualId>(
    (currentProfile.avatarVisualId as AvatarVisualId) || 'BOY_WIZARD'
  );
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'BOY' | 'GIRL'>('ALL');
  const [heroName, setHeroName] = useState<string>(currentProfile.heroName || 'ผู้กล้าคณิตศาสตร์');
  const [nameError, setNameError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedAvatar = AVATAR_DATABASE[selectedAvatarId] || AVATAR_DATABASE.BOY_WIZARD;
  const canonicalHero = HERO_CLASSES[selectedAvatar.recommendedHeroClass];

  const allAvatars = Object.values(AVATAR_DATABASE);
  const filteredAvatars = allAvatars.filter((av) => {
    if (genderFilter === 'ALL') return true;
    return av.gender === genderFilter;
  });

  const handleSelect = (avId: AvatarVisualId) => {
    setSelectedAvatarId(avId);
  };

  const handleConfirm = async () => {
    const trimmed = heroName.trim();
    if (trimmed.length < 2) {
      setNameError('กรุณากรอกชื่อผู้กล้า/นักเรียนอย่างน้อย 2 ตัวอักษร');
      return;
    }
    setNameError('');
    setIsSubmitting(true);
    try {
      await onConfirmCharacter(
        selectedAvatar.recommendedHeroClass,
        selectedAvatar.id,
        selectedAvatar.gender,
        trimmed
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-between text-slate-100 max-w-6xl mx-auto font-sans">
      {/* Top Header */}
      <header className="frost-card rounded-3xl p-5 mb-4 flex flex-wrap items-center justify-between gap-4 border border-cyan-500/40 shadow-glow-cyan">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-3xl shadow-glow-cyan">
            🧙‍♂️
          </div>
          <div>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
              CHARACTER CREATION & HERO IDENTITY
            </span>
            <h1 className="text-lg md:text-2xl font-black text-white">
              เลือกตัวละครและผู้กล้าแห่งดินแดนตัวเลข
            </h1>
          </div>
        </div>

        {/* Gender Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-arctic-950/80 border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setGenderFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              genderFilter === 'ALL' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            ทั้งหมด (8)
          </button>
          <button
            onClick={() => setGenderFilter('BOY')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              genderFilter === 'BOY' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            👦 ชาย (Boy)
          </button>
          <button
            onClick={() => setGenderFilter('GIRL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              genderFilter === 'GIRL' ? 'bg-pink-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            👧 หญิง (Girl)
          </button>
        </div>
      </header>

      {/* Main Grid: Left Avatar Cards, Right Inspector & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 mb-4">
        
        {/* Left 2 Cols: Character Selection Cards */}
        <div className="lg:col-span-2 frost-card rounded-3xl p-4 md:p-6 border border-slate-700/80 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3">
              เลือกรูปลักษณ์ตัวละคร (Avatar Representation)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filteredAvatars.map((av) => {
                const isSelected = selectedAvatarId === av.id;
                const heroClassData = HERO_CLASSES[av.recommendedHeroClass];
                return (
                  <button
                    key={av.id}
                    onClick={() => handleSelect(av.id)}
                    className={`relative p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between group overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-cyan-950/90 to-slate-900 border-2 border-cyan-400 ring-2 ring-cyan-400/50 shadow-glow-cyan scale-[1.02]'
                        : 'bg-arctic-900/90 border-slate-800 hover:border-cyan-500/50 hover:bg-arctic-800/80'
                    }`}
                  >
                    {/* 3/4-Body RPG Character Art (Occupies ~65% of card) */}
                    <div className="relative w-full h-32 sm:h-36 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-900/60 to-arctic-950/90 border border-slate-800/80 group-hover:scale-105 transition-transform duration-200">
                      <HeroCharacterArt avatarId={av.id} role="HERO_CARD_ART" size="card" />
                      
                      {/* Gender Badge Overlay */}
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 text-cyan-300">
                        {av.gender === 'BOY' ? '👦 ชาย' : '👧 หญิง'}
                      </span>

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Card Title & Class Name */}
                    <div className="w-full pt-2">
                      <h4 className="text-xs font-black text-white truncate">{av.thaiName}</h4>
                      <span className="text-[10px] font-bold text-amber-300 block truncate mt-0.5">
                        ⚔️ {heroClassData.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Name Input */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-1.5">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="student-hero-name-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ชื่อผู้กล้า / นักเรียน (Student Name)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {heroName.length}/50
                  </span>
                </div>
                <input
                  id="student-hero-name-input"
                  type="text"
                  value={heroName}
                  onChange={(e) => {
                    setHeroName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  maxLength={50}
                  autoComplete="off"
                  placeholder="พิมพ์ชื่อของคุณ (เช่น น้องกล้าหาญ, Alex)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 caret-cyan-600 border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none font-bold text-sm select-text cursor-text pointer-events-auto shadow-sm"
                />
              </div>
            </div>

            {nameError && (
              <p className="text-xs text-rose-400 font-bold pl-8 animate-shake">
                ⚠️ {nameError}
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Hero Class Inspector & Stat Bars */}
        <div className="frost-card rounded-3xl p-5 border-2 border-cyan-400 shadow-glow-cyan flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                CLASS PROFILE & SKILL DNA
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40">
                {canonicalHero.thaiName}
              </span>
            </div>

            <div className="text-center my-2">
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl bg-gradient-to-b from-cyan-950/60 to-slate-950 border-2 border-cyan-400/80 flex items-center justify-center mx-auto shadow-glow-cyan overflow-hidden p-2">
                <HeroCharacterArt avatarId={selectedAvatar.id} role="FULL_BODY_ART" size="xl" animate />
              </div>
              <h3 className="text-base font-black text-white mt-2">{selectedAvatar.thaiName}</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{selectedAvatar.description}</p>
            </div>

            {/* Special Skill Box */}
            <div className="p-3 rounded-2xl bg-arctic-950/90 border border-slate-700 my-3 text-xs space-y-1.5">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> สกิลพิเศษ: {canonicalHero.activeName}
              </span>
              <p className="text-[11px] text-slate-300">{canonicalHero.activeDescription}</p>
              <div className="pt-1 text-[10px] text-cyan-300 font-semibold border-t border-slate-800">
                🛡️ ติดตัว (Passive): {canonicalHero.passiveName} ({canonicalHero.passiveDescription})
              </div>
            </div>

            {/* Stat Bars (0 - 100) */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-400">⚡ พลังคำนวณ (Calculation):</span>
                  <span className="text-cyan-300 font-bold">{selectedAvatar.statFlavor.calculationPower}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${selectedAvatar.statFlavor.calculationPower}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-400">🔮 พลังเวทมนตร์ (Magic Power):</span>
                  <span className="text-purple-300 font-bold">{selectedAvatar.statFlavor.magicPower}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-400" style={{ width: `${selectedAvatar.statFlavor.magicPower}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-400">🏹 ความเร็ว (Speed):</span>
                  <span className="text-amber-300 font-bold">{selectedAvatar.statFlavor.speed}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${selectedAvatar.statFlavor.speed}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-400">🛡️ การป้องกัน (Defense):</span>
                  <span className="text-emerald-300 font-bold">{selectedAvatar.statFlavor.defense}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${selectedAvatar.statFlavor.defense}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-glow-gold transform hover:scale-102 transition-all"
            >
              <span>ยืนยันตัวละคร & เริ่มการผจญภัย</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
