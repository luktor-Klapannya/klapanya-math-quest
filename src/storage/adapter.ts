import { PlayerProfile } from '../types';

export interface IPersistenceAdapter {
  loadProfile(): Promise<PlayerProfile | null>;
  saveProfile(profile: PlayerProfile): Promise<void>;
  resetProfile(): Promise<void>;
  logEvent(event: Record<string, unknown>): Promise<void>;
}
