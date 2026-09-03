import type { PlayerProfile } from '../types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_PROFILE } from './local-storage-adapter';

export const LEGACY_SHARED_SAVE = 'klapanya_math_arctic_profile_v1';
export const freshProfile = (): PlayerProfile => JSON.parse(JSON.stringify(DEFAULT_PROFILE));
export interface ProgressRow { checkpoint: PlayerProfile; version: number }
export interface ProgressTransport {
  load(profileId: string): Promise<ProgressRow | null>;
  save(profileId: string, version: number, requestId: string, checkpoint: PlayerProfile): Promise<number>;
}
export interface OwnedProgress {
  loadProfile(): Promise<PlayerProfile>;
  saveProfile(profile: PlayerProfile): Promise<void>;
  retry(): Promise<void>;
}

export function supabaseProgressTransport(client: SupabaseClient): ProgressTransport {
  return {
    async load(profileId) {
      const { data, error } = await client.from('game_player_progress').select('checkpoint,version').eq('profile_id',profileId).maybeSingle();
      if (error) throw error;
      return data;
    },
    async save(profileId, version, requestId, checkpoint) {
      const { data, error } = await client.rpc('save_game_checkpoint', {
        p_profile_id:profileId, p_expected_version:version, p_request_id:requestId, p_checkpoint:checkpoint,
      });
      if (error) throw error;
      return Number(data);
    },
  };
}

/** Immutable owner binding prevents a delayed A request being written as B. */
export class CloudOwnedProgress implements OwnedProgress {
  private version = 0;
  private loaded = false;
  private pending: { requestId: string; checkpoint: PlayerProfile } | null = null;
  private tail: Promise<void> = Promise.resolve();
  constructor(readonly ownerId: string, private transport: ProgressTransport, private currentOwner: () => string | null) {}
  private assertOwner() {
    if (this.currentOwner() !== this.ownerId) throw new Error('Game account changed; save cancelled');
  }
  async loadProfile() {
    this.assertOwner();
    const row = await this.transport.load(this.ownerId);
    this.assertOwner();
    this.version = row?.version || 0;
    this.loaded = true;
    return row ? { ...freshProfile(), ...row.checkpoint } : freshProfile();
  }
  private async flush() {
    this.assertOwner();
    if (!this.loaded) throw new Error('Load player progress before saving');
    if (!this.pending) return;
    const pending = this.pending;
    const nextVersion = await this.transport.save(this.ownerId,this.version,pending.requestId,pending.checkpoint);
    this.assertOwner();
    this.version = nextVersion;
    this.pending = null;
  }
  saveProfile(profile: PlayerProfile): Promise<void> {
    const checkpoint = JSON.parse(JSON.stringify(profile));
    const operation = this.tail.catch(() => {}).then(async () => {
      await this.flush(); // Replay an uncertain prior request with its original ID.
      this.pending = { requestId: crypto.randomUUID(), checkpoint };
      await this.flush();
    });
    this.tail = operation;
    return operation;
  }
  retry(): Promise<void> {
    const operation = this.tail.catch(() => {}).then(() => this.flush());
    this.tail = operation;
    return operation;
  }
}

export class DemoOwnedProgress implements OwnedProgress {
  private key: string;
  constructor(ownerId: string, private storage: Pick<Storage,'getItem'|'setItem'>) {
    this.key = `klapanya_game_demo_progress_v2:${encodeURIComponent(ownerId)}`;
  }
  async loadProfile() {
    const raw = this.storage.getItem(this.key);
    return raw ? { ...freshProfile(), ...JSON.parse(raw) } : freshProfile();
  }
  async saveProfile(profile: PlayerProfile) { this.storage.setItem(this.key,JSON.stringify(profile)); }
  async retry() {}
}

// Explicit export only. No owner can automatically inherit the legacy shared save.
export function exportLegacySave(storage: Pick<Storage,'getItem'>): string | null {
  return storage.getItem(LEGACY_SHARED_SAVE);
}
