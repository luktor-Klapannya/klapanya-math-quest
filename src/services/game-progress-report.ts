import type { SupabaseClient } from '@supabase/supabase-js';

export type Row=Record<string,any>;
export interface ProgressData { profiles:Row[]; enrollments:Row[]; checkpoints:Row[]; sessions:Row[]; results:Row[]; verified:Row[]; assignments?:Row[]; runs?:Row[] }
export interface StudentProgress {
  id:string; name:string; sessions:Row[]; latest:Row|null; checkpoint:Row|null; verified:Row|null;
  started:boolean; inProgress:boolean; completed:boolean; averageAccuracy:number|null;
}
const boundedAccuracy=(v:unknown):number|null=>typeof v==='number' && Number.isFinite(v) && v>=0 && v<=100?v:null;
export function studentProgress(data:ProgressData,id:string):StudentProgress {
  const pending=(data.runs||[]).filter(r=>r.profile_id===id&&!data.sessions.some(s=>s.id===r.id)).map<Row>(r=>({...r,submitted_at:r.last_played_at}));
  const sessions=[...data.sessions.filter(s=>s.profile_id===id),...pending].map<Row>(s=>{
    const result=data.results.find(r=>r.session_id===s.id);
    return {...s,verifiedResult:s.status==='VERIFIED'?result?.result:null};
  }).sort((a,b)=>String(b.submitted_at).localeCompare(String(a.submitted_at)));
  const accuracies=sessions.map(s=>boundedAccuracy(s.verifiedResult?.accuracy)).filter((n):n is number=>n!==null);
  return {id,name:data.profiles.find(p=>p.id===id)?.display_name || id,sessions,latest:sessions[0]||null,
    checkpoint:data.checkpoints.find(p=>p.profile_id===id)||null,verified:data.verified.find(p=>p.profile_id===id)||null,
    started:sessions.length>0,inProgress:sessions.some(s=>s.status==='IN_PROGRESS'||s.status==='SUBMITTED'),completed:sessions.some(s=>!!s.verifiedResult),
    averageAccuracy:accuracies.length?accuracies.reduce((a,b)=>a+b,0)/accuracies.length:null};
}
export function classroomProgress(data:ProgressData,classroom:string) {
  const ids=[...new Set(data.enrollments.filter(e=>e.classroom_id===classroom && e.status==='ACTIVE').map(e=>e.learner_profile_id as string))];
  const students=ids.map(id=>studentProgress(data,id));
  const accuracies=students.map(s=>s.averageAccuracy).filter((n):n is number=>n!==null);
  return {students,count:students.length,started:students.filter(s=>s.started).length,inProgress:students.filter(s=>s.inProgress).length,completed:students.filter(s=>s.completed).length,
    averageAccuracy:accuracies.length?accuracies.reduce((a,b)=>a+b,0)/accuracies.length:null};
}

// No service credential and no demo fallback. RLS governs every returned row.
export async function loadGameProgress(client:SupabaseClient,expectedOwner:string,currentOwner:()=>string|null):Promise<ProgressData> {
  const assertOwner=()=>{if(currentOwner()!==expectedOwner)throw new Error('Account changed');};
  assertOwner();
  const {data:auth,error:authError}=await client.auth.getUser();
  if(authError || !auth.user)throw new Error('Authentication required');
  const {data:profile,error:profileError}=await client.from('profiles').select('id,organization_id,academic_year,status').eq('auth_user_id',auth.user.id).single();
  if(profileError || profile?.id!==expectedOwner || profile.status!=='ACTIVE')throw new Error('Active authenticated profile required');
  assertOwner();
  const read=async(table:string,columns:string,scope:boolean):Promise<Row[]>=>{
    const rows:Row[]=[];
    for(let offset=0;;offset+=500){
      assertOwner();
      let query=client.from(table).select(columns).order(table==='game_player_progress'||table==='game_verified_progress'?'profile_id':table==='game_session_results'?'session_id':'id');
      if(scope)query=query.eq('organization_id',profile.organization_id).eq('academic_year',profile.academic_year);
      const {data,error}=await query.range(offset,offset+499);
      if(error)throw error;
      assertOwner();rows.push(...(data||[]));
      if((data||[]).length<500)return rows;
      if(offset>=49500)throw new Error('Report exceeds supported size; narrow classroom scope');
    }
  };
  const [profiles,enrollments,checkpoints,sessions,results,verified,assignments,runs]=await Promise.all([
    read('profiles','id,display_name,status,organization_id,academic_year',true),
    read('classroom_enrollments','id,classroom_id,learner_profile_id,status,organization_id,academic_year',true),
    read('game_player_progress','profile_id,trust_level,updated_at',true),
    read('game_sessions','id,profile_id,campaign_id,stage_id,status,submitted_at',true),
    read('game_session_results','session_id,result,verified_at',false),
    read('game_verified_progress','profile_id,state,version',false),
    read('professor_classroom_assignments','id,classroom_id,organization_id,academic_year',true),
    read('game_campaign_runs','id,profile_id,stage_id,status,started_at,last_played_at,completed_at',true),
  ]);
  assertOwner();return {profiles,enrollments,checkpoints,sessions,results,verified,assignments,runs};
}
