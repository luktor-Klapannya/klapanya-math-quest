// Real hosted staging only. No fixture adapter, service key, account creation or migration apply.
import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
const env=process.env;
const actors=['STUDENT_A','STUDENT_B','ASSIGNED_TEACHER','UNASSIGNED_TEACHER','ADMIN'];
const required=['VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','GAME_STAGING_PROJECT_REF','GAME_PRODUCTION_PROJECT_REF','GAME_STAGING_APP_ORIGIN','GAME_STUDENT_A_SESSION_ID',
  ...actors.flatMap(a=>[`GAME_${a}_EMAIL`,`GAME_${a}_PASSWORD`,`GAME_${a}_PROFILE_ID`])];
const missing=required.filter(k=>!env[k]);
if(missing.length){console.error(`BLOCK: missing configuration keys: ${missing.join(', ')}`);process.exit(2);}
const url=new URL(env.VITE_SUPABASE_URL);
const key=env.VITE_SUPABASE_ANON_KEY;
if(env.VITE_AUTH_MODE!=='supabase'||url.href!==`https://${env.GAME_STAGING_PROJECT_REF}.supabase.co/`
  ||env.GAME_STAGING_PROJECT_REF===env.GAME_PRODUCTION_PROJECT_REF)throw new Error('BLOCK: explicit separate staging project and real auth required');
if(key.startsWith('sb_secret_')||(key.split('.').length===3&&JSON.parse(Buffer.from(key.split('.')[1],'base64url')).role!=='anon'))throw new Error('BLOCK: browser key must be publishable/anon');
if(new Set(actors.map(a=>env[`GAME_${a}_PROFILE_ID`])).size!==5)throw new Error('BLOCK: five distinct profiles required');
const clients=[];const sessions={};let passed=0;
const check=(value,label)=>{if(!value)throw new Error(`BLOCK: ${label}`);passed++;console.log(`PASS: ${label}`);};
function client(){const c=createClient(url.href,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});clients.push(c);return c;}
async function login(actor,c=client()){
  const {data,error}=await c.auth.signInWithPassword({email:env[`GAME_${actor}_EMAIL`],password:env[`GAME_${actor}_PASSWORD`]});
  check(!error&&!!data.session,`${actor} password authentication`);
  const verified=await c.auth.getUser();check(!verified.error&&verified.data.user?.id===data.user.id,`${actor} server identity validation`);
  const profile=await c.from('profiles').select('id,status').eq('auth_user_id',data.user.id).single();
  check(!profile.error&&profile.data?.id===env[`GAME_${actor}_PROFILE_ID`]&&profile.data.status==='ACTIVE',`${actor} expected active profile link`);
  const roles=await c.from('memberships').select('role_id').eq('profile_id',profile.data.id);
  const expected=actor.startsWith('STUDENT')?['LEARNER','EXTERNAL_LEARNER']:actor==='ADMIN'?['ADMIN']:['PROFESSOR','EXTERNAL_PROFESSOR'];
  check(!roles.error&&roles.data.some(r=>expected.includes(r.role_id)),`${actor} expected database role`);
  sessions[actor]=data.session;return c;
}
try{
  const byActor={};for(const actor of actors)byActor[actor]=await login(actor);
  const aId=env.GAME_STUDENT_A_PROFILE_ID,bId=env.GAME_STUDENT_B_PROFILE_ID;
  for(const actor of actors){
    const allowed=['STUDENT_A','ASSIGNED_TEACHER','ADMIN'].includes(actor);
    for(const table of ['game_player_progress','game_sessions']){
      const read=await byActor[actor].from(table).select('*').eq('profile_id',aId);
      check(!read.error&&(allowed?read.data.length>0:read.data.length===0),`${actor} ${table} access to A`);
    }
  }
  const bRead=await byActor.STUDENT_A.from('game_player_progress').select('profile_id').eq('profile_id',bId);
  check(!bRead.error&&bRead.data.length===0,'A cannot read B checkpoint');
  const verifiedSession=env.GAME_STUDENT_A_SESSION_ID;
  for(const actor of actors){
    const allowed=['STUDENT_A','ASSIGNED_TEACHER','ADMIN'].includes(actor);
    const result=await byActor[actor].from('game_session_results').select('session_id,result').eq('session_id',verifiedSession);
    check(!result.error&&(allowed?result.data.length===1:result.data.length===0),`${actor} verified-result visibility`);
    const lifecycle=await byActor[actor].from('game_campaign_runs').select('status').eq('id',verifiedSession);
    check(!lifecycle.error&&(allowed?lifecycle.data[0]?.status==='COMPLETED':lifecycle.data.length===0),`${actor} completed campaign visibility`);
  }
  const attempts=await byActor.STUDENT_A.from('game_question_attempts').select('response').eq('session_id',verifiedSession).order('ordinal');
  check(!attempts.error&&attempts.data.length>=30,'Real played campaign retains canonical response evidence');
  const apiOrigin=new URL(env.VITE_GAME_API_BASE_URL||env.GAME_STAGING_APP_ORIGIN);
  check(apiOrigin.protocol==='https:','Hosted campaign API requires HTTPS');
  const duplicate=await fetch(new URL('/game-api/campaign/verify',apiOrigin),{method:'POST',headers:{authorization:`Bearer ${sessions.STUDENT_A.access_token}`,'content-type':'application/json'},body:JSON.stringify({sessionId:verifiedSession,attempts:attempts.data.map(r=>r.response)})});
  check(duplicate.ok,'Real campaign API accepts identical response retry');
  const receipt=await duplicate.json();check(receipt.sessionId===verifiedSession&&!!receipt.result,'Retry returns persisted verified receipt');
  const ledger=await byActor.STUDENT_A.from('game_reward_ledger').select('session_id').eq('session_id',verifiedSession);
  check(!ledger.error&&ledger.data.length===1,'Real campaign retry retains exactly one reward ledger entry');
  const second=await login('STUDENT_A');
  const firstRead=await byActor.STUDENT_A.from('game_player_progress').select('*').eq('profile_id',aId).single();
  const secondRead=await second.from('game_player_progress').select('*').eq('profile_id',aId).single();
  check(!firstRead.error&&!secondRead.error&&JSON.stringify(firstRead.data.checkpoint)===JSON.stringify(secondRead.data.checkpoint),'Independent real sessions load identical saved A progress');
  const sameBrowser=await login('STUDENT_A');await sameBrowser.auth.signOut({scope:'local'});await login('STUDENT_B',sameBrowser);
  const switched=await sameBrowser.from('game_player_progress').select('profile_id').eq('profile_id',aId);
  check(!switched.error&&switched.data.length===0,'Reused client after logout/login cannot read prior owner');
  const reloaded=client();const restored=await reloaded.auth.setSession(sessions.STUDENT_A);
  check(!restored.error&&!!(await reloaded.auth.getUser()).data.user,'Real session reload validates with Auth server');
  await reloaded.auth.signOut({scope:'local'});
  check(!(await reloaded.auth.getUser()).data.user,'Signed-out client has no validated user');
  if(env.GAME_STAGING_ALLOW_TEST_WRITES==='YES'){
    // Rewrites identical checkpoint content only, on the explicitly designated test profile.
    const fresh=await byActor.STUDENT_A.from('game_player_progress').select('*').eq('profile_id',aId).single();
    check(!fresh.error&&!!fresh.data,'A played and saved a checkpoint before write tests');
    const args={p_profile_id:aId,p_expected_version:fresh.data.version,p_request_id:randomUUID(),p_checkpoint:fresh.data.checkpoint};
    const save=await byActor.STUDENT_A.rpc('save_game_checkpoint',args);check(!save.error,'Owner checkpoint commit');
    // Intentionally ignore first response, then retry the exact request (lost-response scenario).
    const retry=await byActor.STUDENT_A.rpc('save_game_checkpoint',args);check(!retry.error&&retry.data===save.data,'Exact lost-response retry is idempotent');
    const stale=await second.rpc('save_game_checkpoint',{...args,p_request_id:randomUUID()});check(!!stale.error,'Second session stale save rejected');
    for(const actor of ['STUDENT_B','ASSIGNED_TEACHER','UNASSIGNED_TEACHER','ADMIN']){
      const forged=await byActor[actor].rpc('save_game_checkpoint',{...args,p_request_id:randomUUID(),p_expected_version:save.data});check(!!forged.error,`${actor} cannot save as A`);
    }
    for(const actor of actors){
      const forged=await byActor[actor].rpc('commit_verified_game_result',{p_session_id:randomUUID(),p_expected_version:0,p_result:{},p_rewards:{},p_next_state:{},p_validator_version:'forged'});
      check(forged.error?.code==='42501',`${actor} cannot invoke service-only verified commit`);
    }
  }else console.log('REVIEW: mutation/idempotency checks skipped; set GAME_STAGING_ALLOW_TEST_WRITES=YES on designated staging profiles');
  console.log(`Hosted API checks: ${passed} passed. Physical devices/browser rendering, revoked-token expiry and Realtime still require the runbook. This is not a production approval.`);
}catch(error){console.error(error instanceof Error?error.message:'BLOCK: hosted validation failed');process.exitCode=1;}
finally{for(const c of clients){await c.auth.signOut({scope:'local'}).catch(()=>{});}}
