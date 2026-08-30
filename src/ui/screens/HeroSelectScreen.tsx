import React, { useState } from 'react';
import { HeroClassId, HeroClass } from '../../types';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';

interface HeroSelectScreenProps {
  currentHeroId: HeroClassId;
  onSelectHero: (heroId: HeroClassId, heroName: string) => void;
}

export const HeroSelectScreen: React.FC<HeroSelectScreenProps> = ({
  currentHeroId,
  onSelectHero,
}) => {
  const [selectedId, setSelectedId] = useState<HeroClassId>(currentHeroId);
  const [heroName, setHeroName] = useState<string>('ผู้กล้าคณิตศาสตร์');

  const activeHero = HERO_CLASSES[selectedId];

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-8 flex flex-col justify-between items-center text-slate-100">
      {/* Header */}
      <div className="text-center max-w-2xl mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Frozen Arctic Math Realm
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
          เลือกคลาสผู้กล้า <span className="text-cyan-400">พิชิต ม.1</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-2">
          เลือกคลาสที่เข้ากับสไตล์การคิดเลขของเธอ เพื่อเปิดใช้งานสกิลพิเศษติดตัว
        </p>
      </div>

      {/* Hero Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full">
        {(Object.keys(HERO_CLASSES) as HeroClassId[]).map((id) => {
          const hero = HERO_CLASSES[id];
          const isSelected = selectedId === id;
          return (
            <button
              key={id}
              onClick={() => setSelectedId(id)}
              className={`text-left p-5 rounded-2xl transition-all duration-300 relative flex flex-col justify-between ${
                isSelected
                  ? 'frost-card-active scale-105 ring-2 ring-cyan-400 shadow-glow-cyan'
                  : 'frost-card hover:border-cyan-400/40 hover:scale-[1.02]'
              }`}
            >
              <div>
                <div className="text-5xl mb-3">{hero.avatar}</div>
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {hero.thaiName}
                </div>
                <h3 className="text-xl font-extrabold text-white mt-0.5">{hero.name}</h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2">{hero.style}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-cyan-500/20 space-y-2 text-xs">
                <div>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> ติดตัว: {hero.passiveName}
                  </span>
                  <p className="text-slate-400 text-[11px]">{hero.passiveDescription}</p>
                </div>
                <div>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> ไม้ตาย: {hero.activeName}
                  </span>
                  <p className="text-slate-400 text-[11px]">{hero.activeDescription}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Name Input & Start Button */}
      <div className="frost-card p-4 md:p-6 rounded-2xl max-w-xl w-full mt-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full">
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            ฉายา / ชื่อผู้กล้า
          </label>
          <input
            type="text"
            value={heroName}
            onChange={(e) => setHeroName(e.target.value)}
            className="w-full bg-arctic-800 border border-cyan-500/40 rounded-xl px-4 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="ใส่ชื่อผู้กล้าของคุณ"
          />
        </div>
        <button
          onClick={() => onSelectHero(selectedId, heroName.trim() || 'ผู้กล้าคณิตศาสตร์')}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-glow-cyan transition-all transform hover:scale-105 whitespace-nowrap self-end"
        >
          เข้าสู่ดินแดนอาร์กติก <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
