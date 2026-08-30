import React, { useState } from 'react';
import { PlayerProfile } from '../../types';
import { MAGIC_MARKET_ITEMS } from '../../progression/market-database';
import { SPECIAL_SKILLS_DATABASE } from '../../progression/skills-database';
import { GEAR_DATABASE } from '../../progression/gear-matrix';
import { WEAPON_PROGRESSION_DATABASE, getEquippedWeaponVisual } from '../../progression/weapon-visuals';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles, 
  Sword, 
  Shield, 
  Crown, 
  Lock, 
  CheckCircle2, 
  Play, 
  Zap 
} from 'lucide-react';

interface SkillInventoryScreenProps {
  profile: PlayerProfile;
  onUpdateProfile?: (newProfile: PlayerProfile) => Promise<void>;
  onOpenMarket: () => void;
  onBack: () => void;
}

type TabType = 'CONSUMABLES' | 'SKILLS' | 'WEAPONS' | 'ARMOR' | 'RELICS';

export const SkillInventoryScreen: React.FC<SkillInventoryScreenProps> = ({
  profile,
  onUpdateProfile,
  onOpenMarket,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('WEAPONS');
  const [previewWeaponId, setPreviewWeaponId] = useState<string | null>(null);
  const [previewVfxText, setPreviewVfxText] = useState<string | null>(null);

  const consumables = Object.values(MAGIC_MARKET_ITEMS);
  const specialSkills = Object.values(SPECIAL_SKILLS_DATABASE);
  const allGear = Object.values(GEAR_DATABASE);

  const armors = allGear.filter((g) => g.type === 'ARMOR');
  const relics = allGear.filter((g) => g.type === 'RELIC');
  const weaponTiers = Object.values(WEAPON_PROGRESSION_DATABASE);

  const handleEquipWeapon = async (weaponId: string) => {
    if (!onUpdateProfile) return;
    const isUnlocked = profile.unlockedGear?.includes(weaponId) || weaponId === 'TRAINING_WEAPON';
    if (!isUnlocked) return;

    const updated: PlayerProfile = {
      ...profile,
      equippedWeaponId: weaponId,
    };
    await onUpdateProfile(updated);
  };

  const handlePreviewAttack = (weaponId: string) => {
    const visual = getEquippedWeaponVisual(weaponId, profile.heroId);
    setPreviewWeaponId(weaponId);
    setPreviewVfxText(`⚡ [${visual.classVisual.weaponName}] ปลดปล่อยพลัง: ${visual.classVisual.attackVfxName}!`);
    setTimeout(() => {
      setPreviewVfxText(null);
      setPreviewWeaponId(null);
    }, 2000);
  };

  const currentEquipped = profile.equippedWeaponId || 'TRAINING_WEAPON';

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-between text-slate-100 max-w-5xl mx-auto select-none font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold border border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่แผนที่หลัก
        </button>

        <button
          onClick={onOpenMarket}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 text-xs font-black shadow-glow-gold transition-all"
        >
          <ShoppingBag className="w-4 h-4" /> ไปที่ตลาดเวทมนตร์
        </button>
      </div>

      {/* Main Inventory Card */}
      <div className="frost-card rounded-3xl p-6 md:p-8 border-2 border-cyan-400 shadow-glow-cyan flex-1 flex flex-col justify-between mb-4">
        <div>
          {/* Header */}
          <div className="pb-3 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-3xl shadow-glow-cyan">
                🎒
              </div>
              <div>
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                  PLAYER INVENTORY & WEAPON VAULT
                </span>
                <h1 className="text-lg md:text-2xl font-black text-white">
                  คลังไอเทม สกิลพิเศษ และการติดตั้งอาวุธ
                </h1>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400">เหรียญทองสะสม:</span>
              <div className="text-amber-300 font-bold text-sm">{profile.coins.toLocaleString()} 🪙</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 my-4 overflow-x-auto pb-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('WEAPONS')}
              className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                activeTab === 'WEAPONS' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Sword className="w-3.5 h-3.5" /> ศาสตราวุธ (Weapons)
            </button>

            <button
              onClick={() => setActiveTab('CONSUMABLES')}
              className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                activeTab === 'CONSUMABLES' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> ไอเทมใช้งาน (Consumables)
            </button>

            <button
              onClick={() => setActiveTab('SKILLS')}
              className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                activeTab === 'SKILLS' ? 'bg-purple-600 text-white font-black shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> สกิลพิเศษ (Special Skills)
            </button>

            <button
              onClick={() => setActiveTab('ARMOR')}
              className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                activeTab === 'ARMOR' ? 'bg-blue-600 text-white font-black shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> ชุดเกราะ (Armor)
            </button>

            <button
              onClick={() => setActiveTab('RELICS')}
              className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                activeTab === 'RELICS' ? 'bg-yellow-500 text-slate-950 font-black shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Crown className="w-3.5 h-3.5" /> ศิลา & วัตถุโบราณ (Relics)
            </button>
          </div>

          {/* Preview VFX Banner */}
          {previewVfxText && (
            <div className="p-3 rounded-xl bg-amber-950 border border-amber-400 text-amber-200 font-bold text-xs mb-3 flex items-center gap-2 animate-scale-up shadow-glow-gold">
              <Zap className="w-4 h-4 text-amber-400 animate-spin" />
              <span>{previewVfxText}</span>
            </div>
          )}

          {/* TAB 1: Weapons & Progression System */}
          {activeTab === 'WEAPONS' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {weaponTiers.map((w) => {
                  const isOwned = profile.unlockedGear?.includes(w.id) || w.id === 'TRAINING_WEAPON';
                  const isEquipped = currentEquipped === w.id;
                  const visual = getEquippedWeaponVisual(w.id, profile.heroId);

                  return (
                    <div 
                      key={w.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isEquipped
                          ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400 shadow-glow-gold'
                          : isOwned
                          ? 'bg-arctic-950 border-slate-700 hover:border-slate-500'
                          : 'bg-slate-950/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">{visual.classVisual.weaponIcon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-black text-white">{visual.classVisual.weaponName}</h4>
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold border border-amber-500/30">
                                  Tier {w.tier}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">{w.thaiName}</p>
                            </div>
                          </div>

                          {isEquipped ? (
                            <span className="text-[10px] px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> สวมใส่อยู่ (Equipped)
                            </span>
                          ) : isOwned ? (
                            <span className="text-[10px] px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 font-bold border border-emerald-500">
                              ครอบครองแล้ว (Owned)
                            </span>
                          ) : (
                            <span className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-800 text-slate-500 font-bold border border-slate-700 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> ล็อกอยู่ (Locked)
                            </span>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-arctic-900/90 border border-slate-800 text-[11px] space-y-1 my-2">
                          <div className="flex items-center justify-between text-cyan-300">
                            <span>⚡ ท่าโจมตี (Attack VFX):</span>
                            <span className="font-bold">{visual.classVisual.attackVfxName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>สีโปรเจกไทล์:</span>
                            <div className="w-3.5 h-3.5 rounded-full border border-white/40" style={{ backgroundColor: visual.classVisual.projectileColor }} />
                            <span>สีรอยฟัน:</span>
                            <div className="w-3.5 h-3.5 rounded-full border border-white/40" style={{ backgroundColor: visual.classVisual.slashColor }} />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800">
                        {isOwned && !isEquipped && (
                          <button
                            onClick={() => handleEquipWeapon(w.id)}
                            className="flex-1 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all"
                          >
                            สวมใส่อาวุธนี้
                          </button>
                        )}
                        {isOwned && (
                          <button
                            onClick={() => handlePreviewAttack(w.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <Play className="w-3 h-3 fill-amber-300" /> พรีวิวท่าโจมตี
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Consumables */}
          {activeTab === 'CONSUMABLES' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {consumables.map((item) => {
                const count = profile.consumableInventory?.[item.id] || 0;
                return (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-arctic-950 border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-white">{item.thaiName}</h4>
                        <p className="text-[10px] text-slate-400">{item.description}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      x{count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: Special Skills */}
          {activeTab === 'SKILLS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specialSkills.map((skill) => {
                const isUnlocked = profile.unlockedSpecialSkills?.includes(skill.id);
                return (
                  <div
                    key={skill.id}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                      isUnlocked
                        ? 'bg-purple-950/60 border-purple-400/80 shadow-glow-purple'
                        : 'bg-arctic-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{skill.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white">{skill.thaiName}</h4>
                          {isUnlocked ? (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500">
                              ปลดล็อกแล้ว
                            </span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold flex items-center gap-1 border border-slate-700">
                              <Lock className="w-2.5 h-2.5" /> ล็อกอยู่
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">{skill.effectDescription}</p>
                        <p className="text-[10px] text-amber-300 font-semibold mt-1">
                          เงื่อนไข: {skill.unlockDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: Armor */}
          {activeTab === 'ARMOR' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {armors.map((a) => {
                const isUnlocked = profile.unlockedGear?.includes(a.id);
                return (
                  <div key={a.id} className="p-4 rounded-2xl bg-arctic-950 border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{a.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-white">{a.thaiName}</h4>
                        <p className="text-[10px] text-cyan-300 font-semibold">{a.statBonus}</p>
                      </div>
                    </div>
                    {isUnlocked ? (
                      <span className="text-[10px] px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 font-bold border border-emerald-500">
                        เป็นเจ้าของแล้ว
                      </span>
                    ) : (
                      <span className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-800 text-slate-500 font-bold border border-slate-700">
                        ยังไม่ปลดล็อก
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: Relics */}
          {activeTab === 'RELICS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relics.map((r) => {
                const isUnlocked = profile.unlockedGear?.includes(r.id);
                return (
                  <div key={r.id} className="p-4 rounded-2xl bg-arctic-950 border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{r.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-white">{r.thaiName}</h4>
                        <p className="text-[10px] text-amber-300 font-semibold">{r.statBonus}</p>
                      </div>
                    </div>
                    {isUnlocked ? (
                      <span className="text-[10px] px-2.5 py-1 rounded-xl bg-amber-950 text-amber-300 font-bold border border-amber-500">
                        ศิลาครอบครอง
                      </span>
                    ) : (
                      <span className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-800 text-slate-500 font-bold border border-slate-700">
                        ยังไม่พบ
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
