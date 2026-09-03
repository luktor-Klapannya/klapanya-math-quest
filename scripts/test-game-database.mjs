import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';

// Entirely in memory. No URL, credentials, network, or Production connection.
const db = new PGlite();
let passed = 0;
const id = n => `10000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const profile = n => `00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const uuid = n => `30000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
function check(value, message) { if (!value) throw new Error(message); passed++; console.log(`PASS: ${message}`); }
async function as(n, sql, args = [], role = 'authenticated') {
  await db.exec('BEGIN');
  try {
    await db.exec(`SET LOCAL ROLE ${role}`);
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,true)",[n ? id(n) : '']);
    const result = await db.query(sql,args);
    await db.exec('COMMIT');
    return result.rows;
  } catch (error) { await db.exec('ROLLBACK'); throw error; }
}
async function denied(n,sql,args,message,role) {
  let rejected = false;
  try { await as(n,sql,args,role); } catch { rejected = true; }
  check(rejected,message);
}

try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
    $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
    GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated,service_role;
    CREATE SCHEMA storage;
    CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    CREATE TABLE storage.objects(id uuid DEFAULT gen_random_uuid(),bucket_id text,name text);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA storage TO anon,authenticated;
    GRANT SELECT,INSERT,UPDATE,DELETE ON storage.objects TO anon,authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon,authenticated,service_role;
  `);
  const migrations = [
    '001_auth_profiles.sql','002_roles_permissions.sql','003_memberships_enrollments.sql',
    '004_rls_policies.sql','005_seed_dev.sql','006_arena_realtime.sql',
    '007_game_identity_persistence.sql','008_game_arena_security.sql','009_game_arena_submission.sql','010_game_campaign_verification.sql','011_backend_workspace.sql','012_backend_pilot_operations.sql','013_arctic_visual_configuration.sql',
  ];
  for (const file of migrations) {
    const sql = await readFile(new URL(`../supabase/migrations/${file}`,import.meta.url),'utf8');
    // PGlite has no replication transport. All table, function, grant and RLS SQL is executed unchanged.
    await db.exec(sql.replace(/^ALTER PUBLICATION supabase_realtime ADD TABLE .*;$/gm,''));
    check(true,`Migration ${file} applied in disposable PostgreSQL`);
  }
  check((await db.query('SELECT id FROM profiles')).rows.length===0,'Normal migrations create no demo profiles');
  const developmentSeed=await readFile(new URL('../supabase/seeds/development.sql',import.meta.url),'utf8');
  let seedBlocked=false;try {await db.exec(developmentSeed);}catch{seedBlocked=true;}
  check(seedBlocked,'Development seed refuses execution without local-only opt-in');
  await db.exec("SET game.allow_development_seed='LOCAL_DISPOSABLE_ONLY'");
  await db.exec(developmentSeed);
  for (let n=1;n<=5;n++) {
    await db.query('INSERT INTO auth.users VALUES ($1)',[id(n)]);
    await db.query('UPDATE profiles SET auth_user_id=$1 WHERE id=$2',[id(n),profile(n)]);
  }
  await db.query(`INSERT INTO auth.users VALUES ($1),($2)`,[id(6),id(7)]);
  await db.exec("INSERT INTO organizations(id,name) VALUES ('OTHER','Other')");
  await db.query(`INSERT INTO profiles(id,auth_user_id,user_code,display_name,organization_id,classroom_id)
    VALUES ($1,$2,'OTHER_TEACHER','Unassigned','ORG_KLAPANYA',NULL),($3,$4,'OTHER_STUDENT','Other student','OTHER','P6-1')`,
    [profile(6),id(6),profile(7),id(7)]);
  await db.query(`INSERT INTO memberships(profile_id,organization_id,role_id) VALUES
    ($1,'ORG_KLAPANYA','PROFESSOR'),($2,'OTHER','LEARNER')`,[profile(6),profile(7)]);
  await db.query("INSERT INTO classroom_enrollments(organization_id,classroom_id,learner_profile_id) VALUES ('OTHER','P6-1',$1)",[profile(7)]);

  check((await as(2,'SELECT id FROM profiles WHERE id=$1',[profile(3)])).length===0,'Student A cannot read B profile');
  check((await as(1,'SELECT id FROM profiles WHERE id=$1',[profile(2)])).length===1,'Assigned teacher reads enrolled student');
  check((await as(6,'SELECT id FROM profiles WHERE id=$1',[profile(2)])).length===0,'Unassigned teacher cannot read student');
  await denied(2,"UPDATE profiles SET organization_id='OTHER' WHERE id=$1",[profile(2)],'Self organization change rejected');
  await denied(2,"UPDATE profiles SET status='DISABLED' WHERE id=$1",[profile(2)],'Self status change rejected');
  check((await as(2,"UPDATE profiles SET display_name='Student A' WHERE id=$1 RETURNING id",[profile(2)])).length===1,'Own display update still works');

  const save = 'SELECT save_game_checkpoint($1, $2, $3, $4) AS version';
  const state = { xp:10, coins:100 };
  check((await as(2,save,[profile(2),0,uuid(1),state]))[0].version===1,'Owner checkpoint saves');
  check((await as(2,save,[profile(2),0,uuid(1),state]))[0].version===1,'Lost-response retry does not duplicate checkpoint');
  await denied(2,save,[profile(2),0,uuid(1),{xp:99}],'Conflicting request-ID replay rejected');
  await denied(2,save,[profile(2),0,uuid(2),state],'Stale second-device version rejected');
  await denied(3,save,[profile(2),1,uuid(3),state],'Student B cannot save A progress');
  await denied(1,save,[profile(2),1,uuid(3),state],'Teacher cannot impersonate learner');
  await denied(5,save,[profile(2),1,uuid(3),state],'Admin cannot impersonate learner');
  await denied(null,save,[profile(2),1,uuid(3),state],'Anonymous checkpoint rejected','anon');
  for (const [actor,count] of [[2,1],[3,0],[1,1],[6,0],[5,1],[7,0]]) {
    check((await as(actor,'SELECT * FROM game_player_progress WHERE profile_id=$1',[profile(2)])).length===count,`Actor ${actor} checkpoint read scope`);
  }
  await denied(2,"UPDATE game_player_progress SET checkpoint='{}'",[],'Direct checkpoint mutation rejected');

  const evidence = { attempts:[{questionId:'D1-001',selectedOptionId:'A',timeSpentSec:5}],reportedResult:{earnedXp:999999} };
  const submit = 'SELECT submit_game_evidence($1,$2,$3,$4,$5)';
  await as(2,submit,[profile(2),uuid(10),'D1','math-quest-v1.0',evidence]);
  await as(2,submit,[profile(2),uuid(10),'D1','math-quest-v1.0',evidence]);
  check((await db.query('SELECT * FROM game_question_attempts')).rows.length===1,'Evidence retry is idempotent');
  check((await db.query('SELECT * FROM game_reward_ledger')).rows.length===0,'Reported browser rewards are never automatically awarded');
  for (const [actor,count] of [[2,1],[3,0],[1,1],[6,0],[5,1],[7,0]]) {
    check((await as(actor,'SELECT * FROM game_question_attempts')).length===count,`Actor ${actor} question-attempt read scope`);
  }
  const commit = 'SELECT commit_verified_game_result($1,$2,$3,$4,$5,$6)';
  const verified = [uuid(10),0,{accuracy:100},{xp:10},{xp:10},'test-validator'];
  for (const actor of [2,3,1,6,5]) await denied(actor,commit,verified,`Actor ${actor} cannot write verified rewards`);
  await as(null,commit,verified,'service_role');
  await as(null,commit,verified,'service_role');
  check((await db.query('SELECT * FROM game_reward_ledger')).rows.length===1,'Trusted commit awards once across retries');
  check((await db.query('SELECT * FROM game_session_results')).rows.length===1,'Verified result inserted atomically');
  await as(2,submit,[profile(2),uuid(11),'D1','math-quest-v1.0',evidence]);
  await denied(null,commit,[uuid(11),1,{accuracy:100},{xp:10},42,'test-validator'],'Invalid verified state rolls back entire commit','service_role');
  check((await db.query('SELECT * FROM game_reward_ledger')).rows.length===1,'Failed commit leaves no extra rewards');
  check((await db.query("SELECT status FROM game_sessions WHERE id=$1",[uuid(11)])).rows[0].status==='SUBMITTED','Failed commit leaves session unverified');
  for (const actor of [2,1,5]) check((await as(actor,'SELECT * FROM game_reward_ledger')).length===1,`Actor ${actor} scoped verified reward read`);
  for (const actor of [3,6,7]) check((await as(actor,'SELECT * FROM game_reward_ledger')).length===0,`Actor ${actor} denied unrelated rewards`);
  await db.query("UPDATE game_verified_progress SET state=$1 WHERE profile_id=$2",[{stageBestAccuracy:{D1:90},skillMastery:{calculation:0.8}},profile(2)]);
  check((await as(1,'SELECT * FROM game_skill_mastery')).length===1,'Assigned teacher reads verified mastery view');
  check((await as(6,'SELECT * FROM game_stage_progress')).length===0,'Unassigned teacher cannot bypass RLS through stage view');
  await db.query("UPDATE profiles SET academic_year='2570' WHERE id=$1",[profile(1)]);
  check((await as(1,'SELECT * FROM game_player_progress')).length===0,'Prior-year teacher assignment does not authorize current teacher');
  await db.query("UPDATE profiles SET academic_year='2569' WHERE id=$1",[profile(1)]);
  await db.query("UPDATE profiles SET status='DISABLED' WHERE id=$1",[profile(2)]);
  check((await as(2,'SELECT * FROM game_player_progress')).length===0,'Disabled owner cannot read gameplay checkpoint');
  await db.query("UPDATE profiles SET status='ACTIVE' WHERE id=$1",[profile(2)]);

  await db.query(`INSERT INTO arena_rooms(id,room_code,organization_id,classroom_id,professor_id,question_set_id,title)
    VALUES ($1,'AAA111','ORG_KLAPANYA','P6-1',$3,'D1','Test'),($2,'BBB222','ORG_KLAPANYA','P6-2',$3,'D1','Other room')`,[uuid(20),uuid(21),profile(1)]);
  check((await as(2,'SELECT * FROM arena_rooms')).length===1,'Student sees enrolled classroom room only');
  check((await as(7,'SELECT * FROM arena_rooms')).length===0,'Cross-organization room visibility denied');
  check((await as(null,'SELECT * FROM arena_rooms',[],'anon').catch(()=>[])).length===0,'Anonymous room visibility denied');
  const participant = (await as(2,'SELECT join_game_arena($1) AS id',[uuid(20)]))[0].id;
  check((await as(2,'SELECT join_game_arena($1) AS id',[uuid(20)]))[0].id===participant,'Arena join/reconnect idempotent');
  await denied(3,'SELECT join_game_arena($1)',[uuid(20)],'Other classroom cannot join');
  await denied(2,'UPDATE arena_participants SET score=999 WHERE id=$1',[participant],'Participant score forgery rejected');
  await as(2,'UPDATE arena_participants SET is_connected=false WHERE id=$1',[participant]);
  check(true,'Owner presence update permitted');
  const question = {questionText:'test',options:[{id:'A',text:'1',isCorrect:true}],correctNumericalValue:'1',explanation:'secret'};
  await db.query(`INSERT INTO arena_rounds(id,room_id,round_number,question_id,question_data,status)
    VALUES ($1,$2,1,'D1-001',$5,'LIVE'),($3,$4,1,'D1-001',$5,'LIVE')`,[uuid(22),uuid(20),uuid(23),uuid(21),question]);
  check((await as(2,'SELECT * FROM arena_rounds')).length===0,'Student cannot read raw answer-bearing round JSON');
  const safe = JSON.stringify(await as(2,'SELECT * FROM read_game_arena_rounds($1)',[uuid(20)]));
  check(safe.includes('questionText') && !safe.includes('isCorrect') && !safe.includes('secret'),'Sanitized round RPC excludes keys and explanations');
  check((await as(3,'SELECT * FROM read_game_arena_rounds($1)',[uuid(20)])).length===0,'Round RPC enforces classroom scope');
  const answer = 'INSERT INTO arena_answers(round_id,participant_id,selected_option_id,is_correct,time_spent_sec) VALUES($1,$2,\'A\',true,1)';
  await denied(2,answer,[uuid(22),participant],'Browser cannot submit caller-supplied correctness');
  await denied(null,answer,[uuid(23),participant],'Even trusted answer writer cannot cross room boundary','service_role');
  await as(null,answer,[uuid(22),participant],'service_role');
  check((await as(2,'SELECT * FROM arena_answers')).length===1,'Student can read own answer');
  check((await as(3,'SELECT * FROM arena_answers')).length===0,'Other student cannot read answer');
  await denied(2,"INSERT INTO arena_events(room_id,event_type,payload) VALUES($1,'SCORE','{}')",[uuid(20)],'Browser cannot forge Arena event');
  await db.query("UPDATE arena_rooms SET status='LIVE',current_round_index=1 WHERE id=$1",[uuid(20)]);
  await db.query(`INSERT INTO arena_rounds(id,room_id,round_number,question_id,question_data,status,started_at,time_limit_sec)
    VALUES ($1,$2,2,'D1-001',$3,'LIVE',now(),300)`,[uuid(24),uuid(20),question]);
  const arenaCommit='SELECT commit_game_arena_answer($1,$2,$3,$4,$5,$6,$7,$8,$9) AS answer';
  const stats={score:155,streak:1,accuracy:100,totalAnswered:1,correctCount:1,avgTimeSec:5};
  const arenaArgs=[uuid(24),participant,0,'A',true,5,155,250,stats];
  for (const actor of [2,1,5]) await denied(actor,arenaCommit,arenaArgs,`Actor ${actor} cannot invoke trusted Arena scorer`);
  await denied(null,arenaCommit,[...arenaArgs.slice(0,8),{...stats,score:999}], 'Invalid Arena aggregate rolls back','service_role');
  check((await db.query('SELECT score FROM arena_participants WHERE id=$1',[participant])).rows[0].score===0,'Rejected Arena commit preserves participant');
  await as(null,arenaCommit,arenaArgs,'service_role');
  await as(null,arenaCommit,arenaArgs,'service_role');
  check((await db.query('SELECT score,total_answered FROM arena_participants WHERE id=$1',[participant])).rows[0].score===155,'Trusted Arena replay awards only once');
  check((await db.query('SELECT * FROM arena_answers WHERE round_id=$1',[uuid(24)])).rows.length===1,'Arena retry creates one answer');
  await denied(null,arenaCommit,[uuid(24),participant,0,'B',false,5,0,0,stats],'Conflicting Arena replay rejected','service_role');
  await db.query("UPDATE arena_rooms SET current_round_index=2 WHERE id=$1",[uuid(20)]);
  await db.query(`INSERT INTO arena_rounds(id,room_id,round_number,question_id,question_data,status,started_at,time_limit_sec)
    VALUES ($1,$2,3,'D1-001',$3,'LIVE',now()-interval '10 minutes',30)`,[uuid(25),uuid(20),question]);
  await denied(null,arenaCommit,[uuid(25),participant,1,'A',true,5,155,250,{...stats,score:310,totalAnswered:2,correctCount:2}],
    'Database rechecks expired Arena deadline','service_role');
  const openRun='SELECT open_game_campaign_run($1,$2,$3,$4)';
  const def={engine:'BATTLE_V1',stageId:'D1',heroId:'CHRONOMANCER',questionIds:['D1-001']};
  for(const actor of [2,1,5])await denied(actor,openRun,[profile(2),uuid(40),'D1',def],`Actor ${actor} cannot issue trusted campaign definitions`);
  await as(null,openRun,[profile(2),uuid(40),'D1',def],'service_role');
  await as(null,openRun,[profile(2),uuid(40),'D1',def],'service_role');
  check((await db.query('SELECT * FROM game_campaign_runs')).rows.length===1,'Campaign start retry has one stable run');
  for(const [actor,count] of [[2,1],[3,0],[1,1],[6,0],[5,1]])check((await as(actor,'SELECT * FROM game_campaign_runs')).length===count,`Actor ${actor} campaign lifecycle scope`);
  await denied(3,'SELECT touch_game_campaign_run($1)',[uuid(40)],'B cannot mark A campaign active');
  await as(2,'SELECT touch_game_campaign_run($1)',[uuid(40)]);
  check((await db.query('SELECT status FROM game_campaign_runs')).rows[0].status==='IN_PROGRESS','First response marks in-progress lifecycle');
  const finishRun='SELECT finish_game_campaign_run($1,$2,$3,$4,$5,$6,$7) AS receipt';
  const finishArgs=[uuid(40),1,{attempts:evidence.attempts},{accuracy:80,correctCount:24,totalQuestions:30},{xp:20},{xp:30},'dojo-frozen-v1'];
  for(const actor of [2,1,5])await denied(actor,finishRun,finishArgs,`Actor ${actor} cannot manufacture verified campaign results`);
  await denied(null,finishRun,[...finishArgs.slice(0,5),42,'dojo-frozen-v1'],'Campaign invalid state rolls back evidence, rewards and lifecycle','service_role');
  check((await db.query('SELECT * FROM game_sessions WHERE id=$1',[uuid(40)])).rows.length===0,'Failed campaign commit leaves no partial session');
  const receipt=await as(null,finishRun,finishArgs,'service_role');
  const repeat=await as(null,finishRun,finishArgs,'service_role');
  check(JSON.stringify(receipt)===JSON.stringify(repeat),'Campaign retry returns stable verified receipt');
  check((await db.query('SELECT * FROM game_reward_ledger WHERE session_id=$1',[uuid(40)])).rows.length===1,'Campaign rewards apply once');
  check((await db.query('SELECT status FROM game_campaign_runs')).rows[0].status==='COMPLETED','Campaign receipt and completed state committed together');
  await denied(null,finishRun,[uuid(40),1,{attempts:[]},...finishArgs.slice(3)],'Campaign conflicting duplicate rejected','service_role');
  const defs = (await db.query("SELECT proname,proconfig FROM pg_proc JOIN pg_namespace n ON n.oid=pronamespace WHERE n.nspname='public' AND prosecdef")).rows;
  check(defs.every(f=>f.proconfig?.includes('search_path=pg_catalog')),'Every SECURITY DEFINER function fixes search_path');
  const addRecord="INSERT INTO game_backend_records(id,organization_id,kind,title,subject,grade) VALUES ($1,$2,'DOCUMENT','Source','Math','P6') RETURNING id";
  await as(5,addRecord,[uuid(80),'ORG_KLAPANYA']);
  for(const actor of [1,2,3,6,7]) {
    check((await as(actor,'SELECT * FROM game_backend_records')).length===0,`Non-admin ${actor} cannot read backend metadata`);
    await denied(actor,addRecord,[uuid(81),'ORG_KLAPANYA'],`Non-admin ${actor} cannot create backend metadata`);
  }
  await denied(5,addRecord,[uuid(81),'OTHER'],'Admin cannot create cross-organization metadata');
  await denied(null,addRecord,[uuid(81),'ORG_KLAPANYA'],'Anonymous backend write denied','anon');
  await denied(5,"UPDATE game_backend_records SET status='PUBLISHED' WHERE id=$1",[uuid(80)],'Publishing cannot skip manual review');
  await as(5,"UPDATE game_backend_records SET status='REVIEW' WHERE id=$1",[uuid(80)]);
  await as(5,"UPDATE game_backend_records SET status='APPROVED' WHERE id=$1",[uuid(80)]);
  await denied(5,"UPDATE game_backend_records SET title='Changed' WHERE id=$1",[uuid(80)],'Approved content cannot change without returning to draft');
  await as(5,"UPDATE game_backend_records SET status='PUBLISHED',visibility='PUBLIC' WHERE id=$1",[uuid(80)]);
  check((await as(2,'SELECT * FROM game_backend_records')).length===0,'PUBLIC metadata does not expose content to students');
  check((await as(5,"UPDATE game_backend_records SET title='Stale' WHERE id=$1 AND version=1 RETURNING id",[uuid(80)])).length===0,'Optimistic concurrency rejects stale version');
  await denied(5,'DELETE FROM game_backend_records WHERE id=$1',[uuid(80)],'Backend delete denied; archive required');
  await denied(5,"UPDATE game_backend_records SET organization_id='OTHER' WHERE id=$1",[uuid(80)],'Record organization cannot change');
  await denied(5,"INSERT INTO game_backend_records(organization_id,kind,title,subject,grade,status) VALUES ('ORG_KLAPANYA','QUESTION_SET','x','Math','P6','APPROVED')",[],'New content must begin as draft');
  await as(5,"INSERT INTO storage.objects(bucket_id,name) VALUES ('game-backend','ORG_KLAPANYA/file.pdf')");
  check((await as(5,'SELECT * FROM storage.objects')).length===1,'Admin reads own private uploads');
  for(const actor of [1,2,6,7]) {
    check((await as(actor,'SELECT * FROM storage.objects')).length===0,`Actor ${actor} cannot read private uploads`);
    await denied(actor,"INSERT INTO storage.objects(bucket_id,name) VALUES ('game-backend','ORG_KLAPANYA/forged.pdf')",[],`Actor ${actor} cannot upload private backend files`);
  }
  await denied(5,"INSERT INTO storage.objects(bucket_id,name) VALUES ('game-backend','OTHER/cross.pdf')",[],'Cross-organization upload denied');
  check((await as(5,"UPDATE storage.objects SET name='ORG_KLAPANYA/replaced.pdf' RETURNING id")).length===0,'Immutable file overwrite denied');
  await db.query('INSERT INTO auth.users VALUES ($1)',[id(50)]);
  await as(null,"INSERT INTO game_admin_operations(id,organization_id,actor_id,action,fingerprint) VALUES($1,'ORG_KLAPANYA',$2,'provision','test')",[uuid(90),profile(5)],'service_role');
  const pilotInput={code:'PILOT_TEST',name:'Local fixture only',email:'fixture@example.test',role:'LEARNER',grade:'P6',academicYear:'2569',classroom:'P6-1',assignedGrades:[],classrooms:[]};
  await denied(5,'SELECT game_finish_pilot_user($1,$2,$3)',[uuid(90),id(50),pilotInput],'Even Admin browser cannot call service-only pilot commit');
  const pilot=(await as(null,'SELECT game_finish_pilot_user($1,$2,$3) AS id',[uuid(90),id(50),pilotInput],'service_role'))[0].id;
  check((await as(null,'SELECT game_finish_pilot_user($1,$2,$3) AS id',[uuid(90),id(50),pilotInput],'service_role'))[0].id===pilot,'Pilot identity commit is idempotent');
  check((await db.query('SELECT * FROM classroom_enrollments WHERE learner_profile_id=$1',[pilot])).rows.length===1,'Pilot profile and enrollment created atomically');
  for(const actor of [1,2,6,7])check((await as(actor,'SELECT * FROM game_admin_operations')).length===0,`Actor ${actor} cannot read Admin operation journal`);
  await denied(5,"INSERT INTO game_admin_operations(id,organization_id,actor_id,action,fingerprint) VALUES($1,'ORG_KLAPANYA',$2,'provision','forged')",[uuid(91),profile(5)],'Browser cannot forge operation journal');

  await as(5,"INSERT INTO game_arctic_configuration(organization_id,title) VALUES ('ORG_KLAPANYA','Arctic')");
  for(const actor of [1,2,3,5,6])check((await as(actor,'SELECT * FROM game_arctic_configuration')).length===1,'Active same-organization player reads Arctic '+actor);
  check((await as(7,'SELECT * FROM game_arctic_configuration')).length===0,'Cross-organization Arctic read denied');
  await denied(null,'SELECT * FROM game_arctic_configuration',[],'Anonymous Arctic read denied','anon');
  for(const actor of [1,2,6,7]){
    check((await as(actor,"UPDATE game_arctic_configuration SET title='Forged' RETURNING organization_id")).length===0,'Non-admin Arctic edits denied '+actor);
    await denied(actor,"INSERT INTO storage.objects(bucket_id,name) VALUES ('game-arctic-visuals','ORG_KLAPANYA/abcd.png')",[],'Non-admin visual upload denied '+actor);
  }
  await as(5,"UPDATE game_arctic_configuration SET visuals=$1 WHERE organization_id='ORG_KLAPANYA' AND version=1",[{worldMap:'ORG_KLAPANYA/abcd.png'}]);
  check((await as(5,"UPDATE game_arctic_configuration SET title='Stale' WHERE version=1 RETURNING organization_id")).length===0,'Arctic stale overwrite denied');
  for(const visuals of [{questionIds:[]},{dojo:'OTHER/abcd.png'},{worldMap:'https://evil.example/x.png'},{worldMap:'ORG_KLAPANYA/../x.png'}])await denied(5,'UPDATE game_arctic_configuration SET visuals=$1',[visuals],'Unsafe visual metadata rejected');
  await as(5,"INSERT INTO storage.objects(bucket_id,name) VALUES ('game-arctic-visuals','ORG_KLAPANYA/abcd.png')");
  check((await as(2,"SELECT * FROM storage.objects WHERE bucket_id='game-arctic-visuals'")).length===1,'Student can resolve own organization image');
  check((await as(7,"SELECT * FROM storage.objects WHERE bucket_id='game-arctic-visuals'")).length===0,'Other organization cannot resolve image');
  check((await as(5,"UPDATE storage.objects SET name='ORG_KLAPANYA/abcd.jpg' WHERE bucket_id='game-arctic-visuals' RETURNING id")).length===0,'Visual objects are immutable; replace uses new path');
  await db.query("UPDATE profiles SET status='DISABLED' WHERE id=$1",[profile(5)]);
  check((await as(5,'SELECT * FROM game_arctic_configuration')).length===0,'Disabled admin cannot read Arctic');
  check((await as(5,"UPDATE game_arctic_configuration SET title='Disabled' RETURNING organization_id")).length===0,'Disabled admin cannot edit Arctic');
  console.log(`Database/RLS: ${passed} passed. Realtime and Storage delivery are not exercised by PGlite.`);
} finally { await db.close(); }
