import { QuestionItem, StageInfo } from '../types';

export const SHRINE_STAGES: StageInfo[] = [
  {
    id: 'F1',
    name: 'Reflex Aurora Shrine',
    thaiName: 'ศาลเจ้าที่ 1: สปีดรัน 5 วินาที (Reflex)',
    academicFocus: 'การคิดเลขในใจความเร็วสูง (5 วิ/ข้อ) สแกนหลักหน่วยและสูตรคูณอัตโนมัติ',
    questionCount: 30,
    targetTimeSec: 5,
    gearRewardId: 'AURORA_SHARD_I',
    requiredStageId: null, // First shrine station open by default
    passAccuracy: 80,
    masteryAccuracy: 95,
  },
  {
    id: 'F2',
    name: 'Sprint Aurora Shrine',
    thaiName: 'ศาลเจ้าที่ 2: สปีดรัน 10 วินาที (Sprint)',
    academicFocus: 'การคูณเลขสองหลักเร็ว, เทคนิคคูณ 11, ร้อยละพื้นฐาน และส่วนเติมเต็ม 100',
    questionCount: 30,
    targetTimeSec: 10,
    gearRewardId: 'AURORA_SHARD_II',
    requiredStageId: 'F1',
    passAccuracy: 80,
    masteryAccuracy: 95,
  },
  {
    id: 'F3',
    name: 'Precision Aurora Shrine',
    thaiName: 'ศาลเจ้าที่ 3: สปีดรัน 15 วินาที (Precision)',
    academicFocus: 'กำลังสองท้าย 5, ผลต่างกำลังสองในใจ และสมบัติการสลับที่/แจกแจง',
    questionCount: 30,
    targetTimeSec: 15,
    gearRewardId: 'AURORA_SHARD_III',
    requiredStageId: 'F2',
    passAccuracy: 80,
    masteryAccuracy: 95,
  },
  {
    id: 'F4',
    name: 'Grandmaster Mental Shrine',
    thaiName: 'ศาลเจ้าที่ 4: ปรมาจารย์คิดในใจ (Grandmaster)',
    academicFocus: 'การคำนวณลูกโซ่หลายขั้นตอน, แยกตัวประกอบในใจ และอนุกรมเลขคณิต',
    questionCount: 30,
    targetTimeSec: 15,
    gearRewardId: 'MASTER_MENTAL_CREST',
    requiredStageId: 'F3',
    passAccuracy: 85,
    masteryAccuracy: 95,
  },
];

function generateShrineQuestions(): Record<string, QuestionItem[]> {
  const bank: Record<string, QuestionItem[]> = {
    F1: [],
    F2: [],
    F3: [],
    F4: [],
  };

  // --- F1: Reflex 5-Second Speedrun (30 Questions) ---
  for (let i = 1; i <= 30; i++) {
    const a = 6 + (i % 7);
    const b = 7 + ((i * 3) % 6);
    const ans = a * b;
    bank.F1.push({
      id: `F1-${String(i).padStart(3, '0')}`,
      stageId: 'F1',
      topic: 'สปีดรันคิดเลขในใจ 5 วินาที',
      subtopic: `การคูณเร็วอัตโนมัติ ข้อ ${i}`,
      difficulty: 1,
      cognitiveLevel: 'KNOWING',
      mechanicType: 'SPEED_DUEL',
      skillTags: ['mental_math', 'calculation'],
      misconceptionTags: ['slow_retrieval_delay'],
      auditStatus: 'VERIFIED',
      questionText: `${a} × ${b} = ?`,
      options: [
        { id: 'opt-1', text: `${ans}`, isCorrect: true },
        { id: 'opt-2', text: `${ans - 2 > 0 ? ans - 2 : ans + 4}`, isCorrect: false },
        { id: 'opt-3', text: `${ans + 2}`, isCorrect: false },
        { id: 'opt-4', text: `${ans + (i % 2 === 0 ? 6 : -4)}`, isCorrect: false },
      ],
      powerUpHint: '💡 ตอบไวอัตโนมัติ!',
      explanation: `${a} × ${b} = ${ans}`,
      shortcutNote: 'ดึงคำตอบจากความจำอัตโนมัติใน 1 วินาที!',
      targetTimeSec: 5,
      rewardCoins: 20,
      rewardXp: 10,
    });
  }

  // --- F2: Sprint 10-Second Speedrun (30 Questions) ---
  for (let i = 1; i <= 30; i++) {
    let qText = '';
    let correctVal = '';
    let distractors: string[] = [];

    if (i % 3 === 1) {
      // Complement to 100 or 1000
      const base = 1000;
      const sub = 345 + i * 15;
      const ans = base - sub;
      qText = `${base} - ${sub} = ?`;
      correctVal = `${ans}`;
      distractors = [`${ans + 10}`, `${ans - 10}`, `${ans + 100}`];
    } else if (i % 3 === 2) {
      // Fast multiplication by 11
      const num = 18 + i * 2;
      const ans = num * 11;
      qText = `${num} × 11 = ?`;
      correctVal = `${ans}`;
      distractors = [`${ans - 10}`, `${ans + 10}`, `${ans + 100}`];
    } else {
      // Fast 50% or 25% calculation
      const num = 240 + i * 40;
      const ans = num / 4;
      qText = `25% ของ ${num} มีค่าเท่ากับเท่าใด`;
      correctVal = `${ans}`;
      distractors = [`${ans * 2}`, `${ans - 10}`, `${ans + 20}`];
    }

    bank.F2.push({
      id: `F2-${String(i).padStart(3, '0')}`,
      stageId: 'F2',
      topic: 'สปีดรันคิดเลขในใจ 10 วินาที',
      subtopic: `การคำนวณและส่วนเติมเต็ม ข้อ ${i}`,
      difficulty: 2,
      cognitiveLevel: 'KNOWING',
      mechanicType: 'SPEED_DUEL',
      skillTags: ['mental_math', 'calculation', 'number_sense'],
      misconceptionTags: ['subtraction_borrow_delay'],
      auditStatus: 'VERIFIED',
      questionText: qText,
      options: [
        { id: 'opt-1', text: correctVal, isCorrect: true },
        { id: 'opt-2', text: distractors[0], isCorrect: false },
        { id: 'opt-3', text: distractors[1], isCorrect: false },
        { id: 'opt-4', text: distractors[2], isCorrect: false },
      ],
      powerUpHint: '💡 25% คือการหารด้วย 4, 1000 ลบด้วยเลขใดให้นำ 9 ลบหลักหน้าและ 10 ลบหลักท้าย!',
      explanation: `ผลลัพธ์ที่ถูกต้องคือ ${correctVal}`,
      shortcutNote: 'สูตร All from 9 and last from 10 สำหรับการลบออกจาก 1,000!',
      targetTimeSec: 10,
      rewardCoins: 25,
      rewardXp: 12,
    });
  }

  // --- F3: Precision 15-Second Speedrun (30 Questions) ---
  for (let i = 1; i <= 30; i++) {
    let qText = '';
    let correctVal = '';
    let distractors: string[] = [];

    if (i % 2 === 1) {
      // Squares ending in 5
      const base = 25 + (i % 7) * 10;
      const ans = base * base;
      qText = `${base}² = ?`;
      correctVal = `${ans.toLocaleString()}`;
      distractors = [
        `${(ans - 200).toLocaleString()}`,
        `${(ans + 200).toLocaleString()}`,
        `${(ans + 100).toLocaleString()}`,
      ];
    } else {
      // Consecutive addition 1..n
      const n = 10 + i;
      const ans = (n * (n + 1)) / 2;
      qText = `1 + 2 + 3 + ... + ${n} = ?`;
      correctVal = `${ans}`;
      distractors = [`${ans - n}`, `${ans + n}`, `${ans + 10}`];
    }

    bank.F3.push({
      id: `F3-${String(i).padStart(3, '0')}`,
      stageId: 'F3',
      topic: 'สปีดรันคิดเลขในใจ 15 วินาที',
      subtopic: `กำลังสองและอนุกรมเลขคณิต ข้อ ${i}`,
      difficulty: 2,
      cognitiveLevel: 'APPLICATION',
      mechanicType: 'SPEED_DUEL',
      skillTags: ['mental_math', 'calculation', 'pattern_logic'],
      misconceptionTags: ['sequential_sum_delay'],
      auditStatus: 'VERIFIED',
      questionText: qText,
      options: [
        { id: 'opt-1', text: correctVal, isCorrect: true },
        { id: 'opt-2', text: distractors[0], isCorrect: false },
        { id: 'opt-3', text: distractors[1], isCorrect: false },
        { id: 'opt-4', text: distractors[2], isCorrect: false },
      ],
      powerUpHint: '💡 เลขท้าย 5 ยกกำลังสองลงท้าย 25 เสมอ! และผลบวก 1 ถึง n ใช้สูตร n(n+1)/2',
      explanation: `ผลลัพธ์คือ ${correctVal}`,
      shortcutNote: 'จับคู่หัวท้ายเพื่อคิดคำตอบได้ทันทีใน 3 วินาที!',
      targetTimeSec: 15,
      rewardCoins: 30,
      rewardXp: 15,
    });
  }

  // --- F4: Grandmaster Mental Shrine (30 Questions) ---
  for (let i = 1; i <= 30; i++) {
    const a = 40 + i;
    const b = 30 + i;
    const diffSquares = (a - b) * (a + b);
    bank.F4.push({
      id: `F4-${String(i).padStart(3, '0')}`,
      stageId: 'F4',
      topic: 'ปรมาจารย์คิดในใจ 15 วินาที',
      subtopic: `ผลต่างกำลังสองและพีชคณิตคิดในใจ ข้อ ${i}`,
      difficulty: 3,
      cognitiveLevel: 'APPLICATION',
      mechanicType: 'COMBO_RUSH',
      skillTags: ['mental_math', 'calculation', 'algebraic_reasoning'],
      misconceptionTags: ['manual_long_multiplication_trap'],
      auditStatus: 'VERIFIED',
      questionText: `${a}² - ${b}² = ?`,
      options: [
        { id: 'opt-1', text: `${diffSquares.toLocaleString()}`, isCorrect: true },
        { id: 'opt-2', text: `${(diffSquares - 100).toLocaleString()}`, isCorrect: false },
        { id: 'opt-3', text: `${(diffSquares + 100).toLocaleString()}`, isCorrect: false },
        { id: 'opt-4', text: `${(diffSquares + 200).toLocaleString()}`, isCorrect: false },
      ],
      powerUpHint: '💡 ใช้สูตร (หน้า - หลัง)(หน้า + หลัง)',
      explanation: `(${a} - ${b}) × (${a} + ${b}) = ${a - b} × ${a + b} = ${diffSquares}`,
      shortcutNote: 'ไม่ต้องตั้งคูณเลขยกกำลังสอง! ผลต่าง × ผลบวก ได้ผลลัพธ์ทันที!',
      targetTimeSec: 15,
      rewardCoins: 35,
      rewardXp: 20,
    });
  }

  return bank;
}

export const ALL_SHRINE_QUESTIONS = generateShrineQuestions();
export const SHRINE_QUESTIONS = ALL_SHRINE_QUESTIONS;

export function getShrineQuestions(stageId: string, count?: number): QuestionItem[] {
  const all = ALL_SHRINE_QUESTIONS[stageId] || ALL_SHRINE_QUESTIONS.F1;
  if (count && count < all.length) {
    return all.slice(0, count);
  }
  return all;
}

export function getTotalShrineQuestionCount(): number {
  return Object.values(ALL_SHRINE_QUESTIONS).reduce((acc, qArr) => acc + qArr.length, 0);
}
