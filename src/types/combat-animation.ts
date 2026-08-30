import { HeroClassId } from './index';

export type HeroEmoteState = 
  | 'IDLE' 
  | 'FOCUS' 
  | 'THINKING' 
  | 'ATTACK' 
  | 'CRITICAL_ATTACK' 
  | 'HIT_SETBACK' 
  | 'VICTORY' 
  | 'LEVEL_UP' 
  | 'EQUIP_WEAPON' 
  | 'TOP_FORM';

export type BossAnimationState = 
  | 'IDLE' 
  | 'HIT_LIGHT' 
  | 'HIT_CRITICAL' 
  | 'RAGE' 
  | 'PHASE_TRANSITION' 
  | 'DEFEATED';

export type SoundHookEvent = 
  | 'SFX_ATTACK' 
  | 'SFX_CRITICAL' 
  | 'SFX_BOSS_HIT' 
  | 'SFX_BOSS_DEFEAT' 
  | 'SFX_LEVEL_UP' 
  | 'SFX_RELIC' 
  | 'SFX_VICTORY';

export interface WeaponVisualDefinition {
  id: string;
  name: string;
  thaiName: string;
  tier: 1 | 2 | 3 | 4 | 5;
  icon: string;
  classVisualMap: Record<HeroClassId, {
    weaponName: string;
    weaponIcon: string;
    projectileColor: string;
    slashColor: string;
    attackVfxName: string;
  }>;
}

export interface DamagePopupData {
  id: string;
  damage: number;
  isCritical: boolean;
  x: number;
  y: number;
}
