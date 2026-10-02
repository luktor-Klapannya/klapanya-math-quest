/**
 * Central Scene Asset Registry
 * Provides authoritative paths for all background world art and scene layers.
 * No screen should hard-code production asset paths.
 */

export type SceneAssetKey = 
  | 'PORTAL'
  | 'LOGIN'
  | 'GUIDE'
  | 'TERRITORY'
  | 'ARCTIC_HERO_SELECT'
  | 'ARCTIC_MAP'
  | 'ARCTIC_DOJO'
  | 'ARCTIC_FARMING'
  | 'ARCTIC_ONET'
  | 'ARCTIC_GEOMETRY'
  | 'ARCTIC_QUEST'
  | 'ARCTIC_ARENA'
  | 'ARCTIC_BOSS_DRAGON'
  | 'ARCTIC_BOSS_GOLEM'
  | 'ARCTIC_BOSS_ARCHMAGE'
  | 'ARCTIC_FINAL'
  | 'ARCTIC_RESULT';

export interface ResponsiveSceneAsset {
  desktop: string;
  tablet: string;
  mobile: string;
  fallbackGradient: string;
  auroraGlow: string;
  particleType: 'SNOW' | 'GOLD_SPARKS' | 'EMBER' | 'MAGIC_RUNES';
}

export const SCENE_ASSET_REGISTRY: Record<SceneAssetKey, ResponsiveSceneAsset> = {
  PORTAL: {
    desktop: '/backgrounds/portal/portal_desktop.png',
    tablet: '/backgrounds/portal/portal_tablet.jpg',
    mobile: '/backgrounds/portal/portal_mobile.jpg',
    fallbackGradient: 'from-[#030712] via-[#050d24] to-[#030712]',
    auroraGlow: 'from-blue-600/15 via-cyan-500/20 to-amber-500/15',
    particleType: 'MAGIC_RUNES',
  },
  LOGIN: {
    desktop: '/backgrounds/portal/login_desktop.png',
    tablet: '/backgrounds/portal/login_desktop.png',
    mobile: '/backgrounds/portal/login_mobile.png',
    fallbackGradient: 'from-[#030712] via-[#0b132b] to-[#030712]',
    auroraGlow: 'from-blue-600/20 via-cyan-500/25 to-amber-500/15',
    particleType: 'MAGIC_RUNES',
  },
  GUIDE: {
    desktop: '/backgrounds/portal/guide-academy/academy_guide_desktop.png',
    tablet: '/backgrounds/portal/guide-academy/academy_guide_desktop.png',
    mobile: '/backgrounds/portal/guide-academy/academy_guide_mobile.png',
    fallbackGradient: 'from-[#030712] via-[#050d24] to-[#030712]',
    auroraGlow: 'from-sky-600/20 via-cyan-400/25 to-blue-600/15',
    particleType: 'MAGIC_RUNES',
  },
  TERRITORY: {
    desktop: '/backgrounds/portal/territory_desktop.jpg',
    tablet: '/backgrounds/portal/territory_tablet.jpg',
    mobile: '/backgrounds/portal/territory_mobile.jpg',
    fallbackGradient: 'from-[#030712] via-[#051129] to-[#030712]',
    auroraGlow: 'from-cyan-500/20 via-blue-600/25 to-amber-400/15',
    particleType: 'MAGIC_RUNES',
  },
  ARCTIC_HERO_SELECT: {
    desktop: '/backgrounds/arctic/hero-select/arctic_hero_select_panel_20260922.png',
    tablet: '/backgrounds/arctic/hero-select/arctic_hero_select_approved_mobile.png',
    mobile: '/backgrounds/arctic/hero-select/arctic_hero_select_approved_mobile.png',
    fallbackGradient: 'from-[#030712] via-[#051129] to-[#030712]',
    auroraGlow: 'from-cyan-500/20 via-blue-600/25 to-amber-400/15',
    particleType: 'MAGIC_RUNES',
  },
  ARCTIC_MAP: {
    desktop: '/backgrounds/arctic/map/arctic_map_desktop.jpg',
    tablet: '/backgrounds/arctic/map/arctic_map_desktop.jpg',
    mobile: '/backgrounds/arctic/map/arctic_map_desktop.jpg',
    fallbackGradient: 'from-[#030712]/95 via-[#03203c]/40 to-[#030712]/95',
    auroraGlow: 'from-teal-500/15 via-cyan-400/25 to-blue-500/15',
    particleType: 'SNOW',
  },
  ARCTIC_DOJO: {
    desktop: '/backgrounds/arctic/dojo/arctic_dojo_desktop.jpg',
    tablet: '/backgrounds/arctic/dojo/arctic_dojo_desktop.jpg',
    mobile: '/backgrounds/arctic/dojo/arctic_dojo_desktop.jpg',
    fallbackGradient: 'from-[#020617] via-[#082f49]/30 to-[#020617]',
    auroraGlow: 'from-cyan-500/20 via-sky-400/25 to-blue-600/15',
    particleType: 'SNOW',
  },
  ARCTIC_FARMING: {
    desktop: '/backgrounds/arctic/farming/arctic_farming_desktop.jpg',
    tablet: '/backgrounds/arctic/farming/arctic_farming_desktop.jpg',
    mobile: '/backgrounds/arctic/farming/arctic_farming_desktop.jpg',
    fallbackGradient: 'from-[#020617] via-[#03243b]/40 to-[#020617]',
    auroraGlow: 'from-amber-400/20 via-yellow-300/25 to-cyan-500/15',
    particleType: 'GOLD_SPARKS',
  },
  ARCTIC_ONET: {
    desktop: '/backgrounds/arctic/onet/arctic_onet_desktop.jpg',
    tablet: '/backgrounds/arctic/onet/arctic_onet_desktop.jpg',
    mobile: '/backgrounds/arctic/onet/arctic_onet_desktop.jpg',
    fallbackGradient: 'from-[#020617] via-[#0c1f38]/50 to-[#020617]',
    auroraGlow: 'from-blue-600/20 via-indigo-400/25 to-cyan-400/15',
    particleType: 'SNOW',
  },
  ARCTIC_GEOMETRY: {
    desktop: '/backgrounds/arctic/geometry/arctic_geometry_desktop.jpg',
    tablet: '/backgrounds/arctic/geometry/arctic_geometry_desktop.jpg',
    mobile: '/backgrounds/arctic/geometry/arctic_geometry_desktop.jpg',
    fallbackGradient: 'from-[#020617] via-[#0a233a]/50 to-[#020617]',
    auroraGlow: 'from-emerald-500/20 via-teal-400/25 to-cyan-500/15',
    particleType: 'MAGIC_RUNES',
  },
  ARCTIC_QUEST: {
    desktop: '/backgrounds/arctic/quest/arctic_quest_desktop.jpg',
    tablet: '/backgrounds/arctic/quest/arctic_quest_desktop.jpg',
    mobile: '/backgrounds/arctic/quest/arctic_quest_desktop.jpg',
    fallbackGradient: 'from-[#020617] via-[#072740]/40 to-[#020617]',
    auroraGlow: 'from-cyan-400/20 via-sky-300/20 to-blue-500/15',
    particleType: 'SNOW',
  },
  ARCTIC_ARENA: {
    desktop: '/backgrounds/arctic/arena/arctic_arena_desktop.jpg',
    tablet: '/backgrounds/arctic/arena/arctic_arena_desktop.jpg',
    mobile: '/backgrounds/arctic/arena/arctic_arena_mobile.jpg',
    fallbackGradient: 'from-[#020617] via-[#041f3d]/60 to-[#020617]',
    auroraGlow: 'from-sky-400/30 via-cyan-400/35 to-blue-600/20',
    particleType: 'SNOW',
  },
  ARCTIC_BOSS_DRAGON: {
    desktop: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
    tablet: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
    mobile: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
    fallbackGradient: 'from-[#020617] via-[#2a0808]/50 to-[#020617]',
    auroraGlow: 'from-rose-600/25 via-red-500/30 to-amber-500/20',
    particleType: 'EMBER',
  },
  ARCTIC_BOSS_GOLEM: {
    desktop: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
    tablet: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
    mobile: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
    fallbackGradient: 'from-[#020617] via-[#1a1c2e]/60 to-[#020617]',
    auroraGlow: 'from-indigo-500/25 via-blue-500/30 to-cyan-500/20',
    particleType: 'MAGIC_RUNES',
  },
  ARCTIC_BOSS_ARCHMAGE: {
    desktop: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
    tablet: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
    mobile: '/backgrounds/arctic/boss/arctic_boss_desktop.jpg',
    fallbackGradient: 'from-[#020617] via-[#22072e]/60 to-[#020617]',
    auroraGlow: 'from-purple-600/30 via-fuchsia-500/30 to-cyan-400/20',
    particleType: 'MAGIC_RUNES',
  },
  ARCTIC_FINAL: {
    desktop: '/backgrounds/arctic/final/arctic_final_desktop.jpg',
    tablet: '/backgrounds/arctic/final/arctic_final_desktop.jpg',
    mobile: '/backgrounds/arctic/final/arctic_final_desktop.jpg',
    fallbackGradient: 'from-[#020617] via-[#051833]/60 to-[#020617]',
    auroraGlow: 'from-amber-300/25 via-cyan-400/30 to-sky-500/20',
    particleType: 'GOLD_SPARKS',
  },
  ARCTIC_RESULT: {
    desktop: '/backgrounds/arctic/arena/arctic_arena_desktop.jpg',
    tablet: '/backgrounds/arctic/arena/arctic_arena_desktop.jpg',
    mobile: '/backgrounds/arctic/arena/arctic_arena_mobile.jpg',
    fallbackGradient: 'from-[#020617] via-[#06213f]/50 to-[#020617]',
    auroraGlow: 'from-cyan-400/20 via-blue-500/20 to-amber-400/20',
    particleType: 'GOLD_SPARKS',
  },
};

export function getSceneAsset(key: SceneAssetKey): ResponsiveSceneAsset {
  return SCENE_ASSET_REGISTRY[key] || SCENE_ASSET_REGISTRY.PORTAL;
}
