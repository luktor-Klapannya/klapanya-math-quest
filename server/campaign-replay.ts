import {DOJO_STAGES,getDojoQuestions} from '../src/content/dojo-database';
import {getAllCanonicalQuestions} from '../src/engine/drill-engine';
import {calculateCoinReward,calculateXpReward} from '../src/engine/economy';
import {WeightedSkillMasteryEngineV1} from '../src/progression/mastery-engine';
import {DEFAULT_PROFILE} from '../src/storage/local-storage-adapter';
import type {PlayerProfile,QuestionItem} from '../src/types';
import type {GameAttempt} from '../src/services/game-evidence';

export const CAMPAIGN_VALIDATOR='dojo-frozen-v1';
export interface CampaignDefinition {engine:'BATTLE_V1';stageId:string;heroId:PlayerProfile['heroId'];questionIds:string[]}
const corpus=new Map(getAllCanonicalQuestions().map(q=>[q.id,q]));
export function campaignDefinition(stageId:string,heroId:PlayerProfile['heroId'],prior:PlayerProfile|null):CampaignDefinition {
  const stage=DOJO_STAGES.find(s=>s.id===stageId);
  if(!stage)throw new Error('Unsupported normal campaign stage');
  if(!['CHRONOMANCER','PALADIN','SNIPER','ROGUE'].includes(heroId))throw new Error('Unknown hero');
  if(stage.requiredStageId&&!prior?.clearedStages.includes(stage.requiredStageId))throw new Error('Verified prerequisite not met');
  return {engine:'BATTLE_V1',stageId,heroId,questionIds:getDojoQuestions(stageId).map(q=>q.id)};
}

/** Mirrors BattleScreen and App's existing normal Dojo transitions using frozen helpers.
 * Raw response times/hint use are telemetry inputs, not browser-calculated rewards.
 * This is a learning-game verifier, not proof against a modified client/answer-key access.
 */
export function replayCampaign(definition:CampaignDefinition,attempts:GameAttempt[],prior:PlayerProfile|null) {
  const canonical=getDojoQuestions(definition.stageId).map(q=>q.id);
  if(definition.engine!=='BATTLE_V1'||!canonical.length||JSON.stringify(canonical)!==JSON.stringify(definition.questionIds))throw new Error('Unsupported campaign definition');
  if(!Array.isArray(attempts)||attempts.length<canonical.length||attempts.length>1000)throw new Error('Incomplete campaign attempts');
  const initial=structuredClone(prior||DEFAULT_PROFILE);const state=structuredClone(initial);
  state.heroId=definition.heroId;
  const mastery=new WeightedSkillMasteryEngineV1();
  let positions=new Set([0]),correctCount=0,combo=0,earnedCoins=0,earnedXp=0,totalTimeSec=0;
  let previous:QuestionItem|null=null,previousCorrect=true;
  for(const a of attempts){
    const q=corpus.get(a.questionId);
    if(!q)throw new Error('Unknown canonical question');
    // The existing remediation action may insert a related canonical question after a wrong answer.
    const related=previous&&!previousCorrect&&q.id!==previous.id&&(q.topic===previous.topic||q.skillTags.some(s=>previous!.skillTags.includes(s)));
    const next=new Set<number>();
    for(const index of positions){if(a.questionId===canonical[index])next.add(index+1);if(related)next.add(index);}
    if(!next.size)throw new Error('Invalid campaign/remediation sequence');positions=next;
    if(!Number.isInteger(a.timeSpentSec)||a.timeSpentSec<1||a.timeSpentSec>86400)throw new Error('Invalid response time');
    const hint=a.hintLevelUsed??0;if(![0,1,2].includes(hint))throw new Error('Invalid hint level');
    if(a.selectedOptionId!=null&&typeof a.selectedOptionId!=='string')throw new Error('Invalid response');
    const option=q.options.find(o=>o.id===a.selectedOptionId);
    if(a.selectedOptionId!=null&&!option)throw new Error('Unknown canonical option');
    // Normal BattleScreen uses option metadata, including remediation questions. Do not substitute exam/grid semantics.
    const correct=option?.isCorrect===true;
    totalTimeSec+=a.timeSpentSec;
    if(correct){
      correctCount++;combo++;
      earnedCoins+=calculateCoinReward(q.rewardCoins,a.timeSpentSec,q.targetTimeSec,combo,definition.heroId==='CHRONOMANCER');
      earnedXp+=calculateXpReward(q.rewardXp,true,hint);
      for(const skill of q.skillTags)state.skillMastery[skill]=mastery.calculateDelta({currentMastery:state.skillMastery[skill]||0.2,isCorrect:true,timeRatio:a.timeSpentSec/q.targetTimeSec,hintLevelUsed:hint,attemptCount:1,weight:1});
    }else combo=0; // Normal BattleScreen does not award wrong-answer XP or negative mastery.
    previous=q;previousCorrect=correct;
  }
  if(!positions.has(canonical.length))throw new Error('Base stage questions missing');
  const accuracy=Math.round(correctCount/attempts.length*100),isPassed=accuracy>=80;
  const unlockedGear=definition.stageId==='D1'&&isPassed&&!state.unlockedGear.includes('BLADE_OF_CALCULATION')?'BLADE_OF_CALCULATION':null;
  const masteryUpdates=Object.fromEntries(Object.entries(state.skillMastery).map(([k,after])=>[k,{before:initial.skillMastery[k]||0.2,after}]));
  state.xp+=earnedXp;state.coins+=earnedCoins;
  if(isPassed&&!state.clearedStages.includes(definition.stageId))state.clearedStages.push(definition.stageId);
  state.stageStars[definition.stageId]=Math.max(state.stageStars[definition.stageId]||0,accuracy>=90?3:accuracy>=80?2:1);
  state.stageBestAccuracy[definition.stageId]=Math.max(state.stageBestAccuracy[definition.stageId]||0,accuracy);
  if(unlockedGear)state.unlockedGear.push(unlockedGear);
  const result={stageId:definition.stageId,totalQuestions:attempts.length,correctCount,accuracy,totalTimeSec,averageTimeSec:Math.round(totalTimeSec/attempts.length),earnedCoins,earnedXp,masteryUpdates,unlockedGear,isPassed,isMasteryMet:accuracy>=90};
  return {result,rewards:{xp:earnedXp,coins:earnedCoins,unlockedGear},nextState:state};
}
