export type AudioChannel = 'MUSIC' | 'SFX' | 'UI' | 'AMBIENCE';

export type ZoneMusicProfileId = 
  | 'TRAINING_DOJO'
  | 'FARMING_SHRINE'
  | 'ONET_GATEWAY'
  | 'BOSS_ARENA'
  | 'GEOMETRY_RUINS'
  | 'QUEST_BOARD'
  | 'FINAL_TRIAL'
  | 'TOP_FORM';

export type AudioSfxEvent = 
  | 'SFX_UI_CLICK'
  | 'SFX_CORRECT'
  | 'SFX_WRONG'
  | 'SFX_HINT'
  | 'SFX_COMBO'
  | 'SFX_SPEED_GRADE'
  | 'SFX_ATTACK'
  | 'SFX_CRITICAL'
  | 'SFX_BOSS_HIT'
  | 'SFX_BOSS_RAGE'
  | 'SFX_BOSS_DEFEAT'
  | 'SFX_ITEM_UNLOCK'
  | 'SFX_RELIC_UNLOCK'
  | 'SFX_FORGE'
  | 'SFX_LEVEL_UP'
  | 'SFX_TOP_FORM';

export interface AudioSettings {
  masterVolume: number; // 0.0 - 1.0
  musicVolume: number;  // 0.0 - 1.0
  sfxVolume: number;    // 0.0 - 1.0
  uiVolume: number;     // 0.0 - 1.0
  isMuted: boolean;
  isMusicEnabled: boolean;
  isSfxEnabled: boolean;
  isReducedSound: boolean;
}

export interface ZoneMusicDefinition {
  id: ZoneMusicProfileId;
  name: string;
  thaiName: string;
  tempoBpm: number;
  moodDescription: string;
  instrumentation: string;
  loopToneFrequencies: number[];
}
