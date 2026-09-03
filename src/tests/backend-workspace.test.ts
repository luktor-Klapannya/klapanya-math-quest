import {aggregateRuns,usageTrend} from '../services/backend-analytics';
import {createBackendService,csv,validateRecord,type RecordInput} from '../services/backend-workspace-service';
import type {AdminClient,AdminRuntime} from '../services/admin-console-service';
let passed=0;
function check(value:unknown,label:string){if(!value)throw new Error(label);passed++;console.log('PASS: '+label);}
async function rejected(work:()=>unknown,label:string){let failed=false;try{await work();}catch{failed=true;}check(failed,label);}
const draft:RecordInput={kind:'DOCUMENT',title:'Source',subject:'Thai',grade:'PK',source_id:null,visibility:'PRIVATE',status:'DRAFT',metadata:{sourceTaxonomy:{original:'label'}}};
function fixture(){let user:any={id:'p',organizationId:'ORG',status:'ACTIVE'};let mode:any='supabase';let failure=false,swap=false;const writes:any[]=[];const filters:any[]=[];
 const runtime:AdminRuntime={user:()=>user,mode:()=>mode,subscribe:()=>()=>{}};
 const client={auth:{getSession:async()=>({data:{session:{user:{id:'a'}}}}),getUser:async()=>({data:{user:{id:'a'}}})},from(table:string){const q={select:()=>q,order:()=>q,eq:(key:string,value:any)=>{filters.push({table,key,value});return q;},maybeSingle:async()=>({data:{id:'p',auth_user_id:'a',status:'ACTIVE',organization_id:'ORG',memberships:[{role_id:'ADMIN',organization_id:'ORG'}]}}),range:async()=>({data:[],error:failure?{}:null}),insert:(value:any)=>{writes.push(value);return q;},update:(value:any)=>{writes.push(value);return q;},single:async()=>{if(swap)user={...user,id:'other'};return {data:failure?null:{id:'record'},error:failure?{}:null};}};return q;}} as unknown as AdminClient;
 const service=createBackendService(client,runtime,{profileId:'p',principalId:'a',organizationId:'ORG'});
 return {service,writes,filters,mock:()=>{mode='mock';},fail:()=>{failure=true;},swap:()=>{swap=true;}};
}
async function run(){
 validateRecord(draft);check(true,'Non-Math early-year metadata accepted');
 await rejected(()=>validateRecord({...draft,title:' '}),'Blank title rejected');
 await rejected(()=>validateRecord({...draft,subject:'Unlisted'}),'Unsupported subject rejected');
 await rejected(()=>validateRecord({...draft,metadata:[]}),'Array metadata rejected');
 const f=fixture();await f.service.save(draft);check(f.writes[0].organization_id==='ORG','Create fixes authorized organization');
 const existing={...draft,id:'record',organization_id:'ORG',version:4,updated_at:''};await f.service.save(draft,existing);
 check(f.filters.some(x=>x.key==='version'&&x.value===4),'Update carries expected version');
 await rejected(()=>f.service.updateProfile('p','Admin','DISABLED'),'Self lockout blocked');
 const bad=fixture();bad.mock();await rejected(()=>bad.service.save(draft),'Mock backend mutation denied');check(!bad.writes.length,'Mock denial occurs before mutation');
 const stale=fixture();stale.swap();await rejected(()=>stale.service.save(draft),'Account switch cannot return stale successful save');
 const fail=fixture();fail.fail();await rejected(()=>fail.service.save(draft),'Database failure not reported as saved');await rejected(()=>fail.service.read('game_backend_records'),'Missing migration produces explicit read error');
 const read=fixture();await read.service.read('game_session_results');check(!read.filters.some(x=>x.table==='game_session_results'&&x.key==='organization_id'),'Result query uses existing session RLS, not nonexistent column');
 const runs=[{id:'1',profile_id:'a',status:'COMPLETED',started_at:'2026-09-01T12:00:00Z'},{id:'2',profile_id:'b',status:'STARTED',started_at:'2026-09-02T12:00:00Z'},{id:'3',profile_id:'a',status:'COMPLETED',started_at:'2026-09-03T12:00:00Z'}];
 const sessions=[{id:'1',status:'VERIFIED'},{id:'3',status:'SUBMITTED'}];const results=[{session_id:'1',result:{accuracy:0,isPassed:false,totalTimeSec:0}},{session_id:'3',result:{accuracy:100,isPassed:true,totalTimeSec:100}}];
 const a=aggregateRuns(runs,sessions,results);check(a.players===2&&a.started===3,'Unique players and runs counted separately');check(a.verified===1&&a.accuracy===0&&a.passed===0,'Unverified evidence excluded; score zero preserved');check(a.averageDuration===0,'Duration zero not treated as missing');check(aggregateRuns([],[],[]).accuracy===null,'No evidence yields unavailable metric');check(aggregateRuns(runs,[],[]).passPercent===null,'Missing verified passes do not become zero percent');
 check(usageTrend(runs,sessions,results,'month')[0].period==='2026-09-01','Monthly UTC chart data');check(usageTrend(runs,sessions,results,'week')[0].period==='2026-08-31','Weekly UTC Monday chart data');
 check(csv([['=CMD()', 'a"b',0]]).includes("'=CMD()"),'CSV formula injection escaped');check(csv([['a"b']])==='"a""b"','CSV quotes escaped');
 console.log(`Backend workspace: ${passed} checks passed; fake-client unit tests, not hosted validation.`);
}
run().catch(e=>{console.error(e);(globalThis as any).process.exitCode=1;});
