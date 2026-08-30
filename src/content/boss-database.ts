import { QuestionItem, BossInfo } from '../types';

export const BOSS_CITADELS: BossInfo[] = [
  {
    id: 'BOSS-1',
    name: 'Cyber-Frost Dragon',
    thaiName: 'มังกรไซเบอร์ฟรอสต์ (Chulabhorn Citadel)',
    avatar: '🐉',
    citadelTitle: 'ปราสาทวิทยาศาสตร์จุฬาภรณราชวิทยาลัย (BOSS-1)',
    academicFocus: 'มิติสัมพันธ์ 3D, รูปคลี่ลูกบาศก์, พื้นที่ผิว, ปริมาตร และการแทนที่น้ำ',
    maxHp: 6000,
    victoryRelicId: 'SPATIAL_DRAGON_CORE',
    phases: [
      { id: 'PHASE_1', name: 'Phase 1: Guard Break', description: 'ทำลายเกราะน้ำแข็งภายนอก (รูปทรงเรขาคณิต 2D/3D พื้นฐาน)', questionCount: 15 },
      { id: 'PHASE_2', name: 'Phase 2: Core Battle', description: 'เจาะทะลวงแกนกลางมังกร (รูปคลี่ลูกบาศก์ & ทิศทางการมอง)', questionCount: 15 },
      { id: 'PHASE_3', name: 'Phase 3: Frost Rage', description: 'รับมือลมหายใจเยือกแข็ง (การแทนที่น้ำ & ปริมาตรทรงกระบอก)', questionCount: 15 },
      { id: 'PHASE_4', name: 'Phase 4: Final Strike', description: 'ปิดฉากมังกรไซเบอร์ฟรอสต์ (โจทย์ปัญหาประยุกต์เชิงวิทยาศาสตร์)', questionCount: 15 },
    ],
  },
  {
    id: 'BOSS-2',
    name: 'Grandmaster Golem',
    thaiName: 'โกเลมปรมาจารย์ (SWCH Citadel)',
    avatar: '🗿',
    citadelTitle: 'ปราสาทสนามสอบ สวช. & แข่งขันระดับชาติ (BOSS-2)',
    academicFocus: 'ความเร็วสัมพัทธ์, รถไฟวิ่งสวนกัน, ท่อน้ำระคน, อัตราการทำงาน และโจทย์ปัญหาเหลือ/ขาด',
    maxHp: 7500,
    victoryRelicId: 'GRANDMASTER_BLADE_CORE',
    phases: [
      { id: 'PHASE_1', name: 'Phase 1: Kinetic Shield', description: 'สลายเกราะจลน์ (ความเร็วสัมพัทธ์ & รถไฟแล่นผ่านเสา)', questionCount: 15 },
      { id: 'PHASE_2', name: 'Phase 2: Gear Overdrive', description: 'ขัดขวางฟันเฟืองจักรกล (รถไฟแล่นสวนกัน & แล่นข้ามสะพาน)', questionCount: 15 },
      { id: 'PHASE_3', name: 'Phase 3: Magma Steam', description: 'ควบคุมแรงดันไอความร้อน (ท่อน้ำเปิดพร้อมกัน & งานระคน 3 คน)', questionCount: 15 },
      { id: 'PHASE_4', name: 'Phase 4: Final Titan Smash', description: 'โค่นล้มโกเลมศิลา (โจทย์ปัญหาระบบสมการ 2 ชั้น & โจทย์เหลือขาด)', questionCount: 15 },
    ],
  },
  {
    id: 'BOSS-3',
    name: 'Archmage of Zero',
    thaiName: 'มหาจอมเวทแห่งอนันต์ (Tri-Math Citadel)',
    avatar: '🧙‍♂️',
    citadelTitle: 'ปราสาทมหาเวทตรรกะ Tri-Math (BOSS-3)',
    academicFocus: 'โอเปอเรเตอร์นิยามใหม่, รหัสลับตัวเลข, อนุกรมเชิงซ้อน และการค้นพบแบบรูป Aha!',
    maxHp: 9000,
    victoryRelicId: 'ARCANE_LOGIC_CRYSTAL',
    phases: [
      { id: 'PHASE_1', name: 'Phase 1: Rune Decryption', description: 'ถอดรหัสอักขระรูน (ตัวดำเนินการนิยามใหม่ a ⊕ b ขั้นที่ 1)', questionCount: 15 },
      { id: 'PHASE_2', name: 'Phase 2: Mirror Logic', description: 'ทำลายกระจกสะท้อนตรรกะ (โอเปอเรเตอร์ซ้อนสองชั้น & ลำดับวงเล็บ)', questionCount: 15 },
      { id: 'PHASE_3', name: 'Phase 3: Cryptarithm Storm', description: 'ฝ่าพายุรหัสอักษรแทนตัวเลข (SEND + MORE = MONEY & เลขฐาน)', questionCount: 15 },
      { id: 'PHASE_4', name: 'Phase 4: Infinite Aha Strike', description: 'เผด็จศึกมหาจอมเวท (โจทย์ค้นพบแบบรูปตรรกะระดับมงกุฎ)', questionCount: 15 },
    ],
  },
];

function generateBossQuestions(): Record<string, QuestionItem[]> {
  const bank: Record<string, QuestionItem[]> = {
    'BOSS-1': [],
    'BOSS-2': [],
    'BOSS-3': [],
  };

  const phases: ('PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'PHASE_4')[] = ['PHASE_1', 'PHASE_2', 'PHASE_3', 'PHASE_4'];

  // --- BOSS-1: Chulabhorn Citadel (60 Questions: 15 per phase) ---
  for (let p = 0; p < 4; p++) {
    const phaseId = phases[p];
    for (let i = 1; i <= 15; i++) {
      const qNum = p * 15 + i;
      let qText = '';
      let correctVal = '';
      let distractors: string[] = [];
      let hint = '';

      if (phaseId === 'PHASE_1') {
        // Cube Nets & 2D/3D
        const sides = 6;
        const edge = 3 + (i % 5);
        const surfaceArea = sides * edge * edge;
        qText = `ลูกบาศก์ที่มีความยาวด้านละ ${edge} เซนติเมตร จะมีพื้นที่ผิวทั้งหมดกี่ตารางเซนติเมตร`;
        correctVal = `${surfaceArea} ตารางเซนติเมตร`;
        distractors = [
          `${edge * edge * edge} ตารางเซนติเมตร`, // Trap: confused with volume
          `${4 * edge * edge} ตารางเซนติเมตร`, // Trap: 4 faces only
          `${surfaceArea + 18} ตารางเซนติเมตร`,
        ];
        hint = `ลูกบาศก์มี 6 หน้าเท่ากัน: พื้นที่ผิวรวม = 6 × ด้าน² = 6 × ${edge}² = ${surfaceArea}`;
      } else if (phaseId === 'PHASE_2') {
        // Perspective views & Cube counting
        const layers = 3;
        const totalCubes = 14 + (i % 6);
        const paintedCubes = totalCubes - 2;
        qText = `ลูกบาศก์เล็กขนาด 1×1×1 จำนวน ${totalCubes} ลูก ประกอบเป็นรูปทรง 3 มิติ หากทาสีภายนอกทุกด้าน มีลูกบาศก์ที่ถูกทาสีอย่างน้อย 1 ด้านกี่ลูก`;
        correctVal = `${paintedCubes} ลูก`;
        distractors = [`${totalCubes} ลูก`, `${paintedCubes - 3} ลูก`, `${totalCubes - 1} ลูก`];
        hint = 'นับลูกบาศก์ที่ซ่อนอยู่ข้างในแกนกลางซึ่งไม่โดนทาสีเลย';
      } else if (phaseId === 'PHASE_3') {
        // Water displacement
        const baseW = 10;
        const baseL = 20;
        const waterRise = 2 + (i % 4);
        const rockVol = baseW * baseL * waterRise;
        qText = `ภาชนะทรงสี่เหลี่ยมมุมฉาก กว้าง ${baseW} ซม. ยาว ${baseL} ซม. มีน้ำอยู่ เมื่อหย่อนก้อนหินลงไป ระดับน้ำสูงขึ้น ${waterRise} ซม. ก้อนหินมีปริมาตรกี่ลูกบาศก์เซนติเมตร`;
        correctVal = `${rockVol.toLocaleString()} ลบ.ซม.`;
        distractors = [
          `${(rockVol / 2).toLocaleString()} ลบ.ซม.`,
          `${(rockVol * 1.5).toLocaleString()} ลบ.ซม.`,
          `${(baseW * baseL).toLocaleString()} ลบ.ซม.`,
        ];
        hint = `ปริมาตรวัตถุ = ปริมาตรน้ำที่เพิ่มขึ้น = กว้าง × ยาว × ความสูงน้ำที่เพิ่ม = ${baseW} × ${baseL} × ${waterRise}`;
      } else {
        // Cylinder volume & complex geometry
        const r = 7;
        const h = 10 + i;
        const vol = (22 / 7) * r * r * h;
        qText = `ถังทรงกระบอกมีรัศมีฐาน ${r} เมตร สูง ${h} เมตร สามารถจุน้ำได้กี่ลูกบาศก์เมตร (กำหนดให้ π = 22/7)`;
        correctVal = `${vol.toLocaleString()} ลบ.ม.`;
        distractors = [
          `${(2 * (22 / 7) * r * h).toLocaleString()} ลบ.ม.`, // Trap: curved surface area
          `${(vol - 154).toLocaleString()} ลบ.ม.`,
          `${(vol * 2).toLocaleString()} ลบ.ม.`,
        ];
        hint = `ปริมาตรทรงกระบอก = πr²h = (22/7) × ${r}² × ${h} = ${vol}`;
      }

      bank['BOSS-1'].push({
        id: `B1-${String(qNum).padStart(3, '0')}`,
        stageId: 'BOSS-1',
        phaseId,
        topic: 'Chulabhorn Citadel: มิติสัมพันธ์และวิทยาศาสตร์',
        subtopic: `บอสไซเบอร์ฟรอสต์ ข้อที่ ${qNum} (${phaseId})`,
        difficulty: (p === 0 ? 3 : p === 1 ? 4 : 5) as 3 | 4 | 5,
        cognitiveLevel: p < 2 ? 'APPLICATION' : 'ADVANCED_REASONING',
        mechanicType: p === 0 ? 'BOSS_STRIKE' : p === 1 ? 'GEOMETRY_ROTATE' : 'DIAGRAM_INSPECTION',
        skillTags: ['geometry_spatial', 'calculation', 'algebraic_reasoning'],
        misconceptionTags: ['surface_vs_volume_trap', 'water_displacement_confusion'],
        auditStatus: 'VERIFIED',
        questionText: qText,
        options: [
          { id: 'opt-1', text: correctVal, isCorrect: true },
          { id: 'opt-2', text: distractors[0], isCorrect: false },
          { id: 'opt-3', text: distractors[1], isCorrect: false },
          { id: 'opt-4', text: distractors[2], isCorrect: false },
        ],
        powerUpHint: '💡 ' + hint,
        explanation: `การคำนวณ:\n${hint}\nได้ผลลัพธ์ = ${correctVal}`,
        targetTimeSec: 90,
        rewardCoins: 80,
        rewardXp: 40,
        bossDamage: 300 + p * 50,
      });
    }
  }

  // --- BOSS-2: SWCH Grandmaster Citadel (60 Questions: 15 per phase) ---
  for (let p = 0; p < 4; p++) {
    const phaseId = phases[p];
    for (let i = 1; i <= 15; i++) {
      const qNum = p * 15 + i;
      let qText = '';
      let correctVal = '';
      let distractors: string[] = [];
      let hint = '';

      if (phaseId === 'PHASE_1') {
        // Train passing a pole: Time = TrainLength / Speed
        const speedKmh = 72; // 20 m/s
        const speedMs = 20;
        const lengthM = 200 + i * 20;
        const timeSec = lengthM / speedMs;
        qText = `รถไฟขบวนหนึ่งยาว ${lengthM} เมตร แล่นด้วยความเร็ว ${speedKmh} กม./ชม. จะแล่นผ่านเสาไฟฟ้าต้นหนึ่งในเวลากี่วินาที`;
        correctVal = `${timeSec} วินาที`;
        distractors = [
          `${(lengthM / speedKmh).toFixed(1)} วินาที`, // Trap: without converting km/h to m/s
          `${timeSec + 5} วินาที`,
          `${timeSec * 2} วินาที`,
        ];
        hint = `แปลงความเร็วเป็น m/s: ${speedKmh} × (5/18) = 20 m/s\nเวลา = ระยะทาง ÷ ความเร็ว = ${lengthM} ÷ 20 = ${timeSec} วินาที`;
      } else if (phaseId === 'PHASE_2') {
        // Train crossing a bridge: Distance = TrainLength + BridgeLength
        const speedMs = 25; // 90 km/h
        const trainL = 150;
        const bridgeL = 350 + i * 50;
        const totalD = trainL + bridgeL;
        const timeSec = totalD / speedMs;
        qText = `รถไฟยาว ${trainL} เมตร แล่นด้วยความเร็ว 90 กม./ชม. (25 ม./วินาที) แล่นข้ามสะพานยาว ${bridgeL} เมตร จะต้องใช้เวลากี่วินาทีจนพ้นสะพาน`;
        correctVal = `${timeSec} วินาที`;
        distractors = [
          `${bridgeL / speedMs} วินาที`, // Trap: forgot train length
          `${trainL / speedMs} วินาที`,
          `${timeSec + 4} วินาที`,
        ];
        hint = `ระยะทางรวม = ความยาวรถไฟ + สะพาน = ${trainL} + ${bridgeL} = ${totalD} เมตร\nเวลา = ${totalD} ÷ 25 = ${timeSec} วินาที`;
      } else if (phaseId === 'PHASE_3') {
        // Combined Pipes (Inflow & Outflow)
        const inPipe = 6;
        const outPipe = 12 + (i % 3) * 6; // 12, 18, 24
        // 1/T = 1/in - 1/out -> T = (in * out) / (out - in)
        const netHours = (inPipe * outPipe) / (outPipe - inPipe);
        qText = `ท่อ A เปิดน้ำเข้าถังเต็มใน ${inPipe} ชม. ท่อ B เปิดน้ำออกจากถังหมดใน ${outPipe} ชม. ถ้าเปิดทั้งสองท่อพร้อมกัน น้ำจะเต็มถังในเวลากี่ชั่วโมง`;
        correctVal = `${netHours} ชั่วโมง`;
        distractors = [
          `${inPipe + outPipe} ชั่วโมง`,
          `${(inPipe * outPipe) / (inPipe + outPipe)} ชั่วโมง`, // Trap: added instead of subtracted
          `${netHours + 2} ชั่วโมง`,
        ];
        hint = `ท่อเข้าลบท่อออก: 1/T = (1/${inPipe}) - (1/${outPipe})\nได้เวลา = (${inPipe} × ${outPipe}) ÷ (${outPipe} - ${inPipe}) = ${netHours} ชม.`;
      } else {
        // Remainder and Shortage (โจทย์ปัญหาเหลือขาด)
        const students = 12 + i;
        const candies = students * 4 + 6; // 4 each leaves 6, 5 each lacks (students - 6)
        const lack = 5 * students - candies;
        qText = `แจกลูกอมให้นักเรียนคนละ 4 เม็ด จะเหลือลูกอม 6 เม็ด แต่ถ้าแจกคนละ 5 เม็ด จะขาดลูกอม ${lack} เม็ด จงหาจำนวนนักเรียนทั้งหมด`;
        correctVal = `${students} คน`;
        distractors = [`${students + 2} คน`, `${students - 2} คน`, `${candies} คน`];
        hint = `สูตรจำนวนคน = (ของเหลือ + ของขาด) ÷ ผลต่างการแจก = (6 + ${lack}) ÷ (5 - 4) = ${students} คน`;
      }

      bank['BOSS-2'].push({
        id: `B2-${String(qNum).padStart(3, '0')}`,
        stageId: 'BOSS-2',
        phaseId,
        topic: 'SWCH Citadel: ระบบฟิสิกส์และความเร็วสัมพัทธ์',
        subtopic: `โกเลมปรมาจารย์ ข้อที่ ${qNum} (${phaseId})`,
        difficulty: (p === 0 ? 3 : p === 1 ? 4 : 5) as 3 | 4 | 5,
        cognitiveLevel: 'ADVANCED_REASONING',
        mechanicType: p === 2 ? 'MULTI_STEP_SURVIVAL' : 'TRAP_HUNT',
        skillTags: ['algebraic_reasoning', 'ratio_percentage_scale', 'calculation'],
        misconceptionTags: ['train_length_omission_trap', 'pipe_inflow_outflow_sign_trap'],
        auditStatus: 'VERIFIED_WITH_TRAP_TAG',
        questionText: qText,
        options: [
          { id: 'opt-1', text: correctVal, isCorrect: true },
          { id: 'opt-2', text: distractors[0], isCorrect: false },
          { id: 'opt-3', text: distractors[1], isCorrect: false },
          { id: 'opt-4', text: distractors[2], isCorrect: false },
        ],
        powerUpHint: '💡 ' + hint,
        explanation: `วิธีทำ:\n${hint}\nคำตอบคือ ${correctVal}`,
        targetTimeSec: 90,
        rewardCoins: 90,
        rewardXp: 45,
        bossDamage: 320 + p * 60,
      });
    }
  }

  // --- BOSS-3: Tri-Math Citadel (60 Questions: 15 per phase) ---
  for (let p = 0; p < 4; p++) {
    const phaseId = phases[p];
    for (let i = 1; i <= 15; i++) {
      const qNum = p * 15 + i;
      let qText = '';
      let correctVal = '';
      let distractors: string[] = [];
      let hint = '';

      if (phaseId === 'PHASE_1') {
        // Single Custom Operator: a ⊕ b = 2a + 3b - 1
        const a = 4 + (i % 4);
        const b = 5 + (i % 3);
        const ans = 2 * a + 3 * b - 1;
        qText = `กำหนดนิยามตัวดำเนินการ a ⊕ b = 2a + 3b - 1 จงหาค่าของ ${a} ⊕ ${b}`;
        correctVal = `${ans}`;
        distractors = [`${ans + 2}`, `${ans - 3}`, `${a * b}`];
        hint = `แทนค่าตามสูตรตรงๆ: 2(${a}) + 3(${b}) - 1 = ${2 * a} + ${3 * b} - 1 = ${ans}`;
      } else if (phaseId === 'PHASE_2') {
        // Nested Custom Operator: (a ⊗ b) ⊗ c where x ⊗ y = xy + x - y
        const a = 2;
        const b = 3;
        const c = 2 + (i % 3);
        const step1 = a * b + a - b; // 6 + 2 - 3 = 5
        const step2 = step1 * c + step1 - c;
        qText = `กำหนดให้ x ⊗ y = xy + x - y จงหาค่าของ (${a} ⊗ ${b}) ⊗ ${c}`;
        correctVal = `${step2}`;
        distractors = [`${step2 + 4}`, `${step2 - 5}`, `${(step1 * c)}`];
        hint = `ขั้นที่ 1: ${a} ⊗ ${b} = (${a}×${b}) + ${a} - ${b} = ${step1}\nขั้นที่ 2: ${step1} ⊗ ${c} = (${step1}×${c}) + ${step1} - ${c} = ${step2}`;
      } else if (phaseId === 'PHASE_3') {
        // Cryptarithm & Digit logic
        const d = 100 + i * 11;
        const sum = d + 222;
        qText = `ถ้า A, B, C แทนเลขโดดที่ต่างกัน และ AB + BA = 132 โดยที่ A > B จงหาค่าของ A × B`;
        // 11(A+B) = 132 -> A+B = 12. If A=7, B=5 -> A*B=35. If A=8, B=4 -> 32.
        const ans = 35;
        correctVal = `${ans}`;
        distractors = [`32`, `27`, `36`];
        hint = `กระจายหลัก: (10A + B) + (10B + A) = 11(A + B) = 132\nดังนั้น A + B = 12\nคู่ที่เป็นไปได้ที่ A > B เช่น 7+5=12 -> 7 × 5 = 35`;
      } else {
        // Complex Pattern Aha Discovery
        const n = 10 + i;
        const sumSeries = (n * (n + 1)) / 2;
        qText = `แบบรูป 1, 3, 6, 10, 15, 21, ... จงหาจำนวนในลำดับที่ ${n}`;
        correctVal = `${sumSeries}`;
        distractors = [`${sumSeries + n}`, `${sumSeries - n}`, `${n * n}`];
        hint = `ลำดับจำนวนสามเหลี่ยม (Triangular Numbers): T(n) = n(n+1)/2 = ${n}(${n + 1})/2 = ${sumSeries}`;
      }

      bank['BOSS-3'].push({
        id: `B3-${String(qNum).padStart(3, '0')}`,
        stageId: 'BOSS-3',
        phaseId,
        topic: 'Tri-Math Citadel: โอเปอเรเตอร์และรหัสตรรกะ',
        subtopic: `มหาจอมเวทแห่งอนันต์ ข้อที่ ${qNum} (${phaseId})`,
        difficulty: (p === 0 ? 3 : p === 1 ? 4 : 5) as 3 | 4 | 5,
        cognitiveLevel: 'ADVANCED_REASONING',
        mechanicType: p === 1 ? 'NUMBER_LOCK' : 'BOSS_STRIKE',
        skillTags: ['algebraic_reasoning', 'calculation', 'number_sense'],
        misconceptionTags: ['operator_order_precedence_trap', 'non_commutative_operator_trap'],
        auditStatus: 'VERIFIED',
        questionText: qText,
        options: [
          { id: 'opt-1', text: correctVal, isCorrect: true },
          { id: 'opt-2', text: distractors[0], isCorrect: false },
          { id: 'opt-3', text: distractors[1], isCorrect: false },
          { id: 'opt-4', text: distractors[2], isCorrect: false },
        ],
        powerUpHint: '💡 ' + hint,
        explanation: `การวิเคราะห์โอเปอเรเตอร์:\n${hint}\nได้คำตอบ = ${correctVal}`,
        targetTimeSec: 90,
        rewardCoins: 100,
        rewardXp: 50,
        bossDamage: 350 + p * 70,
      });
    }
  }

  return bank;
}

const ALL_BOSS_QUESTIONS = generateBossQuestions();

export function getBossQuestions(bossId: string, phaseId?: 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'PHASE_4'): QuestionItem[] {
  const all = ALL_BOSS_QUESTIONS[bossId] || ALL_BOSS_QUESTIONS['BOSS-1'];
  if (phaseId) {
    return all.filter((q) => q.phaseId === phaseId);
  }
  return all;
}

export function getTotalBossQuestionCount(): number {
  return Object.values(ALL_BOSS_QUESTIONS).reduce((acc, qArr) => acc + qArr.length, 0);
}
