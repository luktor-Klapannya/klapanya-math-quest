// @ts-expect-error Node-only test utility; application compilation uses DOM types.
import { readFileSync } from 'node:fs';
import { AdminAccessController, verifyAdmin, loadAdminData, type AdminClient, type AdminRuntime } from '../services/admin-console-service';
import type { AuthUser, UserRole } from '../auth/types';
import { SupabaseAuthAdapter } from '../auth/SupabaseAuthAdapter';
import { createAuthFixture, authCredentials } from './auth-fixture';
import {entryScreen} from '../services/entry-path';

let passed = 0;
function check(value: unknown, label: string) { if (!value) throw new Error(label); passed++; console.log(`PASS: ${label}`); }
async function rejects(task: Promise<unknown>, label: string) { let failed = false; try { await task; } catch { failed = true; } check(failed, label); }
function fixture(role: UserRole = 'ADMIN') {
  let user: AuthUser | null = {id:'profile-a',userCode:'A',displayName:'Test',role,status:'ACTIVE',organizationId:'ORG',createdAt:''};
  let mode: 'mock' | 'supabase' = 'supabase';
  let pause: (() => Promise<void>) | undefined;
  let missingSession = false;
  let principal = 'auth-a';
  let dbRole: UserRole = role;
  let dbOrg = 'ORG';
  let active = true;
  let failure = false;
  const scopes: string[] = [];
  const listeners = new Set<() => void>();
  const authListeners = new Set<(event: string, session: any) => void>();
  const runtime: AdminRuntime = {mode:()=>mode,user:()=>user,subscribe:f=>{listeners.add(f);return()=>{listeners.delete(f);};}};
  const client = { auth: {
    getSession: async()=>({data:{session:missingSession?null:{user:{id:principal},access_token:'fake-test-token'}},error:null}),
    getUser: async()=>{const id=principal;await pause?.();return {data:{user:{id}},error:failure?new Error('private server detail'):null};},
    onAuthStateChange: (f: (event:string,session:any)=>void)=>{authListeners.add(f);return {data:{subscription:{unsubscribe:()=>authListeners.delete(f)}}};},
  }, from(table:string) {
    const query = {
      select(_columns:string){return query;}, order(_column:string){return query;},
      eq(column:string,value:string){scopes.push(`${table}:${column}:${value}`);return query;},
      async maybeSingle(){return {data:{id:'profile-a',auth_user_id:principal,status:active?'ACTIVE':'DISABLED',organization_id:dbOrg,memberships:[{role_id:dbRole,organization_id:dbOrg}]},error:null};},
      async range(){return {data:table==='profiles'?[{id:'profile-a',display_name:'Test',user_code:'A',status:'ACTIVE'}]:table==='memberships'?[{profile_id:'profile-a',role_id:'ADMIN'}]:[{id:'ADMIN',name:'Admin'}],error:failure?new Error('private detail'):null};},
    };return query;
  }} as unknown as AdminClient;
  return {client,runtime,scopes,setMode:()=>{mode='mock';},setInactive:()=>{active=false;},setDbRole:(r:UserRole)=>{dbRole=r;},setOrg:()=>{dbOrg='OTHER';},
    setMissing:()=>{missingSession=true;},setFailure:()=>{failure=true;},setPause:(p:()=>Promise<void>)=>{pause=p;},
    logout:()=>{user=null;listeners.forEach(f=>f());authListeners.forEach(f=>f('SIGNED_OUT',null));},
    switchUser:()=>{user={...user!,id:'profile-b'};principal='auth-b';listeners.forEach(f=>f());},
    switchPrincipal:()=>{principal='auth-b';authListeners.forEach(f=>f('SIGNED_IN',{user:{id:principal}}));},
  };
}
async function run() {
  const admin=fixture();
  const identity=await verifyAdmin(admin.client,admin.runtime);
  check(identity.profileId==='profile-a'&&identity.organizationId==='ORG','Real verified ADMIN is allowed');
  for(const role of ['LEARNER','PROFESSOR','EXTERNAL_LEARNER','EXTERNAL_PROFESSOR','REVIEWER_DEV'] as UserRole[]) {
    const f=fixture(role);await rejects(verifyAdmin(f.client,f.runtime),`${role} without ADMIN membership denied`);
  }
  const reviewer=fixture('REVIEWER_DEV');reviewer.setDbRole('ADMIN');
  check(!!await verifyAdmin(reviewer.client,reviewer.runtime),'Database ADMIN membership, not selected UI role, establishes authority');
  const fakeLabel=fixture();fakeLabel.setDbRole('PROFESSOR');await rejects(verifyAdmin(fakeLabel.client,fakeLabel.runtime),'Forged ADMIN UI label denied');
  for(const [label,change] of [
    ['mock ADMIN', (f:ReturnType<typeof fixture>)=>f.setMode()],
    ['inactive profile',(f:ReturnType<typeof fixture>)=>f.setInactive()],
    ['missing session',(f:ReturnType<typeof fixture>)=>f.setMissing()],
    ['wrong organization',(f:ReturnType<typeof fixture>)=>f.setOrg()],
    ['failed server validation',(f:ReturnType<typeof fixture>)=>f.setFailure()],
    ['missing runtime identity',(f:ReturnType<typeof fixture>)=>f.logout()],
  ] as const){const f=fixture();change(f);await rejects(verifyAdmin(f.client,f.runtime),`${label} denied`);}
  await rejects(verifyAdmin(null,admin.runtime),'Missing Supabase configuration denied');
  const data=await loadAdminData(admin.client,admin.runtime,identity);
  check(data.profiles.length===1&&data.memberships.length===1,'Read-only organization data loads');
  check(admin.scopes.includes('profiles:organization_id:ORG')&&admin.scopes.includes('memberships:organization_id:ORG'),'Profile and membership queries carry explicit organization filters');
  await rejects(loadAdminData(admin.client,admin.runtime,{...identity,organizationId:'OTHER'}),'Console cannot change authorized organization');
  for(const action of ['logout','switchUser','switchPrincipal'] as const){
    const f=fixture();const c=new AdminAccessController(f.client,f.runtime);const stop=c.start();await c.validate();
    check(c.snapshot().status==='allowed',`${action}: initial authorized state`);f[action]();
    check(c.snapshot().status==='denied',`${action}: Admin content invalidated synchronously`);stop();
  }
  const stale=fixture();let release!:()=>void;stale.setPause(()=>new Promise<void>(r=>{release=r;}));
  const c=new AdminAccessController(stale.client,stale.runtime);const stop=c.start();
  await new Promise(r=>setTimeout(r,0));
  check(c.snapshot().status==='checking','Direct Admin entry is closed while async validation is unresolved');
  stale.logout();release();await new Promise(r=>setTimeout(r,0));
  check(c.snapshot().status==='denied','Stale asynchronous validation cannot restore access after logout');stop();
  const changed=fixture();let resume!:()=>void;changed.setPause(()=>new Promise<void>(r=>{resume=r;}));
  const request=verifyAdmin(changed.client,changed.runtime);await new Promise(r=>setTimeout(r,0));changed.switchUser();resume();
  await rejects(request,'Account change during validation rejected');
  const missing=fixture();missing.setMissing();const direct=new AdminAccessController(missing.client,missing.runtime);await direct.validate();
  check(direct.snapshot().status==='denied','Direct Admin access without verified session denied');

  // Wiring assertions complement the executable authorization/lifecycle tests.
  const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
  const landing=readFileSync(new URL('../ui/screens/LandingScreen.tsx',import.meta.url),'utf8');
  check(app.includes('onGoToStaffLogin={enterAdmin}'),'Landing logo converges on pathname-aware Admin entry');
  check(app.includes("onGoToStudentLogin={() => setCurrentScreen('STUDENT_LOGIN')}")&&app.includes("onGoToTeacherLogin={() => setCurrentScreen('TEACHER_LOGIN')}"),'Existing Learner and Teacher entry destinations retained');
  check(landing.includes('type="button" onClick={onGoToStaffLogin}')&&landing.includes('min-h-[44px]')&&landing.includes('focus-visible:outline'),'Staff entry uses native keyboard/touch button with focus treatment');
  check(app.includes('<AdminAccessGuard onExit={returnToLanding}')&&app.includes('if(!authReady)return'),'Direct Admin waits for restoration and renders behind guard');
  check(entryScreen('/')==='LANDING','Root always resolves to public Landing');
  check(entryScreen('/admin')==='ADMIN_CONSOLE'&&entryScreen('/admin/')==='ADMIN_CONSOLE','Direct and trailing-slash Admin paths resolve consistently');
  check(entryScreen('/administrator')==='LANDING','Unrelated paths cannot masquerade as Admin entry');
  check(entryScreen('/admin')===entryScreen('/admin'),'Refresh resolves same Admin destination independently of UI state');
  check(app.includes("window.history.replaceState(null,'','/')")&&app.includes('setSession(null); returnToLanding();'),'Admin logout clears privileged screen and URL');
  check(app.includes("window.addEventListener('popstate',changed)"),'Back/forward re-resolves entry destination');
  check(app.includes('initialRole="ADMIN" lockRole'),'Staff login reuses locked ADMIN intent');
  check(app.includes("currentScreen === 'REVIEW_HUB' && authSession.can('ACCESS_REVIEW_HUB')"),'Review Hub render enforces existing permission');
  check(app.includes('<VerifiedCampaignGate')&&app.includes('<VerifiedCampaignResult'),'Existing trusted gameplay boundaries retained');
  for(const [code,role] of [['G6001','LEARNER'],['PROF001','PROFESSOR'],['ADM001','ADMIN']] as const){
    const f=createAuthFixture();const a=new SupabaseAuthAdapter(f.client);
    check((await a.login(authCredentials(code,role))).user?.role===role,`${role} existing login remains valid`);
  }
  console.log(`Admin entry: ${passed} checks passed. Local fake-client tests only; hosted authorization unverified.`);
}
void run().catch(error=>{console.error(error);(globalThis as any).process.exitCode=1;});
