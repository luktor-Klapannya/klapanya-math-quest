import { QuestionItem, StageInfo } from '../types';

export const DOJO_STAGES: StageInfo[] = [
  {
    id: 'D1',
    name: 'Frost Calculation Dojo',
    thaiName: 'เสาหลักที่ 1: สูตรคูณ & การหารลงตัว',
    academicFocus: 'สมบัติการหารลงตัวของ 3, 4, 6, 8, 9 และกำลังสองท้าย 5',
    questionCount: 30,
    targetTimeSec: 30,
    gearRewardId: 'BLADE_OF_CALCULATION',
    requiredStageId: null, // First station open by default
    passAccuracy: 70,
    masteryAccuracy: 90,
  },
  {
    id: 'D2',
    name: 'Mental Glacier Pillar',
    thaiName: 'เสาหลักที่ 2: คิดเลขเร็ว & กำลังสอง',
    academicFocus: 'เทคนิคคูณ 11, ผลต่างกำลังสอง, ส่วนเติมเต็ม 100/1000 และผลบวก 1 ถึง n',
    questionCount: 30,
    targetTimeSec: 25,
    gearRewardId: 'GAUNTLET_OF_PRECISION',
    requiredStageId: 'D1',
    passAccuracy: 70,
    masteryAccuracy: 90,
  },
  {
    id: 'D3',
    name: 'Prime Crystal Cavern',
    thaiName: 'เสาหลักที่ 3: ตัวประกอบ & จำนวนเฉพาะ',
    academicFocus: 'จำนวนเฉพาะ 1-100, การแยกตัวประกอบ, จำนวนตัวประกอบทั้งหมด และตัวประกอบเฉพาะ',
    questionCount: 30,
    targetTimeSec: 30,
    gearRewardId: 'RUNE_LENS_OF_FACTORS',
    requiredStageId: 'D2',
    passAccuracy: 75,
    masteryAccuracy: 90,
  },
  {
    id: 'D4',
    name: 'Geometric Ice Sanctuary',
    thaiName: 'เสาหลักที่ 4: เรขาคณิต & เส้นขนาน',
    academicFocus: 'มุมแย้ง มุมภายใน เส้นขนาน พื้นที่ใบไม้แรเงา และทฤษฎีมุมสามเหลี่ยม/สี่เหลี่ยม',
    questionCount: 30,
    targetTimeSec: 45,
    gearRewardId: 'SPATIAL_ICE_SHIELD',
    requiredStageId: 'D3',
    passAccuracy: 70,
    masteryAccuracy: 85,
  },
  {
    id: 'D5',
    name: 'GCD & LCM Core Shrine',
    thaiName: 'เสาหลักที่ 5: ห.ร.ม. & ค.ร.น. มหาประลัย',
    academicFocus: 'การหา ห.ร.ม. และ ค.ร.น. แบบยูคลิด, การแบ่งสิ่งของ, การวิ่งรอบสนาม และสมบัติ A × B = H × L',
    questionCount: 30,
    targetTimeSec: 40,
    gearRewardId: 'CHRONO_BOOTS',
    requiredStageId: 'D4',
    passAccuracy: 75,
    masteryAccuracy: 90,
  },
  {
    id: 'D6',
    name: 'Mixed Fraction Summit',
    thaiName: 'เสาหลักที่ 6: เศษส่วน & ทศนิยมระคน',
    academicFocus: 'การบวกลบคูณหารเศษส่วนซ้อน, การคิดย้อนกลับ, อัตราการทำงาน และระบบท่อน้ำ',
    questionCount: 30,
    targetTimeSec: 45,
    gearRewardId: 'FRACTION_CORE',
    requiredStageId: 'D5',
    passAccuracy: 75,
    masteryAccuracy: 90,
  },
];

// Helper to generate verified structured questions across D1-D6
function generateDojoQuestions(): Record<string, QuestionItem[]> {
  const bank: Record<string, QuestionItem[]> = {
    D1: [],
    D2: [],
    D3: [],
    D4: [],
    D5: [],
    D6: [],
  };

  // --- D1: Multiplications & Divisibility (30 Questions) ---
  for (let i = 1; i <= 30; i++) {
    let qText = '';
    let opts: { text: string; isCorrect: boolean }[] = [];
    let hint1 = '';
    let hint2 = '';
    let exp = '';
    let shortcut = '';

    if (i % 6 === 1) {
      const num = 1000 + i * 144;
      const rem = (5 + i * 2) % 9;
      qText = `จำนวนในข้อใดต่อไปนี้เมื่อนำไปหารด้วย 9 แล้วจะ "ลงตัวพอดี"`;
      opts = [
        { text: `${num + ((9 - (num % 9)) % 9)}`, isCorrect: true },
        { text: `${num + 1}`, isCorrect: false },
        { text: `${num + 2}`, isCorrect: false },
        { text: `${num + 4}`, isCorrect: false },
      ];
      hint1 = '💡 บวกเลขโดดทุกหลัก ถ้าผลรวมหารด้วย 9 ลงตัว จำนวนนั้นจะหารด้วย 9 ลงตัว';
      exp = 'การตรวจหาร 9 ให้หาผลบวกเลขโดดทุกหลัก';
      shortcut = 'ตัดเลข 9 และคู่บวก 9 ทิ้งเพื่อคิดในใจได้เร็วขึ้น!';
    } else if (i % 6 === 2) {
      const base = 15 + (i % 8) * 10;
      const ans = base * base;
      qText = `ผลลัพธ์ของ ${base} × ${base} (${base}²) มีค่าเท่ากับข้อใด`;
      opts = [
        { text: `${ans.toLocaleString()}`, isCorrect: true },
        { text: `${(ans - 200).toLocaleString()}`, isCorrect: false },
        { text: `${(ans + 200).toLocaleString()}`, isCorrect: false },
        { text: `${(ans + 400).toLocaleString()}`, isCorrect: false },
      ];
      hint1 = '💡 สูตรกำลังสองท้าย 5: นำเลขตัวหน้า × (ตัวหน้า + 1) แล้วต่อท้ายด้วย 25';
      exp = `ตัวหน้าคือ ${Math.floor(base/10)} -> ${Math.floor(base/10)} × ${Math.floor(base/10)+1} = ${Math.floor(base/10)*(Math.floor(base/10)+1)} ต่อท้าย 25 = ${ans}`;
      shortcut = 'ไม่ต้องตั้งคูณยาว เลขท้าย 5 ยกกำลังสองลงท้าย 25 เสมอ!';
    } else if (i % 6 === 3) {
      const num = 24000 + i * 36;
      qText = `จำนวนในข้อใด "หารด้วย 4 ลงตัว"`;
      opts = [
        { text: `${num}`, isCorrect: true },
        { text: `${num + 1}`, isCorrect: false },
        { text: `${num + 2}`, isCorrect: false },
        { text: `${num + 3}`, isCorrect: false },
      ];
      hint1 = '💡 ตรวจหาร 4: ดูแค่ 2 หลักสุดท้าย ถ้า 2 หลักสุดท้ายหารด้วย 4 ลงตัว จำนวนนั้นก็ลงตัว';
      exp = `สองหลักสุดท้ายคือ ${num % 100} ซึ่งหารด้วย 4 ลงตัวพอดี`;
      shortcut = 'ดูเฉพาะหลักสิบและหลักหน่วย 2 หลักสุดท้ายประหยัดเวลาทันที!';
    } else if (i % 6 === 4) {
      const num = 1200 + i * 18;
      qText = `จำนวนในข้อใด "หารด้วย 6 ลงตัว"`;
      const correctVal = num % 6 === 0 ? num : num + (6 - (num % 6));
      opts = [
        { text: `${correctVal.toLocaleString()}`, isCorrect: true },
        { text: `${(correctVal + 1).toLocaleString()}`, isCorrect: false },
        { text: `${(correctVal + 3).toLocaleString()}`, isCorrect: false },
        { text: `${(correctVal + 5).toLocaleString()}`, isCorrect: false },
      ];
      hint1 = '💡 หาร 6 ลงตัว: ต้องเป็นเลขคู่ และผลบวกเลขโดดต้องหาร 3 ลงตัว';
      exp = 'จำนวนที่หารด้วย 6 ลงตัว ต้องผ่านเงื่อนไขทั้งหารด้วย 2 ลงตัว (เลขคู่) และหารด้วย 3 ลงตัว (ผลบวกเลขโดด)';
      shortcut = 'ตัดเลขคี่ทิ้งก่อนอันดับแรก แล้วดูผลบวกเลขโดดที่เหลือ!';
    } else if (i % 6 === 5) {
      const val = 20 + i * 2;
      const ans = val * (val + 1) / 2;
      qText = `ผลบวกของ 1 + 2 + 3 + ... + ${val} มีค่าเท่ากับเท่าใด`;
      opts = [
        { text: `${ans.toLocaleString()}`, isCorrect: true },
        { text: `${(ans - val).toLocaleString()}`, isCorrect: false },
        { text: `${(ans + val).toLocaleString()}`, isCorrect: false },
        { text: `${(ans + 50).toLocaleString()}`, isCorrect: false },
      ];
      hint1 = '💡 สูตรเกาส์: n(n + 1) ÷ 2';
      exp = `แทนค่า n = ${val}: [${val} × ${val + 1}] / 2 = ${ans}`;
      shortcut = `จับคู่หัวท้ายได้ผลบวก ${val + 1} ทั้งหมด ${val / 2} คู่`;
    } else {
      const a = 30 + i;
      const b = 20 + i;
      const ans = (a - b) * (a + b);
      qText = `ผลลัพธ์ของ ${a}² - ${b}² มีค่าเท่ากับข้อใด`;
      opts = [
        { text: `${ans.toLocaleString()}`, isCorrect: true },
        { text: `${(ans - 100).toLocaleString()}`, isCorrect: false },
        { text: `${(ans + 100).toLocaleString()}`, isCorrect: false },
        { text: `${(ans + 200).toLocaleString()}`, isCorrect: false },
      ];
      hint1 = '💡 ผลต่างกำลังสอง: a² - b² = (a - b)(a + b)';
      exp = `(${a} - ${b})(${a} + ${b}) = ${a - b} × ${a + b} = ${ans}`;
      shortcut = 'ไม่ต้องตั้งคูณใหญ่ จับ (ลบกัน) × (บวกกัน) คิดในใจได้ทันที!';
    }

    bank.D1.push({
      id: `D1-${String(i).padStart(3, '0')}`,
      stageId: 'D1',
      topic: 'การคูณและการหารลงตัว',
      subtopic: `ทักษะการตรวจสอบและการคำนวณรากฐาน ข้อ ${i}`,
      difficulty: i <= 10 ? 1 : i <= 25 ? 2 : 3,
      cognitiveLevel: i <= 15 ? 'KNOWING' : 'APPLICATION',
      mechanicType: i % 2 === 0 ? 'SPEED_DUEL' : 'MCQ_STANDARD',
      skillTags: ['calculation', 'number_sense'],
      misconceptionTags: ['standard_long_multiplication_delay'],
      auditStatus: 'VERIFIED',
      questionText: qText,
      options: opts.map((o, idx) => ({ id: `opt-${idx + 1}`, text: o.text, isCorrect: o.isCorrect })),
      powerUpHint: hint1,
      hintLevel2: hint2 || hint1,
      explanation: exp,
      shortcutNote: shortcut,
      targetTimeSec: 30,
      rewardCoins: 30 + i,
      rewardXp: 15 + Math.floor(i / 2),
    });
  }

  // --- D2: Mental Math & Fast Squares (30 Questions) ---
  for (let i = 1; i <= 30; i++) {
    const twoDigit = 23 + i * 2;
    const ans11 = twoDigit * 11;
    bank.D2.push({
      id: `D2-${String(i).padStart(3, '0')}`,
      stageId: 'D2',
      topic: 'คิดเลขเร็ว & กำลังสอง',
      subtopic: 'การคูณ 11 และกำลังสองสมบูรณ์',
      difficulty: i <= 15 ? 1 : 2,
      cognitiveLevel: 'KNOWING',
      mechanicType: 'SPEED_DUEL',
      skillTags: ['mental_math', 'calculation'],
      misconceptionTags: ['carry_over_omission'],
      auditStatus: 'VERIFIED',
      questionText: `ผลลัพธ์ของ ${twoDigit} × 11 มีค่าเท่ากับข้อใด`,
      options: [
        { id: 'opt-1', text: `${ans11}`, isCorrect: true },
        { id: 'opt-2', text: `${ans11 - 10}`, isCorrect: false },
        { id: 'opt-3', text: `${ans11 + 10}`, isCorrect: false },
        { id: 'opt-4', text: `${ans11 + 100}`, isCorrect: false },
      ],
      powerUpHint: `💡 แยก ${Math.floor(twoDigit/10)} กับ ${twoDigit%10} แทรกผลบวก (${Math.floor(twoDigit/10) + (twoDigit%10)}) ไว้ตรงกลาง (ทด 1 ถ้าเกิน 10)`,
      explanation: `คูณ 11: ${twoDigit} × 11 = ${ans11}`,
      shortcutNote: 'แยกหัวท้ายแล้วแทรกผลบวกตรงกลาง!',
      targetTimeSec: 20,
      rewardCoins: 30 + i,
      rewardXp: 15 + Math.floor(i / 2),
    });
  }

  // --- D3: Prime Numbers & Factors (30 Questions) ---
  for (let i = 1; i <= 30; i++) {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    const targetPrime = primes[(i - 1) % primes.length];
    bank.D3.push({
      id: `D3-${String(i).padStart(3, '0')}`,
      stageId: 'D3',
      topic: 'ตัวประกอบ & จำนวนเฉพาะ',
      subtopic: 'การระบุจำนวนเฉพาะและตัวประกอบเฉพาะ',
      difficulty: 2,
      cognitiveLevel: 'APPLICATION',
      mechanicType: 'NUMBER_LOCK',
      skillTags: ['number_sense', 'calculation'],
      misconceptionTags: ['confusing_odd_with_prime'],
      auditStatus: 'VERIFIED',
      questionText: `จำนวนในข้อใดต่อไปนี้เป็น "จำนวนเฉพาะ (Prime Number)"`,
      options: [
        { id: 'opt-1', text: `${targetPrime}`, isCorrect: true },
        { id: 'opt-2', text: `${targetPrime === 91 ? 87 : 91}`, isCorrect: false }, // 91 = 7*13 trap
        { id: 'opt-3', text: `${targetPrime === 51 ? 57 : 51}`, isCorrect: false }, // 51 = 3*17 trap
        { id: 'opt-4', text: `${targetPrime === 87 ? 93 : 87}`, isCorrect: false }, // 87 = 3*29 trap
      ],
      powerUpHint: '💡 ระวังจำนวนลวงยอดฮิต: 51 (3×17), 87 (3×29), 91 (7×13) ไม่ใช่จำนวนเฉพาะ!',
      explanation: `${targetPrime} มีตัวประกอบเพียง 2 ตัวคือ 1 และตัวเองเท่านั้น จึงเป็นจำนวนเฉพาะ`,
      shortcutNote: 'ท่องจำจำนวนเฉพาะ 1-100 มีทั้งหมด 25 จำนวน!',
      targetTimeSec: 30,
      rewardCoins: 35 + i,
      rewardXp: 20,
    });
  }

  // --- D4: Geometry & Angles (30 Questions) ---
  for (let i = 1; i <= 30; i++) {
    const angleA = 35 + (i * 2) % 50;
    const angleB = 180 - angleA;
    bank.D4.push({
      id: `D4-${String(i).padStart(3, '0')}`,
      stageId: 'D4',
      topic: 'เรขาคณิต & เส้นขนาน',
      subtopic: 'มุมภายในบนข้างเดียวกันของเส้นตัดและมุมแย้ง',
      difficulty: 2,
      cognitiveLevel: 'APPLICATION',
      mechanicType: 'DIAGRAM_INSPECTION',
      skillTags: ['geometry_spatial', 'calculation'],
      misconceptionTags: ['angle_sum_confusion'],
      auditStatus: 'VERIFIED',
      questionText: `ถ้าเส้นตรงสองเส้นขนานกัน และมีมุมภายในบนข้างเดียวกันของเส้นตัดมุมหนึ่งกาง ${angleA}° อีกมุมหนึ่งจะกางกี่องศา`,
      options: [
        { id: 'opt-1', text: `${angleB}°`, isCorrect: true },
        { id: 'opt-2', text: `${angleA}°`, isCorrect: false },
        { id: 'opt-3', text: `${90 - angleA > 0 ? 90 - angleA : 45}°`, isCorrect: false },
        { id: 'opt-4', text: `${180 - angleA + 10}°`, isCorrect: false },
      ],
      powerUpHint: '💡 สมบัติเส้นขนาน: มุมภายในบนข้างเดียวกันของเส้นตัดรวมกันได้ 180° เสมอ!',
      explanation: `มุมภายในข้างเดียวกัน = 180° - ${angleA}° = ${angleB}°`,
      shortcutNote: 'มุม C-Angle รวมกันได้ 180° และ Z-Angle มีขนาดเท่ากัน!',
      targetTimeSec: 40,
      rewardCoins: 35 + i,
      rewardXp: 20,
    });
  }

  // --- D5: GCD & LCM (30 Questions) ---
  for (let i = 1; i <= 30; i++) {
    const num1 = 12 + i * 2;
    const num2 = 18 + i * 3;
    // Euclidean GCD
    const getGcd = (a: number, b: number): number => (b === 0 ? a : getGcd(b, a % b));
    const gcd = getGcd(num1, num2);
    const lcm = (num1 * num2) / gcd;

    bank.D5.push({
      id: `D5-${String(i).padStart(3, '0')}`,
      stageId: 'D5',
      topic: 'ห.ร.ม. & ค.ร.น. มหาประลัย',
      subtopic: 'การหา ค.ร.น. และ ห.ร.ม. ของสองจำนวน',
      difficulty: 2,
      cognitiveLevel: 'APPLICATION',
      mechanicType: 'TRAP_HUNT',
      skillTags: ['number_sense', 'calculation', 'trap_detection'],
      misconceptionTags: ['confusing_gcd_with_lcm'],
      auditStatus: 'VERIFIED',
      questionText: `ค.ร.น. ของ ${num1} และ ${num2} มีค่าเท่ากับเท่าใด (เมื่อ ห.ร.ม. เท่ากับ ${gcd})`,
      options: [
        { id: 'opt-1', text: `${lcm}`, isCorrect: true },
        { id: 'opt-2', text: `${lcm * 2}`, isCorrect: false },
        { id: 'opt-3', text: `${gcd}`, isCorrect: false },
        { id: 'opt-4', text: `${lcm + gcd}`, isCorrect: false },
      ],
      powerUpHint: '💡 สมบัติความสัมพันธ์: ผลคูณสองจำนวน = ห.ร.ม. × ค.ร.น. -> ค.ร.น. = (A × B) ÷ ห.ร.ม.',
      explanation: `ค.ร.น. = (${num1} × ${num2}) ÷ ${gcd} = ${lcm}`,
      shortcutNote: 'A × B = ห.ร.ม. × ค.ร.น. เสมอ!',
      targetTimeSec: 40,
      rewardCoins: 40 + i,
      rewardXp: 20,
    });
  }

  // --- D6: Mixed Fractions & Decimals (30 Questions) ---
  for (let i = 1; i <= 30; i++) {
    const timeA = 4 + (i % 5);
    const timeB = 6 + (i % 5);
    const combined = parseFloat(((timeA * timeB) / (timeA + timeB)).toFixed(2));

    bank.D6.push({
      id: `D6-${String(i).padStart(3, '0')}`,
      stageId: 'D6',
      topic: 'เศษส่วน & ทศนิยมระคน',
      subtopic: 'อัตราการทำงานและการแบ่งเศษส่วน',
      difficulty: 3,
      cognitiveLevel: 'APPLICATION',
      mechanicType: 'ICE_BRIDGE',
      skillTags: ['fractions_decimals', 'algebraic_reasoning'],
      misconceptionTags: ['direct_average_of_time_error'],
      auditStatus: 'VERIFIED',
      questionText: `นาย ก ทำงานเสร็จใน ${timeA} วัน นาย ข ทำงานชิ้นเดียวกันเสร็จใน ${timeB} วัน ถ้าทั้งสองคนช่วยกันทำงานนี้จะเสร็จในกี่วัน`,
      options: [
        { id: 'opt-1', text: `${combined} วัน`, isCorrect: true },
        { id: 'opt-2', text: `${((timeA + timeB) / 2).toFixed(1)} วัน`, isCorrect: false },
        { id: 'opt-3', text: `${timeA + timeB} วัน`, isCorrect: false },
        { id: 'opt-4', text: `${Math.max(1, timeB - timeA)} วัน`, isCorrect: false },
      ],
      powerUpHint: '💡 สูตรลัด 2 คนช่วยกันทำงาน: เวลา = (A × B) ÷ (A + B)',
      explanation: `เวลาช่วยกัน = (${timeA} × ${timeB}) ÷ (${timeA} + ${timeB}) = ${timeA * timeB} ÷ ${timeA + timeB} = ${combined} วัน`,
      shortcutNote: 'ห้ามนำวันมาบวกกันแล้วหาร 2 เด็ดขาด! ใช้สูตร ผลคูณ ÷ ผลบวก!',
      targetTimeSec: 45,
      rewardCoins: 40 + i,
      rewardXp: 25,
    });
  }

  return bank;
}

export const ALL_DOJO_QUESTIONS = generateDojoQuestions();
export const DOJO_QUESTIONS = ALL_DOJO_QUESTIONS;

export function getQuestionsByStage(stageId: string): QuestionItem[] {
  return ALL_DOJO_QUESTIONS[stageId] || ALL_DOJO_QUESTIONS.D1;
}

export const getDojoQuestions = getQuestionsByStage;

export function getTotalDojoQuestionCount(): number {
  return Object.values(ALL_DOJO_QUESTIONS).reduce((acc, qArr) => acc + qArr.length, 0);
}
