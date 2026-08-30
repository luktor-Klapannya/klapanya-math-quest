import React from 'react';
import { BossBattleResult } from '../../types';
import { GEAR_DATABASE } from '../../progression/gear-matrix';
import { 
  Trophy, 
  Coins, 
  Award, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Crown,
  Sword,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface BossResultScreenProps {
  result: BossBattleResult;
  onReturnToMap: () => void;
}

export const BossResultScreen: React.FC<BossResultScreenProps> = ({
  result,
  onReturnToMap,
}) => {
  const unlockedRelicItem = result.unlockedRelic ? GEAR_DATABASE[result.unlockedRelic] : null;
  const prestigeWeapon = GEAR_DATABASE.LEGENDARY_ADMISSION_WEAPON;

  const tierBadgeMap: Record<string, { bg: string; text: string; label: string }> = {
    MYTHIC: { bg: 'bg-purple-950 border-purple-400 shadow-glow-purple', text: 'text-purple-300', label: '👑 อันดับมหากาพย์ (Mythic: 95%+ & 0 Phase Failures)' },
    GOLD: { bg: 'bg-amber-950 border-amber-400 shadow-glow-gold', text: 'text-amber-300', label: '🥇 อันดับทองคำ (Gold: 90%+ Accuracy)' },
    SILVER: { bg: 'bg-slate-800 border-cyan-400 shadow-glow-cyan', text: 'text-cyan-300', label: '🥈 อันดับเงิน (Silver: 80%+ Accuracy)' },
    BRONZE: { bg: 'bg-amber-950/60 border-amber-700', text: 'text-amber-400', label: '🥉 อันดับทองแดง (Bronze: พิชิตบอสสำเร็จ)' },
    DEFEATED_FAILED: { bg: 'bg-rose-950 border-rose-500', text: 'text-rose-300', label: 'ยังไม่สามารถโค่นบอสได้' },
  };

  const currentBadge = tierBadgeMap[result.performanceTier] || tierBadgeMap.BRONZE;

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-center items-center text-slate-100">
      <div className="frost-card rounded-3xl p-6 md:p-10 max-w-2xl w-full border-2 border-rose-500/80 shadow-2xl text-center relative overflow-hidden animate-scale-up">
        {/* Performance Tier Badge */}
        <div className="inline-flex flex-col items-center justify-center mb-3">
          <div className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-2 ${currentBadge.bg} ${currentBadge.text}`}>
            {currentBadge.label}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            {result.isVictory ? '🏆 พิชิตมหาบอสสำเร็จอย่างยิ่งใหญ่!' : '❄️ พ่ายแพ้ต่อพลังมหาบอส'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ศึกปราสาท {result.bossName} ({result.bossId})
          </p>
        </div>

        {/* Combat Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 text-left">
          <div className="p-3 rounded-2xl bg-arctic-800/80 border border-slate-700">
            <span className="text-[11px] text-slate-400 font-semibold block">ความแม่นยำ</span>
            <span className="text-xl font-black text-cyan-300 mt-0.5 block">{result.accuracy}%</span>
            <span className="text-[10px] text-slate-400">{result.correctCount} ข้อถูก</span>
          </div>

          <div className="p-3 rounded-2xl bg-arctic-800/80 border border-slate-700">
            <span className="text-[11px] text-slate-400 font-semibold block">ดาเมจรวม</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">{result.totalDamageDealt.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">{result.criticalHits} คริติคอล</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40">
            <span className="text-[11px] text-amber-300 font-semibold block">เหรียญรางวัล</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">+{result.earnedCoins}</span>
            <span className="text-[10px] text-amber-300/80">🪙 เหรียญทอง</span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40">
            <span className="text-[11px] text-purple-300 font-semibold block">ค่าประสบการณ์</span>
            <span className="text-xl font-black text-purple-400 mt-0.5 block">+{result.earnedXp}</span>
            <span className="text-[10px] text-purple-300/80">XP ผู้กล้า</span>
          </div>
        </div>

        {/* Relic Drop Reveal */}
        {unlockedRelicItem && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-rose-950 to-purple-950 border-2 border-rose-400 mb-4 text-left flex items-center gap-4 animate-bounce shadow-glow-gold">
            <div className="text-4xl">{unlockedRelicItem.icon}</div>
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> ได้รับแกนพลังงานบอสระดับ MYTHIC!
              </div>
              <h4 className="text-base font-extrabold text-white">{unlockedRelicItem.name}</h4>
              <p className="text-xs text-slate-300">{unlockedRelicItem.description}</p>
            </div>
          </div>
        )}

        {/* Frost Core Forge Unlock Banner */}
        {result.forgeUnlocked && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 border-2 border-amber-400 mb-4 text-left flex items-center gap-4 shadow-glow-gold animate-scale-up">
            <div className="text-4xl">{prestigeWeapon.icon}</div>
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Crown className="w-4 h-4 text-amber-400" /> ปลดล็อกเตาหลอมศิลาเยือกแข็ง (The Frost Core Forge)!
              </div>
              <h4 className="text-base font-black text-white">{prestigeWeapon.thaiName}</h4>
              <p className="text-xs text-amber-200/90">{prestigeWeapon.description}</p>
            </div>
          </div>
        )}

        {/* Trap Profile */}
        {Object.keys(result.misconceptionProfile).length > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 mb-4 text-left text-xs">
            <h4 className="font-extrabold text-rose-300 flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> กับดักที่พลาดในศึกบอส (Boss Trap Telemetry)
            </h4>
            <div className="space-y-1 text-slate-300">
              {Object.entries(result.misconceptionProfile).map(([tag, count]) => (
                <div key={tag} className="flex justify-between">
                  <span>⚠️ {tag.replace(/_/g, ' ')}</span>
                  <span className="text-rose-400 font-bold">{count} ครั้ง</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill DNA update */}
        <div className="frost-card p-3.5 rounded-2xl mb-5 text-left">
          <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> ผลกระทบต่อ Skill DNA (Weighted Mastery Engine v1)
          </h4>
          <div className="space-y-1.5">
            {Object.entries(result.masteryUpdates).map(([skill, delta]) => {
              const diff = delta.after - delta.before;
              return (
                <div key={skill} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 capitalize">{skill.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{Math.round(delta.before * 100)}%</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="font-bold text-cyan-300">{Math.round(delta.after * 100)}%</span>
                    {diff > 0 && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5" />+{Math.round(diff * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onReturnToMap}
          className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-glow-gold text-sm md:text-base"
        >
          กลับสู่แผนที่ <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
