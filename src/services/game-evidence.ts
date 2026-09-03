import { useMemo } from 'react';
import { authSession } from '../auth/session';
import { getSupabaseClient } from '../lib/supabaseClient';
import { EvidenceOutbox, flushOwnedEvidence } from '../storage/evidence-outbox';
import { campaignRequest } from './campaign-client';

export interface GameAttempt {
  questionId: string;
  selectedOptionId?: string | null;
  numericalInput?: string | null;
  timeSpentSec: number;
  hintLevelUsed?: number;
}

export async function flushGameEvidence(owner: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client || authSession.getAdapterMode() !== 'supabase' || authSession.getCurrentUser()?.id !== owner) return;
  const currentOwner=()=>authSession.getAdapterMode()==='supabase'?authSession.getCurrentUser()?.id || null:null;
  await flushOwnedEvidence(owner,new EvidenceOutbox(localStorage),currentOwner,async item=>{
    if((item.evidence.context as {verifiedCampaignRun?:boolean})?.verifiedCampaignRun){
      await campaignRequest('verify',{sessionId:item.sessionId,attempts:item.evidence.attempts},owner);
      window.dispatchEvent(new Event('game-campaign-verified'));
      return;
    }
    const { error } = await client.rpc('submit_game_evidence', {
      p_profile_id:owner, p_session_id:item.sessionId, p_stage_id:item.stageId,
      p_engine_version:'math-quest-v1.0', p_evidence:item.evidence,
    });
    if (error) throw error;
  });
}

/** Observation only: does not calculate or change game outcomes. */
export class GameEvidenceRecorder {
  private attempts: GameAttempt[] = [];
  private sessionId:string = crypto.randomUUID();
  private finished = false;
  constructor(private stageId: string, private owner: string | null, private context:unknown = null, private trustedSessionId?:string) {if(trustedSessionId)this.sessionId=trustedSessionId;}
  record(attempt: GameAttempt) { if (!this.finished) {
    this.attempts.push({ ...attempt });
    if(this.trustedSessionId&&authSession.getCurrentUser()?.id===this.owner)void getSupabaseClient()?.rpc('touch_game_campaign_run',{p_run_id:this.sessionId}).then(()=>{},()=>{});
  } }
  finish(reportedResult: unknown): void {
    if (this.finished || !this.owner || authSession.getCurrentUser()?.id !== this.owner) return;
    try {
    new EvidenceOutbox(localStorage).put(this.owner,{sessionId:this.sessionId,stageId:this.stageId,
      evidence:{attempts:this.attempts,reportedResult,context:this.context}});
    this.finished = true;
    void flushGameEvidence(this.owner).catch(() => { /* Retained for next connection/login; no duplicate award. */ });
    } catch {
      // Storage failure must not alter the frozen game's completion calculations.
      window.dispatchEvent(new Event('game-evidence-save-error'));
    }
  }
}

export function useGameEvidence(stageId: string, context:unknown = null, trustedSessionId?:string) {
  const owner = authSession.getAdapterMode() === 'supabase' ? authSession.getCurrentUser()?.id || null : null;
  // Capture the context at run creation. A re-render must not reset the run identity.
  return useMemo(() => new GameEvidenceRecorder(stageId,owner,context,trustedSessionId), [stageId,owner,trustedSessionId]);
}
