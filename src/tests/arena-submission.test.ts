import { arenaAnswerHandler, replayRealtimeArenaAnswer, submitAuthenticatedArenaAnswer } from '../../server/arena-submission';
import { getAllCanonicalQuestions } from '../engine/drill-engine';
import type { RealtimeArenaParticipant } from '../types/realtime-arena';
import type { SupabaseClient } from '@supabase/supabase-js';

async function run(){
  let passed=0;
  const check=(value:unknown,label:string)=>{if(!value)throw new Error(label);passed++;console.log(`PASS: ${label}`);};
  const prior:RealtimeArenaParticipant={id:'p',learnerId:'learner',userCode:'L',displayName:'Learner',avatarId:'BOY_WIZARD',heroClass:'CHRONOMANCER',
    isConnected:true,isAnswered:false,score:0,streak:0,accuracy:100,totalAnswered:0,correctCount:0,avgTimeSec:0,joinedAt:'',lastActiveAt:''};
  const q=getAllCanonicalQuestions().find(q=>q.options.some(o=>o.isCorrect)&&q.options.some(o=>!o.isCorrect))!;
  const correct=q.options.find(o=>o.isCorrect)!.id,wrong=q.options.find(o=>!o.isCorrect)!.id;
  const win=await replayRealtimeArenaAnswer(prior,q.id,correct,5);
  check(win.scoreGained===155 && win.damageDealt===250 && win.participant.totalAnswered===1,'Trusted adapter preserves realtime scorer golden vector');
  check(prior.score===0 && prior.totalAnswered===0,'Replay does not mutate supplied prior state');
  const loss=await replayRealtimeArenaAnswer(win.participant,q.id,wrong,10);
  check(loss.scoreGained===0 && loss.damageDealt===0 && loss.participant.streak===0 && loss.participant.accuracy===50,'Wrong answer preserves frozen zero-award and accuracy behavior');
  let invalid=false;try{await replayRealtimeArenaAnswer(prior,q.id,'forged',5);}catch{invalid=true;}
  check(invalid,'Unknown canonical option rejected');
  const client={auth:{getUser:async()=>({data:{user:null},error:null})}} as unknown as SupabaseClient;
  const handler=arenaAnswerHandler(client);
  const request=(body:unknown,token=true)=>new Request('http://localhost/arena/answers',{method:'POST',headers:token?{authorization:'Bearer fake'}:{},body:JSON.stringify(body)});
  const body={roundId:'30000000-0000-0000-0000-000000000001',selectedOptionId:correct};
  check((await handler(request(body,false))).status===401,'Arena rejects missing credentials');
  check((await handler(request(body))).status===401,'Arena rejects server-invalid credentials');
  for(const field of ['isCorrect','score','timeSpentSec','profileId'])
    check((await handler(request({...body,[field]:999}))).status===400,`Arena rejects browser-supplied ${field}`);
  check((await handler(request({...body,selectedOptionId:'x'.repeat(5000)}))).status===413,'Arena rejects oversized body');
  check((await handler(new Request('http://localhost/arena/answers'))).status===405,'Arena mutation requires POST');
  // Query-aware fake: identity comes only from verified auth, never input IDs.
  const dbParticipant={id:'p',learner_id:'learner',room_id:'room',user_code:'L',display_name:'Learner',avatar_id:'BOY_WIZARD',hero_class:'CHRONOMANCER',
    is_connected:true,score:0,streak:0,accuracy:100,total_answered:0,correct_count:0,avg_time_sec:0,joined_at:'',last_active_at:''};
  const tables:Record<string,Record<string,unknown>[]>= {
    profiles:[{id:'learner',auth_user_id:'verified',status:'ACTIVE',academic_year:'2569'}],
    arena_rounds:[{id:body.roundId,room_id:'room',question_id:q.id,status:'ACTIVE',started_at:new Date(1000).toISOString(),time_limit_sec:30}],
    arena_rooms:[{id:'room',organization_id:'org',classroom_id:'class',academic_year:'2569',mode:'STANDARD_DUEL',status:'LIVE'}],
    classroom_enrollments:[{id:'e',learner_profile_id:'learner',organization_id:'org',classroom_id:'class',academic_year:'2569',status:'ACTIVE'}],
    memberships:[{profile_id:'learner',organization_id:'org',role_id:'LEARNER'}],
    arena_participants:[dbParticipant],arena_answers:[],
  };
  let calls=0;let commitPayload:Record<string,unknown>|null=null;
  const trusted={auth:{getUser:async(token:string)=>({data:{user:token==='valid'?{id:'verified'}:null},error:null})},
    from(table:string){
      let selected=tables[table]??[];
      const query={select:()=>query,eq:(key:string,value:unknown)=>{selected=selected.filter(row=>row[key]===value);return query;},
        in:(key:string,values:unknown[])=>{selected=selected.filter(row=>values.includes(row[key]));return query;},
        single:async()=>({data:selected[0]??null,error:null}),maybeSingle:async()=>({data:selected[0]??null,error:null}),
        then:(resolve:(v:unknown)=>unknown)=>Promise.resolve({data:selected,error:null}).then(resolve)};
      return query;
    },
    async rpc(_name:string,args:Record<string,unknown>){calls++;commitPayload=args;return {data:{selected_option_id:args.p_option_id},error:null};},
  } as unknown as SupabaseClient;
  await submitAuthenticatedArenaAnswer(trusted,'valid',body,()=>6000);
  check(calls===1 && (commitPayload as unknown as Record<string,unknown>).p_participant_id==='p','Verified principal selects owned Arena participant');
  check((commitPayload as unknown as Record<string,unknown>).p_time_sec===5 && (commitPayload as unknown as Record<string,unknown>).p_score===155,'Server clock and frozen scorer supply commit values');
  const expectReject=async(action:()=>Promise<unknown>,label:string)=>{let rejected=false;try{await action();}catch{rejected=true;}check(rejected,label);};
  await expectReject(()=>submitAuthenticatedArenaAnswer(trusted,'valid',body,()=>40000),'Server rejects expired round before scoring');
  tables.classroom_enrollments[0].status='INACTIVE';
  await expectReject(()=>submitAuthenticatedArenaAnswer(trusted,'valid',body,()=>6000),'Server rejects revoked enrollment');
  tables.classroom_enrollments[0].status='ACTIVE';
  tables.arena_participants[0].learner_id='other';
  await expectReject(()=>submitAuthenticatedArenaAnswer(trusted,'valid',body,()=>6000),'Server cannot submit for another student participant');
  tables.arena_participants[0].learner_id='learner';
  tables.arena_answers.push({round_id:body.roundId,participant_id:'p',selected_option_id:correct});
  const beforeRetry=calls;
  await submitAuthenticatedArenaAnswer(trusted,'valid',body,()=>40000);
  check(calls===beforeRetry,'Committed answer retry succeeds after deadline without another award');
  await expectReject(()=>submitAuthenticatedArenaAnswer(trusted,'valid',{...body,selectedOptionId:wrong},()=>6000),'Server rejects conflicting answer replay');
  console.log(`Arena submission: ${passed} passed`);
}
void run();
