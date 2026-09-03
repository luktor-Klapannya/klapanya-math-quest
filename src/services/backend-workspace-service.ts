import { verifyAdmin, type AdminClient, type AdminIdentity, type AdminRuntime } from './admin-console-service';
import type { SupabaseClient } from '@supabase/supabase-js';
export const subjects = ['Math','English','Science','Social','Thai'];
export const grades = ['PK','K1','K2','K3','P1','P2','P3','P4','P5','P6'];
export const kinds = ['DOCUMENT','ASSESSMENT','QUESTION_SET','EXTERNAL','ANALYSIS','BLUEPRINT','TERRITORY'] as const;
export type Kind = typeof kinds[number];
export interface BackendRecord { id:string; organization_id:string; kind:Kind; title:string; subject:string; grade:string; source_id:string|null; visibility:string; status:string; metadata:Record<string,any>; version:number; updated_at:string }
export type RecordInput = Pick<BackendRecord,'kind'|'title'|'subject'|'grade'|'source_id'|'visibility'|'status'|'metadata'>;
export const transitions:Record<string,string[]> = { DRAFT:['DRAFT','REVIEW','ARCHIVED'], REVIEW:['REVIEW','DRAFT','APPROVED','ARCHIVED'], APPROVED:['APPROVED','DRAFT','PUBLISHED','ARCHIVED'], PUBLISHED:['PUBLISHED','DRAFT','ARCHIVED'], ARCHIVED:['ARCHIVED'] };
export function validateRecord(value:RecordInput) {
 if (!kinds.includes(value.kind) || !value.title.trim() || value.title.length>200 || !subjects.includes(value.subject) || !grades.includes(value.grade)) throw new Error('Enter title, subject and grade.');
 if (!['PRIVATE','INTERNAL','PUBLIC'].includes(value.visibility) || !transitions[value.status]) throw new Error('Invalid lifecycle metadata.');
 if (!value.metadata || Array.isArray(value.metadata) || typeof value.metadata!=='object' || JSON.stringify(value.metadata).length>100000) throw new Error('Metadata must be an object under 100 KB.');
}
export function createBackendService(client:AdminClient,runtime:AdminRuntime,expected:AdminIdentity) {
 async function authorize() {
   const owner=runtime.user(); const verified=await verifyAdmin(client,runtime);
   const check=()=>{if(runtime.user()!==owner || runtime.mode()!=='supabase') throw new Error('Account changed.');}; check();
   if(verified.profileId!==expected.profileId || verified.organizationId!==expected.organizationId || verified.principalId!==expected.principalId) throw new Error('Admin scope changed.');
   return check;
 }
 return {
   async read(table:'game_backend_records'|'profiles'|'memberships'|'classroom_enrollments'|'professor_classroom_assignments'|'game_campaign_runs'|'game_sessions'|'game_session_results') {
     const check=await authorize(); const rows:any[]=[];
     const columns:Record<string,string>={game_backend_records:'*',profiles:'id,user_code,display_name,status,auth_user_id,grade_level,classroom_id,academic_year,last_login_at,game_admin_metadata',memberships:'id,profile_id,role_id',classroom_enrollments:'*',professor_classroom_assignments:'*',game_campaign_runs:'id,profile_id,stage_id,status,started_at,last_played_at,completed_at',game_sessions:'id,profile_id,stage_id,status,submitted_at',game_session_results:'session_id,result,verified_at'};
     for(let offset=0;;offset+=500) {
       check(); let query=client.from(table).select(columns[table]).order(table==='game_session_results'?'session_id':'id');
       // Results inherit organization scope through their session RLS; they have no organization column.
       if(table!=='game_session_results') query=query.eq('organization_id',expected.organizationId);
       const result=await query.range(offset,offset+499); check();
       if(result.error) throw new Error(`Cannot load ${table}. Verify migration and authorized access.`);
       rows.push(...(result.data||[])); if((result.data?.length||0)<500)return rows;
     }
   },
   async save(value:RecordInput,existing?:BackendRecord) {
     validateRecord(value); const check=await authorize(); check();
     const payload={kind:value.kind,title:value.title.trim(),subject:value.subject,grade:value.grade,source_id:value.source_id||null,visibility:value.visibility,status:value.status,metadata:value.metadata};
     const query=existing ? client.from('game_backend_records').update(payload).eq('id',existing.id).eq('organization_id',expected.organizationId).eq('version',existing.version) : client.from('game_backend_records').insert({...payload,organization_id:expected.organizationId});
     const result=await query.select().single(); check();
     if(result.error || !result.data) throw new Error('Save rejected. Refresh for concurrent edits, or check review state and migration 011.');
     return result.data as BackendRecord;
   },
   async updateProfile(id:string,display_name:string,status:string) {
     if(id===expected.profileId)throw new Error('Self-administration is disabled to prevent lockout.');
     if(!display_name.trim() || !['ACTIVE','DISABLED'].includes(status))throw new Error('Name and valid status required.');
     const check=await authorize(); check();
     const response=await client.from('profiles').update({display_name:display_name.trim(),status}).eq('id',id).eq('organization_id',expected.organizationId).select('id').single(); check();
     if(response.error || !response.data)throw new Error('Profile update rejected.');
   }
 };
}
export function csv(rows:unknown[][]) {return rows.map(row=>row.map(value=>{let text=String(value??'');if(/^[\s]*[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.split('"').join('""')+'"';}).join(',')).join('\r\n');}
export async function uploadBackendFile(client:SupabaseClient,runtime:AdminRuntime,expected:AdminIdentity,file:File) {
 const owner=runtime.user(),identity=await verifyAdmin(client,runtime);
 if(identity.profileId!==expected.profileId||identity.principalId!==expected.principalId||identity.organizationId!==expected.organizationId||runtime.user()!==owner)throw new Error('Account changed.');
 const allowed:Record<string,string>={'application/pdf':'pdf','text/plain':'txt','text/csv':'csv','image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
 if(!allowed[file.type]||file.size>10485760)throw new Error('Use PDF, TXT, CSV, PNG, JPEG or WEBP up to 10 MB.');
 const path=`${identity.organizationId}/${crypto.randomUUID()}.${allowed[file.type]}`;
 const result=await client.storage.from('game-backend').upload(path,file,{upsert:false,contentType:file.type});
 if(runtime.user()!==owner||runtime.mode()!=='supabase')throw new Error('Account changed. File metadata was not attached.');
 if(result.error)throw new Error('Private upload failed. Verify migration 011 and Storage policies.');
 return {bucket:'game-backend',path,name:file.name,mimeType:file.type,size:file.size};
}

