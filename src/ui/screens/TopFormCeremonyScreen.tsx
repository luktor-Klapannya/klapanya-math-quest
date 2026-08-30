import React, { useState } from 'react';
import { PlayerProfile, TopFormEligibility } from '../../types';
import { GEAR_DATABASE } from '../../progression/gear-matrix';
import { Crown, Sparkles, Sword, Shield, CheckCircle2, ArrowRight, RotateCcw, FastForward } from 'lucide-react';

interface TopFormCeremonyScreenProps {
  profile: PlayerProfile;
  eligibility: TopFormEligibility;
  onReturnToMap: () => void;
}

export const TopFormCeremonyScreen: React.FC<TopFormCeremonyScreenProps> = ({
  profile,
  eligibility,
  onReturnToMap,
}) => {
  const [stageStep, setStageStep] = useState<number>(3); // 1: Entrance, 2: Transformation, 3: Coronation (default complete with skip/replay)

  const armor = GEAR_DATABASE.MYTHIC_ARCTIC_ARMOR;
  const blade = GEAR_DATABASE.CELESTIAL_ADMISSION_BLADE;
  const halo = GEAR_DATABASE.ARCTIC_SOVEREIGN_HALO;

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-center items-center text-slate-100 select-none">
      <div className="frost-card rounded-3xl p-6 md:p-10 max-w-2xl w-full border-4 border-amber-400 shadow-glow-gold text-center relative overflow-hidden animate-scale-up">
        {/* Skip & Replay Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
          <button
            onClick={() => setStageStep(1)}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center gap-1"
            title="เล่นลำดับพิธีใหม่ (Replay)"
          >
            <RotateCcw className="w-3.5 h-3.5" /> เล่นซ้ำ
          </button>
          {stageStep < 3 && (
            <button
              onClick={() => setStageStep(3)}
              className="p-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1"
              title="ข้ามฉาก (Skip)"
            >
              <FastForward className="w-3.5 h-3.5" /> ข้าม
            </button>
          )}
        </div>

        {/* Crown Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-600 p-1 mx-auto mb-3 shadow-glow-gold animate-bounce">
          <div className="w-full h-full bg-arctic-950 rounded-[22px] flex items-center justify-center text-5xl">
            👑
          </div>
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-400">
          GRAND CORONATION CEREMONY • 710 QUESTIONS MASTERED
        </span>
        <h1 className="text-2xl md:text-4xl font-black text-white mt-1">
          บรรลุสถานะร่างสมบูรณ์ (TOP FORM)
        </h1>
        <p className="text-xs md:text-sm text-amber-200/90 mt-2 font-semibold">
          ขอแสดงความยินดีแด่ <span className="font-extrabold text-white">{profile.heroName}</span> ผู้พิชิตทั้ง 6 โซนและ 710 ข้อสอบแห่งดินแดนอาร์กติก
        </p>

        {/* 3 Top Form Prestige Artifacts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-left">
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border-2 border-amber-400 shadow-md">
            <div className="text-3xl mb-1">{armor.icon}</div>
            <h4 className="text-xs font-extrabold text-white">{armor.name}</h4>
            <p className="text-[10px] text-slate-300 mt-0.5">{armor.statBonus}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/40 border-2 border-amber-400 shadow-md">
            <div className="text-3xl mb-1">{blade.icon}</div>
            <h4 className="text-xs font-extrabold text-white">{blade.name}</h4>
            <p className="text-[10px] text-slate-300 mt-0.5">{blade.statBonus}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/40 border-2 border-amber-400 shadow-md">
            <div className="text-3xl mb-1">{halo.icon}</div>
            <h4 className="text-xs font-extrabold text-white">{halo.name}</h4>
            <p className="text-[10px] text-slate-300 mt-0.5">{halo.statBonus}</p>
          </div>
        </div>

        {/* 6 Zones Clear Checklist */}
        <div className="p-4 rounded-2xl bg-arctic-950/80 border border-slate-700 text-left text-xs mb-6">
          <h4 className="font-extrabold text-cyan-300 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> ตราประทับแห่ง 6 แดนศักดิ์สิทธิ์ (710Q Grand Campaign)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Dojo (180Q)</span>
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Shrine (120Q)</span>
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Gateway (80Q)</span>
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Boss Arena (180Q)</span>
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Geometry (50Q)</span>
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Quest Board (100Q)</span>
          </div>
        </div>

        {/* Return */}
        <button
          onClick={onReturnToMap}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-glow-gold text-sm md:text-base"
        >
          กลับสู่แผนที่ดินแดนอาร์กติก <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
