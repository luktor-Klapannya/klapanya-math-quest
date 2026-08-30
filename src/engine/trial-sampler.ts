import { QuestionItem } from '../types';
import { getQuestionsByStage } from '../content/dojo-database';
import { getShrineQuestions } from '../content/shrine-database';
import { getGatewayQuestions } from '../content/onet-database';
import { getBossQuestions } from '../content/boss-database';
import { getGeometryQuestions } from '../content/geometry-database';
import { getQuestQuestions } from '../content/quest-database';

export function sampleGrandmasterTrialQuestions(): QuestionItem[] {
  const trialQuestions: QuestionItem[] = [];
  const pickedIds = new Set<string>();

  function addSample(pool: QuestionItem[], count: number) {
    let added = 0;
    for (let i = 0; i < pool.length && added < count; i++) {
      const q = pool[i];
      if (!pickedIds.has(q.id)) {
        pickedIds.add(q.id);
        trialQuestions.push(q);
        added++;
      }
    }
  }

  // 1. Training Dojo: 10Q (2 from D1, 2 from D2, 2 from D3, 2 from D4, 1 from D5, 1 from D6)
  addSample(getQuestionsByStage('D1'), 2);
  addSample(getQuestionsByStage('D2'), 2);
  addSample(getQuestionsByStage('D3'), 2);
  addSample(getQuestionsByStage('D4'), 2);
  addSample(getQuestionsByStage('D5'), 1);
  addSample(getQuestionsByStage('D6'), 1);

  // 2. Farming Shrine: 10Q (3 from F1, 3 from F2, 2 from F3, 2 from F4)
  addSample(getShrineQuestions('F1'), 3);
  addSample(getShrineQuestions('F2'), 3);
  addSample(getShrineQuestions('F3'), 2);
  addSample(getShrineQuestions('F4'), 2);

  // 3. O-NET Gateway: 10Q (3 from ONET-1, 3 from ONET-2, 2 from ONET-3, 2 from ONET-4)
  addSample(getGatewayQuestions('ONET-1'), 3);
  addSample(getGatewayQuestions('ONET-2'), 3);
  addSample(getGatewayQuestions('ONET-3'), 2);
  addSample(getGatewayQuestions('ONET-4'), 2);

  // 4. Boss 1: 2Q
  addSample(getBossQuestions('BOSS-1'), 2);

  // 5. Boss 2: 2Q
  addSample(getBossQuestions('BOSS-2'), 2);

  // 6. Boss 3: 2Q
  addSample(getBossQuestions('BOSS-3'), 2);

  // 7. Forbidden Geometry Ruins: 2Q
  addSample(getGeometryQuestions(), 2);

  // 8. Arctic Quest Board: 2Q
  addSample(getQuestQuestions(), 2);

  return trialQuestions;
}
