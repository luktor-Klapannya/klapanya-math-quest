import { IPersistenceAdapter } from './adapter';
import { PlayerProfile } from '../types';

const PROFILE_KEY = 'klapanya_math_arctic_profile_v1';
const TELEMETRY_KEY = 'klapanya_math_arctic_telemetry_v1';

export const DEFAULT_PROFILE: PlayerProfile = {
  heroId: 'CHRONOMANCER',
  heroName: 'ผู้กล้าคณิตศาสตร์',
  currentTerritoryId: 'FROZEN_ARCTIC',
  activePetId: 'PET_FROST_CUB',
  level: 1,
  xp: 0,
  coins: 100,
  rank: 'Novice Trainee',
  unlockedGear: [],
  materials: {
    AURORA_SHARD_I: 0,
    AURORA_SHARD_II: 0,
    AURORA_SHARD_III: 0,
    MASTER_MENTAL_CREST: 0,
  },
  clearedStages: [],
  stageStars: {},
  stageBestAccuracy: {},
  shrineBestGrades: {},
  gatewayReadiness: {},
  bossPerformanceTiers: {},
  bossPhaseCheckpoints: {},
  isFrostCoreForgeUnlocked: false,
  isTopFormUnlocked: false,
  trialBestScore: 0,
  skillMastery: {
    calculation: 0.25,
    mental_math: 0.20,
    number_sense: 0.20,
    fractions_decimals: 0.15,
    algebraic_reasoning: 0.15,
    geometry_spatial: 0.10,
    ratio_percentage_scale: 0.10,
    trap_detection: 0.20,
  },
  activeActiveSkillCooldown: 0,
};

export class LocalStorageAdapter implements IPersistenceAdapter {
  async loadProfile(): Promise<PlayerProfile | null> {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data) as PlayerProfile;
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        currentTerritoryId: parsed.currentTerritoryId || 'FROZEN_ARCTIC',
        activePetId: parsed.activePetId || 'PET_FROST_CUB',
        materials: { ...DEFAULT_PROFILE.materials, ...(parsed.materials || {}) },
        shrineBestGrades: { ...(parsed.shrineBestGrades || {}) },
        gatewayReadiness: { ...(parsed.gatewayReadiness || {}) },
        bossPerformanceTiers: { ...(parsed.bossPerformanceTiers || {}) },
        bossPhaseCheckpoints: { ...(parsed.bossPhaseCheckpoints || {}) },
      };
    } catch (e) {
      console.warn('Failed to load profile from localStorage:', e);
      return null;
    }
  }

  async saveProfile(profile: PlayerProfile): Promise<void> {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
  }

  async resetProfile(): Promise<void> {
    localStorage.removeItem(PROFILE_KEY);
  }

  async logEvent(event: Record<string, unknown>): Promise<void> {
    try {
      const current = localStorage.getItem(TELEMETRY_KEY);
      const events = current ? JSON.parse(current) : [];
      events.push({ ...event, timestamp: new Date().toISOString() });
      if (events.length > 100) events.shift();
      localStorage.setItem(TELEMETRY_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn('Telemetry log failed:', e);
    }
  }
}
