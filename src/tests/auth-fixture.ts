import type { GameAuthClient } from '../auth/SupabaseAuthAdapter';
import type { LoginCredentials, UserRole } from '../auth/types';

// Test-only accounts; this module is never imported by application authentication.
const accounts = [
  ['G6001', 'LEARNER', 'ACTIVE', 'P6-1'],
  ['G6002', 'LEARNER', 'ACTIVE', 'P6-2'],
  ['PROF001', 'PROFESSOR', 'ACTIVE', ''],
  ['PROF002', 'PROFESSOR', 'ACTIVE', ''],
  ['ADM001', 'ADMIN', 'ACTIVE', ''],
  ['DIS001', 'LEARNER', 'DISABLED', 'P6-1'],
  ['EXP001', 'LEARNER', 'EXPIRED', 'P6-1'],
];

export function authCredentials(code: string, role: UserRole = 'LEARNER'): LoginCredentials {
  return { userName: 'Untrusted display input', userCode: code, requestedRole: role,
    email: `${code.toLowerCase()}@example.test`, password: 'test-only-password' };
}

export function createAuthFixture() {
  let activeCode: string | null = null;
  const listeners: Array<(event: string, session: unknown) => void> = [];
  const state = {
    signIns: 0, verifications: 0, profileReads: 0,
    failVerification: false, throwNetwork: false, denyProfile: false,
    wrongProfileLink: false, wrongOrganization: false, missingMembership: false,
    lastFilter: null as null | [string, unknown],
    pauseVerification: undefined as undefined | (() => Promise<void>),
  };
  const index = () => accounts.findIndex(a => a[0] === activeCode);
  const principal = () => index() < 0 ? null : { id: `10000000-0000-0000-0000-${String(index() + 1).padStart(12, '0')}` };
  const client = {
    auth: {
      onAuthStateChange(callback: (event: string, session: unknown) => void) {
        listeners.push(callback);
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        state.signIns++;
        if (state.throwNetwork) throw new Error('Test network failure');
        const account = accounts.find(a => `${a[0].toLowerCase()}@example.test` === email);
        activeCode = account && password === 'test-only-password' ? account[0] : null;
        const user = principal();
        return { data: { user, session: user ? { user, access_token: 'test-token' } : null }, error: user ? null : new Error('Invalid credentials') };
      },
      async getUser() {
        state.verifications++;
        const user = principal();
        await state.pauseVerification?.();
        if (state.throwNetwork) throw new Error('Test network failure');
        return { data: { user: state.failVerification ? null : user }, error: state.failVerification ? new Error('Session revoked') : null };
      },
      async signOut() {
        activeCode = null;
        listeners.forEach(listener => listener('SIGNED_OUT', null));
        return { error: null };
      },
    },
    from(table: string) {
      if (table !== 'profiles') throw new Error('Unexpected table');
      return { select() { return { eq(column: string, value: unknown) {
        state.lastFilter = [column, value];
        return { async maybeSingle() {
          state.profileReads++;
          const row = accounts[index()];
          if (!row || state.denyProfile || column !== 'auth_user_id' || value !== principal()?.id) return { data: null, error: null };
          return { data: {
            id: `20000000-0000-0000-0000-${String(index() + 1).padStart(12, '0')}`,
            auth_user_id: state.wrongProfileLink ? 'unrelated-principal' : principal()?.id,
            user_code: row[0], display_name: `Verified ${row[0]}`, status: row[2],
            organization_id: 'ORG_KLAPANYA', classroom_id: row[3], academic_year: '2569',
            created_at: '2026-01-01T00:00:00Z',
            memberships: state.missingMembership ? [] : [{ role_id: row[1],
              organization_id: state.wrongOrganization ? 'OTHER_ORG' : 'ORG_KLAPANYA' }],
          }, error: null };
        } };
      } }; } };
    },
  };
  return { client: client as unknown as GameAuthClient, state,
    revoke() { activeCode = null; listeners.forEach(listener => listener('SIGNED_OUT', null)); } };
}
