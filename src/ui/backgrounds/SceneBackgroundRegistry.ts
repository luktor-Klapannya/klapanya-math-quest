import { SCENE_ASSET_REGISTRY, getSceneAsset, SceneAssetKey } from '../assets/sceneAssetRegistry';

export type TerritoryId = 
  | 'FROZEN_ARCTIC' 
  | 'SKY_REALM' 
  | 'OCEAN_CITADEL' 
  | 'VOLCANIC_FORGE' 
  | 'THAI_HERITAGE';

export type SceneType = 
  | 'PORTAL'
  | 'MAP'
  | 'DOJO'
  | 'FARMING'
  | 'ONET'
  | 'GEOMETRY'
  | 'QUEST'
  | 'BOSS_DRAGON'
  | 'BOSS_GOLEM'
  | 'BOSS_ARCHMAGE'
  | 'BOSS'
  | 'FINAL'
  | 'RESULT'
  | 'ARENA_LOBBY'
  | 'ARENA_LIVE'
  | 'ARENA_RESULT'
  | 'ARENA';

export interface ResponsiveBackgroundAssets {
  desktop: string; // 1920x1080
  tablet: string;  // 1440x1200
  mobile: string;  // 900x1200
  overlays?: {
    fog?: string;
    lightning?: string;
    rune?: string;
    particles?: string;
  };
}

export interface SceneBackgroundConfig {
  id: string;
  name: string;
  territoryId: TerritoryId;
  sceneType: SceneType;
  assets: ResponsiveBackgroundAssets;
  baseGradient: string; // Robust fallback gradient
  auroraGlow: string;
  particleType: 'SNOW' | 'MAGIC_RUNES' | 'GOLD_SPARKS' | 'EMBER' | 'AURORA_MIST' | 'NONE';
  particleCount: { mobile: number; desktop: number };
  backdropOpacity: number;
  hasMountainSilhouette?: boolean;
  hasRuneCircle?: boolean;
  hasPortalRing?: boolean;
  hasLightningEffect?: boolean;
  hasArenaPillars?: boolean;
}

export const SCENE_BACKGROUND_REGISTRY: Record<string, SceneBackgroundConfig> = {
  // 1. WISDOM ACADEMY PORTAL
  'PORTAL_WISDOM_ACADEMY': {
    id: 'PORTAL_WISDOM_ACADEMY',
    name: 'The Wisdom Academy Portal',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'PORTAL',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.PORTAL.desktop,
      tablet: SCENE_ASSET_REGISTRY.PORTAL.tablet,
      mobile: SCENE_ASSET_REGISTRY.PORTAL.mobile,
    },
    baseGradient: 'from-[#030712] via-[#050d24] to-[#030712]',
    auroraGlow: 'from-blue-600/15 via-cyan-500/20 to-amber-500/15',
    particleType: 'MAGIC_RUNES',
    particleCount: { mobile: 4, desktop: 12 },
    backdropOpacity: 0.35,
    hasRuneCircle: true,
    hasPortalRing: true,
    hasLightningEffect: true,
  },

  // 2. ARCTIC MAP
  'MAP_FROZEN_ARCTIC': {
    id: 'MAP_FROZEN_ARCTIC',
    name: 'Frozen Arctic Expedition Map',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'MAP',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.ARCTIC_MAP.desktop,
      tablet: SCENE_ASSET_REGISTRY.ARCTIC_MAP.tablet,
      mobile: SCENE_ASSET_REGISTRY.ARCTIC_MAP.mobile,
    },
    baseGradient: 'from-[#030712]/95 via-[#03203c]/40 to-[#030712]/95',
    auroraGlow: 'from-teal-500/15 via-cyan-400/25 to-blue-500/15',
    particleType: 'SNOW',
    particleCount: { mobile: 4, desktop: 10 },
    backdropOpacity: 0.25,
    hasMountainSilhouette: true,
  },

  // 3. ARCTIC DOJO
  'GAME_DOJO_FROST_TRAINING_HALL': {
    id: 'GAME_DOJO_FROST_TRAINING_HALL',
    name: 'Frost Training Hall (Open Arena)',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'DOJO',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.ARCTIC_DOJO.desktop,
      tablet: SCENE_ASSET_REGISTRY.ARCTIC_DOJO.tablet,
      mobile: SCENE_ASSET_REGISTRY.ARCTIC_DOJO.mobile,
    },
    baseGradient: 'from-[#020617] via-[#082f49]/30 to-[#020617]',
    auroraGlow: 'from-cyan-500/20 via-sky-400/25 to-blue-600/15',
    particleType: 'SNOW',
    particleCount: { mobile: 3, desktop: 8 },
    backdropOpacity: 0.2,
    hasRuneCircle: true,
  },

  // 4. ARCTIC FARMING SHRINE
  'GAME_FARMING_ARCTIC_GOLD_FIELD': {
    id: 'GAME_FARMING_ARCTIC_GOLD_FIELD',
    name: 'Arctic Gold Field Shrine',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'FARMING',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.ARCTIC_FARMING.desktop,
      tablet: SCENE_ASSET_REGISTRY.ARCTIC_FARMING.tablet,
      mobile: SCENE_ASSET_REGISTRY.ARCTIC_FARMING.mobile,
    },
    baseGradient: 'from-[#020617] via-[#422006]/30 to-[#020617]',
    auroraGlow: 'from-amber-500/20 via-yellow-400/25 to-cyan-500/15',
    particleType: 'GOLD_SPARKS',
    particleCount: { mobile: 3, desktop: 8 },
    backdropOpacity: 0.2,
  },

  // 5. ARCTIC O-NET GATEWAY
  'GAME_ONET_FROZEN_GATEWAY': {
    id: 'GAME_ONET_FROZEN_GATEWAY',
    name: 'Frozen Gateway Exam Sanctum',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'ONET',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.ARCTIC_ONET.desktop,
      tablet: SCENE_ASSET_REGISTRY.ARCTIC_ONET.tablet,
      mobile: SCENE_ASSET_REGISTRY.ARCTIC_ONET.mobile,
    },
    baseGradient: 'from-[#020617] via-[#1e1b4b]/40 to-[#020617]',
    auroraGlow: 'from-indigo-500/20 via-purple-400/20 to-cyan-400/15',
    particleType: 'AURORA_MIST',
    particleCount: { mobile: 3, desktop: 6 },
    backdropOpacity: 0.25,
    hasRuneCircle: true,
  },

  // 6. ARCTIC GEOMETRY RUINS
  'GAME_GEOMETRY_CRYSTAL_RUINS': {
    id: 'GAME_GEOMETRY_CRYSTAL_RUINS',
    name: 'Crystal Geometry Ruins',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'GEOMETRY',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.ARCTIC_GEOMETRY.desktop,
      tablet: SCENE_ASSET_REGISTRY.ARCTIC_GEOMETRY.tablet,
      mobile: SCENE_ASSET_REGISTRY.ARCTIC_GEOMETRY.mobile,
    },
    baseGradient: 'from-[#020617] via-[#064e3b]/30 to-[#020617]',
    auroraGlow: 'from-emerald-500/20 via-teal-400/25 to-cyan-500/15',
    particleType: 'MAGIC_RUNES',
    particleCount: { mobile: 3, desktop: 8 },
    backdropOpacity: 0.2,
  },

  // 7. ARCTIC QUEST BOARD
  'GAME_QUEST_ARCTIC_EXPEDITION': {
    id: 'GAME_QUEST_ARCTIC_EXPEDITION',
    name: 'Arctic Quest Board Expedition',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'QUEST',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.ARCTIC_QUEST.desktop,
      tablet: SCENE_ASSET_REGISTRY.ARCTIC_QUEST.tablet,
      mobile: SCENE_ASSET_REGISTRY.ARCTIC_QUEST.mobile,
    },
    baseGradient: 'from-[#020617] via-[#0c4a6e]/30 to-[#020617]',
    auroraGlow: 'from-sky-500/20 via-cyan-400/20 to-blue-600/15',
    particleType: 'SNOW',
    particleCount: { mobile: 3, desktop: 8 },
    backdropOpacity: 0.2,
    hasMountainSilhouette: true,
  },

  // 8. ARCTIC ARENA
  'ARENA_ARCTIC_COLOSSEUM': {
    id: 'ARENA_ARCTIC_COLOSSEUM',
    name: 'Arctic Academic Colosseum',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'ARENA',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.ARCTIC_ARENA.desktop,
      tablet: SCENE_ASSET_REGISTRY.ARCTIC_ARENA.tablet,
      mobile: SCENE_ASSET_REGISTRY.ARCTIC_ARENA.mobile,
    },
    baseGradient: 'from-[#020617] via-[#082f49]/40 to-[#020617]',
    auroraGlow: 'from-cyan-400/30 via-amber-400/20 to-blue-600/25',
    particleType: 'GOLD_SPARKS',
    particleCount: { mobile: 4, desktop: 12 },
    backdropOpacity: 0.3,
    hasArenaPillars: true,
    hasLightningEffect: true,
  },

  // 9. ARCTIC BOSS DRAGON
  'BOSS_DRAGON_FROZEN_SKY': {
    id: 'BOSS_DRAGON_FROZEN_SKY',
    name: 'Frozen Sky Citadel (Cyber Frost Dragon)',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'BOSS_DRAGON',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.ARCTIC_BOSS_DRAGON.desktop,
      tablet: SCENE_ASSET_REGISTRY.ARCTIC_BOSS_DRAGON.tablet,
      mobile: SCENE_ASSET_REGISTRY.ARCTIC_BOSS_DRAGON.mobile,
    },
    baseGradient: 'from-[#020617] via-[#0c4a6e]/40 to-[#020617]',
    auroraGlow: 'from-cyan-500/25 via-blue-600/20 to-indigo-500/15',
    particleType: 'EMBER',
    particleCount: { mobile: 4, desktop: 12 },
    backdropOpacity: 0.3,
    hasRuneCircle: true,
    hasLightningEffect: true,
  },

  // 10. ARCTIC BOSS GOLEM
  'BOSS_GOLEM_RUNE_FORTRESS': {
    id: 'BOSS_GOLEM_RUNE_FORTRESS',
    name: 'Rune-Ice Fortress (Time Golem)',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'BOSS_GOLEM',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.ARCTIC_BOSS_GOLEM.desktop,
      tablet: SCENE_ASSET_REGISTRY.ARCTIC_BOSS_GOLEM.tablet,
      mobile: SCENE_ASSET_REGISTRY.ARCTIC_BOSS_GOLEM.mobile,
    },
    baseGradient: 'from-[#020617] via-[#451a03]/40 to-[#020617]',
    auroraGlow: 'from-amber-600/25 via-yellow-500/20 to-cyan-400/15',
    particleType: 'GOLD_SPARKS',
    particleCount: { mobile: 4, desktop: 12 },
    backdropOpacity: 0.3,
    hasRuneCircle: true,
  },

  // 11. ARCTIC FINAL TRIAL
  'TRIAL_FINAL_SANCTUM': {
    id: 'TRIAL_FINAL_SANCTUM',
    name: 'Final Grandmaster Trial Sanctum',
    territoryId: 'FROZEN_ARCTIC',
    sceneType: 'FINAL',
    assets: {
      desktop: SCENE_ASSET_REGISTRY.ARCTIC_FINAL.desktop,
      tablet: SCENE_ASSET_REGISTRY.ARCTIC_FINAL.tablet,
      mobile: SCENE_ASSET_REGISTRY.ARCTIC_FINAL.mobile,
    },
    baseGradient: 'from-[#020617] via-[#051833]/60 to-[#020617]',
    auroraGlow: 'from-amber-300/25 via-cyan-400/30 to-sky-500/20',
    particleType: 'GOLD_SPARKS',
    particleCount: { mobile: 5, desktop: 14 },
    backdropOpacity: 0.35,
    hasRuneCircle: true,
    hasPortalRing: true,
    hasLightningEffect: true,
  },
};

export function getSceneBackgroundConfig(
  territoryId: TerritoryId = 'FROZEN_ARCTIC',
  sceneType: SceneType = 'MAP'
): SceneBackgroundConfig {
  if (sceneType === 'PORTAL') return SCENE_BACKGROUND_REGISTRY['PORTAL_WISDOM_ACADEMY'];
  if (sceneType === 'MAP') return SCENE_BACKGROUND_REGISTRY['MAP_FROZEN_ARCTIC'];
  if (sceneType === 'DOJO') return SCENE_BACKGROUND_REGISTRY['GAME_DOJO_FROST_TRAINING_HALL'];
  if (sceneType === 'FARMING') return SCENE_BACKGROUND_REGISTRY['GAME_FARMING_ARCTIC_GOLD_FIELD'];
  if (sceneType === 'ONET') return SCENE_BACKGROUND_REGISTRY['GAME_ONET_FROZEN_GATEWAY'];
  if (sceneType === 'GEOMETRY') return SCENE_BACKGROUND_REGISTRY['GAME_GEOMETRY_CRYSTAL_RUINS'];
  if (sceneType === 'QUEST') return SCENE_BACKGROUND_REGISTRY['GAME_QUEST_ARCTIC_EXPEDITION'];
  if (sceneType === 'ARENA' || sceneType === 'ARENA_LOBBY' || sceneType === 'ARENA_LIVE') {
    return SCENE_BACKGROUND_REGISTRY['ARENA_ARCTIC_COLOSSEUM'];
  }
  if (sceneType === 'BOSS_DRAGON' || sceneType === 'BOSS') {
    return SCENE_BACKGROUND_REGISTRY['BOSS_DRAGON_FROZEN_SKY'];
  }
  if (sceneType === 'BOSS_GOLEM') return SCENE_BACKGROUND_REGISTRY['BOSS_GOLEM_RUNE_FORTRESS'];
  if (sceneType === 'FINAL') return SCENE_BACKGROUND_REGISTRY['TRIAL_FINAL_SANCTUM'];

  return SCENE_BACKGROUND_REGISTRY['PORTAL_WISDOM_ACADEMY'];
}
