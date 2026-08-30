import { QuestionItem } from '../types';
import { getQuestionsByStage } from './dojo-database';

export const D1_QUESTIONS: QuestionItem[] = getQuestionsByStage('D1');
