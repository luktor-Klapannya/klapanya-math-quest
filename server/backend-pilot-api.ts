import type {SupabaseClient} from '@supabase/supabase-js';
import {driveLibrary,type DriveConfig} from './drive-library';
import {validateRecord} from '../src/services/backend-workspace-service';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class PilotError extends Error {constructor(public status:number,message:string){super(message);}}
const digest=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(b=>b.toString(16).padStart(2,'0')).join('');
export function validatePilotUser(input:any){
 const value={profileId:input.profileId||null,code:String(input.code||'').trim().toUpperCase(),name:String(input.name||'').trim(),email:String(input.email||'').trim().toLowerCase(),role:input.role,grade:input.grade,academicYear:String(input.academicYear||''),classroom:String(input.classroom||'').trim(),classrooms:input.classrooms||[],subject:input.subject||'',assignedGrades:input.assignedGrades||[],externalReference:String(input.externalReference||'').trim()};
 if(value.profileId&&!uuid.test(value.profileId))throw new PilotError(400,'Invalid profile ID');
 if(!/^[A-Z0-9_-]{2,40}$/.test(value.code)||!value.name||value.name.length>150||!/^\S+@\S+\.\S+$/.test(value.email)||value.email.length>254||!['LEARNER','PROFESSOR'].includes(value.role)||!['PK','K1','K2','K3','P1','P2','P3','P4','P5','P6','G6'].includes(value.grade)||!/^\d{4}$/.test(value.academicYear))throw new PilotError(400,'Valid code, name, email, pilot role, grade and academic year required.');
 if(value.role==='LEARNER'&&!/^[\p{L}\p{N} _-]{1,40}$/u.test(value.classroom))throw new PilotError(400,'Student classroom required.');
 if(!Array.isArray(value.classrooms)||value.classrooms.length>20||value.classrooms.some((v:any)=>typeof v!=='string'||!/^[\p{L}\p{N} _-]{1,40}$/u.test(v))||!Array.isArray(value.assignedGrades)||value.assignedGrades.some((v:any)=>!['PK','K1','K2','K3','P1','P2','P3','P4','P5','P6','G6'].includes(v))||value.externalReference.length>100)throw new PilotError(400,'Invalid explicit classroom/grade scope.');
 if(value.role==='PROFESSOR'&&!['Math','English','Science','Social','Thai'].includes(value.subject))throw new PilotError(400,'Teacher subject required.');return value;
}
function password(value:any){if(typeof value!=='string'||value.length<12||value.length>128)throw new PilotError(400,'Use a new password of 12–128 characters.');}
export function backendPilotHandler(client:SupabaseClient,allowedOrigin:string,config:DriveConfig,drive=driveLibrary(config)){
 return async(request:Request)=>{
  const headers:Record<string,string>={'Cache-Control':'no-store','Vary':'Origin'};let operationId='';
  if(request.headers.get('origin')!==allowedOrigin)return Response.json({error:'Origin denied'},{status:403,headers});
  Object.assign(headers,{'Access-Control-Allow-Origin':allowedOrigin,'Access-Control-Allow-Headers':'authorization,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  try{
   if(request.method!=='POST')throw new PilotError(405,'POST required');
   const token=request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];if(!token)throw new PilotError(401,'Real authentication required');
   const authenticate=async()=>{const auth=await client.auth.getUser(token);if(auth.error||!auth.data.user)throw new PilotError(401,'Real authentication required');const p=await client.from('profiles').select('id,status,organization_id').eq('auth_user_id',auth.data.user.id).single();if(p.error||p.data?.status!=='ACTIVE')throw new PilotError(403,'Active Admin required');const m=await client.from('memberships').select('id').eq('profile_id',p.data.id).eq('organization_id',p.data.organization_id).eq('role_id','ADMIN');if(m.error||!m.data?.length)throw new PilotError(403,'Admin membership required');return p.data;};
   const actor=await authenticate();const revalidate=async()=>{const current=await authenticate();if(current.id!==actor.id||current.organization_id!==actor.organization_id)throw new PilotError(403,'Admin scope changed');};const action=new URL(request.url).pathname.split('/').pop();
   if(action==='capabilities')return Response.json({userManagement:true,drive:!!(config.rootFolderId&&config.clientId&&config.clientSecret&&config.refreshToken),driveStatus:!config.rootFolderId?'WAITING_FOR_DRIVE_FOLDER_ID':'Server configuration requires hosted validation'},{headers});
   if(!['provision','password','drive'].includes(action||''))throw new PilotError(404,'Unknown pilot endpoint');
   let raw='',bytes=0;const reader=request.body?.getReader();const decoder=new TextDecoder();if(reader)try{for(;;){const r=await reader.read();if(r.done)break;bytes+=r.value.byteLength;if(bytes>14500000){await reader.cancel();throw new PilotError(413,'Request too large');}raw+=decoder.decode(r.value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}
   let body:any;try{body=JSON.parse(raw);}catch{throw new PilotError(400,'Invalid JSON');}if(!body||!uuid.test(body.operationId))throw new PilotError(400,'Stable operation UUID required');operationId=body.operationId;
   if(action==='provision'){body.user=validatePilotUser(body.user||{});password(body.password);}
   if(action==='password'){password(body.password);if(!uuid.test(body.profileId))throw new PilotError(400,'Target profile UUID required');}
   if(action==='drive'){try{validateRecord(body.record);}catch{throw new PilotError(400,'Invalid Library metadata');}if(!['DOCUMENT','ASSESSMENT','QUESTION_SET'].includes(body.record.kind)||body.record.status!=='DRAFT')throw new PilotError(400,'Upload only to draft Library resources');if(body.recordId&&(!uuid.test(body.recordId)||!Number.isInteger(body.version)))throw new PilotError(400,'Record ID and version required');if(!config.rootFolderId)throw new PilotError(503,'WAITING_FOR_DRIVE_FOLDER_ID');}
   // No password, token or raw file content is written to the journal.
   const {password:secret,...publicRequest}=body;const fingerprint=await digest(JSON.stringify(publicRequest));
   const lookup=()=>client.from('game_admin_operations').select('*').eq('id',operationId).maybeSingle();let found=await lookup();if(found.error)throw new PilotError(503,'Pilot migration 012 is unavailable');
   if(!found.data){const inserted=await client.from('game_admin_operations').insert({id:operationId,organization_id:actor.organization_id,actor_id:actor.id,action,fingerprint});if(inserted.error&&inserted.error.code!=='23505')throw new PilotError(503,'Cannot journal operation');found=await lookup();}
   const op=found.data;if(!op||op.organization_id!==actor.organization_id||op.actor_id!==actor.id||op.action!==action||op.fingerprint!==fingerprint)throw new PilotError(409,'Operation ID conflict');
   if(op.state==='COMPLETE')return Response.json({...op.result,operationId,replayed:true},{headers});
   const finish=async(result:any)=>{const updated=await client.from('game_admin_operations').update({state:'COMPLETE',result,updated_at:new Date().toISOString()}).eq('id',operationId);if(updated.error)throw new PilotError(503,'External change may have succeeded; journal completion failed. Retry the SAME operation ID.');return Response.json({...result,operationId},{headers});};
   if(action==='provision'){
    const input=body.user;const duplicate=await client.from('profiles').select('id').ilike('user_code',input.code);if(duplicate.error)throw new PilotError(503,'Duplicate check unavailable');if(duplicate.data?.some(p=>p.id!==input.profileId))throw new PilotError(409,'Profile code already exists; do not create a second identity.');
    if(input.profileId){const p=await client.from('profiles').select('id,auth_user_id,user_code').eq('id',input.profileId).eq('organization_id',actor.organization_id).single();const m=await client.from('memberships').select('role_id').eq('profile_id',input.profileId);if(p.error||!p.data||p.data.auth_user_id||p.data.user_code.toUpperCase()!==input.code||m.error||!m.data?.length||m.data.some(r=>r.role_id!==input.role))throw new PilotError(403,'Existing profile is not an unlinked pilot identity');}
    const findAuth=async()=>{for(let page=1;page<=100;page++){const r=await client.auth.admin.listUsers({page,perPage:1000});if(r.error)throw new PilotError(503,'Auth duplicate check unavailable');const match=r.data.users.find(u=>u.email?.toLowerCase()===input.email);if(match){if(match.app_metadata?.game_pilot_operation!==operationId)throw new PilotError(409,'Login already exists; manual linkage review required');return match;}if(r.data.users.length<1000)return null;}throw new PilotError(503,'Auth duplicate scan limit reached');};
    let authUser=await findAuth();await revalidate();if(!authUser){const created=await client.auth.admin.createUser({email:input.email,password:secret,email_confirm:true,app_metadata:{game_pilot_operation:operationId}});if(created.error){authUser=await findAuth();if(!authUser)throw new PilotError(503,'Auth provisioning failed or uncertain; retry SAME operation ID');}else authUser=created.data.user;}
    if(!authUser)throw new PilotError(503,'Auth user unavailable');
    await revalidate();const linked=await client.rpc('game_finish_pilot_user',{p_operation:operationId,p_auth:authUser.id,p_input:input});if(linked.error)throw new PilotError(409,'Auth account may exist but profile linkage failed. Keep operation ID and retry; no new identity should be created.');
    return Response.json({profileId:linked.data,operationId,managedLogin:true},{headers});
   }
   if(action==='password'){
    const p=await client.from('profiles').select('id,auth_user_id').eq('id',body.profileId).eq('organization_id',actor.organization_id).single();const roles=await client.from('memberships').select('role_id').eq('profile_id',body.profileId);
    if(p.error||!p.data?.auth_user_id||roles.error||!roles.data?.length||roles.data.some(m=>!['LEARNER','PROFESSOR'].includes(m.role_id))||body.profileId===actor.id)throw new PilotError(403,'Only linked pilot Teachers/Students may be reset');
    await revalidate();const updated=await client.auth.admin.updateUserById(p.data.auth_user_id,{password:secret});if(updated.error)throw new PilotError(503,'Password reset failed or uncertain. Retry SAME operation ID and SAME password.');return finish({profileId:body.profileId,passwordChanged:true});
   }
   let fileBytes:Uint8Array;try{fileBytes=Uint8Array.from(atob(body.file?.base64),c=>c.charCodeAt(0));}catch{throw new PilotError(400,'Invalid file encoding');}
   const recordId=body.recordId||operationId;const existing=await client.from('game_backend_records').select('*').eq('id',recordId).eq('organization_id',actor.organization_id).maybeSingle();if(existing.error)throw new PilotError(503,'Library unavailable');
   if(existing.data?.metadata?.drive_operation_id===operationId)return finish({recordId,drive:existing.data.metadata.drive});
   if(body.recordId&&(!existing.data||existing.data.status!=='DRAFT'||existing.data.version!==body.version||existing.data.kind!==body.record.kind))throw new PilotError(409,'Draft changed. Refresh before uploading.');
   if(!body.recordId&&existing.data)throw new PilotError(409,'Record ID conflict');
   if(!op.file_id){const generated=await drive.generateId();const claim=await client.from('game_admin_operations').update({file_id:generated}).eq('id',operationId).is('file_id',null);if(claim.error)throw new PilotError(503,'Drive reservation failed');const reread=await lookup();op.file_id=reread.data?.file_id;if(!op.file_id)throw new PilotError(503,'Drive reservation unavailable');}
   await revalidate();const driveReference=await drive.upload({id:op.file_id,name:body.file.name,mimeType:body.file.mimeType,bytes:fileBytes,operationId,sha256:await digest(body.file.base64)});
   await revalidate();const {kind,title,subject,grade,source_id,visibility}=body.record;const payload={kind,title,subject,grade,source_id,visibility,status:'DRAFT',metadata:{...body.record.metadata,...driveReference,drive:driveReference,drive_operation_id:operationId}};
   const save=body.recordId?client.from('game_backend_records').update(payload).eq('id',recordId).eq('organization_id',actor.organization_id).eq('version',body.version):client.from('game_backend_records').insert({...payload,id:recordId,organization_id:actor.organization_id});
   const saved=await save.select('id').single();if(saved.error||!saved.data)throw new PilotError(409,`Drive upload succeeded (${op.file_id}); Supabase metadata save failed. Retry SAME operation ID or review private orphan before cleanup.`);
   return finish({recordId,drive:driveReference});
  }catch(e){return Response.json({error:e instanceof PilotError?e.message:e instanceof Error&&/Drive|File|WAITING_FOR/.test(e.message)?e.message:'Pilot service unavailable; retry same operation if a change was started.',operationId:operationId||undefined},{status:e instanceof PilotError?e.status:503,headers});}
 };
}

