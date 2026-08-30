import { Question } from '../types';
import { RemediationFeedback } from '../types/learning';
import { getAllCanonicalQuestions } from './drill-engine';

export function analyzeWrongAnswer(
  question: Question,
  userAnswer: string,
  correctAnswer: string
): RemediationFeedback {
  const misconception = question.misconceptionTags?.[0] || 'CALCULATION_OR_REASONING_MISCONCEPTION';
  
  // Find a similar question with the same skill tag or topic
  const allQuestions = getAllCanonicalQuestions();
  const similarPool = allQuestions.filter(
    (q) => q.id !== question.id && (
      q.topic === question.topic || 
      q.skillTags.some((t: string) => question.skillTags.includes(t))
    )
  );

  const similarQuestion = similarPool.length > 0
    ? similarPool[Math.floor(Math.random() * similarPool.length)]
    : undefined;

  let trapExplanation = question.trapWarning || 'ระวังการคำนวณสลับลำดับ หรือการใช้ฐานตัวเลขเปรียบเทียบที่ผิดตำแหน่ง';
  if (misconception.includes('PEMDAS') || misconception.includes('OPERATOR')) {
    trapExplanation = 'กับดักลำดับเครื่องหมาย: คำนวณจากซ้ายไปขวาโดยลืมทำเครื่องหมายคูณ (×) หรือหาร (÷) ก่อนบวกลบ';
  } else if (misconception.includes('PERCENT') || misconception.includes('PROFIT')) {
    trapExplanation = 'กับดักฐานร้อยละ: คิดกำไร/ขาดทุนเทียบกับราคาขายแทนที่จะเทียบกับราคาทุน 100%';
  } else if (misconception.includes('FRACTION') || misconception.includes('REMAINDER')) {
    trapExplanation = 'กับดักเศษส่วน: นำเศษส่วนมาบวกกันทันทีโดยไม่ตรวจสอบว่าเป็น "ของที่เหลือ" หรือไม่';
  } else if (misconception.includes('SCALE') || misconception.includes('AREA')) {
    trapExplanation = 'กับดักมาตราส่วนพื้นที่: ลืมยกกำลังสองของอัตราส่วนความยาวเมื่อเปลี่ยนเป็นหน่วยพื้นที่';
  }

  return {
    questionId: question.id,
    isCorrect: false,
    userAnswer,
    correctAnswer,
    misconceptionIdentified: misconception,
    trapExplanation,
    scaffoldHint: question.powerUpHint || 'พิจารณาความสัมพันธ์ของตัวเลขและลำดับขั้นตอนหลัก',
    fullSolution: question.explanation || 'ดูวิธีคำนวณอย่างเป็นขั้นตอนเพื่อป้องกันข้อผิดพลาดซ้ำ',
    shortcutTip: question.shortcutNote,
    similarQuestion,
  };
}
