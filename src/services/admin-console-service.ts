import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthUser } from '../auth/types';
import type { AuthMode } from '../auth/session';

export interface AdminIdentity { profileId: string; principalId: string; organizationId: string }
export interface AdminRuntime {
  mode(): AuthMode;
  user(): AuthUser | null;
  subscribe(listener: () => void): () => void;
}
export type AdminClient = Pick<SupabaseClient, 'auth' | 'from'>;

// A UI role is never sufficient. Resolve the current bearer, profile and membership anew.
export async function verifyAdmin(client: AdminClient | null, runtime: AdminRuntime): Promise<AdminIdentity> {
  const expected = runtime.user();
  const unchanged = () => {
    if (runtime.mode() !== 'supabase' || !expected || expected.status !== 'ACTIVE' || runtime.user() !== expected)
      throw new Error('Real authenticated game account required.');
  };
  unchanged();
  if (!client) throw new Error('Supabase is not configured.');
  const session = await client.auth.getSession();
  unchanged();
  if (session.error || !session.data.session) throw new Error('Sign in to continue.');
  const verified = await client.auth.getUser();
  unchanged();
  if (verified.error || !verified.data.user || verified.data.user.id !== session.data.session.user.id)
    throw new Error('Session could not be verified.');
  const profile = await client.from('profiles')
    .select('id,auth_user_id,status,organization_id,memberships(role_id,organization_id)')
    .eq('auth_user_id', verified.data.user.id).maybeSingle();
  unchanged();
  const p = profile.data;
  if (profile.error || !p || p.id !== expected!.id || p.auth_user_id !== verified.data.user.id ||
      p.status !== 'ACTIVE' || !p.organization_id || p.organization_id !== expected!.organizationId ||
      !p.memberships?.some((m: { role_id: string; organization_id: string }) =>
        m.role_id === 'ADMIN' && m.organization_id === p.organization_id))
    throw new Error('An active ADMIN membership in this organization is required.');
  return { profileId: p.id, principalId: verified.data.user.id, organizationId: p.organization_id };
}

type AccessState = { status: 'checking' | 'denied'; message?: string } | { status: 'allowed'; identity: AdminIdentity };
// Synchronous invalidation makes stale async work unable to reopen a closed boundary.
export class AdminAccessController {
  private state: AccessState = { status: 'checking' };
  private revision = 0;
  private listeners = new Set<() => void>();
  constructor(private client: AdminClient | null, private runtime: AdminRuntime) {}
  snapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(state: AccessState) { this.state = state; this.listeners.forEach(f => f()); }
  invalidate = () => { this.revision++; this.publish({ status: 'denied', message: 'Account changed. Please sign in again.' }); };
  async validate() {
    const revision = ++this.revision;
    this.publish({ status: 'checking' });
    try {
      const identity = await verifyAdmin(this.client, this.runtime);
      if (revision === this.revision) this.publish({ status: 'allowed', identity });
    } catch {
      if (revision === this.revision) this.publish({ status: 'denied', message: 'Admin access could not be verified. Use a real authorized game account.' });
    }
  }
  start() {
    const stopRuntime = this.runtime.subscribe(this.invalidate);
    const auth = this.client?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED' ||
          (this.state.status === 'allowed' && session?.user.id !== this.state.identity.principalId)) this.invalidate();
    });
    void this.validate();
    return () => { this.revision++; stopRuntime(); auth?.data.subscription.unsubscribe(); };
  }
}

export interface AdminData {
  profiles: { id: string; user_code: string; display_name: string; status: string }[];
  memberships: { profile_id: string; role_id: string }[];
  roles: { id: string; name: string }[];
}
export async function loadAdminData(client: AdminClient, runtime: AdminRuntime, expected: AdminIdentity): Promise<AdminData> {
  const user = runtime.user();
  const check = () => { if (runtime.mode() !== 'supabase' || !user || runtime.user() !== user) throw new Error('Account changed.'); };
  const identity = await verifyAdmin(client, runtime);
  check();
  if (identity.profileId !== expected.profileId || identity.principalId !== expected.principalId || identity.organizationId !== expected.organizationId)
    throw new Error('Admin scope changed.');
  async function read(table: 'profiles' | 'memberships' | 'roles', columns: string) {
    const rows: any[] = [];
    for (let offset = 0; ; offset += 500) {
      check();
      let query = client.from(table).select(columns).order('id');
      if (table !== 'roles') query = query.eq('organization_id', identity.organizationId);
      const result = await query.range(offset, offset + 499);
      check();
      if (result.error || !result.data) throw new Error('Authorized data unavailable.');
      rows.push(...result.data);
      if (result.data.length < 500) return rows;
    }
  }
  const [profiles, memberships, roles] = await Promise.all([
    read('profiles', 'id,user_code,display_name,status'),
    read('memberships', 'id,profile_id,role_id'), read('roles', 'id,name'),
  ]);
  check();
  return { profiles, memberships, roles };
}
