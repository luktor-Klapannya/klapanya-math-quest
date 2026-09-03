import { calculateCoinReward, calculateXpReward, getRankFromXp } from '../engine/economy';
import { WeightedSkillMasteryEngineV1 } from '../progression/mastery-engine';
import { calculateBattleQuestionScore } from '../services/battle-service';
import { calculateSpeedGrade } from '../engine/speedrun-evaluator';
import { evaluateTopFormEligibility } from '../progression/top-form';
import { freshProfile } from '../storage/owned-progress';

let passed=0;
function check(condition:boolean,message:string) { if (!condition) throw new Error(message); passed++; console.log(`PASS: ${message}`); }
check(calculateCoinReward(100,5,10,2,false)===135,'Frozen coin speed/combo reward');
check(calculateCoinReward(100,5,10,2,true)===160,'Frozen Chronomancer reward');
check(calculateXpReward(100,true,1)===80,'Frozen level-one hint XP');
check(calculateXpReward(100,true,2)===50,'Frozen level-two hint XP');
check(calculateXpReward(100,false,0)===10,'Frozen incorrect-answer XP');
check(calculateBattleQuestionScore(false,1,10,3)===0,'Arena incorrect answer always zero');
check(calculateBattleQuestionScore(true,5,10,2)===145,'Arena accuracy/speed/streak score unchanged');
const mastery=new WeightedSkillMasteryEngineV1();
const input={currentMastery:0.2,isCorrect:true,timeRatio:0.6,hintLevelUsed:0,attemptCount:1,weight:1};
check(mastery.calculateDelta(input)===0.32,'Frozen mastery fluency bonus');
check(mastery.calculateDelta({...input,hintLevelUsed:2})===0.224,'Frozen mastery scaffolding penalty');
check(mastery.calculateDelta({...input,isCorrect:false})===0.14,'Frozen negative mastery evidence');
check(mastery.calculateDelta({...input,currentMastery:0.99})===1,'Frozen mastery upper bound');
check(getRankFromXp(1200).level===7,'Frozen XP-to-level progression');
check(!evaluateTopFormEligibility(freshProfile()).isEligible,'Default profile cannot bypass final progression gates');
check(calculateSpeedGrade({accuracy:59,averageTimeSec:1,targetTimeSec:10,maxCombo:20,totalQuestions:20,isTimeStopUsed:false,runMode:'RANKED'})==='TRAIN_AGAIN','Accuracy still dominates shrine speed');
console.log(`Frozen engine: ${passed} passed`);
