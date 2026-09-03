import { SupabaseAuthAdapter } from '../auth/SupabaseAuthAdapter';
import { createAuthFixture, authCredentials } from './auth-fixture';
import { MockAuthAdapter } from '../auth/MockAuthAdapter';
import { authSession, resolveAuthMode } from '../auth/session';
import { LocalAuthService } from '../services/auth-service';

async function run() {
  let passed = 0;
  function check(condition: unknown, message: string) {
    if (!condition) throw new Error(message);
    passed++; console.log(`PASS: ${message}`);
  }
  const f = createAuthFixture();
  const adapter = new SupabaseAuthAdapter(f.client);
  const legacy = { userName: 'Name', userCode: 'G6001', requestedRole: 'LEARNER' as const };
  check(!(await adapter.login(legacy)).success, 'Name/code-only login rejected');
  check(!(await adapter.login({ ...legacy, userName: '' })).success, 'Code-only login rejected');
  check(!(await adapter.login({ ...legacy, userCode: '' })).success, 'Name-only login rejected');
  check(f.state.signIns === 0 && f.state.profileReads === 0, 'No profile lookup or authentication attempted for legacy credentials');
  check(await adapter.restoreSession() === null && f.state.profileReads === 0, 'Unauthenticated profile lookup rejected before reading profiles');
  const missing = new SupabaseAuthAdapter(null);
  check(!(await missing.login(authCredentials('G6001'))).success, 'Missing configuration fails closed');
  check(await missing.restoreSession() === null, 'Missing configuration cannot restore user');
  check(!(await adapter.login({ ...authCredentials('G6001'), password: 'wrong' })).success, 'Wrong password rejected');
  let result = await adapter.login(authCredentials('G6001'));
  check(result.success && result.user?.displayName === 'Verified G6001', 'Verified database identity replaces user-supplied name');
  check(f.state.lastFilter?.[0] === 'auth_user_id', 'Profile resolved by authenticated principal only');
  const studentAId = result.user?.id;
  check((await adapter.restoreSession())?.id === studentAId, 'Reload restoration validates server identity');
  const secondAdapter = new SupabaseAuthAdapter(f.client);
  check(secondAdapter.getCurrentUser() === null && (await secondAdapter.restoreSession())?.id === studentAId, 'New adapter requires validation before restoring');
  await adapter.logout();
  check(adapter.getCurrentUser() === null && await adapter.restoreSession() === null, 'Logout clears identity and prevents restoration');
  result = await adapter.login(authCredentials('G6002'));
  check(result.success && result.user?.id !== studentAId && result.user?.userCode === 'G6002', 'Same client switches A to B without retaining A identity');
  f.state.failVerification = true;
  check(await adapter.restoreSession() === null, 'Revoked server session invalidates previous user');
  check(!(await adapter.login(authCredentials('G6001'))).success, 'Password response alone cannot bypass getUser verification');
  f.state.failVerification = false;
  f.state.wrongProfileLink = true;
  check(!(await adapter.login(authCredentials('G6001'))).success, 'Mismatched Auth/profile link rejected');
  f.state.wrongProfileLink = false;
  f.state.denyProfile = true;
  check(!(await adapter.login(authCredentials('G6001'))).success, 'Missing or RLS-denied linked profile rejected');
  f.state.denyProfile = false;
  f.state.wrongOrganization = true;
  check(!(await adapter.login(authCredentials('PROF001', 'PROFESSOR'))).success, 'Membership from another organization cannot grant role');
  f.state.wrongOrganization = false;
  f.state.missingMembership = true;
  check(!(await adapter.login(authCredentials('G6001'))).success, 'Missing membership cannot default to learner');
  f.state.missingMembership = false;
  for (const code of ['DIS001', 'EXP001']) check(!(await adapter.login(authCredentials(code))).success, `${code} inactive account rejected`);
  check(!(await adapter.login(authCredentials('PROF001'))).success, 'Teacher cannot request student identity');
  for (const code of ['PROF001', 'PROF002', 'ADM001']) {
    check((await adapter.login(authCredentials(code, 'PROFESSOR'))).success, `${code} verified role supported (classroom RLS not simulated)`);
  }
  f.state.throwNetwork = true;
  check(!(await adapter.login(authCredentials('G6001'))).success && adapter.getCurrentUser() === null, 'Network failure cannot fall back to demo identity');
  f.state.throwNetwork = false;
  check((await adapter.login(authCredentials('G6001'))).success, 'Retry succeeds after network recovery');
  f.revoke();
  check(adapter.getCurrentUser() === null, 'Auth sign-out event clears runtime identity');

  await adapter.login(authCredentials('G6001'));
  let releaseVerification!: () => void;
  let verificationStarted!: () => void;
  const started = new Promise<void>(resolve => { verificationStarted = resolve; });
  f.state.pauseVerification = () => {
    verificationStarted();
    return new Promise<void>(resolve => { releaseVerification = resolve; });
  };
  const pendingRestore = adapter.restoreSession();
  await started;
  await adapter.logout();
  releaseVerification();
  check(await pendingRestore === null && adapter.getCurrentUser() === null, 'Logout invalidates an in-flight session restoration');
  f.state.pauseVerification = undefined;

  // Simulate old browser caches without allowing them to establish real identity.
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const cache = new Map<string, string>([
    ['klapanya_sb_session_cache_v1', JSON.stringify({ id: 'forged', role: 'ADMIN', status: 'ACTIVE' })],
    ['klapanya_user_session_v1', JSON.stringify({ userId: 'forged', role: 'TEACHER' })],
  ]);
  try {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem: (key: string) => cache.get(key) ?? null,
      setItem: (key: string, value: string) => cache.set(key, value),
      removeItem: (key: string) => cache.delete(key),
    } });
    const cached = new SupabaseAuthAdapter(createAuthFixture().client);
    check(cached.getCurrentUser() === null && await cached.restoreSession() === null, 'Stale cached adapter identity cannot authenticate');
    authSession.setAdapter(cached, 'supabase');
    const service = new LocalAuthService();
    check(service.getCurrentSession() === null && await service.restoreSession() === null, 'Legacy UI session cache cannot bypass verified auth');
    for (const demo of [() => service.loginAsStudent(), () => service.loginAsTeacher(), () => service.loginAsReviewer()]) {
      let rejected = false; try { await demo(); } catch { rejected = true; }
      check(rejected, 'Demo shortcut blocked in Supabase mode');
    }
    const credentials = authCredentials('G6001');
    check((await service.loginWithCredentials('Fake name', 'other-code', 'LEARNER', {
      email: credentials.email!, password: credentials.password!,
    })).success && service.getCurrentSession()?.userId.startsWith('20000000'), 'UI session derives from authenticated profile rather than entered name/code');
    check(!cache.has('klapanya_user_session_v1'), 'Real authentication does not persist a legacy UI identity cache');
    await service.logout();
    check(service.getCurrentSession() === null, 'UI wrapper clears authenticated session on logout');
  } finally {
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else Reflect.deleteProperty(globalThis, 'localStorage');
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    authSession.setAdapter(new MockAuthAdapter(), 'mock');
  }
  check((await new MockAuthAdapter().login(legacy)).success, 'Explicit mock adapter retains demo login');
  check(resolveAuthMode({ PROD: true }) === 'supabase', 'Production defaults to real auth');
  check(resolveAuthMode({ PROD: true, VITE_AUTH_MODE: 'mock' }) === 'mock', 'Production demo requires explicit mode');
  check(resolveAuthMode({ VITE_AUTH_MODE: 'typo' }) === 'supabase', 'Invalid auth mode fails toward real auth');
  console.log(`Authentication: ${passed} passed`);
}

void run();
