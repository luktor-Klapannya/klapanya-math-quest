import React, { useState, useEffect } from 'react';
import { PlayerProfile, HeroClassId } from '../../types';
import { 
  HeroEmoteState, 
  BossAnimationState, 
  SoundHookEvent, 
  DamagePopupData 
} from '../../types/combat-animation';
import { getEquippedWeaponVisual } from '../../progression/weapon-visuals';
import { AVATAR_DATABASE } from '../../progression/avatar-database';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { Sparkles, Zap, Flame, Shield, Award, FastForward } from 'lucide-react';

interface CombatArenaViewProps {
  profile: PlayerProfile;
  targetName?: string;
  targetMaxHp?: number;
  targetCurrentHp?: number;
  bossId?: string; // 'BOSS-1' | 'BOSS-2' | 'BOSS-3' | 'DOJO_TARGET'
  heroEmote: HeroEmoteState;
  bossState: BossAnimationState;
  damagePopups?: DamagePopupData[];
  onSoundHook?: (event: SoundHookEvent) => void;
  onSkipDefeat?: () => void;
  isExamMode?: boolean;
}

export const CombatArenaView: React.FC<CombatArenaViewProps> = ({
  profile,
  targetName = 'หุ่นซ้อมรบผลึกเหมันต์ (Frost Training Dummy)',
  targetMaxHp = 1000,
  targetCurrentHp = 1000,
  bossId = 'DOJO_TARGET',
  heroEmote = 'IDLE',
  bossState = 'IDLE',
  damagePopups = [],
  onSoundHook,
  onSkipDefeat,
  isExamMode = false,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const heroClass = HERO_CLASSES[profile.heroId];
  const avatarVisual = (AVATAR_DATABASE as any)[profile.avatarVisualId || 'BOY_WIZARD'] || AVATAR_DATABASE.BOY_WIZARD;
  const equippedWeapon = getEquippedWeaponVisual(profile.equippedWeaponId, profile.heroId);

  const hpPercent = Math.max(0, Math.min(100, Math.round((targetCurrentHp / targetMaxHp) * 100)));

  // Sound hook dispatch
  useEffect(() => {
    if (!onSoundHook) return;
    if (heroEmote === 'ATTACK') onSoundHook('SFX_ATTACK');
    else if (heroEmote === 'CRITICAL_ATTACK') onSoundHook('SFX_CRITICAL');
    else if (heroEmote === 'VICTORY') onSoundHook('SFX_VICTORY');
    else if (heroEmote === 'LEVEL_UP') onSoundHook('SFX_LEVEL_UP');
  }, [heroEmote, onSoundHook]);

  useEffect(() => {
    if (!onSoundHook) return;
    if (bossState === 'HIT_LIGHT' || bossState === 'HIT_CRITICAL') onSoundHook('SFX_BOSS_HIT');
    else if (bossState === 'DEFEATED') onSoundHook('SFX_BOSS_DEFEAT');
  }, [bossState, onSoundHook]);

  // Determine Hero animation style
  let heroAnimationClass = 'animate-pulse';
  if (!prefersReducedMotion) {
    if (heroEmote === 'ATTACK') heroAnimationClass = 'translate-x-12 scale-110 duration-200 transition-transform';
    else if (heroEmote === 'CRITICAL_ATTACK') heroAnimationClass = 'translate-x-16 scale-125 duration-150 transition-transform ring-4 ring-amber-400 rounded-3xl shadow-glow-gold';
    else if (heroEmote === 'HIT_SETBACK') heroAnimationClass = '-translate-x-6 opacity-80 duration-200 transition-transform';
    else if (heroEmote === 'VICTORY' || heroEmote === 'TOP_FORM') heroAnimationClass = '-translate-y-4 scale-110 duration-300 transition-transform animate-bounce';
  }

  // Determine Boss animation style
  let bossAnimationClass = 'animate-pulse';
  if (!prefersReducedMotion) {
    if (bossState === 'HIT_LIGHT') bossAnimationClass = 'translate-x-6 duration-100 bg-white/20 rounded-3xl';
    else if (bossState === 'HIT_CRITICAL') bossAnimationClass = 'translate-x-10 rotate-3 duration-150 bg-rose-500/30 ring-4 ring-rose-400 rounded-3xl';
    else if (bossState === 'RAGE') bossAnimationClass = 'scale-110 ring-4 ring-red-500 animate-pulse duration-300';
    else if (bossState === 'PHASE_TRANSITION') bossAnimationClass = 'scale-105 ring-4 ring-cyan-400 shadow-glow-cyan animate-spin duration-1000';
    else if (bossState === 'DEFEATED') bossAnimationClass = 'opacity-30 scale-75 duration-700 blur-sm';
  }

  // Boss Avatar Graphics
  let bossAvatarGraphic = '🎯';
  let bossTitleFlavor = 'หุ่นจำลองผลึกคณิตศาสตร์';
  if (bossId === 'BOSS-1') {
    bossAvatarGraphic = '🐉';
    bossTitleFlavor = 'มังกรไซเบอร์ฟรอสต์ (Cyber-Frost Dragon)';
  } else if (bossId === 'BOSS-2') {
    bossAvatarGraphic = '🤖';
    bossTitleFlavor = 'โกเลมปรมาจารย์ความเร็ว (Grandmaster Golem)';
  } else if (bossId === 'BOSS-3') {
    bossAvatarGraphic = '🧙‍♂️';
    bossTitleFlavor = 'มหาจอมเวทแห่งจุดศูนย์ (Archmage of Zero)';
  }

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-slate-950/90 via-cyan-950/40 to-slate-950/90 border border-cyan-500/30 p-4 md:p-6 mb-4 overflow-hidden select-none font-sans shadow-2xl">
      
      {/* Background Arena FX */}
      <div className="absolute inset-0 bg-radial from-transparent via-cyan-950/20 to-slate-950 pointer-events-none" />

      {/* Top Arena Info Bar */}
      <div className="relative z-10 flex items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-800 text-xs">
        {/* Left: Player & Equipped Weapon */}
        <div className="flex items-center gap-2">
          <span className="font-black text-cyan-300">{profile.heroName}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-arctic-900 border border-cyan-500/40 text-cyan-200 flex items-center gap-1 font-semibold">
            {equippedWeapon.classVisual.weaponIcon} {equippedWeapon.classVisual.weaponName}
          </span>
        </div>

        {/* Right: Target & HP Bar */}
        <div className="flex-1 max-w-xs ml-auto text-right">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-rose-300 truncate">{targetName}</span>
            <span className="text-white font-mono ml-2">{targetCurrentHp.toLocaleString()} / {targetMaxHp.toLocaleString()} HP</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${
                hpPercent > 50 ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : hpPercent > 20 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 'bg-gradient-to-r from-rose-500 to-red-600'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Combat Visual Stage */}
      <div className="relative min-h-[140px] md:min-h-[180px] flex items-center justify-between px-4 md:px-12">
        
        {/* HERO SPRITE (LEFT) */}
        <div className={`flex flex-col items-center justify-center transition-all ${heroAnimationClass}`}>
          <div className="relative">
            {/* Hero Character Box */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-arctic-950 border-2 border-cyan-400 flex items-center justify-center text-4xl md:text-5xl shadow-glow-cyan">
              {avatarVisual.avatarSprite}
            </div>

            {/* Weapon Overlay Badge */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-base shadow-md">
              {equippedWeapon.classVisual.weaponIcon}
            </div>

            {/* Top Form Sovereign Halo */}
            {profile.isTopFormUnlocked && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-spin">
                👑
              </div>
            )}
          </div>

          <span className="text-[11px] font-black text-white mt-1.5">{heroClass.name}</span>
        </div>

        {/* PROJECTILE / VFX STRIKE LAYER (CENTER) */}
        <div className="flex-1 flex items-center justify-center relative pointer-events-none min-h-[80px]">
          {heroEmote === 'ATTACK' && (
            <div className="flex items-center gap-2 animate-scale-up">
              <div 
                className="w-12 h-3 rounded-full shadow-lg transform rotate-12"
                style={{ backgroundColor: equippedWeapon.classVisual.projectileColor }}
              />
              <span className="text-2xl animate-spin">⚡</span>
            </div>
          )}

          {heroEmote === 'CRITICAL_ATTACK' && (
            <div className="flex flex-col items-center justify-center animate-scale-up">
              <div className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-glow-gold animate-bounce mb-1">
                ⭐ CRITICAL HIT! ⭐
              </div>
              <div 
                className="w-24 h-4 rounded-full shadow-glow-gold"
                style={{ backgroundColor: equippedWeapon.classVisual.slashColor }}
              />
            </div>
          )}
        </div>

        {/* BOSS / TARGET SPRITE (RIGHT) */}
        <div className={`flex flex-col items-center justify-center transition-all ${bossAnimationClass}`}>
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-900 border-2 border-rose-500 flex items-center justify-center text-4xl md:text-5xl shadow-lg">
              {bossAvatarGraphic}
            </div>

            {/* Damage Popups */}
            {damagePopups.map((dp) => (
              <div 
                key={dp.id}
                className={`absolute -top-8 left-1/2 -translate-x-1/2 font-black font-mono text-sm md:text-base animate-bounce pointer-events-none whitespace-nowrap ${
                  dp.isCritical ? 'text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,1)] text-lg' : 'text-cyan-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                }`}
              >
                -{dp.damage.toLocaleString()} {dp.isCritical ? '💥 CRIT!' : '⚔️'}
              </div>
            ))}
          </div>

          <span className="text-[11px] font-black text-rose-300 mt-1.5">{bossTitleFlavor}</span>
        </div>
      </div>

      {/* Defeat Animation Skip Button */}
      {bossState === 'DEFEATED' && onSkipDefeat && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 animate-scale-up">
          <div className="text-center mb-3">
            <h3 className="text-base font-black text-amber-300 flex items-center justify-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> ปราบมหาบอสสำเร็จ! (BOSS DEFEATED)
            </h3>
            <p className="text-xs text-slate-300 mt-1">ผลึกแกนบอสโบราณถูกปลดปล่อยแล้ว</p>
          </div>
          <button
            onClick={onSkipDefeat}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-glow-gold transform hover:scale-105 transition-all"
          >
            <span>ข้ามแอนิเมชัน</span>
            <FastForward className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
