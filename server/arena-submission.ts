import type { SupabaseClient } from '@supabase/supabase-js';
import { getAllCanonicalQuestions } from '../src/engine/drill-engine';
import { RealtimeArenaService } from '../src/services/realtime-arena-service';
import type { RealtimeArenaParticipant } from '../src/types/realtime-arena';
import type { AuthUser } from '../src/auth/types';

const canonical = new Map(getAllCanonicalQuestions().map(q=>[q.id,q]));
export class ArenaRequestError extends Error { constructor(public status:number,message:string) {super(message);} }
export interface ArenaSubmission { roundId:string; selectedOptionId:string }

async function readSmallBody(request:Request) {
  const reader=request.body?.getReader();
  if (!reader) return '';
  const chunks:Uint8Array[]=[];let size=0;
  try {
    for (;;) {
      const next=await reader.read();
      if (next.done) break;
      size+=next.value.byteLength;
      if (size>4096) {await reader.cancel();throw new ArenaRequestError(413,'Request too large');}
      chunks.push(next.value);
    }
  } finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return new TextDecoder().decode(bytes);
}

/** Reuse the existing realtime engine instead of copying or unifying Arena formulas. */
export async function replayRealtimeArenaAnswer(prior:RealtimeArenaParticipant, questionId:string, selectedOptionId:string, timeSec:number) {
  const question=canonical.get(questionId);
  if (!question) throw new ArenaRequestError(422,'Unknown canonical question');
  const option=question.options.find(option=>option.id===selectedOptionId);
  if (!option) throw new ArenaRequestError(422,'Unknown option');
  const engine=new RealtimeArenaService();
  const evaluatorIdentity:AuthUser={id:'server-evaluator',userCode:'',displayName:'',role:'PROFESSOR',status:'ACTIVE',organizationId:'',academicYear:'',createdAt:''};
  const room=await engine.createRoom({professor:evaluatorIdentity,classroomId:'',title:'Server replay',questions:[question]});
  room.participants[prior.learnerId]=structuredClone(prior);
  const result=await engine.submitAnswer(room.id,prior.learnerId,{selectedOptionId,isCorrect:option.isCorrect,timeSpentSec:timeSec});
  return {...result,isCorrect:option.isCorrect};
}

/** The browser sends only a round UUID and an option ID. Identity/timing/outcome are server-derived. */
export async function submitAuthenticatedArenaAnswer(client:SupabaseClient, token:string, input:ArenaSubmission, now=Date.now) {
  const {data:auth,error:authError}=await client.auth.getUser(token);
  if (authError || !auth.user) throw new ArenaRequestError(401,'Authentication required');
  const {data:profile,error:profileError}=await client.from('profiles').select('*').eq('auth_user_id',auth.user.id).single();
  if (profileError || profile?.status!=='ACTIVE') throw new ArenaRequestError(403,'Active game profile required');
  const {data:round,error:roundError}=await client.from('arena_rounds').select('*').eq('id',input.roundId).single();
  if (roundError || !round) throw new ArenaRequestError(404,'Round unavailable');
  const {data:room,error:roomError}=await client.from('arena_rooms').select('*').eq('id',round.room_id).single();
  if (roomError || !room) throw new ArenaRequestError(404,'Round unavailable');
  const {data:enrollment}=await client.from('classroom_enrollments').select('id')
    .eq('learner_profile_id',profile.id).eq('organization_id',room.organization_id).eq('classroom_id',room.classroom_id)
    .eq('academic_year',room.academic_year).eq('status','ACTIVE').maybeSingle();
  const {data:membership}=await client.from('memberships').select('role_id').eq('profile_id',profile.id)
    .eq('organization_id',room.organization_id).in('role_id',['LEARNER','EXTERNAL_LEARNER']);
  if (!enrollment || !membership?.length || profile.academic_year!==room.academic_year) throw new ArenaRequestError(403,'Enrolled learner required');
  for (let retry=0;retry<3;retry++) {
    const {data:p,error:pError}=await client.from('arena_participants').select('*').eq('room_id',room.id).eq('learner_id',profile.id).single();
    if (pError || !p) throw new ArenaRequestError(403,'Join the room first');
    const {data:existing,error:existingError}=await client.from('arena_answers').select('*').eq('round_id',round.id).eq('participant_id',p.id).maybeSingle();
    if (existingError) throw new ArenaRequestError(503,'Unable to read answer');
    if (existing) {
      if (existing.selected_option_id!==input.selectedOptionId) throw new ArenaRequestError(409,'Answer already submitted');
      return existing;
    }
    if (!['STANDARD_DUEL','SPEED_CHALLENGE'].includes(room.mode)) throw new ArenaRequestError(422,'This Arena mode needs its own trusted adapter');
    const elapsed=(now()-Date.parse(round.started_at))/1000;
    if (room.status!=='LIVE' || !['LIVE','ACTIVE'].includes(round.status) || !Number.isFinite(elapsed)
      || elapsed<0 || elapsed>round.time_limit_sec) throw new ArenaRequestError(409,'Round not accepting answers');
    const prior:RealtimeArenaParticipant={id:p.id,learnerId:p.learner_id,userCode:p.user_code,displayName:p.display_name,
      avatarId:p.avatar_id,heroClass:p.hero_class,isConnected:p.is_connected,isAnswered:false,score:p.score,streak:p.streak,
      accuracy:Number(p.accuracy),totalAnswered:p.total_answered,correctCount:p.correct_count,avgTimeSec:Number(p.avg_time_sec),
      joinedAt:p.joined_at,lastActiveAt:p.last_active_at};
    const result=await replayRealtimeArenaAnswer(prior,round.question_id,input.selectedOptionId,elapsed);
    const {data:committed,error}=await client.rpc('commit_game_arena_answer',{
      p_round_id:round.id,p_participant_id:p.id,p_expected_answered:p.total_answered,p_option_id:input.selectedOptionId,
      p_is_correct:result.isCorrect,p_time_sec:elapsed,p_score:result.scoreGained,p_damage:result.damageDealt,p_next_stats:result.participant,
    });
    if (!error) return committed;
    if (error.code!=='40001') throw new ArenaRequestError(409,'Answer could not be committed');
  }
  throw new ArenaRequestError(409,'Concurrent answer update; retry the same answer');
}

export function arenaAnswerHandler(client:SupabaseClient) {
  return async (request:Request):Promise<Response> => {
    try {
      if (request.method!=='POST') return new Response('Method not allowed',{status:405,headers:{Allow:'POST'}});
      const token=request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
      if (!token) throw new ArenaRequestError(401,'Authentication required');
      const raw=await readSmallBody(request);
      let body:ArenaSubmission;
      try {body=JSON.parse(raw);} catch {throw new ArenaRequestError(400,'Invalid JSON');}
      if (!body || typeof body!=='object' || Object.keys(body).some(key=>!['roundId','selectedOptionId'].includes(key))
       || !/^[0-9a-f-]{36}$/i.test(body.roundId) || typeof body.selectedOptionId!=='string' || body.selectedOptionId.length>200)
        throw new ArenaRequestError(400,'Only roundId and selectedOptionId are accepted');
      return Response.json(await submitAuthenticatedArenaAnswer(client,token,body),{headers:{'Cache-Control':'no-store'}});
    } catch(error) {
      return Response.json({error:error instanceof ArenaRequestError?error.message:'Service unavailable'},
        {status:error instanceof ArenaRequestError?error.status:503,headers:{'Cache-Control':'no-store'}});
    }
  };
}
