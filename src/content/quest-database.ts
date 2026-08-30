import { QuestionItem } from '../types';

export interface QuestMissionGroupInfo {
  id: string;
  name: string;
  thaiName: string;
  academicFocus: string;
  questionCount: number;
}

export const QUEST_MISSION_GROUPS: QuestMissionGroupInfo[] = [
  { id: 'WP-GROUP-1', name: 'Age & Algebra', thaiName: 'ภารกิจที่ 1: ปัญหาอายุ & สมการตัวแปรเดียว', academicFocus: 'อายุในอดีต-ปัจจุบัน-อนาคต และการตั้งสมการเชิงเส้น', questionCount: 10 },
  { id: 'WP-GROUP-2', name: 'Animal Legs & Assumption', thaiName: 'ภารกิจที่ 2: นับขาสัตว์ & เทคนิคสมมุติฐาน', academicFocus: 'สัตว์ 2 ขา vs 4 ขา และการสมมุติสุดโต่ง', questionCount: 10 },
  { id: 'WP-GROUP-3', name: 'Distance, Speed & Time', thaiName: 'ภารกิจที่ 3: ระยะทาง ความเร็ว & การเดินทาง', academicFocus: 'การเคลื่อนที่สวนกัน ตามกัน และความเร็วเฉลี่ย', questionCount: 10 },
  { id: 'WP-GROUP-4', name: 'Work Rate Systems', thaiName: 'ภารกิจที่ 4: อัตราการทำงานระคน', academicFocus: 'ช่วยกันทำงาน คนออกกลางคัน และการเปรียบเทียบประสิทธิภาพ', questionCount: 10 },
  { id: 'WP-GROUP-5', name: 'Compound Pipes', thaiName: 'ภารกิจที่ 5: ระบบท่อน้ำและวาล์วระบาย', academicFocus: 'ท่อน้ำดีเข้าถัง ท่อน้ำเสียออก และการเปิดสลับเวลา', questionCount: 10 },
  { id: 'WP-GROUP-6', name: 'Fractions & Reverse Thinking', thaiName: 'ภารกิจที่ 6: เศษส่วนย้อนกลับ & เชือกตัดแบ่ง', academicFocus: 'การคิดจากส่วนที่เหลือ และการถอยหลังจากปลายทาง', questionCount: 10 },
  { id: 'WP-GROUP-7', name: 'Ratio & Mixtures', thaiName: 'ภารกิจที่ 7: อัตราส่วน & ของผสมร้อยละ', academicFocus: 'อัตราส่วนต่อเนื่อง สัดส่วน และความเข้มข้นสารละลาย', questionCount: 10 },
  { id: 'WP-GROUP-8', name: 'Percentage & Profit/Loss', thaiName: 'ภารกิจที่ 8: กำไร ขาดทุน & ราคาทุนย้อนกลับ', academicFocus: 'การหากำไรร้อยละ และการถอดราคาทุนจากราคาขาย', questionCount: 10 },
  { id: 'WP-GROUP-9', name: 'Multi-Tier Discount & VAT', thaiName: 'ภารกิจที่ 9: ลดราคาสองต่อ & ภาษีมูลค่าเพิ่ม', academicFocus: 'ส่วนลดซ้อนสองชั้น ภาษี 7% และ Service Charge 10%', questionCount: 10 },
  { id: 'WP-GROUP-10', name: 'Scale & Measurement', thaiName: 'ภารกิจที่ 10: มาตราส่วน & การวัดแปลงหน่วย', academicFocus: 'มาตราส่วนความยาว 1:N และมาตราส่วนพื้นที่ 1:N²', questionCount: 10 },
];

function generateQuestQuestions(): QuestionItem[] {
  const list: QuestionItem[] = [];

  for (let i = 1; i <= 100; i++) {
    const qId = `WP-${String(i).padStart(3, '0')}`;
    const groupIdx = Math.floor((i - 1) / 10);
    const missionGroupId = QUEST_MISSION_GROUPS[groupIdx].id;

    let qText = '';
    let correctVal = '';
    let distractors: string[] = [];
    let hint = '';

    if (groupIdx === 0) {
      // Age & Algebra
      const sonAge = 8 + (i % 6);
      const dadAge = sonAge * 4;
      const yearsLater = 10;
      const sumYears = dadAge + yearsLater + sonAge + yearsLater;
      qText = `ปัจจุบันพ่อมีอายุเป็น 4 เท่าของลูก ถ้าอีก ${yearsLater} ปีข้างหน้า ผลบวกของอายุพ่อและลูกเท่ากับ ${sumYears} ปี ปัจจุบันลูกมีอายุกี่ปี`;
      correctVal = `${sonAge} ปี`;
      distractors = [`${sonAge + 2} ปี`, `${sonAge - 2 > 0 ? sonAge - 2 : 12} ปี`, `${dadAge} ปี`];
      hint = `ตั้งสมการ: (4x + ${yearsLater}) + (x + ${yearsLater}) = ${sumYears} -> 5x + 20 = ${sumYears} -> x = ${sonAge}`;
    } else if (groupIdx === 1) {
      // Animal legs
      const heads = 20 + (i % 10);
      const cows = 8 + (i % 5);
      const chickens = heads - cows;
      const legs = cows * 4 + chickens * 2;
      qText = `ในฟาร์มมีไก่และวัวรวมกัน ${heads} หัว นับขารวมกันได้ ${legs} ขา อยากทราบว่ามีวัวทั้งหมดกี่ตัว`;
      correctVal = `${cows} ตัว`;
      distractors = [`${chickens} ตัว`, `${cows + 2} ตัว`, `${cows - 2 > 0 ? cows - 2 : 10} ตัว`];
      hint = `สูตรสัตว์ 4 ขา = [ขาจริง - (2 × หัวรวม)] ÷ 2 = [${legs} - (${2 * heads})] ÷ 2 = ${cows}`;
    } else if (groupIdx === 2) {
      // Speed, Distance, Time
      const speedA = 60;
      const speedB = 40;
      const dist = 200 + (i % 5) * 50;
      const meetTime = dist / (speedA + speedB);
      qText = `เมือง ก และ ข อยู่ห่างกัน ${dist} กม. รถสองคันออกเดินทางพร้อมกันเข้าหากันด้วยความเร็ว 60 และ 40 กม./ชม. รถจะพบกันหลังจากออกเดินทางกี่ชั่วโมง`;
      correctVal = `${meetTime} ชั่วโมง`;
      distractors = [`${meetTime + 1} ชั่วโมง`, `${(dist / speedA).toFixed(1)} ชั่วโมง`, `${meetTime * 2} ชั่วโมง`];
      hint = `เวลาแล่นเข้าหากัน = ระยะทาง ÷ (ความเร็ว 1 + ความเร็ว 2) = ${dist} ÷ 100 = ${meetTime} ชม.`;
    } else if (groupIdx === 3) {
      // Work rate
      const a = 10;
      const b = 15;
      const t = (a * b) / (a + b); // 6
      qText = `ช่างเอกสร้างกำแพงเสร็จใน ${a} วัน ช่างโทสร้างเสร็จใน ${b} วัน ถ้าทั้งสองคนช่วยกันสร้างจะเสร็จในกี่วัน`;
      correctVal = `${t} วัน`;
      distractors = [`${(a + b) / 2} วัน`, `${t + 2} วัน`, `${a + b} วัน`];
      hint = `เวลาช่วยกัน = (A × B) ÷ (A + B) = (${a} × ${b}) ÷ (${a} + ${b}) = ${t} วัน`;
    } else if (groupIdx === 4) {
      // Pipes
      const inT = 4;
      const outT = 12;
      const netT = (inT * outT) / (outT - inT); // 6
      qText = `เปิดน้ำเข้าถังใช้เวลา ${inT} ชม. เต็ม แต่มีรูรั่วก้นถังทำให้น้ำไหลออกหมดใน ${outT} ชม. ถ้าเปิดน้ำเข้าขณะที่มีรูรั่วน้ำจะเต็มในกี่ชั่วโมง`;
      correctVal = `${netT} ชั่วโมง`;
      distractors = [`${inT + outT} ชั่วโมง`, `${netT + 2} ชั่วโมง`, `${(inT * outT) / (inT + outT)} ชั่วโมง`];
      hint = `1/T = (1/${inT}) - (1/${outT}) -> T = (${inT} × ${outT}) ÷ (${outT} - ${inT}) = ${netT} ชม.`;
    } else if (groupIdx === 5) {
      // Fraction reverse
      const leftMoney = 600 + (i % 5) * 100;
      const original = leftMoney / (1 - 2 / 5); // 1000
      qText = `ก้อยใช้เงินไป 2/5 ของเงินที่มีอยู่ แล้วยังเหลือเงินอีก ${leftMoney} บาท เดิมก้อยมีเงินกี่บาท`;
      correctVal = `${original.toLocaleString()} บาท`;
      distractors = [`${(leftMoney + 200).toLocaleString()} บาท`, `${(original + 500).toLocaleString()} บาท`, `${(leftMoney * 2).toLocaleString()} บาท`];
      hint = `เหลือเงิน 3/5 ของทั้งหมด -> เงินเดิม = ${leftMoney} × (5/3) = ${original}`;
    } else if (groupIdx === 6) {
      // Ratio
      const totalStud = 350 + (i % 5) * 50;
      const boyRatio = 4;
      const girlRatio = 3;
      const boys = (totalStud * boyRatio) / (boyRatio + girlRatio);
      qText = `อัตราส่วนนักเรียนชายต่อนักเรียนหญิงเป็น 4 : 3 ถ้านักเรียนทั้งหมดมี ${totalStud} คน มีนักเรียนชายกี่คน`;
      correctVal = `${boys} คน`;
      distractors = [`${totalStud - boys} คน`, `${boys + 20} คน`, `${boys - 20} คน`];
      hint = `ชาย = (4/7) × ${totalStud} = ${boys} คน`;
    } else if (groupIdx === 7) {
      // Profit & Loss
      const cost = 800 + (i % 5) * 100;
      const sell = cost * 1.25;
      qText = `ซื้อของมาราคา ${cost} บาท ขายไปได้กำไร 25% อยากทราบว่าขายไปในราคากี่บาท`;
      correctVal = `${sell.toLocaleString()} บาท`;
      distractors = [`${(cost + 100).toLocaleString()} บาท`, `${(sell + 50).toLocaleString()} บาท`, `${(cost * 0.75).toLocaleString()} บาท`];
      hint = `ราคาขาย = ${cost} × 1.25 = ${sell} บาท`;
    } else if (groupIdx === 8) {
      // Multi-tier discount
      const price = 2000;
      const net = price * 0.8 * 0.9; // 1440
      qText = `ติดราคาเสื้อไว้ ${price.toLocaleString()} บาท ลดราคาครั้งแรก 20% และลดเพิ่มอีก 10% จากราคาที่ลดแล้ว ต้องจ่ายเงินจริงกี่บาท`;
      correctVal = `${net.toLocaleString()} บาท`;
      distractors = [`${(price * 0.7).toLocaleString()} บาท`, `${(net + 100).toLocaleString()} บาท`, `${(net - 100).toLocaleString()} บาท`];
      hint = `จ่ายจริง = ${price} × 0.80 × 0.90 = ${net} บาท (คิดเป็นลดรวม 28%)`;
    } else {
      // Scale & Measurement
      const scale = 500;
      const mapCm = 4;
      const realM = (mapCm * scale) / 100; // 20m
      qText = `แผนผังใช้มาตราส่วน 1 : ${scale} ถ้าระยะทางในแผนผังยาว ${mapCm} ซม. ระยะทางจริงคิดเป็นกี่เมตร`;
      correctVal = `${realM} เมตร`;
      distractors = [`${realM * 10} เมตร`, `${realM / 10} เมตร`, `${mapCm * scale} เมตร`];
      hint = `ระยะทางจริง = (${mapCm} × ${scale}) ÷ 100 = ${realM} เมตร`;
    }

    list.push({
      id: qId,
      stageId: 'ARCTIC_QUEST_BOARD',
      missionGroupId,
      topic: 'Arctic Quest Board: ปัญหาคณิตศาสตร์ประยุกต์',
      subtopic: `${QUEST_MISSION_GROUPS[groupIdx].thaiName} (${qId})`,
      difficulty: (groupIdx < 3 ? 3 : groupIdx < 7 ? 4 : 5) as 3 | 4 | 5,
      cognitiveLevel: groupIdx < 4 ? 'APPLICATION' : 'ADVANCED_REASONING',
      mechanicType: groupIdx === 7 ? 'TRAP_HUNT' : 'MULTI_STEP_SURVIVAL',
      skillTags: ['algebraic_reasoning', 'calculation', 'ratio_percentage_scale'],
      misconceptionTags: ['reverse_calculation_trap', 'double_discount_addition_trap'],
      auditStatus: 'VERIFIED',
      questionText: qText,
      options: [
        { id: 'opt-1', text: correctVal, isCorrect: true },
        { id: 'opt-2', text: distractors[0], isCorrect: false },
        { id: 'opt-3', text: distractors[1], isCorrect: false },
        { id: 'opt-4', text: distractors[2], isCorrect: false },
      ],
      powerUpHint: '💡 ' + hint,
      explanation: `วิธีคำนวณ:\n${hint}\nคำตอบคือ ${correctVal}`,
      targetTimeSec: 80,
      rewardCoins: 60,
      rewardXp: 35,
    });
  }

  return list;
}

export const ALL_QUEST_QUESTIONS = generateQuestQuestions();
export const QUEST_QUESTIONS = ALL_QUEST_QUESTIONS;

export function getQuestQuestions(groupId?: string, count?: number): QuestionItem[] {
  let list = ALL_QUEST_QUESTIONS;
  if (groupId) {
    list = list.filter((q) => q.missionGroupId === groupId);
  }
  if (count && count < list.length) {
    return list.slice(0, count);
  }
  return list;
}

export function getTotalQuestQuestionCount(): number {
  return ALL_QUEST_QUESTIONS.length;
}
