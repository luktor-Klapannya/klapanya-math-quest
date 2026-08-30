import React, { useState } from 'react';
import { PlayerProfile, HeroClassId } from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { GEAR_DATABASE, GearItem } from '../../progression/gear-matrix';
import { TERRITORY_DATABASE } from '../../progression/territory-matrix';
import { canForgeLegendaryAdmissionWeapon } from '../../engine/boss-evaluator';
import { HeroAvatarView } from '../components/HeroAvatarView';
import { 
  ArrowLeft, 
  Sparkles, 
  Shield, 
  Sword, 
  Crown, 
  Hammer, 
  Lock, 
  CheckCircle2, 
  Flame,
  Zap,
  Info
} from 'lucide-react';

interface InventoryScreenProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onExit: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  profile,
  onUpdateProfile,
  onExit,
}) => {
  const [selectedGearId, setSelectedGearId] = useState<string>('BLADE_OF_CALCULATION');
  const [activeTab, setActiveTab] = useState<'ALL' | 'WEAPON' | 'ARMOR' | 'RELIC' | 'FORGE'>('ALL');
  const [isForgingAnimation, setIsForgingAnimation] = useState<boolean>(false);

  const hero = HERO_CLASSES[profile.heroId];
  const territory = TERRITORY_DATABASE[profile.currentTerritoryId] || TERRITORY_DATABASE.FROZEN_ARCTIC;
  const canForge = canForgeLegendaryAdmissionWeapon(profile.unlockedGear);

  const allGearList = Object.values(GEAR_DATABASE);
  const filteredGear = allGearList.filter((g) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'WEAPON') return g.type === 'WEAPON';
    if (activeTab === 'ARMOR') return g.type === 'ARMOR';
    if (activeTab === 'RELIC') return g.type === 'RELIC' || g.type === 'ACCESSORY';
    return true;
  });

  const selectedItem = GEAR_DATABASE[selectedGearId] || allGearList[0];
  const isOwned = profile.unlockedGear.includes(selectedItem.id);

  const handleForgeWeapon = () => {
    if (!canForge) return;
    setIsForgingAnimation(true);
    setTimeout(() => {
      const unlocked = new Set(profile.unlockedGear);
      unlocked.add('LEGENDARY_ADMISSION_WEAPON');
      onUpdateProfile({
        ...profile,
        isFrostCoreForgeUnlocked: true,
        unlockedGear: Array.from(unlocked),
      });
      setIsForgingAnimation(false);
      setSelectedGearId('LEGENDARY_ADMISSION_WEAPON');
    }, 2000);
  };

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col text-slate-100 max-w-6xl mx-auto select-none">
      {/* Header */}
      <header className="frost-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 mb-6 shadow-xl border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              ARMORY & ARCTIC FORGE
            </span>
            <h2 className="text-lg md:text-xl font-black text-white">
              คลังยุทธภัณฑ์ & เตาหลอมผลึกเยือกแข็ง
            </h2>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(['ALL', 'WEAPON', 'ARMOR', 'RELIC', 'FORGE'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab
                  ? 'bg-cyan-600 text-white shadow-glow-cyan'
                  : 'bg-arctic-800/80 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {tab === 'ALL' && 'ทั้งหมด'}
              {tab === 'WEAPON' && '🗡️ อาวุธ'}
              {tab === 'ARMOR' && '🛡️ ชุดเกราะ'}
              {tab === 'RELIC' && '💎 วัตถุโบราณ'}
              {tab === 'FORGE' && '🔨 เตาหลอมผลึก'}
            </button>
          ))}
        </div>
      </header>

      {/* Main Armory Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Gear Grid or Frost Forge View */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'FORGE' ? (
            /* The Frost Core Forge Pedestal */
            <div className="frost-card rounded-3xl p-6 md:p-8 border-2 border-amber-400/70 shadow-glow-gold text-center relative overflow-hidden">
              <div className="w-20 h-20 rounded-2xl bg-amber-950/80 border-2 border-amber-400 mx-auto mb-3 flex items-center justify-center text-4xl shadow-glow-gold animate-pulse">
                🔨
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">The Frost Core Forge</h3>
              <p className="text-xs text-amber-200/90 mt-1 max-w-md mx-auto">
                หลอมรวม 3 มหาผลึกแกนบอสเพื่อสร้างศาสตราวุธระดับตำนาน "Excalibur of Absolute Admission"
              </p>

              {/* 3 Core Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                {/* Core 1 */}
                <div className={`p-4 rounded-2xl border text-center transition-all ${
                  profile.unlockedGear.includes('SPATIAL_DRAGON_CORE')
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-glow-cyan'
                    : 'bg-slate-900/60 border-slate-800 opacity-50'
                }`}>
                  <div className="text-4xl mb-1">🐉</div>
                  <div className="text-xs font-bold text-cyan-300">Spatial Dragon Core</div>
                  <span className="text-[10px] text-slate-400">Boss 1: Chulabhorn</span>
                  <div className="mt-2 text-[10px] font-bold">
                    {profile.unlockedGear.includes('SPATIAL_DRAGON_CORE') ? '✅ มีในครอบครอง' : '🔒 ยังไม่ผ่านบอส'}
                  </div>
                </div>

                {/* Core 2 */}
                <div className={`p-4 rounded-2xl border text-center transition-all ${
                  profile.unlockedGear.includes('GRANDMASTER_BLADE_CORE')
                    ? 'bg-amber-950/80 border-amber-400 shadow-glow-gold'
                    : 'bg-slate-900/60 border-slate-800 opacity-50'
                }`}>
                  <div className="text-4xl mb-1">🗿</div>
                  <div className="text-xs font-bold text-amber-300">Grandmaster Blade Core</div>
                  <span className="text-[10px] text-slate-400">Boss 2: SWCH</span>
                  <div className="mt-2 text-[10px] font-bold">
                    {profile.unlockedGear.includes('GRANDMASTER_BLADE_CORE') ? '✅ มีในครอบครอง' : '🔒 ยังไม่ผ่านบอส'}
                  </div>
                </div>

                {/* Core 3 */}
                <div className={`p-4 rounded-2xl border text-center transition-all ${
                  profile.unlockedGear.includes('ARCANE_LOGIC_CRYSTAL')
                    ? 'bg-purple-950/80 border-purple-400 shadow-glow-purple'
                    : 'bg-slate-900/60 border-slate-800 opacity-50'
                }`}>
                  <div className="text-4xl mb-1">🧙‍♂️</div>
                  <div className="text-xs font-bold text-purple-300">Arcane Logic Crystal</div>
                  <span className="text-[10px] text-slate-400">Boss 3: Tri-Math</span>
                  <div className="mt-2 text-[10px] font-bold">
                    {profile.unlockedGear.includes('ARCANE_LOGIC_CRYSTAL') ? '✅ มีในครอบครอง' : '🔒 ยังไม่ผ่านบอส'}
                  </div>
                </div>
              </div>

              {/* Forge Action Button */}
              {profile.isFrostCoreForgeUnlocked || profile.unlockedGear.includes('LEGENDARY_ADMISSION_WEAPON') ? (
                <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-sm flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" /> หลอมศาสตราวุธระดับตำนานสำเร็จแล้ว (Equipped)
                </div>
              ) : (
                <button
                  disabled={!canForge || isForgingAnimation}
                  onClick={handleForgeWeapon}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                    canForge
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-glow-gold animate-bounce'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Hammer className="w-5 h-5" />
                  {isForgingAnimation ? 'กำลังหลอมรวมผลึกแกนบอส...' : canForge ? 'เริ่มพิธีหลอมศาสตรามหาปราชญ์' : 'ต้องการแกนพลังงานครบทั้ง 3 ชิ้น'}
                </button>
              )}
            </div>
          ) : (
            /* Regular Gear Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredGear.map((item) => {
                const owned = profile.unlockedGear.includes(item.id);
                const isSelected = selectedGearId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedGearId(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-400 shadow-glow-cyan'
                        : owned
                        ? 'bg-arctic-800/80 border-slate-700 hover:border-cyan-500/50'
                        : 'bg-slate-900/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl">{item.icon}</span>
                        {owned ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                            ครอบครอง
                          </span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                      <h4 className="text-xs font-black text-white line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.thaiName}</p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-cyan-300">
                      <span className="font-bold">{item.rarity}</span>
                      <span className="text-slate-400">{item.stageSource}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Item Inspector & Hero Avatar Preview */}
        <div className="space-y-4">
          {/* Hero Live Identity Preview */}
          <div className="frost-card rounded-2xl p-5 text-center border border-cyan-500/40 shadow-lg">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              ภาพรวมตัวละคร (Hero Identity)
            </h4>
            <div className="my-2">
              <HeroAvatarView profile={profile} size="lg" showPet={true} />
            </div>
            <div className="text-sm font-black text-white">{profile.heroName}</div>
            <div className="text-xs text-amber-300 font-bold">
              {profile.isTopFormUnlocked ? '👑 Grand Arctic Sovereign' : profile.rank} (Lv.{profile.level})
            </div>
            <div className="mt-2 text-[11px] text-cyan-300 bg-arctic-950/80 p-2 rounded-xl border border-slate-800">
              คลาส: {hero.thaiName} • แดน: {territory.thaiName}
            </div>
          </div>

          {/* Selected Item Details */}
          <div className="frost-card rounded-2xl p-5 border border-cyan-500/40 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl p-2 rounded-xl bg-arctic-950 border border-cyan-400">
                {selectedItem.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase">{selectedItem.rarity} {selectedItem.type}</span>
                <h3 className="text-sm font-black text-white">{selectedItem.name}</h3>
                <p className="text-[11px] text-slate-300">{selectedItem.thaiName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {selectedItem.description}
            </p>

            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-xs text-cyan-300 font-bold mb-3">
              ⚡ คุณสมบัติ: {selectedItem.statBonus}
            </div>

            <div className="text-[11px] text-slate-400">
              แหล่งที่มา: <span className="text-white font-semibold">{selectedItem.stageSource}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
