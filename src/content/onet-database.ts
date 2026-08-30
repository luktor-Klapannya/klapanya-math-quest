import { QuestionItem, StageInfo } from '../types';

export const GATEWAY_STAGES: StageInfo[] = [
  {
    id: 'ONET-1',
    name: 'Knowledge Ice Gate',
    thaiName: 'ประตูที่ 1: มาตรฐานความรู้พื้นฐาน (Knowing & Facts)',
    academicFocus: 'การแปลงหน่วย (ไร่/ตร.วา/ตร.ม.), การบวกลบเศษส่วน, ทศนิยม และการหารลงตัว',
    questionCount: 20,
    targetTimeSec: 60,
    gearRewardId: 'KNOWLEDGE_HELM',
    requiredStageId: null, // First gateway tier open
    passAccuracy: 75,
    masteryAccuracy: 90,
  },
  {
    id: 'ONET-2',
    name: 'Application Ice Gate',
    thaiName: 'ประตูที่ 2: การประยุกต์ 2 ขั้นตอน (Application)',
    academicFocus: 'โจทย์ปัญหาขาสัตว์, ราคาทุนย้อนกลับ, สมการอายุ และ ห.ร.ม./ค.ร.น. ในชีวิตจริง',
    questionCount: 20,
    targetTimeSec: 75,
    gearRewardId: 'APPLICATION_CHESTPLATE',
    requiredStageId: 'ONET-1',
    passAccuracy: 75,
    masteryAccuracy: 90,
  },
  {
    id: 'ONET-3',
    name: 'Reasoning Ice Gate',
    thaiName: 'ประตูที่ 3: ตรรกะและการให้เหตุผลขั้นสูง (Advanced)',
    academicFocus: 'มาตราส่วนพื้นที่ 1:N², ซื้อ 3 แถม 1, ลดราคาสองต่อ, VAT 7% + Service 10% และงานระคน',
    questionCount: 20,
    targetTimeSec: 90,
    gearRewardId: 'REASONING_GAUNTLET',
    requiredStageId: 'ONET-2',
    passAccuracy: 75,
    masteryAccuracy: 90,
  },
  {
    id: 'ONET-4',
    name: 'National Standard Portal',
    thaiName: 'ประตูที่ 4: ข้อสอบอัตนัยระบายตัวเลข (Grid Master)',
    academicFocus: 'ข้อสอบอัตนัยระบายตัวเลข O-NET ตอนที่ 2 วิเคราะห์พื้นที่ ปริมาตร อัตราส่วน และสมการเชิงลึก',
    questionCount: 20,
    targetTimeSec: 120,
    gearRewardId: 'GUARDIAN_CAPE',
    requiredStageId: 'ONET-3',
    passAccuracy: 80,
    masteryAccuracy: 95,
  },
];

function generateOnetQuestions(): Record<string, QuestionItem[]> {
  const bank: Record<string, QuestionItem[]> = {
    'ONET-1': [],
    'ONET-2': [],
    'ONET-3': [],
    'ONET-4': [],
  };

  // --- ONET-1: Knowledge & Facts (20 Questions, 60s) ---
  for (let i = 1; i <= 20; i++) {
    let qText = '';
    let correctVal = '';
    let distractors: string[] = [];
    let trap = '';

    if (i % 4 === 1) {
      // Unit Conversion (1 rai = 400 sq.wah = 1600 sq.m)
      const rai = 2 + (i % 5);
      const sqWah = rai * 400;
      const sqM = rai * 1600;
      qText = `ที่ดินจำนวน ${rai} ไร่ คิดเป็นกี่ตารางเมตร (ตร.ม.)`;
      correctVal = `${sqM.toLocaleString()} ตารางเมตร`;
      distractors = [
        `${sqWah.toLocaleString()} ตารางเมตร`, // Trap: confused with sq.wah
        `${(sqWah * 2).toLocaleString()} ตารางเมตร`,
        `${(rai * 1000).toLocaleString()} ตารางเมตร`,
      ];
      trap = 'กับดักยอดฮิต: สับสนระหว่าง 1 ไร่ = 400 ตร.วา กับ 1 ไร่ = 1,600 ตร.ม.!';
    } else if (i % 4 === 2) {
      // Fraction Division (invert divisor)
      const a = 3 + (i % 4);
      const b = 4;
      const c = 2;
      const d = 5;
      const num = a * d;
      const den = b * c;
      qText = `ผลลัพธ์ของ (${a}/${b}) ÷ (${c}/${d}) มีค่าเท่ากับข้อใด`;
      correctVal = `${num}/${den}`;
      distractors = [
        `${a * c}/${b * d}`, // Trap: direct multiply without inverting
        `${a}/${b * d}`,
        `${(num - 2)}/${den}`,
      ];
      trap = 'กับดักหารเศษส่วน: อย่าลืมกลับเศษเป็นส่วนของตัวหารก่อนนำมาคูณ!';
    } else if (i % 4 === 3) {
      // Decimal places
      const x = 1.25 + (i * 0.05);
      const y = 0.4;
      const ans = parseFloat((x * y).toFixed(3));
      qText = `ผลคูณของ ${x.toFixed(2)} × ${y} มีค่าเท่ากับข้อใด`;
      correctVal = `${ans}`;
      distractors = [`${(ans * 10).toFixed(2)}`, `${(ans / 10).toFixed(4)}`, `${(ans + 0.1).toFixed(2)}`];
      trap = 'กับดักทศนิยม: ผลคูณมีตำแหน่งทศนิยมเท่ากับผลบวกของตำแหน่งตัวตั้งและตัวคูณ (2 + 1 = 3 ตำแหน่ง)';
    } else {
      // Divisibility logic
      const val = 120 + i * 12;
      qText = `จำนวนนับที่มากที่สุดที่นำไปหาร ${val} และ ${val + 24} ได้ลงตัวคือจำนวนใด`;
      // GCD of val and val+24 is 24 (or factor of 24)
      const gcd = 24;
      correctVal = `${gcd}`;
      distractors = [`12`, `6`, `48`];
      trap = 'โจทย์ถาม ห.ร.ม. (จำนวนมากที่สุดที่นำไปหารได้ลงตัว)';
    }

    bank['ONET-1'].push({
      id: `ONET1-${String(i).padStart(3, '0')}`,
      stageId: 'ONET-1',
      topic: 'O-NET Tier 1: ความรู้ความเข้าใจพื้นฐาน',
      subtopic: `มาตรฐาน สทศ. ข้อ ${i}`,
      difficulty: 2,
      cognitiveLevel: 'KNOWING',
      mechanicType: 'MCQ_STANDARD',
      skillTags: ['calculation', 'number_sense', 'fractions_decimals'],
      misconceptionTags: ['unit_conversion_trap', 'fraction_inversion_trap'],
      auditStatus: 'VERIFIED',
      questionText: qText,
      options: [
        { id: 'opt-1', text: correctVal, isCorrect: true },
        { id: 'opt-2', text: distractors[0], isCorrect: false },
        { id: 'opt-3', text: distractors[1], isCorrect: false },
        { id: 'opt-4', text: distractors[2], isCorrect: false },
      ],
      powerUpHint: '💡 ' + trap,
      explanation: `คำตอบที่ถูกต้องคือ ${correctVal}\n${trap}`,
      shortcutNote: trap,
      targetTimeSec: 60,
      rewardCoins: 40,
      rewardXp: 20,
    });
  }

  // --- ONET-2: Application (Two-Step Problems, 20 Questions, 75s) ---
  for (let i = 1; i <= 20; i++) {
    let qText = '';
    let correctVal = '';
    let distractors: string[] = [];
    let trap = '';

    if (i % 3 === 1) {
      // Reverse cost price: Sell at profit r% -> Cost = Sell / (1 + r)
      const cost = 2000 + i * 200;
      const profitRate = 0.20;
      const sellPrice = cost * (1 + profitRate);
      qText = `ร้านค้าติดป้ายขายสินค้า ${sellPrice.toLocaleString()} บาท ได้กำไร 20% ราคาทุนของสินค้านี้เท่ากับกี่บาท`;
      correctVal = `${cost.toLocaleString()} บาท`;
      distractors = [
        `${(sellPrice - (sellPrice * 0.2)).toLocaleString()} บาท`, // Trap: subtracting 20% from sell price directly
        `${(sellPrice - 200).toLocaleString()} บาท`,
        `${(cost + 500).toLocaleString()} บาท`,
      ];
      trap = 'กับดักอันดับ 1: นำ 20% ไปคูณราคาขายแล้วลบออกจะผิดทันที! ทุน = ราคาขาย ÷ 1.20';
    } else if (i % 3 === 2) {
      // Animal Legs assumption (4-legged vs 2-legged)
      const totalHeads = 30 + i;
      const cows = 10 + (i % 8);
      const ducks = totalHeads - cows;
      const totalLegs = cows * 4 + ducks * 2;
      qText = `ลุงเลี้ยงเป็ดและวัวรวมกัน ${totalHeads} ตัว นับขารวมกันได้ ${totalLegs} ขา ลุงเลี้ยงวัวกี่ตัว`;
      correctVal = `${cows} ตัว`;
      distractors = [`${ducks} ตัว`, `${cows + 2} ตัว`, `${cows - 2 > 0 ? cows - 2 : cows + 4} ตัว`];
      trap = 'สูตรสมมุติ 4 ขา: จำนวนสัตว์ 4 ขา = [ขาจริง - 2(หัวรวม)] ÷ 2';
    } else {
      // Age equations
      const son = 10 + i;
      const father = son * 3;
      const years = 10;
      qText = `ปัจจุบันพ่อมีอายุเป็น 3 เท่าของลูก ถ้าอีก ${years} ปีข้างหน้า ผลรวมอายุของทั้งสองคนจะเป็น ${father + years + son + years} ปี ปัจจุบันลูกมีอายุกี่ปี`;
      correctVal = `${son} ปี`;
      distractors = [`${son + years} ปี`, `${father} ปี`, `${son - 2 > 0 ? son - 2 : 12} ปี`];
      trap = 'ในอีก n ปีข้างหน้า ผลรวมอายุของทั้งคู่จะเพิ่มขึ้นคนละ n ปี (เพิ่มรวม 2n ปี)';
    }

    bank['ONET-2'].push({
      id: `ONET2-${String(i).padStart(3, '0')}`,
      stageId: 'ONET-2',
      topic: 'O-NET Tier 2: การประยุกต์ 2 ขั้นตอน',
      subtopic: `โจทย์ประยุกต์ข้อสอบจริง ข้อ ${i}`,
      difficulty: 3,
      cognitiveLevel: 'APPLICATION',
      mechanicType: 'TRAP_HUNT',
      skillTags: ['algebraic_reasoning', 'ratio_percentage_scale', 'trap_detection'],
      misconceptionTags: ['reverse_profit_trap', 'animal_legs_confusion'],
      auditStatus: 'VERIFIED_WITH_TRAP_TAG',
      questionText: qText,
      options: [
        { id: 'opt-1', text: correctVal, isCorrect: true },
        { id: 'opt-2', text: distractors[0], isCorrect: false },
        { id: 'opt-3', text: distractors[1], isCorrect: false },
        { id: 'opt-4', text: distractors[2], isCorrect: false },
      ],
      powerUpHint: '💡 ' + trap,
      explanation: `วิธีทำ:\n${trap}\nคำตอบคือ ${correctVal}`,
      shortcutNote: trap,
      targetTimeSec: 75,
      rewardCoins: 50,
      rewardXp: 25,
    });
  }

  // --- ONET-3: Advanced Reasoning (20 Questions, 90s) ---
  for (let i = 1; i <= 20; i++) {
    let qText = '';
    let correctVal = '';
    let distractors: string[] = [];
    let trap = '';

    if (i % 3 === 1) {
      // Area scale ratio 1:N -> 1:N^2
      const scale = 200;
      const planW = 4;
      const planL = 5;
      const planArea = planW * planL; // 20 sq.cm
      const realW = (planW * scale) / 100; // in meters = 8m
      const realL = (planL * scale) / 100; // in meters = 10m
      const realArea = realW * realL; // 80 sq.m
      qText = `แผนผังสนามหญ้ามาตราส่วน 1 : ${scale} รูปสี่เหลี่ยมผืนผ้า กว้าง ${planW} ซม. ยาว ${planL} ซม. สนามหญ้าจริงมีพื้นที่กี่ตารางเมตร`;
      correctVal = `${realArea} ตารางเมตร`;
      distractors = [
        `${(planArea * scale) / 100} ตารางเมตร`, // Trap: multiplying by N once instead of N^2
        `${realArea * 10} ตารางเมตร`,
        `${realArea / 2} ตารางเมตร`,
      ];
      trap = 'กับดักมาตราส่วนพื้นที่: ถ้าความยาว 1:N พื้นที่จริงต้องเป็น 1:N² เสมอ!';
    } else if (i % 3 === 2) {
      // Double discount chaining
      const price = 1000 + i * 100;
      const d1 = 20;
      const d2 = 10;
      const net = price * (1 - d1 / 100) * (1 - d2 / 100);
      const totalDiscPct = 28; // 20 + 10 - 2 = 28%
      qText = `สินค้าติดป้ายลดราคา 20% และมีคูปองลดเพิ่มอีก 10% จากราคาที่ลดแล้ว คิดเป็นส่วนลดรวมกี่เปอร์เซ็นต์ของราคาป้ายเดิม`;
      correctVal = `${totalDiscPct}%`;
      distractors = [
        `30%`, // Trap: directly adding 20 + 10 = 30%
        `25%`,
        `32%`,
      ];
      trap = 'กับดักลดราคาสองต่อ: ลด 20% แล้วลดอีก 10% ไม่ใช่ลด 30%! จ่ายจริง 80% × 90% = 72% -> ลด 28%';
    } else {
      // VAT 7% + Service Charge 10%
      const food = 1200 + i * 100;
      const withService = food * 1.10;
      const netTotal = parseFloat((withService * 1.07).toFixed(2));
      qText = `ค่าอาหาร ${food.toLocaleString()} บาท มีค่าบริการ 10% และคิดภาษีมูลค่าเพิ่ม 7% ต่อจากยอดรวมบริการ ยอดสุทธิที่ต้องจ่ายเป็นกี่บาท`;
      correctVal = `${netTotal.toLocaleString()} บาท`;
      distractors = [
        `${(food * 1.17).toLocaleString()} บาท`, // Trap: flat 17%
        `${(food + 170).toLocaleString()} บาท`,
        `${(netTotal - 50).toLocaleString()} บาท`,
      ];
      trap = 'ตัวคูณลูกโซ่: ยอดสุทธิ = ราคาอาหาร × 1.10 × 1.07';
    }

    bank['ONET-3'].push({
      id: `ONET3-${String(i).padStart(3, '0')}`,
      stageId: 'ONET-3',
      topic: 'O-NET Tier 3: การให้เหตุผลขั้นสูง',
      subtopic: `โจทย์ตรรกะและการค้าซับซ้อน ข้อ ${i}`,
      difficulty: 4,
      cognitiveLevel: 'ADVANCED_REASONING',
      mechanicType: 'MULTI_STEP_SURVIVAL',
      skillTags: ['ratio_percentage_scale', 'geometry_spatial', 'trap_detection'],
      misconceptionTags: ['scale_area_squared_trap', 'double_discount_addition_trap'],
      auditStatus: 'VERIFIED_WITH_TRAP_TAG',
      questionText: qText,
      options: [
        { id: 'opt-1', text: correctVal, isCorrect: true },
        { id: 'opt-2', text: distractors[0], isCorrect: false },
        { id: 'opt-3', text: distractors[1], isCorrect: false },
        { id: 'opt-4', text: distractors[2], isCorrect: false },
      ],
      powerUpHint: '💡 ' + trap,
      explanation: `การวิเคราะห์:\n${trap}\nได้ผลลัพธ์ = ${correctVal}`,
      shortcutNote: trap,
      targetTimeSec: 90,
      rewardCoins: 60,
      rewardXp: 30,
    });
  }

  // --- ONET-4: Numerical Grid Response (20 Questions, 120s) ---
  for (let i = 1; i <= 20; i++) {
    let qText = '';
    let canonicalVal = '';
    let hint = '';

    if (i % 4 === 1) {
      // Shaded Area (4/7 a^2 for leaf inside square)
      const a = 7 + (i % 3) * 7; // 7, 14, 21
      const leafArea = (4 / 7) * a * a;
      qText = `รูปสี่เหลี่ยมจัตุรัสมีความยาวด้านละ ${a} เซนติเมตร มีพื้นที่ใบไม้แรเงาที่เกิดจากส่วนโค้งของวงกลมกี่ตารางเซนติเมตร (กำหนดให้ π = 22/7) [ตอบเป็นตัวเลข]`;
      canonicalVal = `${leafArea}`;
      hint = `สูตรพื้นที่ใบไม้แรเงาในจัตุรัสด้าน a: Area = (4/7)a² = (4/7) × ${a}²`;
    } else if (i % 4 === 2) {
      // Work rate
      const a = 6;
      const b = 12 + (i % 2) * 6;
      const days = (a * b) / (a + b);
      qText = `ก ทำงานเสร็จใน ${a} วัน ข ทำงานเดียวกันเสร็จใน ${b} วัน ถ้าทั้งสองคนช่วยกันทำงานนี้จะเสร็จในเวลากี่วัน [ตอบเป็นตัวเลข]`;
      canonicalVal = `${days}`;
      hint = `สูตรลัดช่วยกัน 2 คน: เวลา = (A × B) ÷ (A + B) = (${a} × ${b}) ÷ (${a} + ${b})`;
    } else if (i % 4 === 3) {
      // Percentage profit
      const cost = 500 + i * 50;
      const profitPct = 25;
      const gain = cost * (profitPct / 100);
      qText = `ซื้อสินค้ามาราคา ${cost} บาท ขายต่อได้กำไร 25% อยากทราบว่าได้กำไรกี่บาท [ตอบเป็นตัวเลข]`;
      canonicalVal = `${gain}`;
      hint = `กำไร 25% = ${cost} × 0.25 = ${gain}`;
    } else {
      // Consecutive numbers
      const mid = 20 + i;
      const sum3 = mid * 3;
      qText = `จำนวนนับ 3 จำนวนเรียงติดกัน มีผลบวกเท่ากับ ${sum3} จงหาจำนวนที่มีค่าน้อยที่สุด [ตอบเป็นตัวเลข]`;
      canonicalVal = `${mid - 1}`;
      hint = `จำนวนตรงกลาง = ${sum3} ÷ 3 = ${mid} ดังนั้นจำนวนน้อยสุดคือ ${mid - 1}`;
    }

    bank['ONET-4'].push({
      id: `ONET4-${String(i).padStart(3, '0')}`,
      stageId: 'ONET-4',
      topic: 'O-NET Tier 4: ข้อสอบอัตนัยระบายตัวเลข',
      subtopic: `ข้อสอบระบายตัวเลขข้อสอบจริง ข้อ ${i}`,
      difficulty: 4,
      cognitiveLevel: 'ADVANCED_REASONING',
      mechanicType: 'GRID_RESPONSE',
      skillTags: ['algebraic_reasoning', 'geometry_spatial', 'calculation'],
      misconceptionTags: ['numerical_grid_precision_error'],
      auditStatus: 'VERIFIED',
      questionText: qText,
      options: [], // Grid Response uses canonical numerical string
      correctNumericalValue: canonicalVal,
      powerUpHint: '💡 ' + hint,
      explanation: `วิธีคำนวณ:\n${hint}\nดังนั้นค่าที่ต้องระบายคือ ${canonicalVal}`,
      shortcutNote: hint,
      targetTimeSec: 120,
      rewardCoins: 75,
      rewardXp: 40,
    });
  }

  return bank;
}

export const ALL_GATEWAY_QUESTIONS = generateOnetQuestions();
export const ONET_QUESTIONS = ALL_GATEWAY_QUESTIONS;

export function getGatewayQuestions(stageId: string, count?: number): QuestionItem[] {
  const all = ALL_GATEWAY_QUESTIONS[stageId] || ALL_GATEWAY_QUESTIONS['ONET-1'];
  if (count && count < all.length) {
    return all.slice(0, count);
  }
  return all;
}

export function getTotalGatewayQuestionCount(): number {
  return Object.values(ALL_GATEWAY_QUESTIONS).reduce((acc, qArr) => acc + qArr.length, 0);
}
