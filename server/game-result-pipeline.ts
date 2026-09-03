/** Server-only boundary. Never import this module into the browser application. */
import type { SupabaseClient } from '@supabase/supabase-js';
import { ALL_DOJO_QUESTIONS } from '../src/content/dojo-database';
import { ALL_SHRINE_QUESTIONS } from '../src/content/shrine-database';
import { ALL_GATEWAY_QUESTIONS } from '../src/content/onet-database';
import { ALL_BOSS_QUESTIONS } from '../src/content/boss-database';
import { ALL_GEOMETRY_QUESTIONS } from '../src/content/geometry-database';
import { ALL_QUEST_QUESTIONS } from '../src/content/quest-database';
import { evaluateGridResponse } from '../src/engine/grid-normalizer';
import type { GameAttempt } from '../src/services/game-evidence';
import type { PlayerProfile, QuestionItem } from '../src/types';

const corpus: QuestionItem[] = [ALL_DOJO_QUESTIONS,ALL_SHRINE_QUESTIONS,ALL_GATEWAY_QUESTIONS,ALL_BOSS_QUESTIONS,
  ALL_GEOMETRY_QUESTIONS,ALL_QUEST_QUESTIONS].flatMap(bank => Object.values(bank).flat());
const questions = new Map(corpus.map(question => [question.id,question]));

export function validateCanonicalAttempts(attempts: GameAttempt[]) {
  if (!Array.isArray(attempts) || !attempts.length || attempts.length > 1000) throw new Error('Invalid attempts');
  return attempts.map(attempt => {
    const question = questions.get(attempt.questionId);
    if (!question) throw new Error(`Unknown canonical question: ${attempt.questionId}`);
    if (!Number.isFinite(attempt.timeSpentSec) || attempt.timeSpentSec < 0) throw new Error('Invalid response time');
    if (attempt.hintLevelUsed !== undefined && ![0,1,2].includes(attempt.hintLevelUsed)) throw new Error('Invalid hint level');
    if (attempt.selectedOptionId && !question.options.some(option=>option.id===attempt.selectedOptionId)) throw new Error('Unknown option ID');
    // Mode-specific numerical policies are checked by the frozen-mode replay below.
    const isCorrect = question.mechanicType === 'GRID_RESPONSE'
      ? evaluateGridResponse(attempt.numericalInput || '',question.correctNumericalValue || '',question.numericValidation || 'TOLERANCE',question.roundingDecimals || 2)
      : question.options.some(option=>option.id===attempt.selectedOptionId && option.isCorrect);
    return { attempt, question, isCorrect };
  });
}

export interface TrustedReplay {
  version: string;
  // Must verify mode, issued question sequence, timing/aids and progression eligibility.
  // This dependency comes from server code, never a request body or a client checkpoint.
  evaluate(input: {
    session: { id: string; stage_id: string; engine_version: string; evidence: { attempts: GameAttempt[] } };
    attempts: ReturnType<typeof validateCanonicalAttempts>;
    priorVerifiedState: PlayerProfile | null;
  }): Promise<{ result: Record<string,unknown>; rewards: Record<string,unknown>; nextState: PlayerProfile }>;
}

/** No replay implementation => fail closed, never promote browser totals to verified rewards. */
export async function verifyAndCommitGameSession(client: SupabaseClient, sessionId: string, replay: TrustedReplay) {
  if (!replay?.evaluate || !replay.version) throw new Error('A reviewed frozen-mode server replay is required');
  const { data: session, error } = await client.from('game_sessions').select('*').eq('id',sessionId).single();
  if (error || !session) throw error || new Error('Session not found');
  if (session.status === 'VERIFIED') {
    const { data: existing, error: existingError } = await client.from('game_session_results').select('*').eq('session_id',session.id).single();
    if (existingError) throw existingError;
    return existing;
  }
  if (session.status !== 'SUBMITTED') throw new Error('Session cannot be verified');
  const { data: prior, error: priorError } = await client.from('game_verified_progress').select('*').eq('profile_id',session.profile_id).maybeSingle();
  if (priorError) throw priorError;
  const attempts = validateCanonicalAttempts(session.evidence.attempts);
  const evaluated = await replay.evaluate({ session, attempts, priorVerifiedState:prior?.state || null });
  const { data, error: commitError } = await client.rpc('commit_verified_game_result', {
    p_session_id:session.id, p_expected_version:prior?.version || 0,
    p_result:evaluated.result, p_rewards:evaluated.rewards, p_next_state:evaluated.nextState,
    p_validator_version:replay.version,
  });
  if (commitError) throw commitError;
  return data;
}
