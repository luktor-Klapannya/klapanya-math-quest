import React from 'react';
import { 
  EnemyKey, 
  EnemyActionState, 
  getEnemySprite, 
  ENEMY_ASSET_REGISTRY 
} from '../../assets/enemyAssetRegistry';

interface OpponentLayerProps {
  enemyKey?: EnemyKey;
  actionState?: EnemyActionState;
  currentHp?: number;
  maxHp?: number;
  className?: string;
}

export const OpponentLayer: React.FC<OpponentLayerProps> = ({
  enemyKey = 'FROST_DUMMY',
  actionState = 'NORMAL',
  currentHp = 100,
  maxHp = 100,
  className = '',
}) => {
  const profile = ENEMY_ASSET_REGISTRY[enemyKey] || ENEMY_ASSET_REGISTRY.FROST_DUMMY;
  const spriteSrc = getEnemySprite(enemyKey, actionState);
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  return (
    <div className={`relative flex flex-col items-center justify-end select-none ${className}`}>
      
      {/* 1. HP BAR OVERLAY */}
      <div className="w-28 sm:w-40 mb-2 flex flex-col items-center gap-0.5">
        <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-300 px-1">
          <span className="truncate max-w-[90px]">{profile.nameTh}</span>
          <span className="text-rose-400">{Math.round(currentHp)}/{maxHp}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-700 overflow-hidden p-0.5 shadow-inner">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 transition-all duration-300"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* 2. GROUND SHADOW */}
      <div className="w-28 sm:w-36 h-6 rounded-full bg-rose-500/15 blur-md -mb-3" />

      {/* 3. OPPONENT SPRITE WITH ACTION STATES */}
      <div 
        className={`relative transition-all duration-300 ${
          actionState === 'HIT'
            ? 'scale-90 translate-x-3 filter brightness-150 hue-rotate-180'
            : actionState === 'DEFEAT'
            ? 'scale-75 opacity-30 blur-sm translate-y-4'
            : 'animate-pulse'
        }`}
      >
        <img
          src={spriteSrc}
          alt={profile.nameEn}
          className="h-44 sm:h-56 md:h-64 object-contain pointer-events-none drop-shadow-2xl"
          loading="eager"
        />
      </div>

      {/* 4. OPPONENT BADGE */}
      <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-rose-500/50 backdrop-blur-md shadow-md text-[10px] font-bold text-rose-300">
        <span>{profile.isTrueBoss ? '👑 CITADEL BOSS' : '⚔️ TRAINING DUMMY'}</span>
      </div>
    </div>
  );
};
