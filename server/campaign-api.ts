import type {SupabaseClient} from '@supabase/supabase-js';
import {campaignDefinition,replayCampaign,CAMPAIGN_VALIDATOR} from './campaign-replay';
import type {CampaignDefinition} from './campaign-replay';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class ApiError extends Error{constructor(public status:number,message:string){super(message);}}
export function campaignHandler(client:SupabaseClient,allowedOrigin:string){
 return async(request:Request):Promise<Response>=>{
  const headers:Record<string,string>={'Cache-Control':'no-store','Vary':'Origin'};
  const origin=request.headers.get('origin');
  if(origin&&origin!==allowedOrigin)return new Response('Origin denied',{status:403,headers});
  if(origin)Object.assign(headers,{'Access-Control-Allow-Origin':allowedOrigin,'Access-Control-Allow-Headers':'authorization,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  try{
   if(request.method!=='POST')throw new ApiError(405,'POST required');
   const token=request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
   if(!token)throw new ApiError(401,'Authentication required');
   const auth=await client.auth.getUser(token);
   if(auth.error||!auth.data.user)throw new ApiError(401,'Authentication required');
   const profile=await client.from('profiles').select('id,status,organization_id,academic_year').eq('auth_user_id',auth.data.user.id).single();
   if(profile.error||profile.data?.status!=='ACTIVE')throw new ApiError(403,'Active game profile required');
   const roles=await client.from('memberships').select('role_id').eq('profile_id',profile.data.id).eq('organization_id',profile.data.organization_id).in('role_id',['LEARNER','EXTERNAL_LEARNER']);
   if(roles.error||!roles.data?.length)throw new ApiError(403,'Student required');
   const reader=request.body?.getReader();let raw='',size=0;const decoder=new TextDecoder();
   if(reader)try{for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>1048576){await reader.cancel();throw new ApiError(413,'Request too large');}raw+=decoder.decode(chunk.value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}
   let body:any;try{body=JSON.parse(raw);}catch{throw new ApiError(400,'Invalid JSON');}
   if(!body||!uuid.test(body.sessionId))throw new ApiError(400,'Session UUID required');
   const action=new URL(request.url).pathname.split('/').pop();
   if(action==='start'){
    if(Object.keys(body).some(k=>!['sessionId','stageId','heroId'].includes(k)))throw new ApiError(400,'Unexpected start field');
    const prior=await client.from('game_verified_progress').select('state').eq('profile_id',profile.data.id).maybeSingle();
    if(prior.error)throw new ApiError(503,'Progress unavailable');
    let definition:CampaignDefinition;try{definition=campaignDefinition(body.stageId,body.heroId,prior.data?.state||null);}catch(e){throw new ApiError(422,(e as Error).message);}
    const opened=await client.rpc('open_game_campaign_run',{p_profile_id:profile.data.id,p_run_id:body.sessionId,p_stage_id:body.stageId,p_definition:definition});
    if(opened.error)throw new ApiError(409,'Cannot open campaign run');
    return Response.json({sessionId:body.sessionId,definition,status:opened.data.status},{headers});
   }
   if(action!=='verify')throw new ApiError(404,'Unknown campaign endpoint');
   if(Object.keys(body).some(k=>!['sessionId','attempts'].includes(k)))throw new ApiError(400,'Only responses are accepted; no final totals');
   const run=await client.from('game_campaign_runs').select('*').eq('id',body.sessionId).eq('profile_id',profile.data.id).single();
   if(run.error||!run.data)throw new ApiError(404,'Owned run not found');
   if(run.data.organization_id!==profile.data.organization_id||run.data.academic_year!==profile.data.academic_year)throw new ApiError(403,'Run scope changed');
   // Strict raw-response shape prevents caller-provided correctness/rewards entering trusted evidence.
   if(!Array.isArray(body.attempts)||body.attempts.some((a:any)=>!a||typeof a!=='object'||Object.keys(a).some(k=>!['questionId','selectedOptionId','numericalInput','timeSpentSec','hintLevelUsed'].includes(k))))throw new ApiError(400,'Invalid response fields');
   const evidence={attempts:body.attempts};
   if(run.data.status==='COMPLETED'){
    const original=await client.from('game_sessions').select('evidence').eq('id',body.sessionId).single();
    // Database JSONB equality is authoritative for differently ordered JSON object keys.
    if(original.error)throw new ApiError(503,'Receipt unavailable');
    const replay=await client.rpc('finish_game_campaign_run',{p_run_id:body.sessionId,p_expected_version:0,p_evidence:evidence,p_result:{},p_rewards:{},p_next_state:{},p_validator_version:CAMPAIGN_VALIDATOR});
    if(replay.error)throw new ApiError(409,'Conflicting retry');return Response.json(replay.data,{headers});
   }
   for(let retry=0;retry<3;retry++){
    const prior=await client.from('game_verified_progress').select('state,version').eq('profile_id',profile.data.id).maybeSingle();
    if(prior.error)throw new ApiError(503,'Progress unavailable');
    let evaluated;try{evaluated=replayCampaign(run.data.definition,body.attempts,prior.data?.state||null);}catch(e){throw new ApiError(422,(e as Error).message);}
    const committed=await client.rpc('finish_game_campaign_run',{p_run_id:body.sessionId,p_expected_version:prior.data?.version||0,p_evidence:evidence,p_result:evaluated.result,p_rewards:evaluated.rewards,p_next_state:evaluated.nextState,p_validator_version:CAMPAIGN_VALIDATOR});
    if(!committed.error)return Response.json(committed.data,{headers});
    if(committed.error.code!=='40001')throw new ApiError(409,'Campaign commit rejected');
   }
   throw new ApiError(409,'Concurrent progress update; retry same submission');
  }catch(e){return Response.json({error:e instanceof ApiError?e.message:'Campaign service unavailable'},{status:e instanceof ApiError?e.status:503,headers});}
 };
}
